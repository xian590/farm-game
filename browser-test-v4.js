const http = require('http');
const net = require('net');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const REPORT_PATH = process.argv[2] || 'C:\\Users\\Administrator\\Documents\\kimi\\workspace\\browser-test-report.json';
const SCREENSHOT_PATH = path.join(path.dirname(REPORT_PATH), 'screenshot-test.png');

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0,8)}] ${msg}`);
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getPageId() {
  const data = await httpGet('http://127.0.0.1:9222/json/list');
  const pages = JSON.parse(data);
  for (const p of pages) {
    if (p.type === 'page' && p.url.includes('56762')) return p.id;
  }
  for (const p of pages) {
    if (p.type === 'page') return p.id;
  }
  return null;
}

function connectCDP(pageId) {
  return new Promise((resolve, reject) => {
    const wsUrl = `ws://127.0.0.1:9222/devtools/page/${pageId}`;
    const parsed = new URL(wsUrl);
    const socket = net.connect({ host: parsed.hostname, port: parsed.port });

    let handshaking = true;
    let buffer = Buffer.alloc(0);
    const callbacks = {};
    let nextId = 1;
    let closed = false;

    socket.on('connect', () => {
      log('TCP connected');
      const key = crypto.randomBytes(16).toString('base64');
      const req = [
        `GET ${parsed.pathname}${parsed.search} HTTP/1.1`,
        `Host: ${parsed.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '', ''
      ].join('\r\n');
      socket.write(req);
    });

    // CLIENT frames MUST be masked per RFC 6455
    function sendMaskedFrame(opcode, payload) {
      if (closed) return;
      const mask = crypto.randomBytes(4);
      let frame;
      if (payload.length < 126) {
        frame = Buffer.allocUnsafe(2 + 4 + payload.length);
        frame[0] = 0x80 | opcode;
        frame[1] = 0x80 | payload.length;
        mask.copy(frame, 2);
        for (let i = 0; i < payload.length; i++) {
          frame[6 + i] = payload[i] ^ mask[i % 4];
        }
      } else if (payload.length < 65536) {
        frame = Buffer.allocUnsafe(4 + 4 + payload.length);
        frame[0] = 0x80 | opcode;
        frame[1] = 0x80 | 126;
        frame.writeUInt16BE(payload.length, 2);
        mask.copy(frame, 4);
        for (let i = 0; i < payload.length; i++) {
          frame[8 + i] = payload[i] ^ mask[i % 4];
        }
      } else {
        frame = Buffer.allocUnsafe(10 + 4 + payload.length);
        frame[0] = 0x80 | opcode;
        frame[1] = 0x80 | 127;
        frame.writeBigUInt64BE(BigInt(payload.length), 2);
        mask.copy(frame, 10);
        for (let i = 0; i < payload.length; i++) {
          frame[14 + i] = payload[i] ^ mask[i % 4];
        }
      }
      socket.write(frame);
    }

    function send(method, params) {
      const id = nextId++;
      const msg = JSON.stringify({ id, method, params });
      const buf = Buffer.from(msg, 'utf-8');
      return new Promise((res) => {
        callbacks[id] = res;
        sendMaskedFrame(0x1, buf);
      });
    }

    function processBuffer() {
      while (buffer.length >= 2) {
        const opcode = buffer[0] & 0x0f;
        const masked = (buffer[1] & 0x80) !== 0;
        let payloadLen = buffer[1] & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (buffer.length < 4) return;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (buffer.length < 10) return;
          payloadLen = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        const maskLen = masked ? 4 : 0;
        if (buffer.length < offset + maskLen + payloadLen) return;

        const mask = masked ? buffer.slice(offset, offset + 4) : null;
        offset += maskLen;
        let payload = buffer.slice(offset, offset + payloadLen);
        if (mask) {
          for (let i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
          }
        }
        buffer = buffer.slice(offset + payloadLen);

        if (opcode === 0x1) {
          const text = payload.toString('utf-8');
          try {
            const obj = JSON.parse(text);
            if (obj.id && callbacks[obj.id]) {
              callbacks[obj.id](obj);
              delete callbacks[obj.id];
            }
          } catch (e) {}
        } else if (opcode === 0x8) {
          log('Received close frame');
          closed = true;
          socket.end();
        } else if (opcode === 0x9) {
          // ping -> send pong (unmasked for server->client, but this is client so we mask)
          sendMaskedFrame(0xa, Buffer.alloc(0));
        }
      }
    }

    socket.on('data', (chunk) => {
      if (handshaking) {
        const str = chunk.toString();
        const headerEnd = str.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          handshaking = false;
          log('WebSocket handshake complete');
          const remaining = chunk.slice(headerEnd + 4);
          if (remaining.length > 0) {
            buffer = Buffer.concat([buffer, remaining]);
            processBuffer();
          }
          resolve({ send, close: () => { closed = true; socket.end(); } });
        }
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      processBuffer();
    });

    socket.on('error', (err) => {
      log(`Socket error: ${err.message}`);
      reject(err);
    });

    socket.on('close', () => {
      log('Socket closed');
      closed = true;
    });
  });
}

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: [],
    errors: []
  };

  let cdp;
  try {
    log('Getting page ID...');
    const pageId = await getPageId();
    if (!pageId) throw new Error('No page found');
    log(`Page ID: ${pageId}`);

    log('Connecting to CDP...');
    cdp = await connectCDP(pageId);
    log('Connected!');

    log('Enabling Runtime...');
    await cdp.send('Runtime.enable', {});
    log('Enabling Page...');
    await cdp.send('Page.enable', {});

    log('Navigating...');
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:57509/index.html' });
    await new Promise(r => setTimeout(r, 10000));
    log('Navigation complete');

    async function evalJS(expression) {
      const res = await cdp.send('Runtime.evaluate', {
        expression,
        returnByValue: true
      });
      return res.result?.result?.value ?? res.result?.result;
    }

    // TEST 1
    try {
      const title = await evalJS('document.title');
      results.tests.push({ name: 'Page loaded', pass: !!title, detail: title });
      log(`TEST 1 - Page title: ${title}`);
    } catch (e) {
      results.tests.push({ name: 'Page loaded', pass: false, detail: e.message });
      results.errors.push(`Test 1: ${e.message}`);
    }

    // TEST 2
    try {
      const presets = await evalJS(`(typeof window.TITLE_PRESETS !== 'undefined') ? Object.keys(window.TITLE_PRESETS) : null`);
      results.tests.push({ name: 'TITLE_PRESETS has 5 identities', pass: Array.isArray(presets) && presets.length === 5, detail: presets });
      log(`TEST 2 - TITLE_PRESETS: ${JSON.stringify(presets)}`);
    } catch (e) {
      results.tests.push({ name: 'TITLE_PRESETS has 5 identities', pass: false, detail: e.message });
      results.errors.push(`Test 2: ${e.message}`);
    }

    // TEST 3
    try {
      const label = await evalJS(`(typeof window.getTitle === 'function') ? window.getTitle('label') : null`);
      results.tests.push({ name: 'getTitle() works', pass: typeof label === 'string', detail: label });
      log(`TEST 3 - Default label: ${label}`);
    } catch (e) {
      results.tests.push({ name: 'getTitle() works', pass: false, detail: e.message });
      results.errors.push(`Test 3: ${e.message}`);
    }

    // TEST 4: Identity switching
    try {
      const expected = {
        princess: { label: '花公主', pronoun: '她', levelSuffix: '行者' },
        prince: { label: '花之子', pronoun: '他', levelSuffix: '行者' },
        mystic: { label: '花灵', pronoun: 'TA', levelSuffix: '灵' },
        sovereign: { label: '君主', pronoun: '您', levelSuffix: '主' },
        explorer: { label: '探索者', pronoun: '你', levelSuffix: '者' },
      };
      const identityTests = [];
      for (const [id, exp] of Object.entries(expected)) {
        await evalJS(`if(typeof window.state!=='undefined'){window.state.titlePreference='${id}';if(typeof saveState==='function')saveState();}`);
        const label = await evalJS(`(typeof window.getTitle==='function')?window.getTitle('label'):null`);
        const pronoun = await evalJS(`(typeof window.getTitle==='function')?window.getTitle('pronoun'):null`);
        const suffix = await evalJS(`(typeof window.getTitle==='function')?window.getTitle('levelSuffix'):null`);
        const pass = label === exp.label && pronoun === exp.pronoun && suffix === exp.levelSuffix;
        identityTests.push({ id, label, pronoun, suffix, expected: exp, pass });
        log(`  ${pass?'✓':'✗'} ${id}: ${label}/${pronoun}/${suffix}`);
      }
      results.tests.push({ name: 'All 5 identities correct', pass: identityTests.every(t=>t.pass), detail: identityTests });
      log(`TEST 4 - Identity switching: ${identityTests.filter(t=>t.pass).length}/5 passed`);
    } catch (e) {
      results.tests.push({ name: 'All 5 identities correct', pass: false, detail: e.message });
      results.errors.push(`Test 4: ${e.message}`);
    }

    // TEST 5: Voice options
    try {
      const keys = await evalJS(`(typeof window.VOICE_OPTIONS !== 'undefined') ? Object.keys(window.VOICE_OPTIONS) : null`);
      results.tests.push({ name: 'VOICE_OPTIONS has neutral', pass: Array.isArray(keys) && keys.includes('neutral'), detail: keys });
      log(`TEST 5 - Voice keys: ${JSON.stringify(keys)}`);
    } catch (e) {
      results.tests.push({ name: 'VOICE_OPTIONS has neutral', pass: false, detail: e.message });
      results.errors.push(`Test 5: ${e.message}`);
    }

    // TEST 6: Default voiceType
    try {
      const dv = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined') ? window.DEFAULT_STATE.voiceType : null`);
      results.tests.push({ name: 'Default voiceType is neutral', pass: dv === 'neutral', detail: dv });
      log(`TEST 6 - Default voiceType: ${dv}`);
    } catch (e) {
      results.tests.push({ name: 'Default voiceType is neutral', pass: false, detail: e.message });
      results.errors.push(`Test 6: ${e.message}`);
    }

    // TEST 7: Micro action funcs
    try {
      const funcs = ['generateMicroActions','renderMicroActions','addMicroActionToGarden','showMicroActionsForWish'];
      const res = {};
      for (const f of funcs) {
        res[f] = await evalJS(`typeof window['${f}'] === 'function'`);
      }
      results.tests.push({ name: 'Micro action functions exist', pass: Object.values(res).every(v=>v), detail: res });
      log(`TEST 7 - Micro funcs: ${JSON.stringify(res)}`);
    } catch (e) {
      results.tests.push({ name: 'Micro action functions exist', pass: false, detail: e.message });
      results.errors.push(`Test 7: ${e.message}`);
    }

    // TEST 8: microActions array
    try {
      const has = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && Array.isArray(window.DEFAULT_STATE.microActions))`);
      results.tests.push({ name: 'DEFAULT_STATE.microActions array', pass: has === true, detail: has });
      log(`TEST 8 - microActions: ${has}`);
    } catch (e) {
      results.tests.push({ name: 'DEFAULT_STATE.microActions array', pass: false, detail: e.message });
      results.errors.push(`Test 8: ${e.message}`);
    }

    // TEST 9: EN translations
    try {
      const enStr = await evalJS(`(typeof window.TRANSLATIONS !== 'undefined' && window.TRANSLATIONS.en) ? JSON.stringify(window.TRANSLATIONS.en) : null`);
      const hasP = enStr ? /"[Pp]rincess"/.test(enStr) : null;
      results.tests.push({ name: 'EN has no Princess hardcode', pass: hasP === false, detail: { hasPrincess: hasP } });
      log(`TEST 9 - EN has Princess: ${hasP}`);
    } catch (e) {
      results.tests.push({ name: 'EN has no Princess hardcode', pass: false, detail: e.message });
      results.errors.push(`Test 9: ${e.message}`);
    }

    // TEST 10: broadcastStorageUpdate
    try {
      const has = await evalJS(`typeof window.broadcastStorageUpdate === 'function'`);
      results.tests.push({ name: 'broadcastStorageUpdate exists', pass: has === true, detail: has });
      log(`TEST 10 - broadcastStorageUpdate: ${has}`);
    } catch (e) {
      results.tests.push({ name: 'broadcastStorageUpdate exists', pass: false, detail: e.message });
      results.errors.push(`Test 10: ${e.message}`);
    }

    // TEST 11: wishDrafts
    try {
      const has = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && typeof window.DEFAULT_STATE.wishDrafts === 'object')`);
      results.tests.push({ name: 'DEFAULT_STATE.wishDrafts exists', pass: has === true, detail: has });
      log(`TEST 11 - wishDrafts: ${has}`);
    } catch (e) {
      results.tests.push({ name: 'DEFAULT_STATE.wishDrafts exists', pass: false, detail: e.message });
      results.errors.push(`Test 11: ${e.message}`);
    }

    // TEST 12: satsRecords
    try {
      const has = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && Array.isArray(window.DEFAULT_STATE.satsRecords))`);
      results.tests.push({ name: 'DEFAULT_STATE.satsRecords array', pass: has === true, detail: has });
      log(`TEST 12 - satsRecords: ${has}`);
    } catch (e) {
      results.tests.push({ name: 'DEFAULT_STATE.satsRecords array', pass: false, detail: e.message });
      results.errors.push(`Test 12: ${e.message}`);
    }

    // Screenshot
    try {
      log('Taking screenshot...');
      const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
      if (ss.result?.data) {
        fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(ss.result.data, 'base64'));
        results.screenshots.push(SCREENSHOT_PATH);
        log('Screenshot saved');
      }
    } catch (e) {
      results.errors.push(`Screenshot: ${e.message}`);
    }

  } catch (e) {
    log(`Fatal error: ${e.message}`);
    results.errors.push(`Fatal: ${e.message}`);
  }

  if (cdp) {
    try { cdp.close(); } catch {}
  }

  // Save report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));

  const passed = results.tests.filter(t => t.pass).length;
  const total = results.tests.length;
  log(`========================================`);
  log(`RESULTS: ${passed}/${total} tests passed`);
  log(`========================================`);
  results.tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
  });
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(e => console.log(`  ! ${e}`));
  }
}

runTests().catch(err => {
  console.error('Unhandled:', err);
  process.exit(1);
});

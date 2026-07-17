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
    if (p.type === 'page' && p.url.includes('57979')) return p.id;
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
    const errors = [];

    socket.on('connect', () => {
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
            if (obj.method === 'Runtime.exceptionThrown') {
              const ex = obj.params?.exceptionDetails;
              errors.push({
                text: ex?.exception?.description || ex?.text || JSON.stringify(obj),
                url: ex?.url,
                line: ex?.lineNumber,
                col: ex?.columnNumber
              });
            }
            if (obj.id && callbacks[obj.id]) {
              callbacks[obj.id](obj);
              delete callbacks[obj.id];
            }
          } catch (e) {}
        } else if (opcode === 0x8) {
          closed = true;
          socket.end();
        } else if (opcode === 0x9) {
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
          const remaining = chunk.slice(headerEnd + 4);
          if (remaining.length > 0) {
            buffer = Buffer.concat([buffer, remaining]);
            processBuffer();
          }
          resolve({ send, close: () => { closed = true; socket.end(); }, errors });
        }
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      processBuffer();
    });

    socket.on('error', reject);
    socket.on('close', () => { closed = true; });
  });
}

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: [],
    errors: [],
    diagnostics: {}
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
    
    log('Clearing cache...');
    try {
      await cdp.send('Network.clearBrowserCache', {});
      await cdp.send('Network.clearBrowserCookies', {});
      log('Cache cleared');
    } catch(e) {
      log('Cache clear skipped: ' + e.message);
    }

    log('Navigating...');
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:57979/index.html' });
    await cdp.send('Runtime.enable', {});
    log('Enabling Page...');
    await cdp.send('Page.enable', {});

    log('Navigating...');
    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:57979/index.html' });
    await new Promise(r => setTimeout(r, 15000));
    log('Wait complete');

    async function evalJS(expression) {
      const res = await cdp.send('Runtime.evaluate', {
        expression,
        returnByValue: true
      });
      return res.result?.result?.value ?? res.result?.result;
    }

    // DIAGNOSTIC
    log('Running diagnostics...');
    const windowKeys = await evalJS(`Object.keys(window).filter(k => /TITLE|getTitle|VOICE|DEFAULT_STATE|broadcastStorageUpdate|state/.test(k)).sort()`);
    results.diagnostics.windowKeys = windowKeys;
    log(`Window keys: ${JSON.stringify(windowKeys)}`);

    const docReady = await evalJS('document.readyState');
    results.diagnostics.readyState = docReady;
    log(`document.readyState: ${docReady}`);

    results.diagnostics.jsErrors = cdp.errors;
    if (cdp.errors.length > 0) {
      log(`JS errors found: ${cdp.errors.length}`);
      cdp.errors.forEach(e => log(`  ERR at ${e.url}:${e.line}:${e.col} - ${e.text?.substring(0, 100)}`));
    }

    // Also check console messages via CDP Console.enable
    try {
      await cdp.send('Console.enable', {});
    } catch {}

    // Check if app.js itself loaded
    const appJsLoaded = await evalJS(`typeof window.__appLoaded !== 'undefined' ? window.__appLoaded : false`);
    results.diagnostics.appJsLoaded = appJsLoaded;
    log(`app.js loaded flag: ${appJsLoaded}`);

    // TEST 1
    const title = await evalJS('document.title');
    results.tests.push({ name: 'Page loaded', pass: !!title, detail: title });
    log(`TEST 1 - Page title: ${title}`);

    // TEST 2
    const presets = await evalJS(`(typeof window.TITLE_PRESETS !== 'undefined') ? Object.keys(window.TITLE_PRESETS) : null`);
    results.tests.push({ name: 'TITLE_PRESETS has 5 identities', pass: Array.isArray(presets) && presets.length === 5, detail: presets });
    log(`TEST 2 - TITLE_PRESETS: ${JSON.stringify(presets)}`);

    // TEST 3
    const label = await evalJS(`(typeof window.getTitle === 'function') ? window.getTitle('label') : null`);
    results.tests.push({ name: 'getTitle() works', pass: typeof label === 'string', detail: label });
    log(`TEST 3 - Default label: ${label}`);

    // TEST 4
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

    // TEST 5
    const keys = await evalJS(`(typeof window.VOICE_OPTIONS !== 'undefined') ? Object.keys(window.VOICE_OPTIONS) : null`);
    results.tests.push({ name: 'VOICE_OPTIONS has neutral', pass: Array.isArray(keys) && keys.includes('neutral'), detail: keys });
    log(`TEST 5 - Voice keys: ${JSON.stringify(keys)}`);

    // TEST 6
    const dv = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined') ? window.DEFAULT_STATE.voiceType : null`);
    results.tests.push({ name: 'Default voiceType is neutral', pass: dv === 'neutral', detail: dv });
    log(`TEST 6 - Default voiceType: ${dv}`);

    // TEST 7
    const funcs = ['generateMicroActions','renderMicroActions','addMicroActionToGarden','showMicroActionsForWish'];
    const res = {};
    for (const f of funcs) {
      res[f] = await evalJS(`typeof window['${f}'] === 'function'`);
    }
    results.tests.push({ name: 'Micro action functions exist', pass: Object.values(res).every(v=>v), detail: res });
    log(`TEST 7 - Micro funcs: ${JSON.stringify(res)}`);

    // TEST 8
    const hasMA = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && Array.isArray(window.DEFAULT_STATE.microActions))`);
    results.tests.push({ name: 'DEFAULT_STATE.microActions array', pass: hasMA === true, detail: hasMA });
    log(`TEST 8 - microActions: ${hasMA}`);

    // TEST 9
    const enStr = await evalJS(`(typeof window.TRANSLATIONS !== 'undefined' && window.TRANSLATIONS.en) ? JSON.stringify(window.TRANSLATIONS.en) : null`);
    const hasP = enStr ? /"[Pp]rincess"/.test(enStr) : null;
    results.tests.push({ name: 'EN has no Princess hardcode', pass: hasP === false, detail: { hasPrincess: hasP } });
    log(`TEST 9 - EN has Princess: ${hasP}`);

    // TEST 10
    const hasBC = await evalJS(`typeof window.broadcastStorageUpdate === 'function'`);
    results.tests.push({ name: 'broadcastStorageUpdate exists', pass: hasBC === true, detail: hasBC });
    log(`TEST 10 - broadcastStorageUpdate: ${hasBC}`);

    // TEST 11
    const hasWD = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && typeof window.DEFAULT_STATE.wishDrafts === 'object')`);
    results.tests.push({ name: 'DEFAULT_STATE.wishDrafts exists', pass: hasWD === true, detail: hasWD });
    log(`TEST 11 - wishDrafts: ${hasWD}`);

    // TEST 12
    const hasSR = await evalJS(`(typeof window.DEFAULT_STATE !== 'undefined' && Array.isArray(window.DEFAULT_STATE.satsRecords))`);
    results.tests.push({ name: 'DEFAULT_STATE.satsRecords array', pass: hasSR === true, detail: hasSR });
    log(`TEST 12 - satsRecords: ${hasSR}`);

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

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));

  const passed = results.tests.filter(t => t.pass).length;
  const total = results.tests.length;
  log(`========================================`);
  log(`RESULTS: ${passed}/${total} tests passed`);
  log(`========================================`);
  results.tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
  });
  if (results.diagnostics.windowKeys) {
    console.log(`\nDiagnostics - Window keys: ${JSON.stringify(results.diagnostics.windowKeys)}`);
  }
  if (results.diagnostics.jsErrors && results.diagnostics.jsErrors.length > 0) {
    console.log(`\nJS Errors:`);
    results.diagnostics.jsErrors.forEach(e => console.log(`  ! ${e.url || '?'}:${e.line || '?'}:${e.col || '?'} - ${(e.text || '').substring(0, 150)}`));
  }
}

runTests().catch(err => {
  console.error('Unhandled:', err);
  process.exit(1);
});

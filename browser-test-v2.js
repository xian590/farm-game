const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');

const REPORT_PATH = process.argv[2] || 'C:\\Users\\Administrator\\Documents\\kimi\\workspace\\browser-test-report.json';
const SCREENSHOT_PATH = path.join(path.dirname(REPORT_PATH), 'screenshot-test.png');

// First, get the page list to find current page ID
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
    if (p.type === 'page' && p.url.includes('56762')) {
      return p.id;
    }
  }
  // fallback: any page type=page
  for (const p of pages) {
    if (p.type === 'page') return p.id;
  }
  return null;
}

function connectCDP(pageId) {
  const wsUrl = `ws://127.0.0.1:9222/devtools/page/${pageId}`;
  const parsed = new URL(wsUrl);

  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: parsed.hostname, port: parsed.port });
    let state = 'connecting';
    let buffer = Buffer.alloc(0);
    const callbacks = {};
    let nextId = 1;

    socket.on('connect', () => {
      const key = Buffer.from(Math.random().toString()).toString('base64');
      socket.write([
        `GET ${parsed.pathname}${parsed.search} HTTP/1.1`,
        `Host: ${parsed.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '', ''
      ].join('\r\n'));
    });

    function send(method, params) {
      const id = nextId++;
      const msg = JSON.stringify({ id, method, params });
      const buf = Buffer.from(msg, 'utf-8');
      let frame;
      if (buf.length < 126) {
        frame = Buffer.allocUnsafe(2 + buf.length);
        frame[0] = 0x81;
        frame[1] = buf.length;
        buf.copy(frame, 2);
      } else {
        frame = Buffer.allocUnsafe(4 + buf.length);
        frame[0] = 0x81;
        frame[1] = 126;
        frame.writeUInt16BE(buf.length, 2);
        buf.copy(frame, 4);
      }
      return new Promise((res) => {
        callbacks[id] = res;
        socket.write(frame);
      });
    }

    function processBuffer() {
      while (buffer.length >= 2) {
        const fin = (buffer[0] & 0x80) !== 0;
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
        const payload = buffer.slice(offset, offset + payloadLen);
        if (mask) {
          for (let i = 0; i < payload.length; i++) {
            payload[i] ^= mask[i % 4];
          }
        }

        buffer = buffer.slice(offset + payloadLen);

        if (opcode === 0x1) { // text
          const text = payload.toString('utf-8');
          try {
            const obj = JSON.parse(text);
            if (obj.id && callbacks[obj.id]) {
              callbacks[obj.id](obj);
              delete callbacks[obj.id];
            }
          } catch (e) {}
        } else if (opcode === 0x8) { // close
          socket.end();
        } else if (opcode === 0x9) { // ping
          // Send pong
          const pong = Buffer.allocUnsafe(2);
          pong[0] = 0x8a;
          pong[1] = 0;
          socket.write(pong);
        }
      }
    }

    socket.on('data', (chunk) => {
      if (state === 'connecting') {
        const headerEnd = chunk.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          state = 'open';
          const remaining = chunk.slice(headerEnd + 4);
          if (remaining.length > 0) {
            buffer = Buffer.concat([buffer, remaining]);
            processBuffer();
          }
          resolve({ send, close: () => socket.end() });
        }
        return;
      }
      buffer = Buffer.concat([buffer, chunk]);
      processBuffer();
    });

    socket.on('error', reject);
    socket.on('close', () => {
      // Connection closed
    });
  });
}

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: []
  };

  console.log('Getting page ID...');
  const pageId = await getPageId();
  if (!pageId) {
    console.error('No page found');
    process.exit(1);
  }
  console.log('Page ID:', pageId);

  console.log('Connecting to CDP...');
  const cdp = await connectCDP(pageId);
  console.log('Connected!');

  // Enable domains
  await cdp.send('Runtime.enable', {});
  await cdp.send('Page.enable', {});

  // Navigate
  console.log('Navigating to app...');
  await cdp.send('Page.navigate', { url: 'http://127.0.0.1:56762/index.html' });
  await new Promise(r => setTimeout(r, 4000));

  async function evalJS(expression, awaitPromise = false) {
    const res = await cdp.send('Runtime.evaluate', {
      expression,
      awaitPromise,
      returnByValue: true
    });
    if (res.result?.result?.value !== undefined) {
      return res.result.result.value;
    }
    return res.result?.result;
  }

  // === TEST 1: Page loaded ===
  const title = await evalJS('document.title');
  results.tests.push({ name: 'Page loaded', pass: !!title, detail: title });
  console.log('✓ Page title:', title);

  // === TEST 2: TITLE_PRESETS ===
  const presets = await evalJS(`
    (typeof TITLE_PRESETS !== 'undefined') ? Object.keys(TITLE_PRESETS) : null
  `);
  results.tests.push({
    name: 'TITLE_PRESETS has 5 identities',
    pass: Array.isArray(presets) && presets.length === 5,
    detail: presets
  });
  console.log('✓ TITLE_PRESETS:', presets);

  // === TEST 3: getTitle function ===
  const defaultLabel = await evalJS(`
    (typeof getTitle === 'function') ? getTitle('label') : null
  `);
  results.tests.push({
    name: 'getTitle() returns default label',
    pass: typeof defaultLabel === 'string' && defaultLabel.length > 0,
    detail: defaultLabel
  });
  console.log('✓ Default label:', defaultLabel);

  // === TEST 4: All 5 identities produce correct text ===
  const identityTests = [];
  const expected = {
    princess:  { label: '花公主', pronoun: '她', levelSuffix: '行者' },
    prince:    { label: '花之子', pronoun: '他', levelSuffix: '行者' },
    mystic:    { label: '花灵',   pronoun: 'TA', levelSuffix: '灵' },
    sovereign: { label: '君主',   pronoun: '您', levelSuffix: '主' },
    explorer:  { label: '探索者', pronoun: '你', levelSuffix: '者' },
  };

  for (const [id, exp] of Object.entries(expected)) {
    await evalJS(`
      if (typeof state !== 'undefined') {
        state.titlePreference = '${id}';
        if (typeof saveState === 'function') saveState();
      }
    `);
    const label = await evalJS(`(typeof getTitle === 'function') ? getTitle('label') : null`);
    const pronoun = await evalJS(`(typeof getTitle === 'function') ? getTitle('pronoun') : null`);
    const suffix = await evalJS(`(typeof getTitle === 'function') ? getTitle('levelSuffix') : null`);

    const pass = label === exp.label && pronoun === exp.pronoun && suffix === exp.levelSuffix;
    identityTests.push({ id, label, pronoun, suffix, expected: exp, pass });
    console.log(`  ${pass ? '✓' : '✗'} ${id}: label=${label}, pronoun=${pronoun}, suffix=${suffix}`);
  }
  results.tests.push({
    name: 'All 5 identity preferences render correctly',
    pass: identityTests.every(t => t.pass),
    detail: identityTests
  });

  // === TEST 5: VOICE_OPTIONS neutral ===
  const voiceKeys = await evalJS(`
    (typeof VOICE_OPTIONS !== 'undefined') ? Object.keys(VOICE_OPTIONS) : null
  `);
  results.tests.push({
    name: 'VOICE_OPTIONS includes neutral',
    pass: Array.isArray(voiceKeys) && voiceKeys.includes('neutral'),
    detail: voiceKeys
  });
  console.log('✓ Voice options:', voiceKeys);

  // === TEST 6: Default voiceType ===
  const defaultVoice = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined') ? DEFAULT_STATE.voiceType : null
  `);
  results.tests.push({
    name: 'Default voiceType is neutral',
    pass: defaultVoice === 'neutral',
    detail: defaultVoice
  });
  console.log('✓ Default voiceType:', defaultVoice);

  // === TEST 7: Micro action functions ===
  const funcs = ['generateMicroActions', 'renderMicroActions', 'addMicroActionToGarden', 'showMicroActionsForWish'];
  const funcResults = {};
  for (const f of funcs) {
    const exists = await evalJS(`typeof window['${f}'] === 'function'`);
    funcResults[f] = exists;
  }
  results.tests.push({
    name: 'Micro action system functions exist',
    pass: Object.values(funcResults).every(v => v === true),
    detail: funcResults
  });
  console.log('✓ Micro action funcs:', funcResults);

  // === TEST 8: DEFAULT_STATE.microActions ===
  const hasMicroArr = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined' && Array.isArray(DEFAULT_STATE.microActions))
  `);
  results.tests.push({
    name: 'DEFAULT_STATE.microActions is array',
    pass: hasMicroArr === true,
    detail: hasMicroArr
  });
  console.log('✓ microActions array:', hasMicroArr);

  // === TEST 9: EN translations gender-neutral ===
  const enStr = await evalJS(`
    (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.en)
      ? JSON.stringify(TRANSLATIONS.en)
      : null
  `);
  const hasPrincessInEN = enStr ? /"[Pp]rincess"/.test(enStr) : null;
  results.tests.push({
    name: 'EN translations have no "Princess" hardcoded',
    pass: hasPrincessInEN === false,
    detail: { hasPrincess: hasPrincessInEN, sample: enStr ? enStr.slice(0, 200) : null }
  });
  console.log('✓ EN has Princess:', hasPrincessInEN);

  // === TEST 10: broadcastStorageUpdate ===
  const hasBroadcast = await evalJS(`typeof broadcastStorageUpdate === 'function'`);
  results.tests.push({
    name: 'broadcastStorageUpdate function exists',
    pass: hasBroadcast === true,
    detail: hasBroadcast
  });
  console.log('✓ broadcastStorageUpdate:', hasBroadcast);

  // === TEST 11: Wish draft system ===
  const hasWishDrafts = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined' && typeof DEFAULT_STATE.wishDrafts === 'object')
  `);
  results.tests.push({
    name: 'DEFAULT_STATE.wishDrafts exists',
    pass: hasWishDrafts === true,
    detail: hasWishDrafts
  });
  console.log('✓ wishDrafts:', hasWishDrafts);

  // === TEST 12: satsRecords ===
  const hasSats = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined' && Array.isArray(DEFAULT_STATE.satsRecords))
  `);
  results.tests.push({
    name: 'DEFAULT_STATE.satsRecords is array',
    pass: hasSats === true,
    detail: hasSats
  });
  console.log('✓ satsRecords:', hasSats);

  // === Screenshot ===
  console.log('Taking screenshot...');
  try {
    const ss = await cdp.send('Page.captureScreenshot', { format: 'png' });
    if (ss.result?.data) {
      fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(ss.result.data, 'base64'));
      results.screenshots.push(SCREENSHOT_PATH);
      console.log('✓ Screenshot saved:', SCREENSHOT_PATH);
    }
  } catch (e) {
    console.log('✗ Screenshot failed:', e.message);
  }

  // Save report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));

  // Summary
  const passed = results.tests.filter(t => t.pass).length;
  const total = results.tests.length;
  console.log(`\n========================================`);
  console.log(`  RESULTS: ${passed}/${total} tests passed`);
  console.log(`========================================`);
  results.tests.forEach(t => {
    console.log(`  ${t.pass ? '✅' : '❌'} ${t.name}`);
  });

  cdp.close();
  return results;
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

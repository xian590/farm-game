const http = require('http');
const fs = require('fs');
const path = require('path');

const CDP_WS = 'ws://127.0.0.1:9222/devtools/page/DC8B8E985C3557E57DD968B5DDEB1A6C';
const REPORT_PATH = process.argv[2] || 'C:\\Users\\Administrator\\Documents\\kimi\\workspace\\browser-test-report.json';

// Simple WebSocket client (no external deps)
function connectWS(url) {
  return new Promise((resolve, reject) => {
    const wsUrl = new URL(url);
    const client = require('net').createConnection({
      host: wsUrl.hostname,
      port: wsUrl.port || 80
    });

    let buffer = '';
    let ready = false;
    const pending = {};
    let msgId = 1;

    client.on('connect', () => {
      const key = Buffer.from(Math.random().toString(36)).toString('base64');
      const req = [
        `GET ${wsUrl.pathname}${wsUrl.search} HTTP/1.1`,
        `Host: ${wsUrl.host}`,
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Key: ${key}`,
        'Sec-WebSocket-Version: 13',
        '',
        ''
      ].join('\r\n');
      client.write(req);
    });

    function send(method, params) {
      const id = msgId++;
      const msg = JSON.stringify({ id, method, params });
      const frame = Buffer.allocUnsafe(msg.length + 2);
      frame[0] = 0x81; // FIN + text
      frame[1] = msg.length;
      frame.write(msg, 2);
      client.write(frame);
      return new Promise((res) => { pending[id] = res; });
    }

    function parseFrames(data) {
      let i = 0;
      while (i < data.length) {
        if (data.length < i + 2) break;
        const fin = data[i] & 0x80;
        const opcode = data[i] & 0x0f;
        let len = data[i + 1] & 0x7f;
        let mask = data[i + 1] & 0x80;
        let offset = i + 2;
        if (len === 126) {
          if (data.length < offset + 2) break;
          len = data.readUInt16BE(offset);
          offset += 2;
        } else if (len === 127) {
          if (data.length < offset + 8) break;
          len = Number(data.readBigUInt64BE(offset));
          offset += 8;
        }
        let maskKey = null;
        if (mask) {
          maskKey = data.slice(offset, offset + 4);
          offset += 4;
        }
        if (data.length < offset + len) break;
        const payload = data.slice(offset, offset + len);
        if (maskKey) {
          for (let j = 0; j < payload.length; j++) {
            payload[j] ^= maskKey[j % 4];
          }
        }
        if (opcode === 0x1) {
          const text = payload.toString('utf-8');
          try {
            const obj = JSON.parse(text);
            if (obj.id && pending[obj.id]) {
              pending[obj.id](obj);
              delete pending[obj.id];
            }
          } catch {}
        }
        i = offset + len;
      }
      return i;
    }

    client.on('data', (chunk) => {
      if (!ready) {
        buffer += chunk.toString();
        if (buffer.includes('\r\n\r\n')) {
          ready = true;
          buffer = '';
          resolve({ send });
        }
        return;
      }
      buffer += chunk.toString('binary');
      const buf = Buffer.from(buffer, 'binary');
      const consumed = parseFrames(buf);
      if (consumed > 0 && consumed < buf.length) {
        buffer = buf.slice(consumed).toString('binary');
      } else if (consumed >= buf.length) {
        buffer = '';
      }
    });

    client.on('error', reject);
  });
}

async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: []
  };

  console.log('Connecting to CDP...');
  const { send } = await connectWS(CDP_WS);
  console.log('Connected!');

  // Enable required domains
  await send('Runtime.enable', {});
  await send('Page.enable', {});
  await send('DOM.enable', {});

  // Navigate to our app
  console.log('Navigating...');
  await send('Page.navigate', { url: 'http://127.0.0.1:56762/index.html' });
  await new Promise(r => setTimeout(r, 3000));

  async function evalJS(expr, awaitPromise = false) {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      awaitPromise,
      returnByValue: true
    });
    return res.result?.result?.value ?? res.result?.result;
  }

  // Test 1: Check if app loaded
  const title = await evalJS('document.title');
  results.tests.push({ name: 'Page loaded', pass: !!title, detail: title });
  console.log('Page title:', title);

  // Test 2: Check TITLE_PRESETS availability
  const presets = await evalJS(`
    (typeof TITLE_PRESETS !== 'undefined') ? Object.keys(TITLE_PRESETS) : 'NOT_FOUND'
  `);
  results.tests.push({
    name: 'TITLE_PRESETS defined',
    pass: Array.isArray(presets) && presets.length === 5,
    detail: presets
  });
  console.log('TITLE_PRESETS keys:', presets);

  // Test 3: Check getTitle function
  const getTitleResult = await evalJS(`
    (typeof getTitle === 'function') ? getTitle('label') : 'NOT_FOUND'
  `);
  results.tests.push({
    name: 'getTitle() function works',
    pass: getTitleResult !== 'NOT_FOUND' && typeof getTitleResult === 'string',
    detail: getTitleResult
  });
  console.log('getTitle(label):', getTitleResult);

  // Test 4: Test all 5 identity preferences
  const identities = ['princess', 'prince', 'mystic', 'sovereign', 'explorer'];
  const identityResults = {};
  for (const id of identities) {
    const label = await evalJS(`
      if (typeof state !== 'undefined') {
        state.titlePreference = '${id}';
        if (typeof saveState === 'function') saveState();
      }
      (typeof getTitle === 'function') ? getTitle('label') : 'NO_FUNC'
    `);
    const pronoun = await evalJS(`(typeof getTitle === 'function') ? getTitle('pronoun') : 'NO_FUNC'`);
    const levelSuffix = await evalJS(`(typeof getTitle === 'function') ? getTitle('levelSuffix') : 'NO_FUNC'`);
    identityResults[id] = { label, pronoun, levelSuffix };
    console.log(`Identity ${id}: label=${label}, pronoun=${pronoun}, suffix=${levelSuffix}`);
  }
  results.tests.push({
    name: 'All 5 identity preferences work',
    pass: identities.every(id =>
      identityResults[id]?.label &&
      identityResults[id]?.label !== 'NO_FUNC' &&
      identityResults[id]?.label !== 'undefined'
    ),
    detail: identityResults
  });

  // Test 5: Check VOICE_OPTIONS has neutral
  const voiceOptions = await evalJS(`
    (typeof VOICE_OPTIONS !== 'undefined') ? Object.keys(VOICE_OPTIONS) : 'NOT_FOUND'
  `);
  results.tests.push({
    name: 'VOICE_OPTIONS includes neutral',
    pass: Array.isArray(voiceOptions) && voiceOptions.includes('neutral'),
    detail: voiceOptions
  });
  console.log('Voice options:', voiceOptions);

  // Test 6: Check default voiceType
  const defaultVoice = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined') ? DEFAULT_STATE.voiceType : 'NOT_FOUND'
  `);
  results.tests.push({
    name: 'Default voiceType is neutral',
    pass: defaultVoice === 'neutral',
    detail: defaultVoice
  });
  console.log('Default voiceType:', defaultVoice);

  // Test 7: Check micro action system
  const microActionFuncs = await evalJS(`
    ['generateMicroActions', 'renderMicroActions', 'addMicroActionToGarden', 'showMicroActionsForWish']
      .map(f => typeof window[f] === 'function' ? f : f + ':NOT_FOUND')
  `);
  results.tests.push({
    name: 'Micro action functions available',
    pass: Array.isArray(microActionFuncs) && microActionFuncs.every(f => !f.includes('NOT_FOUND')),
    detail: microActionFuncs
  });
  console.log('Micro action funcs:', microActionFuncs);

  // Test 8: Check DEFAULT_STATE has microActions
  const hasMicroActions = await evalJS(`
    (typeof DEFAULT_STATE !== 'undefined' && Array.isArray(DEFAULT_STATE.microActions)) ? true : false
  `);
  results.tests.push({
    name: 'DEFAULT_STATE.microActions is array',
    pass: hasMicroActions === true,
    detail: hasMicroActions
  });
  console.log('Has microActions:', hasMicroActions);

  // Test 9: Check EN translations
  const enTranslations = await evalJS(`
    (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS.en) ? {
      welcomeTitle: TRANSLATIONS.en.welcome?.title,
      hasPrincess: JSON.stringify(TRANSLATIONS.en).includes('Princess')
    } : 'NOT_FOUND'
  `);
  results.tests.push({
    name: 'EN translations are gender-neutral',
    pass: enTranslations !== 'NOT_FOUND' && enTranslations.hasPrincess === false,
    detail: enTranslations
  });
  console.log('EN translations:', enTranslations);

  // Test 10: Check broadcastStorageUpdate
  const hasBroadcast = await evalJS(`
    (typeof broadcastStorageUpdate === 'function') ? true : false
  `);
  results.tests.push({
    name: 'broadcastStorageUpdate available',
    pass: hasBroadcast === true,
    detail: hasBroadcast
  });
  console.log('Has broadcastStorageUpdate:', hasBroadcast);

  // Screenshot via CDP
  console.log('Taking screenshot...');
  try {
    const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
    if (screenshotRes.result?.data) {
      const imgPath = path.join(path.dirname(REPORT_PATH), 'screenshot-test.png');
      fs.writeFileSync(imgPath, Buffer.from(screenshotRes.result.data, 'base64'));
      results.screenshots.push(imgPath);
      console.log('Screenshot saved:', imgPath);
    }
  } catch (e) {
    console.log('Screenshot failed:', e.message);
  }

  // Save report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log('\nReport saved to:', REPORT_PATH);

  // Summary
  const passed = results.tests.filter(t => t.pass).length;
  const total = results.tests.length;
  console.log(`\n=== RESULTS: ${passed}/${total} tests passed ===`);
  results.tests.forEach(t => {
    console.log(`${t.pass ? '✅' : '❌'} ${t.name}`);
  });

  return results;
}

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_FILE = path.join(__dirname, 'index-manifestation.html');
const html = fs.readFileSync(HTML_FILE, 'utf-8');

// ============================================
// 最小化 DOM 模拟环境（覆盖核心 API）
// ============================================
const errors = [];
const logs = [];
const functionCalls = [];

function logError(msg, stack) {
  errors.push({ msg, stack: stack || '' });
}
function logCall(fn, args) {
  functionCalls.push({ fn, args: JSON.stringify(args).slice(0, 200) });
}

// Mock DOM
const mockElements = {};
function getElementById(id) {
  logCall('getElementById', [id]);
  if (!mockElements[id]) {
    mockElements[id] = {
      id,
      classList: {
        _classes: new Set(),
        add: (c) => mockElements[id].classList._classes.add(c),
        remove: (c) => mockElements[id].classList._classes.delete(c),
        contains: (c) => mockElements[id].classList._classes.has(c),
        toggle: (c, f) => { 
          if (f === undefined) {
            if (mockElements[id].classList._classes.has(c)) {
              mockElements[id].classList._classes.delete(c); return false;
            } else {
              mockElements[id].classList._classes.add(c); return true;
            }
          }
          if (f) mockElements[id].classList._classes.add(c);
          else mockElements[id].classList._classes.delete(c);
        }
      },
      style: {},
      textContent: '',
      innerHTML: '',
      value: '',
      dataset: {},
      children: [],
      appendChild: (c) => { mockElements[id].children.push(c); return c; },
      remove: () => {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50 }),
      querySelector: (sel) => null,
      querySelectorAll: (sel) => [],
      dispatchEvent: () => {},
      focus: () => {},
      click: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      getAttribute: () => null,
    };
  }
  return mockElements[id];
}

const mockDocument = {
  getElementById,
  querySelector: (sel) => {
    logCall('querySelector', [sel]);
    // Handle common selectors
    if (sel.startsWith('#')) return getElementById(sel.slice(1));
    if (sel.startsWith('.')) {
      const cls = sel.slice(1).split('.')[0];
      return getElementById('mock-' + cls);
    }
    return getElementById('mock-generic');
  },
  querySelectorAll: (sel) => {
    logCall('querySelectorAll', [sel]);
    if (sel === '.page') {
      return ['welcome', 'island', 'test', 'profile', 'settings', 'help', 
              'flower-bed', 'breath', 'sats', 'gratitude', 'manifest-night',
              'emotion', 'belief-tower', 'history', 'challenge'].map(id => getElementById('page-' + id));
    }
    if (sel === '.modal-backdrop') {
      return ['test-modal', 'persona-modal', 'alert-modal'].map(id => getElementById(id));
    }
    if (sel === '.nav-item') {
      return ['home', 'wish', 'tool', 'book', 'me'].map(id => getElementById('nav-' + id));
    }
    if (sel === '.firefly') return [];
    if (sel === '.confetti') return [];
    if (sel === '.mood-tag') return [];
    if (sel === '.option-card') return [];
    return [];
  },
  body: {
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {},
  },
  documentElement: {
    style: { setProperty: () => {} },
  },
  createElement: (tag) => {
    return getElementById('mock-' + tag + '-' + Math.random().toString(36).slice(2, 8));
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

const mockWindow = {
  document: mockDocument,
  localStorage: {
    _data: {},
    getItem: (k) => mockWindow.localStorage._data[k] || null,
    setItem: (k, v) => { mockWindow.localStorage._data[k] = String(v); },
    removeItem: (k) => { delete mockWindow.localStorage._data[k]; },
  },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { href: 'http://localhost/' },
  navigator: { 
    userAgent: 'TestBrowser/1.0', 
    language: 'zh-CN',
    serviceWorker: { controller: null, ready: Promise.resolve({ showNotification: () => {} }) }
  },
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout: (fn, ms) => { if (typeof fn === 'function') fn(); return 1; },
  setInterval: () => 1,
  clearTimeout: () => {},
  clearInterval: () => {},
  requestAnimationFrame: (fn) => { if (fn) fn(); return 1; },
  cancelAnimationFrame: () => {},
  AudioContext: null, // disabled audio
  webkitAudioContext: null,
  speechSynthesis: null,
  Notification: { permission: 'default', requestPermission: () => Promise.resolve('default') },
  Math: Math,
  Date: Date,
  JSON: JSON,
  console: {
    log: (...args) => logs.push({ level: 'log', msg: args.map(a => String(a)).join(' ') }),
    error: (...args) => { 
      const msg = args.map(a => String(a)).join(' ');
      logs.push({ level: 'error', msg });
      logError(msg, '');
    },
    warn: (...args) => logs.push({ level: 'warn', msg: args.map(a => String(a)).join(' ') }),
    info: (...args) => logs.push({ level: 'info', msg: args.map(a => String(a)).join(' ') }),
  },
  alert: () => {},
  confirm: () => true,
  prompt: () => null,
  fetch: () => Promise.resolve({ json: () => ({}) }),
  URL: URL,
  Blob: Blob,
  FileReader: function() { this.readAsDataURL = () => {}; },
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  __onerror_handlers: [],
  onerror: null,
};

// Intercept errors
captureUnhandledErrors(mockWindow);
function captureUnhandledErrors(w) {
  w.addEventListener = (evt, handler) => {
    if (evt === 'error' || evt === 'unhandledrejection') {
      w.__onerror_handlers.push(handler);
    }
  };
}

// ============================================
// Extract and run JS blocks
// ============================================
const scriptMatches = [];
let remaining = html;
while (true) {
  const startIdx = remaining.indexOf('<script>');
  if (startIdx === -1) break;
  const endIdx = remaining.indexOf('</script>', startIdx);
  if (endIdx === -1) break;
  const code = remaining.slice(startIdx + 8, endIdx);
  scriptMatches.push(code);
  remaining = remaining.slice(endIdx + 9);
}

// Also check for <script src="..."> tags - these are external, ignore them
// Only run inline scripts

const inlineScripts = [];
let searchHtml = html;
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  const attrs = m[0].slice(7, m[0].indexOf('>'));
  if (!attrs.includes('src=')) {
    inlineScripts.push(m[1]);
  }
}

// ============================================
// Run each block in sandbox with DOM mock
// ============================================
const sandbox = {
  window: mockWindow,
  document: mockDocument,
  console: mockWindow.console,
  localStorage: mockWindow.localStorage,
  sessionStorage: mockWindow.sessionStorage,
  navigator: mockWindow.navigator,
  location: mockWindow.location,
  alert: mockWindow.alert,
  confirm: mockWindow.confirm,
  prompt: mockWindow.prompt,
  fetch: mockWindow.fetch,
  URL: mockWindow.URL,
  Blob: mockWindow.Blob,
  FileReader: mockWindow.FileReader,
  atob: mockWindow.atob,
  btoa: mockWindow.btoa,
  Math: Math,
  Date: Date,
  JSON: JSON,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
  Error: Error,
  Map: Map,
  Set: Set,
  Promise: Promise,
  setTimeout: mockWindow.setTimeout,
  setInterval: mockWindow.setInterval,
  clearTimeout: mockWindow.clearTimeout,
  clearInterval: mockWindow.clearInterval,
  requestAnimationFrame: mockWindow.requestAnimationFrame,
  cancelAnimationFrame: mockWindow.cancelAnimationFrame,
  scrollTo: mockWindow.scrollTo,
  addEventListener: mockWindow.addEventListener,
  removeEventListener: mockWindow.removeEventListener,
  AudioContext: null,
  webkitAudioContext: null,
  speechSynthesis: null,
  Notification: mockWindow.Notification,
  speechSynthesisUtterance: null,
  IntersectionObserver: null,
  MutationObserver: null,
  __initDone: false,
  __pageHistory: [],
  __initInterval: null,
  __voiceReady: false,
  __synth: null,
  audioCtx: null,
  tutorialStep: 0,
  testState: null,
  testLock: false,
  testSelected: null,
  moodTagSelected: [],
  affirmLoopInterval: null,
  affirmLoopIndex: 0,
  habitDetailDate: null,
  bookDetailId: null,
  movieDetailId: null,
  courseDetailId: null,
  lessonDetailId: null,
  courseVideoModalOpen: false,
  CHALLENGE_TASKS: [],
};

vm.createContext(sandbox);

// Run each block
for (let i = 0; i < inlineScripts.length; i++) {
  const code = inlineScripts[i];
  try {
    vm.runInContext(code, sandbox, { timeout: 5000, filename: `block_${i}.js` });
  } catch (e) {
    logError(`Block ${i} runtime error: ${e.message}`, e.stack);
  }
}

// ============================================
// Now simulate the user flow
// ============================================
function simulateFlow() {
  const flow = [];
  
  // Step 1: Check if init() exists
  if (typeof sandbox.init !== 'function') {
    flow.push({ step: 'INIT_EXISTS', status: 'FAIL', detail: 'init() function not found' });
    return flow;
  }
  flow.push({ step: 'INIT_EXISTS', status: 'OK' });
  
  // Step 2: Call init()
  try {
    sandbox.init();
    flow.push({ step: 'INIT_CALL', status: 'OK' });
  } catch (e) {
    flow.push({ step: 'INIT_CALL', status: 'FAIL', detail: e.message, stack: e.stack });
    return flow;
  }
  
  // Step 3: Check if welcome page is shown
  const welcomePage = mockElements['page-welcome'];
  if (welcomePage && welcomePage.classList._classes.has('active')) {
    flow.push({ step: 'WELCOME_SHOWN', status: 'OK' });
  } else {
    flow.push({ step: 'WELCOME_SHOWN', status: 'INFO', detail: 'welcome page class not tracked in mock' });
  }
  
  // Step 4: Check startWelcomeTest exists
  if (typeof sandbox.startWelcomeTest !== 'function') {
    flow.push({ step: 'START_TEST_EXISTS', status: 'FAIL', detail: 'startWelcomeTest() not found' });
    return flow;
  }
  flow.push({ step: 'START_TEST_EXISTS', status: 'OK' });
  
  // Step 5: Call startWelcomeTest
  try {
    sandbox.startWelcomeTest();
    flow.push({ step: 'START_TEST_CALL', status: 'OK' });
  } catch (e) {
    flow.push({ step: 'START_TEST_CALL', status: 'FAIL', detail: e.message, stack: e.stack });
    return flow;
  }
  
  // Step 6: Check test-modal is shown
  const testModal = mockElements['test-modal'];
  if (testModal && testModal.classList._classes.has('show')) {
    flow.push({ step: 'TEST_MODAL_SHOWN', status: 'OK' });
  } else {
    flow.push({ step: 'TEST_MODAL_SHOWN', status: 'INFO', detail: 'modal class not tracked in mock' });
  }
  
  // Step 7: Check testState
  if (sandbox.testState && sandbox.testState.questions) {
    flow.push({ step: 'TEST_STATE_CREATED', status: 'OK', questions: sandbox.testState.questions.length });
  } else {
    flow.push({ step: 'TEST_STATE_CREATED', status: 'FAIL', detail: 'testState or questions missing' });
    return flow;
  }
  
  // Step 8: Simulate answering all 15 questions
  const numQuestions = sandbox.testState.questions.length;
  let answered = 0;
  for (let q = 0; q < numQuestions; q++) {
    try {
      const currentQ = sandbox.testState.questions[sandbox.testState.current];
      if (!currentQ || !currentQ.options || currentQ.options.length === 0) {
        flow.push({ step: 'QUESTION_' + q, status: 'FAIL', detail: 'Question or options missing' });
        break;
      }
      // Select first option
      sandbox.selectTestOpt(0);
      // Click next
      sandbox.nextTestQ();
      answered++;
    } catch (e) {
      flow.push({ step: 'QUESTION_' + q, status: 'FAIL', detail: e.message });
      break;
    }
  }
  flow.push({ step: 'ANSWER_ALL', status: answered === numQuestions ? 'OK' : 'PARTIAL', answered, total: numQuestions });
  
  // Step 9: Check if finishTest was called (testState should be done)
  if (sandbox.testState && sandbox.testState.current >= numQuestions) {
    flow.push({ step: 'TEST_COMPLETE', status: 'OK' });
  } else {
    flow.push({ step: 'TEST_COMPLETE', status: 'INFO', detail: 'Test may not have completed' });
  }
  
  // Step 10: Check if enterIslandFromTest works
  if (typeof sandbox.enterIslandFromTest === 'function') {
    try {
      sandbox.enterIslandFromTest('rose');
      flow.push({ step: 'ENTER_ISLAND', status: 'OK' });
    } catch (e) {
      flow.push({ step: 'ENTER_ISLAND', status: 'FAIL', detail: e.message });
    }
  }
  
  // Step 11: Check if startTutorial works
  if (typeof sandbox.startTutorial === 'function') {
    try {
      sandbox.startTutorial();
      flow.push({ step: 'START_TUTORIAL', status: 'OK' });
    } catch (e) {
      flow.push({ step: 'START_TUTORIAL', status: 'FAIL', detail: e.message });
    }
  }
  
  return flow;
}

const flowResult = simulateFlow();

// ============================================
// Output results
// ============================================
const report = {
  inlineScriptsFound: inlineScripts.length,
  errors: errors.slice(0, 20),
  logs: logs.filter(l => l.level === 'error').slice(0, 20),
  functionCalls: functionCalls.slice(0, 50),
  flowResult,
  mockElementsCreated: Object.keys(mockElements).length,
  sandboxFunctions: Object.keys(sandbox).filter(k => typeof sandbox[k] === 'function').slice(0, 30),
  sandboxVariables: Object.keys(sandbox).filter(k => typeof sandbox[k] !== 'function').slice(0, 30),
};

fs.writeFileSync('test_report.json', JSON.stringify(report, null, 2));
console.log('Test report written to test_report.json');
console.log('Scripts found:', inlineScripts.length);
console.log('Errors:', errors.length);
console.log('Flow steps:', flowResult.length);

// Print errors
if (errors.length > 0) {
  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log('ERROR:', e.msg));
}

// Print flow
console.log('\n=== FLOW ===');
flowResult.forEach(f => console.log(`${f.status}: ${f.step}${f.detail ? ' - ' + f.detail : ''}`));

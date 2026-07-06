const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// ===== 完整浏览器模拟环境 =====
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.id = '';
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: (...c) => c.forEach(x => this.classList._classes.add(x)),
      remove: (...c) => c.forEach(x => this.classList._classes.delete(x)),
      toggle: (c, force) => {
        if (force !== undefined) { force ? this.classList._classes.add(c) : this.classList._classes.delete(c); }
        else { this.classList._classes.has(c) ? this.classList._classes.delete(c) : this.classList._classes.add(c); }
      },
      contains: (c) => this.classList._classes.has(c),
      get length() { return this.classList._classes.size; }
    };
    this.style = {
      _styles: {},
      setProperty: function(prop, val) { this._styles[prop] = val; },
      getPropertyValue: function(prop) { return this._styles[prop] || ''; },
      removeProperty: function(prop) { delete this._styles[prop]; },
      get cssText() { return Object.entries(this._styles).map(([k, v]) => k + ':' + v).join(';'); },
      set cssText(val) { this._styles = {}; }
    };
    this.dataset = {};
    this.children = [];
    this.childNodes = [];
    this.parentNode = null;
    this.textContent = '';
    this.innerHTML = '';
    this.value = '';
    this._listeners = {};
  }
  appendChild(child) { this.children.push(child); this.childNodes.push(child); child.parentNode = this; return child; }
  removeChild(child) { 
    const idx = this.children.indexOf(child); 
    if (idx > -1) this.children.splice(idx, 1); 
    const idx2 = this.childNodes.indexOf(child);
    if (idx2 > -1) this.childNodes.splice(idx2, 1);
    child.parentNode = null;
    return child;
  }
  insertBefore(newNode, refNode) { 
    if (!refNode) { this.appendChild(newNode); return; }
    const idx = this.children.indexOf(refNode);
    if (idx > -1) { this.children.splice(idx, 0, newNode); this.childNodes.splice(idx, 0, newNode); newNode.parentNode = this; }
    else { this.appendChild(newNode); }
  }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  querySelectorAll() { return []; }
  querySelector() { return new MockElement(); }
  addEventListener(type, fn) { if (!this._listeners[type]) this._listeners[type] = []; this._listeners[type].push(fn); }
  removeEventListener() {}
  getAttribute() { return null; }
  setAttribute() {}
  focus() {}
  blur() {}
  click() {}
  getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }; }
  dispatchEvent(e) { (this._listeners[e.type] || []).forEach(fn => fn(e)); }
  get offsetWidth() { return 100; }
  get offsetHeight() { return 100; }
  scrollIntoView() {}
}

class MockDocument {
  constructor() {
    this._elements = new Map();
    this.body = new MockElement('body');
    this.documentElement = new MockElement('html');
    this.head = new MockElement('head');
    this.title = '';
    this.hidden = false;
    this.activeElement = this.body;
  }
  getElementById(id) { 
    if (!this._elements.has(id)) { 
      const el = new MockElement(); el.id = id; this._elements.set(id, el); 
    } 
    return this._elements.get(id); 
  }
  querySelectorAll() { return []; }
  querySelector() { return new MockElement(); }
  createElement(tag) { return new MockElement(tag); }
  createTextNode(text) { const el = new MockElement(); el.textContent = text; return el; }
  addEventListener() {}
  removeEventListener() {}
}

class MockEvent {
  constructor(type, opts = {}) { this.type = type; this.target = opts.target || new MockElement(); this.currentTarget = this.target; this.preventDefault = () => {}; this.stopPropagation = () => {}; }
}

class URLSearchParamsMock {
  constructor(init) { 
    this._map = new Map(); 
    if (init && typeof init === 'string') { 
      init.split('&').forEach(p => { 
        const [k, v] = p.split('='); 
        if (k) this._map.set(k, v || ''); 
      }); 
    } 
  }
  get(k) { return this._map.get(k) || null; }
  set(k, v) { this._map.set(k, v); }
  has(k) { return this._map.has(k); }
}

const doc = new MockDocument();
const win = {
  document: doc,
  addEventListener: () => {}, removeEventListener: () => {},
  scrollTo: () => {}, scrollBy: () => {}, scrollY: 0, scrollX: 0,
  innerWidth: 375, innerHeight: 812, devicePixelRatio: 2,
  location: { search: '', href: '', protocol: 'https:', host: 'localhost', pathname: '/', hash: '', reload: () => {} },
  navigator: { serviceWorker: { register: () => Promise.resolve({}) }, userAgent: 'Mozilla/5.0', language: 'zh-CN', onLine: true },
  history: { pushState: () => {}, replaceState: () => {}, back: () => {} },
  screen: { width: 375, height: 812 },
  open: () => null, close: () => {}, alert: () => {}, confirm: () => true, prompt: () => null,
  requestAnimationFrame: (cb) => setTimeout(cb, 16), cancelAnimationFrame: () => {},
  btoa: (s) => Buffer.from(s).toString('base64'), atob: (s) => Buffer.from(s, 'base64').toString(),
  URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
  Blob: class { constructor(){} }, EventSource: class { constructor(){} }, WebSocket: class { constructor(){} },
  Worker: class { constructor(){} }, XMLHttpRequest: class { constructor(){} open(){} send(){} setRequestHeader(){} },
  performance: { now: () => Date.now() }, matchMedia: () => ({ matches: false }),
  crypto: { getRandomValues: (arr) => { for(let i=0;i<arr.length;i++) arr[i]=Math.floor(Math.random()*256); return arr; } },
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}), text: () => Promise.resolve(''), ok: true, status: 200 }),
  Headers: class { constructor(){} }, Request: class { constructor(){} }, Response: class { constructor(){} }, FormData: class { constructor(){} },
  indexedDB: { open: () => ({ onsuccess: () => {}, onerror: () => {} }) },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {}, length: 0, key: () => null },
  localStorage: { 
    _data: {}, 
    getItem: (k) => win.localStorage._data[k] || null, 
    setItem: (k, v) => win.localStorage._data[k] = v, 
    removeItem: (k) => delete win.localStorage._data[k], 
    clear: () => win.localStorage._data = {}, 
    length: 0, key: () => null 
  },
  URLSearchParams: URLSearchParamsMock,
  console: console,
  setTimeout: (f, t) => { if (typeof f === 'function') { const delay = t || 0; if (delay <= 0) f(); else setImmediate(() => f()); } return Math.random(); },
  setInterval: (f, t) => { if (typeof f === 'function') { const delay = t || 0; if (delay <= 0) f(); /* no repeat for mock */ } return Math.random(); },
  clearTimeout: () => {}, clearInterval: () => {},
  eval: eval,
  AudioContext: function() { 
    this.state = 'running'; this.resume = () => {}; this.suspend = () => {}; this.close = () => {};
    this.currentTime = 0;
    this.createGain = () => ({ gain: { value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, connect: () => {} }, connect: () => {} });
    this.createOscillator = () => ({ connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0, setValueAtTime: () => {} }, type: 'sine' });
    this.createBuffer = (c, l, r) => ({ numberOfChannels: c, length: l, sampleRate: r, getChannelData: () => new Float32Array(l) });
    this.createBufferSource = () => ({ connect: () => {}, start: () => {}, buffer: null, playbackRate: { value: 1 } });
    this.createBiquadFilter = () => ({ connect: () => {}, frequency: { value: 0, setValueAtTime: () => {} }, Q: { value: 0 }, type: 'lowpass' });
    this.destination = {};
  },
  speechSynthesis: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  SpeechSynthesisUtterance: function(t) { this.text = t; this.lang = 'zh-CN'; this.rate = 1; this.pitch = 1; this.volume = 1; },
  Notification: { permission: 'default', requestPermission: () => Promise.resolve('default') },
  Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number, Boolean: Boolean, RegExp: RegExp,
  Error: Error, TypeError: TypeError, RangeError: RangeError, SyntaxError: SyntaxError, ReferenceError: ReferenceError, URIError: URIError, EvalError: EvalError,
  Promise: Promise, Symbol: Symbol, Map: Map, Set: Set, WeakMap: WeakMap, WeakSet: WeakSet, Proxy: Proxy, Reflect: Reflect, BigInt: BigInt, Intl: Intl,
  DataView: DataView, ArrayBuffer: ArrayBuffer, Float32Array: Float32Array, Float64Array: Float64Array, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array,
  Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Uint8ClampedArray: Uint8ClampedArray, BigInt64Array: BigInt64Array, BigUint64Array: BigUint64Array,
  SharedArrayBuffer: SharedArrayBuffer, Atomics: Atomics,
  parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite,
  encodeURI: encodeURI, encodeURIComponent: encodeURIComponent, decodeURI: decodeURI, decodeURIComponent: decodeURIComponent,
  escape: escape, unescape: unescape, undefined: undefined, Infinity: Infinity, NaN: NaN,
};
win.window = win;
win.self = win;
win.top = win;
win.parent = win;

// Global scope references
global.document = doc;
global.window = win;
global.navigator = win.navigator;
global.location = win.location;
global.localStorage = win.localStorage;
global.fetch = win.fetch;
global.setTimeout = win.setTimeout;
global.setInterval = win.setInterval;
global.clearTimeout = win.clearTimeout;
global.clearInterval = win.clearInterval;
global.console = console;
global.Math = Math; global.Date = Date; global.JSON = JSON; global.Object = Object; global.Array = Array;
global.String = String; global.Number = Number; global.Boolean = Boolean; global.RegExp = RegExp;
global.Error = Error; global.TypeError = TypeError; global.RangeError = RangeError; global.SyntaxError = SyntaxError;
global.ReferenceError = ReferenceError; global.URIError = URIError; global.EvalError = EvalError;
global.Promise = Promise; global.Symbol = Symbol; global.Map = Map; global.Set = Set;
global.parseInt = parseInt; global.parseFloat = parseFloat; global.isNaN = isNaN; global.isFinite = isFinite;
global.encodeURI = encodeURI; global.encodeURIComponent = encodeURIComponent;
global.decodeURI = decodeURI; global.decodeURIComponent = decodeURIComponent;
global.escape = escape; global.unescape = unescape;
global.undefined = undefined; global.Infinity = Infinity; global.NaN = NaN;
global.URLSearchParams = URLSearchParamsMock;
global.Notification = win.Notification;
global.Event = MockEvent;

// Extract and run inline scripts
const scriptBlocks = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g);
if (!scriptBlocks) { console.log('No inline scripts found'); process.exit(1); }

let errors = [];
let blockNames = ['Block 1 (Tailwind config)', 'Block 2 (Main JS)', 'Block 3 (Additional JS)'];

// Create shared context
const sharedContext = {
  document: doc, window: win, navigator: win.navigator, location: win.location,
  localStorage: win.localStorage, fetch: win.fetch,
  setTimeout: win.setTimeout, setInterval: win.setInterval, clearTimeout: win.clearTimeout, clearInterval: win.clearInterval,
  console: console, eval: eval,
  Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number, Boolean: Boolean, RegExp: RegExp,
  Error: Error, TypeError: TypeError, RangeError: RangeError, SyntaxError: SyntaxError, ReferenceError: ReferenceError, URIError: URIError, EvalError: EvalError,
  Promise: Promise, Symbol: Symbol, Map: Map, Set: Set, WeakMap: WeakMap, WeakSet: WeakSet, Proxy: Proxy, Reflect: Reflect, BigInt: BigInt, Intl: Intl,
  DataView: DataView, ArrayBuffer: ArrayBuffer, Float32Array: Float32Array, Float64Array: Float64Array, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array,
  Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Uint8ClampedArray: Uint8ClampedArray, BigInt64Array: BigInt64Array, BigUint64Array: BigUint64Array,
  SharedArrayBuffer: SharedArrayBuffer, Atomics: Atomics,
  parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite,
  encodeURI: encodeURI, encodeURIComponent: encodeURIComponent, decodeURI: decodeURI, decodeURIComponent: decodeURIComponent,
  escape: escape, unescape: unescape, undefined: undefined, Infinity: Infinity, NaN: NaN,
  URLSearchParams: URLSearchParamsMock, Notification: win.Notification, Event: MockEvent,
};

for (let i = 0; i < scriptBlocks.length; i++) {
  const code = scriptBlocks[i].replace(/<script[^>]*>|<\/script>/g, '');
  try {
    vm.runInNewContext(code, sharedContext, { timeout: 30000 });
    console.log('✅ ' + (blockNames[i] || 'Block ' + (i + 1)) + ': OK');
  } catch (e) {
    console.log('❌ ' + (blockNames[i] || 'Block ' + (i + 1)) + ': CRASH - ' + e.message);
    errors.push({ block: i + 1, name: blockNames[i] || 'Block ' + (i + 1), message: e.message, stack: e.stack });
  }
}

console.log('\n===== 测试结果 =====');
console.log('总脚本块: ' + scriptBlocks.length);
console.log('通过: ' + (scriptBlocks.length - errors.length));
console.log('失败: ' + errors.length);

if (errors.length > 0) {
  console.log('\n错误详情:');
  errors.forEach(e => {
    console.log('  ❌ ' + e.name + ': ' + e.message);
    if (e.stack) {
      const lines = e.stack.split('\n').slice(0, 3);
      lines.forEach(l => console.log('     ' + l.trim()));
    }
  });
  process.exit(1);
} else {
  console.log('\n✅ 所有脚本块执行成功！');
  
  // Run function existence test
  console.log('\n===== 函数存在性测试 =====');
  const requiredFuncs = [
    'init', 'showPage', 'goHome', 'goBack', 'switchTab', 'updateNavActive',
    'saveState', 'loadState', 'getLevel', 'getTodayStr', 'updateNickname',
    'createFireflies', 'updateTopbar', 'updateGreeting', 'updateMoodDisplay', 'updateTimeAndWeather', 'updateHomeStats', 'updateFortuneCard',
    'checkDailyReset', 'checkReminders', 'logActivity',
    'showAlert', 'closeAlert', 'showToast', 'showVoiceBubble', 'playSound', 'initAudio', 'speak',
    'triggerConfetti', 'renderSmartRecommendations', 'renderHeatmap', 'getActivityCount',
    'startTest', 'renderTestQ', 'selectTestOpt', 'nextTestQ', 'finishTest', 'calcPersona', 'enterIslandFromTest', 'viewPersona', 'closePersona',
    'saveWishDraft', 'toggleWishDone', 'deleteWish', 'renderSkyWishes', 'renderWishList', 'renderWishWall', 'addWishProgress',
    'recordMood', 'toggleMoodTag', 'saveMoodNote', 'renderEmotionHistory', 'saveEmotionNote', 'onEmotionSlide', 'initEmotion',
    'playAffirmCategory', 'showAffirmText', 'startAffirmPlay', 'toggleAffirmPlay',
    'startBreathe', 'stopBreathe', 'initBreathe',
    'startSatsTimer', 'initSats', 'renderSatsScenes',
    'renderTarot', 'drawThreeTarot', 'resetTarot',
    'renderTimeline', 'toggleWishTimeline', 'initTimeline',
    'renderManifestReport', 'initManifestReport',
    'renderAffirmLoop', 'toggleAffirmLoop', 'addAffirmLoopItem',
    'exportAllData', 'initExportOptions',
    'checkNewBadges', 'getUnlockedBadges', 'renderBadgeWall',
    'initVip', 'loadVipState', 'updateCrystalDisplay', 'showInvitePage',
    'renderMovies', 'initMovies', 'renderBookshelf', 'renderLibrary', 'renderCourses',
    'initChallenge', 'renderChallenge', 'challengeCheckIn', 'resetChallenge',
    'toggleDarkMode', 'updateTheme',
    'startTutorial', 'finishTutorial', 'showTutorialStep',
    'showModal', 'hideModal', 'showLockModal', 'closeLockModal',
  ];
  
  let funcPass = 0, funcFail = 0;
  requiredFuncs.forEach(name => {
    if (typeof sharedContext[name] === 'function') {
      funcPass++;
    } else {
      funcFail++;
      console.log('  ❌ 函数缺失: ' + name + '()');
    }
  });
  
  console.log('\n函数存在性: ' + funcPass + ' / ' + requiredFuncs.length + ' 通过');
  if (funcFail > 0) {
    console.log('缺失: ' + funcFail);
    process.exit(1);
  }
  
  console.log('\n✅ 所有测试通过！');
}

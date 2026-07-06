const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

const mockEl = () => ({ classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{}, contains: ()=>false }, style: {}, appendChild: ()=>{}, removeChild: ()=>{}, textContent: '', innerHTML: '', value: '', dataset: {}, querySelectorAll: ()=>[], addEventListener: ()=>{}, removeEventListener: ()=>{}, getAttribute: ()=>null, setAttribute: ()=>{}, remove: ()=>{}, focus: ()=>{}, blur: ()=>{}, click: ()=>{}, getBoundingClientRect: ()=>({}), offsetWidth: 0, offsetHeight: 0, scrollIntoView: ()=>{}, children: [], parentNode: null, insertBefore: ()=>{}, childNodes: [], tagName: 'DIV' });

const doc = {
  getElementById: (id) => { const e = mockEl(); e.id = id; return e; },
  querySelectorAll: () => [],
  querySelector: () => mockEl(),
  createElement: (tag) => { const e = mockEl(); e.tagName = tag.toUpperCase(); return e; },
  createTextNode: (t) => ({ textContent: t }),
  body: { classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false }, appendChild: ()=>{}, removeChild: ()=>{}, style: {} },
  documentElement: { style: { setProperty: ()=>{} }, classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false } },
  addEventListener: ()=>{},
  removeEventListener: ()=>{},
  hidden: false,
  activeElement: mockEl(),
  head: { appendChild: ()=>{} },
  title: '',
};

class URLSearchParamsMock {
  constructor(init) { this._map = new Map(); if (init && typeof init === 'string') { init.split('&').forEach(p => { const [k,v] = p.split('='); if (k) this._map.set(k, v || ''); }); } }
  get(k) { return this._map.get(k) || null; }
  set(k, v) { this._map.set(k, v); }
  has(k) { return this._map.has(k); }
  delete(k) { this._map.delete(k); }
  append(k, v) { this._map.set(k, (this._map.get(k) || '') + v); }
  toString() { return Array.from(this._map).map(([k,v]) => k + '=' + v).join('&'); }
  forEach() {}
  entries() { return this._map.entries(); }
  keys() { return this._map.keys(); }
  values() { return this._map.values(); }
}

const ctx = {
  document: doc,
  window: {
    addEventListener: ()=>{}, removeEventListener: ()=>{}, scrollTo: ()=>{}, scrollBy: ()=>{}, scrollY: 0, scrollX: 0,
    AudioContext: function() { this.state = 'running'; this.resume = ()=>{}; this.suspend = ()=>{}; this.close = ()=>{}; this.currentTime = 0; this.createGain = ()=>({ gain: { value: 0, setValueAtTime: ()=>{}, linearRampToValueAtTime: ()=>{}, exponentialRampToValueAtTime: ()=>{} }, connect: ()=>{} }); this.createOscillator = ()=>({ connect: ()=>{}, start: ()=>{}, stop: ()=>{}, frequency: { value: 0, setValueAtTime: ()=>{} }, type: 'sine' }); this.createBuffer = (c, l, r) => ({ numberOfChannels: c, length: l, sampleRate: r, getChannelData: ()=>new Float32Array(l) }); this.createBufferSource = ()=>({ connect: ()=>{}, start: ()=>{}, buffer: null, playbackRate: { value: 1 } }); this.createBiquadFilter = ()=>({ connect: ()=>{}, frequency: { value: 0, setValueAtTime: ()=>{} }, Q: { value: 0 }, type: 'lowpass' }); this.destination = {}; },
    speechSynthesis: { speak: ()=>{}, cancel: ()=>{}, getVoices: ()=>[] },
    SpeechSynthesisUtterance: function(t) { this.text = t; this.lang = 'zh-CN'; this.rate = 1; this.pitch = 1; this.volume = 1; },
    Notification: { permission: 'default', requestPermission: ()=>Promise.resolve('default') },
    location: { search: '', href: '', protocol: 'https:', host: 'localhost', pathname: '/', hash: '' },
    navigator: { serviceWorker: { register: ()=>Promise.resolve({}) }, userAgent: 'Mozilla/5.0', language: 'zh-CN', onLine: true },
    history: { pushState: ()=>{}, replaceState: ()=>{}, back: ()=>{} },
    screen: { width: 375, height: 812 },
    innerWidth: 375, innerHeight: 812, devicePixelRatio: 2,
    open: ()=>null, close: ()=>{}, alert: ()=>{}, confirm: ()=>true, prompt: ()=>null,
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: ()=>{},
    btoa: (s) => Buffer.from(s).toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString(),
    URL: { createObjectURL: ()=>'blob:mock', revokeObjectURL: ()=>{} },
    Blob: class { constructor(){} },
    EventSource: class { constructor(){} },
    WebSocket: class { constructor(){} },
    Worker: class { constructor(){} },
    XMLHttpRequest: class { constructor(){} open(){} send(){} setRequestHeader(){} },
    performance: { now: ()=>Date.now() },
    matchMedia: ()=>({ matches: false }),
    crypto: { getRandomValues: (arr) => { for(let i=0;i<arr.length;i++) arr[i]=Math.floor(Math.random()*256); return arr; } },
    fetch: ()=>Promise.resolve({ json: ()=>Promise.resolve({}), text: ()=>Promise.resolve(''), ok: true, status: 200 }),
    Headers: class { constructor(){} },
    Request: class { constructor(){} },
    Response: class { constructor(){} },
    FormData: class { constructor(){} },
    indexedDB: { open: ()=>({ onsuccess: ()=>{}, onerror: ()=>{} }) },
    sessionStorage: { getItem: ()=>null, setItem: ()=>{}, removeItem: ()=>{}, clear: ()=>{} },
    localStorage: { getItem: ()=>null, setItem: ()=>{}, removeItem: ()=>{}, clear: ()=>{}, length: 0, key: ()=>null },
    URLSearchParams: URLSearchParamsMock,
    document: doc,
    console: console,
    setTimeout: (f, t) => { if (typeof f === 'function') f(); return 0; },
    setInterval: ()=>0,
    clearTimeout: ()=>{}, clearInterval: ()=>{},
    eval: eval,
    Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number, Boolean: Boolean, RegExp: RegExp, Error: Error, TypeError: TypeError, RangeError: RangeError, SyntaxError: SyntaxError, ReferenceError: ReferenceError, URIError: URIError, EvalError: EvalError, Promise: Promise, Symbol: Symbol, Map: Map, Set: Set, WeakMap: WeakMap, WeakSet: WeakSet, Proxy: Proxy, Reflect: Reflect, BigInt: BigInt, Intl: Intl, DataView: DataView, ArrayBuffer: ArrayBuffer, Float32Array: Float32Array, Float64Array: Float64Array, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Uint8ClampedArray: Uint8ClampedArray, BigInt64Array: BigInt64Array, BigUint64Array: BigUint64Array, SharedArrayBuffer: SharedArrayBuffer, Atomics: Atomics,
    parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite,
    encodeURI: encodeURI, encodeURIComponent: encodeURIComponent, decodeURI: decodeURI, decodeURIComponent: decodeURIComponent, escape: escape, unescape: unescape, undefined: undefined, Infinity: Infinity, NaN: NaN, this: undefined,
  },
  localStorage: { getItem: ()=>null, setItem: ()=>{}, removeItem: ()=>{}, clear: ()=>{}, length: 0, key: ()=>null },
  navigator: { serviceWorker: { register: ()=>Promise.resolve({}) }, userAgent: 'Mozilla/5.0', language: 'zh-CN', onLine: true },
  fetch: ()=>Promise.resolve({ json: ()=>Promise.resolve({}), text: ()=>Promise.resolve(''), ok: true, status: 200 }),
  eval: eval,
  Math: Math, Date: Date, JSON: JSON, Object: Object, Array: Array, String: String, Number: Number, Boolean: Boolean, RegExp: RegExp, Error: Error, TypeError: TypeError, RangeError: RangeError, SyntaxError: SyntaxError, ReferenceError: ReferenceError, URIError: URIError, EvalError: EvalError, Promise: Promise, Symbol: Symbol, Map: Map, Set: Set, WeakMap: WeakMap, WeakSet: WeakSet, Proxy: Proxy, Reflect: Reflect, BigInt: BigInt, Intl: Intl, DataView: DataView, ArrayBuffer: ArrayBuffer, Float32Array: Float32Array, Float64Array: Float64Array, Int8Array: Int8Array, Int16Array: Int16Array, Int32Array: Int32Array, Uint8Array: Uint8Array, Uint16Array: Uint16Array, Uint32Array: Uint32Array, Uint8ClampedArray: Uint8ClampedArray, BigInt64Array: BigInt64Array, BigUint64Array: BigUint64Array, SharedArrayBuffer: SharedArrayBuffer, Atomics: Atomics,
  parseInt: parseInt, parseFloat: parseFloat, isNaN: isNaN, isFinite: isFinite,
  encodeURI: encodeURI, encodeURIComponent: encodeURIComponent, decodeURI: decodeURI, decodeURIComponent: decodeURIComponent, escape: escape, unescape: unescape, undefined: undefined, Infinity: Infinity, NaN: NaN, this: undefined,
  console: console,
  setTimeout: (f, t) => { if (typeof f === 'function') f(); return 0; },
  setInterval: ()=>0,
  clearTimeout: ()=>{}, clearInterval: ()=>{},
};

// Ensure global variables are available
ctx.location = ctx.window.location;
ctx.URLSearchParams = URLSearchParamsMock;
ctx.window.URLSearchParams = URLSearchParamsMock;
ctx.Notification = ctx.window.Notification;

const vm = require('vm');
const scriptBlocks = html.match(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g);
let errors = [];

for (let i = 0; i < scriptBlocks.length; i++) {
  const code = scriptBlocks[i].replace(/<script[^>]*>|<\/script>/g, '');
  try {
    vm.runInContext(code, vm.createContext(ctx), { timeout: 15000 });
    console.log('Block ' + (i + 1) + ': OK');
  } catch (e) {
    console.log('Block ' + (i + 1) + ': CRASH - ' + e.message);
    errors.push({ block: i + 1, msg: e.message });
  }
}

console.log('\nTotal errors: ' + errors.length);
if (errors.length > 0) {
  console.log('\nError details:');
  errors.forEach(e => console.log('  Block ' + e.block + ': ' + e.msg));
}

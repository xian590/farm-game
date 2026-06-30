const fs = require('fs');
const content = fs.readFileSync('script_extracted.js', 'utf8');
const lines = content.split('\n');

// Replace line 11440 (0-indexed: 11439) with the correct function declaration
lines[11439] = 'function prepareField(fieldIdx) {';
const fixed = lines.join('\n');

console.log('Original line 11440:', JSON.stringify(content.split('\n')[11439]));
console.log('Fixed line 11440:', JSON.stringify(lines[11439]));

try {
  new Function(fixed);
  console.log('new Function after fix: OK');
} catch (e) {
  console.log('new Function after fix: FAILED -', e.message);
}

try {
  eval(fixed);
  console.log('eval after fix: OK');
} catch (e) {
  console.log('eval after fix: FAILED -', e.message);
}

// Also check if initGame is defined in the fixed script
const vm = require('vm');
const ctx = vm.createContext({
  window: {},
  document: {},
  console: { log: () => {}, error: () => {} },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {},
  clearTimeout: () => {},
  alert: () => {},
  confirm: () => true,
  prompt: () => '',
  fetch: () => Promise.resolve(),
  requestAnimationFrame: () => {},
  cancelAnimationFrame: () => {},
  location: { href: '' },
  navigator: { userAgent: '' },
  Math: Math,
  Date: Date,
  JSON: JSON,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  RegExp: RegExp,
  Error: Error,
  Promise: Promise,
  parseInt: parseInt,
  parseFloat: parseFloat,
  isNaN: isNaN,
  isFinite: isFinite,
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  encodeURI: encodeURI,
  decodeURI: decodeURI,
  escape: escape,
  unescape: unescape,
  btoa: btoa,
  atob: atob,
  AudioContext: function() {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  KeyboardEvent: function() {},
  MouseEvent: function() {},
  Event: function() {},
  CustomEvent: function() {},
  MutationObserver: function() {},
  IntersectionObserver: function() {},
  ResizeObserver: function() {},
  performance: { now: () => Date.now() },
  screen: {},
  innerWidth: 1024,
  innerHeight: 768,
  scrollX: 0,
  scrollY: 0,
  pageXOffset: 0,
  pageYOffset: 0,
  devicePixelRatio: 1,
  visualViewport: { width: 1024, height: 768 }
});

try {
  vm.runInNewContext(fixed, ctx, { timeout: 5000 });
  console.log('typeof initGame in context:', typeof ctx.initGame);
  console.log('typeof initGame:', typeof ctx.initGame);
} catch (e) {
  console.log('vm.runInNewContext FAILED:', e.message);
}

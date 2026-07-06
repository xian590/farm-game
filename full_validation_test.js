const vm = require('vm');
const fs = require('fs');

// ============================================
// 星愿花园 v6.4 完整验证流程 v2
// 动态提取实际函数，vm 内执行检查
// ============================================

const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];

// 提取所有 script 代码
let allScript = '';
scripts.forEach((s, i) => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

console.log('========================================');
console.log('  星愿花园 v6.4 完整验证流程 v2');
console.log('========================================');

const results = { passed: 0, failed: 0, errors: [] };
function pass(msg) { results.passed++; }
function fail(msg) { results.failed++; results.errors.push(msg); }

// ===== P0: 脚本语法检查 =====
console.log('\n--- P0: 脚本语法检查 ---');
for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    new Function(code);
    console.log('✅ Block ' + (i+1) + ' 语法 OK');
    pass('Block ' + (i+1) + ' 语法');
  } catch (e) {
    console.log('❌ Block ' + (i+1) + ' 语法 FAIL: ' + e.message);
    fail('Block ' + (i+1) + ' 语法: ' + e.message);
  }
}

// ===== P1: 函数定义 vs onclick 引用检查 =====
console.log('\n--- P1: 函数定义完整性 ---');

// 从脚本中提取所有函数定义
const functionDefs = new Set();
const fnRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
let match;
while ((match = fnRegex.exec(allScript)) !== null) {
  functionDefs.add(match[1]);
}

// 还有 const/let/var fn = function 或箭头函数
const arrowRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function\s*\(|\([^)]*\)\s*=>)/g;
while ((match = arrowRegex.exec(allScript)) !== null) {
  functionDefs.add(match[1]);
}

console.log('代码中定义函数数: ' + functionDefs.size);

// 从 HTML 中提取所有 onclick 引用的函数名
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const jsClickMatches = allScript.match(/onclick\s*=\s*['"]([^'"]*)['"]/g) || [];

const referencedFns = new Set();
function extractFnNames(str) {
  const matches = str.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  return matches.map(m => m.replace('(', '').trim());
}
[...onclickMatches, ...jsClickMatches].forEach(m => {
  extractFnNames(m).forEach(fn => referencedFns.add(fn));
});

// 排除已知全局对象
const knownGlobals = new Set(['console', 'localStorage', 'document', 'window', 'alert', 
  'confirm', 'prompt', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Math', 
  'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'isNaN', 
  'encodeURIComponent', 'decodeURIComponent', 'URL', 'fetch', 'navigator', 'location', 
  'history', 'screen', 'scrollTo', 'scrollBy', 'open', 'close', 'print', 'atob', 'btoa', 
  'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'speechSynthesis', 
  'Notification', 'Audio', 'Image', 'caches', 'indexedDB', 'Intl', 'this', 'true', 'false', 
  'null', 'undefined', 'typeof', 'new', 'return', 'if', 'else', 'for', 'while', 'switch', 
  'case', 'break', 'continue', 'try', 'catch', 'throw', 'finally', 'function', 'var', 'let', 
  'const', 'class', 'extends', 'super', 'import', 'export', 'default', 'async', 'await',
  'void', 'delete', 'in', 'instanceof', 'of', 'map', 'filter', 'reduce', 'forEach', 'concat',
  'join', 'split', 'slice', 'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'indexOf',
  'includes', 'find', 'findIndex', 'some', 'every', 'keys', 'values', 'entries', 'from',
  'String', 'fromCharCode', 'now', 'floor', 'ceil', 'round', 'abs', 'max', 'min', 'random',
  'pow', 'sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'PI', 'E', 'isFinite', 'isInteger',
  'hasOwnProperty', 'toString', 'valueOf', 'toFixed', 'toPrecision', 'toUpperCase', 'toLowerCase',
  'trim', 'replace', 'match', 'search', 'substring', 'substr', 'charAt', 'charCodeAt', 'split',
  'slice', 'indexOf', 'lastIndexOf', 'startsWith', 'endsWith', 'includes', 'repeat', 'padStart',
  'padEnd', 'trimStart', 'trimEnd', 'parse', 'stringify', 'setItem', 'getItem', 'removeItem',
  'clear', 'getElementById', 'querySelector', 'querySelectorAll', 'createElement', 'appendChild',
  'removeChild', 'insertBefore', 'replaceChild', 'cloneNode', 'addEventListener', 'removeEventListener',
  'dispatchEvent', 'preventDefault', 'stopPropagation', 'getAttribute', 'setAttribute', 'removeAttribute',
  'hasAttribute', 'getBoundingClientRect', 'classList', 'style', 'innerHTML', 'textContent', 'value',
  'focus', 'blur', 'click', 'submit', 'reset', 'select', 'play', 'pause', 'currentTime', 'volume',
  'muted', 'loop', 'playbackRate', 'duration', 'paused', 'ended', 'readyState', 'networkState',
  'error', 'src', 'preload', 'autoplay', 'controls', 'poster', 'width', 'height', 'naturalWidth',
  'naturalHeight', 'complete', 'add', 'remove', 'toggle', 'contains', 'item', 'length', 'parentNode',
  'nextSibling', 'previousSibling', 'firstChild', 'lastChild', 'childNodes', 'children', 'tagName',
  'id', 'className', 'href', 'src', 'alt', 'title', 'name', 'type', 'checked', 'disabled', 'selected',
  'options', 'selectedIndex', 'multiple', 'size', 'action', 'method', 'target', 'enctype', 'acceptCharset',
  'noValidate', 'form', 'labels', 'validity', 'validationMessage', 'willValidate', 'checkValidity',
  'setCustomValidity', 'reportValidity', 'reset', 'select', 'setSelectionRange', 'setRangeText',
  'selectionStart', 'selectionEnd', 'selectionDirection', 'labels', 'control', 'form', 'validity',
  'willValidate', 'validationMessage', 'checkValidity', 'setCustomValidity', 'reportValidity',
  'stepUp', 'stepDown', 'showPicker', 'files', 'webkitEntries', 'directory', 'accept', 'capture',
  'multiple', 'required', 'readOnly', 'placeholder', 'pattern', 'min', 'max', 'minLength', 'maxLength',
  'size', 'step', 'defaultValue', 'defaultChecked', 'formAction', 'formEnctype', 'formMethod',
  'formNoValidate', 'formTarget', 'indeterminate', 'labels', 'control', 'form', 'validity', 'willValidate',
  'validationMessage', 'checkValidity', 'setCustomValidity', 'reportValidity', 'options', 'length',
  'selectedIndex', 'selectedOptions', 'multiple', 'size', 'required', 'add', 'remove', 'item', 'namedItem',
  'setCustomValidity', 'checkValidity', 'reportValidity', 'willValidate', 'validity', 'validationMessage',
  'labels', 'control', 'form', 'selected', 'defaultSelected', 'index', 'text', 'label', 'disabled',
  'value', 'form', 'name', 'type', 'checked', 'defaultChecked', 'indeterminate', 'labels', 'control',
  'validity', 'willValidate', 'validationMessage', 'checkValidity', 'setCustomValidity', 'reportValidity',
  'stepUp', 'stepDown', 'showPicker', 'start', 'end', 'duration', 'loop', 'controls', 'volume',
  'muted', 'playbackRate', 'defaultPlaybackRate', 'preservePitch', 'autoplay', 'preload', 'src',
  'srcObject', 'crossOrigin', 'networkState', 'readyState', 'buffered', 'seekable', 'played',
  'seeking', 'currentTime', 'duration', 'paused', 'ended', 'autoplay', 'loop', 'controls', 'volume',
  'muted', 'defaultMuted', 'audioTracks', 'videoTracks', 'textTracks', 'width', 'height',
  'videoWidth', 'videoHeight', 'poster', 'playsInline', 'disablePictureInPicture', 'disableRemotePlayback',
  'getStartDate', 'getVideoPlaybackQuality', 'cancelVideoFrameCallback', 'requestVideoFrameCallback',
  'captureStream', 'requestPictureInPicture', 'setSinkId', 'getCapabilities', 'getConstraints',
  'getSettings', 'getTracks', 'getTrackById', 'addTrack', 'removeTrack', 'clone', 'getAudioTracks',
  'getVideoTracks', 'active', 'onaddtrack', 'onremovetrack', 'getAttribute', 'setAttribute', 'removeAttribute',
  'hasAttribute', 'hasAttributes', 'getAttributeNode', 'setAttributeNode', 'removeAttributeNode',
  'getAttributeNodeNS', 'setAttributeNodeNS', 'removeAttributeNodeNS', 'getElementsByTagName',
  'getElementsByTagNameNS', 'getElementsByClassName', 'querySelector', 'querySelectorAll', 'matches',
  'closest', 'insertAdjacentElement', 'insertAdjacentHTML', 'insertAdjacentText', 'before', 'after',
  'replaceWith', 'remove', 'prepend', 'append', 'replaceChildren', 'animate', 'getAnimations', 'attachShadow',
  'createShadowRoot', 'getRootNode', 'composedPath', 'assignedSlot', 'slot', 'shadowRoot', 'part',
  'elementTiming', 'onfullscreenchange', 'onfullscreenerror', 'requestFullscreen', 'exitFullscreen',
  'getBoundingClientRect', 'getClientRects', 'scrollIntoView', 'scrollIntoViewIfNeeded', 'scroll',
  'scrollTo', 'scrollBy', 'createTextRange', 'contains', 'compareDocumentPosition', 'isSameNode',
  'isEqualNode', 'lookupPrefix', 'lookupNamespaceURI', 'isDefaultNamespace', 'insertBefore', 'replaceChild',
  'removeChild', 'appendChild', 'hasChildNodes', 'cloneNode', 'normalize', 'splitText', 'wholeText',
  'substringData', 'appendData', 'insertData', 'deleteData', 'replaceData', 'before', 'after', 'replaceWith',
  'remove', 'nextElementSibling', 'previousElementSibling', 'childElementCount', 'firstElementChild',
  'lastElementChild', 'children', 'getAttribute', 'setAttribute', 'removeAttribute', 'hasAttribute',
  'hasAttributes', 'getAttributeNode', 'setAttributeNode', 'removeAttributeNode', 'getAttributeNodeNS',
  'setAttributeNodeNS', 'removeAttributeNodeNS', 'getElementsByTagName', 'getElementsByTagNameNS',
  'getElementsByClassName', 'querySelector', 'querySelectorAll', 'matches', 'closest', 'insertAdjacentElement',
  'insertAdjacentHTML', 'insertAdjacentText', 'before', 'after', 'replaceWith', 'remove', 'prepend', 'append',
  'replaceChildren', 'animate', 'getAnimations', 'attachShadow', 'createShadowRoot', 'getRootNode',
  'composedPath', 'assignedSlot', 'slot', 'shadowRoot', 'part', 'elementTiming', 'onfullscreenchange',
  'onfullscreenerror', 'requestFullscreen', 'exitFullscreen', 'getBoundingClientRect', 'getClientRects',
  'scrollIntoView', 'scrollIntoViewIfNeeded', 'scroll', 'scrollTo', 'scrollBy', 'createTextRange', 'contains',
  'compareDocumentPosition', 'isSameNode', 'isEqualNode', 'lookupPrefix', 'lookupNamespaceURI',
  'isDefaultNamespace', 'insertBefore', 'replaceChild', 'removeChild', 'appendChild', 'hasChildNodes',
  'cloneNode', 'normalize', 'splitText', 'wholeText', 'substringData', 'appendData', 'insertData',
  'deleteData', 'replaceData', 'before', 'after', 'replaceWith', 'remove', 'nextElementSibling',
  'previousElementSibling', 'childElementCount', 'firstElementChild', 'lastElementChild', 'children']);

const missingOnclickFns = [];
for (const fn of referencedFns) {
  if (!functionDefs.has(fn) && !knownGlobals.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
    missingOnclickFns.push(fn);
  }
}

if (missingOnclickFns.length === 0) {
  console.log('✅ 所有 onclick 引用的函数都已定义（' + referencedFns.size + ' 个引用）');
  pass('onclick 函数完整性');
} else {
  console.log('❌ onclick 缺失函数: ' + missingOnclickFns.join(', '));
  fail('onclick 缺失函数: ' + missingOnclickFns.join(', '));
}

// ===== P2: 核心函数存在性（从代码动态提取）=====
console.log('\n--- P2: 核心函数存在性（实际代码中）---');
const criticalFns = ['init', 'showPage', 'switchTab', 'loadState', 'saveState', 'goHome', 'goBack',
  'openModule', 'showModal', 'hideModal', 'showToast', 'triggerConfetti', 'playSound', 'speak',
  'startTest', 'renderTestQ', 'selectTestOpt', 'nextTestQ', 'drawTarot', 'startTutorial',
  'nextTutorialStep', 'skipTutorial', 'finishTutorial', 'startWelcomeTest', 'enterIslandFromTest',
  'addVipNavEntry', 'addVipToMePage', 'updateHomeStats', 'checkDailyReset', 'checkReminders',
  'updateTimeAndWeather', 'updateFortuneCard', 'renderSmartRecommendations', 'renderHeatmap',
  'getSmartRecommendations', 'getUnlockedBadges', 'getBadgeProgress', 'checkNewBadges', 'renderBadgeWall',
  'renderSearchResults', 'onSearchInput', 'initSearch', 'renderAudioScenes', 'startAudioScene',
  'updateSatsTimerDisplay', 'startSatsTimer', 'pauseSatsTimer', 'resetSatsTimer', 'onEmotionSlide',
  'saveEmotionNote', 'selectTarotSpread', 'selectTarotCat', 'renderTarot', 'updateNickname',
  'toggleDarkMode', 'showFeedbackModal', 'openCrystalPage', 'openAffirmCollection', 'openCardCollection',
  'openBadgeWall', 'openSearch', 'initReports', 'renderMonthlyReport', 'renderYearlySummary',
  'loadReportData', 'renderCommunityFeed', 'renderVoiceRecordings', 'stopSleepStory',
  'startBreathe', 'stopBreathe', 'loadAiHistory', 'renderAiChat', 'loadStories', 'renderStories',
  'renderMovies', 'initVip', 'initEmotion', 'initSp', 'initWealth', 'initMovies', 'initAi',
  'initDreams', 'initStories', 'initSats', 'initBackup', 'initAudioPage', 'initBootcamp',
  'initBreathe', 'initVoice', 'initSleep', 'initHealth', 'initStats', 'initCleanup', 'initAbout',
  'renderDataOverview', 'exportData', 'importAllData', 'logDiet', 'openMentalDiet', 'createFireflies',
  'updateTopbar', 'updateGreeting', 'updateMoodDisplay', 'updateNavActive', 'getTodayStr',
  'showVoiceBubble', 'getDailyFortune', 'recalcHabitStreak', 'getLevel',
  'addWishProgress', 'newDiaryPrompt', 'recordMood', 'addPlacematTask'];

let missingCritical = 0;
for (const fn of criticalFns) {
  if (functionDefs.has(fn)) pass('函数存在: ' + fn);
  else { fail('函数缺失: ' + fn); missingCritical++; }
}

// ===== P3: showPage 目标页面检查 =====
console.log('\n--- P3: showPage 目标页面检查 ---');
const showPageMatches = allScript.match(/showPage\(['"]([\w-]+)['"]\)/g) || [];
const pageTargets = [...new Set(showPageMatches.map(m => m.match(/showPage\(['"]([\w-]+)['"]\)/)[1]))];
let missingPages = 0;
for (const name of pageTargets) {
  const hasPage = html.includes(`id="page-${name}"`) || html.includes(`id='page-${name}'`);
  if (hasPage) pass('page-' + name + ' 存在');
  else { fail('page-' + name + ' 缺失'); missingPages++; }
}

// ===== P4: ID 唯一性检查 =====
console.log('\n--- P4: ID 唯一性检查 ---');
const idMatches = html.match(/id="([^"]*)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]*)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
if (duplicateIds.length === 0) {
  console.log('✅ 所有 ID 唯一（' + ids.length + ' 个）');
  pass('ID 唯一性');
} else {
  duplicateIds.forEach(([k, v]) => {
    fail('重复 ID: ' + k + ' (' + v + ' 次)');
  });
}

// ===== P5: section 标签平衡 =====
console.log('\n--- P5: section 标签平衡 ---');
const htmlOnly = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const sectionOpen = (htmlOnly.match(/<section[\s>]/g) || []).length;
const sectionClose = (htmlOnly.match(/<\/section>/g) || []).length;
if (sectionOpen === sectionClose) {
  console.log('✅ section 标签平衡: ' + sectionOpen + '/' + sectionClose);
  pass('section 标签平衡');
} else {
  fail('section 不平衡: open=' + sectionOpen + ' close=' + sectionClose);
}

// ===== P6: vm 运行时验证（带完整 mock）=====
console.log('\n--- P6: vm 运行时验证 ---');

class MockElement {
  constructor(tag, id) {
    this.tagName = tag; this.id = id || '';
    this.className = '';
    this.classList = { _classes: new Set(), add(c) { this._classes.add(c); }, remove(c) { this._classes.delete(c); }, toggle(c, f) { if (f || !this._classes.has(c)) this._classes.add(c); else this._classes.delete(c); }, contains(c) { return this._classes.has(c); } };
    this.style = { setProperty(k, v) { this[k] = v; } };
    this.children = []; this.parentNode = null; this._attrs = {}; this._events = {};
    this._text = ''; this._html = ''; this._value = '';
  }
  get value() { return this._value; }
  set value(v) { this._value = String(v); }
  get textContent() { return this._text; }
  set textContent(t) { this._text = String(t); }
  get innerHTML() { return this._html; }
  set innerHTML(h) { this._html = String(h); }
  getAttribute(n) { return this._attrs[n] || null; }
  setAttribute(n, v) { this._attrs[n] = String(v); }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
  insertBefore(newNode, refNode) {
    if (refNode && !this.children.includes(refNode)) throw new Error('insertBefore: refNode not child');
    const idx = refNode ? this.children.indexOf(refNode) : this.children.length;
    this.children.splice(idx, 0, newNode); newNode.parentNode = this; return newNode;
  }
  removeChild(c) { const idx = this.children.indexOf(c); if (idx >= 0) this.children.splice(idx, 1); c.parentNode = null; return c; }
  querySelector(sel) {
    if (sel.startsWith('#') && this.id === sel.slice(1)) return this;
    if (sel.startsWith('.') && this.classList._classes.has(sel.slice(1))) return this;
    for (const c of this.children) { const r = c.querySelector(sel); if (r) return r; }
    return null;
  }
  querySelectorAll(sel) {
    let r = [];
    if (sel.startsWith('#') && this.id === sel.slice(1)) r.push(this);
    if (sel.startsWith('.') && this.classList._classes.has(sel.slice(1))) r.push(this);
    for (const c of this.children) r = r.concat(c.querySelectorAll(sel));
    return r;
  }
  addEventListener() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 50 }; }
  focus() {}
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
}

class MockDocument {
  constructor() {
    this._elements = {};
    this.documentElement = new MockElement('html');
    this.body = new MockElement('body');
    this.documentElement.appendChild(this.body);
  }
  getElementById(id) { if (!this._elements[id]) this._elements[id] = new MockElement('div', id); return this._elements[id]; }
  querySelector(sel) { if (sel.startsWith('#')) return this.getElementById(sel.slice(1)); return this.body.querySelector(sel); }
  querySelectorAll(sel) { if (sel.startsWith('#')) { const e = this.getElementById(sel.slice(1)); return e ? [e] : []; } return this.body.querySelectorAll(sel); }
  createElement(tag) { return new MockElement(tag); }
  createTextNode(t) { const e = new MockElement('span'); e.textContent = t; return e; }
  addEventListener() {}
}

class MockLS { constructor() { this._data = {}; } getItem(k) { return this._data[k] || null; } setItem(k, v) { this._data[k] = String(v); } removeItem(k) { delete this._data[k]; } }

class MockWindow {
  constructor() {
    this.location = { href: 'http://localhost:8765/' }; this.innerWidth = 375; this.innerHeight = 812;
    this.scrollTo = () => {}; this._listeners = {};
  }
  addEventListener(t, f) { if (!this._listeners[t]) this._listeners[t] = []; this._listeners[t].push(f); }
  setTimeout(f, d) { if (typeof f === 'function') f(); return 1; }
  setInterval(f, d) { return 1; }
  clearTimeout() {} clearInterval() {}
  getComputedStyle() { return {}; }
  open() { return null; }
  matchMedia() { return { matches: false, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} }; }
  requestAnimationFrame(f) { f(); }
}

const doc = new MockDocument();
const win = new MockWindow();
const ls = new MockLS();

const pageIds = ['page-welcome','page-island','page-me','page-tools','page-library','page-journal',
  'page-vip','page-search','page-reports','page-community','page-shop','page-coach',
  'page-emotion','page-sp','page-wealth','page-movies','page-ai','page-dreams','page-stories',
  'page-sats','page-backup','page-vip-plans','page-audio','page-bootcamp','page-breathe',
  'page-voice','page-sleep','page-health','page-stats','page-cleanup','page-about','page-temple',
  'page-tower','page-stars','page-cloud','page-persona','page-test','page-cbt','page-revision',
  'page-manifestation','page-habit','page-task','page-cosmic','page-item','page-wheel',
  'page-affirmation','page-purge','page-garden','page-mental-diet','page-quote','page-book',
  'page-movie','page-card','page-plan','page-challenge','page-daily','page-fortune','page-top',
  'page-crystal','page-growth','page-vision','page-soulmirror'];
pageIds.forEach(id => doc.getElementById(id));

['skeleton-screen','bottom-nav','nav-home','nav-tools','nav-library','nav-journal','nav-me',
 'fireflies-container','tutorial-overlay','tutorial-highlight','tutorial-bubble','test-modal',
 'daily-affirm-text','daily-affirm-text-2','sats-timer','sats-timer-main','emotion-marker',
 'emotion-marker-main','tarot-draw-area','tarot-cards-container','tarot-result','me-avatar',
 'me-nickname','me-level','smart-recommendations','habit-heatmap-wrapper','habit-name-input'].forEach(id => doc.getElementById(id));

const vmCtx = vm.createContext({
  document: doc, window: win, localStorage: ls,
  navigator: { language: 'zh-CN', userAgent: 'test' }, location: win.location,
  console: { log: () => {}, error: () => {}, warn: () => {}, info: () => {} },
  Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp, Error, Promise,
  setTimeout: (f, d) => win.setTimeout(f, d), setInterval: (f, d) => win.setInterval(f, d),
  clearTimeout: () => {}, clearInterval: () => {},
  alert: () => {}, confirm: () => true, prompt: () => null,
  fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
  URL: class URL { constructor(u) { this.href = u; } },
  URLSearchParams: class { constructor() { } get() { return null; } },
  history: { pushState: () => {}, replaceState: () => {} },
  requestAnimationFrame: (f) => f(),
  speechSynthesis: { speak: () => {}, cancel: () => {} },
  SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
  Notification: { permission: 'default', requestPermission: () => Promise.resolve('default') },
  Audio: class { play() { return Promise.resolve(); } pause() {} },
  Image: class {},
  Intl: { DateTimeFormat: class { format() { return ''; } }, NumberFormat: class { format() { return ''; } } },
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  caches: { open: () => Promise.resolve({ match: () => Promise.resolve(null), put: () => Promise.resolve() }) },
  indexedDB: { open: () => ({ onsuccess: () => {}, onerror: () => {} }) },
  open: () => null,
});

// 执行所有 blocks
for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    vm.runInContext(code, vmCtx, { timeout: 30000 });
  } catch (e) {
    console.log('❌ Block ' + (i+1) + ' 运行时失败: ' + e.message);
    fail('Block ' + (i+1) + ' 运行时: ' + e.message);
  }
}

// vm 内检查关键变量
const stateExists = vm.runInContext('typeof state !== "undefined"', vmCtx);
const defaultStateExists = vm.runInContext('typeof DEFAULT_STATE !== "undefined"', vmCtx);
const initExists = vm.runInContext('typeof init === "function"', vmCtx);

if (stateExists) { console.log('✅ state 变量已定义'); pass('state 变量'); }
else { console.log('❌ state 变量未定义'); fail('state 变量未定义'); }

if (defaultStateExists) { console.log('✅ DEFAULT_STATE 已定义'); pass('DEFAULT_STATE'); }
else { console.log('❌ DEFAULT_STATE 未定义'); fail('DEFAULT_STATE 未定义'); }

if (initExists) { console.log('✅ init() 函数存在'); pass('init() 函数'); }
else { console.log('❌ init() 函数不存在'); fail('init() 函数不存在'); }

// 测试 init() 执行
if (initExists) {
  try {
    vm.runInContext('init()', vmCtx);
    console.log('✅ init() 执行成功');
    pass('init() 执行');
  } catch (e) {
    console.log('❌ init() 执行失败: ' + e.message);
    fail('init() 执行: ' + e.message);
  }
}

// 测试 showPage
const showPageExists = vm.runInContext('typeof showPage === "function"', vmCtx);
if (showPageExists) {
  try {
    vm.runInContext('showPage("me")', vmCtx);
    console.log('✅ showPage("me") 执行成功');
    pass('showPage("me")');
  } catch (e) {
    console.log('❌ showPage("me") 失败: ' + e.message);
    fail('showPage("me"): ' + e.message);
  }
}

// 测试 switchTab
const switchTabExists = vm.runInContext('typeof switchTab === "function"', vmCtx);
if (switchTabExists) {
  try {
    vm.runInContext('switchTab("island")', vmCtx);
    vm.runInContext('switchTab("tools")', vmCtx);
    vm.runInContext('switchTab("library")', vmCtx);
    vm.runInContext('switchTab("journal")', vmCtx);
    vm.runInContext('switchTab("me")', vmCtx);
    console.log('✅ 5个主tab切换全部成功');
    pass('5个主tab切换');
  } catch (e) {
    console.log('❌ switchTab 失败: ' + e.message);
    fail('switchTab: ' + e.message);
  }
}

// 测试 addVipNavEntry 和 addVipToMePage 无 insertBefore 错误
const vipNavExists = vm.runInContext('typeof addVipNavEntry === "function"', vmCtx);
if (vipNavExists) {
  try {
    vm.runInContext('addVipNavEntry()', vmCtx);
    console.log('✅ addVipNavEntry() 无 insertBefore 错误');
    pass('addVipNavEntry 安全');
  } catch (e) {
    console.log('❌ addVipNavEntry() 错误: ' + e.message);
    fail('addVipNavEntry: ' + e.message);
  }
}

const vipMeExists = vm.runInContext('typeof addVipToMePage === "function"', vmCtx);
if (vipMeExists) {
  try {
    vm.runInContext('addVipToMePage()', vmCtx);
    console.log('✅ addVipToMePage() 无 insertBefore 错误');
    pass('addVipToMePage 安全');
  } catch (e) {
    console.log('❌ addVipToMePage() 错误: ' + e.message);
    fail('addVipToMePage: ' + e.message);
  }
}

// 测试 startWelcomeTest 和 startTutorial
const welcomeTestExists = vm.runInContext('typeof startWelcomeTest === "function"', vmCtx);
if (welcomeTestExists) {
  try {
    vm.runInContext('startWelcomeTest()', vmCtx);
    console.log('✅ startWelcomeTest() 执行成功');
    pass('startWelcomeTest');
  } catch (e) {
    console.log('❌ startWelcomeTest() 失败: ' + e.message);
    fail('startWelcomeTest: ' + e.message);
  }
}

const tutorialExists = vm.runInContext('typeof startTutorial === "function"', vmCtx);
if (tutorialExists) {
  try {
    vm.runInContext('startTutorial()', vmCtx);
    console.log('✅ startTutorial() 执行成功');
    pass('startTutorial');
  } catch (e) {
    console.log('❌ startTutorial() 失败: ' + e.message);
    fail('startTutorial: ' + e.message);
  }
}

// 测试核心交互函数
const coreFns = ['addWishProgress', 'newDiaryPrompt', 'recordMood', 'addHabit', 'addPlacematTask', 'saveState'];
for (const fn of coreFns) {
  const exists = vm.runInContext('typeof ' + fn + ' === "function"', vmCtx);
  if (exists) {
    try {
      vm.runInContext(fn + '()', vmCtx);
      pass(fn + '() 执行');
    } catch (e) {
      fail(fn + '() 执行: ' + e.message);
    }
  } else {
    fail(fn + '() 不存在');
  }
}

// ===== 测试报告 =====
console.log('\n========================================');
console.log('  验证报告');
console.log('========================================');
console.log('通过: ' + results.passed + ' 项');
console.log('失败: ' + results.failed + ' 项');
console.log('总计: ' + (results.passed + results.failed) + ' 项');
console.log('通过率: ' + Math.round(results.passed / (results.passed + results.failed) * 100) + '%');
if (results.failed === 0) {
  console.log('✅ 全部通过！');
} else {
  console.log('❌ 失败项：');
  results.errors.forEach((e, i) => console.log('  ' + (i+1) + '. ' + e));
}
console.log('========================================');

process.exit(results.failed === 0 ? 0 : 1);

const vm = require('vm');
const fs = require('fs');

// 更完善的 DOM mock，支持页面切换
class MockElement {
  constructor(tag, id) {
    this.tagName = tag;
    this.id = id || '';
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      toggle: function(c, force) { if (force || !this._classes.has(c)) this._classes.add(c); else this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); }
    };
    this.style = { setProperty: function(k, v) { this[k] = v; } };
    this.children = [];
    this.parentNode = null;
    this._attrs = {};
    this._events = {};
  }
  getAttribute(name) { return this._attrs[name] || null; }
  setAttribute(name, val) { this._attrs[name] = String(val); }
  removeAttribute(name) { delete this._attrs[name]; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  insertBefore(newNode, refNode) {
    if (refNode && !this.children.includes(refNode)) {
      throw new Error('insertBefore: refNode is not a child of this node');
    }
    const idx = refNode ? this.children.indexOf(refNode) : this.children.length;
    this.children.splice(idx, 0, newNode);
    newNode.parentNode = this;
    return newNode;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }
  querySelector(sel) {
    // 简单匹配
    if (sel.startsWith('#') && this.id === sel.slice(1)) return this;
    if (sel.startsWith('.') && this.classList._classes.has(sel.slice(1))) return this;
    if (sel === this.tagName.toLowerCase()) return this;
    for (const c of this.children) {
      const r = c.querySelector(sel);
      if (r) return r;
    }
    return null;
  }
  querySelectorAll(sel) {
    let results = [];
    if (sel.startsWith('#') && this.id === sel.slice(1)) results.push(this);
    if (sel.startsWith('.') && this.classList._classes.has(sel.slice(1))) results.push(this);
    if (sel === this.tagName.toLowerCase()) results.push(this);
    for (const c of this.children) {
      results = results.concat(c.querySelectorAll(sel));
    }
    return results;
  }
  addEventListener(type, fn) {
    if (!this._events[type]) this._events[type] = [];
    this._events[type].push(fn);
  }
  dispatchEvent(e) {
    (this._events[e.type] || []).forEach(fn => fn(e));
  }
  get textContent() { return this._text || ''; }
  set textContent(v) { this._text = v; }
  get innerHTML() { return this._html || ''; }
  set innerHTML(v) { this._html = v; }
  get value() { return this._value || ''; }
  set value(v) { this._value = v; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 50, right: 100, bottom: 50 }; }
  focus() {}
}

class MockDocument {
  constructor() {
    this._elements = {};
    this.documentElement = new MockElement('html');
    this.body = new MockElement('body');
    this.documentElement.appendChild(this.body);
  }
  getElementById(id) {
    if (!this._elements[id]) {
      this._elements[id] = new MockElement('div', id);
    }
    return this._elements[id];
  }
  querySelector(sel) {
    if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
    return this.body.querySelector(sel);
  }
  querySelectorAll(sel) {
    if (sel.startsWith('#')) {
      const el = this.getElementById(sel.slice(1));
      return el ? [el] : [];
    }
    return this.body.querySelectorAll(sel);
  }
  createElement(tag) { return new MockElement(tag); }
  createTextNode(text) { const el = new MockElement('span'); el.textContent = text; return el; }
  addEventListener() {}
}

class MockLocalStorage {
  constructor() { this._data = {}; }
  getItem(k) { return this._data[k] || null; }
  setItem(k, v) { this._data[k] = String(v); }
  removeItem(k) { delete this._data[k]; }
}

class MockWindow {
  constructor() {
    this.location = { href: 'http://localhost:8765/' };
    this.innerWidth = 375;
    this.innerHeight = 812;
    this.scrollTo = () => {};
    this._listeners = {};
    this._intervals = [];
    this._timeouts = [];
  }
  addEventListener(type, fn) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(fn);
  }
  setTimeout(fn, delay) { this._timeouts.push(fn); return this._timeouts.length; }
  setInterval(fn, delay) { this._intervals.push(fn); return this._intervals.length; }
  clearTimeout() {}
  clearInterval() {}
  getComputedStyle() { return {}; }
  open() { return null; }
  requestAnimationFrame(fn) { fn(); }
}

class MockSpeechSynthesis {
  speak() {}
  cancel() {}
}

class MockNotification {
  static permission = 'default';
  static requestPermission() { return Promise.resolve('default'); }
}

class MockURLSearchParams {
  constructor(str) { this._str = str || ''; }
  get(k) { return null; }
  set(k, v) {}
}

function runTest() {
  const html = fs.readFileSync('index-manifestation.html', 'utf8');
  const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
  
  const doc = new MockDocument();
  const win = new MockWindow();
  const ls = new MockLocalStorage();
  
  // 预创建所有 page 元素
  const pageIds = ['page-welcome', 'page-island', 'page-me', 'page-tools', 'page-library', 'page-journal',
    'page-vip', 'page-search', 'page-reports', 'page-community', 'page-shop', 'page-coach',
    'page-reports', 'page-emotion', 'page-sp', 'page-wealth', 'page-movies', 'page-ai',
    'page-dreams', 'page-stories', 'page-sats', 'page-backup', 'page-vip-plans', 'page-weekly',
    'page-community', 'page-audio', 'page-bootcamp', 'page-breathe', 'page-voice', 'page-sleep',
    'page-health', 'page-stats', 'page-cleanup', 'page-about', 'page-temple', 'page-tower',
    'page-stars', 'page-cloud', 'page-persona', 'page-test', 'page-cbt', 'page-sats',
    'page-revision', 'page-manifestation', 'page-habit', 'page-task', 'page-cosmic', 'page-item',
    'page-wheel', 'page-affirmation', 'page-purge', 'page-garden', 'page-mental-diet', 'page-quote',
    'page-book', 'page-movie', 'page-card', 'page-plan', 'page-challenge', 'page-daily',
    'page-fortune', 'page-top', 'page-crystal', 'page-growth', 'page-vision', 'page-soulmirror'];
  pageIds.forEach(id => doc.getElementById(id));
  
  // 其他常用元素
  ['skeleton-screen', 'fireflies-container', 'smart-recommendations', 'habit-heatmap-wrapper',
   'habit-heatmap', 'greeting-text', 'greeting-name', 'daily-affirm-text', 'mood-detail',
   'fortune-card', 'fortune-summary', 'fortune-color', 'fortune-number', 'test-content',
   'test-modal', 'tutorial-overlay', 'tutorial-highlight', 'tutorial-bubble', 'tutorial-emoji',
   'tutorial-title', 'tutorial-desc', 'tutorial-next-btn', 'me-avatar', 'me-nickname', 'me-level',
   'me-persona-name', 'me-energy', 'me-wishes', 'me-flowers', 'me-badges', 'me-persona-card',
   'bottom-nav', 'nav-home', 'nav-tools', 'nav-library', 'nav-journal', 'nav-me',
   'report-monthly', 'report-yearly', 'badge-wall', 'search-input', 'search-results',
   'audio-scenes', 'emotion-guide', 'lib-guide', 'guide-list', 'palace-level'].forEach(id => doc.getElementById(id));
  
  const ctx = {
    document: doc,
    window: win,
    localStorage: ls,
    navigator: { language: 'zh-CN', userAgent: 'test' },
    location: win.location,
    console: { log: () => {}, error: () => {}, warn: () => {}, info: () => {} },
    Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp, Error, Promise,
    setTimeout: (fn, d) => win.setTimeout(fn, d),
    setInterval: (fn, d) => win.setInterval(fn, d),
    clearTimeout: () => {}, clearInterval: () => {},
    alert: () => {}, confirm: () => true, prompt: () => null,
    fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
    URL: class URL { constructor(u) { this.href = u; } },
    URLSearchParams: MockURLSearchParams,
    history: { pushState: () => {}, replaceState: () => {} },
    requestAnimationFrame: (fn) => fn(),
    speechSynthesis: new MockSpeechSynthesis(),
    SpeechSynthesisUtterance: class { constructor(t) { this.text = t; } },
    Notification: MockNotification,
    Audio: class { play() { return Promise.resolve(); } pause() {} },
    Image: class {},
    Intl: { DateTimeFormat: class { format() { return ''; } }, NumberFormat: class { format() { return ''; } } },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    caches: { open: () => Promise.resolve({ match: () => Promise.resolve(null), put: () => Promise.resolve() }) },
    indexedDB: { open: () => ({ onsuccess: () => {}, onerror: () => {} }) },
    open: () => null,
  };
  
  // 共享上下文
  const scriptCtx = vm.createContext(ctx);
  
  // 执行所有 script blocks
  let blockErrors = [];
  for (let i = 0; i < scripts.length; i++) {
    const code = scripts[i].replace(/<script>/g, '').replace(/<\/script>/g, '');
    try {
      vm.runInContext(code, scriptCtx, { timeout: 30000 });
      console.log(`Block ${i+1} OK`);
    } catch (e) {
      console.error(`Block ${i+1} FAIL: ${e.message}`);
      blockErrors.push({ block: i+1, error: e.message });
    }
  }
  
  if (blockErrors.length > 0) {
    console.log('\n=== 脚本加载错误 ===');
    blockErrors.forEach(e => console.error(`Block ${e.block}: ${e.error}`));
    return;
  }
  
  console.log('\n=== 测试交互功能 ===');
  
  // 测试1: switchTab('me')
  try {
    if (typeof ctx.switchTab === 'function') {
      ctx.switchTab('me');
      console.log('✅ switchTab("me") 执行成功');
    } else {
      console.log('❌ switchTab 函数未定义');
    }
  } catch (e) {
    console.error('❌ switchTab("me") 失败:', e.message);
  }
  
  // 测试2: showPage('me') 直接调用
  try {
    if (typeof ctx.showPage === 'function') {
      ctx.showPage('me');
      console.log('✅ showPage("me") 执行成功');
    } else {
      console.log('❌ showPage 函数未定义');
    }
  } catch (e) {
    console.error('❌ showPage("me") 失败:', e.message);
  }
  
  // 测试3: startWelcomeTest
  try {
    if (typeof ctx.startWelcomeTest === 'function') {
      ctx.startWelcomeTest();
      console.log('✅ startWelcomeTest() 执行成功');
    } else {
      console.log('❌ startWelcomeTest 函数未定义');
    }
  } catch (e) {
    console.error('❌ startWelcomeTest() 失败:', e.message);
  }
  
  // 测试4: startTutorial
  try {
    if (typeof ctx.startTutorial === 'function') {
      ctx.startTutorial();
      console.log('✅ startTutorial() 执行成功');
    } else {
      console.log('❌ startTutorial 函数未定义');
    }
  } catch (e) {
    console.error('❌ startTutorial() 失败:', e.message);
  }
  
  // 测试5: 检查 page-me 元素状态
  const mePage = doc.getElementById('page-me');
  if (mePage) {
    console.log(`page-me classList: ${[...mePage.classList._classes].join(', ')}`);
  }
  
  // 测试6: 检查缺失的函数
  const mePageFunctions = [
    'openCrystalPage', 'openAffirmCollection', 'openCardCollection', 'openBadgeWall',
    'openModule', 'showPage', 'initReports', 'showPage', 'renderCommunityFeed',
    'showPage', 'initVip', 'showPage', 'showPage', 'openSearch'
  ];
  
  console.log('\n=== page-me 相关函数检查 ===');
  mePageFunctions.forEach(fn => {
    if (typeof ctx[fn] === 'function') {
      console.log(`✅ ${fn} 存在`);
    } else {
      console.log(`❌ ${fn} 缺失`);
    }
  });
}

runTest();

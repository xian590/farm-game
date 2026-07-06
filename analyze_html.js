const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');

// 提取所有 script 代码
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
const scripts = [];
let m;
while ((m = scriptRegex.exec(html)) !== null) {
  scripts.push(m[1]);
}
let allScript = scripts.join('\n');

console.log('Script blocks found:', scripts.length);

// 1. 提取所有函数定义（多种方式）
const functionDefs = new Set();

// function name() 形式
const fnDeclRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
while ((m = fnDeclRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}

// const/let/var name = function() 形式
const fnAssignRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*\(/g;
while ((m = fnAssignRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}

// const/let/var name = () => 形式
const arrowRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*=>\s*\{|async\s*\([^)]*\)\s*=>)/g;
while ((m = arrowRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}

// name: function() 形式 (对象方法)
const objMethodRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(/g;
while ((m = objMethodRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}

console.log('Total functions defined:', functionDefs.size);

// 2. 检查关键函数是否存在
const criticalFns = [
  'renderBreathe', 'importData', 'renderFortune', 'checkStreak', 'updateStreak',
  'checkMastery', 'updateMastery', 'checkLevel', 'updateLevel',
  'addWish', 'addDiary', 'logEmotion', 'addHabit', 'addTask',
  'init', 'showPage', 'switchTab', 'loadState', 'saveState'
];

console.log('\n--- Critical function check ---');
for (const fn of criticalFns) {
  if (functionDefs.has(fn)) {
    console.log('✅', fn);
  } else {
    console.log('❌ MISSING:', fn);
  }
}

// 3. 检查 renderIslandX / updateIslandX 函数
console.log('\n--- renderIslandX / updateIslandX check ---');
const islandFns = [];
for (const fn of functionDefs) {
  if (fn.startsWith('renderIsland') || fn.startsWith('updateIsland')) {
    islandFns.push(fn);
  }
}
console.log('Found island functions:', islandFns.length);
islandFns.sort().forEach(fn => console.log('  ', fn));

// 4. 检查 onclick 引用的函数
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const referencedFns = new Set();
function extractFnNames(str) {
  const matches = str.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  return matches.map(m => m.replace('(', '').trim());
}
onclickMatches.forEach(m => {
  extractFnNames(m).forEach(fn => referencedFns.add(fn));
});

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
  'void', 'delete', 'in', 'instanceof', 'of']);

const missingOnclickFns = [];
for (const fn of referencedFns) {
  if (!functionDefs.has(fn) && !knownGlobals.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
    missingOnclickFns.push(fn);
  }
}

console.log('\n--- Missing onclick functions ---');
if (missingOnclickFns.length === 0) {
  console.log('✅ All onclick functions defined');
} else {
  missingOnclickFns.forEach(fn => console.log('❌ MISSING:', fn));
}

// 5. 检查 showPage 目标
const showPageMatches = allScript.match(/showPage\(['"]([\w-]+)['"]\)/g) || [];
const pageTargets = [...new Set(showPageMatches.map(m => m.match(/showPage\(['"]([\w-]+)['"]\)/)[1]))];
console.log('\n--- showPage targets ---');
let missingPages = 0;
for (const name of pageTargets) {
  const hasPage = html.includes(`id="page-${name}"`) || html.includes(`id='page-${name}'`);
  if (hasPage) {
    console.log('✅ page-' + name);
  } else {
    console.log('❌ MISSING page:', name);
    missingPages++;
  }
}

// 6. 检查重复ID
const idMatches = html.match(/id="([^"]*)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]*)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
console.log('\n--- Duplicate IDs ---');
if (duplicateIds.length === 0) {
  console.log('✅ All IDs unique (' + ids.length + ' total)');
} else {
  duplicateIds.forEach(([k, v]) => console.log('❌ DUPLICATE:', k, '(' + v + ' times)'));
}

// 7. section 标签平衡
const htmlOnly = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const sectionOpen = (htmlOnly.match(/<section[\s>]/g) || []).length;
const sectionClose = (htmlOnly.match(/<\/section>/g) || []).length;
console.log('\n--- Section tag balance ---');
console.log('Open:', sectionOpen, 'Close:', sectionClose);
if (sectionOpen === sectionClose) {
  console.log('✅ Balanced');
} else {
  console.log('❌ UNBALANCED');
}

// 8. 检查未闭合标签的简单方法
console.log('\n--- Summary ---');
console.log('Functions defined:', functionDefs.size);
console.log('onclick references:', referencedFns.size);
console.log('Missing onclick functions:', missingOnclickFns.length);
console.log('Missing pages:', missingPages);
console.log('Duplicate IDs:', duplicateIds.length);

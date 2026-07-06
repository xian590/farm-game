const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// 提取所有 script blocks
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];

// 合并所有脚本内容
let allScript = '';
scripts.forEach((s, i) => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

// 1. 检查所有 showPage() 调用对应的页面元素是否存在
const showPageMatches = allScript.match(/showPage\(['"]([\w-]+)['"]\)/g) || [];
const pageNames = [...new Set(showPageMatches.map(m => m.match(/showPage\(['"]([\w-]+)['"]\)/)[1]))];

const missingPages = [];
for (const name of pageNames) {
  if (!html.includes(`id="page-${name}"`) && !html.includes(`id='page-${name}'`)) {
    missingPages.push(name);
  }
}

console.log('=== 1. showPage 调用对应的页面元素检查 ===');
console.log('showPage 调用目标数: ' + pageNames.length);
if (missingPages.length > 0) {
  console.log('❌ 缺失页面元素: ' + missingPages.join(', '));
} else {
  console.log('✅ 所有 showPage 调用都有对应的页面元素');
}

// 2. 检查所有 onclick 调用的函数是否存在
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const jsClickMatches = allScript.match(/onclick\s*=\s*['"]([^'"]*)['"]/g) || [];

// 提取函数名
function extractFunctionNames(onclickStr) {
  const matches = onclickStr.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  return matches.map(m => m.replace('(', '').trim());
}

const allOnclickFns = new Set();
[...onclickMatches, ...jsClickMatches].forEach(m => {
  const fns = extractFunctionNames(m);
  fns.forEach(fn => allOnclickFns.add(fn));
});

// 从脚本中查找函数定义
const functionDefs = allScript.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
const definedFns = new Set(functionDefs.map(m => m.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/)[1]));

// 还有 const/let/var fn = function 或箭头函数的定义
const arrowFnMatches = allScript.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|(?:\([^)]*\)\s*=>))/g) || [];
arrowFnMatches.forEach(m => {
  const name = m.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)[1];
  definedFns.add(name);
});

// 排除已知存在的全局对象/方法
const knownGlobals = new Set(['console', 'localStorage', 'document', 'window', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'isNaN', 'encodeURIComponent', 'decodeURIComponent', 'URL', 'URLSearchParams', 'Blob', 'fetch', 'navigator', 'location', 'history', 'screen', 'innerWidth', 'innerHeight', 'scrollTo', 'scrollBy', 'open', 'close', 'print', 'atob', 'btoa', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'speechSynthesis', 'SpeechSynthesisUtterance', 'Notification', 'Audio', 'Image', 'caches', 'indexedDB', 'Intl']);

const missingFns = [];
for (const fn of allOnclickFns) {
  if (!definedFns.has(fn) && !knownGlobals.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
    missingFns.push(fn);
  }
}

console.log('\n=== 2. onclick 调用函数存在性检查 ===');
console.log('onclick 调用函数数: ' + allOnclickFns.size);
if (missingFns.length > 0) {
  console.log('❌ 缺失函数: ' + missingFns.join(', '));
} else {
  console.log('✅ 所有 onclick 调用的函数都已定义');
}

// 3. 检查 HTML 中所有 id 是否唯一
const idMatches = html.match(/id="([^"]*)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]*)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1).map(([k, v]) => k + '(' + v + ')');

console.log('\n=== 3. ID 唯一性检查 ===');
if (duplicateIds.length > 0) {
  console.log('❌ 重复 ID: ' + duplicateIds.join(', '));
} else {
  console.log('✅ 所有 ID 唯一');
}

// 4. 检查所有 section 页面是否都有正确的闭合
const sectionOpenCount = (html.match(/<section[\s>]/g) || []).length;
const sectionCloseCount = (html.match(/<\/section>/g) || []).length;
console.log('\n=== 4. section 标签平衡 ===');
console.log('open: ' + sectionOpenCount + ' close: ' + sectionCloseCount);
if (sectionOpenCount !== sectionCloseCount) {
  console.log('❌ section 标签不平衡!');
} else {
  console.log('✅ section 标签平衡');
}

// 5. 检查 script 语法
console.log('\n=== 5. Script 语法检查 ===');
let syntaxOk = true;
for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    new Function(code);
    console.log('✅ Block ' + (i+1) + ' OK');
  } catch (e) {
    console.log('❌ Block ' + (i+1) + ' FAIL: ' + e.message);
    syntaxOk = false;
  }
}

console.log('\n=== 总结 ===');
if (missingPages.length === 0 && missingFns.length === 0 && duplicateIds.length === 0 && sectionOpenCount === sectionCloseCount && syntaxOk) {
  console.log('✅ 全部通过！');
} else {
  console.log('❌ 存在问题，需要修复');
}

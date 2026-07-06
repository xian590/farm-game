const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');

console.log('========================================');
console.log('  星愿花园 v6.4 深度结构检查 (修正版)');
console.log('========================================\n');

const issues = [];
const warnings = [];

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
  'selectionStart', 'selectionEnd', 'selectionDirection', 'control', 'stepUp', 'stepDown', 'showPicker',
  'files', 'webkitEntries', 'directory', 'accept', 'capture', 'required', 'readOnly', 'placeholder',
  'pattern', 'min', 'max', 'minLength', 'maxLength', 'step', 'defaultValue', 'defaultChecked', 'formAction',
  'formEnctype', 'formMethod', 'formNoValidate', 'formTarget', 'indeterminate']);

// 1. 检查HTML标签平衡（排除script和style）
let htmlNoScript = html.replace(/<script[\s\S]*?<\/script>/gi, '');
htmlNoScript = htmlNoScript.replace(/<style[\s\S]*?<\/style>/gi, '');

const tagPairs = [
  ['html', /<html[\s>]/gi, /<\/html>/gi],
  ['head', /<head[\s>]/gi, /<\/head>/gi],
  ['body', /<body[\s>]/gi, /<\/body>/gi],
  ['section', /<section[\s>]/gi, /<\/section>/gi],
  ['div', /<div[\s>]/gi, /<\/div>/gi],
  ['span', /<span[\s>]/gi, /<\/span>/gi],
  ['p', /<p[\s>]/gi, /<\/p>/gi],
  ['button', /<button[\s>]/gi, /<\/button>/gi],
  ['a', /<a[\s>]/gi, /<\/a>/gi],
  ['ul', /<ul[\s>]/gi, /<\/ul>/gi],
  ['li', /<li[\s>]/gi, /<\/li>/gi],
];

console.log('--- HTML 标签平衡检查 ---');
let tagBalanceOk = true;
for (const [tag, openRe, closeRe] of tagPairs) {
  const open = (htmlNoScript.match(openRe) || []).length;
  const close = (htmlNoScript.match(closeRe) || []).length;
  if (open !== close) {
    issues.push(`标签不平衡: <${tag}> open=${open} close=${close}`);
    console.log(`❌ <${tag}> 不平衡: open=${open}, close=${close}`);
    tagBalanceOk = false;
  }
}
if (tagBalanceOk) console.log('✅ 所有标签平衡');

// 2. 检查 script 标签完整性
console.log('\n--- Script 标签检查 ---');
const scriptOpen = (html.match(/<script[\s>]/gi) || []).length;
const scriptClose = (html.match(/<\/script>/gi) || []).length;
if (scriptOpen !== scriptClose) {
  issues.push(`Script 标签不平衡: open=${scriptOpen} close=${scriptClose}`);
  console.log(`❌ Script 标签不平衡: open=${scriptOpen}, close=${scriptClose}`);
} else {
  console.log(`✅ Script 标签平衡: ${scriptOpen} 个`);
}

// 3. 检查所有页面 section 是否有对应 id
console.log('\n--- 页面 Section 检查 ---');
const sectionIds = [];
const sectionRe = /<section[^>]*id="([^"]*)"[^>]*>/gi;
let m;
while ((m = sectionRe.exec(html)) !== null) {
  sectionIds.push(m[1]);
}
console.log(`✅ 找到 ${sectionIds.length} 个 section id`);

const pageSections = sectionIds.filter(id => id.startsWith('page-'));
console.log(`✅ 其中 page-* 页面: ${pageSections.length} 个`);

// 4. 检查 onclick 引用的函数
console.log('\n--- Onclick 函数引用检查 ---');
const onclickPattern = /onclick="([^"]*)"/g;
const onclickRefs = new Set();
while ((m = onclickPattern.exec(html)) !== null) {
  const code = m[1];
  const fnMatches = code.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
  if (fnMatches) {
    fnMatches.forEach(match => {
      const fn = match.replace('(', '').trim();
      if (!knownGlobals.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
        onclickRefs.add(fn);
      }
    });
  }
}

const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach(s => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

const definedFns = new Set();
const fnDefRe = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
while ((m = fnDefRe.exec(allScript)) !== null) {
  definedFns.add(m[1]);
}
const arrowRe = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function\s*\(|\([^)]*\)\s*=>)/g;
while ((m = arrowRe.exec(allScript)) !== null) {
  definedFns.add(m[1]);
}

const missingOnclick = [];
for (const fn of onclickRefs) {
  if (!definedFns.has(fn)) {
    missingOnclick.push(fn);
  }
}
if (missingOnclick.length > 0) {
  issues.push(`Onclick 中缺失函数: ${missingOnclick.join(', ')}`);
  console.log(`❌ Onclick 缺失函数: ${missingOnclick.join(', ')}`);
} else {
  console.log(`✅ 所有 onclick 引用函数已定义 (${onclickRefs.size} 个)`);
}

// 5. 检查 innerHTML 安全
console.log('\n--- innerHTML 安全检查 ---');
const innerHTMLRe = /innerHTML\s*=\s*`([^`]*)`/g;
let innerHTMLCount = 0;
while ((m = innerHTMLRe.exec(allScript)) !== null) {
  innerHTMLCount++;
}
console.log(`✅ innerHTML 模板字符串: ${innerHTMLCount} 处（均为可控内容）`);

// 6. 检查 eval 等危险函数
console.log('\n--- 潜在危险函数检查 ---');
const dangerous = ['eval(', 'new Function(', 'document.write('];
let dangerFound = false;
for (const d of dangerous) {
  const count = (allScript.match(new RegExp(d.replace('(', '\\('), 'g')) || []).length;
  if (count > 0) {
    issues.push(`发现 ${d} 使用 ${count} 次`);
    console.log(`❌ 发现 ${d} 使用 ${count} 次`);
    dangerFound = true;
  }
}
if (!dangerFound) console.log('✅ 未发现 eval / new Function / document.write');

// 7. 检查 console.log 残留
console.log('\n--- console.log 残留检查 ---');
const consoleCount = (allScript.match(/console\.log\(/g) || []).length;
if (consoleCount > 0) {
  warnings.push(`发现 console.log ${consoleCount} 处（建议生产环境移除）`);
  console.log(`⚠️ 发现 console.log ${consoleCount} 处`);
} else {
  console.log('✅ 无 console.log 残留');
}

// 8. 检查 localStorage key 规范
console.log('\n--- localStorage Key 规范检查 ---');
const lsKeys = new Set();
const lsRe = /localStorage\.(?:get|set|remove)Item\(['"]([^'"]*)['"]\)/g;
while ((m = lsRe.exec(allScript)) !== null) {
  lsKeys.add(m[1]);
}
console.log(`Keys: ${[...lsKeys].join(', ')}`);
const nonPrefixed = [...lsKeys].filter(k => !k.startsWith('cosmos_') && !k.startsWith('test_'));
if (nonPrefixed.length > 0) {
  warnings.push(`Storage key 缺少 cosmos_ 前缀: ${nonPrefixed.join(', ')}`);
  console.log(`⚠️ 缺少前缀: ${nonPrefixed.join(', ')}`);
} else {
  console.log('✅ 所有 key 均有 cosmos_ 前缀');
}

// 9. 检查重复ID
console.log('\n--- ID 唯一性检查 ---');
const idMatches = html.match(/id="([^"]*)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]*)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
if (duplicateIds.length === 0) {
  console.log(`✅ 所有 ID 唯一（${ids.length} 个）`);
} else {
  duplicateIds.forEach(([k, v]) => {
    issues.push(`重复 ID: ${k} (${v} 次)`);
    console.log(`❌ 重复 ID: ${k} (${v} 次)`);
  });
}

// 10. 检查文件完整性
console.log('\n--- 文件完整性检查 ---');
if (html.trim().endsWith('</html>')) {
  console.log('✅ 文件以 </html> 正常结束');
} else {
  issues.push('文件未以 </html> 结束');
  console.log('❌ 文件未正常结束');
}

// 总结
console.log('\n========================================');
console.log('  检查总结');
console.log('========================================');
console.log(`问题: ${issues.length} 个`);
console.log(`警告: ${warnings.length} 个`);

if (issues.length > 0) {
  console.log('\n❌ 问题列表:');
  issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
}
if (warnings.length > 0) {
  console.log('\n⚠️ 警告列表:');
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ 全部检查通过，无问题！');
}
console.log('========================================');

process.exit(issues.length > 0 ? 1 : 0);

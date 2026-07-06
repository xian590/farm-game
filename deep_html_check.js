const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');
const results = {
  errors: [],
  warnings: [],
  info: []
};

function error(msg) { results.errors.push(msg); console.log('❌ ' + msg); }
function warn(msg) { results.warnings.push(msg); console.log('⚠️ ' + msg); }
function info(msg) { results.info.push(msg); console.log('ℹ️ ' + msg); }

console.log('========================================');
console.log('  HTML 深度结构检查');
console.log('========================================');

// 1. DOCTYPE 检查
if (!html.trim().toLowerCase().startsWith('<!doctype')) {
  warn('DOCTYPE 不在文件开头');
} else {
  info('DOCTYPE 正确');
}

// 2. 基础标签检查
const hasHtml = /<html[\s>]/i.test(html);
const hasHead = /<head[\s>]/i.test(html);
const hasBody = /<body[\s>]/i.test(html);
if (!hasHtml) error('缺少 <html> 标签');
if (!hasHead) error('缺少 <head> 标签');
if (!hasBody) error('缺少 <body> 标签');

// 3. 标签匹配检查
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const tagStack = [];
const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?\/?>/g;
let m;
while ((m = tagRegex.exec(html)) !== null) {
  const isClose = m[1] === '/';
  const tag = m[2].toLowerCase();
  const fullTag = m[0];
  const isSelfClose = fullTag.endsWith('/>') || voidTags.has(tag);
  
  if (isClose) {
    // 找到匹配的开启标签
    let found = false;
    for (let i = tagStack.length - 1; i >= 0; i--) {
      if (tagStack[i].tag === tag) {
        tagStack.splice(i, 1);
        found = true;
        break;
      }
    }
    if (!found && !voidTags.has(tag)) {
      warn('多余的闭合标签 </' + tag + '> 在位置 ' + m.index);
    }
  } else if (!isSelfClose) {
    tagStack.push({ tag, pos: m.index });
  }
}

if (tagStack.length > 0) {
  tagStack.forEach(t => {
    error('未闭合标签 <' + t.tag + '> 在位置 ' + t.pos);
  });
} else {
  info('所有标签已正确闭合');
}

// 4. script 标签提取和检查
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
info('找到 ' + scripts.length + ' 个 script 块');

let allScript = '';
scripts.forEach((s, i) => {
  const code = s.replace(/<script>/g, '').replace(/<\/script>/g, '');
  allScript += code + '\n';
  try {
    new Function(code);
  } catch (e) {
    error('Script Block ' + (i+1) + ' 语法错误: ' + e.message);
  }
});

// 5. onclick 内联事件检查
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
info('找到 ' + onclickMatches.length + ' 个 onclick 属性');

// 提取函数定义
const functionDefs = new Set();
const fnRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
let fnMatch;
while ((fnMatch = fnRegex.exec(allScript)) !== null) {
  functionDefs.add(fnMatch[1]);
}
const arrowRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function\s*\(|\([^)]*\)\s*=>)/g;
while ((fnMatch = arrowRegex.exec(allScript)) !== null) {
  functionDefs.add(fnMatch[1]);
}

// 检查 onclick 中引用的函数
const knownGlobals = new Set(['console','localStorage','document','window','alert','confirm','prompt','setTimeout','setInterval','clearTimeout','clearInterval','Math','JSON','Date','Array','Object','String','Number','parseInt','parseFloat','isNaN','encodeURIComponent','decodeURIComponent','URL','fetch','navigator','location','history','screen','scrollTo','scrollBy','open','close','print','atob','btoa','requestAnimationFrame','cancelAnimationFrame','getComputedStyle','speechSynthesis','Notification','Audio','Image','caches','indexedDB','Intl','this','true','false','null','undefined','typeof','new','return','if','else','for','while','switch','case','break','continue','try','catch','throw','finally','function','var','let','const','class','extends','super','import','export','default','async','await','void','delete','in','instanceof','of']);

const referencedFns = new Set();
function extractFnNames(str) {
  const matches = str.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  return matches.map(m => m.replace('(', '').trim());
}
onclickMatches.forEach(m => {
  extractFnNames(m).forEach(fn => referencedFns.add(fn));
});

const missingOnclickFns = [];
for (const fn of referencedFns) {
  if (!functionDefs.has(fn) && !knownGlobals.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
    missingOnclickFns.push(fn);
  }
}
if (missingOnclickFns.length > 0) {
  error('onclick 缺失函数: ' + [...new Set(missingOnclickFns)].join(', '));
} else {
  info('所有 onclick 引用的函数都已定义');
}

// 6. 重复 ID 检查
const idMatches = html.match(/id="([^"]*)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]*)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const duplicateIds = Object.entries(idCounts).filter(([k, v]) => v > 1);
if (duplicateIds.length > 0) {
  duplicateIds.forEach(([k, v]) => error('重复 ID: ' + k + ' (' + v + ' 次)'));
} else {
  info('所有 ID 唯一 (' + ids.length + ' 个)');
}

// 7. 属性引号检查 - 查找未闭合的属性引号
const attrRegex = /\s+[a-zA-Z-]+=(['"])[^'"]*$/gm;
// 简单检查：查找引号不匹配的 onclick
const badOnclick = html.match(/onclick="[^"]*[^"\\]$/gm);
if (badOnclick) {
  badOnclick.forEach(o => warn('可疑的 onclick 引号: ' + o.substring(0, 80)));
}

// 8. innerHTML 安全检查
const innerHTMLMatches = allScript.match(/\.innerHTML\s*=/g) || [];
if (innerHTMLMatches.length > 0) {
  info('发现 ' + innerHTMLMatches.length + ' 处 innerHTML 赋值');
  // 检查是否有直接插入用户输入的情况
  const dangerous = allScript.match(/innerHTML\s*=\s*[^;]*\+/g) || [];
  if (dangerous.length > 0) {
    warn('发现 ' + dangerous.length + ' 处可能危险的 innerHTML 拼接');
  }
}

// 9. 检查未定义变量引用（简单模式）
const varRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
const definedVars = new Set();
let vMatch;
while ((vMatch = varRegex.exec(allScript)) !== null) {
  definedVars.add(vMatch[1]);
}
// 添加内置变量
['state','DEFAULT_STATE','CONFIG'].forEach(v => definedVars.add(v));

// 查找可能的未定义变量（简单启发式）
const undefinedVarRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
const usedVars = new Set();
const codeOnly = allScript.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
let uMatch;
while ((uMatch = undefinedVarRegex.exec(codeOnly)) !== null) {
  const v = uMatch[1];
  if (!definedVars.has(v) && !knownGlobals.has(v) && !/^[A-Z]/.test(v) && v.length > 1) {
    // 忽略属性访问、函数名等
  }
}

// 10. HTML 实体检查
const unescapedAmp = html.match(/&(?!(?:#[0-9]+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);)/g);
if (unescapedAmp) {
  info('发现 ' + unescapedAmp.length + ' 个未转义的 & 符号（部分可能是 URL 参数）');
}

// 11. 检查 showPage 引用的页面是否存在
const showPageMatches = allScript.match(/showPage\(['"]([\w-]+)['"]\)/g) || [];
const pageTargets = [...new Set(showPageMatches.map(m => m.match(/showPage\(['"]([\w-]+)['"]\)/)[1]))];
let missingPages = 0;
for (const name of pageTargets) {
  const hasPage = html.includes(`id="page-${name}"`) || html.includes(`id='page-${name}'`);
  if (!hasPage) {
    error('showPage("' + name + '") 引用的 page-' + name + ' 不存在');
    missingPages++;
  }
}
if (missingPages === 0) {
  info('所有 showPage 目标页面存在 (' + pageTargets.length + ' 个)');
}

// 12. 检查 link/script src 是否本地可访问
const linkMatches = html.match(/<link[^>]*href="([^"]*)"/g) || [];
const scriptSrcMatches = html.match(/<script[^>]*src="([^"]*)"/g) || [];
info('外部资源: ' + linkMatches.length + ' 个 link, ' + scriptSrcMatches.length + ' 个 script src');

// 13. 检查 meta viewport
if (!html.includes('viewport')) {
  warn('缺少 viewport meta 标签');
}

// 14. 检查 charset
if (!html.includes('charset')) {
  warn('缺少 charset 声明');
}

// 输出报告
console.log('\n========================================');
console.log('  HTML 检查报告');
console.log('========================================');
console.log('错误: ' + results.errors.length + ' 项');
console.log('警告: ' + results.warnings.length + ' 项');
console.log('信息: ' + results.info.length + ' 项');

if (results.errors.length > 0) {
  console.log('\n❌ 错误列表:');
  results.errors.forEach((e, i) => console.log('  ' + (i+1) + '. ' + e));
}
if (results.warnings.length > 0) {
  console.log('\n⚠️ 警告列表:');
  results.warnings.forEach((w, i) => console.log('  ' + (i+1) + '. ' + w));
}

console.log('\n========================================');

fs.writeFileSync('html_check_report.json', JSON.stringify(results, null, 2));
console.log('报告已保存至 html_check_report.json');

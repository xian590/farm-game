const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');

// 分离 HTML 和 Script
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach(s => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

// 提取纯 HTML（去掉 script 和 style）
let htmlOnly = html.replace(/<script>[\s\S]*?<\/script>/g, '');
htmlOnly = htmlOnly.replace(/<style>[\s\S]*?<\/style>/g, '');

const results = { errors: [], warnings: [], info: [] };
function error(msg) { results.errors.push(msg); console.log('❌ ' + msg); }
function warn(msg) { results.warnings.push(msg); console.log('⚠️ ' + msg); }
function info(msg) { results.info.push(msg); console.log('ℹ️ ' + msg); }

console.log('========================================');
console.log('  精准 HTML + JS 问题检查');
console.log('========================================');

// 1. 检查纯 HTML 中的标签平衡（更智能）
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
// 在纯 HTML 中检查，但排除属性值中的 <
const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*?\/?>/g;
const tagStack = [];
let m;
while ((m = tagRegex.exec(htmlOnly)) !== null) {
  const isClose = m[1] === '/';
  const tag = m[2].toLowerCase();
  const fullTag = m[0];
  const isSelfClose = fullTag.endsWith('/>') || voidTags.has(tag);
  
  if (isClose) {
    let found = false;
    for (let i = tagStack.length - 1; i >= 0; i--) {
      if (tagStack[i].tag === tag) {
        tagStack.splice(i, 1);
        found = true;
        break;
      }
    }
    if (!found && !voidTags.has(tag)) {
      // 只在纯 HTML 中报告，检查是否在 SVG 内
      const before = htmlOnly.substring(0, m.index);
      const inSvg = before.lastIndexOf('<svg') > before.lastIndexOf('</svg');
      if (!inSvg || tag !== 'g') {
        warn('多余的闭合标签 </' + tag + '>');
      }
    }
  } else if (!isSelfClose) {
    tagStack.push({ tag, pos: m.index });
  }
}

if (tagStack.length > 0) {
  tagStack.forEach(t => {
    // 获取上下文
    const ctx = htmlOnly.substring(Math.max(0, t.pos - 50), Math.min(htmlOnly.length, t.pos + 50));
    // 排除明显是模板字符串的情况（已经去掉了 script）
    error('未闭合标签 <' + t.tag + '> 上下文: ' + ctx.replace(/\s+/g, ' ').substring(0, 100));
  });
} else {
  info('纯 HTML 标签平衡 OK');
}

// 2. 检查 onclick 中真正缺失的函数
// 提取所有函数定义
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

// 已知全局
const knownGlobals = new Set(['console','localStorage','document','window','alert','confirm','prompt','setTimeout','setInterval','clearTimeout','clearInterval','Math','JSON','Date','Array','Object','String','Number','parseInt','parseFloat','isNaN','encodeURIComponent','decodeURIComponent','URL','fetch','navigator','location','history','screen','scrollTo','scrollBy','open','close','print','atob','btoa','requestAnimationFrame','cancelAnimationFrame','getComputedStyle','speechSynthesis','Notification','Audio','Image','caches','indexedDB','Intl','this','true','false','null','undefined','typeof','new','return','if','else','for','while','switch','case','break','continue','try','catch','throw','finally','function','var','let','const','class','extends','super','import','export','default','async','await','void','delete','in','instanceof','of']);

// 对象方法，不应该被当作缺失函数
const objectMethods = new Set(['querySelector','querySelectorAll','getElementById','getElementsByClassName','getElementsByTagName','stopPropagation','preventDefault','replace','substring','substr','slice','split','trim','indexOf','lastIndexOf','includes','startsWith','endsWith','match','search','toLowerCase','toUpperCase','charAt','charCodeAt','concat','join','map','filter','reduce','forEach','push','pop','shift','unshift','sort','reverse','splice','fill','find','findIndex','some','every','keys','values','entries','from','setItem','getItem','removeItem','clear','add','remove','toggle','contains','focus','blur','click','play','pause','remove','appendChild','insertBefore','removeChild','replaceChild','cloneNode','addEventListener','removeEventListener','dispatchEvent','getAttribute','setAttribute','hasAttribute','removeAttribute','getBoundingClientRect','scrollIntoView','animate','closest','matches','setProperty','getPropertyValue','toString','valueOf','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','defineProperty','getOwnPropertyDescriptor','getOwnPropertyNames','getOwnPropertySymbols','freeze','seal','preventExtensions','isFrozen','isSealed','isExtensible','assign','create','defineProperties','getPrototypeOf','setPrototypeOf','keys','values','entries','fromEntries','is','of','abs','ceil','floor','round','max','min','random','pow','sqrt','sin','cos','tan','log','exp','PI','E','now','parse','stringify']);

// 提取 onclick
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const referencedFns = new Set();

// 更精确的提取：只提取独立的函数调用（前面没有 . 的）
function extractStandaloneFnCalls(str) {
  const calls = [];
  // 匹配形如 fnName( 或 obj.fnName( 或 )=>fnName(
  const regex = /(?<!\.)\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let mm;
  while ((mm = regex.exec(str)) !== null) {
    calls.push(mm[1]);
  }
  return calls;
}

onclickMatches.forEach(oc => {
  extractStandaloneFnCalls(oc).forEach(fn => referencedFns.add(fn));
});

const missingOnclickFns = [];
for (const fn of referencedFns) {
  if (!functionDefs.has(fn) && !knownGlobals.has(fn) && !objectMethods.has(fn) && !fn.startsWith('state.') && !fn.startsWith('this.')) {
    missingOnclickFns.push(fn);
  }
}
if (missingOnclickFns.length > 0) {
  error('onclick 真正缺失的函数: ' + [...new Set(missingOnclickFns)].join(', '));
} else {
  info('所有 onclick 独立函数调用都已定义');
}

// 3. 检查 HTML 属性引号匹配
const badAttrs = htmlOnly.match(/\s[a-zA-Z-]+=(['"])[^'"]*$/gm);
if (badAttrs) {
  badAttrs.forEach(a => warn('属性引号可能不匹配: ' + a.substring(0, 60)));
} else {
  info('HTML 属性引号匹配 OK');
}

// 4. 检查 script 语法
let scriptErrors = 0;
scripts.forEach((s, i) => {
  const code = s.replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    new Function(code);
  } catch (e) {
    error('Script Block ' + (i+1) + ' 语法错误: ' + e.message);
    scriptErrors++;
  }
});
if (scriptErrors === 0) info('所有 Script 块语法 OK');

// 5. 检查重复 ID
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

// 6. 检查 section 标签平衡
const sectionOpen = (htmlOnly.match(/<section[\s>]/g) || []).length;
const sectionClose = (htmlOnly.match(/<\/section>/g) || []).length;
if (sectionOpen === sectionClose) {
  info('section 标签平衡: ' + sectionOpen + '/' + sectionClose);
} else {
  error('section 不平衡: open=' + sectionOpen + ' close=' + sectionClose);
}

// 7. 检查 showPage 目标页面
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

// 8. 检查是否有未闭合的引号在模板字符串中导致的问题（简单检查）
// 查找 script 中可疑的模板字符串
const templateStringIssues = [];
const tsRegex = /`[^`]*`/g;
let tsMatch;
while ((tsMatch = tsRegex.exec(allScript)) !== null) {
  const str = tsMatch[0];
  // 检查是否有未转义的换行符在单引号/双引号属性内
}

// 9. 检查关键 DOM 元素是否存在
const criticalIds = ['skeleton-screen','bottom-nav','page-island','page-me','page-tools','page-library','page-journal','fireflies-container'];
for (const id of criticalIds) {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    error('关键元素缺失: #' + id);
  }
}

// 10. 检查 CSS 中是否有未闭合的规则
const styleBlocks = html.match(/<style>([\s\S]*?)<\/style>/g) || [];
let cssIssues = 0;
styleBlocks.forEach((sb, i) => {
  const css = sb.replace(/<style>/g, '').replace(/<\/style>/g, '');
  // 简单检查：每个 { 是否有对应的 }
  const openBraces = (css.match(/\{/g) || []).length;
  const closeBraces = (css.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    error('Style block ' + (i+1) + ' 花括号不平衡: ' + openBraces + ' vs ' + closeBraces);
    cssIssues++;
  }
});
if (cssIssues === 0) info('CSS 花括号平衡 OK');

// 报告
console.log('\n========================================');
console.log('  精准检查报告');
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
fs.writeFileSync('precise_check_report.json', JSON.stringify(results, null, 2));
console.log('报告已保存至 precise_check_report.json');

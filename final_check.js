const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
const allScript = scripts.map(s => s.replace(/<script>|<\/script>/g, '')).join('\n');

console.log('=== 最终状态检查 ===\n');

let syntaxOk = true;
for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<script>|<\/script>/g, '');
  try {
    new Function(code);
  } catch(e) {
    syntaxOk = false;
    console.log('Block ' + (i+1) + ' FAIL: ' + e.message);
  }
}
console.log('1. 语法检查: ' + (syntaxOk ? 'OK' : 'FAIL'));

const fnRegex = /function\s+(\w+)\s*\(/g;
const fnDefs = new Set();
let m;
while ((m = fnRegex.exec(allScript)) !== null) fnDefs.add(m[1]);
console.log('2. 函数定义: ' + fnDefs.size + ' 个 OK');

const idMatches = html.match(/id="([^"]+)"/g) || [];
const ids = idMatches.map(m => m.match(/id="([^"]+)"/)[1]);
const idCounts = {};
ids.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
const dups = Object.entries(idCounts).filter(([k,v]) => v > 1);
console.log('3. ID唯一性: ' + ids.length + ' 个, ' + (dups.length === 0 ? '无重复 OK' : dups.length + ' 重复'));

const htmlOnly = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const sOpen = (htmlOnly.match(/<section[\s>]/g) || []).length;
const sClose = (htmlOnly.match(/<\/section>/g) || []).length;
console.log('4. section标签: ' + sOpen + ' 开 / ' + sClose + ' 闭 ' + (sOpen === sClose ? 'OK' : 'FAIL'));

const showPageMatches = allScript.match(/showPage\(['"]([\w-]+)['"]\)/g) || [];
const pageTargets = [...new Set(showPageMatches.map(m => m.match(/showPage\(['"]([\w-]+)['"]\)/)[1]))];
let missingPages = 0;
for (const name of pageTargets) {
  if (!html.includes('id="page-' + name + '"') && !html.includes("id='page-'" + name + "'")) missingPages++;
}
console.log('5. showPage目标: ' + pageTargets.length + ' 个, ' + (missingPages === 0 ? '全部有对应 OK' : missingPages + ' 缺失'));

const hasInitDone = allScript.includes('__initDone');
const hasInitInterval = allScript.includes('__initInterval');
console.log('6. init()保护: ' + (hasInitDone && hasInitInterval ? 'OK' : 'FAIL'));

const hasCdnProtect = html.includes('onerror="console.warn');
console.log('7. CDN加载保护: ' + (hasCdnProtect ? 'OK' : 'FAIL'));

const hasErrorHandler = allScript.includes('window.onerror');
const hasRejectionHandler = allScript.includes('unhandledrejection');
console.log('8. 错误处理: ' + (hasErrorHandler && hasRejectionHandler ? 'OK' : 'FAIL'));

const hasLoadStateProtect = allScript.includes('if (!Array.isArray(result.');
console.log('9. loadState数组保护: ' + (hasLoadStateProtect ? 'OK' : 'FAIL'));

const hasAffirmProtect = allScript.includes('if (!Array.isArray(result.affirmations.saved))');
const hasPurifyProtect = allScript.includes('if (!Array.isArray(result.purify.records))');
const hasGardenProtect = allScript.includes('if (!Array.isArray(result.garden.flowers))');
console.log('10. state嵌套保护: ' + (hasAffirmProtect && hasPurifyProtect && hasGardenProtect ? 'OK' : 'FAIL'));

console.log('\n=== 检查完成 ===');

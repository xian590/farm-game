const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach(s => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

console.log('=== JS 运行时风险检查 ===\n');

// 1. 检查可能的 null/undefined 引用
const riskyPatterns = [
  /document\.getElementById\(['"]([^'"]+)['"]\)\.[a-zA-Z_$]/g,
  /document\.querySelector\(['"]([^'"]+)['"]\)\.[a-zA-Z_$]/g,
];

// 2. 检查 event 未定义使用
const eventUses = allScript.match(/\bevent\b/g) || [];
console.log('event 引用次数: ' + eventUses.length);

// 3. 检查可能在元素不存在时报错的模式
const dangerousGetElementById = allScript.match(/document\.getElementById\(['"]([^'"]+)['"]\)\.innerHTML\s*=/g) || [];
console.log('getElementById().innerHTML = 次数: ' + dangerousGetElementById.length);

// 4. 检查 JSON.parse 无 try-catch
const jsonParseMatches = allScript.match(/JSON\.parse\(/g) || [];
const jsonParseTryMatches = allScript.match(/try\s*\{[^}]*JSON\.parse/g) || [];
console.log('JSON.parse 总次数: ' + jsonParseMatches.length);
console.log('JSON.parse 在 try 中的次数: ' + jsonParseTryMatches.length);

// 5. 检查 localStorage 访问无 try-catch
const lsMatches = allScript.match(/localStorage\.[a-zA-Z]+\(/g) || [];
const lsTryMatches = allScript.match(/try\s*\{[^}]*localStorage/g) || [];
console.log('localStorage 访问次数: ' + lsMatches.length);
console.log('localStorage 在 try 中的次数: ' + lsTryMatches.length);

// 6. 检查 window.open / location 赋值
const windowOpen = allScript.match(/window\.open\(/g) || [];
console.log('window.open 次数: ' + windowOpen.length);

// 7. 检查 audio 播放无错误处理
const audioPlay = allScript.match(/\.play\(\)/g) || [];
console.log('.play() 调用次数: ' + audioPlay.length);

// 8. 检查可能的死循环
const whileTrue = allScript.match(/while\s*\(\s*true\s*\)/g) || [];
console.log('while(true) 次数: ' + whileTrue.length);

// 9. 检查递归调用风险
const recursivePatterns = [];

// 10. 检查未声明变量赋值 (隐含全局)
const implicitGlobal = allScript.match(/\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=[^=]/g) || [];
console.log('\n可能的隐式全局变量赋值:');
implicitGlobal.slice(0, 20).forEach(m => console.log('  ' + m.trim()));

console.log('\n=== 检查完成 ===');

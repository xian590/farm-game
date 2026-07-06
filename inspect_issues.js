const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');

// 提取所有 script 代码
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach(s => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

console.log('=== 问题位置上下文 ===\n');

// 检查位置周围的上下文
const positions = [638170, 638456, 639109, 639433, 639511, 639870, 916314];
positions.forEach(pos => {
  const start = Math.max(0, pos - 200);
  const end = Math.min(html.length, pos + 200);
  console.log(`--- 位置 ${pos} ---`);
  console.log(html.substring(start, end));
  console.log('\n');
});

// 检查 innerHTML 拼接
console.log('=== 可能危险的 innerHTML 拼接 ===\n');
const lines = allScript.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('innerHTML') && line.includes('+')) {
    console.log(`行 ${idx + 1}: ${line.trim()}`);
  }
});

// 检查 onclick 中的 "缺失函数"
console.log('\n=== onclick 中的 method 调用（可能误报）===');
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const suspicious = ['querySelector', 'querySelectorAll', 'stopPropagation', 'replace', 'substring', 'getElementById', 'remove', 'setItem'];
onclickMatches.forEach((oc, i) => {
  suspicious.forEach(fn => {
    if (oc.includes(fn + '(')) {
      console.log(`onclick #${i}: ${oc.substring(0, 120)}`);
    }
  });
});

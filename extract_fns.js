const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach(s => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

const fns = new Set();
let m;
const r1 = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
while ((m = r1.exec(allScript)) !== null) fns.add(m[1]);
const r2 = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function\s*\(|\([^)]*\)\s*=>)/g;
while ((m = r2.exec(allScript)) !== null) fns.add(m[1]);

console.log('Total functions: ' + fns.size);
[...fns].sort().forEach(fn => console.log(fn));

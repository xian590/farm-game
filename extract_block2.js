const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    fs.writeFileSync('C:/Users/Administrator/Documents/kimi/workspace/block2.js', m[1]);
    console.log('Block 2 written to block2.js (' + m[1].length + ' chars)');
  }
}

const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    const code = m[1];
    // Write first 1100 chars to test file
    fs.writeFileSync('C:/Users/Administrator/Documents/kimi/workspace/test_block2.js', code.substring(0, 1100));
    try {
      new Function(code.substring(0, 1100));
      console.log('1100 chars OK');
    } catch (e) {
      console.log('1100 chars error: ' + e.message);
    }
  }
}

const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    const code = m[1];
    // Replace multi-line array literals with empty arrays
    // Match: const NAME = [ ...multi-line content... ];
    const safeCode = code.replace(/const\s+(\w+)\s*=\s*\[[\s\S]*?\];/g, 'const $1 = [];');
    try {
      new Function(safeCode);
      console.log('Block 2: OK (with multi-line arrays replaced)');
    } catch (e) {
      console.log('Block 2: ERROR - ' + e.message);
      let low = 0, high = safeCode.length, badPos = 0;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        try {
          new Function(safeCode.substring(0, mid));
          low = mid + 1;
        } catch (err) {
          badPos = mid;
          high = mid;
        }
      }
      const lineNum = safeCode.substring(0, badPos).split('\n').length;
      console.log('  Bad position: ' + badPos + ', Line: ' + lineNum);
      console.log('  Context: [' + safeCode.substring(badPos - 50, badPos + 50) + ']');
    }
  }
}

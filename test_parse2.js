const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    const code = m[1];
    // Replace all array/object literals that start with [ but don't have closing ] in the same line
    // with empty arrays for syntax checking
    const lines = code.split('\n');
    let processedCode = '';
    let inArray = false;
    let arrayStartLine = 0;
    
    lines.forEach((line, i) => {
      if (!inArray && /const\s+\w+\s*=\s*\[/.test(line) && !line.includes('];')) {
        inArray = true;
        arrayStartLine = i;
      }
      if (inArray && line.includes('];')) {
        inArray = false;
      }
      if (!inArray) {
        processedCode += line + '\n';
      }
    });
    
    try {
      new Function(processedCode);
      console.log('Block 2: OK (with arrays removed)');
    } catch (e) {
      console.log('Block 2: ERROR - ' + e.message);
      // Find error position
      let low = 0, high = processedCode.length, badPos = 0;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        try {
          new Function(processedCode.substring(0, mid));
          low = mid + 1;
        } catch (err) {
          badPos = mid;
          high = mid;
        }
      }
      const lineNum = processedCode.substring(0, badPos).split('\n').length;
      console.log('  Bad position: ' + badPos + ', Line: ' + lineNum);
    }
  }
}

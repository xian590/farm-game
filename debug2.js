const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    const c = m[1];
    // Check first 1200 chars
    const testCode = c.substring(0, 1200);
    try {
      new Function(testCode);
      console.log('First 1200 chars OK');
    } catch (e) {
      console.log('First 1200 chars error: ' + e.message);
      // Find exact position by binary search
      let low = 1000, high = 1200;
      let badPos = 1000;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        try {
          new Function(c.substring(0, mid));
          low = mid + 1;
        } catch (err) {
          badPos = mid;
          high = mid;
        }
      }
      console.log('Bad position: ' + badPos);
      const context = c.substring(badPos - 30, badPos + 30);
      console.log('Context: [' + context + ']');
      // Show hex codes of characters around bad position
      for (let i = badPos - 10; i <= badPos + 10; i++) {
        if (i >= 0 && i < c.length) {
          const char = c[i];
          const hex = char.charCodeAt(0).toString(16);
          console.log('  Pos ' + i + ': ' + (char === '\n' ? '\\n' : char === '\r' ? '\\r' : char) + ' (0x' + hex + ')');
        }
      }
    }
  }
}

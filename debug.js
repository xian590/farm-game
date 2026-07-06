const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  if (bn === 2) {
    const c = m[1];
    try {
      new Function(c);
      console.log('Block 2 parsed OK');
    } catch (e) {
      console.log('Error: ' + e.message);
      const ticks = (c.match(/`/g) || []);
      console.log('Backticks: ' + ticks.length);
      if (ticks.length % 2 !== 0) {
        console.log('ODD backticks - unclosed template literal!');
      }
      const parenOpen = c.match(/\(/g) || [];
      const parenClose = c.match(/\)/g) || [];
      console.log('Paren open: ' + parenOpen.length + ', close: ' + parenClose.length);
      const braceOpen = c.match(/\{/g) || [];
      const braceClose = c.match(/\}/g) || [];
      console.log('Brace open: ' + braceOpen.length + ', close: ' + braceClose.length);
      const bracketOpen = c.match(/\[/g) || [];
      const bracketClose = c.match(/\]/g) || [];
      console.log('Bracket open: ' + bracketOpen.length + ', close: ' + bracketClose.length);
    }
  }
}

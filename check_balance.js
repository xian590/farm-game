const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(html)) !== null) {
  bn++;
  const c = m[1];
  const parenOpen = (c.match(/\(/g) || []).length;
  const parenClose = (c.match(/\)/g) || []).length;
  const braceOpen = (c.match(/\{/g) || []).length;
  const braceClose = (c.match(/\}/g) || []).length;
  const bracketOpen = (c.match(/\[/g) || []).length;
  const bracketClose = (c.match(/\]/g) || []).length;
  const tickOpen = (c.match(/`/g) || []).length;
  
  console.log('Block ' + bn + ':');
  console.log('  Paren: ' + parenOpen + '/' + parenClose + ' ' + (parenOpen === parenClose ? 'OK' : 'MISMATCH'));
  console.log('  Brace: ' + braceOpen + '/' + braceClose + ' ' + (braceOpen === braceClose ? 'OK' : 'MISMATCH'));
  console.log('  Bracket: ' + bracketOpen + '/' + bracketClose + ' ' + (bracketOpen === bracketClose ? 'OK' : 'MISMATCH'));
  console.log('  Backticks: ' + tickOpen + (tickOpen % 2 === 0 ? ' OK' : ' MISMATCH'));
}

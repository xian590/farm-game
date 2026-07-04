const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const lines = c.split('\n');
let start = -1;
for (let i = 0; i < lines.length; i++) {
  if (/function _doSellCrop/.test(lines[i])) { start = i; break; }
}
if (start >= 0) {
  for (let i = start; i < Math.min(start + 30, lines.length); i++) {
    console.log((i + 1) + ': ' + lines[i]);
  }
}

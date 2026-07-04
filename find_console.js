const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const lines = c.split('\n');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (/console\.(log|warn|error)/.test(lines[i])) {
    count++;
    console.log('L' + (i + 1) + ': ' + lines[i].trim().substring(0, 120));
  }
}
console.log('Total: ' + count);

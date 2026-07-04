const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const idx = c.indexOf('function _doSellCrop');
const lines = c.substring(idx).split('\n');
// Find where this function ends (next function declaration at same indentation level)
let endLine = 0;
for (let i = 1; i < lines.length; i++) {
    if (/^function /.test(lines[i])) {
        endLine = i;
        break;
    }
}
console.log('Function length: ' + endLine + ' lines');
console.log('Last 10 lines:');
for (let i = Math.max(0, endLine - 10); i < endLine; i++) {
    console.log(lines[i]);
}
console.log('---');
console.log(lines[endLine]);

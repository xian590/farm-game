const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (/^function sellCrop/.test(lines[i])) {
        console.log('L' + (i+1) + ': ' + lines[i]);
        for (let j = i+1; j < Math.min(i+25, lines.length); j++) {
            console.log('  ' + lines[j]);
        }
        break;
    }
}

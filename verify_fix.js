const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const lines = c.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('lastChatDay = {}') && lines[i-1] && lines[i-1].includes('重置每日NPC')) {
        console.log('Verified at L' + (i+1) + ':');
        console.log('  L' + i + ': ' + lines[i-1]);
        console.log('  L' + (i+1) + ': ' + lines[i]);
        console.log('  L' + (i+2) + ': ' + lines[i+1]);
    }
}

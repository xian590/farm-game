const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find DEFAULT_GAME_STATE more carefully - it should be in JS section
const initIdx = c.indexOf('const DEFAULT_GAME_STATE = {');
console.log('DEFAULT_GAME_STATE found at:', initIdx);

// Get a chunk of context
const context = c.substring(initIdx, initIdx + 5000);
const lines = context.split(/\r?\n/);
console.log('\nFirst 50 lines of DEFAULT_GAME_STATE:');
for (let i = 0; i < Math.min(50, lines.length); i++) {
    console.log((i+1) + ': ' + lines[i].substring(0, 100));
}

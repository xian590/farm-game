const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find game initialization patterns
const patterns = [
    'let game = {',
    'var game = {',
    'const game = {',
    'game = {',
    'DEFAULT_GAME_STATE',
    'function initGame',
    'function startNewGame',
    'function createNewGame'
];

for (const p of patterns) {
    const idx = c.indexOf(p);
    if (idx >= 0) {
        const lineNum = c.substring(0, idx).split(/\r?\n/).length;
        console.log('Found "' + p + '" at L' + lineNum);
    }
}

// Find the actual game object initialization
console.log('\n=== Searching for game init ===');
const lines = c.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
    if (/^(let|var|const)\s+game\s*=/.test(lines[i]) || /^game\s*=\s*\{/.test(lines[i])) {
        console.log('L' + (i+1) + ': ' + lines[i].trim().substring(0, 100));
        for (let j = i+1; j < Math.min(i+20, lines.length); j++) {
            console.log('  L' + (j+1) + ': ' + lines[j].trim().substring(0, 100));
        }
        break;
    }
}

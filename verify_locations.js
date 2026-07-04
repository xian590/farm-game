const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Check where delete game._modalPauseStack appears
const idx = c.indexOf('delete game._modalPauseStack');
console.log('First occurrence at position:', idx);
if (idx >= 0) {
    const lineNum = c.substring(0, idx).split(/\r?\n/).length;
    console.log('Line number:', lineNum);
    // Get context
    const start = Math.max(0, idx - 200);
    const end = Math.min(c.length, idx + 200);
    console.log('Context:', JSON.stringify(c.substring(start, end)));
}

// Check if saveGame has it
const saveIdx = c.indexOf('function saveGame');
const saveEnd = c.indexOf('function ', saveIdx + 20);
const saveFn = c.substring(saveIdx, saveEnd);
console.log('\nIn saveGame:', saveFn.includes('_modalPauseStack'));

// Check fixSaveData for version
const fixIdx = c.indexOf('function fixSaveData');
const fixEnd = c.indexOf('function ', fixIdx + 20);
const fixFn = c.substring(fixIdx, fixEnd);
console.log('In fixSaveData - version:', fixFn.includes('game.version'));
console.log('In fixSaveData - saveVersion:', fixFn.includes('game.saveVersion'));

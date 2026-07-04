const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find saveGame function and check its transient cleanup
const saveIdx = c.indexOf('function saveGame');
const saveEnd = c.indexOf('function ', saveIdx + 20);
const saveFn = c.substring(saveIdx, saveEnd);

console.log('=== saveGame transient cleanup (actual code) ===');
// Find delete patterns with various prefixes
const deleteMatches = saveFn.match(/delete\s+\w+\._\w+/g) || [];
console.log('Delete _* fields:', deleteMatches.length);
deleteMatches.forEach(m => console.log('  ' + m));

const deleteMatches2 = saveFn.match(/delete\s+\w+\.needsRender/g) || [];
console.log('\nDelete needsRender:', deleteMatches2.length);
deleteMatches2.forEach(m => console.log('  ' + m));

// Check what fields are actually used
console.log('\n=== Transient fields used in game ===');
const transientFields = [
    '_clickLock', '_savePending', '_modalPauseStack', '_toastTimer', 
    '_closeModalTimeout', '_loadGameSpeedTimeout', 'needsRender', 
    '_maxIterations', '_seasonIterations', '_currentModal', '_currentEvent'
];
for (const field of transientFields) {
    const inGame = c.includes('game.' + field);
    const inSave = saveFn.includes(field);
    console.log((inSave ? 'OK' : 'MISSING') + ': ' + field + (inGame ? ' (used)' : ' (unused)'));
}

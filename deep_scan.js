const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find saveGame function and extract transient cleanup section
const saveIdx = c.indexOf('function saveGame');
let braceCount = 0;
let foundFirstBrace = false;
let saveEnd = saveIdx;
for (let i = saveIdx; i < c.length; i++) {
    if (c[i] === '{') { braceCount++; foundFirstBrace = true; }
    else if (c[i] === '}') { braceCount--; }
    if (foundFirstBrace && braceCount === 0) { saveEnd = i; break; }
}
const saveFn = c.substring(saveIdx, saveEnd + 1);

// Check if _modalPauseStack is cleaned up
const hasModalCleanup = saveFn.includes('_modalPauseStack');
console.log('saveGame has _modalPauseStack cleanup:', hasModalCleanup);

// Find all transient fields that are deleted
const deleteMatches = saveFn.match(/delete\s+game\._\w+/g) || [];
console.log('\nAlready cleaned up:', deleteMatches);

// Check initGame fields
const initIdx = c.indexOf('function initGame');
let initBrace = 0;
let initFound = false;
let initEnd = initIdx;
for (let i = initIdx; i < c.length; i++) {
    if (c[i] === '{') { initBrace++; initFound = true; }
    else if (c[i] === '}') { initBrace--; }
    if (initFound && initBrace === 0) { initEnd = i; break; }
}
const initFn = c.substring(initIdx, initEnd + 1);

// Extract game = { ... } from initGame
const gameAssignIdx = initFn.indexOf('game = {');
let gameBrace = 0;
let gameFound = false;
let gameEnd = gameAssignIdx;
for (let i = gameAssignIdx; i < initFn.length; i++) {
    if (initFn[i] === '{') { gameBrace++; gameFound = true; }
    else if (initFn[i] === '}') { gameBrace--; }
    if (gameFound && gameBrace === 0 && initFn[i] === ';') { gameEnd = i; break; }
}
const gameInit = initFn.substring(gameAssignIdx, gameEnd + 1);

// Parse fields
const fieldMatches = gameInit.match(/^\s+(\w+):/gm) || [];
const fields = fieldMatches.map(m => m.trim().replace(':', ''));
console.log('\n=== initGame game fields (' + fields.length + ') ===');
console.log(fields.join(', '));

// Check which are in fixSaveData
const fixIdx = c.indexOf('function fixSaveData');
let fixBrace = 0;
let fixFound = false;
let fixEnd = fixIdx;
for (let i = fixIdx; i < c.length; i++) {
    if (c[i] === '{') { fixBrace++; fixFound = true; }
    else if (c[i] === '}') { fixBrace--; }
    if (fixFound && fixBrace === 0) { fixEnd = i; break; }
}
const fixFn = c.substring(fixIdx, fixEnd + 1);

let missingInFix = [];
for (const field of fields) {
    if (!fixFn.includes(field)) {
        // Check if field is used elsewhere in game logic
        const used = c.includes('game.' + field) || c.includes('save.' + field);
        if (used) missingInFix.push(field);
    }
}
console.log('\n=== Missing in fixSaveData but used ===');
console.log(missingInFix.join(', '));

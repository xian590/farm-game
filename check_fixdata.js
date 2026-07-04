const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Extract fixSaveData function
const fixIdx = c.indexOf('function fixSaveData');
let braceCount = 0;
let foundFirstBrace = false;
let fixEnd = fixIdx;
for (let i = fixIdx; i < c.length; i++) {
    if (c[i] === '{') { braceCount++; foundFirstBrace = true; }
    else if (c[i] === '}') { braceCount--; }
    if (foundFirstBrace && braceCount === 0) { fixEnd = i; break; }
}
const fixFn = c.substring(fixIdx, fixEnd + 1);

// Extract DEFAULT_GAME_STATE
const initIdx = c.indexOf('const DEFAULT_GAME_STATE = {');
let initBrace = 0;
let initFound = false;
let initEnd = initIdx;
for (let i = initIdx; i < c.length && (!initFound || initBrace > 0); i++) {
    if (c[i] === '{') { initBrace++; initFound = true; }
    else if (c[i] === '}') { initBrace--; }
    if (initFound && initBrace === 0) { initEnd = i; break; }
}
const initBlock = c.substring(initIdx, initEnd + 1);

// Parse fields from DEFAULT_GAME_STATE
const fieldMatches = initBlock.match(/^\s+(\w+):/gm) || [];
const initFields = fieldMatches.map(m => m.trim().replace(':', ''));

console.log('=== DEFAULT_GAME_STATE fields:', initFields.length, '===');
console.log(initFields.slice(0, 30).join(', '));

// Check which fields are in fixSaveData
console.log('\n=== fixSaveData coverage ===');
let covered = 0;
let missing = 0;
for (const field of initFields) {
    const inFix = fixFn.includes(field);
    if (inFix) covered++;
    else {
        missing++;
        if (missing <= 20) console.log('MISSING: ' + field);
    }
}
console.log('\nCovered:', covered, 'Missing:', missing);

// Check which missing fields are actually used in game logic
console.log('\n=== Missing but used fields ===');
for (const field of initFields) {
    if (!fixFn.includes(field)) {
        const used = c.includes('game.' + field);
        if (used) {
            console.log('CRITICAL: ' + field + ' used in game but not in fixSaveData');
        }
    }
}

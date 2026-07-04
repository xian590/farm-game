const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find ALL delete game._ patterns in the file
console.log('=== ALL delete game._ patterns ===');
const matches = c.match(/delete\s+game\._\w+/g) || [];
matches.forEach(m => console.log('  ' + m));

// Find fixSaveData function content
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
console.log('\n=== fixSaveData first 30 lines ===');
const fixLines = fixFn.split(/\r?\n/);
for (let i = 0; i < Math.min(30, fixLines.length); i++) {
    console.log('  ' + fixLines[i]);
}

// Find saveGame function content - look for transient cleanup
const saveIdx = c.indexOf('function saveGame');
let sBrace = 0;
let sFound = false;
let sEnd = saveIdx;
for (let i = saveIdx; i < c.length; i++) {
    if (c[i] === '{') { sBrace++; sFound = true; }
    else if (c[i] === '}') { sBrace--; }
    if (sFound && sBrace === 0) { sEnd = i; break; }
}
const saveFn = c.substring(saveIdx, sEnd + 1);
console.log('\n=== saveGame transient cleanup section ===');
const saveLines = saveFn.split(/\r?\n/);
for (let i = 0; i < saveLines.length; i++) {
    if (saveLines[i].includes('delete') || saveLines[i].includes('_save')) {
        console.log('  L' + (i+1) + ': ' + saveLines[i]);
    }
}

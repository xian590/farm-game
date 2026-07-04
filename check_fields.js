const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Check _modalPauseStack usage
console.log('=== _modalPauseStack usage ===');
let pos = 0;
let count = 0;
while ((pos = c.indexOf('_modalPauseStack', pos)) !== -1) {
    count++;
    const lineNum = c.substring(0, pos).split(/\r?\n/).length;
    const line = c.substring(pos).match(/^[^\r\n]*/)[0];
    console.log('  L' + lineNum + ': ' + line.substring(0, 100));
    pos++;
}
console.log('Total:', count);

// Check _clickLock usage
console.log('\n=== _clickLock usage ===');
pos = 0;
count = 0;
while ((pos = c.indexOf('_clickLock', pos)) !== -1) {
    count++;
    const lineNum = c.substring(0, pos).split(/\r?\n/).length;
    const line = c.substring(pos).match(/^[^\r\n]*/)[0];
    if (count <= 5) console.log('  L' + lineNum + ': ' + line.substring(0, 100));
    pos++;
}
console.log('Total:', count);

// Check if there are fields that should be in fixSaveData but aren't
console.log('\n=== Fields in game init but not in fixSaveData ===');
const initMatch = c.match(/const DEFAULT_GAME_STATE = \{[\s\S]{0,3000}/);
if (initMatch) {
    const initFields = initMatch[0].match(/\w+:/g) || [];
    const fixIdx = c.indexOf('function fixSaveData');
    const fixEnd = c.indexOf('function ', fixIdx + 20);
    const fixFn = c.substring(fixIdx, fixEnd);
    
    let missing = 0;
    for (const fieldMatch of initFields) {
        const field = fieldMatch.replace(':', '');
        if (!fixFn.includes(field + ' ') && !fixFn.includes(field + '=') && !fixFn.includes(field + ')') && !fixFn.includes('.' + field)) {
            // Check if field is actually used in game logic
            if (c.includes('game.' + field) || c.includes('save.' + field)) {
                missing++;
                if (missing <= 15) {
                    console.log('  MISSING: ' + field);
                }
            }
        }
    }
    console.log('Total missing from fixSaveData:', missing);
}

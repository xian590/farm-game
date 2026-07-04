const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// 1. Check saveGame transient field cleanup
const saveIdx = c.indexOf('function saveGame');
const saveEnd = c.indexOf('function ', saveIdx + 20);
const saveFn = c.substring(saveIdx, saveEnd);

console.log('=== saveGame transient fields cleanup ===');
const deleteMatches = saveFn.match(/delete\s+save\.\w+/g) || [];
console.log('Fields deleted from save:', deleteMatches.length);
deleteMatches.forEach(m => console.log('  ' + m));

// Check for fields set on game but not deleted in saveGame
const transientFields = ['_clickLock', '_savePending', '_modalPauseStack', '_toastTimer', '_closeModalTimeout', '_loadGameSpeedTimeout', 'needsRender', '_maxIterations', '_seasonIterations'];
console.log('\n=== Checking transient fields ===');
for (const field of transientFields) {
    const inSave = saveFn.includes('delete save.' + field);
    const inGame = c.includes('game.' + field);
    if (inGame && !inSave) {
        console.log('MISSING: ' + field + ' (used in game, not deleted in saveGame)');
    } else if (inGame && inSave) {
        console.log('OK: ' + field);
    }
}

// 2. Check fixSaveData for pet-related fields
const fixIdx = c.indexOf('function fixSaveData');
const fixEnd = c.indexOf('function ', fixIdx + 20);
const fixFn = c.substring(fixIdx, fixEnd);

console.log('\n=== fixSaveData pet field coverage ===');
const petFields = ['pets', 'petAffection', 'petFood', 'petUnlocks', 'petHappiness', 'petPlayCount'];
for (const field of petFields) {
    const inFix = fixFn.includes(field);
    const inGame = c.includes('game.' + field);
    if (inGame && !inFix) {
        console.log('MISSING: game.' + field + ' (used but not in fixSaveData)');
    } else if (inGame && inFix) {
        console.log('OK: ' + field);
    }
}

// 3. Check for unguarded parseFloat/parseInt
console.log('\n=== Checking parseInt/parseFloat ===');
const lines = c.split(/\r?\n/);
let parseIssues = 0;
for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('parseInt(') || lines[i].includes('parseFloat(')) && !lines[i].includes('isNaN')) {
        // Skip safe patterns
        if (!lines[i].includes('|| 0') && !lines[i].includes('||0') && !lines[i].includes('|| default') && !lines[i].includes('Math.floor')) {
            parseIssues++;
            if (parseIssues <= 10) {
                console.log('  L' + (i+1) + ': ' + lines[i].trim().substring(0, 80));
            }
        }
    }
}
console.log('Potential unguarded parse calls:', parseIssues);

// 4. Check for fields that may cause NaN
console.log('\n=== Checking NaN-prone operations ===');
const nanPatterns = [
    { pattern: /game\.\w+\s*\*\s*\w+/, desc: 'multiplication without isFinite check' },
    { pattern: /Math\.random\(\)\s*\*\s*\w+/, desc: 'random multiplication' },
];
let nanIssues = 0;
for (let i = 0; i < lines.length; i++) {
    for (const p of nanPatterns) {
        if (p.pattern.test(lines[i])) {
            const nearby = lines.slice(Math.max(0, i-1), i+2).join('');
            if (!nearby.includes('isFinite') && !nearby.includes('sanitizeNumber') && !nearby.includes('Math.floor')) {
                nanIssues++;
                if (nanIssues <= 5) {
                    console.log('  L' + (i+1) + ': ' + lines[i].trim().substring(0, 60));
                }
            }
        }
    }
}
console.log('Potential NaN issues:', nanIssues);

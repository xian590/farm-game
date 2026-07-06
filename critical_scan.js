const fs = require('fs');
const js = fs.readFileSync('farm_game.html', 'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];
const lines = js.split('\n');

console.log('=== Critical Bug Scan ===\n');

// 1. Check for functions that might throw without null checks
const criticalFunctions = [
    'updateUI', 'renderPanel', 'renderFieldsPanel', 'renderShopPanel',
    'growCrops', 'onNewDay', 'advanceSeason', 'processTime'
];

for (const fn of criticalFunctions) {
    const regex = new RegExp(`function ${fn}\\s*\\(`);
    if (!regex.test(js)) {
        console.log(`❌ Function ${fn} not found`);
    }
}

// 2. Check for potential division by zero
console.log('\n--- Division Safety ---');
let divIssues = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Find divisions that don't check denominator
    if (/\/[\s]*(\w+|\([^)]+\))/.test(line) && !line.includes('//')) {
        // Skip comments and obvious safe patterns
        if (!line.includes('||') && !line.includes('!== 0') && !line.includes('> 0')) {
            const match = line.match(/\/[\s]*([a-zA-Z_$][a-zA-Z0-9_$]*|\([^)]+\))/);
            if (match) {
                divIssues++;
                if (divIssues <= 3) {
                    console.log(`Line ${i+1}: ${line.trim().substring(0, 60)}`);
                }
            }
        }
    }
}
if (divIssues > 0) console.log(`⚠️ ${divIssues} potential division issues`);

// 3. Check for array access without bounds check
console.log('\n--- Array Access Safety ---');
let arrayIssues = 0;
for (let i = 0; i < lines.length; i++) {
    if (/\w+\[\d+\]/.test(lines[i]) && !lines[i].includes('length')) {
        // Simple array index access without .length check
        if (!lines[i].includes('if (')) {
            arrayIssues++;
        }
    }
}
console.log(`Array index accesses: ${arrayIssues}`);

// 4. Check for innerHTML with user-controlled data
console.log('\n--- XSS Check ---');
let xssCount = 0;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('innerHTML') && lines[i].includes('+')) {
        if (!lines[i].includes('escapeHtml') && !lines[i].includes('allowHtml')) {
            xssCount++;
        }
    }
}
console.log(`Potentially unsafe innerHTML: ${xssCount}`);

// 5. Check for missing try-catch in critical sections
console.log('\n--- Try-Catch Coverage ---');
const criticalSections = [
    { name: 'saveGame', found: false },
    { name: 'loadGame', found: false },
    { name: 'gameTick', found: false },
    { name: 'exportSaveFile', found: false },
    { name: 'importSaveFile', found: false }
];

for (let i = 0; i < lines.length; i++) {
    for (const section of criticalSections) {
        if (lines[i].includes(`function ${section.name}`)) {
            // Check next 5 lines for try
            for (let j = i; j < Math.min(i+5, lines.length); j++) {
                if (lines[j].includes('try {')) {
                    section.found = true;
                    break;
                }
            }
        }
    }
}

for (const section of criticalSections) {
    console.log(`${section.found ? '✅' : '⚠️'} ${section.name}: ${section.found ? 'has' : 'no'} try-catch`);
}

// 6. Check for potential infinite recursion
console.log('\n--- Recursion Check ---');
const recursiveCalls = [
    { caller: 'saveGame', callee: 'saveGame' },
    { caller: 'updateUI', callee: 'updateUI' },
    { caller: 'renderPanel', callee: 'renderPanel' },
    { caller: 'showModal', callee: 'showModal' }
];
for (const {caller, callee} of recursiveCalls) {
    const fnRegex = new RegExp(`function ${caller}\\s*\\(`);
    const callRegex = new RegExp(`\\b${callee}\\s*\\(`);
    
    let inFunction = false;
    let braceDepth = 0;
    let found = false;
    
    for (let i = 0; i < lines.length; i++) {
        if (fnRegex.test(lines[i])) {
            inFunction = true;
            braceDepth = 0;
        }
        if (inFunction) {
            for (const ch of lines[i]) {
                if (ch === '{') braceDepth++;
                if (ch === '}') braceDepth--;
            }
            if (braceDepth > 0 && callRegex.test(lines[i]) && !lines[i].includes(`function ${callee}`)) {
                found = true;
                break;
            }
            if (braceDepth <= 0 && i > 0) inFunction = false;
        }
    }
    if (found) console.log(`⚠️ ${caller} calls ${callee} (potential recursion)`);
}

// 7. Check global variable pollution
console.log('\n--- Global Variables ---');
const globalVars = (js.match(/^\s*(let|var|const)\s+(\w+)/gm) || []).length;
console.log(`Top-level declarations: ${globalVars}`);

console.log('\n=== Scan Complete ===');

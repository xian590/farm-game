const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index-manifestation.html');
if (!fs.existsSync(filePath)) {
    console.error('File not found: index-manifestation.html');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const results = {
    duplicateFunctions: [],
    invalidCSS: [],
    missingCatch: [],
    undefinedVars: [],
    nullDereferences: []
};

// ==========================
// 1. Duplicate function definitions
// ==========================
const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
const functionDefs = {};

lines.forEach((line, idx) => {
    let m;
    while ((m = functionRegex.exec(line)) !== null) {
        const name = m[1];
        if (!functionDefs[name]) functionDefs[name] = [];
        functionDefs[name].push(idx + 1);
    }
});

for (const [name, lineNums] of Object.entries(functionDefs)) {
    if (lineNums.length > 1) {
        results.duplicateFunctions.push({ name, lines: lineNums });
    }
}

// ==========================
// 2. Invalid CSS properties
// ==========================
const invalidProps = [
    'ring-color', 'outline-color', 'text-stroke', 'box-color',
    'border-color-color', 'background-color-color', 'color-color',
    'gradient-color', 'shadow-color', 'fill-color'
];
const cssRegex = new RegExp(`\\b(${invalidProps.join('|')})\\s*:`, 'g');

lines.forEach((line, idx) => {
    let m;
    while ((m = cssRegex.exec(line)) !== null) {
        results.invalidCSS.push({ property: m[1], line: idx + 1, snippet: line.trim().substring(0, 120) });
    }
});

// Also check in style attributes / <style> blocks for suspicious patterns
const styleBlockRegex = /<style[\s\S]*?<\/style>/gi;
let styleMatch;
const styleBlocks = [];
while ((styleMatch = styleBlockRegex.exec(content)) !== null) {
    styleBlocks.push(styleMatch[0]);
}

// ==========================
// 3. Missing .catch() on Promises
// ==========================
// Find .then() calls and check if there's a .catch() on the same chain within ~5 lines
const thenRegex = /\.then\(/g;
const catchRegex = /\.catch\(/g;

lines.forEach((line, idx) => {
    let m;
    while ((m = thenRegex.exec(line)) !== null) {
        // Look ahead up to 15 lines for a .catch on the same variable/chain
        let hasCatch = false;
        for (let i = idx; i < Math.min(idx + 15, lines.length); i++) {
            if (catchRegex.test(lines[i])) {
                hasCatch = true;
                break;
            }
        }
        // Also check if this line itself has catch or is inside a try-catch
        if (!hasCatch) {
            // Check if inside try block
            let inTry = false;
            for (let i = idx; i >= Math.max(0, idx - 20); i--) {
                if (/\btry\b/.test(lines[i])) { inTry = true; break; }
                if (/\bcatch\b/.test(lines[i])) { inTry = false; break; }
            }
            if (!inTry) {
                results.missingCatch.push({ line: idx + 1, snippet: line.trim().substring(0, 120) });
            }
        }
    }
});

// ==========================
// 4. Variables that might be undefined
// 5. Potential null dereferences
// ==========================
// These are hard to do precisely without parsing, so we focus on patterns

// Common pattern: var used before declaration or in different branch
const varDecls = new Set();
const potentialUndefined = [];

// Collect all var/let/const declarations
lines.forEach((line, idx) => {
    const declMatch = line.match(/\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (declMatch) {
        declMatch.forEach(d => {
            const name = d.replace(/\b(var|let|const)\s+/, '');
            varDecls.add(name);
        });
    }
});

// Look for references to likely undefined variables (focus on known globals that might be typos)
const knownGlobals = ['window', 'document', 'console', 'localStorage', 'sessionStorage', 'Math', 'JSON', 'Date', 'Array', 'Object', 'String', 'Number', 'Promise', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch', 'alert', 'confirm', 'prompt', 'navigator', 'location', 'history'];

// Look for potential typos of known globals
lines.forEach((line, idx) => {
    // Check for things like documnet, windwo, conosle, etc.
    const typoPatterns = [
        [/\bdocumnet\b/, 'documnet (should be document)'],
        [/\bwindwo\b/, 'windwo (should be window)'],
        [/\bconosle\b/, 'conosle (should be console)'],
        [/\blocalSotrage\b/, 'localSotrage (should be localStorage)'],
        [/\bsetImeout\b/, 'setImeout (should be setTimeout)'],
        [/\bcleraTimeout\b/, 'cleraTimeout (should be clearTimeout)'],
        [/\bgetELementById\b/, 'getELementById (should be getElementById)'],
        [/\bgetELementsByClassName\b/, 'getELementsByClassName (should be getElementsByClassName)'],
        [/\baddEVentListener\b/, 'addEVentListener (should be addEventListener)'],
        [/\bquerrySelector\b/, 'querrySelector (should be querySelector)'],
    ];
    typoPatterns.forEach(([regex, msg]) => {
        if (regex.test(line)) {
            results.undefinedVars.push({ line: idx + 1, message: msg, snippet: line.trim().substring(0, 120) });
        }
    });
});

// Null dereferences: look for patterns like `foo.bar` where `foo` is a variable and could be null
// We'll look for common patterns: document.getElementById(...).something without null check
const nullDerefPatterns = [
    // getElementById without null check followed by immediate property access
    { regex: /getElementById\([^)]+\)\s*\.\s*[a-zA-Z_$]/g, desc: 'getElementById result used without null check' },
    // querySelector without null check
    { regex: /querySelector\([^)]+\)\s*\.\s*[a-zA-Z_$]/g, desc: 'querySelector result used without null check' },
    // JSON.parse without try-catch
    { regex: /JSON\.parse\([^)]+\)(?!\s*catch)/g, desc: 'JSON.parse without try-catch' },
];

lines.forEach((line, idx) => {
    nullDerefPatterns.forEach(({ regex, desc }) => {
        let m;
        while ((m = regex.exec(line)) !== null) {
            // Check if it's inside a try-catch or has a null check nearby
            let hasNullCheck = false;
            for (let i = Math.max(0, idx - 5); i <= Math.min(lines.length - 1, idx + 5); i++) {
                if (/if\s*\(.*!=\s*null|if\s*\(.*!==\s*null|if\s*\(.*\)/.test(lines[i]) && i !== idx) {
                    hasNullCheck = true;
                }
            }
            if (!hasNullCheck) {
                results.nullDereferences.push({ line: idx + 1, desc, snippet: line.trim().substring(0, 120) });
            }
        }
    });
});

// Also check for foo?.bar vs foo.bar (optional chaining vs not)
// Look for property access on variables that are likely DOM elements or optional
const propAccessRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\.\s*(innerHTML|textContent|style|classList|addEventListener|removeEventListener|appendChild|removeChild|insertBefore|setAttribute|getAttribute|className|id|value|checked|disabled|selected|href|src|onclick|onchange|onload)/g;

lines.forEach((line, idx) => {
    let m;
    while ((m = propAccessRegex.exec(line)) !== null) {
        const varName = m[1];
        // Skip known safe globals
        if (['document', 'window', 'console', 'this', 'event', 'e', 'evt', 'target', 'currentTarget', 'element', 'el', 'node', 'item', 'obj', 'data', 'result', 'response', 'res', 'error', 'err'].includes(varName)) continue;
        // Check if it has optional chaining or null check nearby
        if (line.includes(`${varName}?.`) || line.includes(`${varName}?.`)) continue;
        // Check nearby lines for null check
        let hasNullCheck = false;
        for (let i = Math.max(0, idx - 5); i <= Math.min(lines.length - 1, idx + 5); i++) {
            const nearby = lines[i];
            if (nearby.includes(`if (${varName}`) || nearby.includes(`if(${varName}`) || nearby.includes(`${varName} != null`) || nearby.includes(`${varName} !== null`) || nearby.includes(`${varName}?.`)) {
                hasNullCheck = true;
                break;
            }
        }
        if (!hasNullCheck) {
            // Only report if it looks like it could be a real issue
            if (line.includes('getElementById') || line.includes('querySelector') || line.includes('find') || line.includes('filter') || line.includes('pop') || line.includes('shift')) {
                results.nullDereferences.push({ line: idx + 1, desc: `Potential null dereference on '${varName}'`, snippet: line.trim().substring(0, 120) });
            }
        }
    }
});

// ==========================
// Output results
// ==========================
console.log('='.repeat(70));
console.log('BUG ANALYSIS REPORT: index-manifestation.html');
console.log('='.repeat(70));
console.log(`File size: ${(content.length / 1024).toFixed(1)} KB, ${lines.length} lines`);
console.log('');

// 1. Duplicate functions
console.log('1. DUPLICATE FUNCTION DEFINITIONS');
console.log('-'.repeat(50));
if (results.duplicateFunctions.length === 0) {
    console.log('  None found.\n');
} else {
    results.duplicateFunctions.forEach(d => {
        console.log(`  [WARN] Function '${d.name}' defined ${d.lines.length} times at lines: ${d.lines.join(', ')}`);
    });
    console.log('');
}

// 2. Invalid CSS
console.log('2. INVALID CSS PROPERTIES');
console.log('-'.repeat(50));
if (results.invalidCSS.length === 0) {
    console.log('  None found.\n');
} else {
    results.invalidCSS.slice(0, 30).forEach(item => {
        console.log(`  [WARN] Line ${item.line}: invalid property '${item.property}'`);
        console.log(`         ${item.snippet}`);
    });
    if (results.invalidCSS.length > 30) console.log(`  ... and ${results.invalidCSS.length - 30} more`);
    console.log('');
}

// 3. Missing .catch()
console.log('3. MISSING .catch() ON PROMISES');
console.log('-'.repeat(50));
if (results.missingCatch.length === 0) {
    console.log('  None found.\n');
} else {
    results.missingCatch.slice(0, 30).forEach(item => {
        console.log(`  [WARN] Line ${item.line}: .then() without nearby .catch() or try-catch`);
        console.log(`         ${item.snippet}`);
    });
    if (results.missingCatch.length > 30) console.log(`  ... and ${results.missingCatch.length - 30} more`);
    console.log('');
}

// 4. Undefined vars
console.log('4. VARIABLES THAT MIGHT BE UNDEFINED (TYPO/GLOBAL CHECK)');
console.log('-'.repeat(50));
if (results.undefinedVars.length === 0) {
    console.log('  None found.\n');
} else {
    results.undefinedVars.forEach(item => {
        console.log(`  [WARN] Line ${item.line}: ${item.message}`);
        console.log(`         ${item.snippet}`);
    });
    console.log('');
}

// 5. Null dereferences
console.log('5. POTENTIAL NULL DEREFERENCES');
console.log('-'.repeat(50));
if (results.nullDereferences.length === 0) {
    console.log('  None found.\n');
} else {
    const unique = new Map();
    results.nullDereferences.forEach(item => {
        const key = `${item.line}-${item.desc}`;
        if (!unique.has(key)) unique.set(key, item);
    });
    Array.from(unique.values()).slice(0, 30).forEach(item => {
        console.log(`  [WARN] Line ${item.line}: ${item.desc}`);
        console.log(`         ${item.snippet}`);
    });
    if (unique.size > 30) console.log(`  ... and ${unique.size - 30} more unique issues`);
    console.log('');
}

console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`  Duplicate functions:     ${results.duplicateFunctions.length}`);
console.log(`  Invalid CSS properties:  ${results.invalidCSS.length}`);
console.log(`  Missing .catch():        ${results.missingCatch.length}`);
console.log(`  Undefined variables:     ${results.undefinedVars.length}`);
console.log(`  Null dereferences:       ${new Map(results.nullDereferences.map(i => [`${i.line}-${i.desc}`, i])).size}`);
console.log('');
console.log('Note: Some findings may be false positives. Manual review recommended.');

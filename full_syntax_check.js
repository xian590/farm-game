const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Extract JavaScript from script tag
const scriptMatch = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    console.log('No script tag found');
    process.exit(1);
}

const js = scriptMatch[1];

// Check 1: Basic syntax
console.log('=== Check 1: Basic Syntax ===');
try {
    new Function(js);
    console.log('✅ Basic syntax OK');
} catch (e) {
    console.log('❌ Syntax Error:', e.message);
    console.log('Position:', e.pos);
    // Show context
    const lines = js.split('\n');
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= (e.pos || 0)) {
            console.log('Around line', i + 1);
            for (let j = Math.max(0, i-3); j < Math.min(lines.length, i+4); j++) {
                console.log((j+1) + ': ' + lines[j].substring(0, 100));
            }
            break;
        }
        charCount += lines[i].length + 1;
    }
}

// Check 2: Brace balance
console.log('\n=== Check 2: Brace Balance ===');
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inLineComment = false;

for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const prev = js[i-1];
    
    // Handle comments
    if (!inString && !inComment && !inLineComment) {
        if (ch === '/' && js[i+1] === '*') {
            inComment = true;
            i++;
            continue;
        }
        if (ch === '/' && js[i+1] === '/') {
            inLineComment = true;
            i++;
            continue;
        }
    }
    
    if (inComment && ch === '*' && js[i+1] === '/') {
        inComment = false;
        i++;
        continue;
    }
    
    if (inLineComment && ch === '\n') {
        inLineComment = false;
        continue;
    }
    
    if (inComment || inLineComment) continue;
    
    // Handle strings
    if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
        inString = true;
        stringChar = ch;
        continue;
    }
    if (inString && ch === stringChar && prev !== '\\') {
        inString = false;
        continue;
    }
    if (inString) continue;
    
    // Count braces
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
    if (ch === '(') parenCount++;
    if (ch === ')') parenCount--;
    if (ch === '[') bracketCount++;
    if (ch === ']') bracketCount--;
}

console.log('Braces {}:', braceCount === 0 ? '✅ Balanced' : `❌ Off by ${braceCount}`);
console.log('Parentheses ():', parenCount === 0 ? '✅ Balanced' : `❌ Off by ${parenCount}`);
console.log('Brackets []:', bracketCount === 0 ? '✅ Balanced' : `❌ Off by ${bracketCount}`);

// Check 3: Check for common issues
console.log('\n=== Check 3: Common Issues ===');

// Check for undefined variables in key functions
const undefinedChecks = [
    { name: 'game', used: js.includes('game.'), declared: js.includes('let game') || js.includes('var game') || js.includes('const game') },
    { name: 'document', used: js.includes('document.'), declared: true }, // global
];

// Check 4: Function declarations
console.log('\n=== Check 4: Key Functions ===');
const keyFunctions = [
    'selectMode', 'initGame', 'showGame', 'startGameLoop', 
    'showModal', 'closeModal', 'saveGame', 'loadGame',
    'fixSaveData', 'processTime', 'renderGame'
];

for (const fn of keyFunctions) {
    const hasDeclaration = js.includes(`function ${fn}`);
    const hasCall = js.includes(`${fn}(`);
    console.log(`${hasDeclaration ? '✅' : '❌'} ${fn} (declared: ${hasDeclaration}, called: ${hasCall})`);
}

// Check 5: Check for missing closing braces in specific functions
console.log('\n=== Check 5: Function Brace Check ===');
const functionMatches = js.match(/function\s+\w+\s*\(/g) || [];
console.log(`Total functions: ${functionMatches.length}`);

// Check 6: Look for any obvious syntax issues
console.log('\n=== Check 6: Obvious Syntax Issues ===');
const issues = [];

// Check for double semicolons
const doubleSemi = js.match(/;\s*;/g);
if (doubleSemi) issues.push(`Double semicolons: ${doubleSemi.length}`);

// Check for empty if blocks that might be errors
const emptyIf = js.match(/if\s*\([^)]+\)\s*\{\s*\}/g);
if (emptyIf) issues.push(`Empty if blocks: ${emptyIf.length}`);

if (issues.length === 0) {
    console.log('✅ No obvious issues found');
} else {
    issues.forEach(i => console.log('⚠️ ' + i));
}

console.log('\n=== Summary ===');
console.log('Run in browser console for more detailed errors:');
console.log('1. Open https://cos-dq4qu31ss.site');
console.log('2. Press F12 → Console');
console.log('3. Look for red error messages');

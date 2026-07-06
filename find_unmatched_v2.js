const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const js = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];

// More precise unmatched brace finder
let braceDepth = 0;
let parenDepth = 0;
let inString = false;
let stringChar = '';
let lineNum = 1;
let lastBraceLine = 0;
let lastParenLine = 0;

for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const prev = js[i-1];
    const next = js[i+1];
    
    if (ch === '\n') lineNum++;
    
    // Handle template literals ${} specially
    if (inString && stringChar === '`' && ch === '$' && next === '{') {
        // Skip ${} in template literals - count the brace
        braceDepth++;
        i++; // skip {
        continue;
    }
    
    // Skip strings
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
    
    // Skip regex literals
    if (ch === '/' && !inString) {
        // Check if this is a regex by looking backwards
        let j = i - 1;
        while (j >= 0 && /\s/.test(js[j])) j--;
        const prevNonSpace = js[j];
        if (prevNonSpace && /[=(,\[!&|:;?]/.test(prevNonSpace)) {
            // This is likely a regex
            i++;
            while (i < js.length && js[i] !== '/') {
                if (js[i] === '\\') i++;
                i++;
            }
            continue;
        }
    }
    
    // Skip single-line comments
    if (ch === '/' && next === '/') {
        while (i < js.length && js[i] !== '\n') i++;
        lineNum++;
        continue;
    }
    
    // Skip multi-line comments
    if (ch === '/' && next === '*') {
        i += 2;
        while (i < js.length && !(js[i] === '*' && js[i+1] === '/')) {
            if (js[i] === '\n') lineNum++;
            i++;
        }
        i++;
        continue;
    }
    
    // Track braces
    if (ch === '{') {
        braceDepth++;
        lastBraceLine = lineNum;
    } else if (ch === '}') {
        braceDepth--;
        if (braceDepth < 0) {
            console.log(`❌ Extra } at line ${lineNum}`);
            braceDepth = 0;
        }
    }
    
    // Track parentheses
    if (ch === '(') {
        parenDepth++;
        lastParenLine = lineNum;
    } else if (ch === ')') {
        parenDepth--;
        if (parenDepth < 0) {
            console.log(`❌ Extra ) at line ${lineNum}`);
            parenDepth = 0;
        }
    }
}

console.log(`Final brace depth: ${braceDepth} (should be 0)`);
console.log(`Final paren depth: ${parenDepth} (should be 0)`);
if (braceDepth > 0) console.log(`Last opening brace at line ${lastBraceLine}`);
if (parenDepth > 0) console.log(`Last opening paren at line ${lastParenLine}`);

// If there's an unmatched brace, show the context
if (braceDepth > 0) {
    console.log('\nSearching for the unmatched brace context...');
    // Find the function that contains the unmatched brace
    const lines = js.split('\n');
    let currentDepth = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            if (ch === '{') currentDepth++;
            else if (ch === '}') currentDepth--;
        }
        if (i >= lastBraceLine - 10 && i <= lastBraceLine + 5) {
            console.log(`${i+1}: ${line.substring(0, 80)}`);
        }
    }
}

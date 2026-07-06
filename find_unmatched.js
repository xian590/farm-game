const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const js = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];

// Find unmatched braces with line tracking
let braceStack = [];
let parenStack = [];
let inString = false;
let stringChar = '';
let lineNum = 1;

for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const prev = js[i-1];
    
    if (ch === '\n') lineNum++;
    
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
    
    // Skip comments
    if (ch === '/' && js[i+1] === '/') {
        while (i < js.length && js[i] !== '\n') i++;
        lineNum++;
        continue;
    }
    if (ch === '/' && js[i+1] === '*') {
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
        braceStack.push({line: lineNum, pos: i});
    } else if (ch === '}') {
        if (braceStack.length === 0) {
            console.log(`❌ Unmatched } at line ${lineNum}`);
        } else {
            braceStack.pop();
        }
    }
    
    // Track parentheses
    if (ch === '(') {
        parenStack.push({line: lineNum, pos: i});
    } else if (ch === ')') {
        if (parenStack.length === 0) {
            console.log(`❌ Unmatched ) at line ${lineNum}`);
        } else {
            parenStack.pop();
        }
    }
}

// Report unmatched opening braces
if (braceStack.length > 0) {
    console.log(`\n❌ ${braceStack.length} unmatched opening brace(s):`);
    for (const b of braceStack) {
        const context = js.substring(Math.max(0, b.pos - 50), b.pos + 50).replace(/\s+/g, ' ');
        console.log(`  Line ${b.line}: ...${context}...`);
    }
}

// Report unmatched opening parens
if (parenStack.length > 0) {
    console.log(`\n❌ ${parenStack.length} unmatched opening parenthesis(es):`);
    for (const p of parenStack) {
        const context = js.substring(Math.max(0, p.pos - 50), p.pos + 50).replace(/\s+/g, ' ');
        console.log(`  Line ${p.line}: ...${context}...`);
    }
}

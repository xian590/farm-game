const fs = require('fs');

const filePath = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
let content = fs.readFileSync(filePath, 'utf-8');

// Extract JS part
const scriptStart = content.indexOf('<script>') + 8;
const scriptEnd = content.indexOf('</script>');
const htmlPart = content.slice(0, scriptStart);
const jsPart = content.slice(scriptStart, scriptEnd);
const htmlEnd = content.slice(scriptEnd);

// Replace all ?. patterns in JS
let newJs = jsPart;

// Iterative replacement for nested optional chaining
for (let iter = 0; iter < 20; iter++) {
    const before = newJs;
    
    // Find all ?. positions
    const matches = [];
    let idx = 0;
    while (true) {
        const pos = newJs.indexOf('?.', idx);
        if (pos === -1) break;
        
        // Check if it's actually optional chaining (followed by identifier or [)
        const next = newJs[pos + 2];
        if (/[a-zA-Z_$\[]/.test(next)) {
            matches.push(pos);
        }
        idx = pos + 1;
    }
    
    // Process from right to left
    let changed = false;
    for (let i = matches.length - 1; i >= 0; i--) {
        const pos = matches[i];
        
        // Find the object expression before ?.
        let objStart = pos - 1;
        let parenDepth = 0;
        let bracketDepth = 0;
        
        while (objStart >= 0) {
            const c = newJs[objStart];
            if (c === ')') parenDepth++;
            else if (c === '(') {
                if (parenDepth === 0) break;
                parenDepth--;
            }
            else if (c === ']') bracketDepth++;
            else if (c === '[') {
                if (bracketDepth === 0) break;
                bracketDepth--;
            }
            else if (!/[a-zA-Z0-9_$\.]/.test(c) && parenDepth === 0 && bracketDepth === 0) {
                if (!/\s/.test(c)) break;
            }
            objStart--;
        }
        objStart++;
        
        const objExpr = newJs.slice(objStart, pos).trim();
        
        // Check what comes after ?.
        const after = newJs[pos + 2];
        
        if (after === '[') {
            // obj?.[expr]
            // Find matching ]
            let bracketStart = pos + 3;
            let depth = 1;
            let bracketEnd = bracketStart;
            for (let j = bracketStart; j < newJs.length; j++) {
                if (newJs[j] === '[') depth++;
                else if (newJs[j] === ']') {
                    depth--;
                    if (depth === 0) {
                        bracketEnd = j + 1;
                        break;
                    }
                }
            }
            
            const expr = newJs.slice(bracketStart, bracketEnd - 1);
            const old = newJs.slice(objStart, bracketEnd);
            const replacement = `(${objExpr} && ${objExpr}[${expr}])`;
            
            newJs = newJs.slice(0, objStart) + replacement + newJs.slice(bracketEnd);
            changed = true;
        } else if (/[a-zA-Z_$]/.test(after)) {
            // obj?.prop
            // Find the property name
            let propEnd = pos + 3;
            while (propEnd < newJs.length && /[a-zA-Z0-9_$]/.test(newJs[propEnd])) {
                propEnd++;
            }
            
            const propName = newJs.slice(pos + 2, propEnd);
            const old = newJs.slice(objStart, propEnd);
            const replacement = `(${objExpr} && ${objExpr}.${propName})`;
            
            newJs = newJs.slice(0, objStart) + replacement + newJs.slice(propEnd);
            changed = true;
        }
    }
    
    if (!changed) break;
}

// Count remaining ?.
const remaining = (newJs.match(/\?\./g) || []).length;
console.log('Remaining ?. :', remaining);

// Write back
fs.writeFileSync(filePath, htmlPart + newJs + htmlEnd, 'utf-8');
console.log('Done!');

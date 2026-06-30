const fs = require('fs');

const path = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
const content = fs.readFileSync(path, 'utf-8');

// Extract JS between <script> tags
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
let syntaxErrors = [];

while ((match = scriptRegex.exec(content)) !== null) {
    scriptIndex++;
    const jsCode = match[1];
    const startPos = match.index + match[0].indexOf('>') + 1;
    
    try {
        new Function(jsCode);
    } catch (e) {
        // Try to find line number
        const linesBefore = content.substring(0, startPos).split('\n').length;
        let errorLine = linesBefore;
        if (e.message.includes('at position')) {
            const posMatch = e.message.match(/position\s+(\d+)/);
            if (posMatch) {
                const pos = parseInt(posMatch[1]);
                const beforeError = jsCode.substring(0, pos);
                errorLine = linesBefore + beforeError.split('\n').length - 1;
            }
        }
        syntaxErrors.push({
            scriptIndex,
            line: errorLine,
            message: e.message,
            snippet: jsCode.substring(Math.max(0, (e.message.includes('at position') ? parseInt(e.message.match(/position\s+(\d+)/)?.[1] || 0) - 50 : 0)), 
                                     Math.min(jsCode.length, (e.message.includes('at position') ? parseInt(e.message.match(/position\s+(\d+)/)?.[1] || 0) + 50 : 100)))
        });
    }
}

console.log(JSON.stringify({ syntaxErrors, totalScripts: scriptIndex }, null, 2));

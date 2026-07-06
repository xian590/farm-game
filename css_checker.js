const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');

// Extract style tags and check for CSS syntax issues
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let styleMatch;
let styleCount = 0;
let cssIssues = [];

while ((styleMatch = styleRegex.exec(html)) !== null) {
    styleCount++;
    const css = styleMatch[1];
    
    // Check for unbalanced braces in CSS
    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    let lineNum = 1;
    
    for (let i = 0; i < css.length; i++) {
        if (css[i] === '\n') lineNum++;
        
        if (inString) {
            if (css[i] === stringChar && css[i-1] !== '\\') inString = false;
            continue;
        }
        
        if (css[i] === '"' || css[i] === "'") {
            inString = true;
            stringChar = css[i];
        } else if (css[i] === '{') {
            braceCount++;
        } else if (css[i] === '}') {
            braceCount--;
            if (braceCount < 0) {
                cssIssues.push('Style #' + styleCount + ' line ' + lineNum + ': Extra }');
                braceCount = 0;
            }
        }
    }
    
    if (braceCount !== 0) {
        cssIssues.push('Style #' + styleCount + ': Unbalanced braces (' + braceCount + ' remaining)');
    }
}

console.log('Style tags found:', styleCount);
console.log('CSS issues:', cssIssues.length > 0 ? cssIssues.join(' | ') : 'None');

// Check for CSS syntax errors: properties without values, missing semicolons, etc.
console.log('\n=== CSS syntax check ===');
let cssContent = '';
const styleRegex2 = /<style[^>]*>([\s\S]*?)<\/style>/gi;
while ((styleMatch = styleRegex2.exec(html)) !== null) {
    cssContent += styleMatch[1] + '\n';
}

// Check for common CSS issues
const lines = cssContent.split('\n');
let issues = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes(':') && !line.includes(';') && !line.endsWith('{') && !line.endsWith('}') && !line.startsWith('//') && !line.startsWith('/*')) {
        issues.push('Line ' + (i+1) + ': Missing semicolon: ' + line.substring(0, 50));
    }
}
console.log('Potential missing semicolons:', issues.length > 0 ? issues.slice(0, 10) : 'None');

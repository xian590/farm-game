const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');

const tags = [];
const selfClosing = new Set(['br','hr','img','input','meta','link','area','base','col','embed','param','source','track','wbr','circle','ellipse','path','rect','stop','polygon','polyline','line','use','g','defs','svg','filter','feoffset','fegaussianblur','fecolormatrix','feblend','clippath','animate']);

let lineNum = 1;
let pos = 0;
const issues = [];

while (pos < html.length) {
    // Find next line break for line tracking
    const nextNL = html.indexOf('\n', pos);
    const lineEnd = nextNL === -1 ? html.length : nextNL;
    
    // Find tags in this line
    let linePos = pos;
    while (linePos < lineEnd) {
        const openIdx = html.indexOf('<', linePos);
        if (openIdx === -1 || openIdx >= lineEnd) break;
        
        const closeIdx = html.indexOf('>', openIdx);
        if (closeIdx === -1 || closeIdx > lineEnd + 100) { linePos = openIdx + 1; continue; }
        
        const tag = html.substring(openIdx, closeIdx + 1);
        let tagName = '';
        
        if (tag.startsWith('</')) {
            tagName = tag.substring(2).split(/[\s>]/)[0].toLowerCase();
            if (tagName === 'script' || tagName === 'style') { linePos = closeIdx + 1; continue; }
            if (selfClosing.has(tagName)) { linePos = closeIdx + 1; continue; }
            
            if (tags.length > 0 && tags[tags.length-1].name === tagName) {
                tags.pop();
            } else if (tags.some(t => t.name === tagName)) {
                const idx2 = tags.findIndex(t => t.name === tagName);
                issues.push({ type: 'nesting', tag: tagName, line: lineNum, openedLine: tags[idx2].line, expected: tags[tags.length-1]?.name });
                tags.splice(idx2, 1);
            } else {
                issues.push({ type: 'unexpected', tag: tagName, line: lineNum });
            }
        } else if (!tag.startsWith('<!') && !tag.startsWith('<?') && !tag.startsWith('<%')) {
            tagName = tag.substring(1).split(/[\s>]/)[0].toLowerCase();
            if (tagName === 'script' || tagName === 'style') { linePos = closeIdx + 1; continue; }
            if (selfClosing.has(tagName)) { linePos = closeIdx + 1; continue; }
            if (tag.endsWith('/>')) { linePos = closeIdx + 1; continue; }
            
            tags.push({ name: tagName, line: lineNum });
        }
        
        linePos = closeIdx + 1;
    }
    
    pos = lineEnd + 1;
    lineNum++;
}

console.log('=== Issues found ===');
issues.slice(0, 20).forEach(i => {
    if (i.type === 'nesting') {
        console.log(`Line ${i.line}: Improper </${i.tag}> (opened at ${i.openedLine}, expected </${i.expected}>)`);
    } else {
        console.log(`Line ${i.line}: Unexpected </${i.tag}>`);
    }
});

console.log('\n=== Unclosed tags at end ===');
tags.forEach(t => console.log(`<${t.name}> at line ${t.line}`));

console.log('\nTotal issues:', issues.length);
console.log('Total unclosed:', tags.length);

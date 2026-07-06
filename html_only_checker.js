const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');

// Extract only HTML content (outside script tags)
let htmlOnly = '';
let inScript = false;
let pos = 0;

while (pos < html.length) {
    const scriptStart = html.indexOf('<script', pos);
    if (scriptStart === -1) {
        htmlOnly += html.substring(pos);
        break;
    }
    htmlOnly += html.substring(pos, scriptStart);
    const scriptEnd = html.indexOf('</script>', scriptStart);
    if (scriptEnd === -1) {
        break;
    }
    pos = scriptEnd + 9;
}

// Check tag balance in HTML only
const tags = [];
const selfClosing = new Set(['br','hr','img','input','meta','link','area','base','col','embed','param','source','track','wbr','circle','ellipse','path','rect','stop','polygon','polyline','line','use','g','defs','svg','filter','feoffset','fegaussianblur','fecolormatrix','feblend','clippath','animate','fecomponenttransfer','fefuncr','fefuncg','fefuncb']);
const voidTags = new Set(['!doctype','html','head','body','meta','link','base','title','script','style']);

let lineNum = 1;
let linePos = 0;
const issues = [];

for (let i = 0; i < htmlOnly.length; i++) {
    if (htmlOnly[i] === '\n') lineNum++;
    
    if (htmlOnly[i] === '<') {
        const endTag = htmlOnly.indexOf('>', i);
        if (endTag === -1) continue;
        
        const tag = htmlOnly.substring(i, endTag + 1);
        let tagName = '';
        
        if (tag.startsWith('</')) {
            tagName = tag.substring(2).split(/[\s>]/)[0].toLowerCase();
            if (voidTags.has(tagName) || selfClosing.has(tagName)) continue;
            
            if (tags.length > 0 && tags[tags.length-1].name === tagName) {
                tags.pop();
            } else if (tags.some(t => t.name === tagName)) {
                const idx = tags.findIndex(t => t.name === tagName);
                issues.push({ type: 'nesting', tag: tagName, line: lineNum, openedLine: tags[idx].line });
                tags.splice(idx, 1);
            } else {
                issues.push({ type: 'unexpected', tag: tagName, line: lineNum });
            }
        } else if (!tag.startsWith('<!') && !tag.startsWith('<?') && !tag.startsWith('<%')) {
            tagName = tag.substring(1).split(/[\s>]/)[0].toLowerCase();
            if (voidTags.has(tagName) || selfClosing.has(tagName)) continue;
            if (tag.endsWith('/>')) continue;
            
            tags.push({ name: tagName, line: lineNum });
        }
        
        i = endTag;
    }
}

console.log('=== Real HTML Issues (outside script tags) ===');
issues.forEach(i => {
    if (i.type === 'nesting') {
        console.log(`Line ${i.line}: Improper </${i.tag}> (opened at ${i.openedLine})`);
    } else {
        console.log(`Line ${i.line}: Unexpected </${i.tag}>`);
    }
});

console.log('\n=== Unclosed HTML tags ===');
tags.forEach(t => console.log(`<${t.name}> at line ${t.line}`));
console.log('\nTotal issues:', issues.length);
console.log('Total unclosed:', tags.length);

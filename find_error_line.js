const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');
const scriptBlocks = [];
let inScript = false, scriptStart = 0;
for (let i = 0; i < html.length - 8; i++) {
  if (html.substring(i, i + 7) === '<script' && !inScript) { inScript = true; scriptStart = i; }
  if (html.substring(i, i + 9) === '</script>' && inScript) { scriptBlocks.push(html.substring(scriptStart, i + 9)); inScript = false; }
}
const block5 = scriptBlocks[4];
const codeMatch = block5.match(/<script[^>]*>([\s\S]*)<\/script>/);
const code = codeMatch[1].trim();

// Find exact error position by line
const vm = require('vm');
const lines = code.split('\n');
let testCode = '';
for (let i = 0; i < lines.length; i++) {
  testCode += lines[i] + '\n';
  try {
    new vm.Script(testCode, { filename: 'test.js' });
  } catch(e) {
    console.log('Error at line', (i+1), ':', e.message.substring(0, 80));
    console.log('Line content:', lines[i].substring(0, 100));
    console.log('Previous lines:');
    for (let j = Math.max(0, i-3); j <= i; j++) {
      console.log('  ' + (j+1) + ': ' + lines[j].substring(0, 100));
    }
    break;
  }
}
if (lines.length > 0) {
  console.log('\nAll', lines.length, 'lines compiled successfully?');
}

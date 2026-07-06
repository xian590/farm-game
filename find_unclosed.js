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

// Search for unescaped quotes inside double-quoted strings
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let inString = false;
  let escaped = false;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') {
      inString = !inString;
    }
  }
  if (inString) {
    console.log('Line ' + (i+1) + ' has unclosed string: ' + line.substring(0, 120));
  }
}

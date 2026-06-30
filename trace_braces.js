const fs = require('fs');
const content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const lines = content.split('\r\n');

let startLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('function autoPlayTick()')) {
    startLine = i;
    break;
  }
}
console.log('autoPlayTick starts at line', startLine + 1);

let braceDepth = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = '';
let escaped = false;

for (let i = startLine; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    const next = line[j+1] || '';
    
    if (escaped) { escaped = false; continue; }
    if (c === '\\') { escaped = true; continue; }
    
    if (inComment) {
      if (commentType === '\\/\\/' && c === '\n') inComment = false;
      else if (commentType === '\\/\\*' && c === '*' && next === '/') { inComment = false; j++; }
      continue;
    }
    
    if (inString) {
      if (c === stringChar) inString = false;
      continue;
    }
    
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      stringChar = c;
      continue;
    }
    
    if (c === '/' && next === '/') { inComment = true; commentType = '//'; j++; continue; }
    if (c === '/' && next === '*') { inComment = true; commentType = '/*'; j++; continue; }
    
    if (c === '{') braceDepth++;
    else if (c === '}') braceDepth--;
  }
  
  if (i > startLine && braceDepth === 0) {
    console.log('autoPlayTick ends at line', i + 1);
    console.log('Line content:', lines[i]);
    console.log('Next line:', lines[i+1]);
    break;
  }
}

if (braceDepth !== 0) {
  console.log('ERROR: autoPlayTick function does not close properly!');
  console.log('Final brace depth:', braceDepth);
  console.log('Last line checked:', lines.length);
}

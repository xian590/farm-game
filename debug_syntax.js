const fs = require('fs');
const content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch[1];

// Find the unmatched opening brace
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = '';
let escaped = false;
const stack = [];

for (let i = 0; i < script.length; i++) {
  const c = script[i];
  const next = script[i+1] || '';
  
  if (escaped) { escaped = false; continue; }
  if (c === '\\') { escaped = true; continue; }
  
  if (inComment) {
    if (commentType === '//' && c === '\n') inComment = false;
    else if (commentType === '/*' && c === '*' && next === '/') { inComment = false; i++; }
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
  
  if (c === '/' && next === '/') { inComment = true; commentType = '//'; i++; continue; }
  if (c === '/' && next === '*') { inComment = true; commentType = '/*'; i++; continue; }
  
  if (c === '{') {
    stack.push({pos: i, char: '{'});
  } else if (c === '}') {
    if (stack.length > 0) {
      stack.pop();
    }
  }
}

console.log('Remaining open braces:', stack.length);
for (const item of stack) {
  console.log('Unmatched { at position', item.pos);
  console.log('Context:', JSON.stringify(script.substring(Math.max(0, item.pos-100), item.pos+100)));
  
  const before = script.substring(0, item.pos);
  const lineNum = before.split('\n').length;
  console.log('Line number:', lineNum);
  
  const lines = script.split('\n');
  for (let i = Math.max(0, lineNum-3); i < Math.min(lines.length, lineNum+2); i++) {
    console.log('Line', i+1, ':', lines[i].substring(0, 120));
  }
}

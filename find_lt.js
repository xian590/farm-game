const fs = require('fs');
const code = fs.readFileSync('extracted_script.js', 'utf-8');
const lines = code.split('\n');
let inString = false;
let stringChar = '';
let inTemplate = false;
let inLineComment = false;
let inBlockComment = false;
let inRegex = false;

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = line[i-1] || '';
    
    if (inLineComment) { inLineComment = false; break; }
    if (inBlockComment) {
      if (ch === '*' && line[i+1] === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inTemplate) {
      if (ch === '`' && prev !== '\\') { inTemplate = false; }
      continue;
    }
    if (inString) {
      if (ch === stringChar && prev !== '\\') { inString = false; }
      continue;
    }
    if (inRegex) {
      if (ch === '/' && prev !== '\\') { inRegex = false; }
      continue;
    }
    
    if (ch === '/' && line[i+1] === '/') { inLineComment = true; continue; }
    if (ch === '/' && line[i+1] === '*') { inBlockComment = true; i++; continue; }
    if (ch === '"') { inString = true; stringChar = '"'; continue; }
    if (ch === "'") { inString = true; stringChar = "'"; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '/' && !inRegex) { inRegex = true; continue; }
    
    if (ch === '<') {
      console.log('Line ' + (lineIdx+1) + ' col ' + i + ': ' + JSON.stringify(line.substring(Math.max(0,i-20), Math.min(line.length, i+30))));
    }
  }
}

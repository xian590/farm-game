const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');
const lines = js.split('\n');

function getLine(pos) {
  let line = 1;
  for (let i = 0; i < pos && i < js.length; i++) if (js[i] === '\n') line++;
  return line;
}

console.log('========== SWITCH STATEMENT const/let CHECK ==========');
// Find all switch statements and check for const/let in multiple cases
const switchRegex = /\bswitch\s*\(/g;
let m;
const switchIssues = [];

while ((m = switchRegex.exec(js)) !== null) {
  const startIdx = m.index;
  let idx = startIdx;
  // Find the opening brace
  while (idx < js.length && js[idx] !== '{') idx++;
  if (idx >= js.length) continue;
  idx++; // skip {
  
  let braces = 1;
  let inStr = null;
  let esc = false;
  let caseDecls = {};
  let currentCase = null;
  const switchStartLine = getLine(startIdx);
  
  for (; idx < js.length && braces > 0; idx++) {
    const ch = js[idx];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === inStr) { inStr = null; }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && js[idx+1] === '/') { while (idx < js.length && js[idx] !== '\n') idx++; continue; }
    if (ch === '/' && js[idx+1] === '*') { idx += 2; while (idx < js.length && !(js[idx] === '*' && js[idx+1] === '/')) idx++; idx++; continue; }
    if (ch === '{') braces++;
    if (ch === '}') { braces--; continue; }
    
    if (braces === 1) {
      // Check for case/default
      const backText = js.slice(idx, idx + 10);
      if (/\bcase\b/.test(backText) || /\bdefault\b/.test(backText)) {
        currentCase = getLine(idx);
        caseDecls = {}; // Actually, const/let in switch are scoped to the ENTIRE switch, not per case!
        // So we should NOT reset caseDecls here. We need to track across all cases in the same switch.
      }
      
      // Check for const/let declarations
      const declMatch = js.slice(idx).match(/^(const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (declMatch) {
        const type = declMatch[1];
        const name = declMatch[2];
        if (caseDecls[name]) {
          switchIssues.push({
            switchLine: switchStartLine,
            line: getLine(idx),
            varName: name,
            declType: type,
            firstLine: caseDecls[name]
          });
        } else {
          caseDecls[name] = getLine(idx);
        }
      }
    }
  }
}

if (switchIssues.length === 0) {
  console.log('No duplicate const/let declarations found in switch statements.');
} else {
  switchIssues.forEach(iss => {
    console.log(`[ISSUE] Switch at line ${iss.switchLine}: duplicate ${iss.declType} '${iss.varName}' at line ${iss.line} (first at line ${iss.firstLine})`);
  });
}

console.log('\n========== TEMPLATE STRING DETAIL CHECK ==========');
// Look for template strings with unclosed ${} or backticks
let inTemplate = false;
let startLine = 0;
let braceDepth = 0;
let escape = false;
let templateIssues = 0;

for (let i = 0; i < js.length; i++) {
  const ch = js[i];
  if (!inTemplate) {
    if (ch === '`') { inTemplate = true; startLine = getLine(i); braceDepth = 0; }
  } else {
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '`') { 
      if (braceDepth !== 0) {
        console.log(`[ISSUE] Template string ending at line ${getLine(i)} has unclosed \${} braces (depth ${braceDepth})`);
        templateIssues++;
      }
      inTemplate = false; 
      braceDepth = 0; 
    }
    else if (ch === '$' && js[i+1] === '{') { braceDepth++; i++; }
    else if (braceDepth > 0) { 
      if (ch === '{') braceDepth++; 
      if (ch === '}') braceDepth--; 
    }
  }
}

if (inTemplate) {
  console.log(`[ISSUE] Unclosed template string starting at line ${startLine}`);
  templateIssues++;
}

if (templateIssues === 0) {
  console.log('All template strings are properly closed with balanced \${} braces.');
}

console.log('\n========== ACCESSING UNDEFINED PROPERTIES ==========');
// Check for patterns like game.xxx where game might not have the property
// But more importantly, check for things like game.npcs[xxx] where game.npcs might not exist
const nullPatterns = [
  { regex: /\bgame\.npcs\s*\[/g, desc: 'game.npcs[...] without null check' },
  { regex: /\bgame\.friendship\s*\[/g, desc: 'game.friendship[...] without null check' },
  { regex: /\bgame\.fields\s*\[/g, desc: 'game.fields[...] without null check' },
  { regex: /\bgame\.crops\s*\./g, desc: 'game.crops.xxx without null check' },
  { regex: /\bgame\.items\s*\./g, desc: 'game.items.xxx without null check' },
];

nullPatterns.forEach(({ regex, desc }) => {
  let cm;
  let count = 0;
  while ((cm = regex.exec(js)) !== null) count++;
  if (count > 0) {
    console.log(`[INFO] ${desc}: ${count} occurrences`);
  }
});

console.log('\n========== CHECKING FOR var/let/const MISSING DECLARATION IN STRICT MODE ==========');
// If there's any 'use strict' directive, check for issues that would fail in strict mode
const strictRegex = /["']use strict["']/g;
const strictMatches = [];
while ((m = strictRegex.exec(js)) !== null) {
  strictMatches.push(getLine(m.index));
}
console.log(`Found 'use strict' directives at lines: ${strictMatches.join(', ') || 'none'}`);

console.log('\n========== DONE ==========');

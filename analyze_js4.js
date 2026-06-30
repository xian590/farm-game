const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');
const lines = js.split('\n');

function getLine(pos) {
  let line = 1;
  for (let i = 0; i < pos && i < js.length; i++) if (js[i] === '\n') line++;
  return line;
}

// 1. Check all const/let declarations per function, excluding for loops
console.log('========== 1. REAL DUPLICATE const/let DECLARATIONS ==========');
const funcDecls = [];
const declRegex = /^(\s*)(?:async\s+)?function\s+(\w+)\s*\(/gm;
let m;
while ((m = declRegex.exec(js)) !== null) {
  const line = getLine(m.index);
  const name = m[2];
  let idx = m.index + m[0].length;
  let braces = 0;
  let foundBody = false;
  let inStr = null;
  let esc = false;
  for (; idx < js.length; idx++) {
    const ch = js[idx];
    if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; } if (ch === inStr) { inStr = null; } continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
    if (ch === '/' && js[idx+1] === '/') { while (idx < js.length && js[idx] !== '\n') idx++; continue; }
    if (ch === '/' && js[idx+1] === '*') { idx += 2; while (idx < js.length && !(js[idx] === '*' && js[idx+1] === '/')) idx++; idx++; continue; }
    if (ch === '{' && !foundBody) { foundBody = true; braces = 1; continue; }
    if (foundBody) {
      if (ch === '{') braces++;
      if (ch === '}') { braces--; if (braces === 0) { idx++; break; } }
    }
  }
  funcDecls.push({ name, startLine: line, endPos: idx });
}

const issues = [];
funcDecls.forEach(func => {
  const bodyText = js.slice(0, func.endPos);
  const decls = {};
  const constLetRegex = /\b(const|let)\b/g;
  let cm;
  while ((cm = constLetRegex.exec(bodyText)) !== null) {
    const line = getLine(cm.index);
    if (line < func.startLine) continue;
    const lineText = lines[line - 1];
    const idxInLine = lineText.indexOf(cm[1]);
    if (idxInLine === -1) continue;
    const after = lineText.slice(idxInLine + cm[1].length);
    const varMatch = after.match(/^\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (!varMatch) continue;
    const varName = varMatch[1];
    const declType = cm[1];
    const beforeDecl = lineText.slice(0, idxInLine);
    if (/\bfor\s*\(/.test(beforeDecl)) continue;
    if (decls[varName]) {
      issues.push({ func: func.name, line, varName, declType, firstLine: decls[varName].line });
    } else {
      decls[varName] = { line, type: declType };
    }
  }
});

if (issues.length === 0) {
  console.log('No duplicate const/let declarations found in any function scope (excluding for loops).');
} else {
  const seen = new Set();
  issues.forEach(iss => {
    const key = iss.func + '-' + iss.varName + '-' + iss.line;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`[ISSUE] ${iss.func}() line ${iss.line}: duplicate ${iss.declType} '${iss.varName}' (first at ${iss.firstLine})`);
    }
  });
}

// 2. Check onclick handlers exist
console.log('\n========== 2. ONCLICK HANDLER FUNCTIONS DEFINED? ==========');
const funcNames = funcDecls.map(f => f.name);
const defined = new Set(funcNames);
const handlers = [];
const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
while ((m = onclickRegex.exec(js)) !== null) {
  const handler = m[1].trim();
  const funcName = handler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1];
  if (funcName && !defined.has(funcName)) {
    handlers.push({ line: getLine(m.index), funcName, handler });
  }
}
if (handlers.length === 0) {
  console.log('All onclick handler functions appear to be defined.');
} else {
  handlers.forEach(h => {
    console.log(`[ISSUE] Line ${h.line}: onclick calls undefined function '${h.funcName}' in: ${h.handler}`);
  });
}

// 3. Check template strings
console.log('\n========== 3. TEMPLATE STRING CHECK ==========');
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
    if (ch === '`') { inTemplate = false; braceDepth = 0; }
    else if (ch === '$' && js[i+1] === '{') { braceDepth++; i++; }
    else if (braceDepth > 0) { if (ch === '{') braceDepth++; if (ch === '}') braceDepth--; }
  }
}
if (inTemplate) {
  console.log(`[ISSUE] Unclosed template string starting around line ${startLine}`);
} else {
  console.log('All template strings are properly closed.');
}

// 4. Syntax check
console.log('\n========== 4. SYNTAX CHECK ==========');
try {
  new Function(js);
  console.log('Global syntax check PASSED.');
} catch(e) {
  console.log('SYNTAX ERROR:', e.message);
}

console.log('\n========== DONE ==========');

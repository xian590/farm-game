const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');
const lines = js.split('\n');

function getLine(pos) {
  let line = 1;
  for (let i = 0; i < pos && i < js.length; i++) if (js[i] === '\n') line++;
  return line;
}

console.log('========== 1. SYNTAX CHECK ==========');
try {
  new Function(js);
  console.log('PASSED: No syntax errors detected by Function constructor.');
} catch(e) {
  console.log('FAILED:', e.message);
}

console.log('\n========== 2. ONCLICK HANDLERS - GLOBAL FUNCTION CHECK ==========');
// Find all onclick handlers and check if the referenced functions are globally accessible
const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
const handlers = [];
let m;
while ((m = onclickRegex.exec(js)) !== null) {
  const handler = m[1].trim();
  const line = getLine(m.index);
  const funcName = handler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1];
  if (funcName) {
    handlers.push({ line, funcName, handler });
  }
}

// Find all globally accessible functions (top-level function declarations and top-level const/let/var assigned functions)
const globalFuncs = new Set();
const topLevelFuncDecl = /^function\s+(\w+)/gm;
while ((m = topLevelFuncDecl.exec(js)) !== null) {
  globalFuncs.add(m[1]);
}

// Top-level const/let/var function assignments
const topLevelAssign = /^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*\(|\()/gm;
while ((m = topLevelAssign.exec(js)) !== null) {
  globalFuncs.add(m[1]);
}

// Also check for functions that are definitely local (inside other functions)
// These CANNOT be called from onclick HTML strings
const localFuncDecls = new Set();
const allFuncDecls = /function\s+(\w+)/g;
const localDeclRegex = /function\s+(\w+)\s*\(/g;
let prevEnd = 0;
while ((m = localDeclRegex.exec(js)) !== null) {
  const line = getLine(m.index);
  // If this line is not at top level (indented), it's local
  // But indentation is tricky. Let's check if there's another function declaration before it
  // A simpler heuristic: if it's not the first function in the file and the line has leading whitespace
  // Actually, let's just check if any onclick references something that is NOT in globalFuncs
}

const badOnclicks = [];
handlers.forEach(h => {
  if (!globalFuncs.has(h.funcName) && h.funcName !== 'this') {
    badOnclicks.push(h);
  }
});

if (badOnclicks.length === 0) {
  console.log('All onclick handler functions are globally accessible.');
} else {
  console.log(`Found ${badOnclicks.length} onclick handlers referencing non-global functions:\n`);
  badOnclicks.forEach(h => {
    console.log(`[ISSUE] Line ${h.line}: '${h.funcName}' is not a global function`);
    console.log(`  Handler: ${h.handler}`);
  });
}

console.log('\n========== 3. FUNCTIONS CALLED BEFORE DEFINITION ==========');
// Find const/let/var function assignments and check if they are called before their line
const assignAndCall = [];
const funcAssignRegex = /^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*\(|\()/gm;
while ((m = funcAssignRegex.exec(js)) !== null) {
  const name = m[1];
  const declLine = getLine(m.index);
  // Check for calls before this line
  const callRegex = new RegExp(`\\b${name}\\s*\\(`, 'g');
  let cm;
  while ((cm = callRegex.exec(js)) !== null) {
    const callLine = getLine(cm.index);
    if (callLine < declLine) {
      assignAndCall.push({ name, callLine, declLine });
      break; // only report first
    }
  }
}

if (assignAndCall.length === 0) {
  console.log('No functions called before their const/let/var assignment.');
} else {
  assignAndCall.forEach(a => {
    console.log(`[ISSUE] '${a.name}' called at line ${a.callLine} before definition at line ${a.declLine}`);
  });
}

console.log('\n========== 4. UNDEFINED VARIABLES (TOP-LEVEL) ==========');
// Check for variables that are used but never declared in sloppy mode
// This would create implicit globals, which is bad practice and can cause bugs
const declared = new Set(['undefined','null','true','false','NaN','Infinity','this','arguments','window','document','console','localStorage','Math','JSON','Date','Array','Object','String','Number','Boolean','Function','RegExp','Error','Promise','Map','Set','parseInt','parseFloat','isNaN','isFinite','encodeURI','decodeURI','escape','unescape','eval','setTimeout','setInterval','clearTimeout','clearInterval','alert','confirm','prompt','fetch','requestAnimationFrame','cancelAnimationFrame','location','history','navigator','screen','performance','AudioContext','addEventListener','removeEventListener','dispatchEvent','getComputedStyle','matchMedia','Intl','BigInt','Symbol','Proxy','Reflect','WeakMap','WeakSet','ArrayBuffer','DataView','TextEncoder','TextDecoder','URL','URLSearchParams','Blob','File','FileReader','FormData','Headers','Request','Response','XMLHttpRequest','WebSocket','Worker','EventSource','CustomEvent','Event','MutationObserver','IntersectionObserver','ResizeObserver','AbortController','AbortSignal','queueMicrotask','structuredClone','btoa','atob','require','module','exports','globalThis']);

// Find all declarations
const declRegex2 = /\b(?:const|let|var|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
while ((m = declRegex2.exec(js)) !== null) declared.add(m[1]);

// Catch clause parameters
const catchRegex = /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g;
while ((m = catchRegex.exec(js)) !== null) declared.add(m[1]);

// For loop variables
const forRegex = /for\s*\(\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
while ((m = forRegex.exec(js)) !== null) declared.add(m[1]);

// Function parameters
const paramRegex = /function\s+\w*\s*\(([^)]*)\)/g;
while ((m = paramRegex.exec(js)) !== null) {
  m[1].split(',').forEach(p => {
    const name = p.trim().split(/[=\s]/)[0];
    if (name) declared.add(name);
  });
}

// Arrow function parameters: (a, b) => or a =>
const arrowParamRegex = /\(?([a-zA-Z_$][a-zA-Z0-9_$]*(?:\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*)*)\)?\s*=>/g;
while ((m = arrowParamRegex.exec(js)) !== null) {
  m[1].split(',').forEach(p => {
    const name = p.trim();
    if (name) declared.add(name);
  });
}

// Check for variable references that might be implicit globals
// Look for assignments without declaration: x = ... (where x is not declared)
const implicitGlobals = [];
const assignRegex = /(?<!\.)\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=[^=]/g;
while ((m = assignRegex.exec(js)) !== null) {
  const name = m[1];
  const line = getLine(m.index);
  const lineText = lines[line - 1];
  // Skip if it's a property assignment like obj.prop =
  if (lineText.includes('.' + name + ' =')) continue;
  // Skip if preceded by . (method call chain)
  if (declared.has(name)) continue;
  if (['if','while','for','switch','case','return','throw','typeof','instanceof','new','delete','void','in','of','with','class','extends','yield','await','default','debugger','else','try','finally','function','const','let','var','true','false','null','undefined'].includes(name)) continue;
  implicitGlobals.push({ name, line, code: lineText.trim().substring(0, 80) });
}

const seenGlobals = new Set();
const uniqueGlobals = [];
for (const g of implicitGlobals) {
  if (!seenGlobals.has(g.name)) { seenGlobals.add(g.name); uniqueGlobals.push(g); }
}

if (uniqueGlobals.length === 0) {
  console.log('No implicit global variables detected.');
} else {
  console.log(`Found ${uniqueGlobals.length} potential implicit global assignments:\n`);
  uniqueGlobals.slice(0, 20).forEach(g => {
    console.log(`[WARNING] Line ${g.line}: '${g.name}' assigned without declaration`);
    console.log(`  Code: ${g.code}`);
  });
}

console.log('\n========== 5. DOM NULL ACCESS CHECKS ==========');
// Find patterns where getElementById result is used without null check
const getByIdRegex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
const domIssues = [];
while ((m = getByIdRegex.exec(js)) !== null) {
  const id = m[1];
  const line = getLine(m.index);
  const lineText = lines[line - 1];
  // Check if the next line or same line uses the result without null check
  const nextLine = lines[line] || '';
  const prevLine = lines[line - 2] || '';
  const usesWithoutCheck = (lineText + nextLine).includes('.textContent') || (lineText + nextLine).includes('.innerHTML') || (lineText + nextLine).includes('.style') || (lineText + nextLine).includes('.value');
  const hasNullCheck = prevLine.includes('if') || lineText.includes('?.') || lineText.includes('if');
  if (usesWithoutCheck && !hasNullCheck) {
    domIssues.push({ line, id, code: lineText.trim() });
  }
}

console.log(`Found ${domIssues.length} getElementById calls without null check (sample):`);
domIssues.slice(0, 10).forEach(d => {
  console.log(`[INFO] Line ${d.line}: #${d.id} - ${d.code}`);
});

console.log('\n========== DONE ==========');

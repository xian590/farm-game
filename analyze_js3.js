const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');
const lines = js.split('\n');

function getLine(pos) {
  let line = 1;
  for (let i = 0; i < pos && i < js.length; i++) {
    if (js[i] === '\n') line++;
  }
  return line;
}

// =================== 1. Real duplicate const/let (excluding for loops) ===================
console.log("========== 1. DUPLICATE const/let (excluding for-loop headers) ==========");

function analyzeRealDuplicates() {
  const issues = [];
  const scopeStack = []; // { type, decls: Map, isLoopHeader: boolean }
  
  let inString = null;
  let escapeNext = false;
  let inLineComment = false;
  let inBlockComment = false;
  let inTemplate = false;
  let templateBraceDepth = 0;
  
  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const next = js[i+1] || '';
    
    if (inBlockComment) { if (ch === '*' && next === '/') { inBlockComment = false; i++; } continue; }
    if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
    if (inString) { if (escapeNext) { escapeNext = false; continue; } if (ch === '\\') { escapeNext = true; continue; } if (ch === inString) { inString = null; } continue; }
    if (inTemplate) { if (escapeNext) { escapeNext = false; continue; } if (ch === '\\') { escapeNext = true; continue; } if (ch === '`') { inTemplate = false; templateBraceDepth = 0; } else if (ch === '$' && next === '{') { templateBraceDepth++; i++; } else if (templateBraceDepth > 0) { if (ch === '{') templateBraceDepth++; if (ch === '}') templateBraceDepth--; } continue; }
    
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '/' && next === '/') { inLineComment = true; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    
    if (ch === '{') {
      const backText = js.slice(Math.max(0, i-100), i);
      const isFunc = /(?:function\s*\w*|\)\s*=>|\w+\s*\([^)]*\))\s*$/.test(backText);
      scopeStack.push({ type: isFunc ? 'function' : 'block', decls: new Map() });
      continue;
    }
    if (ch === '}') { if (scopeStack.length > 0) scopeStack.pop(); continue; }
    
    // Check for const/let declarations
    if (/\b(?:const|let)\b/.test(js.slice(i, i+6))) {
      const declMatch = js.slice(i).match(/^(const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (declMatch) {
        const type = declMatch[1];
        const name = declMatch[2];
        const line = getLine(i);
        const lineText = lines[line - 1];
        
        // Skip if inside a for-loop header
        const isForLoop = /\bfor\s*\([^)]*$/.test(lineText.slice(0, declMatch.index + (i - (js.slice(0,i).lastIndexOf('\n')+1)))) ||
                          /\bfor\s*\(/.test(lineText);
        
        // Simple heuristic: check if we're inside a for(...)
        const backLine = js.slice(Math.max(0, i-200), i);
        const inForHeader = /\bfor\s*\([^)]*$/.test(backLine) && !backLine.includes(';');
        
        const currentScope = scopeStack.length > 0 ? scopeStack[scopeStack.length - 1] : null;
        if (currentScope && !inForHeader) {
          if (currentScope.decls.has(name)) {
            issues.push({
              line: line,
              varName: name,
              declType: type,
              firstLine: getLine(currentScope.decls.get(name)),
              code: lineText.trim().substring(0, 80)
            });
          } else {
            currentScope.decls.set(name, i);
          }
        }
      }
    }
  }
  
  return issues;
}

const realDups = analyzeRealDuplicates();
const seen = new Set();
const uniqueDups = [];
for (const iss of realDups) {
  const key = `${iss.line}-${iss.varName}`;
  if (!seen.has(key)) { seen.add(key); uniqueDups.push(iss); }
}

if (uniqueDups.length === 0) {
  console.log("No duplicate const/let declarations found in same scope (excluding for loops).");
} else {
  console.log(`Found ${uniqueDups.length} real duplicate declarations:\n`);
  uniqueDups.forEach(iss => {
    console.log(`[ISSUE] Line ${iss.line}: duplicate ${iss.declType} '${iss.varName}' (first at line ${iss.firstLine})`);
    console.log(`  Code: ${iss.code}`);
  });
}

// =================== 2. Template strings ===================
console.log("\n========== 2. TEMPLATE STRING ISSUES ==========");
function checkTemplates() {
  let inTemplate = false;
  let startLine = 0;
  let braceDepth = 0;
  let escape = false;
  
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
  if (inTemplate) return [{ line: startLine, type: 'unclosed' }];
  return [];
}
const templateIssues = checkTemplates();
console.log(templateIssues.length === 0 ? "No template string issues." : templateIssues.map(i => `[ISSUE] Line ${i.line}: unclosed template`).join('\n'));

// =================== 3. Undefined functions ===================
console.log("\n========== 3. UNDEFINED FUNCTION REFERENCES ==========");
function checkUndefined() {
  const defined = new Set([
    'eval','parseInt','parseFloat','isNaN','isFinite','encodeURI','encodeURIComponent',
    'decodeURI','decodeURIComponent','escape','unescape','Number','String','Boolean',
    'Object','Array','Function','Date','RegExp','Error','Math','JSON','console',
    'setTimeout','setInterval','clearTimeout','clearInterval','alert','confirm','prompt',
    'document','window','localStorage','sessionStorage','fetch','Promise','Map','Set',
    'WeakMap','WeakSet','Symbol','Proxy','Reflect','Intl','ArrayBuffer','DataView',
    'BigInt','Infinity','NaN','undefined','null','true','false','this','arguments','super',
    'require','module','exports','globalThis','AudioContext','GainNode','OscillatorNode',
    'BiquadFilterNode','AudioBufferSourceNode','addEventListener','removeEventListener',
    'requestAnimationFrame','cancelAnimationFrame','location','history','navigator','screen',
    'performance','btoa','atob','XMLHttpRequest','WebSocket','Worker','Blob','File','FileReader',
    'FormData','Headers','Request','Response','URL','URLSearchParams','TextEncoder','TextDecoder',
    'AbortController','AbortSignal','CustomEvent','Event','MutationObserver','IntersectionObserver',
    'ResizeObserver','matchMedia','getComputedStyle','requestIdleCallback','cancelIdleCallback',
    'queueMicrotask','structuredClone','Uint8Array','Uint16Array','Uint32Array','Int8Array','Int16Array',
    'Int32Array','Float32Array','Float64Array','Node','Element','HTMLElement','HTMLDocument','Document',
    'parseInt','parseFloat','isNaN','isFinite','encodeURI','decodeURI','escape','unescape','eval',
    'Math','JSON','console','Object','Array','String','Number','Boolean','Date','RegExp','Error',
    'Function','Symbol','Proxy','Reflect','Map','Set','WeakMap','WeakSet','Promise','Intl','BigInt',
    'ArrayBuffer','SharedArrayBuffer','DataView','Atomics','WebAssembly','FinalizationRegistry'
  ]);
  
  const funcDecl = /function\s+(\w+)/g;
  let m;
  while ((m = funcDecl.exec(js)) !== null) defined.add(m[1]);
  
  const varFunc = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*\(|\()/g;
  while ((m = varFunc.exec(js)) !== null) defined.add(m[1]);
  
  const objMethod = /(\w+):\s*(?:async\s+)?function\s*\(/g;
  while ((m = objMethod.exec(js)) !== null) defined.add(m[1]);
  
  const shorthand = /(\w+)\s*\([^)]*\)\s*\{/g;
  while ((m = shorthand.exec(js)) !== null) defined.add(m[1]);
  
  // Arrow function assignments: const foo = (...) =>
  const arrowAssign = /(?:const|let|var)\s+(\w+)\s*=\s*[^;=]*=>/g;
  while ((m = arrowAssign.exec(js)) !== null) defined.add(m[1]);
  
  const callPat = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const calls = Object.create(null);
  while ((m = callPat.exec(js)) !== null) {
    const name = m[1];
    if (defined.has(name)) continue;
    if (['if','while','for','switch','catch','return','throw','typeof','instanceof','new','delete','void','in','of','with','class','extends','yield','await','case','default','debugger','else','try','finally'].includes(name)) continue;
    if (name.startsWith('on') && name.length > 2) continue;
    if (name === 'get' || name === 'set') continue;
    const line = getLine(m.index);
    if (!calls[name]) calls[name] = [];
    if (calls[name].length < 3) calls[name].push(line);
  }
  
  const results = [];
  for (const [name, linesArr] of Object.entries(calls)) {
    results.push({ name, count: linesArr.length, lines: linesArr });
  }
  return results.sort((a,b) => b.count - a.count);
}

const undefinedFuncs = checkUndefined();
console.log(`Found ${undefinedFuncs.length} potentially undefined references. Top 20:\n`);
undefinedFuncs.slice(0, 20).forEach(f => {
  console.log(`[WARNING] '${f.name}' - ${f.count} calls (lines: ${f.lines.join(', ')})`);
});

// =================== 4. onclick handlers in HTML strings ===================
console.log("\n========== 4. ONCLICK HANDLERS IN HTML STRINGS ==========");
function checkOnclick() {
  const issues = [];
  const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = onclickRegex.exec(js)) !== null) {
    const handler = m[1].trim();
    const line = getLine(m.index);
    const funcName = handler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1];
    issues.push({ line, handler, funcName });
  }
  return issues;
}

const onclicks = checkOnclick();
if (onclicks.length === 0) {
  console.log("No inline onclick handlers found in JS strings.");
} else {
  console.log(`Found ${onclicks.length} onclick handlers:\n`);
  onclicks.forEach(iss => {
    console.log(`[INFO] Line ${iss.line}: onclick='${iss.handler}'`);
  });
}

// =================== 5. Potential null access patterns ===================
console.log("\n========== 5. NULL PROPERTY ACCESS PATTERNS ==========");
function checkNullAccess() {
  const issues = [];
  const patterns = [
    { regex: /\bgame\.\w+/g, name: 'game' },
    { regex: /\bplayer\.\w+/g, name: 'player' },
    { regex: /\bnpc\.\w+/g, name: 'npc' },
  ];
  patterns.forEach(({ regex, name }) => {
    let m;
    while ((m = regex.exec(js)) !== null) {
      const line = getLine(m.index);
      const lineText = lines[line - 1];
      if (!lineText.includes('?.')) {
        issues.push({ line, name, code: lineText.trim().substring(0, 100) });
      }
    }
  });
  return issues;
}
const nullAccess = checkNullAccess();
console.log(`Found ${nullAccess.length} patterns. Sample:\n`);
nullAccess.slice(0, 10).forEach(iss => console.log(`[INFO] Line ${iss.line}: ${iss.name} - ${iss.code}`));

// =================== 6. Check for undefined variables (not just functions) ===================
console.log("\n========== 6. UNDEFINED VARIABLE REFERENCES ==========");
function checkUndefinedVars() {
  const defined = new Set([
    'undefined','null','true','false','NaN','Infinity','this','arguments','super',
    'window','document','console','localStorage','sessionStorage','location','history',
    'navigator','screen','performance','fetch','Promise','Math','JSON','Date','RegExp',
    'Error','Array','Object','String','Number','Boolean','Function','Symbol','Map','Set',
    'WeakMap','WeakSet','Proxy','Reflect','Intl','BigInt','ArrayBuffer','DataView',
    'Uint8Array','Uint16Array','Uint32Array','Int8Array','Int16Array','Int32Array',
    'Float32Array','Float64Array','AudioContext','AudioBufferSourceNode','GainNode',
    'OscillatorNode','BiquadFilterNode','XMLHttpRequest','WebSocket','Worker','Blob',
    'File','FileReader','FormData','Headers','Request','Response','URL','URLSearchParams',
    'TextEncoder','TextDecoder','AbortController','AbortSignal','CustomEvent','Event',
    'MutationObserver','IntersectionObserver','ResizeObserver','matchMedia','getComputedStyle',
    'requestIdleCallback','cancelIdleCallback','queueMicrotask','structuredClone','btoa','atob',
    'eval','parseInt','parseFloat','isNaN','isFinite','encodeURI','encodeURIComponent',
    'decodeURI','decodeURIComponent','escape','unescape','setTimeout','setInterval',
    'clearTimeout','clearInterval','alert','confirm','prompt','addEventListener','removeEventListener',
    'requestAnimationFrame','cancelAnimationFrame','require','module','exports','globalThis'
  ]);
  
  // Find all variable declarations
  const declRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let m;
  while ((m = declRegex.exec(js)) !== null) defined.add(m[1]);
  
  // Find all function parameters
  const paramRegex = /function\s+\w*\s*\(([^)]*)\)/g;
  while ((m = paramRegex.exec(js)) !== null) {
    m[1].split(',').forEach(p => {
      const name = p.trim().split(/[=\s]/)[0];
      if (name) defined.add(name);
    });
  }
  
  // Find catch clauses
  const catchRegex = /catch\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/g;
  while ((m = catchRegex.exec(js)) !== null) defined.add(m[1]);
  
  // Find for-loop variables
  const forRegex = /for\s*\(\s*(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((m = forRegex.exec(js)) !== null) defined.add(m[1]);
  
  // Find object properties (these are keys, not variables)
  const propRegex = /(\w+):\s*[^:{]/g; // rough
  while ((m = propRegex.exec(js)) !== null) {
    // Don't add to defined - these are property names, but we need to be careful
  }
  
  // Check for variable references that might be undefined
  // Look for standalone words that are not properties (not preceded by .)
  const varRef = /(?<!\.)\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  const refs = Object.create(null);
  while ((m = varRef.exec(js)) !== null) {
    const name = m[1];
    if (defined.has(name)) continue;
    if (['if','while','for','switch','catch','return','throw','typeof','instanceof','new','delete','void','in','of','with','class','extends','yield','await','case','default','debugger','else','try','finally','function','const','let','var','return','break','continue','do','import','export','from','as','default','static'].includes(name)) continue;
    if (name.startsWith('on') && name.length > 2) continue;
    const line = getLine(m.index);
    if (!refs[name]) refs[name] = [];
    if (refs[name].length < 3) refs[name].push(line);
  }
  
  const results = [];
  for (const [name, linesArr] of Object.entries(refs)) {
    if (linesArr.length >= 2) results.push({ name, count: linesArr.length, lines: linesArr });
  }
  return results.sort((a,b) => b.count - a.count);
}

const undefinedVars = checkUndefinedVars();
console.log(`Found ${undefinedVars.length} potentially undefined variables (appearing 2+ times). Top 20:\n`);
undefinedVars.slice(0, 20).forEach(v => {
  console.log(`[WARNING] '${v.name}' - ${v.count} references (lines: ${v.lines.join(', ')})`);
});

console.log("\n========== ANALYSIS COMPLETE ==========");

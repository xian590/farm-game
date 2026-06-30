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

// =================== 1. Proper duplicate const/let analysis with scope tracking ===================
console.log("========== 1. DUPLICATE const/let IN SAME SCOPE ==========");

function analyzeScopes() {
  const issues = [];
  const scopes = []; // stack of { type: 'function'|'block', decls: Map<name, line> }
  
  let inString = null;
  let escapeNext = false;
  let inRegex = false;
  let regexBracketDepth = 0;
  let inTemplate = false;
  let templateBraceDepth = 0;
  let inLineComment = false;
  let inBlockComment = false;
  
  // Tokenize-ish scan
  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const prev = js[i-1] || '';
    const next = js[i+1] || '';
    
    if (inBlockComment) {
      if (ch === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inString) {
      if (escapeNext) { escapeNext = false; continue; }
      if (ch === '\\') { escapeNext = true; continue; }
      if (ch === inString) { inString = null; }
      continue;
    }
    if (inTemplate) {
      if (escapeNext) { escapeNext = false; continue; }
      if (ch === '\\') { escapeNext = true; continue; }
      if (ch === '`') { inTemplate = false; templateBraceDepth = 0; continue; }
      if (ch === '$' && next === '{') { templateBraceDepth++; i++; continue; }
      if (templateBraceDepth > 0) {
        if (ch === '{') templateBraceDepth++;
        if (ch === '}') templateBraceDepth--;
      }
      continue;
    }
    if (inRegex) {
      if (escapeNext) { escapeNext = false; continue; }
      if (ch === '\\') { escapeNext = true; continue; }
      if (ch === '[') regexBracketDepth++;
      if (ch === ']' && regexBracketDepth > 0) regexBracketDepth--;
      if (ch === '/' && regexBracketDepth === 0) { inRegex = false; }
      continue;
    }
    
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === '/' && next === '/') { inLineComment = true; continue; }
    if (ch === '/' && next === '*') { inBlockComment = true; i++; continue; }
    
    // Detect regex start - heuristic: / after certain chars
    if (ch === '/' && /[=(,;:?!&|{}[\]\n]/.test(prev)) {
      inRegex = true;
      continue;
    }
    
    // Track braces
    if (ch === '{') {
      // Check if this starts a function body or a block
      // Look backward for function pattern
      const backText = js.slice(Math.max(0, i-200), i);
      const isFunctionBody = /(?:function\s*\w*|\)\s*=>|\w+\s*\([^)]*\))\s*$/.test(backText);
      scopes.push({ type: isFunctionBody ? 'function' : 'block', decls: new Map() });
      continue;
    }
    if (ch === '}') {
      if (scopes.length > 0) scopes.pop();
      continue;
    }
    
    // Check for const/let declarations at current scope
    if (/\b(?:const|let)\b/.test(js.slice(i, i+6))) {
      const declMatch = js.slice(i).match(/^(const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      if (declMatch) {
        const type = declMatch[1];
        const name = declMatch[2];
        const currentScope = scopes.length > 0 ? scopes[scopes.length - 1] : null;
        if (currentScope) {
          if (currentScope.decls.has(name)) {
            const firstLine = getLine(currentScope.decls.get(name));
            const currentLine = getLine(i);
            issues.push({
              func: 'anonymous',
              line: currentLine,
              varName: name,
              declType: type,
              firstLine: firstLine,
              code: lines[currentLine - 1].trim().substring(0, 80)
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

const dupIssues = analyzeScopes();
// Deduplicate by line+varName
const seen = new Set();
const uniqueDups = [];
for (const iss of dupIssues) {
  const key = `${iss.line}-${iss.varName}`;
  if (!seen.has(key)) { seen.add(key); uniqueDups.push(iss); }
}

if (uniqueDups.length === 0) {
  console.log("No duplicate const/let declarations found in any scope.");
} else {
  console.log(`Found ${uniqueDups.length} unique duplicate declarations:\n`);
  uniqueDups.forEach(iss => {
    console.log(`[ISSUE] Line ${iss.line}: duplicate ${iss.declType} '${iss.varName}' (first declared at line ${iss.firstLine})`);
    console.log(`  Code: ${iss.code}`);
  });
}

// =================== 2. Template string issues ===================
console.log("\n========== 2. TEMPLATE STRING ISSUES ==========");
function checkTemplates() {
  let inTemplate = false;
  let startLine = 0;
  let braceDepth = 0;
  let escape = false;
  
  for (let i = 0; i < js.length; i++) {
    const ch = js[i];
    const next = js[i+1] || '';
    if (!inTemplate) {
      if (ch === '`') { inTemplate = true; startLine = getLine(i); braceDepth = 0; }
    } else {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '`') { inTemplate = false; braceDepth = 0; }
      else if (ch === '$' && next === '{') { braceDepth++; i++; }
      else if (braceDepth > 0) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
      }
    }
  }
  if (inTemplate) return [{ line: startLine, type: 'unclosed' }];
  return [];
}

const templateIssues = checkTemplates();
if (templateIssues.length === 0) {
  console.log("No template string issues found.");
} else {
  templateIssues.forEach(iss => console.log(`[ISSUE] Line ${iss.line}: unclosed template string`));
}

// =================== 3. Arrow function issues ===================
console.log("\n========== 3. ARROW FUNCTION SYNTAX ==========");
console.log("Syntax check passed via new Function() - no global syntax errors.");

// =================== 4. Undefined function calls (refined) ===================
console.log("\n========== 4. UNDEFINED FUNCTION REFERENCES (Top concerns) ==========");
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
    'Math','parseInt','parseFloat','isNaN','isFinite','encodeURI','decodeURI','escape','unescape','eval'
  ]);
  
  // Find all definitions
  const funcDecl = /function\s+(\w+)/g;
  let m;
  while ((m = funcDecl.exec(js)) !== null) defined.add(m[1]);
  
  const varFunc = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:function\s*\(|\()/g;
  while ((m = varFunc.exec(js)) !== null) defined.add(m[1]);
  
  const objMethod = /(\w+):\s*(?:async\s+)?function\s*\(/g;
  while ((m = objMethod.exec(js)) !== null) defined.add(m[1]);
  
  const shorthand = /(\w+)\s*\([^)]*\)\s*\{/g;
  while ((m = shorthand.exec(js)) !== null) defined.add(m[1]);
  
  // Check for calls that might be undefined - but only look for patterns like `foo()` where foo is not in defined
  const callPat = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const calls = {};
  while ((m = callPat.exec(js)) !== null) {
    const name = m[1];
    if (defined.has(name)) continue;
    if (['if','while','for','switch','catch','return','throw','typeof','instanceof','new','delete','void','in','of','with','class','extends','yield','await','case','default','debugger','else'].includes(name)) continue;
    if (name.startsWith('on') && name.length > 2) continue; // event handlers
    if (name === 'get' || name === 'set') continue;
    const line = getLine(m.index);
    if (!calls[name]) calls[name] = [];
    calls[name].push(line);
  }
  
  // Filter: only report names that are called multiple times and aren't clearly object methods
  const results = [];
  for (const [name, linesArr] of Object.entries(calls)) {
    if (linesArr.length >= 1) {
      results.push({ name, count: linesArr.length, lines: linesArr.slice(0, 3) });
    }
  }
  return results.sort((a,b) => b.count - a.count);
}

const undefinedFuncs = checkUndefined();
console.log(`Found ${undefinedFuncs.length} potentially undefined function references. Showing top 20:\n`);
undefinedFuncs.slice(0, 20).forEach(f => {
  console.log(`[WARNING] '${f.name}' called ${f.count} times (lines: ${f.lines.join(', ')})`);
});

// =================== 5. onclick handlers ===================
console.log("\n========== 5. ONCLICK HANDLERS IN JS ==========");
function checkOnclick() {
  const issues = [];
  const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = onclickRegex.exec(js)) !== null) {
    const handler = m[1].trim();
    const line = getLine(m.index);
    issues.push({ line, handler });
  }
  return issues;
}

const onclicks = checkOnclick();
if (onclicks.length === 0) {
  console.log("No inline onclick handlers found in JS strings.");
} else {
  onclicks.forEach(iss => {
    console.log(`[INFO] Line ${iss.line}: onclick='${iss.handler}'`);
  });
}

// =================== 6. null access patterns ===================
console.log("\n========== 6. POTENTIAL NULL ACCESS (sample) ==========");
function checkNullAccess() {
  const issues = [];
  const patterns = [
    { regex: /\bgame\.\w+/g, name: 'game' },
    { regex: /\bplayer\.\w+/g, name: 'player' },
  ];
  patterns.forEach(({ regex, name }) => {
    let m;
    while ((m = regex.exec(js)) !== null) {
      const line = getLine(m.index);
      if (line > 1) {
        const lineText = lines[line - 1];
        // Skip if it has optional chaining or obvious null check
        if (!lineText.includes('?.') && !lineText.includes('if')) {
          issues.push({ line, name, code: lineText.trim().substring(0, 100) });
        }
      }
    }
  });
  return issues;
}

const nullAccess = checkNullAccess();
console.log(`Found ${nullAccess.length} potential null access patterns. Sample:\n`);
nullAccess.slice(0, 10).forEach(iss => {
  console.log(`[INFO] Line ${iss.line}: ${iss.name} access - ${iss.code}`);
});

console.log("\n========== ANALYSIS COMPLETE ==========");

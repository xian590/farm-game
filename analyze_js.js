const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');
const lines = js.split('\n');

function getLineCol(pos) {
  let line = 1, col = 1;
  for (let i = 0; i < pos && i < js.length; i++) {
    if (js[i] === '\n') { line++; col = 1; }
    else { col++; }
  }
  return { line, col };
}

function getLine(pos) {
  return getLineCol(pos).line;
}

// =================== 1. Duplicate const/let in same function scope ===================
console.log("\n========== 1. DUPLICATE const/let IN SAME SCOPE ANALYSIS ==========");

function findScopeDuplicates() {
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcDeclMatch = line.match(/^(\s*)(?:async\s+)?function\s+(\w+)\s*\(/);
    if (funcDeclMatch) {
      const funcName = funcDeclMatch[2];
      const startLine = i;
      let j = i;
      let braces = 0;
      let foundBody = false;
      let inString = null;
      let escapeNext = false;
      
      for (; j < lines.length; j++) {
        const l = lines[j];
        for (let k = 0; k < l.length; k++) {
          const ch = l[k];
          if (inString) {
            if (escapeNext) { escapeNext = false; continue; }
            if (ch === '\\') { escapeNext = true; continue; }
            if (ch === inString) { inString = null; continue; }
            continue;
          }
          if (ch === '"' || ch === "'" || ch === '`') {
            inString = ch;
            continue;
          }
          if (ch === '/' && k + 1 < l.length && l[k+1] === '/') break;
          if (ch === '{' && !foundBody) { foundBody = true; braces = 1; continue; }
          if (foundBody) {
            if (ch === '{') braces++;
            if (ch === '}') {
              braces--;
              if (braces === 0) {
                // Check for duplicate declarations in this function body
                const bodyLines = lines.slice(startLine, j + 1);
                const decls = {};
                let blockDepth = 0;
                let bodyInString = null;
                let bodyEscape = false;
                for (let bi = 0; bi < bodyLines.length; bi++) {
                  const bl = bodyLines[bi];
                  const actualLine = startLine + bi + 1;
                  const declMatch = bl.match(/^(\s*)(const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                  if (declMatch && blockDepth === 1) {
                    const varName = declMatch[3];
                    const type = declMatch[2];
                    if (decls[varName]) {
                      issues.push({
                        type: 'duplicate_declaration',
                        func: funcName,
                        line: actualLine,
                        varName: varName,
                        declType: type,
                        firstLine: decls[varName].line,
                        code: bl.trim()
                      });
                    } else {
                      decls[varName] = { line: actualLine, type };
                    }
                  }
                  
                  for (let bk = 0; bk < bl.length; bk++) {
                    const bch = bl[bk];
                    if (bodyInString) {
                      if (bodyEscape) { bodyEscape = false; continue; }
                      if (bch === '\\') { bodyEscape = true; continue; }
                      if (bch === bodyInString) { bodyInString = null; continue; }
                      continue;
                    }
                    if (bch === '"' || bch === "'" || bch === '`') {
                      bodyInString = bch;
                      continue;
                    }
                    if (bch === '/' && bk + 1 < bl.length && bl[bk+1] === '/') break;
                    if (bch === '{') blockDepth++;
                    if (bch === '}') blockDepth--;
                  }
                }
                break;
              }
            }
          }
        }
      }
    }
  }
  
  return issues;
}

const dupIssues = findScopeDuplicates();
if (dupIssues.length === 0) {
  console.log("No duplicate const/let declarations found in function scopes.");
} else {
  dupIssues.forEach(iss => {
    console.log(`[ISSUE] Function '${iss.func}' line ${iss.line}: duplicate ${iss.declType} '${iss.varName}' (first declared at line ${iss.firstLine})`);
    console.log(`  Code: ${iss.code}`);
  });
}

// =================== 2. Template string issues ===================
console.log("\n========== 2. TEMPLATE STRING ISSUES ==========");

function findTemplateStringIssues() {
  const issues = [];
  let inTemplate = false;
  let templateStartLine = 0;
  let templateStartCol = 0;
  let braceDepth = 0;
  let inStringInTemplate = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (!inTemplate) {
        if (ch === '`') {
          inTemplate = true;
          templateStartLine = i + 1;
          templateStartCol = j + 1;
          braceDepth = 0;
          inStringInTemplate = null;
        }
      } else {
        if (inStringInTemplate) {
          if (ch === '\\') { j++; continue; }
          if (ch === inStringInTemplate) { inStringInTemplate = null; }
          continue;
        }
        if (ch === '"' || ch === "'") {
          inStringInTemplate = ch;
          continue;
        }
        if (ch === '$' && j + 1 < line.length && line[j + 1] === '{') {
          braceDepth++;
          j++;
          continue;
        }
        if (ch === '{' && braceDepth > 0) {
          braceDepth++;
          continue;
        }
        if (ch === '}' && braceDepth > 0) {
          braceDepth--;
          continue;
        }
        if (ch === '`') {
          if (braceDepth !== 0) {
            issues.push({
              type: 'unclosed_template_brace',
              line: templateStartLine,
              col: templateStartCol,
              message: `Template string starting at line ${templateStartLine} has unclosed \${} braces (depth ${braceDepth})`
            });
          }
          inTemplate = false;
          braceDepth = 0;
        }
      }
    }
  }
  
  if (inTemplate) {
    issues.push({
      type: 'unclosed_template',
      line: templateStartLine,
      col: templateStartCol,
      message: `Template string starting at line ${templateStartLine} was never closed`
    });
  }
  
  return issues;
}

const templateIssues = findTemplateStringIssues();
if (templateIssues.length === 0) {
  console.log("No template string issues found.");
} else {
  templateIssues.forEach(iss => console.log(`[ISSUE] Line ${iss.line}: ${iss.message}`));
}

// =================== 3. Arrow function syntax issues ===================
console.log("\n========== 3. ARROW FUNCTION ISSUES ==========");
function findArrowFunctionIssues() {
  const issues = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const badArrow = line.match(/[^)\w\]\}]\s*=>/);
    if (badArrow && !line.includes('//') && !line.includes('/*')) {
      issues.push({ line: i + 1, code: line.trim(), type: 'suspicious_arrow' });
    }
  }
  return issues;
}

const arrowIssues = findArrowFunctionIssues();
if (arrowIssues.length === 0) {
  console.log("No obvious arrow function syntax issues found.");
} else {
  arrowIssues.forEach(iss => console.log(`[WARNING] Line ${iss.line}: suspicious arrow function syntax: ${iss.code}`));
}

// =================== 4. Undefined function references ===================
console.log("\n========== 4. UNDEFINED FUNCTION REFERENCES ==========");
function findUndefinedFunctions() {
  const defined = new Set([
    'eval', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'encodeURIComponent',
    'decodeURI', 'decodeURIComponent', 'escape', 'unescape', 'Number', 'String', 'Boolean',
    'Object', 'Array', 'Function', 'Date', 'RegExp', 'Error', 'Math', 'JSON', 'console',
    'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'alert', 'confirm', 'prompt',
    'document', 'window', 'localStorage', 'sessionStorage', 'fetch', 'Promise', 'Map', 'Set',
    'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect', 'Intl', 'ArrayBuffer', 'DataView',
    'Uint8Array', 'Uint16Array', 'Uint32Array', 'Int8Array', 'Int16Array', 'Int32Array',
    'Float32Array', 'Float64Array', 'BigInt', 'Infinity', 'NaN', 'undefined', 'null',
    'true', 'false', 'this', 'arguments', 'super', 'require', 'module', 'exports', 'globalThis',
    'AudioContext', 'AudioBufferSourceNode', 'GainNode', 'OscillatorNode', 'BiquadFilterNode',
    'addEventListener', 'removeEventListener', 'dispatchEvent', 'requestAnimationFrame',
    'cancelAnimationFrame', 'location', 'history', 'navigator', 'screen', 'performance',
    'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'btoa', 'atob',
    'XMLHttpRequest', 'WebSocket', 'Worker', 'SharedWorker', 'EventSource', 'Blob',
    'File', 'FileReader', 'FormData', 'Headers', 'Request', 'Response', 'URL', 'URLSearchParams',
    'TextEncoder', 'TextDecoder', 'AbortController', 'AbortSignal', 'CustomEvent', 'Event',
    'MutationObserver', 'IntersectionObserver', 'ResizeObserver', 'matchMedia', 'getComputedStyle',
    'requestIdleCallback', 'cancelIdleCallback', 'queueMicrotask', 'structuredClone'
  ]);
  
  const funcDeclRegex = /function\s+(\w+)/g;
  let m;
  while ((m = funcDeclRegex.exec(js)) !== null) {
    defined.add(m[1]);
  }
  
  const assignRegex = /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function|(?:const|let|var)\s+(\w+)\s*=\s*\(?[^=]*\)?\s*=>/g;
  while ((m = assignRegex.exec(js)) !== null) {
    defined.add(m[1] || m[2]);
  }
  
  const methodRegex = /(\w+):\s*(?:async\s+)?function\s*\(/g;
  while ((m = methodRegex.exec(js)) !== null) {
    defined.add(m[1]);
  }
  
  const shorthandRegex = /^(\s*)(\w+)\s*\([^)]*\)\s*\{/gm;
  while ((m = shorthandRegex.exec(js)) !== null) {
    defined.add(m[2]);
  }
  
  const callRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  const called = new Map();
  while ((m = callRegex.exec(js)) !== null) {
    const name = m[1];
    const line = getLine(m.index);
    if (!defined.has(name)) {
      if (!called.has(name)) called.set(name, []);
      called.get(name).push(line);
    }
  }
  
  const issues = [];
  for (const [name, linesArr] of called) {
    if (['if', 'while', 'for', 'switch', 'catch', 'return', 'throw', 'typeof', 'instanceof', 'new', 'delete', 'void', 'in', 'of', 'with', 'class', 'extends', 'yield', 'await'].includes(name)) continue;
    if (name.startsWith('on') || name === 'get' || name === 'set') continue;
    issues.push({ name, lines: linesArr.slice(0, 5) });
  }
  
  return issues.sort((a, b) => b.lines.length - a.lines.length);
}

const undefinedFuncs = findUndefinedFunctions();
if (undefinedFuncs.length === 0) {
  console.log("No undefined function references found.");
} else {
  undefinedFuncs.slice(0, 30).forEach(iss => {
    console.log(`[POTENTIAL ISSUE] Function '${iss.name}' called but never defined (lines: ${iss.lines.join(', ')})`);
  });
  if (undefinedFuncs.length > 30) console.log(`... and ${undefinedFuncs.length - 30} more`);
}

// =================== 5. onclick handlers ===================
console.log("\n========== 5. ONCLICK HANDLERS ==========");
function findOnclickHandlers() {
  const issues = [];
  const onclickRegex = /onclick\s*=\s*["']([^"']+)["']/g;
  let m;
  while ((m = onclickRegex.exec(js)) !== null) {
    const handler = m[1].trim();
    const line = getLine(m.index);
    const funcName = handler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/)?.[1];
    issues.push({ line, handler, funcName, type: 'onclick' });
  }
  return issues;
}

const onclickHandlers = findOnclickHandlers();
if (onclickHandlers.length === 0) {
  console.log("No onclick handlers found in JS.");
} else {
  onclickHandlers.forEach(iss => {
    console.log(`[INFO] Line ${iss.line}: onclick='${iss.handler}'`);
  });
}

// =================== 6. Null property access ===================
console.log("\n========== 6. POTENTIAL NULL PROPERTY ACCESS ==========");
function findNullAccess() {
  const issues = [];
  const patterns = [
    { regex: /\bgame\.\w+/g, name: 'game' },
    { regex: /\bplayer\.\w+/g, name: 'player' },
    { regex: /\bnpc\.\w+/g, name: 'npc' },
    { regex: /\bgetElementById\([^)]+\)\.\w+/g, name: 'DOM element' },
  ];
  
  patterns.forEach(({ regex, name }) => {
    let m;
    while ((m = regex.exec(js)) !== null) {
      const line = getLine(m.index);
      const context = lines[line - 1].trim();
      const prevLine = line > 1 ? lines[line - 2] : '';
      const nextLine = line < lines.length ? lines[line] : '';
      if (!prevLine.includes('if') && !prevLine.includes('?') && !context.includes('?.')) {
        issues.push({ line, name, code: context, type: 'potential_null_access' });
      }
    }
  });
  
  return issues;
}

const nullAccess = findNullAccess();
if (nullAccess.length === 0) {
  console.log("No obvious null property access issues.");
} else {
  nullAccess.slice(0, 20).forEach(iss => {
    console.log(`[WARNING] Line ${iss.line}: potential null access on '${iss.name}': ${iss.code}`);
  });
  if (nullAccess.length > 20) console.log(`... and ${nullAccess.length - 20} more`);
}

console.log("\n========== ANALYSIS COMPLETE ==========");

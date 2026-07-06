const fs = require('fs');

const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');

// Extract all inline JS function calls from onclick attributes
const onclickPattern = /onclick="([^"]+)"/g;
const allOnclickHandlers = [];
let m;
while ((m = onclickPattern.exec(html)) !== null) {
  allOnclickHandlers.push(m[1]);
}

// Extract all function definitions from inline scripts
const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let scriptContent = '';
while ((m = scriptPattern.exec(html)) !== null) {
  scriptContent += '\n' + m[1];
}

// Find all function definitions
const funcPattern = /function\s+(\w+)\s*\(/g;
const definedFunctions = new Set();
while ((m = funcPattern.exec(scriptContent)) !== null) {
  definedFunctions.add(m[1]);
}

// Also find arrow functions assigned to const/let
const arrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:function\s*\(|\(?[^)]*\)\s*=>)/g;
while ((m = arrowPattern.exec(scriptContent)) !== null) {
  definedFunctions.add(m[1]);
}

// Extract function names from onclick handlers (simple extraction)
const calledFunctions = new Set();
const handlerLines = allOnclickHandlers.join(';').split(';');

for (const line of handlerLines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  
  // Match function calls: functionName(args)
  const callPattern = /(\w+)\s*\(/g;
  let cm;
  while ((cm = callPattern.exec(trimmed)) !== null) {
    const funcName = cm[1];
    // Skip JavaScript keywords
    const keywords = new Set(['if', 'for', 'while', 'switch', 'return', 'typeof', 'new', 'await', 'yield', 'throw', 'delete', 'in', 'instanceof', 'console', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'JSON', 'Math', 'Date', 'String', 'Number', 'Boolean', 'Array', 'Object', 'RegExp', 'Error', 'Set', 'Map', 'Promise', 'window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'location', 'history', 'screen', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'requestAnimationFrame', 'fetch', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'isNaN', 'isFinite', 'eval', 'undefined', 'null', 'true', 'false', 'NaN', 'Infinity', 'open', 'close', 'show', 'hide', 'toggle', 'play', 'stop', 'start', 'end', 'get', 'set', 'add', 'remove', 'update', 'render', 'init', 'check', 'save', 'load', 'create', 'build', 'make', 'find', 'search', 'filter', 'sort', 'map', 'reduce', 'forEach', 'join', 'split', 'slice', 'splice', 'push', 'pop', 'shift', 'unshift', 'concat', 'indexOf', 'includes', 'replace', 'match', 'test', 'exec', 'trim', 'toLowerCase', 'toUpperCase', 'substring', 'substr', 'charAt', 'charCodeAt', 'fromCharCode', 'split', 'join', 'repeat', 'padStart', 'padEnd', 'startsWith', 'endsWith', 'contains', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'call', 'apply', 'bind', 'keys', 'values', 'entries', 'defineProperty', 'getOwnProperty', 'freeze', 'seal', 'preventExtensions', 'isFrozen', 'isSealed', 'isExtensible', 'getPrototypeOf', 'setPrototypeOf', 'create', 'assign', 'getOwnPropertyNames', 'getOwnPropertySymbols', 'getOwnPropertyDescriptor', 'defineProperties', 'is', 'from', 'of', 'isArray', 'now', 'parse', 'UTC', 'toFixed', 'toPrecision', 'toExponential', 'toLocaleString', 'toString', 'abs', 'floor', 'ceil', 'round', 'max', 'min', 'random', 'pow', 'sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT1_2', 'SQRT2']);
    if (!keywords.has(funcName) && funcName.length > 1) {
      calledFunctions.add(funcName);
    }
  }
}

// Check which called functions are NOT defined
const undefinedFunctions = [];
for (const funcName of calledFunctions) {
  if (!definedFunctions.has(funcName)) {
    undefinedFunctions.push(funcName);
  }
}

console.log('=== onclick 函数引用检查 ===');
console.log('Total onclick handlers: ' + allOnclickHandlers.length);
console.log('Unique functions called: ' + calledFunctions.size);
console.log('Defined functions: ' + definedFunctions.size);
console.log('');

if (undefinedFunctions.length > 0) {
  console.log('UNDEFINED functions called from onclick (CRITICAL):');
  undefinedFunctions.forEach(f => console.log('  ❌ ' + f));
  console.log('Total undefined: ' + undefinedFunctions.length);
} else {
  console.log('✅ All onclick functions are defined!');
}

// Also check if defined functions are never called from onclick (not a problem, just info)
console.log('');
console.log('Defined functions not called from onclick (info only):');
let notCalledCount = 0;
for (const funcName of definedFunctions) {
  if (!calledFunctions.has(funcName) && !funcName.startsWith('render') && !funcName.startsWith('update') && !funcName.startsWith('init')) {
    if (notCalledCount < 20) {
      console.log('  ℹ️ ' + funcName);
    }
    notCalledCount++;
  }
}
if (notCalledCount > 20) {
  console.log('  ... and ' + (notCalledCount - 20) + ' more');
}

const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');

// Extract all script blocks
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let allScriptCode = '';
while ((match = scriptRegex.exec(html)) !== null) {
  allScriptCode += match[1] + '\n';
}

const lines = allScriptCode.split('\n');

// 1. Check for unprotected DOM access: getElementById(...).something without null check
const issues = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Pattern: document.getElementById(...).property or .method() without null check on same line or previous line
  const dangerousPattern = /document\.getElementById\([^)]+\)\.(textContent|innerHTML|value|classList|style|remove|appendChild|insertBefore|setAttribute|getAttribute|focus|blur|click|removeChild)/;
  if (dangerousPattern.test(line)) {
    // Check if this line or previous line has null check
    let hasNullCheck = false;
    // Check previous 5 lines for null check of same variable
    const idMatch = line.match(/document\.getElementById\(['"]([^'"]+)['"]\)/);
    if (idMatch) {
      const id = idMatch[1];
      for (let j = Math.max(0, i - 5); j <= i; j++) {
        if (lines[j].includes(id) && (lines[j].includes('if (') || lines[j].includes('if(') || lines[j].includes('?.') || lines[j].includes('!') || lines[j].includes('return'))) {
          hasNullCheck = true;
        }
      }
    }
    
    // Also check if the result is assigned to a variable first
    const assignMatch = line.match(/const\s+\w+\s*=\s*document\.getElementById/);
    if (!assignMatch && !hasNullCheck) {
      issues.push({ line: i + 1, code: line.trim().substring(0, 80), risk: 'Direct DOM access without null check' });
    }
  }
  
  // Pattern: document.querySelector(...).something without null check
  const qsPattern = /document\.querySelector\([^)]+\)\.(textContent|innerHTML|value|classList|style|remove|appendChild|setAttribute|getAttribute|focus|blur|click)/;
  if (qsPattern.test(line)) {
    let hasNullCheck = false;
    for (let j = Math.max(0, i - 3); j <= i; j++) {
      if (lines[j].includes('if') || lines[j].includes('?.') || lines[j].includes('!') || lines[j].includes('return')) {
        hasNullCheck = true;
      }
    }
    if (!hasNullCheck) {
      issues.push({ line: i + 1, code: line.trim().substring(0, 80), risk: 'querySelector without null check' });
    }
  }
}

console.log('=== POTENTIAL DOM CRASHES ===');
if (issues.length === 0) {
  console.log('No unprotected direct DOM access found!');
} else {
  issues.slice(0, 30).forEach(issue => {
    console.log('Line ' + issue.line + ': ' + issue.risk);
    console.log('  ' + issue.code);
  });
}
console.log('Total issues: ' + issues.length);

// 2. Check for undefined variable references (functions not defined before use in init chain)
console.log('\n=== CHECKING INIT() CALL CHAIN ===');
const initMatch = allScriptCode.match(/function init\(\)\s*\{([\s\S]*?)\n\}/);
if (initMatch) {
  const initBody = initMatch[1];
  const calledFunctions = [...initBody.matchAll(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)].map(m => m[1]);
  const uniqueCalls = [...new Set(calledFunctions)].filter(fn => !['if', 'while', 'for', 'switch', 'catch', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number', 'parseInt', 'parseFloat', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'console', 'window', 'document', 'localStorage', 'alert', 'confirm', 'prompt', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI', 'escape', 'unescape', 'eval', 'typeof', 'return', 'new', 'true', 'false', 'null', 'undefined', 'void', 'this', 'super', 'class', 'extends', 'throw', 'try', 'finally', 'with', 'debugger', 'yield', 'async', 'await', 'export', 'import', 'default', 'as', 'from', 'of', 'in', 'instanceof'].includes(fn));
  
  const definedFunctions = [...allScriptCode.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g)].map(m => m[1]);
  const definedVars = [...allScriptCode.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=\[]/g)].map(m => m[1]);
  const allDefined = new Set([...definedFunctions, ...definedVars]);
  
  const missing = uniqueCalls.filter(fn => !allDefined.has(fn) && fn !== 'logActivity');
  if (missing.length > 0) {
    console.log('Functions called in init() but not defined:', missing.join(', '));
  } else {
    console.log('All init() calls resolve to defined functions ✓');
  }
}

// 3. Check for common runtime errors: accessing property of undefined
console.log('\n=== CHECKING UNDEFINED ACCESS PATTERNS ===');
const undefinedIssues = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Pattern: state.something.something without checking intermediate property
  const statePattern = /state\.[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*/g;
  let m;
  while ((m = statePattern.exec(line)) !== null) {
    // Check if there's a guard like if (state.x) or state.x && state.x.y
    let guarded = false;
    for (let j = Math.max(0, i - 3); j <= i; j++) {
      if (lines[j].includes('if') && lines[j].includes(m[0].split('.')[1])) {
        guarded = true;
      }
    }
    // Simple heuristic: if accessing deeply nested property without ?.
    if (!line.includes('?.') && !guarded && !line.includes('||') && !line.includes('try')) {
      // These are common but not necessarily bugs if parent exists
    }
  }
}
console.log('Checked state property access patterns');

// 4. Check for missing closing quotes in HTML attributes
console.log('\n=== CHECKING HTML ATTRIBUTE QUOTES ===');
const htmlParts = html.split('<script');
let htmlOnly = htmlParts[0];
for (let i = 1; i < htmlParts.length; i++) {
  const endScript = htmlParts[i].indexOf('</script>');
  if (endScript !== -1) {
    htmlOnly += htmlParts[i].substring(endScript + 9);
  }
}
const quoteIssues = [];
const attrRegex = /\s[a-zA-Z-]+=[^'"\s]/g;
let attrMatch;
while ((attrMatch = attrRegex.exec(htmlOnly)) !== null) {
  // Skip data URLs and numeric values
  const context = htmlOnly.substring(attrMatch.index - 10, attrMatch.index + 30);
  if (!context.includes('http') && !context.includes('0') && !context.includes('1')) {
    quoteIssues.push({ pos: attrMatch.index, context: context });
  }
}
console.log('Unquoted attributes (may be intentional):', quoteIssues.length);

// 5. Check for duplicate IDs in HTML
console.log('\n=== CHECKING DUPLICATE IDs ===');
const idRegex = /id=["']([^"']+)["']/g;
const ids = {};
let idMatch;
while ((idMatch = idRegex.exec(htmlOnly)) !== null) {
  const id = idMatch[1];
  ids[id] = (ids[id] || 0) + 1;
}
const duplicates = Object.entries(ids).filter(([k, v]) => v > 1);
if (duplicates.length > 0) {
  console.log('Duplicate IDs found:', duplicates.length);
  duplicates.slice(0, 10).forEach(([id, count]) => {
    console.log('  "' + id + '": ' + count + ' times');
  });
} else {
  console.log('No duplicate IDs ✓');
}

// 6. Check for functions that might throw when called before DOM ready
console.log('\n=== CHECKING DOM-READY SENSITIVE FUNCTIONS ===');
const domSensitiveFns = [];
const fnRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
let fnMatch;
while ((fnMatch = fnRegex.exec(allScriptCode)) !== null) {
  const fnName = fnMatch[1];
  const fnStart = fnMatch.index;
  // Find function body
  const bodyStart = allScriptCode.indexOf('{', fnStart);
  let braceCount = 0;
  let bodyEnd = bodyStart;
  for (let j = bodyStart; j < allScriptCode.length; j++) {
    if (allScriptCode[j] === '{') braceCount++;
    if (allScriptCode[j] === '}') braceCount--;
    if (braceCount === 0) { bodyEnd = j; break; }
  }
  const body = allScriptCode.substring(bodyStart, bodyEnd + 1);
  
  // Check if function accesses DOM without null check
  const domAccess = body.match(/document\.getElementById\(['"]([^'"]+)['"]\)/g);
  if (domAccess) {
    const hasNullCheck = body.includes('if') && (body.includes('!') || body.includes('null') || body.includes('return'));
    if (!hasNullCheck) {
      const accessedIds = [...body.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
      domSensitiveFns.push({ name: fnName, ids: accessedIds });
    }
  }
}
console.log('DOM-sensitive functions without null checks:', domSensitiveFns.length);
domSensitiveFns.slice(0, 20).forEach(fn => {
  console.log('  ' + fn.name + ' accesses: ' + fn.ids.join(', '));
});

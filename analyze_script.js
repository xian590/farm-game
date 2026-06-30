const fs = require('fs');

const content = fs.readFileSync('script_extracted.js', 'utf8');
const lines = content.split('\n');

console.log('=== Script Analysis ===');
console.log('Total chars:', content.length);
console.log('Total lines:', lines.length);

// 1. Find first syntax error with new Function (binary search on full script)
function findSyntaxErrorNewFunction(text) {
  let lo = 0;
  let hi = text.length;
  let firstErrorPos = -1;
  let firstErrorMsg = '';
  
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    try {
      new Function(text.slice(0, mid));
      lo = mid + 1;
    } catch(e) {
      firstErrorPos = mid;
      firstErrorMsg = e.message;
      hi = mid;
    }
  }
  return { pos: firstErrorPos, msg: firstErrorMsg };
}

const newFuncError = findSyntaxErrorNewFunction(content);
console.log('\n=== new Function Error ===');
console.log('Position:', newFuncError.pos);
console.log('Message:', newFuncError.msg);
if (newFuncError.pos > 0) {
  const lineNum = content.slice(0, newFuncError.pos).split('\n').length;
  const context = content.slice(Math.max(0, newFuncError.pos - 200), newFuncError.pos + 200);
  console.log('Line:', lineNum);
  console.log('Context:\n', context);
}

// 2. Find first top-level return with eval
console.log('\n=== Finding top-level return with eval ===');
let cumulative = '';
let foundReturn = null;
for (let i = 0; i < lines.length; i++) {
  cumulative += lines[i] + '\n';
  const trimmed = lines[i].trim();
  if (trimmed.startsWith('return ')) {
    try {
      eval(cumulative);
    } catch(e) {
      if (e.message === 'Illegal return statement') {
        foundReturn = { line: i + 1, text: trimmed };
        break;
      }
    }
  }
}

if (foundReturn) {
  console.log('Found top-level return at line:', foundReturn.line);
  console.log('Text:', foundReturn.text);
  const context = lines.slice(Math.max(0, foundReturn.line - 10), foundReturn.line + 5).join('\n');
  console.log('Context:\n', context);
} else {
  console.log('No top-level return found with simple eval test');
}

// 3. Check for optional chaining
const optionalChainLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('?.')) {
    optionalChainLines.push({ line: i + 1, text: lines[i].trim() });
  }
}
console.log('\n=== Optional Chaining (' + optionalChainLines.length + ' instances) ===');
console.log('First 5:');
optionalChainLines.slice(0, 5).forEach(item => {
  console.log('  Line ' + item.line + ': ' + item.text);
});

// 4. Check for arrow functions
const arrowLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('=>')) {
    arrowLines.push({ line: i + 1, text: lines[i].trim() });
  }
}
console.log('\n=== Arrow Functions (' + arrowLines.length + ' instances) ===');

// 5. Check for spread operator
const spreadLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('...')) {
    spreadLines.push({ line: i + 1, text: lines[i].trim() });
  }
}
console.log('\n=== Spread Operator (' + spreadLines.length + ' instances) ===');

// 6. Try to find exact syntax error by removing chunks
console.log('\n=== Testing syntax error location by chunk removal ===');
const chunkSize = 10000;
for (let i = 0; i < content.length; i += chunkSize) {
  const testContent = content.slice(0, i) + content.slice(i + chunkSize);
  try {
    new Function(testContent);
    console.log('Removing chunk at', i, '-', i + chunkSize, 'makes it parse OK!');
    const context = content.slice(Math.max(0, i - 200), i + chunkSize + 200);
    console.log('Problem chunk context:\n', context);
    break;
  } catch(e) {
    // Still fails
  }
}

// 7. Try to find exact syntax error by testing function declarations
console.log('\n=== Testing function declarations ===');
const funcMatches = content.match(/function\s+\w+/g);
if (funcMatches) {
  console.log('Total function declarations:', funcMatches.length);
  
  for (let i = 0; i < Math.min(funcMatches.length, 50); i++) {
    const funcName = funcMatches[i];
    const idx = content.indexOf(funcName);
    const test = content.slice(0, idx + funcName.length + 500);
    try {
      new Function(test);
    } catch(e) {
      console.log('First failed at function:', funcName, 'at index', idx);
      console.log('Error:', e.message);
      const lineNum = content.slice(0, idx).split('\n').length;
      console.log('Line:', lineNum);
      const context = content.slice(Math.max(0, idx - 200), idx + 500);
      console.log('Context:\n', context);
      break;
    }
  }
}

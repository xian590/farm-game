const fs = require('fs');
const path = 'index-manifestation.html';

if (!fs.existsSync(path)) {
  console.error('File not found: ' + path);
  process.exit(1);
}

const lines = fs.readFileSync(path, 'utf-8').split('\n');

const setIntervals = [];
const setTimeouts = [];
const addEventListeners = [];
const clearIntervals = [];
const clearTimeouts = [];
const removeEventListeners = [];

function isAssignmentEquals(line, idx) {
  if (line[idx] !== '=') return false;
  if (idx > 0 && '><=!'.includes(line[idx - 1])) return false;
  if (idx < line.length - 1 && '=>'.includes(line[idx + 1])) return false;
  return true;
}

function isDirectAssignmentToTimer(line, keyword) {
  const pos = line.indexOf(keyword);
  if (pos === -1) return false;
  for (let i = 0; i < pos; i++) {
    if (line[i] === '=' && isAssignmentEquals(line, i)) {
      let j = i + 1;
      while (j < line.length && ' \t'.includes(line[j])) j++;
      if (line.startsWith(keyword, j)) return true;
      if (line.startsWith('window.' + keyword, j)) return true;
    }
  }
  return false;
}

function cleanLhs(lhs) {
  lhs = lhs.trim();
  lhs = lhs.replace(/^{+/, '').trim();
  if (lhs.includes(')')) {
    lhs = lhs.slice(lhs.lastIndexOf(')') + 1).trim();
  }
  lhs = lhs.replace(/^{+/, '').trim();
  return lhs;
}

function extractLhs(line, keyword) {
  const pos = line.indexOf(keyword);
  if (pos === -1) return null;
  let eqPos = -1;
  for (let i = 0; i < pos; i++) {
    if (line[i] === '=' && isAssignmentEquals(line, i)) {
      let j = i + 1;
      while (j < line.length && ' \t'.includes(line[j])) j++;
      if (line.startsWith(keyword, j) || line.startsWith('window.' + keyword, j)) {
        eqPos = i;
      }
    }
  }
  if (eqPos === -1) return null;
  let lhs = line.slice(0, eqPos).trim();
  for (const kw of ['const ', 'let ', 'var ']) {
    if (lhs.startsWith(kw)) lhs = lhs.slice(kw.length).trim();
  }
  lhs = cleanLhs(lhs);
  return lhs;
}

function extractListenerTargetAndEvent(line, method) {
  const idx = line.indexOf('.' + method + '(');
  if (idx === -1) return { target: null, event: null };
  const target = line.slice(0, idx).trim();
  const start = line.indexOf(method + '(') + method.length + 1;
  const rest = line.slice(start);
  let firstArg = '';
  const commaIdx = rest.indexOf(',');
  const parenIdx = rest.indexOf(')');
  if (commaIdx !== -1 && (parenIdx === -1 || commaIdx < parenIdx)) {
    firstArg = rest.slice(0, commaIdx).trim();
  } else if (parenIdx !== -1) {
    firstArg = rest.slice(0, parenIdx).trim();
  } else {
    firstArg = rest.trim();
  }
  const event = firstArg.replace(/^['"]|['"]$/g, '');
  return { target, event };
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;

  if (line.includes('setInterval') && !line.includes('clearInterval') && isDirectAssignmentToTimer(line, 'setInterval')) {
    const lhs = extractLhs(line, 'setInterval');
    setIntervals.push({ line: lineNum, text: line.trim(), lhs });
  }

  if (line.includes('setTimeout') && !line.includes('clearTimeout') && isDirectAssignmentToTimer(line, 'setTimeout')) {
    const lhs = extractLhs(line, 'setTimeout');
    setTimeouts.push({ line: lineNum, text: line.trim(), lhs });
  }

  if (line.includes('addEventListener')) {
    const { target, event } = extractListenerTargetAndEvent(line, 'addEventListener');
    addEventListeners.push({ line: lineNum, text: line.trim(), target, event });
  }

  if (line.includes('clearInterval')) {
    clearIntervals.push({ line: lineNum, text: line.trim() });
  }

  if (line.includes('clearTimeout')) {
    clearTimeouts.push({ line: lineNum, text: line.trim() });
  }

  if (line.includes('removeEventListener')) {
    const { target, event } = extractListenerTargetAndEvent(line, 'removeEventListener');
    removeEventListeners.push({ line: lineNum, text: line.trim(), target, event });
  }
}

console.log('=== SETINTERVAL FINDINGS ===');
console.log(`Total setInterval assignments: ${setIntervals.length}`);
console.log(`Total clearInterval calls: ${clearIntervals.length}`);
let intervalLeaks = 0;
for (const item of setIntervals) {
  if (!item.lhs) {
    console.log(`Line ${item.line}: Cannot extract assignment target => ${item.text.slice(0, 120)}`);
    intervalLeaks++;
  } else {
    const found = clearIntervals.some(c => c.text.includes(item.lhs));
    if (!found) {
      console.log(`Line ${item.line}: "${item.lhs}" has no clearInterval => ${item.text.slice(0, 120)}`);
      intervalLeaks++;
    }
  }
}
if (intervalLeaks === 0) console.log('No setInterval leaks detected.');

console.log('');
console.log('=== SETTIMEOUT FINDINGS ===');
console.log(`Total setTimeout assignments: ${setTimeouts.length}`);
console.log(`Total clearTimeout calls: ${clearTimeouts.length}`);
let timeoutLeaks = 0;
for (const item of setTimeouts) {
  if (!item.lhs) {
    console.log(`Line ${item.line}: Cannot extract assignment target => ${item.text.slice(0, 120)}`);
    timeoutLeaks++;
  } else {
    const found = clearTimeouts.some(c => c.text.includes(item.lhs));
    if (!found) {
      console.log(`Line ${item.line}: "${item.lhs}" has no clearTimeout => ${item.text.slice(0, 120)}`);
      timeoutLeaks++;
    }
  }
}
if (timeoutLeaks === 0) console.log('No setTimeout leaks detected.');

console.log('');
console.log('=== ADDEVENTLISTENER FINDINGS ===');
console.log(`Total addEventListener calls: ${addEventListeners.length}`);
console.log(`Total removeEventListener calls: ${removeEventListeners.length}`);
let listenerLeaks = 0;
for (const item of addEventListeners) {
  if (!item.target || !item.event) {
    console.log(`Line ${item.line}: Cannot parse => ${item.text.slice(0, 120)}`);
    listenerLeaks++;
  } else {
    const found = removeEventListeners.some(r => r.target === item.target && r.event === item.event);
    if (!found) {
      console.log(`Line ${item.line}: No removeEventListener for ${item.target}.${item.event} => ${item.text.slice(0, 120)}`);
      listenerLeaks++;
    }
  }
}
if (listenerLeaks === 0) console.log('No addEventListener leaks detected.');

console.log('');
console.log('=== SUMMARY ===');
console.log(`setInterval leaks: ${intervalLeaks}`);
console.log(`setTimeout leaks: ${timeoutLeaks}`);
console.log(`addEventListener leaks: ${listenerLeaks}`);

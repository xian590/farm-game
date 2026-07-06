const fs = require('fs');
const code = fs.readFileSync('extracted_script.js', 'utf-8');

// Binary search for the exact error position
let lo = 0, hi = code.length, lastGood = 0;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  try {
    new Function(code.substring(0, mid));
    lastGood = mid;
    lo = mid + 1;
  } catch (e) {
    hi = mid;
  }
}

console.log('Last good position:', lastGood);
console.log('Total length:', code.length);
console.log('Context around error:');
const start = Math.max(0, lastGood - 100);
const end = Math.min(code.length, lastGood + 100);
console.log(JSON.stringify(code.substring(start, end)));
console.log('---');

// Show line and column
let line = 1, col = 0;
for (let i = 0; i < lastGood; i++) {
  if (code[i] === '\n') { line++; col = 0; } else { col++; }
}
console.log('Error at line', line, 'col', col);

// Show lines around error
const lines = code.split('\n');
for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 2); i++) {
  console.log((i+1) + ': ' + lines[i].substring(0, 120));
}

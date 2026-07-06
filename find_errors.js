const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/block2.js', 'utf8');

// Binary search for first error position
let low = 0, high = c.length;
let badPos = 0;
while (low < high) {
  const mid = Math.floor((low + high) / 2);
  try {
    new Function(c.substring(0, mid));
    low = mid + 1;
  } catch (err) {
    badPos = mid;
    high = mid;
  }
}

console.log('First error position: ' + badPos);
const lineNum = c.substring(0, badPos).split('\n').length;
console.log('Line number: ' + lineNum);
console.log('Context:');
console.log(c.substring(badPos - 80, badPos + 80));

// Find second error by starting after first error position
let low2 = badPos + 1, high2 = c.length;
let badPos2 = 0;
while (low2 < high2) {
  const mid = Math.floor((low2 + high2) / 2);
  try {
    new Function(c.substring(badPos + 1, mid));
    low2 = mid + 1;
  } catch (err) {
    badPos2 = mid;
    high2 = mid;
  }
}

if (badPos2 > 0) {
  console.log('\nSecond error position: ' + badPos2);
  const lineNum2 = c.substring(0, badPos2).split('\n').length;
  console.log('Line number: ' + lineNum2);
  console.log('Context:');
  console.log(c.substring(badPos2 - 80, badPos2 + 80));
}

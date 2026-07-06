const fs = require('fs');
const vm = require('vm');
const js = fs.readFileSync('extracted_script.js', 'utf-8');

console.log('Total JS length:', js.length);
console.log('Searching for syntax errors...\n');

// Binary search for the error location
let low = 0;
let high = js.length;
let lastGood = 0;

while (low < high) {
  const mid = Math.floor((low + high) / 2);
  const chunk = js.substring(0, mid);
  try {
    new vm.Script(chunk);
    lastGood = mid;
    low = mid + 1;
  } catch (e) {
    high = mid;
  }
}

console.log('Last valid position:', lastGood);
console.log('Context around error:');
console.log('---');
const start = Math.max(0, lastGood - 200);
const end = Math.min(js.length, lastGood + 200);
console.log(js.substring(start, end));
console.log('---');
console.log('\nError at position', lastGood, ':', js.substring(lastGood, lastGood + 50));

// Also try to compile with the error context
const errorChunk = js.substring(0, lastGood + 1);
try {
  new vm.Script(errorChunk);
} catch (e) {
  console.log('\nError message:', e.message);
  console.log('Error location:', e.stack?.split('\n')[0] || 'N/A');
}

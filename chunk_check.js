const fs = require('fs');
const vm = require('vm');
const js = fs.readFileSync('extracted_script.js', 'utf-8');

console.log('Total length:', js.length);
console.log('Searching for syntax error by chunk...\n');

const chunkSize = 5000;
for (let i = 0; i < js.length; i += chunkSize) {
  const chunk = js.substring(0, i + chunkSize);
  try {
    new vm.Script(chunk);
    console.log('Chunk 0-' + (i + chunkSize) + ': OK');
  } catch (e) {
    console.log('Chunk 0-' + (i + chunkSize) + ': FAIL - ' + e.message.substring(0, 100));
    // Binary search within this chunk
    let lo = i;
    let hi = i + chunkSize;
    let lastGood = lo;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const test = js.substring(0, mid);
      try {
        new vm.Script(test);
        lastGood = mid;
        lo = mid + 1;
      } catch (err) {
        hi = mid;
      }
    }
    console.log('  Last good position: ' + lastGood);
    console.log('  Context: ' + JSON.stringify(js.substring(lastGood - 30, lastGood + 70)));
    break;
  }
}

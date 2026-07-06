const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// Find all script blocks and their positions
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let blockNum = 0;
let lastScriptEnd = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  blockNum++;
  lastScriptEnd = match.index + match[0].length;
  console.log('Script block', blockNum, 'at position', match.index, '-', lastScriptEnd);
  console.log('  Last 100 chars:', match[1].slice(-100).replace(/\n/g, '\\n'));
}

console.log('\nTotal HTML length:', html.length);
console.log('Last script ends at:', lastScriptEnd);

// Check what's after last script
console.log('\nContent after last script (first 200 chars):');
console.log(html.slice(lastScriptEnd, lastScriptEnd + 200).replace(/\n/g, '\\n'));

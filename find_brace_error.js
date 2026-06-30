const fs = require('fs');
const content = fs.readFileSync('script_extracted.js', 'utf8');
const lines = content.split('\n');

let depth = 0;
let firstNegative = null;
let negativeLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  
  if (depth < 0 && !firstNegative) {
    firstNegative = {
      line: i + 1,
      text: line,
      depth: depth,
      context: lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 5)).join('\n')
    };
  }
  
  if (depth < 0) {
    negativeLines.push({ line: i + 1, depth: depth });
  }
}

console.log('First negative depth at line:', firstNegative ? firstNegative.line : 'never');
if (firstNegative) {
  console.log('Context:\n' + firstNegative.context);
}

console.log('\nAll negative depth lines:', negativeLines.length);
negativeLines.slice(0, 20).forEach(n => {
  console.log('Line ' + n.line + ': depth=' + n.depth);
});

// Also check if there are any lines with multiple closing braces that might be suspicious
console.log('\n=== Lines with 3+ closing braces ===');
for (let i = 0; i < lines.length; i++) {
  const closeCount = (lines[i].match(/}/g) || []).length;
  if (closeCount >= 3) {
    console.log('Line ' + (i + 1) + ' (' + closeCount + ' }): ' + lines[i].trim().substring(0, 80));
  }
}

// Check lines with 2+ closing braces near where depth first goes negative
if (firstNegative) {
  console.log('\n=== Lines with 2+ closing braces near first negative ===');
  const start = Math.max(0, firstNegative.line - 50);
  const end = Math.min(lines.length, firstNegative.line + 10);
  for (let i = start; i < end; i++) {
    const closeCount = (lines[i].match(/}/g) || []).length;
    if (closeCount >= 2) {
      console.log('Line ' + (i + 1) + ' (' + closeCount + ' }): ' + lines[i].trim().substring(0, 100));
    }
  }
}

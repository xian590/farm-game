const fs = require('fs');
const content = fs.readFileSync('script_extracted.js', 'utf8');
const lines = content.split('\n');

// Simple brace counter (ignores strings/comments for basic analysis)
let braceDepth = 0;
let topLevelReturns = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Skip lines that are inside string literals (very rough check)
  if (trimmed.startsWith('return ') || trimmed === 'return') {
    // Count braces in previous lines to estimate depth
    let prevDepth = 0;
    for (let j = 0; j < i; j++) {
      const prevLine = lines[j];
      for (let k = 0; k < prevLine.length; k++) {
        if (prevLine[k] === '{') prevDepth++;
        if (prevLine[k] === '}') prevDepth--;
      }
    }
    
    topLevelReturns.push({
      line: i + 1,
      text: trimmed,
      braceDepth: prevDepth,
      context: lines.slice(Math.max(0, i - 8), Math.min(lines.length, i + 3)).join('\n')
    });
  }
}

console.log('=== Return statements with negative/zero braceDepth ===');
const suspicious = topLevelReturns.filter(r => r.braceDepth <= 0);
console.log('Count:', suspicious.length);
if (suspicious.length > 0) {
  suspicious.forEach(r => {
    console.log('\nLine ' + r.line + ' (braceDepth=' + r.braceDepth + '):');
    console.log(r.context);
    console.log('---');
  });
}

console.log('\n=== First 20 return statements ===');
topLevelReturns.slice(0, 20).forEach(r => {
  console.log('Line ' + r.line + ' (braceDepth=' + r.braceDepth + '): ' + r.text);
});

// Also check if the script has any syntax issues at the start
console.log('\n=== First 10 lines ===');
lines.slice(0, 10).forEach((l, i) => console.log((i+1) + ': ' + l));

// Check for unclosed braces overall
let totalOpen = 0;
let totalClose = 0;
for (let i = 0; i < lines.length; i++) {
  for (let j = 0; j < lines[i].length; j++) {
    if (lines[i][j] === '{') totalOpen++;
    if (lines[i][j] === '}') totalClose++;
  }
}
console.log('\nTotal open braces:', totalOpen);
console.log('Total close braces:', totalClose);
console.log('Difference:', totalOpen - totalClose);

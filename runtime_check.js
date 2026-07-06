const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf-8');

// Extract script blocks
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
const scripts = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1].trim());
}

// Check for duplicate const/let declarations in each script block
scripts.forEach((code, idx) => {
  if (!code || code.startsWith('src=') || code.length < 100) return;
  
  const constVars = {};
  const letVars = {};
  const lines = code.split('\n');
  
  lines.forEach((line, lineNum) => {
    // Match const declarations (simple cases)
    const constMatch = line.match(/^\s*const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
    if (constMatch) {
      const name = constMatch[1];
      if (constVars[name]) {
        console.log(`Block ${idx+1}, Line ${lineNum+1}: Duplicate const '${name}'`);
        console.log(`  First: Line ${constVars[name].line}`);
        console.log(`  This:  ${line.substring(0, 80)}`);
      } else {
        constVars[name] = { line: lineNum + 1 };
      }
    }
    
    // Match let declarations (simple cases)
    const letMatch = line.match(/^\s*let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
    if (letMatch) {
      const name = letMatch[1];
      if (letVars[name]) {
        console.log(`Block ${idx+1}, Line ${lineNum+1}: Duplicate let '${name}'`);
        console.log(`  First: Line ${letVars[name].line}`);
        console.log(`  This:  ${line.substring(0, 80)}`);
      } else {
        letVars[name] = { line: lineNum + 1 };
      }
    }
  });
  
  console.log(`Block ${idx+1}: Checked ${lines.length} lines, ${Object.keys(constVars).length} const vars, ${Object.keys(letVars).length} let vars`);
});

// Check for functions that might throw runtime errors
// Specifically look for DOM access patterns
const riskyPatterns = [
  /document\.getElementById\(['"]([^'"]+)['"]\).*\.innerHTML/,
  /document\.getElementById\(['"]([^'"]+)['"]\).*\.value/,
  /document\.querySelector/,
];

console.log('\n--- Runtime risk analysis ---');
scripts.forEach((code, idx) => {
  if (!code || code.startsWith('src=') || code.length < 100) return;
  const lines = code.split('\n');
  let riskyCount = 0;
  lines.forEach((line, lineNum) => {
    if (line.includes('document.getElementById') && !line.includes('if (')) {
      riskyCount++;
    }
  });
  console.log(`Block ${idx+1}: ${riskyCount} lines with unguarded getElementById`);
});

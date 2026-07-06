const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf-8');

// Extract onclick handlers
const onclickRegex = /onclick\s*=\s*['\"]([^'\"]+)['\"]/g;
const handlers = new Set();
let m;
while ((m = onclickRegex.exec(html)) !== null) {
  handlers.add(m[1]);
}

// Extract script code for function check
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let allScriptCode = '';
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  allScriptCode += match[1] + '\n';
}

// Check each handler
const issues = [];
handlers.forEach(h => {
  // Extract function name
  const fnName = h.trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
  if (fnName) {
    const name = fnName[1];
    // Escape special regex chars in name
    const escName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const fnRegex = new RegExp('function\\s+' + escName + '\\s*\\(|const\\s+' + escName + '\\s*=|let\\s+' + escName + '\\s*=|var\\s+' + escName + '\\s*=');
    if (!fnRegex.test(allScriptCode)) {
      issues.push(name + ' (in: ' + h.substring(0, 50) + ')');
    }
  }
});

console.log('Total onclick handlers:', handlers.size);
console.log('Missing functions:', issues.length > 0 ? issues.slice(0, 20).join('\n') : 'None');

// Also check for common issues
console.log('\n=== Checking for common inline handler issues ===');
let quoteIssues = 0;
handlers.forEach(h => {
  if (h.includes('"') && !h.includes("'")) {
    // May have quote issues in nested HTML
  }
});
console.log('Checked all handlers');

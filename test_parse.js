const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/block2.js', 'utf8');
// Append closing brackets to make it a complete program for parsing
try {
  new Function(c + '\n/*FORCE_CLOSE*/');
  console.log('Block 2 parsed OK with comment');
} catch (e) {
  console.log('Error: ' + e.message);
}

// Alternative: parse with acorn-style approach - just check syntax
try {
  // Add a dummy closing to make array literal complete temporarily
  const closedCode = c.replace(/const PERSONAS = \[/g, 'const PERSONAS = []');
  new Function(closedCode);
  console.log('Block 2 parsed OK with dummy array close');
} catch (e) {
  console.log('Error with dummy close: ' + e.message);
}

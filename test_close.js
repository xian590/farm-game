const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/block2.js', 'utf8');
const first21 = c.split('\n').slice(0, 21).join('\n');
try {
  new Function(first21 + '\n];');
  console.log('21 OK with closing');
} catch (e) {
  console.log('Error: ' + e.message);
}

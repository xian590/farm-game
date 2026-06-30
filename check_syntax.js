const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('no script'); process.exit(1); }
const script = m[1];
try {
  new Function(script);
  console.log('syntax ok');
} catch (e) {
  const lines = script.split('\n');
  const stack = e.stack || '';
  const match = stack.match(/<anonymous>:([0-9]+):([0-9]+)/);
  const errLine = match ? parseInt(match[1]) : 0;
  console.log('ERROR at line', errLine);
  const start = Math.max(0, errLine - 4);
  const end = Math.min(lines.length, errLine + 3);
  for (let i = start; i < end; i++) {
    console.log((i + 1) + ': ' + lines[i]);
  }
}

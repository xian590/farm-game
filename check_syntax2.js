const fs = require('fs');
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('no script'); process.exit(1); }
const script = m[1];
const lines = script.split('\n');
for (let i = 0; i < lines.length; i++) {
    try {
        require('vm').createScript(lines.slice(0, i + 1).join('\n'));
    } catch (e) {
        if (e.message.includes('Unexpected token') || e.message.includes('Syntax')) {
            console.log('SyntaxError at line', i + 1);
            const start = Math.max(0, i - 4);
            const end = Math.min(lines.length, i + 3);
            for (let j = start; j < end; j++) {
                console.log((j + 1) + ': ' + lines[j]);
            }
            console.log('Error:', e.message);
            process.exit(1);
        }
    }
}
console.log('No syntax error found');

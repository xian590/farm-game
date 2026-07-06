const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const s = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if (s) {
    try {
        new Function(s[1]);
        console.log('OK');
    } catch (e) {
        console.log('Error:', e.message);
        // Find line number
        const lines = s[1].split('\n');
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= (e.pos || 0)) {
                console.log('Around line', i + 1, 'in script');
                console.log(lines[i].substring(0, 100));
                break;
            }
            charCount += lines[i].length + 1;
        }
    }
}

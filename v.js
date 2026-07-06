const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const s = c.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if (s) {
    try {
        new Function(s[1]);
        console.log('OK');
    } catch (e) {
        console.log(e.message);
    }
}

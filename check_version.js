const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const m = c.match(/GAME_VERSION = '([0-9.]+)'/);
console.log(m ? m[1] : 'not found');

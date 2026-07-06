const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');
c = c.replace(/const GAME_VERSION = 1\.4\.6;/g, "const GAME_VERSION = '1.4.6';");
fs.writeFileSync('farm_game.html', c);
console.log('Fixed version');

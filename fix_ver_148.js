const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');
c = c.replace(/const const GAME_VERSION = 1\.4\.8;/g, "const GAME_VERSION = '1.4.8';");
c = c.replace(/const GAME_VERSION = 1\.4\.8;/g, "const GAME_VERSION = '1.4.8';");
fs.writeFileSync('farm_game.html', c);
fs.writeFileSync('index.html', c);
console.log('Fixed version');

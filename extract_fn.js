const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const idx = c.indexOf('function _doSellCrop');
const end = c.indexOf('function ', idx + 20);
console.log(c.substring(idx, Math.min(idx + 1200, end)));

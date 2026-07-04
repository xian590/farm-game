const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');

// Fix 1: Add _modalPauseStack cleanup to saveGame
// Find the line with delete game._loadGameSpeedTimeout and add after it
const old1 = '        delete game._loadGameSpeedTimeout;';
const new1 = '        delete game._loadGameSpeedTimeout;\r\n        delete game._modalPauseStack;';
if (c.includes(old1) && !c.includes('delete game._modalPauseStack')) {
    c = c.replace(old1, new1);
    console.log('Fixed 1: Added delete game._modalPauseStack in saveGame');
} else {
    console.log('Fix 1 skipped: pattern not found or already exists');
}

// Fix 2: Add version field default in fixSaveData
// Find a good spot near the beginning of fixSaveData
const old2 = '    if (!game.saveVersion) game.saveVersion = GAME_VERSION;';
const new2 = '    if (!game.saveVersion) game.saveVersion = GAME_VERSION;\r\n    if (!game.version) game.version = \'1.0.0\';';
if (c.includes(old2) && !c.includes("if (!game.version) game.version = '1.0.0'")) {
    c = c.replace(old2, new2);
    console.log('Fixed 2: Added game.version default in fixSaveData');
} else {
    console.log('Fix 2 skipped: pattern not found or already exists');
}

fs.writeFileSync('farm_game.html', c);
console.log('Done!');

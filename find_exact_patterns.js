const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find the exact text around _loadGameSpeedTimeout cleanup
const idx1 = c.indexOf('_loadGameSpeedTimeout');
if (idx1 >= 0) {
    console.log('=== _loadGameSpeedTimeout context ===');
    const start = Math.max(0, idx1 - 50);
    const end = Math.min(c.length, idx1 + 100);
    console.log(JSON.stringify(c.substring(start, end)));
}

// Find saveVersion in fixSaveData
const idx2 = c.indexOf('saveVersion');
if (idx2 >= 0) {
    console.log('\n=== saveVersion context ===');
    const start = Math.max(0, idx2 - 30);
    const end = Math.min(c.length, idx2 + 80);
    console.log(JSON.stringify(c.substring(start, end)));
}

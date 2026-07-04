const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find the exact location of game.dailyProcessed = {} in the processTime game loop
const idx = c.indexOf('game.dailyProcessed = {}');
if (idx >= 0) {
    const lineNum = c.substring(0, idx).split('\n').length;
    console.log('Found game.dailyProcessed = {} at L' + lineNum);
    console.log('Context:');
    console.log(c.substring(idx - 100, idx + 150));
}

// Also check if there's a separate daily reset area in onNewDay
const newDayIdx = c.indexOf('function onNewDay');
const newDayBody = c.substring(newDayIdx, newDayIdx + 3000);
const dailyIdx = newDayBody.indexOf('dailyActions');
if (dailyIdx >= 0) {
    console.log('\n=== onNewDay dailyActions context ===');
    console.log(newDayBody.substring(dailyIdx - 50, dailyIdx + 200));
}

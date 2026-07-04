const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');
const lines = c.split('\n');

// Find lines around dailyProcessed
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('dailyProcessed = {}')) {
        console.log('Found at L' + (i+1) + ':');
        for (let j = Math.max(0, i-2); j < Math.min(lines.length, i+5); j++) {
            console.log((j+1) + ': ' + JSON.stringify(lines[j]));
        }
    }
}

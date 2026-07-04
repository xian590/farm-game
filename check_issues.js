const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// 1. Check game.gameLog length limit
const logIdx = c.indexOf('game.gameLog');
console.log('=== game.gameLog usage ===');
if (logIdx >= 0) {
    const nearby = c.substring(Math.max(0, logIdx-200), logIdx+500);
    const hasSlice = nearby.includes('.slice(') || nearby.includes('splice(');
    console.log('Length limit found:', hasSlice ? 'YES' : 'NO');
}

// 2. Check addLog function for array limit
const addLogMatch = c.match(/function addLog[^{]*{[\s\S]{0,800}}/);
if (addLogMatch) {
    console.log('\n=== addLog function (first 800 chars) ===');
    console.log(addLogMatch[0]);
}

// 3. Check floatingText cleanup
const floatIdx = c.indexOf('floatingText');
console.log('\n=== floatingText ===');
if (floatIdx >= 0) {
    const nearby = c.substring(floatIdx, floatIdx+300);
    console.log(nearby.substring(0, 300));
}

// 4. Check currentEvent cleanup
const eventIdx = c.indexOf('currentEvent');
console.log('\n=== currentEvent usage ===');
if (eventIdx >= 0) {
    const nearby = c.substring(eventIdx, eventIdx+200);
    console.log(nearby);
}

// 5. Check if onNewDay resets all daily counters
const newDayIdx = c.indexOf('function onNewDay');
if (newDayIdx >= 0) {
    const fnBody = c.substring(newDayIdx, newDayIdx+2000);
    console.log('\n=== onNewDay dailyActions reset ===');
    const resetMatch = fnBody.match(/dailyActions[\s\S]{0,200}/);
    if (resetMatch) console.log(resetMatch[0].substring(0, 200));
}

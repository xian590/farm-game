const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// 1. Find addLog complete function
const addLogMatch = c.match(/function addLog[^{]*{[\s\S]{0,1200}}/);
if (addLogMatch) {
    console.log('=== addLog function ===');
    console.log(addLogMatch[0]);
}

// 2. Check game.gameLog.push and slice
const logPush = c.indexOf('game.gameLog.push');
const logSlice = c.indexOf('game.gameLog.slice');
const logSplice = c.indexOf('game.gameLog.splice');
console.log('\ngame.gameLog.push found:', logPush >= 0);
console.log('game.gameLog.slice found:', logSlice >= 0);
console.log('game.gameLog.splice found:', logSplice >= 0);

// 3. Find onNewDay dailyActions reset
const newDayMatch = c.match(/function onNewDay[^{]*{[\s\S]{0,1500}}/);
if (newDayMatch) {
    console.log('\n=== onNewDay (first 1500 chars) ===');
    // Find dailyActions in this section
    const idx = newDayMatch[0].indexOf('dailyActions');
    if (idx >= 0) {
        console.log(newDayMatch[0].substring(idx, idx+300));
    }
}

// 4. Find currentEvent definition and usage
console.log('\n=== currentEvent definition ===');
const currentEventDef = c.match(/let currentEvent[\s\S]{0,50}/);
if (currentEventDef) console.log(currentEventDef[0]);

const currentEventAssign = c.match(/currentEvent\s*=\s*\w+/g);
if (currentEventAssign) {
    console.log('\n=== currentEvent assignments ===');
    currentEventAssign.slice(0, 10).forEach(a => console.log('  ' + a));
}

// 5. Check for floatingText or floatEl
const floatMatch = c.match(/float(El|Text)[\s\S]{0,200}/);
if (floatMatch) {
    console.log('\n=== floating element ===');
    console.log(floatMatch[0]);
}

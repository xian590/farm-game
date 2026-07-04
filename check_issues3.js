const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// 1. Check if gameLog array exists in game state
const gameLogDef = c.match(/gameLog[\s\S]{0,100}/g);
if (gameLogDef) {
    console.log('=== gameLog references ===');
    gameLogDef.slice(0, 10).forEach(d => console.log('  ' + d.replace(/\n/g, ' ').substring(0, 120)));
}

// 2. Find floating text complete implementation
const floatIdx = c.indexOf('floatEl = document.createElement');
if (floatIdx >= 0) {
    console.log('\n=== floating text implementation ===');
    console.log(c.substring(floatIdx, floatIdx + 600));
}

// 3. Find onNewDay complete and check dailyActions reset
const newDayIdx = c.indexOf('function onNewDay');
if (newDayIdx >= 0) {
    // Find the function end
    const afterFn = c.substring(newDayIdx);
    let braceCount = 0;
    let foundFirstBrace = false;
    let endIdx = 0;
    for (let i = 0; i < afterFn.length; i++) {
        if (afterFn[i] === '{') { braceCount++; foundFirstBrace = true; }
        else if (afterFn[i] === '}') { braceCount--; }
        if (foundFirstBrace && braceCount === 0) { endIdx = i; break; }
    }
    const fnBody = afterFn.substring(0, endIdx + 1);
    
    // Check dailyActions reset
    const dailyIdx = fnBody.indexOf('dailyActions');
    console.log('\n=== onNewDay dailyActions ===');
    if (dailyIdx >= 0) {
        console.log(fnBody.substring(dailyIdx, dailyIdx + 400));
    } else {
        console.log('dailyActions not found in onNewDay!');
    }
    
    // Check all daily counters reset
    const counters = ['studyToday', 'exerciseToday', 'fishToday', 'visitToday', 'lastChatDay', 'lastGiftDay'];
    console.log('\n=== Daily counter resets in onNewDay ===');
    for (const counter of counters) {
        const idx = fnBody.indexOf(counter);
        console.log(counter + ':', idx >= 0 ? 'RESET at L' + (c.substring(0, newDayIdx + idx).split('\n').length) : 'NOT RESET');
    }
}

// 4. Check if gameLog is saved to localStorage (would bloat save)
const saveIdx = c.indexOf('function saveGame');
if (saveIdx >= 0) {
    const saveFn = c.substring(saveIdx, saveIdx + 1500);
    const hasGameLog = saveFn.includes('gameLog');
    console.log('\n=== gameLog in saveGame ===');
    console.log('Saved to localStorage:', hasGameLog);
}

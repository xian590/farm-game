const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix pattern: if (!game._modalPauseStack) without game check first
// This pattern appears in toggleSettings, showEventModal, etc.

const patterns = [
    // Pattern 1: toggleSettings
    {
        old: `        // 打开设置面板时暂停游戏
        if (!game._modalPauseStack) game._modalPauseStack = [];
        if (!gamePaused) {
            game._modalPauseStack.push(false);
            togglePause();
        } else {
            game._modalPauseStack.push(true);
        }`,
        new: `        // 打开设置面板时暂停游戏
        if (game) {
            if (!game._modalPauseStack) game._modalPauseStack = [];
            if (!gamePaused) {
                game._modalPauseStack.push(false);
                togglePause();
            } else {
                game._modalPauseStack.push(true);
            }
        }`
    },
    // Pattern 2: showEventModal (around line 14312)
    {
        old: `    // 打开模态框时暂停游戏
    if (!game._modalPauseStack) game._modalPauseStack = [];
    if (!gamePaused) {
        game._modalPauseStack.push(false);
        togglePause();
    } else {
        game._modalPauseStack.push(true);
    }`,
        new: `    // 打开模态框时暂停游戏
    if (game) {
        if (!game._modalPauseStack) game._modalPauseStack = [];
        if (!gamePaused) {
            game._modalPauseStack.push(false);
            togglePause();
        } else {
            game._modalPauseStack.push(true);
        }
    }`
    }
];

let totalFixed = 0;
for (const p of patterns) {
    while (content.includes(p.old)) {
        content = content.replace(p.old, p.new);
        totalFixed++;
    }
}

// Also fix single-line patterns
const singlePatterns = [
    { old: 'if (!game._modalPauseStack) game._modalPauseStack = [];', new: 'if (game && !game._modalPauseStack) game._modalPauseStack = [];' }
];

for (const p of singlePatterns) {
    while (content.includes(p.old)) {
        content = content.replace(p.old, p.new);
        totalFixed++;
    }
}

console.log('Fixed', totalFixed, 'occurrences');
fs.writeFileSync('farm_game.html', content);

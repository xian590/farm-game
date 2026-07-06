const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix showModal game null reference
const oldBlock = `    // 打开模态框时暂停游戏
    if (!game._modalPauseStack) game._modalPauseStack = [];
    if (!gamePaused) {
        game._modalPauseStack.push(false);
        togglePause();
    } else {
        game._modalPauseStack.push(true);
    }`;

const newBlock = `    // 打开模态框时暂停游戏（游戏未初始化时跳过）
    if (game) {
        if (!game._modalPauseStack) game._modalPauseStack = [];
        if (!gamePaused) {
            game._modalPauseStack.push(false);
            togglePause();
        } else {
            game._modalPauseStack.push(true);
        }
    }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    console.log('Fixed showModal game null check');
} else {
    console.log('Pattern not found in showModal');
}

// Fix closeModal game null reference
const oldClose = `        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game._modalPauseStack && game._modalPauseStack.length > 0) {`;
const newClose = `        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game && game._modalPauseStack && game._modalPauseStack.length > 0) {`;

if (content.includes(oldClose)) {
    content = content.replace(oldClose, newClose);
    console.log('Fixed closeModal game null check');
}

fs.writeFileSync('farm_game.html', content);
console.log('Done');

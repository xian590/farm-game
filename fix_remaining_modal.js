const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix all remaining game._modalPauseStack without game check

// Pattern: closeAllModals
const old1 = `    // 清理暂停栈
    if (game._modalPauseStack) {`;
const new1 = `    // 清理暂停栈
    if (game && game._modalPauseStack) {`;
if (content.includes(old1)) {
    content = content.replace(old1, new1);
    console.log('Fixed closeAllModals');
}

// Pattern: showEventModal cleanup
const old2 = `    // 清理所有残留的暂停状态，防止强制关闭其他弹窗后状态不一致
    if (game._modalPauseStack && game._modalPauseStack.length > 0) {`;
const new2 = `    // 清理所有残留的暂停状态，防止强制关闭其他弹窗后状态不一致
    if (game && game._modalPauseStack && game._modalPauseStack.length > 0) {`;
if (content.includes(old2)) {
    content = content.replace(old2, new2);
    console.log('Fixed showEventModal cleanup');
}

// Pattern: closeModal (any remaining)
const old3 = `        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game._modalPauseStack && game._modalPauseStack.length > 0) {`;
const new3 = `        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game && game._modalPauseStack && game._modalPauseStack.length > 0) {`;
while (content.includes(old3)) {
    content = content.replace(old3, new3);
    console.log('Fixed closeModal');
}

fs.writeFileSync('farm_game.html', content);
console.log('Done');

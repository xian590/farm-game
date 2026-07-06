import re

with open('farm_game.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix showModal game null reference
old_block = '''    // 打开模态框时暂停游戏
    if (!game._modalPauseStack) game._modalPauseStack = [];
    if (!gamePaused) {
        game._modalPauseStack.push(false);
        togglePause();
    } else {
        game._modalPauseStack.push(true);
    }'''

new_block = '''    // 打开模态框时暂停游戏（游戏未初始化时跳过）
    if (game) {
        if (!game._modalPauseStack) game._modalPauseStack = [];
        if (!gamePaused) {
            game._modalPauseStack.push(false);
            togglePause();
        } else {
            game._modalPauseStack.push(true);
        }
    }'''

if old_block in content:
    content = content.replace(old_block, new_block)
    print('Fixed showModal game null check')
else:
    print('Pattern not found')

# Also fix closeModal game null reference in the pause stack section
old_close = '''        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game && game._modalPauseStack && game._modalPauseStack.length > 0) {'''

if old_close not in content:
    # Try to find and fix the closeModal game reference
    old_close2 = '''        // 关闭模态框时恢复游戏（使用栈式恢复）
        if (game._modalPauseStack && game._modalPauseStack.length > 0) {'''
    if old_close2 in content:
        content = content.replace(old_close2, old_close)
        print('Fixed closeModal game null check')

with open('farm_game.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')

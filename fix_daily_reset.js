const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');

// Fix: Add lastChatDay and lastGiftDay reset after dailyProcessed reset in processTime
const oldStr = `        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};
        game.dailyProcessed = {};`;

const newStr = `        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};
        game.dailyProcessed = {};
        // 重置每日NPC交互记录，避免日期循环后错误匹配
        game.lastChatDay = {};
        game.lastGiftDay = {};`;

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync('farm_game.html', c);
    console.log('Fixed: Added lastChatDay and lastGiftDay reset in processTime');
} else {
    console.log('Pattern not found, trying alternative...');
    // Try with different spacing
    const altOld = /game\.dailyActions\s*=\s*\{[^}]+\};\s*\ngame\.dailyProcessed\s*=\s*\{\};/;
    const altMatch = c.match(altOld);
    if (altMatch) {
        console.log('Found alternative pattern:', altMatch[0].substring(0, 100));
    } else {
        console.log('No pattern found at all');
    }
}

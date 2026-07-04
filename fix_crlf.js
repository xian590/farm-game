const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');

// The file uses CRLF line endings
const oldStr = '        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};\r\n        game.dailyProcessed = {};\r\n        // 村民每天帮你干活（浇水除草）并扣日薪';

const newStr = '        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};\r\n        game.dailyProcessed = {};\r\n        // 重置每日NPC交互记录，避免日期循环后错误匹配\r\n        game.lastChatDay = {};\r\n        game.lastGiftDay = {};\r\n        // 村民每天帮你干活（浇水除草）并扣日薪';

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    fs.writeFileSync('farm_game.html', c);
    console.log('Fixed L9813: Added lastChatDay and lastGiftDay reset in processTime');
} else {
    console.log('Pattern not found with CRLF, trying LF only...');
    const oldStr2 = '        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};\n        game.dailyProcessed = {};\n        // 村民每天帮你干活（浇水除草）并扣日薪';
    if (c.includes(oldStr2)) {
        const newStr2 = '        game.dailyActions = {exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0};\n        game.dailyProcessed = {};\n        // 重置每日NPC交互记录，避免日期循环后错误匹配\n        game.lastChatDay = {};\n        game.lastGiftDay = {};\n        // 村民每天帮你干活（浇水除草）并扣日薪';
        c = c.replace(oldStr2, newStr2);
        fs.writeFileSync('farm_game.html', c);
        console.log('Fixed: Added lastChatDay and lastGiftDay reset in processTime (LF)');
    } else {
        console.log('Still not found');
    }
}

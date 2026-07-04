const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Check lastChatDay and lastGiftDay structure
const chatIdx = c.indexOf('lastChatDay');
const giftIdx = c.indexOf('lastGiftDay');

console.log('=== lastChatDay context ===');
if (chatIdx >= 0) {
    console.log(c.substring(chatIdx, chatIdx + 200));
}

console.log('\n=== lastGiftDay context ===');
if (giftIdx >= 0) {
    console.log(c.substring(giftIdx, giftIdx + 200));
}

// Check if they are ever cleared
const chatClear = c.match(/lastChatDay\s*=\s*\{\}/);
const giftClear = c.match(/lastGiftDay\s*=\s*\{\}/);
console.log('\nlastChatDay cleared:', chatClear ? 'YES' : 'NO');
console.log('lastGiftDay cleared:', giftClear ? 'YES' : 'NO');

// Check the onNewDay function around dailyActions reset
const newDayMatch = c.match(/dailyActions\s*=\s*\{[^}]+\};/);
if (newDayMatch) {
    const idx = c.indexOf(newDayMatch[0]);
    console.log('\n=== onNewDay context around dailyActions ===');
    console.log(c.substring(idx - 200, idx + 300));
}

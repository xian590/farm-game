const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Find onNewDay and show lastChatDay/lastGiftDay handling
const idx = c.indexOf('function onNewDay');
const fnStart = c.indexOf('{', idx);
let brace = 1;
let end = fnStart + 1;
for (let i = fnStart + 1; i < c.length && brace > 0; i++) {
    if (c[i] === '{') brace++;
    else if (c[i] === '}') brace--;
    if (brace === 0) end = i;
}
const fnBody = c.substring(fnStart, end + 1);

console.log('=== onNewDay full body ===');
console.log(fnBody.substring(0, 2000));

// Also check where lastChatDay is set to {}
const chatReset = c.match(/lastChatDay\s*=\s*\{\}/g);
const giftReset = c.match(/lastGiftDay\s*=\s*\{\}/g);
console.log('\n=== All lastChatDay = {} occurrences ===');
if (chatReset) {
    const matches = [];
    let pos = 0;
    while ((pos = c.indexOf('lastChatDay = {}', pos)) !== -1) {
        const lineNum = c.substring(0, pos).split('\n').length;
        matches.push(lineNum);
        pos++;
    }
    matches.forEach(l => console.log('  L' + l));
}
console.log('\n=== All lastGiftDay = {} occurrences ===');
if (giftReset) {
    const matches = [];
    let pos = 0;
    while ((pos = c.indexOf('lastGiftDay = {}', pos)) !== -1) {
        const lineNum = c.substring(0, pos).split('\n').length;
        matches.push(lineNum);
        pos++;
    }
    matches.forEach(l => console.log('  L' + l));
}

const fs = require('fs');
let c = fs.readFileSync('farm_game.html', 'utf8');

// Fix _doSellCrop - add withClickLock wrapper
const oldStr = `function _doSellCrop(cropKey, sellAmount, price) {
    const owned = game.crops[cropKey] || 0;
    if (sellAmount > owned) sellAmount = owned;
    if (sellAmount <= 0) return;`;

const newStr = `function _doSellCrop(cropKey, sellAmount, price) {
    withClickLock('_doSellCrop_' + cropKey + '_' + sellAmount, () => {
    const owned = game.crops[cropKey] || 0;
    if (sellAmount > owned) sellAmount = owned;
    if (sellAmount <= 0) return;`;

if (c.includes(oldStr)) {
    c = c.replace(oldStr, newStr);
    // Find the end of _doSellCrop and add closing });
    // The function ends with saveGame();\n    updateTopBar();\n    showToast...\n}
    // Need to find exact end
    const fnStart = c.indexOf('function _doSellCrop');
    const fnEndMarker = c.indexOf('    saveGame();\n    updateTopBar();', fnStart);
    const afterToast = c.indexOf('showToast(`', fnEndMarker);
    const closingBrace = c.indexOf('}\n\n', afterToast);
    
    if (closingBrace > 0) {
        c = c.slice(0, closingBrace) + '    });\n' + c.slice(closingBrace);
        fs.writeFileSync('farm_game.html', c);
        console.log('Fixed _doSellCrop');
    } else {
        console.log('Could not find closing brace');
    }
} else {
    console.log('_doSellCrop pattern not found');
}

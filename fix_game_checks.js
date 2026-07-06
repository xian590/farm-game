const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix game._modalPauseStack references without game check
// Pattern 1: pauseStackLength assignment
const old1 = `const pauseStackLength = game._modalPauseStack ? game._modalPauseStack.length : 0;`;
const new1 = `const pauseStackLength = game && game._modalPauseStack ? game._modalPauseStack.length : 0;`;

let count = 0;
while (content.includes(old1)) {
    content = content.replace(old1, new1);
    count++;
}
console.log('Fixed pauseStackLength:', count);

// Pattern 2: game._modalPauseStack in condition without game check first
const old2 = `        if (game._modalPauseStack && game._modalPauseStack.length > pauseStackLength) {`;
const new2 = `        if (game && game._modalPauseStack && game._modalPauseStack.length > pauseStackLength) {`;

count = 0;
while (content.includes(old2)) {
    content = content.replace(old2, new2);
    count++;
}
console.log('Fixed modal stack check:', count);

fs.writeFileSync('farm_game.html', content);
console.log('Done');

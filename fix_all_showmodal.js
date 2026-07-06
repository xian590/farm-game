const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Find all occurrences of the pattern and replace them
const oldPattern = /if \(!game\._modalPauseStack\) game\._modalPauseStack = \[\];\n    if \(!gamePaused\) \{\n        game\._modalPauseStack\.push\(false\);\n        togglePause\(\);\n    \} else \{\n        game\._modalPauseStack\.push\(true\);\n    \}/g;

const newPattern = `if (game) {
        if (!game._modalPauseStack) game._modalPauseStack = [];
        if (!gamePaused) {
            game._modalPauseStack.push(false);
            togglePause();
        } else {
            game._modalPauseStack.push(true);
        }
    }`;

const matches = content.match(oldPattern);
console.log('Found', matches ? matches.length : 0, 'occurrences');

if (matches) {
    content = content.replace(oldPattern, newPattern);
    console.log('Fixed all occurrences');
}

fs.writeFileSync('farm_game.html', content);
console.log('Done');

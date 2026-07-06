const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// The file uses CRLF line endings
const oldBlock = `    if (!game._modalPauseStack) game._modalPauseStack = [];\r\n    if (!gamePaused) {\r\n        game._modalPauseStack.push(false);\r\n        togglePause();\r\n    } else {\r\n        game._modalPauseStack.push(true);\r\n    }`;

const newBlock = `    if (game) {\r\n        if (!game._modalPauseStack) game._modalPauseStack = [];\r\n        if (!gamePaused) {\r\n            game._modalPauseStack.push(false);\r\n            togglePause();\r\n        } else {\r\n            game._modalPauseStack.push(true);\r\n        }\r\n    }`;

let count = 0;
while (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    count++;
}

console.log('Fixed', count, 'occurrence(s)');

fs.writeFileSync('farm_game.html', content);
console.log('Done');

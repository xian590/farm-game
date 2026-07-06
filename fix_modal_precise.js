const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// List all unique occurrences of game._modalPauseStack and fix them
const lines = content.split('\n');
let fixed = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines that already have proper null check
    if (line.includes('game && game._modalPauseStack') || line.includes('game || game._modalPauseStack')) {
        continue;
    }
    
    // Fix: if (game._modalPauseStack) -> if (game && game._modalPauseStack)
    if (line.includes('if (game._modalPauseStack)')) {
        lines[i] = line.replace(/if \(game\._modalPauseStack\)/g, 'if (game && game._modalPauseStack)');
        fixed++;
    }
    
    // Fix: if (!game._modalPauseStack) -> if (game && !game._modalPauseStack)
    if (line.includes('if (!game._modalPauseStack)')) {
        lines[i] = line.replace(/if \(!game\._modalPauseStack\)/g, 'if (game && !game._modalPauseStack)');
        fixed++;
    }
    
    // Fix: if (game._modalPauseStack && ... ) -> if (game && game._modalPauseStack && ...)
    if (line.includes('if (game._modalPauseStack &&')) {
        lines[i] = line.replace(/if \(game\._modalPauseStack &&/g, 'if (game && game._modalPauseStack &&');
        fixed++;
    }
}

content = lines.join('\n');
console.log('Fixed', fixed, 'lines');
fs.writeFileSync('farm_game.html', content);

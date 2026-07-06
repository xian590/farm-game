const fs = require('fs');
let lines = fs.readFileSync('farm_game.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    // Fix line that ends with escapeHtml(selectedEvent.effectText) + '</span>');
    if (lines[i].includes("escapeHtml(selectedEvent.effectText) + '</span>');")) {
        lines[i] = lines[i].replace("> '</span>');", "> '</span>', null, null, { allowHtml: true });");
        console.log('Fixed event modal at line', i + 1);
    }
}

fs.writeFileSync('farm_game.html', lines.join('\n'));
console.log('Done');

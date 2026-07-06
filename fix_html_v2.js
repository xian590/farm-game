const fs = require('fs');
let lines = fs.readFileSync('farm_game.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    // Find showModal call in showTutorial and add allowHtml
    if (lines[i].trim() === 'showModal(step.title, step.content, () => {') {
        // Check if next line has the comment and then closing
        if (i + 2 < lines.length && lines[i + 2].trim() === '    });') {
            lines[i + 2] = lines[i + 2].replace('    });', '    }, null, { allowHtml: true });');
            console.log('Fixed showTutorial at line', i + 3);
        }
    }
    
    // Find event modal showModal and add allowHtml
    if (lines[i].includes('showModal(selectedEvent.name, escapeHtml(selectedEvent.desc)')) {
        // Find the closing line
        for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            if (lines[j].includes('escapeHtml(selectedEvent.effectText)')) {
                lines[j] = lines[j].replace('</span>');', '</span>', null, null, { allowHtml: true });');
                console.log('Fixed event modal at line', j + 1);
                break;
            }
        }
    }
}

fs.writeFileSync('farm_game.html', lines.join('\n'));
console.log('Done');

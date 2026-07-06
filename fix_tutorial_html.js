const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix showTutorial - add allowHtml: true
const oldPattern = `    showModal(step.title, step.content, () => {
        // 确认按钮：知道了
    });`;
const newPattern = `    showModal(step.title, step.content, () => {
        // 确认按钮：知道了
    }, null, { allowHtml: true });`;

if (content.includes(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    console.log('Fixed showTutorial');
} else {
    console.log('Pattern not found for showTutorial');
}

fs.writeFileSync('farm_game.html', content);
console.log('Done');

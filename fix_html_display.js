const fs = require('fs');
let content = fs.readFileSync('farm_game.html', 'utf8');

// Fix showTutorial - add allowHtml: true
const old1 = `    showModal(step.title, step.content, () => {
        // 确认按钮：知道了
    });`;
const new1 = `    showModal(step.title, step.content, () => {
        // 确认按钮：知道了
    }, null, { allowHtml: true });`;
if (content.includes(old1)) {
    content = content.replace(old1, new1);
    console.log('Fixed showTutorial');
}

// Fix event modal - add allowHtml: true
const old2 = `    // 显示弹窗
    showModal(selectedEvent.name, escapeHtml(selectedEvent.desc) + '<br><br>' + 
        '<span style="color: ' + (selectedEvent.type === 'good' ? '#27ae60' : '#e74c3c') + ';">' +
        escapeHtml(selectedEvent.effectText) + '</span>');`;
const new2 = `    // 显示弹窗
    showModal(selectedEvent.name, escapeHtml(selectedEvent.desc) + '<br><br>' + 
        '<span style="color: ' + (selectedEvent.type === 'good' ? '#27ae60' : '#e74c3c') + ';">' +
        escapeHtml(selectedEvent.effectText) + '</span>', null, null, { allowHtml: true });`;
if (content.includes(old2)) {
    content = content.replace(old2, new2);
    console.log('Fixed event modal');
}

fs.writeFileSync('farm_game.html', content);
console.log('Done');

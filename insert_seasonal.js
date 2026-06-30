const fs = require('fs');

const filePath = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
const seasonalCode = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/seasonal_events.js', 'utf8');

let html = fs.readFileSync(filePath, 'utf8');

// 插入季节事件代码到 </script> 之前
const insertPoint = html.lastIndexOf('</script>');
if (insertPoint === -1) {
    console.error('Insert point not found');
    process.exit(1);
}

const before = html.substring(0, insertPoint);
const after = html.substring(insertPoint);

html = before + '\n' + seasonalCode + '\n' + after;

// 在 onNewDay 中添加季节事件触发
const onNewDayPattern = '    // 随机事件（15%概率触发）';
const onNewDayReplace = '    // 季节限定事件（30%概率触发）\n    checkSeasonalEvent();\n    \n    // 随机事件（15%概率触发）';

if (html.includes(onNewDayPattern) && !html.includes('checkSeasonalEvent')) {
    html = html.replace(onNewDayPattern, onNewDayReplace);
}

fs.writeFileSync(filePath, html);
console.log('Seasonal events inserted successfully');
console.log('File size:', html.length, 'chars');

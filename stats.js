const fs = require('fs');
const js = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game_extracted.js', 'utf-8');

const onclickCount = (js.match(/onclick\s*=\s*['"]/g) || []).length;
const getByIdCount = (js.match(/document\.getElementById\(/g) || []).length;
const funcCount = (js.match(/function\s+\w+/g) || []).length;
const templateCount = (js.match(/`/g) || []).length / 2;

console.log('Statistics:');
console.log('Functions:', funcCount);
console.log('Template strings:', Math.floor(templateCount));
console.log('getElementById calls:', getByIdCount);
console.log('onclick handlers:', onclickCount);

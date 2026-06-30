const fs = require('fs');
const code = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const js = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] || '';
const lines = js.split('\n');

// Find ?? in JS
console.log('=== ?? matches in JS ===');
for (let i = 0; i < lines.length; i++) {
  if (/\?\?\s*(?![=?])/.test(lines[i]) && !/#/.test(lines[i])) {
    console.log('JS line ' + (i+1) + ': ' + lines[i].trim());
  }
}

// Find # in JS (potential private fields)
console.log('=== # matches in JS (first 20) ===');
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/(?<!\w)#\w+/g);
  if (m) {
    count += m.length;
    if (count <= 20) {
      console.log('JS line ' + (i+1) + ': ' + lines[i].trim());
    }
  }
}
console.log('Total # matches: ' + count);

// Find Object.entries
console.log('=== Object.entries matches (first 5) ===');
let oeCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Object.entries')) {
    oeCount++;
    if (oeCount <= 5) {
      console.log('JS line ' + (i+1) + ': ' + lines[i].trim());
    }
  }
}
console.log('Total Object.entries: ' + oeCount);

// Find Object.values
console.log('=== Object.values matches (first 5) ===');
let ovCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Object.values')) {
    ovCount++;
    if (ovCount <= 5) {
      console.log('JS line ' + (i+1) + ': ' + lines[i].trim());
    }
  }
}
console.log('Total Object.values: ' + ovCount);

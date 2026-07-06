const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach((s, i) => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

// Find addHabit definition
const idx = allScript.indexOf('function addHabit');
if (idx >= 0) {
  console.log('Found function addHabit at position', idx);
  console.log(allScript.substring(idx, idx + 500));
} else {
  const idx2 = allScript.indexOf('addHabit');
  if (idx2 >= 0) {
    console.log('Found addHabit at position', idx2);
    console.log(allScript.substring(idx2, idx2 + 500));
  } else {
    console.log('addHabit not found');
  }
}

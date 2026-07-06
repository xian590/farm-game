const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
console.log('Script blocks: ' + scripts.length);

for (let i = 0; i < scripts.length; i++) {
  const code = scripts[i].replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    new Function(code);
    console.log('Block ' + (i+1) + ' syntax OK');
  } catch(e) {
    console.log('Block ' + (i+1) + ' syntax FAIL: ' + e.message);
  }
}

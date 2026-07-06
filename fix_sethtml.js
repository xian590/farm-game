const fs = require('fs');
let content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');

// Fix setHTML template literal calls that are missing closing )
// Pattern: setHTML('id', `...`; -> setHTML('id', `...`);
const pattern = /setHTML\('([^']+)', `([\s\S]*?)`;/g;
let fixes = 0;
content = content.replace(pattern, function(match, id, template) {
  fixes++;
  return "setHTML('" + id + "', `" + template + "`);";
});

console.log('Fixed ' + fixes + ' setHTML template literal calls');
fs.writeFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', content);

// Verify
const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, n = 0, errors = [];
while ((m = r.exec(html)) !== null) {
  n++;
  try {
    new Function(m[1]);
    console.log('Block ' + n + ': OK');
  } catch (err) {
    console.log('Block ' + n + ': ERROR - ' + err.message);
    errors.push({b: n, msg: err.message});
  }
}
console.log('Total: ' + n + ' blocks, ' + errors.length + ' errors');

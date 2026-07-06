const fs = require('fs');
const js = fs.readFileSync('extracted_script.js', 'utf-8');
const pos = 43;
console.log('File starts with:');
console.log(JSON.stringify(js.substring(0, 60)));
console.log('---');
for (let i = 0; i <= 50; i++) {
  const ch = js[i] || 'END';
  const code = js.charCodeAt(i);
  const marker = i === pos ? ' <-- ERROR POS (43)' : '';
  console.log('Pos ' + i + ': ' + JSON.stringify(ch) + ' (code ' + code + ')' + marker);
}
console.log('---');
// Try compiling with exact prefix
const vm = require('vm');
for (let i = 38; i <= 48; i++) {
  const test = js.substring(0, i);
  try {
    new vm.Script(test);
    console.log('0-' + i + ': OK');
  } catch (e) {
    console.log('0-' + i + ': FAIL - ' + e.message);
  }
}

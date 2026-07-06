const fs = require('fs');
const js = fs.readFileSync('extracted_script.js', 'utf-8');
const pos = 6687;
for (let i = pos - 5; i <= pos + 5; i++) {
  const ch = js[i] || 'END';
  const code = js.charCodeAt(i);
  const marker = i === pos ? ' <-- ERROR POS' : '';
  console.log('Pos ' + i + ': ' + JSON.stringify(ch) + ' (code ' + code + ')' + marker);
}
console.log('---');
console.log('Substring at pos-50 to pos+50:');
console.log(JSON.stringify(js.substring(pos-50, pos+50)));

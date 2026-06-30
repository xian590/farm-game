const fs = require('fs');
const content = fs.readFileSync('script_extracted.js', 'utf8');
const lines = content.split('\n');

// Replace line 11440 (0-indexed: 11439) with the correct function declaration
// The corrupted line is: undefined
// It should be: function prepareField(fieldIdx) { + const field + let staminaCost + if (hoe) + if (stamina < cost)
const fixLines = [
  'function prepareField(fieldIdx) {',
  '    const field = game.fields[fieldIdx];',
  '    ',
  '    let staminaCost = 15;',
  '    if (game.tools.includes(\'hoe\')) {',
  '        staminaCost *= 0.9;',
  '    }',
  '    ',
  '    if (game.stamina < staminaCost) {'
];

// Replace line 11440 (index 11439) with the fix
lines.splice(11439, 1, ...fixLines);
const fixed = lines.join('\n');

console.log('Original line 11440:', JSON.stringify(content.split('\n')[11439]));
console.log('Fixed lines:');
fixLines.forEach((l, i) => console.log('  ' + (11440 + i) + ': ' + l));

try {
  new Function(fixed);
  console.log('new Function after fix: OK');
} catch (e) {
  console.log('new Function after fix: FAILED -', e.message);
}

try {
  eval(fixed);
  console.log('eval after fix: OK');
} catch (e) {
  console.log('eval after fix: FAILED -', e.message);
}

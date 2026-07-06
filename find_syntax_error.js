const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];

if (scripts.length >= 3) {
  const code = scripts[2].replace(/<script>/g, '').replace(/<\/script>/g, '');
  try {
    new Function(code);
    console.log('Block 3 syntax OK');
  } catch (e) {
    console.log('Block 3 syntax error:', e.message);
    // Find approximate line
    const lines = code.split('\n');
    let partial = '';
    for (let i = 0; i < lines.length; i++) {
      partial += lines[i] + '\n';
      try {
        new Function(partial);
      } catch (e2) {
        if (e2.message !== e.message) continue;
        console.log('Error around line', i + 1, 'of Block 3');
        console.log('Line', i, ':', lines[i-1]);
        console.log('Line', i+1, ':', lines[i]);
        console.log('Line', i+2, ':', lines[i+1]);
        break;
      }
    }
  }
}

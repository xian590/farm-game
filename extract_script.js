const http = require('http');
const fs = require('fs');

const url = 'http://localhost:8082/farm_game.html';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (match) {
      const scriptContent = match[1];
      fs.writeFileSync('script_extracted.js', scriptContent);
      console.log('Script extracted: ' + scriptContent.length + ' chars');
      
      // Try to parse it
      try {
        new Function(scriptContent);
        console.log('Parse result: OK');
      } catch (e) {
        console.log('Parse error: ' + e.message);
      }
      
      // Try eval
      try {
        eval(scriptContent);
        console.log('Eval result: OK');
      } catch (e) {
        console.log('Eval error: ' + e.message);
      }
    } else {
      console.log('No script tag found');
    }
  });
}).on('error', (e) => {
  console.error('Error: ' + e.message);
});

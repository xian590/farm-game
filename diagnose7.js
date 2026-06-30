const fs = require('fs');
const { execSync } = require('child_process');

const tempDir = process.env.TEMP || 'C:\\Users\\Administrator\\Documents\\kimi\\workspace';
const endpoint = 'http://127.0.0.1:10086/command';
const session = 'farm-test';

function sendRequest(jsonBody) {
  const tempFile = `${tempDir}\\wb-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
  fs.writeFileSync(tempFile, JSON.stringify(jsonBody));
  try {
    const result = execSync(`curl.exe -s -X POST ${endpoint} -H "Content-Type: application/json" --data-binary "@${tempFile}"`, { encoding: 'utf8', timeout: 30000 });
    return result.trim();
  } catch (err) {
    console.error('Request failed:', err.message);
    return null;
  } finally {
    try { fs.unlinkSync(tempFile); } catch (e) {}
  }
}

console.log('=== Get context around top-level return statements ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var lines = content.split('\\n'); var result = []; for (var i = 0; i < lines.length; i++) { var trimmed = lines[i].trim(); if (/^return\\s/.test(trimmed)) { var funcDepth = 0; for (var j = 0; j < i; j++) { var line = lines[j]; for (var k = 0; k < line.length; k++) { if (line[k] === '{') funcDepth++; if (line[k] === '}') funcDepth--; } } if (funcDepth <= 0) { result.push({line: i + 1, context: lines.slice(Math.max(0, i - 5), i + 6).join('\\n')}); } } } return JSON.stringify(result); })()"
  },
  session: session
});
console.log(r1);

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

console.log('=== Binary search to find syntax error location ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); function testParse(text) { try { new Function(text); return 'OK'; } catch(e) { return e.message; } } var results = []; var mid = Math.floor(idx / 2); results.push({range: '0-' + mid, result: testParse(content.slice(0, mid))}); results.push({range: '0-' + Math.floor(idx * 0.75), result: testParse(content.slice(0, Math.floor(idx * 0.75)))}); results.push({range: '0-' + Math.floor(idx * 0.9), result: testParse(content.slice(0, Math.floor(idx * 0.9)))}); results.push({range: '0-' + idx, result: testParse(content.slice(0, idx))}); return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Check function before playDirtSound ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var before = content.slice(0, idx); var funcMatch = before.match(/function\\s+(\\w+)\\s*\\([^)]*\\)\\s*\\{[^}]*$/); var lastFunc = before.match(/function\\s+\\w+\\s*\\(/g); var lastFuncName = before.match(/function\\s+(\\w+)\\s*\\(/g); var last500 = before.slice(-500); return JSON.stringify({lastFuncNames: lastFuncName ? lastFuncName.slice(-5) : [], last500: last500}); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Look for mismatched braces before playDirtSound ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var text = content.slice(0, idx); var open = 0; var close = 0; for (var i = 0; i < text.length; i++) { if (text[i] === '{') open++; if (text[i] === '}') close++; } return JSON.stringify({openBraces: open, closeBraces: close, diff: open - close}); })()"
  },
  session: session
});
console.log(r3);

console.log('=== Try to parse last 2000 chars before playDirtSound ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var last2000 = content.slice(idx - 2000, idx); try { new Function(last2000); return JSON.stringify({parseLast2000: 'OK'}); } catch(e) { return JSON.stringify({parseLast2000: 'FAILED', error: e.message, code: last2000}); } })()"
  },
  session: session
});
console.log(r4);

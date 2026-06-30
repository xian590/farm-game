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

console.log('=== Finding playDirtSound in script content ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var before = content.slice(Math.max(0, idx - 200), idx); var after = content.slice(idx, idx + 200); var lineNum = content.slice(0, idx).split('\\n').length; return JSON.stringify({foundAt: idx, lineNumber: lineNum, before: before, after: after}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Try parsing smaller chunks to narrow down the error ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var chunk1 = content.slice(0, idx); try { new Function(chunk1); return JSON.stringify({chunk1Result: 'OK'}); } catch(e) { return JSON.stringify({chunk1Result: 'FAILED', chunk1Error: e.message}); } })()"
  },
  session: session
});
console.log(r2);

console.log('=== Check what comes right before playDirtSound ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var context = content.slice(Math.max(0, idx - 300), idx + 300); return JSON.stringify({context: context}); })()"
  },
  session: session
});
console.log(r3);

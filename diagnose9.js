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

console.log('=== Parse from playDirtSound to end ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var after = content.slice(idx); try { new Function(after); return JSON.stringify({afterPlayDirtResult: 'OK'}); } catch(e) { return JSON.stringify({afterPlayDirtResult: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r1);

console.log('=== Parse from function playDirtSound to end ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); try { new Function(after); return JSON.stringify({afterFuncResult: 'OK'}); } catch(e) { return JSON.stringify({afterFuncResult: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r2);

console.log('=== Parse just playDirtSound function ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var endIdx = content.indexOf('function ', idx + 1); if (endIdx === -1) endIdx = content.length; var funcCode = content.slice(idx, endIdx); try { new Function(funcCode); return JSON.stringify({funcResult: 'OK', length: funcCode.length}); } catch(e) { return JSON.stringify({funcResult: 'FAILED', error: e.message, code: funcCode.slice(0, 200)}); } })()"
  },
  session: session
});
console.log(r3);

console.log('=== Check what comes immediately after playDirtSound ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx + 'function playDirtSound'.length, idx + 500); return JSON.stringify({afterFunc: after}); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Check if there is a preceding function declaration issue ===');
const r5 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var before = content.slice(idx - 100, idx); return JSON.stringify({beforeFunc: before}); })()"
  },
  session: session
});
console.log(r5);

console.log('=== Try parsing with the exact text before playDirtSound plus function playDirtSound() {} ===');
const r6 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var before = content.slice(0, idx); var testCode = before + 'function playDirtSound() {}'; try { new Function(testCode); return JSON.stringify({testResult: 'OK'}); } catch(e) { return JSON.stringify({testResult: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r6);

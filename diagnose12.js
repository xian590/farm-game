const fs = require('fs');
const { execSync } = require('child_process');

const tempDir = process.env.TEMP || 'C:\Users\Administrator\Documents\kimi\workspace';
const endpoint = 'http://127.0.0.1:10086/command';
const session = 'farm-test';

function sendRequest(jsonBody) {
  const tempFile = `${tempDir}\wb-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
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

console.log('=== Test new Function on script with last N chars removed ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var results = []; [10000, 50000, 100000, 200000, 300000].forEach(function(n) { var test = content.slice(0, -n); try { new Function(test); results.push({removed: n, result: 'OK'}); } catch(e) { results.push({removed: n, result: 'FAILED', error: e.message}); } }); return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Test new Function on script with first N chars removed ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var results = []; [10000, 50000, 100000, 200000, 300000].forEach(function(n) { var test = content.slice(n); try { new Function(test); results.push({removed: n, result: 'OK'}); } catch(e) { results.push({removed: n, result: 'FAILED', error: e.message}); } }); return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Find first top-level return by eval on cumulative chunks ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var lines = content.split('\n'); var cumulative = ''; var foundReturn = null; for (var i = 0; i < lines.length; i++) { cumulative += lines[i] + '\n'; if (lines[i].trim().startsWith('return ')) { try { eval(cumulative); } catch(e) { if (e.message === 'Illegal return statement') { foundReturn = {line: i + 1, text: lines[i].trim(), context: lines.slice(Math.max(0, i - 5), i + 1).join('\n')}; break; } } } } return JSON.stringify({foundReturn: foundReturn}); })()"
  },
  session: session
});
console.log(r3);

console.log('=== Find exact function after playDirtSound that causes syntax error ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); var funcMatches = after.match(/function\s+\w+/g); var results = []; for (var i = 0; i < Math.min(funcMatches.length, 20); i++) { var funcName = funcMatches[i]; var funcIdx = after.indexOf(funcName); var test = after.slice(0, funcIdx + funcName.length + 200); try { new Function(test); results.push({func: funcName, result: 'OK'}); } catch(e) { results.push({func: funcName, result: 'FAILED', error: e.message}); break; } } return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r4);

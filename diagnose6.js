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

console.log('=== Check if any return statements are at top level ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var lines = content.split('\\n'); var funcDepth = 0; var topLevelReturns = []; for (var i = 0; i < lines.length; i++) { var line = lines[i]; for (var j = 0; j < line.length; j++) { if (line[j] === '{') funcDepth++; if (line[j] === '}') funcDepth--; } var trimmed = line.trim(); if (/^return\\s/.test(trimmed)) { if (funcDepth <= 0) { topLevelReturns.push({line: i + 1, text: trimmed, funcDepth: funcDepth}); } } } return JSON.stringify({topLevelReturnCount: topLevelReturns.length, topLevelReturns: topLevelReturns.slice(0, 10)}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Check if script is wrapped in IIFE or function at very beginning ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent.trim(); var firstLine = content.split('\\n')[0].trim(); var first100 = content.slice(0, 100); return JSON.stringify({firstLine: firstLine, first100: first100}); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Get code around the switch/case before playDirtSound ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('playDirtSound'); var before = content.slice(idx - 2500, idx); var switchIdx = before.lastIndexOf('switch'); var caseIdx = before.lastIndexOf('case'); var funcIdx = before.lastIndexOf('function '); return JSON.stringify({switchIdx: switchIdx, caseIdx: caseIdx, funcIdx: funcIdx, switchContext: before.slice(switchIdx, switchIdx + 200), caseContext: before.slice(caseIdx - 100, caseIdx + 100), funcContext: before.slice(funcIdx, funcIdx + 200)}); })()"
  },
  session: session
});
console.log(r3);

console.log('=== Try to eval the full script with try/catch ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); try { eval(s.textContent); return 'EVAL_OK'; } catch(e) { return JSON.stringify({evalError: e.message, evalStack: e.stack}); } })()"
  },
  session: session
});
console.log(r4);

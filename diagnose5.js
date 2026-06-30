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

console.log('=== Find exact location of first syntax error ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; function findFirstError(text) { try { new Function(text); return null; } catch(e) { return e.message; } } function binarySearchError(text) { var lo = 0; var hi = text.length; var firstError = null; while (lo < hi) { var mid = Math.floor((lo + hi) / 2); try { new Function(text.slice(0, mid)); lo = mid + 1; } catch(e) { firstError = {pos: mid, msg: e.message}; hi = mid; } } return firstError || {pos: text.length, msg: 'none'}; } var err = binarySearchError(content); var context = content.slice(Math.max(0, err.pos - 200), err.pos + 200); var lineNum = content.slice(0, err.pos).split('\\n').length; return JSON.stringify({errorPos: err.pos, errorMsg: err.msg, lineNumber: lineNum, context: context}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Check for top-level return statements ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var returns = content.match(/(^|[\\n;])\\s*return\\s+/g); var returnLines = []; var lines = content.split('\\n'); for (var i = 0; i < lines.length; i++) { if (/^\\s*return\\s+/.test(lines[i])) { returnLines.push({line: i + 1, text: lines[i].trim()}); } } return JSON.stringify({returnCount: returns ? returns.length : 0, topLevelReturns: returnLines.slice(0, 20)}); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Check for const declarations without initializer ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var constMatches = content.match(/const\\s+[a-zA-Z_\\w]+\\s*;/g); var letMatches = content.match(/let\\s+[a-zA-Z_\\w]+\\s*;/g); var lines = content.split('\\n'); var badConsts = []; for (var i = 0; i < lines.length; i++) { var m = lines[i].match(/const\\s+([a-zA-Z_\\w]+)\\s*;/); if (m) { badConsts.push({line: i + 1, text: lines[i].trim()}); } } return JSON.stringify({constWithoutInit: constMatches ? constMatches.length : 0, letWithoutInit: letMatches ? letMatches.length : 0, badConstExamples: badConsts.slice(0, 10)}); })()"
  },
  session: session
});
console.log(r3);

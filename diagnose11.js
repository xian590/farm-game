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

console.log('=== Check for optional chaining and modern JS features ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var optionalChain = content.match(/\\?\\./g); var nullishCoalescing = content.match(/\\?\\?/g); var bigInt = content.match(/\\d+n/g); var spreadObj = content.match(/\\.\\.\\./g); var asyncAwait = content.match(/async\\s+function|await\\s+/g); var arrowFunc = content.match(/=>/g); return JSON.stringify({optionalChainCount: optionalChain ? optionalChain.length : 0, nullishCoalescingCount: nullishCoalescing ? nullishCoalescing.length : 0, bigIntCount: bigInt ? bigInt.length : 0, spreadCount: spreadObj ? spreadObj.length : 0, asyncAwaitCount: asyncAwait ? asyncAwait.length : 0, arrowFuncCount: arrowFunc ? arrowFunc.length : 0}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Find exact location of optional chaining ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('?.', 1000); var lines = content.split('\\n'); var lineInfo = []; for (var i = 0; i < lines.length; i++) { if (lines[i].includes('?.')) { lineInfo.push({line: i + 1, text: lines[i].trim().replace(/\\s+/g, ' ')}); } } return JSON.stringify({firstOccurrence: idx, linesWithOptionalChain: lineInfo.slice(0, 10)}); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Find exact location of halfAfter error ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); function binarySearch(text) { var lo = 0; var hi = text.length; var firstError = -1; while (lo < hi) { var mid = Math.floor((lo + hi) / 2); try { new Function(text.slice(0, mid)); lo = mid + 1; } catch(e) { firstError = mid; hi = mid; } } return firstError; } var errPos = binarySearch(after); var context = after.slice(Math.max(0, errPos - 200), errPos + 200); var lineNum = after.slice(0, errPos).split('\\n').length; return JSON.stringify({errorPos: errPos, lineNumber: lineNum, context: context}); })()"
  },
  session: session
});
console.log(r3);

console.log('=== Find exact location of last1000 error ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var last1000 = content.slice(-1000); function binarySearch(text) { var lo = 0; var hi = text.length; var firstError = -1; while (lo < hi) { var mid = Math.floor((lo + hi) / 2); try { new Function(text.slice(0, mid)); lo = mid + 1; } catch(e) { firstError = mid; hi = mid; } } return firstError; } var errPos = binarySearch(last1000); var context = last1000.slice(Math.max(0, errPos - 200), errPos + 200); var lineNum = last1000.slice(0, errPos).split('\\n').length; return JSON.stringify({errorPos: errPos, lineNumber: lineNum, context: context}); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Check browser user agent ===');
const r5 = sendRequest({
  action: 'evaluate',
  args: {
    code: "JSON.stringify({userAgent: navigator.userAgent, chromeVersion: navigator.userAgent.match(/Chrome\\/([\\d.]+)/)})"
  },
  session: session
});
console.log(r5);

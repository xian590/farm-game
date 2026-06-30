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

console.log('=== Check for use strict ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var hasStrict = content.includes(\"use strict\"); var firstLines = content.split('\\n').slice(0, 10); return JSON.stringify({hasStrict: hasStrict, firstLines: firstLines}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Find all function declarations after playDirtSound ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); var funcMatches = after.match(/function\\s+\\w+/g); return JSON.stringify({functionsAfter: funcMatches ? funcMatches.slice(0, 20) : []}); })()"
  },
  session: session
});
console.log(r2);

console.log('=== Parse after playDirtSound in chunks ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); var results = []; var funcEnd = after.indexOf('function ', 'function playDirtSound'.length); if (funcEnd === -1) funcEnd = after.length; var playDirtCode = after.slice(0, funcEnd); try { new Function(playDirtCode); results.push({playDirtOnly: 'OK'}); } catch(e) { results.push({playDirtOnly: 'FAILED', error: e.message}); } var nextFunc = after.indexOf('function ', funcEnd + 1); var nextChunk = after.slice(0, nextFunc > 0 ? nextFunc : after.length); try { new Function(nextChunk); results.push({firstFewFuncs: 'OK'}); } catch(e) { results.push({firstFewFuncs: 'FAILED', error: e.message}); } var halfAfter = after.slice(0, Math.floor(after.length / 2)); try { new Function(halfAfter); results.push({halfAfter: 'OK'}); } catch(e) { results.push({halfAfter: 'FAILED', error: e.message}); } return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r3);

console.log('=== Get first 500 chars after playDirtSound function ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var after = content.slice(idx); var funcEnd = after.indexOf('function ', 'function playDirtSound'.length); if (funcEnd === -1) funcEnd = after.length; var rest = after.slice(funcEnd, funcEnd + 500); return JSON.stringify({rest: rest}); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Parse last 1000 chars of script ===');
const r5 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var last1000 = content.slice(-1000); try { new Function(last1000); return JSON.stringify({last1000: 'OK'}); } catch(e) { return JSON.stringify({last1000: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r5);

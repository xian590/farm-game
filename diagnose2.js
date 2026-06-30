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

console.log('=== Diagnostic 1: Check for </script> in script content ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var hasScriptTag = content.includes('</script>'); var lastChars = content.slice(-200); return JSON.stringify({hasScriptTag: hasScriptTag, totalLength: content.length, lastChars: lastChars}); })()"
  },
  session: session
});
console.log(r1);

console.log('=== Diagnostic 2: Try to parse script with new Function() ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); try { new Function(s.textContent); return JSON.stringify({parseResult: 'OK', syntaxError: null}); } catch (e) { return JSON.stringify({parseResult: 'FAILED', syntaxError: e.message, stack: e.stack}); } })()"
  },
  session: session
});
console.log(r2);

console.log('=== Diagnostic 3: Check document.readyState and any errors ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "JSON.stringify({readyState: document.readyState, url: location.href, title: document.title})"
  },
  session: session
});
console.log(r3);

console.log('=== Diagnostic 4: Check if script is wrapped in IIFE or event listener ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent.trim(); var firstChars = content.slice(0, 500); var hasIIFE = content.startsWith('(function') || content.startsWith('(function') || content.startsWith('(function(') || content.startsWith('(function ()') || content.startsWith('(()=>'); var hasEventListener = firstChars.includes('DOMContentLoaded') || firstChars.includes('window.onload') || firstChars.includes('document.addEventListener'); return JSON.stringify({firstChars: firstChars, hasIIFE: hasIIFE, hasEventListener: hasEventListener}); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Diagnostic 5: Check CDP console logs ===');
const r5 = sendRequest({
  action: 'cdp',
  args: {
    method: 'Log.enable',
    params: {}
  },
  session: session
});
console.log(r5);

console.log('=== Diagnostic 6: Check CDP Runtime console API ===');
const r6 = sendRequest({
  action: 'cdp',
  args: {
    method: 'Console.enable',
    params: {}
  },
  session: session
});
console.log(r6);

console.log('=== Diagnostic 7: Take screenshot to see page state ===');
const r7 = sendRequest({
  action: 'screenshot',
  args: {},
  session: session
});
console.log(r7);

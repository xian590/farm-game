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

console.log('=== Step 1: Inject error listener ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "window.addEventListener('error', function(e) { console.error('CAPTURED:', e.message, e.filename, e.lineno); if (!window.__consoleErrors) window.__consoleErrors = []; window.__consoleErrors.push({message: e.message, filename: e.filename, lineno: e.lineno}); });"
  },
  session: session
});
console.log(r1);

console.log('=== Step 2: Reload page ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: 'location.reload()'
  },
  session: session
});
console.log(r2);

console.log('=== Step 3: Wait 5 seconds ===');
try {
  execSync('ping -n 6 127.0.0.1 > nul', { timeout: 10000 });
} catch (e) {
  // ping timeout is fine, just wait
}

console.log('=== Step 4: Check typeof initGame and consoleErrors ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "JSON.stringify({initGameType: typeof initGame, consoleErrors: typeof window.__consoleErrors !== 'undefined' ? window.__consoleErrors : 'NOT_DEFINED'})"
  },
  session: session
});
console.log(r3);

console.log('=== Step 5: Check script tags and attributes ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var scripts = Array.from(document.querySelectorAll('script')); var result = []; for (var i = 0; i < scripts.length; i++) { var s = scripts[i]; result.push({index: i, src: s.src || 'inline', hasContent: !!s.textContent, contentLength: s.textContent ? s.textContent.length : 0, type: s.type || 'text/javascript', id: s.id || 'none', defer: s.defer, async: s.async}); } return JSON.stringify({scriptCount: scripts.length, url: location.href, scripts: result}); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Step 6: Check if initGame is defined in any script content ===');
const r5 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var scripts = Array.from(document.querySelectorAll('script')); var found = false; var source = null; for (var i = 0; i < scripts.length; i++) { if (scripts[i].textContent && scripts[i].textContent.includes('initGame')) { found = true; source = {index: i, contentLength: scripts[i].textContent.length, snippet: scripts[i].textContent.slice(0, 200)}; break; } } return JSON.stringify({found: found, source: source, url: location.href}); })()"
  },
  session: session
});
console.log(r5);

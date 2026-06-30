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

console.log('=== Check if playWeedSound parses correctly ===');
const r1 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var before = content.slice(0, idx); var playWeedIdx = before.lastIndexOf('function playWeedSound'); var playWeedCode = before.slice(playWeedIdx); try { new Function(playWeedCode); return JSON.stringify({playWeedResult: 'OK'}); } catch(e) { return JSON.stringify({playWeedResult: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r1);

console.log('=== Check if playWaterSound parses correctly ===');
const r2 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var before = content.slice(0, idx); var waterIdx = before.lastIndexOf('function playWaterSound'); var waterCode = before.slice(waterIdx, playWeedIdx); try { new Function(waterCode); return JSON.stringify({waterResult: 'OK'}); } catch(e) { return JSON.stringify({waterResult: 'FAILED', error: e.message}); } })()"
  },
  session: session
});
console.log(r2);

console.log('=== Check if playSound (with switch) parses correctly ===');
const r3 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var before = content.slice(0, idx); var playSoundIdx = before.lastIndexOf('function playSound'); var waterIdx = before.lastIndexOf('function playWaterSound'); var playSoundCode = before.slice(playSoundIdx, waterIdx); try { new Function(playSoundCode); return JSON.stringify({playSoundResult: 'OK'}); } catch(e) { return JSON.stringify({playSoundResult: 'FAILED', error: e.message, code: playSoundCode.slice(0, 200)}); } })()"
  },
  session: session
});
console.log(r3);

console.log('=== Try to find the exact syntax error by parsing larger chunks ===');
const r4 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var idx = content.indexOf('function playDirtSound'); var results = []; var chunk = content.slice(0, idx); try { new Function(chunk); results.push({fullBeforeDirt: 'OK'}); } catch(e) { results.push({fullBeforeDirt: 'FAILED', error: e.message}); } var half = Math.floor(idx / 2); try { new Function(content.slice(0, half)); results.push({firstHalf: 'OK'}); } catch(e) { results.push({firstHalf: 'FAILED', error: e.message}); } var quarter = Math.floor(idx / 4); try { new Function(content.slice(0, quarter)); results.push({firstQuarter: 'OK'}); } catch(e) { results.push({firstQuarter: 'FAILED', error: e.message}); } return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r4);

console.log('=== Try eval with full script in global context vs function context ===');
const r5 = sendRequest({
  action: 'evaluate',
  args: {
    code: "(function() { var s = document.querySelector('script'); var content = s.textContent; var results = []; try { eval(content); results.push({evalGlobal: 'OK'}); } catch(e) { results.push({evalGlobal: 'FAILED', error: e.message}); } try { new Function(content); results.push({newFunction: 'OK'}); } catch(e) { results.push({newFunction: 'FAILED', error: e.message}); } try { (function() { eval(content); })(); results.push({evalInFunction: 'OK'}); } catch(e) { results.push({evalInFunction: 'FAILED', error: e.message}); } return JSON.stringify(results); })()"
  },
  session: session
});
console.log(r5);

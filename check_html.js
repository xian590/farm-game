const fs = require('fs');

const html = fs.readFileSync('index-manifestation.html', 'utf8');

// Extract all JS from script tags
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allJs = '';
scriptMatches.forEach(s => {
  allJs += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + ';\n';
});

console.log('=== Script Analysis ===');
console.log('Script blocks: ' + scriptMatches.length);
console.log('Total JS chars: ' + allJs.length);

// Extract all function definitions
const fnDefs = new Set();
let m;
const r1 = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
while ((m = r1.exec(allJs)) !== null) fnDefs.add(m[1]);

const r2 = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function\s*\(|\([^)]*\)\s*=>)/g;
while ((m = r2.exec(allJs)) !== null) fnDefs.add(m[1]);

console.log('Defined functions: ' + fnDefs.size);

// Extract onclick functions
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
const globals = new Set(['console','alert','confirm','prompt','state','this','event','window','document','JSON','Math','Date','String','Number','Array','Object']);
const missing = [];
onclickMatches.forEach(match => {
  const code = match.replace(/onclick="/, '').replace(/"$/, '');
  const calls = code.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
  calls.forEach(c => {
    const name = c.replace(/\s*\($/, '');
    if (!fnDefs.has(name) && !globals.has(name) && !name.startsWith('state.') && !name.startsWith('this.')) {
      missing.push(name);
    }
  });
});

const uniqMissing = [...new Set(missing)];
console.log('Missing onclick functions: ' + uniqMissing.length);
uniqMissing.forEach(f => console.log('  - ' + f));

// Check IDs
const idMatches = html.match(/id="([^"]*)"/g) || [];
const dupIds = {};
idMatches.forEach(id => {
  const k = id.replace(/id="/, '').replace(/"$/, '');
  dupIds[k] = (dupIds[k] || 0) + 1;
});
const dups = Object.entries(dupIds).filter(([k, v]) => v > 1);
console.log('\nTotal IDs: ' + idMatches.length);
console.log('Duplicate IDs: ' + dups.length);
dups.forEach(([k, v]) => console.log('  - ' + k + ': ' + v + ' times'));

// Check for unclosed tags in HTML (basic)
const htmlNoScript = html.replace(/<script>[\s\S]*?<\/script>/g, '');
const tags = ['section','div','article','main','header','footer','nav','aside'];
tags.forEach(tag => {
  const open = (htmlNoScript.match(new RegExp('<' + tag + '[\\s>]', 'g')) || []).length;
  const close = (htmlNoScript.match(new RegExp('</' + tag + '>', 'g')) || []).length;
  if (open !== close) {
    console.log('\nUnbalanced <' + tag + '>: open=' + open + ' close=' + close);
  }
});

// Check for undefined functions called in JS
const jsCalls = allJs.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g) || [];
const jsGlobals = new Set([...globals, 'setTimeout','setInterval','clearTimeout','clearInterval','parseInt','parseFloat','isNaN','isFinite','encodeURIComponent','decodeURIComponent','fetch','navigator','location','history','screen','speechSynthesis','Notification','Audio','Image','caches','indexedDB','Intl','atob','btoa','URL','URLSearchParams','Promise','RegExp','Error','Boolean','Map','Set','WeakMap','WeakSet','Symbol','BigInt','eval','undefined','Infinity','NaN','console','document','window','localStorage','sessionStorage']);
const undefinedCalls = [];
jsCalls.forEach(c => {
  const name = c.replace(/\s*\($/, '');
  if (!fnDefs.has(name) && !jsGlobals.has(name) && !/^[A-Z]/.test(name) && name.length > 1) {
    undefinedCalls.push(name);
  }
});
const uniqUndef = [...new Set(undefinedCalls)];
console.log('\nPotentially undefined JS calls: ' + uniqUndef.length);
uniqUndef.slice(0, 30).forEach(f => console.log('  - ' + f));

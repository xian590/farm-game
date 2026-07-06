const fs = require('fs');

const html = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');

// Extract inline script blocks
const inlineBlocks = [];
const regex = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  inlineBlocks.push(m[1]);
}

const allJs = inlineBlocks.join('\n');
const lines = allJs.split('\n');

// 1. Find all function definitions
const funcDefs = new Set();
const funcPattern = /function\s+(\w+)\s*\(/g;
while ((m = funcPattern.exec(allJs)) !== null) funcDefs.add(m[1]);

// Arrow functions / const declarations
const arrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:function\s*\(|\(?[^)]*\)\s*=>)/g;
while ((m = arrowPattern.exec(allJs)) !== null) funcDefs.add(m[1]);

// 2. Find all function calls
const reservedWords = new Set(['if','while','for','switch','catch','return','typeof','new','await','yield','throw','delete','in','instanceof','console','alert','confirm','prompt','parseInt','parseFloat','JSON','Math','Date','String','Number','Boolean','Array','Object','RegExp','Error','Set','Map','Promise','window','document','localStorage','sessionStorage','navigator','location','history','screen','setTimeout','setInterval','clearTimeout','clearInterval','requestAnimationFrame','fetch','encodeURIComponent','decodeURIComponent','encodeURI','decodeURI','isNaN','isFinite','eval','undefined','null','true','false','NaN','Infinity','open','close','show','hide','toggle','play','stop','start','end','get','set','add','remove','update','render','init','check','save','load','create','build','make','find','search','filter','sort','map','reduce','forEach','join','split','slice','splice','push','pop','shift','unshift','concat','indexOf','includes','replace','match','test','exec','trim','toLowerCase','toUpperCase','substring','substr','charAt','charCodeAt','fromCharCode','split','join','repeat','padStart','padEnd','startsWith','endsWith','contains','toString','valueOf','hasOwnProperty','isPrototypeOf','propertyIsEnumerable','toLocaleString','call','apply','bind','keys','values','entries','defineProperty','getOwnProperty','freeze','seal','preventExtensions','isFrozen','isSealed','isExtensible','getPrototypeOf','setPrototypeOf','create','assign','getOwnPropertyNames','getOwnPropertySymbols','getOwnPropertyDescriptor','defineProperties','is','from','of','isArray','now','parse','UTC','toFixed','toPrecision','toExponential','toLocaleString','toString','abs','floor','ceil','round','max','min','random','pow','sqrt','exp','log','sin','cos','tan','asin','acos','atan','atan2','PI','E','LN2','LN10','LOG2E','LOG10E','SQRT1_2','SQRT2']);

const calls = {};
const callPattern = /(?<![.\w])(\w+)\s*\(/g;
while ((m = callPattern.exec(allJs)) !== null) {
  const name = m[1];
  if (!reservedWords.has(name) && !name.startsWith('on') && name.length > 1) {
    calls[name] = (calls[name] || 0) + 1;
  }
}

// 3. Find undefined calls (called but not defined)
const undefinedCalls = [];
for (const [name, count] of Object.entries(calls)) {
  if (!funcDefs.has(name)) {
    undefinedCalls.push({name, count});
  }
}
undefinedCalls.sort((a, b) => b.count - a.count);

// 4. Find unprotected DOM accesses
const unprotected = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('getElementById(') || line.includes('querySelector(')) {
    // Skip if already protected
    if (line.includes('if (') || line.includes('||') || line.includes('&&') || line.includes('?') || line.includes('return') || line.includes('//') || line.startsWith('*')) continue;
    // Check for direct property access
    const hasProp = /getElementById\([^)]+\)\.(\w+)/.test(line) || /querySelector\([^)]+\)\.(\w+)/.test(line);
    if (hasProp) {
      const propMatch = line.match(/getElementById\([^)]+\)\.(\w+)/) || line.match(/querySelector\([^)]+\)\.(\w+)/);
      const prop = propMatch ? propMatch[1] : 'unknown';
      const dangerous = ['classList','innerHTML','textContent','style','value','checked','disabled','src','href','addEventListener','removeEventListener','appendChild','removeChild','insertBefore','setAttribute','removeAttribute','focus','blur','click','submit','reset','play','pause','load','toggle'];
      if (dangerous.includes(prop)) {
        unprotected.push({line: i+1, content: line.substring(0, 100), prop});
      }
    }
  }
}

// 5. Find potential issues with innerHTML assignments
const innerHTMLIssues = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.includes('.innerHTML') && !line.includes('if (')) {
    const match = line.match(/(\w+)\.innerHTML\s*=/);
    if (match) {
      const varName = match[1];
      if (varName !== 'el' && varName !== 'container' && varName !== 'list' && varName !== 'content' && varName !== 'html') {
        // Check if previous line has null check
        let hasCheck = false;
        for (let j = Math.max(0, i-3); j < i; j++) {
          if (lines[j].includes('if (!' + varName + ')') || lines[j].includes('if (' + varName + ')') || lines[j].includes('if (!' + varName)) {
            hasCheck = true;
            break;
          }
        }
        if (!hasCheck) {
          innerHTMLIssues.push({line: i+1, content: line.substring(0, 100)});
        }
      }
    }
  }
}

console.log('=== FUNCTION ANALYSIS ===');
console.log('Total function definitions:', funcDefs.size);
console.log('');

console.log('=== UNDEFINED FUNCTION CALLS (Top 50) ===');
undefinedCalls.slice(0, 50).forEach(c => {
  console.log(`  ${c.name}: called ${c.count} times`);
});
console.log('Total undefined calls:', undefinedCalls.length);
console.log('');

console.log('=== UNPROTECTED DOM ACCESSES (Top 100) ===');
unprotected.slice(0, 100).forEach(u => {
  console.log(`  Line ${u.line}: [${u.prop}] ${u.content}`);
});
console.log('Total unprotected DOM accesses:', unprotected.length);
console.log('');

console.log('=== INNERHTML ASSIGNMENTS WITHOUT NULL CHECK ===');
innerHTMLIssues.slice(0, 50).forEach(u => {
  console.log(`  Line ${u.line}: ${u.content}`);
});
console.log('Total innerHTML issues:', innerHTMLIssues.length);

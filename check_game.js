const fs = require('fs');
const content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch[1];
const lines = script.split('\n');

const results = [];

// 1. Syntax check
try {
  new Function(script);
  results.push('PASS Syntax check');
} catch(e) {
  results.push('FAIL Syntax: ' + e.message);
}

// 2. Brace/Bracket/Paren matching
let braceDepth = 0, bracketDepth = 0, parenDepth = 0;
let inString = false, stringChar = '', escaped = false;
for (let i = 0; i < script.length; i++) {
  const c = script[i];
  if (escaped) { escaped = false; continue; }
  if (c === '\\') { escaped = true; continue; }
  if (inString) { if (c === stringChar) inString = false; continue; }
  if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
  // Skip comments
  if (c === '/' && script[i+1] === '/') { while (i < script.length && script[i] !== '\n') i++; continue; }
  if (c === '/' && script[i+1] === '*') { i += 2; while (i < script.length - 1 && !(script[i] === '*' && script[i+1] === '/')) i++; i++; continue; }
  if (c === '{') braceDepth++;
  else if (c === '}') braceDepth--;
  else if (c === '[') bracketDepth++;
  else if (c === ']') bracketDepth--;
  else if (c === '(') parenDepth++;
  else if (c === ')') parenDepth--;
}
results.push((braceDepth === 0 ? 'PASS' : 'FAIL') + ' Brace depth: ' + braceDepth);
results.push((bracketDepth === 0 ? 'PASS' : 'FAIL') + ' Bracket depth: ' + bracketDepth);
results.push((parenDepth === 0 ? 'PASS' : 'FAIL') + ' Paren depth: ' + parenDepth);

// 3. Duplicate function definitions
const funcDefs = {};
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/function\s+(\w+)\s*\(/);
  if (m) {
    const name = m[1];
    if (!funcDefs[name]) funcDefs[name] = [];
    funcDefs[name].push(i + 1);
  }
}
const dups = Object.entries(funcDefs).filter(([k, v]) => v.length > 1);
if (dups.length > 0) {
  results.push('WARN Duplicate functions:');
  for (const [name, lines_] of dups) {
    results.push('  ' + name + ' at lines: ' + lines_.join(', '));
  }
} else {
  results.push('PASS No duplicate function definitions');
}

// 4. Check NPC_DATA
const npcDataMatch = script.match(/const NPC_DATA = \{([\s\S]*?)\};/);
if (npcDataMatch) {
  const npcIds = [...npcDataMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  results.push('PASS NPC_DATA has ' + npcIds.length + ' NPCs: ' + npcIds.join(', '));
}

// 5. Check PET_DATA
const petDataMatch = script.match(/const PET_DATA = \{([\s\S]*?)\};/);
if (petDataMatch) {
  const petIds = [...petDataMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  results.push('PASS PET_DATA has ' + petIds.length + ' pets: ' + petIds.join(', '));
}

// 6. Check STORY_EVENTS
const storyEventIds = [...script.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
results.push('PASS Total STORY_EVENTS: ' + storyEventIds.length);

// 7. Check EVENT_CHAINS references
const eventChainIds = [...script.matchAll(/eventId:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const uniqueChainEvents = [...new Set(eventChainIds)];
results.push('PASS EVENT_CHAINS references ' + uniqueChainEvents.length + ' unique events');

const missing = uniqueChainEvents.filter(e => !storyEventIds.includes(e));
if (missing.length > 0) {
  results.push('FAIL Missing events: ' + missing.join(', '));
} else {
  results.push('PASS All EVENT_CHAINS events defined');
}

// 8. Check ITEM_EFFECTS
const itemEffectsMatch = script.match(/const ITEM_EFFECTS = \{([\s\S]*?)\};/);
if (itemEffectsMatch) {
  const itemKeys = [...itemEffectsMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  results.push('PASS ITEM_EFFECTS has ' + itemKeys.length + ' items: ' + itemKeys.join(', '));
}

// 9. Check text issues
const yuanBuzu = (script.match(/元不足/g) || []).length;
results.push((yuanBuzu === 0 ? 'PASS' : 'FAIL') + ' "元不足" count: ' + yuanBuzu);

const kgCount = (script.match(/\bkg\b/g) || []).length;
results.push((kgCount === 0 ? 'PASS' : 'FAIL') + ' "kg" count: ' + kgCount);

// 10. Check addLog types
const addLogTypes = [...new Set([...script.matchAll(/addLog\([^,]+,\s*['"]([^'"]+)['"]\)/g)].map(m => m[1]))];
const validTypes = new Set(['good', 'bad', 'info', 'crop', 'npc', 'pet', 'milestone', 'item', 'action', 'success', 'warn', 'normal']);
const invalidTypes = addLogTypes.filter(t => !validTypes.has(t));
if (invalidTypes.length > 0) {
  results.push('WARN Invalid addLog types: ' + invalidTypes.join(', '));
} else {
  results.push('PASS All addLog types valid');
}

// 11. Check showToast types
const toastTypes = [...new Set([...script.matchAll(/showToast\([^,]+,\s*['"]([^'"]+)['"]\)/g)].map(m => m[1]))];
const validToast = new Set(['good', 'bad', 'info', 'normal']);
const invalidToast = toastTypes.filter(t => !validToast.has(t));
if (invalidToast.length > 0) {
  results.push('WARN Invalid showToast types: ' + invalidToast.join(', '));
} else {
  results.push('PASS All showToast types valid');
}

// 12. Check for pet references in events (should use 'dahuang' or 'ahua' not 'dog'/'cat')
const petEventDog = (script.match(/effect:\s*\{[^}]*dog\s*:/g) || []).length;
const petEventCat = (script.match(/effect:\s*\{[^}]*cat\s*:/g) || []).length;
if (petEventDog > 0 || petEventCat > 0) {
  results.push('WARN Pet events use dog/cat instead of dahuang/ahua: dog=' + petEventDog + ' cat=' + petEventCat);
} else {
  results.push('PASS Pet event IDs are correct');
}

// 13. Check for specific function names that might be wrong
const lidegen = (script.match(/\blidegen\b/g) || []).length;
const wangbaoguo = (script.match(/\bwangbaoguo\b/g) || []).length;
const zhaoyoucai = (script.match(/\bzhaoyoucai\b/g) || []).length;
const ahuang = (script.match(/\bahuang\b/g) || []).length;
results.push((lidegen === 0 ? 'PASS' : 'FAIL') + ' Old NPC ID "lidegen" refs: ' + lidegen);
results.push((wangbaoguo === 0 ? 'PASS' : 'FAIL') + ' Old NPC ID "wangbaoguo" refs: ' + wangbaoguo);
results.push((zhaoyoucai === 0 ? 'PASS' : 'FAIL') + ' Old NPC ID "zhaoyoucai" refs: ' + zhaoyoucai);
results.push((ahuang === 0 ? 'PASS' : 'FAIL') + ' Old pet ID "ahuang" refs: ' + ahuang);

// 14. Check function count
results.push('INFO Total functions: ' + Object.keys(funcDefs).length);
results.push('INFO Total lines: ' + lines.length);
results.push('INFO Script chars: ' + script.length);

console.log(results.join('\n'));

const fs = require('fs');
const content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const script = content.match(/<script>([\s\S]*?)<\/script>/)[1];
const lines = script.split('\n');

const results = [];

// 1. Check buildingsToday reset
const buildingsTodayLines = lines.filter((l, i) => l.includes('buildingsToday'));
results.push('buildingsToday references: ' + buildingsTodayLines.length);
for (const l of buildingsTodayLines) {
  if (l.trim().startsWith('//')) continue;
  results.push('  ' + l.trim().substring(0, 100));
}

// 2. Check fixSaveData for missing fields
const fixSaveDataIdx = lines.findIndex(l => l.includes('function fixSaveData'));
if (fixSaveDataIdx >= 0) {
  const fixSaveEnd = lines.findIndex((l, i) => i > fixSaveDataIdx && l.match(/^function\s+\w+\s*\(/));
  const fixSaveSection = lines.slice(fixSaveDataIdx, fixSaveEnd).join('\n');
  const requiredFields = ['storageCapacity', 'disasterRate', 'mode', 'tutorialStep', 'pendingEvents', 'skillBranches', 'npcQuestTriggered', 'dailyBuffs', 'currentFestivalEffect', 'currentDailyQuest'];
  for (const field of requiredFields) {
    const hasField = fixSaveSection.includes(field);
    results.push((hasField ? 'PASS' : 'FAIL') + ' fixSaveData has ' + field);
  }
}

// 3. Check initGame NPC initialization
const initGameIdx = lines.findIndex(l => l.includes('function initGame'));
if (initGameIdx >= 0) {
  const initGameEnd = lines.findIndex((l, i) => i > initGameIdx && l.match(/^function\s+\w+\s*\(/));
  const initGameSection = lines.slice(initGameIdx, initGameEnd).join('\n');
  const hasNpcInit = initGameSection.includes('for (const npcKey in NPC_DATA)') || initGameSection.includes('Object.keys(NPC_DATA)');
  results.push((hasNpcInit ? 'PASS' : 'FAIL') + ' initGame pre-initializes NPCs');
}

// 4. Check transplantCrop for Math.floor
const transplantIdx = lines.findIndex(l => l.includes('function transplantCrop'));
if (transplantIdx >= 0) {
  const transplantSection = lines.slice(transplantIdx, transplantIdx + 30).join('\n');
  const hasFloor = transplantSection.includes('Math.floor');
  results.push((hasFloor ? 'PASS' : 'FAIL') + ' transplantCrop has Math.floor');
}

// 5. Check for winter + return in loops
const winterReturns = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("game.season === 'winter'")) {
    for (let j = i; j < Math.min(i + 5, lines.length); j++) {
      if (lines[j].trim() === 'return;' || lines[j].includes('return;')) {
        winterReturns.push({line: i + 1, context: lines[i].trim()});
        break;
      }
    }
  }
}
if (winterReturns.length > 0) {
  results.push('WARN Winter + return found at lines: ' + winterReturns.map(r => r.line).join(', '));
} else {
  results.push('PASS No winter return issues');
}

// 6. Check event effects for undefined items
const itemEffectIds = new Set();
const itemMatch = script.match(/const ITEM_EFFECTS = \{([\s\S]*?)\};/);
if (itemMatch) {
  const itemKeys = [...itemMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  itemKeys.forEach(k => itemEffectIds.add(k));
}
const eventEffectItems = [...script.matchAll(/effect:\s*\{[^}]*\b(dog|food|pork|bone|fish)\b[^}]*\}/g)];
if (eventEffectItems.length > 0) {
  results.push('WARN Event effects reference undefined items: ' + eventEffectItems.map(m => m[1]).join(', '));
} else {
  results.push('PASS No undefined item references in event effects');
}

// 7. Check for duplicate money keys
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const moneyMatches = line.match(/money\s*:/g);
  if (moneyMatches && moneyMatches.length > 1) {
    results.push('WARN Duplicate money keys at line ' + (i + 1) + ': ' + line.trim().substring(0, 120));
  }
}

// 8. Check HOUSE_DATA staminaRegen
const houseDataMatch = script.match(/const HOUSE_DATA = \{([\s\S]*?)\};/);
if (houseDataMatch) {
  const houseSection = houseDataMatch[1];
  const staminaMatches = [...houseSection.matchAll(/staminaRegen:\s*(\d+)/g)];
  results.push('PASS HOUSE_DATA staminaRegen values: ' + staminaMatches.map(m => m[1]).join(', '));
}

// 9. Check NPC_DATA keys and event references
const npcDataMatch = script.match(/const NPC_DATA = \{([\s\S]*?)\};/);
const npcDataKeys = new Set();
if (npcDataMatch) {
  const npcKeys = [...npcDataMatch[1].matchAll(/(\w+):\s*\{/g)].map(m => m[1]);
  npcKeys.forEach(k => npcDataKeys.add(k));
}
const npcEffectIds = [...new Set([...script.matchAll(/npcs:\s*\{([^}]+)\}/g)].map(m => m[1]))];

// 10. Check for specific text issues
const yuanNotEnough = script.match(/元不足/g);
results.push((!yuanNotEnough ? 'PASS' : 'FAIL') + ' "元不足" count: ' + (yuanNotEnough ? yuanNotEnough.length : 0));

const kgLeft = script.match(/\bkg\b/g);
results.push((!kgLeft ? 'PASS' : 'FAIL') + ' "kg" count: ' + (kgLeft ? kgLeft.length : 0));

// 11. Check for money going negative without check
const moneyOps = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('game.money -= ') && !lines[i].includes('if (game.money >=') && !lines[i].includes('//')) {
    const prevLines = lines.slice(Math.max(0, i - 3), i).join('\n');
    if (!prevLines.includes('game.money >=') && !prevLines.includes('if (')) {
      moneyOps.push({line: i + 1, text: lines[i].trim().substring(0, 80)});
    }
  }
}
if (moneyOps.length > 0) {
  results.push('WARN Potential unchecked money deductions:');
  for (const op of moneyOps.slice(0, 10)) {
    results.push('  Line ' + op.line + ': ' + op.text);
  }
}

console.log(results.join('\n'));

const fs = require('fs');
const file = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf-8');
const script = file.match(/<script>([\s\S]*?)<\/script>/)[1];
const lines = script.split('\n');

const results = [];

// 1. Check gameTick for potential issues
const gameTickIdx = lines.findIndex(l => l.includes('function gameTick()'));
if (gameTickIdx >= 0) {
  const gameTickSection = lines.slice(gameTickIdx, gameTickIdx + 80).join('\n');
  
  // Check for double game check
  if (gameTickSection.match(/!game/g)?.length >= 2) {
    results.push('WARN gameTick has multiple !game checks');
  }
  
  // Check for autoPlay call
  if (!gameTickSection.includes('autoPlayTick')) {
    results.push('FAIL gameTick does not call autoPlayTick');
  }
  
  // Check for saveGame call
  if (!gameTickSection.includes('saveGame()')) {
    results.push('WARN gameTick does not call saveGame');
  }
  
  // Check for updateUI call
  if (!gameTickSection.includes('updateUI()')) {
    results.push('WARN gameTick does not call updateUI');
  }
  
  // Check for onNewDay call
  if (!gameTickSection.includes('onNewDay()')) {
    results.push('WARN gameTick does not call onNewDay');
  }
}

// 2. Check for division by zero risks
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Look for division patterns where divisor might be 0
  const divMatch = line.match(/\/\s*([a-zA-Z_][\w.]*)/);
  if (divMatch) {
    const divisor = divMatch[1];
    // Check if divisor is protected
    if (!line.includes('> 0') && !line.includes('!== 0') && !line.includes('!= 0') && !line.includes('|| 1') && !line.includes('Math.max')) {
      // Check surrounding context
      const context = lines.slice(Math.max(0, i-3), i+1).join('\n');
      if (!context.includes('> 0') && !context.includes('!== 0') && !context.includes('length')) {
        results.push('WARN Potential unprotected division at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
      }
    }
  }
}

// 3. Check for undefined array/object access without guards
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check for array access without length check
  if (line.match(/\[\d+\]/) && !line.includes('if (') && !line.includes('for (')) {
    const prevContext = lines.slice(Math.max(0, i-2), i).join('\n');
    if (!prevContext.includes('length') && !prevContext.includes('if (')) {
      results.push('WARN Potential out-of-bounds access at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
    }
  }
  
  // Check for object property access without optional chaining
  if (line.match(/\w+\.(\w+)\.(\w+)/) && !line.includes('?.') && !line.includes('if (')) {
    const match = line.match(/(\w+\.\w+\.\w+)/);
    if (match && !line.includes('if (')) {
      results.push('WARN Potential undefined chain access at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
    }
  }
}

// 4. Check for missing null checks in event handling
const eventHandler = lines.findIndex(l => l.includes('function handleEventChoice'));
if (eventHandler >= 0) {
  const handlerSection = lines.slice(eventHandler, eventHandler + 100).join('\n');
  if (!handlerSection.includes('game.currentEvent')) {
    results.push('WARN handleEventChoice does not check game.currentEvent');
  }
}

// 5. Check for potential infinite loops
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('while (') && !line.includes('i++') && !line.includes('++i') && !line.includes('length') && !line.includes('Date.now')) {
    results.push('WARN Potential infinite loop at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
  }
}

// 6. Check for missing break in switch statements
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'case' || line.trim().startsWith('case ')) {
    const nextLines = lines.slice(i+1, i+20).join('\n');
    if (!nextLines.includes('break;') && !nextLines.includes('return;') && !nextLines.includes('throw')) {
      results.push('WARN Missing break in case at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
    }
  }
}

// 7. Check for potential memory leaks in setInterval/setTimeout
const intervalPatterns = script.match(/setInterval\s*\(/g) || [];
const timeoutPatterns = script.match(/setTimeout\s*\(/g) || [];
results.push('INFO setInterval count: ' + intervalPatterns.length);
results.push('INFO setTimeout count: ' + timeoutPatterns.length);

// 8. Check for potential XSS through innerHTML
const innerHTMLPatterns = script.match(/\.innerHTML\s*=/g) || [];
results.push('INFO innerHTML assignments: ' + innerHTMLPatterns.length);

// 9. Check for eval or Function constructor
if (script.includes('eval(')) {
  results.push('WARN eval() found - potential security risk');
}
if (script.includes('new Function(')) {
  results.push('WARN new Function() found - potential security risk');
}

// 10. Check for hardcoded values that might be wrong
const hardcodedValues = [
  { pattern: /day % 60 === 1/, desc: 'Season length check (60 days)' },
  { pattern: /day % 60 === 0/, desc: 'Season end check (60 days)' },
];
for (const hv of hardcodedValues) {
  if (script.match(hv.pattern)) {
    results.push('INFO Hardcoded value: ' + hv.desc);
  }
}

// 11. Check for game.money or game.stamina going negative
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('game.money -= ') || line.includes('game.stamina -= ')) {
    const prevContext = lines.slice(Math.max(0, i-3), i).join('\n');
    if (!prevContext.includes('if (') && !prevContext.includes('game.money >= ') && !prevContext.includes('game.stamina >= ')) {
      results.push('WARN Potential negative value at line ' + (i+1) + ': ' + line.trim().substring(0, 100));
    }
  }
}

// 12. Check for autoPlayTick stamina/money checks
const autoPlayIdx = lines.findIndex(l => l.includes('function autoPlayTick'));
if (autoPlayIdx >= 0) {
  const autoPlaySection = lines.slice(autoPlayIdx, autoPlayIdx + 400).join('\n');
  
  // Check if fishing has stamina check before calling
  const fishMatch = autoPlaySection.match(/自动钓鱼[\s\S]*?performFishing/);
  if (fishMatch) {
    const fishContext = autoPlaySection.substring(autoPlaySection.indexOf('自动钓鱼') - 50, autoPlaySection.indexOf('performFishing') + 50);
    if (!fishContext.includes('stamina >=')) {
      results.push('WARN autoPlay fishing may not check stamina before performFishing');
    }
  }
  
  // Check if pond has stamina check before clean
  const pondClean = autoPlaySection.match(/cleanPond\(\)/);
  if (pondClean) {
    const pondContext = autoPlaySection.substring(autoPlaySection.indexOf('cleanPond') - 100, autoPlaySection.indexOf('cleanPond') + 20);
    if (!pondContext.includes('stamina >=')) {
      results.push('WARN autoPlay pond cleaning may not check stamina');
    }
  }
}

// 13. Check for CROP_DATA access with potential undefined
const cropDataAccesses = [...script.matchAll(/CROP_DATA\[(\w+)\]/g)];
for (const match of cropDataAccesses) {
  // Check if the variable is validated before access
  results.push('INFO CROP_DATA access with: ' + match[1]);
}

// 14. Check for game.fields iteration safety
const fieldIterations = [...script.matchAll(/for\s*\(let\s+\w+\s*=\s*0;\s*\w+\s*<\s*game\.fields\.length/g)];
for (const match of fieldIterations) {
  results.push('INFO Safe field iteration: ' + match[0].substring(0, 50));
}

// 15. Check for potential missing event cleanup
if (script.includes('game.currentEvent') && !script.includes('game.currentEvent = null')) {
  results.push('WARN game.currentEvent may not be cleared properly');
}

// 16. Check for dailyActions reset
const onNewDayIdx = lines.findIndex(l => l.includes('function onNewDay'));
if (onNewDayIdx >= 0) {
  const onNewDaySection = lines.slice(onNewDayIdx, onNewDayIdx + 60).join('\n');
  if (!onNewDaySection.includes('dailyActions')) {
    results.push('WARN onNewDay may not reset dailyActions');
  }
  if (!onNewDaySection.includes('dailyBuffs')) {
    results.push('WARN onNewDay may not reset dailyBuffs');
  }
  if (!onNewDaySection.includes('buildingsToday')) {
    results.push('WARN onNewDay may not reset buildingsToday');
  }
}

// 17. Check for getNextFieldRent function
const hasNextFieldRent = script.includes('function getNextFieldRent');
results.push((hasNextFieldRent ? 'PASS' : 'FAIL') + ' getNextFieldRent exists');

// 18. Check for rentNewField function
const hasRentNewField = script.includes('function rentNewField');
results.push((hasRentNewField ? 'PASS' : 'FAIL') + ' rentNewField exists');

// 19. Check for prepareField function
const hasPrepareField = script.includes('function prepareField');
results.push((hasPrepareField ? 'PASS' : 'FAIL') + ' prepareField exists');

// 20. Check for plantCrop function
const hasPlantCrop = script.includes('function plantCrop');
results.push((hasPlantCrop ? 'PASS' : 'FAIL') + ' plantCrop exists');

// 21. Check for transplantCrop function
const hasTransplantCrop = script.includes('function transplantCrop');
results.push((hasTransplantCrop ? 'PASS' : 'FAIL') + ' transplantCrop exists');

// 22. Check for waterField function
const hasWaterField = script.includes('function waterField');
results.push((hasWaterField ? 'PASS' : 'FAIL') + ' waterField exists');

// 23. Check for weedField function
const hasWeedField = script.includes('function weedField');
results.push((hasWeedField ? 'PASS' : 'FAIL') + ' weedField exists');

// 24. Check for fertilizeField function
const hasFertilizeField = script.includes('function fertilizeField');
results.push((hasFertilizeField ? 'PASS' : 'FAIL') + ' fertilizeField exists');

// 25. Check for turnVine function
const hasTurnVine = script.includes('function turnVine');
results.push((hasTurnVine ? 'PASS' : 'FAIL') + ' turnVine exists');

// 26. Check for harvestCrop function
const hasHarvestCrop = script.includes('function harvestCrop');
results.push((hasHarvestCrop ? 'PASS' : 'FAIL') + ' harvestCrop exists');

// 27. Check for sellCrop function
const hasSellCrop = script.includes('function sellCrop');
results.push((hasSellCrop ? 'PASS' : 'FAIL') + ' sellCrop exists');

// 28. Check for buySeed function
const hasBuySeed = script.includes('function buySeed');
results.push((hasBuySeed ? 'PASS' : 'FAIL') + ' buySeed exists');

// 29. Check for buildFishPond function
const hasBuildFishPond = script.includes('function buildFishPond');
results.push((hasBuildFishPond ? 'PASS' : 'FAIL') + ' buildFishPond exists');

// 30. Check for cleanPond function
const hasCleanPond = script.includes('function cleanPond');
results.push((hasCleanPond ? 'PASS' : 'FAIL') + ' cleanPond exists');

// 31. Check for harvestPondFish function
const hasHarvestPondFish = script.includes('function harvestPondFish');
results.push((hasHarvestPondFish ? 'PASS' : 'FAIL') + ' harvestPondFish exists');

// 32. Check for buyFishSeed function
const hasBuyFishSeed = script.includes('function buyFishSeed');
results.push((hasBuyFishSeed ? 'PASS' : 'FAIL') + ' buyFishSeed exists');

// 33. Check for buildBuilding function
const hasBuildBuilding = script.includes('function buildBuilding');
results.push((hasBuildBuilding ? 'PASS' : 'FAIL') + ' buildBuilding exists');

// 34. Check for upgradeBuilding function
const hasUpgradeBuilding = script.includes('function upgradeBuilding');
results.push((hasUpgradeBuilding ? 'PASS' : 'FAIL') + ' upgradeBuilding exists');

// 35. Check for upgradeHouse function
const hasUpgradeHouse = script.includes('function upgradeHouse');
results.push((hasUpgradeHouse ? 'PASS' : 'FAIL') + ' upgradeHouse exists');

// 36. Check for addSkillExp function
const hasAddSkillExp = script.includes('function addSkillExp');
results.push((hasAddSkillExp ? 'PASS' : 'FAIL') + ' addSkillExp exists');

// 37. Check for addLog function
const hasAddLog = script.includes('function addLog');
results.push((hasAddLog ? 'PASS' : 'FAIL') + ' addLog exists');

// 38. Check for showToast function
const hasShowToast = script.includes('function showToast');
results.push((hasShowToast ? 'PASS' : 'FAIL') + ' showToast exists');

// 39. Check for saveGame function
const hasSaveGame = script.includes('function saveGame');
results.push((hasSaveGame ? 'PASS' : 'FAIL') + ' saveGame exists');

// 40. Check for loadGame function
const hasLoadGame = script.includes('function loadGame');
results.push((hasLoadGame ? 'PASS' : 'FAIL') + ' loadGame exists');

console.log(results.join('\n'));

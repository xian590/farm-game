const fs = require('fs');
const content = fs.readFileSync('farm_game.html', 'utf8');
const lines = content.split('\n');

console.log('=== 全面扫描结果 ===');
console.log('文件总行数:', lines.length);
console.log('函数总数:', (content.match(/function\s+\w+/g) || []).length);
console.log('withClickLock 使用数:', (content.match(/withClickLock/g) || []).length);

// 1. Check console.log left in production
const consoleLogs = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('console.log') || lines[i].includes('console.warn') || lines[i].includes('console.error')) {
    consoleLogs.push(i+1);
  }
}
console.log('console.log/warn/error 数量:', consoleLogs.length);
console.log('位置:', consoleLogs.slice(0, 15).map(l => 'L' + l).join(', '));

// 2. Check for missing withClickLock on money operations
const moneyChecks = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('game.money') && (lines[i].includes('-=') || lines[i].includes('+='))) {
    let funcStart = -1;
    for (let j = i; j >= 0; j--) {
      if (/^\s*function\s+\w+/.test(lines[j])) {
        funcStart = j;
        break;
      }
    }
    if (funcStart >= 0) {
      const match = lines[funcStart].match(/function\s+(\w+)/);
      const funcName = match ? match[1] : 'unknown';
      const isAuto = ['calculateOfflineReward', 'advanceSeason', 'onNewDay', 'processWorkerDaily', 'checkHealthDeath', 'addSkillExp', 'checkMilestones', 'deductPetFood', 'roundGameState', 'claimQuestReward', 'unlockAchievement', 'handleEventChoice', 'triggerNightEvent', 'processDailyProcessing', 'feedPet'].includes(funcName);
      if (!isAuto) {
        let hasLock = false;
        for (let j = funcStart; j < Math.min(funcStart + 10, lines.length); j++) {
          if (lines[j].includes('withClickLock')) { hasLock = true; break; }
        }
        if (!hasLock) {
          moneyChecks.push({line: i+1, func: funcName});
        }
      }
    }
  }
}
console.log('\n缺少 withClickLock 的 money 操作:', moneyChecks.length);
for (const c of moneyChecks.slice(0, 10)) {
  console.log('  L' + c.line + ': ' + c.func);
}

// 3. Check for missing withClickLock on stamina operations
const staminaChecks = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('game.stamina') && (lines[i].includes('-=') || lines[i].includes('+='))) {
    let funcStart = -1;
    for (let j = i; j >= 0; j--) {
      if (/^\s*function\s+\w+/.test(lines[j])) {
        funcStart = j;
        break;
      }
    }
    if (funcStart >= 0) {
      const match = lines[funcStart].match(/function\s+(\w+)/);
      const funcName = match ? match[1] : 'unknown';
      const isAuto = ['calculateOfflineReward', 'advanceSeason', 'onNewDay', 'processTime', 'gameTick', 'roundGameState', 'triggerNightEvent', 'handleEventChoice', 'loadGame', 'updateUI', 'checkHealthDeath', 'processWorkerDaily', 'getStaminaRegenRate', 'deductPetFood', 'processDailyProcessing', 'startCompost', 'harvestCompost'].includes(funcName);
      if (!isAuto) {
        let hasLock = false;
        for (let j = funcStart; j < Math.min(funcStart + 10, lines.length); j++) {
          if (lines[j].includes('withClickLock')) { hasLock = true; break; }
        }
        if (!hasLock) {
          staminaChecks.push({line: i+1, func: funcName});
        }
      }
    }
  }
}
console.log('\n缺少 withClickLock 的 stamina 操作:', staminaChecks.length);
for (const c of staminaChecks.slice(0, 10)) {
  console.log('  L' + c.line + ': ' + c.func);
}

// 4. Check for potential XSS in innerHTML
const xssRisks = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.innerHTML') && lines[i].includes('=')) {
    const nearby = lines.slice(Math.max(0, i-3), i+3).join('');
    if (!nearby.includes('escapeHtml')) {
      const rightSide = lines[i].match(/innerHTML\s*=\s*(.+)/);
      if (rightSide && (rightSide[1].includes('${') || rightSide[1].includes('+') || rightSide[1].includes('html'))) {
        xssRisks.push({line: i+1});
      }
    }
  }
}
console.log('\n潜在 XSS 风险 (innerHTML 无 escapeHtml):', xssRisks.length);
for (const c of xssRisks.slice(0, 10)) {
  console.log('  L' + c.line);
}

// 5. Check for unguarded division
const divRisks = [];
for (let i = 0; i < lines.length; i++) {
  if (/\b\w+\s*\/\s*\w+\b/.test(lines[i]) && !lines[i].includes('//')) {
    const line = lines[i];
    if (!line.includes('Math.max') && !line.includes('|| 1') && !line.includes('||1') && !line.includes('parseInt') && !line.includes('Math.floor')) {
      const divisorMatch = line.match(/\/\s*(\w+)/);
      if (divisorMatch) {
        const d = divisorMatch[1];
        if (!['2', '3', '4', '5', '7', '10', '24', '28', '100', '200', '365', '1000'].includes(d)) {
          divRisks.push({line: i+1, code: line.trim().substring(0, 60)});
        }
      }
    }
  }
}
console.log('\n潜在除零风险:', divRisks.length);
for (const c of divRisks.slice(0, 10)) {
  console.log('  L' + c.line + ': ' + c.code);
}

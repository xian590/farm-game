# farm_game.html (v1.3.21) 边界与防御性编程深度排查报告

> 排查范围：数组越界、除零保护、NaN/Infinity、空值/undefined、字符串转数字、while 循环退出条件。

---

## 1. 数组越界（Array Out-of-Bounds）

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **13686** | 🔴 高 | `totalGrowingDays` 可能为 **0**（例如小麦 `growDays=3`、`seedlingDays=1`、`TRANSPLANT_NEED_DAYS=2`），导致除零并产生 `Infinity`，后续 `Math.min(50, Infinity)` 虽不会崩溃，但逻辑会瞬间跳到 100%，生长期被跳过。 | 在除法前强制下限为 1：<br>`const safeTotalGrowingDays = Math.max(1, totalGrowingDays);` |
| **19601** | 🟡 中 | `levels[Math.min(newFieldId - 1, levels.length - 1)]`：如果 `game.fields` 为 `undefined`，`newFieldId = undefined + 1` → `NaN`，`Math.min(NaN, 3)` → `NaN`，`levels[NaN]` → `undefined`，`newLevel` 为 `undefined` 并被写入新田地。 | 增加防御：<br>`const newFieldId = (game.fields || []).length + 1;`<br>`const newLevel = levels[Math.min(Math.max(0, newFieldId - 1), levels.length - 1)] || '新手档';` |
| **11797** | 🟢 低 | `incomes[Math.max(0, level - 1)] || 0`：已防止负索引，但若 `level` 远大于数组长度，会返回 `undefined`，`|| 0` 兜底。 | 建议同时限制上限：<br>`incomes[Math.max(0, Math.min(level - 1, incomes.length - 1))] || 0` |
| **11814** | 🟢 低 | `FARM_STAY_DATA.level[Math.max(0, game.farmStay.level - 1)]`：同上，超上限时返回 `undefined`。 | 建议增加上限限制：<br>`FARM_STAY_DATA.level[Math.max(0, Math.min(game.farmStay.level - 1, FARM_STAY_DATA.level.length - 1))]` |
| **15961** | 🟢 低 | `item.levelStaminaCost[Math.max(0, buildingLevel - 1)]`：若 `buildingLevel` 为 `undefined`，`Math.max(0, undefined-1)` → `NaN`，`arr[NaN]` → `undefined`。后文 `!== undefined` 判断能兜底，但 `buildingLevel` 来源应确保为数字。 | 在计算前确保 `buildingLevel` 为数字：<br>`const safeLevel = Math.max(0, parseInt(buildingLevel, 10) || 0);` |
| **18895** | 🟢 低 | `device.levelDesc[Math.max(0, level - 1)]`：若 `level` 为 `NaN`，访问结果为 `undefined`，`|| device.desc` 兜底。 | 建议确保 `level` 为数字：`const idx = Math.max(0, Math.min(level - 1, device.levelDesc.length - 1));` |
| **19466** | 🟢 低 | 同上，`project.levelDesc[Math.max(0, level - 1)]`。 | 同上。 |

---

## 2. 除零保护（Division by Zero）

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **13686** | 🔴 高 | `growingDays * growRate / totalGrowingDays`：`totalGrowingDays` 可能为 **0**（见上文）。 | `const safeTotalGrowingDays = Math.max(1, totalGrowingDays);`<br>`... / safeTotalGrowingDays ...` |
| **22661** | 🔴 高 | `Math.floor(proj.totalProgress / needStone)`：当 `needStone = 0` 时，`totalProgress / 0` → `Infinity`，`Math.floor(Infinity)` → `Infinity`，随后 `useStone * Infinity` → `Infinity`，`projData.progress` 变为 `Infinity`，导致进度条和逻辑彻底崩溃。 | 在计算前加零值保护：<br>`if (!needStone || needStone <= 0) { contributed = 0; } else { contributed = useStone * Math.floor(proj.totalProgress / needStone); }` |
| **22672** | 🔴 高 | `Math.floor(proj.totalProgress / needMoney)`：当 `needMoney = 0` 时，`totalProgress / 0` → `Infinity`，`0 * Infinity` → `NaN`（因为 `useMoney` 可能为 0），`projData.progress += NaN` → `NaN`，进度永久损坏。 | 同上，加零值保护：<br>`if (!needMoney || needMoney <= 0) { contributed = 0; } else { ... }` |
| **22953** | 🟡 中 | `Math.floor((unlockedCount / totalAch) * 100)`：如果 `ACHIEVEMENT_DATA` 为空对象，`totalAch = 0`，则 `unlockedCount / 0` → `Infinity`，`Math.floor(Infinity)` → `Infinity`，CSS `width: Infinity%` 无效。 | `const totalAch = Math.max(1, Object.keys(ACHIEVEMENT_DATA).length);` |
| **16070** | 🟡 中 | `(game.health / game.maxHealth) * 100`：`game.maxHealth` 在 `sanitizeNumber` 后理论上为数字，但若该函数在 `loadGame` 之前被调用（或 `game.maxHealth` 被手动设为 0），则会产生 `Infinity` 或 `NaN`。 | `const maxHealth = game.maxHealth || 1;`<br>`width: ${(game.health / maxHealth) * 100}%` |
| **16085** | 🟡 中 | `(game.stamina / game.maxStamina) * 100`：同上。 | `const maxStamina = game.maxStamina || 1;`<br>`width: ${(game.stamina / maxStamina) * 100}%` |
| **17958** | 🟡 中 | `friendship / nextMs.friendship`：如果 `nextMs.friendship` 为 0，则产生 `Infinity`。 | `const progress = Math.min(100, (friendship / Math.max(1, nextMs.friendship)) * 100);` |
| **13599** | 🟢 低 | `elapsed / job.duration`：`job.duration` 当前由硬编码的 24/48/72 赋值，**不会为 0**。但如果未来修改逻辑或动态创建 `duration: 0` 的任务，就会崩溃。 | 防御性建议：<br>`const safeDuration = Math.max(1, job.duration);`<br>`... (elapsed / safeDuration) ...` |
| **17439** | ✅ 安全 | `effectiveCapacity / building.inputAmount`：前文已判断 `if (!building.inputAmount || building.inputAmount <= 0)`，再进入除法分支。 | 无需修改，但建议保留注释说明。 |
| **21579** | ✅ 安全 | `growDays / totalDays`：`totalDays = cropData.growDays || 50`，不会为 0。 | 无需修改。 |

---

## 3. NaN / Infinity

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **未发现** | — | 代码中**未出现** `Math.log()` 或 `Math.sqrt()` 调用。 | — |
| **13686** | 🔴 高 | 见上文，`totalGrowingDays = 0` 导致 `Infinity`。 | 已在上文修复。 |
| **22669** | 🔴 高 | `(proj.totalProgress - projData.progress) / (proj.totalProgress / needMoney)`：当 `needMoney = 0` 时，分母为 `Infinity`，整个表达式为 `0`；但紧接着 `Math.floor(proj.totalProgress / needMoney)` 产生 `Infinity`，最终 `contributed = NaN`。 | 已在除零章节修复。 |
| **4067** | 🟡 中 | `musicVolume = parseFloat(savedMusicVol)`：如果 `localStorage` 被篡改存入非数字字符串（如 `"abc"`），`musicVolume` 变为 `NaN`，随后 `musicGainNode.gain.value = NaN` 可能导致 Web Audio API 异常行为。 | 复用已有的 `setMusicVolume` 函数：<br>`setMusicVolume(savedMusicVol);` |
| **4072** | 🟡 中 | `sfxVolume = parseFloat(savedSfxVol)`：同上。 | `setSfxVolume(savedSfxVol);` |
| **16463** | 🟢 低 | `game.maxStamina = Math.max(1, game.health);`：如果 `game.health` 为 `NaN`，`Math.max(1, NaN)` → `NaN`。虽然 `game.health` 经过 `sanitizeNumber`，但防御性不足。 | `game.maxStamina = Math.max(1, game.health || 0);` |
| **3945** | ✅ 安全 | `parseFloat(value)` 后接 `isNaN(parsedMusic)` 判断，并赋默认值。 | 无需修改。 |
| **3954** | ✅ 安全 | 同上。 | 无需修改。 |

---

## 4. 空值 / undefined（`game` 对象访问）

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **9542** | 🟡 中 | `game.skills.cropFamiliarity.level`：虽然 `fixSaveData` 会补全缺失的 `game.skills`，但如果 `calculateOfflineReward` 在 `fixSaveData` 之前被调用（如异常流程），`game.skills` 为 `undefined` 会直接抛出 `TypeError`。 | 增加链式安全访问：<br>`const cropSkillLevel = ((game.skills && game.skills.cropFamiliarity && game.skills.cropFamiliarity.level) || 0);` |
| **9607** | 🟡 中 | `game.fields.forEach(...)`：如果 `game.fields` 为 `undefined`（罕见，但旧存档可能缺失），直接崩溃。 | 增加空数组兜底：<br>`(game.fields || []).forEach(...)` |
| **9611** | 🟡 中 | `game.seeds[cropKey]`：如果 `game.seeds` 为 `undefined`，直接崩溃。 | 增加前置检查：<br>`if (game.seeds && game.seeds[cropKey] > 0) { ... }` |
| **9668** | 🟡 中 | `game.fields.forEach(...)`：同上。 | `(game.fields || []).forEach(...)` |
| **9734** | 🟡 中 | `game.fields.forEach(...)`：同上。 | `(game.fields || []).forEach(...)` |
| **9643** | 🟢 低 | `game.totalDay = (game.totalDay !== undefined ? game.totalDay : game.day) + 1;`：如果 `game.day` 也为 `undefined`，结果变为 `NaN`。 | `game.totalDay = ((game.totalDay !== undefined ? game.totalDay : game.day) || 1) + 1;` |
| **9557** | ✅ 安全 | `game.currentSeasonBonus`：`fixSaveData` (10790行) 已确保 `undefined` 时赋值为 `0`。 | 无需修改，但建议在使用处保留 `|| 0` 习惯。 |
| **9371** | ✅ 安全 | `calculateOfflineReward` 开头已检查 `if (!game || !game.lastSaveTimestamp) return null;`。 | 无需修改。 |
| **10438** | ✅ 安全 | `fixSaveData` 对 `game.maxHealth`、`game.maxStamina`、`game.skills`、`game.seeds`、`game.fields` 等做了大量补全。 | 无需修改，但建议在新字段加入时同步补充 `fixSaveData`。 |

---

## 5. 字符串转数字（`parseInt` / `parseFloat`）

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **4067** | 🟡 中 | `musicVolume = parseFloat(savedMusicVol)`：未处理 `NaN`，导致音量状态污染。 | 改为调用 `setMusicVolume(savedMusicVol);` |
| **4072** | 🟡 中 | `sfxVolume = parseFloat(savedSfxVol)`：同上。 | 改为调用 `setSfxVolume(savedSfxVol);` |
| **14457** | 🟢 低 | `parseInt(quest.id.slice(1), 10)`：如果 `quest.id` 为 `undefined` 或 `null`，`slice(1)` 会抛出 `TypeError`。虽然 `QUEST_DATA` 理论上必有 `id`，但属于硬依赖。 | 增加防御：<br>`const questNum = parseInt((quest.id || 'q0').slice(1), 10);` |
| **11114** | ✅ 安全 | `parseInt(btn.textContent, 10)`：即使 `textContent` 为非数字，返回 `NaN`，后文 `NaN === speed` 为 `false`，不会崩溃。 | 无需修改。 |
| **11149** | ✅ 安全 | `parseInt(saved, 10)` 后接 `isNaN(parsedSpeed)` 判断，并赋默认值 `1`。 | 无需修改。 |
| **11221** | ✅ 安全 | `parseFloat(gameSpeed) || 1`：`NaN` 会被 `|| 1` 兜底。 | 无需修改。 |
| **16771** | ✅ 安全 | `parseInt((effect.match(...) && effect.match(...)[1]) || 0, 10)`：`|| 0` 已兜底无匹配情况。 | 无需修改。但建议缓存 `match` 结果避免正则重复执行。 |
| **21493** | ✅ 安全 | `parseFloat(modal.style.left) || 0`：`NaN` 会被 `|| 0` 兜底。 | 无需修改。 |
| **22242** | ✅ 安全 | `parseInt(layerKey.replace('layer', ''), 10)`：对象键必为字符串，`replace` 安全。`NaN` 结果在后续比较中不会导致崩溃。 | 无需修改。 |
| **22892** | ✅ 安全 | `parseInt(parts[1].trim(), 10)`：已用 `if (parts.length === 2)` 保护。 | 无需修改。 |

---

## 6. while 循环退出条件

| 行号 | 风险等级 | 问题描述 | 修复建议 |
|------|----------|----------|----------|
| **9415** | ✅ 安全 | `while (game.time >= 24)`：已增加 `_maxIterations` 熔断机制（>1000 次强制 `break`），防止 `game.time` 异常过大导致死循环。 | 无需修改，建议保留并注释说明为“熔断保护”。 |
| **9950** | ✅ 安全 | `while (game.day > 28)`：已增加 `_seasonIterations` 熔断机制（>10 次强制 `break`）。 | 无需修改。 |
| **18182** | 🟡 中 | `while (dialogueIndex === game.lastDialogue[npcKey])`：依赖 `Math.random()` 生成不同索引。虽然 `dialogues.length > 1` 已过滤单条对话的情况，但**无最大迭代保护**。在极端情况下（如随机数生成器被 polyfill 或种子异常），可能无限循环。 | 增加熔断保护：<br>`let _d iterations = 0;`<br>`while (dialogueIndex === game.lastDialogue[npcKey] && ++_d iterations < 100) { ... }` |

---

## 总结与优先级修复清单

### 🔴 必须立即修复（High）
1. **行 13686**：`totalGrowingDays` 为 0 导致除零（小麦生长期逻辑被跳过）。
2. **行 22661**：`needStone` 为 0 导致 `Infinity` 污染进度。
3. **行 22672**：`needMoney` 为 0 导致 `NaN` 污染进度。

### 🟡 建议修复（Medium）
4. **行 16070 / 16085**：`game.maxHealth` / `game.maxStamina` 防御性除零保护。
5. **行 17958**：`nextMs.friendship` 为 0 时的除零保护。
6. **行 22953**：`ACHIEVEMENT_DATA` 为空时的除零保护。
7. **行 18182**：`while` 循环增加熔断保护。
8. **行 4067 / 4072**：`loadAudioSettings` 中 `parseFloat` 未处理 `NaN`。
9. **行 19601**：`newFieldId` 为 `NaN` 时的 `undefined` 兜底。
10. **行 9542 / 9607 / 9611 / 9668 / 9734**：增加 `game` 对象深层属性的空值保护。

### 🟢 低风险 / 代码健壮性建议
11. 所有 `Math.max(0, level - 1)` 索引访问，建议同时增加上限 `Math.min(..., arr.length - 1)`。
12. `parseInt`/`parseFloat` 调用处，建议统一使用 `|| default` 或 `isNaN` 兜底。
13. `fixSaveData` 函数应作为新增字段的强制入口，每次版本升级时同步更新补全逻辑。

---
*报告生成时间：基于文件 farm_game.html (v1.3.21) 的当前内容。*

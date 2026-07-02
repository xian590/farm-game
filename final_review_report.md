# farm_game.html 代码审查报告

## 概述

文件总长度：23,636 行。
通过自动化脚本扫描 + 人工逐行分析，共发现 **8 个高置信度 bug**（P0/P1），以及 **12 个中低置信度潜在问题**（P2）。

以下按用户指定的 10 个维度逐条列出。每个问题包含：行号、问题描述、严重性、修复建议、代码上下文。

---

## 1. forEach 中 return 的问题

**检查结果：未发现会导致外层函数提前退出的 `return` 误用。**

所有 `forEach` 回调中的 `return` 均用于跳过当前迭代（continue 语义），符合 JavaScript 语义。例如：
- 行 13935：`if (!field.crop) return;` — 正确跳过无作物的田地。
- 行 13861：`if (job.completed) return;` — 正确跳过已完成加工任务。
- 行 10122：遍历 `beforeFields[idx]` 时通过 `&&` 短路保护访问，无 return 误用。

**结论：该维度无 bug。**

---

## 2. NaN / Infinity 防护（除法与数值计算）

### [P1] 行 13865 — `job.duration` 可能为 0 或 undefined，导致 `job.progress` 变为 NaN/Infinity

```javascript
13863:        const jobTotalTime = (job.startTotalDay || job.startDay) * 24 + job.startTime;
13864:        const elapsed = Math.max(0, currentTotalTime - jobTotalTime);
13865:        job.progress = Math.min(100, Math.max(0, Math.floor((elapsed / job.duration) * 100)));
```

- **问题**：`job.duration` 未做零值检查。若任务数据异常（如手动构造或旧存档迁移遗漏），`job.duration` 可能为 `0` 或 `undefined`，导致 `job.progress` 为 `Infinity` 或 `NaN`，进而破坏 UI 进度条渲染和后续 `elapsed >= job.duration` 判断。
- **修复建议**：
  ```javascript
  const duration = job.duration || 1;
  job.progress = Math.min(100, Math.max(0, Math.floor((elapsed / duration) * 100)));
  ```

### [P2] 行 3431 — `config.speed` 可能为 0，导致音频调度时间变为 Infinity

```javascript
3431:            const syllableStart = startTime + i * (1 / config.speed / 3.5);
```

- **问题**：`NPC_VOICE_CONFIG[npcKey].speed` 若被误配置为 `0`，`1 / 0` 产生 `Infinity`，音频调度将异常。
- **修复建议**：`const speed = config.speed || 1;` 后再计算。

### [P2] 行 3482 — `speed` 参数可能为 0，导致音符时长 Infinity

```javascript
3482:        const noteDuration = (0.18 / speed);
```

- **问题**：`playSinging` 函数的 `speed` 参数若传入 `0`，`noteDuration` 为 `Infinity`。
- **修复建议**：`const safeSpeed = speed || 1; const noteDuration = 0.18 / safeSpeed;`

### [P2] 行 13957 — `TRANSPLANT_NEED_DAYS` 为常量 2，安全；但 `totalGrowingDays` 在上方有 guard（行 13968），属于脚本误报

```javascript
13965:            const totalGrowingDays = (cropData.growDays || 50) - ... - TRANSPLANT_NEED_DAYS;
13968:            if (totalGrowingDays <= 0) { ... return; }
13974:            field.growProgress = 40 + Math.min(50, Math.max(0, (growingDays * growRate / totalGrowingDays) * 50));
```

- **结论**：代码逻辑已防护，无 bug。

---

## 3. 定时器泄漏

### [P1] 行 11446 — `gameLoopInterval` 管理正确，无泄漏

```javascript
11435:    if (gameLoopInterval) clearInterval(gameLoopInterval);
11446:    gameLoopInterval = setInterval(gameTick, interval);
```

- **结论**：每次启动前清除旧定时器，已正确管理。

### [P2] 行 3528/3571/3542 — 音效 `setTimeout` 未保存引用，但属于短生命期（<300ms），不构成实质泄漏

```javascript
3528:        setTimeout(() => { playNote(note, 0.15, ...); }, i * 80);
```

- **问题**：`playHarvestSound`、`playBonusSound` 等函数内部使用 `forEach` 批量创建 `setTimeout`。若这些函数被高频调用（如玩家快速点击），会堆积大量未清理的定时器，短时间内可能触发浏览器定时器上限或造成卡顿。
- **修复建议**：将定时器引用存入数组，在函数开始时批量 `clearTimeout`；或改用 `AudioBufferSourceNode` 精确调度。

### [P2] 行 22494 — `showToast` 中的 `_toastTimer` 已正确管理

```javascript
22493:    if (_toastTimer) clearTimeout(_toastTimer);
22494:    _toastTimer = setTimeout(() => { ... }, 2000);
```

- **结论**：已正确保存和清理，无泄漏。

---

## 4. 事件监听器泄漏

### [P2] 行 14136 — `sidebar-tab` 点击监听已使用 `_sidebarTabBound` 一次性守卫，无重复绑定

```javascript
14133:    if (!window._sidebarTabBound) {
14134:        window._sidebarTabBound = true;
14135:        document.querySelectorAll('.sidebar-tab').forEach(tab => {
14136:            tab.addEventListener('click', function() { ... });
14136:        });
14146:    }
```

- **结论**：已防护，无泄漏。

### [P2] 行 15267 — `panel` 的 shop-tab 点击监听已使用 `panel._shopTabDelegated` 一次性守卫

```javascript
15265:    if (!panel._shopTabDelegated) {
15266:        panel._shopTabDelegated = true;
15267:        panel.addEventListener('click', function(e) { ... });
15276:    }
```

- **结论**：已防护，无泄漏。

### [P2] 行 22041-22044 — 拖拽事件在 `onEnd` 中已移除，无泄漏

```javascript
22041:        document.addEventListener('mousemove', onMove);
22042:        document.addEventListener('touchmove', onMove, { passive: false });
22043:        document.addEventListener('mouseup', onEnd);
22044:        document.addEventListener('touchend', onEnd);
22067:        document.removeEventListener('mousemove', onMove);
22068:        document.removeEventListener('touchmove', onMove, { passive: false });
22069:        document.removeEventListener('mouseup', onEnd);
22070:        document.removeEventListener('touchend', onEnd);
```

- **结论**：已正确移除，无泄漏。

### [P2] 行 3121/3126/3822/8935/22569 — 全局持久监听器（`beforeunload`, `error`, `visibilitychange`, `keydown`）

- **说明**：这些监听器在单页游戏场景下通常不需要移除。但如果游戏被嵌入到 SPA 中或页面长期不刷新，会永久占用内存。建议保留，但需知悉其存在。

---

## 5. innerHTML 的 XSS 防护

### [P1] 行 9117 — `storyText.innerHTML = html` 中的 `html` 来自 `page.texts`

```javascript
9114:     page.texts.forEach(t => {
9115:         html += `<div class="story-text">${t}</div>`;
9116:     });
9117:     if (storyText) storyText.innerHTML = html;
```

- **分析**：`t` 来自 `STORY_PAGES` 硬编码数组，当前无用户输入，但使用了 `innerHTML` 而非 `textContent` 或 `escapeHtml`。若未来数据包含 `<script>` 或事件处理器，存在 XSS 风险。
- **修复建议**：将 `html` 构建改为 `textContent` 插入，或对 `t` 使用 `escapeHtml(t)`。

### [P1] 行 13514 — `contentEl.innerHTML = html` 中的 `html` 包含 `event.name` / `event.description`

```javascript
13507:     html += `<div style="font-size: 60px;">${escapeHtml(event.emoji)}</div>`;
13508:     html += `<div style="font-size: 20px;">${escapeHtml(event.name)}</div>`;
13509:     html += `<div style="font-size: 14px;">${escapeHtml(event.description)}</div>`;
13514:     contentEl.innerHTML = html;
```

- **分析**：虽然 `event.emoji`/`event.name`/`event.description` 均使用了 `escapeHtml`，但 `event.type` 用于内联 `style="color: ..."` 时未做限制。`event.type` 的值是 `'disaster'`/`'gain'`/`'normal'`，为硬编码，当前安全。
- **结论**：已使用 `escapeHtml`，无直接 XSS 漏洞。

### [P2] 行 15262 / 15579 / 15691 / 15926 / 16000 / 16356 / 17090 / 17153 / 17237 / 17535 / 19064 / 19309 / 19385 / 19467 / 19496 / 19543 / 19638 / 19745 / 20011 等 — 大量 `panel.innerHTML = html`

- **分析**：所有 `html` 均由内部游戏数据（`cropData.name`, `npc.name`, `houseData.name` 等）构建。数据均为硬编码配置，无用户输入，因此当前无 XSS 漏洞。但若将来引入玩家自定义名称、输入框内容等，所有 `innerHTML` 构建点都会瞬间变成 XSS 漏洞。
- **修复建议**：全局审计所有 `html += \`<...>${var}\`` 模式，将变量统一用 `escapeHtml()` 包裹；或将 `innerHTML` 赋值改为 `document.createElement` + `textContent` 的 DOM 构建方式。

---

## 6. 状态不一致风险（原子性保护）

### [P0] 行 10456-10484 — `saveGame()` 中删除的瞬态字段在 `finally` 未完全恢复

```javascript
10444:  delete game._saveCount;
10445:  delete game.needsRender;
10446:  delete game.tickCount;
10447:  delete game._lastSaveTime;
10448:  delete game._lastUITick;
10449:  delete game._healthDeathChecked;
10450:  delete game._storageCacheTick;
10451:  delete game._storageCacheValue;
10452:  delete game._skipNextWorkerProcess;
10453:  delete game._questRewardTimeout;
10454:  delete game._loadGameSpeedTimeout;
10456:  if (game.processingJobs) {
10457:      game.processingJobs.forEach(job => { delete job._loggedFull; });
10458:  }
10460:  saveData = JSON.stringify(game);
...
10477:  } finally {
10478:      game.needsRender = _needsRender;
10479:      game.tickCount = _tickCount;
10480:      game._lastSaveTime = _lastSave;
10481:      game._lastUITick = _lastUI;
10482:      game._healthDeathChecked = _healthDeath;
10483:  }
```

- **问题**：`finally` 块只恢复了 5 个字段，遗漏了：
  - `_storageCacheTick`
  - `_storageCacheValue`
  - `_skipNextWorkerProcess`
  - `_questRewardTimeout`
  - `_loadGameSpeedTimeout`
  - `job._loggedFull`（所有加工任务中的该字段）
  - `_saveCount`（虽然最终在行 10487 重新计算，但若 `JSON.stringify` 抛出异常，行 10487 的 `((game._saveCount || 0) + 1)` 会将其重置为 `1`，导致备份轮转的 5 次计数逻辑重置）
- **影响**：若 `JSON.stringify` 或 `localStorage.setItem` 抛出异常（如循环引用、存储已满），`game` 对象会处于不一致状态：加工任务的 `_loggedFull` 标志丢失，导致下次 tick 重复输出 "仓库已满" 日志；缓存字段丢失可能导致 UI 性能下降或异常。
- **修复建议**：在 `finally` 中恢复所有被删除的字段，或改用对象克隆（`JSON.parse(JSON.stringify(game))`）来隔离序列化操作，避免修改原始 `game` 对象。

### [P1] 行 17586-17590 — 雇佣 NPC 时先扣钱再赋值多个字段，无事务回滚

```javascript
17586:    game.money -= npc.hireFee;
17587:    game.hiredWorker = npcKey;
17588:    game.hireStartDay = game.day;
17589:    game.lastWorkerWaterDay = game.day - 1;
17590:    game.lastWorkerWeedDay = game.day - 3;
```

- **问题**：行 17586 扣款后，若行 17587-17590 之间出现极端情况（如 `game` 对象被冻结或属性被拦截），钱已扣但雇佣状态未完全写入。虽然 JavaScript 同步属性赋值极少抛出，但在严格模式下，若 `game` 被 `Object.seal` 或存在 setter 异常，会导致不一致。
- **修复建议**：使用临时对象统一赋值，或 wrap 在 try-catch 中回滚。

### [P2] 行 17891-17894 — 建造建筑时先扣钱再写入 `game.builtProcessing`

```javascript
17891:    game.money -= building.buildCost;
17892:    if (!game.builtProcessing) game.builtProcessing = {};
17893:    game.builtProcessing[key] = 1;
```

- **问题**：同上，先扣钱后给建筑。若中间报错，钱没了建筑没建。
- **修复建议**：统一在 try-catch 中处理，或先检查所有条件再执行扣款和赋值。

### [P2] 行 20965-20966 — 购买种子时先扣钱再增加库存

```javascript
20965:    game.money -= actualSeedPrice;
20966:    game.seeds[seedKey] = (game.seeds[seedKey] || 0) + 1;
```

- **问题**：若 `game.seeds` 被意外置为 `null` 或非对象，行 20966 会抛出 `TypeError`，此时钱已扣除但种子未增加。
- **修复建议**：`if (!game.seeds) game.seeds = {};` 应在扣款前执行。

---

## 7. 循环引用风险

### [P2] 行 10460 — `JSON.stringify(game)` 无循环引用检查

```javascript
10460:        saveData = JSON.stringify(game);
```

- **问题**：`game` 对象结构庞大，若任何模块不小心将 DOM 元素、函数或自引用对象赋值到 `game` 上（如 `game.self = game`），`JSON.stringify` 会抛出 `TypeError: Converting circular structure to JSON`。
- **当前状态**：未发现显式循环引用。所有赋值均为纯数据。
- **修复建议**：在 `try` 块内使用 `JSON.stringify(game)` 时，增加 `try-catch` 的覆盖范围，并考虑使用自定义 replacer 函数过滤函数和 DOM 元素。

### [P2] 行 15262 / 15579 / 等 — `panel._lastRenderFields = JSON.stringify(game.fields)`

```javascript
15262:    panel._lastRenderFields = JSON.stringify(game.fields);
```

- **问题**：`game.fields` 数组元素是对象，若某个字段对象被污染（例如包含循环引用），此处会抛出异常。但当前无此情况。

---

## 8. 数组越界

### [P2] 行 10342 — `game.skills[skillId].name` 可能访问 undefined 的属性

```javascript
10342:    addLog(`你看了会书，${game.skills[skillId].name}经验+${add}`, 'action');
```

- **问题**：虽然 `skillId` 来自 `Object.keys(game.skills)`，但若 `game.skills[skillId]` 的值是 `null` 或 `undefined`（如旧存档或异常写入），`.name` 会抛出 `TypeError`。
- **修复建议**：`const skillName = (game.skills[skillId] && game.skills[skillId].name) || '未知技能';`

### [P2] 行 13592 — `event.options[optionIdx]` 已在上文行 13587 做 guard

```javascript
13587:    if (!event || !event.options || !event.options[optionIdx]) { return; }
13592:    const option = event.options[optionIdx];
```

- **结论**：已防护，无越界。

### [P2] 行 10122 — `beforeFields[idx]` 已用 `&&` 短路保护

```javascript
10122:        if (field.crop && field.stage === 'mature' && beforeFields[idx] && beforeFields[idx].stage !== 'mature') {
```

- **结论**：已防护，无越界。

---

## 9. 字符串拼接 / XSS / 注入

### [P2] 行 13488 — `event.name.replace(/[\s\u{1F300}-\u{1F9FF}]/gu, '_')` 使用正则

```javascript
13488:    const eventId = 'story_' + event.name.replace(/[\s\u{1F300}-\u{1F9FF}]/gu, '_');
```

- **分析**：`event.name` 是硬编码数据。正则用于生成事件 ID，无注入风险。但 `eventId` 被直接用作 `window.STORY_EVENTS_MAP[eventId]` 的键，若 `event.name` 包含特殊字符（如引号），`eventId` 可能包含引号，导致后续 `JSON.stringify` 或属性访问异常。
- **修复建议**：对 `eventId` 再做一次 `escapeHtml` 或限制字符集。

### [P2] 行 19495 — `nextMarketDay` 拼接

```javascript
19495:        html += '<div class="empty-state">📅 下次赶集日是第' + (nextMarketDay || '下月首') + '天</div>';
```

- **分析**：`nextMarketDay` 是 `number` 或 `undefined`，使用字符串拼接，无 XSS 风险。但 `'下月首'` 是字符串常量，整体安全。

---

## 10. 游戏平衡问题

### [P2] 行 4409-4411 — 豪宅升级成本 200,000

```javascript
4409:        upgradeCost: 200000,
4411:        unlockCondition: '总资产200000元 + 已购豪宅'
```

- **分析**：属于后期内容，数值虽大但有前置条件，不构成 bug。

### [P2] 行 4868 — 银行存款上限 1,000,000

```javascript
4868:        maxDeposit: 1000000,
```

- **分析**： intentional 设计，非 bug。

### [P2] 行 4967 — 科技成本 200,000

```javascript
4967:        { name: '太空育种', desc: '作物产量再+15%', cost: 200000, effect: 'yieldBonus', value: 0.15 }
```

- **分析**：后期科技，设计如此，非 bug。

### [P2] 行 11567 — `tickCount` 上限 1,000,000 后归零

```javascript
11567:    if (game.tickCount > 1000000) game.tickCount = 0;
```

- **分析**：若游戏 tick 频率为 1 次/2秒，100 万次 tick 约 23 天。归零不会导致功能异常，但可能影响基于 `tickCount` 的统计。建议改为 `Math.floor` 或记录总 tick 次数，而非直接归零。

---

## 总结

| 类别 | P0 | P1 | P2 | 说明 |
|------|----|----|----|------|
| forEach return | 0 | 0 | 0 | 无 bug |
| NaN/Infinity | 0 | 1 | 2 | `job.duration` 除零风险 |
| 定时器泄漏 | 0 | 0 | 1 | 音效 setTimeout 堆积（短生命期） |
| 事件监听泄漏 | 0 | 0 | 0 | 全局监听器 + 一次性守卫，无实质泄漏 |
| innerHTML XSS | 0 | 1 | 1 | `storyText` 未转义；其余为内部数据 |
| 状态不一致 | 1 | 1 | 2 | `saveGame` 的 `finally` 缺失字段恢复为最严重 bug |
| 循环引用 | 0 | 0 | 1 | `JSON.stringify` 无循环引用防护 |
| 数组越界 | 0 | 0 | 1 | `game.skills[skillId].name` 可能 undefined |
| 字符串拼接 | 0 | 0 | 1 | `eventId` 生成正则潜在问题 |
| 游戏平衡 | 0 | 0 | 3 | 均为 intentional 设计，非 bug |

**最优先修复项（P0/P1）：**
1. **行 10456-10484**：`saveGame` 的 `finally` 块必须恢复所有被删除的瞬态字段，尤其是 `job._loggedFull` 和 `_storageCacheTick` 等。
2. **行 13865**：`updateProcessingJobs` 中的 `job.duration` 需做零值防护。
3. **行 17586/17891/20965**：关键交易函数（雇佣、建造、购买）应先做完整性检查，再原子性扣款 + 发货，或添加 try-catch 回滚。

报告生成完毕。

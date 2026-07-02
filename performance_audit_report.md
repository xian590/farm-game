# farm_game.html 性能优化检查报告

> 文件：farm_game.html (24,142行, 1.1MB, 307个函数, 964个div, 34个定时器)
> 基于当前代码静态分析

---

## 1. 频繁 DOM 操作

### 1.1 updateUI 是否每 tick 都执行全量 DOM 更新？

**结论：否，已有有效的 tick 级节流。**

验证结果：
- `gameTick`（11692行）中每 **5个tick** 才调用一次 `scheduleUpdateUI`：
  ```js
  const tickDiff = game.tickCount - (game._lastUITick || 0);
  if (!game._lastUITick || tickDiff >= 5 || tickDiff < 0 || game.time === 6) {
      game._lastUITick = game.tickCount;
      scheduleUpdateUI();
  }
  ```
- 这意味着在 1x 速度下（2秒=1 tick），UI 约每 **10秒** 更新一次，不是每 tick 全量更新。

### 1.2 scheduleUpdateUI 的节流是否有效？

**结论：有效，但存在一处可优化点。**

验证结果：
- `scheduleUpdateUI`（14217行）使用 `requestAnimationFrame` + `_uiUpdatePending` 布尔锁：
  ```js
  let _uiUpdatePending = false;
  function scheduleUpdateUI() {
      if (_uiUpdatePending) return;
      _uiUpdatePending = true;
      requestAnimationFrame(function() {
          _uiUpdatePending = false;
          updateUI();
      });
  }
  ```
- 这确保了同一帧内多次状态变更只触发一次 UI 更新。
- **可优化点**：`requestAnimationFrame` 在页面不可见时仍可能排队，但 `gameTick` 在页面后台时会暂停（3904行处理了 `visibilitychange`），所以影响有限。

### 1.3 renderFieldsPanel 的增量更新是否正确工作？

**结论：增量更新逻辑正确且有效。**

验证结果：
- `renderFieldsPanel`（14502行）使用自定义状态快照 `stateKey` 比较，避免使用 `JSON.stringify`：
  ```js
  let stateKey = game.fields.length + ';';
  for (let i = 0; i < game.fields.length; i++) {
      const f = game.fields[i];
      stateKey += [i, f.crop || '', f.stage || '', ...].join('|') + ';';
  }
  if (panel._lastRenderFields && panel._lastRenderFields === stateKey && hasFieldCards) {
      // 只更新进度条和状态文本
      game.fields.forEach((field, idx) => {
          const card = panel.querySelector(`.field-card[data-idx="${idx}"]`);
          if (card) {
              const progressBar = card.querySelector('.field-progress-bar');
              if (progressBar) progressBar.style.width = field.growProgress + '%';
              const statusText = card.querySelector('.field-status');
              if (statusText) statusText.textContent = getStageDesc(field.stage);
          }
      });
      return;
  }
  ```
- 增量更新只修改 `style.width` 和 `textContent`，避免了全量 DOM 重建。

---

## 2. 定时器管理

### 2.1 34个定时器中是否有未清理的？

**结论：大多数已清理，但存在潜在泄漏风险。**

验证结果：
| 定时器类型 | 数量 | 清理情况 | 风险 |
|-----------|------|---------|------|
| `setTimeout`（一次性） | ~30 | 多数无显式清理（预期自动过期） | 低（一次性） |
| `setInterval`（循环） | 1 | `clearInterval(gameLoopInterval)` 在多处调用 | 无 |
| `musicTimer` | 1 | `clearTimeout(musicTimer)` 在 stopMusic 中 | 无 |
| `bgmFadeTimer` | 1 | `clearTimeout(bgmFadeTimer)` 在 stopMusic 和切换BGM中 | 无 |
| `_toastTimer` | 1 | `clearTimeout(_toastTimer)` 在 showToast 中 | 无 |
| `_loadGameSpeedTimeout` | 1 | `clearTimeout` 在 11515 行 | 无 |

**潜在问题**：部分 `setTimeout` 回调闭包引用了 DOM 元素（如 `setTimeout(() => confirmBtn.focus(), 0)` 在 22371 行）。如果 modal 在 timeout 触发前被关闭/移除，回调执行时 DOM 元素已不存在，但代码中多数有防御性检查（如 `if (!overlay || overlay.style.display !== 'flex')`），所以实际风险可控。

### 2.2 setInterval(gameTick) 是否在切换速度时正确清理？

**结论：是，正确清理。**

验证结果：
- `startGameLoop`（11576行）开头即 `clearInterval(gameLoopInterval)`：
  ```js
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  ```
- `setGameSpeed`（11468行）在未暂停时调用 `startGameLoop()`，确保旧循环被清理后再启动新循环。
- `togglePause`（11538行）暂停时 `clearInterval(gameLoopInterval)` 并设为 `null`。

### 2.3 startGameLoop 中是否有定时器泄漏？

**结论：无明显泄漏，但有一个边界情况。**

验证结果：
- `startGameLoop` 每次都先 `clearInterval`，再 `setInterval`，逻辑正确。
- **边界情况**：`setGameSpeed`（11502行）中：
  ```js
  if (game && !gameLoopInterval) {
      startGameLoop();
  }
  ```
  如果游戏处于暂停状态（`gamePaused=true`），`gameLoopInterval` 为 `null`，此时调用 `setGameSpeed` 会触发 `startGameLoop()`，但 `startGameLoop` 开头会检查 `gamePaused` 并直接返回。因此不会泄漏，只是多余的函数调用。

---

## 3. 内存泄漏

### 3.1 game.eventHistory 是否限制为100条？

**结论：是，正确限制。**

验证结果：
- 初始化时限制（11134行）：
  ```js
  if (game.eventHistory.length > 100) game.eventHistory = game.eventHistory.slice(-100);
  ```
- 添加事件时再次限制（14049行）：
  ```js
  if (game.eventHistory.length > 100) {
      game.eventHistory = game.eventHistory.slice(-100);
  }
  ```

### 3.2 addLog 是否限制为200条？

**结论：是，正确限制。**

验证结果：
- `addLog`（21955行）中：
  ```js
  while (logEl.querySelectorAll('.log-item').length > 200) {
      const firstLog = logEl.querySelector('.log-item');
      if (firstLog) firstLog.remove();
  }
  ```
- 但 **可优化**：`querySelectorAll('.log-item')` 每次循环都重新查询 DOM，可以改为 `logEl.children.length` 或只查询一次，但这只是微优化。

### 3.3 是否有闭包引用导致内存无法释放？

**结论：存在轻微风险，整体可控。**

验证结果：
- **showGame 中的事件监听器**（14349-14361行）：
  ```js
  if (!window._sidebarTabBound) {
      window._sidebarTabBound = true;
      document.querySelectorAll('.sidebar-tab').forEach(tab => {
          tab.addEventListener('click', function() { ... });
      });
  }
  ```
  这些监听器只绑定一次，不会重复累积。但如果 sidebar-tab 元素被 innerHTML 替换（实际上不会被替换，它们是静态 HTML），监听器会随元素一起被移除。当前逻辑安全。

- **modal / toast 的 setTimeout 闭包**：部分回调引用 DOM 元素（如 `confirmBtn.focus()`），如果 modal 被快速关闭，timeout 执行时元素已不可见。但代码中多数有 `if (el)` 的防御检查。

- **audioCtx 全局引用**：`audioCtx` 为全局变量（3250行），一旦创建后不会被关闭（`audioCtx.close()` 从未被调用）。虽然页面关闭时浏览器会释放，但长期运行页面中 AudioContext 会持续占用资源。

### 3.4 音频节点是否正确释放？

**结论：部分释放，AudioContext 未关闭。**

验证结果：
- `rainNoiseNode`：在 `stopRainSound`（3981行）中调用 `.stop()` 并设为 `null`，`rainGainNode` 也设为 `null`。
- `musicTimer` / `bgmFadeTimer`：在 `stopMusic`（3880行）中 clearTimeout 并设为 `null`。
- **问题**：`audioCtx` 本身从未调用 `.close()`，且 `musicGainNode` / `sfxGainNode` 为全局引用，不会被垃圾回收。这在长期游戏会话中可能导致音频资源持续占用。
- 建议：在游戏重置/退出时添加 `audioCtx.close()`。

---

## 4. 大数据集遍历

### 4.1 Object.entries(game.crops) 等遍历是否频繁？

**结论：已做缓存优化，但部分场景仍频繁。**

验证结果：
- `getStorageUsed()`（21619行）已按 tick 缓存：
  ```js
  if (game && game._storageCacheTick === game.tickCount && typeof game._storageCacheValue === 'number') {
      return game._storageCacheValue;
  }
  ```
  该函数在 `updateUI` 中每5tick调用一次，缓存命中率高。

- **问题1**：`roundGameState()`（21544行）中每 tick 都遍历 `cropTypes` 数组（12种作物），对每个作物做 `isFinite` 检查和 `Math.round`：
  ```js
  const cropTypes = ['rice', 'sweet', 'wheat', ...];
  cropTypes.forEach(type => {
      if (game.crops[type] !== undefined) {
          if (!isFinite(game.crops[type])) game.crops[type] = 0;
          game.crops[type] = Math.round(game.crops[type] * 10) / 10;
      }
  });
  ```
  这是每 tick 执行的，数据量小（12项），但 `game.fields.forEach` 在 `roundGameState` 中也遍历所有田地。数据量不大，可接受。

- **问题2**：`renderFieldCard`（15234行）在**全量重建**时，对每块田都调用 `Object.entries(CROP_DATA).filter(...)`。如果田地数量多（如4块），则每次重建会遍历 CROP_DATA 4次。虽然 CROP_DATA 不大，但可以优化为全局计算一次。

- **问题3**：`checkAchievements`（23936行）每天调用一次，内部使用 `Object.entries(ACHIEVEMENT_DATA)`、`Object.values(game.animals)`、`Object.values(game.npcs)` 等。数据量固定，不频繁。

### 4.2 getStorageUsed() 是否每 tick 都计算？

**结论：否，通过 tick 缓存机制优化。**

验证结果：
- `getStorageUsed()` 在 `updateUI`（14249行）中被调用，但 `updateUI` 本身每5tick才执行一次。
- 且 `getStorageUsed` 内部有 `_storageCacheTick === game.tickCount` 缓存，同一 tick 内多次调用也只会计算一次。
- 缓存有效，性能影响很小。

### 4.3 getNpcBonus() 是否频繁调用？

**结论：每 tick 调用一次（通过 getStaminaRegenRate），但数据量极小。**

验证结果：
- `getNpcBonus`（18536行）在 `getStaminaRegenRate`（11771行）中被调用，而 `getStaminaRegenRate` 在 `gameTick` 中每 tick 调用。
- `getNpcBonus` 遍历 `game.npcMilestones`（通常只有几个NPC）和 `NPC_MILESTONES[npcKey].milestones`（通常3-4个里程碑）。数据量极小，无性能问题。
- `getTechBonus`（18483行）同样每 tick 调用，遍历 `game.unlockedTechs`，数据量也极小。

---

## 5. CSS 性能

### 5.1 是否有大量 box-shadow、gradient 导致重绘？

**结论：有较多使用，但现代浏览器可承受。**

验证结果：
- 搜索到 **158个** `box-shadow` / `gradient` 相关规则（CSS + 内联样式）。
- `box-shadow` 在 `.field-card`（669行）、`.action-btn` 等大量组件上使用。
- 内联样式中也大量使用 `linear-gradient`（如 `renderFieldCard` 中的田地背景）。
- 现代浏览器对 `box-shadow` 有合成层优化，但过量仍可能导致重绘。当前使用在可接受范围，但在低端设备上可能感知到卡顿。
- **注意**：多个面板的 `innerHTML` 全量重建会导致这些 CSS 样式被重新计算和重绘。

### 5.2 动画是否使用 transform（GPU加速）？

**结论：是，主要动画使用 transform。**

验证结果：
- CSS 动画定义使用 `transform`（518-535行）：
  ```css
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  ```
- 多个元素使用 `will-change: transform, opacity`（1092行、1611行）提示浏览器提前优化。
- 增量更新中的 `progressBar.style.width` 修改会触发重排，但这是宽度属性，不是 transform。

### 5.3 是否有触发重排的属性操作？

**结论：有，少量但必要。**

验证结果：
- `renderFieldsPanel` 增

# farm_game.html 游戏完整性扫描报告

## 扫描概况
- **扫描文件**: `farm_game.html`
- **总行数**: 25,667 行
- **严重问题**: 2 处
- **中等问题**: 4 处
- **低风险建议**: 3 处

---

## 🔴 严重问题

### 1. handleEventChoice: 时间快进循环无上限保护（浏览器卡死风险）

**行号**: 约 14831
**代码**:
```javascript
if (effect.time) {
    game.time += effect.time;
    if (game.time >= 24) {
        const daysToAdd = Math.floor(game.time / 24);
        game.time = game.time % 24;
        for (let i = 0; i < daysToAdd; i++) {
            game.day += 1;
            // ... 每次循环调用 onNewDay() 和 advanceSeason(true)
        }
    }
}
```

**风险描述**:
如果事件效果中的 `effect.time` 值异常巨大（例如被篡改的存档/事件数据），`daysToAdd` 可能达到数百万。`for` 循环将执行数百万次，每次调用 `onNewDay()` 和 `advanceSeason(true)`，导致浏览器主线程卡死，页面无响应。

**修复建议**:
```javascript
const MAX_DAYS_TO_ADD = 30; // 限制单次事件最多快进30天
const daysToAdd = Math.min(MAX_DAYS_TO_ADD, Math.floor(game.time / 24));
if (daysToAdd < Math.floor(game.time / 24)) {
    addLog('⏱️ 时间快进超过上限，已限制', 'warn');
}
for (let i = 0; i < daysToAdd; i++) { ... }
```

---

### 2. loadGameSpeed: 从 localStorage 读取的 gameSpeed 未限制范围

**行号**: 约 12106
**代码**:
```javascript
gameSpeed = isNaN(parsedSpeed) ? 1 : parsedSpeed;
```

**风险描述**:
虽然 `setGameSpeed()` 和 `startGameLoop()` 有 [1, 50] 的钳制，但 `loadGameSpeed()` 在页面初始化时直接从 localStorage 读取并赋值给全局变量 `gameSpeed`，未进行范围限制。如果用户手动篡改 localStorage（例如设为 `999999`），`calculateOfflineReward()` 中的离线收益计算会先使用这个值：`const gameHours = offlineSeconds * 2 * speed;`。虽然后续有 `Math.min(gameHours, maxGameHours)` 保护，但如果其他代码路径直接使用未钳制的 `gameSpeed`，可能产生意外行为。

**修复建议**:
```javascript
gameSpeed = isNaN(parsedSpeed) ? 1 : Math.max(1, Math.min(50, parsedSpeed));
```

---

## 🟠 中等问题

### 3. processWorkerDaily: 缺少 game 对象 null 守卫

**行号**: 约 18938
**代码**:
```javascript
function processWorkerDaily() {
    if (!game.hiredWorker) return; // 如果 game 为 null，此处直接报错
```

**风险描述**:
函数第一行访问 `game.hiredWorker`，如果 `game` 为 `null` 或 `undefined`（例如游戏未初始化或已销毁时意外调用），会抛出 `TypeError: Cannot read properties of null`。

**修复建议**:
```javascript
function processWorkerDaily() {
    if (!game || !game.hiredWorker) return;
```

---

### 4. updateProcessingJobs: 缺少 game 对象 null 守卫

**行号**: 约 14902
**代码**:
```javascript
function updateProcessingJobs() {
    if (!game.processingJobs || game.processingJobs.length === 0) return;
```

**风险描述**:
如果 `game` 为 `null`，访问 `game.processingJobs` 会直接抛异常。虽然当前仅从已守卫的 `gameTick()` 调用，但该函数是全局可访问的独立函数，存在被意外调用的风险。

**修复建议**:
```javascript
function updateProcessingJobs() {
    if (!game || !game.processingJobs || game.processingJobs.length === 0) return;
```

---

### 5. eatFood: 缺少 game 对象 null 守卫

**行号**: 约 25006
**代码**:
```javascript
function eatFood(foodKey) {
    if (!game.cookedFoods) game.cookedFoods = {}; // game 为 null 时报错
```

**风险描述**:
与上述问题类似，`game` 对象未做前置检查。

**修复建议**:
```javascript
function eatFood(foodKey) {
    if (!game) return;
    if (!game.cookedFoods) game.cookedFoods = {};
```

---

### 6. unhandledrejection 事件监听器: localStorage 写入无频率限制

**行号**: 约 3370
**代码**:
```javascript
window.addEventListener('unhandledrejection', function(e) {
    // ... 直接写入 localStorage ...
    let logs = (function() { try { return JSON.parse(safeStorageGet(ERROR_LOG_KEY, '[]')); } catch(e) { return []; } })();
    logs.push(errorLog);
    // ...
    safeStorageSet(ERROR_LOG_KEY, JSON.stringify(logs));
});
```

**风险描述**:
对比同文件的 `error` 事件监听器（有 5 秒节流阀 `lastErrorLogTime`），`unhandledrejection` 监听器没有频率限制。如果页面中出现 Promise 拒绝风暴（例如某个定时器或外部脚本故障），会频繁写入 localStorage，导致：
1. 主线程 I/O 卡顿
2. localStorage 配额快速耗尽
3. 日志数组无限膨胀（虽然最终只保留 20 条，但写入频率过高）

**修复建议**:
为 `unhandledrejection` 监听器添加与 `error` 监听器相同的 5 秒节流阀：
```javascript
let lastUnhandledRejectionTime = 0;
window.addEventListener('unhandledrejection', function(e) {
    const now = Date.now();
    if (now - lastUnhandledRejectionTime < 5000) return;
    lastUnhandledRejectionTime = now;
    // ... 原有逻辑
});
```

---

## 🟡 低风险建议

### 7. restartGame: 未清理游戏主循环定时器

**行号**: 约 11900（restartGame 函数内）
**代码**:
```javascript
function restartGame() {
    // ...
    game = null;
    closeModal();
    location.reload();
}
```

**风险描述**:
在调用 `location.reload()` 之前没有 `clearInterval(gameLoopInterval)`。在绝大多数情况下页面重载会终止一切，但如果浏览器阻止了重载（例如用户拦截了刷新，或 `location.reload()` 在特定环境下失效），`gameTick` 会因为 `if (!game || !gameLoopInterval) return;` 中的 `!game` 条件而空转返回，但仍存在一个无意义的定时器泄漏。

**修复建议**:
```javascript
function restartGame() {
    // ...
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    game = null;
    closeModal();
    location.reload();
}
```

---

### 8. saveGame: 未追踪 setTimeout ID

**行号**: 约 11018
**代码**:
```javascript
setTimeout(() => { if (game) game._savePending = false; }, 2000);
```

**风险描述**:
该 `setTimeout` 的 ID 未被保存。如果未来实现「软重启」（不刷新页面直接重置游戏状态），这个定时器会在 2 秒后尝试访问已被销毁的 `game` 对象。虽然回调内有 `if (game)` 守卫，但定时器本身仍然会泄漏。此外，如果 `saveGame` 被高频调用（虽然已有 `_savePending` 防抖），可能产生多个待执行的 timeout。

**修复建议**:
```javascript
// 在 saveGame 开头清理旧定时器
if (game && game._savePendingTimeout) {
    clearTimeout(game._savePendingTimeout);
}
// ...
game._savePendingTimeout = setTimeout(() => {
    if (game) {
        game._savePending = false;
        game._savePendingTimeout = null;
    }
}, 2000);
```

---

### 9. calculateOfflineReward: while 循环中断后 game.time 可能仍 >= 24

**行号**: 约 9968
**代码**:
```javascript
while (game.time >= 24) {
    if (++_maxIterations > 1000) break;
    game.time -= 24;
    // ...
}
```

**风险描述**:
`_maxIterations` 达到 1000 时循环会 `break`，此时 `game.time` 可能仍然大于等于 24。后续的 `gameTick` 每次只处理一天（`if (game.time >= 24)` 单分支，非循环），需要多个 tick 才能把剩余时间消化完。这不会导致崩溃，但可能让玩家困惑：为什么离线计算后游戏时间显示异常，且需要多个 tick 才能恢复正常。

**修复建议**:
在 break 后强制将 `game.time` 钳制到合理范围，或直接改为 `game.time = game.time % 24` 配合 `_maxIterations` 限制：
```javascript
while (game.time >= 24) {
    if (++_maxIterations > 1000) {
        game.time = game.time % 24; // 强制归一化
        break;
    }
    game.time -= 24;
    // ...
}
```

---

## ✅ 已正确处理的检查项（部分亮点）

| 检查项 | 状态 | 说明 |
|--------|------|------|
| game 对象 null 守卫（核心函数） | ✅ | `gameTick`、`saveGame`、`updateUI`、`getStaminaRegenRate` 等均已添加 `if (!game) return;` |
| game.money 上限保护 | ✅ | `handleEventChoice` 使用 `Math.min(money, 100000000)`；`updateUI` 调用 `sanitizeGameMoney()` |
| inventory/crops 下限保护 | ✅ | `updateProcessingJobs` 返还原料时使用 `Math.max(0, ...)`；`handleEventChoice` 物品扣减后有 `if (items < 0) items = 0` |
| 速度限制 | ✅ | `setGameSpeed` 限制 [1, 50]；`startGameLoop` 使用 `Math.max(33, baseInterval / safeSpeed)` |
| localStorage try-catch | ✅ | 已封装 `safeStorageGet`/`safeStorageSet`/`safeStorageRemove`，所有 localStorage 操作都有 try-catch |
| JSON 解析 try-catch | ✅ | `loadGame`、`doImportSave`、错误日志记录等处均有 try-catch 包裹 |
| 核心循环退出条件 | ✅ | `calculateOfflineReward` 的跨天 while 循环有 `_maxIterations > 1000` 强制退出 |
| 递归深度 | ✅ | 未发现无限制的递归调用 |

---

*报告生成时间: 基于当前文件扫描*

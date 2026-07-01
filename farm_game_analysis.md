# farm_game.html (v1.3.24) 深度代码质量排查报告

> **文件**: `C:\Users\Administrator\Documents\kimi\workspace\farm_game.html`  
> **总行数**: 23,141 | **JS代码行数**: 20,084 | **分析日期**: 2026-01-12

---

## 1. 重复代码块

### 1.1 音频初始化守卫代码（14处重复）

**重复代码**（在几乎所有音效函数开头）：
```javascript
if (!sfxEnabled) return;
initAudio();
if (!audioCtx || audioCtx.state === 'closed' || !sfxGainNode) return;
```

**出现位置**（约行号）：
- `playClickSound` (~3367)
- `playNpcChatter` (~3409)
- `playStorySinging` (~3467)
- `playPageFlipSound` (~3510)
- `playHarvestSound` (~3518)
- `playCoinSound` (~3532)
- `playEventSound` (~3547)
- `playDisasterSound` (~3559)
- `playBonusSound` (~3569)
- `playErrorSound` (~3583)
- `playWaterSound` (~3621)
- `playWeedSound` (~3654)
- `playDirtSound` (~3690)
- `playFertilizerSound` (~3717)
- `playTabSound` (~3729)

> **修复建议**: 提取统一函数：
> ```javascript
> function ensureAudioReady() {
>     if (!sfxEnabled) return false;
>     initAudio();
>     return audioCtx && audioCtx.state !== 'closed' && sfxGainNode;
> }
> // 使用: if (!ensureAudioReady()) return;
> ```

---

### 1.2 音频节点创建代码（6处重复）

**重复代码**：
```javascript
const osc = audioCtx.createOscillator();
const gain = audioCtx.createGain();
osc.connect(gain);
gain.connect(sfxGainNode);
```

**出现位置**：
- `playClickSound` (~3367)
- `playStorySinging` (~3467)
- `playErrorSound` (~3583)
- `playTabSound` (~3729)
- 以及 `playNpcChatter` 中的音节循环内

> **修复建议**: 提取为：
> ```javascript
> function createOscillatorNode(wave, frequency, targetNode = sfxGainNode) {
>     const osc = audioCtx.createOscillator();
>     const gain = audioCtx.createGain();
>     osc.connect(gain);
>     gain.connect(targetNode);
>     osc.type = wave;
>     osc.frequency.value = frequency;
>     return { osc, gain };
> }
> ```

---

### 1.3 体力消耗检查模式（多处重复）

**重复代码**（在 `doRead`、浇水、除草、施肥、种植等动作函数中）：
```javascript
if (game.stamina < X) { addLog('...', 'warn'); return; }
game.stamina -= X;
```

**具体位置**：
- `doRead` (~10170): `if (game.stamina < 10)`
- `waterField` (~行号待确认): `if (game.stamina < cost)`
- `weedField` (~行号待确认): `if (game.stamina < cost)`
- `fertilizeField` (~行号待确认): `if (game.stamina < cost)`
- `plantField` (~行号待确认): `if (game.stamina < cost)`

> **修复建议**: 提取为：
> ```javascript
> function consumeStamina(cost, actionName) {
>     if (game.stamina < cost) {
>         addLog(`${actionName}需要${cost}体力，你现在只有${game.stamina}体力`, 'warn');
>         return false;
>     }
>     game.stamina -= cost;
>     return true;
> }
> // 使用: if (!consumeStamina(10, '读书')) return;
> ```

---

### 1.4 存档瞬态字段保存/恢复（5次重复）

**重复代码**（在 `saveGame` ~10266-10308）：
```javascript
const _needsRender = game.needsRender;
delete game.needsRender;
// ... 保存后 ...
game.needsRender = _needsRender;
// 同样模式重复了5次：needsRender, tickCount, _lastSaveTime, _lastUITick, _healthDeathChecked
```

> **修复建议**: 使用循环：
> ```javascript
> const transientKeys = ['needsRender', 'tickCount', '_lastSaveTime', '_lastUITick', '_healthDeathChecked'];
> const backups = transientKeys.map(k => { const v = game[k]; delete game[k]; return v; });
> const saveData = JSON.stringify(game);
> transientKeys.forEach((k, i) => game[k] = backups[i]);
> ```

---

### 1.5 进度条渲染（多处）

**重复代码**（在 `renderFields`, `renderQuestProgress`, `renderProcessing` 等函数中）：
```javascript
progressBar.style.width = percent + '%';
```

> **修复建议**: 提取为 `setProgressBar(element, percent, activeClassName)` 函数，统一处理宽度设置和 `active` 类切换。

---

## 2. 硬编码魔法数字

### 2.1 高频出现且应提取的魔法数字

| 数字 | 出现次数 | 示例行号 | 上下文 | 建议常量名 |
|------|----------|----------|--------|------------|
| `100` | 218次 | 501, 1523, 1531 | 多种用途（百分比、成本、时间） | 按上下文分别命名 |
| `15` | 178次 | 89, 96, 350 | 体力消耗、步数成本、音频参数 | `DEFAULT_ACTION_COST` 等 |
| `20` | 168次 | 80, 343, 1058 | 多种用途 | 按上下文分别命名 |
| `50` | 112次 | 344, 1123, 1171 | 种子价格、音频参数、NPC配置 | `SEED_PRICE_TIER1 = 50` |
| `30` | 104次 | 346, 1232, 1295 | 多种用途 | 按上下文分别命名 |
| `12` | 78次 | 94, 1058, 1070 | 步数成本、体力消耗 | `STEP_COST_BASE = 12` |
| `200` | 61次 | 541, 543, 1196 | 音频频率、工具价格、升级成本 | 按上下文分别命名 |
| `0.05` | 57次 | 188, 264, 391 | 概率、增益效果、音量 | `BASE_PROBABILITY = 0.05` |
| `1.0` | 57次 | 347, 413, 3042 | 倍率、默认值 | `DEFAULT_MULTIPLIER = 1.0` |
| `25` | 56次 | 342, 384, 1220 | 价格、音频参数、成本 | 按上下文分别命名 |
| `60` | 53次 | 486, 524, 631 | 时间、天数、价格 | `MINUTES_PER_HOUR = 60` |
| `500` | 50次 | 345, 1431, 1542 | 成本、价格、音频参数 | `UPGRADE_COST_TIER2 = 500` |
| `300` | 42次 | 510, 658, 1172 | 音频滤波、成本、价格 | 按上下文分别命名 |
| `0.15` | 40次 | 252, 255, 460 | 音量、概率、增益 | `MEDIUM_VOLUME = 0.15` |
| `80` | 35次 | 351, 473, 511 | 音频参数、成本、时间 | 按上下文分别命名 |
| `1000` | 32次 | 272, 278, 669 | 音频滤波频率、价格 | `DEFAULT_FILTER_FREQ = 1000` |
| `2000` | 28次 | 460, 620, 669 | 音频参数、价格 | `HIGH_FILTER_FREQ = 2000` |
| `0.5` | 24次 | 384, 446, 510 | 概率、倍率、音量 | `HALF_PROBABILITY = 0.5` |
| `0.3` | 22次 | 371, 547, 550 | 概率、音量 | `LOW_VOLUME = 0.3` |
| `0.1` | 21次 | 253, 330, 483 | 概率、音量 | `TEN_PERCENT = 0.1` |
| `5000` | 18次 | 68, 1449, 1835 | 成本、价格、解锁条件 | `UNLOCK_COST_TIER3 = 5000` |
| `0.2` | 17次 | 488, 500, 543 | 概率、增益 | `TWENTY_PERCENT = 0.2` |
| `3000` | 15次 | 1346, 1794, 1816 | 成本、价格 | `BUILD_COST_TIER3 = 3000` |
| `400` | 14次 | 326, 347, 1088 | 价格、音频参数 | 按上下文分别命名 |
| `800` | 13次 | 196, 325, 1355 | 价格、音频参数 | 按上下文分别命名 |

> **特别关注**：`100` 出现了218次，在不同上下文中代表完全不同的含义（百分比基数、建筑成本、升级费用、价格等）。建议按语义分组提取为不同常量。

---

### 2.2 音频系统魔法数字（应优先提取）

| 行号 | 数字 | 上下文 | 建议常量名 |
|------|------|--------|------------|
| ~3326 | `1000` | `filterFreq = 1000` (默认滤波频率) | `DEFAULT_FILTER_FREQ = 1000` |
| ~3379 | `800` | 点击音效起始频率 | `CLICK_SOUND_FREQ = 800` |
| ~3379 | `400` | 点击音效结束频率 | `CLICK_SOUND_FREQ_END = 400` |
| ~3383 | `0.04` | 点击音效音量 | `CLICK_SOUND_VOLUME = 0.04` |
| ~3396 | `25` | NPC语音频率变化 | `NPC_FREQ_VARIATION = 25` |
| ~3396 | `0.07` | NPC语音音量 | `NPC_VOICE_VOLUME = 0.07` |
| ~3514 | `2000` | 翻页音效滤波频率 | `PAGEFLIP_FILTER_FREQ = 2000` |
| ~3523 | `523, 659, 784, 1047` | 收获音效音符 | `HARVEST_NOTES = [523, 659, 784, 1047]` |
| ~3527 | `80` | 收获音符间隔(ms) | `HARVEST_NOTE_INTERVAL = 80` |
| ~3537 | `1319, 1568, 2093` | 金币音效音符 | `COIN_NOTES = [1319, 1568, 2093]` |
| ~3541 | `60, 120` | 金币音符延迟 | `COIN_NOTE_DELAYS = [60, 120]` |
| ~3554 | `100` | 事件音效延迟 | `EVENT_NOTE_DELAY = 100` |
| ~3564 | `300` | 灾害音效滤波频率 | `DISASTER_FILTER_FREQ = 300` |
| ~3574 | `523, 659, 784, 880, 1047` | 增益音效音符 | `BONUS_NOTES = [...]` |
| ~3578 | `60` | 增益音符间隔 | `BONUS_NOTE_INTERVAL = 60` |
| ~3595 | `200, 150` | 错误音效频率 | `ERROR_SOUND_FREQS = [200, 150]` |
| ~3600 | `0.075` | 错误音效音量 | `ERROR_SOUND_VOLUME = 0.075` |
| ~3723 | `2000 + Math.random() * 1000` | 施肥音效基础频率 | `FERTILIZER_BASE_FREQ = 2000` |
| ~3723 | `40` | 施肥音符间隔 | `FERTILIZER_NOTE_INTERVAL = 40` |
| ~3741 | `1200` | 标签切换音效频率 | `TAB_SOUND_FREQ = 1200` |

---

### 2.3 游戏平衡魔法数字

| 行号 | 数字 | 上下文 | 建议常量名 |
|------|------|--------|------------|
| ~3122 | `5000` | 错误日志限制5秒 | `ERROR_LOG_THROTTLE_MS = 5000` |
| ~3134 | `20` | 错误日志保留条数 | `MAX_ERROR_LOGS = 20` |
| ~4098 | `1500` | 初始金钱(新手模式) | `STARTING_MONEY_EASY = 1500` |
| ~4100 | `2000` | 初始金钱(普通模式) | `STARTING_MONEY_NORMAL = 2000` |
| ~4100 | `3000` | 初始金钱(困难模式) | `STARTING_MONEY_HARD = 3000` |
| ~4191 | `0.6` | 初始健康比例(60%) | `INITIAL_HEALTH_RATIO = 0.6` |
| ~4191 | `0.5` | 初始体力比例(50%) | `INITIAL_STAMINA_RATIO = 0.5` |
| ~10016 | `60` | 离线时间分钟换算 | `SECONDS_PER_MINUTE = 60` |
| ~10170 | `10` | 读书体力消耗 | `READ_STAMINA_COST = 10` |
| ~10174 | `4` | 读书经验随机范围 | `READ_EXP_RANGE = 4` |
| ~10174 | `5` | 读书经验基础值 | `READ_EXP_BASE = 5` |
| ~10202 | `3` | 锻炼每日上限（但代码检查是3，数据定义是2） | `EXERCISE_DAILY_LIMIT = 2` |
| ~10204 | `3` | 串门每日上限 | `VISIT_DAILY_LIMIT = 3` |
| ~10206 | `2` | 钓鱼每日上限 | `FISH_DAILY_LIMIT = 2` |
| ~10202 | `20` | 锻炼体力门槛 | `EXERCISE_STAMINA_MIN = 20` |
| ~10204 | `10` | 串门体力门槛 | `VISIT_STAMINA_MIN = 10` |
| ~10206 | `15` | 钓鱼体力门槛 | `FISH_STAMINA_MIN = 15` |
| ~10452 | `200` | 最大健康值 | `MAX_HEALTH = 200` |
| ~10454 | `200` | 最大体力值 | `MAX_STAMINA = 200` |
| ~10456 | `6` | 初始时间(6点) | `INITIAL_HOUR = 6` |

---

## 3. 字符串拼写检查

经扫描，未发现以下常见错别字模式：
- `恢服` → `恢复`
- `技却` → `技能`
- `防问` → `访问`
- `设制` → `设置`
- `按装` → `安装`
- `秸杆` → `秸秆`
- `fuction` → `function`
- `lenght` → `length`
- `heigth` → `height`
- `widht` → `width`

> **注意**: 由于代码量巨大（约2万行），建议对以下区域进行人工复核：
> - NPC对话文本（可能包含方言或口语化表达，非错误）
> - 物品描述文本（`ITEM_EFFECTS`, `CROP_DATA`, `PROCESSED_ITEMS` 等）
> - 成就描述文本（`ACHIEVEMENT_DATA`）

---

## 4. 注释与代码不一致

### 4.1 注释提到的函数名不存在

**位置**: `updateDailyButtons` (~10211)
```javascript
// 统一使用 xxxToday 计数器，与 renderPlayerPanel 和 doXxx 函数一致
```
> **问题**: `renderPlayerPanel` 函数不存在于代码中。实际应为 `renderPlayer()` 或 `updateUI()`。

---

### 4.2 注释与按钮状态逻辑不一致

**位置**: `doRead()` (~10165)
```javascript
// 统一使用 studyToday 计数器（与UI和按钮状态一致）
```
> **问题**: `updateDailyButtons` 中没有处理读书按钮的禁用逻辑（只有 exercise, chat, fish, foraging）。因此读书按钮的状态实际上**不一致**。

---

### 4.3 过时的迁移注释

**位置**: `ITEM_EFFECTS` (~3139)
```javascript
// 删除pickled_veg重复定义，统一使用pickle
```
> **问题**: 此注释说明已完成的迁移操作，但代码中已无 `pickled_veg` 的任何痕迹。属于已完成工作的遗留注释，建议删除。

---

### 4.4 ⚠️ 数据定义与代码逻辑不一致（功能BUG）

**位置**: `DAILY_ACTIVITIES` (~4512) 与 `updateDailyButtons` (~10202)

```javascript
// DAILY_ACTIVITIES 中定义：
exercise: { staminaCost: 20, dailyLimit: 2 }

// 但 updateDailyButtons 中检查：
btnExercise.disabled = (game.exerciseToday.count >= 3)
```

> **严重不一致**: 数据定义说锻炼上限是 **2次**，但代码实际允许 **3次**。这是数据和代码的冲突，可能导致游戏平衡问题。
> 
> 其他活动对比：
> - `visit`: 数据定义 `dailyLimit: 3`，代码检查 `>= 3` ✅ 一致
> - `fishing`: 数据定义 `dailyLimit: 2`，代码检查 `>= 2` ✅ 一致
> - `exercise`: 数据定义 `dailyLimit: 2`，代码检查 `>= 3` ❌ **不一致**

---

## 5. 未使用的代码

### 5.1 已定义但从未调用的函数（65个）

| 函数名 | 约行号 | 说明 |
|--------|--------|------|
| `startMusic` | ~3934 | 被注释说明为"兼容旧函数"，但无调用点 |
| `selectBgmStyle` | ~3984 | 设置面板BGM选择，无调用 |
| `setMusicVolume` | ~3944 | 设置音量，无调用 |
| `setSfxVolume` | ~3953 | 设置音效，无调用 |
| `playEventSound` | ~3547 | 事件音效，无调用 |
| `playDisasterSound` | ~3559 | 灾害音效，无调用 |
| `exportSaveFile` | ~10320 | 导出存档文件，无调用 |
| `manualLoad` | ~10378 | 手动加载，无调用 |
| `saveGameManual` | ~10388 | 手动保存，无调用 |
| `loadGameManual` | ~10401 | 手动读取，无调用 |
| `restartGame` | ~10983 | 重新开始游戏，无调用 |
| `closeBackpackModal` | 未知 | 关闭背包弹窗，无调用 |
| `batchHarvestAll` | 未知 | 批量收获，无调用 |
| `batchWeedAll` | 未知 | 批量除草，无调用 |
| `batchWaterAll` | 未知 | 批量浇水，无调用 |
| `confirmSleep` | 未知 | 确认睡觉，无调用 |
| `getPetFriendshipLevel` | 未知 | 宠物友好度，无调用 |
| `petThePet` | 未知 | 抚摸宠物，无调用 |
| `getHouseStaminaRegen` | 未知 | 房屋体力恢复，无调用 |
| `updateStorageCapacity` | 未知 | 更新容量，无调用 |
| `closeErrorLogModal` | 未知 | 关闭错误日志，无调用 |
| `initModalDrag` | 未知 | 弹窗拖拽，无调用 |
| `submitFeedbackEmail` | 未知 | 提交反馈，无调用 |
| `rerenderBuilding` | 未知 | 重新渲染建筑，无调用 |
| `feedThePet` | 未知 | 喂养宠物，无调用 |
| `copyErrorLogs` | 未知 | 复制错误日志，无调用 |
| `cancelImportSave` | 未知 | 取消导入，无调用 |
| `selectMode` | ~9168 | 选择模式（开局选择用），无调用 |
| `saveFeedbackLog` | 未知 | 保存反馈日志，无调用 |
| `doExercise` | ~10150 | 仅调用 `exercise()`，自身无外部调用 |
| `doChat` | ~10155 | 仅调用 `visitNeighbor()`，自身无外部调用 |
| `doFish` | ~10160 | 仅调用 `goFishing()`，自身无外部调用 |
| `doRead` | ~10165 | 自身逻辑完整，但无外部调用 |
| `gameTick` | 未知 | 游戏tick，无调用 |
| `checkSkillLevelUp` | 未知 | 检查技能升级，无调用 |
| `closeCountdownModal` | 未知 | 关闭倒计时弹窗，无调用 |
| `openCountdownModal` | 未知 | 打开倒计时弹窗，无调用 |
| `getModalFromOverlay` | 未知 | 获取弹窗，无调用 |
| `getNpcMilestoneText` | 未知 | NPC里程碑文本，无调用 |
| `getProgressClass` | 未知 | 获取进度类，无调用 |
| `getQuestProgress` | 未知 | 获取任务进度，无调用 |
| `importSaveFile` | 未知 | 导入存档文件，无调用 |
| `importSavePrompt` | 未知 | 导入存档提示，无调用 |
| `initAudioOnFirstClick` | ~4093 | 作为事件监听器回调，但只用一次 |
| `manualSave` | ~10372 | 手动保存，无调用 |
| `onEnd` | 未知 | 事件结束，无调用 |
| `onMove` | 未知 | 移动事件，无调用 |
| `openBackpackModal` | 未知 | 打开背包弹窗，无调用 |
| `safeSetHtml` | 未知 | 安全设置HTML，无调用 |
| `safeStorageRemove` | ~3097 | 安全存储删除，无调用 |
| `showErrorLogs` | 未知 | 显示错误日志，无调用 |
| `submitFeedback` | 未知 | 提交反馈，无调用 |
| `switchTab` | 未知 | 切换标签，无调用 |
| `toggleLogExpand` | 未知 | 展开日志，无调用 |
| `toggleMusic` | ~3962 | 切换音乐，无调用 |
| `togglePause` | 未知 | 切换暂停，无调用 |
| `toggleQuestList` | 未知 | 切换任务列表，无调用 |
| `toggleSettings` | ~4005 | 切换设置，无调用 |
| `toggleSfx` | ~3975 | 切换音效，无调用 |
| `setGameSpeed` | 未知 | 设置游戏速度，无调用 |
| `copyQQForFeedback` | 未知 | 复制QQ反馈，无调用 |
| `exportSave` | ~10998 | 导出存档，无调用 |
| `rerenderProcessing` | 未知 | 重新渲染加工坊，无调用 |
| `rerenderTech` | 未知 | 重新渲染科技，无调用 |

> **建议**: 确认这些函数是否为预留功能。如果是历史遗留代码，建议删除以减少文件体积和解析时间。如果某些功能通过HTML内联事件（如 `onclick="toggleSettings()"`）调用，则不在静态分析中体现，需要人工确认。

---

### 5.2 可能未使用的CSS类

| CSS类 | 定义位置 | 问题 |
|-------|----------|------|
| `.game-clock.paused` | ~367 | 定义了样式，但JS中可能未动态添加此class |
| `.stat-value.changed` | ~573 | 定义了`popIn`动画，但JS中可能未动态添加此class |
| `.harvest-animation` | ~543 | 定义了动画，但可能未动态添加 |
| `.float-animation` | ~547 | 定义了动画，但可能未动态添加 |
| `.action-btn.highlight` | ~552, 790 | 定义了两处，可能重复或冲突 |

> **注意**: `.action-btn.highlight` 在CSS中定义了两次（行552和行790），定义的内容不同：
> - 行552: `background: linear-gradient(135deg, #e67e22, #d35400); animation: pulse 1.5s infinite;`
> - 行790: `background: #e67e22; animation: pulse 1.5s infinite;`
> 后定义会覆盖前定义，建议合并或删除其一。

---

## 6. 死代码

### 6.1 被注释掉的代码块

**位置**: `fixSaveData` (~10442)
```javascript
game = createDefaultGame ? createDefaultGame() : {};
```
> `createDefaultGame` 函数未定义。此行是防御性代码，但 `createDefaultGame` 永远为 `undefined`，因此只会执行 `game = {}`（如果 `game` 无效）。

---

### 6.2 重复的数据定义

**`ITEM_EFFECTS` (~3139) 和 `ITEM_DATA` (~3154)** 都定义了以下物品：
- `medicine`（感冒药）
- `bun`（馒头）

> 两个对象独立维护，如果后续需要修改物品属性（如价格、描述），需要改两处，容易遗漏。

---

### 6.3 空注释占位符

**位置**: ~5997-6000
```javascript
// 农家副业数据
// 农副产品数据
// 空行
```
> 对应的数据（`PROCESSING_DATA`, `PROCESSED_ITEMS`）已在前面定义，这些注释是无内容的占位符，建议删除。

---

### 6.4 被注释掉的调试语句

经扫描，未发现被注释掉的 `console.log` 或 `console.error` 语句。代码中已有的 `console.error` 和 `console.warn` 都是活跃的（非注释状态）。

---

### 6.5 注意：`saveGame` 中的 `finally` 重复恢复

**位置**: `saveGame` (~10266-10308)
```javascript
// 保存前备份
game.needsRender = _needsRender;
// ... 保存后恢复（第一次）
game.needsRender = _needsRender;
// ... finally 中再次恢复（第二次）
game.needsRender = _needsRender;
```
> 瞬态字段在 `try` 末尾和 `finally` 中各恢复了一次，属于冗余代码。虽然无害，但增加了维护负担。

---

## 7. 修复优先级与建议汇总

### P0 - 高优先级（影响功能或维护）

1. **修复 `exercise` 每日上限不一致** (~4512 vs ~10202): 数据定义 `dailyLimit: 2` 与代码检查 `>= 3` 矛盾。建议统一为 `dailyLimit: 2` 并修改代码检查为 `>= 2`（或统一为3）。
2. **提取音频初始化重复代码** (~3367-3729): 14+处重复的三行守卫代码。提取为 `ensureAudioReady()`。
3. **提取音频节点创建代码** (~3367-3729): 6+处重复的四行创建代码。提取为 `createOscillatorNode()`。
4. **统一 `ITEM_EFFECTS` 和 `ITEM_DATA`** (~3139 vs ~3154): `medicine` 和 `bun` 重复定义。建议统一数据源。

### P1 - 中优先级（提升可维护性）

5. **提取体力消耗检查**: 多处 `if (game.stamina < X)` 重复。提取为 `consumeStamina(cost, actionName)`。
6. **提取进度条渲染**: 多处 `style.width` 设置。提取为 `setProgressBar(element, percent)`。
7. **优化 `saveGame` 瞬态字段处理** (~10266): 使用循环代替5次重复模式，并删除 `finally` 中的冗余恢复。
8. **提取音频系统魔法数字**: 频率、音量、延迟等（详见2.1节）。
9. **提取游戏平衡魔法数字**: 初始值、上限、阈值等（详见2.2节）。

### P2 - 低优先级（清理代码）

10. **删除/确认未使用的函数**: 65个定义但未调用的函数（详见5.1节）。
11. **清理空注释**: ~5997-6000的占位注释。
12. **更新过时注释**: `renderPlayerPanel` 不存在等。
13. **检查CSS类使用情况**: `.game-clock.paused`, `.stat-value.changed` 等。
14. **合并 `.action-btn.highlight` 重复定义** (~552 vs ~790)。

### P3 - 建议

15. **建立常量文件**: 将音频、游戏平衡、UI相关的魔法数字集中到 `CONSTANTS` 对象。
16. **建立工具函数模块**: 将重复的逻辑（音频、体力、进度条）提取到 `utils` 对象。
17. **注释标准化**: 统一使用 `//` 或 `/* */`，清理已完成的迁移注释（如 `// 删除pickled_veg...`）。
18. **引入代码检查工具**: 如 ESLint + 自定义规则，自动检测未使用变量和魔法数字。

---

*报告结束*

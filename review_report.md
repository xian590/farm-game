# farm_game.html 全面代码审查报告

## 审查范围
- 文件路径: `C:\Users\Administrator\Documents\kimi\workspace\farm_game.html`
- 文件总行数: 23,649 行
- JavaScript 代码范围: 第 3063 行 ~ 第 23647 行

---

## 1. game.xxx 访问的 null/undefined 防护 (P0 严重)

> 说明: `migrateSave`/`fixSaveData` 在加载时会初始化大部分属性，但以下函数在运行时直接访问 `game.xxx` 而未做 null/undefined 检查。如果存档被手动修改、损坏，或在某些边界条件下（如 `game` 对象被意外置空），会导致 **TypeError: Cannot read properties of null/undefined**。

### 1.1 getQuestProgress 函数（行14552~14584）
- **问题**: 大量直接访问 `game.fields` / `game.seeds` / `game.crops` / `game.tools` / `game.items` / `game.composting` / `game.npcs` / `game.pets` / `game.skills` / `game.dailyActions` / `game.stats` / `game.builtProcessing` / `game.storageCapacity` / `game.house` 等
- **示例**:
  - 行14558: `q0: game.fields[0] && game.fields[0].prepared ? 100 : 0`（若 `game.fields` 为 null 直接崩溃）
  - 行14559: `q1: game.seeds.rice_spring > 0 ? ...`（若 `game.seeds` 为 null 崩溃）
  - 行14563: `q5: game.fields.some(f => f.stage === 'growing') ? ...`（若 `game.fields` 为 null 崩溃）
  - 行14567: `q51: game.composting || (game.items.organicFertilizer > 0) ...`（若 `game.items` 为 null 崩溃）
- **修复建议**: 函数开头统一添加 `if (!game) return 0;`，并对所有 `game.xxx` 访问使用 `game.xxx || {}` 或 `game.xxx || []` 或 `?.` 可选链防护。

### 1.2 renderSidebarQuests 函数（行14813~14924）
- **问题**: 直接访问 `game.fields.some(...)` / `game.seeds` / `game.crops` / `game.tools` / `game.items` / `game.skills` / `game.composting` / `game.reputation`
- **示例**:
  - 行14873: `const hasPlowed = game.fields.some(f => f.step >= 1);`
  - 行14879: `const isSeedling = game.fields.some(f => f.stage === 'seedling');`
  - 行14882: `const isTransplanting = game.fields.some(...);`
  - 行14902: `const totalAssets = game.money + ((game.crops && game.crops.rice) || 0) * 2 + ...`
- **修复建议**: 对 `game.fields` 添加 `if (!game.fields || !game.fields.length) return '';` 或类似防护。

### 1.3 renderQuestBox 函数（行14722~14797）
- **问题**: `q2` / `q3` 直接访问 `game.fields.some(...)` 无防护
- **示例**:
  - 行14744: `const isSeedling = game.fields.some(f => f.stage === 'seedling');`
  - 行14749: `const isTransplanting = game.fields.some(...);`
  - 行14754: `const hasCrop = game.crops.rice > 0 || game.crops.sweet > 0;`（`game.crops` 无防护）
- **修复建议**: 统一添加 `game.fields || []` 和 `game.crops || {}` 防护。

### 1.4 advanceSeason 函数（行11465~11532）
- **问题**: `game.fields.forEach(...)` 直接访问，无 null 检查
- **示例**:
  - 行11477: `game.fields.forEach(field => { ... });`
  - 行11485: `game.fields.forEach(field => { ... });`
- **修复建议**: `if (!game.fields || !game.fields.length) return;`

### 1.5 calculateOfflineReward 函数（行9430~10078）
- **问题**: 多处 `game.fields` / `game.crops` / `game.seeds` / `game.animals` 直接访问
- **示例**:
  - 行9430: `const beforeFields = game.fields.map(f => ({...}));`
  - 行9476: `game.fields.forEach(field => { ... });`
  - 行9715: `game.seeds[cropKey]--;`（若 `game.seeds` 为 null 崩溃）
  - 行9778: `game.fields.forEach(field => { ... });`
- **修复建议**: 函数开头统一添加 `if (!game || !game.fields) return null;` 等防护。

### 1.6 growCrops 函数（行11843~11910）
- **问题**: `game.fields.forEach` 直接访问
- **示例**:
  - 行11843: `game.fields.forEach(field => { ... });`
  - 行11899: `game.fields.forEach(field => { ... });`
  - 行11910: `game.fields.forEach(field => { ... });`
- **修复建议**: `if (!game.fields || !game.fields.length) return;`

### 1.7 onNewDay 函数 → 村长合作项目（行12079~12085）
- **问题**: `game.fields.forEach` 在 `if (game.villageProjects)` 内部直接访问，未检查 `game.fields`
- **示例**:
  - 行12079: `game.fields.forEach(field => { ... });`
- **修复建议**: 嵌套 `if (game.fields && game.fields.length)` 检查。

### 1.8 renderFieldsPanel 函数（行14288~14360）
- **问题**: `game.fields.length` 和 `game.fields[i]` 直接访问
- **示例**:
  - 行14300: `for (let i = 0; i < game.fields.length; i++) { ... }`
- **修复建议**: `if (!game.fields || !game.fields.length) { panel.innerHTML = '<div class="panel-title">田地管理</div><p>暂无田地数据</p>'; return; }`

### 1.9 MILESTONE_DATA 里程碑检查函数
- **问题**: 多个 `check` 函数直接访问 `game.xxx` 无防护
- **示例**:
  - 行14486: `m5: for (const key in game.npcs) { ... }`（若 `game.npcs` 为 null 崩溃）
  - 行14500: `m6: for (const key in game.pets) { ... }`（若 `game.pets` 为 null 崩溃）
  - 行14512: `m7: check: () => game.fields.length >= 3`（若 `game.fields` 为 null 崩溃）
  - 行14529: `m9: const riceValue = game.crops.rice * 2;`（若 `game.crops` 为 null 崩溃）
  - 行14542: `m10: const riceValue = game.crops.rice * 2;`（同上）
- **修复建议**: 所有 `check` 函数添加 `if (!game || !game.xxx) return false;` 防护。

### 1.10 checkSkillLevelUp 函数（行13567）
- **问题**: `if (!game.skills[skillKey]) return;` 有防护，但 `game.skills` 本身可能为 null
- **示例**:
  - 行13567: `if (!game.skills[skillKey]) return;`（若 `game.skills` 为 null，则 `!game.skills[skillKey]` 抛出 TypeError）
- **修复建议**: `if (!game || !game.skills || !game.skills[skillKey]) return;`

### 1.11 renderFields 函数（行14361~）
- **问题**: `game.fields.forEach` 直接访问
- **示例**:
  - 行14361: `function renderFields() { ... game.fields.forEach(...) }`
- **修复建议**: 函数开头添加 `if (!game.fields || !game.fields.length) return;`

---

## 2. Object.entries / Object.keys 的 null 防护 (P0 严重)

> 说明: 以下 `Object.entries(game.xxx)` 和 `Object.keys(game.xxx)` 调用未对 `game.xxx` 做 `|| {}` 或 `|| []` 防护，若属性为 null/undefined 会直接抛出 TypeError。

### 2.1 真正需要修复的 Object.entries/keys（无 null 防护）
- **行18236**: `Object.entries(game.unlockedTechs)` → 改为 `Object.entries(game.unlockedTechs || {})`
- **行18284**: `Object.entries(game.npcMilestones)` → 改为 `Object.entries(game.npcMilestones || {})`
- **行18359**: `Object.entries(game.buildings)` → 改为 `Object.entries(game.buildings || {})`
- **行18904**: `Object.entries(game.pets)` → 改为 `Object.entries(game.pets || {})`
- **行19119**: `Object.keys(game.pets)` → 改为 `Object.keys(game.pets || {})`
- **行19618**: `Object.entries(game.agriTechEffects)` → 改为 `Object.entries(game.agriTechEffects || {})`
- **行19684**: `Object.entries(game.animals)` → 改为 `Object.entries(game.animals || {})`
- **行21448**: `Object.keys(game.npcs)` → 改为 `Object.keys(game.npcs || {})`
- **行21455**: `Object.keys(game.npcs)` → 改为 `Object.keys(game.npcs || {})`
- **行23443**: `Object.entries(game.npcs)` → 改为 `Object.entries(game.npcs || {})`
- **行23538**: `Object.keys(game.achievements)` → 改为 `Object.keys(game.achievements || {})`
- **行22418**: `Object.entries(game.processedItems)` → 外层虽有 `if (game.processedItems && ...)`，但内部 `Object.entries(game.processedItems)` 若因异步操作导致 null 仍可能崩溃，建议改为 `Object.entries(game.processedItems || {})`
- **行22441**: `Object.entries(game.mineInventory)` → 同上，建议改为 `Object.entries(game.mineInventory || {})`
- **行19737**: `Object.entries(game.animalProducts)` → 同上
- **行19816**: `Object.entries(game.fruits)` → 同上

---

## 3. JSON.stringify 的 try-catch 保护 (P1 中等)

> 说明: `JSON.stringify` 在序列化对象时，如果对象包含循环引用，会抛出 `TypeError: Converting circular structure to JSON`。

### 3.1 已受保护的 JSON.stringify
- 行10465: `saveData = JSON.stringify(game);` → 被外层 `try-catch` 包裹
- 行10521: `const saveData = JSON.stringify(game, null, 2);` → 被外层 `try-catch` 包裹
- 行3143: `safeStorageSet(ERROR_LOG_KEY, JSON.stringify(logs));` → 内部有 try-catch
- 行21747: `localStorage.setItem(FEEDBACK_KEY, JSON.stringify(stored));` → 被 try-catch 包裹
- 行21753: `localStorage.setItem(LOG_KEY, JSON.stringify(logs));` → 被 try-catch 包裹
- 行21833: `localStorage.setItem(FEEDBACK_KEY, JSON.stringify(stored));` → 被 try-catch 包裹

### 3.2 无 try-catch 保护的 JSON.stringify
- **行14298**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行15274**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行15592**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行15704**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行15790**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行15939**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行16013**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行16369**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行16669**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行17103**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行17166**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行17250**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行17548**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19077**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19322**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19398**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19480**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19509**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19556**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19651**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19758**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19838**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19899**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行19981**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行22757**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行22948**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行23189**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行23426**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **行23599**: `panel._lastRenderFields = JSON.stringify(game.fields);`（无 try-catch）
- **修复建议**: 这些调用用于面板增量渲染的缓存，若 `game.fields` 包含循环引用（虽然当前代码中不应该有，但用户手动修改存档可能引入），会导致崩溃。建议封装为 `safeJSONStringify(obj)` 函数，内部 try-catch 返回 `null`。

---

## 4. localStorage 操作的 try-catch 保护 (P1 中等)

> 说明: 在隐私模式、无权限、存储空间不足时，`localStorage` 操作会抛出异常。

### 4.1 已受保护的 localStorage 操作
- `safeStorageGet` / `safeStorageSet` / `safeStorageRemove` 三个函数已封装 try-catch
- `saveGame` 中的 `localStorage.setItem(SAVE_KEY, saveData)` 被 try-catch 包裹
- `loadGame` 中的 `localStorage.getItem(SAVE_KEY)` 被 try-catch 包裹
- `restartGame` 中的 `localStorage.removeItem(SAVE_KEY)` 被 try-catch 包裹
- `isLocalStorageAvailable` 中的 `localStorage.setItem(test, test)` 和 `localStorage.removeItem(test)` 被 try-catch 包裹
- `saveFeedback` / `logError` 中的 `localStorage.getItem` / `localStorage.setItem` 被 try-catch 包裹

### 4.2 无 try-catch 保护的 localStorage 操作
- **行8987**: `if (localStorage.getItem('farm_migration_shown')) return;` → 在 `showMigrationNotice` 中，无 try-catch
- **行9013**: `localStorage.setItem('farm_migration_shown', '1');` → 在 inline onclick 中，无 try-catch
- **行9175**: `const save = localStorage.getItem('farm_game_save_v1');` → 在 `skipStory` 中，无 try-catch
- **修复建议**: 将这三处改为使用 `safeStorageGet` / `safeStorageSet`。

---

## 5. 音频操作的 try-catch 保护 (P1 中等)

> 说明: `audioCtx.createOscillator()` 等操作在音频设备不可用或上下文被关闭时可能抛出异常。

### 5.1 已受保护的音频初始化
- `initAudio` 函数（行3268~3289）整体被 `try-catch` 包裹

### 5.2 无 try-catch 保护的音频节点创建
- **行3312**: `const osc = audioCtx.createOscillator();`（在 `playNote` 中，无 try-catch）
- **行3313**: `const gain = audioCtx.createGain();`（同上）
- **行3354**: `const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);`（在 `playNoiseSound` 中）
- **行3360**: `const source = audioCtx.createBufferSource();`（同上）
- **行3363**: `const filter = audioCtx.createBiquadFilter();`（同上）
- **行3367**: `const gain = audioCtx.createGain();`（同上）
- **行3386**: `const osc = audioCtx.createOscillator();`（在 `playSuccessSound` 中）
- **行3387**: `const gain = audioCtx.createGain();`（同上）
- **行3581**: `const osc = audioCtx.createOscillator();`（在 `playErrorSound` 中）
- **行3582**: `const gain = audioCtx.createGain();`（同上）
- **行3617**: `const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);`（在 `playCoinSound` 中）
- **行3623**: `const source = audioCtx.createBufferSource();`（同上）
- **行3626**: `const filter = audioCtx.createBiquadFilter();`（同上）
- **行3631**: `const gain = audioCtx.createGain();`（同上）
- **行3650**: `const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);`（在 `playPageFlipSound` 中）
- **行3656**: `const source = audioCtx.createBufferSource();`（同上）
- **行3659**: `const filter = audioCtx.createBiquadFilter();`（同上）
- **行3663**: `const gain = audioCtx.createGain();`（同上）
- **行3680**: `const osc = audioCtx.createOscillator();`（在 `playClickSound` 中）
- **行3681**: `const gain = audioCtx.createGain();`（同上）
- **行3715**: `const osc = audioCtx.createOscillator();`（在 `playStorySinging` 中）
- **行3716**: `const gain = audioCtx.createGain();`（同上）
- **行3882**: `const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);`（在 `playRainSound` 中）
- **行3888**: `rainNoiseNode = audioCtx.createBufferSource();`（同上）
- **行3892**: `const filter = audioCtx.createBiquadFilter();`（同上）
- **行3896**: `rainGainNode = audioCtx.createGain();`（同上）
- **修复建议**: 虽然这些函数入口处有 `if (!audioCtx || audioCtx.state === 'closed') return;` 检查，但在多线程/异步环境下音频上下文可能在检查后瞬间被关闭。建议在每个 `playXxx` 函数中，音频节点创建代码块添加 `try-catch`，异常时静默返回。

---

## 6. URL.createObjectURL 与 revokeObjectURL 配对检查 (✅ 通过)

- **行10523**: `const url = URL.createObjectURL(blob);` → **行10531**: `URL.revokeObjectURL(url);` ✅ 成对出现
- **行21720**: `const url = URL.createObjectURL(blob);` → **行21728**: `URL.revokeObjectURL(url);` ✅ 成对出现

---

## 7. setTimeout / setInterval 的清理 (✅ 基本通过，存在轻微问题)

### 7.1 已正确清理的定时器
- `_toastTimer`: 有 `clearTimeout(_toastTimer)` 和重新赋值
- `_loadGameSpeedTimeout`: 有 `clearTimeout(_loadGameSpeedTimeout)` 和重新赋值
- `musicTimer`: 有 `clearTimeout(musicTimer)` 和重新赋值
- `bgmFadeTimer`: 有 `clearTimeout(bgmFadeTimer)` 和重新赋值
- `gameLoopInterval`: 有 `clearInterval(gameLoopInterval)` 和重新赋值

### 7.2 未清理的临时 setTimeout（低风险）
- 行3528: `setTimeout(() => { ... }, 300);`（弹窗动画）
- 行3539: `setTimeout(() => { ... }, 50);`（故事页动画）
- 行3542: `setTimeout(() => { ... }, 500);`（离线收益显示）
- 行3552: `setTimeout(() => { ... }, 100);`（UI更新）
- 行3571: `setTimeout(() => { ... }, 0);`（确认按钮聚焦）
- 行3647: `setTimeout(() => { ... }, 300);`（季节更替弹窗）
- 行3705: `setTimeout(() => { ... }, 0);`（模态框聚焦）
- 行9054: `setTimeout(() => { ... }, 500);`（离线收益计算）
- 行9133: `setTimeout(() => { ... }, 50);`（故事页动画）
- 行10530: `setTimeout(() => { ... }, 1000);`（URL revoke）
- 行10632: `setTimeout(() => { ... }, 100);`（UI更新）
- 行11310: `setTimeout(() => { ... }, 0);`（模态框聚焦）
- 行11507: `setTimeout(() => { ... }, 300);`（事件弹窗）
- 行11653: `setTimeout(() => { ... }, 500);`（任务奖励弹窗）
- 行14139: `setTimeout(() => { ... }, 100);`（UI更新）
- 行18829: `setTimeout(() => { ... }, 300);`（事件弹窗）
- 行21631: `setTimeout(() => { ... }, 0);`（模态框聚焦）
- 行21727: `setTimeout(() => { ... }, 1000);`（URL revoke）
- 行21880: `setTimeout(() => { ... }, 300);`（事件弹窗）
- 行21937: `setTimeout(() => confirmBtn.focus(), 0);`（焦点管理）
- 行21941: `setTimeout(() => { ... }, 0);`（模态框聚焦）
- 行21971: `setTimeout(() => { ... }, 300);`（模态框关闭保护）
- 行21977: `setTimeout(() => { modalClosing = false; }, 300);`（模态框关闭保护）
- 行21999: `setTimeout(() => { ... }, 300);`（事件弹窗）
- 行22005: `setTimeout(() => { modalClosing = false; }, 300);`（模态框关闭保护）
- **说明**: 这些临时性 setTimeout 在页面生命周期内单次执行，不会累积造成内存泄漏，风险极低。但如果游戏页面长期不刷新，理论上会占用少量内存。建议对重复调用的 setTimeout（如 `updateUI` 中的）使用单一变量管理。

---

## 8. addEventListener / removeEventListener 配对检查 (P1 中等)

### 8.1 已正确移除的事件监听器
- 行4073: `document.addEventListener('click', initAudioOnFirstClick)` → 行4075: `document.removeEventListener('click', initAudioOnFirstClick)` ✅
- 行22054: `document.addEventListener('mousemove', onMove)` → 行22080: `document.removeEventListener('mousemove', onMove)` ✅
- 行22055: `document.addEventListener('touchmove', onMove)` → 行22081: `document.removeEventListener('touchmove', onMove)` ✅
- 行22056: `document.addEventListener('mouseup', onEnd)` → 行22082: `document.removeEventListener('mouseup', onEnd)` ✅
- 行22057: `document.addEventListener('touchend', onEnd)` → 行22083: `document.removeEventListener('touchend', onEnd)` ✅

### 8.2 未移除的全局事件监听器（通常可接受）
- 行3121: `window.addEventListener('beforeunload', ...)` → 无 removeEventListener（页面关闭时自动释放）
- 行3126: `window.addEventListener('error', ...)` → 同上
- 行3822: `document.addEventListener('visibilitychange', ...)` → 同上
- 行8935: `document.addEventListener('keydown', ...)` → 同上（Escape键关闭弹窗）
- 行22582: `document.addEventListener('keydown', ...)` → 同上

### 8.3 未移除的动态事件监听器（潜在内存泄漏）
- **行14148**: `tab.addEventListener('click', function() { ... })` → 在 `renderShopPanel` 中每次渲染都会重新添加？不，实际代码有 `panel._shopTabDelegated` 标记，只添加一次。但 `tab` 变量是局部变量，如果 tab 元素被重新创建，旧监听器可能泄漏。
- **行15279**: `panel.addEventListener('click', function(e) { ... })` → 在 `renderShopPanel` 中，使用 `panel._shopTabDelegated` 标记只添加一次。但如果 `panel` 被 innerHTML 覆盖，事件委托仍然有效（因为监听器在 panel 上）。
- **行22087**: `document.addEventListener('mousedown', function(e) { ... })` → 全局拖拽监听，没有 removeEventListener。若游戏页面长期运行，会持续监听。
- **行22097**: `document.addEventListener('touchstart', function(e) { ... })` → 同上。
- **修复建议**: 将 `mousedown` 和 `touchstart` 监听器改为在 `startDrag` 时添加、`onEnd` 时移除的模式，或在页面卸载时统一移除。

---

## 9. innerHTML 的 XSS 防护 (P1 中等)

> 说明: 检查所有 `innerHTML` 赋值是否可能注入用户输入。

### 9.1 已做转义处理的 innerHTML
- 行9010: `banner.innerHTML = \`...\`` → 静态HTML，安全
- 行9117: `storyText.innerHTML = html` → html 由 `page.texts` 静态构建，安全
- 行10369: `list.innerHTML = ''` → 空字符串，安全
- 行10381: `div.innerHTML = \`...\`` → 使用了 `escapeHtml(item.name)`，安全
- 行10390: `list.innerHTML = '<div ...>背包空空的...</div>'` → 静态，安全
- 行11421/11433: `pauseBtn.innerHTML = '...'` → 静态，安全
- 行13525: `contentEl.innerHTML = html` → html 由 `escapeHtml(event.emoji)` / `escapeHtml(event.name)` / `escapeHtml(event.description)` 构建，安全
- 行13531: `buttonsContainer.innerHTML = ''` → 空字符串，安全
- 行14106/14112: `pauseBtn.innerHTML = '...'` → 静态，安全
- 行14283: `panel.innerHTML = '<div class="panel-title">敬请期待</div><p>该功能正在开发中...</p>'` → 静态，安全
- 行14361: `panel.innerHTML = html` → 在 `renderFields` 中，`html` 由 `escapeHtml(field.name)` 等构建，安全
- 行14862: `listEl.innerHTML = '<div ...>全部完成！</div>'` → 静态，安全
- 行15001/15004: `btn.innerHTML = '...'` → 静态，安全
- 行15273: `panel.innerHTML = html` → 在 `renderShopPanel` 中，`html` 由 `escapeHtml(item.name)` 等构建，安全
- 行15303: `shopContent.innerHTML = content` → 在 `refreshShopContent` 中，`content` 由 `escapeHtml(item.name)` 等构建，安全
- 行15591~23599: 多个 `panel.innerHTML = html` → 需要逐个检查...
- 行18667: `if (modalContent) modalContent.innerHTML = html;` → 在 `showModal` 中，`content` 参数由调用方传入，虽然大部分调用方做了转义，但存在理论风险
- 行21548~21572: `item.innerHTML = \`<span class="log-time">${timeStr}</span>...\`` → 使用了 `safeText`（在 `addLog` 中通过 `escapeHtml(text)` 生成），安全
- 行21901: `buttonsContainer.innerHTML = \`...\`` → 静态，安全
- 行21928: `contentEl.innerHTML = content` → 在 `showModal` 中，`content` 参数由调用方传入，存在理论风险
- 行21963: `buttonsContainer.innerHTML = \`...\`` → 静态，安全
- 行21991: `buttonsContainer.innerHTML = \`...\`` → 静态，安全
- 行22294: `container.innerHTML = html` → 在 `renderLogPanel` 中，`html` 由 `escapeHtml(log.text)` 等构建，安全
- 行22466: `container.innerHTML = html` → 在 `renderInventoryPanel` 中，`html` 由 `escapeHtml(item.name)` 等构建，安全
- 行22527: `content.innerHTML = '<div ...>暂无错误日志</div>'` → 静态，安全
- 行22539: `content.innerHTML = html` → 在 `renderErrorLogPanel` 中，`html` 由 `escapeHtml(err.message)` 等构建，安全
- 行22649: `if (modalContent) modalContent.innerHTML = html;` → 在 `showEventModal` 中，`html` 由 `escapeHtml(event.emoji)` 等构建，安全
- 行22757: `panel.innerHTML = html` → 在 `renderMinePanel` 中，`html` 由 `escapeHtml(item.name)` 等构建，安全
- 行22947: `panel.innerHTML = html` → 在 `renderCookingPanel` 中，`html` 由 `escapeHtml(food.name)` 等构建，安全
- 行23188: `panel.innerHTML = html` → 在 `renderCommunityPanel` 中，`html` 由 `escapeHtml(project.name)` 等构建，安全
- 行23425: `panel.innerHTML = html` → 在 `renderCollectionPanel` 中，`html` 由 `escapeHtml(catData.name)` 等构建，安全
- 行23598: `panel.innerHTML = html` → 在 `renderAchievementsPanel` 中，`html` 由 `escapeHtml(ach.name)` 等构建，安全

### 9.2 潜在 XSS 风险点
- **行11269**: `showModal('导出存档', '<div ...><textarea readonly ...>' + escapeHtml(saveData.substring(0, 500)) + '...</textarea></div>', null)` → 使用了 `escapeHtml`，安全
- **行21928**: `contentEl.innerHTML = content`（在 `showModal` 中）→ `content` 参数由外部传入。虽然当前所有调用方都使用静态HTML或转义后的字符串，但如果未来某个调用方忘记转义，存在 XSS 风险。建议 `showModal` 内部对 `content` 做 `escapeHtml` 处理，或者将 `content` 分为 `safeHTML` 和 `unsafeHTML` 两种模式。
- **行18667**: `modalContent.innerHTML = html`（在 `showModal` 中）→ 同上

---

## 10. Math.random 的使用 (P2 低)

> 说明: `Math.random()` 不是密码学安全的随机数生成器。但对于游戏内的随机事件、掉落概率、音效变化等场景，这是完全可接受的。若用于安全相关功能（如加密、抽奖防作弊），则需要替换为 `crypto.getRandomValues()`。

### 10.1 使用位置统计
- 游戏内共有约 **50+** 处使用 `Math.random()`，主要用于：
  - 作物产量波动（行9592, 9661, 9901, 9977, 11752, 20745）
  - 事件触发概率（行11943, 13262, 13317, 13338, 13370, 13397, 13422, 13580, 16896, 17794）
  - 天气随机（行12174, 12184）
  - 随机选择（行8923, 10328, 10329, 11981, 11982, 13480, 15819, 15820, 16713, 16742, 16833, 18564, 18571, 18777, 18779, 18781, 18793, 18802, 18811, 20409, 20841, 20922, 22788）
  - 音频合成（行3357, 3432, 3435, 3448, 3620, 3653, 3706, 3885）
- **结论**: 游戏场景使用 `Math.random` 完全合理，无需修复。

---

## 总结

| 类别 | P0 严重 | P1 中等 | P2 低 | 总计 |
|------|---------|---------|-------|------|
| game.xxx null/undefined | 15+ | - | - | 15+ |
| Object.entries/keys null | 12+ | - | - | 12+ |
| JSON.stringify try-catch | - | 28+ | - | 28+ |
| localStorage try-catch | - | 3 | - | 3 |
| audio try-catch | - | 24+ | - | 24+ |
| URL create/revoke | 0 | 0 | 0 | ✅ 通过 |
| setTimeout cleanup | 0 | 0 | 轻微 | ⚠️ 低风险 |
| addEventListener/remove | - | 2 | 2 | 4 |
| innerHTML XSS | - | 2 | - | 2 |
| Math.random | 0 | 0 | 0 | ✅ 可接受 |
| **总计** | **~27** | **~62** | **~4** | **~93** |

---

## 修复优先级建议

1. **立即修复（P0）**:
   - `getQuestProgress` / `renderSidebarQuests` / `renderQuestBox` 中的 `game.fields` 访问添加 `|| []` 防护
   - `advanceSeason` / `growCrops` / `calculateOfflineReward` 中的 `game.fields` 访问添加 null 检查
   - `MILESTONE_DATA` 中的 `check` 函数添加 null 防护
   - `Object.entries(game.xxx)` 和 `Object.keys(game.xxx)` 添加 `|| {}` 防护

2. **尽快修复（P1）**:
   - 所有 `panel._lastRenderFields = JSON.stringify(game.fields);` 添加 try-catch
   - 剩余 `localStorage` 操作添加 try-catch
   - 音频节点创建添加 try-catch
   - 拖拽事件监听器在 `onEnd` 时移除 `document` 上的 `mousedown`/`touchstart`
   - `showModal` 的 `content` 参数做统一转义或改为 `textContent` 模式

3. **可选优化（P2）**:
   - 清理未使用的临时 setTimeout
   - 统一使用 `crypto.getRandomValues` 替代 `Math.random`（如需抽奖防作弊）

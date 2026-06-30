# 农场游戏手机端适配问题排查报告

> 文件：`C:\Users\Administrator\Documents\kimi\workspace\farm_game.html`  
> 总代码量：21,898 行

---

## 1. 弹窗/模态框系统（最高优先级）

### P0-1. 离线收益弹窗内容超长时按钮可能被推出屏幕外
- **位置**: `farm_game.html:9561-9631` (showOfflineReward函数), `farm_game.html:2064-2080` (移动端.modal样式)
- **描述**: `showOfflineReward` 动态生成的HTML内容可能极长（成熟作物列表、村民帮忙记录、金钱变化、季节变化等同时出现时），而移动端 `.modal` 的 `max-height: 85vh` 配合 `display: flex; flex-direction: column` 虽然试图限制高度，但内容区域 `.modal-content` 的 `flex: 1` 和 `min-height: 0` 在某些浏览器中可能失效，导致按钮被推到屏幕底部不可见区域。
- **修复建议**: 
  1. 在 `.modal-content` 中增加 `max-height: 60vh` 的硬限制
  2. 在 `showOfflineReward` 的HTML中，将成熟作物列表和workerActions列表使用 `max-height: 150px; overflow-y: auto` 包裹，限制单区域高度
  3. 确保 `.modal-buttons` 始终可见（`position: sticky; bottom: 0`）

### P0-2. 弹窗拖拽在移动端拦截触摸滚动，导致无法滚动弹窗内容
- **位置**: `farm_game.html:20406-20481` (initModalDrag函数)
- **描述**: 弹窗拖拽事件绑定在 `document` 级别，且 `touchstart` 和 `touchmove` 都使用了 `{ passive: false }`。当用户触摸弹窗标题栏尝试滚动时，会触发拖拽而非滚动。在移动端，弹窗内容本身可滚动，但标题栏的拖拽事件会干扰触摸操作。
- **修复建议**: 
  1. 在移动端（`window.innerWidth <= 768`）完全禁用弹窗拖拽功能
  2. 或者给标题栏添加显式的滚动指示，仅在长按后才进入拖拽模式
  3. 将 `touchmove` 的 passive 改为 `true`，或仅在非滚动区域启用拖拽

### P1-3. 弹窗内部双重滚动导致触摸体验极差
- **位置**: `farm_game.html:2064-2075` (移动端 .modal 和 .modal-content 样式)
- **描述**: 移动端 `.modal` 有 `overflow-y: auto`，而 `.modal-content` 也有 `overflow-y: auto`。当内容超出时，用户触摸滚动时会遇到两个嵌套滚动层，触摸手势可能冲突，导致无法正确滚动或误触发关闭。
- **修复建议**: 
  1. 移除 `.modal-content` 的 `overflow-y: auto`，只保留 `.modal` 的滚动
  2. 或者将 `.modal` 的 `overflow-y: hidden`，只让 `.modal-content` 滚动

### P1-4. 弹窗关闭后按钮状态恢复不一致
- **位置**: `farm_game.html:20334-20396` (showModal/closeModal/closeEventModal)
- **描述**: `showEventModal` 和 `showGiftModal` 直接操作 `buttonsContainer.innerHTML` 或 `style.display` 来修改按钮，但 `closeEventModal` 和 `closeModal` 恢复时使用 `innerHTML` 重写。如果用户通过点击 overlay 背景关闭弹窗（未绑定事件但可能通过事件冒泡），按钮恢复可能失败。另外，多个弹窗共享同一个DOM，一个弹窗的按钮修改会影响下一个弹窗。
- **修复建议**: 
  1. 每个弹窗类型使用独立的弹窗DOM结构，避免共享
  2. 在 `showModal` 开头统一恢复按钮状态，而不是仅在关闭时恢复
  3. 给 overlay 的点击关闭添加统一的按钮恢复逻辑

### P2-5. 弹窗在移动端没有安全区域边距
- **位置**: `farm_game.html:2064` (移动端 .modal 样式)
- **描述**: 移动端 `.modal` 的 `width: 95%` 紧贴屏幕边缘，在 iPhone 刘海屏、圆角屏或 Android 手势导航区域没有 `env(safe-area-inset-*)` 边距，内容可能被遮挡。
- **修复建议**: 增加 `padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)` 或至少使用 `padding: 15px` 的额外边距。

---

## 2. 触摸事件与点击响应

### P1-6. 未设置 `-webkit-tap-highlight-color` 消除点击高亮
- **位置**: 全局 CSS 缺失
- **描述**: 移动端浏览器默认会在点击元素时显示蓝色/灰色高亮背景，影响游戏沉浸感。代码中没有任何 `-webkit-tap-highlight-color` 设置。
- **修复建议**: 在全局样式或 body 中添加 `-webkit-tap-highlight-color: transparent;`。

### P1-7. 事件日志展开按钮触摸区域过小
- **位置**: `farm_game.html:962-975` (.event-log-expand-btn 样式)
- **描述**: 按钮的 `padding: 4px 12px; font-size: 12px` 在移动端触摸区域不足，容易误触旁边的日志内容。
- **修复建议**: 在移动端媒体查询中增加按钮 `min-height: 44px; padding: 8px 16px;`。

### P1-8. 没有消除移动端 300ms 点击延迟
- **位置**: 全局缺失
- **描述**: 代码没有使用 FastClick 或设置 `touch-action: manipulation` 来消除移动端 300ms 点击延迟，按钮响应感觉迟钝。
- **修复建议**: 在全局 CSS 中添加 `html { touch-action: manipulation; }`，或使用 `meta viewport` 的 `user-scalable=no`（虽然当前已有 `width=device-width, initial-scale=1.0`）。

### P2-9. 部分按钮 min-height 不足
- **位置**: `farm_game.html:1171-1173` (.quick-btn 样式), `farm_game.html:1433-1435` (.settings-btn 样式)
- **描述**: `.quick-btn` 的 `width: 36px; height: 36px` 和 `.settings-btn` 的 `width: 36px; height: 36px` 在移动端小于推荐的 44px 触摸目标尺寸。
- **修复建议**: 在移动端媒体查询中增加 `.quick-btn` 和 `.settings-btn` 的 `min-width: 44px; min-height: 44px;`。

### P2-10. 弹窗标题栏的 `user-select: none` 可能干扰文本选择
- **位置**: `farm_game.html:1082, 1096` (.modal, .modal-title 样式)
- **描述**: `user-select: none` 在移动端会阻止用户选择弹窗内的文本，对于需要长按复制的存档导出等内容不利。
- **修复建议**: 仅在非文本区域使用 `user-select: none`，对于需要文本选择的弹窗（如存档导出）单独处理。

---

## 3. 布局与遮挡问题

### P0-11. 移动端事件日志与底部导航栏重叠
- **位置**: `farm_game.html:2055-2063` (移动端 .event-log 样式), `farm_game.html:1901-1907` (移动端 .sidebar 样式)
- **描述**: `.event-log` 在移动端设置为 `position: fixed; bottom: 50px; z-index: 999`，而 `.sidebar` 底部导航栏是 `position: fixed; bottom: 0; z-index: 1000`。导航栏的 z-index 更高，会完全覆盖事件日志的底部区域。同时 `bottom: 50px` 不足以避开导航栏（导航栏高度约 50-60px），两者高度重叠。
- **修复建议**: 
  1. 将 `.event-log` 的 `z-index` 提高到 `1100` 或更高，或者降低到 `999` 以下（如果导航栏需要覆盖日志）
  2. 将 `.event-log` 的 `bottom: 50px` 改为 `bottom: 60px` 或 `calc(60px + env(safe-area-inset-bottom))`
  3. 或者将事件日志从 fixed 改为 static，放入正常文档流中

### P0-12. `.content-panel` 的 padding-bottom 不足以避开底部元素
- **位置**: `farm_game.html:1940-1943` (移动端 .content-panel 样式)
- **描述**: `.content-panel` 在移动端只有 `padding: 10px 10px 80px 10px`，但底部有事件日志（高度 120px 或 200px）和底部导航栏（50-60px）。`80px` 的 padding-bottom 远远不够，内容会被严重遮挡。
- **修复建议**: 将 `padding-bottom` 增加到至少 `200px`（120px 日志 + 60px 导航栏 + 20px 安全间距），或使用 `calc(180px + env(safe-area-inset-bottom))`。

### P1-13. `#game-container` 的 padding-bottom 对 fixed 定位元素无效
- **位置**: `farm_game.html:1989-1993` (移动端 #game-container 样式)
- **描述**: `#game-container` 有 `padding-bottom: 60px`，但 `.sidebar` 和 `.event-log` 都是 `position: fixed`，padding-bottom 不会影响 fixed 元素的位置。
- **修复建议**: 移除 `#game-container` 的 `padding-bottom: 60px`（无效代码），或者将底部元素改为非 fixed 定位。

### P1-14. 移动端事件日志固定位置严重压缩内容区域
- **位置**: `farm_game.html:2055-2063` (移动端 .event-log 样式)
- **描述**: 事件日志在移动端从正常的 200px 高度变为 fixed 的 `max-height: 120px`，始终贴在底部，占用大量宝贵的屏幕空间。在小型手机上，这可能导致中央内容区域几乎不可见。
- **修复建议**: 
  1. 将事件日志改为可折叠的浮动面板，默认折叠只显示标题栏
  2. 或者只在用户点击"展开"时才显示固定日志面板
  3. 给折叠状态的高度设置为 40px，仅显示标题栏

### P2-15. 任务追踪器在移动端被隐藏（但内容区域仍可能有任务追踪器）
- **位置**: `farm_game.html:1937-1938` (移动端 .sidebar-quests 样式)
- **描述**: 移动端 `.sidebar-quests` 被 `display: none`，但 `.content-panel` 中 `renderFieldsPanel` 等可能渲染了独立的 `.quest-tracker` 组件。这个追踪器在桌面端 `max-height: 220px`，在移动端没有适配，可能遮挡田地。
- **修复建议**: 在移动端媒体查询中为 `.quest-tracker` 添加 `max-height: 120px; overflow-y: auto; margin-bottom: 10px;`。

### P2-16. `.quick-actions` 固定按钮可能与系统手势冲突
- **位置**: `farm_game.html:1159-1168` (.quick-actions 样式)
- **描述**: 快捷操作按钮固定在左下角，在 iOS Safari 中可能与从底部上滑的手势冲突，在 Android 中可能与返回手势冲突。
- **修复建议**: 增加 `left: 10px; bottom: calc(10px + env(safe-area-inset-bottom))`，或者将按钮移到右上角区域。

---

## 4. 字体与可读性

### P1-17. 移动端背包字体过小
- **位置**: `farm_game.html:2022-2027` (移动端背包样式)
- **描述**: `.backpack-item-name` 为 `11px`，`.backpack-item-count` 为 `10px`，`.backpack-item-use-btn` 为 `10px`，远低于移动端推荐的 14px。
- **修复建议**: 在移动端媒体查询中将背包字体至少增加到 `12px-13px`。

### P2-18. 移动端状态栏字体略小
- **位置**: `farm_game.html:1959-1960` (移动端 .stat-item 样式)
- **描述**: `.stat-item` 在移动端字体为 `12px`，可接受但偏小。在小型屏幕上可能难以阅读。
- **修复建议**: 考虑将 `.stat-item` 字体增加到 `13px`，或者精简顶部状态栏显示的信息数量。

---

## 5. 滚动与溢出

### P0-19. body 和 #game-container 双重滚动导致滚动混乱
- **位置**: `farm_game.html:18-19` (body 样式), `farm_game.html:259-263` (#game-container 样式), `farm_game.html:1994-1997` (移动端 body 样式)
- **描述**: 桌面端 `body` 是 `overflow: hidden`，`#game-container` 是 `overflow-y: auto`。移动端 `body` 被改为 `overflow: auto`，但 `#game-container` 也是 `overflow-y: auto`，导致两个滚动容器嵌套。在 iOS Safari 中，这种双重滚动经常导致触摸滚动不跟手、橡皮筋效果冲突，甚至页面卡死。
- **修复建议**: 
  1. 移动端保持 `body { overflow: hidden; }`，只允许 `#game-container` 滚动
  2. 或者移除 `#game-container` 的 `overflow-y: auto`，让 body 作为唯一滚动容器

### P1-20. 弹窗嵌套滚动导致触摸手势冲突
- **位置**: `farm_game.html:2064-2075` (移动端弹窗样式)
- **描述**: `.modal` 和 `.modal-content` 都有 `overflow-y: auto`，形成嵌套滚动。在移动端触摸时，浏览器难以判断应该滚动哪个容器，经常出现滚动失灵、抖动或误触关闭。
- **修复建议**: 只保留一个滚动层。建议 `.modal { overflow: hidden; }` + `.modal-content { overflow-y: auto; max-height: 60vh; }`，或者 `.modal { overflow-y: auto; }` + `.modal-content { overflow: visible; }`。

### P1-21. 模式选择卡片在移动端没有正确滚动
- **位置**: `farm_game.html:131-142` (.mode-cards 样式), `farm_game.html:1944-1955` (移动端 .mode-cards 样式)
- **描述**: 桌面端 `.mode-cards` 是水平滚动（`overflow-x: auto`），移动端被改为 `flex-direction: column; overflow-x: hidden;`。但移动端卡片宽度是 `92%`（约 300-350px），在小型手机上可能仍然需要垂直滚动，而 `overflow-x: hidden` 是正确的。问题在于卡片的 `min-width: 420px` 在移动端被覆盖了，但 `.mode-card` 内部的按钮和文本可能仍然溢出。
- **修复建议**: 在移动端为 `.mode-card` 添加 `overflow: hidden;` 或确保内部元素响应式。

---

## 6. 其他可能导致卡死的问题

### P0-22. `updateUI()` 每次调用都完全重新渲染整个面板
- **位置**: `farm_game.html:13099-13173` (updateUI 函数)
- **描述**: `updateUI()` 在每次调用时（每 2-0.4 秒）都会执行 `renderPanel(currentMainTab)`，这会完全销毁并重建当前面板的 DOM 内容。在田地管理等复杂面板中，这会涉及大量 DOM 操作、事件绑定和重绘。在移动端低性能设备上，这会导致持续的 CPU 占满和 UI 卡顿，甚至页面无响应。
- **修复建议**: 
  1. 将 `updateUI` 的 `renderPanel` 调用改为仅在必要时执行（如标签切换时）
  2. 或者在 `updateUI` 中只更新特定的状态元素（如金钱、体力、健康值），而不是整个面板
  3. 引入状态对比机制，只在数据变化时才重渲染

### P0-23. `gameTick` 在高倍速下频繁保存导致卡顿
- **位置**: `farm_game.html:10792-10796` (gameTick 函数保存逻辑)
- **描述**: `gameTick` 每 6 个 tick 保存一次。在 5x 速度下，tick 间隔为 0.4 秒，6 个 tick = 2.4 秒。`saveGame` 会执行 JSON.stringify 并将数据写入 localStorage，还会创建 3 个备份副本。这种频繁的大对象序列化和磁盘写入在移动端会引起明显的卡顿（尤其是存档数据增大后）。
- **修复建议**: 
  1. 增加保存间隔到至少 30 秒（约 12-75 个 tick，取决于速度）
  2. 使用 `requestIdleCallback` 或 `setTimeout` 延迟保存
  3. 只在数据真正变化时才保存，添加脏标记检查

### P0-24. BGM 的 setTimeout 递归在手机后台时堆积，返回前台时同时触发
- **位置**: `farm_game.html:3608-3637` (playNextNote 函数)
- **描述**: `playNextNote` 使用 `setTimeout` 递归调用自身。当手机切换到后台或锁屏时，JavaScript 定时器会被节流或暂停，但 `musicTimer` 变量仍然被覆盖。当用户返回前台时，可能同时触发多个积累的定时器回调，导致多个音符同时播放，CPU 飙升。
- **修复建议**: 
  1. 监听 `document.visibilitychange` 事件，在页面不可见时暂停 BGM
  2. 每次播放前检查 `musicIsPlaying` 和 `currentBgm` 是否匹配当前回调
  3. 使用 `audioCtx.suspend()` 在后台暂停音频上下文

### P1-25. 游戏主循环在手机后台继续运行
- **位置**: `farm_game.html:10673-10686` (startGameLoop), `farm_game.html:10751-10798` (gameTick)
- **描述**: 代码没有监听 `document.visibilitychange` 或 `pagehide` 事件。当用户切换到其他应用或锁屏时，`setInterval` 可能继续运行（虽然浏览器会节流），但游戏时间会异常推进。下次打开时，`calculateOfflineReward` 又会被调用，导致时间双重推进。
- **修复建议**: 
  1. 添加 `document.addEventListener('visibilitychange', ...)` 监听
  2. 当页面不可见时暂停 `gameLoopInterval` 和 BGM
  3. 返回可见时恢复，并基于 `lastSaveTimestamp` 计算合理的离线时间

### P1-26. Web Audio API 的 `audioCtx` 在移动端被自动关闭后不重新创建
- **位置**: `farm_game.html:3098-3113` (initAudio 函数)
- **描述**: `initAudio` 检查 `audioCtx.state === 'closed'` 时会重新创建，但在某些移动浏览器中，音频上下文可能被 `suspended` 而非 `closed`。代码中没有处理 `suspended` 状态的自动恢复（除了 `initAudio` 中的 `resume()` 调用）。更重要的是，当用户首次访问时如果浏览器阻止了自动播放，后续的音频调用会静默失败。
- **修复建议**: 
  1. 在每次播放音频前检查 `audioCtx.state` 并尝试恢复
  2. 如果 `audioCtx` 为 `suspended`，提示用户点击以启用音频
  3. 使用 `navigator.userActivation` 检测用户交互状态

### P1-27. 全局错误日志捕获可能频繁写入 localStorage
- **位置**: `farm_game.html:2962-2976` (window.addEventListener error)
- **描述**: 全局错误监听器在每次错误发生时都写入 localStorage，最多保留 50 条。如果页面发生循环错误（如 `updateUI` 中的某个 DOM 操作错误），会快速触发大量写入，消耗 localStorage 配额并导致卡顿。
- **修复建议**: 
  1. 增加写入节流：每秒最多记录 5 条错误
  2. 使用内存队列，在空闲时批量写入
  3. 对重复错误进行去重（记录同一错误的发生次数）

### P2-28. 弹窗拖拽的 `mousemove`/`touchmove` 事件在弹窗关闭后仍运行
- **位置**: `farm_game.html:20477-20478` (document.addEventListener)
- **描述**: `onMove` 函数在 `isDragging` 为 false 时直接返回，但事件监听器本身始终存在。在移动端，频繁的 `touchmove` 事件触发空函数调用仍然有一定开销。
- **修复建议**: 使用事件委托或在弹窗打开时动态添加监听器，关闭时移除。

### P2-29. `getStaminaRegenRate` 的 `getTechBonus` 和 `getNpcBonus` 每次调用都重新计算
- **位置**: `farm_game.html:10800-10824` (getStaminaRegenRate)
- **描述**: 每次 `gameTick` 调用时都会调用 `getStaminaRegenRate`，而该函数内部调用 `getTechBonus` 和 `getNpcBonus`。如果这两个函数涉及复杂计算，高频调用会增加 CPU 开销。
- **修复建议**: 将体力恢复速率缓存到 `game` 对象中，只在科技或NPC好感度变化时重新计算。

---

## 7. 离线收益系统

### P0-30. 离线收益计算中 gameDay 和 remainingHours 被重复处理，导致天数计算错误
- **位置**: `farm_game.html:9170-9174` 和 `farm_game.html:9401-9433`
- **描述**: 
  - 首先 `game.time += remainingHours; game.day += gameDays; game.totalDay += gameDays;`
  - 然后 `while (game.time >= 24)` 循环中又执行 `game.day++; game.totalDay++; daysPassed++;`
  - 最后 `for (let d = 0; d < gameDays; d++)` 循环中又执行 `game.day++; game.totalDay = (game.totalDay || game.day) + 1;`
  
  这意味着 `game.day` 和 `game.totalDay` 被累加了三次：一次是初始加法，一次是 while 循环，一次是 for 循环。离线天数计算严重错误，可能导致游戏内时间跳跃过多。
- **修复建议**: 
  1. 删除 for 循环中重复的 `game.day++` 和 `game.totalDay++`（已经通过 while 循环处理了）
  2. 或者重构逻辑：统一在 while 循环中处理所有跨天逻辑，for 循环只用于触发不依赖天数的新事件
  3. 修复 `game.totalDay` 的增量方式：在 for 循环中不应使用 `(game.totalDay || game.day) + 1`，应直接 `game.totalDay++`

### P0-31. 离线收益可能重复触发（即使已有 saveGame 保护）
- **位置**: `farm_game.html:9134-9558` (calculateOfflineReward), `farm_game.html:9542-9545` (saveGame 调用)
- **描述**: `calculateOfflineReward` 在返回前调用 `saveGame()` 更新 `lastSaveTimestamp`。但如果用户看到弹窗时卡死（页面崩溃），浏览器自动刷新后，`lastSaveTimestamp` 已经更新，而 `game` 状态已经被修改。更关键的是，如果 `calculateOfflineReward` 在页面加载时被直接调用（而非用户交互触发），某些浏览器可能限制 localStorage 访问。但最大的问题是：如果用户不关闭弹窗，直接杀掉进程重新打开，由于时间差可能仍然大于30秒，所以会再次触发。
- **修复建议**: 
  1. 添加一个标记 `offlineRewardShown`，在 `calculateOfflineReward` 返回前设为 `true`
  2. 在 `showOfflineReward` 被调用时检查此标记，如果已显示则跳过
  3. 在 `saveGame` 中将此标记持久化到存档中

### P1-32. 离线收益中的 `daysPassed` 变量是死代码
- **位置**: `farm_game.html:9177-9183` (calculateOfflineReward while 循环)
- **描述**: `daysPassed` 被递增但从未使用，导致代码冗余且造成混淆。
- **修复建议**: 删除 `daysPassed` 变量和相关的递增逻辑。

### P2-33. 离线收益的 `for` 循环中缺少关键每日逻辑
- **位置**: `farm_game.html:9401-9433` (calculateOfflineReward for 循环)
- **描述**: for 循环中只处理了吃饭、季节变化和作物生长，但缺少：村民每日工资扣除、宠物每日消耗、自动化设备运行、加工任务推进等。这导致离线多日时，这些系统的状态与在线运行不一致。
- **修复建议**: 将 while 循环中的完整每日逻辑提取为函数 `processDailyLogic()`，在 for 循环中调用该函数。

---

## 8. 存档系统

### P1-34. 存档备份机制占用大量 localStorage 空间
- **位置**: `farm_game.html:9809-9836` (saveGame 函数)
- **描述**: `saveGame` 每次写入都会复制 3 个备份。当游戏存档数据增大（包含大量任务、NPC状态、作物记录等），JSON 字符串可能达到数百 KB。4 个副本总计可能超过 1MB，接近某些浏览器 5MB 的 localStorage 限制。
- **修复建议**: 
  1. 将备份数量减少到 2 个
  2. 或者使用 IndexedDB 代替 localStorage，容量更大且支持结构化数据
  3. 或者只在关键时间点（如季节变化、完成任务）创建备份

### P2-35. 存档导出弹窗的文本框限制了 500 字符显示
- **位置**: `farm_game.html:10507-10510` (exportSave 函数)
- **描述**: 导出存档时弹窗显示 `saveData.substring(0, 500) + '...'`，只显示前 500 字符，用户无法复制完整的存档。虽然文本框可以点击全选，但文本框本身高度只有 120px，在移动端操作不便。
- **修复建议**: 增加文本框高度到 200px，并确保文本框内容包含完整的存档数据（而不是截断版）。

### P2-36. `exportSave` 的 `tryCopy` 和 `fallbackCopy` 在移动端不可靠
- **位置**: `farm_game.html:10472-10497` (exportSave 函数)
- **描述**: `navigator.clipboard` 在移动端需要 HTTPS 和用户交互上下文，而 `document.execCommand('copy')` 在 iOS Safari 中经常失败。最终降级方案显示截断的数据，无法完整导出。
- **修复建议**: 
  1. 直接使用 Blob 下载方式（已有 `exportSaveFile` 函数）
  2. 在移动端优先使用文件下载而非剪贴板复制

---

## 总结：最严重的问题（建议立即修复）

| 优先级 | 问题编号 | 问题描述 | 影响 |
|--------|----------|----------|------|
| P0 | 22 | `updateUI` 完全重渲染面板 | 每2秒重绘整个页面，移动端CPU占满 |
| P0 | 23 | `gameTick` 每2.4秒保存一次 | 频繁 JSON.stringify + localStorage 写入 |
| P0 | 30 | 离线收益天数重复计算 | 时间跳跃严重错误 |
| P0 | 11 | 事件日志与底部导航栏重叠 | 界面无法操作 |
| P0 | 19 | body 和 #game-container 双重滚动 | 触摸卡死 |
| P0 | 1 | 离线收益弹窗内容溢出 | 按钮不可见 |
| P0 | 2 | 弹窗拖拽拦截触摸 | 无法滚动弹窗内容 |
| P0 | 24 | BGM 定时器后台堆积 | 返回前台 CPU 飙升 |

---

*报告生成时间：基于 farm_game.html 21,898 行代码的完整审查*

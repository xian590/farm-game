# 农场游戏 Bug 排查报告

文件：`farm_game.html`（约 21,300 行）
JavaScript 代码行数：约 18580 行
函数定义总数：280 个

## 共发现 5 类问题

### 1. [中等] submitFeedbackEmail 函数中使用了可选链操作符 (?.)

- **位置**：JS lines 19899, 19898
- **影响**：在旧版微信内置浏览器或低版本浏览器中会报语法错误，导致整个脚本无法加载
- **修复建议**：将 document.getElementById("feedback-text")?.value?.trim() 改为 (document.getElementById("feedback-text") && document.getElementById("feedback-text").value || "").trim()
将 document.getElementById("feedback-include-log")?.checked 改为 !!(document.getElementById("feedback-include-log") && document.getElementById("feedback-include-log").checked)

---

### 2. [中等] game.house 在 initGame 中被初始化为字符串 "新手房"，但代码中将其当作对象访问 .rent 属性

- **位置**：JS lines 10748, 10749
- **影响**：租房后租金扣除逻辑不会执行（因为字符串的 .rent 为 undefined），且后续所有依赖 game.house 为对象的逻辑都会异常
- **修复建议**：将 initGame 中的 house: "新手房" 改为 house: { name: "新手房", rent: 0 }，并在 upgradeHouse 等函数中保持 house 为对象格式

---

### 3. [中等] initGame 中未初始化 5 个 game 字段，但代码中有引用

- **位置**：initGame 函数（game 对象初始化）
- **影响**：这些字段首次访问时为 undefined，可能导致统计错误、功能异常或 NaN 计算
- **修复建议**：在 initGame 的 game 对象中添加所有缺失字段的默认值，例如：started: false, lastSaveTimestamp: 0, lastAutoWeedDay: 0, lastGiftDay: {}, lastDialogue: {}, lastChatDay: {}, tutorialStep: 0, justStarted: true, marketVisited: false, pendingQuestRewards: [], currentSeasonBonus: 0, nextSeasonBonus: 0, sellBonus: 0, pestReduction: 0, hasBookBonus: false, hasMedicineKit: false, metChenyang: false, metLinxiaoyu: false, metSunmiaoqing: false, zhaoBonusNoticed: false, farmStay: {}, farmStayDishes: [], hiredWorker: null, hireStartDay: 0, lastWorkerWaterDay: 0, lastWorkerWeedDay: 0, petPoop: 0, animals: {}, orchard: [], communityProjects: {}, villageProjects: {}, unlockedTabs: {}, unlockedTechs: {}, weather: "sunny", weatherDuration: 0, currentEvent: null, achievements: {}, milestones: {}, quests: {}, eventHistory: [], neighborHelp: {}

---

### 4. [中等] fixSaveData 中未修复 1 个缺失字段

- **位置**：fixSaveData 函数
- **影响**：旧存档加载时这些字段仍为 undefined，导致功能异常
- **修复建议**：在 fixSaveData 中为每个缺失字段添加默认值修复

---

### 5. [轻微] game.items 缺少 "fish" 字段，但代码中有引用 game.items.fish

- **位置**：initGame 中的 items: { ... }
- **影响**：钓鱼物品统计异常，可能显示 undefined
- **修复建议**：在 items 对象中添加 fish: 0

---

## 排查方法说明

1. **Node.js 语法验证**：提取 JS 代码后用 `node --check` 验证，无语法错误
2. **函数定义与调用对比**：提取 280 个函数定义，与所有调用点对比
3. **数据定义完整性**：检查 NPC_DATA、QUEST_DATA、ACHIEVEMENT_DATA、MILESTONE_DATA、CROP_DATA、SEED_DATA、PROCESSING_DATA、ITEM_DATA、BUILDING_DATA、PET_DATA、RECIPE_DATA 等所有数据对象的引用，未发现引用不存在的键
4. **UI 渲染函数**：renderShopPanel、renderProcessingPanel、renderMarketPanel、renderCookingPanel 等已定义
5. **事件和任务系统**：handleEventChoice、applyEventBranches、showEventPopup、showEventModal 等已定义
6. **WeChat 兼容性**：发现可选链操作符 (?.) 一处，可能在不支持 ES2020 的环境中报错

## 补充说明（非 Bug）

- `event.stopPropagation()` 在 HTML onclick 中是合法调用，不是 bug
- `document.getElementById(...).click()` 在 HTML onclick 中是合法 DOM 操作，不是 bug
- `switchPanel`、`updateStats`、`advanceDay`、`addDayLog`、`showConfirm`、`showPrompt`、`setSpeed`、`toggleHelp`、`showEncyclopediaDetail` 等函数未定义，但代码中无任何调用，属于未实现功能，不影响当前游戏运行
- `giftNpc`、`hireNpc`、`doCooking`、`doProcessing`、`doForaging`、`doMining`、`doFishing` 等函数未定义，但代码中未调用（可能通过其他方式触发或属于未实现功能）

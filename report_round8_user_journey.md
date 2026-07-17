# 星愿花园（Manifestation Island）第八轮排查报告

## 用户体验旅程审计（User Journey Audit）

**排查日期**: 2026-01-13  
**排查范围**: 从真实用户完整使用旅程角度，跨功能数据一致性、每日核心循环、边界场景  
**排查方式**: 代码静态分析 + 跨模块数据流追踪 + 体验断点模拟  

---

## 一、发现的关键问题（按严重程度排序）

### 🔴 严重问题 1: crystalState.tasksToday 没有每日重置逻辑

**问题描述**:  
`crystalState.tasksToday` 一旦标记为完成（如 `checkin = true`），就永远不会被重置。这意味着：
- 用户第 1 天完成打卡后，`tasksToday.checkin = true`
- 第 2 天打开页面，`tasksToday.checkin` 仍然是 `true`
- 用户无法再次获得打卡奖励，任务面板永远显示"已完成"

**根本原因**:  
- `resetDailyUsageIfNeeded()` 只重置 `todayUsage`（tarot/ai/sats 计数），不重置 `crystalState.tasksToday`
- `checkDailyReset()` 只重置 `state` 中的字段（todayDone/purify/garden），不触及 `crystalState`

**修复方案**:  
在 `checkDailyReset()` 和 `resetDailyUsageIfNeeded()` 中都添加 `crystalState.tasksToday` 的重置逻辑：
```javascript
crystalState.tasksToday = { checkin: false, challenge: false, emotion: false, share: false, book: false };
saveVipState();
```

---

### 🔴 严重问题 2: state.checkinStreak 没有任何地方被更新

**问题描述**:  
- `doCheckIn()` 更新 `crystalState.dailyCheckIn.streak`
- 但 `checkBadges()` 检查 `state.checkinStreak >= 7` 和 `state.checkinStreak >= 30`
- **没有任何代码更新 `state.checkinStreak`**

**后果**:  
"坚持者"（连续打卡 7 天）和"自律女王"（连续打卡 30 天）徽章**永远不可能解锁**。

**修复方案**:  
在 `doCheckIn()` 中添加同步：
```javascript
state.checkinStreak = streak;
saveState();
```

---

### 🟠 中等问题 3: init() 和 checkDailyReset() 重复且不一致

**问题描述**:  
`init()` 中有一段独立的每日重置逻辑（使用 `cosmos_island_lastday_v3` key），而 `checkDailyReset()` 使用 `state.lastDailyReset`。两者：
- 使用不同的 key 存储"最后重置日期"
- `init()` 缺少 `state.mentalDiet.todayCount` 重置
- `init()` 缺少 `state.lastDailyReset` 更新

**后果**:  
- 新用户首次加载时，`checkDailyReset()` 可能不触发（因为 `lastDailyReset` 为 null），但 `init()` 中的逻辑会触发
- 两个系统的重置逻辑不同步，可能导致某些字段被重置两次，某些字段不被重置

**修复方案**:  
移除 `init()` 中的重复 daily reset 代码，统一调用 `checkDailyReset()`：
```javascript
// 替换前（init 中的代码）：
const lastDay = (() => { try { return localStorage.getItem('cosmos_island_lastday_v3'); } catch(e) { return null; } })();
if (lastDay !== today) { ... }

// 替换后：
checkDailyReset();
```

---

### 🟠 中等问题 4: 日期格式不一致

**问题描述**:  
- `getTodayStr()` 返回 `YYYY-MM-DD`（如 `2026-01-13`）
- `doCheckIn()` 和 `resetDailyUsageIfNeeded()` 使用 `new Date().toLocaleDateString('zh-CN')`
- 后者返回格式因浏览器/用户设置而异，可能是 `2026/1/13` 或 `2026-01-13`

**后果**:  
虽然各自内部使用相同的格式进行 `===` 比较，不会直接导致 bug，但跨系统数据（如 `state.lastDailyReset` 是 `YYYY-MM-DD`，而 `crystalState.dailyCheckIn.date` 可能是 `2026/1/13`）在不同时期存储的格式不一致，可能导致未来的兼容性问题。

**修复方案**:  
统一使用 `getTodayStr()` 替换所有 `toLocaleDateString('zh-CN')`。

---

### 🟡 体验问题 5: saveMoodNote 需要先 recordMood

**问题描述**:  
如果用户在没有先点击情绪图标（`recordMood`）的情况下直接写情绪笔记，`saveMoodNote` 不会保存任何内容：
```javascript
if (state.todayMood && state.todayMood.date === today) {
  // 保存笔记
}
```

**后果**:  
用户可能困惑为什么写了笔记但没有保存。这是一个体验断点（Experience Breakpoint）。

**修复方案**:  
如果 `state.todayMood` 不存在，自动创建一个默认的 `todayMood` 对象（情绪默认为 `calm`），然后保存笔记：
```javascript
if (!state.todayMood || state.todayMood.date !== today) {
  state.todayMood = { mood: 'calm', date: today, tags: [], note: '' };
  // 同时添加到 moodHistory
}
```

---

## 二、其他发现项（非严重但值得关注）

### 首次用户旅程（Onboarding）
- ✅ 欢迎页到首页的流转逻辑正确
- ⚠️ `testState` 为内存变量，测试中途退出会丢失进度（这是设计选择，但可能导致用户重复答题）
- ⚠️ 测试中点击返回按钮的处理需要验证（未在本次代码中完全确认）

### 情绪记录覆盖问题
- `recordMood` 使用 `filter(m => m.date !== today)` 确保每天只能有一条记录
- 如果用户第一次记录后写了笔记，第二次记录会覆盖第一次的记录（但笔记会保留在第二次记录中，因为 `saveMoodNote` 在 `recordMood` 之后运行）
- 这是有意的设计，但需要确认用户是否期望覆盖

### 跨功能数据一致性（其他）
- ✅ `addWish` → 许愿星同步正确（使用 `state.wishes`）
- ✅ `saveDiary` → 日记历史同步正确（使用 `state.diaries`）
- ✅ `addEnergy` 调用点已检查，无溢出风险

---

## 三、修复实施记录

### 已修复（已验证）

| # | 修复内容 | 影响文件 | 行号 | 状态 |
|---|---------|---------|------|------|
| 1 | `doCheckIn()` 统一使用 `getTodayStr()` | `app.js` | ~5980 | ✅ 已验证 |
| 2 | `doCheckIn()` 同步 `state.checkinStreak` | `app.js` | ~5980 | ✅ 已验证 |
| 3 | `resetDailyUsageIfNeeded()` 统一日期格式 | `app.js` | ~5890 | ✅ 已验证 |
| 4 | `resetDailyUsageIfNeeded()` 重置 `crystalState.tasksToday` | `app.js` | ~5890 | ✅ 已验证 |
| 5 | `checkDailyReset()` 重置 `crystalState.tasksToday` | `app.js` | ~4012 | ✅ 已验证 |
| 6 | `init()` 移除重复 daily reset，统一调用 `checkDailyReset()` | `app.js` | ~5170 | ✅ 已验证 |
| 7 | `saveMoodNote()` 允许独立保存（无先记录情绪） | `app.js` | ~3954 | ✅ 已验证 |

### 验证结果

```
✅ doCheckIn() now uses getTodayStr() instead of toLocaleDateString
✅ doCheckIn() now syncs state.checkinStreak
✅ resetDailyUsageIfNeeded() now uses getTodayStr()
✅ resetDailyUsageIfNeeded() now resets crystalState.tasksToday
✅ crystalState.tasksToday reset found in 2 locations
✅ init() now calls checkDailyReset() and removed cosmos_island_lastday_v3
✅ saveMoodNote() now allows independent note saving without prior mood record
```

---

## 四、累计修复统计

| 轮次 | 修复数量 | 关键修复 |
|------|---------|---------|
| 第一轮（静态代码审查） | 7 | 变量引用、CSS 语法、DEFAULT_STATE 补全 |
| 第二轮（导出/定义验证） | 5 | chunk 导出绑定、onclick 函数定义、数据文件括号 |
| 第三轮（竞态条件） | 3 | `runWhenReady()` 辅助函数 |
| 第四轮（功能逻辑） | 3 | addEnergy 升级检测、switchTab 防御、定时器清理 |
| 第五轮（数据持久化/性能） | 1 + 6 发现 | `__doSaveState` 截断后重新计算 sizeBytes |
| 第六轮（移动端体验） | 4 | stars.js 拖拽改局部绑定、100vh→dvh、长按禁用、软键盘滚动 |
| 第七轮（安全/A11y） | 90+ | 54 个 aria-label、40+ 输入框 maxlength/aria-label |
| **第八轮（用户旅程审计）** | **7** | **日期格式统一、签到 streak 同步、crystalState 每日重置、saveMoodNote 独立保存** |

**总计**: 120+ 处修复和增强

---

## 五、建议的后续工作

1. **自动化测试**: 建议为 `checkDailyReset()` 和 `doCheckIn()` 编写单元测试，模拟跨天场景
2. **数据迁移**: 如果已有用户使用旧版本的日期格式（`toLocaleDateString` 格式），可能需要一次性的数据迁移逻辑
3. **用户通知**: 对于已受影响的用户（如 `crystalState.tasksToday` 永久为 true 的用户），可以在下次加载时自动重置
4. **端到端测试**: 验证完整的用户旅程（欢迎页 → 测试 → 首页 → 打卡 → 情绪记录 → 日记 → 许愿 → 宫殿）

---

*报告生成完毕。第八轮体验审计共发现并修复 7 处问题，其中 2 处为严重级别（crystalState.tasksToday 永久锁定、state.checkinStreak 永不更新），均已修复并验证。*

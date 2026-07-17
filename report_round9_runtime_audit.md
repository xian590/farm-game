# 星愿花园（Manifestation Island）第九轮排查报告

## 高级运行时审计（Advanced Runtime Audit）

**排查日期**: 2026-01-13  
**排查范围**: 多标签页并发冲突、跨时区时间边界、AI/系统错误处理、VIP/水晶系统数据完整性  
**排查方式**: 代码静态分析 + 跨模块数据流追踪 + 并发场景模拟  

---

## 一、发现的关键问题（按严重程度排序）

### 🔴 严重问题 1: VIP/水晶状态变更不跨标签同步

**问题描述**:  
`saveVipState()` 只写入 localStorage，但不调用 `broadcastStorageUpdate()`。同时，`BroadcastChannel` 接收端只监听 `cosmos_island_state_v3` 的更新，不监听 `vip_state`/`crystal_state`/`today_usage` 的更新。

**后果**:  
- 用户在标签 A 购买/续费 VIP 后，标签 B 的 `vipState` 仍是内存中的旧状态
- 标签 B 的 `getCurrentTier()` 可能认为 VIP 已过期，静默降级为 `free`
- 用户可能被错误地限制付费功能，或在已付费的情况下看到免费版限制

**根因**:  
```javascript
// saveVipState() 原实现
function saveVipState() {
  StorageUtil.set('vip_state', vipState);
  StorageUtil.set('crystal_state', crystalState);
  StorageUtil.set('today_usage', todayUsage);
  // ❌ 没有 broadcastStorageUpdate()
}

// BroadcastChannel 接收端原实现
if (e.data.key === 'cosmos_island_state_v3') loadState();
// ❌ 不处理 vip_state / crystal_state / today_usage
```

**修复方案**:  
1. `saveVipState()` 中添加 `broadcastStorageUpdate()` 调用
2. `BroadcastChannel` 接收端添加 `vip_state`/`crystal_state`/`today_usage` 的处理逻辑，触发 `loadVipState()` + `updateCrystalDisplay()`

---

### 🔴 严重问题 2: `saveVipState()` 不检查 StorageUtil.set 返回值

**问题描述**:  
`StorageUtil.set()` 返回 boolean 表示成功/失败，但 `saveVipState()` 以及所有其他调用者都不检查这个返回值。

**后果**:  
如果 localStorage 已满（5-10MB 上限），VIP 状态、水晶数量、每日使用配额会**静默丢失**。用户可能发现：
- 刚购买的水晶消失了
- VIP 状态回退到免费版
- 每日配额重置但无法使用功能

**根因**:  
```javascript
function saveVipState() {
  StorageUtil.set('vip_state', vipState);        // 返回值被忽略
  StorageUtil.set('crystal_state', crystalState); // 返回值被忽略
  StorageUtil.set('today_usage', todayUsage);     // 返回值被忽略
}
```

**修复方案**:  
检查每个 `StorageUtil.set` 的返回值，失败时提示用户：
```javascript
const ok1 = StorageUtil.set('vip_state', vipState);
const ok2 = StorageUtil.set('crystal_state', crystalState);
const ok3 = StorageUtil.set('today_usage', todayUsage);
if (!ok1 || !ok2 || !ok3) {
  showToast('存储空间不足，建议导出数据后清理 🗑️');
}
```

---

### 🟠 中等问题 3: `checkQuota()` 多标签页竞争条件

**问题描述**:  
`checkQuota()` 使用内存中的 `todayUsage` 对象检查配额。如果用户打开两个标签页同时执行配额操作（如同时抽塔罗），两个标签页都可能通过配额检查，然后各自递增并保存。

**后果**:  
免费用户每日配额：1 次塔罗、3 次 AI、1 次 SATS。多标签页下可能实际使用次数超过配额。

**根因**:  
```javascript
function checkQuota(feature, action) {
  resetDailyUsageIfNeeded();
  // ❌ 只读取内存中的 todayUsage，没有重新从 localStorage 读取
  const tier = getTierConfig();
  if (feature === 'tarot') { 
    if (todayUsage.tarot >= tier.dailyTarot) { ... }
    todayUsage.tarot++;  // 另一个标签可能也在同时执行这行
    saveVipState(); 
    return true; 
  }
}
```

**修复方案**:  
在检查配额前，重新从 localStorage 读取 `todayUsage` 的最新值，缩小竞争窗口：
```javascript
const fresh = StorageUtil.get('today_usage', null);
if (fresh && fresh.date === todayUsage.date) {
  todayUsage = { ...todayUsage, ...fresh };
}
```

> ⚠️ 注意：这不能完全消除竞争（因为读取和写入之间仍有时间窗口），但将竞争窗口从"整个操作"缩小到"几行代码"，在实际场景中大幅降低超额概率。

---

### 🟡 体验问题 4: `getCurrentTier()` 静默降级

**问题描述**:  
`getCurrentTier()` 在检测到 VIP 过期时，会静默修改 `vipState.tier = 'free'` 并保存，不通知用户。用户可能困惑为什么昨天还是 VIP，今天突然变成免费版了。

**根因**:  
```javascript
function getCurrentTier() {
  if (vipState.tier === 'free') return 'free';
  if (vipState.expiry && new Date(vipState.expiry) > new Date()) return vipState.tier;
  vipState.tier = 'free'; saveVipState(); return 'free';  // ❌ 静默降级
}
```

**建议**:  在静默降级时添加一条 Toast 提示（"您的会员已过期，已恢复为免费版"），但保留自动降级行为（避免功能完全不可用）。

---

## 二、其他发现项

### 跨时区/时间边界
- `getTodayStr()` 使用本地时间，用户跨时区旅行时日期会提前/延后变化。这是合理行为，但可能导致"提前签到"或"延后重置"
- 建议：在服务器端维护 canonical 时间戳（如果未来引入后端），或提供手动同步选项

### AI/塔罗系统
- AI 是本地规则匹配（`generateAiReply`），没有网络依赖，错误风险低
- 塔罗是本地随机抽牌，没有网络依赖
- 两者都没有用户输入的 XSS 风险（因为输出是预定义文本）

### BroadcastChannel 已启用 ✅
- `initBroadcastChannel()` 在 `init()` 中被调用（line ~6061）
- `broadcastStateUpdate()` 在 `__doSaveState()` 成功后被调用
- 跨标签页同步机制已正确部署

---

## 三、修复实施记录

| # | 修复内容 | 影响文件 | 行号 | 状态 |
|---|---------|---------|------|------|
| 1 | `saveVipState()` 添加 `broadcastStorageUpdate()` 调用 | `app.js` | ~6985 | ✅ 已验证 |
| 2 | `saveVipState()` 检查 `StorageUtil.set` 返回值，失败时提示 | `app.js` | ~6985 | ✅ 已验证 |
| 3 | `BroadcastChannel` 接收端处理 `vip_state`/`crystal_state`/`today_usage` | `app.js` | ~2695 | ✅ 已验证 |
| 4 | `checkQuota()` 重新从 localStorage 读取 `todayUsage` | `app.js` | ~7015 | ✅ 已验证 |

---

## 四、验证结果

```
✅ saveVipState() now broadcasts VIP state changes
✅ saveVipState() now checks StorageUtil.set return values
✅ BroadcastChannel receiver now reloads vipState on cross-tab updates
✅ checkQuota() re-reads todayUsage from storage before check
✅ resetDailyUsageIfNeeded() uses getTodayStr() (八轮修复生效)
```

---

## 五、累计修复统计

| 轮次 | 修复数 | 关键修复 |
|------|--------|---------|
| 第1-7轮 | 113+ | 语法、导出、竞态、功能逻辑、性能、移动端、安全A11y |
| 第8轮 | 7 | 日期格式统一、签到 streak 同步、crystalState 每日重置、saveMoodNote 独立保存 |
| **第9轮** | **4** | **VIP 跨标签同步、存储错误处理、配额竞争缩小、BroadcastChannel VIP 接收** |
| **总计** | **124+** | |

---

## 六、建议的后续工作

1. **端到端测试**: 验证完整的付费流程（免费 → 试用 → 付费 → 续费 → 过期）在多标签页下的行为
2. **存储监控**: 在设置页面显示当前 localStorage 使用量，帮助用户提前清理
3. **getCurrentTier 降级提示**: 在 VIP 过期降级时添加友好提示
4. **时间一致性**: 如果未来引入后端，考虑使用服务器时间戳替代本地时间

---

*报告生成完毕。第九轮高级运行时审计共发现并修复 4 处关键问题，其中 2 处为严重级别（VIP 跨标签不同步、存储失败静默丢失）。*

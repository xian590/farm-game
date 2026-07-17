# 星愿花园 · P2 策略执行文档

> 生成时间：2026-06-26
> 对应修复轮次：第三轮深度审计后统一修复
> 覆盖版本：app.js + index.html + js/chunks/ + styles.css

---

## 一、用户旅程地图（Journey Map）

### 1.1 关键触点与情绪曲线

| 阶段 | 触点 | 用户行为 | 情绪预期 | 当前风险 | 修复状态 |
|------|------|----------|----------|----------|----------|
| **发现** | 落地页 | 首次访问 | 好奇 | 加载慢/首屏白屏 | ✅ 已有骨架屏 + LongTask监控 |
| ** onboarding** | 教程弹窗 | 浏览3步引导 | 轻松 | 称呼不适（已修） | ✅ "公主你好"→"你好呀" |
| **激活** | 人格测试 | 15题测试 | 投入 | 性别化文案（已修） | ✅ 题目+选项中性化 |
| **啊哈时刻** | 测试结果页 | 查看人格+花SVG | 惊喜 | 文案硬编码（已修） | ✅ `getTitle('label')` 动态 |
| **留存** | 每日打卡 | 情绪记录+许愿 | 平静/希望 | 数据丢失 | ✅ 导出/导入+BroadcastChannel |
| **深度** | SATS冥想 | 10分钟沉浸 | 专注 | 无进度记录 | ✅ `satsRecords` 已入DEFAULT_STATE |
| **传播** | 分享报告 | PDF生成 | 自豪 | 昵称fallback（已修） | ✅ "小公主"→"小花灵" |

### 1.2 情绪低谷点（Friction Points）

1. **L3140 personaCard 未解锁时**：原显示"你的专属花公主身份" → 已改为动态 `getTitle()`
2. **L3335 alert弹窗**：原标题"公主殿下" → 已改为"亲爱的你"
3. **设置页昵称输入**：原value="小公主" → 已改为"小花灵"

---

## 二、北极星指标（North Star Metric）

### 2.1 核心指标

```
北极星指标 = 连续7日活跃且完成至少1次显化行为的用户数
```

**拆解公式**：
- **分子**：7日留存用户 ∩ (打卡 ∪ 许愿 ∪ SATS ∪ 日记)
- **分母**：总注册用户
- **目标值**：D7留存率 ≥ 35%（行业心理健康类App中位数~28%）

### 2.2 辅助指标仪表盘

| 指标 | 定义 | 健康阈值 | 当前埋点 |
|------|------|----------|----------|
| 测试完成率 | 开始测试→看到结果 | ≥60% | ✅ trackEvent('test_start') / ('test_complete') |
| 首日激活率 | 注册→完成首次打卡 | ≥40% | ✅ trackEvent('first_checkin') |
| 许愿→行动转化率 | 创建愿望→完成微行动 | ≥25% | ✅ `showMicroActionsForWish()` 已接入 |
| SATS冥想完成率 | 开始冥想→听完10分钟 | ≥30% | ✅ trackEvent('sats_complete') |
| 情绪记录频次 | 人均每周记录次数 | ≥3次 | ✅ moodHistory 数组 |

---

## 三、竞品对照表（Competitive Benchmark）

| 维度 | 星愿花园（本品） | Reflectly | Headspace | 小睡眠 |
|------|-----------------|-----------|-----------|--------|
| **核心模型** | BE-DO-HAVE + SATS | CBT日记 | 正念冥想 | 白噪音助眠 |
| **人格系统** | 12花灵 + 5维度 | 无 | 无 | 无 |
| **去性别化** | ✅ 已完成 | ✅ 中性 | ✅ 中性 | ✅ 中性 |
| **微行动拆解** | ✅ 6类型×8模板 | ❌ | ❌ | ❌ |
| **数据导出** | ✅ JSON + PDF | ❌ | ❌ | ❌ |
| **离线可用** | ✅ 纯前端 | ✅ | ❌需订阅 | ✅ |
| **变现模式** | 未启动 | 订阅$7.99/月 | 订阅$12.99/月 | 订阅+广告 |

**差异化优势**：
1. 唯一将「显化理论」（Neville Goddard SATS）产品化的工具
2. 微行动拆解器：把大愿望拆为可执行小事（竞品无此功能）
3. 去性别化花灵系统：比 Reflectly 的抽象表情更有个性化

---

## 四、灰度发布检查清单

### 4.1 发布前（Pre-launch）

- [x] 全局错误监控（error + unhandledrejection + LongTask）
- [x] 开发者日志面板（连续点击标题5次触发）
- [x] module隔离修复（app.js ES module + track.js/test_runner.js 非module）
- [x] 去性别化文案审计（app.js 35处 + index.html 15处）
- [x] DEFAULT_STATE向后兼容（`...DEFAULT_STATE, ...parsed` 浅合并）
- [x] 数据导出完整性（`cosmos_island_state_v3` 整体导出）
- [ ] **待办**: 4MB localStorage 上限预警UI
- [ ] **待办**: Service Worker 离线缓存策略

### 4.2 发布中（Launch）

- [x] A/B埋点框架（track.js: event/session/user三维度）
- [x] 关键路径埋点（test_start/test_complete/first_checkin/sats_complete）
- [ ] **待办**: 埋点数据上报后端（当前仅console.log）
- [ ] **待办**: 崩溃自动上报（接 Sentry 或自建）

### 4.3 发布后（Post-launch）

- [ ] 7日留存率监控仪表盘
- [ ] 愿望→微行动转化漏斗分析
- [ ] 情绪记录与显化结果相关性分析
- [ ] 用户分层运营（高活跃/流失风险/新用户）

---

## 五、客服话术与危机应对

### 5.1 常见场景

| 场景 | 用户表达 | 应对话术 |
|------|----------|----------|
| 数据丢失 | "我的记录不见了" | "请先检查是否清除了浏览器缓存。星愿花园的数据完全保存在您的设备本地，我们不会上传到服务器。建议定期使用设置中的「导出所有数据」功能备份。" |
| 称呼不适 | "为什么叫我公主" | "您可以在「设置-个性化」中切换身份偏好，目前支持花公主、花之子、花灵、君主、探索者五种。我们将在后续版本持续优化称呼系统。" |
| 功能找不到 | "微行动在哪里" | "创建愿望后，系统会自动为您推荐微行动。您也可以在愿望列表中点击「🔧 拆解小事」手动触发。" |
| 情绪危机 | "我很难受，想死" | "[ACT话术] 我注意到你现在很难受。你愿意和我聊聊现在最困扰你的是什么吗？无论发生什么，你都不是一个人。如果你需要专业帮助，可以拨打心理援助热线：北京24小时心理援助 010-82951332。" |

### 5.2 危机升级路径

```
用户表达自杀倾向
    ↓
1. 触发ACT话术（认同感受 + 邀请表达 + 提供资源）
    ↓
2. 弹窗显示紧急联系方式（国内心理援助热线）
    ↓
3. 记录到 emotionHistory 并标记为 crisis（不暴露给用户）
    ↓
4. 如果 24h 内无情绪记录，推送关怀通知
```

---

## 六、技术债务清单（剩余）

| 优先级 | 问题 | 影响 | 建议方案 |
|--------|------|------|----------|
| P2 | `TRANSLATIONS.en` 仍含 "princess" | 英文界面性别化 | 同步更新英文翻译 |
| P2 | `voiceType: 'girl1'` 默认女声 | 男性用户不适 | 增加男声选项或中性语音 |
| P2 | 无 Service Worker | 离线体验不稳定 | 添加 SW 缓存静态资源 |
| P2 | 4MB localStorage 无预警 | 大数据用户数据丢失 | 添加存储量仪表盘+导出提醒 |
| P2 | `broadcastStorageUpdate` 仅广播3个key | 跨标签状态不同步 | 扩展为广播 state 变更事件 |
| P3 | 无后端数据持久化 | 换设备数据丢失 | 可选云端同步（加密） |
| P3 | 无单元测试覆盖 | 回归风险高 | Jest + Puppeteer E2E |

---

## 七、本轮修复完整 Diff 摘要

### 7.1 app.js（~50处改动）

```diff
+ window.getTitle = getTitle;
+ window.setTitlePreference = setTitlePreference;
+ window.TITLE_PRESETS = TITLE_PRESETS;
+ window.LEVELS = LEVELS;
+ window.MOOD_NAMES = MOOD_NAMES;
+ window.MOOD_CATEGORIES = MOOD_CATEGORIES;
+ window.DEFAULT_STATE = DEFAULT_STATE;
+ window.BADGES = BADGES;

- nickname: '小公主'
+ nickname: '小花灵'

- benefit_persona: '找到你的专属花公主人格'
+ benefit_persona: '找到你的专属花之身份'

- test_info: '约3分钟 · 15题 · 解锁你的公主身份'
+ test_info: '约3分钟 · 15题 · 解锁你的专属身份'

- p.name || '花公主'
+ p.name || getTitle('label')

- '愿每一位公主都能遇见更闪耀的自己'
+ '愿每一位花之子都能遇见更闪耀的自己'

- 全部 BADGES/LEVELS "xx公主" → "xx行者/花灵/魔法师"
- 全部 addBadge 调用同步更新
```

### 7.2 index.html（15处改动）

```diff
- id="greeting-name">小公主<
+ id="greeting-name">小花灵<

- ✨ 12位显化公主
+ ✨ 12位显化花灵

- id="alert-title">公主殿下
+ id="alert-title">亲爱的你

- 全部 "公主身份" → "花之身份"
```

### 7.3 track.js / test_runner.js

```diff
- const userId = state.uuid || ...
+ const userId = window.state?.uuid || ...

- Mock.setup(state)
+ Mock.setup(window.state)
```

---

*文档结束。建议下一动作：在真实浏览器中打开 `index.html`，验证身份偏好切换（princess/prince/mystic/sovereign/explorer）时各界面文本是否正确动态变化。*

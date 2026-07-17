# 🔮 许愿岛 PWA · 全面UX/UI诊断报告

> **诊断日期**：2025年7月  
> **诊断范围**：`index.html`（~5818行）+ `app.js`（~9108行）+ `quest.js`（~405行）  
> **诊断维度**：信息架构 · 视觉一致性 · 移动端体验 · 交互反馈 · 无障碍 · 性能感知 · 新增模块UX  

---

## 📊 执行摘要

本应用采用**单文件HTML+JS架构**，无构建步骤，使用Tailwind CSS CDN。整体视觉风格统一（粉紫马卡龙色调），动画细节丰富，基础无障碍和焦点管理已具备。但在**信息层级、底部安全区、键盘适配、Tab可访问性、历练模块输入体验**等方面存在可感知的体验债务。

| 严重度 | 数量 | 说明 |
|--------|------|------|
| 🔴 P0 致命 | 2 | 导航标签与文案错位、历练模块无底部Tab直达入口 |
| 🟠 P1 严重 | 6 | 安全区缺失、键盘遮挡、Tab状态不可访问、雷达图固定尺寸、删除无确认、历史栈逻辑缺陷 |
| 🟡 P2 建议 | 8 | 缺少aria-current、Toast样式缺失、横屏未适配、输入框内联样式泛滥、空状态可强化等 |

---

## 一、信息架构诊断

### 🔴 P0 — 导航标签文案与映射不一致

**问题描述**：底部导航第2个Tab显示为**"成长"**，但 `switchTab('tools')` 实际映射到 `tools` 页面。而真正的"成长"页面（`page-growth`）是一个独立子页面，需通过岛屿页或其他入口进入。用户点击底部"成长"期望进入成长体系，却进入了工具箱聚合页，心理模型与信息架构错位。

**位置**：`index.html:3417-3422` + `app.js:2277-2289`

**修复建议**：
```js
// app.js:2277 建议重命名映射
const pageMap = {
  island: 'island',
  tools: 'tools', // 建议将底部Tab label改为"工具"或拆分Tab
  library: 'library',
  journal: 'journal',
  me: 'me',
};
```
或修改HTML标签：
```html
<!-- index.html:3421 -->
<span>工具</span>  <!-- 将"成长"改为"工具" -->
```

---

### 🔴 P0 — 历练模块缺少底部导航直达入口

**问题描述**：历练（quest）是新增核心模块，包含任务、计时、周回顾、能力雷达等生产力功能。但它**只能通过"我的"页面网格中的二级入口进入**（`index.html:3218-3221`），用户无法从底部5Tab直接到达。作为高频使用的效率工具，这种深层嵌套显著增加了操作成本。

**修复建议**：
- **方案A**：将底部导航扩展为6Tab（需评估空间，5Tab已是移动端极限）
- **方案B**：在"成长"Tab的首屏顶部增加"历练之路"快捷入口卡片
- **方案C**：在岛屿首页增加"今日专注"快捷组件，直接唤起计时器

---

### 🟠 P1 — 页面历史栈 `goBack()` 存在边界缺陷

**问题描述**：`__pageHistory` 采用简单 `push` 模型，用户连续通过Tab切换时，历史栈会累积重复项（如 island → tools → island → tools）。`goBack()` 的 `pop()` 两次操作在栈深为1时直接回首页，但如果在子页面A通过Tab切到B再切回A，`goBack()` 可能产生循环或预期外的跳转。

**位置**：`app.js:2195-2227`

**修复建议**：
```js
function showPage(name, direction) {
  // ... existing code ...
  // 去重：避免连续重复压栈
  if (__pageHistory.length === 0 || __pageHistory[__pageHistory.length - 1] !== name) {
    __pageHistory.push(name);
  }
  // ...
}

function goBack() {
  if (__pageHistory.length > 1) {
    __pageHistory.pop(); // remove current
    const prev = __pageHistory[__pageHistory.length - 1]; // peek, don't pop
    if (prev) showPage(prev, 'back');
  } else {
    goHome();
  }
}
```

---

### 🟡 P2 — 页面层级过多（50+页面全部平铺）

**问题描述**：所有50+页面以平级 `<section>` 存在于单一HTML中，没有语义化层级分组。虽然通过 `display:none/block` 管理，但DOM节点数量庞大，低端设备可能感知到Tab切换时的渲染延迟。

**修复建议**：对低频页面（如隐私政策、关于、PDF报告）改为懒加载独立HTML片段，或使用 `<template>` 标签延迟实例化。

---

## 二、视觉一致性诊断

### 🟡 P2 — 输入框/选择框样式未统一为 `dream-input`

**问题描述**：项目中存在两套输入样式：
1. 已有 `.dream-input` 类（用于模态框中的自定义肯定语）
2. 历练模块大量使用内联 `style="background:rgba(255,255,255,0.6);border:1px solid ..."`

这导致输入框在不同页面呈现不同的圆角、边框、阴影和focus状态。

**位置**：`index.html:3280-3307`（quest 面板多处）

**修复建议**：
```css
/* 统一扩展 .dream-input 支持小尺寸变体 */
.dream-input-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(184,169,201,0.2);
  color: var(--theme-text);
  outline: none;
  transition: all 0.2s ease;
}
.dream-input-sm:focus {
  border-color: rgba(184,169,201,0.5);
  background: rgba(255,255,255,0.8);
}
```

---

### 🟡 P2 — quest 子Tab切换使用内联 style 而非CSS类

**问题描述**：`switchQuestTab()` 直接操作 `btn.style.background` 和 `btn.style.color`，无法利用CSS过渡动画，且难以维护深色模式适配。

**位置**：`app.js:2296-2313`

**修复建议**：
```js
function switchQuestTab(tab) {
  const panels = ['tasks', 'timer', 'sprint', 'stats'];
  panels.forEach(p => {
    const panel = document.getElementById('quest-panel-' + p);
    const btn = document.getElementById('quest-tab-' + p);
    if (panel) panel.classList.toggle('hidden', p !== tab);
    if (btn) {
      btn.classList.toggle('quest-tab-active', p === tab);
      btn.classList.toggle('quest-tab-inactive', p !== tab);
    }
  });
}
```
```css
.quest-tab-active {
  background: linear-gradient(135deg, #E8B5C8, #C8A5D8);
  color: white;
  transition: all 0.25s ease;
}
.quest-tab-inactive {
  background: rgba(184,169,201,0.12);
  color: var(--theme-text);
  transition: all 0.25s ease;
}
```

---

### 🟡 P2 — `.glass-card` 深色模式下 border 过于微弱

**问题描述**：深色模式下 `border-color: rgba(184, 169, 201, 0.15)` 对比度极低，卡片边界在OLED屏幕上几乎消失，导致信息层级模糊。

**位置**：`index.html:161-164`

**修复建议**：
```css
body.dark .glass-card {
  border-color: rgba(184, 169, 201, 0.3); /* 从0.15提升到0.3 */
}
```

---

## 三、移动端体验诊断

### 🟠 P1 — 底部导航未适配 iPhone 安全区

**问题描述**：`<meta name="viewport" content="..., viewport-fit=cover">` 已设置，但 `.bottom-nav` 没有添加 `padding-bottom: env(safe-area-inset-bottom)`。在iPhone X及以上机型，导航内容可能被Home Indicator遮挡。

**位置**：`index.html:13`（viewport已设cover）但缺少对应CSS

**修复建议**：
```css
.bottom-nav {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
main {
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
```
另外，所有设置了 `padding-bottom:100px` 的页面（如 quest、emotion 等）应将 `100px` 改为动态值：
```css
.page {
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}
```

---

### 🟠 P1 — 软键盘弹出时无输入框自动滚动处理

**问题描述**：历练模块包含大量 textarea（Sprint周回顾5个textarea + 灵感输入 + 任务输入）。在iOS Safari和Android Chrome中，软键盘弹出时可能遮挡输入框，且 `visualViewport` 无监听，用户需手动滚动。

**位置**：`index.html:3338-3358`（sprint textarea 区域）

**修复建议**：
```js
function initKeyboardScroll() {
  if (!('visualViewport' in window)) return;
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(el => {
    el.addEventListener('focus', () => {
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const vvHeight = window.visualViewport.height;
        if (rect.bottom > vvHeight - 80) {
          const offset = rect.bottom - vvHeight + 80;
          window.scrollBy({ top: offset, behavior: 'smooth' });
        }
      }, 300);
    });
  });
}
document.addEventListener('DOMContentLoaded', initKeyboardScroll);
```

---

### 🟡 P2 — 横屏（Landscape）无适配

**问题描述**：应用未针对横屏做任何优化。在横屏模式下，底部导航的5个Tab文字可能被挤压，glass-card 的 `padding:24px` 在短高度屏幕上可能导致一屏显示内容极少。

**修复建议**：
```css
@media (orientation: landscape) and (max-height: 500px) {
  .bottom-nav { padding-bottom: env(safe-area-inset-bottom); }
  .bottom-nav svg { width: 20px; height: 20px; }
  .bottom-nav span { font-size: 10px; }
  .glass-card { padding: 12px; border-radius: 16px; }
  .font-display { font-size: 1.25rem; }
}
```

---

## 四、交互反馈诊断

### 🟠 P1 — 任务删除无二次确认，易误触

**问题描述**：历练任务列表的删除按钮是单个 `✕` 字符，点击后立即执行 `QuestAPI.remove()`，没有任何确认对话框或撤销机制。44px触控区域在手机上也仅刚好及格，误触成本高。

**位置**：`js/chunks/quest.js:97`

**修复建议**：
```js
// quest.js:61 修改为带确认
remove: function(id) {
  const q = state.quests.find(x => x.id === id);
  if (!q) return;
  showAlert('⚠️', '确认删除', '确定要删除任务「' + q.title + '」吗？');
  // 或者使用已有 alert-modal 的回调模式
  // 更简单的方案：
  if (!confirm('确定删除此任务吗？')) return;
  state.quests = state.quests.filter(x => x.id !== id);
  saveState();
  renderQuests();
}
```

---

### 🟡 P2 — Toast 组件缺少CSS样式定义

**问题描述**：HTML中存在 `<div id="toast" class="toast" role="status">`（`index.html:483`），但在已读取的CSS片段中**没有找到 `.toast` 或 `#toast` 的样式定义**。如果Toast缺少定位样式（如 `position:fixed; bottom:...`），它可能无法正确显示在视口上，或只是以普通行内元素显示。

**修复建议**：确认并补充：
```css
.toast {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(93, 78, 109, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  max-width: 90vw;
  text-align: center;
  word-break: break-word;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

---

### 🟡 P2 — 空状态文案情绪化但缺少行动引导

**问题描述**：quest-list 的空状态文案为"还没有任务，添加第一个成长小目标吧 🌱"，仅告知状态，但没有直接提供添加操作的快捷入口。用户需要滚动到底部找到输入框。

**位置**：`js/chunks/quest.js:80`

**修复建议**：
```js
container.innerHTML = `
  <div class="text-center py-8">
    <div class="text-2xl mb-2" aria-hidden="true">🌱</div>
    <div class="text-xs mb-3" style="color:var(--text-mute)">还没有任务，添加第一个成长小目标吧</div>
    <button onclick="document.getElementById('quest-input').focus()" 
            class="soft-btn btn-primary px-4 py-2 text-xs rounded-full">
      ➕ 添加任务
    </button>
  </div>`;
```

---

## 五、无障碍（A11y）诊断

### 🟠 P1 — 底部导航缺少 `aria-current` 状态指示

**问题描述**：底部导航有 `role="navigation"` 和 `aria-label="Main navigation"`，但当前激活的Tab仅通过CSS类 `.active` 表现，屏幕阅读器用户无法感知当前所在页面。

**位置**：`index.html:3408-3448`

**修复建议**：
```js
function updateNavActive(active) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    item.removeAttribute('aria-current');
  });
  const el = document.getElementById('nav-' + active);
  if (el) {
    el.classList.add('active');
    el.setAttribute('aria-current', 'page');
  }
}
```

---

### 🟡 P2 — quest 子Tab按钮缺失 ARIA 状态

**问题描述**：历练的4个子Tab按钮没有 `aria-selected` 或 `role="tab"`，屏幕阅读器用户无法感知当前激活的面板。

**修复建议**：
```html
<!-- 将子Tab结构改为标准 tabs 模式 -->
<div role="tablist" aria-label="历练分类" class="flex gap-2 mb-4">
  <button role="tab" id="quest-tab-tasks" aria-selected="true" aria-controls="quest-panel-tasks">任务</button>
  <button role="tab" id="quest-tab-timer" aria-selected="false" aria-controls="quest-panel-timer">计时</button>
  <!-- ... -->
</div>
<div role="tabpanel" id="quest-panel-tasks" aria-labelledby="quest-tab-tasks">...</div>
```

---

### 🟡 P2 — 大量装饰性emoji缺少 `aria-hidden`

**问题描述**：页面中大量使用emoji作为视觉装饰（如 🏝️ 🌸 💎 🔮 等），这些emoji会被屏幕阅读器逐个朗读，造成信息噪音。

**位置**：全局（如 `index.html:546` 欢迎页、任务列表、按钮等）

**修复建议**：
```html
<!-- 装饰性emoji添加 aria-hidden -->
<div class="text-7xl mb-4 animate-breath" aria-hidden="true">🏝️</div>

<!-- 如果emoji承载语义，用 span 包裹并添加替代文本 -->
<span role="img" aria-label="岛屿">🏝️</span>
```

---

### 🟡 P2 — 颜色对比度在特定组合下不足

**问题描述**：品牌色 `#B8A9C9`（text-mute）在 `#FAF5F7` 背景上的对比度约为**2.8:1**，低于WCAG AA标准（4.5:1）。大量辅助文本（如 `text-[10px]` 的元数据标签）使用该色，在户外强光环境下可读性堪忧。

**修复建议**：
```css
:root {
  --text-mute: #8B7E9C; /* 从 #B8A9C9 加深，对比度提升至约4.6:1 */
}
```

---

## 六、性能感知诊断

### 🟡 P2 — 骨架屏退出时机可能过早或没有过渡

**问题描述**：`#skeleton-screen` 存在（`index.html:471-476`）但没有读取到其CSS定义和JavaScript控制逻辑。如果骨架屏是页面加载时显示，但在JS执行前就被隐藏，可能导致闪烁（Flash of Unstyled Content）。

**修复建议**：确保骨架屏由JS在 `DOMContentLoaded` 后控制淡出：
```js
document.addEventListener('DOMContentLoaded', () => {
  const sk = document.getElementById('skeleton-screen');
  if (sk) {
    sk.style.opacity = '0';
    sk.style.transition = 'opacity 0.4s ease';
    setTimeout(() => sk.remove(), 400);
  }
});
```

---

### 🟡 P2 — 页面切换动画缺少 `prefers-reduced-motion` 适配

**问题描述**：所有页面切换动画（slide-in-right、fade-in-up 等）和微交互（card-hover、soft-btn 等）未针对 `prefers-reduced-motion: reduce` 做降级处理。对前庭功能障碍用户可能造成不适。

**修复建议**：
```css
@media (prefers-reduced-motion: reduce) {
  .page, .card-hover, .soft-btn, .glass-card {
    animation: none !important;
    transition: none !important;
  }
  .page.slide-in-right,
  .page.slide-in-left,
  .page.fade-in {
    animation: none !important;
  }
}
```

---

## 七、新增模块（历练）专项诊断

### 🟠 P1 — 雷达图固定180px，在小屏设备上可读性差

**问题描述**：`renderRadarChart()` 中 SVG 尺寸写死为 `size = 180`，在iPhone SE（375px宽）上，雷达图占据接近半屏宽度，但标签文字 `font-size="9"` 在高分屏（@2x/@3x）上实际渲染为18/27物理像素，虽然可辨，但周边留白不足，容易与滑动条区域发生触控冲突。

**位置**：`js/chunks/quest.js:330-369`

**修复建议**：
```js
function renderRadarChart(values) {
  const container = document.getElementById('radar-chart');
  if (!container) return;
  // 响应式尺寸
  const containerWidth = container.clientWidth || 320;
  const size = Math.min(200, containerWidth - 32);
  const cx = size / 2, cy = size / 2, maxR = size * 0.38;
  // ... rest of rendering
}
```
```css
#radar-chart {
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
}
#radar-chart svg {
  width: 100%;
  height: auto;
}
```

---

### 🟡 P2 — 计时器按钮状态反馈不够显性

**问题描述**：计时器运行中仅通过按钮文字从"▶ 开始"变为"⏸ 暂停"来反馈状态，没有视觉上的颜色变化或脉动动画，用户一眼难以区分当前是否在计时。

**修复建议**：
```css
#timer-display.timing {
  animation: pulse-timing 1.5s ease-in-out infinite;
  color: #E8B5C8;
}
@keyframes pulse-timing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```
```js
// TimerAPI.start 中
const display = document.getElementById('timer-display');
if (display) display.classList.add('timing');
// TimerAPI.pause / reset 中移除
if (display) display.classList.remove('timing');
```

---

### 🟡 P2 — Sprint回顾的5个textarea无自动保存/进度指示

**问题描述**：用户在5个textarea中输入周回顾内容后，只有点击底部"保存本周回顾"才持久化。没有自动保存（auto-save）机制，也没有已填写/未填写的视觉指示。用户可能担心数据丢失。

**修复建议**：
```js
// 添加防抖自动保存
let sprintAutoSaveTimer;
['sprint-scan','sprint-prioritize','sprint-iterate','sprint-nurture','sprint-transform']
  .forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      clearTimeout(sprintAutoSaveTimer);
      sprintAutoSaveTimer = setTimeout(() => {
        saveSprint();
        showToast('💾 已自动保存');
      }, 2000);
    });
  });
```

---

### 🟡 P2 — quest 入口无chunk加载失败兜底

**问题描述**："我的"页面中的历练入口使用 `onclick="openModule('quest')"`，但 `openModule` 内部调用 `loadChunk('quest')`。如果chunk加载失败，用户看到的是空白页面或无提示。虽然 `retryLoadChunk` 存在，但用户首次进入失败时缺少即时反馈。

**修复建议**：在 `showChunkError` 或 `retryLoadChunk` 中，确保用户被引导到重试页面，而不是卡在空白态。

---

## 八、按优先级排序的修复清单

| 优先级 | 问题 | 影响 | 预估工时 | 文件位置 |
|--------|------|------|----------|----------|
| 🔴 P0 | 底部导航"成长"标签改为"工具" | 用户心理模型错位 | 5min | `index.html:3421` |
| 🔴 P0 | 历练模块增加一级入口 | 操作成本过高 | 1h | `index.html` + `app.js` |
| 🟠 P1 | 底部导航增加安全区padding | iPhone底部遮挡 | 15min | `index.html` CSS |
| 🟠 P1 | 全局键盘弹出自动滚动 | 输入遮挡 | 30min | `app.js` |
| 🟠 P1 | 任务删除添加二次确认 | 误触风险 | 20min | `quest.js` |
| 🟠 P1 | 修复历史栈重复压栈 | 返回路径混乱 | 15min | `app.js` |
| 🟠 P1 | 导航Tab增加aria-current | 屏幕阅读器 | 10min | `app.js` |
| 🟠 P1 | 雷达图响应式尺寸 | 小屏可读性 | 20min | `quest.js` + CSS |
| 🟡 P2 | 补充Toast CSS样式 | 反馈缺失 | 15min | `index.html` CSS |
| 🟡 P2 | 统一输入框为.dream-input-sm | 视觉一致性 | 30min | `index.html` |
| 🟡 P2 | 子Tab改用CSS类切换 | 可维护性 | 20min | `app.js` + CSS |
| 🟡 P2 | 增加prefers-reduced-motion | 无障碍 | 10min | `index.html` CSS |
| 🟡 P2 | 全局emoji加aria-hidden | 屏幕阅读器噪音 | 30min | `index.html` |
| 🟡 P2 | 深色模式边框加深 | 信息层级 | 5min | `index.html` CSS |
| 🟡 P2 | Sprint textarea自动保存 | 数据安全感 | 15min | `quest.js` |
| 🟡 P2 | 计时器增加timing脉动态 | 状态感知 | 10min | `quest.js` + CSS |
| 🟡 P2 | 空状态增加行动按钮 | 转化效率 | 15min | `quest.js` |

---

## 九、亮点与最佳实践（值得保留）

1. **焦点管理**：`showModal` / `hideModal` 使用 `__modalFocusStack` 恢复焦点，`trapFocus` 实现焦点循环，Escape键关闭弹窗，均已实现。`app.js:165-204`
2. **触控区域保障**：`@media (pointer: coarse)` 强制44px最小触控区域。`index.html:236-238`
3. **CDN降级**：Tailwind和Google Fonts均设置 `onerror` 回调，并内联了基础工具类后备。`index.html:74-99`
4. **错误监控**：全局 `error` 和 `unhandledrejection` 监听器，配合 `__errorLog` 和 `sessionStorage` 持久化。`app.js:1-19`
5. **动画质感**：使用 `cubic-bezier(0.22, 1, 0.36, 1)` 弹性曲线，区别于标准ease，触感柔和，符合女性向产品调性。
6. **多语言架构**：`TRANSLATIONS` 对象和 `data-i18n` 属性系统，具备扩展性。

---

*报告完*

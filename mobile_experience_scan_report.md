# 📱 farm_game.html 移动端体验扫描报告

> 扫描文件：`C:\Users\Administrator\Documents\kimi\workspace\farm_game.html`
> 扫描维度：10 项移动端体验指标
> 文件总行数：25,667 行

---

## 🔴 严重问题（需立即修复）

### 1. 触摸目标严重不足 — `.speed-btn`（设置面板内）

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 304-315 |
| **当前值** | `padding: 4px 10px; min-height: 28px; min-width: 36px` |
| **问题** | 高度仅 28px，宽度仅 36px，远低于 WCAG 2.1 推荐的 44×44px 触摸目标 |
| **影响** | 设置面板中的 1x/2x/5x 速度按钮在移动端极难准确点击 |
| **建议修复** | ```css
.speed-btn {
    padding: 8px 14px;
    min-height: 44px;
    min-width: 44px;
    font-size: 14px;
}
``` |

### 2. 触摸目标不足 — 顶部「睡觉」按钮（内联样式）

| 项目 | 详情 |
|------|------|
| **位置** | HTML line 2968 |
| **当前值** | `padding: 4px 12px; font-size: 13px` |
| **问题** | 垂直 padding 仅 4px，无 min-height，实际高度约 24-28px |
| **影响** | 顶部状态栏的睡觉按钮是高频操作，移动端容易误触或点不到 |
| **建议修复** | `padding: 8px 16px; min-height: 44px; font-size: 14px;` |

### 3. 触摸目标不足 — `.event-log-expand-btn`

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 970-983 |
| **当前值** | `padding: 4px 12px; font-size: 12px` |
| **问题** | padding 过小，按钮高度不足 44px |
| **影响** | 展开/收起日志按钮点击困难 |
| **建议修复** | `padding: 8px 16px; min-height: 44px;` |

### 4. 移动端媒体查询中 `.backpack-item-use-btn` 反而缩小

| 项目 | 详情 |
|------|------|
| **位置** | CSS `@media (max-width: 768px)` line 2046-2050 |
| **当前值** | `padding: 3px 6px; font-size: 10px` |
| **问题** | 在移动端媒体查询中，背包物品的使用按钮被进一步缩小 |
| **影响** | 移动端背包界面使用按钮几乎无法准确点击 |
| **建议修复** | ```css
.backpack-item-use-btn {
    padding: 8px 12px;
    font-size: 12px;
    min-height: 36px;  /* 至少 36px，理想 44px */
}
``` |

---

## 🟠 中等问题（建议修复）

### 5. 触摸目标偏紧 — 桌面端 `.speed-btn-top` / `.pause-btn-top`

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 323-386 |
| **当前值** | `padding: 4px 10px;`（无 min-height/min-width） |
| **问题** | 桌面端顶部状态栏的时间控制按钮 padding 过小 |
| **说明** | 在 `@media (max-width: 768px)` 中 `.speed-btn-top` 已修复为 `min-height: 44px`，但 `.pause-btn-top` 在移动端仅 `padding: 3px 6px; font-size: 11px`（line 1966-1970），仍然偏小 |
| **建议修复** | 为 `.pause-btn-top` 添加移动端样式：`min-height: 44px; padding: 8px 12px;` |

### 6. 可点击 `.stat-item` 触摸目标不足

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 394-407, HTML line 2929 |
| **当前值** | `padding: 4px 8px;`（无 min-height） |
| **问题** | `#inventory-toggle` 有 `onclick="toggleInventoryPreview()"` 点击事件，但 padding 仅 4px 8px |
| **说明** | 虽然 `.stat-item` 在移动端 `@media` 中仍保持 `padding: 4px 8px`（仅 font-size 变小），实际高度约 30px |
| **建议修复** | 为可点击的 `.stat-item` 增加最小尺寸：`min-height: 36px; padding: 8px 12px;` |

### 7. 桌面端 `.settings-btn` / `.quick-btn` 尺寸偏小

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 1189-1212, 1452-1473 |
| **当前值** | `width: 36px; height: 36px` |
| **说明** | 在 `@media (max-width: 768px)` 中已修复为 44px，但桌面端基础样式仍然是 36px。平板横屏时可能仍使用桌面端样式 |
| **建议修复** | 将基础样式改为 `width: 44px; height: 44px`，或在 `768px-1024px` 区间添加平板适配 |

### 8. `.bgm-btn` 触摸目标偏紧

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 1562-1585 |
| **当前值** | `padding: 8px 4px; font-size: 13px` |
| **问题** | 水平 padding 仅 4px，在 3 列网格中按钮宽度可能不足 44px |
| **建议修复** | `padding: 10px 8px; min-height: 44px;` |

---

## 🟡 轻微问题（可优化）

### 9. 固定定位元素可能重叠

| 元素 | 位置 | z-index | 潜在问题 |
|------|------|---------|---------|
| `.modal-overlay` | fixed 全屏 | 3500 | ✅ 正常，作为弹窗遮罩 |
| `.quick-actions` | fixed bottom:10px | 1500 | 移动端改为 `bottom: 65px; z-index: 2002`（line 2124-2127），可能与底部导航栏间隙过小 |
| `.event-log`（移动端）| fixed bottom:180px | 1001 | `bottom: 180px` 在部分手机上可能与底部导航重叠，建议改为 `bottom: calc(env(safe-area-inset-bottom, 0px) + 160px)` |
| `.float-countdown-btn` | fixed bottom-right | 2000 | 移动端改为 `bottom: 70px`（line 2147-2160），位置合理但可能遮挡内容 |
| `.toast` | fixed top:80px | 3000 | ✅ 正常，自动消失 |
| `.migration-banner` | fixed | 4000 | line 9436，z-index 最高，会遮挡所有弹窗 |

### 10. 部分文字颜色对比度偏低

| 位置 | 当前值 | 背景色 | 对比度评估 |
|------|--------|--------|-----------|
| `.clock-ampm` (line 1236) | `#bbb` | `#3d3229` | ⚠️ 偏低，建议 `#ccc` 或更亮 |
| `.sidebar-tab.locked` (line 455) | `#666` | `#8b7355` | ⚠️ 偏低，建议 `#888` |
| `.quest-track-reward` (line 1738) | `#e67e22` | 白色/浅色 | ✅ 可接受 |
| `.log-time` (line 1028) | `#7a6a50` | `#f8f4e8` | ⚠️ 轻微偏低 |
| `.mode-card.recommended::before` (line 190) | `color: white` on `#f39c12` | — | ⚠️ 橙色背景配白色文字，对比度约 1.9:1，低于 WCAG AA 的 4.5:1 |

### 11. 基础 `.modal` 样式缺少 max-height

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 1086-1101 |
| **当前值** | 无 `max-height` 限制 |
| **问题** | 桌面端弹窗如果内容极长，可能超出视口 |
| **说明** | 移动端 `@media` 中已添加 `max-height: 85vh`，但桌面端基础样式未限制 |
| **建议修复** | `.modal { max-height: 90vh; overflow-y: auto; }` |

### 12. `@media (max-width: 400px)` 中 `.sidebar-tab` 的 min-width 仅 52px

| 项目 | 详情 |
|------|------|
| **位置** | CSS line 2184-2190 |
| **当前值** | `min-width: 52px; min-height: 44px` |
| **问题** | min-width 52px 接近下限，font-size 仅 10px，文字可能溢出 |
| **建议** | 考虑将底部标签栏改为横向可滚动，或合并部分标签 |

---

## ✅ 做得好的地方

| 检查项 | 状态 | 说明 |
|--------|------|------|
| **输入框 font-size ≥ 16px** | ✅ 通过 | 所有 `<textarea>` 和 `<input>` 均为 16px，可避免 iOS 自动缩放 |
| **弹窗 max-height ≤ 85vh** | ✅ 通过 | 所有弹窗在移动端均限制为 80vh 或 85vh，且有 `overflow-y: auto` |
| **移动端按钮 min-height 44px** | ⚠️ 部分通过 | `.modal-btn`、`.shop-btn`、`.btn-primary`、`.action-btn` 等基础样式均有 `min-height: 44px`，但部分内联样式和特殊按钮缺失 |
| **viewport meta** | ✅ 通过 | `width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no` |
| **touch-action** | ✅ 通过 | `touch-action: manipulation` 和 `touch-action: pan-y` / `pan-x` 已设置 |
| **overscroll-behavior** | ✅ 通过 | `overscroll-behavior: none` / `contain` 已设置 |
| **-webkit-tap-highlight-color** | ✅ 通过 | 已设为 `transparent` |
| **安全区域适配** | ✅ 部分通过 | `env(safe-area-inset-bottom)` 已在 `.sidebar` 和 `.event-log` 中使用 |
| **减少动画偏好** | ✅ 通过 | `@media (prefers-reduced-motion: reduce)` 已完整配置 |
| **滚动区域** | ✅ 通过 | 所有内容区、弹窗、日志均有 `overflow-y: auto` 和 `-webkit-overflow-scrolling: touch` |
| **加载反馈** | ✅ 通过 | `#page-loader` 有进度条动画和文字提示 |
| **错误提示** | ✅ 通过 | `#file-warning`、错误日志弹窗、`.toast` 提示均存在 |

---

## 📋 问题汇总表

| 序号 | 问题 | 严重程度 | 位置 | 当前值 | 建议值 |
|------|------|---------|------|--------|--------|
| 1 | `.speed-btn` 触摸目标过小 | 🔴 | CSS 304 | `min-h:28px, min-w:36px, p:4px 10px` | `min-h:44px, min-w:44px, p:8px 14px` |
| 2 | 睡觉按钮内联样式 padding 过小 | 🔴 | HTML 2968 | `p:4px 12px, fs:13px` | `p:8px 16px, min-h:44px, fs:14px` |
| 3 | `.event-log-expand-btn` 过小 | 🔴 | CSS 970 | `p:4px 12px, fs:12px` | `p:8px 16px, min-h:44px` |
| 4 | 移动端背包使用按钮反而缩小 | 🔴 | CSS 2046 | `p:3px 6px, fs:10px` | `p:8px 12px, min-h:36px` |
| 5 | 移动端 `.pause-btn-top` 偏小 | 🟠 | CSS 1966 | `p:3px 6px, fs:11px` | `p:8px 12px, min-h:44px` |
| 6 | 可点击 `.stat-item` 无 min-height | 🟠 | CSS 394 | `p:4px 8px` | `min-h:36px, p:8px 12px` |
| 7 | `.settings-btn` / `.quick-btn` 桌面端 36px | 🟠 | CSS 1189 | `w:36px, h:36px` | `w:44px, h:44px` |
| 8 | `.bgm-btn` padding 偏紧 | 🟠 | CSS 1562 | `p:8px 4px` | `p:10px 8px, min-h:44px` |
| 9 | 基础 `.modal` 无 max-height | 🟡 | CSS 1086 | 无限制 | `max-h:90vh` |
| 10 | 橙色标签白字对比度不足 | 🟡 | CSS 190 | `bg:#f39c12, color:white` | `bg:#d68910, color:white` 或加文字阴影 |
| 11 | `.event-log` 移动端 bottom 固定值 | 🟡 | CSS 2073 | `bottom:180px` | `bottom:calc(env(safe-area-inset-bottom) + 160px)` |
| 12 | `.clock-ampm` 颜色偏淡 | 🟡 | CSS 1236 | `#bbb` | `#ddd` |

---

## 🔧 推荐修复优先级

```
P0（立即修复）：
  1. `.speed-btn` 增加 min-height/min-width 到 44px
  2. 睡觉按钮内联样式增大 padding 并加 min-height
  3. `.event-log-expand-btn` 增大尺寸
  4. 移动端 `.backpack-item-use-btn` 不要缩小，至少保持 36px

P1（本周修复）：
  5. 移动端 `.pause-btn-top` 加 min-height:44px
  6. 可点击 `.stat-item` 加 min-height
  7. `.settings-btn` / `.quick-btn` 基础样式改为 44px
  8. `.bgm-btn` 增大 padding

P2（有空优化）：
  9. 基础 `.modal` 加 max-height:90vh
  10. 调整低对比度颜色
  11. `.event-log` bottom 值使用 calc + env()
```

# 宇宙许愿岛 · 深度代码审计报告

**文件**: index.html  |  **总行数**: 16,922  |  **JS行数**: 11,845

## 一、函数分析

- `function` 声明: 291 个
- 箭头函数: 4 个
- 函数表达式: 0 个
- **函数总计**: 295 个 (唯一: 295)

✅ 未发现重复函数

## 二、localStorage 操作

- `getItem()`: 5 次
- `setItem()`: 5 次
- `removeItem()`: 1 次
- `clear()`: 0 次
- **总计**: 11 次

## 三、安全检查

- `innerHTML` 赋值: 89 处
- `eval()`: ✅ 无
- `new Function()`: ✅ 无

### innerHTML 详情 (前5个)

- `state.habits.slice(0, 5).map(h => {
      const done = (h.checkins && h.checkins`
- ``
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-bre`
- ``
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-bre`
- ``
    <div class="text-xs font-medium mb-2" style="color:var(--theme-text)`
- ``
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-bre`

## 四、性能检查

- `setInterval`: 7 次
- `clearInterval`: 11 次
- Interval 泄漏风险: ✅ 平衡
- `addEventListener`: 11 次
- `removeEventListener`: 0 次

## 五、移动端检查

- <16px 字体: ⚠️ 44 处
- touch-action: ✅ 有
- tap-highlight: ✅ 有
- safe-area: ✅ 有

## 六、PWA 支持

- manifest.json: ✅ 有
- Service Worker: ❌ 无
- theme-color: ✅ 有
- apple-touch-icon: ❌ 无

## 七、HTML ID 检查

- 唯一 ID: 403
- 重复 ID: 3 个

- `tarot-card-back`: 3 次
- `daily-affirm-text`: 2 次
- `book-reader-modal`: 2 次

## 八、关键发现

### 可能未定义的全局常量

- `F0EDE0`
- `EFF6FF`
- `F5D5E0`
- `E8E8E0`
- `UPRIGHT`
- `E8B4A8`
- `D48098`
- `F5E6A8`
- `E8E0F0`
- `DIARY_PROMPTS`

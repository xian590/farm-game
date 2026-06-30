# 农场游戏 Bug 排查报告

共发现 4 类问题

## 1. [中等] 使用了可选链操作符 (?.)，在旧版WeChat/浏览器中可能不兼容

- **位置**: JS lines 19898, 19898, 19899
- **影响**: 可能导致脚本在旧环境中报错无法执行
- **修复建议**: 将 obj?.prop 改为 (obj && obj.prop) 或 obj ? obj.prop : undefined

## 2. [中等] game.house 被当作对象访问 .rent，但 initGame 中 house 是字符串 "新手房"

- **位置**: JS lines 10748, 10749
- **影响**: 在 house 为字符串时访问属性会导致 undefined，可能引发后续错误
- **修复建议**: 将 game.house 改为对象 { name: "新手房", level: 1 }，或修正引用逻辑

## 3. [轻微] initGame 中未初始化以下 game 字段（但代码中有引用）: started, lastSaveTimestamp, lastAutoWeedDay, lastGiftDay, lastDialogue

- **位置**: initGame 函数
- **影响**: 这些字段在首次访问时可能为 undefined，导致逻辑异常
- **修复建议**: 在 initGame 的 game 对象初始化中添加所有缺失的字段及其默认值

## 4. [轻微] game.items 缺少 "fish" 字段，但代码中有引用 game.items.fish

- **位置**: initGame 中的 items 对象
- **影响**: 钓鱼物品统计可能异常
- **修复建议**: 在 items 对象中添加 fish: 0


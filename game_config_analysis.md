# 农场游戏数值系统与配置深度分析报告

> **分析来源**: `farm_game.html`（15,523 行）  
> **分析时间**: 基于代码静态提取  
> **用途**: 为精确测试方案提供配置依据与数值锚点

---

## 1. 游戏模式配置（line ~1854-5623）

### 1.1 三种模式定义

```javascript
const names = { easy: '归隐田园', normal: '耕读传家', hard: '富甲一方' };

const configs = {
    easy:   { money: 3000, maxHealth: 200, maxStamina: 200, disasterRate: 0.6 },
    normal: { money: 1500, maxHealth: 200, maxStamina: 200, disasterRate: 1.0 },
    hard:   { money: 5000, maxHealth: 220, maxStamina: 220, disasterRate: 1.5 }
};
```

| 模式 | 名称 | 初始资金 | 最大健康 | 最大体力 | 灾难倍率 | 描述 |
|------|------|----------|----------|----------|----------|------|
| easy | 归隐田园 | 3000元 | 200 | 200 | ×0.6 | 轻松体验，剧情向 |
| normal | 耕读传家 | 1500元 | 200 | 200 | ×1.0 | 标准平衡，大众向 |
| hard | 富甲一方 | 5000元 | 220 | 220 | ×1.5 | 快速发展，经营向 |

### 1.2 初始游戏状态（`initGame`）

```javascript
game = {
    mode: mode,
    money: cfg.money,
    maxHealth: cfg.maxHealth,
    health: cfg.maxHealth,
    maxStamina: cfg.maxStamina,
    stamina: Math.floor(cfg.maxStamina * 0.5),  // 初始体力仅50%
    day: 1,
    season: 'spring',
    time: 6,  // 小时
    disasterRate: cfg.disasterRate,
    fields: [ /* 1块新手档田 */ ],
    house: '新手房',
    tools: [],
    composting: false,
    items: { fertilizer: 0, pesticide: 0, bun: 0, medicine: 0, organicFertilizer: 0 },
    seeds: { rice_spring: 0, rice_summer: 0, sweet_spring: 0, sweet_autumn: 0 },
    crops: { rice: 0, sweet: 0 },
    buildings: {},
    storageCapacity: 2000,
    processedItems: { riceGrain: 0, driedSweetPotato: 0 },
    dailyActions: { exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0 },
    skills: {
        cropFamiliarity: { level: 0, exp: 0 },
        fieldManagement: { level: 0, exp: 0 },
        toolMastery: { level: 0, exp: 0 },
        composting: { level: 0, exp: 0 }
    },
    reputation: 0,
    mood: 50,
    npcs: {},  // 所有NPC初始好感0
    pets: {
        dahuang: { name: '大黄', icon: '🐕', friendship: 0, petToday: 0, fedToday: false, have: true },
        ahua: { name: '阿花', icon: '🐈', friendship: 0, petToday: 0, fedToday: false, have: true }
    }
};
```

---

## 2. 作物系统（CROP_DATA, line ~2970-3019）

### 2.1 作物配置表

```javascript
const CROP_DATA = {
    rice_spring: {
        name: '早稻', emoji: '🌾',
        seedPrice: 50, baseYield: 500, growDays: 5, seedlingDays: 1,
        season: 'spring', type: 'rice',
        steps: ['育苗', '移栽', '除草', '施肥', '收割'],
        stepCosts: [10, 15, 12, 8, 18]
    },
    rice_summer: {
        name: '晚稻', emoji: '🌾',
        seedPrice: 55, baseYield: 450, growDays: 4, seedlingDays: 1,
        season: 'summer', type: 'rice',
        steps: ['育苗', '移栽', '除草', '施肥', '收割'],
        stepCosts: [10, 15, 12, 8, 18]
    },
    sweet_spring: {
        name: '春薯', emoji: '🍠',
        seedPrice: 60, baseYield: 1200, growDays: 10, seedlingDays: 1,
        season: 'spring', type: 'sweet',
        steps: ['起垄', '移栽', '除草', '翻藤1', '翻藤2', '施肥', '收割'],
        stepCosts: [12, 15, 12, 10, 10, 8, 18]
    },
    sweet_autumn: {
        name: '秋薯', emoji: '🍠',
        seedPrice: 70, baseYield: 1100, growDays: 8, seedlingDays: 1,
        season: 'autumn', type: 'sweet',
        steps: ['起垄', '移栽', '除草', '翻藤1', '翻藤2', '施肥', '收割'],
        stepCosts: [12, 15, 12, 10, 10, 8, 18]
    }
};
```

| 作物键 | 名称 | 季节 | 种子价 | 基础亩产 | 生长周期 | 类型 | 阶段数 |
|--------|------|------|--------|----------|----------|------|--------|
| rice_spring | 早稻 | 春 | 50 | 500斤 | 5天 | 水稻 | 5 |
| rice_summer | 晚稻 | 夏 | 55 | 450斤 | 4天 | 水稻 | 5 |
| sweet_spring | 春薯 | 春 | 60 | 1200斤 | 10天 | 红薯 | 7 |
| sweet_autumn | 秋薯 | 秋 | 70 | 1100斤 | 8天 | 红薯 | 7 |

### 2.2 生长阶段（stage字段）

```javascript
// 水稻阶段
idle → preparing → seedling(育苗) → transplanting(返青) → growing(分蘖) → mature(成熟)

// 红薯阶段
idle → preparing → seedling(发芽) → transplanting(幼苗) → growing(藤蔓) → mature(成熟)
// 额外：turnedVine1, turnedVine2（翻藤标记）
```

### 2.3 季节作物映射（autoPlay使用）

```javascript
const seasonCrops = {
    spring: 'rice_spring',
    summer: 'rice_summer',
    autumn: 'sweet_autumn',
    winter: null  // 冬季不种田
};
```

---

## 3. 副业/加工系统（PROCESSING_DATA, line ~3181-3236）

### 3.1 加工设施配置

```javascript
const PROCESSING_DATA = {
    riceMill: {
        id: 'riceMill',
        name: '石磨碾米', emoji: '🏭',
        buildCost: 150, buildStaminaCost: 15,
        unlockCondition: '作物熟悉度Lv2或攒够2000块钱',
        inputCrop: 'rice', inputAmount: 10,
        outputItem: 'riceGrain', outputAmount: 10,
        dailyCapacity: 20, workStaminaCost: 8, workTimeHours: 2
    },
    sweetPotatoDry: {
        id: 'sweetPotatoDry',
        name: '晒红薯干', emoji: '🌞',
        buildCost: 50, buildStaminaCost: 10,
        unlockCondition: '作物熟悉度Lv2或攒够2000块钱',
        inputCrop: 'sweet', inputAmount: 10,
        outputItem: 'driedSweetPotato', outputAmount: 6,
        dailyCapacity: 25, workStaminaCost: 5, workTimeHours: 1
    }
};
```

### 3.2 农副产品配置

```javascript
const PROCESSED_ITEMS = {
    riceGrain: {
        id: 'riceGrain', name: '糙米', emoji: '🍚',
        basePrice: 1.8,  // 售价 = 水稻季节价 × 1.8
        type: 'processed'
    },
    driedSweetPotato: {
        id: 'driedSweetPotato', name: '红薯干', emoji: '🍠',
        basePrice: 3.0,  // 售价 = 红薯季节价 × 3.0
        type: 'processed'
    }
};
```

### 3.3 加工解锁条件（函数：`isProcessingUnlocked`, line ~13150）

```javascript
function isProcessingUnlocked(key) {
    const cropSkillLevel = game.skills?.cropFamiliarity?.level || 0;
    const totalAssets = game.money + calculateCropValue();
    return cropSkillLevel >= 2 || totalAssets >= 2000;
}
```

**注意**：`calculateCropValue()` 按当前季节价格估算库存作物价值。

### 3.4 自动加工逻辑（`processDailyProcessing`, line ~12997）

- 每日自动执行（`nextDay` 中调用）
- 加工上限受 `dailyCapacity` 限制，可被科技和建筑加成：
  - `processingSpeed` 科技加成
  - `processingSpeed` 建筑加成（如晒场）
- 每批次消耗 `workStaminaCost` 体力
- 概率事件（见line ~13047-13078）：
  - 15% 质量特别好：产出+20%
  - 10% 加工失误：产出-10%
  - 10% 省时省力：返还30%体力
  - 5% 灵感爆发：额外产出+15%，作物熟悉度经验+2
  - 3% 设备故障：多消耗20%体力

---

## 4. 技能系统（line ~3435-3660）

### 4.1 技能升级经验表

```javascript
const SKILL_EXP_TABLE = [0, 30, 110, 260, 510, 910, 1510, 2310, 3510, 5310, 7810];
// 对应等级： Lv0  Lv1  Lv2   Lv3   Lv4   Lv5   Lv6   Lv7   Lv8   Lv9   Lv10
```

每级升级后，下一级所需经验为当前 `expNeeded * 1.5`（手动阅读时）。

### 4.2 技能配置与效果

```javascript
const SKILL_EFFECTS = {
    cropFamiliarity: {
        name: '作物熟悉度', emoji: '🌾',
        effects: [
            'Lv1：基础产量+5%，补种成活率+10%',
            'Lv2：解锁进阶档田地',
            'Lv3：红薯甜度+5%，病害-10%',
            'Lv4：翻藤操作解锁（红薯产量+15%）',
            'Lv5：解锁高产品种+20%，解锁精英档田地',
            'Lv7：品质概率+10%',
            'Lv8：解锁终极档田地',
            'Lv10：改良品种+30%产量+20%售价'
        ]
    },
    fieldManagement: {
        name: '田间管理', emoji: '🌧️',
        effects: [
            'Lv1：偷采、小孩破坏-10%',
            'Lv3：简易灾害预警，排水体力-20%',
            'Lv5：全自然灾害提前1天预警，损失-30%',
            'Lv7：人为事件损失-50%',
            'Lv10：台风暴雨无减产，人为破坏零损失'
        ]
    },
    toolMastery: {
        name: '农具精通', emoji: '🔧',
        effects: [
            'Lv1：所有农具体力-5%',
            'Lv3：解锁进阶农具，成本-10%',
            'Lv5：可自制农具，维修-30%',
            'Lv6：解锁高级农具（水车、秧马）',
            'Lv10：高级农具免费租赁，效果+20%'
        ]
    },
    composting: {
        name: '堆肥技术', emoji: '💩',
        effects: [
            'Lv1：成功率+10%，周期-1天',
            'Lv3：有机肥增产+2%',
            'Lv5：解锁热堆肥，成功率大幅提升',
            'Lv7：材料种类增加，肥效+5%',
            'Lv10：最大增产+8%，成功率100%'
        ]
    }
};
```

### 4.3 技能分支选择（5级和10级）

```javascript
const SKILL_BRANCHES = {
    cropFamiliarity: {
        5: [
            { id: 'yield', name: '高产专家', effect: { yieldBonus: 0.10 } },
            { id: 'quality', name: '品质专家', effect: { sellBonus: 0.15 } }
        ],
        10: [
            { id: 'master', name: '农艺大师', effect: { yieldBonus: 0.15, sellBonus: 0.10 } },
            { id: 'speed', name: '速生专家', effect: { growSpeed: 1 } }
        ]
    },
    toolMastery: {
        5: [
            { id: 'efficient', name: '省力专家', effect: { staminaCost: 0.15 } },
            { id: 'durable', name: '耐久专家', effect: { toolEffect: 0.20 } }
        ],
        10: [
            { id: 'master', name: '工具大师', effect: { staminaCost: 0.20, toolEffect: 0.15 } },
            { id: 'innovator', name: '发明家', effect: { newTools: true } }
        ]
    }
};
```

### 4.4 技能经验获取途径

| 操作 | 技能 | 经验值 |
|------|------|--------|
| 浇水 | fieldManagement | +2 |
| 除草 | fieldManagement | +3 |
| 施肥 | fieldManagement | +2 |
| 收割 | cropFamiliarity | +3（原为5，已改为3） |
| 翻藤 | cropFamiliarity | +3 |
| 看书（read） | 随机技能 | +1~2 |
| 加工灵感爆发 | cropFamiliarity | +2 |
| 堆肥收获 | composting | +10 |

---

## 5. 建筑系统（BUILDING_DATA, line ~3745-3858）

### 5.1 所有建筑配置

```javascript
const BUILDING_DATA = {
    granary: {
        id: 'granary', name: '仓棚', emoji: '🏠', category: 'storage',
        cost: 150,
        effect: { storageBonus: 750 },
        maxLevel: 3,
        upgradeCost: [100, 200, 350],
        upgradeEffect: [750, 1200, 1800]
    },
    dryingYard: {
        id: 'dryingYard', name: '晒场', emoji: '🌞', category: 'processing',
        cost: 100,
        effect: { processingSpeed: 0.30, dryYield: 0.15 },
        maxLevel: 2,
        upgradeCost: [80, 150],
        upgradeEffect: [0.30, 0.50]
    },
    well: {
        id: 'well', name: '水井', emoji: '💦', category: 'farming',
        cost: 200,
        effect: { waterStaminaReduce: 0.35 },
        maxLevel: 2,
        upgradeCost: [150, 250],
        upgradeEffect: [0.35, 0.50]
    },
    toolShed: {
        id: 'toolShed', name: '农具棚', emoji: '🔧', category: 'tools',
        cost: 100,
        effect: { toolEffectBonus: 0.20 },
        maxLevel: 2,
        upgradeCost: [80, 150],
        upgradeEffect: [0.20, 0.35]
    },
    greenhouse: {
        id: 'greenhouse', name: '温室大棚', emoji: '🏠', category: 'farming',
        cost: 800,
        effect: { seasonImmunity: 0.5, growSpeedBonus: 0.25 },
        maxLevel: 2,
        upgradeCost: [800, 1500],
        upgradeEffect: [0.25, 0.45]
    },
    irrigation: {
        id: 'irrigation', name: '滴灌系统', emoji: '💧', category: 'farming',
        cost: 1200,
        effect: { waterStaminaReduce: 0.50, waterEfficiency: 0.30 },
        maxLevel: 2,
        upgradeCost: [1200, 2500],
        upgradeEffect: [0.50, 0.70]
    },
    tractor: {
        id: 'tractor', name: '手扶拖拉机', emoji: '🚜', category: 'tools',
        cost: 5000,
        effect: { harvestSpeedBonus: 0.40, plowSpeedBonus: 0.50 },
        maxLevel: 1,
        upgradeCost: [],
        upgradeEffect: []
    },
    coldStorage: {
        id: 'coldStorage', name: '冷库', emoji: '❄️', category: 'storage',
        cost: 3500,
        effect: { storageBonus: 2000, cropPreserve: 0.90 },
        maxLevel: 1,
        upgradeCost: [],
        upgradeEffect: []
    }
};
```

### 5.2 建筑分类

```javascript
const BUILDING_CATEGORIES = {
    storage: { name: '仓储设施', emoji: '📦' },
    processing: { name: '加工设施', emoji: '🔧' },
    farming: { name: '农耕设施', emoji: '🌾' },
    tools: { name: '农具设施', emoji: '🔧' }
};
```

### 5.3 建造限制

```javascript
// 每日建造限制（但代码中 buildBuilding 函数未检查此限制！）
game.buildingsToday = { day: game.day, count: 0 };
```

---

## 6. 事件系统

### 6.1 随机事件（EVENTS, line ~4579-5200+）

#### 事件类型分布

| 类型 | 事件ID | 名称 | 季节 | 基础概率 | 触发条件 |
|------|--------|------|------|----------|----------|
| disaster | drought | 持续干旱 | 春/夏/秋 | 0.05 | 需有作物 |
| disaster | rainstorm | 暴雨内涝 | 春/夏 | 0.04 | 需有作物 |
| disaster | pest | 病虫害 | 春/夏/秋 | 0.05 | 需有作物 |
| disaster | heatwave | 高温热害 | 夏 | 0.03 | 需有作物 |
| disaster | coldDew | 寒露风 | 秋 | 0.03 | 需有作物 |
| disaster | continuousRain | 连阴雨 | 春/夏 | 0.03 | 需有作物 |
| disaster | hail | 冰雹灾害 | 夏 | 0.02 | 需有作物 |
| disaster | lateSpringCold | 倒春寒 | 春 | 0.03 | 需有作物 |
| gain | timelyRain | 及时雨 | 春/夏 | 0.06 | 需有作物 |
| gain | sunnyDay | 风和日丽 | 春/夏/秋 | 0.08 | 需有作物 |
| gain | bumperHarvest | 瑞雪兆丰年 | 冬 | 0.05 | - |
| gain | morningDew | 晨露滋润 | 春/夏 | 0.05 | 需有作物 |
| gain | fireflies | 萤火虫之夜 | 夏 | 0.04 | - |
| human | theft | 偷菜贼 | 春/夏/秋 | 0.03 | 需有作物 |
| human | villageChiefVisit | 村长慰问 | 全年 | 0.03 | - |
| human | kidTrample | 熊孩子捣蛋 | 春/夏/秋 | 0.04 | 需有作物 |
| human | auntGift | 张婶送菜 | 全年 | 0.03 | - |
| human | strayCat | 流浪猫造访 | 全年 | 0.03 | - |
| human | oldFarmerAdvice | 老农指点 | 春/夏/秋 | 0.03 | - |
| human | rainbow | 雨后彩虹 | 春/夏 | 0.05 | - |
| human | birdNest | 喜鹊筑巢 | 春 | 0.04 | - |
| human | marketBoom | 粮价上涨 | 秋/冬 | 0.03 | - |
| human | tiredDay | 疲惫的一天 | 春/夏/秋 | 0.04 | - |
| human | findTreasure | 意外发现 | 春/夏/秋 | 0.02 | - |

#### 事件概率修正

```javascript
// 灾难/人为事件受 disasterRate 影响
game.disasterRate: easy=0.6, normal=1.0, hard=1.5

// 宠物减益
petTheftReduction: 宠物"防盗"效果（大黄）
pestReduction: 科技/建筑减虫效果
```

### 6.2 事件触发限制（line ~7264-7269）

```javascript
const eventChance = 0.5 + (game.dailyBuffs?.eventChance || 0);  // 基础50%，清明+30%
if (!game.currentEvent && Math.random() < eventChance && (game.eventsToday || 0) < 2) {
    triggerRandomEvent();
    game.eventsToday = (game.eventsToday || 0) + 1;
}
```

**⚠️ BUG/注意**：`eventsToday < 2` 意味着每天最多触发 **2个** 随机事件（加上 pending 事件链可能更多）。但用户期望的是 `≤ 1`。此限制在 `nextDay()` 中重置为 0。

### 6.3 夜间事件（NIGHT_EVENTS, line ~4464-4577）

| 事件 | 类型 | 效果 | 概率 | 特殊条件 |
|------|------|------|------|----------|
| 赏月 | good | 体力+10 | 0.15 | - |
| 虫鸣 | good | 体力+8, 健康+1 | 0.12 | - |
| 流星 | good | 声望+2 | 0.05 | - |
| 夜雨 | good | 体力+12 | 0.10 | 需雨天 |
| 萤火虫 | good | 声望+3 | 0.08 | 需夏天 |
| 老鼠 | bad | 稻谷-5 | 0.08 | - |
| 狗叫 | bad | 体力恢复-10 | 0.10 | - |
| 失眠 | bad | 体力恢复-15, 健康-1 | 0.08 | - |
| 张婶送汤 | good | 健康+1, 体力+5 | 0.06 | 需张婶好感≥10 |
| 夜读 | neutral | 技能经验+3, 体力-5 | 0.10 | - |
| 满天星 | good | 体力+6, 声望+1 | 0.12 | - |
| 打雷 | bad | 体力恢复-8 | 0.07 | 需雨天 |

夜间事件触发：30%概率（`Math.random() > 0.3` 则跳过），前3天保护。

### 6.4 故事事件链（STORY_EVENTS, line ~7354-9150+）

故事事件通过 `pendingEvents` 队列管理，按 `triggerDay` 和 `condition` 触发。例如：

```javascript
// 孙妙青事件链
{ eventId: 'suxiao_umbrella', triggerDay: 15, condition: (g) => g.npcs.suxiao >= 30 }
{ eventId: 'suxiao_repair_desk', triggerDay: 5, condition: (g) => g.npcs.suxiao >= 15 }
{ eventId: 'suxiao_sick', triggerDay: 25, condition: (g) => g.npcs.suxiao >= 40 }
{ eventId: 'suxiao_confession', triggerDay: 60, condition: (g) => g.npcs.suxiao >= 80 }
```

---

## 7. NPC系统（NPC_DATA, line ~3493-3608）

### 7.1 NPC基础数据

```javascript
const NPC_DATA = {
    wangcunzhang: { name: '王保国', title: '村长', emoji: '👨‍💼', canHire: false, birthday: 15 },
    lilaonong: { name: '李德根', title: '李老农', emoji: '👴', canHire: true, hireFriendship: 60, hireFee: 200, dailyWage: 60, skills: ['water','weed'], efficiency: 1.2, birthday: 55 },
    zhangshen: { name: '张桂兰', title: '张婶', emoji: '👩', canHire: true, hireFriendship: 40, hireFee: 100, dailyWage: 40, skills: ['water','weed'], efficiency: 1.0, birthday: 25 },
    wangerdan: { name: '王二蛋', title: '二蛋', emoji: '👦', canHire: true, hireFriendship: 20, hireFee: 50, dailyWage: 20, skills: ['water'], efficiency: 0.8, birthday: 40 },
    zhaolaoban: { name: '赵有财', title: '赵老板', emoji: '🧑‍💼', canHire: false, birthday: 15 },
    laoyufu: { name: '老渔夫', title: '渔夫', emoji: '🎣', canHire: false, birthday: 25 },
    linxiaoyu: { name: '林晓雨', title: '支教老师', emoji: '👩‍🏫', canHire: false, birthday: 45 },
    suxiao: { name: '孙妙青', title: '村医', emoji: '👩‍⚕️', canHire: false, birthday: 20 },
    chenyang: { name: '陈阳', title: '返乡青年', emoji: '👨‍💻', canHire: false, birthday: 50 },
    zhoudachu: { name: '周大柱', title: '大厨', emoji: '👨‍🍳', canHire: true, hireFriendship: 50, hireFee: 150, dailyWage: 50, skills: ['cooking'], efficiency: 1.5, birthday: 30 }
};
```

### 7.2 NPC好感度里程碑（NPC_MILESTONES, line ~3696）

每个NPC有4个里程碑（20/40/60/90好感度）：

| NPC | Lv1(20) | Lv2(40) | Lv3(60) | Lv4(90) |
|-----|---------|---------|---------|---------|
| 王村长 | 声望+10% | 声望+20% | 声望+30% | 声望+50% |
| 李老农 | 作物经验+10% | 作物经验+20% | 作物经验+30% | 作物经验+50% |
| 张婶 | 体力恢复+5% | 体力恢复+10% | 体力恢复+15% | 体力恢复+25% |
| 王二蛋 | 聊天好感+10% | 聊天好感+20% | 聊天好感+30% | 聊天好感+50% |
| 赵老板 | 售价+2% | 售价+5% | 售价+8% | 售价+10% |
| 老渔夫 | 钓鱼+10% | 钓鱼+20% | 钓鱼+30% | 钓鱼+50% |
| 林晓雨 | 健康+10% | 健康+20% | 健康+30% | 健康+50% |
| 孙妙青 | 采集+10% | 采集+20% | 采集+30% | 采集+50% |
| 陈阳 | 售价+2% | 售价+5% | 售价+8% | 售价+10% |
| 周大柱 | 烹饪+10% | 烹饪+20% | 烹饪+30% | 烹饪+50% |

### 7.3 NPC专属任务链（NPC_QUEST_CHAINS, line ~7114）

```javascript
const NPC_QUEST_CHAINS = {
    zhangshen: [
        { threshold: 20, reward: { money: 50, favor: 10 } },
        { threshold: 50, reward: { money: 100, favor: 15 } },
        { threshold: 80, reward: { money: 200, favor: 20, skill: 'cropFamiliarity', exp: 50 } }
    ],
    lilaonong: [
        { threshold: 20, reward: { money: 30, favor: 10, skill: 'cropFamiliarity', exp: 20 } },
        { threshold: 50, reward: { money: 80, favor: 15, skill: 'composting', exp: 30 } },
        { threshold: 80, reward: { money: 150, favor: 20, skill: 'cropFamiliarity', exp: 100 } }
    ],
    wangcunzhang: [
        { threshold: 20, reward: { money: 60, favor: 10 } },
        { threshold: 50, reward: { money: 120, favor: 15 } },
        { threshold: 80, reward: { money: 300, favor: 20 } }
    ],
    wangerdan: [
        { threshold: 20, reward: { money: 20, favor: 10 } },
        { threshold: 50, reward: { money: 50, favor: 15 } },
        { threshold: 80, reward: { money: 100, favor: 20 } }
    ]
};
```

---

## 8. 扩地/田地系统

### 8.1 初始状态

- 初始田地数：**1块**
- 初始仓库容量：**2000斤**
- 所有新田默认等级：**'新手档'**

### 8.2 扩地解锁条件（`rentNewField`, line ~15014）

```javascript
function getNextFieldRent() {
    const baseRent = 200;
    const n = game.fields.length + 1;
    return Math.floor(baseRent * Math.pow(1.18, n - 1));
}
```

| 田块数 | 租金计算公式 | 近似值 | 天数阈值（autoPlay） | 资金阈值（autoPlay） |
|--------|--------------|--------|----------------------|----------------------|
| 2 | 200 × 1.18¹ | 236 | 3 | rent × 1.5 |
| 3 | 200 × 1.18² | 278 | 8 | rent × 1.5 |
| 4 | 200 × 1.18³ | 328 | 15 | rent × 1.5 |
| 5 | 200 × 1.18⁴ | 387 | 25 | rent × 1.5 |
| 6 | 200 × 1.18⁵ | 457 | 40 | rent × 1.5 |
| 7 | 200 × 1.18⁶ | 539 | 60 | rent × 1.5 |
| 8 | 200 × 1.18⁷ | 636 | 80 | rent × 1.5 |
| 9 | 200 × 1.18⁸ | 751 | 100 | rent × 1.5 |
| 10 | 200 × 1.18⁹ | 886 | 120 | rent × 1.5 |
| 11 | 200 × 1.18¹⁰ | 1046 | 150 | rent × 1.5 |
| 12 | 200 × 1.18¹¹ | 1234 | 180 | rent × 1.5 |

autoPlay扩地天数阈值数组：`[0, 3, 8, 15, 25, 40, 60, 80, 100, 120, 150, 180]`

### 8.3 田地等级加成（`harvestCrop`, line ~14551）

```javascript
const levelBonus = { '新手档': 1.0, '进阶档': 1.15, '精英档': 1.35, '终极档': 1.6 };
```

**⚠️ 严重BUG**：虽然技能描述中 Lv2/Lv5/Lv8 分别解锁进阶档/精英档/终极档田地，但代码中：
- `initGame` 创建初始田：`level: '新手档'`
- `rentNewField` 创建新田：`level: '新手档'`
- **没有任何函数修改 `field.level` 的值**

这意味着所有田地永远是 **新手档**（1.0倍），技能解锁的高级田档位从未实际生效。

---

## 9. 商店系统

### 9.1 可购买物品（`renderItemsTab`, line ~11014）

| 物品 | 价格 | 效果 |
|------|------|------|
| 化肥 | 50元 | 作物产量+5% |
| 农药 | 80元 | 治疗病虫害 |
| 肉包子 | 20元 | 体力+20，健康+5 |
| 感冒药 | 100元 | 健康+30 |

### 9.2 种子价格（`renderSeedsTab`）

| 种子 | 基础价格 | `getSeedPrice` 折扣后 |
|------|----------|----------------------|
| 早稻(rice_spring) | 50 | 50 × (1 - shopDiscount) |
| 晚稻(rice_summer) | 55 | 55 × (1 - shopDiscount) |
| 春薯(sweet_spring) | 60 | 60 × (1 - shopDiscount) |
| 秋薯(sweet_autumn) | 70 | 70 × (1 - shopDiscount) |

### 9.3 作物售价（`getSeasonPrice`, line ~15067）

```javascript
const basePrices = { rice: 6.0, sweet: 3.5 };
const fluctuations = {
    rice:  { spring: 1.1, summer: 1.0, autumn: 0.85, winter: 1.05 },
    sweet: { spring: 1.0, summer: 1.0, autumn: 0.9,  winter: 1.25 }
};
```

| 作物 | 春 | 夏 | 秋 | 冬 |
|------|-----|-----|-----|-----|
| 水稻 | 6.6 | 6.0 | 5.1 | 6.3 |
| 红薯 | 3.5 | 3.5 | 3.15 | 4.375 |

### 9.4 加工品售价

| 加工品 | 计算公式 |
|--------|----------|
| 糙米 | `getSeasonPrice('rice') × 1.8` |
| 红薯干 | `getSeasonPrice('sweet') × 3.0` |

### 9.5 礼物（`renderGiftsTab`, line ~11043）

| 礼物 | 价格 | 目标人群 |
|------|------|----------|
| 粗点心 | 10元 | 小孩 |
| 散装白酒 | 50元 | 老头 |
| 花布头 | 30元 | 妇女 |
| 红糖 | 40元 | 通用 |
| 香烟 | 60元 | 男人 |

---

## 10. 日常活动系统

### 10.1 手动日常活动限制

| 活动 | 函数 | 每日次数 | 体力消耗 | 效果 |
|------|------|----------|----------|------|
| 锻炼 | `doExercise()` | 1 | 8 | 健康+2 |
| 串门 | `doChat()` | 2 | 10 | 随机NPC好感+1~3 |
| 钓鱼 | `doFish()` | 1 | 12 | 获得随机鱼 |
| 看书 | `doRead()` | 1 | 10 | 随机技能经验+1~2 |

**注意**：`DAILY_ACTIVITIES` 配置对象（line ~3141）定义了 `dailyLimit: 2` 锻炼、`dailyLimit: 3` 串门等，但实际函数 `doExercise` 限制为1，`doChat` 限制为2。配置与实现不一致。

### 10.2 自动日常活动（`autoPlayTick`）

```javascript
// 自动锻炼：每天1次，消耗5体力（比手动少！）
if ((game.dailyActions.exercise || 0) < 1 && game.stamina >= 8) {
    // healthGain = random(2~4) + 20%额外+2
}

// 自动串门：每天2次，消耗5体力
if ((game.dailyActions.chat || 0) < 2 && game.stamina >= 10) {
    // favorGain = random(1~3)，生日×3
}

// 自动钓鱼：每天1次
if ((game.dailyActions.fish || 0) < 1 && game.stamina >= 12) {
    // 自动选择最优钓点和鱼饵
}
```

---

## 11. UI/交互配置

### 11.1 页签解锁配置（TAB_UNLOCK_CONFIG, line ~10578）

```javascript
const TAB_UNLOCK_CONFIG = {
    fields:     { day: 1,  name: '田地管理' },
    shop:       { day: 1,  name: '商店' },
    player:     { day: 1,  name: '角色属性' },
    tools:      { day: 2,  name: '农具商店' },
    npcs:       { day: 2,  name: '村民' },
    house:      { day: 3,  name: '房屋租赁' },
    skills:     { day: 3,  name: '技能树' },
    compost:    { day: 5,  name: '堆肥工坊' },
    foraging:   { day: 5,  name: '后山采集' },
    pets:       { day: 5,  name: '宠物' },
    buildings:  { day: 7,  name: '农家设施' },
    processing: { day: 10, money: 500, name: '农家副业' },
    tech:       { day: 15, name: '农技研究' },
    pond:       { day: 8,  name: '小鱼塘' }
};
```

### 11.2 状态显示区域（Top Bar）

| 数据 | 元素ID | 示例值 |
|------|--------|--------|
| 金钱 | `stat-money` | 764 |
| 体力 | `stat-stamina` | 159 |
| 最大体力 | `stat-max-stamina` | 200 |
| 健康 | `stat-health` | 200 |
| 最大健康 | `stat-max-health` | 200 |
| 水稻库存 | `stat-rice` | 400 |
| 红薯库存 | `stat-sweet` | 9567 |
| 天数 | `stat-day` | 49 |
| 季节 | `stat-season` | 秋季 |
| 季节图标 | `season-icon` | 🍂 |
| 天气 | `stat-weather` | 小雨 |
| 天气图标 | `weather-icon` | 🌦️ |

### 11.3 日志显示区域

```html
<div class="event-log" id="event-log">
    <div class="event-log-header">
        <div class="event-log-title">📜 事件日志</div>
        <button class="event-log-expand-btn" onclick="toggleLogExpand()">🔍 展开查看</button>
    </div>
    <!-- 动态插入 .log-item -->
</div>
```

日志类型（`addLog` 函数）：
- `good` → 绿色 ✨
- `bad` → 红色 ⚠️
- `info` → 蓝色 💡
- `crop` → 绿色 🌾
- `npc` → 灰色 👤
- `pet` → 棕色 🐾
- 默认 → 普通 📝

**日志限制**：最多保留200条，超出删除最早条目。

---

## 12. 自动运行（autoPlay）配置

### 12.1 游戏速度配置（line ~6518-6588）

```javascript
let gameSpeed = 1; // 1x, 2x, 3x, 5x
const baseInterval = 5000; // 5秒 = 1游戏小时（1倍速）
const interval = baseInterval / gameSpeed;
// 1倍速：5秒/小时，一天游戏时间 = 18小时（6:00-24:00）= 90秒/天
// 5倍速：1秒/小时，一天 = 18秒/天
```

### 12.2 autoPlayTick 核心逻辑（line ~6689-7019）

```javascript
function autoPlayTick() {
    // 1. 自动关闭弹窗（最高优先级）
    // 2. 体力保护：stamina < 15 时只做最低限度事情
    
    // 3. 冬季跳过种田，只做日常活动
    // 4. 非冬季种田循环：
    //    a. 成熟 → 收割（最高优先级）
    //    b. idle → 整地（prepared=false）
    //    c. idle + prepared → 买种子 + 育苗
    //    d. seedling → 移栽
    //    e. growing → 浇水(3天未浇) → 除草(10天未除) → 施肥 → 翻藤
    
    // 5. 出售策略：
    //    a. 早上(time=6) 库存≥40% 且 >100斤 → 卖水稻35%容量
    //    b. 资金<200 → 先卖加工品，再卖原始作物
    //    c. 资金<100 且无库存 → 等待恢复
    
    // 6. 扩地：fields.length < 12，满足天数+资金+体力条件
    
    // 7. 日常活动：
    //    a. 锻炼（1次/天）
    //    b. 串门（2次/天）
    //    c. 钓鱼（1次/天）
}
```

### 12.3 自动种田详细逻辑

| 阶段 | 触发条件 | 体力要求 | 操作 |
|------|----------|----------|------|
| 收割 | `stage === 'mature'` | ≥20 | `harvestCrop(i)` |
| 整地 | `stage === 'idle' && !prepared` | ≥15 | `prepareField(i)` |
| 育苗 | `idle && prepared && 有种子` | ≥10 | `plantCrop(i, currentSeasonCrop)` |
| 移栽 | `stage === 'seedling'` | ≥18 | `transplantCrop(i)` |
| 浇水 | `day - lastWaterDay >= 3` | ≥8 | `waterField(i)` |
| 除草 | `day - lastWeedDay >= 10` | ≥15 | `weedField(i)` |
| 施肥 | `!fertilized && step >= 2` | ≥12 | `fertilizeField(i, 'organic')` 或 `'normal'` |
| 翻藤1 | `sweet && growDays >= 30 && !turnedVine1` | ≥13 | `turnVine(i, 1)` |
| 翻藤2 | `sweet && growDays >= 60 && turnedVine1` | ≥13 | `turnVine(i, 2)` |

### 12.4 自动出售逻辑

```javascript
// 策略1：清库（每天早上6点，库存≥40%）
if (game.time === 6 && storageRatio >= 0.4 && totalStorage > 100) {
    if (rice > 100) sellCrop('rice', min(rice, storageCap * 0.35));
    if (sweet > 50) sellCrop('sweet', min(sweet, storageCap * 0.25));
}

// 策略2：紧急（资金<200）
if (game.money < 200) {
    if (riceGrain > 20) sellProcessedItem('riceGrain', min(100, riceGrain));
    if (driedSweetPotato > 10) sellProcessedItem('driedSweetPotato', min(50, driedSweetPotato));
    if (rice > 200) sellCrop('rice', min(500, rice));
    if (sweet > 100) sellCrop('sweet', min(300, sweet));
}
```

### 12.5 自动扩地逻辑

```javascript
const dayThresholds = [0, 3, 8, 15, 25, 40, 60, 80, 100, 120, 150, 180];
const requiredDay = dayThresholds[game.fields.length] || 999;
const moneyThreshold = getNextFieldRent() * 1.5;
const staminaRatio = game.stamina / game.maxStamina;

if (game.money >= moneyThreshold && game.day >= requiredDay && staminaRatio >= 0.3) {
    rentNewField();
}
```

---

## 13. 已发现的Bug与配置矛盾

### 13.1 🔴 严重：田地等级系统未实现

- **描述**：`SKILL_EFFECTS` 中作物熟悉度 Lv2/Lv5/Lv8 分别解锁"进阶档/精英档/终极档"田地，加成分别为1.15/1.35/1.6倍。
- **实际**：`initGame` 和 `rentNewField` 中所有田地 `level: '新手档'`，且代码中没有任何函数修改 `field.level`。
- **影响**：所有田地永远只有1.0倍产量，技能解锁的高级田档位完全无效。
- **位置**：`initGame` line 5640, `rentNewField` line 15025, `harvestCrop` line 14551

### 13.2 🟡 事件限制不符预期

- **描述**：用户要求 `eventsToday ≤ 1`
- **实际代码**：`if ((game.eventsToday || 0) < 2)` 允许每天最多2个随机事件，加上 pending 故事事件可能更多。
- **位置**：`nextDay` line 7267

### 13.3 🟡 日常活动配置与实现不一致

- **描述**：`DAILY_ACTIVITIES` 配置中 `exercise.dailyLimit = 2`, `visit.dailyLimit = 3`
- **实际实现**：`doExercise` 限制为1次，`doChat` 限制为2次，`doFish` 限制为1次，`doRead` 限制为1次。
- **位置**：`DAILY_ACTIVITIES` line 3141, `doExercise` line 6107, `doChat` line 6118

### 13.4 🟡 建筑建造限制未执行

- **描述**：`game.buildingsToday` 存在每日建造计数，但 `buildBuilding` 函数未检查 `buildingsToday.count` 限制。
- **影响**：理论上可以无限建造，只是每天重置计数器。
- **位置**：`buildBuilding` line 13400, `nextDay` line 7315

### 13.5 🟡 初始模式描述与代码不一致

- **描述**：UI上 easy/normal/hard 的初始健康/体力显示为 100/120，但 `initGame` 中实际为 200/200（easy/normal）和 220/220（hard）。
- **位置**：HTML mode-stats line 1864-1868, 1879-1883, 1894-1898 vs `initGame` line 5620-5623

### 13.6 🟡 加工解锁条件文字与实际代码不符

- **描述**：PROCESSING_DATA 中 `unlockCondition: '作物熟悉度Lv2或攒够2000块钱'`
- **实际代码**：`isProcessingUnlocked` 检查 `cropSkillLevel >= 2 || totalAssets >= 2000`（总资产 = 现金 + 库存作物价值）。
- **注意**：文字描述基本准确，但"2000块钱"应理解为"总资产2000"。

---

## 附录：关键函数索引

| 功能 | 函数名 | 行号 |
|------|--------|------|
| 游戏初始化 | `initGame(mode)` | ~5618 |
| 选择模式 | `selectMode(mode)` | ~5600 |
| 主循环 | `gameTick()` | ~6650 |
| 设置速度 | `setGameSpeed(speed)` | ~6520 |
| 自动运行 | `autoPlayTick()` | ~6689 |
| 下一天 | `nextDay()` | ~7200 |
| 收割 | `harvestCrop(fieldIdx)` | ~14530 |
| 浇水 | `waterField(fieldIdx)` | ~14320 |
| 除草 | `weedField(fieldIdx)` | ~14370 |
| 施肥 | `fertilizeField(fieldIdx, type)` | ~14417 |
| 翻藤 | `turnVine(fieldIdx, n)` | ~14470 |
| 买种子 | `buySeed(seedKey)` | ~14820 |
| 出售作物 | `sellCrop(cropKey, amount)` | ~14730 |
| 出售加工品 | `sellProcessedItem(itemKey, amount)` | ~13174 |
| 建造加工坊 | `buildProcessing(key)` | ~13105 |
| 自动加工 | `processDailyProcessing()` | ~12997 |
| 建造建筑 | `buildBuilding(buildingId)` | ~13400 |
| 升级建筑 | `upgradeBuilding(buildingId)` | ~13434 |
| 租用新田 | `rentNewField()` | ~15014 |
| 获取田租 | `getNextFieldRent()` | ~15059 |
| 获取季节价格 | `getSeasonPrice(cropKey)` | ~15067 |
| 获取种子价格 | `getSeedPrice(basePrice)` | ~13475 |
| 添加技能经验 | `addSkillExp(skillKey, amount)` | ~12676 |
| 检查加工解锁 | `isProcessingUnlocked(key)` | ~13150 |
| 触发随机事件 | `triggerRandomEvent()` | ~9290 |
| 触发夜间事件 | `triggerNightEvent()` | ~9388 |
| 添加日志 | `addLog(text, type)` | ~15307 |
| 更新UI | `updateUI()` | ~9900 |
| 保存游戏 | `saveGame()` | ~6260 |
| 加载游戏 | `loadGame()` | ~6330 |
| 锻炼 | `doExercise()` | ~6106 |
| 串门 | `doChat()` | ~6117 |
| 钓鱼 | `doFish()` | ~6140 |
| 看书 | `doRead()` | ~6169 |
| 与NPC对话 | `chatWithNpc(npcKey)` | ~13483 |
| 雇佣工人 | `hireWorker(npcKey)` | ~12869 |
| 解雇工人 | `fireWorker(npcKey)` | ~（未找到完整定义） |
| 更新页签锁定 | `updateTabLockStatus()` | ~10596 |
| 渲染田地 | `renderFields()` | ~10600 |
| 渲染商店 | `renderShop()` | ~10890 |
| 渲染建筑 | `renderBuildingPanel()` | ~12590 |
| 渲染技能 | `renderSkillsPanel()` | ~12420 |
| 渲染NPC | `renderNpcsPanel()` | ~12780 |
| 渲染加工 | `renderProcessingPanel()` | ~11370 |
| 计算资产 | `calculateTotalAssets()` | ~14797 |
| 计算作物价值 | `calculateCropValue()` | ~13162 |
| 获取NPC加成 | `getNpcBonus(type)` | ~（需进一步搜索） |
| 获取科技加成 | `getTechBonus(type)` | ~（需进一步搜索） |
| 获取建筑加成 | `getBuildingBonus(type)` | ~13373 |
| 获取技能分支效果 | `getSkillBranchEffect(skillKey, effectKey)` | ~（需进一步搜索） |

---

*报告结束。所有数值均直接提取自 `farm_game.html` 源代码，可用于编写精确的测试用例和断言。*

# 宠物医生模拟器 — 完整美术素材需求清单

> 基于完整游戏流程，从早晨准备到夜晚总结，覆盖所有场景、角色、宠物、UI、道具、特效
> 
> 目标：给出精确到每一张图的AI生成提示词，你直接复制到即梦3.0就能出图

---

## 一、统一风格规范（所有素材必须遵守）

### 画风
- **Flat Illustration（扁平插画）**
- 无复杂阴影，最多1-2层简单投影
- 几何化的形状（圆形、圆角矩形、流线型）
- 线条简洁流畅，避免交叉线

### 配色
- **主色调**：柔和马卡龙色系
  - 背景：米白 `#F5F0E8`、浅灰蓝 `#E8F4F8`
  - 强调色：暖橘 `#FFB347`、薄荷绿 `#98D8C8`、天空蓝 `#87CEEB`
  - 医生服装：医护蓝 `#5B9BD5`
- **禁用**：高饱和霓虹色、纯黑 `#000000`、刺眼的红/绿

### 角色设计
- **无性别特征**（你选定的核心设定）
- 比例：Q版2.5头身到3头身（可爱但不幼稚）
- 面部表情简洁但传神（眉毛+眼睛+嘴巴即可表达情绪）
- 医生统一穿浅蓝色医护服+白色围裙+听诊器

### 技术规格
| 类型 | 推荐尺寸 | 背景 | 格式 |
|------|---------|------|------|
| 场景图 | 2730×1536（16:9） | 不透明，完整场景 | PNG |
| 角色立绘 | 1200×1800（2:3竖版） | **透明背景** | PNG |
| 宠物图 | 1024×1024（1:1） | **透明背景** | PNG |
| 道具图标 | 512×512（1:1） | **透明背景** | PNG |
| UI元素 | 按实际用途 | 按用途决定 | PNG |

> ⚠️ **重要**：角色、宠物、道具必须透明背景！否则叠加在场景上会有白边。出图时即梦3.0勾选"透明背景"或在提示词里加"transparent background, PNG cutout"

---

## 二、已有素材确认（✅ 不用再出）

### 场景（5张）
| 文件名 | 尺寸 | 说明 |
|--------|------|------|
| scene_clinic_hall.png | 2730×1536 | 诊所大厅，接待区 |
| scene_exam_room.png | 2730×1536 | 检查室，检查台 |
| scene_pharmacy.png | 2730×1536 | 药房，药柜 |
| scene_herb_garden.png | 2730×1536 | 草药花园，种植区 |
| scene_pet_shop.png | 2730×1536 | 宠物商店，货架 |

### 医生立绘（5张）
| 文件名 | 情绪 | 说明 |
|--------|------|------|
| doctor_smile.png | 微笑 | 默认状态 |
| doctor_happy.png | 开心 | 治好宠物 |
| doctor_serious.png | 严肃 | 认真诊断 |
| doctor_confused.png | 困惑 | 诊断困难 |
| doctor_surprised.png | 惊讶 | 意外情况 |

### 宠物（2种×2状态=4张）
| 文件名 | 宠物 | 状态 |
|--------|------|------|
| dog_healthy.png | 柴犬 | 健康，摇尾巴 |
| dog_sick.png | 柴犬 | 生病，没精神 |
| cat_healthy.png | 橘猫 | 健康，活泼 |
| cat_sick.png | 橘猫 | 生病，蔫蔫的 |

### 道具图标（9张）
item_stethoscope, item_thermometer, item_medicine, item_bandage, item_herb, item_clipboard, item_coin, item_heart, item_star

### UI（4张）
ui_bubble（对话气泡）, ui_btn_normal/hover/click（按钮三态）

---

## 三、完整游戏流程（一天时间线）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🌅 阶段一：早晨准备（7:00-9:00）                                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  诊所外场景   │ →  │  草药花园     │ →  │  宠物商店     │                   │
│  │  看预约板     │    │  采集草药     │    │  采购药品     │                   │
│  │  NPC对话      │    │  种植/浇水    │    │  讨价还价     │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  🏥 阶段二：诊所营业（9:00-18:00）← 核心循环                                  │
│                                                                              │
│  客人 arrives ──→ 诊所大厅（接待）                                           │
│       │                                                                        │
│       ▼                                                                        │
│  问诊对话（NPC立绘+对话框）──→ 获取线索                                        │
│       │                                                                        │
│       ▼                                                                        │
│  选择诊断方式：                                                                │
│    ├─ 检查室：听诊器迷你游戏（心跳波形）                                       │
│    ├─ 检查室：温度计迷你游戏（时机读取）                                       │
│    ├─ 药房：配药迷你游戏（颜色混合）                                           │
│    └─ 手术室：缝合迷你游戏（判定区停止）【需手术室场景】                        │
│       │                                                                        │
│       ▼                                                                        │
│  确诊 → 开处方 → 治疗                                                         │
│    ├─ 喂药（道具动画）                                                         │
│    ├─ 注射（道具动画）                                                         │
│    ├─ 包扎（绷带动画）                                                         │
│    └─ 手术（手术室场景+缝合游戏）                                              │
│       │                                                                        │
│       ▼                                                                        │
│  结算评价：金币+声望+羁绊+压力变化                                             │
│       │                                                                        │
│       └──→ 下一个客人 arrives（同时等待的客人增加压力）                        │
│                                                                              │
│  ☀️ 白天时间推进：阳光角度变化，大厅光线变化                                   │
│  ⚠️ 压力系统：等待病人数+1 → 压力条上升 → 屏幕边缘红闪                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  🌙 阶段三：夜晚总结（18:00-20:00）                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  诊所外夜景   │ →  │  今日结算面板 │ →  │  医生休息室   │                   │
│  │  过渡过场     │    │  收支/评价    │    │  升级设备     │                   │
│  │  随机事件弹窗 │    │  声望变化     │    │  存档/睡觉    │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 四、全部素材需求（按类别）

### 4.1 场景背景（还需 +4 张）

| # | 素材名 | 尺寸 | 场景描述 | 关键元素 |
|---|--------|------|---------|---------|
| 1 | **scene_surgery_room** | 2730×1536 | 手术室 | 手术台+无影灯+器械柜+消毒灯+监控仪 |
| 2 | **scene_clinic_exterior_day** | 2730×1536 | 诊所外白天 | 宠物诊所招牌+玻璃门+街道+绿植+蓝天白云 |
| 3 | **scene_clinic_exterior_night** | 2730×1536 | 诊所外夜晚 | 同上但夜景，招牌亮灯，星空/月亮，暖黄灯光 |
| 4 | **scene_lounge** | 2730×1536 | 医生休息室 | 小沙发+茶几+台灯+书架+绿植+窗外夜景 |

> 已有5张 + 新增4张 = 9张场景完整覆盖一天流程

---

### 4.2 NPC角色立绘（还需 6个角色 × 3表情 = 18张）

每个NPC需要**透明背景**，3种核心表情（可根据角色性格调整）。
尺寸参考医生：约1200×1800（2:3竖版）。

#### NPC 1：林先生（豆豆主人）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 焦急 | npc_mr_lin_worried | 宠物刚送来时 |
| 感激 | npc_mr_lin_grateful | 治好豆豆后 |
| 信任 | npc_mr_lin_trust | 羁绊Lv.3+后 |

**角色设定**：中年男性，40岁左右，微胖，戴眼镜，穿格子衬衫+休闲裤，手提宠物包。

#### NPC 2：王女士（橘猫主人）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 温柔 | npc_ms_wang_gentle | 日常对话 |
| 焦虑 | npc_ms_wang_anxious | 宠物病情严重时 |
| 开心 | npc_ms_wang_happy | 治好橘猫后 |

**角色设定**：年轻女性，25岁左右，长发，穿连衣裙，抱猫姿势，温柔知性。

#### NPC 3：张奶奶（仓鼠主人）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 慈祥 | npc_grandma_kind | 日常对话 |
| 担忧 | npc_grandma_worried | 仓鼠生病时 |
| 欣慰 | npc_grandma_relieved | 治好之后 |

**角色设定**：老年女性，白发，戴老花镜，穿宽松毛衣，拄拐杖，慈祥亲切。

#### NPC 4：商店老板（胖大叔）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 热情 | npc_shop_owner_friendly | 打招呼/推销 |
| 精明 | npc_shop_owner_shrewd | 讨价还价时 |

**角色设定**：中年男性，胖胖的，穿围裙，站在柜台后面，热情但有些市侩。

#### NPC 5：草药师（神秘青年）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 神秘 | npc_herbalist_mysterious | 初次见面 |
| 友善 | npc_herbalist_friendly | 熟悉后 |

**角色设定**：青年男性，20多岁，长发/辫子，穿民族风服饰，身上有草药香，神秘但友善。

#### NPC 6：竞争对手兽医（傲慢青年）
| 表情 | 文件名 | 使用场景 |
|------|--------|---------|
| 傲慢 | npc_rival_arrogant | 挑衅/竞争事件 |
| 尴尬 | npc_rival_embarrassed | 被你超越后 |
| 佩服 | npc_rival_impressed | 最终认可你 |

**角色设定**：年轻男性，穿白大褂但领口敞开，发型时髦，单手插兜，自信到傲慢。

---

### 4.3 宠物素材（还需 8种 × 2状态 = 16张）

每张宠物图需要**透明背景**，1:1正方形。

| # | 宠物 | 健康状态描述 | 生病状态描述 | 文件名 |
|---|------|-------------|-------------|--------|
| 1 | 金毛犬 | 金色毛发发亮，咧嘴笑，摇尾巴 | 耳朵耷拉，眼神无神，趴着 | pet_golden_healthy / pet_golden_sick |
| 2 | 柯基 | 屁股圆润，短腿站立，吐舌头 | 趴着不动，眼睛半闭，没精神 | pet_corgi_healthy / pet_corgi_sick |
| 3 | 仓鼠 | 圆滚滚，抱着瓜子，大眼睛 | 蜷缩成球，发抖，眼睛眯着 | pet_hamster_healthy / pet_hamster_sick |
| 4 | 鹦鹉 | 羽毛鲜艳，站在栖木上，歪头 | 羽毛蓬松，闭眼，翅膀下垂 | pet_parrot_healthy / pet_parrot_sick |
| 5 | 兔子 | 长耳朵竖起，蹦跳姿态，粉鼻子 | 耳朵耷拉，蜷缩，鼻子不粉 | pet_rabbit_healthy / pet_rabbit_sick |
| 6 | 龙猫 | 灰色毛球，大尾巴，圆眼睛 | 毛乱乱的，缩在角落，眼睛无神 | pet_chinchilla_healthy / pet_chinchilla_sick |
| 7 | 波斯猫 | 白色长毛，蓝眼睛，优雅坐姿 | 毛打结，流泪，趴着不动 | pet_persian_healthy / pet_persian_sick |
| 8 | 乌龟 | 绿色龟壳，探头探脑，小眼睛 | 缩在壳里，只露出一点头 | pet_turtle_healthy / pet_turtle_sick |

> 已有2种（柴犬+橘猫）+ 新增8种 = 10种宠物

---

### 4.4 道具图标（还需 +8 张）

每个道具图标需要**透明背景**，512×512。

| # | 道具 | 文件名 | 描述 |
|---|------|--------|------|
| 1 | 手术刀 | item_scalpel | 银色手术刀，简洁线条，医疗感 |
| 2 | 注射器 | item_syringe | 透明针筒+蓝色药液，简洁 |
| 3 | X光片 | item_xray | 灰色X光片，能看到骨头轮廓，带夹子 |
| 4 | 红色药丸 | item_pill_red | 红色胶囊，光泽感 |
| 5 | 蓝色药丸 | item_pill_blue | 蓝色胶囊，光泽感 |
| 6 | 黄色药丸 | item_pill_yellow | 黄色胶囊，光泽感 |
| 7 | 猫罐头 | item_can_cat | 金枪鱼罐头，拉环设计，可爱 |
| 8 | 放大镜 | item_magnifier | 木质手柄放大镜，镜片反光 |

> 已有9个 + 新增8个 = 17个道具

---

### 4.5 UI素材（还需 +10 张/套）

| # | UI元素 | 文件名 | 规格 | 说明 |
|---|--------|--------|------|------|
| 1 | 压力条外框 | ui_pressure_frame | ~600×80 | 圆角矩形边框，浅色底 |
| 2 | 压力条-绿色段 | ui_pressure_green | 可平铺 | 薄荷绿 `#98D8C8`，表示安全区 |
| 3 | 压力条-黄色段 | ui_pressure_yellow | 可平铺 | 暖黄 `#FFD966`，表示警告区 |
| 4 | 压力条-红色段 | ui_pressure_red | 可平铺 | 柔和红 `#FF6B6B`，表示危险区 |
| 5 | 星星评价-空 | ui_star_empty | 128×128 | 灰色轮廓星星 |
| 6 | 星星评价-满 | ui_star_full | 128×128 | 金色填充星星 `#FFD700` |
| 7 | 背包/库存格子 | ui_inventory_slot | 150×150 | 圆角方框，米色底，浅色边框 |
| 8 | 对话框-玩家选择 | ui_choice_box | ~400×80 | 带箭头的选项框，浅蓝底 |
| 9 | 日历图标 | ui_icon_calendar | 128×128 | 翻页日历，显示日期 |
| 10 | 金币飞溅特效帧 | fx_coin_sparkle | 256×256×3帧 | 金币获得时的粒子效果（3帧动画） |

---

### 4.6 特效素材（全部需要新建，5套）

特效需要**透明背景**，可做成帧动画或粒子效果。

| # | 特效 | 文件名 | 规格 | 说明 |
|---|------|--------|------|------|
| 1 | 治愈光芒 | fx_heal_glow | 512×512 | 柔和的金色光晕扩散，治疗成功时 |
| 2 | 爱心飘浮 | fx_heart_float | 128×128×3帧 | 粉色爱心向上飘，宠物被安抚时 |
| 3 | 压力警告 | fx_pressure_warn | 1920×1080 overlay | 红色半透明边框闪烁，压力>60%时 |
| 4 | 星星亮起 | fx_star_burst | 256×256 | 金色星星爆炸散开，声望升级时 |
| 5 | 药水瓶气泡 | fx_potion_bubble | 64×64×4帧 | 烧杯里冒彩色气泡，配药时 |

---

### 4.7 迷你游戏专用素材（4套）

#### 听诊器迷你游戏
| 素材 | 文件名 | 说明 |
|------|--------|------|
| 听诊器光标 | mg_stethoscope_cursor | 听诊器头，跟随鼠标 |
| 心跳波形背景 | mg_heartbeat_bg | 网格纸背景，带心电图线 |
| 心跳波形-正常 | mg_wave_normal | 规律的波浪线 |
| 心跳波形-异常 | mg_wave_irregular | 混乱的波形 |

#### 研磨草药迷你游戏
| 素材 | 文件名 | 说明 |
|------|--------|------|
| 研磨钵 | mg_mortar | 石制研磨钵，俯视角度 |
| 草药碎屑 | mg_herb_particles | 绿色碎屑，跟随研磨轨迹 |
| 进度条底 | mg_progress_bg | 研磨进度条背景 |

#### 缝合迷你游戏（手术室）
| 素材 | 文件名 | 说明 |
|------|--------|------|
| 伤口俯视图 | mg_wound_top | 卡通化的伤口，俯视 |
| 缝合线 | mg_suture_line | 虚线表示缝合路径 |
| 判定区标记 | mg_hit_zone | 绿色圆圈，完美缝合点 |
| 手术器械光标 | mg_scalpel_cursor | 小手术刀跟随鼠标 |

#### 配药迷你游戏（颜色混合）
| 素材 | 文件名 | 说明 |
|------|--------|------|
| 烧杯 | mg_beaker | 透明玻璃烧杯 |
| 红色药液 | mg_liquid_red | 红色液体，可叠加 |
| 蓝色药液 | mg_liquid_blue | 蓝色液体，可叠加 |
| 黄色药液 | mg_liquid_yellow | 黄色液体，可叠加 |
| 目标色卡 | mg_target_color | 显示目标颜色的圆盘 |

---

## 五、素材分批计划（按开发优先级）

### 📦 第1批：MVP核心（你能立刻开始出）
> 目标：让"完整一天"流程能跑起来

| 序号 | 素材 | 数量 | 优先级理由 |
|------|------|------|-----------|
| 1 | 手术室场景 scene_surgery_room | 1张 | 缝合迷你游戏需要新场景 |
| 2 | 林先生3表情 | 3张 | 第一个NPC，绑定教程流程 |
| 3 | 压力条UI全套 | 4张 | 核心玩法系统可视化 |
| 4 | 手术刀图标 | 1张 | 手术室道具 |
| 5 | 注射器图标 | 1张 | 治疗道具 |
| 6 | 金毛犬2状态 | 2张 | 增加宠物多样性 |

**第1批合计：12张**

---

### 📦 第2批：NPC系统（第1批完成后）
> 目标：让羁绊系统有内容

| 序号 | 素材 | 数量 |
|------|------|------|
| 1 | 王女士3表情 | 3张 |
| 2 | 张奶奶3表情 | 3张 |
| 3 | 商店老板2表情 | 2张 |
| 4 | 柯基2状态 | 2张 |
| 5 | 仓鼠2状态 | 2张 |

**第2批合计：12张**

---

### 📦 第3批：丰富度+迷你游戏素材
> 目标：内容不重复，可玩数小时

| 序号 | 素材 | 数量 |
|------|------|------|
| 1 | 草药师2表情 | 2张 |
| 2 | 竞争对手兽医3表情 | 3张 |
| 3 | 鹦鹉2状态 | 2张 |
| 4 | 兔子2状态 | 2张 |
| 5 | 龙猫2状态 | 2张 |
| 6 | 波斯猫2状态 | 2张 |
| 7 | 乌龟2状态 | 2张 |
| 8 | 迷你游戏素材（4套） | ~16张 |

**第3批合计：约29张**

---

### 📦 第4批：场景补完+特效+UI polish
> 目标：沉浸感+完整昼夜循环

| 序号 | 素材 | 数量 |
|------|------|------|
| 1 | 诊所外白天场景 | 1张 |
| 2 | 诊所外夜晚场景 | 1张 |
| 3 | 医生休息室场景 | 1张 |
| 4 | 剩余道具图标（药丸3色+罐头+放大镜） | 5张 |
| 5 | 特效素材（5套） | 5套 |
| 6 | 剩余UI（星星+背包+日历+对话框） | 6张 |

**第4批合计：约19张**

---

## 六、AI生成提示词模板（即梦3.0直接可用）

> 复制以下提示词到即梦3.0，替换括号内的变量即可

### 场景提示词模板
```
Flat illustration, pet clinic (场景名), clean and modern interior, 
soft pastel color palette, macaron tones, warm lighting, 
no characters, wide angle view, 16:9 composition, 
detailed background props, cozy atmosphere,
minimalist design, smooth lines, no text
```

### 角色提示词模板
```
Flat illustration, (角色描述), (表情描述), 
standing pose, full body visible, soft pastel color palette,
macaron tones, clean design, smooth lines,
transparent background, PNG cutout,
no gender-specific features, friendly appearance,
2.5 head proportion, cute but professional style
```

### 宠物提示词模板
```
Flat illustration, cute (宠物名), (状态: healthy and energetic / sick and weak),
(动作描述), soft pastel color palette, macaron tones,
rounded shapes, big expressive eyes,
transparent background, PNG cutout,
cartoon style, clean design, no outlines
```

### 道具提示词模板
```
Flat illustration, (道具名), medical supply, 
soft pastel color palette, macaron tones,
clean icon design, centered composition,
transparent background, PNG cutout,
minimalist style, smooth lines, no shadows
```

---

## 七、具体提示词示例（可直接复制）

### 场景示例：手术室
```
Flat illustration, veterinary surgery room, clean modern medical interior,
operating table with overhead surgical light, medical equipment cabinet,
sterile white and mint green color scheme, soft pastel palette,
macaron tones, wide angle view, 16:9 composition,
detailed background, cozy but professional atmosphere,
minimalist design, smooth lines, no characters, no text
```

### 角色示例：林先生（焦急）
```
Flat illustration, middle-aged man, slightly overweight, wearing glasses,
plaid shirt, casual pants, holding a pet carrier bag,
worried anxious expression, eyebrows furrowed, sweat drop on forehead,
standing pose, full body visible, soft pastel color palette,
macaron tones, clean design, smooth lines,
transparent background, PNG cutout,
no gender-specific features beyond basic appearance,
2.5 head proportion, cute but realistic style
```

### 宠物示例：金毛犬（生病）
```
Flat illustration, cute golden retriever dog, sick and weak,
ears drooping, eyes half-closed, lying down posture,
sad expression, soft pastel color palette, macaron tones,
rounded shapes, big expressive droopy eyes,
transparent background, PNG cutout,
cartoon style, clean design, no outlines
```

### 道具示例：注射器
```
Flat illustration, medical syringe, transparent barrel with blue liquid inside,
needle attached, soft pastel color palette, macaron tones,
clean icon design, centered composition,
transparent background, PNG cutout,
minimalist style, smooth lines, medical supply
```

---

## 八、检查清单（每批出完对照）

### 出图前必读
- [ ] 确认即梦3.0设置：画质=精致，比例按素材类型调整
- [ ] 角色/宠物/道具必须勾选**透明背景**（或在提示词强调transparent background）
- [ ] 所有素材风格参考：`flat_illustration_refined.png`

### 出图后检查
- [ ] PNG格式确认
- [ ] 透明背景确认（用PS/画图工具看是否有白底）
- [ ] 尺寸是否符合文档规格
- [ ] 风格是否和已有素材一致（颜色、线条粗细）
- [ ] 文件名是否按文档命名（方便我直接对应代码）

---

## 附录：素材总数统计

| 类别 | 已有 | 还需 | 合计 |
|------|------|------|------|
| 场景 | 5 | 4 | 9 |
| 医生立绘 | 5 | 0 | 5 |
| NPC立绘 | 0 | 18 | 18 |
| 宠物 | 4 | 16 | 20 |
| 道具图标 | 9 | 8 | 17 |
| UI元素 | 4 | 10 | 14 |
| 特效 | 0 | 5套 | 5套 |
| 迷你游戏 | 0 | ~16 | ~16 |
| **总计** | **27** | **~77** | **~104** |

> 注：迷你游戏和特效素材部分可用代码绘制替代，不一定要全部出图。核心优先级是场景+角色+宠物+关键UI。

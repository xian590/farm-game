# 系统完整性检查报告

## 1. 采集系统 (Foraging) — 状态：有严重 Bug / 缺失

- **数据定义缺失**：`FORAGING_DATA`（包含 `common`、`rare`、`seasonal` 的采集物品数据）在文件中**从未定义**。`renderForagingPanel` 和 `goForaging` 都直接引用 `FORAGING_DATA.common` / `.rare` / `.seasonal`，会导致运行时 `ReferenceError`，整个采集面板无法渲染，采集功能无法使用。
- **渲染函数**：`renderForagingPanel` 存在，但因依赖未定义的 `FORAGING_DATA` 会报错。
- **交互函数**：`goForaging` 存在，但有两个明显问题：
  - 使用了**未定义变量 `itemNames`**（`addLog('...采了...样东西：' + itemNames, 'good')`），会抛出 `ReferenceError`。
  - 没有根据季节 Buff（如 `seasonalBuffs.forageBonus`）调整产出。
- **显示与出售**：`game.foragingItems` 在角色面板和背包中**没有任何展示**，也**没有出售功能**。物品只能被堆在对象里，玩家无法查看或卖出。
- **季节限定**：`SEASONAL_EVENTS` 中部分事件（如 `spring_bamboo`、`winter_bamboo_shoot`）会直接给 `game.foragingItems` 增加 `春笋`、`野菜`、`草药`、`冬笋`，但这绕过了采集系统本身。

## 2. 宠物系统 (Pets) — 状态：有 Bug

- **数据定义**：`PET_DATA`（阿花、大黄）、`PET_FRIENDSHIP_LEVELS` 完整；`game.pets` 和 `game.petEvents` 初始化完整。
- **渲染函数**：`renderPetsPanel` 存在，领养、喂食、抚摸、玩耍按钮齐全，宠物粪便展示也完整。
- **交互函数**：`adoptPet`、`feedPet`、`petPet`、`playWithPet`、`collectPoop` 均存在，交互逻辑完整。
- **明显 Bug**：
  - **`getPetEffectText` 作用域错误**：该函数被**嵌套定义在 `getPetFriendshipLevel` 内部**（而非全局），导致 `renderPetsPanel` 调用 `getPetEffectText` 时会抛出 `ReferenceError: getPetEffectText is not defined`。这会直接导致宠物面板无法渲染效果文本。
  - **好感度等级函数未使用**：`getPetFriendshipLevel` 虽然存在，但从未被调用，宠物系统中没有基于好感度等级触发的特殊事件（如好感度达到亲密后的专属剧情、奖励等）。
  - **重复函数**：`feedThePet` / `petThePet`（旧实现）与 `feedPet` / `petPet`（新实现）并存，但旧版本未被调用，只是代码冗余。

## 3. 日志系统 (Log) — 状态：基本完整

- **数据定义**：无专门数据定义，日志通过全局 `addLog` 写入 DOM。
- **渲染函数**：`addLog` 存在，能够正确按类型（`good`/`bad`/`info`/`crop`/`npc`/`pet`）着色并显示时间戳，动画效果完整。
- **交互函数**：`toggleLogExpand` 存在，可以展开/收起底部日志栏。
- **日志面板**：`renderLogPanel` 仅显示一行提示 "完整日志请查看底部滚动栏"，是一个**占位符**。虽然底部日志栏功能正常，但独立的“日志”侧边栏标签没有实质性内容。

## 4. 事件系统 (Events) — 状态：基本完整，有小 Bug

- **数据定义**：`EVENTS` 对象定义非常完整（自然灾害、自然增益、人为事件共 20+ 条）；`NIGHT_EVENTS`、`SEASONAL_EVENTS`（四季 100 条）、`NPC_EXCLUSIVE_EVENTS`（NPC 专属事件链）也都完整定义。
- **触发机制**：`triggerRandomEvent`（日间随机事件）、`triggerNightEvent`（夜间事件）、`checkSeasonalEvent`（季节限定）、`checkNpcEventChain`（NPC 事件链）均存在，触发逻辑完整，包含新手保护、宠物减益、科技减益等。
- **处理函数**：`handleEventChoice` 处理的效果比较全面：体力、金钱、声望、农药、减产/增产、下季加成、健康、各技能经验、声望加成、时间快进/回退、NPC 好感度、出售加成、流浪猫特殊标记等。
- **小 Bug**：
  - `effect.time` 处理中，当时间回退导致 `game.time < 0` 时，`game.day` 会减 1，但只重置了 `dailyActions` 中的少数几项（`exercise/chat/fish/read`），**没有重置 `foraging.usedToday`、`sideHustle.dailyDone`、`petPoop` 等**，可能导致跨天状态不一致。
  - `handleEventChoice` 中 `game.dailyActions` 的赋值只包含 4 项，但游戏实际日常活动更多（如 `foraging`），跨天重置不彻底。

## 5. 加工 / 副业系统 (Processing & Side Hustle) — 状态：有 Bug

- **数据定义**：`PROCESSING_DATA`（磨米、晒红薯片）、`PROCESSED_ITEMS`（糙米、红薯干）、`SIDE_HUSTLE_DATA`（剪视频、拍照、腌菜、竹编、采草药、快递分拣、辅导功课）均完整。
- **渲染函数**：`renderProcessingPanel` 存在，已解锁副业展示、可解锁副业展示、闲时零活展示均完整，交互按钮齐全。
- **交互函数**：`buildProcessing`、`doSideHustle`、`sellProcessedItem` 均存在。
- **明显 Bug**：
  - **`processDailyProcessing` 使用错误的作物 Key**：第 10220 行将 `rice` 映射为 `'earlyRice'`，`sweetPotato` 映射为 `'springPotato'`，但 `CROP_DATA` 中实际只有 `rice_spring`、`rice_summer`、`sweet_spring`、`sweet_autumn`。这会导致每日自动加工**永远找不到原料**（`game.crops['earlyRice']` 为 `undefined`），自动加工功能完全失效。
  - **`sellProcessedItem` 使用错误的作物 Key**：第 10334–10337 行同样引用了 `CROP_DATA.earlyRice` 和 `CROP_DATA.springPotato`，这会导致**出售加工产品时抛出 `TypeError: Cannot read property 'basePrice' of undefined`**，价格计算为 `NaN`。
  - **`renderProcessingPanel` 的显示价格**使用的是 `CROP_DATA.rice_spring` 和 `CROP_DATA.sweet_spring`（存在），所以显示正常，但点击出售就会报错。
  - **副业产物 `pickle` / `bambooBasket` 无法出售**：`doSideHustle` 会把 `pickle` 和 `bambooBasket` 放入 `game.processedItems`，但 `renderProcessingPanel` 只遍历 `PROCESSING_DATA`，这两个产物没有对应的出售按钮，玩家无法卖掉它们。
  - **竹编副业材料无法获取**：`bambooCraft` 需要 `game.foragingItems.bamboo`，但由于 `FORAGING_DATA` 未定义，`bamboo` 无法通过采集获得，竹编副业实际上无法运行。

## 6. 建筑系统 (Buildings) — 状态：有小 Bug，基本完整

- **数据定义**：`BUILDING_DATA`（仓棚、晒场、水井、农具棚）和 `BUILDING_CATEGORIES` 完整，`game.buildings` 初始化正确。
- **渲染函数**：`renderBuildingPanel` 存在，按分类展示建筑，当前等级、效果描述、建造/升级按钮齐全。
- **交互函数**：`buildBuilding` 和 `upgradeBuilding` 均存在，建造和升级逻辑正确，会正确扣钱、加等级、记录日志。
- **小 Bug**：
  - **`renderBuildingPanel` 显示的升级费用与 `upgradeBuilding` 实际扣除的费用不一致**：`renderBuildingPanel` 第 9856 行使用 `building.upgradeCost[currentLevel - 1]` 显示费用，而 `upgradeBuilding` 第 10574 行使用 `building.upgradeCost[currentLevel]` 实际扣费。例如仓棚 Lv.1→Lv.2，面板显示 300 元，实际扣除 500 元，会误导玩家。
  - `getBuildingBonus` 中遍历 `upgradeEffect` 的逻辑，与 `buildBuilding`/`upgradeBuilding` 中直接维护 `game.storageCapacity` 的方式，在数值上虽然最终碰巧一致，但维护方式不一致（一个通过遍历数组实时计算，一个通过手动累加），容易在后续修改中引入 Bug。

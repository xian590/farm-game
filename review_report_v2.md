# farm_game.html 代码审查报告 v2

共发现 601 个问题

## [P1] XSS (innerHTML) - 行 14992
innerHTML 赋值包含未转义的插值变量: ['totalPending']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
14990:             } else {
14991:                 const totalPending = Object.keys(QUEST_DATA).filter(id => !game.quests[id]).length;
14992:                 btn.innerHTML = `▼ 查看全部任务 (${totalPending})`;
14993:             }
14994:         }
```

## [P1] XSS (innerHTML) - 行 21535
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21533:         case 'good':
21534:             icon = '✨';
21535:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-good">${safeText}</span>`;
21536:             break;
21537:         case 'bad':
```

## [P1] XSS (innerHTML) - 行 21539
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21537:         case 'bad':
21538:             icon = '⚠️';
21539:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-bad">${safeText}</span>`;
21540:             break;
21541:         case 'info':
```

## [P1] XSS (innerHTML) - 行 21543
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21541:         case 'info':
21542:             icon = '💡';
21543:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-info">${safeText}</span>`;
21544:             break;
21545:         case 'crop':
```

## [P1] XSS (innerHTML) - 行 21547
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21545:         case 'crop':
21546:             icon = '🌾';
21547:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-crop">${safeText}</span>`;
21548:             break;
21549:         case 'npc':
```

## [P1] XSS (innerHTML) - 行 21551
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21549:         case 'npc':
21550:             icon = '👤';
21551:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-npc">${safeText}</span>`;
21552:             break;
21553:         case 'pet':
```

## [P1] XSS (innerHTML) - 行 21555
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21553:         case 'pet':
21554:             icon = '🐾';
21555:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span class="log-pet">${safeText}</span>`;
21556:             break;
21557:         default:
```

## [P1] XSS (innerHTML) - 行 21559
innerHTML 赋值包含未转义的插值变量: ['timeStr', 'icon', 'safeText']。若变量来自用户输入或不可信数据，可能导致 XSS。

```javascript
21557:         default:
21558:             icon = '📝';
21559:             item.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-icon">${icon}</span><span>${safeText}</span>`;
21560:     }
21561:     
```

## [P2] Event listener leaks - 行 3121
addEventListener 使用匿名函数绑定 window.beforeunload，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
 3119: const ERROR_LOG_KEY = 'farm_game_error_log';
 3120: let lastErrorLogTime = 0;
 3121: window.addEventListener('beforeunload', function() {
 3122:     if (game && typeof saveGame === 'function') {
 3123:         try { saveGame(); } catch(e) {}
```

## [P2] Event listener leaks - 行 3121
addEventListener (window.beforeunload, function) 缺少对应的 removeEventListener。

```javascript
 3119: const ERROR_LOG_KEY = 'farm_game_error_log';
 3120: let lastErrorLogTime = 0;
 3121: window.addEventListener('beforeunload', function() {
 3122:     if (game && typeof saveGame === 'function') {
 3123:         try { saveGame(); } catch(e) {}
```

## [P2] Event listener leaks - 行 3126
addEventListener 使用匿名函数绑定 window.error，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
 3124:     }
 3125: });
 3126: window.addEventListener('error', function(e) {
 3127:     try {
 3128:         // 限制写入频率：每5秒最多写入一次，避免频繁I/O导致卡顿
```

## [P2] Event listener leaks - 行 3126
addEventListener (window.error, function) 缺少对应的 removeEventListener。

```javascript
 3124:     }
 3125: });
 3126: window.addEventListener('error', function(e) {
 3127:     try {
 3128:         // 限制写入频率：每5秒最多写入一次，避免频繁I/O导致卡顿
```

## [P2] Circular reference - 行 3143
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
 3141:         // 最多保留20条
 3142:         if (logs.length > 20) logs.shift();
 3143:         safeStorageSet(ERROR_LOG_KEY, JSON.stringify(logs));
 3144:     } catch(err) { console.error('全局错误日志记录失败', err); }
 3145: });
```

## [P2] NaN/Infinity - 行 3357
除法运算可能除零: i / bufferSize。建议对分母添加零值检查或 || 1 防护。

```javascript
 3355:         const data = buffer.getChannelData(0);
 3356:         for (let i = 0; i < bufferSize; i++) {
 3357:             data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
 3358:         }
 3359:         
```

## [P2] Array out of bounds - 行 3357
数组索引访问可能越界: data[i]。建议添加长度检查。

```javascript
 3355:         const data = buffer.getChannelData(0);
 3356:         for (let i = 0; i < bufferSize; i++) {
 3357:             data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
 3358:         }
 3359:         
```

## [P2] Array out of bounds - 行 3425
数组索引访问可能越界: NPC_VOICE_CONFIG[npcKey]。建议添加长度检查。

```javascript
 3423:     if (!ensureAudioReady()) return;
 3424:     try {
 3425:         const config = NPC_VOICE_CONFIG[npcKey] || NPC_VOICE_CONFIG['wangcunzhang'];
 3426:         const startTime = audioCtx.currentTime;
 3427:         // 根据语速计算音节数量
```

## [P2] NaN/Infinity - 行 3431
除法运算可能除零: 1 / config.speed。建议对分母添加零值检查或 || 1 防护。

```javascript
 3429:         
 3430:         for (let i = 0; i < syllableCount; i++) {
 3431:             const syllableStart = startTime + i * (1 / config.speed / 3.5);
 3432:             const syllableDuration = 0.12 + Math.random() * 0.12;
 3433:             
```

## [P2] Array out of bounds - 行 3480
数组索引访问可能越界: SING_MELODIES[emotion]。建议添加长度检查。

```javascript
 3478:     if (!ensureAudioReady()) return;
 3479:     try {
 3480:         const melody = SING_MELODIES[emotion] || SING_MELODIES['normal'];
 3481:         const startTime = audioCtx.currentTime;
 3482:         const noteDuration = (0.18 / speed);
```

## [P2] NaN/Infinity - 行 3482
除法运算可能除零: 0.18 / speed。建议对分母添加零值检查或 || 1 防护。

```javascript
 3480:         const melody = SING_MELODIES[emotion] || SING_MELODIES['normal'];
 3481:         const startTime = audioCtx.currentTime;
 3482:         const noteDuration = (0.18 / speed);
 3483:         
 3484:         melody.forEach((freq, i) => {
```

## [P2] NaN/Infinity - 行 3620
除法运算可能除零: i / bufferSize。建议对分母添加零值检查或 || 1 防护。

```javascript
 3618:         const data = buffer.getChannelData(0);
 3619:         for (let i = 0; i < bufferSize; i++) {
 3620:             data[i] = (Math.random() * 2 - 1) * (1 - Math.abs(i / bufferSize * 2 - 1));
 3621:         }
 3622:         
```

## [P2] Array out of bounds - 行 3620
数组索引访问可能越界: data[i]。建议添加长度检查。

```javascript
 3618:         const data = buffer.getChannelData(0);
 3619:         for (let i = 0; i < bufferSize; i++) {
 3620:             data[i] = (Math.random() * 2 - 1) * (1 - Math.abs(i / bufferSize * 2 - 1));
 3621:         }
 3622:         
```

## [P2] NaN/Infinity - 行 3653
除法运算可能除零: j / bufferSize。建议对分母添加零值检查或 || 1 防护。

```javascript
 3651:                 const data = buffer.getChannelData(0);
 3652:                 for (let j = 0; j < bufferSize; j++) {
 3653:                     data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize);
 3654:                 }
 3655:                 
```

## [P2] Array out of bounds - 行 3653
数组索引访问可能越界: data[j]。建议添加长度检查。

```javascript
 3651:                 const data = buffer.getChannelData(0);
 3652:                 for (let j = 0; j < bufferSize; j++) {
 3653:                     data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize);
 3654:                 }
 3655:                 
```

## [P2] Array out of bounds - 行 3749
数组索引访问可能越界: BGM_DATA[bgmName]。建议添加长度检查。

```javascript
 3747:     if (!audioCtx || audioCtx.state === 'closed' || !musicGainNode) return;
 3748:     
 3749:     const bgm = BGM_DATA[bgmName];
 3750:     if (!bgm) return;
 3751:     
```

## [P2] Event listener leaks - 行 3822
addEventListener 使用匿名函数绑定 document.visibilitychange，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
 3820: let bgmPausedByVisibility = false;
 3821: let bgmResumeName = null;
 3822: document.addEventListener('visibilitychange', function() {
 3823:     if (document.hidden) {
 3824:         // 页面进入后台：暂停BGM
```

## [P2] Event listener leaks - 行 3822
addEventListener (document.visibilitychange, function) 缺少对应的 removeEventListener。

```javascript
 3820: let bgmPausedByVisibility = false;
 3821: let bgmResumeName = null;
 3822: document.addEventListener('visibilitychange', function() {
 3823:     if (document.hidden) {
 3824:         // 页面进入后台：暂停BGM
```

## [P2] Array out of bounds - 行 3885
数组索引访问可能越界: data[i]。建议添加长度检查。

```javascript
 3883:     const data = buffer.getChannelData(0);
 3884:     for (let i = 0; i < bufferSize; i++) {
 3885:         data[i] = (Math.random() * 2 - 1) * 0.5;
 3886:     }
 3887:     
```

## [P2] NaN/Infinity - 行 3925
parseInt/parseFloat 结果未做 NaN 防护: const parsedMusic = parseFloat(value);

```javascript
 3923: 
 3924: function setMusicVolume(value) {
 3925:     const parsedMusic = parseFloat(value);
 3926:     musicVolume = isNaN(parsedMusic) ? 0.3 : Math.max(0, Math.min(1, parsedMusic));
 3927:     if (musicGainNode) {
```

## [P2] NaN/Infinity - 行 3934
parseInt/parseFloat 结果未做 NaN 防护: const parsedSfx = parseFloat(value);

```javascript
 3932: 
 3933: function setSfxVolume(value) {
 3934:     const parsedSfx = parseFloat(value);
 3935:     sfxVolume = isNaN(parsedSfx) ? 0.5 : Math.max(0, Math.min(1, parsedSfx));
 3936:     if (sfxGainNode) {
```

## [P2] Event listener leaks - 行 4073
addEventListener (document.click, function) 缺少对应的 removeEventListener。

```javascript
 4071: 
 4072: // 页面加载时监听第一次点击，自动初始化音频
 4073: document.addEventListener('click', function initAudioOnFirstClick() {
 4074:     initAudio();
 4075:     document.removeEventListener('click', initAudioOnFirstClick);
```

## [P2] Game balance - 行 4410
极大的数值 200000 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
 4408:         healthRegen: 12,
 4409:         rent: 2000,
 4410:         upgradeCost: 200000,
 4411:         unlockCondition: '总资产200000元 + 已购豪宅'
 4412:     }
```

## [P2] Game balance - 行 4868
极大的数值 1000000 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
 4866: const BANK_DATA = {
 4867:     interestRate: 0.0002, // 日利率 0.02%（年化约7.5%）
 4868:     maxDeposit: 1000000, // 最大存款 100万
 4869:     depositUnlock: 5000 // 总资产5000元解锁
 4870: };
```

## [P2] Game balance - 行 4967
极大的数值 200000 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
 4965:         { name: '基因编辑', desc: '作物产量再+10%', cost: 50000, effect: 'yieldBonus', value: 0.10 },
 4966:         { name: '智能农业', desc: '所有田地自动生长+10%', cost: 100000, effect: 'autoGrowth', value: 0.10 },
 4967:         { name: '太空育种', desc: '作物产量再+15%', cost: 200000, effect: 'yieldBonus', value: 0.15 }
 4968:     ]
 4969: };
```

## [P2] Array out of bounds - 行 8921
数组索引访问可能越界: LOG_FLAVORS[type]。建议添加长度检查。

```javascript
 8919: // 获取随机文案
 8920: function getRandomFlavor(type) {
 8921:     const flavors = LOG_FLAVORS[type];
 8922:     if (!flavors || flavors.length === 0) return '';
 8923:     return flavors[Math.floor(Math.random() * flavors.length)];
```

## [P2] Event listener leaks - 行 8935
addEventListener 使用匿名函数绑定 document.keydown，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
 8933: 
 8934: // 全局 Escape 键关闭弹窗支持
 8935: document.addEventListener('keydown', function(e) {
 8936:     if (e.key === 'Escape') {
 8937:         const overlay = document.getElementById('modal-overlay');
```

## [P2] Event listener leaks - 行 8935
addEventListener (document.keydown, function) 缺少对应的 removeEventListener。

```javascript
 8933: 
 8934: // 全局 Escape 键关闭弹窗支持
 8935: document.addEventListener('keydown', function(e) {
 8936:     if (e.key === 'Escape') {
 8937:         const overlay = document.getElementById('modal-overlay');
```

## [P2] NaN/Infinity - 行 9012
除法运算可能除零: xian590.github.io/farm。建议对分母添加零值检查或 || 1 防护。

```javascript
 9010:     banner.innerHTML = `
 9011:         <span>⚠️ 游戏已迁移到永久链接，此临时链接即将失效</span>
 9012:         <a href="https://xian590.github.io/farm-game/" target="_blank" style="color: #fff; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 6px; text-decoration: none; font-weight: bold;">🚀 立即前往</a>
 9013:         <button onclick="document.getElementById('migration-banner').style.display='none'; localStorage.setItem('farm_migration_shown', '1');" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕ 关闭</button>
 9014:     `;
```

## [P2] NaN/Infinity - 行 9035
除法运算可能除零: 8082/farm_game.html。建议对分母添加零值检查或 || 1 防护。

```javascript
 9033:     if (window.location.protocol === 'file:') {
 9034:         console.warn('【警告】通过 file:// 打开HTML文件，localStorage 可能无法正常工作，导致存档刷新后丢失。');
 9035:         console.warn('请通过 http://localhost:8082/farm_game.html 访问游戏，存档才能正常保存。');
 9036:     }
 9037:     
```

## [P2] Array out of bounds - 行 9106
数组索引访问可能越界: STORY_PAGES[storyPage]。建议添加长度检查。

```javascript
 9104: 
 9105: function updateStoryPage() {
 9106:     const page = STORY_PAGES[storyPage];
 9107:     const storyEmoji = document.getElementById('story-emoji');
 9108:     const storyTitle = document.getElementById('story-title');
```

## [P2] Array out of bounds - 行 9217
数组索引访问可能越界: names[mode]。建议添加长度检查。

```javascript
 9215: function getModeName(mode) {
 9216:     const names = { easy: '归隐田园', normal: '耕读传家', hard: '富甲一方' };
 9217:     return names[mode] || mode;
 9218: }
 9219: 
```

## [P2] Array out of bounds - 行 9227
数组索引访问可能越界: configs[mode]。建议添加长度检查。

```javascript
 9225:         hard: { money: 5000, maxHealth: 200, maxStamina: 200, disasterRate: 1.5, startHealth: 80, startStamina: 60 }
 9226:     };
 9227:     const cfg = configs[mode];
 9228: 
 9229:     game = {
```

## [P2] State inconsistency - 行 9464
game.money 修改（行 9464）与 game 其他字段修改（行 9447）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9462:             }
 9463:             if (game.money >= actualWage) {
 9464:                 game.money -= actualWage;
 9465:             } else {
 9466:                 // 钱不够发工资，自动解雇
```

## [P2] State inconsistency - 行 9497
game.money 修改（行 9497）与 game 其他字段修改（行 9481）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9495:         const mealCost = 15; // 与在线一致
 9496:         if (game.money >= mealCost) {
 9497:             game.money -= mealCost;
 9498:         } else if (game.money > 0) {
 9499:             game.money = 0; // 钱不够，全部用来吃饭
```

## [P2] State inconsistency - 行 9499
game.money 修改（行 9499）与 game 其他字段修改（行 9481）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9497:             game.money -= mealCost;
 9498:         } else if (game.money > 0) {
 9499:             game.money = 0; // 钱不够，全部用来吃饭
 9500:         } else {
 9501:             // 完全没钱时，村里给救济粮
```

## [P2] State inconsistency - 行 9502
game.money 修改（行 9502）与 game 其他字段修改（行 9490）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9500:         } else {
 9501:             // 完全没钱时，村里给救济粮
 9502:             game.money += 15;
 9503:         }
 9504:         // 宠物每日饲料消耗（离线期间也要扣）
```

## [P2] Array out of bounds - 行 9508
数组索引访问可能越界: PET_DATA[petId]。建议添加长度检查。

```javascript
 9506:             for (const [petId, pet] of Object.entries(game.pets)) {
 9507:                 if (!pet || typeof pet !== 'object') continue;
 9508:                 const petData = PET_DATA[petId];
 9509:                 if (!petData) continue;
 9510:                 const foodCost = petData.dailyFoodCost || 0;
```

## [P2] Array out of bounds - 行 9525
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
 9523:             for (const [deviceId, level] of Object.entries(game.automation)) {
 9524:                 if (level <= 0) continue;
 9525:                 const device = AUTOMATION_DATA[deviceId];
 9526:                 if (!device) continue;
 9527:                 
```

## [P2] Array out of bounds - 行 9539
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
 9537:                     for (const [animalKey, animals] of Object.entries(game.animals)) {
 9538:                         if (animals.length === 0) continue;
 9539:                         const data = ANIMAL_DATA[animalKey];
 9540:                         if (!data) continue;
 9541:                         const feedReduction = [0, 0.1, 0.2][level - 1] || 0;
```

## [P2] Array out of bounds - 行 9546
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
 9544:                             for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
 9545:                                 const actualAmount = Math.max(0, Math.ceil(amount * (1 - feedReduction)));
 9546:                                 if ((game.crops[crop] || 0) < actualAmount) {
 9547:                                     canFeed = false;
 9548:                                     break;
```

## [P2] Array out of bounds - 行 9554
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
 9552:                                 for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
 9553:                                     const actualAmount = Math.max(0, Math.ceil(amount * (1 - feedReduction)));
 9554:                                     game.crops[crop] -= actualAmount;
 9555:                                 }
 9556:                                 animal.weight = Math.min(100, (animal.weight || 50) + 1);
```

## [P2] Array out of bounds - 行 9712
数组索引访问可能越界: CROP_DATA[key]。建议添加长度检查。

```javascript
 9710:         game.fields.forEach((field) => {
 9711:             if (field.stage === 'idle' && field.prepared) {
 9712:                 const seasonCrops = Object.keys(CROP_DATA).filter(key => CROP_DATA[key].season === game.season);
 9713:                 for (const cropKey of seasonCrops) {
 9714:                     if (game.seeds && game.seeds[cropKey] > 0) {
```

## [P2] Array out of bounds - 行 9714
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
 9712:                 const seasonCrops = Object.keys(CROP_DATA).filter(key => CROP_DATA[key].season === game.season);
 9713:                 for (const cropKey of seasonCrops) {
 9714:                     if (game.seeds && game.seeds[cropKey] > 0) {
 9715:                         game.seeds[cropKey]--;
 9716:                         field.crop = cropKey;
```

## [P2] Array out of bounds - 行 9715
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
 9713:                 for (const cropKey of seasonCrops) {
 9714:                     if (game.seeds && game.seeds[cropKey] > 0) {
 9715:                         game.seeds[cropKey]--;
 9716:                         field.crop = cropKey;
 9717:                         field.stage = 'seedling';
```

## [P2] State inconsistency - 行 9766
game.money 修改（行 9766）与 game 其他字段修改（行 9754）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9764:                 }
 9765:                 if (game.money >= actualWage) {
 9766:                     game.money -= actualWage;
 9767:                 } else {
 9768:                     // 钱不够发工资，自动解雇
```

## [P2] State inconsistency - 行 9800
game.money 修改（行 9800）与 game 其他字段修改（行 9783）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9798:             const mealCost = 15;
 9799:             if (game.money >= mealCost) {
 9800:                 game.money -= mealCost;
 9801:             } else if (game.money > 0) {
 9802:                 game.money = 0;
```

## [P2] State inconsistency - 行 9802
game.money 修改（行 9802）与 game 其他字段修改（行 9783）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9800:                 game.money -= mealCost;
 9801:             } else if (game.money > 0) {
 9802:                 game.money = 0;
 9803:             } else {
 9804:                 game.money += 15; // 低保救济粮
```

## [P2] State inconsistency - 行 9804
game.money 修改（行 9804）与 game 其他字段修改（行 9792）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
 9802:                 game.money = 0;
 9803:             } else {
 9804:                 game.money += 15; // 低保救济粮
 9805:             }
 9806:             
```

## [P2] Array out of bounds - 行 9811
数组索引访问可能越界: PET_DATA[petId]。建议添加长度检查。

```javascript
 9809:                 for (const [petId, pet] of Object.entries(game.pets)) {
 9810:                     if (!pet || typeof pet !== 'object') continue;
 9811:                     const petData = PET_DATA[petId];
 9812:                     if (!petData) continue;
 9813:                     const foodCost = petData.dailyFoodCost || 0;
```

## [P2] Array out of bounds - 行 9829
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
 9827:                 for (const [deviceId, level] of Object.entries(game.automation)) {
 9828:                     if (level <= 0) continue;
 9829:                     const device = AUTOMATION_DATA[deviceId];
 9830:                     if (!device) continue;
 9831:                     
```

## [P2] Array out of bounds - 行 9850
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
 9848:                         for (const [animalKey, animals] of Object.entries(game.animals)) {
 9849:                             if (animals.length === 0) continue;
 9850:                             const data = ANIMAL_DATA[animalKey];
 9851:                             if (!data) continue;
 9852:                             const feedReduction = [0, 0.1, 0.2][level - 1] || 0;
```

## [P2] Array out of bounds - 行 9857
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
 9855:                                 for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
 9856:                                     const actualAmount = Math.max(0, Math.ceil(amount * (1 - feedReduction)));
 9857:                                     if ((game.crops[crop] || 0) < actualAmount) {
 9858:                                         canFeed = false;
 9859:                                         break;
```

## [P2] Array out of bounds - 行 9865
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
 9863:                                     for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
 9864:                                         const actualAmount = Math.max(0, Math.ceil(amount * (1 - feedReduction)));
 9865:                                         game.crops[crop] = (game.crops[crop] || 0) - actualAmount;
 9866:                                     }
 9867:                                     animal.weight = Math.min(100, (animal.weight || 50) + 1);
```

## [P2] Array out of bounds - 行 10033
数组索引访问可能越界: CROP_DATA[key]。建议添加长度检查。

```javascript
10031:             game.fields.forEach((field) => {
10032:                 if (field.stage === 'idle' && field.prepared) {
10033:                     const seasonCrops = Object.keys(CROP_DATA).filter(key => CROP_DATA[key].season === game.season);
10034:                     for (const cropKey of seasonCrops) {
10035:                         if (game.seeds && game.seeds[cropKey] > 0) {
```

## [P2] Array out of bounds - 行 10035
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
10033:                     const seasonCrops = Object.keys(CROP_DATA).filter(key => CROP_DATA[key].season === game.season);
10034:                     for (const cropKey of seasonCrops) {
10035:                         if (game.seeds && game.seeds[cropKey] > 0) {
10036:                             game.seeds[cropKey]--;
10037:                             field.crop = cropKey;
```

## [P2] Array out of bounds - 行 10036
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
10034:                     for (const cropKey of seasonCrops) {
10035:                         if (game.seeds && game.seeds[cropKey] > 0) {
10036:                             game.seeds[cropKey]--;
10037:                             field.crop = cropKey;
10038:                             field.stage = 'seedling';
```

## [P2] Array out of bounds - 行 10122
数组索引访问可能越界: beforeFields[idx]。建议添加长度检查。

```javascript
10120:     const maturedCrops = [];
10121:     game.fields.forEach((field, idx) => {
10122:         if (field.crop && field.stage === 'mature' && beforeFields[idx] && beforeFields[idx].stage !== 'mature') {
10123:             maturedCrops.push({
10124:                 fieldIdx: idx,
```

## [P2] Array out of bounds - 行 10140
数组索引访问可能越界: beforeFields[fieldIdx]。建议添加长度检查。

```javascript
10138:         game.fields.forEach((field, fieldIdx) => {
10139:             if (field.crop && field.stage !== 'idle' && field.stage !== 'mature') {
10140:                 if (field.lastWaterDay > ((beforeFields[fieldIdx] && beforeFields[fieldIdx].lastWaterDay) || 0)) {
10141:                     wateredCount++;
10142:                 }
```

## [P2] Array out of bounds - 行 10143
数组索引访问可能越界: beforeFields[fieldIdx]。建议添加长度检查。

```javascript
10141:                     wateredCount++;
10142:                 }
10143:                 if (field.lastWeedDay > ((beforeFields[fieldIdx] && beforeFields[fieldIdx].lastWeedDay) || 0)) {
10144:                     weededCount++;
10145:                 }
```

## [P2] Array out of bounds - 行 10184
数组索引访问可能越界: game.crops[cropType]。建议添加长度检查。

```javascript
10182:     let totalOfflineSell = 0;
10183:     Object.keys(game.crops || {}).forEach(cropType => {
10184:         const amount = game.crops[cropType] || 0;
10185:         if (amount > 0) {
10186:             const price = getSeasonPrice(cropType);
```

## [P2] Array out of bounds - 行 10193
数组索引访问可能越界: game.crops[cropType]。建议添加长度检查。

```javascript
10191:             const money = Math.floor(amount * finalPrice);
10192:             if (!isFinite(money) || money < 0) return;
10193:             game.crops[cropType] = 0;
10194:             game.money += money;
10195:             totalOfflineSell += money;
```

## [P2] State inconsistency - 行 10194
game.money 修改（行 10194）与 game 其他字段修改（行 10196）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
10192:             if (!isFinite(money) || money < 0) return;
10193:             game.crops[cropType] = 0;
10194:             game.money += money;
10195:             totalOfflineSell += money;
10196:             if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 10342
数组索引访问可能越界: game.skills[skillId]。建议添加长度检查。

```javascript
10340:     game.studyToday.count++;
10341:     game.dailyActions.read++;
10342:     addLog(`你看了会书，${game.skills[skillId].name}经验+${add}`, 'action');
10343:     updateDailyButtons();
10344:     updateUI();
```

## [P2] Array out of bounds - 行 10372
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
10370:     let hasItem = false;
10371:     for (const itemId in game.items) {
10372:         if (game.items[itemId] > 0 && ITEM_EFFECTS[itemId]) {
10373:             hasItem = true;
10374:             const item = ITEM_EFFECTS[itemId];
```

## [P2] Array out of bounds - 行 10372
数组索引访问可能越界: ITEM_EFFECTS[itemId]。建议添加长度检查。

```javascript
10370:     let hasItem = false;
10371:     for (const itemId in game.items) {
10372:         if (game.items[itemId] > 0 && ITEM_EFFECTS[itemId]) {
10373:             hasItem = true;
10374:             const item = ITEM_EFFECTS[itemId];
```

## [P2] Array out of bounds - 行 10374
数组索引访问可能越界: ITEM_EFFECTS[itemId]。建议添加长度检查。

```javascript
10372:         if (game.items[itemId] > 0 && ITEM_EFFECTS[itemId]) {
10373:             hasItem = true;
10374:             const item = ITEM_EFFECTS[itemId];
10375:             const div = document.createElement('div');
10376:             div.style.cssText = 'padding: 10px; border: 1px solid #d4b896; border-radius: 8px; background: #fff9f0; text-align: center;';
```

## [P2] Array out of bounds - 行 10383
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
10381:             div.innerHTML = `
10382:                 <div style="font-size: 24px;">${escapeHtml(item.icon)}</div>
10383:                 <div style="margin: 5px 0; font-size: 14px;">${escapeHtml(item.name)} ×${game.items[itemId]}</div>
10384:             `;
10385:             div.appendChild(btn);
```

## [P2] Array out of bounds - 行 10395
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
10393: 
10394: function useItem(itemId) {
10395:     if (!game.items[itemId] || game.items[itemId] <= 0) return;
10396:     const item = ITEM_EFFECTS[itemId];
10397:     if (!item) {
```

## [P2] Array out of bounds - 行 10396
数组索引访问可能越界: ITEM_EFFECTS[itemId]。建议添加长度检查。

```javascript
10394: function useItem(itemId) {
10395:     if (!game.items[itemId] || game.items[itemId] <= 0) return;
10396:     const item = ITEM_EFFECTS[itemId];
10397:     if (!item) {
10398:         console.error('物品效果未定义:', itemId);
```

## [P2] Array out of bounds - 行 10401
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
10399:         return;
10400:     }
10401:     game.items[itemId]--;
10402:     // 加效果
10403:     if (item.use && item.use.stamina) game.stamina = Math.min(game.maxStamina, game.stamina + item.use.stamina);
```

## [P2] Circular reference - 行 10460
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
10458:         }
10459:         game.lastSaveTimestamp = Date.now();
10460:         saveData = JSON.stringify(game);
10461:         localStorage.setItem(SAVE_KEY, saveData);
10462:     } catch(e) {
```

## [P2] Array out of bounds - 行 10508
数组索引访问可能越界: backups[k]。建议添加长度检查。

```javascript
10506:         const transientKeys = ['_saveCount', 'needsRender', 'tickCount', '_lastSaveTime', '_lastUITick', '_healthDeathChecked', '_storageCacheTick', '_storageCacheValue', '_skipNextWorkerProcess', '_questRewardTimeout', '_loadGameSpeedTimeout'];
10507:         const backups = {};
10508:         transientKeys.forEach(k => { backups[k] = game[k]; delete game[k]; });
10509:         try {
10510:             const saveData = JSON.stringify(game, null, 2);
```

## [P2] Array out of bounds - 行 10508
数组索引访问可能越界: game[k]。建议添加长度检查。

```javascript
10506:         const transientKeys = ['_saveCount', 'needsRender', 'tickCount', '_lastSaveTime', '_lastUITick', '_healthDeathChecked', '_storageCacheTick', '_storageCacheValue', '_skipNextWorkerProcess', '_questRewardTimeout', '_loadGameSpeedTimeout'];
10507:         const backups = {};
10508:         transientKeys.forEach(k => { backups[k] = game[k]; delete game[k]; });
10509:         try {
10510:             const saveData = JSON.stringify(game, null, 2);
```

## [P2] State inconsistency - 行 10649
game.money 修改（行 10649）与 game 其他字段修改（行 10648）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
10647:     // 补全核心游戏状态（极旧存档可能缺少这些基础字段）
10648:     if (game.mode == null) game.mode = 'normal';
10649:     if (game.money == null) game.money = 1500;
10650:     if (game.maxHealth === undefined) game.maxHealth = 200;
10651:     if (game.health === undefined) game.health = Math.floor(game.maxHealth * 0.6);
```

## [P2] Array out of bounds - 行 10769
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
10767:     // 如果旧存档的game.npcs是对象格式 { favor: 5, met: true }，需要迁移为数字格式
10768:     for (const npcKey in game.npcs) {
10769:         const val = game.npcs[npcKey];
10770:         if (val && typeof val === 'object' && val.favor !== undefined) {
10771:             game.npcs[npcKey] = val.favor;
```

## [P2] Array out of bounds - 行 10771
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
10769:         const val = game.npcs[npcKey];
10770:         if (val && typeof val === 'object' && val.favor !== undefined) {
10771:             game.npcs[npcKey] = val.favor;
10772:         }
10773:     }
```

## [P2] Array out of bounds - 行 10777
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
10775:     // 将game.npcs中的好感度同步到game.friendship（确保里程碑和加成效果正确）
10776:     for (const npcKey in game.npcs) {
10777:         if (typeof game.npcs[npcKey] === 'number' && game.npcs[npcKey] > 0) {
10778:             game.friendship[npcKey] = game.npcs[npcKey];
10779:         }
```

## [P2] Array out of bounds - 行 10778
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
10776:     for (const npcKey in game.npcs) {
10777:         if (typeof game.npcs[npcKey] === 'number' && game.npcs[npcKey] > 0) {
10778:             game.friendship[npcKey] = game.npcs[npcKey];
10779:         }
10780:     }
```

## [P2] Array out of bounds - 行 10778
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
10776:     for (const npcKey in game.npcs) {
10777:         if (typeof game.npcs[npcKey] === 'number' && game.npcs[npcKey] > 0) {
10778:             game.friendship[npcKey] = game.npcs[npcKey];
10779:         }
10780:     }
```

## [P2] Array out of bounds - 行 10825
数组索引访问可能越界: game.processedItems[k]。建议添加长度检查。

```javascript
10823:         };
10824:         for (const [k, v] of Object.entries(processedDefaults)) {
10825:             if (game.processedItems[k] === undefined) game.processedItems[k] = v;
10826:         }
10827:     }
```

## [P2] Array out of bounds - 行 10833
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
10831:     if (game.builtProcessing) {
10832:         for (const key of Object.keys(game.builtProcessing)) {
10833:             if (game.builtProcessing[key] === true) {
10834:                 game.builtProcessing[key] = 1;
10835:             }
```

## [P2] Array out of bounds - 行 10834
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
10832:         for (const key of Object.keys(game.builtProcessing)) {
10833:             if (game.builtProcessing[key] === true) {
10834:                 game.builtProcessing[key] = 1;
10835:             }
10836:         }
```

## [P2] Array out of bounds - 行 10884
数组索引访问可能越界: game.pets[key]。建议添加长度检查。

```javascript
10882:     if (game.pets) {
10883:         for (const key in game.pets) {
10884:             const pet = game.pets[key];
10885:             if (pet && typeof pet === 'object' && pet.have === false) {
10886:                 // 旧版未领养格式，删除该键
```

## [P2] Array out of bounds - 行 10887
数组索引访问可能越界: game.pets[key]。建议添加长度检查。

```javascript
10885:             if (pet && typeof pet === 'object' && pet.have === false) {
10886:                 // 旧版未领养格式，删除该键
10887:                 game.pets[key] = null;
10888:             } else if (pet && typeof pet === 'object' && pet.have === true) {
10889:                 // 旧版已领养格式，确保新字段存在
```

## [P2] Array out of bounds - 行 10909
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
10907:         // 确保所有已领养宠物数据完整
10908:         for (const petKey of ['dahuang', 'ahua']) {
10909:             if (game.pets[petKey]) {
10910:                 const pet = game.pets[petKey];
10911:                 if (pet.affection === undefined) pet.affection = pet.friendship || 10;
```

## [P2] Array out of bounds - 行 10910
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
10908:         for (const petKey of ['dahuang', 'ahua']) {
10909:             if (game.pets[petKey]) {
10910:                 const pet = game.pets[petKey];
10911:                 if (pet.affection === undefined) pet.affection = pet.friendship || 10;
10912:                 if (pet.friendship === undefined) pet.friendship = pet.affection || 10;
```

## [P2] Array out of bounds - 行 10955
数组索引访问可能越界: CROP_DATA[newCropId]。建议添加长度检查。

```javascript
10953:                 const newCropId = cropType + '_' + season;
10954:                 // 检查新ID是否存在，若不存在则尝试其他季节
10955:                 if (CROP_DATA[newCropId]) {
10956:                     field.crop = newCropId;
10957:                 } else {
```

## [P2] Array out of bounds - 行 10988
数组索引访问可能越界: game.skills[key]。建议添加长度检查。

```javascript
10986:     if (!game.skills) game.skills = {};
10987:     for (const [key, defaults] of Object.entries(SKILL_DEFAULTS)) {
10988:         if (!game.skills[key]) game.skills[key] = { level: 0, exp: 0 };
10989:         if (game.skills[key].name === undefined) game.skills[key].name = defaults.name;
10990:         if (game.skills[key].expNeeded === undefined) game.skills[key].expNeeded = defaults.expNeeded;
```

## [P2] Array out of bounds - 行 10989
数组索引访问可能越界: game.skills[key]。建议添加长度检查。

```javascript
10987:     for (const [key, defaults] of Object.entries(SKILL_DEFAULTS)) {
10988:         if (!game.skills[key]) game.skills[key] = { level: 0, exp: 0 };
10989:         if (game.skills[key].name === undefined) game.skills[key].name = defaults.name;
10990:         if (game.skills[key].expNeeded === undefined) game.skills[key].expNeeded = defaults.expNeeded;
10991:     }
```

## [P2] Array out of bounds - 行 10990
数组索引访问可能越界: game.skills[key]。建议添加长度检查。

```javascript
10988:         if (!game.skills[key]) game.skills[key] = { level: 0, exp: 0 };
10989:         if (game.skills[key].name === undefined) game.skills[key].name = defaults.name;
10990:         if (game.skills[key].expNeeded === undefined) game.skills[key].expNeeded = defaults.expNeeded;
10991:     }
10992:     
```

## [P2] Array out of bounds - 行 11021
数组索引访问可能越界: game.quests[key]。建议添加长度检查。

```javascript
11019:     if (game.quests) {
11020:         Object.keys(QUEST_DATA || {}).forEach(key => {
11021:             if (game.quests[key] === undefined) game.quests[key] = false;
11022:         });
11023:     } else {
```

## [P2] Array out of bounds - 行 11025
数组索引访问可能越界: game.quests[key]。建议添加长度检查。

```javascript
11023:     } else {
11024:         game.quests = {};
11025:         Object.keys(QUEST_DATA || {}).forEach(key => { game.quests[key] = false; });
11026:     }
11027:     
```

## [P2] Array out of bounds - 行 11037
数组索引访问可能越界: game.seeds[key]。建议添加长度检查。

```javascript
11035:     const defaultSeeds = { rice_spring: 0, rice_summer: 0, sweet_spring: 0, sweet_autumn: 0, wheat_spring: 0, wheat_autumn: 0, corn_summer: 0, soybean_spring: 0, soybean_summer: 0, potato_spring: 0, potato_autumn: 0, peanut_summer: 0, pepper_summer: 0, pepper_autumn: 0, cabbage_autumn: 0, cabbage_winter: 0, radish_autumn: 0, radish_winter: 0, eggplant_summer: 0, eggplant_autumn: 0, garlic_autumn: 0, garlic_spring: 0 };
11036:     for (const [key, val] of Object.entries(defaultSeeds)) {
11037:         if (game.seeds[key] === undefined) game.seeds[key] = val;
11038:     }
11039:     if (!game.items) game.items = { fertilizer: 0, pesticide: 0, bun: 0, medicine: 0, organicFertilizer: 0, fish: 0 };
```

## [P2] State inconsistency - 行 11126
game.money 修改（行 11126）与 game 其他字段修改（行 11107）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
11124:         return (typeof val === 'number' && isFinite(val) && !isNaN(val)) ? val : fallback;
11125:     }
11126:     game.money = sanitizeNumber(game.money, 1500);
11127:     game.health = sanitizeNumber(game.health, 100);
11128:     game.stamina = sanitizeNumber(game.stamina, 100);
```

## [P2] NaN/Infinity - 行 11332
parseInt/parseFloat 结果未做 NaN 防护: if (parseInt(btn.textContent, 10) === speed) {

```javascript
11330:     document.querySelectorAll('.speed-btn').forEach(btn => {
11331:         btn.classList.remove('active');
11332:         if (parseInt(btn.textContent, 10) === speed) {
11333:             btn.classList.add('active');
11334:         }
```

## [P2] NaN/Infinity - 行 11339
parseInt/parseFloat 结果未做 NaN 防护: if (parseInt(btn.textContent, 10) === speed) {

```javascript
11337:     document.querySelectorAll('.speed-btn-top').forEach(btn => {
11338:         btn.classList.remove('active');
11339:         if (parseInt(btn.textContent, 10) === speed) {
11340:             btn.classList.add('active');
11341:         }
```

## [P2] NaN/Infinity - 行 11368
parseInt/parseFloat 结果未做 NaN 防护: const parsedSpeed = parseInt(saved, 10);

```javascript
11366:     const saved = safeStorageGet('farm_game_speed');
11367:     if (saved) {
11368:         const parsedSpeed = parseInt(saved, 10);
11369:     gameSpeed = isNaN(parsedSpeed) ? 1 : parsedSpeed;
11370:     }
```

## [P2] NaN/Infinity - 行 11378
parseInt/parseFloat 结果未做 NaN 防护: if (parseInt(btn.textContent, 10) === gameSpeed) {

```javascript
11376:         // 设置弹窗内的按钮
11377:         document.querySelectorAll('.speed-btn').forEach(btn => {
11378:             if (parseInt(btn.textContent, 10) === gameSpeed) {
11379:                 btn.classList.add('active');
11380:             } else {
```

## [P2] NaN/Infinity - 行 11386
parseInt/parseFloat 结果未做 NaN 防护: if (parseInt(btn.textContent, 10) === gameSpeed) {

```javascript
11384:         // 顶部的时间流速按钮
11385:         document.querySelectorAll('.speed-btn-top').forEach(btn => {
11386:             if (parseInt(btn.textContent, 10) === gameSpeed) {
11387:                 btn.classList.add('active');
11388:             } else {
```

## [P2] State inconsistency - 行 11507
game.money 修改（行 11507）与 game 其他字段修改（行 11515）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
11505:         const seasonRent = houseData.rent;
11506:         if (game.money >= seasonRent) {
11507:             game.money -= seasonRent;
11508:             addLog(`🏠 换季交租-${seasonRent}元（${houseData.name}整季租金）`, 'info');
11509:         } else {
```

## [P2] State inconsistency - 行 11510
game.money 修改（行 11510）与 game 其他字段修改（行 11515）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
11508:             addLog(`🏠 换季交租-${seasonRent}元（${houseData.name}整季租金）`, 'info');
11509:         } else {
11510:             game.money = 0;
11511:             addLog(`🏠 换季交租！钱不够，房东发了好大的火...`, 'bad');
11512:         }
```

## [P2] Game balance - 行 11567
极大的数值 1000000 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
11565:     if (!game.tickCount) game.tickCount = 0;
11566:     game.tickCount++;
11567:     if (game.tickCount > 1000000) game.tickCount = 0;
11568:     
11569:     // 每30秒保存一次（基于时间戳，不受游戏速度影响），或新的一天立即保存
```

## [P2] Array out of bounds - 行 11654
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
11652:         for (const [deviceId, level] of Object.entries(game.automation)) {
11653:             if (level <= 0) continue;
11654:             const device = AUTOMATION_DATA[deviceId];
11655:             if (!device) continue;
11656:             
```

## [P2] Array out of bounds - 行 11696
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
11694:                     for (const [animalKey, animals] of Object.entries(game.animals)) {
11695:                         if (animals.length === 0) continue;
11696:                         const data = ANIMAL_DATA[animalKey];
11697:                         if (!data) continue;
11698:                         // 饲料消耗减免：Lv1=0%, Lv2=10%, Lv3=20%
```

## [P2] Array out of bounds - 行 11704
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
11702:                             for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
11703:                                 const actualAmount = Math.max(0, Math.ceil(amount * (1 - feedReduction)));
11704:                                 if ((game.crops[crop] || 0) < actualAmount) {
11705:                                     canFeed = false;
11706:                                     break;
```

## [P2] Array out of bounds - 行 11712
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
11710:                                 for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
11711:                                     const actualAmount = Math.max(0, amount * (1 - feedReduction));
11712:                                     game.crops[crop] -= actualAmount;
11713:                                 }
11714:                                 animal.weight = Math.min(100, (animal.weight || 50) + 1);
```

## [P2] Array out of bounds - 行 11800
数组索引访问可能越界: PET_DATA[petId]。建议添加长度检查。

```javascript
11798:         for (const [petId, pet] of Object.entries(game.pets)) {
11799:             if (!pet || typeof pet !== 'object') continue;
11800:             const petData = PET_DATA[petId];
11801:             if (!petData) continue;
11802:             const foodCost = petData.dailyFoodCost || 0;
```

## [P2] State inconsistency - 行 11824
game.money 修改（行 11824）与 game 其他字段修改（行 11842）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
11822:     //         addLog(`🏠 房屋租金-${dailyRent}元`, 'info');
11823:     //     } else {
11824:     //         game.money = 0;
11825:     //         addLog(`🏠 没钱交房租了！房东很不高兴...`, 'bad');
11826:     //     }
```

## [P2] Array out of bounds - 行 11883
数组索引访问可能越界: NEIGHBOR_HELP_DATA[helpId]。建议添加长度检查。

```javascript
11881:         for (const [helpId, active] of Object.entries(game.neighborHelp)) {
11882:             if (!active) continue;
11883:             const help = NEIGHBOR_HELP_DATA[helpId];
11884:             if (!help) continue;
11885:             
```

## [P2] Array out of bounds - 行 11947
数组索引访问可能越界: game.pets[k]。建议添加长度检查。

```javascript
11945:     if (game.pets) {
11946:         Object.keys(game.pets).forEach(k => {
11947:             if (!game.pets[k]) return; // 跳过空条目
11948:             game.pets[k].petToday = 0;
11949:             game.pets[k].fedToday = false;
```

## [P2] Array out of bounds - 行 11948
数组索引访问可能越界: game.pets[k]。建议添加长度检查。

```javascript
11946:         Object.keys(game.pets).forEach(k => {
11947:             if (!game.pets[k]) return; // 跳过空条目
11948:             game.pets[k].petToday = 0;
11949:             game.pets[k].fedToday = false;
11950:         });
```

## [P2] Array out of bounds - 行 11949
数组索引访问可能越界: game.pets[k]。建议添加长度检查。

```javascript
11947:             if (!game.pets[k]) return; // 跳过空条目
11948:             game.pets[k].petToday = 0;
11949:             game.pets[k].fedToday = false;
11950:         });
11951:     }
```

## [P2] Array out of bounds - 行 11974
数组索引访问可能越界: names[petId]。建议添加长度检查。

```javascript
11972:             const names = { dahuang: '大黄', ahua: '阿花' };
11973:             game.mood = Math.min(100, (game.mood === undefined ? 50 : game.mood) + 3);
11974:             addLog(`🎁 ${names[petId]}${gift.icon} ${gift.text} 心情+3`, 'pet');
11975:         }
11976:     }
```

## [P2] Array out of bounds - 行 11984
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
11982:         for (const [animalKey, animals] of Object.entries(game.animals)) {
11983:             if (!animals || animals.length === 0) continue;
11984:             const data = ANIMAL_DATA[animalKey];
11985:             if (!data) continue;
11986:             
```

## [P2] Array out of bounds - 行 12006
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
12004:                 let canFeed = true;
12005:                 for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
12006:                     if ((game.crops[crop] || 0) < amount) {
12007:                         canFeed = false;
12008:                         break;
```

## [P2] Array out of bounds - 行 12014
数组索引访问可能越界: game.crops[crop]。建议添加长度检查。

```javascript
12012:                 if (canFeed) {
12013:                     for (const [crop, amount] of Object.entries(data.dailyFeed || {})) {
12014:                         game.crops[crop] -= amount;
12015:                     }
12016:                     animal.weight = Math.min(100, (animal.weight || 50) + 2);
```

## [P2] Array out of bounds - 行 12057
数组索引访问可能越界: VILLAGE_PROJECTS[key]。建议添加长度检查。

```javascript
12055:         for (const [key, level] of Object.entries(game.villageProjects)) {
12056:             if (level <= 0) continue;
12057:             const project = VILLAGE_PROJECTS[key];
12058:             if (!project) continue;
12059:             
```

## [P2] State inconsistency - 行 12084
game.money 修改（行 12084）与 game 其他字段修改（行 12096）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
12082:             const guests = Math.floor(Math.random() * levelData.maxGuests) + 1;
12083:             const income = levelData.dailyIncome * guests;
12084:             game.money += income;
12085:             game.farmStay.guests = guests;
12086:             addLog(`🏡 农家乐今日接待 ${guests} 位客人，收入 ${income} 元`, 'good');
```

## [P2] State inconsistency - 行 12119
game.money 修改（行 12119）与 game 其他字段修改（行 12103）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
12117:         let actualCost = 0;
12118:         if (game.money >= medicalCost) {
12119:             game.money -= medicalCost;
12120:             actualCost = medicalCost;
12121:         } else if (game.money > 0) {
```

## [P2] State inconsistency - 行 12123
game.money 修改（行 12123）与 game 其他字段修改（行 12109）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
12121:         } else if (game.money > 0) {
12122:             actualCost = game.money;
12123:             game.money = 0;
12124:         } else {
12125:             actualCost = 0; // 没钱就不扣了，避免死亡螺旋
```

## [P2] Array out of bounds - 行 12166
数组索引访问可能越界: WEATHER_DATA[nextWeather]。建议添加长度检查。

```javascript
12164:         if (nextWeather !== game.weather) {
12165:             game.weather = nextWeather;
12166:             const w = WEATHER_DATA[nextWeather];
12167:             addLog(`${w.emoji} 天气变为：${w.name}`, 'info');
12168:         }
```

## [P2] NaN/Infinity - 行 13488
除法运算可能除零: ]/gu。建议对分母添加零值检查或 || 1 防护。

```javascript
13486: // 显示故事事件弹窗（用于 STORY_EVENTS 数组中的事件）
13487: function showEventPopup(event) {
13488:     const eventId = 'story_' + event.name.replace(/[\s\u{1F300}-\u{1F9FF}]/gu, '_');
13489:     // 创建副本，避免修改原事件对象
13490:     const eventCopy = { ...event, id: eventId };
```

## [P2] Array out of bounds - 行 13492
数组索引访问可能越界: window.STORY_EVENTS_MAP[eventId]。建议添加长度检查。

```javascript
13490:     const eventCopy = { ...event, id: eventId };
13491:     if (!window.STORY_EVENTS_MAP) window.STORY_EVENTS_MAP = {};
13492:     window.STORY_EVENTS_MAP[eventId] = eventCopy;
13493:     if (game) game.currentEvent = eventId;
13494:     showEventModal(eventCopy);
```

## [P2] Array out of bounds - 行 13550
数组索引访问可能越界: names[skillKey]。建议添加长度检查。

```javascript
13548:         fishingMastery: '钓鱼技巧'
13549:     };
13550:     return names[skillKey] || skillKey;
13551: }
13552: 
```

## [P2] Array out of bounds - 行 13556
数组索引访问可能越界: game.skills[skillKey]。建议添加长度检查。

```javascript
13554:     // 统一使用addSkillExp处理升级，避免双系统不一致
13555:     // 此函数保留兼容旧代码调用，但逻辑统一
13556:     if (!game.skills[skillKey]) return;
13557:     const skill = game.skills[skillKey];
13558:     const currentLevel = getSkillLevel(skill.exp || 0);
```

## [P2] Array out of bounds - 行 13557
数组索引访问可能越界: game.skills[skillKey]。建议添加长度检查。

```javascript
13555:     // 此函数保留兼容旧代码调用，但逻辑统一
13556:     if (!game.skills[skillKey]) return;
13557:     const skill = game.skills[skillKey];
13558:     const currentLevel = getSkillLevel(skill.exp || 0);
13559:     if (currentLevel > (skill.level || 0)) {
```

## [P2] Array out of bounds - 行 13582
数组索引访问可能越界: EVENTS[eventId]。建议添加长度检查。

```javascript
13580: function handleEventChoice(optionIdx) {
13581:     const eventId = game.currentEvent;
13582:     let event = EVENTS[eventId];
13583:     // 支持故事事件
13584:     if (!event && window.STORY_EVENTS_MAP && window.STORY_EVENTS_MAP[eventId]) {
```

## [P2] Array out of bounds - 行 13584
数组索引访问可能越界: window.STORY_EVENTS_MAP[eventId]。建议添加长度检查。

```javascript
13582:     let event = EVENTS[eventId];
13583:     // 支持故事事件
13584:     if (!event && window.STORY_EVENTS_MAP && window.STORY_EVENTS_MAP[eventId]) {
13585:         event = window.STORY_EVENTS_MAP[eventId];
13586:     }
```

## [P2] Array out of bounds - 行 13585
数组索引访问可能越界: window.STORY_EVENTS_MAP[eventId]。建议添加长度检查。

```javascript
13583:     // 支持故事事件
13584:     if (!event && window.STORY_EVENTS_MAP && window.STORY_EVENTS_MAP[eventId]) {
13585:         event = window.STORY_EVENTS_MAP[eventId];
13586:     }
13587:     if (!event || !event.options || !event.options[optionIdx]) {
```

## [P2] Array out of bounds - 行 13587
数组索引访问可能越界: event.options[optionIdx]。建议添加长度检查。

```javascript
13585:         event = window.STORY_EVENTS_MAP[eventId];
13586:     }
13587:     if (!event || !event.options || !event.options[optionIdx]) {
13588:         console.error('事件或选项不存在:', eventId, optionIdx);
13589:         closeEventModal();
```

## [P2] Array out of bounds - 行 13592
数组索引访问可能越界: event.options[optionIdx]。建议添加长度检查。

```javascript
13590:         return;
13591:     }
13592:     const option = event.options[optionIdx];
13593:     
13594:     // 检查物品消耗（如农药、化肥等）
```

## [P2] Array out of bounds - 行 13607
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
13605:         for (const [itemId, val] of Object.entries(checkEffect.items)) {
13606:             if (val < 0) {
13607:                 const current = (game.items[itemId] || 0);
13608:                 if (current < Math.abs(val)) {
13609:                     showToast(`${(typeof ITEM_DATA !== 'undefined' &&(ITEM_DATA[itemId] && ITEM_DATA[itemId].name)) || itemId}不足！`, 'bad');
```

## [P2] Array out of bounds - 行 13609
数组索引访问可能越界: ITEM_DATA[itemId]。建议添加长度检查。

```javascript
13607:                 const current = (game.items[itemId] || 0);
13608:                 if (current < Math.abs(val)) {
13609:                     showToast(`${(typeof ITEM_DATA !== 'undefined' &&(ITEM_DATA[itemId] && ITEM_DATA[itemId].name)) || itemId}不足！`, 'bad');
13610:                     playErrorSound();
13611:                     return;
```

## [P2] State inconsistency - 行 13673
game.money 修改（行 13673）与 game 其他字段修改（行 13670）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
13671:     }
13672:     if (effect.money) {
13673:         game.money += effect.money;
13674:         if (game.money < 0) game.money = 0;
13675:     }
```

## [P2] State inconsistency - 行 13674
game.money 修改（行 13674）与 game 其他字段修改（行 13670）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
13672:     if (effect.money) {
13673:         game.money += effect.money;
13674:         if (game.money < 0) game.money = 0;
13675:     }
13676:     if (effect.reputation) {
```

## [P2] Array out of bounds - 行 13720
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
13718:         if (!game.items) game.items = {};
13719:         for (const [itemId, val] of Object.entries(effect.items)) {
13720:             game.items[itemId] = (game.items[itemId] || 0) + val;
13721:             if (game.items[itemId] < 0) game.items[itemId] = 0;
13722:         }
```

## [P2] Array out of bounds - 行 13721
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
13719:         for (const [itemId, val] of Object.entries(effect.items)) {
13720:             game.items[itemId] = (game.items[itemId] || 0) + val;
13721:             if (game.items[itemId] < 0) game.items[itemId] = 0;
13722:         }
13723:     }
```

## [P2] Array out of bounds - 行 13731
数组索引访问可能越界: game.pets[petId]。建议添加长度检查。

```javascript
13729:     if (effect.pets) {
13730:         for (const [petId, petEffect] of Object.entries(effect.pets)) {
13731:             if (game.pets && game.pets[petId]) {
13732:                 if (petEffect.favor) {
13733:                     game.pets[petId].affection = Math.max(0, (game.pets[petId].affection || game.pets[petId].friendship || 0) + petEffect.favor);
```

## [P2] Array out of bounds - 行 13733
数组索引访问可能越界: game.pets[petId]。建议添加长度检查。

```javascript
13731:             if (game.pets && game.pets[petId]) {
13732:                 if (petEffect.favor) {
13733:                     game.pets[petId].affection = Math.max(0, (game.pets[petId].affection || game.pets[petId].friendship || 0) + petEffect.favor);
13734:                 }
13735:             }
```

## [P2] Array out of bounds - 行 13747
数组索引访问可能越界: skillMap[key]。建议添加长度检查。

```javascript
13745:         const skillMap = { fieldManage: 'fieldManagement', cropFamiliar: 'cropFamiliarity' };
13746:         for (const [key, val] of Object.entries(effect.skills)) {
13747:             const mappedKey = skillMap[key] || key;
13748:             if (typeof addSkillExp === 'function') {
13749:                 addSkillExp(mappedKey, val);
```

## [P2] Array out of bounds - 行 13815
数组索引访问可能越界: game.seeds[seedId]。建议添加长度检查。

```javascript
13813:         if (!game.seeds) game.seeds = {};
13814:         for (const [seedId, val] of Object.entries(effect.seeds)) {
13815:             game.seeds[seedId] = (game.seeds[seedId] || 0) + val;
13816:         }
13817:         addLog(`🌱 获得了种子奖励！`, 'good');
```

## [P2] NaN/Infinity - 行 13865
除法运算可能除零: elapsed / job.duration。建议对分母添加零值检查或 || 1 防护。

```javascript
13863:         const jobTotalTime = (job.startTotalDay || job.startDay) * 24 + job.startTime;
13864:         const elapsed = Math.max(0, currentTotalTime - jobTotalTime);
13865:         job.progress = Math.min(100, Math.max(0, Math.floor((elapsed / job.duration) * 100)));
13866:         
13867:         if (elapsed >= job.duration) {
```

## [P2] NaN/Infinity - 行 13957
除法运算可能除零: growRate / TRANSPLANT_NEED_DAYS。建议对分母添加零值检查或 || 1 防护。

```javascript
13955:                 field.step = 3;
13956:             }
13957:             const progress = Math.min(20, Math.max(0, (transplantDays * growRate / TRANSPLANT_NEED_DAYS) * 20));
13958:             field.growProgress = 20 + progress;
13959:             return;
```

## [P2] NaN/Infinity - 行 13974
除法运算可能除零: growRate / totalGrowingDays。建议对分母添加零值检查或 || 1 防护。

```javascript
13972:             }
13973:             
13974:             field.growProgress = 40 + Math.min(50, Math.max(0, (growingDays * growRate / totalGrowingDays) * 50));
13975:             
13976:             // 生长期结束，成熟
```

## [P2] State inconsistency - 行 14016
game.money 修改（行 14016）与 game 其他字段修改（行 14017）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
14014: 
14015:     // 边界值保护：防止负数
14016:     game.money = Math.max(0, game.money);
14017:     game.stamina = Math.max(0, Math.min(game.maxStamina, game.stamina));
14018:     game.health = Math.max(0, Math.min(game.maxHealth, game.health));
```

## [P2] Event listener leaks - 行 14136
addEventListener 使用匿名函数绑定 tab.click，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
14134:         window._sidebarTabBound = true;
14135:         document.querySelectorAll('.sidebar-tab').forEach(tab => {
14136:             tab.addEventListener('click', function() {
14137:                 if (this.classList.contains('locked')) return;
14138:                 if (!this.dataset.tab) return;
```

## [P2] Event listener leaks - 行 14136
addEventListener (tab.click, function) 缺少对应的 removeEventListener。

```javascript
14134:         window._sidebarTabBound = true;
14135:         document.querySelectorAll('.sidebar-tab').forEach(tab => {
14136:             tab.addEventListener('click', function() {
14137:                 if (this.classList.contains('locked')) return;
14138:                 if (!this.dataset.tab) return;
```

## [P2] Array out of bounds - 行 14316
数组索引访问可能越界: seasonLabels[currentSeason]。建议添加长度检查。

```javascript
14314:     const seasonColors = { spring: '#27ae60', summer: '#e67e22', autumn: '#d35400', winter: '#3498db' };
14315:     const currentSeason = game.season || 'spring';
14316:     const seasonLabel = seasonLabels[currentSeason] || currentSeason;
14317:     const seasonColor = seasonColors[currentSeason] || '#666';
14318:     
```

## [P2] Array out of bounds - 行 14317
数组索引访问可能越界: seasonColors[currentSeason]。建议添加长度检查。

```javascript
14315:     const currentSeason = game.season || 'spring';
14316:     const seasonLabel = seasonLabels[currentSeason] || currentSeason;
14317:     const seasonColor = seasonColors[currentSeason] || '#666';
14318:     
14319:     // 获取当前季节可种植的作物
```

## [P2] Array out of bounds - 行 14433
数组索引访问可能越界: game.crops[type]。建议添加长度检查。

```javascript
14431:             const cropTypes = ['rice', 'sweet', 'wheat', 'corn', 'soybean', 'potato', 'peanut', 'pepper', 'cabbage', 'radish', 'eggplant', 'garlic'];
14432:             cropTypes.forEach(type => {
14433:                 const amount = (game.crops && game.crops[type]) || 0;
14434:                 if (amount > 0) {
14435:                     cropValue += amount * getSeasonPrice(type);
```

## [P2] Array out of bounds - 行 14475
数组索引访问可能越界: game.npcs[key]。建议添加长度检查。

```javascript
14473:             let count = 0;
14474:             for (const key in game.npcs) {
14475:                 if (game.npcs[key] >= 40) count++;
14476:             }
14477:             return count >= 3;
```

## [P2] Array out of bounds - 行 14489
数组索引访问可能越界: game.pets[key]。建议添加长度检查。

```javascript
14487:             let count = 0;
14488:             for (const key in game.pets) {
14489:                 if (game.pets[key]) count++;
14490:             }
14491:             return count >= 2;
```

## [P2] Array out of bounds - 行 14542
数组索引访问可能越界: q[questId]。建议添加长度检查。

```javascript
14540: function getQuestProgress(questId) {
14541:     const q = game.quests;
14542:     if (q[questId]) return 100;
14543:     
14544:     // 根据任务类型精确计算进度
```

## [P2] Array out of bounds - 行 14571
数组索引访问可能越界: progressMap[questId]。建议添加长度检查。

```javascript
14569:     };
14570:     
14571:     return progressMap[questId] || 0;
14572: }
14573: 
```

## [P2] NaN/Infinity - 行 14751
parseInt/parseFloat 结果未做 NaN 防护: const questNum = parseInt(quest.id.slice(1), 10);

```javascript
14749:             } else {
14750:                 // 其他任务简单估算
14751:                 const questNum = parseInt(quest.id.slice(1), 10);
14752:                 const completedBefore = Object.keys(q).filter(k => k.startsWith('q') && parseInt(k.slice(1), 10) < questNum && q[k]).length;
14753:                 const totalBefore = questNum;
```

## [P2] NaN/Infinity - 行 14752
parseInt/parseFloat 结果未做 NaN 防护: const completedBefore = Object.keys(q).filter(k => k.startsWith('q') && parseInt(k.slice(1), 10) < questNum && q[k]).length;

```javascript
14750:                 // 其他任务简单估算
14751:                 const questNum = parseInt(quest.id.slice(1), 10);
14752:                 const completedBefore = Object.keys(q).filter(k => k.startsWith('q') && parseInt(k.slice(1), 10) < questNum && q[k]).length;
14753:                 const totalBefore = questNum;
14754:                 progress = Math.min(95, (completedBefore / Math.max(1, totalBefore)) * 100);
```

## [P2] NaN/Infinity - 行 14754
除法运算可能除零: completedBefore / Math.max。建议对分母添加零值检查或 || 1 防护。

```javascript
14752:                 const completedBefore = Object.keys(q).filter(k => k.startsWith('q') && parseInt(k.slice(1), 10) < questNum && q[k]).length;
14753:                 const totalBefore = questNum;
14754:                 progress = Math.min(95, (completedBefore / Math.max(1, totalBefore)) * 100);
14755:                 progressText = '进行中';
14756:             }
```

## [P2] Array out of bounds - 行 14942
数组索引访问可能越界: TAB_UNLOCK_CONFIG[tabKey]。建议添加长度检查。

```javascript
14940:     tabs.forEach(tab => {
14941:         const tabKey = tab.dataset.tab;
14942:         const config = TAB_UNLOCK_CONFIG[tabKey];
14943:         
14944:         if (!config) return;
```

## [P2] Array out of bounds - 行 14947
数组索引访问可能越界: game.unlockedTabs[tabKey]。建议添加长度检查。

```javascript
14945:         
14946:         // 已永久解锁的不再检查
14947:         if (game.unlockedTabs[tabKey]) {
14948:             if (tab.classList.contains('locked')) {
14949:                 tab.classList.remove('locked');
```

## [P2] Array out of bounds - 行 14960
数组索引访问可能越界: game.unlockedTabs[tabKey]。建议添加长度检查。

```javascript
14958:             if (wasLocked) {
14959:                 tab.classList.remove('locked');
14960:                 game.unlockedTabs[tabKey] = true; // 永久解锁
14961:                 newlyUnlocked.push(config.name);
14962:             }
```

## [P2] Array out of bounds - 行 14991
数组索引访问可能越界: game.quests[id]。建议添加长度检查。

```javascript
14989:                 btn.innerHTML = '▲ 收起任务列表';
14990:             } else {
14991:                 const totalPending = Object.keys(QUEST_DATA).filter(id => !game.quests[id]).length;
14992:                 btn.innerHTML = `▼ 查看全部任务 (${totalPending})`;
14993:             }
```

## [P2] Array out of bounds - 行 15045
数组索引访问可能越界: game.seeds[key]。建议添加长度检查。

```javascript
15043:                 html += '<div style="font-size: 11px; color: #999; text-align: center; margin-bottom: 8px;">本季剩余 ' + daysLeftInSeason + ' 天</div>';
15044:                 availableCrops.forEach(([key, data]) => {
15045:                     const hasSeed = game.seeds[key] > 0;
15046:                     const canHarvestInTime = data.growDays <= daysLeftInSeason + 10; // 留10天缓冲
15047:                     
```

## [P2] Array out of bounds - 行 15203
数组索引访问可能越界: descs[stage]。建议添加长度检查。

```javascript
15201:         mature: '成熟'
15202:     };
15203:     return descs[stage] || stage;
15204: }
15205: 
```

## [P2] Array out of bounds - 行 15232
数组索引访问可能越界: texts[stage]。建议添加长度检查。

```javascript
15230:         }[type] || '作物已经成熟了，可以收获了！'
15231:     };
15232:     return texts[stage] || '';
15233: }
15234: 
```

## [P2] Circular reference - 行 15262
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15260:     
15261:     panel.innerHTML = html;
15262:     panel._lastRenderFields = JSON.stringify(game.fields);
15263:     
15264:     // 绑定页签点击（使用事件委托，避免重复绑定）
```

## [P2] Event listener leaks - 行 15267
addEventListener 使用匿名函数绑定 panel.click，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
15265:     if (!panel._shopTabDelegated) {
15266:         panel._shopTabDelegated = true;
15267:         panel.addEventListener('click', function(e) {
15268:             const tab = e.target.closest('.shop-tab');
15269:             if (!tab) return;
```

## [P2] Event listener leaks - 行 15267
addEventListener (panel.click, function) 缺少对应的 removeEventListener。

```javascript
15265:     if (!panel._shopTabDelegated) {
15266:         panel._shopTabDelegated = true;
15267:         panel.addEventListener('click', function(e) {
15268:             const tab = e.target.closest('.shop-tab');
15269:             if (!tab) return;
```

## [P2] Array out of bounds - 行 15303
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
15301:     
15302:     cropTypes.forEach(cropKey => {
15303:         const amount = game.crops[cropKey] || 0;
15304:         if (amount < 1) return; // 只显示有库存的作物
15305:         const price = getSeasonPrice(cropKey);
```

## [P2] Array out of bounds - 行 15308
数组索引访问可能越界: cropEmojis[cropKey]。建议添加长度检查。

```javascript
15306:         html += `<div class="shop-item">
15307:                     <div class="shop-item-info">
15308:                         <div class="shop-item-icon">${cropEmojis[cropKey] || '🌱'}</div>
15309:                         <div>
15310:                             <div class="shop-item-name">${cropNames[cropKey] || cropKey}</div>
```

## [P2] Array out of bounds - 行 15310
数组索引访问可能越界: cropNames[cropKey]。建议添加长度检查。

```javascript
15308:                         <div class="shop-item-icon">${cropEmojis[cropKey] || '🌱'}</div>
15309:                         <div>
15310:                             <div class="shop-item-name">${cropNames[cropKey] || cropKey}</div>
15311:                             <div class="shop-item-desc">库存：${Math.floor(amount)} 斤</div>
15312:                         </div>
```

## [P2] Array out of bounds - 行 15415
数组索引访问可能越界: seasonPriority[sa]。建议添加长度检查。

```javascript
15413:         const sb = b[1].season;
15414:         // 先按季节优先级排
15415:         if (seasonPriority[sa] !== seasonPriority[sb]) {
15416:             return (seasonPriority[sa] || 99) - (seasonPriority[sb] || 99);
15417:         }
```

## [P2] Array out of bounds - 行 15415
数组索引访问可能越界: seasonPriority[sb]。建议添加长度检查。

```javascript
15413:         const sb = b[1].season;
15414:         // 先按季节优先级排
15415:         if (seasonPriority[sa] !== seasonPriority[sb]) {
15416:             return (seasonPriority[sa] || 99) - (seasonPriority[sb] || 99);
15417:         }
```

## [P2] Array out of bounds - 行 15416
数组索引访问可能越界: seasonPriority[sa]。建议添加长度检查。

```javascript
15414:         // 先按季节优先级排
15415:         if (seasonPriority[sa] !== seasonPriority[sb]) {
15416:             return (seasonPriority[sa] || 99) - (seasonPriority[sb] || 99);
15417:         }
15418:         // 同季节按类型顺序（rice, sweet, wheat, corn, soybean）
```

## [P2] Array out of bounds - 行 15416
数组索引访问可能越界: seasonPriority[sb]。建议添加长度检查。

```javascript
15414:         // 先按季节优先级排
15415:         if (seasonPriority[sa] !== seasonPriority[sb]) {
15416:             return (seasonPriority[sa] || 99) - (seasonPriority[sb] || 99);
15417:         }
15418:         // 同季节按类型顺序（rice, sweet, wheat, corn, soybean）
```

## [P2] Array out of bounds - 行 15426
数组索引访问可能越界: game.seeds[key]。建议添加长度检查。

```javascript
15424:     sortedCrops.forEach(([key, data]) => {
15425:         const inSeason = data.season === game.season;
15426:         const owned = game.seeds[key] || 0;
15427:         
15428:         // 季节分隔线
```

## [P2] Array out of bounds - 行 15545
数组索引访问可能越界: HOUSE_DATA[houseName]。建议添加长度检查。

```javascript
15543:     
15544:     houseOrder.forEach(houseName => {
15545:         const house = HOUSE_DATA[houseName];
15546:         const isCurrent = game.house === houseName;
15547:         const currentIndex = houseOrder.indexOf(game.house);
```

## [P2] Circular reference - 行 15580
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15578:     
15579:     panel.innerHTML = html;
15580:     panel._lastRenderFields = JSON.stringify(game.fields);
15581: }
15582: 
```

## [P2] Circular reference - 行 15692
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15690:     
15691:     panel.innerHTML = html;
15692:     panel._lastRenderFields = JSON.stringify(game.fields);
15693: }
15694: 
```

## [P2] NaN/Infinity - 行 15722
除法运算可能除零: elapsed / total。建议对分母添加零值检查或 || 1 防护。

```javascript
15720:         const elapsed = (game.totalDay || game.day) - startDay;
15721:         const total = 3;
15722:         const progress = Math.min(100, (elapsed / total) * 100);
15723:         const ready = elapsed >= total;
15724:         
```

## [P2] Circular reference - 行 15778
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15776:     
15777:     panel.innerHTML = html;
15778:     panel._lastRenderFields = JSON.stringify(game.fields);
15779: }
15780: 
```

## [P2] Circular reference - 行 15927
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15925:     
15926:     panel.innerHTML = html;
15927:     panel._lastRenderFields = JSON.stringify(game.fields);
15928: }
15929: 
```

## [P2] Array out of bounds - 行 15976
数组索引访问可能越界: fishTypes[fishKey]。建议添加长度检查。

```javascript
15974:             if (count > 0) {
15975:                 hasFish = true;
15976:                 const fishInfo = fishTypes[fishKey] || { name: fishKey, emoji: '🐟' };
15977:                 html += `
15978:                     <div class="processing-card">
```

## [P2] Circular reference - 行 16001
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
15999:     html += '</div>';
16000:     panel.innerHTML = html;
16001:     panel._lastRenderFields = JSON.stringify(game.fields);
16002: }
16003: 
```

## [P2] Array out of bounds - 行 16038
数组索引访问可能越界: fishPrices[fishKey]。建议添加长度检查。

```javascript
16036:         for (const [fishKey, count] of Object.entries(game.fishInventory)) {
16037:             if (count > 0) {
16038:                 const price = (fishPrices[fishKey] || 10) * bonusMul;
16039:                 const money = Math.floor(count * price);
16040:                 totalMoney += money;
```

## [P2] Array out of bounds - 行 16042
数组索引访问可能越界: game.fishInventory[fishKey]。建议添加长度检查。

```javascript
16040:                 totalMoney += money;
16041:                 soldLog.push(`${getFishName(fishKey)} ${count}斤`);
16042:                 delete game.fishInventory[fishKey];
16043:             }
16044:         }
```

## [P2] State inconsistency - 行 16046
game.money 修改（行 16046）与 game 其他字段修改（行 16048）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
16044:         }
16045:         
16046:         game.money += totalMoney;
16047:         
16048:         if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 16061
数组索引访问可能越界: game.foragingItems[itemId]。建议添加长度检查。

```javascript
16059: 
16060: function sellForagingItem(itemId, amount) {
16061:     if (!game.foragingItems || !game.foragingItems[itemId] || game.foragingItems[itemId] < amount) {
16062:         showToast('库存不足', 'bad');
16063:         return;
```

## [P2] Array out of bounds - 行 16080
数组索引访问可能越界: game.foragingItems[itemId]。建议添加长度检查。

```javascript
16078:     const money = Math.floor(finalPrice * amount);
16079:     
16080:     game.foragingItems[itemId] -= amount;
16081:     if (game.foragingItems[itemId] <= 0) {
16082:         delete game.foragingItems[itemId];
```

## [P2] Array out of bounds - 行 16081
数组索引访问可能越界: game.foragingItems[itemId]。建议添加长度检查。

```javascript
16079:     
16080:     game.foragingItems[itemId] -= amount;
16081:     if (game.foragingItems[itemId] <= 0) {
16082:         delete game.foragingItems[itemId];
16083:     }
```

## [P2] Array out of bounds - 行 16082
数组索引访问可能越界: game.foragingItems[itemId]。建议添加长度检查。

```javascript
16080:     game.foragingItems[itemId] -= amount;
16081:     if (game.foragingItems[itemId] <= 0) {
16082:         delete game.foragingItems[itemId];
16083:     }
16084:     game.money += money;
```

## [P2] State inconsistency - 行 16084
game.money 修改（行 16084）与 game 其他字段修改（行 16086）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
16082:         delete game.foragingItems[itemId];
16083:     }
16084:     game.money += money;
16085:     
16086:     if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 16102
数组索引访问可能越界: PROCESSED_ITEMS[itemKey]。建议添加长度检查。

```javascript
16100: // 获取加工产品售价（与sellProcessedItem统一逻辑）
16101: function getProcessedItemPrice(itemKey) {
16102:     const item = PROCESSED_ITEMS[itemKey];
16103:     if (!item) return 0;
16104:     
```

## [P2] Array out of bounds - 行 16152
数组索引访问可能越界: seasonalMultipliers[cropType]。建议添加长度检查。

```javascript
16150:     
16151:     let multiplier = 1.0;
16152:     if (cropType && seasonalMultipliers[cropType] && seasonalMultipliers[cropType][game.season]) {
16153:         multiplier = seasonalMultipliers[cropType][game.season];
16154:     }
```

## [P2] Array out of bounds - 行 16153
数组索引访问可能越界: seasonalMultipliers[cropType]。建议添加长度检查。

```javascript
16151:     let multiplier = 1.0;
16152:     if (cropType && seasonalMultipliers[cropType] && seasonalMultipliers[cropType][game.season]) {
16153:         multiplier = seasonalMultipliers[cropType][game.season];
16154:     }
16155:     
```

## [P2] Array out of bounds - 行 16244
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
16242:     let hasUnlocked = false;
16243:     for (const [key, item] of Object.entries(PROCESSING_DATA)) {
16244:         if (game.builtProcessing && game.builtProcessing[key] > 0) {
16245:             hasUnlocked = true;
16246:             
```

## [P2] Array out of bounds - 行 16249
数组索引访问可能越界: game.dailyProcessed[key]。建议添加长度检查。

```javascript
16247:             const product = PROCESSED_ITEMS[item.outputItem];
16248:             const have = (game.processedItems && game.processedItems[item.outputItem]) || 0;
16249:             const dailyDone = (game.dailyProcessed && game.dailyProcessed[key]) || 0;
16250:             
16251:             // 计算价格
```

## [P2] Array out of bounds - 行 16255
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
16253:             
16254:             // 获取加工坊等级（安全访问数组，防止越界）
16255:             const buildingLevel = game.builtProcessing[key] || 1;
16256:             const levelIndex = Math.max(0, buildingLevel - 1);
16257:     const dailyCapacity = item.levelCapacity && item.levelCapacity[levelIndex] !== undefined ? item.levelCapacity[levelIndex] : item.dailyCapacity;
```

## [P2] Array out of bounds - 行 16257
数组索引访问可能越界: item.levelCapacity[levelIndex]。建议添加长度检查。

```javascript
16255:             const buildingLevel = game.builtProcessing[key] || 1;
16256:             const levelIndex = Math.max(0, buildingLevel - 1);
16257:     const dailyCapacity = item.levelCapacity && item.levelCapacity[levelIndex] !== undefined ? item.levelCapacity[levelIndex] : item.dailyCapacity;
16258:             
16259:             // 自动化设备：加工流水线产能加成
```

## [P2] Array out of bounds - 行 16294
数组索引访问可能越界: game.dailyProcessed[key]。建议添加长度检查。

```javascript
16292:                     <div class="processing-actions">
16293:                         ${(() => {
16294:                             const dailyDone =(game.dailyProcessed && game.dailyProcessed[key]) || 0;
16295:                             const remaining = effectiveCapacity - dailyDone;
16296:                             const canProcess = remaining >= item.inputAmount && game.stamina >= levelStaminaCost;
```

## [P2] Array out of bounds - 行 16320
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
16318:     let hasAvailable = false;
16319:     for (const [key, item] of Object.entries(PROCESSING_DATA)) {
16320:         if (game.builtProcessing && game.builtProcessing[key] > 0) continue;
16321:         
16322:         const unlocked = isProcessingUnlocked(key);
```

## [P2] Circular reference - 行 16357
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
16355:     
16356:     panel.innerHTML = html;
16357:     panel._lastRenderFields = JSON.stringify(game.fields);
16358: }
16359: function rerenderProcessing() {
```

## [P2] Circular reference - 行 16657
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
16655:     
16656:     panel.innerHTML = html;
16657:     panel._lastRenderFields = JSON.stringify(game.fields);
16658: }
16659: 
```

## [P2] Array out of bounds - 行 16664
数组索引访问可能越界: game.items[k]。建议添加长度检查。

```javascript
16662: function checkHasPetFood() {
16663:     if (!game || !game.items) return false;
16664:     return PET_FOOD_KEYS.some(k => (game.items[k] || 0) > 0);
16665: }
16666: 
```

## [P2] Array out of bounds - 行 16670
数组索引访问可能越界: game.items[k]。建议添加长度检查。

```javascript
16668: function consumeOnePetFood() {
16669:     for (const k of PET_FOOD_KEYS) {
16670:         if ((game.items[k] || 0) > 0) {
16671:             game.items[k]--;
16672:             return ITEM_EFFECTS[k] ? ITEM_EFFECTS[k].name : k;
```

## [P2] Array out of bounds - 行 16671
数组索引访问可能越界: game.items[k]。建议添加长度检查。

```javascript
16669:     for (const k of PET_FOOD_KEYS) {
16670:         if ((game.items[k] || 0) > 0) {
16671:             game.items[k]--;
16672:             return ITEM_EFFECTS[k] ? ITEM_EFFECTS[k].name : k;
16673:         }
```

## [P2] Array out of bounds - 行 16672
数组索引访问可能越界: ITEM_EFFECTS[k]。建议添加长度检查。

```javascript
16670:         if ((game.items[k] || 0) > 0) {
16671:             game.items[k]--;
16672:             return ITEM_EFFECTS[k] ? ITEM_EFFECTS[k].name : k;
16673:         }
16674:     }
```

## [P2] Array out of bounds - 行 16680
数组索引访问可能越界: game.pets[petId]。建议添加长度检查。

```javascript
16678: // 撸宠物
16679: function petThePet(petId) {
16680:     const p = game.pets[petId];
16681:     if (!p) return;
16682:     if (!p.petToday) p.petToday = 0;
```

## [P2] Array out of bounds - 行 16701
数组索引访问可能越界: names[petId]。建议添加长度检查。

```javascript
16699:         ? ['大黄舒服地眯起眼睛，尾巴摇得像风车一样。', '大黄翻过身来露出肚皮，让你多摸几下。', '大黄舔了舔你的手，眼神里满是信任。']
16700:         : ['阿花发出咕噜咕噜的声音，用脑袋蹭你的手心。', '阿花伸了个懒腰，在你腿上踩起了奶。', '阿花眯着眼，尾巴尖轻轻晃了晃，看起来很享受。'];
16701:     addLog(`🐾 你撸了撸${names[petId]}。${flavors[Math.floor(Math.random() * flavors.length)]}`, 'pet');
16702:     saveGame();
16703:     updateUI();
```

## [P2] Array out of bounds - 行 16709
数组索引访问可能越界: game.pets[petId]。建议添加长度检查。

```javascript
16707: // 喂宠物
16708: function feedThePet(petId) {
16709:     const p = game.pets[petId];
16710:     if (!p) return;
16711:     if (p.fedToday) {
```

## [P2] Array out of bounds - 行 16730
数组索引访问可能越界: names[petId]。建议添加长度检查。

```javascript
16728:         ? ['大黄狼吞虎咽地吃完，满足地打了个饱嗝。', '大黄吃完后叼着碗跑到你脚边，还想再来一份。', '大黄吃得尾巴直摇，吃完还用鼻子拱了拱你的手。']
16729:         : ['阿花优雅地吃完，舔了舔爪子开始洗脸。', '阿花吃完后跳到你腿上，蜷成一团打起了呼噜。', '阿花细嚼慢咽地吃完，冲你喵了一声，像是在说谢谢。'];
16730:     addLog(`🍖 你喂了${names[petId]}一个${foodName}。${flavors[Math.floor(Math.random() * flavors.length)]}`, 'pet');
16731:     saveGame();
16732:     updateUI();
```

## [P2] Array out of bounds - 行 16810
数组索引访问可能越界: game.npcs[k]。建议添加长度检查。

```javascript
16808:     // 只从已认识的NPC中随机选一个增加好感度
16809:     const knownNpcKeys = Object.keys(NPC_DATA).filter(k => {
16810:         return ((game.npcs && game.npcs[k]) || 0) > 0 || ((game.friendship && game.friendship[k]) || 0) > 0 || ['wangcunzhang', 'lilaonong', 'zhangshen', 'wangerdan', 'zhaolaoban'].includes(k);
16811:     });
16812:     
```

## [P2] Array out of bounds - 行 16810
数组索引访问可能越界: game.friendship[k]。建议添加长度检查。

```javascript
16808:     // 只从已认识的NPC中随机选一个增加好感度
16809:     const knownNpcKeys = Object.keys(NPC_DATA).filter(k => {
16810:         return ((game.npcs && game.npcs[k]) || 0) > 0 || ((game.friendship && game.friendship[k]) || 0) > 0 || ['wangcunzhang', 'lilaonong', 'zhangshen', 'wangerdan', 'zhaolaoban'].includes(k);
16811:     });
16812:     
```

## [P2] Array out of bounds - 行 16822
数组索引访问可能越界: NPC_DATA[randomNpc]。建议添加长度检查。

```javascript
16820:     
16821:     const randomNpc = knownNpcKeys[Math.floor(Math.random() * knownNpcKeys.length)];
16822:     const npc = NPC_DATA[randomNpc];
16823:     
16824:     if (!game.friendship[randomNpc]) {
```

## [P2] Array out of bounds - 行 16824
数组索引访问可能越界: game.friendship[randomNpc]。建议添加长度检查。

```javascript
16822:     const npc = NPC_DATA[randomNpc];
16823:     
16824:     if (!game.friendship[randomNpc]) {
16825:         game.friendship[randomNpc] = 0;
16826:     }
```

## [P2] Array out of bounds - 行 16825
数组索引访问可能越界: game.friendship[randomNpc]。建议添加长度检查。

```javascript
16823:     
16824:     if (!game.friendship[randomNpc]) {
16825:         game.friendship[randomNpc] = 0;
16826:     }
16827:     if (!game.npcs[randomNpc]) {
```

## [P2] Array out of bounds - 行 16827
数组索引访问可能越界: game.npcs[randomNpc]。建议添加长度检查。

```javascript
16825:         game.friendship[randomNpc] = 0;
16826:     }
16827:     if (!game.npcs[randomNpc]) {
16828:         game.npcs[randomNpc] = 0;
16829:     }
```

## [P2] Array out of bounds - 行 16828
数组索引访问可能越界: game.npcs[randomNpc]。建议添加长度检查。

```javascript
16826:     }
16827:     if (!game.npcs[randomNpc]) {
16828:         game.npcs[randomNpc] = 0;
16829:     }
16830:     
```

## [P2] Array out of bounds - 行 16832
数组索引访问可能越界: game.friendship[randomNpc]。建议添加长度检查。

```javascript
16830:     
16831:     const gain = Math.floor(Math.random() * 3) + 1; // 1~3点好感度
16832:     game.friendship[randomNpc] = Math.min(100, (game.friendship[randomNpc] || 0) + gain);
16833:     game.npcs[randomNpc] = Math.min(100, (game.npcs[randomNpc] || 0) + gain);
16834:     
```

## [P2] Array out of bounds - 行 16833
数组索引访问可能越界: game.npcs[randomNpc]。建议添加长度检查。

```javascript
16831:     const gain = Math.floor(Math.random() * 3) + 1; // 1~3点好感度
16832:     game.friendship[randomNpc] = Math.min(100, (game.friendship[randomNpc] || 0) + gain);
16833:     game.npcs[randomNpc] = Math.min(100, (game.npcs[randomNpc] || 0) + gain);
16834:     
16835:     // 检查NPC里程碑
```

## [P2] Array out of bounds - 行 16900
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
16898:             const fishAmount = Math.floor((Math.random() * 2 + 1) * levelBonus);
16899:             if (!game.fishInventory) game.fishInventory = {};
16900:             game.fishInventory[fishType] = (game.fishInventory[fishType] || 0) + fishAmount;
16901:             unlockCollectionItem('fish', fishType);
16902:             result = `钓着了${fishAmount}斤${getFishName(fishType)}`;
```

## [P2] Array out of bounds - 行 16913
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
16911:         const fishAmount = Math.floor((Math.random() * 2 + 1) * levelBonus);
16912:         if (!game.fishInventory) game.fishInventory = {};
16913:         game.fishInventory[fishType] = (game.fishInventory[fishType] || 0) + fishAmount;
16914:         unlockCollectionItem('fish', fishType);
16915:         result = `钓着了${fishAmount}斤${getFishName(fishType)}`;
```

## [P2] Array out of bounds - 行 16925
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
16923:         const fishAmount = Math.floor((Math.random() * 2 + 2) * levelBonus);
16924:         if (!game.fishInventory) game.fishInventory = {};
16925:         game.fishInventory[fishType] = (game.fishInventory[fishType] || 0) + fishAmount;
16926:         unlockCollectionItem('fish', fishType);
16927:         result = `钓着了${fishAmount}斤${getFishName(fishType)}`;
```

## [P2] Array out of bounds - 行 16937
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
16935:         const fishAmount = Math.floor((Math.random() * 3 + 3) * levelBonus);
16936:         if (!game.fishInventory) game.fishInventory = {};
16937:         game.fishInventory[fishType] = (game.fishInventory[fishType] || 0) + fishAmount;
16938:         unlockCollectionItem('fish', fishType);
16939:         result = `哇！钓着了${fishAmount}斤大${getFishName(fishType)}！`;
```

## [P2] Array out of bounds - 行 16991
数组索引访问可能越界: SKILL_EFFECTS[randomSkill]。建议添加长度检查。

```javascript
16989:     const skillKeys = ['cropFamiliarity', 'fieldManagement', 'toolMastery', 'composting', 'fishingMastery'];
16990:     const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
16991:     const skillInfo = SKILL_EFFECTS[randomSkill];
16992:     
16993:     const gain = Math.floor(Math.random() * 3) + 1; // 1~3点经验
```

## [P2] Array out of bounds - 行 17023
数组索引访问可能越界: SKILL_EFFECTS[skillKey]。建议添加长度检查。

```javascript
17021:     
17022:     skillKeys.forEach(skillKey => {
17023:         const skillInfo = SKILL_EFFECTS[skillKey];
17024:         const skill = game.skills[skillKey];
17025:         if (!skill) return;
```

## [P2] Array out of bounds - 行 17024
数组索引访问可能越界: game.skills[skillKey]。建议添加长度检查。

```javascript
17022:     skillKeys.forEach(skillKey => {
17023:         const skillInfo = SKILL_EFFECTS[skillKey];
17024:         const skill = game.skills[skillKey];
17025:         if (!skill) return;
17026:         const level = skill.level;
```

## [P2] Array out of bounds - 行 17045
数组索引访问可能越界: SKILL_EXP_TABLE[10]。建议添加长度检查。

```javascript
17043:         // 计算当前等级和下一级所需经验
17044:         const isMaxLevel = level >= 10;
17045:         const nextLevelExp = isMaxLevel ? exp : (SKILL_EXP_TABLE[level + 1] || SKILL_EXP_TABLE[10]);
17046:         const currentLevelExp = SKILL_EXP_TABLE[level] || 0;
17047:         const expNeeded = Math.max(1, nextLevelExp - currentLevelExp);
```

## [P2] Array out of bounds - 行 17046
数组索引访问可能越界: SKILL_EXP_TABLE[level]。建议添加长度检查。

```javascript
17044:         const isMaxLevel = level >= 10;
17045:         const nextLevelExp = isMaxLevel ? exp : (SKILL_EXP_TABLE[level + 1] || SKILL_EXP_TABLE[10]);
17046:         const currentLevelExp = SKILL_EXP_TABLE[level] || 0;
17047:         const expNeeded = Math.max(1, nextLevelExp - currentLevelExp);
17048:         const expInLevel = isMaxLevel ? expNeeded : (exp - currentLevelExp);
```

## [P2] Circular reference - 行 17091
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
17089:     
17090:     panel.innerHTML = html;
17091:     panel._lastRenderFields = JSON.stringify(game.fields);
17092: }
17093: 
```

## [P2] Circular reference - 行 17154
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
17152:     
17153:     panel.innerHTML = html;
17154:     panel._lastRenderFields = JSON.stringify(game.fields);
17155: }
17156: 
```

## [P2] Circular reference - 行 17238
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
17236:     
17237:     panel.innerHTML = html;
17238:     panel._lastRenderFields = JSON.stringify(game.fields);
17239: }
17240: 
```

## [P2] Array out of bounds - 行 17259
数组索引访问可能越界: game.skills[skillKey]。建议添加长度检查。

```javascript
17257: // 增加技能经验
17258: function addSkillExp(skillKey, amount) {
17259:     const skill = game.skills[skillKey];
17260:     if (!skill) return;
17261:     
```

## [P2] Array out of bounds - 行 17269
数组索引访问可能越界: SKILL_EFFECTS[skillKey]。建议添加长度检查。

```javascript
17267:     if (newLevel > oldLevel) {
17268:         skill.level = newLevel;
17269:         const skillInfo = SKILL_EFFECTS[skillKey];
17270:         const skillName = skillInfo ? skillInfo.name : getSkillName(skillKey);
17271:         addLog(`🎉 ${skillName}升级到 Lv.${newLevel}！`, 'good');
```

## [P2] Array out of bounds - 行 17286
数组索引访问可能越界: milestoneRewards[lv]。建议添加长度检查。

```javascript
17284:         let highestMilestone = '';
17285:         for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
17286:             if (milestoneRewards[lv]) {
17287:                 const reward = milestoneRewards[lv];
17288:                 game.money += reward.money;
```

## [P2] Array out of bounds - 行 17287
数组索引访问可能越界: milestoneRewards[lv]。建议添加长度检查。

```javascript
17285:         for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
17286:             if (milestoneRewards[lv]) {
17287:                 const reward = milestoneRewards[lv];
17288:                 game.money += reward.money;
17289:                 totalRewardMoney += reward.money;
```

## [P2] Array out of bounds - 行 17338
数组索引访问可能越界: unlockMessages[skillKey]。建议添加长度检查。

```javascript
17336:         };
17337:         
17338:         const skillUnlocks = unlockMessages[skillKey];
17339:         if (skillUnlocks) {
17340:             for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
```

## [P2] Array out of bounds - 行 17341
数组索引访问可能越界: skillUnlocks[lv]。建议添加长度检查。

```javascript
17339:         if (skillUnlocks) {
17340:             for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
17341:                 if (skillUnlocks[lv]) {
17342:                     addLog(`🔓 ${skillUnlocks[lv]}`, 'good');
17343:                 }
```

## [P2] Array out of bounds - 行 17342
数组索引访问可能越界: skillUnlocks[lv]。建议添加长度检查。

```javascript
17340:             for (let lv = oldLevel + 1; lv <= newLevel; lv++) {
17341:                 if (skillUnlocks[lv]) {
17342:                     addLog(`🔓 ${skillUnlocks[lv]}`, 'good');
17343:                 }
17344:             }
```

## [P2] Array out of bounds - 行 17388
数组索引访问可能越界: MILESTONE_DATA[key]。建议添加长度检查。

```javascript
17386:     
17387:     for (const key in MILESTONE_DATA) {
17388:         const milestone = MILESTONE_DATA[key];
17389:         // 已经达成的跳过
17390:         if (game.milestones && game.milestones[key]) continue;
```

## [P2] Array out of bounds - 行 17390
数组索引访问可能越界: game.milestones[key]。建议添加长度检查。

```javascript
17388:         const milestone = MILESTONE_DATA[key];
17389:         // 已经达成的跳过
17390:         if (game.milestones && game.milestones[key]) continue;
17391:         
17392:         // 检查是否达成
```

## [P2] Array out of bounds - 行 17396
数组索引访问可能越界: game.milestones[key]。建议添加长度检查。

```javascript
17394:             if (milestone.check && milestone.check()) {
17395:                 // 达成里程碑
17396:                 game.milestones[key] = true;
17397:                 
17398:                 // 给奖励
```

## [P2] Array out of bounds - 行 17427
数组索引访问可能越界: metFlags[npcKey]。建议添加长度检查。

```javascript
17425:         sunmiaoqing: 'metSunmiaoqing'
17426:     };
17427:     if (metFlags[npcKey] && game[metFlags[npcKey]]) return true;
17428:     
17429:     // 如果已经有好感度，也算认识
```

## [P2] Array out of bounds - 行 17430
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
17428:     
17429:     // 如果已经有好感度，也算认识
17430:     if (((game.npcs && game.npcs[npcKey]) || 0) > 0) return true;
17431:     if (((game.friendship && game.friendship[npcKey]) || 0) > 0) return true;
17432:     
```

## [P2] Array out of bounds - 行 17431
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
17429:     // 如果已经有好感度，也算认识
17430:     if (((game.npcs && game.npcs[npcKey]) || 0) > 0) return true;
17431:     if (((game.friendship && game.friendship[npcKey]) || 0) > 0) return true;
17432:     
17433:     return false;
```

## [P2] Array out of bounds - 行 17457
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
17455:         html += '<div class="section-title" style="margin-top:0;">👋 已认识的村民</div>';
17456:         for (const npcKey of knownNpcs) {
17457:             const npc = NPC_DATA[npcKey];
17458:             const friendship = Math.max((game.npcs && game.npcs[npcKey]) || 0,(game.friendship && game.friendship[npcKey]) || 0);
17459:             
```

## [P2] Array out of bounds - 行 17458
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
17456:         for (const npcKey of knownNpcs) {
17457:             const npc = NPC_DATA[npcKey];
17458:             const friendship = Math.max((game.npcs && game.npcs[npcKey]) || 0,(game.friendship && game.friendship[npcKey]) || 0);
17459:             
17460:             let level = FRIENDSHIP_LEVELS[0];
```

## [P2] Array out of bounds - 行 17458
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
17456:         for (const npcKey of knownNpcs) {
17457:             const npc = NPC_DATA[npcKey];
17458:             const friendship = Math.max((game.npcs && game.npcs[npcKey]) || 0,(game.friendship && game.friendship[npcKey]) || 0);
17459:             
17460:             let level = FRIENDSHIP_LEVELS[0];
```

## [P2] Array out of bounds - 行 17469
数组索引访问可能越界: FRIENDSHIP_LEVELS[nextLevelIndex]。建议添加长度检查。

```javascript
17467:             
17468:             const nextLevelIndex = FRIENDSHIP_LEVELS.findIndex(l => l.min > friendship);
17469:             const nextLevel = nextLevelIndex > 0 ? FRIENDSHIP_LEVELS[nextLevelIndex] : null;
17470:             const currentLevelMin = level.min;
17471:             const nextLevelMin = nextLevel ? nextLevel.min : 100;
```

## [P2] Array out of bounds - 行 17508
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
17506:         html += '<div class="section-title">🔒 还没认识的村民</div>';
17507:         for (const npcKey of unknownNpcs) {
17508:             const npc = NPC_DATA[npcKey];
17509:             html += `
17510:                 <div class="shop-item" style="opacity: 0.5; cursor: not-allowed;" onclick="playErrorSound(); showToast('现在还不认识这个村民，多出去走走，说不定能遇到...', 'warn');">
```

## [P2] Circular reference - 行 17536
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
17534:     
17535:     panel.innerHTML = html;
17536:     panel._lastRenderFields = JSON.stringify(game.fields);
17537: }
17538: 
```

## [P2] Array out of bounds - 行 17542
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
17540: // ==================== 雇佣村民系统 ====================
17541: function getHireButton(npcKey, npc) {
17542:     const friendship = game.npcs[npcKey] || 0;
17543:     const isHired = game.hiredWorker === npcKey;
17544:     
```

## [P2] Array out of bounds - 行 17566
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
17564: 
17565: function hireWorker(npcKey) {
17566:     const npc = NPC_DATA[npcKey];
17567:     if (!npc || !npc.canHire) return;
17568:     
```

## [P2] Array out of bounds - 行 17569
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
17567:     if (!npc || !npc.canHire) return;
17568:     
17569:     const friendship = game.npcs[npcKey] || 0;
17570:     if (friendship < npc.hireFriendship) {
17571:         showToast('关系还没好到那个份上，再多聊聊吧', 'bad');
```

## [P2] State inconsistency - 行 17586
game.money 修改（行 17586）与 game 其他字段修改（行 17587）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
17584:     
17585:     // 扣除雇佣费
17586:     game.money -= npc.hireFee;
17587:     game.hiredWorker = npcKey;
17588:     game.hireStartDay = game.day;
```

## [P2] Array out of bounds - 行 17607
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
17605: 
17606: function fireWorker(npcKey) {
17607:     const npc = NPC_DATA[npcKey];
17608:     if (!npc) return;
17609:     
```

## [P2] State inconsistency - 行 17643
game.money 修改（行 17643）与 game 其他字段修改（行 17648）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
17641:     
17642:     if (game.money >= actualWage) {
17643:         game.money -= actualWage;
17644:         addLog(`💰 支付${npc.name}今日工资${actualWage}元`, 'info');
17645:     } else {
```

## [P2] Array out of bounds - 行 17715
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
17713:     
17714:     for (const [key, building] of Object.entries(PROCESSING_DATA)) {
17715:         if (!game.builtProcessing[key] || game.builtProcessing[key] <= 0) continue;
17716:         
17717:         // === 获取原料来源 ===
```

## [P2] Array out of bounds - 行 17738
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
17736:             // 从作物取原料
17737:             const cropKey = building.inputCrop === 'rice' ? 'rice' : (building.inputCrop === 'sweet' ? 'sweet' : (building.inputCrop === 'wheat' ? 'wheat' : building.inputCrop));
17738:             inputAmount = game.crops[cropKey] || 0;
17739:             const cropNameMap = { rice: '稻谷', sweet: '红薯', wheat: '小麦', corn: '玉米', soybean: '大豆' };
17740:             inputName = cropNameMap[cropKey] || cropKey;
```

## [P2] Array out of bounds - 行 17740
数组索引访问可能越界: cropNameMap[cropKey]。建议添加长度检查。

```javascript
17738:             inputAmount = game.crops[cropKey] || 0;
17739:             const cropNameMap = { rice: '稻谷', sweet: '红薯', wheat: '小麦', corn: '玉米', soybean: '大豆' };
17740:             inputName = cropNameMap[cropKey] || cropKey;
17741:         }
17742:         
```

## [P2] Array out of bounds - 行 17744
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
17742:         
17743:         // 获取加工坊等级对应的容量和体力消耗
17744:         const buildingLevel = game.builtProcessing[key] || 1;
17745:         const dailyCapacity = building.levelCapacity ? building.levelCapacity[Math.max(0, buildingLevel - 1)] : building.dailyCapacity;
17746:         const levelStaminaCost = building.levelStaminaCost ? building.levelStaminaCost[Math.max(0, buildingLevel - 1)] : building.staminaCost;
```

## [P2] NaN/Infinity - 行 17766
除法运算可能除零: effectiveCapacity / building.inputAmount。建议对分母添加零值检查或 || 1 防护。

```javascript
17764:             batches = effectiveCapacity;
17765:         } else {
17766:             const maxBatches = Math.floor(effectiveCapacity / building.inputAmount);
17767:             const availableBatches = Math.floor(inputAmount / building.inputAmount);
17768:             batches = Math.min(maxBatches, availableBatches);
```

## [P2] NaN/Infinity - 行 17767
除法运算可能除零: inputAmount / building.inputAmount。建议对分母添加零值检查或 || 1 防护。

```javascript
17765:         } else {
17766:             const maxBatches = Math.floor(effectiveCapacity / building.inputAmount);
17767:             const availableBatches = Math.floor(inputAmount / building.inputAmount);
17768:             batches = Math.min(maxBatches, availableBatches);
17769:         }
```

## [P2] Array out of bounds - 行 17809
数组索引访问可能越界: game.skills[skillName]。建议添加长度检查。

```javascript
17807:             const isFishRelated = building.inputType === 'fish';
17808:             const skillName = isFishRelated ? 'fishingMastery' : 'cropFamiliarity';
17809:             if (game.skills[skillName]) {
17810:                 addSkillExp(skillName, extraExp);
17811:             }
```

## [P2] Array out of bounds - 行 17829
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
17827:             for (const fishType of fishTypes) {
17828:                 if (needFish <= 0) break;
17829:                 const available =(game.fishInventory && game.fishInventory[fishType]) || 0;
17830:                 if (available > 0) {
17831:                     const consume = Math.min(available, needFish);
```

## [P2] Array out of bounds - 行 17832
数组索引访问可能越界: game.fishInventory[fishType]。建议添加长度检查。

```javascript
17830:                 if (available > 0) {
17831:                     const consume = Math.min(available, needFish);
17832:                     game.fishInventory[fishType] -= consume;
17833:                     needFish -= consume;
17834:                 }
```

## [P2] Array out of bounds - 行 17840
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
17838:         } else {
17839:             const cropKey = building.inputCrop === 'rice' ? 'rice' : (building.inputCrop === 'sweet' ? 'sweet' : (building.inputCrop === 'wheat' ? 'wheat' : building.inputCrop));
17840:             game.crops[cropKey] -= batches * building.inputAmount;
17841:         }
17842:         
```

## [P2] Array out of bounds - 行 17860
数组索引访问可能越界: game.dailyProcessed[key]。建议添加长度检查。

```javascript
17858:         
17859:         // 记录今日加工量
17860:         game.dailyProcessed[key] = batches * building.inputAmount;
17861:         
17862:         addLog(`🏭 ${building.name}加工了${batches * building.inputAmount}斤${inputName}，产出${outputAmount}斤${PROCESSED_ITEMS[building.outputItem].name}${eventText}`, 'info');
```

## [P2] Array out of bounds - 行 17868
数组索引访问可能越界: PROCESSING_DATA[key]。建议添加长度检查。

```javascript
17866: // 建造加工坊
17867: function buildProcessing(key) {
17868:     const building = PROCESSING_DATA[key];
17869:     if (!building) return;
17870:     
```

## [P2] Array out of bounds - 行 17872
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
17870:     
17871:     // 检查是否已经建造
17872:     if (game.builtProcessing && game.builtProcessing[key] > 0) {
17873:         showToast('已经建造过了');
17874:         return;
```

## [P2] State inconsistency - 行 17891
game.money 修改（行 17891）与 game 其他字段修改（行 17892）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
17889:     
17890:     // 建造
17891:     game.money -= building.buildCost;
17892:     if (!game.builtProcessing) game.builtProcessing = {};
17893:     game.builtProcessing[key] = 1;
```

## [P2] Array out of bounds - 行 17893
数组索引访问可能越界: game.builtProcessing[key]。建议添加长度检查。

```javascript
17891:     game.money -= building.buildCost;
17892:     if (!game.builtProcessing) game.builtProcessing = {};
17893:     game.builtProcessing[key] = 1;
17894:     
17895:     // 任务检查
```

## [P2] Array out of bounds - 行 17914
数组索引访问可能越界: PROCESSING_DATA[buildingKey]。建议添加长度检查。

```javascript
17912: // 升级加工坊
17913: function upgradeProcessing(buildingKey) {
17914:     const building = PROCESSING_DATA[buildingKey];
17915:     if (!building) return;
17916:     const currentLevel = game.builtProcessing[buildingKey] || 1;
```

## [P2] Array out of bounds - 行 17916
数组索引访问可能越界: game.builtProcessing[buildingKey]。建议添加长度检查。

```javascript
17914:     const building = PROCESSING_DATA[buildingKey];
17915:     if (!building) return;
17916:     const currentLevel = game.builtProcessing[buildingKey] || 1;
17917:     if (currentLevel >= 3) { showToast('已满级', 'warn'); return; }
17918:     const cost = building.upgradeCost && building.upgradeCost[Math.max(0, currentLevel - 1)] !== undefined ? building.upgradeCost[Math.max(0, currentLevel - 1)] : 0;
```

## [P2] Array out of bounds - 行 17923
数组索引访问可能越界: game.builtProcessing[buildingKey]。建议添加长度检查。

```javascript
17921:     
17922:     game.money -= cost;
17923:     game.builtProcessing[buildingKey] = currentLevel + 1;
17924:     
17925:     addLog(`🎉 ${building.name}升级到了Lv${currentLevel + 1}！日产能提升至${building.levelCapacity[currentLevel]}斤`, 'good');
```

## [P2] Array out of bounds - 行 17925
数组索引访问可能越界: building.levelCapacity[currentLevel]。建议添加长度检查。

```javascript
17923:     game.builtProcessing[buildingKey] = currentLevel + 1;
17924:     
17925:     addLog(`🎉 ${building.name}升级到了Lv${currentLevel + 1}！日产能提升至${building.levelCapacity[currentLevel]}斤`, 'good');
17926:     saveGame();
17927:     renderProcessingPanel();
```

## [P2] Array out of bounds - 行 17933
数组索引访问可能越界: PROCESSING_DATA[buildingKey]。建议添加长度检查。

```javascript
17931: // 手动加工（玩家点击按钮触发）
17932: function manualProcess(buildingKey) {
17933:     const building = PROCESSING_DATA[buildingKey];
17934:     if (!building) {
17935:         showToast('加工建筑不存在', 'bad');
```

## [P2] Array out of bounds - 行 17940
数组索引访问可能越界: game.builtProcessing[buildingKey]。建议添加长度检查。

```javascript
17938:     
17939:     // 检查建筑是否已建造
17940:     if (!game.builtProcessing || !game.builtProcessing[buildingKey] || game.builtProcessing[buildingKey] <= 0) {
17941:         showToast('还未置办该作坊', 'bad');
17942:         return;
```

## [P2] Array out of bounds - 行 17946
数组索引访问可能越界: game.builtProcessing[buildingKey]。建议添加长度检查。

```javascript
17944:     
17945:     // 获取加工坊等级
17946:     const buildingLevel = game.builtProcessing[buildingKey] || 1;
17947:     const dailyCapacity = building.levelCapacity ? building.levelCapacity[Math.max(0, buildingLevel - 1)] : building.dailyCapacity;
17948:     const staminaCost = building.levelStaminaCost ? building.levelStaminaCost[Math.max(0, buildingLevel - 1)] : building.staminaCost;
```

## [P2] Array out of bounds - 行 17964
数组索引访问可能越界: game.dailyProcessed[buildingKey]。建议添加长度检查。

```javascript
17962:     
17963:     // 检查今天是否已达上限（dailyProcessed 已包含进行中的任务）
17964:     const dailyDone = (game.dailyProcessed && game.dailyProcessed[buildingKey]) || 0;
17965:     if (dailyDone >= effectiveCapacity) {
17966:         showToast('今天已经花费太多力气在这上面了，手臂都酸了，明天再来吧', 'warn');
```

## [P2] Game balance - 行 17995
极大的数值 999999 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
17993:         inputAmount = (game.items && game.items.wood) || 0;
17994:     } else if (building.inputType === 'none') {
17995:         inputAmount = 999999; // 无原料需求，直接通过
17996:     } else {
17997:         const cropKey = building.inputCrop === 'rice' ? 'rice' : (building.inputCrop === 'sweet' ? 'sweet' : (building.inputCrop === 'wheat' ? 'wheat' : building.inputCrop));
```

## [P2] Array out of bounds - 行 17998
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
17996:     } else {
17997:         const cropKey = building.inputCrop === 'rice' ? 'rice' : (building.inputCrop === 'sweet' ? 'sweet' : (building.inputCrop === 'wheat' ? 'wheat' : building.inputCrop));
17998:         inputAmount = game.crops[cropKey] || 0;
17999:     }
18000:     
```

## [P2] Array out of bounds - 行 18030
数组索引访问可能越界: game.fishInventory[fishKey]。建议添加长度检查。

```javascript
18028:             for (const fishKey of Object.keys(game.fishInventory)) {
18029:                 if (remaining <= 0) break;
18030:                 const take = Math.min(remaining, game.fishInventory[fishKey] || 0);
18031:                 game.fishInventory[fishKey] -= take;
18032:                 remaining -= take;
```

## [P2] Array out of bounds - 行 18031
数组索引访问可能越界: game.fishInventory[fishKey]。建议添加长度检查。

```javascript
18029:                 if (remaining <= 0) break;
18030:                 const take = Math.min(remaining, game.fishInventory[fishKey] || 0);
18031:                 game.fishInventory[fishKey] -= take;
18032:                 remaining -= take;
18033:             }
```

## [P2] Array out of bounds - 行 18041
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
18039:     } else if (building.inputType !== 'none') {
18040:         const cropKey = building.inputCrop === 'rice' ? 'rice' : (building.inputCrop === 'sweet' ? 'sweet' : (building.inputCrop === 'wheat' ? 'wheat' : building.inputCrop));
18041:         game.crops[cropKey] -= building.inputAmount;
18042:     }
18043:     
```

## [P2] Array out of bounds - 行 18078
数组索引访问可能越界: game.dailyProcessed[buildingKey]。建议添加长度检查。

```javascript
18076:     if (!game.dailyProcessed) game.dailyProcessed = {};
18077:     if (building.inputType === 'none') {
18078:         game.dailyProcessed[buildingKey] = (game.dailyProcessed[buildingKey] || 0) + 1;
18079:     } else {
18080:         game.dailyProcessed[buildingKey] = (game.dailyProcessed[buildingKey] || 0) + building.inputAmount;
```

## [P2] Array out of bounds - 行 18080
数组索引访问可能越界: game.dailyProcessed[buildingKey]。建议添加长度检查。

```javascript
18078:         game.dailyProcessed[buildingKey] = (game.dailyProcessed[buildingKey] || 0) + 1;
18079:     } else {
18080:         game.dailyProcessed[buildingKey] = (game.dailyProcessed[buildingKey] || 0) + building.inputAmount;
18081:     }
18082:     
```

## [P2] Array out of bounds - 行 18096
数组索引访问可能越界: PROCESSING_DATA[key]。建议添加长度检查。

```javascript
18094: // 检查加工坊是否解锁
18095: function isProcessingUnlocked(key) {
18096:     const building = PROCESSING_DATA[key];
18097:     if (!building) return false;
18098:     
```

## [P2] Array out of bounds - 行 18117
数组索引访问可能越界: PROCESSED_ITEMS[itemKey]。建议添加长度检查。

```javascript
18115: // 售卖加工产品
18116: function sellProcessedItem(itemKey, amount) {
18117:     const item = PROCESSED_ITEMS[itemKey];
18118:     if (!item) return;
18119:     
```

## [P2] Array out of bounds - 行 18120
数组索引访问可能越界: game.processedItems[itemKey]。建议添加长度检查。

```javascript
18118:     if (!item) return;
18119:     
18120:     const have =(game.processedItems && game.processedItems[itemKey]) || 0;
18121:     if (have < amount) {
18122:         showToast('库存不足');
```

## [P2] Array out of bounds - 行 18136
数组索引访问可能越界: game.processedItems[itemKey]。建议添加长度检查。

```javascript
18134:     const money = Math.floor(price * amount);
18135:     
18136:     game.processedItems[itemKey] -= amount;
18137:     game.money += money;
18138:     
```

## [P2] State inconsistency - 行 18137
game.money 修改（行 18137）与 game 其他字段修改（行 18140）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
18135:     
18136:     game.processedItems[itemKey] -= amount;
18137:     game.money += money;
18138:     
18139:     // 累计售卖统计
```

## [P2] Array out of bounds - 行 18160
数组索引访问可能越界: TECH_DATA[techId]。建议添加长度检查。

```javascript
18158: // 研究科技
18159: function researchTech(techId) {
18160:     const tech = TECH_DATA[techId];
18161:     if (!tech) return;
18162:     
```

## [P2] Array out of bounds - 行 18164
数组索引访问可能越界: game.unlockedTechs[techId]。建议添加长度检查。

```javascript
18162:     
18163:     // 检查是否已经研究过
18164:     if (game.unlockedTechs && game.unlockedTechs[techId]) {
18165:         showToast('已经研究过了');
18166:         return;
```

## [P2] Array out of bounds - 行 18172
数组索引访问可能越界: game.unlockedTechs[req]。建议添加长度检查。

```javascript
18170:     if (tech.requires && tech.requires.length > 0) {
18171:         for (const req of tech.requires) {
18172:             if (!game.unlockedTechs || !game.unlockedTechs[req]) {
18173:                 showToast('需要先研究前置科技');
18174:                 return;
```

## [P2] Array out of bounds - 行 18188
数组索引访问可能越界: game.unlockedTechs[techId]。建议添加长度检查。

```javascript
18186:     game.researchPoints -= tech.cost;
18187:     if (!game.unlockedTechs) game.unlockedTechs = {};
18188:     game.unlockedTechs[techId] = true;
18189:     
18190:     // 任务检查：研究任意一项科技
```

## [P2] Array out of bounds - 行 18216
数组索引访问可能越界: game.unlockedTechs[techId]。建议添加长度检查。

```javascript
18214: // 检查科技是否解锁
18215: function isTechUnlocked(techId) {
18216:     return game.unlockedTechs && game.unlockedTechs[techId];
18217: }
18218: 
```

## [P2] Array out of bounds - 行 18226
数组索引访问可能越界: TECH_DATA[techId]。建议添加长度检查。

```javascript
18224:     for (const [techId, unlocked] of Object.entries(game.unlockedTechs)) {
18225:         if (!unlocked) continue;
18226:         const tech = TECH_DATA[techId];
18227:         if (tech && tech.effect && tech.effect[effectType] !== undefined) {
18228:             total += tech.effect[effectType];
```

## [P2] Array out of bounds - 行 18227
数组索引访问可能越界: tech.effect[effectType]。建议添加长度检查。

```javascript
18225:         if (!unlocked) continue;
18226:         const tech = TECH_DATA[techId];
18227:         if (tech && tech.effect && tech.effect[effectType] !== undefined) {
18228:             total += tech.effect[effectType];
18229:         }
```

## [P2] Array out of bounds - 行 18228
数组索引访问可能越界: tech.effect[effectType]。建议添加长度检查。

```javascript
18226:         const tech = TECH_DATA[techId];
18227:         if (tech && tech.effect && tech.effect[effectType] !== undefined) {
18228:             total += tech.effect[effectType];
18229:         }
18230:     }
```

## [P2] Array out of bounds - 行 18233
数组索引访问可能越界: game.agriTechEffects[effectType]。建议添加长度检查。

```javascript
18231:     
18232:     // 农业科技效果加成
18233:     if (game.agriTechEffects && game.agriTechEffects[effectType] !== undefined) {
18234:         total += game.agriTechEffects[effectType];
18235:     }
```

## [P2] Array out of bounds - 行 18234
数组索引访问可能越界: game.agriTechEffects[effectType]。建议添加长度检查。

```javascript
18232:     // 农业科技效果加成
18233:     if (game.agriTechEffects && game.agriTechEffects[effectType] !== undefined) {
18234:         total += game.agriTechEffects[effectType];
18235:     }
18236:     
```

## [P2] Array out of bounds - 行 18248
数组索引访问可能越界: game.npcs[npcId]。建议添加长度检查。

```javascript
18246:     if (!game.npcs) game.npcs = {};
18247:     if (!game.friendship) game.friendship = {};
18248:     const oldFavor = game.npcs[npcId] || 0;
18249:     const newFavor = Math.min(100, Math.max(0, oldFavor + val));
18250:     game.npcs[npcId] = newFavor;
```

## [P2] Array out of bounds - 行 18250
数组索引访问可能越界: game.npcs[npcId]。建议添加长度检查。

```javascript
18248:     const oldFavor = game.npcs[npcId] || 0;
18249:     const newFavor = Math.min(100, Math.max(0, oldFavor + val));
18250:     game.npcs[npcId] = newFavor;
18251:     // 同步更新 friendship（确保里程碑和加成效果正确读取）
18252:     game.friendship[npcId] = newFavor;
```

## [P2] Array out of bounds - 行 18252
数组索引访问可能越界: game.friendship[npcId]。建议添加长度检查。

```javascript
18250:     game.npcs[npcId] = newFavor;
18251:     // 同步更新 friendship（确保里程碑和加成效果正确读取）
18252:     game.friendship[npcId] = newFavor;
18253:     // 触发里程碑检查
18254:     if (typeof checkNpcMilestones === 'function') {
```

## [P2] Array out of bounds - 行 18274
数组索引访问可能越界: NPC_MILESTONES[npcKey]。建议添加长度检查。

```javascript
18272:     for (const [npcKey, milestones] of Object.entries(game.npcMilestones)) {
18273:         if (!Array.isArray(milestones)) continue;
18274:         const npcData = NPC_MILESTONES[npcKey];
18275:         if (!npcData) continue;
18276:         
```

## [P2] Array out of bounds - 行 18278
数组索引访问可能越界: ms.effect[effectType]。建议添加长度检查。

```javascript
18276:         
18277:         for (const ms of npcData.milestones) {
18278:             if (milestones.includes(ms.level) && ms.effect[effectType]) {
18279:                 total += ms.effect[effectType];
18280:             }
```

## [P2] Array out of bounds - 行 18279
数组索引访问可能越界: ms.effect[effectType]。建议添加长度检查。

```javascript
18277:         for (const ms of npcData.milestones) {
18278:             if (milestones.includes(ms.level) && ms.effect[effectType]) {
18279:                 total += ms.effect[effectType];
18280:             }
18281:         }
```

## [P2] Array out of bounds - 行 18293
数组索引访问可能越界: NPC_MILESTONES[npcKey]。建议添加长度检查。

```javascript
18291: // 检查NPC里程碑
18292: function checkNpcMilestones(npcKey) {
18293:     const npcData = NPC_MILESTONES[npcKey];
18294:     if (!npcData) return;
18295:     
```

## [P2] Array out of bounds - 行 18296
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18294:     if (!npcData) return;
18295:     
18296:     const friendship = game.friendship[npcKey] || 0;
18297:     if (!game.npcMilestones) game.npcMilestones = {};
18298:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
```

## [P2] Array out of bounds - 行 18298
数组索引访问可能越界: game.npcMilestones[npcKey]。建议添加长度检查。

```javascript
18296:     const friendship = game.friendship[npcKey] || 0;
18297:     if (!game.npcMilestones) game.npcMilestones = {};
18298:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
18299:     
18300:     const achieved = game.npcMilestones[npcKey];
```

## [P2] Array out of bounds - 行 18300
数组索引访问可能越界: game.npcMilestones[npcKey]。建议添加长度检查。

```javascript
18298:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
18299:     
18300:     const achieved = game.npcMilestones[npcKey];
18301:     
18302:     for (const ms of npcData.milestones) {
```

## [P2] Array out of bounds - 行 18314
数组索引访问可能越界: NPC_MILESTONES[npcKey]。建议添加长度检查。

```javascript
18312: // 获取NPC里程碑进度文本
18313: function getNpcMilestoneText(npcKey) {
18314:     const npcData = NPC_MILESTONES[npcKey];
18315:     if (!npcData) return '';
18316:     
```

## [P2] Array out of bounds - 行 18317
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18315:     if (!npcData) return '';
18316:     
18317:     const friendship = game.friendship[npcKey] || 0;
18318:     if (!game.npcMilestones) game.npcMilestones = {};
18319:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
```

## [P2] Array out of bounds - 行 18319
数组索引访问可能越界: game.npcMilestones[npcKey]。建议添加长度检查。

```javascript
18317:     const friendship = game.friendship[npcKey] || 0;
18318:     if (!game.npcMilestones) game.npcMilestones = {};
18319:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
18320:     
18321:     const achieved = game.npcMilestones[npcKey];
```

## [P2] Array out of bounds - 行 18321
数组索引访问可能越界: game.npcMilestones[npcKey]。建议添加长度检查。

```javascript
18319:     if (!game.npcMilestones[npcKey]) game.npcMilestones[npcKey] = [];
18320:     
18321:     const achieved = game.npcMilestones[npcKey];
18322:     const total = npcData.milestones.length;
18323:     
```

## [P2] Array out of bounds - 行 18348
数组索引访问可能越界: BUILDING_DATA[buildingId]。建议添加长度检查。

```javascript
18346:     
18347:     for (const [buildingId, level] of Object.entries(game.buildings)) {
18348:         const building = BUILDING_DATA[buildingId];
18349:         if (!building || !building.effect[effectType]) continue;
18350:         
```

## [P2] Array out of bounds - 行 18349
数组索引访问可能越界: building.effect[effectType]。建议添加长度检查。

```javascript
18347:     for (const [buildingId, level] of Object.entries(game.buildings)) {
18348:         const building = BUILDING_DATA[buildingId];
18349:         if (!building || !building.effect[effectType]) continue;
18350:         
18351:         // 如果是数值型效果（比如storageBonus），取最高级的效果
```

## [P2] Array out of bounds - 行 18355
数组索引访问可能越界: building.upgradeEffect[effectIndex]。建议添加长度检查。

```javascript
18353:             if (level > 0) {
18354:                 const effectIndex = Math.min(Math.max(0, level - 1), building.upgradeEffect.length - 1);
18355:                 total += building.upgradeEffect[effectIndex] || building.effect[effectType];
18356:             }
18357:         } else {
```

## [P2] Array out of bounds - 行 18355
数组索引访问可能越界: building.effect[effectType]。建议添加长度检查。

```javascript
18353:             if (level > 0) {
18354:                 const effectIndex = Math.min(Math.max(0, level - 1), building.upgradeEffect.length - 1);
18355:                 total += building.upgradeEffect[effectIndex] || building.effect[effectType];
18356:             }
18357:         } else {
```

## [P2] Array out of bounds - 行 18361
数组索引访问可能越界: building.upgradeEffect[effectIndex]。建议添加长度检查。

```javascript
18359:             if (level > 0) {
18360:                 const effectIndex = Math.min(Math.max(0, level - 1), building.upgradeEffect.length - 1);
18361:                 total += building.upgradeEffect[effectIndex] || building.effect[effectType];
18362:             }
18363:         }
```

## [P2] Array out of bounds - 行 18361
数组索引访问可能越界: building.effect[effectType]。建议添加长度检查。

```javascript
18359:             if (level > 0) {
18360:                 const effectIndex = Math.min(Math.max(0, level - 1), building.upgradeEffect.length - 1);
18361:                 total += building.upgradeEffect[effectIndex] || building.effect[effectType];
18362:             }
18363:         }
```

## [P2] Array out of bounds - 行 18372
数组索引访问可能越界: BUILDING_DATA[buildingId]。建议添加长度检查。

```javascript
18370: // 建造建筑
18371: function buildBuilding(buildingId) {
18372:     const building = BUILDING_DATA[buildingId];
18373:     if (!building) return;
18374:     
```

## [P2] Array out of bounds - 行 18376
数组索引访问可能越界: game.buildings[buildingId]。建议添加长度检查。

```javascript
18374:     
18375:     // 检查是否已经建造
18376:     const currentLevel = game.buildings[buildingId] || 0;
18377:     if (currentLevel > 0) {
18378:         showToast('已经建造过了');
```

## [P2] State inconsistency - 行 18390
game.money 修改（行 18390）与 game 其他字段修改（行 18396）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
18388:     
18389:     // 建造
18390:     game.money -= building.cost;
18391:     game.buildings[buildingId] = 1;
18392:     
```

## [P2] Array out of bounds - 行 18391
数组索引访问可能越界: game.buildings[buildingId]。建议添加长度检查。

```javascript
18389:     // 建造
18390:     game.money -= building.cost;
18391:     game.buildings[buildingId] = 1;
18392:     
18393:     // 应用效果（储存上限等需要立即更新的）
```

## [P2] Array out of bounds - 行 18411
数组索引访问可能越界: BUILDING_DATA[buildingId]。建议添加长度检查。

```javascript
18409: // 升级建筑
18410: function upgradeBuilding(buildingId) {
18411:     const building = BUILDING_DATA[buildingId];
18412:     if (!building) return;
18413:     
```

## [P2] Array out of bounds - 行 18414
数组索引访问可能越界: game.buildings[buildingId]。建议添加长度检查。

```javascript
18412:     if (!building) return;
18413:     
18414:     const currentLevel = game.buildings[buildingId] || 0;
18415:     if (currentLevel >= building.maxLevel) {
18416:         showToast('已达最高等级');
```

## [P2] Array out of bounds - 行 18420
数组索引访问可能越界: building.upgradeCost[currentLevel]。建议添加长度检查。

```javascript
18418:     }
18419:     
18420:     const upgradeCost = building.upgradeCost[currentLevel];
18421:     if (!upgradeCost || upgradeCost <= 0 || game.money < upgradeCost) {
18422:         showToast('钱包里钱不够，先去卖点东西换点钱', 'bad');
```

## [P2] State inconsistency - 行 18428
game.money 修改（行 18428）与 game 其他字段修改（行 18438）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
18426:     
18427:     // 升级
18428:     game.money -= upgradeCost;
18429:     game.buildings[buildingId] = currentLevel + 1;
18430:     
```

## [P2] Array out of bounds - 行 18429
数组索引访问可能越界: game.buildings[buildingId]。建议添加长度检查。

```javascript
18427:     // 升级
18428:     game.money -= upgradeCost;
18429:     game.buildings[buildingId] = currentLevel + 1;
18430:     
18431:     // 应用效果，限制索引不超过数组长度
```

## [P2] Array out of bounds - 行 18435
数组索引访问可能越界: building.upgradeEffect[oldIdx]。建议添加长度检查。

```javascript
18433:         const oldIdx = Math.max(0, Math.min(currentLevel - 1, building.upgradeEffect.length - 1));
18434:         const newIdx = Math.max(0, Math.min(currentLevel, building.upgradeEffect.length - 1));
18435:         const oldBonus = building.upgradeEffect[oldIdx] || building.effect.storageBonus;
18436:         const newBonus = building.upgradeEffect[newIdx] || building.effect.storageBonus;
18437:         const diff = newBonus - oldBonus;
```

## [P2] Array out of bounds - 行 18436
数组索引访问可能越界: building.upgradeEffect[newIdx]。建议添加长度检查。

```javascript
18434:         const newIdx = Math.max(0, Math.min(currentLevel, building.upgradeEffect.length - 1));
18435:         const oldBonus = building.upgradeEffect[oldIdx] || building.effect.storageBonus;
18436:         const newBonus = building.upgradeEffect[newIdx] || building.effect.storageBonus;
18437:         const diff = newBonus - oldBonus;
18438:         game.storageCapacity = (game.storageCapacity || 3000) + diff;
```

## [P2] Array out of bounds - 行 18469
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
18467: 
18468: function chatWithNpc(npcKey) {
18469:     const npc = NPC_DATA[npcKey];
18470:     const today = game.day;
18471:     
```

## [P2] Array out of bounds - 行 18473
数组索引访问可能越界: game.lastChatDay[npcKey]。建议添加长度检查。

```javascript
18471:     
18472:     // 检查今天是否已经聊过天
18473:     if (game.lastChatDay && game.lastChatDay[npcKey] === today) {
18474:         showToast('今天已经聊过啦~明天再来吧', 'bad');
18475:         playErrorSound();
```

## [P2] Array out of bounds - 行 18503
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18501:     
18502:     const gain = Math.floor(baseGain * friendshipMultiplier);
18503:     const oldFriendship = game.npcs[npcKey] || 0;
18504:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18505:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
```

## [P2] Array out of bounds - 行 18504
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18502:     const gain = Math.floor(baseGain * friendshipMultiplier);
18503:     const oldFriendship = game.npcs[npcKey] || 0;
18504:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18505:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18506:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
```

## [P2] Array out of bounds - 行 18505
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18503:     const oldFriendship = game.npcs[npcKey] || 0;
18504:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18505:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18506:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18507:     const friendship = game.npcs[npcKey];
```

## [P2] Array out of bounds - 行 18506
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18504:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18505:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18506:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18507:     const friendship = game.npcs[npcKey];
18508:     
```

## [P2] Array out of bounds - 行 18507
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18505:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18506:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18507:     const friendship = game.npcs[npcKey];
18508:     
18509:     // 任务检查：第一次和村民聊天
```

## [P2] Array out of bounds - 行 18523
数组索引访问可能越界: game.lastChatDay[npcKey]。建议添加长度检查。

```javascript
18521:     // 记录今天已经聊过天
18522:     if (!game.lastChatDay) game.lastChatDay = {};
18523:     game.lastChatDay[npcKey] = today;
18524:     
18525:     // 根据好感度等级选择对话
```

## [P2] Array out of bounds - 行 18545
数组索引访问可能越界: NPC_DIALOGUE[npcKey]。建议添加长度检查。

```javascript
18543:     
18544:     // 随机选一条对话，避免重复
18545:     const npcDialogue = NPC_DIALOGUE[npcKey];
18546:     let dialogues;
18547:     if (npcDialogue) {
```

## [P2] Array out of bounds - 行 18548
数组索引访问可能越界: npcDialogue[level]。建议添加长度检查。

```javascript
18546:     let dialogues;
18547:     if (npcDialogue) {
18548:         dialogues = npcDialogue[level] || npcDialogue[0] || ['...'];
18549:     } else {
18550:         dialogues = ['（对方看起来有话想说，但不知如何开口）'];
```

## [P2] Array out of bounds - 行 18556
数组索引访问可能越界: game.lastDialogue[npcKey]。建议添加长度检查。

```javascript
18554:     // 避免和上次对话重复
18555:     if (!game.lastDialogue) game.lastDialogue = {};
18556:     if (game.lastDialogue[npcKey] !== undefined && dialogues.length > 1) {
18557:         let _maxRetry = 10;
18558:         while (dialogueIndex === game.lastDialogue[npcKey] && _maxRetry-- > 0) {
```

## [P2] Array out of bounds - 行 18558
数组索引访问可能越界: game.lastDialogue[npcKey]。建议添加长度检查。

```javascript
18556:     if (game.lastDialogue[npcKey] !== undefined && dialogues.length > 1) {
18557:         let _maxRetry = 10;
18558:         while (dialogueIndex === game.lastDialogue[npcKey] && _maxRetry-- > 0) {
18559:             dialogueIndex = Math.floor(Math.random() * dialogues.length);
18560:         }
```

## [P2] Array out of bounds - 行 18562
数组索引访问可能越界: game.lastDialogue[npcKey]。建议添加长度检查。

```javascript
18560:         }
18561:     }
18562:     game.lastDialogue[npcKey] = dialogueIndex;
18563:     const dialogue = dialogues[dialogueIndex];
18564:     
```

## [P2] Array out of bounds - 行 18563
数组索引访问可能越界: dialogues[dialogueIndex]。建议添加长度检查。

```javascript
18561:     }
18562:     game.lastDialogue[npcKey] = dialogueIndex;
18563:     const dialogue = dialogues[dialogueIndex];
18564:     
18565:     // 构建弹窗内容
```

## [P2] Array out of bounds - 行 18570
数组索引访问可能越界: FRIENDSHIP_LEVELS[level]。建议添加长度检查。

```javascript
18568:     // 如果升级了好感度等级，显示特殊提示
18569:     if (levelUp) {
18570:         const levelName =(FRIENDSHIP_LEVELS[level] && FRIENDSHIP_LEVELS[level].name) || '新等级';
18571:         modalContent += `\n\n🎉 关系提升！现在是【${levelName}】`;
18572:     }
```

## [P2] Array out of bounds - 行 18598
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
18596: // 显示送礼弹窗（先做个简单版本，后面再完善）
18597: function showGiftModal(npcKey) {
18598:     const npc = NPC_DATA[npcKey];
18599:     const today = game.day;
18600:     
```

## [P2] Array out of bounds - 行 18602
数组索引访问可能越界: game.lastGiftDay[npcKey]。建议添加长度检查。

```javascript
18600:     
18601:     // 检查今天是否已经送过礼
18602:     if (game.lastGiftDay && game.lastGiftDay[npcKey] === today) {
18603:         showToast('今天已经送过礼啦~', 'bad');
18604:         playErrorSound();
```

## [P2] Array out of bounds - 行 18666
数组索引访问可能越界: NPC_DATA[npcKey]。建议添加长度检查。

```javascript
18664: // 送礼
18665: function giveGift(npcKey, giftKey) {
18666:     const npc = NPC_DATA[npcKey];
18667:     const today = game.day;
18668:     
```

## [P2] Array out of bounds - 行 18670
数组索引访问可能越界: game.lastGiftDay[npcKey]。建议添加长度检查。

```javascript
18668:     
18669:     // 检查今天是否已经送过礼
18670:     if (game.lastGiftDay && game.lastGiftDay[npcKey] === today) {
18671:         showToast('今天已经送过礼啦~明天再来吧', 'bad');
18672:         playErrorSound();
```

## [P2] Array out of bounds - 行 18676
数组索引访问可能越界: game.items[giftKey]。建议添加长度检查。

```javascript
18674:     }
18675:     
18676:     const owned = game.items[giftKey] || 0;
18677:     if (owned < 1) {
18678:         showToast('礼物不足！', 'bad');
```

## [P2] Array out of bounds - 行 18684
数组索引访问可能越界: game.items[giftKey]。建议添加长度检查。

```javascript
18682:     
18683:     playCoinSound();
18684:     game.items[giftKey] = owned - 1;
18685:     
18686:     // 计算好感度加成
```

## [P2] Array out of bounds - 行 18690
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18688:     const gain = likeLevel; // 喜欢等级就是好感度加成
18689:     
18690:     const oldFriendship = game.npcs[npcKey] || 0;
18691:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18692:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
```

## [P2] Array out of bounds - 行 18691
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18689:     
18690:     const oldFriendship = game.npcs[npcKey] || 0;
18691:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18692:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18693:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
```

## [P2] Array out of bounds - 行 18692
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18690:     const oldFriendship = game.npcs[npcKey] || 0;
18691:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18692:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18693:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18694:     const friendship = game.npcs[npcKey];
```

## [P2] Array out of bounds - 行 18693
数组索引访问可能越界: game.friendship[npcKey]。建议添加长度检查。

```javascript
18691:     game.npcs[npcKey] = Math.min(100, oldFriendship + gain);
18692:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18693:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18694:     const friendship = game.npcs[npcKey];
18695:     
```

## [P2] Array out of bounds - 行 18694
数组索引访问可能越界: game.npcs[npcKey]。建议添加长度检查。

```javascript
18692:     if (!game.friendship[npcKey]) game.friendship[npcKey] = 0;
18693:     game.friendship[npcKey] = Math.min(100, game.friendship[npcKey] + gain);
18694:     const friendship = game.npcs[npcKey];
18695:     
18696:     // 任务检查：第一次送礼
```

## [P2] Array out of bounds - 行 18710
数组索引访问可能越界: game.lastGiftDay[npcKey]。建议添加长度检查。

```javascript
18708:     // 记录今天已经送过礼
18709:     if (!game.lastGiftDay) game.lastGiftDay = {};
18710:     game.lastGiftDay[npcKey] = today;
18711:     
18712:     // 检查是否升级了好感度等级
```

## [P2] Array out of bounds - 行 18731
数组索引访问可能越界: ITEM_DATA[giftKey]。建议添加长度检查。

```javascript
18729:     // 根据NPC和喜欢程度生成个性化反应
18730:     let reaction = '';
18731:     const giftName =(ITEM_DATA[giftKey] && ITEM_DATA[giftKey].name) || '礼物';
18732:     
18733:     // NPC特殊反应（覆盖默认反应）
```

## [P2] Array out of bounds - 行 18762
数组索引访问可能越界: specialReactions[npcKey]。建议添加长度检查。

```javascript
18760:     };
18761:     
18762:     const npcReactions = specialReactions[npcKey];
18763:     if (npcReactions) {
18764:         if (likeLevel >= 7) {
```

## [P2] Array out of bounds - 行 18808
数组索引访问可能越界: FRIENDSHIP_LEVELS[newLevel]。建议添加长度检查。

```javascript
18806:     // 如果升级了好感度等级，显示特殊提示
18807:     if (levelUp) {
18808:         const levelName =(FRIENDSHIP_LEVELS[newLevel] && FRIENDSHIP_LEVELS[newLevel].name) || '新等级';
18809:         modalContent += `<div style="color: #e67e22; font-weight: bold; margin: 10px 0;">🎉 关系提升！现在是【${levelName}】</div>`;
18810:     }
```

## [P2] Array out of bounds - 行 18894
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
18892:     for (const [petKey, petData] of Object.entries(game.pets)) {
18893:         if (!petData || typeof petData !== 'object') continue;
18894:         const pet = PET_DATA[petKey];
18895:         if (!pet || pet.effectType !== effectType) continue;
18896:         
```

## [P2] Array out of bounds - 行 18922
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
18920: // 获取宠物效果文本
18921: function getPetEffectText(petKey) {
18922:     const pet = PET_DATA[petKey];
18923:     if (!pet) return '';
18924:     
```

## [P2] Array out of bounds - 行 18925
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
18923:     if (!pet) return '';
18924:     
18925:     const petData =(game.pets && game.pets[petKey]);
18926:     if (!petData) return '';
18927:     
```

## [P2] Array out of bounds - 行 18950
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
18948:     
18949:     petKeys.forEach(petKey => {
18950:         const pet = PET_DATA[petKey];
18951:         const owned = game.pets && game.pets[petKey];
18952:         
```

## [P2] Array out of bounds - 行 18951
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
18949:     petKeys.forEach(petKey => {
18950:         const pet = PET_DATA[petKey];
18951:         const owned = game.pets && game.pets[petKey];
18952:         
18953:         if (!owned) {
```

## [P2] Array out of bounds - 行 18993
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
18991:         } else {
18992:             // 已拥有
18993:             const petData = game.pets[petKey];
18994:             const friendship = petData.affection || petData.friendship || 0;
18995:             const today = game.day;
```

## [P2] Circular reference - 行 19065
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19063:     
19064:     panel.innerHTML = html;
19065:     panel._lastRenderFields = JSON.stringify(game.fields);
19066: }
19067: 
```

## [P2] Array out of bounds - 行 19070
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
19068: // 领养宠物
19069: function adoptPet(petKey) {
19070:     const pet = PET_DATA[petKey];
19071:     
19072:     if (game.totalDay < pet.unlockDay) {
```

## [P2] Array out of bounds - 行 19086
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
19084:     
19085:     if (!game.pets) game.pets = {};
19086:     if (game.pets[petKey]) {
19087:         showToast('已经领养过啦~', 'bad');
19088:         playErrorSound();
```

## [P2] Array out of bounds - 行 19093
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
19091:     
19092:     playBonusSound();
19093:     game.pets[petKey] = {
19094:         affection: 10,
19095:         friendship: 10,
```

## [P2] Array out of bounds - 行 19107
数组索引访问可能越界: game.pets[k]。建议添加长度检查。

```javascript
19105:     }
19106:     // 任务检查：领养第二只宠物
19107:     const petCount = Object.keys(game.pets).filter(k => game.pets[k]).length;
19108:     if (petCount >= 2 && !game.quests.q44) {
19109:         game.quests.q44 = true;
```

## [P2] Array out of bounds - 行 19125
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
19123: // 喂食宠物
19124: function feedPet(petKey) {
19125:     const pet = PET_DATA[petKey];
19126:     if (!pet) return;
19127:     
```

## [P2] Array out of bounds - 行 19128
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
19126:     if (!pet) return;
19127:     
19128:     const petData =(game.pets && game.pets[petKey]);
19129:     if (!petData) {
19130:         showToast('请先领养宠物~', 'bad');
```

## [P2] State inconsistency - 行 19150
game.money 修改（行 19150）与 game 其他字段修改（行 19155）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19148:     
19149:     playClickSound();
19150:     game.money -= pet.dailyFoodCost;
19151:     petData.lastFedDay = today;
19152:     petData.affection = Math.min(100, (petData.affection || petData.friendship || 0) + 3);
```

## [P2] Array out of bounds - 行 19167
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
19165: // 抚摸宠物
19166: function petPet(petKey) {
19167:     const pet = PET_DATA[petKey];
19168:     if (!pet) return;
19169:     
```

## [P2] Array out of bounds - 行 19170
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
19168:     if (!pet) return;
19169:     
19170:     const petData =(game.pets && game.pets[petKey]);
19171:     if (!petData) {
19172:         showToast('请先领养宠物~', 'bad');
```

## [P2] Array out of bounds - 行 19197
数组索引访问可能越界: PET_DATA[petKey]。建议添加长度检查。

```javascript
19195: // 和宠物玩耍
19196: function playWithPet(petKey) {
19197:     const pet = PET_DATA[petKey];
19198:     if (!pet) return;
19199:     
```

## [P2] Array out of bounds - 行 19200
数组索引访问可能越界: game.pets[petKey]。建议添加长度检查。

```javascript
19198:     if (!pet) return;
19199:     
19200:     const petData =(game.pets && game.pets[petKey]);
19201:     if (!petData) {
19202:         showToast('请先领养宠物~', 'bad');
```

## [P2] Array out of bounds - 行 19265
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
19263:         html += '<div class="shop-category">✅ 已购买的设备</div>';
19264:         ownedDevices.forEach(([deviceId, level]) => {
19265:             const device = AUTOMATION_DATA[deviceId];
19266:             if (!device) return;
19267:             html += `
```

## [P2] Array out of bounds - 行 19278
数组索引访问可能越界: device.levelUpCost[level]。建议添加长度检查。

```javascript
19276:                     </div>
19277:                     <div class="shop-item-price">
19278:                         ${level < device.maxLevel ? `<button class="buy-btn" onclick="upgradeAutomation('${deviceId}')" ${game.money < device.levelUpCost[level] ? 'disabled' : ''}>⬆️ 升级（${device.levelUpCost[level]}元）</button>` : '<span style="color:#27ae60;">✅ 已满级</span>'}
19279:                     </div>
19280:                 </div>
```

## [P2] Array out of bounds - 行 19288
数组索引访问可能越界: game.automation[deviceId]。建议添加长度检查。

```javascript
19286:     html += '<div class="shop-category">🛒 可购买的设备</div>';
19287:     for (const [deviceId, device] of Object.entries(AUTOMATION_DATA)) {
19288:         const currentLevel =(game.automation && game.automation[deviceId]) || 0;
19289:         if (currentLevel > 0) continue; // 已拥有的不显示
19290:         
```

## [P2] Circular reference - 行 19310
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19308:     
19309:     panel.innerHTML = html;
19310:     panel._lastRenderFields = JSON.stringify(game.fields);
19311: }
19312: 
```

## [P2] Array out of bounds - 行 19314
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
19312: 
19313: function buyAutomation(deviceId) {
19314:     const device = AUTOMATION_DATA[deviceId];
19315:     if (!device) return;
19316:     if (game.automation && game.automation[deviceId] > 0) { showToast('已拥有该设备', 'bad'); return; }
```

## [P2] Array out of bounds - 行 19316
数组索引访问可能越界: game.automation[deviceId]。建议添加长度检查。

```javascript
19314:     const device = AUTOMATION_DATA[deviceId];
19315:     if (!device) return;
19316:     if (game.automation && game.automation[deviceId] > 0) { showToast('已拥有该设备', 'bad'); return; }
19317:     if (game.money < device.cost) { showToast('资金不足', 'bad'); return; }
19318:     
```

## [P2] State inconsistency - 行 19319
game.money 修改（行 19319）与 game 其他字段修改（行 19320）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19317:     if (game.money < device.cost) { showToast('资金不足', 'bad'); return; }
19318:     
19319:     game.money -= device.cost;
19320:     if (!game.automation) game.automation = {};
19321:     game.automation[deviceId] = 1;
```

## [P2] Array out of bounds - 行 19321
数组索引访问可能越界: game.automation[deviceId]。建议添加长度检查。

```javascript
19319:     game.money -= device.cost;
19320:     if (!game.automation) game.automation = {};
19321:     game.automation[deviceId] = 1;
19322:     
19323:     addLog(`🎉 购买了${device.emoji}${device.name}！`, 'good');
```

## [P2] Array out of bounds - 行 19330
数组索引访问可能越界: AUTOMATION_DATA[deviceId]。建议添加长度检查。

```javascript
19328: 
19329: function upgradeAutomation(deviceId) {
19330:     const device = AUTOMATION_DATA[deviceId];
19331:     if (!device) return;
19332:     const currentLevel =(game.automation && game.automation[deviceId]) || 0;
```

## [P2] Array out of bounds - 行 19332
数组索引访问可能越界: game.automation[deviceId]。建议添加长度检查。

```javascript
19330:     const device = AUTOMATION_DATA[deviceId];
19331:     if (!device) return;
19332:     const currentLevel =(game.automation && game.automation[deviceId]) || 0;
19333:     if (currentLevel >= device.maxLevel) return;
19334:     
```

## [P2] Array out of bounds - 行 19335
数组索引访问可能越界: device.levelUpCost[currentLevel]。建议添加长度检查。

```javascript
19333:     if (currentLevel >= device.maxLevel) return;
19334:     
19335:     const cost = device.levelUpCost[currentLevel];
19336:     if (game.money < cost) { showToast('资金不足', 'bad'); return; }
19337:     
```

## [P2] State inconsistency - 行 19338
game.money 修改（行 19338）与 game 其他字段修改（行 19320）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19336:     if (game.money < cost) { showToast('资金不足', 'bad'); return; }
19337:     
19338:     game.money -= cost;
19339:     game.automation[deviceId] = currentLevel + 1;
19340:     
```

## [P2] Array out of bounds - 行 19339
数组索引访问可能越界: game.automation[deviceId]。建议添加长度检查。

```javascript
19337:     
19338:     game.money -= cost;
19339:     game.automation[deviceId] = currentLevel + 1;
19340:     
19341:     addLog(`🎉 ${device.emoji}${device.name}升级到了Lv${currentLevel + 1}！`, 'good');
```

## [P2] Circular reference - 行 19386
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19384:     
19385:     panel.innerHTML = html;
19386:     panel._lastRenderFields = JSON.stringify(game.fields);
19387: }
19388: 
```

## [P2] State inconsistency - 行 19396
game.money 修改（行 19396）与 game 其他字段修改（行 19391）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19394:     if (depositAmount <= 0) { showToast('银行存款已达上限', 'bad'); return; }
19395:     game.bankDeposit += depositAmount;
19396:     game.money -= depositAmount;
19397:     addLog(`🏦 存入${depositAmount}元到银行`, 'good');
19398:     saveGame();
```

## [P2] State inconsistency - 行 19405
game.money 修改（行 19405）与 game 其他字段修改（行 19391）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19403: function bankWithdrawAll() {
19404:     if (!game.bankDeposit || game.bankDeposit <= 0) { showToast('没有存款可取出', 'bad'); return; }
19405:     game.money += game.bankDeposit;
19406:     addLog(`🏦 从银行取出${game.bankDeposit}元`, 'good');
19407:     game.bankDeposit = 0;
```

## [P2] Array out of bounds - 行 19428
数组索引访问可能越界: NEIGHBOR_HELP_DATA[helpId]。建议添加长度检查。

```javascript
19426:         html += '<div class="shop-category">✅ 已激活的互助</div>';
19427:         activeHelps.forEach(([helpId, active]) => {
19428:             const help = NEIGHBOR_HELP_DATA[helpId];
19429:             if (!help) return;
19430:             html += `
```

## [P2] Array out of bounds - 行 19447
数组索引访问可能越界: game.neighborHelp[helpId]。建议添加长度检查。

```javascript
19445:     html += '<div class="shop-category">🔓 可解锁的互助</div>';
19446:     for (const [helpId, help] of Object.entries(NEIGHBOR_HELP_DATA)) {
19447:         if (game.neighborHelp && game.neighborHelp[helpId]) continue; // 已激活
19448:         const canUnlock = totalFriendship >= help.requireFriendship;
19449:         html += `
```

## [P2] Circular reference - 行 19468
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19466:     
19467:     panel.innerHTML = html;
19468:     panel._lastRenderFields = JSON.stringify(game.fields);
19469: }
19470: 
```

## [P2] Array out of bounds - 行 19472
数组索引访问可能越界: NEIGHBOR_HELP_DATA[helpId]。建议添加长度检查。

```javascript
19470: 
19471: function unlockNeighborHelp(helpId) {
19472:     const help = NEIGHBOR_HELP_DATA[helpId];
19473:     if (!help) return;
19474:     const totalFriendship = Object.values(game.friendship || {}).reduce((sum, v) => sum + (v || 0), 0);
```

## [P2] Array out of bounds - 行 19478
数组索引访问可能越界: game.neighborHelp[helpId]。建议添加长度检查。

```javascript
19476:     
19477:     if (!game.neighborHelp) game.neighborHelp = {};
19478:     game.neighborHelp[helpId] = true;
19479:     
19480:     addLog(`🎉 解锁了${help.emoji}${help.name}！${help.npcText}`, 'good');
```

## [P2] Circular reference - 行 19497
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19495:         html += '<div class="empty-state">📅 下次赶集日是第' + (nextMarketDay || '下月首') + '天</div>';
19496:         panel.innerHTML = html;
19497:     panel._lastRenderFields = JSON.stringify(game.fields);
19498:         return;
19499:     }
```

## [P2] Circular reference - 行 19544
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19542:     
19543:     panel.innerHTML = html;
19544:     panel._lastRenderFields = JSON.stringify(game.fields);
19545: }
19546: 
```

## [P2] State inconsistency - 行 19551
game.money 修改（行 19551）与 game 其他字段修改（行 19552）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19549:     if (item && item.stock !== undefined && item.stock <= 0) { showToast('该商品已售罄', 'bad'); return; }
19550:     if (game.money < price) { showToast('钱不够', 'bad'); return; }
19551:     game.money -= price;
19552:     if (!game.items) game.items = {};
19553:     game.items[itemId] = (game.items[itemId] || 0) + 1;
```

## [P2] Array out of bounds - 行 19553
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
19551:     game.money -= price;
19552:     if (!game.items) game.items = {};
19553:     game.items[itemId] = (game.items[itemId] || 0) + 1;
19554:     if (item && item.stock !== undefined) item.stock -= 1;
19555:     addLog(`🛒 集市买了${(ITEM_DATA[itemId] && ITEM_DATA[itemId].name) || itemId}`, 'good');
```

## [P2] Array out of bounds - 行 19555
数组索引访问可能越界: ITEM_DATA[itemId]。建议添加长度检查。

```javascript
19553:     game.items[itemId] = (game.items[itemId] || 0) + 1;
19554:     if (item && item.stock !== undefined) item.stock -= 1;
19555:     addLog(`🛒 集市买了${(ITEM_DATA[itemId] && ITEM_DATA[itemId].name) || itemId}`, 'good');
19556:     saveGame();
19557:     renderMarketPanel();
```

## [P2] State inconsistency - 行 19563
game.money 修改（行 19563）与 game 其他字段修改（行 19552）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19561: function buyCrop(cropId, price) {
19562:     if (game.money < price) { showToast('钱不够', 'bad'); return; }
19563:     game.money -= price;
19564:     game.crops[cropId] = (game.crops[cropId] || 0) + 1;
19565:     addLog(`🛒 集市买了1斤${cropId}`, 'good');
```

## [P2] Array out of bounds - 行 19564
数组索引访问可能越界: game.crops[cropId]。建议添加长度检查。

```javascript
19562:     if (game.money < price) { showToast('钱不够', 'bad'); return; }
19563:     game.money -= price;
19564:     game.crops[cropId] = (game.crops[cropId] || 0) + 1;
19565:     addLog(`🛒 集市买了1斤${cropId}`, 'good');
19566:     saveGame();
```

## [P2] Array out of bounds - 行 19572
数组索引访问可能越界: game.crops[cropId]。建议添加长度检查。

```javascript
19570: 
19571: function sellMarketCrop(cropId, price) {
19572:     if (!game.crops[cropId] || game.crops[cropId] <= 0) { showToast('没有库存', 'bad'); return; }
19573:     
19574:     // 应用售价加成
```

## [P2] Array out of bounds - 行 19581
数组索引访问可能越界: game.crops[cropId]。建议添加长度检查。

```javascript
19579:     const money = Math.floor(finalPrice);
19580:     
19581:     game.crops[cropId]--;
19582:     game.money += money;
19583:     
```

## [P2] State inconsistency - 行 19582
game.money 修改（行 19582）与 game 其他字段修改（行 19584）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19580:     
19581:     game.crops[cropId]--;
19582:     game.money += money;
19583:     
19584:     if (!game.stats) game.stats = {};
```

## [P2] Circular reference - 行 19639
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19637:     
19638:     panel.innerHTML = html;
19639:     panel._lastRenderFields = JSON.stringify(game.fields);
19640: }
19641: 
```

## [P2] State inconsistency - 行 19647
game.money 修改（行 19647）与 game 其他字段修改（行 19648）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19645:     if (game.money < nextLevel.cost) { showToast('资金不足', 'bad'); return; }
19646:     
19647:     game.money -= nextLevel.cost;
19648:     if (!game.agriTechLevel) game.agriTechLevel = 0;
19649:     if (!game.agriTechEffects) game.agriTechEffects = {};
```

## [P2] Array out of bounds - 行 19674
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
19672:     for (const [animalKey, animals] of Object.entries(game.animals || {})) {
19673:         if (animals.length === 0) continue;
19674:         const data = ANIMAL_DATA[animalKey];
19675:         if (!data) continue;
19676:         
```

## [P2] Array out of bounds - 行 19731
数组索引访问可能越界: productEmojis[key]。建议添加长度检查。

```javascript
19729:                 <div class="shop-item">
19730:                     <div class="shop-item-info">
19731:                         <div class="shop-item-icon">${productEmojis[key] || '📦'}</div>
19732:                         <div>
19733:                             <div class="shop-item-name">${productNames[key] || key}</div>
```

## [P2] Array out of bounds - 行 19733
数组索引访问可能越界: productNames[key]。建议添加长度检查。

```javascript
19731:                         <div class="shop-item-icon">${productEmojis[key] || '📦'}</div>
19732:                         <div>
19733:                             <div class="shop-item-name">${productNames[key] || key}</div>
19734:                             <div class="shop-item-desc">库存：${count}个</div>
19735:                         </div>
```

## [P2] Circular reference - 行 19746
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19744:     
19745:     panel.innerHTML = html;
19746:     panel._lastRenderFields = JSON.stringify(game.fields);
19747: }
19748: 
```

## [P2] Array out of bounds - 行 19806
数组索引访问可能越界: ORCHARD_DATA[key]。建议添加长度检查。

```javascript
19804:         for (const [key, count] of Object.entries(game.fruits)) {
19805:             if (count <= 0) continue;
19806:             const data = ORCHARD_DATA[key];
19807:             if (!data) continue;
19808:             html += `
```

## [P2] Circular reference - 行 19826
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19824:     
19825:     panel.innerHTML = html;
19826:     panel._lastRenderFields = JSON.stringify(game.fields);
19827: }
19828: 
```

## [P2] Array out of bounds - 行 19843
数组索引访问可能越界: VILLAGE_PROJECTS[key]。建议添加长度检查。

```javascript
19841:         html += '<div class="shop-category">✅ 已合作项目</div>';
19842:         activeProjects.forEach(([key, level]) => {
19843:             const project = VILLAGE_PROJECTS[key];
19844:             if (!project) return;
19845:             html += `
```

## [P2] Array out of bounds - 行 19862
数组索引访问可能越界: game.villageProjects[key]。建议添加长度检查。

```javascript
19860:     html += '<div class="shop-category">🏗️ 可合作项目</div>';
19861:     for (const [key, project] of Object.entries(VILLAGE_PROJECTS)) {
19862:         const currentLevel =(game.villageProjects && game.villageProjects[key]) || 0;
19863:         if (currentLevel >= project.maxLevel) continue;
19864:         
```

## [P2] Array out of bounds - 行 19875
数组索引访问可能越界: project.levelDesc[currentLevel]。建议添加长度检查。

```javascript
19873:                         <div class="shop-item-name">${project.name}（Lv${currentLevel + 1}/${project.maxLevel}）</div>
19874:                         <div class="shop-item-desc">${project.desc}</div>
19875:                         <div class="shop-item-desc">下一级：${project.levelDesc[currentLevel] || '完成'}</div>
19876:                         <div class="shop-item-desc">${!canAfford ? '❌ 资金不足' : ''} ${!canReputation ? '❌ 声望不足（需' + project.requireReputation + '）' : ''}</div>
19877:                     </div>
```

## [P2] Circular reference - 行 19887
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19885:     
19886:     panel.innerHTML = html;
19887:     panel._lastRenderFields = JSON.stringify(game.fields);
19888: }
19889: 
```

## [P2] Array out of bounds - 行 19910
数组索引访问可能越界: FARM_STAY_DATA.level[currentLevel]。建议添加长度检查。

```javascript
19908:     // 升级
19909:     if (currentLevel < FARM_STAY_DATA.level.length) {
19910:         const nextLevel = FARM_STAY_DATA.level[currentLevel];
19911:         html += '<div class="shop-category">⬆️ 升级农家乐</div>';
19912:         html += `
```

## [P2] Array out of bounds - 行 19933
数组索引访问可能越界: game.farmStayDishes[key]。建议添加长度检查。

```javascript
19931:         html += '<div class="shop-category">🍽️ 招牌菜</div>';
19932:         for (const [key, dish] of Object.entries(FARM_STAY_DATA.dishes)) {
19933:             const made =(game.farmStayDishes && game.farmStayDishes[key]) || 0;
19934:             // 检查原料是否充足
19935:             let hasIngredients = true;
```

## [P2] Array out of bounds - 行 19945
数组索引访问可能越界: game.crops[ingredient]。建议添加长度检查。

```javascript
19943:                 else if (ingredient === 'chicken') have = (game.animals && game.animals.chicken && game.animals.chicken.length) || 0;
19944:                 else if (ingredient === 'lamb') have = (game.animals && game.animals.sheep && game.animals.sheep.length) || 0;
19945:                 else have =(game.crops && game.crops[ingredient]) || 0;
19946:                 
19947:                 if (have < amount) { hasIngredients = false; break; }
```

## [P2] Circular reference - 行 19969
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
19967:     
19968:     panel.innerHTML = html;
19969:     panel._lastRenderFields = JSON.stringify(game.fields);
19970: }
19971: 
```

## [P2] Array out of bounds - 行 19973
数组索引访问可能越界: VILLAGE_PROJECTS[projectKey]。建议添加长度检查。

```javascript
19971: 
19972: function investVillageProject(projectKey) {
19973:     const project = VILLAGE_PROJECTS[projectKey];
19974:     if (!project) return;
19975:     if (game.money < project.cost) { showToast('资金不足', 'bad'); return; }
```

## [P2] State inconsistency - 行 19978
game.money 修改（行 19978）与 game 其他字段修改（行 19979）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
19976:     if (game.reputation < project.requireReputation) { showToast('声望不足', 'bad'); return; }
19977:     
19978:     game.money -= project.cost;
19979:     if (!game.villageProjects) game.villageProjects = {};
19980:     game.villageProjects[projectKey] = (game.villageProjects[projectKey] || 0) + 1;
```

## [P2] Array out of bounds - 行 19980
数组索引访问可能越界: game.villageProjects[projectKey]。建议添加长度检查。

```javascript
19978:     game.money -= project.cost;
19979:     if (!game.villageProjects) game.villageProjects = {};
19980:     game.villageProjects[projectKey] = (game.villageProjects[projectKey] || 0) + 1;
19981:     
19982:     // 某些项目有即时效果
```

## [P2] Array out of bounds - 行 19991
数组索引访问可能越界: game.villageProjects[projectKey]。建议添加长度检查。

```javascript
19989:     }
19990:     if (project.effect === 'storageBonus') {
19991:         const currentLevel = (game.villageProjects[projectKey] || 1);
19992:         const bonusAmount = projectKey === 'idleWarehouse' 
19993:             ? (currentLevel === 1 ? 2000 : 5000) 
```

## [P2] Array out of bounds - 行 20008
数组索引访问可能越界: FARM_STAY_DATA.level[currentLevel]。建议添加长度检查。

```javascript
20006:     const currentLevel =(game.farmStay && game.farmStay.level) || 0;
20007:     if (currentLevel >= FARM_STAY_DATA.level.length) return;
20008:     const nextLevel = FARM_STAY_DATA.level[currentLevel];
20009:     if (game.money < nextLevel.cost) { showToast('资金不足', 'bad'); return; }
20010:     
```

## [P2] State inconsistency - 行 20011
game.money 修改（行 20011）与 game 其他字段修改（行 19995）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20009:     if (game.money < nextLevel.cost) { showToast('资金不足', 'bad'); return; }
20010:     
20011:     game.money -= nextLevel.cost;
20012:     if (!game.farmStay) game.farmStay = { level: 0, guests: 0, reputation: 0 };
20013:     game.farmStay.level++;
```

## [P2] Array out of bounds - 行 20022
数组索引访问可能越界: FARM_STAY_DATA.dishes[dishKey]。建议添加长度检查。

```javascript
20020: 
20021: function makeDish(dishKey) {
20022:     const dish = FARM_STAY_DATA.dishes[dishKey];
20023:     if (!dish) return;
20024:     
```

## [P2] Array out of bounds - 行 20039
数组索引访问可能越界: game.crops[ingredient]。建议添加长度检查。

```javascript
20037:             have = adults;
20038:         }
20039:         else have =(game.crops && game.crops[ingredient]) || 0;
20040:         
20041:         if (have < amount) { showToast('原料不足', 'bad'); return; }
```

## [P2] Array out of bounds - 行 20054
数组索引访问可能越界: game.fruits[fType]。建议添加长度检查。

```javascript
20052:                 const actualCount = fCount || 0;
20053:                 const take = Math.min(remaining, actualCount);
20054:                 game.fruits[fType] = (game.fruits[fType] || 0) - take;
20055:                 remaining -= take;
20056:             }
```

## [P2] Array out of bounds - 行 20081
数组索引访问可能越界: game.crops[ingredient]。建议添加长度检查。

```javascript
20079:             }
20080:         }
20081:         else if (game.crops[ingredient]) game.crops[ingredient] -= amount;
20082:     }
20083:     
```

## [P2] Array out of bounds - 行 20085
数组索引访问可能越界: game.farmStayDishes[dishKey]。建议添加长度检查。

```javascript
20083:     
20084:     if (!game.farmStayDishes) game.farmStayDishes = {};
20085:     game.farmStayDishes[dishKey] = (game.farmStayDishes[dishKey] || 0) + 1;
20086:     game.money += dish.income;
20087:     
```

## [P2] State inconsistency - 行 20086
game.money 修改（行 20086）与 game 其他字段修改（行 20084）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20084:     if (!game.farmStayDishes) game.farmStayDishes = {};
20085:     game.farmStayDishes[dishKey] = (game.farmStayDishes[dishKey] || 0) + 1;
20086:     game.money += dish.income;
20087:     
20088:     addLog(`🍽️ 制作了${dish.emoji}${dish.name}，收入${dish.income}元！`, 'good');
```

## [P2] Array out of bounds - 行 20095
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
20093: 
20094: function buyAnimal(animalKey) {
20095:     const data = ANIMAL_DATA[animalKey];
20096:     if (!data) return;
20097:     if (game.money < data.buyCost) { showToast('资金不足', 'bad'); return; }
```

## [P2] State inconsistency - 行 20099
game.money 修改（行 20099）与 game 其他字段修改（行 20084）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20097:     if (game.money < data.buyCost) { showToast('资金不足', 'bad'); return; }
20098:     
20099:     game.money -= data.buyCost;
20100:     if (!game.animals) game.animals = {};
20101:     if (!game.animals[animalKey]) game.animals[animalKey] = [];
```

## [P2] Array out of bounds - 行 20101
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20099:     game.money -= data.buyCost;
20100:     if (!game.animals) game.animals = {};
20101:     if (!game.animals[animalKey]) game.animals[animalKey] = [];
20102:     
20103:     const animalName = data.name + (game.animals[animalKey].length + 1) + '号';
```

## [P2] Array out of bounds - 行 20103
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20101:     if (!game.animals[animalKey]) game.animals[animalKey] = [];
20102:     
20103:     const animalName = data.name + (game.animals[animalKey].length + 1) + '号';
20104:     game.animals[animalKey].push({ name: animalName, age: 0, weight: 5, daysSinceProduct: 0 });
20105:     
```

## [P2] Array out of bounds - 行 20104
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20102:     
20103:     const animalName = data.name + (game.animals[animalKey].length + 1) + '号';
20104:     game.animals[animalKey].push({ name: animalName, age: 0, weight: 5, daysSinceProduct: 0 });
20105:     
20106:     addLog(`🎉 买了${data.emoji}${animalName}，花了${data.buyCost}元`, 'good');
```

## [P2] Array out of bounds - 行 20113
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
20111: 
20112: function sellAnimal(animalKey, idx) {
20113:     const data = ANIMAL_DATA[animalKey];
20114:     if (!data || !game.animals[animalKey]) return;
20115:     const animal = game.animals[animalKey][idx];
```

## [P2] Array out of bounds - 行 20114
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20112: function sellAnimal(animalKey, idx) {
20113:     const data = ANIMAL_DATA[animalKey];
20114:     if (!data || !game.animals[animalKey]) return;
20115:     const animal = game.animals[animalKey][idx];
20116:     if (!animal) return;
```

## [P2] Array out of bounds - 行 20115
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20113:     const data = ANIMAL_DATA[animalKey];
20114:     if (!data || !game.animals[animalKey]) return;
20115:     const animal = game.animals[animalKey][idx];
20116:     if (!animal) return;
20117:     
```

## [P2] Array out of bounds - 行 20126
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20124:     const price = Math.floor(data.sellPrice * weightFactor);
20125:     game.money += price;
20126:     game.animals[animalKey].splice(idx, 1);
20127:     
20128:     addLog(`💰 卖掉${data.emoji}${animal.name}，获得${price}元`, 'good');
```

## [P2] Array out of bounds - 行 20135
数组索引访问可能越界: ANIMAL_DATA[animalKey]。建议添加长度检查。

```javascript
20133: 
20134: function harvestAnimalProduct(animalKey, idx) {
20135:     const data = ANIMAL_DATA[animalKey];
20136:     if (!data || !data.product) return;
20137:     if (!game.animals[animalKey]) return;
```

## [P2] Array out of bounds - 行 20137
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20135:     const data = ANIMAL_DATA[animalKey];
20136:     if (!data || !data.product) return;
20137:     if (!game.animals[animalKey]) return;
20138:     const animal = game.animals[animalKey][idx];
20139:     if (!animal) return;
```

## [P2] Array out of bounds - 行 20138
数组索引访问可能越界: game.animals[animalKey]。建议添加长度检查。

```javascript
20136:     if (!data || !data.product) return;
20137:     if (!game.animals[animalKey]) return;
20138:     const animal = game.animals[animalKey][idx];
20139:     if (!animal) return;
20140:     
```

## [P2] Array out of bounds - 行 20166
数组索引访问可能越界: game.animalProducts[productKey]。建议添加长度检查。

```javascript
20164:     const emojis = { milk: '🥛', egg: '🥚', duck_egg: '🥚', goose_egg: '🥚', wool: '🧶' };
20165:     
20166:     if (!game.animalProducts || !game.animalProducts[productKey] || game.animalProducts[productKey] < amount) return;
20167:     
20168:     // 应用售价加成
```

## [P2] Array out of bounds - 行 20172
数组索引访问可能越界: prices[productKey]。建议添加长度检查。

```javascript
20170:     const npcSellBonus = (typeof getNpcBonus === 'function') ? getNpcBonus('sellPrice') : 0;
20171:     if (npcSellBonus > 0) sellBonusTotal += npcSellBonus;
20172:     const price = (prices[productKey] || 5) * (1 + Math.max(0, Math.min(2.0, sellBonusTotal)));
20173:     const money = Math.floor(price * amount);
20174:     
```

## [P2] Array out of bounds - 行 20175
数组索引访问可能越界: game.animalProducts[productKey]。建议添加长度检查。

```javascript
20173:     const money = Math.floor(price * amount);
20174:     
20175:     game.animalProducts[productKey] -= amount;
20176:     game.money += money;
20177:     
```

## [P2] State inconsistency - 行 20176
game.money 修改（行 20176）与 game 其他字段修改（行 20178）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20174:     
20175:     game.animalProducts[productKey] -= amount;
20176:     game.money += money;
20177:     
20178:     if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 20182
数组索引访问可能越界: emojis[productKey]。建议添加长度检查。

```javascript
20180:     game.stats.totalEarned = (game.stats.totalEarned || 0) + money;
20181:     
20182:     addLog(`💰 卖掉${emojis[productKey] || '📦'}${amount}个${names[productKey] || productKey}，获得${money}元`, 'good');
20183:     saveGame();
20184:     renderAnimalsPanel();
```

## [P2] Array out of bounds - 行 20182
数组索引访问可能越界: names[productKey]。建议添加长度检查。

```javascript
20180:     game.stats.totalEarned = (game.stats.totalEarned || 0) + money;
20181:     
20182:     addLog(`💰 卖掉${emojis[productKey] || '📦'}${amount}个${names[productKey] || productKey}，获得${money}元`, 'good');
20183:     saveGame();
20184:     renderAnimalsPanel();
```

## [P2] Array out of bounds - 行 20189
数组索引访问可能越界: ORCHARD_DATA[treeKey]。建议添加长度检查。

```javascript
20187: 
20188: function buyTree(treeKey) {
20189:     const data = ORCHARD_DATA[treeKey];
20190:     if (!data) return;
20191:     if (game.money < data.buyCost) { showToast('资金不足', 'bad'); return; }
```

## [P2] State inconsistency - 行 20193
game.money 修改（行 20193）与 game 其他字段修改（行 20178）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20191:     if (game.money < data.buyCost) { showToast('资金不足', 'bad'); return; }
20192:     
20193:     game.money -= data.buyCost;
20194:     if (!game.orchard) game.orchard = [];
20195:     game.orchard.push({ type: treeKey, growDays: 0, mature: false, ready: false, daysSinceHarvest: 0 });
```

## [P2] Array out of bounds - 行 20204
数组索引访问可能越界: game.orchard[treeIdx]。建议添加长度检查。

```javascript
20202: 
20203: function harvestFruit(treeIdx) {
20204:     if (!game.orchard || !game.orchard[treeIdx]) return;
20205:     const tree = game.orchard[treeIdx];
20206:     const data = ORCHARD_DATA[tree.type];
```

## [P2] Array out of bounds - 行 20205
数组索引访问可能越界: game.orchard[treeIdx]。建议添加长度检查。

```javascript
20203: function harvestFruit(treeIdx) {
20204:     if (!game.orchard || !game.orchard[treeIdx]) return;
20205:     const tree = game.orchard[treeIdx];
20206:     const data = ORCHARD_DATA[tree.type];
20207:     if (!data || !tree.ready) return;
```

## [P2] Array out of bounds - 行 20229
数组索引访问可能越界: ORCHARD_DATA[fruitKey]。建议添加长度检查。

```javascript
20227: 
20228: function sellFruit(fruitKey, amount) {
20229:     const data = ORCHARD_DATA[fruitKey];
20230:     if (!data || !game.fruits || !game.fruits[fruitKey] || game.fruits[fruitKey] < amount) return;
20231:     
```

## [P2] Array out of bounds - 行 20230
数组索引访问可能越界: game.fruits[fruitKey]。建议添加长度检查。

```javascript
20228: function sellFruit(fruitKey, amount) {
20229:     const data = ORCHARD_DATA[fruitKey];
20230:     if (!data || !game.fruits || !game.fruits[fruitKey] || game.fruits[fruitKey] < amount) return;
20231:     
20232:     // 应用售价加成
```

## [P2] Array out of bounds - 行 20239
数组索引访问可能越界: game.fruits[fruitKey]。建议添加长度检查。

```javascript
20237:     const money = Math.floor(price * amount);
20238:     
20239:     game.fruits[fruitKey] -= amount;
20240:     game.money += money;
20241:     
```

## [P2] State inconsistency - 行 20240
game.money 修改（行 20240）与 game 其他字段修改（行 20242）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20238:     
20239:     game.fruits[fruitKey] -= amount;
20240:     game.money += money;
20241:     
20242:     if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 20253
数组索引访问可能越界: game.orchard[treeIdx]。建议添加长度检查。

```javascript
20251: 
20252: function removeTree(treeIdx) {
20253:     if (!game.orchard || !game.orchard[treeIdx]) return;
20254:     const tree = game.orchard[treeIdx];
20255:     const data = ORCHARD_DATA[tree.type];
```

## [P2] Array out of bounds - 行 20254
数组索引访问可能越界: game.orchard[treeIdx]。建议添加长度检查。

```javascript
20252: function removeTree(treeIdx) {
20253:     if (!game.orchard || !game.orchard[treeIdx]) return;
20254:     const tree = game.orchard[treeIdx];
20255:     const data = ORCHARD_DATA[tree.type];
20256:     showModal('确认砍伐', `确定要砍伐${data ? data.name : '这棵'}树吗？已种植的果树会永久消失。`, () => {
```

## [P2] Array out of bounds - 行 20279
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20277: function prepareField(fieldIdx) {
20278:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20279:     const field = game.fields[fieldIdx];
20280:     
20281:     let staminaCost = 15;
```

## [P2] Array out of bounds - 行 20329
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20327: function plantCrop(fieldIdx, cropKey) {
20328:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20329:     const field = game.fields[fieldIdx];
20330:     const cropData = CROP_DATA[cropKey];
20331:     
```

## [P2] Array out of bounds - 行 20330
数组索引访问可能越界: CROP_DATA[cropKey]。建议添加长度检查。

```javascript
20328:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20329:     const field = game.fields[fieldIdx];
20330:     const cropData = CROP_DATA[cropKey];
20331:     
20332:     if (!field.prepared) {
```

## [P2] Array out of bounds - 行 20345
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
20343:     }
20344:     
20345:     if (game.seeds[cropKey] < 1) {
20346:         showToast('种子不足！', 'bad');
20347:         return;
```

## [P2] Array out of bounds - 行 20361
数组索引访问可能越界: game.seeds[cropKey]。建议添加长度检查。

```javascript
20359:     playDirtSound();
20360:     // 消耗种子和体力
20361:     game.seeds[cropKey]--;
20362:     game.stamina -= plantCost;
20363:     field.crop = cropKey;
```

## [P2] Array out of bounds - 行 20416
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20414: function transplantCrop(fieldIdx) {
20415:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20416:     const field = game.fields[fieldIdx];
20417:     const cropData = CROP_DATA[field.crop];
20418:     
```

## [P2] Array out of bounds - 行 20462
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20460: function waterField(fieldIdx) {
20461:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20462:     const field = game.fields[fieldIdx];
20463:     // 每天只能浇一次水
20464:     if (field.lastWaterDay === game.day) {
```

## [P2] Array out of bounds - 行 20506
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20504: function weedField(fieldIdx) {
20505:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20506:     const field = game.fields[fieldIdx];
20507:     // 每3天才能除一次草
20508:     const daysSinceWeed = game.day - field.lastWeedDay;
```

## [P2] Array out of bounds - 行 20540
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20538: function fertilizeField(fieldIdx, type = 'normal') {
20539:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20540:     const field = game.fields[fieldIdx];
20541:     
20542:     if (field.fertilized) {
```

## [P2] Array out of bounds - 行 20613
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20611: function turnVine(fieldIdx, turnNum) {
20612:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20613:     const field = game.fields[fieldIdx];
20614:     let vineCost = 13;
20615:     if (game.tools.includes('hoe')) {
```

## [P2] Array out of bounds - 行 20643
数组索引访问可能越界: game.fields[fieldIdx]。建议添加长度检查。

```javascript
20641: function harvestCrop(fieldIdx) {
20642:     if (!game.fields || fieldIdx < 0 || fieldIdx >= game.fields.length) { showToast('操作失败', 'bad'); return; }
20643:     const field = game.fields[fieldIdx];
20644:     if (!field.crop) return;
20645:     
```

## [P2] Array out of bounds - 行 20854
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
20852: // 出售作物
20853: function sellCrop(cropKey, amount) {
20854:     const owned = game.crops[cropKey] || 0;
20855:     if (owned < 1) {
20856:         showToast('没有可出售的作物！', 'bad');
```

## [P2] Array out of bounds - 行 20867
数组索引访问可能越界: names[cropKey]。建议添加长度检查。

```javascript
20865:     if (amount === 'all') {
20866:         const money = Math.floor(sellAmount * price);
20867:         showModal('确认出售', `确定要卖出所有${sellAmount}斤 ${names[cropKey]}吗？预计收入${money}元。`, () => {
20868:             _doSellCrop(cropKey, sellAmount, price);
20869:         });
```

## [P2] Array out of bounds - 行 20877
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
20875: 
20876: function _doSellCrop(cropKey, sellAmount, price) {
20877:     const owned = game.crops[cropKey] || 0;
20878:     if (sellAmount > owned) sellAmount = owned;
20879:     if (sellAmount <= 0) return;
```

## [P2] Array out of bounds - 行 20890
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
20888:     let money = Math.floor(sellAmount * finalPrice);
20889:     
20890:     game.crops[cropKey] -= sellAmount;
20891:     game.money += money;
20892:     
```

## [P2] State inconsistency - 行 20891
game.money 修改（行 20891）与 game 其他字段修改（行 20894）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
20889:     
20890:     game.crops[cropKey] -= sellAmount;
20891:     game.money += money;
20892:     
20893:     // 累计售卖统计
```

## [P2] Array out of bounds - 行 20911
数组索引访问可能越界: names[cropKey]。建议添加长度检查。

```javascript
20909:     ];
20910:     const flavorText = sellFlavors[Math.floor(Math.random() * sellFlavors.length)];
20911:     addLog(`💰 出售了${sellAmount}斤 ${names[cropKey]}，获得${money}元。${flavorText}`, 'good');
20912:     
20913:     // 检查任务：q7 开市售卖（第一桶金）
```

## [P2] Array out of bounds - 行 20952
数组索引访问可能越界: CROP_DATA[seedKey]。建议添加长度检查。

```javascript
20950: // 购买种子
20951: function buySeed(seedKey) {
20952:     const cropData = CROP_DATA[seedKey];
20953:     if (!cropData) {
20954:         showToast('种子不存在', 'bad');
```

## [P2] Array out of bounds - 行 20966
数组索引访问可能越界: game.seeds[seedKey]。建议添加长度检查。

```javascript
20964:     
20965:     game.money -= actualSeedPrice;
20966:     game.seeds[seedKey] = (game.seeds[seedKey] || 0) + 1;
20967:     
20968:     playCoinSound();
```

## [P2] Array out of bounds - 行 20988
数组索引访问可能越界: ITEM_DATA[itemKey]。建议添加长度检查。

```javascript
20986: // 购买道具
20987: function buyItem(itemKey) {
20988:     const itemData = ITEM_DATA[itemKey];
20989:     if (!itemData) {
20990:         showToast('商品不存在', 'bad');
```

## [P2] Array out of bounds - 行 21009
数组索引访问可能越界: game.items[itemKey]。建议添加长度检查。

```javascript
21007:     playCoinSound();
21008:     game.money -= finalPrice;
21009:     game.items[itemKey] = (game.items[itemKey] || 0) + 1;
21010:     
21011:     addLog(`🛒 购买了${name}`, 'info');
```

## [P2] Array out of bounds - 行 21022
数组索引访问可能越界: TOOL_DATA[toolKey]。建议添加长度检查。

```javascript
21020: // 购买农具
21021: function buyTool(toolKey) {
21022:     const tool = TOOL_DATA[toolKey];
21023:     if (!tool) return;
21024:     
```

## [P2] State inconsistency - 行 21071
game.money 修改（行 21071）与 game 其他字段修改（行 21072）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
21069:     
21070:     playDirtSound();
21071:     game.money -= 50;
21072:     game.composting = true;
21073:     game.compostStartTotalDay = game.totalDay || game.day;
```

## [P2] State inconsistency - 行 21133
game.money 修改（行 21133）与 game 其他字段修改（行 21115）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
21131:     if (!game) return;
21132:     // 防止浮点数累积，同时修复NaN/Infinity污染
21133:     if (!isFinite(game.money)) game.money = 0;
21134:     if (!isFinite(game.stamina)) game.stamina = game.maxStamina || 100;
21135:     if (!isFinite(game.health)) game.health = game.maxHealth || 100;
```

## [P2] State inconsistency - 行 21138
game.money 修改（行 21138）与 game 其他字段修改（行 21134）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
21136:     if (!isFinite(game.reputation)) game.reputation = 0;
21137:     
21138:     game.money = Math.round(game.money * 10) / 10;
21139:     game.stamina = Math.round(game.stamina * 10) / 10;
21140:     game.health = Math.round(game.health * 10) / 10;
```

## [P2] Array out of bounds - 行 21146
数组索引访问可能越界: game.crops[type]。建议添加长度检查。

```javascript
21144:     const cropTypes = ['rice', 'sweet', 'wheat', 'corn', 'soybean', 'potato', 'peanut', 'pepper', 'cabbage', 'radish', 'eggplant', 'garlic'];
21145:     cropTypes.forEach(type => {
21146:         if (game.crops[type] !== undefined) {
21147:             if (!isFinite(game.crops[type])) game.crops[type] = 0;
21148:             game.crops[type] = Math.round(game.crops[type] * 10) / 10;
```

## [P2] Array out of bounds - 行 21147
数组索引访问可能越界: game.crops[type]。建议添加长度检查。

```javascript
21145:     cropTypes.forEach(type => {
21146:         if (game.crops[type] !== undefined) {
21147:             if (!isFinite(game.crops[type])) game.crops[type] = 0;
21148:             game.crops[type] = Math.round(game.crops[type] * 10) / 10;
21149:         }
```

## [P2] Array out of bounds - 行 21148
数组索引访问可能越界: game.crops[type]。建议添加长度检查。

```javascript
21146:         if (game.crops[type] !== undefined) {
21147:             if (!isFinite(game.crops[type])) game.crops[type] = 0;
21148:             game.crops[type] = Math.round(game.crops[type] * 10) / 10;
21149:         }
21150:     });
```

## [P2] Array out of bounds - 行 21170
数组索引访问可能越界: game[key]。建议添加长度检查。

```javascript
21168:     ];
21169:     numberFields.forEach(key => {
21170:         if (game[key] !== undefined) {
21171:             if (!isFinite(game[key])) game[key] = 0;
21172:             game[key] = Math.round(game[key] * 10) / 10;
```

## [P2] Array out of bounds - 行 21171
数组索引访问可能越界: game[key]。建议添加长度检查。

```javascript
21169:     numberFields.forEach(key => {
21170:         if (game[key] !== undefined) {
21171:             if (!isFinite(game[key])) game[key] = 0;
21172:             game[key] = Math.round(game[key] * 10) / 10;
21173:         }
```

## [P2] Array out of bounds - 行 21172
数组索引访问可能越界: game[key]。建议添加长度检查。

```javascript
21170:         if (game[key] !== undefined) {
21171:             if (!isFinite(game[key])) game[key] = 0;
21172:             game[key] = Math.round(game[key] * 10) / 10;
21173:         }
21174:     });
```

## [P2] State inconsistency - 行 21321
game.money 修改（行 21321）与 game 其他字段修改（行 21323）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
21319:         return;
21320:     }
21321:     game.money -= cost;
21322:     const oldCap = game.storageCapacity || 3000;
21323:     game.storageCapacity = oldCap + 1000;
```

## [P2] Array out of bounds - 行 21348
数组索引访问可能越界: basePrices[cropKey]。建议添加长度检查。

```javascript
21346:     // 基础价格
21347:     const basePrices = { rice: 3.0, sweet: 1.5, fish: 3.5, wheat: 2.5, corn: 2.0, soybean: 2.8, potato: 2.0, peanut: 3.0, pepper: 2.0, cabbage: 1.0, radish: 1.0, eggplant: 2.0, garlic: 2.0 };
21348:     let price = basePrices[cropKey] || 1;
21349:     
21350:     // 季节波动
```

## [P2] Array out of bounds - 行 21367
数组索引访问可能越界: fluctuations[cropKey]。建议添加长度检查。

```javascript
21365:     };
21366:     
21367:     if (fluctuations[cropKey] && fluctuations[cropKey][game.season]) {
21368:         price *= fluctuations[cropKey][game.season];
21369:     }
```

## [P2] Array out of bounds - 行 21368
数组索引访问可能越界: fluctuations[cropKey]。建议添加长度检查。

```javascript
21366:     
21367:     if (fluctuations[cropKey] && fluctuations[cropKey][game.season]) {
21368:         price *= fluctuations[cropKey][game.season];
21369:     }
21370:     
```

## [P2] Array out of bounds - 行 21392
数组索引访问可能越界: HOUSE_DATA[targetHouse]。建议添加长度检查。

```javascript
21390:     }
21391:     
21392:     const houseData = HOUSE_DATA[targetHouse];
21393:     if (game.money < houseData.upgradeCost) {
21394:         showToast('钱包里钱不够，先去卖点东西换点钱', 'bad');
```

## [P2] State inconsistency - 行 21400
game.money 修改（行 21400）与 game 其他字段修改（行 21401）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
21398:     
21399:     playCoinSound();
21400:     game.money -= houseData.upgradeCost;
21401:     game.house = targetHouse;
21402:     
```

## [P2] Array out of bounds - 行 21435
数组索引访问可能越界: game.npcs[k]。建议添加长度检查。

```javascript
21433:     
21434:     // q34: 村中知己（2个村民达到友好40+）
21435:     const friendlyNpcs = Object.keys(game.npcs).filter(k => (game.npcs[k] || 0) >= 40).length;
21436:     if (friendlyNpcs >= 2 && !game.quests.q34) {
21437:         game.quests.q34 = true;
```

## [P2] Array out of bounds - 行 21442
数组索引访问可能越界: game.npcs[k]。建议添加长度检查。

```javascript
21440:     
21441:     // q35: 莫逆之交（1个村民达到亲密60+）
21442:     const intimateNpcs = Object.keys(game.npcs).filter(k => (game.npcs[k] || 0) >= 60).length;
21443:     if (intimateNpcs >= 1 && !game.quests.q35) {
21444:         game.quests.q35 = true;
```

## [P2] Game balance - 行 21576
极大的数值 3679521262 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。

```javascript
21574: // ==================== 玩家反馈系统 ====================
21575: function copyQQForFeedback() {
21576:     const qq = '3679521262';
21577:     try {
21578:         navigator.clipboard.writeText(qq).then(() => {
```

## [P2] NaN/Infinity - 行 21706
除法运算可能除零: text/plain。建议对分母添加零值检查或 || 1 防护。

```javascript
21704:     
21705:     try {
21706:         const blob = new Blob([feedback], { type: 'text/plain;charset=utf-8' });
21707:         const url = URL.createObjectURL(blob);
21708:         const a = document.createElement('a');
```

## [P2] Circular reference - 行 21734
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
21732:         });
21733:         if (stored.length > 50) stored.shift();
21734:         localStorage.setItem(FEEDBACK_KEY, JSON.stringify(stored));
21735:         
21736:         // 记录系统日志
```

## [P2] Circular reference - 行 21740
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
21738:         logs.push(`[${new Date().toLocaleString()}] 新反馈: ${text.substring(0, 50)}...`);
21739:         if (logs.length > 100) logs.shift();
21740:         localStorage.setItem(LOG_KEY, JSON.stringify(logs));
21741:         
21742:         showToast('📤 反馈已保存到下载文件夹', 'good');
```

## [P2] Circular reference - 行 21820
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
21818:             mode: (game && game.mode) || 'normal'
21819:         });
21820:         localStorage.setItem(FEEDBACK_KEY, JSON.stringify(stored));
21821:     } catch(e) {}
21822:     
```

## [P2] Event listener leaks - 行 22074
addEventListener 使用匿名函数绑定 document.mousedown，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
22072:     
22073:     // 为所有弹窗标题栏添加拖拽事件
22074:     document.addEventListener('mousedown', function(e) {
22075:         // 触摸设备上忽略mousedown，避免与touchstart重复触发
22076:         if ('ontouchstart' in window) return;
```

## [P2] Event listener leaks - 行 22074
addEventListener (document.mousedown, function) 缺少对应的 removeEventListener。

```javascript
22072:     
22073:     // 为所有弹窗标题栏添加拖拽事件
22074:     document.addEventListener('mousedown', function(e) {
22075:         // 触摸设备上忽略mousedown，避免与touchstart重复触发
22076:         if ('ontouchstart' in window) return;
```

## [P2] Event listener leaks - 行 22084
addEventListener 使用匿名函数绑定 document.touchstart，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
22082:     });
22083:     
22084:     document.addEventListener('touchstart', function(e) {
22085:         const title = e.target.closest('.modal-title');
22086:         if (title) {
```

## [P2] Event listener leaks - 行 22084
addEventListener (document.touchstart, function) 缺少对应的 removeEventListener。

```javascript
22082:     });
22083:     
22084:     document.addEventListener('touchstart', function(e) {
22085:         const title = e.target.closest('.modal-title');
22086:         if (title) {
```

## [P2] NaN/Infinity - 行 22126
除法运算可能除零: growDays / totalDays。建议对分母添加零值检查或 || 1 防护。

```javascript
22124:             const totalDays = cropData.growDays || 50;
22125:             const remaining = Math.max(0, totalDays - growDays);
22126:             const progress = Math.min(100, Math.floor((growDays / totalDays) * 100));
22127:             const stageNames = { seedling: '育苗期', transplanting: '返青期', growing: '生长期', mature: '成熟期' };
22128:             activeCount++;
```

## [P2] NaN/Infinity - 行 22180
除法运算可能除零: elapsed / Math.max。建议对分母添加零值检查或 || 1 防护。

```javascript
22178:             const elapsed = currentTotalTime - jobTotalTime;
22179:             const remaining = Math.max(0, job.duration - elapsed);
22180:             const progress = Math.min(100, Math.floor((elapsed / Math.max(1, job.duration)) * 100));
22181:             activeCount++;
22182:             
```

## [P2] Array out of bounds - 行 22327
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
22325:     const consumables = [];
22326:     for (const itemId in game.items) {
22327:         const count = game.items[itemId];
22328:         if (count > 0) {
22329:             // 优先查找ITEM_EFFECTS
```

## [P2] Array out of bounds - 行 22330
数组索引访问可能越界: ITEM_EFFECTS[itemId]。建议添加长度检查。

```javascript
22328:         if (count > 0) {
22329:             // 优先查找ITEM_EFFECTS
22330:             let item = ITEM_EFFECTS[itemId];
22331:             let icon = item ? item.icon : '';
22332:             let name = item ? item.name : ((ITEM_DATA[itemId] && ITEM_DATA[itemId].name) || itemId);
```

## [P2] Array out of bounds - 行 22332
数组索引访问可能越界: ITEM_DATA[itemId]。建议添加长度检查。

```javascript
22330:             let item = ITEM_EFFECTS[itemId];
22331:             let icon = item ? item.icon : '';
22332:             let name = item ? item.name : ((ITEM_DATA[itemId] && ITEM_DATA[itemId].name) || itemId);
22333:             let desc = item ? item.desc : '';
22334:             
```

## [P2] Array out of bounds - 行 22381
数组索引访问可能越界: game.crops[type]。建议添加长度检查。

```javascript
22379:     const crops = [];
22380:     cropTypes.forEach(type => {
22381:         const count = game.crops[type] || 0;
22382:         if (count > 0) {
22383:             crops.push({ type, name: cropNames[type], count, emoji: cropEmojis[type] });
```

## [P2] Array out of bounds - 行 22383
数组索引访问可能越界: cropNames[type]。建议添加长度检查。

```javascript
22381:         const count = game.crops[type] || 0;
22382:         if (count > 0) {
22383:             crops.push({ type, name: cropNames[type], count, emoji: cropEmojis[type] });
22384:         }
22385:     });
```

## [P2] Array out of bounds - 行 22383
数组索引访问可能越界: cropEmojis[type]。建议添加长度检查。

```javascript
22381:         const count = game.crops[type] || 0;
22382:         if (count > 0) {
22383:             crops.push({ type, name: cropNames[type], count, emoji: cropEmojis[type] });
22384:         }
22385:     });
```

## [P2] Array out of bounds - 行 22411
数组索引访问可能越界: PROCESSED_ITEMS[key]。建议添加长度检查。

```javascript
22409:             html += '<div class="backpack-grid">';
22410:             processed.forEach(([key, count]) => {
22411:                 const pItem = PROCESSED_ITEMS[key];
22412:                 if (pItem) {
22413:                     html += `
```

## [P2] Array out of bounds - 行 22434
数组索引访问可能越界: ORE_DATA[key]。建议添加长度检查。

```javascript
22432:             html += '<div class="backpack-grid">';
22433:             ores.forEach(([key, count]) => {
22434:                 const ore = ORE_DATA[key];
22435:                 if (ore) {
22436:                     html += `
```

## [P2] Array out of bounds - 行 22457
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
22455: 
22456: function useBackpackItem(itemId) {
22457:     if (!game || !game.items[itemId] || game.items[itemId] <= 0) {
22458:         showToast('道具不足', 'bad');
22459:         return;
```

## [P2] Array out of bounds - 行 22462
数组索引访问可能越界: ITEM_EFFECTS[itemId]。建议添加长度检查。

```javascript
22460:     }
22461:     
22462:     const item = ITEM_EFFECTS[itemId];
22463:     if (!item || !item.use || Object.keys(item.use).length === 0) {
22464:         showToast('该道具无法直接使用', 'warn');
```

## [P2] Array out of bounds - 行 22473
数组索引访问可能越界: game.items[itemId]。建议添加长度检查。

```javascript
22471:     if (item.use.mood) game.mood = Math.min(100, (game.mood === undefined ? 50 : game.mood) + item.use.mood);
22472:     
22473:     game.items[itemId]--;
22474:     addLog(`使用了${item.icon}${item.name}`, 'item');
22475:     showToast(`使用了${item.icon}${item.name}！${item.desc}`, 'good');
```

## [P2] Event listener leaks - 行 22569
addEventListener 使用匿名函数绑定 document.keydown，无法通过 removeEventListener 移除。若多次调用会导致重复监听。

```javascript
22567: 
22568: // ==================== 键盘支持 ====================
22569: document.addEventListener('keydown', function(e) {
22570:     if (e.key === ' ' || e.key === 'Enter') {
22571:         // 故事页面按空格/回车翻页
```

## [P2] Event listener leaks - 行 22569
addEventListener (document.keydown, function) 缺少对应的 removeEventListener。

```javascript
22567: 
22568: // ==================== 键盘支持 ====================
22569: document.addEventListener('keydown', function(e) {
22570:     if (e.key === ' ' || e.key === 'Enter') {
22571:         // 故事页面按空格/回车翻页
```

## [P2] Array out of bounds - 行 22590
数组索引访问可能越界: QUEST_DATA[questId]。建议添加长度检查。

```javascript
22588: function queueQuestReward(questId, money, text, reputation) {
22589:     if (!game || !game.pendingQuestRewards) game.pendingQuestRewards = [];
22590:     const quest = QUEST_DATA[questId];
22591:     if (!quest) return;
22592:     
```

## [P2] State inconsistency - 行 22650
game.money 修改（行 22650）与 game 其他字段修改（行 22657）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
22648:     const reward = game.pendingQuestRewards.shift();
22649:     if (reward.money > 0) {
22650:         game.money += reward.money;
22651:     }
22652:     if (reward.reputation > 0) {
```

## [P2] Array out of bounds - 行 22689
数组索引访问可能越界: MINE_DATA[layerKey]。建议添加长度检查。

```javascript
22687:     
22688:     layers.forEach((layerKey, idx) => {
22689:         const layer = MINE_DATA[layerKey];
22690:         const isUnlocked = isMineLayerUnlocked(layerKey);
22691:         const isDeepest = game.mineStats.deepestLayer >= idx;
```

## [P2] Array out of bounds - 行 22720
数组索引访问可能越界: ORE_DATA[oreKey]。建议添加长度检查。

```javascript
22718:     for (const [oreKey, amount] of Object.entries(game.mineInventory || {})) {
22719:         if (amount > 0) {
22720:             const ore = ORE_DATA[oreKey];
22721:             html += `<div class="ore-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 8px; margin-bottom: 6px;">`;
22722:             html += `<span>${ore.emoji} ${ore.name}：${amount}个</span>`;
```

## [P2] Circular reference - 行 22745
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
22743:     
22744:     panel.innerHTML = html;
22745:     panel._lastRenderFields = JSON.stringify(game.fields);
22746: }
22747: 
```

## [P2] Array out of bounds - 行 22760
数组索引访问可能越界: MINE_DATA[layerKey]。建议添加长度检查。

```javascript
22758: 
22759: function mineLayer(layerKey) {
22760:     const layer = MINE_DATA[layerKey];
22761:     if (!layer) return;
22762:     
```

## [P2] NaN/Infinity - 行 22792
parseInt/parseFloat 结果未做 NaN 防护: const layerIndex = parseInt(layerKey.replace('layer', ''), 10) - 1;

```javascript
22790:     if (!game.stats) game.stats = {};
22791:     game.stats.totalDigs = game.mineStats.totalDigs;
22792:     const layerIndex = parseInt(layerKey.replace('layer', ''), 10) - 1;
22793:     const currentDeepest = typeof game.mineStats.deepestLayer === 'number' ? game.mineStats.deepestLayer : -1;
22794:     if (layerIndex > currentDeepest) {
```

## [P2] Array out of bounds - 行 22828
数组索引访问可能越界: ORE_DATA[oreKey]。建议添加长度检查。

```javascript
22826:     for (const [oreKey, amount] of Object.entries(game.mineInventory || {})) {
22827:         if (amount > 0) {
22828:             const ore = ORE_DATA[oreKey];
22829:             if (!ore) continue;
22830:             totalMoney += Math.floor(amount * ore.basePrice * bonusMul);
```

## [P2] Array out of bounds - 行 22832
数组索引访问可能越界: game.mineInventory[oreKey]。建议添加长度检查。

```javascript
22830:             totalMoney += Math.floor(amount * ore.basePrice * bonusMul);
22831:             totalCount += amount;
22832:             game.mineInventory[oreKey] = 0;
22833:         }
22834:     }
```

## [P2] State inconsistency - 行 22841
game.money 修改（行 22841）与 game 其他字段修改（行 22843）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
22839:     }
22840:     
22841:     game.money += totalMoney;
22842:     
22843:     if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 22870
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
22868:     for (const [foodKey, food] of Object.entries(COOKING_DATA)) {
22869:         const canCook = canCookFood(foodKey);
22870:         const have = game.cookedFoods[foodKey] || 0;
22871:         
22872:         html += `<div class="cooking-card" style="background: ${canCook ? '#f8f9fa' : '#e9ecef'}; border-radius: 12px; padding: 16px; margin-bottom: 12px; opacity: ${canCook ? 1 : 0.7};">`;
```

## [P2] Array out of bounds - 行 22887
数组索引访问可能越界: cnames[ck]。建议添加长度检查。

```javascript
22885:             for (const [ck, amt] of Object.entries(food.ingredients.crops)) {
22886:                 const cnames = { rice: '水稻', sweet: '红薯', wheat: '小麦', corn: '玉米', soybean: '大豆', potato: '土豆', peanut: '花生', pepper: '辣椒', cabbage: '白菜', radish: '萝卜', eggplant: '茄子', garlic: '大蒜' };
22887:                 ingTexts.push(`${cnames[ck] || ck}×${amt}`);
22888:             }
22889:         }
```

## [P2] Array out of bounds - 行 22892
数组索引访问可能越界: PROCESSED_ITEMS[pk]。建议添加长度检查。

```javascript
22890:         if (food.ingredients.processedItems) {
22891:             for (const [pk, amt] of Object.entries(food.ingredients.processedItems)) {
22892:                 const pitem = PROCESSED_ITEMS[pk];
22893:                 ingTexts.push(`${(pitem && pitem.emoji) || ''}${(pitem && pitem.name) || pk}×${amt}`);
22894:             }
```

## [P2] Circular reference - 行 22935
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
22933:     html += '</div>';
22934:     panel.innerHTML = html;
22935:     panel._lastRenderFields = JSON.stringify(game.fields);
22936: }
22937: 
```

## [P2] Array out of bounds - 行 22939
数组索引访问可能越界: COOKING_DATA[foodKey]。建议添加长度检查。

```javascript
22937: 
22938: function canCookFood(foodKey) {
22939:     const food = COOKING_DATA[foodKey];
22940:     if (!food) return false;
22941:     
```

## [P2] Array out of bounds - 行 22958
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
22956:     if (ing.crops) {
22957:         for (const [cropKey, amount] of Object.entries(ing.crops)) {
22958:             if ((game.crops[cropKey] || 0) < amount) return false;
22959:         }
22960:     }
```

## [P2] Array out of bounds - 行 22964
数组索引访问可能越界: game.processedItems[itemKey]。建议添加长度检查。

```javascript
22962:     if (ing.processedItems) {
22963:         for (const [itemKey, amount] of Object.entries(ing.processedItems)) {
22964:             if ((game.processedItems[itemKey] || 0) < amount) return false;
22965:         }
22966:     }
```

## [P2] Array out of bounds - 行 22970
数组索引访问可能越界: game.foragingItems[itemKey]。建议添加长度检查。

```javascript
22968:     if (ing.foragingItems) {
22969:         for (const [itemKey, amount] of Object.entries(ing.foragingItems)) {
22970:             if ((game.foragingItems[itemKey] || 0) < amount) return false;
22971:         }
22972:     }
```

## [P2] Array out of bounds - 行 22978
数组索引访问可能越界: COOKING_DATA[foodKey]。建议添加长度检查。

```javascript
22976: 
22977: function cookFood(foodKey) {
22978:     const food = COOKING_DATA[foodKey];
22979:     if (!food) return;
22980:     if (!game.cookedFoods) game.cookedFoods = {};
```

## [P2] Array out of bounds - 行 23002
数组索引访问可能越界: game.fishInventory[fishKey]。建议添加长度检查。

```javascript
23000:         for (const fishKey of Object.keys(game.fishInventory || {})) {
23001:             if (remaining <= 0) break;
23002:             const take = Math.min(remaining, game.fishInventory[fishKey] || 0);
23003:             game.fishInventory[fishKey] -= take;
23004:             remaining -= take;
```

## [P2] Array out of bounds - 行 23003
数组索引访问可能越界: game.fishInventory[fishKey]。建议添加长度检查。

```javascript
23001:             if (remaining <= 0) break;
23002:             const take = Math.min(remaining, game.fishInventory[fishKey] || 0);
23003:             game.fishInventory[fishKey] -= take;
23004:             remaining -= take;
23005:         }
```

## [P2] Array out of bounds - 行 23010
数组索引访问可能越界: game.crops[cropKey]。建议添加长度检查。

```javascript
23008:     if (ing.crops) {
23009:         for (const [cropKey, amount] of Object.entries(ing.crops)) {
23010:             game.crops[cropKey] -= amount;
23011:         }
23012:     }
```

## [P2] Array out of bounds - 行 23016
数组索引访问可能越界: game.processedItems[itemKey]。建议添加长度检查。

```javascript
23014:     if (ing.processedItems) {
23015:         for (const [itemKey, amount] of Object.entries(ing.processedItems)) {
23016:             game.processedItems[itemKey] -= amount;
23017:         }
23018:     }
```

## [P2] Array out of bounds - 行 23022
数组索引访问可能越界: game.foragingItems[itemKey]。建议添加长度检查。

```javascript
23020:     if (ing.foragingItems) {
23021:         for (const [itemKey, amount] of Object.entries(ing.foragingItems)) {
23022:             game.foragingItems[itemKey] -= amount;
23023:         }
23024:     }
```

## [P2] Array out of bounds - 行 23026
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
23024:     }
23025:     
23026:     game.cookedFoods[foodKey] = (game.cookedFoods[foodKey] || 0) + 1;
23027:     
23028:     // 统计
```

## [P2] Array out of bounds - 行 23045
数组索引访问可能越界: COOKING_DATA[foodKey]。建议添加长度检查。

```javascript
23043: 
23044: function eatFood(foodKey) {
23045:     const food = COOKING_DATA[foodKey];
23046:     if (!food) return;
23047:     if (!game.cookedFoods) game.cookedFoods = {};
```

## [P2] Array out of bounds - 行 23049
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
23047:     if (!game.cookedFoods) game.cookedFoods = {};
23048:     
23049:     const have = game.cookedFoods[foodKey] || 0;
23050:     if (have < 1) {
23051:         showToast('没存货了', 'bad');
```

## [P2] Array out of bounds - 行 23055
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
23053:     }
23054:     
23055:     game.cookedFoods[foodKey] = have - 1;
23056:     
23057:     if (food.stamina) {
```

## [P2] Array out of bounds - 行 23076
数组索引访问可能越界: COOKING_DATA[foodKey]。建议添加长度检查。

```javascript
23074: 
23075: function sellFood(foodKey) {
23076:     const food = COOKING_DATA[foodKey];
23077:     if (!food) return;
23078:     if (!game.cookedFoods) game.cookedFoods = {};
```

## [P2] Array out of bounds - 行 23080
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
23078:     if (!game.cookedFoods) game.cookedFoods = {};
23079:     
23080:     const have = game.cookedFoods[foodKey] || 0;
23081:     if (have < 1) {
23082:         showToast('没存货了', 'bad');
```

## [P2] Array out of bounds - 行 23093
数组索引访问可能越界: game.cookedFoods[foodKey]。建议添加长度检查。

```javascript
23091:     const money = Math.floor(price);
23092:     
23093:     game.cookedFoods[foodKey] = have - 1;
23094:     game.money += money;
23095:     
```

## [P2] State inconsistency - 行 23094
game.money 修改（行 23094）与 game 其他字段修改（行 23078）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
23092:     
23093:     game.cookedFoods[foodKey] = have - 1;
23094:     game.money += money;
23095:     
23096:     if (!game.stats) game.stats = {};
```

## [P2] Array out of bounds - 行 23121
数组索引访问可能越界: game.communityProjects[projKey]。建议添加长度检查。

```javascript
23119:     
23120:     for (const [projKey, proj] of Object.entries(COMMUNITY_PROJECTS)) {
23121:         const projData = game.communityProjects[projKey] || { progress: 0, completed: false };
23122:         const isUnlocked = isCommunityProjectUnlocked(projKey);
23123:         const isCompleted = projData.completed;
```

## [P2] NaN/Infinity - 行 23124
除法运算可能除零: projData.progress / Math.max。建议对分母添加零值检查或 || 1 防护。

```javascript
23122:         const isUnlocked = isCommunityProjectUnlocked(projKey);
23123:         const isCompleted = projData.completed;
23124:         const progressPercent = Math.min(100, Math.floor((projData.progress / Math.max(1, proj.totalProgress)) * 100));
23125:         
23126:         html += `<div class="community-card" style="background: ${isCompleted ? '#d4edda' : (isUnlocked ? '#f8f9fa' : '#e9ecef')}; border-radius: 12px; padding: 16px; margin-bottom: 12px; opacity: ${isUnlocked ? 1 : 0.6};">`;
```

## [P2] Circular reference - 行 23176
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
23174:     html += '</div>';
23175:     panel.innerHTML = html;
23176:     panel._lastRenderFields = JSON.stringify(game.fields);
23177: }
23178: 
```

## [P2] Array out of bounds - 行 23198
数组索引访问可能越界: COMMUNITY_PROJECTS[projKey]。建议添加长度检查。

```javascript
23196: 
23197: function contributeToProject(projKey, type) {
23198:     const proj = COMMUNITY_PROJECTS[projKey];
23199:     if (!proj || !proj.totalProgress || !isFinite(proj.totalProgress) || proj.totalProgress <= 0) {
23200:         console.error('社区项目数据异常:', projKey);
```

## [P2] Array out of bounds - 行 23204
数组索引访问可能越界: game.communityProjects[projKey]。建议添加长度检查。

```javascript
23202:     }
23203:     
23204:     if (!game.communityProjects[projKey]) {
23205:         game.communityProjects[projKey] = { progress: 0, completed: false };
23206:     }
```

## [P2] Array out of bounds - 行 23205
数组索引访问可能越界: game.communityProjects[projKey]。建议添加长度检查。

```javascript
23203:     
23204:     if (!game.communityProjects[projKey]) {
23205:         game.communityProjects[projKey] = { progress: 0, completed: false };
23206:     }
23207:     
```

## [P2] Array out of bounds - 行 23208
数组索引访问可能越界: game.communityProjects[projKey]。建议添加长度检查。

```javascript
23206:     }
23207:     
23208:     const projData = game.communityProjects[projKey];
23209:     if (projData.completed) {
23210:         showToast('这个项目已经完成了！', 'good');
```

## [P2] NaN/Infinity - 行 23227
除法运算可能除零: proj.totalProgress / Math.max。建议对分母添加零值检查或 || 1 防护。

```javascript
23225:             return;
23226:         }
23227:         const remainingNeed = Math.ceil((proj.totalProgress - projData.progress) / Math.max(1, proj.totalProgress / Math.max(1, needStone)));
23228:         const useStone = Math.min(haveStone, remainingNeed, 5); // 一次最多捐5个
23229:         game.mineInventory.stone -= useStone;
```

## [P2] NaN/Infinity - 行 23230
除法运算可能除零: proj.totalProgress / needStone。建议对分母添加零值检查或 || 1 防护。

```javascript
23228:         const useStone = Math.min(haveStone, remainingNeed, 5); // 一次最多捐5个
23229:         game.mineInventory.stone -= useStone;
23230:         contributed = useStone * (proj.totalProgress / needStone);
23231:         addLog(`🪨 给${proj.name}捐了${useStone}个石块`, 'good');
23232:     } else if (type === 'money') {
```

## [P2] NaN/Infinity - 行 23242
除法运算可能除零: proj.totalProgress / needMoney。建议对分母添加零值检查或 || 1 防护。

```javascript
23240:             return;
23241:         }
23242:         const remainingNeed = Math.ceil((proj.totalProgress - projData.progress) / Math.max(1, proj.totalProgress / needMoney));
23243:         const useMoney = Math.min(game.money, remainingNeed, 50); // 一次最多捐50
23244:         game.money -= useMoney;
```

## [P2] State inconsistency - 行 23244
game.money 修改（行 23244）与 game 其他字段修改（行 23262）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
23242:         const remainingNeed = Math.ceil((proj.totalProgress - projData.progress) / Math.max(1, proj.totalProgress / needMoney));
23243:         const useMoney = Math.min(game.money, remainingNeed, 50); // 一次最多捐50
23244:         game.money -= useMoney;
23245:         contributed = useMoney * (proj.totalProgress / needMoney);
23246:         addLog(`💰 给${proj.name}捐了${useMoney}元`, 'good');
```

## [P2] NaN/Infinity - 行 23245
除法运算可能除零: proj.totalProgress / needMoney。建议对分母添加零值检查或 || 1 防护。

```javascript
23243:         const useMoney = Math.min(game.money, remainingNeed, 50); // 一次最多捐50
23244:         game.money -= useMoney;
23245:         contributed = useMoney * (proj.totalProgress / needMoney);
23246:         addLog(`💰 给${proj.name}捐了${useMoney}元`, 'good');
23247:     }
```

## [P2] NaN/Infinity - 行 23292
除法运算可能除零: projData.progress / Math.max。建议对分母添加零值检查或 || 1 防护。

```javascript
23290:         }
23291:     } else {
23292:         const percent = Math.floor((projData.progress / Math.max(1, proj.totalProgress)) * 100);
23293:         showToast(`贡献成功！当前进度 ${percent}%`, 'good');
23294:     }
```

## [P2] Array out of bounds - 行 23316
数组索引访问可能越界: names[fishKey]。建议添加长度检查。

```javascript
23314:         'grass_carp': '草鱼'
23315:     };
23316:     return names[fishKey] || fishKey;
23317: }
23318: 
```

## [P2] Array out of bounds - 行 23321
数组索引访问可能越界: game.collection[category]。建议添加长度检查。

```javascript
23319: function unlockCollectionItem(category, itemId) {
23320:     if (!game.collection) game.collection = {};
23321:     if (!game.collection[category]) game.collection[category] = {};
23322:     if (game.collection[category][itemId]) return; // 已解锁
23323:     
```

## [P2] Array out of bounds - 行 23322
数组索引访问可能越界: game.collection[category]。建议添加长度检查。

```javascript
23320:     if (!game.collection) game.collection = {};
23321:     if (!game.collection[category]) game.collection[category] = {};
23322:     if (game.collection[category][itemId]) return; // 已解锁
23323:     
23324:     game.collection[category][itemId] = true;
```

## [P2] Array out of bounds - 行 23324
数组索引访问可能越界: game.collection[category]。建议添加长度检查。

```javascript
23322:     if (game.collection[category][itemId]) return; // 已解锁
23323:     
23324:     game.collection[category][itemId] = true;
23325:     
23326:     // 查找物品名称
```

## [P2] Array out of bounds - 行 23328
数组索引访问可能越界: COLLECTION_DATA[category]。建议添加长度检查。

```javascript
23326:     // 查找物品名称
23327:     let itemName = itemId;
23328:     const catData = COLLECTION_DATA[category];
23329:     if (catData && catData.items) {
23330:         const item = catData.items.find(i => i.id === itemId);
```

## [P2] Array out of bounds - 行 23352
数组索引访问可能越界: COLLECTION_DATA[catKey]。建议添加长度检查。

```javascript
23350:     let unlockedItems = 0;
23351:     for (const catKey of Object.keys(COLLECTION_DATA)) {
23352:         const catData = COLLECTION_DATA[catKey];
23353:         totalItems += catData.items.length;
23354:         const unlocked = game.collection[catKey] ? Object.keys(game.collection[catKey]).length : 0;
```

## [P2] Array out of bounds - 行 23354
数组索引访问可能越界: game.collection[catKey]。建议添加长度检查。

```javascript
23352:         const catData = COLLECTION_DATA[catKey];
23353:         totalItems += catData.items.length;
23354:         const unlocked = game.collection[catKey] ? Object.keys(game.collection[catKey]).length : 0;
23355:         unlockedItems += unlocked;
23356:     }
```

## [P2] Array out of bounds - 行 23370
数组索引访问可能越界: game.collection[catKey]。建议添加长度检查。

```javascript
23368:     // 按类别渲染
23369:     for (const [catKey, catData] of Object.entries(COLLECTION_DATA)) {
23370:         const unlockedMap = game.collection[catKey] || {};
23371:         const unlockedCount = Object.keys(unlockedMap).length;
23372:         const catPercent = catData.items.length > 0 ? Math.floor((unlockedCount / catData.items.length) * 100) : 0;
```

## [P2] Circular reference - 行 23413
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
23411:     
23412:     panel.innerHTML = html;
23413:     panel._lastRenderFields = JSON.stringify(game.fields);
23414: }
23415: 
```

## [P2] Array out of bounds - 行 23459
数组索引访问可能越界: game.achievements[key]。建议添加长度检查。

```javascript
23457:     
23458:     for (const [key, ach] of Object.entries(ACHIEVEMENT_DATA)) {
23459:         if (game.achievements[key]) continue; // 已解锁
23460:         
23461:         // 解析条件
```

## [P2] NaN/Infinity - 行 23465
parseInt/parseFloat 结果未做 NaN 防护: const condVal = parseInt(parts[1].trim(), 10);

```javascript
23463:         if (parts.length === 2) {
23464:             const condKey = parts[0].trim();
23465:             const condVal = parseInt(parts[1].trim(), 10);
23466:             if (conditions[condKey] !== undefined && conditions[condKey] >= condVal) {
23467:                 unlockAchievement(key);
```

## [P2] Array out of bounds - 行 23466
数组索引访问可能越界: conditions[condKey]。建议添加长度检查。

```javascript
23464:             const condKey = parts[0].trim();
23465:             const condVal = parseInt(parts[1].trim(), 10);
23466:             if (conditions[condKey] !== undefined && conditions[condKey] >= condVal) {
23467:                 unlockAchievement(key);
23468:             }
```

## [P2] Array out of bounds - 行 23482
数组索引访问可能越界: ACHIEVEMENT_DATA[achKey]。建议添加长度检查。

```javascript
23480: 
23481: function unlockAchievement(achKey) {
23482:     const ach = ACHIEVEMENT_DATA[achKey];
23483:     if (!ach || game.achievements[achKey]) return;
23484:     
```

## [P2] Array out of bounds - 行 23483
数组索引访问可能越界: game.achievements[achKey]。建议添加长度检查。

```javascript
23481: function unlockAchievement(achKey) {
23482:     const ach = ACHIEVEMENT_DATA[achKey];
23483:     if (!ach || game.achievements[achKey]) return;
23484:     
23485:     game.achievements[achKey] = {
```

## [P2] Array out of bounds - 行 23485
数组索引访问可能越界: game.achievements[achKey]。建议添加长度检查。

```javascript
23483:     if (!ach || game.achievements[achKey]) return;
23484:     
23485:     game.achievements[achKey] = {
23486:         unlocked: true,
23487:         unlockDay: game.day || 1
```

## [P2] State inconsistency - 行 23493
game.money 修改（行 23493）与 game 其他字段修改（行 23501）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。

```javascript
23491:     let rewardText = '';
23492:     if (ach.reward.money) {
23493:         game.money += ach.reward.money;
23494:         rewardText += `+${ach.reward.money}元 `;
23495:     }
```

## [P2] Circular reference - 行 23586
JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。

```javascript
23584:     
23585:     panel.innerHTML = html;
23586:     panel._lastRenderFields = JSON.stringify(game.fields);
23587: }
23588: 
```


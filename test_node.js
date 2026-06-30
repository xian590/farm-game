// ====== Node.js 游戏核心数据测试 ======

const fs = require('fs');

// Mock browser environment
const mockGame = {};
global.game = mockGame;
global.document = { getElementById: () => ({ style: {}, textContent: '', innerHTML: '' }), querySelectorAll: () => [], querySelector: () => null };
global.window = { location: { reload: () => {} } };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.console = console;

// Mock functions
global.playClickSound = () => {};
global.playDirtSound = () => {};
global.playHarvestSound = () => {};
global.playCoinSound = () => {};
global.playErrorSound = () => {};
global.playBonusSound = () => {};
global.showToast = () => {};
global.addLog = (text) => console.log('LOG:', text);
global.saveGame = () => {};
global.updateUI = () => {};
global.updateTopBar = () => {};
global.renderPlayerPanel = () => {};
global.renderSkillsPanel = () => {};
global.renderToolsPanel = () => {};
global.renderShopPanel = () => {};
global.refreshShopContent = () => {};
global.renderPetsPanel = () => {};
global.renderCompostPanel = () => {};
global.showOfflineReward = () => {};
global.showEventModal = () => {};
global.showEventPopup = () => {};
global.closeModal = () => {};
global.playSound = () => {};
global.checkMilestones = () => {};
global.checkSkillLevelUp = () => {};
global.getTechBonus = () => 0;
global.getBuildingBonus = () => 0;
global.getNpcBonus = () => 0;
global.getPetEffect = () => 0;
global.getPetEffectText = () => '';
global.getHireButton = () => '';
global.getNextFieldRent = () => 200;
global.getSeasonPrice = (crop) => crop === 'rice' ? 3.0 : 1.5;
global.getSeedPrice = (price) => price;
global.hasGrowingCrops = () => true;
global.getRandomFlavor = () => '';
global.getSkillName = (key) => key;
global.addSkillExp = (key, val) => { if (!global.game.skills[key]) global.game.skills[key] = { level: 0, exp: 0 }; global.game.skills[key].exp += val; };

// Constants
global.SAVE_KEY = 'farm_game_save_v1';
global.CROP_DATA = {
    rice_spring: { name: '早稻', seedPrice: 50, baseYield: 500, growDays: 5, seedlingDays: 1, season: 'spring', type: 'rice' },
    rice_summer: { name: '晚稻', seedPrice: 55, baseYield: 450, growDays: 4, seedlingDays: 1, season: 'summer', type: 'rice' },
    sweet_spring: { name: '春薯', seedPrice: 60, baseYield: 1200, growDays: 10, seedlingDays: 1, season: 'spring', type: 'sweet' },
    sweet_autumn: { name: '秋薯', seedPrice: 70, baseYield: 1100, growDays: 8, seedlingDays: 1, season: 'autumn', type: 'sweet' }
};
global.SKILL_EFFECTS = {
    cropFamiliarity: { name: '作物熟悉度' },
    fieldManagement: { name: '田间管理' },
    toolMastery: { name: '农具精通' },
    composting: { name: '堆肥技术' }
};
global.QUEST_DATA = {
    q0: { name: '整地', desc: '给第1块田整地', reward: '解锁种植功能' },
    q1: { name: '购买种子', desc: '购买早稻种子', reward: '100元' },
    q2: { name: '育苗', desc: '在第1块田育苗', reward: '50元' },
    q3: { name: '移栽', desc: '育苗完成后移栽', reward: '50元' },
    q4: { name: '第一次收割', desc: '等待作物成熟并收割', reward: '200元' },
    q5: { name: '第一桶金', desc: '出售作物', reward: '100元+10声望' },
    q6: { name: '第一把农具', desc: '购买第一把农具', reward: '100元' },
    q7: { name: '乔迁之喜', desc: '升级到进阶房', reward: '300元' },
    q8: { name: '第一份堆肥', desc: '制作第一份堆肥', reward: '150元' },
    q9: { name: '初次交流', desc: '和任意村民聊天', reward: '50元' },
    q10: { name: '礼轻情意重', desc: '给村民送一次礼物', reward: '100元' },
    q11: { name: '新的家人', desc: '领养第一只宠物', reward: '200元' },
    q12: { name: '熟能生巧', desc: '作物熟悉度达到2级', reward: '200元' },
    q13: { name: '扩大生产', desc: '租下第二块田', reward: '300元' },
    q14: { name: '田间老手', desc: '田间管理达到3级', reward: '300元' },
    q15: { name: '打成一片', desc: '和任意村民达到友好', reward: '300元' },
    q16: { name: '小有积蓄', desc: '总资产达到5000元', reward: '500元' },
    q17: { name: '德高望重', desc: '声望达到100点', reward: '500元' }
};
global.NPC_DATA = {
    wangcunzhang: { name: '王保国', title: '村长', emoji: '👨‍💼', canHire: false },
    lilaonong: { name: '李德根', title: '李老农', emoji: '👴', canHire: true, skills: ['water','weed'] },
    zhangshen: { name: '张桂兰', title: '张婶', emoji: '👩', canHire: true, skills: ['water','weed'] },
    wangerdan: { name: '王二蛋', title: '二蛋', emoji: '👦', canHire: true, skills: ['water'] },
    zhaolaoban: { name: '赵有财', title: '赵老板', emoji: '🧑‍💼', canHire: false },
    chenyang: { name: '陈阳', title: '小陈', emoji: '👨‍🔧', canHire: true, skills: ['weed','fertilize'] },
    linxiaoyu: { name: '林小雨', title: '林老师', emoji: '👩‍🏫', canHire: false },
    sunmiaoqing: { name: '孙妙青', title: '孙医生', emoji: '👩‍⚕️', canHire: false },
    laoyufu: { name: '吴大柱', title: '老渔夫', emoji: '👴‍🎣', canHire: true, skills: ['fish'] },
    zhouzhuzhu: { name: '周大柱', title: '大柱', emoji: '👨‍🌾', canHire: true, skills: ['water'] }
};
global.PROCESSED_ITEMS = {
    riceGrain: { name: '糙米', emoji: '🍚', basePrice: 1.8 },
    driedSweetPotato: { name: '红薯干', emoji: '🍠', basePrice: 3.0 },
    driedFish: { name: '鱼干', emoji: '🐟', basePrice: 6.0 },
    fishBall: { name: '鱼丸', emoji: '🍡', basePrice: 8.0 },
    fishSoup: { name: '鲜鱼汤', emoji: '🍲', basePrice: 10.0 },
    polishedRice: { name: '精米', emoji: '🍚', basePrice: 3.0 },
    riceWine: { name: '米酒', emoji: '🍶', basePrice: 12.0 },
    riceCake: { name: '米糕', emoji: '🥮', basePrice: 5.0 },
    sweetPotatoStarch: { name: '红薯粉', emoji: '💨', basePrice: 4.0 },
    sweetPotatoNoodles: { name: '红薯粉条', emoji: '🍜', basePrice: 7.0 }
};
global.PROCESSING_DATA = {
    riceMill: { name: '石磨碾米', inputCrop: 'rice', inputAmount: 10, outputItem: 'riceGrain', outputAmount: 6.5, dailyCapacity: 20, staminaCost: 8 },
    sweetPotatoDry: { name: '晒红薯干', inputCrop: 'sweet', inputAmount: 10, outputItem: 'driedSweetPotato', outputAmount: 4, dailyCapacity: 25, staminaCost: 8 },
    fishDrying: { name: '腌鱼晒场', inputType: 'fish', inputAmount: 5, outputItem: 'driedFish', outputAmount: 5, dailyCapacity: 15, staminaCost: 10 },
    fishBallWorkshop: { name: '鱼丸作坊', inputType: 'fish', inputAmount: 8, outputItem: 'fishBall', outputAmount: 6, dailyCapacity: 20, staminaCost: 15 },
    fishSoupKitchen: { name: '鲜鱼汤锅', inputType: 'fish', inputAmount: 10, outputItem: 'fishSoup', outputAmount: 5, dailyCapacity: 20, staminaCost: 12 },
    ricePolishing: { name: '精米坊', inputType: 'processed', inputItem: 'riceGrain', inputAmount: 10, outputItem: 'polishedRice', outputAmount: 8, dailyCapacity: 20, staminaCost: 8 },
    riceWineBrew: { name: '米酒坊', inputType: 'processed', inputItem: 'polishedRice', inputAmount: 8, outputItem: 'riceWine', outputAmount: 4, dailyCapacity: 15, staminaCost: 10 },
    riceCakeKitchen: { name: '米糕蒸房', inputType: 'processed', inputItem: 'riceGrain', inputAmount: 8, outputItem: 'riceCake', outputAmount: 5, dailyCapacity: 20, staminaCost: 10 },
    sweetPotatoStarchMill: { name: '红薯粉坊', inputCrop: 'sweet', inputAmount: 15, outputItem: 'sweetPotatoStarch', outputAmount: 3, dailyCapacity: 30, staminaCost: 12 },
    sweetPotatoNoodlePress: { name: '粉条压制机', inputType: 'processed', inputItem: 'sweetPotatoStarch', inputAmount: 5, outputItem: 'sweetPotatoNoodles', outputAmount: 5, dailyCapacity: 15, staminaCost: 10 }
};
global.TAB_UNLOCK_CONFIG = {
    fields: { day: 0, name: '田地管理' },
    shop: { day: 1, name: '商店' },
    house: { day: 3, name: '房屋租赁' },
    tools: { day: 5, name: '农具商店' },
    compost: { day: 7, name: '堆肥工坊' },
    foraging: { day: 10, name: '后山采集' },
    processing: { day: 15, name: '农家副业' },
    player: { day: 0, name: '角色属性' },
    buildings: { day: 20, name: '农家设施' },
    skills: { day: 25, name: '技能树' },
    research: { day: 30, name: '农技研究' },
    npcs: { day: 2, name: '村民' },
    pets: { day: 8, name: '宠物' }
};
global.FRIENDSHIP_LEVELS = [
    { min: 0, name: '陌生', color: '#999' },
    { min: 10, name: '相识', color: '#7fb069' },
    { min: 30, name: '熟悉', color: '#5da9e9' },
    { min: 60, name: '友好', color: '#e6a817' },
    { min: 90, name: '挚友', color: '#e74c3c' }
];
global.SEASONS = ['spring', 'summer', 'autumn', 'winter'];
global.EVENTS = {};
global.STORY_EVENTS = [];
global.MILESTONE_DATA = {};
global.MUSIC_DATA = {};
global.SOUND_DATA = {};
global.MUSIC_NOTES = {};
global.MUSIC_THEMES = {};
global.TOOLS = {};
global.GAME_SPEED = 1;
global.currentMainTab = 'fields';
global.currentShopTab = 'seeds';
global.gameLoopInterval = null;
global.autoPlayEnabled = false;
global.isLocalStorageAvailable = () => true;
global.fixSaveData = () => {};
global.calculateOfflineReward = () => null;
global.loadAudioSettings = () => {};
global.loadGameSpeed = () => {};

global.selectMode = (mode) => {
    const configs = {
        easy: { money: 3000, maxHealth: 200, maxStamina: 200, disasterRate: 0.6 },
        normal: { money: 1500, maxHealth: 200, maxStamina: 200, disasterRate: 1.0 },
        hard: { money: 5000, maxHealth: 220, maxStamina: 220, disasterRate: 1.5 }
    };
    const cfg = configs[mode];
    global.game = {
        mode: mode,
        money: cfg.money,
        maxHealth: cfg.maxHealth,
        health: cfg.maxHealth,
        maxStamina: cfg.maxStamina,
        stamina: Math.floor(cfg.maxStamina * 0.5),
        disasterRate: cfg.disasterRate,
        day: 1,
        time: 6,
        season: 'spring',
        reputation: 0,
        fields: [{
            id: 1, level: '新手档', type: 'paddy', crop: null, stage: 'idle', step: 0,
            growProgress: 0, plantedDay: 0, lastWaterDay: 0, lastWeedDay: 0,
            fertilized: false, fertilizerType: null, turnedVine1: false, turnedVine2: false,
            prepared: false, yieldLoss: 0, yieldBonus: 0
        }],
        items: { fertilizer: 0, pesticide: 0, bun: 0, medicine: 0, organicFertilizer: 0 },
        seeds: { rice_spring: 0, rice_summer: 0, sweet_spring: 0, sweet_autumn: 0 },
        crops: { rice: 0, sweet: 0 },
        npcMilestones: {},
        buildings: {},
        storageCapacity: 2000,
        processedItems: { riceGrain: 0, driedSweetPotato: 0, driedFish: 0, fishBall: 0, fishSoup: 0, polishedRice: 0, riceWine: 0, riceCake: 0, sweetPotatoStarch: 0, sweetPotatoNoodles: 0 },
        foragingItems: {},
        builtProcessing: {},
        dailyProcessed: {},
        researchPoints: 0,
        unlockedTechs: {},
        skills: {
            cropFamiliarity: { level: 0, exp: 0 },
            fieldManagement: { level: 0, exp: 0 },
            toolMastery: { level: 0, exp: 0 },
            composting: { level: 0, exp: 0 }
        },
        tools: [],
        npcs: {},
        friendship: {},
        lastChatDay: {},
        pets: {
            dog: { name: '大黄', icon: '🐕', affection: 0, petToday: 0, fedToday: false },
            cat: { name: '阿花', icon: '🐈', affection: 0, petToday: 0, fedToday: false }
        },
        house: '茅草房',
        houseUpgradeDay: 0,
        quests: {},
        stats: {},
        pendingQuestRewards: [],
        unlockedTabs: {},
        dailyActions: { exercise: 0, chat: 0, fish: 0, read: 0, foraging: 0, sideHustle: 0 },
        dailyActivities: {},
        composting: false,
        compostStartDay: 0,
        compostReady: false,
        currentSeasonBonus: 0,
        pestReduction: 0,
        lastWaterDay: 0,
        lastWeedDay: 0,
        currentEvent: null,
        studyToday: null,
        foragingToday: null
    };
};

// ====== RUN TESTS ======

console.log('=== Node.js 游戏核心数据测试 ===\n');

let totalPass = 0, totalFail = 0;

// Test 1: Init
console.log('--- Test 1: 初始化 ---');
selectMode('normal');
const checks1 = [
    ['mode', game.mode === 'normal'],
    ['money', game.money === 1500],
    ['stamina', game.stamina === 100],
    ['maxStamina', game.maxStamina === 200],
    ['health', game.health === 200],
    ['storage', game.storageCapacity === 2000],
    ['day', game.day === 1],
    ['season', game.season === 'spring'],
    ['fields', game.fields.length === 1],
    ['npcs', Object.keys(game.npcs).length === 0],
    ['pendingQuestRewards', Array.isArray(game.pendingQuestRewards)]
];
for (const [name, result] of checks1) {
    if (result) { console.log(`  ✅ ${name}`); totalPass++; }
    else { console.log(`  ❌ ${name}: ${JSON.stringify(game[name])}`); totalFail++; }
}

// Test 2: NPCs
console.log('\n--- Test 2: NPC数据完整性 ---');
const expectedNPCs = ['wangcunzhang', 'lilaonong', 'zhangshen', 'wangerdan', 'zhaolaoban', 'chenyang', 'linxiaoyu', 'sunmiaoqing', 'laoyufu', 'zhouzhuzhu'];
for (const key of expectedNPCs) {
    if (NPC_DATA[key]) { console.log(`  ✅ ${key}: ${NPC_DATA[key].name} (${NPC_DATA[key].title})`); totalPass++; }
    else { console.log(`  ❌ ${key}: 不存在`); totalFail++; }
}

// Test 3: Processed Items
console.log('\n--- Test 3: 加工品数据完整性 ---');
const expectedItems = ['riceGrain', 'driedSweetPotato', 'driedFish', 'fishBall', 'fishSoup', 'polishedRice', 'riceWine', 'riceCake', 'sweetPotatoStarch', 'sweetPotatoNoodles'];
for (const key of expectedItems) {
    if (PROCESSED_ITEMS[key]) { console.log(`  ✅ ${key}: ${PROCESSED_ITEMS[key].name} ${PROCESSED_ITEMS[key].emoji} (${PROCESSED_ITEMS[key].basePrice}x)`); totalPass++; }
    else { console.log(`  ❌ ${key}: 不存在`); totalFail++; }
}

// Test 4: Processing Buildings
console.log('\n--- Test 4: 加工建筑数据完整性 ---');
const expectedBuildings = ['riceMill', 'sweetPotatoDry', 'fishDrying', 'fishBallWorkshop', 'fishSoupKitchen', 'ricePolishing', 'riceWineBrew', 'riceCakeKitchen', 'sweetPotatoStarchMill', 'sweetPotatoNoodlePress'];
for (const key of expectedBuildings) {
    if (PROCESSING_DATA[key]) { console.log(`  ✅ ${key}: ${PROCESSING_DATA[key].name} (造价${PROCESSING_DATA[key].buildCost}元, 体力${PROCESSING_DATA[key].staminaCost})`); totalPass++; }
    else { console.log(`  ❌ ${key}: 不存在`); totalFail++; }
}

// Test 5: NPC角色设定一致性
console.log('\n--- Test 5: NPC角色设定一致性 ---');
const npcChecks = [
    ['sunmiaoqing', '孙妙青', '孙医生', '👩‍⚕️'],
    ['linxiaoyu', '林小雨', '林老师', '👩‍🏫'],
    ['chenyang', '陈阳', '小陈', '👨‍🔧'],
    ['laoyufu', '吴大柱', '老渔夫', '👴‍🎣'],
    ['zhouzhuzhu', '周大柱', '大柱', '👨‍🌾']
];
for (const [key, expectedName, expectedTitle, expectedEmoji] of npcChecks) {
    const npc = NPC_DATA[key];
    if (!npc) { console.log(`  ❌ ${key}: 不存在`); totalFail++; continue; }
    const nameOk = npc.name === expectedName;
    const titleOk = npc.title === expectedTitle;
    const emojiOk = npc.emoji === expectedEmoji;
    if (nameOk && titleOk && emojiOk) { console.log(`  ✅ ${key}: ${npc.name} ${npc.emoji} ${npc.title}`); totalPass++; }
    else {
        console.log(`  ❌ ${key}: name=${npc.name}(expected:${expectedName}), title=${npc.title}(expected:${expectedTitle}), emoji=${npc.emoji}(expected:${expectedEmoji})`);
        totalFail++;
    }
}

// Summary
console.log('\n========================================');
console.log(`📊 测试结果: ${totalPass}/${totalPass + totalFail} 通过`);
if (totalFail === 0) {
    console.log('🎉 所有基础数据测试通过！');
} else {
    console.log(`⚠️ 存在 ${totalFail} 个失败项，需要修复！`);
}
console.log('========================================');

process.exit(totalFail > 0 ? 1 : 0);

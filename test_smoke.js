/**
 * 宠物医生模拟器 v0.3 — 逻辑冒烟测试
 * 在 Node.js 环境中模拟游戏核心流程，验证状态转换
 */

// ==================== 模拟浏览器环境 ====================

const mockLocalStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = val; },
    removeItem(key) { delete this._data[key]; },
};

global.localStorage = mockLocalStorage;
global.window = { addEventListener: () => {} };
global.document = {
    addEventListener: () => {},
    querySelectorAll: () => [],
    getElementById: () => ({
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        style: {},
        textContent: '',
        src: '',
        innerHTML: '',
        onclick: null,
    }),
    hidden: false,
    createElement: () => ({
        className: '',
        style: {},
        textContent: '',
        innerHTML: '',
        onclick: null,
        addEventListener: () => {},
        appendChild: () => {},
        remove: () => {},
    }),
    head: { appendChild: () => {} },
};
global.navigator = { clipboard: { writeText: () => Promise.resolve() } };

// ==================== 测试框架 ====================

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
}

function assertBetween(value, min, max, message) {
    if (value < min || value > max) {
        throw new Error(`${message || 'Assertion failed'}: expected between ${min} and ${max}, got ${value}`);
    }
}

// ==================== 加载游戏模块（在全局作用域中执行） ====================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsDir = path.join(__dirname, 'js');
const loadOrder = [
    'constants.js',
    'utils.js', 
    'core.js',
    'patients.js',
    'minigames.js',
    'ui.js',
    'buffs.js',
    'negotiation.js',
    'season.js',
    'achievements.js',
    'endings.js',
    'bonds.js',
    'feedback.js',
];

for (const fname of loadOrder) {
    const code = fs.readFileSync(path.join(jsDir, fname), 'utf-8');
    vm.runInThisContext(code, { filename: fname });
}

// ==================== 测试用例 ====================

// 测试1: 常量定义
test('CONSTANTS 包含所有必要字段', () => {
    assert(typeof CONSTANTS !== 'undefined', 'CONSTANTS 未定义');
    assert(CONSTANTS.ECONOMY, '缺少 ECONOMY');
    assert(CONSTANTS.REPUTATION, '缺少 REPUTATION');
    assert(CONSTANTS.PRESSURE, '缺少 PRESSURE');
    assert(CONSTANTS.PETS, '缺少 PETS');
    assert(CONSTANTS.CONDITIONS, '缺少 CONDITIONS');
    assert(CONSTANTS.NPCS, '缺少 NPCS');
    assert(CONSTANTS.EVENTS, '缺少 EVENTS');
});

test('经济常量数值正确', () => {
    assertEqual(CONSTANTS.ECONOMY.START_GOLD, 1500, '初始金币应为1500');
    assertEqual(CONSTANTS.ECONOMY.DAILY_RENT, 250, '日租金应为250');
    assertEqual(CONSTANTS.ECONOMY.RENT_DUE_DAYS, 7, '交租周期应为7天');
    assertEqual(CONSTANTS.ECONOMY.SURGERY_FEE, 800, '手术费应为800');
});

test('声望常量数值正确', () => {
    assertEqual(CONSTANTS.REPUTATION.START, 0.5, '起始声望应为0.5');
    assertEqual(CONSTANTS.REPUTATION.CURE_BONUS, 0.10, '治愈声望加成应为0.10');
    assertEqual(CONSTANTS.REPUTATION.CURE_BONUS_PERFECT, 0.18, '完美治愈声望加成应为0.18');
    assertEqual(CONSTANTS.REPUTATION.FAIL_PENALTY, 0.25, '失败惩罚应为0.25');
});

test('压力常量数值正确', () => {
    assertEqual(CONSTANTS.PRESSURE.START, 20, '起始压力应为20');
    assertEqual(CONSTANTS.PRESSURE.MAX, 100, '最大压力应为100');
    assertEqual(CONSTANTS.PRESSURE.CURE_SUCCESS, -12, '治愈减压应为-12');
    assertEqual(CONSTANTS.PRESSURE.DECAY_AFTER_PATIENT, 6, '每病人衰减应为6');
});

// 测试2: 核心状态
test('Core.initState 初始化正确', () => {
    Core.initState();
    const s = Core.getState();
    assertEqual(s.day, 1, 'Day应为1');
    assertEqual(s.gold, 1500, '金币应为1500');
    assertEqual(s.reputation, 0.5, '声望应为0.5');
    assertEqual(s.pressure, 20, '压力应为20');
    assertEqual(s.patientsMax, 2, 'Day1应有2个病人');
    assertEqual(s.inventory.medicine, 4, '药瓶应为4');
    assertEqual(s.inventory.herb, 3, '草药应为3');
    assertEqual(s.inventory.bandage, 2, '绷带应为2');
    assert(Array.isArray(s.dailyBuffs), 'dailyBuffs应为数组');
    assert(s.seasonEvent === null, 'seasonEvent应为null');
});

test('Core.addGold 边界检查', () => {
    Core.initState();
    Core.addGold(500);
    assertEqual(Core.getState().gold, 2000, '加金币失败');
    Core.addGold(-3000);
    assertEqual(Core.getState().gold, -1000, '减金币失败');
});

test('Core.addReputation 升级检测', () => {
    Core.initState();
    Core.addReputation(0.6);
    assertEqual(Core.getState().reputation, 1.1, '声望应为1.1');
});

test('Core.addPressure 边界检查', () => {
    Core.initState();
    Core.addPressure(50);
    assertEqual(Core.getState().pressure, 70, '压力应为70');
    Core.addPressure(50);
    assertEqual(Core.getState().pressure, 100, '压力不应超过100');
    Core.addPressure(10);
    assertEqual(Core.getState().pressure, 100, '压力仍应为100');
});

test('Core 库存系统', () => {
    Core.initState();
    Core.modifyInventory('medicine', 5);
    assertEqual(Core.getState().inventory.medicine, 9, '库存增加失败');
    Core.modifyInventory('medicine', -10);
    assertEqual(Core.getState().inventory.medicine, 0, '库存不应为负数');
});

// 测试3: 病人生成
test('PatientGen.generateOne 生成病人', () => {
    Core.initState();
    Core.getState().day = 1;
    const patient = PatientGen.generateOne(0.5);
    assert(patient, '病人未生成');
    assert(patient.name, '病人无名');
    assert(patient.owner, '主人未设定');
    assert(patient.ownerType, 'ownerType未设定');
    assert(CONSTANTS.NPCS[patient.ownerType], 'ownerType应映射到有效NPC');
    assert(patient.diagnosis, '诊断未设定');
    assert(patient.fee > 0, '费用应为正数');
    assertBetween(patient.fee, 50, 500, '费用应在合理范围');
});

test('PatientGen.generateQueue 生成队列', () => {
    Core.initState();
    const queue = PatientGen.generateQueue(2, 0.5);
    assertEqual(queue.length, 2, '队列长度应为2');
    queue.forEach((p, i) => {
        assertEqual(p.queuePosition, i, '队列位置错误');
    });
});

// 测试4: Buff系统
test('BuffSystem.generateDailyBuffs 生成Buff', () => {
    const buffs = BuffSystem.generateDailyBuffs();
    assertEqual(buffs.length, 2, '应生成2个Buff');
    buffs.forEach(b => {
        assert(b.id, 'Buff无ID');
        assert(b.name, 'Buff无名称');
        assert(b.type, 'Buff无类型');
    });
});

test('BuffSystem.calculateFee 诊金加成', () => {
    Core.initState();
    Core.getState().dailyBuffs = [{...BuffSystem.BUFFS.rich_patients}];
    const fee = BuffSystem.calculateFee(100);
    assertEqual(fee, 150, '土豪客人Buff应使诊金+50%');
});

test('BuffSystem.calculateShopPrice 折扣', () => {
    Core.initState();
    Core.getState().dailyBuffs = [{...BuffSystem.BUFFS.cheap_supply}];
    const price = BuffSystem.calculateShopPrice(100);
    assertEqual(price, 50, '特价进货Buff应使价格减半');
});

// 测试5: 季节系统
test('SeasonSystem.getSeason 季节计算', () => {
    assertEqual(SeasonSystem.getSeason(1), 'spring', 'Day1应为春天');
    assertEqual(SeasonSystem.getSeason(31), 'summer', 'Day31应为夏天');
    assertEqual(SeasonSystem.getSeason(61), 'autumn', 'Day61应为秋天');
    assertEqual(SeasonSystem.getSeason(91), 'winter', 'Day91应为冬天');
    assertEqual(SeasonSystem.getSeason(121), 'spring', 'Day121应回到春天');
});

test('SeasonSystem.getHerbBonus 季节加成', () => {
    assertEqual(SeasonSystem.SEASON_DATA.spring.herbGrowth, 1.5, '春天草药加成应为1.5');
    assertEqual(SeasonSystem.SEASON_DATA.summer.herbGrowth, 1.2, '夏天草药加成应为1.2');
    assertEqual(SeasonSystem.SEASON_DATA.winter.herbGrowth, 0.5, '冬天草药加成应为0.5');
});

// 测试6: 谈判系统
test('Negotiation.start 启动谈判', () => {
    Core.initState();
    Core.getState().day = 1;
    const patient = PatientGen.generateOne(0.5);
    const result = Negotiation.start(patient);
    assert(result.text, '谈判文本未生成');
    assert(result.quote > 0, '报价应为正数');
    assert(['generous', 'neutral', 'stingy', 'desperate'].includes(result.mood), '心情应在范围内');
});

test('Negotiation.makeOffer 全额接受', () => {
    Core.initState();
    Core.getState().day = 1;
    const patient = PatientGen.generateOne(0.5);
    const startResult = Negotiation.start(patient);
    const result = Negotiation.makeOffer(startResult.quote);
    assertEqual(result.type, 'accept', '全额应被接受');
});

test('Negotiation.makeOffer 过低拒绝', () => {
    Core.initState();
    Core.getState().day = 1;
    const patient = PatientGen.generateOne(0.5);
    Negotiation.start(patient);
    // 极低报价
    let result = Negotiation.makeOffer(10);
    // 最后一轮可能angry
    assert(['reject', 'angry', 'counter'].includes(result.type), '应被拒绝或还价');
});

// 测试7: 成就系统
test('AchievementSystem.checkAll 首次治愈', () => {
    Core.initState();
    Core.getState().totalCured = 1;
    const newAch = AchievementSystem.checkAll();
    assert(newAch.some(a => a.id === 'first_cure'), '应解锁初次治愈成就');
});

test('AchievementSystem.checkAll 开业大吉', () => {
    Core.initState();
    Core.getState().day = 2;
    const newAch = AchievementSystem.checkAll();
    assert(newAch.some(a => a.id === 'first_day'), '应解锁开业大吉成就');
});

// 测试8: 结局系统
test('EndingSystem.shouldTriggerEnding 100天触发', () => {
    Core.initState();
    assert(!EndingSystem.shouldTriggerEnding(), 'Day1不应触发结局');
    Core.getState().day = 100;
    assert(EndingSystem.shouldTriggerEnding(), 'Day100应触发结局');
});

test('EndingSystem.checkEnding 结局判定', () => {
    Core.initState();
    Core.getState().day = 100;
    Core.getState().reputation = 4.8;
    Core.getState().totalCured = 120;
    Core.getState().totalFailed = 5;
    const ending = EndingSystem.checkEnding();
    assert(ending, '应有一个结局');
    assert(ending.grade, '结局应有等级');
});

// 测试9: 存档系统
test('Core.save 和 Core.load 存档循环', () => {
    Core.initState();
    Core.getState().day = 5;
    Core.getState().gold = 3000;
    Core.getState().totalCured = 20;
    Core.save();
    
    Core.state = null;
    
    const loaded = Core.load();
    assertEqual(loaded.day, 5, '存档Day应为5');
    assertEqual(loaded.gold, 3000, '存档金币应为3000');
    assertEqual(loaded.totalCured, 20, '存档治愈数应为20');
});

// 测试10: 一天流程模拟
test('模拟Day1完整流程', () => {
    Core.initState();
    const state = Core.getState();
    
    // Step 1: 生成队列
    state.todayQueue = PatientGen.generateQueue(2, 0.5);
    state.waitingPatients = [...state.todayQueue];
    assertEqual(state.waitingPatients.length, 2, '应有2个等待病人');
    
    // Step 2: 接诊第一个病人
    const patient = state.waitingPatients.shift();
    state.currentPatient = patient;
    state.patientsToday++;
    
    // Step 3: 模拟治疗成功
    patient.minigameScore = 85;
    const fee = patient.fee;
    const oldGold = state.gold;
    Core.addGold(fee);
    Core.addReputation(CONSTANTS.REPUTATION.CURE_BONUS);
    Core.addPressure(CONSTANTS.PRESSURE.CURE_SUCCESS);
    state.curedToday++;
    state.totalCured++;
    state.streakCured++;
    
    assertEqual(state.curedToday, 1, '治愈数应为1');
    assert(state.gold > oldGold, '金币应增加');
    assert(state.reputation > 0.5, '声望应增加');
    assert(state.pressure < CONSTANTS.PRESSURE.START, '压力应下降');
    
    // Step 4: 清理
    state.currentPatient = null;
    
    // Step 5: 接诊第二个病人
    const patient2 = state.waitingPatients.shift();
    state.currentPatient = patient2;
    state.patientsToday++;
    
    // Step 6: 模拟治疗失败
    Core.addReputation(-CONSTANTS.REPUTATION.FAIL_PENALTY);
    Core.addPressure(CONSTANTS.PRESSURE.TREATMENT_FAIL);
    state.failedToday++;
    state.streakCured = 0;
    
    assertEqual(state.failedToday, 1, '失败数应为1');
    assertEqual(state.streakCured, 0, '连续治愈应重置');
    
    // Step 7: 一天结束
    state.currentPatient = null;
    state.waitingPatients = [];
    
    // Step 8: 进入Day2
    const result = Core.startNewDay();
    assertEqual(result, 'OK', '应成功进入下一天');
    assertEqual(state.day, 2, '应进入Day2');
    assertEqual(state.patientsToday, 0, 'Day2病人数应重置');
    assertEqual(state.curedToday, 0, 'Day2治愈数应重置');
    assertEqual(state.pressure, CONSTANTS.PRESSURE.START, 'Day2压力应重置');
});

// 测试11: 交租测试
test('交租日检测', () => {
    Core.initState();
    Core.getState().day = 7;
    Core.getState().gold = 1000;
    const oldGold = Core.getState().gold;
    Core.startNewDay(); // Day 7 -> Day 8, 应触发交租
    // 注意：startNewDay 在 day=7 时，因为 7 % 7 === 0，会交租
    // 但 day 从 7 变为 8，所以是进入 Day 8 时交租
});

// 测试12: 破产检测
test('破产检测', () => {
    Core.initState();
    Core.getState().gold = -100;
    Core.getState().day = 1;
    // 连续3天金币<0才会破产
    Core.startNewDay(); // Day 1 -> Day 2, _bankruptDays = 1
    assertEqual(Core.getState().day, 2, 'Day应为2');
    Core.getState().gold = -100; // 保持负数
    Core.startNewDay(); // Day 2 -> Day 3, _bankruptDays = 2
    Core.getState().gold = -100;
    const result = Core.startNewDay(); // Day 3 -> Day 4, _bankruptDays = 3, 应破产
    assertEqual(result, 'BANKRUPT', '应触发破产');
});

// 测试13: 反馈系统
test('FeedbackSystem.log 记录日志', () => {
    FeedbackSystem.clear();
    FeedbackSystem.log('测试事件', { test: true });
    const logs = FeedbackSystem.getRecent(1);
    assertEqual(logs.length, 1, '应有1条日志');
    assertEqual(logs[0].event, '测试事件', '事件名不匹配');
    assertEqual(logs[0].data.test, true, '数据不匹配');
});

test('FeedbackSystem.generateReport 生成报告', () => {
    Core.initState();
    const report = FeedbackSystem.generateReport();
    assert(report.version, '报告应有版本');
    assertEqual(report.day, 1, '报告Day应为1');
    assertEqual(report.gold, 1500, '报告金币应为1500');
});

// 测试14: 迷你游戏类型映射
test('迷你游戏类型映射', () => {
    Core.initState();
    Core.getState().day = 1;
    const patient = PatientGen.generateOne(0.5);
    assert(patient.minigame, '应有迷你游戏类型');
    assert(['stethoscope', 'grind', 'thermometer', 'suture'].includes(patient.minigame), 
        `未知的迷你游戏类型: ${patient.minigame}`);
});

// 测试15: NPC可用性
test('NPC按解锁天数可用', () => {
    const availableDay1 = Object.values(CONSTANTS.NPCS).filter(n => n.unlockDay <= 1);
    assert(availableDay1.length >= 2, 'Day1应至少有2个可用NPC');
    
    const availableDay5 = Object.values(CONSTANTS.NPCS).filter(n => n.unlockDay <= 5);
    assert(availableDay5.length >= 5, 'Day5应至少有5个可用NPC');
});

// 测试16: Buff定义完整性
test('Buff定义完整性', () => {
    const buffs = Object.values(BuffSystem.BUFFS);
    assert(buffs.length >= 10, '应有至少10个Buff');
    buffs.forEach(b => {
        assert(b.id, 'Buff缺少id');
        assert(b.name, 'Buff缺少name');
        assert(b.desc, 'Buff缺少desc');
        assert(b.rarity, 'Buff缺少rarity');
        assert(b.type, 'Buff缺少type');
        assert(b.effect, 'Buff缺少effect');
    });
});

// 测试17: 季节事件生成
test('季节事件生成', () => {
    Core.initState();
    const event = SeasonSystem.generateSeasonEvent();
    // 可能返回null（概率事件）
    if (event) {
        assert(event.name, '事件应有名称');
        assert(event.desc, '事件应有描述');
    }
});

// 测试18: 成就定义完整性
test('成就定义完整性', () => {
    const achievements = AchievementSystem.ACHIEVEMENTS;
    assert(achievements.length >= 10, '应有至少10个成就');
    achievements.forEach(a => {
        assert(a.id, '成就缺少id');
        assert(a.name, '成就缺少name');
        assert(a.desc, '成就缺少desc');
        assert(typeof a.condition === 'function', '成就condition应为函数');
    });
});

// 测试19: 结局定义完整性
test('结局定义完整性', () => {
    const endings = Object.values(EndingSystem.ENDINGS);
    assert(endings.length >= 5, '应有至少5个结局');
    endings.forEach(e => {
        assert(e.id, '结局缺少id');
        assert(e.name, '结局缺少name');
        assert(e.desc, '结局缺少desc');
        assert(e.grade, '结局缺少grade');
        assert(typeof e.condition === 'function', '结局condition应为函数');
    });
});

// 测试20: 工具函数
test('Utils工具函数', () => {
    assertBetween(Utils.randInt(1, 10), 1, 10, 'randInt范围错误');
    assertEqual(Utils.clamp(50, 0, 100), 50, 'clamp中间值');
    assertEqual(Utils.clamp(-10, 0, 100), 0, 'clamp下限');
    assertEqual(Utils.clamp(150, 0, 100), 100, 'clamp上限');
    assertEqual(Utils.distance(0, 0, 3, 4), 5, 'distance计算错误');
});

// ==================== 运行测试 ====================

console.log('========================================');
console.log('  宠物医生模拟器 v0.3 — 逻辑冒烟测试');
console.log('  模块数: 14 | 测试数:', tests.length);
console.log('========================================\n');

for (const t of tests) {
    try {
        t.fn();
        console.log(`✅ ${t.name}`);
        passed++;
    } catch (e) {
        console.log(`❌ ${t.name}`);
        console.log(`   ${e.message}`);
        failed++;
    }
}

console.log('\n========================================');
console.log(`  结果: ${passed} 通过, ${failed} 失败`);
console.log(`  通过率: ${Math.round(passed/tests.length*100)}%`);
console.log('========================================');

process.exit(failed > 0 ? 1 : 0);

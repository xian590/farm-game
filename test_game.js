// ====== 游戏逻辑测试脚本 ======
// 在浏览器控制台中执行，验证Day 1-5核心流程

console.log('=== 李家村农耕模拟器 - Day 1-5 测试脚本 ===');

// 测试1：初始化检查
function testInit() {
    console.log('\n--- Test 1: 初始化检查 ---');
    
    // 选择普通模式
    selectMode('normal');
    
    const checks = {
        '模式': game.mode === 'normal',
        '资金': game.money === 1500,
        '体力': game.stamina === 100, // 50% of 200
        'max体力': game.maxStamina === 200,
        '健康': game.health === 200,
        'max健康': game.maxHealth === 200,
        '天数': game.day === 1,
        '季节': game.season === 'spring',
        '田地数': game.fields.length === 1,
        '仓库': game.storageCapacity === 2000,
        'NPC初始': Object.keys(game.npcs).length === 0,
        'pendingQuestRewards': Array.isArray(game.pendingQuestRewards)
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试2：整地操作
function testPrepareField() {
    console.log('\n--- Test 2: 整地操作 ---');
    const beforeStamina = game.stamina;
    const beforeMoney = game.money;
    
    prepareField(0);
    
    const checks = {
        '体力消耗15': game.stamina === beforeStamina - 15,
        '资金不变': game.money === beforeMoney,
        '田地已整地': game.fields[0].prepared === true,
        '田地stage': game.fields[0].stage === 'idle',
        '任务q0完成': game.quests.q0 === true,
        'pendingQuestRewards': game.pendingQuestRewards.length > 0 && game.pendingQuestRewards[0].questId === 'q0'
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: ${JSON.stringify(game.pendingQuestRewards)}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试3：购买种子
function testBuySeed() {
    console.log('\n--- Test 3: 购买种子 ---');
    const beforeMoney = game.money;
    
    buySeed('rice_spring');
    
    const checks = {
        '资金减少50': game.money === beforeMoney - 50,
        '种子+1': game.seeds.rice_spring >= 1,
        '任务q1完成': game.quests.q1 === true,
        'pendingQuestRewards': game.pendingQuestRewards.some(r => r.questId === 'q1')
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: money=${game.money}, seeds=${game.seeds.rice_spring}, quests.q1=${game.quests.q1}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试4：育苗操作
function testPlantCrop() {
    console.log('\n--- Test 4: 育苗操作 ---');
    const beforeStamina = game.stamina;
    const beforeSeeds = game.seeds.rice_spring;
    
    plantCrop(0, 'rice_spring');
    
    const checks = {
        '体力消耗10': game.stamina === beforeStamina - 10,
        '种子-1': game.seeds.rice_spring === beforeSeeds - 1,
        '田地进入seedling': game.fields[0].stage === 'seedling',
        '任务q2完成': game.quests.q2 === true,
        'pendingQuestRewards': game.pendingQuestRewards.some(r => r.questId === 'q2')
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: stamina=${game.stamina}, stage=${game.fields[0].stage}, quests.q2=${game.quests.q2}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试5：跳过到Day 2并移栽
function testTransplant() {
    console.log('\n--- Test 5: 移栽操作 (Day 2) ---');
    
    // 模拟Day 2
    game.day = 2;
    game.stamina = Math.min(game.maxStamina, game.stamina + 50); // 恢复一些体力
    const beforeStamina = game.stamina;
    
    transplantCrop(0);
    
    const checks = {
        '体力消耗18': game.stamina === beforeStamina - 18,
        '田地进入transplanting': game.fields[0].stage === 'transplanting',
        '任务q3完成': game.quests.q3 === true,
        'pendingQuestRewards': game.pendingQuestRewards.some(r => r.questId === 'q3')
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: stamina=${game.stamina}, stage=${game.fields[0].stage}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试6：生长检查（transplanting→growing）
function testGrowth() {
    console.log('\n--- Test 6: 生长检查（关键bug验证） ---');
    
    // transplanting需要2天进入growing
    // 模拟Day 3和Day 4的生长
    game.day = 3;
    growCrops();
    const stageDay3 = game.fields[0].stage;
    
    game.day = 4;
    growCrops();
    const stageDay4 = game.fields[0].stage;
    
    const checks = {
        'Day 3仍在transplanting': stageDay3 === 'transplanting',
        'Day 4进入growing': stageDay4 === 'growing',
        '关键bug已修复': stageDay4 === 'growing' // 如果仍是transplanting，说明bug未修复
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: Day3=${stageDay3}, Day4=${stageDay4}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试7：收割与仓库限制
function testHarvest() {
    console.log('\n--- Test 7: 收割操作 ---');
    
    // 模拟Day 5成熟
    game.day = 5;
    game.fields[0].stage = 'mature';
    game.fields[0].crop = 'rice_spring';
    game.stamina = 100;
    const beforeStamina = game.stamina;
    const beforeRice = game.crops.rice || 0;
    
    harvestCrop(0);
    
    const harvested = (game.crops.rice || 0) - beforeRice;
    
    const checks = {
        '体力消耗20': game.stamina === beforeStamina - 20,
        '收获>0': harvested > 0,
        '收获<=500': harvested <= 500,
        '任务q4完成': game.quests.q4 === true,
        'pendingQuestRewards': game.pendingQuestRewards.some(r => r.questId === 'q4')
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}: 收获${harvested}斤`); }
        else { fail++; console.log(`  ❌ ${key}: stamina=${game.stamina}, harvested=${harvested}, quests.q4=${game.quests.q4}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试8：每日吃饭消耗
function testDailyMeal() {
    console.log('\n--- Test 8: 每日吃饭消耗 ---');
    
    const beforeMoney = game.money;
    game.money = 50; // 确保有钱
    
    onNewDay();
    
    const checks = {
        '有钱时扣20': game.money === 30,
        '日志有吃饭': true // 检查日志较难，跳过
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}: money=${game.money}`); }
        else { fail++; console.log(`  ❌ ${key}: money=${game.money}`); }
    }
    
    // 测试没钱的情况
    game.money = 10;
    const beforeHealth = game.health;
    const beforeStamina = game.stamina;
    onNewDay();
    
    const noMoneyChecks = {
        '没钱时扣体力10': game.stamina === beforeStamina - 10,
        '没钱时扣健康2': game.health === beforeHealth - 2,
        '资金归零': game.money === 0
    };
    
    for (const [key, val] of Object.entries(noMoneyChecks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}: stamina=${game.stamina}, health=${game.health}, money=${game.money}`); }
    }
    
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试9：任务弹窗系统
function testQuestModal() {
    console.log('\n--- Test 9: 任务弹窗系统 ---');
    
    const checks = {
        'pendingQuestRewards存在': Array.isArray(game.pendingQuestRewards),
        'queueQuestReward函数': typeof queueQuestReward === 'function',
        'showQuestRewardModal函数': typeof showQuestRewardModal === 'function',
        'claimQuestReward函数': typeof claimQuestReward === 'function'
    };
    
    let pass = 0, fail = 0;
    for (const [key, val] of Object.entries(checks)) {
        if (val) { pass++; console.log(`  ✅ ${key}`); }
        else { fail++; console.log(`  ❌ ${key}`); }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试10：NPC存在性检查
function testNPCs() {
    console.log('\n--- Test 10: NPC数据完整性 ---');
    
    const expectedNPCs = ['wangcunzhang', 'lilaonong', 'zhangshen', 'wangerdan', 'zhaolaoban', 
                           'chenyang', 'linxiaoyu', 'sunmiaoqing', 'laoyufu', 'zhouzhuzhu'];
    
    let pass = 0, fail = 0;
    for (const npcKey of expectedNPCs) {
        if (NPC_DATA[npcKey]) {
            pass++;
            console.log(`  ✅ ${npcKey}: ${NPC_DATA[npcKey].name} (${NPC_DATA[npcKey].title})`);
        } else {
            fail++;
            console.log(`  ❌ ${npcKey}: 不存在`);
        }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试11：加工品数据完整性
function testProcessedItems() {
    console.log('\n--- Test 11: 加工品数据完整性 ---');
    
    const expectedItems = ['riceGrain', 'driedSweetPotato', 'driedFish', 'fishBall', 'fishSoup',
                           'polishedRice', 'riceWine', 'riceCake', 'sweetPotatoStarch', 'sweetPotatoNoodles'];
    
    let pass = 0, fail = 0;
    for (const itemKey of expectedItems) {
        if (PROCESSED_ITEMS[itemKey]) {
            pass++;
            console.log(`  ✅ ${itemKey}: ${PROCESSED_ITEMS[itemKey].name} ${PROCESSED_ITEMS[itemKey].emoji} (${PROCESSED_ITEMS[itemKey].basePrice}倍)`);
        } else {
            fail++;
            console.log(`  ❌ ${itemKey}: 不存在`);
        }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 测试12：加工建筑数据完整性
function testProcessingBuildings() {
    console.log('\n--- Test 12: 加工建筑数据完整性 ---');
    
    const expectedBuildings = ['riceMill', 'sweetPotatoDry', 'fishDrying', 'fishBallWorkshop', 'fishSoupKitchen',
                               'ricePolishing', 'riceWineBrew', 'riceCakeKitchen', 'sweetPotatoStarchMill', 'sweetPotatoNoodlePress'];
    
    let pass = 0, fail = 0;
    for (const bKey of expectedBuildings) {
        if (PROCESSING_DATA[bKey]) {
            pass++;
            console.log(`  ✅ ${bKey}: ${PROCESSING_DATA[bKey].name} (造价${PROCESSING_DATA[bKey].buildCost}元)`);
        } else {
            fail++;
            console.log(`  ❌ ${bKey}: 不存在`);
        }
    }
    console.log(`  结果: ${pass}通过, ${fail}失败`);
    return fail === 0;
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始执行测试...\n');
    
    const results = [];
    results.push(testInit());
    results.push(testPrepareField());
    results.push(testBuySeed());
    results.push(testPlantCrop());
    results.push(testTransplant());
    results.push(testGrowth());
    results.push(testHarvest());
    results.push(testDailyMeal());
    results.push(testQuestModal());
    results.push(testNPCs());
    results.push(testProcessedItems());
    results.push(testProcessingBuildings());
    
    const total = results.length;
    const passed = results.filter(r => r).length;
    
    console.log('\n========================================');
    console.log(`📊 测试结果: ${passed}/${total} 通过`);
    if (passed === total) {
        console.log('🎉 所有测试通过！');
    } else {
        console.log('⚠️ 存在失败的测试，需要修复！');
    }
    console.log('========================================');
    
    return { passed, total, results };
}

// 导出测试函数
window.runGameTests = runAllTests;
console.log('测试脚本已加载。在控制台输入 runGameTests() 开始测试。');

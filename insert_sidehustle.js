const fs = require('fs');

const sideHustleCode = `
// ==================== 零活副业系统 ====================
const SIDE_HUSTLE_DATA = {
    videoClip: {
        id: 'videoClip',
        name: '剪乡村短视频',
        emoji: '🎬',
        desc: '给村里人拍点乡村生活短视频，传到网上能赚点流量钱。',
        unlockDay: 10,
        unlockMoney: 500,
        dailyMax: 1,
        staminaCost: 30,
        reward: 30,
        type: 'money'
    },
    neighborPhoto: {
        id: 'neighborPhoto',
        name: '帮邻居拍视频',
        emoji: '📱',
        desc: '帮邻居拍拍视频、剪剪照片，赚点零花钱。',
        unlockDay: 10,
        unlockMoney: 500,
        dailyMax: 2,
        staminaCost: 20,
        reward: 15,
        type: 'money'
    },
    pickle: {
        id: 'pickle',
        name: '腌菜/做果酱',
        emoji: '🥒',
        desc: '把富余的蔬菜、野果做成腌菜或果酱，比卖生的贵一点。',
        unlockDay: 10,
        unlockMoney: 500,
        dailyMax: 2,
        staminaCost: 15,
        materialCost: { type: 'mixed', amount: 5 }, // 5个蔬菜或野果
        reward: 10, // 5罐，每罐2元
        type: 'craft'
    },
    bambooCraft: {
        id: 'bambooCraft',
        name: '做手工竹编',
        emoji: '🎋',
        desc: '用竹子编个小筐子、篮子什么的，赶集卖。',
        unlockDay: 10,
        unlockMoney: 500,
        dailyMax: 1,
        staminaCost: 25,
        materialCost: { type: 'bamboo', amount: 1 },
        reward: 10,
        type: 'craft'
    }
};

// 检查零活副业是否解锁
function isSideHustleUnlocked() {
    return game.day >= 10 && game.money >= 500;
}

// 获取今日零活副业完成次数
function getSideHustleDone(key) {
    if (!game.sideHustle) game.sideHustle = {};
    if (!game.sideHustle.dailyDone) game.sideHustle.dailyDone = {};
    return game.sideHustle.dailyDone[key] || 0;
}

// 做零活副业
function doSideHustle(key) {
    const hustle = SIDE_HUSTLE_DATA[key];
    if (!hustle) return;
    
    const done = getSideHustleDone(key);
    if (done >= hustle.dailyMax) {
        addLog('⏰ 今天' + hustle.name + '做够了，歇歇吧', 'info');
        return;
    }
    
    if (game.stamina < hustle.staminaCost) {
        addLog('😫 体力不够，干不动', 'bad');
        return;
    }
    
    // 检查材料
    if (hustle.materialCost) {
        if (hustle.materialCost.type === 'bamboo') {
            // 竹子从采集来
            if ((game.foragingItems?.bamboo || 0) < hustle.materialCost.amount) {
                addLog('🎋 没有竹子了，去后山采集吧', 'bad');
                return;
            }
            game.foragingItems.bamboo -= hustle.materialCost.amount;
        } else if (hustle.materialCost.type === 'mixed') {
            // 检查蔬菜和野果总数
            const veg = (game.crops?.rice || 0) + (game.crops?.sweet || 0);
            if (veg < hustle.materialCost.amount) {
                addLog('🥬 没有足够材料，先种点菜吧', 'bad');
                return;
            }
            // 消耗材料
            const riceCost = Math.min(game.crops.rice || 0, hustle.materialCost.amount);
            game.crops.rice -= riceCost;
            const remaining = hustle.materialCost.amount - riceCost;
            game.crops.sweet -= Math.min(game.crops.sweet || 0, remaining);
        }
    }
    
    game.stamina -= hustle.staminaCost;
    if (!game.sideHustle) game.sideHustle = {};
    if (!game.sideHustle.dailyDone) game.sideHustle.dailyDone = {};
    game.sideHustle.dailyDone[key] = (game.sideHustle.dailyDone[key] || 0) + 1;
    
    if (hustle.type === 'money') {
        game.money += hustle.reward;
        addLog('💰 ' + hustle.name + '赚了' + hustle.reward + '元，-' + hustle.staminaCost + '体力', 'good');
    } else if (hustle.type === 'craft') {
        // 产出腌菜/果酱
        if (!game.processedItems) game.processedItems = {};
        if (key === 'pickle') {
            game.processedItems.pickle = (game.processedItems.pickle || 0) + 5;
            addLog('🥒 做了5罐腌菜/果酱，-' + hustle.staminaCost + '体力', 'good');
        } else if (key === 'bambooCraft') {
            game.processedItems.bambooBasket = (game.processedItems.bambooBasket || 0) + 1;
            addLog('🎋 编了1个竹筐，-' + hustle.staminaCost + '体力', 'good');
        }
    }
    
    playClickSound();
    saveGame();
    updateUI();
    if (currentMainTab === 'processing') {
        renderProcessingPanel();
    }
}

`;

const filePath = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. 插入 SIDE_HUSTLE_DATA 到 PROCESSED_ITEMS 后面
const processedItemsEnd = 'const PROCESSED_ITEMS = {';
if (html.includes(processedItemsEnd) && !html.includes('const SIDE_HUSTLE_DATA = {')) {
    const endMarker = '};\n\n// 科技数据';
    html = html.replace(endMarker, '};\n' + sideHustleCode + '\n// 科技数据');
}

fs.writeFileSync(filePath, html);
console.log('零活副业系统插入完成');

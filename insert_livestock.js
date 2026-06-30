const fs = require('fs');

const livestockData = `
// ==================== 畜牧系统数据 ====================
const LIVESTOCK_DATA = {
    chicken: {
        name: '母鸡',
        emoji: '🐔',
        type: 'chicken',
        buyPrice: 5, // 鸡苗价格
        growDays: 7, // 小鸡长大天数
        layInterval: 2, // 成年母鸡产蛋间隔（天）
        eggPrice: 1, // 土鸡蛋售价（元）
        eggStamina: 20, // 吃鸡蛋回体力
        dailyFood: 1, // 每日消耗食物份数
        maxCount: 5, // 养殖上限
        desc: '散养土鸡，下的蛋又香又营养。'
    },
    pig: {
        name: '猪',
        emoji: '🐷',
        type: 'pig',
        buyPrice: 100, // 猪崽价格
        growDays: 180, // 出栏天数
        sellPrice: 800, // 整猪售价
        dailyFood: 2, // 每日消耗食物份数
        maxCount: 2, // 养殖上限
        desc: '养大了可以卖个好价钱，或者杀了做腊肉。'
    },
    sheep: {
        name: '羊',
        emoji: '🐑',
        type: 'sheep',
        buyPrice: 80, // 羊崽价格
        growDays: 120, // 长大天数
        woolInterval: 3, // 剪毛间隔（天）
        woolPrice: 20, // 羊毛售价
        dailyFood: 2, // 每日消耗食物份数
        maxCount: 3, // 养殖上限
        desc: '羊毛可以卖钱，还能产羊奶。'
    },
    cow: {
        name: '牛',
        emoji: '🐄',
        type: 'cow',
        buyPrice: 500, // 牛犊价格
        growDays: 365, // 长大天数
        plowStaminaSave: 0.5, // 耕地省50%体力
        dailyFood: 3, // 每日消耗食物份数
        maxCount: 1, // 养殖上限
        desc: '耕地的好帮手，核心生产资料。'
    }
};

`;

const livestockInit = `
        livestock: {
            chickens: [
                { id: 'c1', age: 7, grown: true, fedToday: false, lastLayDay: 0 }, // 开局1只成年母鸡
                { id: 'c2', age: 0, grown: false, fedToday: false, lastLayDay: 0 }, // 2只小鸡
                { id: 'c3', age: 0, grown: false, fedToday: false, lastLayDay: 0 }
            ],
            eggs: 0, // 鸡蛋库存
            pigs: [],
            sheep: [],
            cows: []
        },
`;

const livestockFunctions = `
// ==================== 畜牧系统面板 ====================
function renderLivestockPanel() {
    const panel = document.getElementById('content-panel');
    let html = '<div class="panel-title">🐔 禽畜养殖</div>';
    
    if (!game.livestock) {
        html += '<div style="text-align:center;padding:40px;color:#999;">养殖数据未初始化</div>';
        panel.innerHTML = html;
        return;
    }
    
    // 鸡蛋库存
    html += '<div class="shop-item" style="background:linear-gradient(135deg, #fff9e6 0%, #ffe066 100%);">';
    html += '<div class="shop-item-info">';
    html += '<div style="font-size:28px;margin-bottom:5px;">🥚</div>';
    html += '<div><div class="shop-item-name">土鸡蛋</div>';
    html += '<div class="shop-item-desc">库存: ' + (game.livestock.eggs || 0) + ' 个</div></div>';
    html += '<div style="display:flex;gap:8px;">';
    html += '<button class="action-btn" onclick="eatEgg()" ' + ((game.livestock.eggs || 0) <= 0 ? 'disabled style="opacity:0.5"' : '') + '>吃一个(+20体力)</button>';
    html += '<button class="action-btn" onclick="sellEgg()" ' + ((game.livestock.eggs || 0) <= 0 ? 'disabled style="opacity:0.5"' : '') + '>卖掉(+1元)</button>';
    html += '</div></div></div>';
    
    // 养鸡区
    html += '<div class="shop-category">🐔 鸡舍 (' + (game.livestock.chickens || []).length + '/5)</div>';
    
    if (game.livestock.chickens && game.livestock.chickens.length > 0) {
        game.livestock.chickens.forEach((chicken, idx) => {
            const grown = chicken.grown || chicken.age >= 7;
            const canLay = grown && game.day - (chicken.lastLayDay || 0) >= 2;
            html += '<div class="field-card" style="margin-bottom:10px;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
            html += '<div>';
            html += '<span style="font-size:24px;margin-right:10px;">' + (grown ? '🐔' : '🐤') + '</span>';
            html += '<span style="font-weight:bold;">' + (grown ? '母鸡' : '小鸡') + '</span>';
            html += '<span style="font-size:13px;color:#999;margin-left:8px;">' + (grown ? '已成年' : '第' + chicken.age + '天') + '</span>';
            html += '</div>';
            html += '<div style="display:flex;gap:8px;">';
            if (!chicken.fedToday) {
                html += '<button class="action-btn" onclick="feedChicken(' + idx + ')" ' + (game.stamina < 3 ? 'disabled style="opacity:0.5"' : '') + '>喂食(-3体力)</button>';
            } else {
                html += '<span style="font-size:13px;color:#27ae60;">✅ 已喂</span>';
            }
            html += '</div></div></div>';
        });
    } else {
        html += '<div style="text-align:center;padding:20px;color:#999;">鸡舍空空如也</div>';
    }
    
    // 买鸡苗
    const chickenData = LIVESTOCK_DATA.chicken;
    const canBuyChicken = (game.livestock.chickens || []).length < chickenData.maxCount;
    html += '<div style="display:flex;gap:10px;margin-top:10px;">';
    html += '<button class="action-btn" onclick="buyChicken()" ' + (!canBuyChicken || game.money < chickenData.buyPrice ? 'disabled style="opacity:0.5"' : '') + '>';
    html += '🛒 买鸡苗(' + chickenData.buyPrice + '元) ' + (game.livestock.chickens || []).length + '/' + chickenData.maxCount;
    html += '</button>';
    html += '</div>';
    
    // 猪牛羊（未解锁提示）
    html += '<div class="shop-category" style="margin-top:20px;opacity:0.6;">🐷 猪圈 (暂未开放)</div>';
    html += '<div class="shop-category" style="opacity:0.6;">🐑 羊棚 (暂未开放)</div>';
    html += '<div class="shop-category" style="opacity:0.6;">🐄 牛棚 (暂未开放)</div>';
    
    panel.innerHTML = html;
}

// 买鸡苗
function buyChicken() {
    const chickenData = LIVESTOCK_DATA.chicken;
    if (game.money < chickenData.buyPrice) {
        addLog('💸 钱不够，鸡苗要' + chickenData.buyPrice + '元', 'bad');
        return;
    }
    if ((game.livestock.chickens || []).length >= chickenData.maxCount) {
        addLog('🐔 鸡舍满了，最多养' + chickenData.maxCount + '只', 'bad');
        return;
    }
    game.money -= chickenData.buyPrice;
    const newId = 'c' + ((game.livestock.chickens || []).length + 1);
    game.livestock.chickens.push({
        id: newId,
        age: 0,
        grown: false,
        fedToday: false,
        lastLayDay: 0
    });
    addLog('🐤 买了只鸡苗，花了' + chickenData.buyPrice + '元', 'good');
    playClickSound();
    saveGame();
    updateUI();
    renderLivestockPanel();
}

// 喂鸡
function feedChicken(idx) {
    if (game.stamina < 3) {
        addLog('😫 体力不足，喂不动', 'bad');
        return;
    }
    const chicken = game.livestock.chickens[idx];
    if (chicken.fedToday) {
        addLog('🐔 这只鸡今天喂过了', 'info');
        return;
    }
    game.stamina -= 3;
    chicken.fedToday = true;
    addLog('🌾 喂了只鸡，-3体力', 'info');
    playClickSound();
    saveGame();
    updateUI();
    renderLivestockPanel();
}

// 吃鸡蛋
function eatEgg() {
    if ((game.livestock.eggs || 0) <= 0) {
        addLog('🥚 没有鸡蛋了', 'bad');
        return;
    }
    game.livestock.eggs--;
    game.stamina = Math.min(game.maxStamina, game.stamina + 20);
    addLog('🥚 吃了个土鸡蛋，+20体力', 'good');
    playClickSound();
    saveGame();
    updateUI();
}

// 卖鸡蛋
function sellEgg() {
    if ((game.livestock.eggs || 0) <= 0) {
        addLog('🥚 没有鸡蛋可卖', 'bad');
        return;
    }
    const price = LIVESTOCK_DATA.chicken.eggPrice;
    game.livestock.eggs--;
    game.money += price;
    addLog('💰 卖了1个土鸡蛋，+' + price + '元', 'good');
    playClickSound();
    saveGame();
    updateUI();
}

// 畜牧过天逻辑
function processLivestockDaily() {
    if (!game.livestock) return;
    
    const chickenData = LIVESTOCK_DATA.chicken;
    
    // 处理鸡
    if (game.livestock.chickens) {
        game.livestock.chickens.forEach(chicken => {
            // 重置喂食状态
            chicken.fedToday = false;
            
            // 成长
            if (!chicken.grown) {
                chicken.age++;
                if (chicken.age >= chickenData.growDays) {
                    chicken.grown = true;
                    addLog('🐔 小鸡长大了！变成成年母鸡', 'good');
                }
            }
            
            // 产蛋（成年母鸡每2天产1蛋）
            if (chicken.grown && game.day - (chicken.lastLayDay || 0) >= chickenData.layInterval) {
                chicken.lastLayDay = game.day;
                game.livestock.eggs = (game.livestock.eggs || 0) + 1;
                addLog('🥚 母鸡下了个蛋！', 'good');
            }
        });
    }
}

`;

const filePath = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. 插入 LIVESTOCK_DATA 到 CROP_DATA 和 HOUSE_DATA 之间
const cropDataEnd = '    }\n};\n\nconst HOUSE_DATA = {';
if (html.includes(cropDataEnd)) {
    html = html.replace(cropDataEnd, '    }\n};\n' + livestockData + '\nconst HOUSE_DATA = {');
}

// 2. 插入 livestock 初始化到 initGame 的 crops 后面
const cropsLine = '        crops: { rice: 0, sweet: 0 },';
if (html.includes(cropsLine)) {
    html = html.replace(cropsLine, '        crops: { rice: 0, sweet: 0 },' + livestockInit);
}

// 3. 插入函数到文件末尾（在 </script> 之前）
const scriptEnd = '</script>';
html = html.replace(scriptEnd, livestockFunctions + '\n</script>');

// 4. 在侧边栏添加按钮
const sideMenu = '<div class="menu-item" data-panel="restart" onclick="switchPanel(\'restart\')">\n';
const newMenuItem = '<div class="menu-item" data-panel="livestock" onclick="switchPanel(\'livestock\')">\n            <span class="menu-icon">🐔</span>\n            <span class="menu-text">禽畜养殖</span>\n        </div>\n        ';
if (html.includes(sideMenu) && !html.includes('data-panel="livestock"')) {
    html = html.replace(sideMenu, newMenuItem + sideMenu);
}

// 5. 在 switchPanel 中添加 livestock 分支
const panelSwitch = 'if (panelName === \'restart\') { showRestartConfirm(); return; }';
const livestockSwitch = "if (panelName === 'livestock') { renderLivestockPanel(); return; }\n        ";
if (html.includes(panelSwitch) && !html.includes("'livestock'") && !html.includes('renderLivestockPanel()')) {
    html = html.replace(panelSwitch, livestockSwitch + panelSwitch);
}

// 6. 在 onNewDay 中添加畜牧过天逻辑
const weatherChange = '    // 天气变化\n    changeWeather();';
const livestockProcess = '    // 畜牧过天\n    processLivestockDaily();\n    \n    ' + weatherChange;
if (html.includes(weatherChange) && !html.includes('processLivestockDaily')) {
    html = html.replace(weatherChange, livestockProcess);
}

// 7. 在 fixSaveData 中添加 livestock 兼容
const fixSaveEnd = '    // 补全事件\n    if (game.currentEvent === undefined) game.currentEvent = null;';
const fixSaveLivestock = '    // 补全畜牧系统\n    if (!game.livestock) {\n        game.livestock = {\n            chickens: [],\n            eggs: 0,\n            pigs: [],\n            sheep: [],\n            cows: []\n        };\n    }\n    if (!game.livestock.chickens) game.livestock.chickens = [];\n    if (game.livestock.eggs === undefined) game.livestock.eggs = 0;\n    \n';
if (html.includes(fixSaveEnd) && !html.includes('补全畜牧系统')) {
    html = html.replace(fixSaveEnd, fixSaveLivestock + fixSaveEnd);
}

// 8. 在 updateUI 中更新鸡蛋显示（如果顶部栏有鸡蛋显示）
// 先检查是否有鸡蛋显示元素
if (html.includes('stat-egg') || html.includes('stat-eggs')) {
    // 已有鸡蛋显示，不需要添加
} else {
    // 在 stat-rice 后面添加鸡蛋显示
    const statRice = '<span id="stat-rice">';
    const statEgg = '<span id="stat-egg">';
    if (html.includes(statRice) && !html.includes(statEgg)) {
        // 找到 stat-rice 的整行，在后面插入
        const riceLine = html.match(/<span id="stat-rice">.*?<\/span>/);
        if (riceLine) {
            // 简单处理：在 rice 统计后面插入 eggs
            // 由于 HTML 结构复杂，这里不添加顶部栏显示，只在面板显示
        }
    }
}

fs.writeFileSync(filePath, html);
console.log('畜牧系统插入完成');
console.log('livestockData length:', livestockData.length);
console.log('livestockInit length:', livestockInit.length);
console.log('livestockFunctions length:', livestockFunctions.length);

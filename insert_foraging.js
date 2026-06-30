const fs = require('fs');

const foragingData = `
// ==================== 采集系统数据 ====================
const FORAGING_DATA = {
    common: [
        { name: '野菜', emoji: '🥬', price: 1, stamina: 5, weight: 30 },
        { name: '蘑菇', emoji: '🍄', price: 2, stamina: 0, weight: 20 },
        { name: '柴火', emoji: '🪵', price: 1, stamina: 0, weight: 25 },
        { name: '草药', emoji: '🌿', price: 3, stamina: 0, weight: 15 }
    ],
    rare: [
        { name: '鸟蛋', emoji: '🥚', price: 2, stamina: 10, weight: 5 },
        { name: '好看的石头', emoji: '🪨', price: 1, stamina: 0, weight: 5 }
    ],
    seasonal: {
        spring: [
            { name: '春笋', emoji: '🎋', price: 3, stamina: 8, weight: 15 },
            { name: '荠菜', emoji: '🌱', price: 2, stamina: 5, weight: 10 }
        ],
        summer: [
            { name: '树莓', emoji: '🍇', price: 2, stamina: 5, weight: 15 },
            { name: '野桃', emoji: '🍑', price: 3, stamina: 8, weight: 10 }
        ],
        autumn: [
            { name: '板栗', emoji: '🌰', price: 3, stamina: 5, weight: 15 },
            { name: '野枣', emoji: '🫐', price: 2, stamina: 5, weight: 10 }
        ],
        winter: [
            { name: '冬笋', emoji: '🎍', price: 4, stamina: 8, weight: 15 },
            { name: '干柴火', emoji: '🔥', price: 2, stamina: 0, weight: 10 }
        ]
    }
};

`;

const foragingInit = `
        foraging: {
            usedToday: false
        },
`;

const foragingFunctions = `
// ==================== 采集系统面板 ====================
function renderForagingPanel() {
    const panel = document.getElementById('content-panel');
    let html = '<div class="panel-title">🏞️ 后山采集</div>';
    
    html += '<div style="background: linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%); padding: 20px; border-radius: 12px; color: #2d6a4f; margin-bottom: 20px;">';
    html += '<div style="font-size: 36px; margin-bottom: 10px;">🏞️</div>';
    html += '<div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">后山/河边闲逛</div>';
    html += '<div style="font-size: 13px; opacity: 0.9;">每天可以去一次，消耗15体力，带点山货回来</div>';
    html += '</div>';
    
    const canGo = !game.foraging || !game.foraging.usedToday;
    const hasStamina = game.stamina >= 15;
    
    html += '<div style="text-align: center; margin: 30px 0;">';
    html += '<button class="action-btn" style="font-size: 16px; padding: 15px 40px;" onclick="goForaging()" ' + (!canGo || !hasStamina ? 'disabled style="opacity:0.5"' : '') + '>';
    html += canGo ? (hasStamina ? '🚶 去后山采集 (-15体力)' : '😫 体力不足 (需要15体力)') : '✅ 今天去过了');
    html += '</button>';
    html += '</div>';
    
    if (!canGo) {
        html += '<div style="text-align: center; color: #999; font-size: 13px;">明天再来吧，山跑不了</div>';
    }
    
    // 季节限定提示
    const seasonItems = FORAGING_DATA.seasonal[game.season] || [];
    if (seasonItems.length > 0) {
        html += '<div class="shop-category">🌿 本季节限定产出</div>';
        seasonItems.forEach(item => {
            html += '<div class="shop-item" style="opacity: 0.8;">';
            html += '<div class="shop-item-info">';
            html += '<span style="font-size: 24px; margin-right: 10px;">' + item.emoji + '</span>';
            html += '<div><div class="shop-item-name">' + item.name + '</div>';
            html += '<div class="shop-item-desc">' + item.price + '元/个</div></div>';
            html += '</div></div>';
        });
    }
    
    html += '<div class="shop-category">📦 常见产出</div>';
    FORAGING_DATA.common.forEach(item => {
        html += '<div class="shop-item" style="opacity: 0.8;">';
        html += '<div class="shop-item-info">';
        html += '<span style="font-size: 24px; margin-right: 10px;">' + item.emoji + '</span>';
        html += '<div><div class="shop-item-name">' + item.name + '</div>';
        html += '<div class="shop-item-desc">' + item.price + '元/个</div></div>';
        html += '</div></div>';
    });
    
    panel.innerHTML = html;
}

// 去采集
function goForaging() {
    if (game.foraging && game.foraging.usedToday) {
        addLog('🏞️ 今天已经去过后山了', 'info');
        return;
    }
    if (game.stamina < 15) {
        addLog('😫 体力不够，爬不动山', 'bad');
        return;
    }
    
    game.stamina -= 15;
    if (!game.foraging) game.foraging = {};
    game.foraging.usedToday = true;
    
    // 生成产出
    let items = [];
    const common = FORAGING_DATA.common;
    const rare = FORAGING_DATA.rare;
    const seasonal = FORAGING_DATA.seasonal[game.season] || [];
    
    // 产出1-3个物品
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
        const roll = Math.random() * 100;
        let item;
        if (roll < 15 && rare.length > 0) {
            item = rare[Math.floor(Math.random() * rare.length)];
        } else if (roll < 40 && seasonal.length > 0) {
            item = seasonal[Math.floor(Math.random() * seasonal.length)];
        } else {
            item = common[Math.floor(Math.random() * common.length)];
        }
        items.push(item);
    }
    
    // 显示结果
    let itemNames = items.map(i => i.emoji + i.name).join('、');
    let totalValue = items.reduce((sum, i) => sum + i.price, 0);
    
    addLog('🏞️ 去后山采了' + count + '样东西：' + itemNames, 'good');
    addLog('💰 这些东西能卖' + totalValue + '元', 'good');
    
    // 进背包（简化处理：直接加钱）
    game.money += totalValue;
    
    playClickSound();
    saveGame();
    updateUI();
    renderForagingPanel();
}

`;

const filePath = 'C:/Users/Administrator/Documents/kimi/workspace/farm_game.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. 插入 FORAGING_DATA 到 LIVESTOCK_DATA 后面
const livestockDataEnd = 'const LIVESTOCK_DATA = {';
if (html.includes(livestockDataEnd) && !html.includes('const FORAGING_DATA = {')) {
    // 找到 LIVESTOCK_DATA 的结束位置
    const livestockEnd = '};\n\nconst HOUSE_DATA = {';
    html = html.replace(livestockEnd, '};\n' + foragingData + '\nconst HOUSE_DATA = {');
}

// 2. 插入 foraging 初始化到 livestock 后面
const livestockInit = '        livestock: {';
if (html.includes(livestockInit) && !html.includes('foraging: {')) {
    // 找到 livestock 的结束位置
    const livestockInitEnd = '        },\n\n        npcMilestones:';
    html = html.replace(livestockInitEnd, '        },\n' + foragingInit + '\n        npcMilestones:');
}

// 3. 插入函数到文件末尾（在 </script> 之前）
const scriptEnd = '</script>';
html = html.replace(scriptEnd, foragingFunctions + '\n</script>');

// 4. 在侧边栏添加按钮
const sideMenu = '<div class="sidebar-tab" data-tab="livestock">🐔 禽畜养殖</div>';
const newMenuItem = '<div class="sidebar-tab" data-tab="foraging">🏞️ 后山采集</div>';
if (html.includes(sideMenu) && !html.includes('data-tab="foraging"')) {
    html = html.replace(sideMenu, sideMenu + '\n                ' + newMenuItem);
}

// 5. 在 renderPanel 中添加 foraging 分支
const livestockCase = "case 'livestock':\n            renderLivestockPanel();\n            break;";
const foragingCase = "case 'livestock':\n            renderLivestockPanel();\n            break;\n        case 'foraging':\n            renderForagingPanel();\n            break;";
if (html.includes(livestockCase) && !html.includes("case 'foraging':")) {
    html = html.replace(livestockCase, foragingCase);
}

// 6. 在 onNewDay 中重置 foraging 次数
const livestockProcess = '    // 畜牧过天\n    processLivestockDaily();';
const foragingReset = '    // 畜牧过天\n    processLivestockDaily();\n    \n    // 重置采集次数\n    if (game.foraging) game.foraging.usedToday = false;';
if (html.includes(livestockProcess) && !html.includes('重置采集次数')) {
    html = html.replace(livestockProcess, foragingReset);
}

// 7. 在 fixSaveData 中添加 foraging 兼容
const fixLivestock = '    // 补全畜牧系统';
const fixForaging = '    // 补全采集系统\n    if (!game.foraging) game.foraging = { usedToday: false };\n    \n' + fixLivestock;
if (html.includes(fixLivestock) && !html.includes('补全采集系统')) {
    html = html.replace(fixLivestock, fixForaging);
}

fs.writeFileSync(filePath, html);
console.log('采集系统插入完成');

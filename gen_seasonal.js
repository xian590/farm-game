const fs = require('fs');

// 春季事件（25个）
const springEvents = [
    { id: 'spring_rain1', name: '春雨滋润', emoji: '🌧️', desc: '下了一场小雨，庄稼不用浇水了。', effect: { stamina: 5 } },
    { id: 'spring_rain2', name: '春雨连绵', emoji: '🌦️', desc: '春雨下了好几天，地里湿气重。', effect: { stamina: -3 } },
    { id: 'spring_warm', name: '春暖花开', emoji: '🌸', desc: '天气暖和了，干活都有劲。', effect: { stamina: 8 } },
    { id: 'spring_market', name: '农资打折', emoji: '🏪', desc: '镇上农资店打折，种子化肥便宜了不少。', effect: { money: -10, seedBonus: 1 } },
    { id: 'spring_dig', name: '上山挖野菜', emoji: '🥬', desc: '后山野菜长出来了，采了不少。', effect: { foragingItems: { '野菜': 3 } } },
    { id: 'spring_delivery', name: '快递生鲜', emoji: '📦', desc: '网上买的菜苗到了，种下去试试。', effect: { money: -15, yieldBonus: 0.05 } },
    { id: 'spring_wind', name: '春风吹', emoji: '💨', desc: '春风有点大，晾的衣服吹跑了。', effect: { stamina: -2 } },
    { id: 'spring_bird', name: '燕子筑巢', emoji: '🐦', desc: '屋檐下燕子来筑巢了，好兆头。', effect: { mood: 5 } },
    { id: 'spring_flower', name: '野花开了', emoji: '🌼', desc: '田边开满了野花，看着心情好。', effect: { stamina: 3 } },
    { id: 'spring_sneeze', name: '花粉过敏', emoji: '🤧', desc: '花粉太多了，打喷嚏打个不停。', effect: { health: -2 } },
    { id: 'spring_neighbor', name: '邻居送菜苗', emoji: '🌱', desc: '隔壁老李送了几棵菜苗。', effect: { money: 5 } },
    { id: 'spring_frog', name: '青蛙叫', emoji: '🐸', desc: '夜里青蛙叫得欢，夏天要来了。', effect: { mood: 3 } },
    { id: 'spring_mud', name: '地里泥泞', emoji: '🥾', desc: '春雨过后地里泥泞，走路费劲。', effect: { stamina: -5 } },
    { id: 'spring_sun', name: '艳阳天', emoji: '☀️', desc: '大晴天，晒被子正好。', effect: { stamina: 5 } },
    { id: 'sprinwater', name: '井水上涨', emoji: '💧', desc: '春天井水上涨，浇地方便多了。', effect: { stamina: 3 } },
    { id: 'spring_insect', name: '虫子多了', emoji: '🐛', desc: '天气暖和虫子开始活跃，要注意除虫。', effect: { yieldLoss: 0.02 } },
    { id: 'spring_seed', name: '种子发芽', emoji: '🌱', desc: '播下去的种子发芽了，嫩绿嫩绿的。', effect: { mood: 5 } },
    { id: 'spring_cloud', name: '阴天', emoji: '☁️', desc: '阴天不晒，适合下地干活。', effect: { stamina: 3 } },
    { id: 'spring_dew', name: '露水重', emoji: '💧', desc: '早上露水重，裤脚全湿了。', effect: { stamina: -2 } },
    { id: 'spring_breeze', name: '微风拂面', emoji: '🍃', desc: '微风拂面，干活不热。', effect: { stamina: 5 } },
    { id: 'spring_rainbow', name: '雨后彩虹', emoji: '🌈', desc: '雨过天晴，天边挂了一道彩虹。', effect: { mood: 10 } },
    { id: 'spring_mudskip', name: '跳过泥泞', emoji: '🏃', desc: '巧妙地绕过泥泞地块，省了不少体力。', effect: { stamina: 5 } },
    { id: 'spring_pest', name: '蚜虫出现', emoji: '🐜', desc: '作物上出现了蚜虫，需要处理。', effect: { yieldLoss: 0.03 } },
    { id: 'spring_warmnight', name: '暖夜', emoji: '🌙', desc: '春夜温暖，睡了个好觉。', effect: { health: 3 } },
    { id: 'spring_mulch', name: '覆盖膜', emoji: '🛡️', desc: '给地里铺了覆盖膜，保温保湿。', effect: { yieldBonus: 0.03 } }
];

// 夏季事件（25个）
const summerEvents = [
    { id: 'summer_rain1', name: '暴雨', emoji: '⛈️', desc: '下暴雨了，今天不用浇水。', effect: { stamina: 5 } },
    { id: 'summer_rain2', name: '雷阵雨', emoji: '🌩️', desc: '雷阵雨来得快，赶紧跑回家。', effect: { stamina: -3 } },
    { id: 'summer_hot', name: '高温', emoji: '🔥', desc: '正午高温，干活汗流浃背。', effect: { stamina: -10, health: -2 } },
    { id: 'summer_cool', name: '傍晚乘凉', emoji: '🌅', desc: '傍晚坐在院子里乘凉，舒服。', effect: { stamina: 5, mood: 5 } },
    { id: 'summer_mosquito', name: '蚊子多', emoji: '🦟', desc: '夏天蚊子太多了，咬了一身包。', effect: { health: -2, mood: -3 } },
    { id: 'summer_watermelon', name: '吃西瓜', emoji: '🍉', desc: '镇上买的西瓜，冰镇后甜。', effect: { stamina: 10, money: -3 } },
    { id: 'summer_drought', name: '干旱', emoji: '☀️', desc: '连续晴天，地里缺水。', effect: { yieldLoss: 0.05 } },
    { id: 'summer_cicada', name: '蝉鸣', emoji: '🦗', desc: '知了叫个不停，夏天真的来了。', effect: { mood: 3 } },
    { id: 'summer_storm', name: '暴风雨', emoji: '🌪️', desc: '暴风雨吹倒了几株作物。', effect: { yieldLoss: 0.08 } },
    { id: 'summer_night', name: '夏夜', emoji: '✨', desc: '夏夜星空璀璨，在院子里看星星。', effect: { mood: 5 } },
    { id: 'summer_pool', name: '河沟水满', emoji: '💧', desc: '河沟水满了，引水浇地方便。', effect: { stamina: 3 } },
    { id: 'summer_ice', name: '买冰棍', emoji: '🍦', desc: '热得受不了，去小卖部买冰棍。', effect: { stamina: 5, money: -2, mood: 5 } },
    { id: 'summer_fruit', name: '野果成熟', emoji: '🍇', desc: '后山野果熟了，摘了不少。', effect: { foragingItems: { '树莓': 2 } } },
    { id: 'summer_fan', name: '电扇坏了', emoji: '🔧', desc: '电扇坏了，热得睡不着。', effect: { health: -2, money: -10 } },
    { id: 'summer_shade', name: '搭凉棚', emoji: '⛺', desc: '在院子里搭了个凉棚，纳凉用。', effect: { stamina: 5 } },
    { id: 'summer_flood', name: '积水', emoji: '💧', desc: '雨后地里积水，要排水。', effect: { stamina: -8 } },
    { id: 'summer_sunburn', name: '晒伤', emoji: '☀️', desc: '太阳太毒，晒得皮肤疼。', effect: { health: -3 } },
    { id: 'summer_fishing', name: '夜钓', emoji: '🎣', desc: '晚上去河边钓鱼，收获不错。', effect: { items: { fish: 2 } } },
    { id: 'summer_raincool', name: '雨后凉爽', emoji: '🌦️', desc: '雨后天气凉爽，干活正好。', effect: { stamina: 8 } },
    { id: 'summer_bug', name: '虫害', emoji: '🐛', desc: '夏季虫害严重，需要喷药。', effect: { yieldLoss: 0.05 } },
    { id: 'summer_nap', name: '午休', emoji: '😴', desc: '夏天午后犯困，小憩一会儿。', effect: { stamina: 5 } },
    { id: 'summer_stormprep', name: '防台风', emoji: '🛡️', desc: '听说有台风，加固了棚子。', effect: { stamina: -5 } },
    { id: 'summer_firefly', name: '萤火虫', emoji: '✨', desc: '夜里看到了萤火虫，美。', effect: { mood: 5 } },
    { id: 'summer_drink', name: '凉茶', emoji: '🍵', desc: '煮了锅凉茶，解暑。', effect: { health: 3 } },
    { id: 'summer_harvest', name: '早稻收割', emoji: '🌾', desc: '早稻熟了，开始收割。', effect: { yieldBonus: 0.05 } }
];

// 秋季事件（25个）
const autumnEvents = [
    { id: 'autumn_harvest', name: '秋收', emoji: '🌾', desc: '秋天到了，作物增产。', effect: { yieldBonus: 0.1 } },
    { id: 'autumn_price', name: '收购价上涨', emoji: '💰', desc: '粮商来收粮，价格比往常高。', effect: { sellBonus: 0.15 } },
    { id: 'autumn_chestnut', name: '捡板栗', emoji: '🌰', desc: '后山板栗熟了，捡了不少。', effect: { foragingItems: { '板栗': 3 } } },
    { id: 'autumn_cool', name: '秋高气爽', emoji: '🍂', desc: '天气凉爽，干活正好。', effect: { stamina: 5 } },
    { id: 'autumn_frost', name: '霜降', emoji: '❄️', desc: '早上结霜了，作物受影响。', effect: { yieldLoss: 0.05 } },
    { id: 'autumn_wind', name: '秋风', emoji: '🍃', desc: '秋风送爽，干活不热。', effect: { stamina: 3 } },
    { id: 'autumn_dry', name: '天干物燥', emoji: '🔥', desc: '秋天干燥，要注意防火。', effect: { health: -2 } },
    { id: 'autumn_moon', name: '中秋月圆', emoji: '🌕', desc: '中秋节，村里人聚一起吃月饼。', effect: { mood: 10, money: -5 } },
    { id: 'autumn_fog', name: '晨雾', emoji: '🌫️', desc: '早上大雾，能见度低。', effect: { stamina: -3 } },
    { id: 'autumn_leaves', name: '落叶', emoji: '🍂', desc: '树叶黄了落了，院子要扫。', effect: { stamina: -5 } },
    { id: 'autumn_grape', name: '野葡萄', emoji: '🍇', desc: '后山野葡萄熟了，酸甜可口。', effect: { foragingItems: { '野葡萄': 2 } } },
    { id: 'autumn_sun', name: '秋阳', emoji: '☀️', desc: '秋日暖阳，晒谷子正好。', effect: { yieldBonus: 0.03 } },
    { id: 'autumn_sweater', name: '加衣服', emoji: '🧥', desc: '天凉了，翻出厚衣服。', effect: { health: 2 } },
    { id: 'autumn_rain', name: '秋雨', emoji: '🌧️', desc: '秋雨绵绵，出门不方便。', effect: { stamina: -3 } },
    { id: 'autumn_apple', name: '野苹果', emoji: '🍎', desc: '后山野苹果熟了，摘了几个。', effect: { foragingItems: { '野苹果': 2 } } },
    { id: 'autumn_drycrop', name: '晒秋', emoji: '🌾', desc: '把收获的作物晒一晒，防霉。', effect: { yieldBonus: 0.05 } },
    { id: 'autumn_spider', name: '蜘蛛结网', emoji: '🕷️', desc: '屋檐下蜘蛛结了网，要清理。', effect: { stamina: -2 } },
    { id: 'autumn_mooncake', name: '自制月饼', emoji: '🥮', desc: '用存的材料做了月饼，省钱。', effect: { money: -3, mood: 5 } },
    { id: 'autumn_fire', name: '烧秸秆', emoji: '🔥', desc: '烧了秸秆做肥料，但熏人。', effect: { health: -2 } },
    { id: 'autumn_squirrel', name: '松鼠储粮', emoji: '🐿️', desc: '看到松鼠在存粮，冬天要来了。', effect: { mood: 3 } },
    { id: 'autumn_potato', name: '挖红薯', emoji: '🍠', desc: '红薯熟了，挖出来晒。', effect: { crops: { sweet: 5 } } },
    { id: 'autumn_windfall', name: '掉落的果子', emoji: '🍎', desc: '风吹落了不少果子，捡了。', effect: { foragingItems: { '野果': 3 } } },
    { id: 'autumn_night', name: '秋夜凉', emoji: '🌙', desc: '秋夜凉了，盖厚被子。', effect: { health: 3 } },
    { id: 'autumn_thanks', name: '丰收感恩', emoji: '🙏', desc: '丰收了，心里感恩。', effect: { mood: 5 } },
    { id: 'autumn_prep', name: '冬藏准备', emoji: '📦', desc: '开始准备冬藏的物资。', effect: { stamina: -3 } }
];

// 冬季事件（25个）
const winterEvents = [
    { id: 'winter_snow', name: '下雪', emoji: '❄️', desc: '下雪了，不用下地干活。', effect: { stamina: 5 } },
    { id: 'winter_snow2', name: '大雪', emoji: '🌨️', desc: '大雪封门，出不了门。', effect: { stamina: 3, yieldLoss: 0.03 } },
    { id: 'winter_fire', name: '烤火', emoji: '🔥', desc: '在屋里烤火，暖和。', effect: { health: 3, stamina: 3 } },
    { id: 'winter_cold', name: '寒潮', emoji: '🥶', desc: '寒潮来袭，冷得发抖。', effect: { health: -3, stamina: -5 } },
    { id: 'winter_market', name: '赶集', emoji: '🏪', desc: '乡镇赶集，买了些年货。', effect: { money: -10, mood: 5 } },
    { id: 'winter_sausage', name: '灌香肠', emoji: '🥩', desc: '冬天灌香肠，准备过年。', effect: { money: -5, mood: 5 } },
    { id: 'winter_ice', name: '结冰', emoji: '🧊', desc: '水管结冰了，取水困难。', effect: { stamina: -5 } },
    { id: 'winter_sun', name: '冬日暖阳', emoji: '☀️', desc: '冬天出太阳，搬凳子晒。', effect: { health: 3 } },
    { id: 'winter_lazy', name: '猫冬', emoji: '😴', desc: '冬天农闲，躺平休息。', effect: { stamina: 10, mood: 5 } },
    { id: 'winter_repair', name: '修房子', emoji: '🔨', desc: '趁着冬天修修房子。', effect: { money: -10, stamina: -5 } },
    { id: 'winter_fish', name: '冰钓', emoji: '🎣', desc: '河面结冰，凿冰钓鱼。', effect: { stamina: -10, items: { fish: 1 } } },
    { id: 'winter_soup', name: '煲汤', emoji: '🍲', desc: '煲了一锅汤，暖胃。', effect: { health: 5, money: -3 } },
    { id: 'winter_wind', name: '北风', emoji: '💨', desc: '北风呼呼吹，窗户漏风。', effect: { health: -2 } },
    { id: 'winter_dumpling', name: '包饺子', emoji: '🥟', desc: '冬天包饺子，热乎。', effect: { mood: 5, money: -3 } },
    { id: 'winter_coal', name: '买煤', emoji: '⛽', desc: '冬天买煤取暖，费钱。', effect: { money: -15 } },
    { id: 'winter_snowman', name: '堆雪人', emoji: '⛄', desc: '下雪了，堆了个雪人。', effect: { mood: 5 } },
    { id: 'winter_blanket', name: '厚被子', emoji: '🛏️', desc: '翻出厚被子，晚上不冷。', effect: { health: 3 } },
    { id: 'winter_snowshovel', name: '铲雪', emoji: '❄️', desc: '门口雪太厚，铲了半天。', effect: { stamina: -8 } },
    { id: 'winter_tea', name: '热茶', emoji: '☕', desc: '泡了杯热茶，暖和。', effect: { stamina: 5 } },
    { id: 'winter_frost', name: '霜冻', emoji: '🧊', desc: '霜冻严重，作物受损。', effect: { yieldLoss: 0.08 } },
    { id: 'winter_prep', name: '备年货', emoji: '📦', desc: '开始准备过年的年货。', effect: { money: -10, mood: 5 } },
    { id: 'winter_chicken', name: '杀鸡', emoji: '🐔', desc: '过年杀鸡，准备年夜饭。', effect: { livestock: { chickens: -1 }, mood: 5 } },
    { id: 'winter_lantern', name: '挂灯笼', emoji: '🏮', desc: '快过年了，挂灯笼喜庆。', effect: { mood: 5 } },
    { id: 'winter_firewood', name: '劈柴', emoji: '🪵', desc: '冬天劈柴备足燃料。', effect: { stamina: -8, foragingItems: { '柴火': 3 } } },
    { id: 'winter_hibernate', name: '冬眠', emoji: '🐻', desc: '冬天像熊一样冬眠，存体力。', effect: { stamina: 15, health: 5 } }
];

function generateEventCode(event, season) {
    const effectLines = [];
    for (const [key, val] of Object.entries(event.effect)) {
        if (key === 'foragingItems') {
            for (const [item, amount] of Object.entries(val)) {
                effectLines.push(`            if (!game.foragingItems) game.foragingItems = {};`);
                effectLines.push(`            game.foragingItems['${item}'] = (game.foragingItems['${item}'] || 0) + ${amount};`);
            }
        } else if (key === 'items') {
            for (const [item, amount] of Object.entries(val)) {
                effectLines.push(`            if (!game.items) game.items = {};`);
                effectLines.push(`            game.items.${item} = (game.items.${item} || 0) + ${amount};`);
            }
        } else if (key === 'crops') {
            for (const [crop, amount] of Object.entries(val)) {
                effectLines.push(`            game.crops.${crop} = (game.crops.${crop} || 0) + ${amount};`);
            }
        } else if (key === 'livestock') {
            for (const [animal, amount] of Object.entries(val)) {
                effectLines.push(`            if (game.livestock && game.livestock.${animal}) {`);
                effectLines.push(`                // ${animal} 数量变化: ${amount}`);
                effectLines.push(`            }`);
            }
        } else if (key === 'stamina' || key === 'health' || key === 'money' || key === 'mood') {
            if (val > 0) {
                effectLines.push(`            game.${key} = Math.min(game.max${key.charAt(0).toUpperCase() + key.slice(1)}, game.${key} + ${val});`);
            } else {
                effectLines.push(`            game.${key} = Math.max(0, game.${key} + ${val});`);
            }
        } else if (key === 'yieldBonus' || key === 'yieldLoss' || key === 'sellBonus') {
            effectLines.push(`            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.${key} = (f.${key} || 0) + ${val}; } });`);
        } else if (key === 'seedBonus') {
            effectLines.push(`            // 种子奖励: ${val}`);
        } else {
            effectLines.push(`            game.${key} = (game.${key} || 0) + ${val};`);
        }
    }
    
    const effectStr = effectLines.length > 0 ? effectLines.join('\n') : '            // 无直接效果';
    
    return `    ${event.id}: {
        id: '${event.id}',
        name: '${event.name}',
        emoji: '${event.emoji}',
        season: '${season}',
        description: '${event.desc}',
        effect: function() {
${effectStr}
        }
    },`;
}

let code = '// ==================== 季节限定事件 ====================\nconst SEASONAL_EVENTS = {\n';

springEvents.forEach(e => code += generateEventCode(e, 'spring') + '\n');
summerEvents.forEach(e => code += generateEventCode(e, 'summer') + '\n');
autumnEvents.forEach(e => code += generateEventCode(e, 'autumn') + '\n');
winterEvents.forEach(e => code += generateEventCode(e, 'winter') + '\n');

code += '};\n';

// 添加触发函数
code += `
// 检查季节事件
function checkSeasonalEvent() {
    if (Math.random() > 0.30) return; // 30%概率触发
    
    const available = Object.values(SEASONAL_EVENTS).filter(e => e.season === game.season);
    if (available.length === 0) return;
    
    const event = available[Math.floor(Math.random() * available.length)];
    
    addLog(event.emoji + ' ' + event.name + '：' + event.description, 'info');
    event.effect();
    
    saveGame();
    updateUI();
}
`;

fs.writeFileSync('C:/Users/Administrator/Documents/kimi/workspace/seasonal_events.js', code);
console.log('Generated', springEvents.length + summerEvents.length + autumnEvents.length + winterEvents.length, 'seasonal events');
console.log('File size:', code.length, 'chars');

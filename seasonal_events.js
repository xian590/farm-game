// ==================== 季节限定事件 ====================
const SEASONAL_EVENTS = {
    spring_rain1: {
        id: 'spring_rain1',
        name: '春雨滋润',
        emoji: '🌧️',
        season: 'spring',
        description: '下了一场小雨，庄稼不用浇水了。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    spring_rain2: {
        id: 'spring_rain2',
        name: '春雨连绵',
        emoji: '🌦️',
        season: 'spring',
        description: '春雨下了好几天，地里湿气重。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -3);
        }
    },
    spring_warm: {
        id: 'spring_warm',
        name: '春暖花开',
        emoji: '🌸',
        season: 'spring',
        description: '天气暖和了，干活都有劲。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 8);
        }
    },
    spring_market: {
        id: 'spring_market',
        name: '农资打折',
        emoji: '🏪',
        season: 'spring',
        description: '镇上农资店打折，种子化肥便宜了不少。',
        effect: function() {
            game.money = Math.max(0, game.money + -10);
            // 种子奖励: 1
        }
    },
    spring_dig: {
        id: 'spring_dig',
        name: '上山挖野菜',
        emoji: '🥬',
        season: 'spring',
        description: '后山野菜长出来了，采了不少。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['野菜'] = (game.foragingItems['野菜'] || 0) + 3;
        }
    },
    spring_delivery: {
        id: 'spring_delivery',
        name: '快递生鲜',
        emoji: '📦',
        season: 'spring',
        description: '网上买的菜苗到了，种下去试试。',
        effect: function() {
            game.money = Math.max(0, game.money + -15);
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.05; } });
        }
    },
    spring_wind: {
        id: 'spring_wind',
        name: '春风吹',
        emoji: '💨',
        season: 'spring',
        description: '春风有点大，晾的衣服吹跑了。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -2);
        }
    },
    spring_bird: {
        id: 'spring_bird',
        name: '燕子筑巢',
        emoji: '🐦',
        season: 'spring',
        description: '屋檐下燕子来筑巢了，好兆头。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    spring_flower: {
        id: 'spring_flower',
        name: '野花开了',
        emoji: '🌼',
        season: 'spring',
        description: '田边开满了野花，看着心情好。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    spring_sneeze: {
        id: 'spring_sneeze',
        name: '花粉过敏',
        emoji: '🤧',
        season: 'spring',
        description: '花粉太多了，打喷嚏打个不停。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
        }
    },
    spring_neighbor: {
        id: 'spring_neighbor',
        name: '邻居送菜苗',
        emoji: '🌱',
        season: 'spring',
        description: '隔壁老李送了几棵菜苗。',
        effect: function() {
            game.money = Math.min(game.maxMoney, game.money + 5);
        }
    },
    spring_frog: {
        id: 'spring_frog',
        name: '青蛙叫',
        emoji: '🐸',
        season: 'spring',
        description: '夜里青蛙叫得欢，夏天要来了。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 3);
        }
    },
    spring_mud: {
        id: 'spring_mud',
        name: '地里泥泞',
        emoji: '🥾',
        season: 'spring',
        description: '春雨过后地里泥泞，走路费劲。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    spring_sun: {
        id: 'spring_sun',
        name: '艳阳天',
        emoji: '☀️',
        season: 'spring',
        description: '大晴天，晒被子正好。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    sprinwater: {
        id: 'sprinwater',
        name: '井水上涨',
        emoji: '💧',
        season: 'spring',
        description: '春天井水上涨，浇地方便多了。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    spring_insect: {
        id: 'spring_insect',
        name: '虫子多了',
        emoji: '🐛',
        season: 'spring',
        description: '天气暖和虫子开始活跃，要注意除虫。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.02; } });
        }
    },
    spring_seed: {
        id: 'spring_seed',
        name: '种子发芽',
        emoji: '🌱',
        season: 'spring',
        description: '播下去的种子发芽了，嫩绿嫩绿的。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    spring_cloud: {
        id: 'spring_cloud',
        name: '阴天',
        emoji: '☁️',
        season: 'spring',
        description: '阴天不晒，适合下地干活。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    spring_dew: {
        id: 'spring_dew',
        name: '露水重',
        emoji: '💧',
        season: 'spring',
        description: '早上露水重，裤脚全湿了。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -2);
        }
    },
    spring_breeze: {
        id: 'spring_breeze',
        name: '微风拂面',
        emoji: '🍃',
        season: 'spring',
        description: '微风拂面，干活不热。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    spring_rainbow: {
        id: 'spring_rainbow',
        name: '雨后彩虹',
        emoji: '🌈',
        season: 'spring',
        description: '雨过天晴，天边挂了一道彩虹。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 10);
        }
    },
    spring_mudskip: {
        id: 'spring_mudskip',
        name: '跳过泥泞',
        emoji: '🏃',
        season: 'spring',
        description: '巧妙地绕过泥泞地块，省了不少体力。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    spring_pest: {
        id: 'spring_pest',
        name: '蚜虫出现',
        emoji: '🐜',
        season: 'spring',
        description: '作物上出现了蚜虫，需要处理。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.03; } });
        }
    },
    spring_warmnight: {
        id: 'spring_warmnight',
        name: '暖夜',
        emoji: '🌙',
        season: 'spring',
        description: '春夜温暖，睡了个好觉。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
        }
    },
    spring_mulch: {
        id: 'spring_mulch',
        name: '覆盖膜',
        emoji: '🛡️',
        season: 'spring',
        description: '给地里铺了覆盖膜，保温保湿。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.03; } });
        }
    },
    summer_rain1: {
        id: 'summer_rain1',
        name: '暴雨',
        emoji: '⛈️',
        season: 'summer',
        description: '下暴雨了，今天不用浇水。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    summer_rain2: {
        id: 'summer_rain2',
        name: '雷阵雨',
        emoji: '🌩️',
        season: 'summer',
        description: '雷阵雨来得快，赶紧跑回家。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -3);
        }
    },
    summer_hot: {
        id: 'summer_hot',
        name: '高温',
        emoji: '🔥',
        season: 'summer',
        description: '正午高温，干活汗流浃背。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -10);
            game.health = Math.max(0, game.health + -2);
        }
    },
    summer_cool: {
        id: 'summer_cool',
        name: '傍晚乘凉',
        emoji: '🌅',
        season: 'summer',
        description: '傍晚坐在院子里乘凉，舒服。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    summer_mosquito: {
        id: 'summer_mosquito',
        name: '蚊子多',
        emoji: '🦟',
        season: 'summer',
        description: '夏天蚊子太多了，咬了一身包。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
            game.mood = Math.max(0, game.mood + -3);
        }
    },
    summer_watermelon: {
        id: 'summer_watermelon',
        name: '吃西瓜',
        emoji: '🍉',
        season: 'summer',
        description: '镇上买的西瓜，冰镇后甜。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 10);
            game.money = Math.max(0, game.money + -3);
        }
    },
    summer_drought: {
        id: 'summer_drought',
        name: '干旱',
        emoji: '☀️',
        season: 'summer',
        description: '连续晴天，地里缺水。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.05; } });
        }
    },
    summer_cicada: {
        id: 'summer_cicada',
        name: '蝉鸣',
        emoji: '🦗',
        season: 'summer',
        description: '知了叫个不停，夏天真的来了。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 3);
        }
    },
    summer_storm: {
        id: 'summer_storm',
        name: '暴风雨',
        emoji: '🌪️',
        season: 'summer',
        description: '暴风雨吹倒了几株作物。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.08; } });
        }
    },
    summer_night: {
        id: 'summer_night',
        name: '夏夜',
        emoji: '✨',
        season: 'summer',
        description: '夏夜星空璀璨，在院子里看星星。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    summer_pool: {
        id: 'summer_pool',
        name: '河沟水满',
        emoji: '💧',
        season: 'summer',
        description: '河沟水满了，引水浇地方便。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    summer_ice: {
        id: 'summer_ice',
        name: '买冰棍',
        emoji: '🍦',
        season: 'summer',
        description: '热得受不了，去小卖部买冰棍。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
            game.money = Math.max(0, game.money + -2);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    summer_fruit: {
        id: 'summer_fruit',
        name: '野果成熟',
        emoji: '🍇',
        season: 'summer',
        description: '后山野果熟了，摘了不少。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['树莓'] = (game.foragingItems['树莓'] || 0) + 2;
        }
    },
    summer_fan: {
        id: 'summer_fan',
        name: '电扇坏了',
        emoji: '🔧',
        season: 'summer',
        description: '电扇坏了，热得睡不着。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
            game.money = Math.max(0, game.money + -10);
        }
    },
    summer_shade: {
        id: 'summer_shade',
        name: '搭凉棚',
        emoji: '⛺',
        season: 'summer',
        description: '在院子里搭了个凉棚，纳凉用。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    summer_flood: {
        id: 'summer_flood',
        name: '积水',
        emoji: '💧',
        season: 'summer',
        description: '雨后地里积水，要排水。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -8);
        }
    },
    summer_sunburn: {
        id: 'summer_sunburn',
        name: '晒伤',
        emoji: '☀️',
        season: 'summer',
        description: '太阳太毒，晒得皮肤疼。',
        effect: function() {
            game.health = Math.max(0, game.health + -3);
        }
    },
    summer_fishing: {
        id: 'summer_fishing',
        name: '夜钓',
        emoji: '🎣',
        season: 'summer',
        description: '晚上去河边钓鱼，收获不错。',
        effect: function() {
            if (!game.items) game.items = {};
            game.items.fish = (game.items.fish || 0) + 2;
        }
    },
    summer_raincool: {
        id: 'summer_raincool',
        name: '雨后凉爽',
        emoji: '🌦️',
        season: 'summer',
        description: '雨后天气凉爽，干活正好。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 8);
        }
    },
    summer_bug: {
        id: 'summer_bug',
        name: '虫害',
        emoji: '🐛',
        season: 'summer',
        description: '夏季虫害严重，需要喷药。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.05; } });
        }
    },
    summer_nap: {
        id: 'summer_nap',
        name: '午休',
        emoji: '😴',
        season: 'summer',
        description: '夏天午后犯困，小憩一会儿。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    summer_stormprep: {
        id: 'summer_stormprep',
        name: '防台风',
        emoji: '🛡️',
        season: 'summer',
        description: '听说有台风，加固了棚子。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    summer_firefly: {
        id: 'summer_firefly',
        name: '萤火虫',
        emoji: '✨',
        season: 'summer',
        description: '夜里看到了萤火虫，美。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    summer_drink: {
        id: 'summer_drink',
        name: '凉茶',
        emoji: '🍵',
        season: 'summer',
        description: '煮了锅凉茶，解暑。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
        }
    },
    summer_harvest: {
        id: 'summer_harvest',
        name: '早稻收割',
        emoji: '🌾',
        season: 'summer',
        description: '早稻熟了，开始收割。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.05; } });
        }
    },
    autumn_harvest: {
        id: 'autumn_harvest',
        name: '秋收',
        emoji: '🌾',
        season: 'autumn',
        description: '秋天到了，作物增产。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.1; } });
        }
    },
    autumn_price: {
        id: 'autumn_price',
        name: '收购价上涨',
        emoji: '💰',
        season: 'autumn',
        description: '粮商来收粮，价格比往常高。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.sellBonus = (f.sellBonus || 0) + 0.15; } });
        }
    },
    autumn_chestnut: {
        id: 'autumn_chestnut',
        name: '捡板栗',
        emoji: '🌰',
        season: 'autumn',
        description: '后山板栗熟了，捡了不少。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['板栗'] = (game.foragingItems['板栗'] || 0) + 3;
        }
    },
    autumn_cool: {
        id: 'autumn_cool',
        name: '秋高气爽',
        emoji: '🍂',
        season: 'autumn',
        description: '天气凉爽，干活正好。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    autumn_frost: {
        id: 'autumn_frost',
        name: '霜降',
        emoji: '❄️',
        season: 'autumn',
        description: '早上结霜了，作物受影响。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.05; } });
        }
    },
    autumn_wind: {
        id: 'autumn_wind',
        name: '秋风',
        emoji: '🍃',
        season: 'autumn',
        description: '秋风送爽，干活不热。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    autumn_dry: {
        id: 'autumn_dry',
        name: '天干物燥',
        emoji: '🔥',
        season: 'autumn',
        description: '秋天干燥，要注意防火。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
        }
    },
    autumn_moon: {
        id: 'autumn_moon',
        name: '中秋月圆',
        emoji: '🌕',
        season: 'autumn',
        description: '中秋节，村里人聚一起吃月饼。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 10);
            game.money = Math.max(0, game.money + -5);
        }
    },
    autumn_fog: {
        id: 'autumn_fog',
        name: '晨雾',
        emoji: '🌫️',
        season: 'autumn',
        description: '早上大雾，能见度低。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -3);
        }
    },
    autumn_leaves: {
        id: 'autumn_leaves',
        name: '落叶',
        emoji: '🍂',
        season: 'autumn',
        description: '树叶黄了落了，院子要扫。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    autumn_grape: {
        id: 'autumn_grape',
        name: '野葡萄',
        emoji: '🍇',
        season: 'autumn',
        description: '后山野葡萄熟了，酸甜可口。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['野葡萄'] = (game.foragingItems['野葡萄'] || 0) + 2;
        }
    },
    autumn_sun: {
        id: 'autumn_sun',
        name: '秋阳',
        emoji: '☀️',
        season: 'autumn',
        description: '秋日暖阳，晒谷子正好。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.03; } });
        }
    },
    autumn_sweater: {
        id: 'autumn_sweater',
        name: '加衣服',
        emoji: '🧥',
        season: 'autumn',
        description: '天凉了，翻出厚衣服。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 2);
        }
    },
    autumn_rain: {
        id: 'autumn_rain',
        name: '秋雨',
        emoji: '🌧️',
        season: 'autumn',
        description: '秋雨绵绵，出门不方便。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -3);
        }
    },
    autumn_apple: {
        id: 'autumn_apple',
        name: '野苹果',
        emoji: '🍎',
        season: 'autumn',
        description: '后山野苹果熟了，摘了几个。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['野苹果'] = (game.foragingItems['野苹果'] || 0) + 2;
        }
    },
    autumn_drycrop: {
        id: 'autumn_drycrop',
        name: '晒秋',
        emoji: '🌾',
        season: 'autumn',
        description: '把收获的作物晒一晒，防霉。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldBonus = (f.yieldBonus || 0) + 0.05; } });
        }
    },
    autumn_spider: {
        id: 'autumn_spider',
        name: '蜘蛛结网',
        emoji: '🕷️',
        season: 'autumn',
        description: '屋檐下蜘蛛结了网，要清理。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -2);
        }
    },
    autumn_mooncake: {
        id: 'autumn_mooncake',
        name: '自制月饼',
        emoji: '🥮',
        season: 'autumn',
        description: '用存的材料做了月饼，省钱。',
        effect: function() {
            game.money = Math.max(0, game.money + -3);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    autumn_fire: {
        id: 'autumn_fire',
        name: '烧秸秆',
        emoji: '🔥',
        season: 'autumn',
        description: '烧了秸秆做肥料，但熏人。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
        }
    },
    autumn_squirrel: {
        id: 'autumn_squirrel',
        name: '松鼠储粮',
        emoji: '🐿️',
        season: 'autumn',
        description: '看到松鼠在存粮，冬天要来了。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 3);
        }
    },
    autumn_potato: {
        id: 'autumn_potato',
        name: '挖红薯',
        emoji: '🍠',
        season: 'autumn',
        description: '红薯熟了，挖出来晒。',
        effect: function() {
            game.crops.sweet = (game.crops.sweet || 0) + 5;
        }
    },
    autumn_windfall: {
        id: 'autumn_windfall',
        name: '掉落的果子',
        emoji: '🍎',
        season: 'autumn',
        description: '风吹落了不少果子，捡了。',
        effect: function() {
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['野果'] = (game.foragingItems['野果'] || 0) + 3;
        }
    },
    autumn_night: {
        id: 'autumn_night',
        name: '秋夜凉',
        emoji: '🌙',
        season: 'autumn',
        description: '秋夜凉了，盖厚被子。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
        }
    },
    autumn_thanks: {
        id: 'autumn_thanks',
        name: '丰收感恩',
        emoji: '🙏',
        season: 'autumn',
        description: '丰收了，心里感恩。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    autumn_prep: {
        id: 'autumn_prep',
        name: '冬藏准备',
        emoji: '📦',
        season: 'autumn',
        description: '开始准备冬藏的物资。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -3);
        }
    },
    winter_snow: {
        id: 'winter_snow',
        name: '下雪',
        emoji: '❄️',
        season: 'winter',
        description: '下雪了，不用下地干活。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    winter_snow2: {
        id: 'winter_snow2',
        name: '大雪',
        emoji: '🌨️',
        season: 'winter',
        description: '大雪封门，出不了门。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.03; } });
        }
    },
    winter_fire: {
        id: 'winter_fire',
        name: '烤火',
        emoji: '🔥',
        season: 'winter',
        description: '在屋里烤火，暖和。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
            game.stamina = Math.min(game.maxStamina, game.stamina + 3);
        }
    },
    winter_cold: {
        id: 'winter_cold',
        name: '寒潮',
        emoji: '🥶',
        season: 'winter',
        description: '寒潮来袭，冷得发抖。',
        effect: function() {
            game.health = Math.max(0, game.health + -3);
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    winter_market: {
        id: 'winter_market',
        name: '赶集',
        emoji: '🏪',
        season: 'winter',
        description: '乡镇赶集，买了些年货。',
        effect: function() {
            game.money = Math.max(0, game.money + -10);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_sausage: {
        id: 'winter_sausage',
        name: '灌香肠',
        emoji: '🥩',
        season: 'winter',
        description: '冬天灌香肠，准备过年。',
        effect: function() {
            game.money = Math.max(0, game.money + -5);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_ice: {
        id: 'winter_ice',
        name: '结冰',
        emoji: '🧊',
        season: 'winter',
        description: '水管结冰了，取水困难。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    winter_sun: {
        id: 'winter_sun',
        name: '冬日暖阳',
        emoji: '☀️',
        season: 'winter',
        description: '冬天出太阳，搬凳子晒。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
        }
    },
    winter_lazy: {
        id: 'winter_lazy',
        name: '猫冬',
        emoji: '😴',
        season: 'winter',
        description: '冬天农闲，躺平休息。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 10);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_repair: {
        id: 'winter_repair',
        name: '修房子',
        emoji: '🔨',
        season: 'winter',
        description: '趁着冬天修修房子。',
        effect: function() {
            game.money = Math.max(0, game.money + -10);
            game.stamina = Math.max(0, game.stamina + -5);
        }
    },
    winter_fish: {
        id: 'winter_fish',
        name: '冰钓',
        emoji: '🎣',
        season: 'winter',
        description: '河面结冰，凿冰钓鱼。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -10);
            if (!game.items) game.items = {};
            game.items.fish = (game.items.fish || 0) + 1;
        }
    },
    winter_soup: {
        id: 'winter_soup',
        name: '煲汤',
        emoji: '🍲',
        season: 'winter',
        description: '煲了一锅汤，暖胃。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 5);
            game.money = Math.max(0, game.money + -3);
        }
    },
    winter_wind: {
        id: 'winter_wind',
        name: '北风',
        emoji: '💨',
        season: 'winter',
        description: '北风呼呼吹，窗户漏风。',
        effect: function() {
            game.health = Math.max(0, game.health + -2);
        }
    },
    winter_dumpling: {
        id: 'winter_dumpling',
        name: '包饺子',
        emoji: '🥟',
        season: 'winter',
        description: '冬天包饺子，热乎。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
            game.money = Math.max(0, game.money + -3);
        }
    },
    winter_coal: {
        id: 'winter_coal',
        name: '买煤',
        emoji: '⛽',
        season: 'winter',
        description: '冬天买煤取暖，费钱。',
        effect: function() {
            game.money = Math.max(0, game.money + -15);
        }
    },
    winter_snowman: {
        id: 'winter_snowman',
        name: '堆雪人',
        emoji: '⛄',
        season: 'winter',
        description: '下雪了，堆了个雪人。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_blanket: {
        id: 'winter_blanket',
        name: '厚被子',
        emoji: '🛏️',
        season: 'winter',
        description: '翻出厚被子，晚上不冷。',
        effect: function() {
            game.health = Math.min(game.maxHealth, game.health + 3);
        }
    },
    winter_snowshovel: {
        id: 'winter_snowshovel',
        name: '铲雪',
        emoji: '❄️',
        season: 'winter',
        description: '门口雪太厚，铲了半天。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -8);
        }
    },
    winter_tea: {
        id: 'winter_tea',
        name: '热茶',
        emoji: '☕',
        season: 'winter',
        description: '泡了杯热茶，暖和。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 5);
        }
    },
    winter_frost: {
        id: 'winter_frost',
        name: '霜冻',
        emoji: '🧊',
        season: 'winter',
        description: '霜冻严重，作物受损。',
        effect: function() {
            game.fields.forEach(f => { if (f.crop && f.stage !== 'idle') { f.yieldLoss = (f.yieldLoss || 0) + 0.08; } });
        }
    },
    winter_prep: {
        id: 'winter_prep',
        name: '备年货',
        emoji: '📦',
        season: 'winter',
        description: '开始准备过年的年货。',
        effect: function() {
            game.money = Math.max(0, game.money + -10);
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_chicken: {
        id: 'winter_chicken',
        name: '杀鸡',
        emoji: '🐔',
        season: 'winter',
        description: '过年杀鸡，准备年夜饭。',
        effect: function() {
            if (game.livestock && game.livestock.chickens) {
                // chickens 数量变化: -1
            }
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_lantern: {
        id: 'winter_lantern',
        name: '挂灯笼',
        emoji: '🏮',
        season: 'winter',
        description: '快过年了，挂灯笼喜庆。',
        effect: function() {
            game.mood = Math.min(game.maxMood, game.mood + 5);
        }
    },
    winter_firewood: {
        id: 'winter_firewood',
        name: '劈柴',
        emoji: '🪵',
        season: 'winter',
        description: '冬天劈柴备足燃料。',
        effect: function() {
            game.stamina = Math.max(0, game.stamina + -8);
            if (!game.foragingItems) game.foragingItems = {};
            game.foragingItems['柴火'] = (game.foragingItems['柴火'] || 0) + 3;
        }
    },
    winter_hibernate: {
        id: 'winter_hibernate',
        name: '冬眠',
        emoji: '🐻',
        season: 'winter',
        description: '冬天像熊一样冬眠，存体力。',
        effect: function() {
            game.stamina = Math.min(game.maxStamina, game.stamina + 15);
            game.health = Math.min(game.maxHealth, game.health + 5);
        }
    },
};

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

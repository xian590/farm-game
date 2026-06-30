    neighborBorrow: {
        id: 'neighborBorrow',
        name: '隔壁借锄头',
        emoji: '🔧',
        type: 'human',
        seasons: ["spring","summer","autumn"],
        probability: 0.04,
        description: '隔壁李大爷过来借锄头，说要翻地。你最近也在用，但李大爷人挺好的。',
        options: [
            { text: '借给他（+3声望）', effect: { reputation: 3 }, result: '李大爷拿着锄头走了，傍晚还回来的时候擦得锃亮。' },
            { text: '说自己在用（-2声望）', effect: { reputation: -2 }, result: '李大爷点点头走了，但眼神有点失望。' },
        ]
    },
    mushroomPick: {
        id: 'mushroomPick',
        name: '后山捡蘑菇',
        emoji: '🍄',
        type: 'gain',
        seasons: ["spring","autumn"],
        probability: 0.05,
        description: '雨后后山冒出好多蘑菇，野生的，看起来挺新鲜。',
        options: [
            { text: '大胆捡回去（+15金币）', effect: { money: 15 }, result: '你捡了一大筐蘑菇，拿到镇上卖了个好价钱。' },
            { text: '只捡认识的（+5金币，+5体力）', effect: { money: 5, stamina: 5 }, result: '你小心翼翼地只捡了认识的几种，卖了个小钱，还没吃坏肚子。' },
        ]
    },
    peddler: {
        id: 'peddler',
        name: '卖货郎来了',
        emoji: '🛒',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.04,
        description: '村口来了个卖货郎，推着三轮车，卖各种杂货和小零食。',
        options: [
            { text: '买包瓜子（-5金币，+5体力）', effect: { money: -5, stamina: 5 }, result: '瓜子嗑得香，干活都有劲了。' },
            { text: '闲聊（+5声望）', effect: { reputation: 5 }, result: '你跟卖货郎聊了半天，他说下次给你带便宜化肥。' },
        ]
    },
    powerOutage: {
        id: 'powerOutage',
        name: '突然停电',
        emoji: '🔌',
        type: 'disaster',
        seasons: ["summer"],
        probability: 0.03,
        description: '村里突然停电了，水泵转不了，田里的作物快渴死了。',
        options: [
            { text: '去井里挑水（-15体力）', effect: { stamina: -15, yieldLoss: 0.03 }, result: '你挑了好几趟水，累得腰酸背痛，但庄稼保住了。' },
            { text: '等来电（减产较多）', effect: { yieldLoss: 0.08 }, result: '你等了一整天也没来电，庄稼蔫了不少。' },
        ]
    },
    henLaying: {
        id: 'henLaying',
        name: '老母鸡下蛋',
        emoji: '🥚',
        type: 'gain',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.05,
        description: '你养的母鸡今天下了个双黄蛋，个头特别大。',
        options: [
            { text: '自己吃（+15体力）', effect: { stamina: 15 }, result: '双黄蛋炒得金黄，香得很！' },
            { text: '留着卖（+5金币）', effect: { money: 5 }, result: '你小心翼翼地把蛋放进篮子，拿到村口卖了五块钱。' },
        ]
    },
    snakeInField: {
        id: 'snakeInField',
        name: '田里有蛇',
        emoji: '🐍',
        type: 'human',
        seasons: ["spring","summer","autumn"],
        probability: 0.04,
        description: '下地干活时，田埂边盘着一条蛇，一动不动，看着有点吓人。',
        options: [
            { text: '用棍子赶走它（-5体力）', effect: { stamina: -5 }, result: '你找根长棍子把蛇挑走了，出了一身汗。' },
            { text: '绕着走', effect: {}, result: '你绕了一大圈躲开它，心里有点发毛，但活还是干完了。' },
        ]
    },
    neighborHelp: {
        id: 'neighborHelp',
        name: '邻居盖房帮忙',
        emoji: '🏗️',
        type: 'human',
        seasons: ["spring","summer","autumn"],
        probability: 0.03,
        description: '老王家要盖偏房，喊你去帮忙搬砖。不去面子上过不去。',
        options: [
            { text: '去帮忙（-25体力，+10声望，+20金币）', effect: { stamina: -25, reputation: 10, money: 20 }, result: '你干了一整天，老王塞给你二十块钱，还请你吃了晚饭。' },
            { text: '说忙（-2声望）', effect: { reputation: -2 }, result: '老王点点头，但转身就嘀咕：新来的一点不上道。' },
        ]
    },
    wildRabbit: {
        id: 'wildRabbit',
        name: '野兔子',
        emoji: '🐇',
        type: 'gain',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.05,
        description: '田边草丛里窜出一只野兔，愣愣地看着你，三瓣嘴一动一动的。',
        options: [
            { text: '追！（-10体力，+5金币）', effect: { stamina: -10, money: 5 }, result: '你追了半里地，终于抓住了，拿到镇上卖了五块钱。' },
            { text: '放它走（+2声望）', effect: { reputation: 2 }, result: '兔子蹦跶着跑了，村里老人说你有善心。' },
        ]
    },
    villageMovie: {
        id: 'villageMovie',
        name: '村里放电影',
        emoji: '🎬',
        type: 'human',
        seasons: ["spring","summer","autumn"],
        probability: 0.03,
        description: '晚上村委会广场放露天电影，全村都搬着小板凳去了。',
        options: [
            { text: '去看（+10体力，+3声望）', effect: { stamina: 10, reputation: 3 }, result: '老电影看着挺带劲，旁边大爷还给你递了把瓜子。' },
            { text: '在家休息（+5体力）', effect: { stamina: 5 }, result: '你没去，在家睡了个好觉，但错过了热闹。' },
        ]
    },
    rainClothes: {
        id: 'rainClothes',
        name: '下雨收衣服',
        emoji: '👕',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.04,
        description: '突然下起雨，晾在外面的衣服还没收，再不去就淋透了。',
        options: [
            { text: '冲出去收（-5体力）', effect: { stamina: -5 }, result: '你抱着衣服跑回屋，鞋子全湿了，但衣服保住了。' },
            { text: '算了，等雨停', effect: {}, result: '雨停了，衣服湿透了，你拧了半天。' },
        ]
    },
    wildFruit: {
        id: 'wildFruit',
        name: '野果子熟了',
        emoji: '🍒',
        type: 'gain',
        seasons: ["autumn"],
        probability: 0.05,
        description: '后山的野山楂熟了，红彤彤一片，看着就酸。',
        options: [
            { text: '去摘（-10体力，+5金币）', effect: { stamina: -10, money: 5 }, result: '你摘了满满一筐，拿到镇上卖了五块钱。' },
            { text: '不摘', effect: {}, result: '你看着满山的山楂，咽了口口水，但没摘。' },
        ]
    },
    lostDog: {
        id: 'lostDog',
        name: '走丢的小狗',
        emoji: '🐕',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '田边发现一只走丢的小狗，浑身脏兮兮的，看起来饿了很久了。',
        options: [
            { text: '喂它点剩饭（+5声望）', effect: { reputation: 5 }, result: '小狗狼吞虎咽地吃完，摇着尾巴跟着你回家了。' },
            { text: '不理它', effect: {}, result: '小狗眼巴巴地看着你，你硬着心肠走开了。' },
        ]
    },
    wellWatermelon: {
        id: 'wellWatermelon',
        name: '井水冰西瓜',
        emoji: '🍉',
        type: 'gain',
        seasons: ["summer"],
        probability: 0.05,
        description: '夏天把西瓜泡在井里，凉透了，一刀切下去咔嚓响。',
        options: [
            { text: '吃（+10体力）', effect: { stamina: 10 }, result: '井水镇的西瓜又沙又甜，你一个人吃了半个。' },
            { text: '留着卖（+5金币）', effect: { money: 5 }, result: '你把西瓜拿到村口，卖给了过路的司机。' },
        ]
    },
    relativeVisit: {
        id: 'relativeVisit',
        name: '亲戚来串门',
        emoji: '🚗',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '城里亲戚开车来串门，带了一大堆东西，说来看看你过得怎么样。',
        options: [
            { text: '好好招待（-5金币，+10声望）', effect: { money: -5, reputation: 10 }, result: '你杀了一只鸡，做了一桌子菜，亲戚夸你懂事。' },
            { text: '简单招待（+5声望）', effect: { reputation: 5 }, result: '你泡了茶，切了盘黄瓜，亲戚说挺好。' },
        ]
    },
    chopWood: {
        id: 'chopWood',
        name: '上山砍柴',
        emoji: '🪓',
        type: 'human',
        seasons: ["autumn","winter"],
        probability: 0.04,
        description: '冬天快到了，得备点柴过冬。后山的柴火旺，但路不好走。',
        options: [
            { text: '上山砍柴（-20体力，+5金币）', effect: { stamina: -20, money: 5 }, result: '你砍了一担柴背回来，累得直不起腰，但够烧半个月了。' },
            { text: '不砍，买煤（-10金币，+5体力）', effect: { money: -10, stamina: 5 }, result: '你去镇上买了袋煤，省了不少力气。' },
        ]
    },
    beggar: {
        id: 'beggar',
        name: '要饭的',
        emoji: '🥣',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '村口来了个要饭的，穿得破破烂烂，手里端着个碗。',
        options: [
            { text: '给点吃的（-2kg水稻，+5声望）', effect: { crop: { key: 'rice', amount: -2 }, reputation: 5 }, result: '要饭的接过米，千恩万谢地走了。' },
            { text: '不给（-3声望）', effect: { reputation: -3 }, result: '要饭的叹了口气，慢慢走远了。村里人背后说你小气。' },
        ]
    },
    beeSwarm: {
        id: 'beeSwarm',
        name: '蜜蜂分蜂',
        emoji: '🐝',
        type: 'gain',
        seasons: ["spring","summer"],
        probability: 0.04,
        description: '村里老养蜂人的蜂箱分蜂了，蜜蜂飞得到处都是，嗡嗡嗡的。',
        options: [
            { text: '帮忙收蜂（-10体力，+5金币）', effect: { stamina: -10, money: 5 }, result: '你戴着手套帮忙把蜂收进新箱，老养蜂人给了五块钱感谢。' },
            { text: '躲远点', effect: {}, result: '你站在远处看热闹，被蛰了一个包。' },
        ]
    },
    fertilizerTruck: {
        id: 'fertilizerTruck',
        name: '化肥车来了',
        emoji: '🚚',
        type: 'human',
        seasons: ["spring","summer"],
        probability: 0.03,
        description: '镇上的化肥车来村里了，价格比商店便宜，但限购一袋。',
        options: [
            { text: '买一袋（-30金币，+2化肥）', effect: { money: -30, item_fertilizer: 2 }, result: '你扛了一袋化肥回家，够用好一阵子了。' },
            { text: '不买', effect: {}, result: '你看着别人抢购，觉得自己地里还有存货，就没买。' },
        ]
    },
    kidFall: {
        id: 'kidFall',
        name: '小孩掉沟里',
        emoji: '👶',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '村里小孩在田埂边玩耍，一不留神滑进了水沟，浑身是泥。',
        options: [
            { text: '拉上来（+5声望）', effect: { reputation: 5 }, result: '你把小孩拉上来，小孩哭着跑回家，他妈后来专门来道谢。' },
            { text: '喊大人', effect: {}, result: '你喊了几嗓子，小孩他妈跑过来把孩子捞上去了。' },
        ]
    },
    feastAfterHarvest: {
        id: 'feastAfterHarvest',
        name: '收完稻子吃顿好的',
        emoji: '🍚',
        type: 'gain',
        seasons: ["autumn"],
        probability: 0.04,
        description: '今天收完了最后一亩稻子，累坏了，但看着堆成小山的稻穗，心情特别好。',
        options: [
            { text: '做顿好的犒劳自己（-5金币，+15体力）', effect: { money: -5, stamina: 15 }, result: '你炒了盘回锅肉，焖了一锅大米饭，吃得肚子圆滚滚。' },
            { text: '简单吃点（+5体力）', effect: { stamina: 5 }, result: '你泡了碗面，三下五除二吃完，倒头就睡。' },
        ]
    },
    heavySnow: {
        id: 'heavySnow',
        name: '下大雪',
        emoji: '🌨️',
        type: 'disaster',
        seasons: ["winter"],
        probability: 0.05,
        description: '雪下了三天三夜，田里盖了半米厚的雪，菜都压住了。',
        options: [
            { text: '扫雪（-15体力）', effect: { stamina: -15, yieldLoss: 0.03 }, result: '你扫了一上午雪，手冻得通红，但菜保住了。' },
            { text: '不管（减产较多）', effect: { yieldLoss: 0.10 }, result: '雪化了以后，田里一片狼藉，菜烂了不少。' },
        ]
    },
    springFestival: {
        id: 'springFestival',
        name: '过年',
        emoji: '🧨',
        type: 'human',
        seasons: ["winter"],
        probability: 0.04,
        description: '过年了，村里放炮仗，到处都是红色的对联和窗花，热闹得很。',
        options: [
            { text: '参加（+10金币，+10声望）', effect: { money: 10, reputation: 10 }, result: '你跟村里人一起包饺子、放鞭炮，红包收了不少。' },
            { text: '在家休息（+10体力）', effect: { stamina: 10 }, result: '你一个人在家煮了碗饺子，安安静静过了一个年。' },
        ]
    },
    newYearVisit: {
        id: 'newYearVisit',
        name: '大年初一拜年',
        emoji: '🧧',
        type: 'human',
        seasons: ["winter"],
        probability: 0.03,
        description: '大年初一，村里人挨家挨户拜年，你也不例外。',
        options: [
            { text: '去拜年（+5声望，+5金币）', effect: { reputation: 5, money: 5 }, result: '你挨家挨户拜年，收了几个红包，村里人都夸你懂事。' },
            { text: '在家等人来（+3声望）', effect: { reputation: 3 }, result: '你在家等着，来了几个人拜年，聊得挺开心。' },
        ]
    },
    coldWave: {
        id: 'coldWave',
        name: '寒潮',
        emoji: '🥶',
        type: 'disaster',
        seasons: ["winter"],
        probability: 0.05,
        description: '突然降温，气温骤降到零下，田里的庄稼冻得发紫。',
        options: [
            { text: '给庄稼盖膜（-15体力）', effect: { stamina: -15, yieldLoss: 0.03 }, result: '你割了塑料膜给庄稼盖上，手冻得裂了口子。' },
            { text: '听天由命（减产较多）', effect: { yieldLoss: 0.12 }, result: '寒潮过后，田里一片惨白，庄稼冻死了一半。' },
        ]
    },
    birdDamage: {
        id: 'birdDamage',
        name: '鸟害',
        emoji: '🐦',
        type: 'disaster',
        seasons: ["spring","summer","autumn"],
        probability: 0.04,
        description: '一群麻雀飞来，专挑成熟的稻穗吃，叽叽喳喳一大片。',
        options: [
            { text: '扎稻草人（-5体力）', effect: { stamina: -5, yieldLoss: 0.02 }, result: '你扎了个稻草人立在田里，麻雀飞走了大半。' },
            { text: '放鞭炮（-3金币）', effect: { money: -3, yieldLoss: 0.05 }, result: '你买了几挂鞭炮，噼里啪啦一放，麻雀吓跑了，但有的还是回来偷吃。' },
        ]
    },
    marketDay: {
        id: 'marketDay',
        name: '赶集日',
        emoji: '📢',
        type: 'human',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '今天是赶集日，镇上特别热闹，卖什么的都有。',
        options: [
            { text: '去赶集卖货（+40金币，-10体力）', effect: { money: 40, stamina: -10 }, result: '你挑了一担菜去赶集，卖了个好价钱，但累得快散架了。' },
            { text: '不去', effect: {}, result: '你看着别人往镇上赶，自己在地里继续干活。' },
        ]
    },
    foxInChicken: {
        id: 'foxInChicken',
        name: '狐狸偷鸡',
        emoji: '🦊',
        type: 'disaster',
        seasons: ["spring","summer","autumn","winter"],
        probability: 0.03,
        description: '夜里听到鸡叫，早上起来发现鸡笼被扒开一个洞，少了一只鸡。',
        options: [
            { text: '设陷阱（-5金币，+3声望）', effect: { money: -5, reputation: 3 }, result: '你在鸡笼边设了个陷阱，过了几天狐狸中了招，村里人都夸你厉害。' },
            { text: '加固鸡舍（-10金币）', effect: { money: -10 }, result: '你买了铁丝网把鸡舍加固了一圈，狐狸再也进不来了。' },
        ]
    },

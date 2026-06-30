const STORY_EVENTS = [
    {
        id: 'borrow_hoe',
        name: '隔壁借锄头',
        emoji: '🔧',
        description: '隔壁王大叔过来敲门，说他家锄头坏了，想借你家锄头用半天。',
        options: [
            {
                text: '借给他',
                effect: { npcs: {wangerdan: 5} },
                result: '你把锄头借给了王大叔，他千恩万谢，说用完就还，还说以后有事尽管找他。王二蛋好感+5'
            },
            {
                text: '说自己要用',
                effect: { reputation: -2 },
                result: '你说自己下午还要用，没借给他，王大叔有点失望的走了。声望-2'
            },
        ],
        minDay: 5,
        seasons: ["spring", "summer", "autumn"],
        probability: 0.025,
    },
    {
        id: 'pick_mushroom',
        name: '后山捡蘑菇',
        emoji: '🍄',
        description: '刚下过雨，后山的蘑菇应该长出来了，村里好多人都去捡。',
        options: [
            {
                text: '背个筐去捡',
                effect: { stamina: -20, money: 30 },
                result: '你去后山转了一下午，捡了半筐鲜蘑菇，卖了30块钱，还留了点晚上吃。体力-20，钱+30'
            },
            {
                text: '怕有毒不去',
                effect: {},
                result: '你怕捡到毒蘑菇吃坏肚子，没去，在家歇了一下午。'
            },
        ],
        minDay: 5,
        seasons: ["summer", "autumn"],
        probability: 0.025,
    },
    {
        id: 'hen_egg',
        name: '老母鸡下蛋',
        emoji: '🥚',
        description: '你养的老母鸡咯咯叫着从鸡窝出来，进去一看，下了个红皮大鸡蛋！',
        options: [
            {
                text: '煮了吃补身体',
                effect: { health: 2, stamina: 10 },
                result: '你把鸡蛋煮了吃，香的很，吃完感觉浑身都有力气。健康+2，体力+10'
            },
            {
                text: '攒着卖钱',
                effect: { money: 3 },
                result: '你把鸡蛋攒起来，等攒多了一起卖，卖了3块钱。钱+3'
            },
        ],
        minDay: 7,
        seasons: ["spring", "summer", "autumn"],
        probability: 0.02,
    },
    {
        id: 'snake_in_field',
        name: '田里有蛇',
        emoji: '🐍',
        description: '你在地里除草的时候，看见草里盘着一条花蛇，吐着信子看着你。',
        options: [
            {
                text: '拿棍子挑走',
                effect: { stamina: -10, mood: -2 },
                result: '你拿棍子把蛇挑到后山去了，没伤着它，就是吓了一跳。体力-10，心情-2'
            },
            {
                text: '喊人来抓',
                effect: { stamina: -5, money: 15 },
                result: '你喊来李老农，他说这是菜花蛇没毒，抓去卖了15块钱，分了你一半。体力-5，钱+15'
            },
        ],
        minDay: 7,
        seasons: ["spring", "summer", "autumn"],
        probability: 0.02,
    },
    {
        id: 'wild_rabbit',
        name: '野兔子跑地里',
        emoji: '🐇',
        description: '你在地里干活，看见一只灰毛野兔子从你脚边跑过去，钻进草里了。',
        options: [
            {
                text: '追！',
                effect: { stamina: -25, money: 40, mood: 8 },
                result: '你追了二里地居然把兔子逮住了，卖了40块钱，给你乐坏了。体力-25，钱+40，心情+8'
            },
            {
                text: '算了不追了',
                effect: {},
                result: '你看着兔子跑了，反正也追不上，接着干活。'
            },
        ],
        minDay: 10,
        seasons: ["autumn", "winter"],
        probability: 0.02,
    },
    {
        id: 'village_doctor',
        name: '村医上门',
        emoji: '💊',
        description: '村卫生室的王大夫背着药箱上门，说最近流感厉害，免费给大家量血压发感冒药。',
        options: [
            {
                text: '量个体温拿点药',
                effect: { health: 3 },
                result: '王大夫给你量了血压，说你身体挺好，给了两包感冒药预防。健康+3'
            },
            {
                text: '我身体好不用',
                effect: {},
                result: '你说自己身体好不用吃药，谢过王大夫，他就去下一家了。'
            },
        ],
        minDay: 10,
        probability: 0.02,
    },
    {
        id: 'vegetables_stolen',
        name: '菜被偷了',
        emoji: '🥬',
        description: '早上起来去菜园，发现昨天还好好的白菜被人偷了两棵。',
        options: [
            {
                text: '骂两句算了',
                effect: { mood: -3, money: -10 },
                result: '你站地头骂了两句出出气，也不知道是谁偷的，自认倒霉。心情-3，损失10块钱菜'
            },
            {
                text: '找村长说去',
                effect: { mood: -1, reputation: 1 },
                result: '你去找村长说了，村长在大喇叭上喊了两句，以后再也没人偷你菜了。心情-1，声望+1'
            },
        ],
        minDay: 12,
        seasons: ["summer", "autumn"],
        probability: 0.02,
    },
    {
        id: 'package_arrived',
        name: '快递到了',
        emoji: '📦',
        description: '村小卖部给你打电话，说你有个快递到了，是之前网上买的东西。',
        options: [
            {
                text: '骑车去取',
                effect: { stamina: -10, mood: 5 },
                result: '你骑车去小卖部把快递取了，买的东西还不错，挺开心的。体力-10，心情+5'
            },
            {
                text: '等明天顺路取',
                effect: {},
                result: '你懒得动，等明天去镇上顺路再取，反正也不急。'
            },
        ],
        minDay: 12,
        probability: 0.02,
    },
    {
        id: 'rain_collect_clothes',
        name: '下雨收衣服',
        emoji: '☔',
        description: '天突然阴了，眼看就要下大雨，你晒在外面的衣服还没收。',
        options: [
            {
                text: '赶紧跑回去收',
                effect: { stamina: -10 },
                result: '你跑回家刚把衣服收完，大雨就下来了，一点没淋湿。体力-10'
            },
            {
                text: '淋就淋吧',
                effect: { mood: -3, money: -5 },
                result: '你懒得跑，衣服被雨淋透了，还得重新洗。心情-3，损失5块钱洗衣粉钱'
            },
        ],
        minDay: 15,
        seasons: ["spring", "summer"],
        probability: 0.02,
    },
    {
        id: 'pick_wild_fruits',
        name: '山上摘野果',
        emoji: '🍇',
        description: '后山的野葡萄、八月炸熟了，村里小孩都上山摘果子吃。',
        options: [
            {
                text: '也去摘点尝尝',
                effect: { stamina: -15, mood: 6 },
                result: '你上山摘了半兜野果，酸甜酸甜的，还是小时候的味道。体力-15，心情+6'
            },
            {
                text: '懒得动',
                effect: {},
                result: '你没去，在家歇着，野果有什么好吃的。'
            },
        ],
        minDay: 15,
        seasons: ["autumn"],
        probability: 0.02,
    },
    {
        id: 'lost_puppy',
        name: '走丢的小狗',
        emoji: '🐶',
        description: '门口来了只小黄狗，摇着尾巴蹭你腿，好像是走丢了。',
        options: [
            {
                text: '喂点吃的留它',
                effect: { money: -10, mood: 8, items: {dog: 1} },
                result: '你喂了它点剩饭，它就不走了，你就养着它吧，以后有狗陪你了。钱-10，心情+8'
            },
            {
                text: '赶它走',
                effect: { mood: -2 },
                result: '你把它赶走了，小狗夹着尾巴走了，你心里有点不是滋味。心情-2'
            },
        ],
        minDay: 18,
        probability: 0.02,
    },
    {
        id: 'watermelon',
        name: '冰西瓜',
        emoji: '🍉',
        description: '天太热了，你去村小卖部买了个西瓜，刚从井里捞出来的，冰的。',
        options: [
            {
                text: '切了吃半个',
                effect: { money: -8, stamina: 20, mood: 10 },
                result: '你切了半个西瓜，用勺子挖着吃，冰甜冰甜的，暑气全消了。钱-8，体力+20，心情+10'
            },
            {
                text: '留着明天吃',
                effect: { money: -8 },
                result: '你把西瓜放井里冰着，明天再吃。钱-8'
            },
        ],
        minDay: 18,
        seasons: ["summer"],
        probability: 0.02,
    },
    {
        id: 'chop_wood',
        name: '上山砍柴',
        emoji: '🪓',
        description: '家里柴快烧完了，得上山砍点柴回来。',
        options: [
            {
                text: '上山砍一担',
                effect: { stamina: -30, money: 25 },
                result: '你上山砍了一担柴，自己烧够了，多的卖了25块钱。体力-30，钱+25'
            },
            {
                text: '买煤球烧',
                effect: { money: -20 },
                result: '你懒得砍柴，花20块钱买了煤球烧，省事。钱-20'
            },
        ],
        minDay: 20,
        seasons: ["autumn", "winter"],
        probability: 0.02,
    },
    {
        id: 'beggar',
        name: '要饭的',
        emoji: '🥣',
        description: '门口来了个要饭的老头，穿的破破烂烂，说饿了好几天了。',
        options: [
            {
                text: '给两个馒头',
                effect: { money: -5, reputation: 3, mood: 5 },
                result: '你给了他两个馒头，他千恩万谢走了，村里人看见都夸你心善。钱-5，声望+3，心情+5'
            },
            {
                text: '赶他走',
                effect: { reputation: -2 },
                result: '你把他赶走了，他摇摇头走了，你心里有点不舒服。声望-2'
            },
        ],
        minDay: 20,
        probability: 0.02,
    },
    {
        id: 'snowing',
        name: '下雪了',
        emoji: '❄️',
        description: '早上起来开门，外面白茫茫一片，下了一晚上的大雪。',
        options: [
            {
                text: '扫雪',
                effect: { stamina: -15, reputation: 3 },
                result: '你把家门口和路上的雪都扫了，村里人路过都夸你勤快。体力-15，声望+3'
            },
            {
                text: '窝家里烤火',
                effect: { stamina: 10, mood: 5 },
                result: '你窝在家里烤火，看着外面下雪，舒服的很。体力+10，心情+5'
            },
        ],
        minDay: 30,
        seasons: ["winter"],
        probability: 0.025,
    },
    {
        id: 'roast_sweet_potato',
        name: '烤红薯',
        emoji: '🍠',
        description: '天冷的很，你从窖里拿了几个红薯，埋灶灰里烤。',
        options: [
            {
                text: '烤两个吃',
                effect: { stamina: 15, mood: 8 },
                result: '红薯烤的流蜜，甜的很，吃了浑身都暖了。体力+15，心情+8'
            },
            {
                text: '留着明天吃',
                effect: {},
                result: '你把红薯放回去了，等明天再烤。'
            },
        ],
        minDay: 30,
        seasons: ["winter"],
        probability: 0.025,
    },
    {
        id: 'dig_bamboo_shoots',
        name: '挖春笋',
        emoji: '🎋',
        description: '后山的春笋冒头了，正是挖笋的好时候。',
        options: [
            {
                text: '扛锄头去挖',
                effect: { stamina: -25, money: 40, mood: 5 },
                result: '你挖了半筐春笋，嫩的很，卖了40块钱，还留了点炒肉吃。体力-25，钱+40，心情+5'
            },
            {
                text: '懒得去',
                effect: {},
                result: '你懒得爬山，没去挖笋，在家歇着。'
            },
        ],
        minDay: 30,
        seasons: ["spring"],
        probability: 0.025,
    },
    {
        id: 'swallow_nest',
        name: '燕子搭窝',
        emoji: '🐦',
        description: '有燕子飞到你家房檐下，开始叼泥搭窝。',
        options: [
            {
                text: '不赶它们',
                effect: { mood: 5, pestReduce: 0.1 },
                result: '老话说燕子不进愁家门，你让它们在这搭窝，以后虫子都少了。心情+5，虫害减少10%'
            },
            {
                text: '捅了窝',
                effect: { mood: -3, reputation: -2 },
                result: '你把燕子窝捅了，燕子飞走了，村里人说你不懂事。心情-3，声望-2'
            },
        ],
        minDay: 30,
        seasons: ["spring"],
        probability: 0.025,
    },
    {
        id: 'pick_chestnuts',
        name: '打板栗',
        emoji: '🌰',
        description: '后山的板栗熟了，刺球都裂开了，正是打板栗的时候。',
        options: [
            {
                text: '拿竹竿去打',
                effect: { stamina: -25, money: 35, mood: 5 },
                result: '你打了半袋板栗，炒着吃甜糯的很，卖了35块钱。体力-25，钱+35，心情+5'
            },
            {
                text: '刺太多不去',
                effect: {},
                result: '你怕板栗刺扎手，没去，在家歇着。'
            },
        ],
        minDay: 30,
        seasons: ["autumn"],
        probability: 0.025,
    },
    {
        id: 'dry_grain',
        name: '晒谷子',
        emoji: '🌾',
        description: '今天大太阳，正是晒谷子的好天气，你刚收的稻子还潮着。',
        options: [
            {
                text: '摊开晒',
                effect: { stamina: -15, money: 20 },
                result: '你把谷子摊在晒场上晒了一天，干的透透的，多卖了20块钱。体力-15，钱+20'
            },
            {
                text: '懒得晒',
                effect: { money: -15 },
                result: '你没晒，谷子有点发霉，少卖了15块钱。钱-15'
            },
        ],
        minDay: 30,
        seasons: ["autumn"],
        probability: 0.025,
    },
    {
        id: 'dragon_boat_festival',
        name: '端午节',
        emoji: '🐲',
        description: '今天是五月初五端午节，张婶送了一把艾草过来，村里都在包粽子。',
        options: [
            {
                text: '包粽子挂艾草',
                effect: { money: -10, health: 5, mood: 10 },
                result: '你包了粽子，把艾草挂在门上，吃了粽子身上都有劲，还驱邪。钱-10，健康+5，心情+10'
            },
            {
                text: '不过节',
                effect: { mood: -2 },
                result: '你没当回事，随便吃了点东西，看着别人过节有点冷清。心情-2'
            },
        ],
        minDay: 50,
        seasons: ["summer"],
        probability: 0.007,
    },
    {
        id: 'mid_autumn_festival',
        name: '中秋节',
        emoji: '🥮',
        description: '今天八月十五中秋节，月亮特别圆，村里都在吃月饼赏月。',
        options: [
            {
                text: '买月饼赏月',
                effect: { money: -15, mood: 15, stamina: 10 },
                result: '你买了斤月饼，坐在院子里赏月吃月饼，特别舒服。钱-15，心情+15，体力+10'
            },
            {
                text: '给家里打个电话',
                effect: { money: -5, mood: 8 },
                result: '你给家里打了个电话，聊了半天，虽然没回家但是心里暖。钱-5，心情+8'
            },
        ],
        minDay: 50,
        seasons: ["autumn"],
        probability: 0.007,
    },
    {
        id: 'chinese_new_year',
        name: '过年',
        emoji: '🧨',
        description: '今天过年了，村里鞭炮声不断，家家户户都贴春联吃年夜饭。',
        options: [
            {
                text: '买鞭炮贴春联',
                effect: { money: -50, mood: 20, reputation: 5 },
                result: '你买了鞭炮贴了春联，做了几个菜过年，村里人都来拜年，特别热闹。钱-50，心情+20，声望+5'
            },
            {
                text: '简单过个年',
                effect: { money: -20, mood: 8 },
                result: '你简单做了两个菜，没买鞭炮，安安静静过了个年。钱-20，心情+8'
            },
        ],
        minDay: 50,
        seasons: ["winter"],
        probability: 0.007,
    },
    {
        id: 'ahua_catch_mouse',
        name: '阿花抓老鼠',
        emoji: '🐱',
        description: '阿花叼着一只大老鼠跑到你面前，把老鼠放在你脚边，邀功似的蹭你腿。',
        options: [
            {
                text: '奖励它小鱼干',
                effect: { money: -2, pets: {ahua: {favor: 5}}, mood: 5 },
                result: '你奖励了阿花小鱼干，它高兴的呼噜呼噜叫，以后抓老鼠更卖力了。阿花好感+5，心情+5'
            },
            {
                text: '摸摸它的头',
                effect: { pets: {ahua: {favor: 2}}, mood: 3 },
                result: '你摸了摸阿花的头，它得意的把老鼠叼走吃了。阿花好感+2，心情+3'
            },
        ],
        minDay: 10,
        probability: 0.012,
        requiresPet: 'ahuang',
    },
    {
        id: 'dahuang_chase_rabbit',
        name: '大黄撵兔子',
        emoji: '🐶',
        description: '大黄从地里叼回来一只野兔子，摇着尾巴放在你面前，吐着舌头等你夸它。',
        options: [
            {
                text: '奖励它骨头',
                effect: { money: -3, pets: {dahuang: {favor: 5}}, money: 30, mood: 8 },
                result: '你奖励了大黄骨头，把兔子卖了30块钱，大黄以后天天往地里跑撵兔子。大黄好感+5，钱+30，心情+8'
            },
            {
                text: '夸它两句',
                effect: { pets: {dahuang: {favor: 2}}, money: 30, mood: 5 },
                result: '你夸了大黄两句，它高兴的直蹦跶。大黄好感+2，钱+30，心情+5'
            },
        ],
        minDay: 10,
        probability: 0.012,
        requiresPet: 'dahuang',
    },
    {
        id: 'cat_dog_fight',
        name: '猫狗打架',
        emoji: '😾',
        description: '阿花和大黄因为抢一块肉打起来了，毛都炸了，谁也不让谁。',
        options: [
            {
                text: '拉架各打五十大板',
                effect: { pets: {ahua: {favor: -2}, dahuang: {favor: -2}}, mood: -3 },
                result: '你把它俩拉开，各骂了两句，它俩都委屈的躲一边了。俩宠物好感各-2，心情-3'
            },
            {
                text: '各给一块肉',
                effect: { money: -5, pets: {ahua: {favor: 3}, dahuang: {favor: 3}}, mood: 5 },
                result: '你各给了它们一块肉，立马不打了，埋头吃肉，吃完又和好了。俩宠物好感各+3，心情+5'
            },
        ],
        minDay: 10,
        probability: 0.006,
        requiresPet: 'both',
    },
    {
        id: 'meet_suxiao',
        name: '村小的老师',
        emoji: '👩‍🏫',
        description: '你路过村小门口，看见一个扎马尾的女老师送小朋友放学，笑起来眼睛弯弯的，她看见你，主动和你打招呼。',
        options: [
            {
                text: '笑着打招呼',
                effect: { metSuxiao: true, npcs: {suxiao: 5}, mood: 3 },
                result: '你笑着和她打招呼，她告诉你她叫苏晓，是新来的老师，以后常来玩。苏晓好感+5，心情+3'
            },
            {
                text: '点点头就走',
                effect: { metSuxiao: true, npcs: {suxiao: 1} },
                result: '你有点不好意思，点点头就走了，她看着你背影笑了笑。苏晓好感+1'
            },
        ],
        minDay: 15,
        probability: 0.03,
        requiresNotMet: 'metSuxiao',
    },
    {
        id: 'suxiao_vegetables',
        name: '给苏老师送菜',
        emoji: '🥬',
        description: '你菜园的青菜长的正好，想起苏老师一个人在村里，可能没菜吃。',
        options: [
            {
                text: '摘一篮子送过去',
                effect: { items: {vegetable: -1}, npcs: {suxiao: 8}, mood: 5 },
                result: '你摘了一篮子新鲜青菜给苏晓送过去，她特别开心，说正愁没菜吃，还给了你一把糖。苏晓好感+8，心情+5'
            },
            {
                text: '算了不好意思',
                effect: {},
                result: '你有点不好意思，没去送，菜自己吃了。'
            },
        ],
        probability: 0.02,
        requiresNpc: { id: 'suxiao', minFavor: 10 },
        requiresMet: 'metSuxiao',
    },
    {
        id: 'suxiao_repair_desk',
        name: '帮苏老师修桌椅',
        emoji: '🔨',
        description: '你路过学校，看见苏晓蹲在门口发愁，几个学生的桌椅腿松了，她不会修。',
        options: [
            {
                text: '回家拿工具帮她修',
                effect: { stamina: -20, npcs: {suxiao: 10}, mood: 8, stamina: 10 },
                result: '你回家拿了钉子锤子，帮她把桌椅都修好了，她给你煮了碗绿豆糖水，挺甜的。体力-20，苏晓好感+10，喝了糖水回10体力，心情+8'
            },
            {
                text: '说自己不会',
                effect: { npcs: {suxiao: -2} },
                result: '你说自己不会修，她有点失望，说再找别人看看。苏晓好感-2'
            },
        ],
        probability: 0.02,
        requiresNpc: { id: 'suxiao', minFavor: 20 },
        requiresMet: 'metSuxiao',
    },
    {
        id: 'catch_cicada',
        name: '摸知了猴',
        emoji: '🦗',
        description: '天黑了，树林里的知了猴都爬出来了，村里小孩都拿手电筒去摸。',
        options: [
            {
                text: '拿手电筒去摸',
                effect: { stamina: -20, money: 25, mood: 8 },
                result: '你摸了小半桶知了猴，卖了25块钱，还留了几个炸着吃，香的很。体力-20，钱+25，心情+8'
            },
            {
                text: '蚊子多不去',
                effect: {},
                result: '你怕蚊子咬，没去，在家扇扇子。'
            },
        ],
        minDay: 20,
        seasons: ["summer"],
        probability: 0.013,
    },
    {
        id: 'suxiao_umbrella',
        name: '下雨送伞',
        emoji: '☔',
        description: '放学的时候突然下大雨，你看见苏晓站在学校门口，没带伞，望着雨发愁。',
        options: [
            {
                text: '把伞给她，自己跑回去',
                effect: { health: -2, npcs: {suxiao: 12}, mood: 10 },
                result: '你把伞塞给她，自己淋着雨跑回家，第二天有点感冒，但她第二天特意来给你送药，眼睛红红的。苏晓好感+12，心情+10'
            },
            {
                text: '和她一起撑伞回去',
                effect: { stamina: -10, npcs: {suxiao: 8}, mood: 8 },
                result: '你撑伞送她回宿舍，两个人挤在一把伞下，肩膀挨在一起，都有点不好意思。体力-10，苏晓好感+8，心情+8'
            },
        ],
        seasons: ["spring", "summer"],
        probability: 0.02,
        requiresNpc: { id: 'suxiao', minFavor: 30 },
        requiresMet: 'metSuxiao',
    },
    {
        id: 'meet_chenyang',
        name: '快递站的年轻人',
        emoji: '📦',
        description: '你去村小卖部取快递，看见一个穿卫衣的男生在搬快递，晒的有点黑，笑起来一口白牙，他看见你主动打招呼："你也是回村的？我叫陈阳，搞电商的。"',
        options: [
            {
                text: '笑着和他握手',
                effect: { metChenyang: true, npcs: {chenyang: 5}, mood: 5 },
                result: '你和他握手，说你也是回村种地的，他特别高兴，说以后有农产品卖不出去可以找他，留了联系方式。陈阳好感+5，心情+5'
            },
            {
                text: '点点头打个招呼',
                effect: { metChenyang: true, npcs: {chenyang: 2} },
                result: '你点点头和他打了个招呼，取了快递就走了，他看着你背影笑了笑。陈阳好感+2'
            },
        ],
        minDay: 20,
        probability: 0.03,
        requiresNotMet: 'metChenyang',
    },
    {
        id: 'chenyang_sell_goods',
        name: '陈阳帮你卖货',
        emoji: '💰',
        description: '陈阳来找你，说看你家粮食质量好，他可以帮你在网上卖，比粮店收的贵两成。',
        options: [
            {
                text: '太好了，麻烦你了',
                effect: { money: 60, npcs: {chenyang: 8}, mood: 5, sellBonus: 0.1 },
                result: '陈阳帮你把粮食挂到网上卖了个好价钱，比粮店多卖了60块！他还给你开了专属供货渠道，以后你卖粮食都比粮店收购价高10%。陈阳好感+8，心情+5，永久解锁卖价+10%'
            },
            {
                text: '不了，怕麻烦你',
                effect: { npcs: {chenyang: 1} },
                result: '你说怕麻烦他，还是自己拉去粮店卖，他说没事，什么时候想卖随时找他。陈阳好感+1'
            },
        ],
        minDay: 30,
        probability: 0.02,
        requiresNpc: { id: 'chenyang', minFavor: 10 },
        requiresMet: 'metChenyang',
    },
    {
        id: 'cold_noodles',
        name: '吃凉面',
        emoji: '🍜',
        description: '天太热了，什么都吃不下，就想吃口凉面。',
        options: [
            {
                text: '擀凉面吃',
                effect: { stamina: 15, mood: 10, health: 2 },
                result: '你擀了凉面，过了井水，拌上蒜汁黄瓜丝，吃了两大碗，凉快的很。体力+15，心情+10，健康+2'
            },
            {
                text: '随便吃点',
                effect: { stamina: -5 },
                result: '你随便吃了点剩菜，热的没胃口，没吃饱。体力-5'
            },
        ],
        minDay: 20,
        seasons: ["summer"],
        probability: 0.013,
    },
    {
        id: 'chenyang_bbq',
        name: '村口吃烧烤',
        emoji: '🍻',
        description: '天热的睡不着，陈阳喊你去村口烧烤摊吃串，说他请客，冰啤酒都冰上了。',
        options: [
            {
                text: '去！喝两杯',
                effect: { money: -20, stamina: 15, npcs: {chenyang: 10}, mood: 15 },
                result: '你们俩吃串喝冰啤酒，聊回村的趣事，聊到半夜才回家，特别痛快。钱-20，体力+15，陈阳好感+10，心情+15'
            },
            {
                text: '不去了明天要下地',
                effect: { npcs: {chenyang: -1} },
                result: '你说明天还要下地，不去了，他有点失望，说下次再约。陈阳好感-1'
            },
        ],
        seasons: ["summer"],
        probability: 0.02,
        requiresNpc: { id: 'chenyang', minFavor: 20 },
        requiresMet: 'metChenyang',
    },
    {
        id: 'zhangshen_vegetables',
        name: '张婶送菜',
        emoji: '🥬',
        description: '张婶挎着篮子路过你家，给你塞了一把青菜："自己家种的，吃不完，给你点。"',
        options: [
            {
                text: '谢谢张婶',
                effect: { items: {vegetable: 2}, npcs: {zhangshen: 2}, mood: 3 },
                result: '你谢过张婶，留她坐会她不坐，说还要回去做饭。获得青菜×2，张婶好感+2，心情+3'
            },
        ],
        probability: 0.0075,
        requiresNpc: { id: 'zhangshen', minFavor: 20 },
    },
    {
        id: 'zhangshen_eggs',
        name: '张婶送鸡蛋',
        emoji: '🥚',
        description: '张婶端着碗过来，给你盛了几个鸡蛋："我家老母鸡下的，新鲜的，你补补。"',
        options: [
            {
                text: '谢谢张婶',
                effect: { items: {egg: 3}, npcs: {zhangshen: 2}, mood: 3 },
                result: '你谢过张婶，鸡蛋还热乎的。获得鸡蛋×3，张婶好感+2，心情+3'
            },
        ],
        probability: 0.0075,
        requiresNpc: { id: 'zhangshen', minFavor: 20 },
    },
    {
        id: 'lidegen_guidance',
        name: '李老农指点',
        emoji: '👨‍🌾',
        description: '李老农路过你家地，蹲下来看了看，给你指点了两句种地的门道。',
        options: [
            {
                text: '听李大爷说说',
                effect: { skills: {fieldManage: 3, cropFamiliar: 2}, npcs: {lidegen: 2}, mood: 2 },
                result: '李老农给你讲了讲怎么防病虫害、怎么施肥，你听了受益匪浅。田间管理经验+3，作物熟悉度经验+2，李老农好感+2'
            },
        ],
        probability: 0.015,
        requiresNpc: { id: 'lidegen', minFavor: 20 },
        requiresCrop: true,
    },
    {
        id: 'power_outage',
        name: '停电了',
        emoji: '💡',
        description: '天太热正吹着风扇，突然停电了，热的睡不着。',
        options: [
            {
                text: '拿蒲扇去房顶睡',
                effect: { stamina: 10, mood: 5 },
                result: '你拿了凉席蒲扇去房顶睡，有风还能看星星，比家里凉快。体力+10，心情+5'
            },
            {
                text: '在家硬扛',
                effect: { stamina: -10, mood: -5 },
                result: '你在家热的翻来覆去，一身汗，半宿没睡着。体力-10，心情-5'
            },
        ],
        minDay: 20,
        seasons: ["summer"],
        probability: 0.013,
    },
    {
        id: 'wangerdan_water',
        name: '二蛋帮你浇水',
        emoji: '💧',
        description: '王二蛋路过你家地，看你在忙，扛着水桶就帮你把地浇了，浇的满头大汗。',
        options: [
            {
                text: '晚上请你喝酒',
                effect: { stamina: 8, npcs: {wangerdan: 3}, mood: 3 },
                result: '你说晚上请他喝酒，他乐的不行，说以后有事尽管喊他。帮你浇完水，省了你8点体力，王二蛋好感+3，心情+3'
            },
        ],
        probability: 0.015,
        requiresNpc: { id: 'wangerdan', minFavor: 20 },
        requiresCrop: true,
    },
    {
        id: 'pick_persimmon',
        name: '摘柿子',
        emoji: '🍅',
        description: '村头老柿子树的柿子红了，像小灯笼似的挂在树上。',
        options: [
            {
                text: '摘点柿子',
                effect: { stamina: -10, mood: 8 },
                result: '你摘了一兜柿子，放软了甜的很，吃了几个心情都变好了。体力-10，心情+8'
            },
            {
                text: '懒得爬树',
                effect: {},
                result: '你懒得爬树，看着别人摘，没吃着。'
            },
        ],
        seasons: ["autumn"],
        probability: 0.013,
    },
    {
        id: 'zhaoyoucai_bonus',
        name: '赵老板给优惠',
        emoji: '💰',
        description: '你去粮店卖粮，赵有财拍着你肩膀说："小伙子人不错，以后来我这卖粮，我给你每斤多算5分钱。"',
        options: [
            {
                text: '谢谢赵老板',
                effect: { zhaoBonusNoticed: true, mood: 3 },
                result: '你谢过赵老板，以后卖粮给他价格高5%。心情+3'
            },
        ],
        probability: 0.05,
        requiresNpc: { id: 'zhaoyoucai', minFavor: 30 },
        requiresNotMet: 'zhaoBonusNoticed',
    },
    {
        id: 'spring_plowing_help',
        name: '春耕帮忙',
        emoji: '🌾',
        description: '村里张婶家男人出去打工了，她一个人耕不完地，喊人帮忙。',
        options: [
            {
                text: '去帮忙',
                effect: { stamina: -30, npcs: {zhangshen: 10}, reputation: 3 },
                result: '你帮张婶耕了一天地，她给你塞了一篮子鸡蛋，特别感谢你。体力-30，张婶好感+10，声望+3'
            },
            {
                text: '自己地还没耕完',
                effect: {},
                result: '你说自己家地还没忙完，没去帮忙。'
            },
        ],
        seasons: ["spring"],
        probability: 0.013,
    },
    {
        id: 'wangbaoguo_subsidy',
        name: '农业补贴',
        emoji: '🧧',
        description: '村长给你打电话，说今年的农业补贴下来了，你是种粮大户，给你发了补贴。',
        options: [
            {
                text: '谢谢村长',
                effect: { money: 80, npcs: {wangbaoguo: 2}, mood: 5 },
                result: '你去村部领了80块补贴，村长说以后有好事还想着你。钱+80，村长好感+2，心情+5'
            },
        ],
        probability: 0.005,
        requiresNpc: { id: 'wangbaoguo', minFavor: 30 },
    },
    {
        id: 'wangbaoguo_seeds',
        name: '免费种子',
        emoji: '🌱',
        description: '村长给你送过来两袋免费的种子，说镇上发的优质种子，给你留了两袋。',
        options: [
            {
                text: '谢谢村长',
                effect: { items: {seed: 2}, npcs: {wangbaoguo: 2}, mood: 3 },
                result: '你谢过村长，获得优质种子×2，村长好感+2，心情+3'
            },
        ],
        probability: 0.005,
        requiresNpc: { id: 'wangbaoguo', minFavor: 30 },
    },
    {
        id: 'suxiao_cookies',
        name: '苏晓送点心',
        emoji: '🍪',
        description: '苏晓路过你家地，给你递了一包她自己烤的小饼干："看你天天在地里忙，肯定饿了，我烤了点饼干，你尝尝。"',
        options: [
            {
                text: '谢谢你，太好吃了',
                effect: { stamina: 15, npcs: {suxiao: 3}, mood: 8 },
                result: '饼干挺甜的，吃了浑身都有劲。体力+15，苏晓好感+3，心情+8'
            },
        ],
        probability: 0.0075,
        requiresNpc: { id: 'suxiao', minFavor: 30 },
        requiresMet: 'metSuxiao',
    },
    {
        id: 'suxiao_mung_bean_soup',
        name: '绿豆糖水',
        emoji: '🥤',
        description: '天太热，苏晓给你端了一碗冰绿豆糖水过来："天热，喝点糖水别中暑了。"',
        options: [
            {
                text: '太谢谢你了',
                effect: { stamina: 10, health: 1, npcs: {suxiao: 3}, mood: 10 },
                result: '绿豆糖水冰甜冰甜的，喝了暑气全消。体力+10，健康+1，苏晓好感+3，心情+10'
            },
        ],
        probability: 0.0075,
        requiresNpc: { id: 'suxiao', minFavor: 30 },
        requiresMet: 'metSuxiao',
    },
    {
        id: 'meet_linxiaoyu',
        name: '村卫生室的医生',
        emoji: '👩‍⚕️',
        description: '你下地淋了雨有点头疼，去村卫生室拿药，看见一个穿白大褂的女生在整理药箱，戴个眼镜，笑起来很温柔，她给你拿了感冒药，还叮嘱你多喝热水。',
        options: [
            {
                text: '谢谢医生，多少钱',
                effect: { metLinxiaoyu: true, money: -5, health: 5, npcs: {linxiaoyu: 5}, mood: 3 },
                result: '你付了5块钱药费，她告诉你她叫林小雨，是新来的村医，以后不舒服随时来。健康+5，林小雨好感+5，心情+3'
            },
            {
                text: '不好意思麻烦你了',
                effect: { metLinxiaoyu: true, health: 3, npcs: {linxiaoyu: 2} },
                result: '你有点不好意思，她笑了笑说应该的，让你注意身体。健康+3，林小雨好感+2'
            },
        ],
        minDay: 25,
        probability: 0.025,
        requiresNotMet: 'metLinxiaoyu',
    },
    {
        id: 'frost_morning',
        name: '打霜了',
        emoji: '🥬',
        description: '早上起来菜地里打了厚厚的霜，青菜都被霜打了。',
        options: [
            {
                text: '摘点霜打菜',
                effect: { money: 10, mood: 3 },
                result: '霜打的青菜特别甜，你摘了一筐，自己吃点剩下的卖了10块钱。钱+10，心情+3'
            },
            {
                text: '等太阳出来再说',
                effect: {},
                result: '你等太阳出来霜化了再去菜地，菜没冻坏。'
            },
        ],
        seasons: ["winter"],
        probability: 0.013,
    },
    {
        id: 'linxiaoyu_medicine',
        name: '中暑送药',
        emoji: '💊',
        description: '天太热你在地里中暑了，头晕乎乎的，正好林小雨路过巡诊，赶紧给你递了瓶藿香正气水，扶你到树荫下歇着。',
        options: [
            {
                text: '谢谢你林医生',
                effect: { health: 8, stamina: 10, npcs: {linxiaoyu: 8}, mood: 5 },
                result: '喝了药歇了会好多了，她叮嘱你天热别中午下地，容易中暑。健康+8，体力+10，林小雨好感+8，心情+5'
            },
            {
                text: '我没事歇会就好',
                effect: { health: 3, npcs: {linxiaoyu: 2} },
                result: '你说没事歇会就好，她还是给你留了两瓶藿香正气水才走。健康+3，林小雨好感+2'
            },
        ],
        seasons: ["summer"],
        probability: 0.02,
        requiresNpc: { id: 'linxiaoyu', minFavor: 10 },
        requiresMet: 'metLinxiaoyu',
    },
    {
        id: 'bee_swarm',
        name: '蜜蜂分蜂',
        emoji: '🐝',
        description: '院外树上落了一团蜜蜂，是分蜂跑出来的蜂群。',
        options: [
            {
                text: '收回来养',
                effect: { stamina: -15, money: 50 },
                result: '你找了个蜂箱把蜂群收回来养着，以后有蜂蜜吃了，还能卖蜂蜜，赚了50块。体力-15，钱+50'
            },
            {
                text: '不敢动',
                effect: {},
                result: '你怕被蛰，不敢动，看着蜂群飞走了。'
            },
        ],
        seasons: ["spring", "autumn"],
        probability: 0.013,
    },
    {
        id: 'linxiaoyu_medicine_kit',
        name: '常备药包',
        emoji: '🩹',
        description: '林小雨给你送了一个小药包，里面有感冒药、肠胃药、创可贴、藿香正气水："你一个人在家，备点常用药，别不舒服了硬扛。"',
        options: [
            {
                text: '太谢谢你了，想的真周到',
                effect: { hasMedicineKit: true, npcs: {linxiaoyu: 10}, mood: 8, health: 2 },
                result: '你收下药包，心里暖暖的。以后生病、淋雨、中暑掉的健康减半，林小雨好感+10，心情+8，健康+2'
            },
        ],
        probability: 0.03,
        requiresNpc: { id: 'linxiaoyu', minFavor: 20 },
        requiresMet: 'metLinxiaoyu',
        requiresNotMet: 'hasMedicineKit',
    },
    {
        id: 'relative_visit',
        name: '亲戚串门',
        emoji: '👨‍👩‍👧',
        description: '你远房表叔来村里办事，顺道来看你，带了点土特产。',
        options: [
            {
                text: '留他吃饭',
                effect: { money: -30, reputation: 5, mood: 5 },
                result: '你留表叔在家吃了顿饭，喝了点酒，他特别高兴，说你懂事。钱-30，声望+5，心情+5'
            },
            {
                text: '坐会就送他走',
                effect: { reputation: -2 },
                result: '你和他坐了会，说自己还要下地，就送他走了，他有点不高兴。声望-2'
            },
        ],
        seasons: ["winter"],
        probability: 0.013,
    },
    {
        id: 'pick_dates',
        name: '打枣',
        emoji: '🫐',
        description: '后山的枣熟了，红通通的挂了一树，风一吹就往下掉。',
        options: [
            {
                text: '拿竹竿打枣去',
                effect: { stamina: -15, money: 20, mood: 5 },
                result: '你拿竹竿打了半筐枣，吃了个饱，剩下的卖了20块钱。体力-15，钱+20，心情+5'
            },
            {
                text: '懒得动',
                effect: {},
                result: '你懒得动，看着枣被村里小孩打走了。'
            },
        ],
        minDay: 30,
        seasons: ["autumn"],
        probability: 0.012,
    },
    {
        id: 'pickle_vegetables',
        name: '腌咸菜',
        emoji: '🥬',
        description: '天寒地冻的没菜吃，该腌一缸咸菜了，萝卜白菜盐都备齐了。',
        options: [
            {
                text: '腌一缸咸菜',
                effect: { stamina: -10, items: {pickle: 5}, mood: 3 },
                result: '你腌了一缸咸菜，够吃一冬天的。体力-10，获得咸菜×5，心情+3'
            },
            {
                text: '买着吃算了',
                effect: { money: -10 },
                result: '你懒得腌，花10块钱买了点咸菜吃。钱-10'
            },
        ],
        minDay: 30,
        seasons: ["winter"],
        probability: 0.009,
    },
    {
        id: 'sunbathing',
        name: '墙根晒太阳',
        emoji: '☀️',
        description: '今天太阳好，村里老头老太太都在墙根晒太阳聊天，你也没事干。',
        options: [
            {
                text: '一起晒会太阳',
                effect: { stamina: 20, mood: 8 },
                result: '你搬个小马扎和大家一起晒太阳，唠了一下午嗑，浑身都暖乎乎的。体力+20，心情+8'
            },
            {
                text: '回家躺着',
                effect: { stamina: 5, mood: 2 },
                result: '你回家躺着刷手机，也挺舒服。体力+5，心情+2'
            },
        ],
        minDay: 30,
        seasons: ["winter"],
        probability: 0.009,
    },
    {
        id: 'new_year_pig',
        name: '杀年猪',
        emoji: '🐷',
        description: '村里李叔家杀年猪，喊你去帮忙，杀完了大家一起吃杀猪菜。',
        options: [
            {
                text: '去帮忙吃杀猪菜',
                effect: { stamina: -15, money: -30, items: {pork: 3}, mood: 15 },
                result: '你去帮忙按猪，忙了一下午，吃了一大碗杀猪菜，还买了3斤肉回来。体力-15，钱-30，获得猪肉×3，心情+15'
            },
            {
                text: '不去了忙',
                effect: {},
                result: '你没去，在家忙自己的事。'
            },
        ],
        minDay: 200,
        seasons: ["winter"],
        probability: 0.013,
    },
    {
        id: 'warm_fire',
        name: '烤火',
        emoji: '🔥',
        description: '外面下着雪，冷的伸不出手，你把炭盆点着，屋里暖烘烘的。',
        options: [
            {
                text: '烤火嗑瓜子',
                effect: { stamina: 15, mood: 10 },
                result: '你坐在火盆边烤火嗑瓜子，听着外面下雪的声音，特别舒服。体力+15，心情+10'
            },
            {
                text: '早点睡',
                effect: { stamina: 10, mood: 5 },
                result: '你早早钻被窝睡觉，暖乎乎的。体力+10，心情+5'
            },
        ],
        minDay: 200,
        seasons: ["winter"],
        probability: 0.013,
    },
    {
        id: 'new_year_market',
        name: '赶年集',
        emoji: '🧧',
        description: '快过年了，集上特别热闹，卖春联的、卖糖的、卖肉的，到处都是人。',
        options: [
            {
                text: '去买年货',
                effect: { money: -50, items: {candy: 2, couplet: 1}, mood: 20 },
                result: '你去集上买了春联、糖、瓜子，花了50块钱，年味儿一下就上来了。钱-50，获得糖×2、春联×1，心情+20'
            },
            {
                text: '人多不去',
                effect: {},
                result: '你嫌人多，没去，在家待着。'
            },
        ],
        minDay: 200,
        seasons: ["winter"],
        probability: 0.013,
    },
    {
        id: 'dig_shepherds_purse',
        name: '挖荠菜',
        emoji: '🥬',
        description: '春天到了，地里的荠菜都长出来了，嫩的很，挖点回来包饺子特别鲜。',
        options: [
            {
                text: '拿篮子挖荠菜去',
                effect: { stamina: -15, items: {shepherds_purse: 3}, mood: 8 },
                result: '你挖了半篮子嫩荠菜，晚上包荠菜饺子吃，鲜的掉眉毛。体力-15，获得荠菜×3，心情+8'
            },
            {
                text: '懒得动',
                effect: {},
                result: '你懒得动，在家歇着。'
            },
        ],
        maxDay: 120,
        seasons: ["spring"],
        probability: 0.01,
    },
    {
        id: 'fly_kite',
        name: '放风筝',
        emoji: '🪁',
        description: '春天风大，村里小朋友都在麦地里放风筝，跑的满头汗。',
        options: [
            {
                text: '和小朋友一起放',
                effect: { stamina: -10, mood: 15 },
                result: '你和小朋友一起放了一下午风筝，好像回到了小时候，特别开心。体力-10，心情+15'
            },
            {
                text: '看着他们玩',
                effect: { mood: 5 },
                result: '你站在地头看了会，也挺开心的。心情+5'
            },
        ],
        maxDay: 120,
        seasons: ["spring"],
        probability: 0.01,
    },
    {
        id: 'spring_plowing_help',
        name: '春耕帮忙',
        emoji: '🚜',
        description: '隔壁王大哥家春耕缺人手，喊你去帮忙，说给你开工钱。',
        options: [
            {
                text: '去帮忙',
                effect: { stamina: -30, money: 40, npcs: {wangerdan: 3}, mood: 3 },
                result: '你去帮了一天忙，累的够呛，王大哥给了你40块工钱，还留你吃了晚饭。体力-30，钱+40，王二蛋好感+3，心情+3'
            },
            {
                text: '自己家地还没种完',
                effect: { npcs: {wangerdan: -1} },
                result: '你说自己家地还没种完，没去，他有点不高兴。王二蛋好感-1'
            },
        ],
        seasons: ["spring"],
        probability: 0.013,
    },
    {
        id: 'loudspeaker_broadcast',
        name: '大喇叭广播',
        emoji: '📢',
        description: '村长大喇叭喊了，说明天镇上有大集，让大家有空去赶集。',
        options: [
            {
                text: '明天去赶集',
                effect: { stamina: -20, mood: 5 },
                result: '你第二天去集上转了转，买了点生活用品，还吃了碗凉皮，挺热闹。体力-20，心情+5'
            },
            {
                text: '不去了在家干活',
                effect: {},
                result: '你明天还要下地，不去赶集了，在家干活。'
            },
        ],
        probability: 0.01,
    },
    {
        id: 'sharpen_knife',
        name: '磨剪子嘞戗菜刀',
        emoji: '🔪',
        description: '外面传来吆喝声："磨剪子嘞~戗菜刀~"，是磨剪刀的老师傅进村了。',
        options: [
            {
                text: '把家里刀磨磨',
                effect: { money: -5, mood: 3 },
                result: '你花5块钱把家里的菜刀剪刀都磨了，磨的飞快，切菜都顺手多了。钱-5，心情+3'
            },
            {
                text: '刀还快不用磨',
                effect: {},
                result: '你听着吆喝声过去了，家里刀还快，不用磨。'
            },
        ],
        probability: 0.01,
    },
    {
        id: 'village_movie',
        name: '村里放电影',
        emoji: '🎬',
        description: '大队部今晚放露天电影，听说放的是打仗的老片子，好多人搬凳子去看。',
        options: [
            {
                text: '搬凳子去看',
                effect: { stamina: -10, mood: 10 },
                result: '你搬了个凳子去看电影，和村里人唠嗑唠到散场，特别热闹。体力-10，心情+10'
            },
            {
                text: '在家睡觉',
                effect: { stamina: 15 },
                result: '你没去凑热闹，在家早早睡了，第二天起来精神特别好。体力+15'
            },
        ],
        seasons: ["summer"],
        probability: 0.01,
    },
    {
        id: 'neighbor_build_house',
        name: '邻居盖房',
        emoji: '🧱',
        description: '村西头老李家盖新房，喊村里人去帮忙，管饭还发烟。',
        options: [
            {
                text: '去帮忙',
                effect: { stamina: -30, money: 20, reputation: 5 },
                result: '你去帮了一天忙，累的够呛，主家给了20块钱喜钱，还吃了顿好的，村里人都夸你实在。体力-30，钱+20，声望+5'
            },
            {
                text: '不去在家歇着',
                effect: { reputation: -3 },
                result: '你没去，在家歇了一天，后来见了老李有点不好意思。声望-3'
            },
        ],
        seasons: ["spring", "autumn"],
        probability: 0.01,
    },
    {
        id: 'peddler_visit',
        name: '货郎进村',
        emoji: '🧺',
        description: '村口摇拨浪鼓的声音，是走街串巷的货郎来了，卖些针头线脑、糖块点心。',
        options: [
            {
                text: '买块糖吃',
                effect: { money: -5, mood: 5 },
                result: '你花5块钱买了块水果糖，含在嘴里挺甜的，心情都变好了。钱-5，心情+5'
            },
            {
                text: '凑个热闹不买',
                effect: { stamina: -5 },
                result: '你凑过去看了看热闹，没什么想买的，转了一圈就回来了。体力-5'
            },
        ],
        probability: 0.01,
    },
];
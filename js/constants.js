/**
 * 宠物医生模拟器 v0.3 — 常量定义
 * 所有魔法数字集中在这里，杜绝散布在代码中
 */

const CONSTANTS = {
    // ==================== 版本 ====================
    VERSION: 3,
    VERSION_STRING: '0.3.0',

    // ==================== 经济系统 ====================
    ECONOMY: {
        START_GOLD: 1500,          // ↓ 3250→1500 前期需要精打细算
        MAX_GOLD: 999999,
        BASE_FEE_EASY: 100,        // ↓ 降低基础费，让药品成本占比更合理
        BASE_FEE_NORMAL: 180,
        BASE_FEE_HARD: 300,
        SURGERY_FEE: 800,
        MEDICINE_COST: 60,         // ↑ 50→60 药品成本提高
        HERB_COST: 40,             // ↑ 30→40
        BANDAGE_COST: 50,          // ↑ 40→50
        DAILY_RENT: 250,           // ↑ 200→250 租金压力加大
        RENT_DUE_DAYS: 7,
        BANKRUPTCY_DAYS: 3,
    },

    // ==================== 声望系统 ====================
    REPUTATION: {
        MAX: 5.0,
        MIN: 0,
        START: 0.5,                // ↓ 1.0→0.5 从半星开始，成长感更强
        CURE_BONUS: 0.10,          // ↓ 0.15→0.10 满星需要~45次治愈（约25-35天）
        CURE_BONUS_PERFECT: 0.18,  // ↓ 0.25→0.18 完美治疗有显著加成
        FAIL_PENALTY: 0.25,        // ↓ 0.3→0.25 失败惩罚略降，避免劝退
        WRONG_DIAGNOSIS_PENALTY: 0.08, // ↓ 0.1→0.08
        TIMEOUT_PENALTY: 0.08,     // ↓ 0.1→0.08
        PRESSURE_EXPLODE_PENALTY: 0.4, // ↓ 0.5→0.4
        // 声望等级阈值
        LEVELS: [
            { star: 1, name: '默默无闻', dailyPatients: [1, 2], desc: '刚开业的小诊所' },
            { star: 2, name: '小有名气', dailyPatients: [2, 3], desc: '附近居民开始知道了' },
            { star: 3, name: '口碑诊所', dailyPatients: [3, 4], desc: '很多人慕名而来' },
            { star: 4, name: '全市知名', dailyPatients: [4, 5], desc: '全城最棒的宠物医生' },
            { star: 5, name: '传奇兽医', dailyPatients: [5, 6], desc: '传说中的存在' },
        ],
    },

    // ==================== 压力系统 ====================
    PRESSURE: {
        MAX: 100,
        MIN: 0,
        START: 20,                 // ↑ 10→20 开局就有紧张感
        // 自然衰减（每接完一个病人后）
        DECAY_AFTER_PATIENT: 6,    // 每完成一个病人-6（需在代码中调用）
        // 加压因素
        NEW_PATIENT_ARRIVES: 8,    // ↑ 5→8 每个新病人更有压力
        PATIENT_WAITING_PER_TICK: 2, // 每5秒tick +2（替代原来的每分钟+3）
        WRONG_DIAGNOSIS: 12,       // ↓ 15→12
        TREATMENT_FAIL: 18,        // ↓ 20→18
        MINIGAME_TIMEOUT: 8,       // ↓ 10→8
        // 减压因素
        CURE_SUCCESS: -12,         // ↑ -10→-12 成功治愈减压更明显
        CURE_PERFECT: -18,         // 新增：完美治疗额外减压
        TAKE_BREAK: -25,           // ↑ -20→-25
        CHAT_WITH_NPC: -8,         // ↑ -5→-8
        // 压力区间效果
        ZONES: {
            SAFE: { max: 30, name: '轻松', color: '#4ade80' },
            WARNING: { max: 60, name: '紧张', color: '#fbbf24' },
            DANGER: { max: 80, name: '高压', color: '#f97316' },
            CRITICAL: { max: 100, name: '失控', color: '#ef4444' },
        },
    },

    // ==================== 时间系统 ====================
    TIME: {
        DAY_START_HOUR: 9,         // 诊所营业时间开始
        DAY_END_HOUR: 18,          // 诊所营业时间结束
        DAY_LENGTH_REAL_MINUTES: 8, // 游戏内一天 = 现实8分钟（足够玩又不无聊）
        PATIENT_ARRIVAL_INTERVAL: 45, // 病人间隔（秒）
        MINIGAME_TIME_STETHOSCOPE: 10, // 听诊游戏时间（秒）
        MINIGAME_TIME_GRIND: 15,      // 研磨游戏时间（秒）
    },

    // ==================== 宠物与病例 ====================
    PETS: {
        // 已解锁的宠物类型（随声望解锁）
        AVAILABLE: [
            { id: 'shiba', name: '柴犬', species: '犬', imgs: { sick: 'dog_sick.png', healthy: 'dog_healthy.png' }, unlockRep: 0 },
            { id: 'orange_cat', name: '橘猫', species: '猫', imgs: { sick: 'cat_sick.png', healthy: 'cat_healthy.png' }, unlockRep: 0 },
            { id: 'golden', name: '金毛', species: '犬', imgs: { sick: 'pet_golden_sick.png', healthy: 'pet_golden_healthy.png' }, unlockRep: 0 },
            { id: 'corgi', name: '柯基', species: '犬', imgs: { sick: 'pet_corgi_sick.png', healthy: 'pet_corgi_healthy.png' }, unlockRep: 1.0 },
            { id: 'hamster', name: '仓鼠', species: '鼠', imgs: { sick: 'pet_hamster_sick.png', healthy: 'pet_hamster_healthy.png' }, unlockRep: 1.5 },
            { id: 'parrot', name: '鹦鹉', species: '鸟', imgs: { sick: 'pet_parrot_sick.png', healthy: 'pet_parrot_healthy.png' }, unlockRep: 2.0 },
            { id: 'rabbit', name: '兔子', species: '兔', imgs: { sick: 'pet_rabbit_sick.png', healthy: 'pet_rabbit_healthy.png' }, unlockRep: 2.5 },
            { id: 'persian', name: '波斯猫', species: '猫', imgs: { sick: 'pet_persian_sick.png', healthy: 'pet_persian_healthy.png' }, unlockRep: 3.0 },
            { id: 'chinchilla', name: '龙猫', species: '鼠', imgs: { sick: 'pet_chinchilla_sick.png', healthy: 'pet_chinchilla_healthy.png' }, unlockRep: 3.5 },
            { id: 'turtle', name: '乌龟', species: '龟', imgs: { sick: 'pet_turtle_sick.png', healthy: 'pet_turtle_healthy.png' }, unlockRep: 4.0 },
        ],
    },

    // ==================== 病症库 ====================
    CONDITIONS: [
        {
            id: 'food_poisoning',
            name: '食物中毒',
            symptoms: ['呕吐', '腹泻', '精神萎靡', '食欲不振'],
            diagnosisHints: ['吃了垃圾桶里的东西', '偷吃了人类食物', '换了新狗粮'],
            treatment: '黄连素+益生菌',
            difficulty: 1,
            minigame: 'stethoscope',
            fee: 200,
        },
        {
            id: 'cat_flu',
            name: '呼吸道感染',
            symptoms: ['打喷嚏', '流鼻涕', '咳嗽', '发烧'],
            diagnosisHints: ['最近天气变冷了', '家里开了空调', '接触过其他生病的宠物'],
            treatment: '退烧药+营养剂',
            difficulty: 1,
            minigame: 'thermometer',
            fee: 150,
        },
        {
            id: 'parasite',
            name: '寄生虫感染',
            symptoms: ['消瘦', '毛发暗淡', '蹭屁股', '呕吐虫体'],
            diagnosisHints: ['没有定期驱虫', '经常在外面跑', '最近掉毛严重'],
            treatment: '驱虫药+维生素',
            difficulty: 2,
            minigame: 'stethoscope',
            fee: 250,
        },
        {
            id: 'allergy',
            name: '过敏反应',
            symptoms: ['皮肤红肿', '频繁抓挠', '流泪', '打喷嚏'],
            diagnosisHints: ['换了新沐浴露', '吃了新牌子的粮', '家里新买了花'],
            treatment: '抗过敏药+外用药膏',
            difficulty: 2,
            minigame: 'grind',
            fee: 180,
        },
        {
            id: 'indigestion',
            name: '消化不良',
            symptoms: ['腹胀', '便秘', '食欲减退', '口臭'],
            diagnosisHints: ['吃得太快太多', '最近运动量少', '只吃肉不吃蔬菜'],
            treatment: '消化酶+膳食纤维',
            difficulty: 1,
            minigame: 'grind',
            fee: 130,
        },
        {
            id: 'skin_infection',
            name: '皮肤感染',
            symptoms: ['脱毛', '皮屑', '红肿', '脓包'],
            diagnosisHints: ['经常舔同一个地方', '洗澡后没吹干', '被虫子咬了'],
            treatment: '抗生素软膏+药浴',
            difficulty: 2,
            minigame: 'thermometer',
            fee: 220,
        },
        {
            id: 'heat_stroke',
            name: '中暑',
            symptoms: ['喘气急促', '体温过高', '流口水', '步态不稳'],
            diagnosisHints: ['中午带出去散步了', '没开空调', '在阳台晒了一下午'],
            treatment: '物理降温+补液',
            difficulty: 2,
            minigame: 'thermometer',
            fee: 200,
        },
        {
            id: 'fracture',
            name: '骨折',
            symptoms: ['跛行', '触碰惨叫', '肿胀', '不愿站立'],
            diagnosisHints: ['从高处跳下来', '被车撞了', '和其他狗打架'],
            treatment: '接骨+固定绷带',
            difficulty: 3,
            minigame: 'stethoscope',  // 简化为检查
            fee: 500,
            requiresSurgery: true,
        },
    ],

    // ==================== NPC数据 ====================
    NPCS: {
        mr_lin: {
            id: 'mr_lin',
            name: '林先生',
            desc: '中年男性，豆豆的主人',
            avatar: 'npc_mr_lin_worried.png',
            moods: {
                worried: 'npc_mr_lin_worried.png',
                grateful: 'npc_mr_lin_grateful.png',
                trust: 'npc_mr_lin_trust.png',
            },
            unlockDay: 1,
            bondMax: 5,
            dialogue: {
                greeting: ['医生早啊！', '今天豆豆精神不错。'],
                worried: ['医生，豆豆又吐了...', '我真的很担心它。'],
                grateful: ['太感谢了！你是豆豆的救命恩人。'],
            },
        },
        ms_wang: {
            id: 'ms_wang',
            name: '王女士',
            desc: '年轻女性，橘猫主人',
            avatar: 'npc_ms_wang_gentle.png',
            moods: {
                gentle: 'npc_ms_wang_gentle.png',
                anxious: 'npc_ms_wang_anxious.png',
                happy: 'npc_ms_wang_happy.png',
            },
            unlockDay: 1,
            bondMax: 5,
            dialogue: {
                greeting: ['你好呀医生~', '咪咪最近很乖呢。'],
                worried: ['咪咪一直打喷嚏，是不是感冒了？'],
                grateful: ['谢谢你治好了咪咪！'],
            },
        },
        grandma_zhang: {
            id: 'grandma_zhang',
            name: '张奶奶',
            desc: '老年女性，仓鼠主人',
            avatar: 'npc_grandma_kind.png',
            moods: {
                kind: 'npc_grandma_kind.png',
                worried: 'npc_grandma_worried.png',
                relieved: 'npc_grandma_relieved.png',
            },
            unlockDay: 2,
            bondMax: 5,
            dialogue: {
                greeting: ['医生好啊，我来看看你。'],
                worried: ['我的球球最近不爱吃东西...'],
                grateful: ['你真是好孩子，球球多亏了你。'],
            },
        },
        shop_owner: {
            id: 'shop_owner',
            name: '商店老板',
            desc: '胖大叔，宠物商店老板',
            avatar: 'npc_shop_owner_friendly.png',
            moods: {
                friendly: 'npc_shop_owner_friendly.png',
                shrewd: 'npc_shop_owner_shrewd.png',
            },
            unlockDay: 1,
            bondMax: 3,
            dialogue: {
                greeting: ['欢迎光临！今天有什么需要？'],
                worried: ['这批货进价涨了不少啊...'],
                grateful: ['多谢照顾生意！'],
            },
        },
        herbalist: {
            id: 'herbalist',
            name: '草药师',
            desc: '神秘青年，卖稀有草药',
            avatar: 'npc_herbalist_mysterious.png',
            moods: {
                mysterious: 'npc_herbalist_mysterious.png',
                friendly: 'npc_herbalist_friendly.png',
            },
            unlockDay: 3,
            bondMax: 4,
            dialogue: {
                greeting: ['这些草药可不一般...'],
                worried: ['山里的草药越来越少了...'],
                grateful: ['你懂行，下次给你留好货。'],
            },
        },
        rival: {
            id: 'rival',
            name: '陈医生',
            desc: '傲慢的竞争对手兽医',
            avatar: 'npc_rival_arrogant.png',
            moods: {
                arrogant: 'npc_rival_arrogant.png',
                embarrassed: 'npc_rival_embarrassed.png',
                impressed: 'npc_rival_impressed.png',
            },
            unlockDay: 5,
            bondMax: 3,
            dialogue: {
                greeting: ['哼，就你这种小诊所...'],
                worried: ['不可能，我的诊断怎么会错...'],
                grateful: ['...你确实比我强。'],
            },
        },
    },

    // ==================== 库存系统 ====================
    INVENTORY: {
        START: {
            medicine: 4,  // ↓ 8→4 前期资源紧张
            herb: 3,      // ↓ 5→3
            bandage: 2,   // ↓ 3→2
        },
        MAX_SLOT: 99,
    },

    // ==================== 随机事件 ====================
    EVENTS: [
        { id: 'flu_outbreak', name: '流感爆发', desc: '今天呼吸道病例+50%', weight: 5 },
        { id: 'sale', name: '药品特价', desc: '今天采购药品半价', weight: 8 },
        { id: 'celebrity_pet', name: '网红宠物', desc: '网红博主带宠物来看病，治好双倍声望', weight: 3 },
        { id: 'power_outage', name: '停电', desc: '检查室设备不可用', weight: 4 },
        { id: 'mystery_gift', name: '神秘包裹', desc: '收到匿名捐赠的草药', weight: 6 },
        { id: 'doctor_sick', name: '医生生病', desc: '今天操作失误率+20%', weight: 4 },
        { id: 'sunny_day', name: '阳光明媚', desc: '今天压力增长减半', weight: 10 },
        { id: 'rainy_day', name: '阴雨绵绵', desc: '今天病人数量-1', weight: 8 },
    ],

    // ==================== 场景定义 ====================
    SCENES: [
        { id: 'hall', name: '大厅', icon: '🏥', img: 'scene_clinic_hall.png' },
        { id: 'exam', name: '检查室', icon: '🔍', img: 'scene_exam_room.png' },
        { id: 'pharmacy', name: '药房', icon: '💊', img: 'scene_pharmacy.png' },
        { id: 'garden', name: '花园', icon: '🌿', img: 'scene_herb_garden.png' },
        { id: 'shop', name: '商店', icon: '🛒', img: 'scene_pet_shop.png' },
        { id: 'surgery', name: '手术室', icon: '🔪', img: 'scene_surgery_room.png' },
    ],

    // ==================== 医生情绪映射 ====================
    DOCTOR_MOODS: {
        smile: { img: 'doctor_smile.png', name: '微笑' },
        happy: { img: 'doctor_happy.png', name: '开心' },
        serious: { img: 'doctor_serious.png', name: '严肃' },
        confused: { img: 'doctor_confused.png', name: '困惑' },
        surprised: { img: 'doctor_surprised.png', name: '惊讶' },
    },


    // ==================== 道具图标映射 ====================
    ITEM_ICONS: {
        scalpel: 'item_scalpel.png',
        syringe: 'item_syringe.png',
        stethoscope: 'item_stethoscope.png',
        thermometer: 'item_thermometer.png',
        medicine: 'item_medicine.png',
        bandage: 'item_bandage.png',
        herb: 'item_herb.png',
        xray: 'item_xray.png',
        pill_red: 'item_pill_red.png',
        pill_blue: 'item_pill_blue.png',
        pill_yellow: 'item_pill_yellow.png',
        can_cat: 'item_can_cat.png',
        magnifier: 'item_magnifier.png',
    },

    // ==================== 压力条UI ====================
    PRESSURE_UI: {
        frame: 'ui_pressure_frame.png',
        green: 'ui_pressure_green.png',
        yellow: 'ui_pressure_yellow.png',
        red: 'ui_pressure_red.png',
    },

    // ==================== 通用UI映射 ====================
    UI_ASSETS: {
        star_empty: 'ui_star_empty.png',
        star_full: 'ui_star_full.png',
        inventory_slot: 'ui_inventory_slot.png',
        choice_box: 'ui_choice_box.png',
        icon_calendar: 'ui_icon_calendar.png',
    },
};

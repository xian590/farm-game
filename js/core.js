/**
 * 宠物医生模拟器 v0.3 — 核心状态 + 存档系统
 * 游戏状态管理、localStorage安全封装、版本迁移
 */

const Core = {
    // ==================== 游戏状态 ====================
    state: null,

    /** 初始化/重置游戏状态 */
    initState() {
        const E = CONSTANTS.ECONOMY;
        const P = CONSTANTS.PRESSURE;
        const R = CONSTANTS.REPUTATION;
        const I = CONSTANTS.INVENTORY;

        this.state = {
            // 基础信息
            day: 1,
            gold: E.START_GOLD,
            reputation: R.START,
            pressure: P.START,

            // 今日统计
            patientsToday: 0,
            patientsMax: 2,
            curedToday: 0,
            failedToday: 0,
            incomeToday: 0,
            costToday: 0,

            // 当前病人
            currentPatient: null,
            currentStep: 0,

            // 库存
            inventory: { ...I.START },

            // 医生状态
            doctorMood: 'smile',
            selectedItem: null,

            // 今日病人队列
            todayQueue: [],
            waitingPatients: [],

            // 羁绊数据
            npcBonds: {},

            // 统计数据
            totalCured: 0,
            totalFailed: 0,
            totalIncome: 0,
            streakCured: 0,

            // 肉鸽Buff
            dailyBuffs: [],
            
            // 季节事件
            seasonEvent: null,

            // 今日事件（随机事件）
            todayEvent: null,
            todayEvent: null,

            // 解锁状态
            unlockedScenes: ['hall', 'exam', 'pharmacy', 'garden', 'shop'],
            unlockedPets: ['shiba', 'orange_cat'],

            // 存档版本
            saveVersion: CONSTANTS.VERSION,

            // 时间戳
            lastSaveTime: Date.now(),
        };

        return this.state;
    },

    /** 获取当前状态 */
    getState() {
        if (!this.state) this.initState();
        return this.state;
    },

    // ==================== 存档系统 ====================

    SAVE_KEY: 'pet_doctor_save_v3',
    BACKUP_KEY: 'pet_doctor_save_backup',
    MAX_SAVE_SIZE: 5 * 1024 * 1024, // 5MB localStorage上限保护

    /** 安全保存（带错误处理） */
    save() {
        try {
            const state = this.getState();
            state.lastSaveTime = Date.now();
            state.saveVersion = CONSTANTS.VERSION;

            const data = JSON.stringify(state);

            // 检查大小
            if (data.length > this.MAX_SAVE_SIZE) {
                console.warn('[SAVE] 存档过大，尝试压缩');
                // 简化：不保存历史记录
                const slim = { ...state };
                delete slim.todayQueue;  // 运行时数据不存
                const slimData = JSON.stringify(slim);
                localStorage.setItem(this.SAVE_KEY, slimData);
            } else {
                localStorage.setItem(this.SAVE_KEY, data);
            }

            // 同时保存备份
            localStorage.setItem(this.BACKUP_KEY, data);
            console.log('[SAVE] 存档成功 Day', state.day);
            return true;

        } catch (e) {
            console.error('[SAVE ERROR]', e);
            
            // 错误分类处理
            if (e.name === 'QuotaExceededError') {
                console.warn('[SAVE] localStorage已满，尝试清理');
                this._handleQuotaExceeded();
            }

            // 内存备份（降级方案）
            this._memoryBackup = JSON.stringify(this.getState());
            console.warn('[SAVE] 已降级到内存备份');
            return false;
        }
    },

    /** 安全加载 */
    load() {
        try {
            let data = localStorage.getItem(this.SAVE_KEY);

            // 主存档损坏，尝试备份
            if (!data) {
                console.warn('[LOAD] 主存档不存在，尝试备份');
                data = localStorage.getItem(this.BACKUP_KEY);
            }

            if (!data) {
                console.log('[LOAD] 无存档，初始化新游戏');
                return this.initState();
            }

            let state = JSON.parse(data);

            // 版本检测与迁移
            state = this._migrate(state);

            this.state = state;
            console.log('[LOAD] 存档加载成功 Day', state.day, '版本', state.saveVersion);
            return state;

        } catch (e) {
            console.error('[LOAD ERROR]', e);
            
            // 尝试内存备份
            if (this._memoryBackup) {
                try {
                    this.state = JSON.parse(this._memoryBackup);
                    console.warn('[LOAD] 从内存备份恢复');
                    return this.state;
                } catch (e2) {
                    console.error('[LOAD] 内存备份也损坏');
                }
            }

            // 最终降级：新游戏
            console.error('[LOAD] 存档无法恢复，开始新游戏');
            return this.initState();
        }
    },

    /** 检查是否有存档 */
    hasSave() {
        try {
            return !!localStorage.getItem(this.SAVE_KEY);
        } catch (e) {
            return false;
        }
    },

    /** 删除存档 */
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            localStorage.removeItem(this.BACKUP_KEY);
            this._memoryBackup = null;
            console.log('[SAVE] 存档已删除');
            return true;
        } catch (e) {
            console.error('[SAVE DELETE ERROR]', e);
            return false;
        }
    },

    /** 自动保存（节流，每30秒最多一次） */
    autoSave: (() => {
        let lastSave = 0;
        const interval = 30000; // 30秒
        return function() {
            const now = Date.now();
            if (now - lastSave < interval) return;
            lastSave = now;
            Core.save();
        };
    })(),

    // ==================== 版本迁移 ====================

    _migrate(state) {
        const version = state.saveVersion || 0;

        if (version < 1) {
            // v0.1 → v0.2: 新增pressure字段
            state.pressure = state.pressure || CONSTANTS.PRESSURE.START;
            state.inventory = state.inventory || { ...CONSTANTS.INVENTORY.START };
        }

        if (version < 2) {
            // v0.2 → v0.3: 新增NPC羁绊、统计、解锁
            state.npcBonds = state.npcBonds || {};
            state.totalCured = state.totalCured || 0;
            state.totalFailed = state.totalFailed || 0;
            state.totalIncome = state.totalIncome || 0;
            state.streakCured = state.streakCured || 0;
            state.todayEvent = state.todayEvent || null;
            state.unlockedScenes = state.unlockedScenes || ['hall', 'exam', 'pharmacy', 'garden', 'shop'];
            state.unlockedPets = state.unlockedPets || ['shiba', 'orange_cat'];
            state.todayQueue = state.todayQueue || [];
            state.waitingPatients = state.waitingPatients || [];
        }

        if (version < 3) {
            // v0.3: 新增时间戳
            state.lastSaveTime = state.lastSaveTime || Date.now();
        }

        state.saveVersion = CONSTANTS.VERSION;
        return state;
    },

    // ==================== localStorage配额处理 ====================

    _handleQuotaExceeded() {
        try {
            // 清理其他游戏的localStorage（如果有）
            const keys = Object.keys(localStorage);
            let freed = 0;
            for (const key of keys) {
                if (key !== this.SAVE_KEY && key !== this.BACKUP_KEY) {
                    const size = localStorage.getItem(key)?.length || 0;
                    localStorage.removeItem(key);
                    freed += size;
                    if (freed > 100000) break; // 清理100KB就够
                }
            }
            console.log('[SAVE] 清理了', freed, '字节的其他数据');
        } catch (e) {
            console.error('[SAVE] 清理失败', e);
        }
    },

    // ==================== 内存备份 ====================
    _memoryBackup: null,

    // ==================== 状态修改器（带边界检查） ====================

    /** 修改金币 */
    addGold(amount) {
        const state = this.getState();
        const E = CONSTANTS.ECONOMY;
        state.gold = Utils.clamp(state.gold + amount, -99999, E.MAX_GOLD);
        if (amount > 0) state.incomeToday += amount;
        if (amount < 0) state.costToday += Math.abs(amount);
        return state.gold;
    },

    /** 修改声望 */
    addReputation(delta) {
        const state = this.getState();
        const R = CONSTANTS.REPUTATION;
        const oldRep = state.reputation;
        state.reputation = Utils.clamp(state.reputation + delta, R.MIN, R.MAX);
        
        // 检测升级
        const oldLevel = Math.floor(oldRep);
        const newLevel = Math.floor(state.reputation);
        if (newLevel > oldLevel) {
            console.log('[REP] 声望升级！', oldLevel, '→', newLevel);
            this._onReputationUp(newLevel);
        }
        
        return state.reputation;
    },

    /** 修改压力 */
    addPressure(delta) {
        const state = this.getState();
        const P = CONSTANTS.PRESSURE;
        state.pressure = Utils.clamp(state.pressure + delta, P.MIN, P.MAX);
        
        // 检测临界
        if (state.pressure >= P.MAX) {
            console.log('[PRESSURE] 压力爆表！');
            return 'EXPLODE';
        }
        
        return state.pressure;
    },

    /** 声望升级回调 */
    _onReputationUp(level) {
        const state = this.getState();
        const R = CONSTANTS.REPUTATION;
        
        // 解锁新内容
        if (level >= 2) {
            state.unlockedScenes.push('surgery');
            state.patientsMax = Math.min(6, state.patientsMax + 1);
        }
        if (level >= 3) {
            state.unlockedPets.push('golden', 'corgi');
        }
        if (level >= 4) {
            state.unlockedPets.push('hamster', 'parrot');
            state.patientsMax = Math.min(6, state.patientsMax + 1);
        }
        if (level >= 5) {
            state.unlockedPets.push('rabbit', 'chinchilla');
        }
    },

    /** 检查库存 */
    hasItem(itemId, count = 1) {
        return (this.getState().inventory[itemId] || 0) >= count;
    },

    /** 消耗/增加库存 */
    modifyInventory(itemId, delta) {
        const state = this.getState();
        const I = CONSTANTS.INVENTORY;
        state.inventory[itemId] = Utils.clamp(
            (state.inventory[itemId] || 0) + delta,
            0,
            I.MAX_SLOT
        );
        return state.inventory[itemId];
    },

    /** 增加NPC羁绊 */
    addBond(npcId, delta) {
        const state = this.getState();
        const npc = CONSTANTS.NPCS[npcId];
        if (!npc) return 0;
        
        state.npcBonds[npcId] = Utils.clamp(
            (state.npcBonds[npcId] || 0) + delta,
            0,
            npc.bondMax
        );
        return state.npcBonds[npcId];
    },

    /** 获取NPC羁绊等级 */
    getBondLevel(npcId) {
        return this.getState().npcBonds[npcId] || 0;
    },

    // ==================== 一天结束/开始 ====================

    /** 开始新的一天 */
    startNewDay() {
        const state = this.getState();
        const E = CONSTANTS.ECONOMY;
        
        // 保存昨日数据到统计
        state.totalCured += state.curedToday;
        state.totalFailed += state.failedToday;
        state.totalIncome += state.incomeToday;
        
        // 更新连续治愈
        if (state.curedToday > 0 && state.failedToday === 0) {
            state.streakCured++;
        } else {
            state.streakCured = 0;
        }
        
        // 交租日检查
        if (state.day % E.RENT_DUE_DAYS === 0) {
            this.addGold(-E.DAILY_RENT * E.RENT_DUE_DAYS);
            console.log('[RENT] 交租 ¥', E.DAILY_RENT * E.RENT_DUE_DAYS);
        }
        
        // 检查破产
        if (state.gold < 0) {
            state._wasBankrupt = true;
            state._bankruptDays = (state._bankruptDays || 0) + 1;
            if (state._bankruptDays >= E.BANKRUPTCY_DAYS) {
                return 'BANKRUPT';
            }
        } else {
            state._bankruptDays = 0;
        }
        
        // 记录最大连续治愈
        if (state.streakCured > (state._maxStreakCured || 0)) {
            state._maxStreakCured = state.streakCured;
        }
        
        // 重置今日数据
        state.day++;
        state.patientsToday = 0;
        state.curedToday = 0;
        state.failedToday = 0;
        state.incomeToday = 0;
        state.costToday = 0;
        state.pressure = CONSTANTS.PRESSURE.START;
        state.currentPatient = null;
        state.currentStep = 0;
        state.doctorMood = 'smile';
        state.selectedItem = null;
        state.waitingPatients = [];
        
        // 计算今日病人数量
        const repLevel = Math.floor(state.reputation);
        const levelData = CONSTANTS.REPUTATION.LEVELS[Math.min(repLevel, 4)];
        state.patientsMax = Utils.randInt(levelData.dailyPatients[0], levelData.dailyPatients[1]);
        
        // 生成今日事件
        state.todayEvent = this._generateDailyEvent();
        
        // 生成病人队列
        state.todayQueue = PatientGen.generateQueue(state.patientsMax, state.reputation, state.todayEvent);
        
        console.log('[DAY] 第', state.day, '天开始，预计', state.patientsMax, '个病人');
        if (state.todayEvent) {
            console.log('[EVENT] 今日事件:', state.todayEvent.name);
        }
        
        this.save();
        return 'OK';
    },

    /** 生成每日随机事件 */
    _generateDailyEvent() {
        const events = CONSTANTS.EVENTS;
        const roll = Math.random() * 100;
        if (roll < 40) {  // 40%概率触发事件
            const event = Utils.weightedPick(events);
            return { ...event };
        }
        return null;
    },
};

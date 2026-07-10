/**
 * 宠物医生模拟器 v0.3 — 肉鸽Buff系统
 * 参考杯杯倒满：每天随机2个buff，改变当天核心玩法
 */

const BuffSystem = {
    // ==================== Buff定义 ====================
    
    BUFFS: {
        // === 正面Buff（普通）===
        steady_hands: {
            id: 'steady_hands',
            name: '稳如泰山',
            desc: '今天压力增长减半',
            icon: '🧘',
            rarity: 'common',
            type: 'positive',
            effect: { pressureGrowth: 0.5 },
        },
        eagle_eye: {
            id: 'eagle_eye',
            name: '鹰眼诊断',
            desc: '听诊器心跳区域扩大30%',
            icon: '👁️',
            rarity: 'common',
            type: 'positive',
            effect: { heartZoneSize: 1.3 },
        },
        herbal_fortune: {
            id: 'herbal_fortune',
            name: '草药丰收',
            desc: '研磨草药进度积累速度+50%',
            icon: '🌿',
            rarity: 'common',
            type: 'positive',
            effect: { grindSpeed: 1.5 },
        },
        cheap_supply: {
            id: 'cheap_supply',
            name: '特价进货',
            desc: '今天购买药品半价',
            icon: '🏷️',
            rarity: 'common',
            type: 'positive',
            effect: { shopDiscount: 0.5 },
        },
        rich_patients: {
            id: 'rich_patients',
            name: '土豪客人',
            desc: '今天所有诊金+50%',
            icon: '💰',
            rarity: 'common',
            type: 'positive',
            effect: { feeMultiplier: 1.5 },
        },
        
        // === 正面Buff（稀有）===
        perfect_cure: {
            id: 'perfect_cure',
            name: '妙手回春',
            desc: '今天治愈率+20%（失败重判一次）',
            icon: '✨',
            rarity: 'rare',
            type: 'positive',
            effect: { cureBonus: 0.2, rerollOnFail: true },
        },
        quick_recovery: {
            id: 'quick_recovery',
            name: '快速恢复',
            desc: '治愈一个病人后压力-15（而不是-10）',
            icon: '⚡',
            rarity: 'rare',
            type: 'positive',
            effect: { pressureRelief: 1.5 },
        },
        
        // === 正面Buff（传奇）===
        legendary_vet: {
            id: 'legendary_vet',
            name: '传奇兽医',
            desc: '今天所有迷你游戏满分通过',
            icon: '👑',
            rarity: 'legendary',
            type: 'positive',
            effect: { autoPerfectMinigame: true },
        },
        
        // === 负面Buff（普通）===
        shaky_hands: {
            id: 'shaky_hands',
            name: '手抖',
            desc: '研磨草药反向旋转时进度倒退',
            icon: '😵',
            rarity: 'common',
            type: 'negative',
            effect: { grindReversePenalty: true },
        },
        old_equipment: {
            id: 'old_equipment',
            name: '设备老旧',
            desc: '迷你游戏判定区缩小20%',
            icon: '🔧',
            rarity: 'common',
            type: 'negative',
            effect: { hitZoneShrink: 0.8 },
        },
        virus_outbreak: {
            id: 'virus_outbreak',
            name: '病毒爆发',
            desc: '今天寄生虫/流感病例+80%',
            icon: '🦠',
            rarity: 'common',
            type: 'negative',
            effect: { fluBias: true },
        },
        impatient_queue: {
            id: 'impatient_queue',
            name: '暴躁客人',
            desc: '等待病人压力增加翻倍',
            icon: '😤',
            rarity: 'common',
            type: 'negative',
            effect: { waitingPressureMultiplier: 2 },
        },
        price_hike: {
            id: 'price_hike',
            name: '物价飞涨',
            desc: '今天药品采购价格翻倍',
            icon: '📈',
            rarity: 'common',
            type: 'negative',
            effect: { shopPriceMultiplier: 2 },
        },
        
        // === 负面Buff（稀有）===
        doctor_sick: {
            id: 'doctor_sick',
            name: '医生生病',
            desc: '今天操作失误率+25%，压力+10起步',
            icon: '🤒',
            rarity: 'rare',
            type: 'negative',
            effect: { startPressure: 20, failRate: 0.25 },
        },
        power_outage: {
            id: 'power_outage',
            name: '停电危机',
            desc: '检查室设备不可用，只能用基础诊断',
            icon: '🔌',
            rarity: 'rare',
            type: 'negative',
            effect: { noEquipment: true },
        },
    },

    // ==================== Buff抽取 ====================
    
    /** 生成今日Buff（一正一负，或双正/双负稀有情况） */
    generateDailyBuffs() {
        const positives = Object.values(this.BUFFS).filter(b => b.type === 'positive');
        const negatives = Object.values(this.BUFFS).filter(b => b.type === 'negative');
        
        const buffs = [];
        
        // 70%概率一正一负，20%双正，10%双负
        const roll = Math.random();
        if (roll < 0.7) {
            buffs.push(this._weightedPick(positives));
            buffs.push(this._weightedPick(negatives));
        } else if (roll < 0.9) {
            buffs.push(this._weightedPick(positives));
            buffs.push(this._weightedPick(positives));
        } else {
            buffs.push(this._weightedPick(negatives));
            buffs.push(this._weightedPick(negatives));
        }
        
        return buffs.map(b => ({ ...b })); // 深拷贝
    },
    
    /** 按稀有度加权抽取 */
    _weightedPick(buffList) {
        const weights = { common: 5, rare: 2, legendary: 0.5 };
        const total = buffList.reduce((sum, b) => sum + (weights[b.rarity] || 1), 0);
        let r = Math.random() * total;
        for (const buff of buffList) {
            r -= (weights[buff.rarity] || 1);
            if (r <= 0) return buff;
        }
        return buffList[buffList.length - 1];
    },
    
    // ==================== Buff效果查询 ====================
    
    /** 获取当前激活的所有buff效果（叠加） */
    getActiveEffects() {
        const state = Core.getState();
        const effects = {};
        
        if (!state.dailyBuffs) return effects;
        
        state.dailyBuffs.forEach(buff => {
            if (buff.effect) {
                Object.entries(buff.effect).forEach(([key, val]) => {
                    if (typeof val === 'number') {
                        effects[key] = (effects[key] || 1) * val; // 乘法叠加
                    } else if (typeof val === 'boolean') {
                        effects[key] = val; // 布尔覆盖
                    }
                });
            }
        });
        
        return effects;
    },
    
    /** 检查是否有特定buff */
    hasBuff(buffId) {
        const state = Core.getState();
        return state.dailyBuffs && state.dailyBuffs.some(b => b.id === buffId);
    },
    
    /** 获取特定buff效果 */
    getEffect(effectKey, defaultVal) {
        const effects = this.getActiveEffects();
        return effects[effectKey] !== undefined ? effects[effectKey] : defaultVal;
    },
    
    // ==================== Buff应用辅助 ====================
    
    /** 计算实际诊金（含buff加成） */
    calculateFee(baseFee) {
        return Math.floor(baseFee * this.getEffect('feeMultiplier', 1));
    },
    
    /** 计算实际压力增长（含buff减免） */
    calculatePressureGrowth(delta) {
        return Math.floor(delta * this.getEffect('pressureGrowth', 1));
    },
    
    /** 计算实际药品价格（含buff折扣） */
    calculateShopPrice(basePrice) {
        return Math.floor(basePrice * this.getEffect('shopPriceMultiplier', 1) * (1 - (1 - this.getEffect('shopDiscount', 1))));
    },
    
    /** 迷你游戏是否自动满分 */
    isAutoPerfect() {
        return this.getEffect('autoPerfectMinigame', false);
    },
    
    /** 压力初始值加成 */
    getStartPressure() {
        return this.getEffect('startPressure', 0);
    },
    
    // ==================== Buff UI ====================
    
    /** 生成Buff显示文本 */
    formatBuffList(buffs) {
        if (!buffs || buffs.length === 0) return '';
        return buffs.map(b => {
            const rarityEmoji = { common: '⚪', rare: '🔵', legendary: '🟡' }[b.rarity] || '⚪';
            return `${rarityEmoji} ${b.icon} ${b.name}`;
        }).join(' | ');
    },
    
    /** 生成Buff详细描述 */
    formatBuffDetails(buffs) {
        if (!buffs || buffs.length === 0) return '今天没有特殊事件。';
        return buffs.map(b => {
            const typeText = b.type === 'positive' ? '✅' : '❌';
            return `${typeText} ${b.icon} **${b.name}**：${b.desc}`;
        }).join('\n');
    },
};

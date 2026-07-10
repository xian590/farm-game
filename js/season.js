/**
 * 宠物医生模拟器 v0.3 — 季节系统
 * 参考东方夜雀食堂：春夏秋冬影响病例类型、场景色调、背景音乐
 */

const SeasonSystem = {
    // ==================== 季节定义 ====================
    
    SEASONS: ['spring', 'summer', 'autumn', 'winter'],
    
    SEASON_DATA: {
        spring: {
            name: '春天',
            icon: '🌸',
            desc: '万物复苏，过敏病例增加',
            color: '#ffb7c5', // 樱花粉
            bgOverlay: 'rgba(255,183,197,0.08)',
            conditionBias: ['allergy', 'skin_infection'], // 过敏/皮肤病概率+50%
            petActivity: 1.2, // 宠物活跃度+20%（更多病例）
            herbGrowth: 1.5, // 草药生长速度+50%
        },
        summer: {
            name: '夏天',
            icon: '☀️',
            desc: '炎热高温，中暑病例增加',
            color: '#ffd166',
            bgOverlay: 'rgba(255,209,102,0.08)',
            conditionBias: ['heat_stroke', 'food_poisoning'], // 中暑/食物中毒
            petActivity: 1.0,
            herbGrowth: 1.2,
        },
        autumn: {
            name: '秋天',
            icon: '🍂',
            desc: '天气转凉，流感病例增加',
            color: '#e29578',
            bgOverlay: 'rgba(226,149,120,0.08)',
            conditionBias: ['cat_flu', 'indigestion'], // 流感/消化不良
            petActivity: 0.9, // 稍微减少
            herbGrowth: 1.0,
        },
        winter: {
            name: '冬天',
            icon: '❄️',
            desc: '寒冷刺骨，呼吸道疾病高发',
            color: '#a8dadc',
            bgOverlay: 'rgba(168,218,220,0.1)',
            conditionBias: ['cat_flu', 'parasite'], // 流感/寄生虫（室内聚集）
            petActivity: 0.7, // 明显减少
            herbGrowth: 0.5, // 草药生长减半
        },
    },
    
    // ==================== 季节计算 ====================
    
    /** 根据游戏天数计算季节（每30天一个季节） */
    getSeason(day) {
        const seasonIndex = Math.floor((day - 1) / 30) % 4;
        return this.SEASONS[seasonIndex];
    },
    
    /** 获取当前季节数据 */
    getCurrentSeasonData() {
        const day = Core.getState().day;
        return this.SEASON_DATA[this.getSeason(day)];
    },
    
    /** 获取季节名称 */
    getSeasonName(day) {
        return this.SEASON_DATA[this.getSeason(day || Core.getState().day)].name;
    },
    
    // ==================== 季节影响 ====================
    
    /** 计算季节对病例的偏置（返回加权后的病例列表） */
    applyConditionBias(conditions) {
        const season = this.getCurrentSeasonData();
        const biasIds = season.conditionBias || [];
        
        return conditions.map(c => {
            const isBiased = biasIds.includes(c.id);
            return {
                ...c,
                _weight: (c._weight || (6 - c.difficulty)) * (isBiased ? 2 : 1),
            };
        });
    },
    
    /** 计算季节对草药采集的影响 */
    getHerbBonus() {
        return this.getCurrentSeasonData().herbGrowth || 1;
    },
    
    /** 计算季节对病人数量的影响 */
    getPatientMultiplier() {
        return this.getCurrentSeasonData().petActivity || 1;
    },
    
    // ==================== 季节UI ====================
    
    /** 获取季节图标+名称 */
    formatSeason(day) {
        const data = this.SEASON_DATA[this.getSeason(day)];
        return `${data.icon} ${data.name}`;
    },
    
    /** 获取季节描述 */
    getSeasonDesc(day) {
        return this.SEASON_DATA[this.getSeason(day)].desc;
    },
    
    /** 应用季节色调到场景 */
    applySeasonTint() {
        const season = this.getCurrentSeasonData();
        const container = document.getElementById('game-container');
        if (!container) return;
        
        // 移除旧的季节滤镜
        container.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
        
        // 添加新的季节类（CSS中定义）
        const seasonClass = 'season-' + this.getSeason(Core.getState().day);
        container.classList.add(seasonClass);
    },
    
    // ==================== 季节事件 ====================
    
    /** 生成季节特有事件 */
    generateSeasonEvent() {
        const season = this.getSeason(Core.getState().day);
        const events = {
            spring: [
                { name: '花粉过敏季', desc: '今天过敏病例+100%', bias: 'allergy' },
                { name: '春雷', desc: '今天诊所设备不稳定，操作失误率+10%', bias: 'equipment' },
            ],
            summer: [
                { name: '酷暑警告', desc: '今天中暑病例+100%，草药枯萎加快', bias: 'heat' },
                { name: '暴雨', desc: '今天病人减少2个，但暴雨后草药丰收', bias: 'rain' },
            ],
            autumn: [
                { name: '流感季', desc: '今天流感病例+100%', bias: 'flu' },
                { name: '丰收节', desc: '今天草药采集双倍', bias: 'harvest' },
            ],
            winter: [
                { name: '严寒', desc: '今天所有病例难度+1，诊金+50%', bias: 'cold' },
                { name: '雪灾', desc: '今天病人减少3个，但来的都是急症', bias: 'snow' },
            ],
        }[season] || [];
        
        if (events.length === 0) return null;
        return Utils.pick(events);
    },
};

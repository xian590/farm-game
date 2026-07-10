/**
 * 宠物医生模拟器 v0.3 — 成就系统
 * 20个成就，含触发条件、解锁奖励、进度追踪
 */

const AchievementSystem = {
    // ==================== 成就定义 ====================
    
    ACHIEVEMENTS: [
        // === 新手教程类 ===
        {
            id: 'first_cure',
            name: '初次治愈',
            desc: '成功治愈第一只宠物',
            icon: '💊',
            condition: (s) => s.totalCured >= 1,
            reward: { gold: 100 },
            hidden: false,
        },
        {
            id: 'first_day',
            name: '开业大吉',
            desc: '完成第一天营业',
            icon: '🎉',
            condition: (s) => s.day >= 2,
            reward: { gold: 200 },
            hidden: false,
        },
        
        // === 治愈数量类 ===
        {
            id: 'cure_10',
            name: '小有名气',
            desc: '累计治愈10只宠物',
            icon: '🏥',
            condition: (s) => s.totalCured >= 10,
            reward: { gold: 500, reputation: 0.2 },
            hidden: false,
        },
        {
            id: 'cure_50',
            name: '妙手回春',
            desc: '累计治愈50只宠物',
            icon: '✨',
            condition: (s) => s.totalCured >= 50,
            reward: { gold: 2000, reputation: 0.5 },
            hidden: false,
        },
        {
            id: 'cure_100',
            name: '传奇兽医',
            desc: '累计治愈100只宠物',
            icon: '👑',
            condition: (s) => s.totalCured >= 100,
            reward: { gold: 5000, reputation: 1.0 },
            hidden: false,
        },
        
        // === 连续治愈类 ===
        {
            id: 'streak_5',
            name: '连战连胜',
            desc: '连续5天无治疗失败',
            icon: '🔥',
            condition: (s) => s.streakCured >= 5,
            reward: { gold: 300 },
            hidden: false,
        },
        {
            id: 'streak_10',
            name: '完美诊所',
            desc: '连续10天无治疗失败',
            icon: '💯',
            condition: (s) => s.streakCured >= 10,
            reward: { gold: 1000, reputation: 0.3 },
            hidden: false,
        },
        
        // === 声望类 ===
        {
            id: 'rep_2',
            name: '口碑传播',
            desc: '声望达到2星',
            icon: '⭐⭐',
            condition: (s) => s.reputation >= 2.0,
            reward: { gold: 300 },
            hidden: false,
        },
        {
            id: 'rep_4',
            name: '名满全城',
            desc: '声望达到4星',
            icon: '⭐⭐⭐⭐',
            condition: (s) => s.reputation >= 4.0,
            reward: { gold: 1500, reputation: 0.5 },
            hidden: false,
        },
        {
            id: 'rep_5',
            name: '传说级',
            desc: '声望达到满星5星',
            icon: '⭐⭐⭐⭐⭐',
            condition: (s) => s.reputation >= 5.0,
            reward: { gold: 3000, reputation: 0.5 },
            hidden: false,
        },
        
        // === 经济类 ===
        {
            id: 'rich_5000',
            name: '小富即安',
            desc: '累计资金超过5000',
            icon: '💰',
            condition: (s) => s.gold >= 5000,
            reward: { gold: 200 },
            hidden: false,
        },
        {
            id: 'rich_20000',
            name: '财源滚滚',
            desc: '累计资金超过20000',
            icon: '💎',
            condition: (s) => s.gold >= 20000,
            reward: { gold: 1000 },
            hidden: false,
        },
        
        // === 迷你游戏类 ===
        {
            id: 'perfect_stethoscope',
            name: '听诊大师',
            desc: '听诊游戏获得满分',
            icon: '🔍',
            condition: (s) => s._perfectStethoscope || false,
            reward: { gold: 100 },
            hidden: false,
        },
        {
            id: 'perfect_grind',
            name: '研磨达人',
            desc: '研磨草药游戏获得满分',
            icon: '🌿',
            condition: (s) => s._perfectGrind || false,
            reward: { gold: 100 },
            hidden: false,
        },
        
        // === 羁绊类 ===
        {
            id: 'bond_max_1',
            name: '知心朋友',
            desc: '与任意NPC达到羁绊满级',
            icon: '❤️',
            condition: (s) => Object.values(s.npcBonds || {}).some(b => b >= 5),
            reward: { gold: 500 },
            hidden: false,
        },
        {
            id: 'all_bonds',
            name: '社交达人',
            desc: '与所有NPC达到羁绊满级',
            icon: '🤝',
            condition: (s) => {
                const npcs = Object.keys(CONSTANTS.NPCS);
                const bonds = s.npcBonds || {};
                return npcs.every(id => (bonds[id] || 0) >= 5);
            },
            reward: { gold: 2000, reputation: 0.5 },
            hidden: false,
        },
        
        // === 宠物图鉴类 ===
        {
            id: 'album_5',
            name: '宠物收藏家',
            desc: '解锁5种宠物',
            icon: '📖',
            condition: (s) => (s.unlockedPets || []).length >= 5,
            reward: { gold: 300 },
            hidden: false,
        },
        {
            id: 'album_all',
            name: '百兽之王',
            desc: '解锁所有10种宠物',
            icon: '🦁',
            condition: (s) => (s.unlockedPets || []).length >= 10,
            reward: { gold: 1000, reputation: 0.3 },
            hidden: false,
        },
        
        // === 特殊/隐藏类 ===
        {
            id: 'bankrupt_survivor',
            name: '破产边缘',
            desc: '资金降到0以下后恢复盈利',
            icon: '🎢',
            condition: (s) => s._wasBankrupt && s.gold > 0,
            reward: { gold: 500 },
            hidden: true,
        },
        {
            id: 'no_pressure',
            name: '从容不迫',
            desc: '完成一天营业且压力始终低于30%',
            icon: '😌',
            condition: (s) => s._noPressureDay || false,
            reward: { gold: 200 },
            hidden: true,
        },
        {
            id: 'speed_demon',
            name: '闪电医生',
            desc: '一天内接诊所有病人且平均用时<2分钟',
            icon: '⚡',
            condition: (s) => s._speedDemon || false,
            reward: { gold: 500 },
            hidden: true,
        },
    ],
    
    // ==================== 成就检查 ====================
    
    /** 检查所有成就，返回新解锁的列表 */
    checkAll() {
        const state = Core.getState();
        const unlocked = state.achievements || [];
        const newlyUnlocked = [];
        
        this.ACHIEVEMENTS.forEach(ach => {
            if (!unlocked.includes(ach.id) && ach.condition(state)) {
                unlocked.push(ach.id);
                newlyUnlocked.push(ach);
                this._applyReward(ach.reward);
            }
        });
        
        state.achievements = unlocked;
        
        if (newlyUnlocked.length > 0) {
            Core.save();
        }
        
        return newlyUnlocked;
    },
    
    /** 应用奖励 */
    _applyReward(reward) {
        if (!reward) return;
        if (reward.gold) Core.addGold(reward.gold);
        if (reward.reputation) Core.addReputation(reward.reputation);
    },
    
    // ==================== 成就状态标记 ====================
    
    /** 标记某个事件（供外部调用） */
    markFlag(flagName) {
        const state = Core.getState();
        state['_' + flagName] = true;
    },
    
    /** 设置标记值 */
    setFlag(flagName, value) {
        const state = Core.getState();
        state['_' + flagName] = value;
    },
    
    // ==================== 成就UI ====================
    
    /** 获取成就列表（已解锁/未解锁） */
    getList() {
        const state = Core.getState();
        const unlocked = state.achievements || [];
        
        return this.ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: unlocked.includes(ach.id),
        }));
    },
    
    /** 格式化成就显示 */
    formatAchievement(ach) {
        const status = ach.unlocked ? '✅' : '🔒';
        const hiddenText = ach.hidden && !ach.unlocked ? '???' : ach.desc;
        return `${status} ${ach.icon} ${ach.name} — ${hiddenText}`;
    },
    
    /** 生成成就面板文本 */
    formatPanel() {
        const list = this.getList();
        const unlocked = list.filter(a => a.unlocked);
        const total = list.length;
        
        let text = `🏆 成就列表 (${unlocked.length}/${total})\n\n`;
        
        list.forEach(ach => {
            text += this.formatAchievement(ach) + '\n';
        });
        
        return text;
    },
    
    /** 显示新解锁弹窗 */
    showUnlock(ach) {
        const rewardText = [];
        if (ach.reward?.gold) rewardText.push(`¥${ach.reward.gold}`);
        if (ach.reward?.reputation) rewardText.push(`声望+${ach.reward.reputation}`);
        
        UI.updateDialogue({
            name: '🏆 成就解锁',
            mood: '恭喜',
            avatar: 'item_star.png',
            text: `${ach.icon} **${ach.name}**\n${ach.desc}\n${rewardText.length > 0 ? '奖励：' + rewardText.join(' ') : ''}`,
            choices: [{ text: '🎉 太棒了！', action: () => {} }]
        });
    },
};

/**
 * 宠物医生模拟器 v0.3 — 多结局系统
 * 100天后根据综合数据判定结局
 */

const EndingSystem = {
    // ==================== 结局定义 ====================
    
    ENDINGS: {
        // === 好结局 ===
        legendary_vet: {
            id: 'legendary_vet',
            name: '传奇兽医',
            desc: '你的诊所成为了全市最知名的宠物医院，无数人慕名而来。你不仅治愈了病痛，更温暖了每一颗爱宠的心。',
            condition: (s) => s.reputation >= 4.5 && s.totalCured >= 100 && s.totalFailed <= 10,
            icon: '👑',
            grade: 'S',
        },
        beloved_doctor: {
            id: 'beloved_doctor',
            name: '最受爱戴的医生',
            desc: '虽然没有成为传奇，但附近的每一个宠物主人都信任你。你的诊所是社区最温暖的一角。',
            condition: (s) => s.reputation >= 3.5 && Object.values(s.npcBonds || {}).some(b => b >= 5),
            icon: '❤️',
            grade: 'A',
        },
        rich_clinic: {
            id: 'rich_clinic',
            name: '商业帝国',
            desc: '你的诊所扩张成了连锁品牌，财源滚滚。虽然有人说你太过商业化，但没人能否认你的成功。',
            condition: (s) => s.gold >= 50000,
            icon: '💎',
            grade: 'A',
        },
        
        // === 普通结局 ===
        steady_clinic: {
            id: 'steady_clinic',
            name: '稳健的经营者',
            desc: '100天过去了，你的诊所依然稳定运转。虽然没有大起大落，但每一天都在变得更好。',
            condition: (s) => s.reputation >= 2.0 && s.totalCured >= 30,
            icon: '🏥',
            grade: 'B',
        },
        
        // === 坏结局 ===
        struggling_clinic: {
            id: 'struggling_clinic',
            name: '艰难求存',
            desc: '诊所勉强维持着，但客人越来越少。你开始怀疑，自己是否适合做一名宠物医生...',
            condition: (s) => s.reputation < 2.0 && s.gold < 5000,
            icon: '😔',
            grade: 'C',
        },
        bankrupt: {
            id: 'bankrupt',
            name: '诊所倒闭',
            desc: '资金链断裂，诊所被迫关闭。那些被你治愈过的宠物，偶尔会路过你曾经的大门...',
            condition: (s) => s.gold < 0 || s._wasBankrupt,
            icon: '💔',
            grade: 'D',
        },
        
        // === 隐藏结局 ===
        rival_partner: {
            id: 'rival_partner',
            name: '竞争对手的和解',
            desc: '你和陈医生最终放下了竞争，联手开了一家更大的诊所。原来，最好的对手也是最好的朋友。',
            condition: (s) => {
                const rivalBond = (s.npcBonds || {}).rival || 0;
                return rivalBond >= 3 && s.reputation >= 4.0;
            },
            icon: '🤝',
            grade: 'S+',
        },
        herbalist_secret: {
            id: 'herbalist_secret',
            name: '草药师的秘密',
            desc: '草药师向你透露了一个秘密——他的草药是从一个传说中的山谷采集的。你们决定一起探索...',
            condition: (s) => {
                const herbBond = (s.npcBonds || {}).herbalist || 0;
                return herbBond >= 4 && s.totalCured >= 50;
            },
            icon: '🔮',
            grade: 'S+',
        },
    },
    
    // ==================== 结局判定 ====================
    
    /** 检查是否满足结局条件（100天后调用） */
    checkEnding() {
        const state = Core.getState();
        
        // 检查所有结局，按优先级（S+ > S > A > B > C > D）
        const priority = ['S+', 'S', 'A', 'B', 'C', 'D'];
        const matched = [];
        
        Object.values(this.ENDINGS).forEach(ending => {
            if (ending.condition(state)) {
                matched.push(ending);
            }
        });
        
        if (matched.length === 0) {
            // 默认结局
            return this.ENDINGS.steady_clinic;
        }
        
        // 按等级优先级排序，取最高
        matched.sort((a, b) => {
            return priority.indexOf(a.grade) - priority.indexOf(b.grade);
        });
        
        return matched[0];
    },
    
    /** 检查是否达到100天（触发结局） */
    shouldTriggerEnding() {
        return Core.getState().day >= 100;
    },
    
    // ==================== 结局统计 ====================
    
    /** 生成结局统计数据 */
    generateStats() {
        const s = Core.getState();
        const totalCases = s.totalCured + s.totalFailed;
        const cureRate = totalCases > 0 ? (s.totalCured / totalCases * 100).toFixed(1) : 0;
        
        return {
            days: s.day,
            totalCured: s.totalCured,
            totalFailed: s.totalFailed,
            cureRate: cureRate,
            reputation: s.reputation.toFixed(2),
            gold: s.gold,
            maxStreak: s._maxStreakCured || s.streakCured || 0,
            unlockedPets: (s.unlockedPets || []).length,
            maxBond: Math.max(0, ...Object.values(s.npcBonds || {})),
            achievements: (s.achievements || []).length,
        };
    },
    
    /** 格式化结局显示 */
    formatEnding(ending) {
        const stats = this.generateStats();
        const gradeStars = {
            'S+': '⭐⭐⭐⭐⭐✨',
            'S': '⭐⭐⭐⭐⭐',
            'A': '⭐⭐⭐⭐',
            'B': '⭐⭐⭐',
            'C': '⭐⭐',
            'D': '⭐',
        }[ending.grade] || '⭐';
        
        return {
            title: `${ending.icon} ${ending.name} ${gradeStars}`,
            desc: ending.desc,
            stats: `📊 100天统计\n` +
                  `治愈: ${stats.totalCured} | 失败: ${stats.totalFailed} | 治愈率: ${stats.cureRate}%\n` +
                  `声望: ${stats.reputation}⭐ | 资金: ¥${stats.gold}\n` +
                  `连续治愈: ${stats.maxStreak}天 | 解锁宠物: ${stats.unlockedPets}种\n` +
                  `最高羁绊: Lv.${stats.maxBond} | 成就: ${stats.achievements}/20`,
        };
    },
    
    // ==================== 结局UI ====================
    
    /** 显示结局 */
    showEnding() {
        const ending = this.checkEnding();
        const formatted = this.formatEnding(ending);
        
        // 隐藏所有游戏UI
        document.getElementById('dialogue-box').classList.remove('show');
        document.querySelector('.item-bar').classList.remove('show');
        
        // 显示结局面板（简化版，用对话框代替）
        UI.updateDialogue({
            name: '🎬 游戏结局',
            mood: ending.grade,
            avatar: 'item_heart.png',
            text: `${formatted.title}\n\n${formatted.desc}\n\n${formatted.stats}`,
            choices: [
                { text: '🔄 重新开始', action: () => { Core.deleteSave(); location.reload(); } },
                { text: '📖 查看成就', action: () => this._showAchievements() },
            ]
        });
        
        // 锁定游戏，防止继续操作
        Core.getState()._gameEnded = true;
    },
    
    _showAchievements() {
        UI.updateDialogue({
            name: '🏆 成就总结',
            mood: '收藏',
            avatar: 'item_star.png',
            text: AchievementSystem.formatPanel(),
            choices: [
                { text: '🔄 重新开始', action: () => { Core.deleteSave(); location.reload(); } },
            ]
        });
    },
    
    // ==================== 里程碑提示 ====================
    
    /** 检查里程碑并提示（每10天） */
    checkMilestone() {
        const day = Core.getState().day;
        const milestones = {
            10: '诊所开业10天了！开始有些口碑了。',
            30: '一个月过去了！坚持就是胜利。',
            50: '50天里程碑！你的诊所有点名气了。',
            80: '80天了！再坚持20天就能迎来结局。',
        };
        
        if (milestones[day]) {
            return milestones[day];
        }
        return null;
    },
};

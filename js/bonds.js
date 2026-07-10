/**
 * 宠物医生模拟器 v0.3 — NPC羁绊深度系统
 * 参考东方夜雀食堂：羁绊Lv.1-5，每级解锁专属剧情/对话/奖励
 */

const BondSystem = {
    // ==================== 羁绊等级定义 ====================
    
    LEVELS: [
        { level: 1, name: '陌生人', emoji: '👤', desc: '初次见面' },
        { level: 2, name: '熟客', emoji: '👋', desc: '经常来' },
        { level: 3, name: '朋友', emoji: '☕', desc: '会聊家常' },
        { level: 4, name: '挚友', emoji: '🤝', desc: '互相信任' },
        { level: 5, name: '家人', emoji: '❤️', desc: '无可替代' },
    ],
    
    // ==================== 专属剧情数据 ====================
    
    STORIES: {
        mr_lin: {
            2: {
                title: '豆豆的过去',
                text: '林先生告诉你，豆豆是他妻子生前收养的流浪狗。每次豆豆生病，他都会想起妻子温柔的笑容...',
                reward: { gold: 100, reputation: 0.1 },
            },
            3: {
                title: '信任的建立',
                text: '林先生开始介绍朋友来你的诊所。"只有你能让我放心。"他说。你的声誉+0.3。',
                reward: { gold: 300, reputation: 0.3 },
            },
            4: {
                title: '深夜来电',
                text: '半夜接到林先生电话，豆豆突然抽搐。你连夜赶到诊所...这次治疗免费，但声望+0.5。',
                reward: { reputation: 0.5 },
            },
            5: {
                title: '家人的请求',
                text: '林先生握着你的手："豆豆老了，如果有一天...请让它少受点苦。"你获得了稀有草药×5。',
                reward: { herb: 5, reputation: 0.5 },
            },
        },
        ms_wang: {
            2: {
                title: '咪咪的秘密',
                text: '王女士告诉你，咪咪是她大学时代捡到的流浪猫。咪咪陪伴她度过了最难熬的失恋期。',
                reward: { gold: 100 },
            },
            3: {
                title: '网红博主',
                text: '王女士是个小有名气的宠物博主。她在社交媒体上推荐了你的诊所，今天客人+1！',
                reward: { reputation: 0.3 },
            },
            4: {
                title: '猫咪聚会',
                text: '王女士邀请你参加猫咪聚会。在那里你认识了更多宠物主人...解锁新NPC概率提升。',
                reward: { gold: 200 },
            },
            5: {
                title: '终身会员',
                text: '王女士办了你的终身VIP卡。"以后咪咪和将来的小猫，都交给你了。"诊金+20%。',
                reward: { reputation: 0.5 },
            },
        },
        grandma_zhang: {
            2: {
                title: '孤独的陪伴',
                text: '张奶奶告诉你，仓鼠球球是她唯一的陪伴。儿子在国外，一年只回一次...',
                reward: { gold: 50 },
            },
            3: {
                title: '祖传秘方',
                text: '张奶奶教了你一个祖传的宠物食疗方子。研磨草药效率+10%永久。',
                reward: { reputation: 0.2 },
            },
            4: {
                title: '编织的温暖',
                text: '张奶奶给你织了一条围巾。虽然诊所用不上，但戴着它时压力-5。',
                reward: { gold: 100 },
            },
            5: {
                title: '另一个家人',
                text: '张奶奶说："你要是不嫌弃，就叫我奶奶吧。"你获得了张奶奶的食谱书。',
                reward: { reputation: 0.3 },
            },
        },
        shop_owner: {
            2: {
                title: '进货渠道',
                text: '商店老板透露了便宜进货渠道。以后购买药品享9折优惠。',
                reward: { gold: 100 },
            },
            3: {
                title: '商业合作',
                text: '商店老板提议合作：你在他店里放宣传册，他给你药品成本价。',
                reward: { reputation: 0.2 },
            },
        },
        herbalist: {
            2: {
                title: '草药知识',
                text: '草药师教你辨认珍稀草药。花园采集有10%概率获得双倍。',
                reward: { gold: 150 },
            },
            3: {
                title: '深夜交易',
                text: '草药师只在深夜出现，带来极其稀有的月光草。解锁特殊治疗配方。',
                reward: { reputation: 0.3 },
            },
            4: {
                title: '山谷传说',
                text: '草药师告诉你一个传说：城市边缘有个山谷，那里的草药能治愈百病...',
                reward: { gold: 300 },
            },
        },
        rival: {
            2: {
                title: '挑衅',
                text: '陈医生来你的诊所"视察"，嘲笑你的设备。你默默发誓要超越他。',
                reward: { reputation: 0.1 },
            },
            3: {
                title: '意外的帮助',
                text: '陈医生的诊所爆满，他不得不把病人转给你。虽然不情愿，但你们开始了合作...',
                reward: { gold: 500 },
            },
        },
    },
    
    // ==================== 羁绊检查与剧情触发 ====================
    
    /** 检查羁绊升级并触发剧情 */
    checkBondUpgrade(npcId) {
        const state = Core.getState();
        const currentBond = state.npcBonds[npcId] || 0;
        const currentLevel = Math.floor(currentBond);
        
        // 记录上次触发的等级，防止重复触发
        state._lastBondStories = state._lastBondStories || {};
        const lastTriggered = state._lastBondStories[npcId] || 0;
        
        if (currentLevel > lastTriggered && currentLevel >= 2) {
            // 触发了新等级剧情
            state._lastBondStories[npcId] = currentLevel;
            
            const story = this.getStory(npcId, currentLevel);
            if (story) {
                this._showStory(npcId, story);
                return true;
            }
        }
        
        return false;
    },
    
    /** 获取指定NPC和等级的剧情 */
    getStory(npcId, level) {
        const npcStories = this.STORIES[npcId];
        if (!npcStories) return null;
        return npcStories[level] || null;
    },
    
    /** 显示剧情 */
    _showStory(npcId, story) {
        const npc = CONSTANTS.NPCS[npcId];
        if (!npc) return;
        
        // 应用奖励
        if (story.reward) {
            if (story.reward.gold) Core.addGold(story.reward.gold);
            if (story.reward.reputation) Core.addReputation(story.reward.reputation);
            if (story.reward.herb) Core.modifyInventory('herb', story.reward.herb);
        }
        
        // 显示对话
        UI.updateDialogue({
            name: npc.name,
            mood: '专属剧情',
            avatar: UI.getNPCAvatar(npcId, 'trust') || npc.avatar,
            text: `📖 **${story.title}**\n\n${story.text}\n\n${story.reward ? '奖励：' + this._formatReward(story.reward) : ''}`,
            choices: [
                { text: '💬 继续对话', action: () => {} },
                { text: '🔍 继续接诊', action: () => Game.nextPatient() },
            ]
        });
        
        Core.save();
    },
    
    _formatReward(reward) {
        const parts = [];
        if (reward.gold) parts.push(`¥${reward.gold}`);
        if (reward.reputation) parts.push(`声望+${reward.reputation}`);
        if (reward.herb) parts.push(`草药×${reward.herb}`);
        return parts.join(' ');
    },
    
    // ==================== 羁绊对话 ====================
    
    /** 根据羁绊等级获取NPC对话 */
    getNPCDialogue(npcId, context) {
        const npc = CONSTANTS.NPCS[npcId];
        if (!npc) return null;
        
        const bondLevel = Math.floor(Core.getState().npcBonds[npcId] || 0);
        const dialogues = npc.dialogue || {};
        
        // 根据羁绊等级和上下文选择对话
        if (context === 'greeting') {
            if (bondLevel >= 4) return `(${npc.name}热情地打招呼)${Utils.pick(dialogues.greeting || ['你好！'])}`;
            if (bondLevel >= 2) return `(${npc.name}微笑)${Utils.pick(dialogues.greeting || ['你好。'])}`;
            return `(${npc.name}点头)${Utils.pick(dialogues.greeting || ['...'])}`;
        }
        
        if (context === 'cured') {
            if (bondLevel >= 4) return `(${npc.name}紧紧握住你的手)${Utils.pick(dialogues.grateful || ['太感谢了！'])}`;
            if (bondLevel >= 2) return `(${npc.name}松了口气)${Utils.pick(dialogues.grateful || ['谢谢你。'])}`;
            return `(${npc.name}点头)谢谢。`;
        }
        
        if (context === 'failed') {
            if (bondLevel >= 4) return `(${npc.name}安慰你)没关系的，我相信你已经尽力了...`;
            return `(${npc.name}失望)怎么会这样...`;
        }
        
        return null;
    },
    
    // ==================== 羁绊UI ====================
    
    /** 获取羁绊等级信息 */
    getBondInfo(npcId) {
        const level = Math.floor(Core.getState().npcBonds[npcId] || 0);
        const data = this.LEVELS[Math.min(level - 1, 4)] || this.LEVELS[0];
        return { ...data, level };
    },
    
    /** 格式化羁绊显示 */
    formatBond(npcId) {
        const npc = CONSTANTS.NPCS[npcId];
        if (!npc) return '';
        
        const info = this.getBondInfo(npcId);
        const progress = Core.getState().npcBonds[npcId] || 0;
        const max = npc.bondMax;
        const pct = Math.floor((progress / max) * 100);
        
        return `${info.emoji} ${npc.name} — ${info.name} (Lv.${info.level}) ${pct}%`;
    },
    
    /** 生成羁绊面板 */
    formatBondPanel() {
        const npcs = CONSTANTS.NPCS;
        let text = '👥 NPC羁绊\n\n';
        
        Object.keys(npcs).forEach(id => {
            text += this.formatBond(id) + '\n';
        });
        
        return text;
    },
    
    // ==================== 羁绊日常事件 ====================
    
    /** 随机触发羁绊日常事件 */
    triggerDailyEvent() {
        const state = Core.getState();
        const npcs = Object.keys(CONSTANTS.NPCS);
        
        // 20%概率触发
        if (Math.random() > 0.2) return null;
        
        // 随机选一个NPC
        const npcId = Utils.pick(npcs);
        const bond = state.npcBonds[npcId] || 0;
        
        if (bond >= 3) {
            // 高羁绊NPC可能送礼
            const gifts = {
                mr_lin: { item: 'medicine', count: 2, text: '林先生带来了豆豆的零食，顺便送了2瓶药。' },
                ms_wang: { item: 'herb', count: 3, text: '王女士在野外拍到了稀有草药，送给你3份。' },
                grandma_zhang: { gold: 100, text: '张奶奶给你包了红包，¥100。' },
                shop_owner: { item: 'medicine', count: 3, text: '商店老板送了你3瓶滞销药品。' },
                herbalist: { item: 'herb', count: 5, text: '草药师带来了一捆上等草药。' },
            }[npcId];
            
            if (gifts) {
                if (gifts.item) Core.modifyInventory(gifts.item, gifts.count);
                if (gifts.gold) Core.addGold(gifts.gold);
                return gifts.text;
            }
        }
        
        return null;
    },
};

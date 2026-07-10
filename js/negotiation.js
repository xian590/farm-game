/**
 * 宠物医生模拟器 v0.3 — 价格谈判系统
 * 参考炼金模拟器：治疗前与主人讨价还价的小博弈
 */

const Negotiation = {
    // ==================== 谈判状态 ====================
    
    state: {
        originalFee: 0,      // 主人最初报价
        currentFee: 0,       // 当前报价
        playerOffer: 0,      // 玩家出价
        rounds: 0,           // 已谈判轮数
        ownerMood: 'neutral', // 主人心情
        maxRounds: 3,        // 最多谈判3轮
    },
    
    // ==================== 开始谈判 ====================
    
    start(patient) {
        const effects = BuffSystem.getActiveEffects();
        const bondLevel = Core.getBondLevel(patient.ownerType || 'mr_lin');
        
        // 基础费用
        let baseFee = patient.fee;
        
        // 应用buff诊金加成
        baseFee = Math.floor(baseFee * (effects.feeMultiplier || 1));
        
        // 主人初始报价（会根据病情严重程度和羁绊调整）
        const severityBonus = patient.difficulty * 50;
        const bondDiscount = bondLevel * 20;
        const initialQuote = baseFee + severityBonus - bondDiscount;
        
        // 心情随机化
        const moods = ['generous', 'neutral', 'stingy', 'desperate'];
        const weights = [
            bondLevel >= 3 ? 0.3 : 0.1,  // generous
            0.5,                            // neutral
            0.3,                            // stingy
            patient.difficulty >= 2 ? 0.2 : 0.1  // desperate
        ];
        const mood = this._weightedPick(moods, weights);
        
        this.state = {
            originalFee: initialQuote,
            currentFee: initialQuote,
            playerOffer: 0,
            rounds: 0,
            ownerMood: mood,
            maxRounds: 3,
            patient: patient,
        };
        
        return this._buildDialogue();
    },
    
    // ==================== 玩家出价 ====================
    
    makeOffer(amount) {
        const s = this.state;
        s.playerOffer = amount;
        s.rounds++;
        
        // 主人反应逻辑
        const ratio = amount / s.currentFee;
        const mood = s.ownerMood;
        
        //  generous 心情：接受度阈值低
        //  stingy 心情：接受度阈值高
        //  desperate 心情：容易接受但下次不来了
        const thresholds = {
            generous: { accept: 0.7, counter: 0.5, reject: 0 },
            neutral: { accept: 0.85, counter: 0.65, reject: 0.4 },
            stingy: { accept: 0.95, counter: 0.8, reject: 0.5 },
            desperate: { accept: 0.75, counter: 0.55, reject: 0 },
        }[mood];
        
        let result = {};
        
        if (ratio >= thresholds.accept) {
            // 接受
            result = { type: 'accept', finalFee: amount, text: this._acceptText(mood) };
        } else if (ratio >= thresholds.counter) {
            // 还价
            const counterOffer = Math.floor(s.currentFee * 0.9);
            s.currentFee = counterOffer;
            result = { 
                type: 'counter', 
                counterOffer: counterOffer, 
                text: this._counterText(mood, amount),
                canContinue: s.rounds < s.maxRounds
            };
        } else {
            // 拒绝
            if (s.rounds >= s.maxRounds) {
                // 最后一轮被拒绝 -> 主人生气
                result = { 
                    type: 'angry', 
                    finalFee: s.currentFee, 
                    text: this._angryText(mood),
                    pressurePenalty: 10
                };
            } else {
                result = { 
                    type: 'reject', 
                    text: this._rejectText(mood),
                    canContinue: true
                };
            }
        }
        
        result.rounds = s.rounds;
        result.maxRounds = s.maxRounds;
        return result;
    },
    
    // ==================== 直接接受报价 ====================
    
    acceptQuote() {
        const s = this.state;
        return {
            type: 'accept',
            finalFee: s.currentFee,
            text: this._acceptText(s.ownerMood),
        };
    },
    
    // ==================== 对话文本 ====================
    
    _buildDialogue() {
        const s = this.state;
        const p = s.patient;
        
        const moodText = {
            generous: `(${p.owner}看起来很着急，愿意多付钱)"医生，只要能治好${p.name}，钱不是问题！"`,
            neutral: `"我家${p.name}生病了，需要治疗。诊金大概多少？"`,
            stingy: `"(${p.owner}皱着眉头)上次看病花了好多钱...这次能便宜点吗？"`,
            desperate: `"(${p.owner}几乎要哭了)${p.name}快要不行了！多少钱都行，求求你！"`,
        }[s.ownerMood];
        
        return {
            text: moodText,
            quote: s.currentFee,
            rounds: 0,
            maxRounds: s.maxRounds,
            mood: s.ownerMood,
        };
    },
    
    _acceptText(mood) {
        const texts = {
            generous: '"太好了！你真是个好医生！"（主人爽快地付了钱）',
            neutral: '"好的，就这个价格吧。"（主人接受了）',
            stingy: '"...好吧，就按你说的。"（主人不太情愿地付了钱）',
            desperate: '"谢谢！谢谢！只要能治好${p.name}！"（主人感激涕零）',
        };
        return texts[mood] || '主人接受了你的报价。';
    },
    
    _counterText(mood, offer) {
        const texts = {
            generous: `"嗯...${offer}有点少，能不能再加点？${this.state.currentFee}怎么样？"`,
            neutral: `"${offer}不太够啊，我的成本也不少。最少${this.state.currentFee}吧。"`,
            stingy: `"(${this.state.patient.owner}摇头)${offer}太少了，给${this.state.currentFee}我就做。"`,
            desperate: `"(${this.state.patient.owner}犹豫)${offer}...好吧，但我只能给${this.state.currentFee}..."`,
        };
        return texts[mood] || `主人还价到${this.state.currentFee}。`;
    },
    
    _rejectText(mood) {
        const texts = {
            generous: `"这个价钱太低了，我接受不了。你再想想？"`,
            neutral: `"太少了，我在别家问的价格都比你高。"`,
            stingy: `"(${this.state.patient.owner}摇头)这点钱连药费都不够，你开玩笑呢？"`,
            desperate: `"(${this.state.patient.owner}叹气)我知道你是好医生，但这个价钱真的不够..."`,
        };
        return texts[mood] || '主人拒绝了你的报价。';
    },
    
    _angryText(mood) {
        const texts = {
            generous: `"算了！我不在你这里看了！"（主人愤然离开）`,
            neutral: `"你这个人太贪心了！我去别家！"（主人带着宠物走了）`,
            stingy: `"(${this.state.patient.owner}冷笑)果然是个黑心诊所！"（摔门而去）`,
            desperate: `"(${this.state.patient.owner}哭着)你...你怎么能这样..."（主人失望离开）`,
        };
        return texts[mood] || '主人生气了，带着宠物离开了。';
    },
    
    // ==================== 工具 ====================
    
    _weightedPick(items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1];
    },
    
    // ==================== 快捷谈判（AI自动） ====================
    
    autoNegotiate(patient) {
        this.start(patient);
        // 自动接受初始报价（简化版）
        return this.acceptQuote();
    },
};

/**
 * 宠物医生模拟器 v0.3 — 病例生成器
 * 随机生成病人、病症组合、NPC主人
 */

const PatientGen = {
    // ==================== 名字池 ====================
    PET_NAMES: {
        dog: ['豆豆', '旺财', '来福', '可乐', '汤圆', '布丁', '奶茶', '柠檬'],
        cat: ['咪咪', '橘子', '年糕', '泡芙', '糯米', '芝麻', '奶糖', '波波'],
        hamster: ['球球', '团团', '滚滚', '圆圆', '胖胖', '嘟嘟'],
        parrot: ['小绿', '彩虹', '喳喳', '皮皮', '芒果', '蓝莓'],
        rabbit: ['小白', '雪球', '棉花糖', '糯米团', '草莓', '可可'],
        chinchilla: ['灰灰', ' fluffy', '云朵', '棉花', '汤圆'],
    },

    OWNER_NAMES: {
        mr: ['林先生', '陈先生', '刘先生', '赵先生', '孙先生'],
        ms: ['王女士', '李女士', '张女士', '刘女士', '陈女士'],
        grandma: ['张奶奶', '李奶奶', '王奶奶'],
        grandpa: ['赵爷爷', '钱爷爷'],
        young: ['小张', '小李', '小王', '小刘'],
    },

    // ==================== 生成单个病人 ====================
    generateOne(reputation, eventBias = null) {
        const state = Core.getState();
        
        // 选择宠物类型（基于解锁状态）
        const availablePets = CONSTANTS.PETS.AVAILABLE.filter(
            p => state.unlockedPets.includes(p.id) || p.unlockRep <= reputation
        );
        const petTemplate = Utils.pick(availablePets) || CONSTANTS.PETS.AVAILABLE[0];
        
        // 选择病症
        let conditions = [...CONSTANTS.CONDITIONS];
        
        // 事件影响
        if (eventBias === 'flu_outbreak') {
            // 流感爆发：呼吸道病例概率大增
            conditions = conditions.map(c => ({
                ...c,
                _weight: c.id === 'cat_flu' || c.symptoms.includes('咳嗽') ? 10 : 1
            }));
        }
        
        const condition = Utils.weightedPick(
            conditions.map(c => ({ item: c, weight: c._weight || (6 - c.difficulty) }))
        ).item;
        
        // 生成名字
        const namePool = this.PET_NAMES[petTemplate.id] || this.PET_NAMES.dog;
        const petName = Utils.pick(namePool);
        
        // 生成主人
        const owner = this._generateOwner(petTemplate.species);
        
        // 年龄
        const age = Utils.randInt(1, 12);
        
        // 选择症状（从病症的症状池中选1-3个）
        const symptomCount = Utils.randInt(1, Math.min(3, condition.symptoms.length));
        const selectedSymptoms = Utils.pickMany(condition.symptoms, symptomCount);
        
        // 选择诊断线索
        const hint = Utils.pick(condition.diagnosisHints);
        
        // 计算费用（基于难度和声望）
        const repLevel = Math.floor(reputation);
        const fee = condition.fee + (repLevel * 20) + Utils.randInt(-20, 30);
        
        return {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            name: petName,
            species: petTemplate.species,
            petType: petTemplate.id,
            petName: petTemplate.name,  // 品种名如"柴犬"
            age: age,
            owner: owner.name,
            ownerType: owner.type,
            mood: owner.mood,
            avatar: owner.avatar,
            
            // 病症
            condition: condition,
            symptoms: selectedSymptoms,
            symptomDesc: selectedSymptoms.join('、'),
            diagnosis: condition.name,
            diagnosisId: condition.id,
            treatment: condition.treatment,
            difficulty: condition.difficulty,
            minigame: condition.minigame,
            requiresSurgery: condition.requiresSurgery || false,
            
            // 经济
            fee: fee,
            
            // 图像
            sickImg: petTemplate.imgs.sick,
            healthyImg: petTemplate.imgs.healthy,
            
            // 状态
            status: 'waiting',  // waiting, diagnosing, treating, cured, failed
            arrivedAt: Date.now(),
            
            // 治疗记录
            diagnosisAttempts: 0,
            minigameScore: 0,  // 0-100
        };
    },

    /** 生成主人 */
    _generateOwner(petSpecies) {
        // 可用的NPC定义（按解锁天数过滤）
        const availableNPCs = Object.values(CONSTANTS.NPCS).filter(
            npc => npc.unlockDay <= Core.getState().day
        );
        const npc = Utils.pick(availableNPCs);
        
        const moods = ['焦急', '担心', '紧张', '心疼', '不安'];
        const mood = Utils.pick(moods);
        
        return {
            name: npc.name,
            type: npc.id,  // 使用NPC ID，如'mr_lin'
            mood: mood,
            avatar: npc.avatar,
        };
    },
    // ==================== 生成一天队列 ====================
    generateQueue(count, reputation, event) {
        const queue = [];
        const eventBias = event ? event.id : null;
        
        for (let i = 0; i < count; i++) {
            const patient = this.generateOne(reputation, eventBias);
            patient.queuePosition = i;
            queue.push(patient);
        }
        
        return queue;
    },

    // ==================== 对话生成 ====================
    
    /** 生成主人初次对话 */
    generateGreeting(patient) {
        const templates = [
            `医生！我家${patient.name}(${patient.petName}，${patient.age}岁)从昨晚开始就${patient.symptomDesc}，它是不是生病了？`,
            `医生快看看！${patient.name}一直${patient.symptoms[0]}，而且${patient.symptoms[1] || '精神很差'}...`,
            `麻烦您了医生，${patient.name}最近${patient.symptomDesc}，我很担心。`,
            `(${patient.owner}带着${patient.name}匆匆进门)医生！${patient.name}突然${patient.symptoms[0]}！`,
        ];
        return Utils.pick(templates);
    },

    /** 生成追问后的补充信息 */
    generateHint(patient) {
        const templates = [
            `对了！${patient.condition.diagnosisHints[0]}...`,
            `让我想想... ${patient.condition.diagnosisHints[1] || patient.condition.diagnosisHints[0]}`,
            `(${patient.owner}回忆中)${patient.condition.diagnosisHints[0]}，这是不是有关系？`,
            `还有一件事，${patient.condition.diagnosisHints[1] || patient.condition.diagnosisHints[0]}。`,
        ];
        return Utils.pick(templates);
    },

    /** 生成诊断确认对话 */
    generateDiagnosisConfirm(patient, isCorrect) {
        if (isCorrect) {
            return `${patient.name}确实是${patient.diagnosis}。${patient.treatment}应该有效。`;
        } else {
            const wrongGuesses = ['普通感冒', '吃坏肚子', '着凉了', '只是累了'];
            return `看起来不像${Utils.pick(wrongGuesses)}...让我再仔细检查一下。`;
        }
    },

    /** 生成治愈后对话 */
    generateCureDialogue(patient, isSuccess) {
        if (isSuccess) {
            const templates = [
                `${patient.name}喝完药后精神明显好转了！${patient.owner}非常感谢。`,
                `太好了，${patient.name}的${patient.symptoms[0]}减轻了很多。`,
                `${patient.name}看起来舒服多了，${patient.owner}松了一口气。`,
                `治疗很成功！${patient.name}已经在摇尾巴了。`,
            ];
            return Utils.pick(templates);
        } else {
            const templates = [
                `${patient.name}的病情没有好转...可能需要进一步检查。`,
                `治疗不太理想，${patient.name}还是${patient.symptoms[0]}...`,
                `(${patient.owner}很失望)怎么还是这样？要不要再看看？`,
            ];
            return Utils.pick(templates);
        }
    },

    /** 生成结算评价 */
    generateReview(patient, score) {
        if (score >= 90) {
            return { text: '⭐⭐⭐ 完美！医生非常专业细心！', stars: 3, bonusRep: 0.1 };
        } else if (score >= 70) {
            return { text: '⭐⭐ 很好，宠物恢复得不错。', stars: 2, bonusRep: 0 };
        } else if (score >= 50) {
            return { text: '⭐ 还可以，但希望下次更快一点。', stars: 1, bonusRep: 0 };
        } else {
            return { text: '💢 不太满意，等了很久才看好。', stars: 0, bonusRep: -0.05 };
        }
    },
};

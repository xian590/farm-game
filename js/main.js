/**
 * 宠物医生模拟器 v0.3 — 主游戏逻辑
 * 完整的一天流程：准备→接诊→问诊→检查→治疗→结算→下一天
 */

const Game = {
    // ==================== 初始化 ====================
    
    init() {
        console.log('=== 宠物医生模拟器 v' + CONSTANTS.VERSION_STRING + ' ===');
        
        // 尝试加载存档
        const loaded = Core.load();
        if (loaded && loaded.day > 1) {
            console.log('[INIT] 继续游戏，第', loaded.day, '天');
        } else {
            console.log('[INIT] 新游戏');
            Core.initState();
        }
        
        // 初始化UI
        UI.initSceneButtons();
        UI.updateStatusBar();
        
        // 绑定键盘
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '6') {
                const idx = parseInt(e.key) - 1;
                const scenes = document.querySelectorAll('.scene');
                if (idx < scenes.length) UI.switchScene(idx);
            }
        });
        
        // 道具栏点击
        document.querySelectorAll('.item-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.item-slot').forEach(s => s.classList.remove('active'));
                slot.classList.add('active');
                Core.getState().selectedItem = slot.dataset.item;
            });
        });
        
        // 初始化反馈系统
        FeedbackSystem.initErrorHandler();
        FeedbackSystem.log('游戏初始化完成');
        
        // 开始第一天
        this.startDay();
        
        // 启动等待压力系统
        this.startWaitingPressure();
        
        // 自动保存（页面可见时）
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) Core.autoSave();
        });
        
        // 页面关闭前清理定时器
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) Core.autoSave();
        });
    },

    // ==================== 一天开始 ====================
    
    startDay() {
        const state = Core.getState();
        
        // 检查是否触发100天结局
        if (EndingSystem.shouldTriggerEnding()) {
            EndingSystem.showEnding();
            return;
        }
        
        // 生成今日Buff（肉鸽系统）
        state.dailyBuffs = BuffSystem.generateDailyBuffs();
        FeedbackSystem.logBuffGenerated(state.dailyBuffs);
        
        // 应用Buff初始压力加成
        const buffStartPressure = BuffSystem.getStartPressure();
        if (buffStartPressure > 0) {
            Core.addPressure(buffStartPressure);
        }
        
        // 确保今日事件已生成（新游戏时）
        if (!state.todayEvent) {
            state.todayEvent = Core._generateDailyEvent ? Core._generateDailyEvent() : null;
        }
        
        // 生成季节事件（展示用，不影响病例生成逻辑）
        state.seasonEvent = SeasonSystem.generateSeasonEvent();
        
        // 生成今日病人队列（季节偏置 + 每日事件偏置）
        let conditions = [...CONSTANTS.CONDITIONS];
        conditions = SeasonSystem.applyConditionBias(conditions);
        state.todayQueue = PatientGen.generateQueue(
            state.patientsMax, 
            state.reputation, 
            state.todayEvent
        );
        state.waitingPatients = [...state.todayQueue];
        
        // 应用季节色调
        SeasonSystem.applySeasonTint();
        
        // 检查里程碑
        const milestone = EndingSystem.checkMilestone();
        
        // 检查每日羁绊事件
        const bondEvent = BondSystem.triggerDailyEvent();
        
        // 更新UI
        UI.updateStatusBar();
        UI.updateWaitingQueue(state.waitingPatients);
        UI.switchScene(0); // 大厅
        UI.setDoctorMood('smile');
        UI.updateFlowSteps(0);
        
        // 构建开场文本
        const seasonText = SeasonSystem.formatSeason(state.day);
        const buffText = state.dailyBuffs.length > 0 
            ? '\n今日Buff：' + BuffSystem.formatBuffList(state.dailyBuffs) 
            : '';
        const eventText = state.seasonEvent 
            ? `\n季节事件：${state.seasonEvent.name}！${state.seasonEvent.desc}` 
            : '';
        const milestoneText = milestone ? `\n💡 ${milestone}` : '';
        const bondText = bondEvent ? `\n🎁 ${bondEvent}` : '';
        
        UI.updateDialogue({
            name: '林医生',
            mood: '新的一天',
            avatar: 'doctor_smile.png',
            text: `第${state.day}天 — ${seasonText}\n诊所声誉${state.reputation.toFixed(1)}⭐，当前资金¥${state.gold}。今天预计有${state.patientsMax}位病人。${buffText}${eventText}${milestoneText}${bondText}`,
            choices: [
                { text: '🔍 开始接诊', action: () => this.nextPatient() },
                { text: '📦 查看库存', action: () => this.showInventory() },
                { text: '📖 宠物图鉴', action: () => this.showPetAlbum() },
                { text: '👥 查看羁绊', action: () => this.showBondPanel() },
            ]
        });
    },

    // ==================== 接诊下一位病人 ====================
    
    nextPatient() {
        const state = Core.getState();
        
        // 检查是否还有病人
        if (state.waitingPatients.length === 0) {
            this.endDay();
            return;
        }
        
        // 取出下一个病人
        const patient = state.waitingPatients.shift();
        FeedbackSystem.logPatientArrived(patient);
        state.currentPatient = patient;
        state.patientsToday++;
        patient.status = 'diagnosing';
        
        // 更新UI
        UI.updateStatusBar();
        UI.updateWaitingQueue(state.waitingPatients);
        UI.setPet(patient);
        UI.updateFlowSteps(1); // 问诊阶段
        UI.setDoctorMood('serious');
        
        // 主人打招呼 - 根据NPC ID绑定对应表情
        const greeting = PatientGen.generateGreeting(patient);
        const ownerAvatar = UI.getNPCAvatar(patient.ownerType || 'mr_lin', 'worried');
        UI.updateDialogue({
            name: patient.owner,
            mood: patient.mood,
            avatar: ownerAvatar,
            text: greeting,
            choices: [
                { text: '🩺 开始检查', action: () => this.startExamination() },
                { text: '🤔 详细询问', action: () => this.askDetails() },
                { text: '📋 查看病历', action: () => this.showPatientInfo() },
            ]
        });
        
        // 压力增加（应用Buff效果）
        Core.addPressure(BuffSystem.calculatePressureGrowth(CONSTANTS.PRESSURE.NEW_PATIENT_ARRIVES));
        UI.updateStatusBar();
    },

    // ==================== 详细询问 ====================
    
    askDetails() {
        const patient = Core.getState().currentPatient;
        const hint = PatientGen.generateHint(patient);
        
        UI.updateDialogue({
            name: patient.owner,
            mood: '补充信息',
            avatar: 'doctor_smile.png',
            text: hint,
            choices: [
                { text: '💡 明白了，开始检查', action: () => this.startExamination() },
                { text: '🤔 还有其他症状吗？', action: () => this.askMore() },
            ]
        });
        
        Core.addPressure(3);
        UI.updateStatusBar();
    },
    
    askMore() {
        const patient = Core.getState().currentPatient;
        const symptoms = patient.symptoms.join('、');
        
        UI.updateDialogue({
            name: patient.owner,
            mood: '详细说明',
            avatar: 'doctor_smile.png',
            text: `(${patient.owner}仔细回忆)主要症状是${symptoms}。${patient.condition.diagnosisHints[0]}。`,
            choices: [
                { text: '💡 开始检查', action: () => this.startExamination() },
            ]
        });
    },
    
    showPatientInfo() {
        const patient = Core.getState().currentPatient;
        UI.updateDialogue({
            name: '宠物信息',
            mood: '档案',
            avatar: 'item_clipboard.png',
            text: `【${patient.name}】${patient.petName} · ${patient.age}岁\n主人：${patient.owner}\n症状：${patient.symptomDesc}\n(需要先诊断才能查看完整病历)`,
            choices: [
                { text: '🩺 开始检查', action: () => this.startExamination() },
            ]
        });
    },

    // ==================== 开始检查（迷你游戏） ====================
    
    startExamination() {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        UI.updateFlowSteps(2); // 检查阶段
        UI.switchScene(1); // 切换到检查室
        UI.setDoctorMood('serious');
        
        // 选择迷你游戏
        const gameType = patient.minigame || 'stethoscope';
        const gameData = MiniGames[gameType];
        
        UI.updateDialogue({
            name: '林医生',
            mood: '专注检查',
            avatar: 'doctor_serious.png',
            text: `让我用${gameData.icon}${gameData.name}来检查一下${patient.name}...`,
            choices: []
        });
        
        // 延迟启动迷你游戏
        setTimeout(() => {
            const container = UI.showMinigame();
            if (!container) {
                // 兼容模式：直接成功
                this.onMinigameDone({ success: true, score: 70, game: gameType });
                return;
            }
            
            MiniGames.launch(gameType, container, (result) => {
                this.onMinigameDone(result);
            });
        }, 800);
    },
    
    /** 迷你游戏结束回调 */
    onMinigameDone(result) {
        UI.hideMinigame();
        const state = Core.getState();
        const patient = state.currentPatient;
        
        patient.minigameScore = result.score || 0;
        patient.diagnosisAttempts++;
        
        if (result.success) {
            // 诊断成功，进入治疗
            UI.updateDialogue({
                name: '林医生',
                mood: '诊断完成',
                avatar: 'doctor_smile.png',
                text: `检查结果显示：${patient.name}患有${patient.diagnosis}。需要${patient.treatment}。`,
                choices: [
                    { text: '💊 开始治疗', action: () => this.startTreatment() },
                ]
            });
        } else {
            // 诊断失败
            Core.addReputation(-CONSTANTS.REPUTATION.WRONG_DIAGNOSIS_PENALTY);
            UI.updateDialogue({
                name: '林医生',
                mood: '困惑',
                avatar: 'doctor_confused.png',
                text: `诊断不太明确...让我再试一次。`,
                choices: [
                    { text: '🔁 重新检查', action: () => this.startExamination() },
                    { text: '💊 凭经验治疗', action: () => this.startTreatment() },
                ]
            });
        }
        
        UI.updateStatusBar();
    },

    // ==================== 治疗阶段 ====================
    
    startTreatment() {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        UI.updateFlowSteps(3); // 治疗阶段
        UI.switchScene(2); // 药房
        UI.setDoctorMood('serious');
        
        // 检查是否需要手术
        if (patient.requiresSurgery) {
            UI.updateDialogue({
                name: '林医生',
                mood: '严肃',
                avatar: 'doctor_serious.png',
                text: `${patient.name}的情况需要手术。手术费¥${CONSTANTS.ECONOMY.SURGERY_FEE}，让我们去手术室。`,
                choices: [
                    { text: '🔪 开始手术', action: () => this.doSurgery() },
                    { text: '💊 先试试药物治疗', action: () => this.doMedicineTreatment() },
                ]
            });
            return;
        }
        
        // 普通治疗选项
        const choices = [];
        
        if (Core.hasItem('medicine')) {
            choices.push({
                text: '💊 使用药瓶（库存' + state.inventory.medicine + '）',
                action: () => this.doMedicineTreatment()
            });
        }
        if (Core.hasItem('herb')) {
            choices.push({
                text: '🌿 研磨草药（库存' + state.inventory.herb + '）',
                action: () => this.doHerbTreatment()
            });
        }
        choices.push({
            text: '💰 购买特效药（¥100）',
            action: () => this.doBuyTreatment()
        });
        
        // 先进行价格谈判
        this._startNegotiation(patient, choices);
    },
    
    // ==================== 价格谈判 ====================
    
    _startNegotiation(patient, treatmentChoices) {
        // 启动谈判
        const result = Negotiation.start(patient);
        
        UI.updateDialogue({
            name: patient.owner,
            mood: '议价',
            avatar: UI.getNPCAvatar(patient.ownerType, 'worried'),
            text: result.text + `\n\n主人报价：¥${result.quote}`,
            choices: [
                { text: `✅ 接受报价（¥${result.quote}）`, action: () => this._onNegotiationDone('accept', result.quote, treatmentChoices) },
                { text: `💰 还价（¥${Math.floor(result.quote * 0.8)}）`, action: () => this._onNegotiationOffer(Math.floor(result.quote * 0.8), treatmentChoices) },
                { text: `💰 狠砍（¥${Math.floor(result.quote * 0.6)}）`, action: () => this._onNegotiationOffer(Math.floor(result.quote * 0.6), treatmentChoices) },
            ]
        });
    },
    
    _onNegotiationOffer(offer, treatmentChoices) {
        const result = Negotiation.makeOffer(offer);
        
        if (result.type === 'accept') {
            UI.updateDialogue({
                name: '林医生',
                mood: '谈判成功',
                avatar: 'doctor_smile.png',
                text: result.text + `\n最终诊金：¥${result.finalFee}`,
                choices: [
                    { text: '💊 开始治疗', action: () => this._showTreatmentOptions(treatmentChoices, result.finalFee) },
                ]
            });
        } else if (result.type === 'counter') {
            const patient = Core.getState().currentPatient;
            UI.updateDialogue({
                name: patient.owner,
                mood: '还价',
                avatar: UI.getNPCAvatar(patient.ownerType, 'worried'),
                text: result.text,
                choices: [
                    { text: `✅ 接受（¥${result.counterOffer}）`, action: () => this._onNegotiationDone('accept', result.counterOffer, treatmentChoices) },
                    { text: '💰 继续还价', action: () => this._onNegotiationOffer(Math.floor(result.counterOffer * 0.9), treatmentChoices) },
                    { text: '😤 不接受了', action: () => this._onNegotiationDone('reject', 0, treatmentChoices) },
                ]
            });
        } else if (result.type === 'reject' || result.type === 'angry') {
            this._onNegotiationDone(result.type, result.finalFee || 0, treatmentChoices);
        }
    },
    
    _onNegotiationDone(type, finalFee, treatmentChoices) {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        if (type === 'accept') {
            // 记录谈判结果
            patient.negotiatedFee = finalFee;
            this._showTreatmentOptions(treatmentChoices, finalFee);
        } else if (type === 'reject' || type === 'angry') {
            // 谈判破裂，病人离开
            patient.status = 'left';
            Core.addReputation(-0.15);
            if (type === 'angry') {
                Core.addPressure(10);
            }
            UI.updateDialogue({
                name: '林医生',
                mood: '谈判失败',
                avatar: 'doctor_confused.png',
                text: type === 'angry' ? '主人生气地带着宠物离开了...' : '主人觉得价格不合适，去了别家诊所。',
                choices: [
                    { text: '🔍 继续接诊', action: () => this.nextPatient() },
                ]
            });
        }
    },
    
    _showTreatmentOptions(treatmentChoices, negotiatedFee) {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        // 更新病人的费用为谈判后的费用
        if (negotiatedFee > 0) {
            patient.fee = negotiatedFee;
        }
        
        UI.updateDialogue({
            name: '林医生',
            mood: '选择治疗方案',
            avatar: 'doctor_serious.png',
            text: `确诊${patient.diagnosis}。${negotiatedFee > 0 ? '已谈妥诊金¥' + negotiatedFee + '。' : ''}请选择治疗方案：`,
            choices: treatmentChoices
        });
    },

    
    /** 手术 */
    doSurgery() {
        const state = Core.getState();
        const patient = state.currentPatient;
        const fee = CONSTANTS.ECONOMY.SURGERY_FEE;
        
        // 扣除手术费
        if (state.gold < fee) {
            UI.updateDialogue({
                name: '林医生',
                mood: '资金不足',
                avatar: 'doctor_confused.png',
                text: `手术需要¥${fee}，资金不足。先试试其他方法吧。`,
                choices: [
                    { text: '💊 药物治疗', action: () => this.doMedicineTreatment() },
                ]
            });
            return;
        }
        
        Core.addGold(-fee);
        UI.showCoinPop(-fee, 60, 50);
        
        UI.switchScene(5); // 手术室场景
        UI.updateDialogue({
            name: '林医生',
            mood: '手术中',
            avatar: 'doctor_serious.png',
            text: '手术进行中...请保持专注！',
            choices: []
        });
        
        setTimeout(() => {
            // 基础成功率80%，高压状态降低
            let successRate = 0.8;
            if (state.pressure >= 80) successRate -= 0.2;
            else if (state.pressure >= 60) successRate -= 0.1;
            
            const success = Math.random() < successRate;
            this.finishTreatment(success, success ? 0.2 : 0);
        }, 2000);
    },
    
    /** 药瓶治疗 */
    doMedicineTreatment() {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        if (!Core.hasItem('medicine')) {
            UI.updateDialogue({
                name: '林医生',
                mood: '库存不足',
                avatar: 'doctor_confused.png',
                text: '药瓶库存不足，请先去商店补充或选择其他方案。',
                choices: [
                    { text: '🔙 返回选择', action: () => this.startTreatment() },
                ]
            });
            return;
        }
        
        Core.modifyInventory('medicine', -1);
        UI.showCoinPop(-1, 60, 50);
        
        UI.switchScene(2); // 药房场景
        UI.updateDialogue({
            name: '林医生',
            mood: '治疗中',
            avatar: 'doctor_serious.png',
            text: `正在为${patient.name}配制药剂...`,
            choices: []
        });
        
        setTimeout(() => {
            // 基础成功率75%
            let successRate = 0.75;
            if (state.pressure >= 80) successRate -= 0.2;
            else if (state.pressure >= 60) successRate -= 0.1;
            
            const success = Math.random() < successRate;
            this.finishTreatment(success, success ? 0.1 : 0);
        }, 2000);
    },
    
    /** 草药治疗 */
    doHerbTreatment() {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        if (!Core.hasItem('herb')) {
            UI.updateDialogue({
                name: '林医生',
                mood: '库存不足',
                avatar: 'doctor_confused.png',
                text: '草药库存不足，请先去花园采集或选择其他方案。',
                choices: [
                    { text: '🔙 返回选择', action: () => this.startTreatment() },
                ]
            });
            return;
        }
        
        Core.modifyInventory('herb', -1);
        UI.showCoinPop(-1, 60, 50);
        
        UI.switchScene(2); // 药房场景
        UI.updateDialogue({
            name: '林医生',
            mood: '研磨中',
            avatar: 'doctor_serious.png',
            text: `正在研磨草药为${patient.name}配制药物...`,
            choices: []
        });
        
        setTimeout(() => {
            // 基础成功率65%，但完美治愈声望加成更高
            let successRate = 0.65;
            if (state.pressure >= 80) successRate -= 0.2;
            else if (state.pressure >= 60) successRate -= 0.1;
            
            const success = Math.random() < successRate;
            this.finishTreatment(success, success ? 0.15 : 0);
        }, 2000);
    },
    
    /** 购买特效药治疗 */
    doBuyTreatment() {
        const state = Core.getState();
        const patient = state.currentPatient;
        const cost = 100;
        
        if (state.gold < cost) {
            UI.updateDialogue({
                name: '林医生',
                mood: '资金不足',
                avatar: 'doctor_confused.png',
                text: `购买特效药需要¥${cost}，资金不足。`,
                choices: [
                    { text: '🔙 返回选择', action: () => this.startTreatment() },
                ]
            });
            return;
        }
        
        Core.addGold(-cost);
        UI.showCoinPop(-cost, 60, 50);
        
        UI.switchScene(2); // 药房场景
        UI.updateDialogue({
            name: '林医生',
            mood: '治疗中',
            avatar: 'doctor_serious.png',
            text: `正在使用特效药治疗${patient.name}...`,
            choices: []
        });
        
        setTimeout(() => {
            // 特效药成功率最高90%
            let successRate = 0.9;
            if (state.pressure >= 80) successRate -= 0.15;
            else if (state.pressure >= 60) successRate -= 0.1;
            
            const success = Math.random() < successRate;
            this.finishTreatment(success, success ? 0.12 : 0);
        }, 2000);
    },
    // ==================== 治疗完成 ====================
    
    finishTreatment(baseSuccess, repBonus = 0) {
        const state = Core.getState();
        const patient = state.currentPatient;
        
        UI.updateFlowSteps(4); // 完成阶段
        
        // 计算最终成功率（压力影响）
        let success = baseSuccess;
        if (success && state.pressure >= 80) {
            if (Math.random() < 0.15) success = false; // 高压状态15%操作失误
        }
        
        if (success) {
            // 成功治愈
            state.curedToday++;
            patient.status = 'cured';
            state.streakCured++;
            
            // 计算得分
            const baseScore = patient.minigameScore || 60;
            const finalScore = Math.min(100, baseScore + (repBonus * 100));
            
            // 金币（应用Buff诊金加成）
            let fee = patient.fee;
            fee = BuffSystem.calculateFee(fee);
            Core.addGold(fee);
            UI.showCoinPop(fee, 70, 35);
            
            // 声望（区分普通/完美）
            let repGain;
            if (finalScore >= 90) {
                repGain = CONSTANTS.REPUTATION.CURE_BONUS_PERFECT + repBonus;
            } else {
                repGain = CONSTANTS.REPUTATION.CURE_BONUS + repBonus;
            }
            Core.addReputation(repGain);
            
            // 压力减轻（应用Buff效果）
            const baseRelief = finalScore >= 90 ? CONSTANTS.PRESSURE.CURE_PERFECT : CONSTANTS.PRESSURE.CURE_SUCCESS;
            Core.addPressure(BuffSystem.calculatePressureGrowth(baseRelief));
            // 每完成一个病人后的压力衰减
            Core.addPressure(-CONSTANTS.PRESSURE.DECAY_AFTER_PATIENT);
            
            // 羁绊
            if (patient.ownerType) {
                Core.addBond(patient.ownerType, 0.5);
            }
            
            // UI效果
            UI.playHealEffect();
            UI.playHeartFloat(70, 35);
            if (finalScore >= 90) UI.playStarBurst(60, 30);
            UI.setPetHealthy(patient);
            UI.setDoctorMood('happy');
            
            // 评价
            const review = PatientGen.generateReview(patient, finalScore);
            
            UI.updateDialogue({
                name: '林医生',
                mood: '治愈成功',
                avatar: 'doctor_happy.png',
                text: PatientGen.generateCureDialogue(patient, true) + `\n\n${review.text} 获得¥${fee}，声望+${repGain.toFixed(2)}`,
                choices: [
                    { text: '🎉 接待下一位', action: () => this.nextPatient() },
                    { text: '📋 查看病历', action: () => this.showMedicalRecord() },
                ]
            });
            
        } else {
            // 治疗失败
            state.failedToday++;
            patient.status = 'failed';
            state.streakCured = 0;
            
            Core.addReputation(-CONSTANTS.REPUTATION.FAIL_PENALTY);
            Core.addPressure(CONSTANTS.PRESSURE.TREATMENT_FAIL);
            UI.setDoctorMood('confused');
            
            UI.updateDialogue({
                name: '林医生',
                mood: '治疗失败',
                avatar: 'doctor_confused.png',
                text: PatientGen.generateCureDialogue(patient, false) + '\n声望-' + CONSTANTS.REPUTATION.FAIL_PENALTY,
                choices: [
                    { text: '😔 继续接诊', action: () => this.nextPatient() },
                ]
            });
        }
        
        // 检查成就
        const newAchievements = AchievementSystem.checkAll();
        if (newAchievements.length > 0) {
            newAchievements.forEach(ach => FeedbackSystem.logAchievement(ach));
        }
        if (newAchievements.length > 0) {
            newAchievements.forEach(ach => AchievementSystem.showUnlock(ach));
        }
        
        // 检查羁绊升级
        if (patient.ownerType) {
            const upgraded = BondSystem.checkBondUpgrade(patient.ownerType);
            if (upgraded) {
                const bondLevel = Math.floor(Core.getBondLevel(patient.ownerType));
                FeedbackSystem.logBondUpgrade(patient.ownerType, bondLevel);
            }
        }
        
        // 清理当前病人
        state.currentPatient = null;
        UI.updateStatusBar();
        UI.updateInventory();
        Core.save();
    },
    
    showMedicalRecord() {
        const state = Core.getState();
        // 显示上一个病人的病历（简化）
        UI.updateDialogue({
            name: '病历系统',
            mood: '档案',
            avatar: 'item_clipboard.png',
            text: '病历已保存到系统中。',
            choices: [
                { text: '🎉 继续接诊', action: () => this.nextPatient() },
            ]
        });
    },

    // ==================== 商店系统 ====================
    
    shopBuy(item, price) {
        // 应用Buff折扣
        const finalPrice = BuffSystem.calculateShopPrice(price);
        
        if (Core.getState().gold < finalPrice) {
            UI.updateDialogue({
                name: '商店老板',
                mood: '提醒',
                avatar: 'npc_shop_owner_friendly.png',
                text: '资金不够哦，先去赚点钱吧！',
                choices: [{ text: '💊 继续接诊', action: () => this.nextPatient() }]
            });
            return;
        }
        Core.addGold(-finalPrice);
        Core.modifyInventory(item, 1);
        UI.showCoinPop(-finalPrice, 60, 50);
        UI.updateStatusBar();
        UI.updateInventory();
    },
    
    showShop() {
        const state = Core.getState();
        const E = CONSTANTS.ECONOMY;
        // 应用Buff折扣显示
        const medPrice = BuffSystem.calculateShopPrice(E.MEDICINE_COST);
        const herbPrice = BuffSystem.calculateShopPrice(E.HERB_COST);
        const bandPrice = BuffSystem.calculateShopPrice(E.BANDAGE_COST);
        
        UI.updateDialogue({
            name: '商店老板',
            mood: '热情',
            avatar: 'npc_shop_owner_friendly.png',
            text: '欢迎光临！需要采购什么药品？',
            choices: [
                { text: `💊 买药瓶（¥${medPrice}）`, action: () => this.shopBuy('medicine', medPrice) },
                { text: `🌿 买草药（¥${herbPrice}）`, action: () => this.shopBuy('herb', herbPrice) },
                { text: `🩹 买绷带（¥${bandPrice}）`, action: () => this.shopBuy('bandage', bandPrice) },
                { text: '🔍 继续接诊', action: () => this.nextPatient() },
            ]
        });
    },

    // ==================== 花园采集 ====================
    
    gardenCollect() {
        const state = Core.getState();
        let amount = Utils.randInt(2, 5);
        // 应用季节草药生长加成
        const seasonBonus = SeasonSystem.getHerbBonus();
        amount = Math.floor(amount * seasonBonus);
        Core.modifyInventory('herb', amount);
        
        UI.updateDialogue({
            name: '草药花园',
            mood: '采集',
            avatar: 'item_herb.png',
            text: `在花园里采集到了${amount}份草药！草药库存+${amount}`,
            choices: [
                { text: '🔍 继续接诊', action: () => this.nextPatient() },
                { text: '🌿 再采集一次', action: () => this.gardenCollect() },
            ]
        });
        
        UI.updateInventory();
        UI.updateStatusBar();
    },

    // ==================== 等待压力系统 ====================
    
    waitingPressureTimer: null,
    
    startWaitingPressure() {
        if (this.waitingPressureTimer) return;
        // 每5秒检查一次（替代原来的60秒，让等待压力实时可感）
        this.waitingPressureTimer = setInterval(() => {
            const state = Core.getState();
            // 有等待病人且正在看病时，压力持续增加
            if (state.waitingPatients.length > 0 && state.currentPatient) {
                Core.addPressure(BuffSystem.calculatePressureGrowth(CONSTANTS.PRESSURE.PATIENT_WAITING_PER_TICK));
                UI.updateStatusBar();
                
                // 检查是否爆表
                if (state.pressure >= CONSTANTS.PRESSURE.MAX) {
                    this.handlePressureExplode();
                }
            }
        }, 5000);
    },
    
    /** 清理定时器（页面关闭时调用） */
    cleanup() {
        if (this.waitingPressureTimer) {
            clearInterval(this.waitingPressureTimer);
            this.waitingPressureTimer = null;
        }
    },
    
    waitingPressureTimer: null,
    
    startWaitingPressure() {
        if (this.waitingPressureTimer) return;
        // 每5秒检查一次（替代原来的60秒，让等待压力实时可感）
        this.waitingPressureTimer = setInterval(() => {
            const state = Core.getState();
            // 有等待病人且正在看病时，压力持续增加
            if (state.waitingPatients.length > 0 && state.currentPatient) {
                Core.addPressure(BuffSystem.calculatePressureGrowth(CONSTANTS.PRESSURE.PATIENT_WAITING_PER_TICK));
                UI.updateStatusBar();
                
                // 检查是否爆表
                if (state.pressure >= CONSTANTS.PRESSURE.MAX) {
                    this.handlePressureExplode();
                }
            }
        }, 5000);
    },

    // ==================== 库存管理 ====================
    
    showInventory() {
        const state = Core.getState();
        UI.updateDialogue({
            name: '库存管理',
            mood: '物资清点',
            avatar: 'item_clipboard.png',
            text: `药瓶×${state.inventory.medicine} | 草药×${state.inventory.herb} | 绷带×${state.inventory.bandage}\n金币：¥${state.gold}`,
            choices: [
                { text: '🛒 去商店采购', action: () => UI.switchScene(4) },
                { text: '🔍 继续接诊', action: () => this.nextPatient() },
            ]
        });
    },

    // ==================== 一天结束 ====================
    
    endDay() {
        const state = Core.getState();
        
        UI.setDoctorMood('smile');
        UI.updateFlowSteps(0);
        
        // 记录一天结束
        FeedbackSystem.logDayEnd(state.day, state.curedToday, state.failedToday, state.incomeToday - state.costToday);
        
        // 总结对话
        const profit = state.incomeToday - state.costToday;
        const summary = `今天接诊了${state.patientsToday}个病人，治愈${state.curedToday}个。净利润¥${profit}。`;
        
        UI.updateDialogue({
            name: '林医生',
            mood: '一天结束',
            avatar: 'doctor_smile.png',
            text: summary,
            choices: [
                { text: '📋 查看详细结算', action: () => UI.showDaySummary() },
            ]
        });
        
        // 结算面板按钮绑定
        const nextBtn = document.querySelector('.summary-btn');
        if (nextBtn) {
            nextBtn.onclick = () => this.startNextDay();
        }
    },
    
    startNextDay() {
        UI.hideDaySummary();
        
        const result = Core.startNewDay();
        
        if (result === 'BANKRUPT') {
            this.gameOver('破产');
            return;
        }
        
        this.startDay();
    },

    // ==================== 游戏结束 ====================
    
    gameOver(reason) {
        UI.updateDialogue({
            name: '游戏结束',
            mood: reason,
            avatar: 'item_heart.png',
            text: `诊所因为${reason}而关闭了...\n你经营了${Core.getState().day}天，总共治愈了${Core.getState().totalCured}个宠物。`,
            choices: [
                { text: '🔄 重新开始', action: () => { Core.deleteSave(); location.reload(); } },
            ]
        });
    },

    // ==================== 图鉴系统 ====================
    
    showBondPanel() {
        UI.updateDialogue({
            name: 'NPC羁绊',
            mood: '关系',
            avatar: 'item_heart.png',
            text: BondSystem.formatBondPanel(),
            choices: [
                { text: '🔍 继续接诊', action: () => this.nextPatient() },
                { text: '🏠 返回大厅', action: () => UI.switchScene(0) },
            ]
        });
    },

    showPetAlbum() {
        const state = Core.getState();
        const allPets = CONSTANTS.PETS.AVAILABLE;
        const unlocked = state.unlockedPets;
        
        let albumText = '📖 宠物图鉴\n\n';
        allPets.forEach(p => {
            const isUnlocked = unlocked.includes(p.id);
            const status = isUnlocked ? '✅' : '🔒';
            albumText += `${status} ${p.name} (${p.species})\n`;
        });
        albumText += `\n已解锁: ${unlocked.length}/${allPets.length}`;
        
        UI.updateDialogue({
            name: '宠物图鉴',
            mood: '收藏',
            avatar: 'item_heart.png',
            text: albumText,
            choices: [
                { text: '🔍 继续接诊', action: () => this.nextPatient() },
                { text: '🏠 返回大厅', action: () => UI.switchScene(0) },
            ]
        });
    },

    // ==================== 压力爆表处理 ====================
    
    handlePressureExplode() {
        const state = Core.getState();
        Core.addReputation(-CONSTANTS.REPUTATION.PRESSURE_EXPLODE_PENALTY);
        state.pressure = CONSTANTS.PRESSURE.MAX;
        
        UI.screenShake(5, 500);
        UI.setDoctorMood('surprised');
        
        // 清空等待队列，强制结束今天
        state.waitingPatients = [];
        state.currentPatient = null;
        
        UI.updateDialogue({
            name: '系统',
            mood: '诊所失控',
            avatar: 'item_heart.png',
            text: '压力爆表！太多客人在等待，诊所陷入混乱。今天的营业被迫结束。声望-' + CONSTANTS.REPUTATION.PRESSURE_EXPLODE_PENALTY,
            choices: [
                { text: '😫 结束今天', action: () => this.endDay() }
            ]
        });
    },
};

// ==================== 启动 ====================
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

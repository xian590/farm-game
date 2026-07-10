/**
 * 宠物医生模拟器 v0.3 — UI管理模块
 * 所有DOM操作集中在这里
 */

const UI = {
    // ==================== 场景切换 ====================
    
    currentScene: 0,
    
    switchScene(index) {
        if (index === this.currentScene) return;
        
        const scenes = document.querySelectorAll('.scene');
        const buttons = document.querySelectorAll('.scene-btn');
        
        scenes[this.currentScene].classList.remove('active');
        if (buttons[this.currentScene]) buttons[this.currentScene].classList.remove('active');
        
        this.currentScene = index;
        scenes[this.currentScene].classList.add('active');
        if (buttons[this.currentScene]) buttons[this.currentScene].classList.add('active');
    },
    
    getCurrentScene() {
        return this.currentScene;
    },

    // ==================== 状态栏更新 ====================
    
    updateStatusBar() {
        const state = Core.getState();
        const P = CONSTANTS.PRESSURE;
        
        // 金币
        const goldEl = document.getElementById('ui-gold');
        if (goldEl) goldEl.textContent = Utils.formatGold(state.gold);
        
        // 天数
        const dayEl = document.getElementById('ui-day');
        if (dayEl) dayEl.textContent = 'Day ' + state.day;
        
        // 病人数
        const patientEl = document.getElementById('ui-patients');
        if (patientEl) patientEl.textContent = state.patientsToday + '/' + state.patientsMax;
        
        // 声望星星 - 使用新素材图片
        const stars = document.querySelectorAll('.star-icon');
        const lit = Math.floor(state.reputation);
        const UI_ASSETS = CONSTANTS.UI_ASSETS;
        stars.forEach((s, i) => {
            if (i < lit) {
                s.src = UI_ASSETS.star_full;
                s.classList.add('lit');
            } else {
                s.src = UI_ASSETS.star_empty;
                s.classList.remove('lit');
            }
        });
        
        // 压力条 - 使用素材图片+CSS类切换
        const fill = document.getElementById('pressure-fill');
        const text = document.getElementById('pressure-text');
        const warning = document.getElementById('pressure-warning');
        
        if (fill) {
            fill.style.width = state.pressure + '%';
            // 根据压力区间切换颜色图片
            fill.classList.remove('zone-yellow', 'zone-red', 'pressure-high');
            if (state.pressure >= P.ZONES.CRITICAL.max * 0.9) {
                fill.classList.add('zone-red', 'pressure-high');
            } else if (state.pressure >= P.ZONES.WARNING.max) {
                fill.classList.add('zone-yellow');
            }
        }
        if (text) text.textContent = state.pressure + '%';
        
        // 压力警告遮罩
        if (state.pressure >= P.ZONES.DANGER.max) {
            if (warning) warning.classList.add('show');
        } else {
            if (warning) warning.classList.remove('show');
        }
    },

    // ==================== 流程指示器 ====================
    
    updateFlowSteps(step) {
        document.querySelectorAll('.flow-step').forEach((el, i) => {
            el.classList.remove('active', 'done');
            if (i < step) el.classList.add('done');
            if (i === step) el.classList.add('active');
        });
    },

    // ==================== 对话系统 ====================
    
    updateDialogue(data) {
        const box = document.getElementById('dialogue-box');
        const nameEl = document.getElementById('dialogue-name');
        const moodEl = document.getElementById('dialogue-mood');
        const avatarEl = document.getElementById('dialogue-avatar');
        const textEl = document.getElementById('dialogue-text');
        const choicesEl = document.getElementById('dialogue-choices');
        
        if (!box) return;
        
        // 更新内容
        if (nameEl) nameEl.textContent = data.name || '';
        if (moodEl) moodEl.textContent = data.mood || '';
        if (avatarEl) avatarEl.src = data.avatar || 'doctor_smile.png';
        if (textEl) textEl.textContent = data.text || '';
        
        // 更新选项
        if (choicesEl) {
            choicesEl.innerHTML = '';
            if (data.choices && data.choices.length > 0) {
                data.choices.forEach(c => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = c.text;
                    btn.onclick = () => {
                        if (c.action) c.action();
                    };
                    choicesEl.appendChild(btn);
                });
            }
        }
        
        box.classList.add('show');
    },
    
    hideDialogue() {
        const box = document.getElementById('dialogue-box');
        if (box) box.classList.remove('show');
    },

    // ==================== 医生情绪 ====================
    
    setDoctorMood(mood) {
        const state = Core.getState();
        state.doctorMood = mood;
        
        const map = CONSTANTS.DOCTOR_MOODS;
        const data = map[mood] || map.smile;
        
        const doctorImg = document.getElementById('doctor');
        const avatarImg = document.getElementById('dialogue-avatar');
        
        if (doctorImg) doctorImg.src = data.img;
        if (avatarImg) avatarImg.src = data.img;
    },

    // ==================== 宠物显示 ====================
    
    setPet(patient) {
        const petImg = document.getElementById('pet');
        if (!petImg) return;
        
        if (patient) {
            petImg.src = patient.sickImg || 'dog_sick.png';
            petImg.classList.toggle('sick', patient.status !== 'cured');
            petImg.style.display = 'block';
        } else {
            petImg.style.display = 'none';
        }
    },
    
    setPetHealthy(patient) {
        const petImg = document.getElementById('pet');
        if (petImg && patient) {
            petImg.src = patient.healthyImg || 'dog_healthy.png';
            petImg.classList.remove('sick');
        }
    },

    // ==================== 等待队列 ====================
    
    updateWaitingQueue(patients) {
        const queue = document.getElementById('waiting-queue');
        if (!queue) return;
        
        if (!patients || patients.length === 0) {
            queue.classList.remove('show');
            return;
        }
        
        queue.classList.add('show');
        queue.innerHTML = '';
        
        patients.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'waiting-pet';
            div.title = `${p.name}（${p.status === 'waiting' ? '等待中' : '正在看诊'}）`;
            div.innerHTML = `<img src="${p.sickImg}" alt="${p.name}">`;
            if (i === 0) {
                div.innerHTML += '<div class="waiting-count">!</div>';
            }
            queue.appendChild(div);
        });
    },

    // ==================== 道具栏 ====================
    
    updateInventory() {
        const state = Core.getState();
        const slots = document.querySelectorAll('.item-slot');
        
        slots.forEach(slot => {
            const item = slot.dataset.item;
            const count = state.inventory[item] || 0;
            
            let countEl = slot.querySelector('.item-count');
            if (count > 0) {
                if (!countEl) {
                    countEl = document.createElement('div');
                    countEl.className = 'item-count';
                    slot.appendChild(countEl);
                }
                countEl.textContent = count;
            } else if (countEl) {
                countEl.remove();
            }
        });
    },

    // ==================== 迷你游戏容器 ====================
    
    showMinigame() {
        const overlay = document.getElementById('minigame-overlay');
        if (overlay) {
            overlay.classList.add('show');
            overlay.innerHTML = ''; // 清空，让游戏自己填充
        }
        return overlay;
    },
    
    hideMinigame() {
        const overlay = document.getElementById('minigame-overlay');
        if (overlay) overlay.classList.remove('show');
    },
    
    getMinigameContainer() {
        return document.getElementById('minigame-overlay');
    },

    // ==================== 治愈特效（3帧动画） ====================
    
    playHealEffect() {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        // 创建动画容器
        const burst = document.createElement('div');
        burst.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:30;pointer-events:none;width:300px;height:300px;';
        container.appendChild(burst);
        
        // 3帧动画
        const frames = ['fx_heal_1.png', 'fx_heal_2.png', 'fx_heal_3.png'];
        let frameIdx = 0;
        
        const anim = setInterval(() => {
            if (frameIdx >= frames.length) {
                clearInterval(anim);
                burst.remove();
                return;
            }
            burst.innerHTML = `<img src="${frames[frameIdx]}" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 40px rgba(255,200,100,0.8));">`;
            frameIdx++;
        }, 300);
    },
    
    /** 爱心飘浮特效（3帧动画） */
    playHeartFloat(x, y) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const heart = document.createElement('div');
        heart.style.cssText = `position:absolute;left:${x || 70}%;top:${y || 40}%;z-index:30;pointer-events:none;width:60px;height:60px;`;
        container.appendChild(heart);
        
        const frames = ['fx_heart_1.png', 'fx_heart_2.png', 'fx_heart_3.png'];
        let frameIdx = 0;
        let posY = 0;
        
        const anim = setInterval(() => {
            if (frameIdx >= frames.length) {
                clearInterval(anim);
                heart.remove();
                return;
            }
            heart.innerHTML = `<img src="${frames[frameIdx]}" style="width:100%;height:100%;object-fit:contain;opacity:${1 - frameIdx * 0.3};">`;
            posY -= 15;
            heart.style.transform = `translateY(${posY}px)`;
            frameIdx++;
        }, 350);
    },
    
    /** 星星爆炸特效 */
    playStarBurst(x, y) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const star = document.createElement('div');
        star.style.cssText = `position:absolute;left:${x || 60}%;top:${y || 30}%;z-index:30;pointer-events:none;width:120px;height:120px;animation:healBurst 0.8s ease forwards;`;
        star.innerHTML = '<img src="fx_star_burst.png" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 30px rgba(255,200,50,0.8));">';
        container.appendChild(star);
        
        setTimeout(() => star.remove(), 1200);
    },
    
    /** 金币弹出 */
    showCoinPop(amount, x, y) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const pop = document.createElement('div');
        pop.className = 'coin-pop';
        pop.textContent = (amount >= 0 ? '+' : '') + '¥' + amount;
        pop.style.left = (x || 60) + '%';
        pop.style.top = (y || 40) + '%';
        pop.style.color = amount >= 0 ? '#fbbf24' : '#f87171';
        container.appendChild(pop);
        
        setTimeout(() => pop.remove(), 1500);
    },

    // ==================== 一天结算 ====================
    
    showDaySummary() {
        const state = Core.getState();
        const panel = document.getElementById('day-summary');
        if (!panel) return;
        
        document.getElementById('sum-patients').textContent = state.patientsToday;
        document.getElementById('sum-cured').textContent = state.curedToday;
        document.getElementById('sum-failed').textContent = state.failedToday;
        document.getElementById('sum-income').textContent = '+' + state.incomeToday;
        document.getElementById('sum-cost').textContent = '-' + state.costToday;
        
        const profit = state.incomeToday - state.costToday;
        const profitEl = document.getElementById('sum-profit');
        profitEl.textContent = (profit >= 0 ? '+' : '') + '¥' + profit;
        profitEl.className = 'value ' + (profit >= 0 ? 'positive' : 'negative');
        
        // 声望变化
        const repChange = (state.curedToday * CONSTANTS.REPUTATION.CURE_BONUS) 
                        - (state.failedToday * CONSTANTS.REPUTATION.FAIL_PENALTY);
        const repEl = document.getElementById('sum-rep');
        repEl.textContent = (repChange >= 0 ? '+' : '') + repChange.toFixed(2) + ' ⭐';
        repEl.className = 'value ' + (repChange >= 0 ? 'positive' : 'negative');
        
        panel.classList.add('show');
    },
    
    hideDaySummary() {
        const panel = document.getElementById('day-summary');
        if (panel) panel.classList.remove('show');
    },

    // ==================== 事件弹窗 ====================
    
    showEvent(eventData) {
        if (!eventData) return;
        
        this.updateDialogue({
            name: '📢 今日事件',
            mood: eventData.name,
            avatar: 'item_star.png',
            text: eventData.desc,
            choices: [{ text: '知道了', action: () => {} }]
        });
    },

    // ==================== 初始化场景按钮 ====================
    
    initSceneButtons() {
        const buttons = document.querySelectorAll('.scene-btn');
        buttons.forEach((btn, i) => {
            btn.onclick = () => this.switchScene(i);
        });
    },

    // ==================== NPC头像获取 ====================
    
    getNPCAvatar(npcId, mood) {
        const npc = CONSTANTS.NPCS[npcId];
        if (!npc) return 'doctor_smile.png';
        if (mood && npc.moods && npc.moods[mood]) {
            return npc.moods[mood];
        }
        return npc.avatar;
    },
    

    // ==================== 全屏压力效果 ====================
    
    setPressureEffect(level) {
        const P = CONSTANTS.PRESSURE;
        const warning = document.getElementById('pressure-warning');
        const container = document.getElementById('game-container');
        
        if (!warning) return;
        
        if (level >= P.ZONES.CRITICAL.max * 0.9) {
            warning.classList.add('show');
            if (container) container.style.filter = 'saturate(1.3) contrast(1.1)';
        } else if (level >= P.ZONES.DANGER.max) {
            warning.classList.add('show');
            if (container) container.style.filter = '';
        } else {
            warning.classList.remove('show');
            if (container) container.style.filter = '';
        }
    },

    // ==================== 屏幕震动 ====================
    
    screenShake(intensity = 3, duration = 300) {
        const container = document.getElementById('game-container');
        if (!container) return;
        
        const start = Date.now();
        const shake = () => {
            const elapsed = Date.now() - start;
            if (elapsed >= duration) {
                container.style.transform = '';
                return;
            }
            const x = (Math.random() - 0.5) * intensity * (1 - elapsed / duration);
            const y = (Math.random() - 0.5) * intensity * (1 - elapsed / duration);
            container.style.transform = `translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        };
        shake();
    },
};

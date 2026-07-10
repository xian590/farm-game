/**
 * 宠物医生模拟器 v0.3 — 迷你游戏模块
 * 听诊器、研磨草药 + 预留接口
 */

const MiniGames = {
    // ==================== 通用工具 ====================
    
    /** 当前活跃的游戏 */
    current: null,
    
    /** 定时器集合（统一管理） */
    timers: new Set(),
    
    /** 事件监听器集合（统一管理） */
    listeners: [],
    
    /** 安全setTimeout */
    _safeTimeout(fn, delay) {
        const id = setTimeout(() => {
            this.timers.delete(id);
            fn();
        }, delay);
        this.timers.add(id);
        return id;
    },
    
    /** 安全setInterval */
    _safeInterval(fn, delay) {
        const id = setInterval(() => {
            fn();
        }, delay);
        this.timers.add(id);
        return id;
    },
    
    /** 安全addEventListener */
    _safeListen(el, type, handler) {
        el.addEventListener(type, handler);
        this.listeners.push({ el, type, handler });
    },
    
    /** 清理所有游戏资源 */
    cleanup() {
        this.timers.forEach(id => clearTimeout(id));
        this.timers.forEach(id => clearInterval(id));
        this.timers.clear();
        
        this.listeners.forEach(({ el, type, handler }) => {
            el.removeEventListener(type, handler);
        });
        this.listeners = [];
        
        this.current = null;
    },
    
    /** 结束游戏通用处理 */
    _finish(result, callback) {
        this.cleanup();
        if (callback) callback(result);
    },

    // ==================== 迷你游戏1：听诊器 ====================
    
    stethoscope: {
        name: '听诊诊断',
        desc: '移动鼠标找到心跳位置',
        icon: '🔍',
        
        start(container, callback) {
            MiniGames.current = 'stethoscope';
            const TIME = CONSTANTS.TIME.MINIGAME_TIME_STETHOSCOPE;
            
            // 创建游戏DOM
            container.innerHTML = `
                <div class="mg-title">🔍 听诊诊断 — 移动鼠标找到心跳位置</div>
                <div class="mg-area" id="steth-area">
                    <img class="mg-pet-body" src="mg_pet_body_outline.png" alt="宠物">
                    <div class="mg-heart-zone" id="steth-zone"></div>
                    <img class="mg-cursor" id="steth-cursor" src="mg_stethoscope_cursor.png">
                    <img class="mg-wave-bg" src="mg_heartbeat_grid.png" alt="波形">
                    <div class="mg-timer" id="steth-timer">${TIME.toFixed(1)}</div>
                    <div class="mg-wave-display" id="steth-wave"></div>
                </div>
                <div class="mg-result" id="steth-result"></div>
            `;
            
            const area = document.getElementById('steth-area');
            const cursor = document.getElementById('steth-cursor');
            const zone = document.getElementById('steth-zone');
            const timerEl = document.getElementById('steth-timer');
            const resultEl = document.getElementById('steth-result');
            const waveDisplay = document.getElementById('steth-wave');
            
            // 随机心跳区域位置 (35-65%)
            const zoneX = Utils.randInt(35, 65);
            const zoneY = Utils.randInt(35, 60);
            zone.style.left = zoneX + '%';
            zone.style.top = zoneY + '%';
            
            // 生成波形条
            waveDisplay.innerHTML = '';
            const bars = [];
            const BAR_COUNT = 40;
            for (let i = 0; i < BAR_COUNT; i++) {
                const bar = document.createElement('div');
                bar.className = 'mg-wave-bar';
                bar.style.height = '8px';
                waveDisplay.appendChild(bar);
                bars.push(bar);
            }
            
            let timeLeft = TIME;
            let found = false;
            let mouseX = 0, mouseY = 0;
            let finalScore = 0;
            
            // 鼠标移动
            const onMove = (e) => {
                const rect = area.getBoundingClientRect();
                mouseX = ((e.clientX - rect.left) / rect.width) * 100;
                mouseY = ((e.clientY - rect.top) / rect.height) * 100;
                cursor.style.left = mouseX + '%';
                cursor.style.top = mouseY + '%';
                
                const dist = Utils.distance(mouseX, mouseY, zoneX, zoneY);
                
                // 更新波形
                const now = Date.now();
                bars.forEach((bar, i) => {
                    let h = 8;
                    if (dist < 8) {
                        // 在心跳区：规律波形
                        h = 20 + Math.sin(now / 200 + i * 0.5) * 25;
                        bar.style.background = '#4ade80';
                    } else if (dist < 18) {
                        // 附近：较乱
                        h = 10 + Math.random() * 20;
                        bar.style.background = '#fbbf24';
                    } else {
                        // 远离：噪声
                        h = 5 + Math.random() * 10;
                        bar.style.background = '#5bc0be';
                    }
                    bar.style.height = Math.max(4, Math.min(50, h)) + 'px';
                });
                
                if (dist < 8 && !found) {
                    found = true;
                    finalScore = Math.floor((timeLeft / TIME) * 40 + 60); // 60-100分
                    MiniGames._safeTimeout(() => {
                        end(true);
                    }, 800);
                }
            };
            
            // 点击确认
            const onClick = () => {
                if (found) return;
                const dist = Utils.distance(mouseX, mouseY, zoneX, zoneY);
                if (dist < 10) {
                    finalScore = Math.floor((timeLeft / TIME) * 30 + 50); // 50-80分
                    end(true);
                } else {
                    resultEl.textContent = '❌ 位置不对，再仔细找找...';
                    Core.addPressure(5);
                }
            };
            
            MiniGames._safeListen(area, 'mousemove', onMove);
            MiniGames._safeListen(area, 'click', onClick);
            
            // 计时器
            const timerId = MiniGames._safeInterval(() => {
                timeLeft -= 0.1;
                timerEl.textContent = timeLeft.toFixed(1);
                if (timeLeft <= 0) {
                    end(false);
                }
            }, 100);
            
            function end(success) {
                clearInterval(timerId);
                MiniGames.timers.delete(timerId);
                cursor.style.display = 'none';
                
                if (success) {
                    resultEl.innerHTML = `✅ 诊断完成！心跳规律`;
                    MiniGames._safeTimeout(() => {
                        MiniGames._finish({ success: true, score: finalScore, game: 'stethoscope' }, callback);
                    }, 1200);
                } else {
                    resultEl.innerHTML = '⏰ 时间到！诊断不够准确';
                    Core.addPressure(CONSTANTS.PRESSURE.MINIGAME_TIMEOUT);
                    MiniGames._safeTimeout(() => {
                        MiniGames._finish({ success: false, score: 0, game: 'stethoscope' }, callback);
                    }, 1200);
                }
            }
        }
    },

    // ==================== 迷你游戏2：研磨草药 ====================
    
    grind: {
        name: '研磨草药',
        desc: '按住鼠标画圈研磨',
        icon: '🌿',
        
        start(container, callback) {
            MiniGames.current = 'grind';
            
            container.innerHTML = `
                <div class="mg-title">🌿 研磨草药 — 按住鼠标画圈研磨</div>
                <div class="mg-grind-area" id="grind-area">
                    <img class="mg-grind-bowl-img" src="mg_mortar_bowl.png" alt="研磨钵">
                    <img class="mg-grind-ring-img" id="grind-ring" src="mg_grind_ring.png" alt="进度环">
                    <div class="mg-grind-particles" id="grind-particles"></div>
                    <div class="mg-grind-progress">进度: <span id="grind-pct">0</span>%</div>
                </div>
                <div class="mg-result" id="grind-result"></div>
            `;
            
            const area = document.getElementById('grind-area');
            const ring = document.getElementById('grind-ring');
            const pctEl = document.getElementById('grind-pct');
            const resultEl = document.getElementById('grind-result');
            const particles = document.getElementById('grind-particles');
            
            let progress = 0;
            let isDrawing = false;
            let lastAngle = 0;
            let totalRotation = 0;
            
            const getAngle = (e) => {
                const rect = area.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                return Math.atan2(y, x) * 180 / Math.PI;
            };
            
            const onDown = (e) => { 
                isDrawing = true; 
                lastAngle = getAngle(e); 
            };
            const onUp = () => { isDrawing = false; };
            
            const onMove = (e) => {
                if (!isDrawing) return;
                const angle = getAngle(e);
                let diff = angle - lastAngle;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                
                if (Math.abs(diff) > 2 && Math.abs(diff) < 60) {
                    totalRotation += Math.abs(diff);
                    progress = Math.min(100, totalRotation / 15);
                    ring.style.transform = `translate(-50%, -50%) rotate(${totalRotation}deg)`;
                    pctEl.textContent = Math.floor(progress);
                    
                    // 粒子效果
                    if (Math.random() > 0.7) {
                        const p = document.createElement('div');
                        p.className = 'mg-grind-particle';
                        const rect = area.getBoundingClientRect();
                        p.style.left = (e.clientX - rect.left) + 'px';
                        p.style.top = (e.clientY - rect.top) + 'px';
                        p.style.setProperty('--tx', (Math.random() - 0.5) * 60 + 'px');
                        p.style.setProperty('--ty', (Math.random() - 0.5) * 60 + 'px');
                        particles.appendChild(p);
                        MiniGames._safeTimeout(() => p.remove(), 800);
                    }
                    
                    if (progress >= 100) {
                        end(true);
                    }
                }
                lastAngle = angle;
            };
            
            MiniGames._safeListen(area, 'mousedown', onDown);
            MiniGames._safeListen(area, 'mouseup', onUp);
            MiniGames._safeListen(area, 'mouseleave', onUp);
            MiniGames._safeListen(area, 'mousemove', onMove);
            
            function end(success) {
                if (!success) return;
                const score = 70 + Utils.randInt(0, 30); // 70-100分
                resultEl.innerHTML = '✅ 草药研磨完成！药性释放充分';
                MiniGames._safeTimeout(() => {
                    MiniGames._finish({ success: true, score, game: 'grind' }, callback);
                }, 1200);
            }
        }
    },

    // ==================== 迷你游戏3：温度计（预留） ====================
    
    thermometer: {
        name: '测量体温',
        desc: '在正确时机读取温度',
        icon: '🌡️',
        
        start(container, callback) {
            MiniGames.current = 'thermometer';
            const TIME = 5; // 5秒读取时间
            
            container.innerHTML = `
                <div class="mg-title">🌡️ 测量体温 — 在正确区间读取温度</div>
                <div class="mg-thermo-area" id="thermo-area">
                    <div class="mg-thermo-wrap">
                        <img class="mg-thermo-body" src="mg_thermometer_body.png" alt="温度计">
                        <img class="mg-thermo-scale" src="mg_thermometer_scale.png" alt="刻度">
                        <div class="mg-thermo-liquid" id="thermo-liquid"></div>
                        <div class="mg-thermo-zone" id="thermo-zone"></div>
                    </div>
                    <div class="mg-timer" id="thermo-timer">${TIME.toFixed(1)}</div>
                    <div class="mg-thermo-readout" id="thermo-readout">--°C</div>
                </div>
                <div class="mg-result" id="thermo-result"></div>
            `;
            
            const liquid = document.getElementById('thermo-liquid');
            const zone = document.getElementById('thermo-zone');
            const timerEl = document.getElementById('thermo-timer');
            const readout = document.getElementById('thermo-readout');
            const resultEl = document.getElementById('thermo-result');
            const area = document.getElementById('thermo-area');
            
            // 目标温度区间（38.5-39.5为异常，需要读取）
            const targetMin = 35 + Math.random() * 2; // 35-37正常
            const targetMax = targetMin + 1.5;
            const isSick = Math.random() > 0.5;
            const actualTemp = isSick ? 38.5 + Math.random() * 1.5 : targetMin + Math.random() * 1.5;
            
            // 液柱动画
            let currentTemp = 35;
            let rising = true;
            let timeLeft = TIME;
            let clicked = false;
            let finalScore = 0;
            
            // 液柱上升动画
            const liquidAnim = MiniGames._safeInterval(() => {
                if (rising) {
                    currentTemp += 0.15;
                    if (currentTemp >= 42) rising = false;
                } else {
                    currentTemp -= 0.15;
                    if (currentTemp <= 35) rising = true;
                }
                
                // 更新液柱高度（35-42度映射到0-100%）
                const pct = ((currentTemp - 35) / 7) * 100;
                liquid.style.height = pct + '%';
                readout.textContent = currentTemp.toFixed(1) + '°C';
                
                // 高亮目标区间
                const inZone = currentTemp >= targetMin && currentTemp <= targetMax;
                zone.style.opacity = inZone ? '1' : '0.2';
            }, 50);
            
            // 点击读取
            const onClick = () => {
                if (clicked) return;
                clicked = true;
                
                clearInterval(liquidAnim);
                MiniGames.timers.delete(liquidAnim);
                
                // 计算得分
                const dist = Math.abs(currentTemp - actualTemp);
                if (dist < 0.5) {
                    finalScore = 95;
                    resultEl.innerHTML = `✅ 完美读取！温度 ${currentTemp.toFixed(1)}°C`;
                } else if (dist < 1.0) {
                    finalScore = 70;
                    resultEl.innerHTML = `✅ 读取成功，温度 ${currentTemp.toFixed(1)}°C`;
                } else {
                    finalScore = 40;
                    resultEl.innerHTML = `⚠️ 读取偏差较大，实际 ${actualTemp.toFixed(1)}°C`;
                }
                
                MiniGames._safeTimeout(() => {
                    MiniGames._finish({ success: finalScore >= 50, score: finalScore, game: 'thermometer' }, callback);
                }, 1500);
            };
            
            MiniGames._safeListen(area, 'click', onClick);
            
            // 计时器
            const timerId = MiniGames._safeInterval(() => {
                timeLeft -= 0.1;
                timerEl.textContent = timeLeft.toFixed(1);
                if (timeLeft <= 0) {
                    clearInterval(timerId);
                    MiniGames.timers.delete(timerId);
                    clearInterval(liquidAnim);
                    MiniGames.timers.delete(liquidAnim);
                    resultEl.innerHTML = '⏰ 时间到！';
                    MiniGames._safeTimeout(() => {
                        MiniGames._finish({ success: false, score: 0, game: 'thermometer' }, callback);
                    }, 1200);
                }
            }, 100);
        }
    },

    // ==================== 迷你游戏4：缝合伤口 ====================
    
    suture: {
        name: '缝合伤口',
        desc: '在绿色判定区点击完成缝合',
        icon: '🔪',
        
        start(container, callback) {
            MiniGames.current = 'suture';
            
            container.innerHTML = `
                <div class="mg-title">🔪 缝合伤口 — 在判定区点击完成缝合</div>
                <div class="mg-suture-area" id="suture-area">
                    <img class="mg-wound-img" src="mg_wound_top.png" alt="伤口">
                    <img class="mg-suture-line" src="mg_suture_line.png" alt="缝合线">
                    <img class="mg-hit-zone" id="hit-zone" src="mg_hit_zone.png" alt="判定区">
                    <img class="mg-scalpel-cursor" id="scalpel-cursor" src="mg_scalpel_cursor.png">
                    <div class="mg-suture-progress">缝合: <span id="suture-pct">0</span>/5</div>
                </div>
                <div class="mg-result" id="suture-result"></div>
            `;
            
            const area = document.getElementById('suture-area');
            const hitZone = document.getElementById('hit-zone');
            const cursor = document.getElementById('scalpel-cursor');
            const pctEl = document.getElementById('suture-pct');
            const resultEl = document.getElementById('suture-result');
            
            // 5个缝合点
            let stitches = 0;
            const totalStitches = 5;
            let mouseX = 0, mouseY = 0;
            
            // 随机放置判定区
            const positions = [
                { x: 30, y: 40 }, { x: 50, y: 35 }, { x: 70, y: 45 },
                { x: 40, y: 60 }, { x: 60, y: 55 }
            ];
            let currentPos = 0;
            
            function placeZone() {
                if (currentPos >= positions.length) {
                    end(true);
                    return;
                }
                const pos = positions[currentPos];
                hitZone.style.left = pos.x + '%';
                hitZone.style.top = pos.y + '%';
                hitZone.style.opacity = '1';
            }
            
            placeZone();
            
            const onMove = (e) => {
                const rect = area.getBoundingClientRect();
                mouseX = ((e.clientX - rect.left) / rect.width) * 100;
                mouseY = ((e.clientY - rect.top) / rect.height) * 100;
                cursor.style.left = mouseX + '%';
                cursor.style.top = mouseY + '%';
            };
            
            const onClick = () => {
                const pos = positions[currentPos];
                const dist = Utils.distance(mouseX, mouseY, pos.x, pos.y);
                
                if (dist < 12) {
                    stitches++;
                    pctEl.textContent = stitches;
                    currentPos++;
                    
                    // 短暂隐藏再显示新位置
                    hitZone.style.opacity = '0';
                    MiniGames._safeTimeout(() => placeZone(), 300);
                } else {
                    resultEl.textContent = '❌ 位置不对，对准绿色区域！';
                    Core.addPressure(3);
                }
            };
            
            MiniGames._safeListen(area, 'mousemove', onMove);
            MiniGames._safeListen(area, 'click', onClick);
            
            function end(success) {
                cursor.style.display = 'none';
                if (success) {
                    const score = 80 + Utils.randInt(0, 20);
                    resultEl.innerHTML = '✅ 缝合完成！伤口处理完美';
                    MiniGames._safeTimeout(() => {
                        MiniGames._finish({ success: true, score, game: 'suture' }, callback);
                    }, 1200);
                }
            }
        }
    },

    // ==================== 迷你游戏调度器 ====================
    
    /** 根据病症选择迷你游戏 */
    selectGame(patient) {
        const gameType = patient.minigame || 'stethoscope';
        return this[gameType] || this.stethoscope;
    },
    
    /** 启动迷你游戏 */
    launch(gameType, container, callback) {
        const game = this[gameType] || this.stethoscope;
        if (!game) {
            console.error('[MINIGAME] 未知游戏类型:', gameType);
            callback({ success: true, score: 60, game: gameType });
            return;
        }
        game.start(container, callback);
    }
};

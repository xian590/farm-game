/* ===== 成长模块：任务系统 + 专注计时 + 时间统计 ===== */
(function() {
  'use strict';

  // ===== 数据层 =====
  const STORAGE_KEY = 'wish_island_quest_v1';
  const TIMER_KEY = 'wish_island_timer_v1';
  const SESSIONS_KEY = 'wish_island_sessions_v1';

  function safeGet(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { return false; }
  }

  let state = {
    quests: [], // {id, title, category, priority, status, type, deadline, createdAt, completedAt}
    mainQuests: [], // {id, title, milestones:[], progress, createdAt}
    timer: { mode: 'countdown', duration: 25, taskId: null, running: false, startTime: null, accumulated: 0 },
    sessions: [], // {id, taskId, taskTitle, startTime, endTime, duration, category, date}
  };

  function loadState() {
    const s = safeGet(STORAGE_KEY, {});
    state.quests = s.quests || [];
    state.mainQuests = s.mainQuests || [];
    const t = safeGet(TIMER_KEY, {});
    state.timer = Object.assign(state.timer, t);
    state.sessions = safeGet(SESSIONS_KEY, []);
  }
  function saveState() {
    safeSet(STORAGE_KEY, { quests: state.quests, mainQuests: state.mainQuests });
    safeSet(TIMER_KEY, state.timer);
    safeSet(SESSIONS_KEY, state.sessions);
  }

  // ===== 唯一ID =====
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  // ===== 任务API =====
  window.QuestAPI = {
    add: function(title, opts) {
      const q = Object.assign({ id: uid(), title, category: '其他', priority: '中', status: 'active', type: 'quest', createdAt: Date.now() }, opts);
      state.quests.unshift(q);
      saveState();
      renderQuests();
      return q;
    },
    addMain: function(title) {
      const q = { id: uid(), title, milestones: [], progress: 0, type: 'main', createdAt: Date.now() };
      state.mainQuests.unshift(q);
      saveState();
      renderQuests();
      return q;
    },
    toggle: function(id) {
      const q = state.quests.find(x => x.id === id);
      if (q) { q.status = q.status === 'done' ? 'active' : 'done'; q.completedAt = q.status === 'done' ? Date.now() : null; saveState(); renderQuests(); }
    },
    remove: function(id) {
      state.quests = state.quests.filter(x => x.id !== id);
      saveState();
      renderQuests();
    },
    getActive: function() { return state.quests.filter(q => q.status !== 'done'); },
    getDone: function() { return state.quests.filter(q => q.status === 'done'); },
  };

  // ===== 渲染任务列表 =====
  function renderQuests() {
    const container = document.getElementById('quest-list');
    if (!container) return;
    const filter = (document.getElementById('quest-filter')?.value) || 'all';
    let list = state.quests;
    if (filter === 'active') list = list.filter(q => q.status !== 'done');
    if (filter === 'done') list = list.filter(q => q.status === 'done');

    if (list.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-xs" style="color:var(--text-mute)">还没有任务，添加第一个成长小目标吧 🌱</div>';
      return;
    }

    const catColors = { '工作': '#B8A9C9', '学习': '#A8D5B0', '生活': '#F5E6C8', '健康': '#E8B5C8', '社交': '#C9D8E8', '其他': '#D4C5E0' };
    container.innerHTML = list.map(q => {
      const done = q.status === 'done';
      const catColor = catColors[q.category] || catColors['其他'];
      return `<div class="glass-card p-3 mb-2 flex items-center gap-3 ${done ? 'opacity-60' : ''}" style="border-left:3px solid ${catColor}">
        <input type="checkbox" ${done ? 'checked' : ''} onchange="QuestAPI.toggle('${q.id}')" class="w-5 h-5 accent-[#B8A9C9] shrink-0">
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium ${done ? 'line-through' : ''}" style="color:var(--theme-text)">${q.title}</div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[10px] px-1.5 py-0.5 rounded-full" style="background:${catColor}22;color:${catColor}">${q.category}</span>
            ${q.priority === '高' ? '<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">高优</span>' : ''}
          </div>
        </div>
        <button onclick="QuestAPI.remove('${q.id}')" class="text-xs px-2 py-1 rounded-lg" style="color:var(--text-mute)">✕</button>
      </div>`;
    }).join('');

    // Update stats
    const total = state.quests.length;
    const done = state.quests.filter(q => q.status === 'done').length;
    const elTotal = document.getElementById('quest-stat-total');
    const elDone = document.getElementById('quest-stat-done');
    const elRate = document.getElementById('quest-stat-rate');
    if (elTotal) elTotal.textContent = total;
    if (elDone) elDone.textContent = done;
    if (elRate) elRate.textContent = total > 0 ? Math.round(done / total * 100) + '%' : '0%';
  }

  // ===== 计时器核心 =====
  let timerInterval = null;
  window.TimerAPI = {
    start: function() {
      if (state.timer.running) return;
      state.timer.running = true;
      state.timer.startTime = Date.now();
      saveState();
      tick();
      timerInterval = setInterval(tick, 1000);
      renderTimer();
    },
    pause: function() {
      if (!state.timer.running) return;
      state.timer.running = false;
      if (state.timer.startTime) {
        state.timer.accumulated += Math.floor((Date.now() - state.timer.startTime) / 1000);
      }
      state.timer.startTime = null;
      clearInterval(timerInterval);
      saveState();
      renderTimer();
    },
    reset: function() {
      state.timer.running = false;
      state.timer.accumulated = 0;
      state.timer.startTime = null;
      clearInterval(timerInterval);
      saveState();
      renderTimer();
    },
    finish: function() {
      const totalSec = state.timer.accumulated + (state.timer.startTime ? Math.floor((Date.now() - state.timer.startTime) / 1000) : 0);
      if (totalSec > 0) {
        const task = state.quests.find(q => q.id === state.timer.taskId);
        state.sessions.unshift({
          id: uid(), taskId: state.timer.taskId, taskTitle: task ? task.title : '专注',
          startTime: Date.now() - totalSec * 1000, endTime: Date.now(),
          duration: totalSec, category: task ? task.category : '专注', date: new Date().toISOString().slice(0, 10)
        });
        safeSet(SESSIONS_KEY, state.sessions);
      }
      window.TimerAPI.reset();
      renderStats();
    },
    setMode: function(m) { state.timer.mode = m; saveState(); renderTimer(); },
    setDuration: function(d) { state.timer.duration = parseInt(d); saveState(); renderTimer(); },
    setTask: function(id) { state.timer.taskId = id; saveState(); renderTimer(); },
  };

  function tick() {
    if (!state.timer.running) return;
    const elapsed = state.timer.accumulated + Math.floor((Date.now() - state.timer.startTime) / 1000);
    if (state.timer.mode === 'countdown') {
      const remaining = state.timer.duration * 60 - elapsed;
      if (remaining <= 0) {
        window.TimerAPI.finish();
        if (typeof showToast === 'function') showToast('⏰ 专注完成！休息一下～');
        return;
      }
    }
    renderTimer();
  }

  function fmtTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  }

  function renderTimer() {
    const display = document.getElementById('timer-display');
    const btn = document.getElementById('timer-btn');
    if (!display) return;
    let elapsed = state.timer.accumulated;
    if (state.timer.running && state.timer.startTime) {
      elapsed += Math.floor((Date.now() - state.timer.startTime) / 1000);
    }
    let text = '';
    if (state.timer.mode === 'countdown') {
      const remain = Math.max(0, state.timer.duration * 60 - elapsed);
      text = fmtTime(remain);
    } else {
      text = fmtTime(elapsed);
    }
    display.textContent = text;
    if (btn) btn.textContent = state.timer.running ? '⏸ 暂停' : '▶ 开始';
  }

  // ===== 统计渲染 =====
  function renderStats() {
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(); monthStart.setDate(1);

    const todaySec = state.sessions.filter(s => s.date === today).reduce((a, s) => a + s.duration, 0);
    const weekSec = state.sessions.filter(s => new Date(s.date) >= weekStart).reduce((a, s) => a + s.duration, 0);
    const monthSec = state.sessions.filter(s => new Date(s.date) >= monthStart).reduce((a, s) => a + s.duration, 0);

    const elToday = document.getElementById('stat-today');
    const elWeek = document.getElementById('stat-week');
    const elMonth = document.getElementById('stat-month');
    if (elToday) elToday.textContent = (todaySec / 3600).toFixed(1) + 'h';
    if (elWeek) elWeek.textContent = (weekSec / 3600).toFixed(1) + 'h';
    if (elMonth) elMonth.textContent = (monthSec / 3600).toFixed(1) + 'h';

    // Category distribution
    const catMap = {};
    state.sessions.filter(s => s.date === today).forEach(s => { catMap[s.category] = (catMap[s.category] || 0) + s.duration; });
    const catList = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const catContainer = document.getElementById('stat-categories');
    if (catContainer) {
      if (catList.length === 0) {
        catContainer.innerHTML = '<div class="text-xs" style="color:var(--text-mute)">今天还没有专注记录</div>';
      } else {
        const total = catList.reduce((a, b) => a + b[1], 0);
        catContainer.innerHTML = catList.map(([cat, sec]) => {
          const pct = Math.round(sec / total * 100);
          return `<div class="flex items-center gap-2 mb-1"><div class="text-xs w-10">${cat}</div><div class="flex-1 h-2 rounded-full" style="background:rgba(184,169,201,0.15)"><div class="h-2 rounded-full" style="width:${pct}%;background:linear-gradient(90deg,#B8A9C9,#D4B5C7)"></div></div><div class="text-xs w-10 text-right">${Math.floor(sec/60)}m</div></div>`;
        }).join('');
      }
    }
  }

  // ===== 灵感库（线索藏馆）=====
  const INSPIRATION_KEY = 'wish_island_inspiration_v1';
  let inspirations = [];
  function loadInspirations() { inspirations = safeGet(INSPIRATION_KEY, []); }
  function saveInspirations() { safeSet(INSPIRATION_KEY, inspirations); }
  window.InspirationAPI = {
    add: function(text, tags) {
      if (!text.trim()) return;
      const item = { id: uid(), text: text.trim(), tags: (tags || '').split(/[,，\s]+/).filter(t => t), createdAt: Date.now() };
      inspirations.unshift(item);
      saveInspirations();
      renderInspirations();
      return item;
    },
    remove: function(id) {
      inspirations = inspirations.filter(i => i.id !== id);
      saveInspirations();
      renderInspirations();
    },
    search: function(q) {
      renderInspirations(q);
    }
  };
  function renderInspirations(query) {
    const container = document.getElementById('inspiration-list');
    if (!container) return;
    let list = inspirations;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(i => i.text.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (list.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-xs" style="color:var(--text-mute)">还没有灵感记录，捕获第一个想法吧 💡</div>';
      return;
    }
    container.innerHTML = list.map(i => `<div class="glass-card p-3 mb-2">
      <div class="text-xs leading-relaxed mb-2" style="color:var(--theme-text)">${escapeHtml(i.text)}</div>
      <div class="flex items-center justify-between">
        <div class="flex gap-1 flex-wrap">${i.tags.map(t => `<span class="text-[10px] px-1.5 py-0.5 rounded-full" style="background:rgba(184,169,201,0.12);color:var(--text-mute)">${escapeHtml(t)}</span>`).join('')}</div>
        <button onclick="InspirationAPI.remove('${i.id}')" class="text-xs px-2 py-1 rounded-lg" style="color:var(--text-mute)">✕</button>
      </div>
    </div>`).join('');
  }
  function escapeHtml(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ===== 初始化 =====
  loadState();
  loadInspirations();

  // Expose init function for app.js to call after loadChunk
  window.initQuestModule = function() {
    renderQuests();
    renderTimer();
    renderStats();
    loadSprint();
    loadRadar();
    renderInspirations();
    // Populate task selector in timer
    const sel = document.getElementById('timer-task-select');
    if (sel) {
      sel.innerHTML = '<option value="">选择关联任务</option>' + state.quests.filter(q => q.status !== 'done').map(q => `<option value="${q.id}">${q.title}</option>`).join('');
      sel.value = state.timer.taskId || '';
    }
  };

  // ===== SPRINT 周回顾 =====
  const SPRINT_KEY = 'wish_island_sprint_v1';
  window.saveSprint = function() {
    const data = {
      scan: document.getElementById('sprint-scan')?.value || '',
      prioritize: document.getElementById('sprint-prioritize')?.value || '',
      iterate: document.getElementById('sprint-iterate')?.value || '',
      nurture: document.getElementById('sprint-nurture')?.value || '',
      transform: document.getElementById('sprint-transform')?.value || '',
      date: new Date().toISOString().slice(0, 10)
    };
    safeSet(SPRINT_KEY, data);
    if (typeof showToast === 'function') showToast('✅ 周回顾已保存');
  };
  function loadSprint() {
    const data = safeGet(SPRINT_KEY, {});
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('sprint-scan', data.scan);
    setVal('sprint-prioritize', data.prioritize);
    setVal('sprint-iterate', data.iterate);
    setVal('sprint-nurture', data.nurture);
    setVal('sprint-transform', data.transform);
  }

  // ===== 能力雷达 =====
  const RADAR_KEY = 'wish_island_radar_v1';
  const RADAR_DIMS = ['action', 'create', 'empathy', 'stable', 'charm'];
  const RADAR_LABELS = { action: '行动力', create: '创造力', empathy: '共情力', stable: '稳定力', charm: '魅力' };
  const RADAR_COLORS = { action: '#E8B5C8', create: '#B8A9C9', empathy: '#A8D5B0', stable: '#C9D8E8', charm: '#F5E6C8' };

  function renderRadarChart(values) {
    const container = document.getElementById('radar-chart');
    if (!container) return;
    const size = 180, cx = size / 2, cy = size / 2, maxR = size * 0.38;
    const dims = RADAR_DIMS;
    const count = dims.length;
    let points = '';
    dims.forEach((d, i) => {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const r = (values[d] || 5) / 10 * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points += `${x},${y} `;
    });
    // Grid lines (levels 2,4,6,8,10)
    let grid = '';
    [2, 4, 6, 8, 10].forEach(level => {
      let pts = '';
      dims.forEach((d, i) => {
        const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
        const r = level / 10 * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        pts += `${x},${y} `;
      });
      grid += `<polygon points="${pts}" fill="none" stroke="rgba(184,169,201,0.2)" stroke-width="0.5"/>`;
    });
    // Axis lines
    let axes = '';
    dims.forEach((d, i) => {
      const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * maxR;
      const y = cy + Math.sin(angle) * maxR;
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(184,169,201,0.2)" stroke-width="0.5"/>`;
      const lx = cx + Math.cos(angle) * (maxR + 14);
      const ly = cy + Math.sin(angle) * (maxR + 14);
      axes += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="#8B7E9C" font-size="9">${RADAR_LABELS[d]}</text>`;
    });
    container.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${grid}${axes}<polygon points="${points}" fill="rgba(184,169,201,0.15)" stroke="#B8A9C9" stroke-width="1.5"/></svg>`;
  }

  window.updateRadar = function() {
    const vals = {};
    RADAR_DIMS.forEach(d => {
      const el = document.getElementById('radar-' + d);
      const valEl = document.getElementById('radar-' + d + '-val');
      const v = el ? parseInt(el.value) : 5;
      vals[d] = v;
      if (valEl) valEl.textContent = v;
    });
    renderRadarChart(vals);
  };

  window.saveRadar = function() {
    const vals = {};
    RADAR_DIMS.forEach(d => {
      const el = document.getElementById('radar-' + d);
      vals[d] = el ? parseInt(el.value) : 5;
    });
    safeSet(RADAR_KEY, vals);
    if (typeof showToast === 'function') showToast('✅ 能力评分已保存');
  };

  function loadRadar() {
    const vals = safeGet(RADAR_KEY, {});
    RADAR_DIMS.forEach(d => {
      const el = document.getElementById('radar-' + d);
      const valEl = document.getElementById('radar-' + d + '-val');
      const v = vals[d] || 5;
      if (el) el.value = v;
      if (valEl) valEl.textContent = v;
    });
    renderRadarChart(vals);
  }

})();
  window.initQuestModule = function() {
    renderQuests();
    renderTimer();
    renderStats();
    // Populate task selector in timer
    const sel = document.getElementById('timer-task-select');
    if (sel) {
      sel.innerHTML = '<option value="">选择关联任务</option>' + state.quests.filter(q => q.status !== 'done').map(q => `<option value="${q.id}">${q.title}</option>`).join('');
      sel.value = state.timer.taskId || '';
    }
  };

})();

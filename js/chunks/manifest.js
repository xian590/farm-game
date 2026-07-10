// ==================== 三六九书写咒 ====================
function get369State() {
  const s = StorageUtil.get('cosmos_369_state', { affirmation: '', cycleLength: 21, cycleStart: '', records: {}, streak: 0 });
  if (!s.records) s.records = {};
  if (typeof s.streak !== 'number') s.streak = 0;
  return s;
}
function save369State(state) { StorageUtil.set('cosmos_369_state', state); }

function init369() {
  render369();
}

function render369() {
  const state = get369State();
  const container = document.getElementById('369-content');
  if (!container) return;
  if (!state.affirmation) {
    container.innerHTML = `
      <div class="glass-card p-6 text-center">
        <div class="text-5xl mb-4">✨</div>
        <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">三六九书写咒</h2>
        <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">选择一个肯定语，在早上写3遍、中午写6遍、晚上写9遍。坚持21/33/45天，见证星愿力量。</p>
        <button onclick="start369Cycle()" class="px-5 py-2 rounded-full text-sm font-medium" style="background:var(--theme-accent); color:#fff">开始新周期</button>
      </div>
    `;
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  const rec = state.records[today] || { morning: 0, noon: 0, evening: 0 };
  const slots = [
    { key: 'morning', label: '🌅 早课', target: 3, count: rec.morning || 0 },
    { key: 'noon', label: '☀️ 午课', target: 6, count: rec.noon || 0 },
    { key: 'evening', label: '🌙 晚课', target: 9, count: rec.evening || 0 }
  ];
  let progressHtml = slots.map(s => `
    <div class="glass-card p-4 mb-3">
      <div class="flex justify-between items-center mb-2">
        <span class="font-medium text-sm" style="color:var(--theme-text)">${s.label}</span>
        <span class="text-xs" style="color:var(--theme-text); opacity:0.5">${s.count}/${s.target}</span>
      </div>
      <div class="flex gap-2 flex-wrap">
        ${Array.from({length: s.target}, (_, i) => `<span class="w-6 h-6 rounded-full flex items-center justify-center text-xs" style="background:${i < s.count ? 'var(--theme-accent)' : 'rgba(255,255,255,0.2)'}; color:${i < s.count ? '#fff' : 'var(--theme-text)'}; opacity:${i < s.count ? 1 : 0.3}">${i+1}</span>`).join('')}
      </div>
      ${s.count < s.target ? `<button onclick="add369Entry('${s.key}')" class="mt-3 w-full py-2 rounded-lg text-sm" style="background:rgba(255,255,255,0.2); color:var(--theme-text)">+ 书写一遍</button>` : `<div class="mt-2 text-xs text-center" style="color:var(--theme-accent)">✅ 已完成</div>`}
    </div>
  `).join('');
  const start = new Date(state.cycleStart);
  const now = new Date();
  const dayDiff = Math.floor((now - start) / 86400000) + 1;
  const history = Object.entries(state.records).sort((a,b) => a[0].localeCompare(b[0])).slice(-7).reverse().map(([d, r]) => {
    const total = (r.morning||0) + (r.noon||0) + (r.evening||0);
    const target = 3 + 6 + 9;
    return `<div class="text-xs py-1" style="color:var(--theme-text); opacity:${total >= target ? 1 : 0.4}">${d} · 早${r.morning||0} 午${r.noon||0} 晚${r.evening||0} ${total >= target ? '✅' : ''}</div>`;
  }).join('');
  container.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.5">当前肯定语</div>
      <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">「${state.affirmation}」</div>
      <div class="flex gap-2 text-xs" style="color:var(--theme-text); opacity:0.6">
        <span>周期: ${state.cycleLength}天</span>
        <span>第 ${Math.min(dayDiff, state.cycleLength)} / ${state.cycleLength} 天</span>
      </div>
      <div class="mt-3 h-2 rounded-full" style="background:rgba(255,255,255,0.2)">
        <div class="h-2 rounded-full" style="background:var(--theme-accent); width:${Math.min(100, (dayDiff / state.cycleLength) * 100)}%"></div>
      </div>
    </div>
    ${progressHtml}
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">📜 近7天记录</div>
      ${history || '<div class="text-xs" style="color:var(--theme-text); opacity:0.4">暂无记录</div>'}
    </div>
    <button onclick="if(confirm('确定结束当前周期？')) { save369State({ affirmation: '', cycleLength: 21, cycleStart: '', records: {}, streak: 0 }); render369(); showToast('已结束周期'); }" class="w-full py-2 rounded-lg text-sm" style="background:rgba(232,160,160,0.2); color:#E8A0A0">结束当前周期</button>
  `;
}

function add369Entry(slot) {
  const state = get369State();
  const today = new Date().toISOString().split('T')[0];
  if (!state.records[today]) state.records[today] = { morning: 0, noon: 0, evening: 0 };
  state.records[today][slot] = (state.records[today][slot] || 0) + 1;
  const rec = state.records[today];
  if (rec.morning >= 3 && rec.noon >= 6 && rec.evening >= 9) {
    const dates = Object.keys(state.records).sort();
    let streak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const r = state.records[dates[i]];
      if (r && r.morning >= 3 && r.noon >= 6 && r.evening >= 9) streak++; else break;
    }
    state.streak = streak;
  }
  save369State(state);
  render369();
  showToast('书写记录已保存');
  logActivity('369', slot);
}

function start369Cycle() {
  const affirmation = prompt('请输入你的肯定语（例如：我每天都变得越来越富有）：');
  if (!affirmation || !affirmation.trim()) return;
  const length = parseInt(prompt('选择周期天数（21、33、45）：', '21')) || 21;
  const cycleLength = [21, 33, 45].includes(length) ? length : 21;
  save369State({ affirmation: affirmation.trim(), cycleLength, cycleStart: new Date().toISOString().split('T')[0], records: {}, streak: 0 });
  render369();
  showToast('🌟 369 周期已开始');
  logActivity('369', 'start');
}

// ==================== 五五五显化咒 ====================
function get55x5State() {
  const s = StorageUtil.get('cosmos_55x5_state', { affirmation: '', currentDay: 1, dailyCount: 0, records: {}, completedChallenges: [] });
  if (!Array.isArray(s.completedChallenges)) s.completedChallenges = [];
  if (!s.records) s.records = {};
  if (typeof s.currentDay !== 'number') s.currentDay = 1;
  if (typeof s.dailyCount !== 'number') s.dailyCount = 0;
  return s;
}
function save55x5State(state) { StorageUtil.set('cosmos_55x5_state', state); }

function init55x5() { render55x5(); }

function render55x5() {
  const state = get55x5State();
  const container = document.getElementById('55x5-content');
  if (!container) return;
  if (!state.affirmation) {
    container.innerHTML = `
      <div class="glass-card p-6 text-center">
        <div class="text-5xl mb-4">📝</div>
        <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">五五五显化咒</h2>
        <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">连续5天，每天写55遍肯定语。让显化成为你的习惯。</p>
        <button onclick="start55x5Challenge()" class="px-5 py-2 rounded-full text-sm font-medium" style="background:var(--theme-accent); color:#fff">开始新显化挑战</button>
      </div>
    `;
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  const todayCount = state.records[today] || 0;
  const isTodayComplete = todayCount >= 55;
  const dots = Array.from({length: 55}, (_, i) => `<span class="w-4 h-4 rounded-full inline-block" style="background:${i < todayCount ? 'var(--theme-accent)' : 'rgba(255,255,255,0.2)'}; opacity:${i < todayCount ? 1 : 0.3}"></span>`).join('');
  const history = Object.entries(state.records).sort((a,b) => a[0].localeCompare(b[0])).slice(-10).reverse().map(([d, c]) => `<div class="text-xs py-1" style="color:var(--theme-text); opacity:${c >= 55 ? 1 : 0.4}">${d} · ${c}/55 ${c >= 55 ? '✅' : ''}</div>`).join('');
  const completed = (state.completedChallenges || []).map((c, i) => `<div class="text-xs py-1" style="color:var(--theme-text); opacity:0.6">显化挑战 ${i+1}: ${c.affirmation.slice(0, 20)}... · 5天完成</div>`).join('');
  container.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.5">当前肯定语</div>
      <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">「${state.affirmation}」</div>
      <div class="flex gap-2 text-xs" style="color:var(--theme-text); opacity:0.6">
        <span>第 ${state.currentDay} / 5 天</span>
        <span>今日 ${todayCount}/55</span>
      </div>
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">今日进度</div>
      <div class="flex flex-wrap gap-1 mb-3">${dots}</div>
      ${!isTodayComplete ? `<button onclick="add55x5Entry()" class="w-full py-2 rounded-lg text-sm" style="background:var(--theme-accent); color:#fff">+ 书写一遍 (${todayCount+1}/55)</button>` : `<div class="text-center text-sm py-2" style="color:var(--theme-accent)">🎉 今日已完成 55 遍！</div>`}
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">📜 近期记录</div>
      ${history || '<div class="text-xs" style="color:var(--theme-text); opacity:0.4">暂无记录</div>'}
    </div>
    ${completed ? `<div class="glass-card p-4 mb-4"><div class="font-medium text-sm mb-2" style="color:var(--theme-text)">🏆 已完成显化挑战</div>${completed}</div>` : ''}
    <button onclick="if(confirm('确定放弃当前显化挑战？')) { save55x5State({ affirmation: '', currentDay: 1, dailyCount: 0, records: {}, completedChallenges: ${JSON.stringify(state.completedChallenges)} }); render55x5(); showToast('已放弃显化挑战'); }" class="w-full py-2 rounded-lg text-sm" style="background:rgba(232,160,160,0.2); color:#E8A0A0">放弃当前显化挑战</button>
  `;
}

function add55x5Entry() {
  const state = get55x5State();
  const today = new Date().toISOString().split('T')[0];
  state.records[today] = (state.records[today] || 0) + 1;
  state.dailyCount = state.records[today];
  if (state.dailyCount >= 55) {
    const doneDays = Object.values(state.records).filter(c => c >= 55).length;
    state.currentDay = Math.min(doneDays + 1, 5);
    if (doneDays >= 5) {
      if (!Array.isArray(state.completedChallenges)) state.completedChallenges = [];
      state.completedChallenges.push({ affirmation: state.affirmation, date: today });
      state.affirmation = '';
      state.currentDay = 1;
      state.dailyCount = 0;
      showToast('🎉 恭喜完成 55x5 显化挑战！');
    } else {
      showToast('今日完成！明天继续');
    }
  } else {
    showToast(`已完成 ${state.dailyCount}/55`);
  }
  save55x5State(state);
  render55x5();
  logActivity('55x5', 'entry');
}

function start55x5Challenge() {
  const affirmation = prompt('请输入你的肯定语：');
  if (!affirmation || !affirmation.trim()) return;
  save55x5State({ affirmation: affirmation.trim(), currentDay: 1, dailyCount: 0, records: {}, completedChallenges: get55x5State().completedChallenges || [] });
  render55x5();
  showToast('📝 55x5 显化挑战已开始');
  logActivity('55x5', 'start');
}

// ==================== 宇宙回音簿记录 ====================
const SIGN_CATEGORIES = ["💰 金钱", "💕 爱情", "🏥 健康", "🎯 机会", "🌙 梦境", "🔮 直觉", "✨ 其他"];

function getSignsState() {
  const s = StorageUtil.get('cosmos_signs_state', { signs: [] });
  if (!Array.isArray(s.signs)) s.signs = [];
  return s;
}
function saveSignsState(state) { StorageUtil.set('cosmos_signs_state', state); }

function initSigns() { renderSigns(); }

function renderSigns(filterCat) {
  const state = getSignsState();
  const container = document.getElementById('signs-content');
  if (!container) return;
  let signs = state.signs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (filterCat) signs = signs.filter(s => s.category === filterCat);
  const catFilter = SIGN_CATEGORIES.map(c => `<button onclick="renderSigns('${c}')" class="px-3 py-1 rounded-full text-xs" style="background:${filterCat === c ? 'var(--theme-accent)' : 'rgba(255,255,255,0.2)'}; color:${filterCat === c ? '#fff' : 'var(--theme-text)'}; opacity:${filterCat && filterCat !== c ? 0.4 : 1}">${c}</button>`).join('');
  const signsHtml = signs.map(s => `
    <div class="glass-card p-4 mb-3">
      <div class="flex justify-between items-start mb-1">
        <span class="text-xs px-2 py-1 rounded-full" style="background:rgba(255,255,255,0.2); color:var(--theme-text)">${s.category}</span>
        <span class="text-xs" style="color:var(--theme-text); opacity:0.4">${s.date}</span>
      </div>
      <div class="text-sm mb-2" style="color:var(--theme-text)">${s.text}</div>
      <div class="flex items-center gap-1 text-xs" style="color:var(--theme-accent)">
        ${Array.from({length: s.intensity}, () => '⭐').join('')} ${s.intensity}/5
      </div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-3" style="color:var(--theme-text)">添加宇宙回音簿</div>
      <select id="sign-category" class="w-full mb-3 p-2 rounded-lg text-sm bg-transparent" style="background:rgba(255,255,255,0.1); color:var(--theme-text); border:1px solid rgba(255,255,255,0.2)">
        ${SIGN_CATEGORIES.map(c => `<option value="${c}" style="color:#333">${c}</option>`).join('')}
      </select>
      <textarea id="sign-text" rows="2" class="w-full mb-3 p-2 rounded-lg text-sm bg-transparent" style="background:rgba(255,255,255,0.1); color:var(--theme-text); border:1px solid rgba(255,255,255,0.2)" placeholder="描述你观察到的宇宙回音簿..."></textarea>
      <div class="flex items-center gap-3 mb-3">
        <span class="text-xs" style="color:var(--theme-text); opacity:0.6">情绪强度</span>
        <input type="range" id="sign-intensity" min="1" max="5" value="3" class="flex-1" oninput="setText('intensity-label', this.value)">
        <span id="intensity-label" class="text-sm font-medium" style="color:var(--theme-accent)">3</span>
      </div>
      <button onclick="addSign()" class="w-full py-2 rounded-lg text-sm" style="background:var(--theme-accent); color:#fff">添加记录</button>
    </div>
    <div class="flex flex-wrap gap-2 mb-3">
      <button onclick="renderSigns()" class="px-3 py-1 rounded-full text-xs" style="background:${!filterCat ? 'var(--theme-accent)' : 'rgba(255,255,255,0.2)'}; color:${!filterCat ? '#fff' : 'var(--theme-text)'}">全部</button>
      ${catFilter}
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">证据记录 (${signs.length})</div>
    ${signsHtml || '<div class="glass-card p-6 text-center text-sm" style="color:var(--theme-text); opacity:0.4">暂无证据记录，开始留意生活中的同步性吧 ✨</div>'}
  `;
}

function addSign() {
  const catEl = document.getElementById('sign-category');
  const textEl = document.getElementById('sign-text');
  if (!catEl || !textEl) { showToast('页面元素未加载，请刷新试试'); return; }
  const category = catEl.value;
  const text = textEl.value.trim();
  const intensityEl = document.getElementById('sign-intensity');
  const intensity = intensityEl ? (parseInt(intensityEl.value) || 5) : 5;
  if (!text) { showToast('请填写描述'); return; }
  const state = getSignsState();
  const now = new Date();
  state.signs.push({ id: Date.now(), date: now.toISOString().split('T')[0], category, text, intensity, createdAt: now.toISOString() });
  saveSignsState(state);
  renderSigns();
  showToast('✨ 宇宙回音簿已记录');
  logActivity('signs', category);
}

// ==================== Focus Wheel 心念转轮 ====================
function getWheelState() {
  const s = StorageUtil.get('cosmos_wheel_state', { wheels: [], currentWheel: null });
  if (!Array.isArray(s.wheels)) s.wheels = [];
  return s;
}
function saveWheelState(state) { StorageUtil.set('cosmos_wheel_state', state); }

function initWheel() {
  renderWheelList();
}

function renderWheelList() {
  const state = getWheelState();
  const container = document.getElementById('wheel-content');
  if (!container) return;
  const list = state.wheels.slice().reverse().map(w => `
    <div class="glass-card p-4 mb-3" onclick="renderWheelEditor(${w.id})">
      <div class="flex justify-between items-center">
        <div>
          <div class="text-sm font-medium" style="color:var(--theme-text)">${w.centerBelief}</div>
          <div class="text-xs mt-1" style="color:var(--theme-text); opacity:0.5">${w.date} · ${w.statements.filter(Boolean).length}/12</div>
        </div>
        <span style="color:var(--theme-text); opacity:0.3">→</span>
      </div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🎯</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">Focus Wheel 心念转轮</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">写下中心负面信念，围绕它写出12个逐渐转向积极的陈述，完成聚焦转换。</p>
      <button onclick="createWheel()" class="px-5 py-2 rounded-full text-sm font-medium" style="background:var(--theme-accent); color:#fff">创建新心念转轮</button>
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">历史心念转轮</div>
    ${list || '<div class="glass-card p-6 text-center text-sm" style="color:var(--theme-text); opacity:0.4">暂无心念转轮记录</div>'}
  `;
}

function createWheel() {
  const belief = prompt('请输入你当前的负面信念（例如：我永远不会成功）：');
  if (!belief || !belief.trim()) return;
  const state = getWheelState();
  const id = Date.now();
  const wheel = { id, date: new Date().toISOString().split('T')[0], centerBelief: belief.trim(), statements: Array(12).fill(''), emotionBefore: null, emotionAfter: null };
  state.wheels.push(wheel);
  state.currentWheel = id;
  saveWheelState(state);
  renderWheelEditor(id);
  showToast('心念转轮已创建');
  logActivity('wheel', 'create');
}

function renderWheelEditor(id) {
  const state = getWheelState();
  const wheel = state.wheels.find(w => w.id === id);
  if (!wheel) return;
  state.currentWheel = id;
  saveWheelState(state);
  const container = document.getElementById('wheel-content');
  if (!container) return;
  const inputs = wheel.statements.map((s, i) => `
    <div class="flex gap-2 mb-2">
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0" style="background:var(--theme-accent); color:#fff">${i+1}</span>
      <input type="text" id="wheel-stmt-${i}" value="${s || ''}" class="flex-1 p-2 rounded-lg text-sm bg-transparent" style="background:rgba(255,255,255,0.1); color:var(--theme-text); border:1px solid rgba(255,255,255,0.2)" placeholder="陈述 ${i+1}" onchange="saveWheelStatement(${i}, this.value)">
    </div>
  `).join('');
  const completed = wheel.statements.filter(Boolean).length === 12 && wheel.emotionBefore !== null && wheel.emotionAfter !== null;
  container.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <button onclick="initWheel()" class="text-xs mb-3 px-3 py-1 rounded-full" style="background:rgba(255,255,255,0.2); color:var(--theme-text)">← 返回列表</button>
      <div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.5">中心负面信念</div>
      <div class="font-medium text-sm mb-3" style="color:var(--theme-text)">「${wheel.centerBelief}」</div>
      <div class="text-xs mb-2" style="color:var(--theme-text); opacity:0.5">围绕这个信念，写出12个逐渐转向积极的陈述：</div>
      ${inputs}
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-3" style="color:var(--theme-text)">情感对比</div>
      <div class="flex items-center gap-3 mb-2">
        <span class="text-xs" style="color:var(--theme-text); opacity:0.6">开始前 (1-10)</span>
        <input type="range" id="wheel-before" min="1" max="10" value="${wheel.emotionBefore || 3}" class="flex-1" onchange="saveWheelEmotion('before', this.value)">
        <span class="text-sm font-medium" style="color:var(--theme-accent)">${wheel.emotionBefore || 3}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs" style="color:var(--theme-text); opacity:0.6">完成后 (1-10)</span>
        <input type="range" id="wheel-after" min="1" max="10" value="${wheel.emotionAfter || 7}" class="flex-1" onchange="saveWheelEmotion('after', this.value)">
        <span class="text-sm font-medium" style="color:var(--theme-accent)">${wheel.emotionAfter || 7}</span>
      </div>
    </div>
    <button onclick="completeWheel()" class="w-full py-2 rounded-lg text-sm mb-3" style="background:var(--theme-accent); color:#fff">${completed ? '更新心念转轮' : '完成心念转轮'}</button>
    <button onclick="if(confirm('确定删除此心念转轮？')) { deleteWheel(${wheel.id}); }" class="w-full py-2 rounded-lg text-sm" style="background:rgba(232,160,160,0.2); color:#E8A0A0">删除</button>
  `;
}

function saveWheelStatement(index, text) {
  const state = getWheelState();
  const wheel = state.wheels.find(w => w.id === state.currentWheel);
  if (!wheel) return;
  wheel.statements[index] = text.trim();
  saveWheelState(state);
}

function saveWheelEmotion(type, value) {
  const state = getWheelState();
  const wheel = state.wheels.find(w => w.id === state.currentWheel);
  if (!wheel) return;
  if (type === 'before') wheel.emotionBefore = parseInt(value);
  else wheel.emotionAfter = parseInt(value);
  saveWheelState(state);
  renderWheelEditor(wheel.id);
}

function completeWheel() {
  const state = getWheelState();
  const wheel = state.wheels.find(w => w.id === state.currentWheel);
  if (!wheel) return;
  const filled = wheel.statements.filter(Boolean).length;
  if (filled < 12) { showToast(`请填写全部12个陈述（当前 ${filled}/12）`); return; }
  if (wheel.emotionBefore === null || wheel.emotionAfter === null) { showToast('请填写情感对比'); return; }
  saveWheelState(state);
  showToast('🎯 心念转轮已完成！');
  logActivity('wheel', 'complete');
  initWheel();
}

function deleteWheel(id) {
  const state = getWheelState();
  state.wheels = state.wheels.filter(w => w.id !== id);
  if (state.currentWheel === id) state.currentWheel = null;
  saveWheelState(state);
  showToast('已删除');
  initWheel();
}

// ==================== v6.1 一分钟魔法 ====================
function get68secState() {
  const s = StorageUtil.get('cosmos_68sec_state', { records: [] });
  if (!Array.isArray(s.records)) s.records = [];
  return s;
}
function save68secState(state) { StorageUtil.set('cosmos_68sec_state', state); }

function init68sec() {
  render68sec();
}

function render68sec() {
  const state = get68secState();
  const container = document.getElementById('68sec-content');
  if (!container) return;
  const recent = state.records.slice().reverse().slice(0, 7).map(r => `
    <div class="glass-card p-3 mb-2 flex justify-between items-center">
      <div class="text-sm" style="color:var(--theme-text)">${r.text}</div>
      <div class="text-xs" style="color:var(--text-mute)">${r.date}</div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">⏱️</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">一分钟魔法</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Abraham-Hicks 教导：68秒纯专注的念头足以激活振动。选择一个愿望，专注68秒。</p>
      <input type="text" id="68sec-input" class="dream-input w-full mb-3 text-sm text-center" placeholder="输入你的愿望或肯定语..." />
      <button onclick="start68sec()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">开始 68 秒专注</button>
    </div>
    <div id="68sec-timer-area" class="hidden glass-card p-6 text-center mb-4">
      <div class="text-6xl font-mono mb-4" style="color:var(--theme-accent)" id="68sec-display">68</div>
      <div class="w-full h-2 rounded-full mb-4" style="background:rgba(212,181,199,0.15)">
        <div id="68sec-bar" class="h-full rounded-full" style="width:0%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9);transition:width 0.1s linear"></div>
      </div>
      <div class="text-sm mb-4" style="color:var(--text-soft)" id="68sec-hint">深呼吸，想象你的愿望已经实现...</div>
      <button onclick="stop68sec()" class="w-full py-2 rounded-xl text-sm" style="background:rgba(232,160,160,0.2); color:#E8A0A0">停止</button>
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">最近记录</div>
    ${recent || '<div class="glass-card p-4 text-center text-sm" style="color:var(--theme-text); opacity:0.4">暂无记录</div>'}
  `;
}

let _68secInterval = null;
let _68secRemaining = 68;

function start68sec() {
  if (_68secInterval) { clearInterval(_68secInterval); _68secInterval = null; }
  const text = document.getElementById('68sec-input')?.value.trim();
  if (!text) { showToast('请先输入愿望或肯定语'); return; }
  document.getElementById('68sec-timer-area')?.classList.remove('hidden');
  _68secRemaining = 68;
  const display = document.getElementById('68sec-display');
  const bar = document.getElementById('68sec-bar');
  const hints = [
    '深呼吸，想象你的愿望已经实现...',
    '感受那种喜悦和满足...',
    '你值得拥有这一切...',
    '宇宙正在为你安排...',
    '保持专注，相信这个过程...',
    '你的振动正在提升...',
    '68秒即将完成，你已经激活了能量！'
  ];
  if (display) display.textContent = '68';
  if (bar) bar.style.width = '0%';
  _68secInterval = setInterval(() => {
    _68secRemaining--;
    if (display) display.textContent = _68secRemaining;
    if (bar) bar.style.width = ((68 - _68secRemaining) / 68 * 100) + '%';
    const hint = document.getElementById('68sec-hint');
    if (hint) hint.textContent = hints[Math.min(Math.floor((68 - _68secRemaining) / 10), hints.length - 1)];
    if (_68secRemaining <= 0) {
      clearInterval(_68secInterval);
      _68secInterval = null;
      const state = get68secState();
      state.records.push({ text, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString() });
      save68secState(state);
      showToast('✨ 68秒专注完成！振动已激活');
      logActivity('68sec', 'complete');
      render68sec();
    }
  }, 1000);
}

function stop68sec() {
  if (_68secInterval) { clearInterval(_68secInterval); _68secInterval = null; }
  document.getElementById('68sec-timer-area')?.classList.add('hidden');
  showToast('已停止');
}

// Chunk exports
window.get369State = get369State;
window.save369State = save369State;
window.init369 = init369;
window.render369 = render369;
window.add369Entry = add369Entry;
window.start369Cycle = start369Cycle;
window.get55x5State = get55x5State;
window.save55x5State = save55x5State;
window.init55x5 = init55x5;
window.render55x5 = render55x5;
window.add55x5Entry = add55x5Entry;
window.start55x5Challenge = start55x5Challenge;
window.getSignsState = getSignsState;
window.saveSignsState = saveSignsState;
window.initSigns = initSigns;
window.renderSigns = renderSigns;
window.addSign = addSign;
window.getWheelState = getWheelState;
window.saveWheelState = saveWheelState;
window.initWheel = initWheel;
window.renderWheelList = renderWheelList;
window.createWheel = createWheel;
window.renderWheelEditor = renderWheelEditor;
window.saveWheelStatement = saveWheelStatement;
window.saveWheelEmotion = saveWheelEmotion;
window.completeWheel = completeWheel;
window.deleteWheel = deleteWheel;
window.get68secState = get68secState;
window.save68secState = save68secState;
window.init68sec = init68sec;
window.render68sec = render68sec;
window.start68sec = start68sec;
window.stop68sec = stop68sec;

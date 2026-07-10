// 星愿花园 - 灵感行动花田模块 (动态加载 chunk)
// Auto-extracted from app.js

//  灵感行动花田
// ============================================================

function renderGarden() {
  renderActionList();
  renderFlowerGrid();
  renderWinList();
  renderGardenStats();
  renderGardenBadges();
}

function addInspirationAction() {
  const textEl = document.getElementById('action-text');
  const typeEl = document.getElementById('action-type');
  if (!textEl || !typeEl) { showToast('页面元素未加载，请刷新试试'); return; }
  const text = textEl.value.trim();
  const type = typeEl.value;
  if (!text) { showToast('写下你的灵感行动哦～'); return; }
  const action = { id: Date.now(), text, type, done: false, feel: '', date: getTodayStr() };
  if (!state.garden.flowers) state.garden.flowers = [];
  state.garden.flowers.unshift(action);
  state.garden.todayCount = (state.garden.todayCount || 0) + 1;
  saveState();
  const actionText = document.getElementById('action-text');
  if (actionText) actionText.value = '';
  renderActionList();
  renderFlowerGrid();
  renderGardenStats();
  showToast('🌱 灵感已种下！');
  speak('灵感已种下，等它开花吧～');
  checkBadges();
}

function renderActionList() {
  const el = document.getElementById('action-list');
  if (!el) return;
  const todayStr = getTodayStr();
  const todayActions = (state.garden.flowers || []).filter(f => f.date === todayStr);
  setText('today-action-count', todayActions.length);
  if (todayActions.length === 0) {
    el.innerHTML = `<div class="text-center py-5 text-sm" style="color:var(--theme-text); opacity:0.4">今天还没有灵感行动，慢慢来，灵感会来的 🌱</div>`;
    return;
  }
  const typeIcons = { love: '💖', money: '💰', beauty: '✨', heal: '🧘', study: '📚', life: '🏠' };
  el.innerHTML = todayActions.map(a => `
    <div class="p-3 rounded-xl flex items-center gap-2" style="background:rgba(255,255,255,0.6); ${a.done ? 'opacity:0.6' : ''}">
      <span class="text-lg">${typeIcons[a.type] || '✨'}</span>
      <span class="flex-1 text-sm ${a.done ? 'line-through' : ''}" style="color:var(--theme-text)">${a.text}</span>
      ${!a.done ? `<button onclick="completeAction(${a.id})" class="text-xs px-3 py-1 rounded-full" style="background:rgba(136,200,152,0.25); color:#5A9C6A">完成</button>` : `<span class="text-xs" style="color:#88C898">✅</span>`}
    </div>
  `).join('');
}

function completeAction(id) {
  const a = (state.garden.flowers || []).find(x => x.id === id);
  if (!a || a.done) return;
  a.done = true;
  saveState();
  addEnergy(15, '灵感行动');
  triggerPetals();
  playSound('bloom');
  renderActionList();
  renderFlowerGrid();
  renderGardenStats();
  renderWinList();
  showToast('🌸 开花啦！');
  speak('你又向愿望走近了一步呀🌸');
  checkBadges();
  setTimeout(() => {
    const feel = prompt('做完之后你感觉怎么样？（选填）');
    if (feel) { a.feel = feel; saveState(); renderWinList(); }
  }, 500);
}

function renderFlowerGrid() {
  const el = document.getElementById('flower-grid');
  if (!el) return;
  const total = state.garden.flowers ? state.garden.flowers.length : 0;
  setText('flower-count', total);
  const cells = 30;
  let html = '';
  const persona = PERSONAS ? (PERSONAS.find(x => x.id === state.mainPersona) || PERSONAS[0]) : { emoji: '🌸', stages: ['🌱','🌿','🌷','🌸'] };
  for (let i = 0; i < cells; i++) {
    const flower = state.garden.flowers && state.garden.flowers[i];
    if (flower && flower.done) {
      // 开花阶段
      html += `<div class="flower-cell grown">${getFlowerByStage(persona, 3, 32)}</div>`;
    } else if (flower) {
      // 根据进度显示不同生长阶段（1/3概率发芽，2/3长叶，模拟生长）
      const stage = (i % 3 === 0) ? 1 : 2;
      html += `<div class="flower-cell">${getFlowerByStage(persona, stage, 28)}</div>`;
    } else {
      // 种子/空地
      html += `<div class="flower-cell opacity-30">${getFlowerByStage(persona, 0, 20)}</div>`;
    }
  }
  el.innerHTML = html;
}

function renderWinList() {
  const el = document.getElementById('win-list');
  if (!el) return;
  const done = (state.garden.flowers || []).filter(f => f.done);
  if (done.length === 0) {
    el.innerHTML = `<div class="text-center py-4 text-sm" style="color:var(--theme-text); opacity:0.4">完成第一个行动后，来记录你的感受吧～</div>`;
    return;
  }
  el.innerHTML = done.slice(0, 5).map(a => `
    <div class="p-2.5 rounded-xl" style="background:linear-gradient(to right, rgba(136,200,152,0.15), rgba(184,216,200,0.1))">
      <div class="text-sm" style="color:var(--theme-text)">✨ ${a.text}</div>
      ${a.feel ? `<div class="text-xs mt-1" style="color:var(--theme-text); opacity:0.6">感受：${a.feel}</div>` : ''}
    </div>
  `).join('');
}

function renderGardenStats() {
  const flowers = state.garden.flowers || [];
  const countByType = {};
  flowers.forEach(f => { if (f.done) countByType[f.type] = (countByType[f.type] || 0) + 1; });
  setText('stat-love', countByType.love || 0);
  setText('stat-money', countByType.money || 0);
  setText('stat-beauty', countByType.beauty || 0);
  setText('stat-heal', countByType.heal || 0);
}

function renderGardenBadges() {
  const el = document.getElementById('garden-badges');
  if (!el) return;
  const gBadges = BADGES.filter(b => ['flower_10', 'flower_50', 'first_manifest'].includes(b.id));
  el.innerHTML = gBadges.map(b => {
    const got = state.badges.includes(b.id);
    return `<div class="badge-item text-center ${got ? '' : 'opacity-30 grayscale'}" title="${b.desc}">
      <div class="w-9 h-9 mx-auto rounded-full flex items-center justify-center text-lg" style="background:rgba(240,213,224,0.2)">${b.icon}</div>
      <div class="text-[10px] mt-0.5 truncate" style="color:var(--theme-text); opacity:0.6">${b.name}</div>
    </div>`;
  }).join('');
}

function triggerPetals() {
  const container = document.querySelector('.flower-grid');
  if (!container) return;
  const petals = ['🌸', '🌺', '🌷', '💮', '🏵️', '🌻'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = (15 + Math.random() * 70) + '%';
    p.style.top = '20%';
    p.style.fontSize = (12 + Math.random() * 8) + 'px';
    p.style.animationDuration = (2.5 + Math.random() * 2) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 4500);
  }
}

// ============================================================

// Mount functions to window for HTML onclick compatibility
window.renderGarden = renderGarden;
window.addInspirationAction = addInspirationAction;
window.renderActionList = renderActionList;
window.completeAction = completeAction;
window.renderFlowerGrid = renderFlowerGrid;
window.renderWinList = renderWinList;
window.renderGardenStats = renderGardenStats;
window.renderGardenBadges = renderGardenBadges;
window.triggerPetals = triggerPetals;

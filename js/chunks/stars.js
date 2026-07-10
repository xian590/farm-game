// ============================================================
//  许愿星台
// ============================================================

let currentWishType = 'love';
let pendingWish = null;

function selectWishType(type, btn) {
  currentWishType = type;
  document.querySelectorAll('#wish-types .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  playSound('sparkle');
}
// 许愿星台自动保存
let wishSaveTimer = null;
function saveWishDraft() {
  clearTimeout(wishSaveTimer);
  wishSaveTimer = setTimeout(() => {
    const draft = {
      type: currentWishType,
      be: document.getElementById('wish-be')?.value || '',
      do: document.getElementById('wish-do')?.value || '',
      have: document.getElementById('wish-have')?.value || '',
      sight: document.getElementById('wish-sight')?.value || '',
      sound: document.getElementById('wish-sound')?.value || '',
      touch: document.getElementById('wish-touch')?.value || '',
      feel: document.getElementById('wish-feel')?.value || '',
      firstAction: document.getElementById('wish-first-action')?.value || '',
    };
    if (!state.wishDrafts) state.wishDrafts = {};
    state.wishDrafts.current = draft;
    saveState();
  }, 500);
}

// 加载许愿草稿
function loadWishDraft() {
  if (!state.wishDrafts || !state.wishDrafts.current) return;
  const d = state.wishDrafts.current;
  if (d.be && document.getElementById('wish-be')) document.getElementById('wish-be').value = d.be;
  if (d.do && document.getElementById('wish-do')) document.getElementById('wish-do').value = d.do;
  if (d.have && document.getElementById('wish-have')) document.getElementById('wish-have').value = d.have;
  if (d.sight && document.getElementById('wish-sight')) document.getElementById('wish-sight').value = d.sight;
  if (d.sound && document.getElementById('wish-sound')) document.getElementById('wish-sound').value = d.sound;
  if (d.touch && document.getElementById('wish-touch')) document.getElementById('wish-touch').value = d.touch;
  if (d.feel && document.getElementById('wish-feel')) document.getElementById('wish-feel').value = d.feel;
  if (d.firstAction && document.getElementById('wish-first-action')) document.getElementById('wish-first-action').value = d.firstAction;
  if (d.type) {
    currentWishType = d.type;
    setTimeout(() => {
      document.querySelectorAll('#wish-types .chip-soft').forEach(b => {
        if (b.dataset.type === d.type) b.classList.add('active');
        else b.classList.remove('active');
      });
    }, 100);
  }
}

function renderStars() {
  renderSkyWishes();
  renderWishList();
  initWishStarDrag();
  loadWishDraft();
}

function createWishStar() {
  const beEl = document.getElementById('wish-be');
  const doEl = document.getElementById('wish-do');
  const haveEl = document.getElementById('wish-have');
  const be = beEl ? beEl.value.trim() : '';
  const do_ = doEl ? doEl.value.trim() : '';
  const have = haveEl ? haveEl.value.trim() : '';
  if (!be && !do_ && !have) { showToast('至少写一点愿望内容哦～'); return; }

  const wish = {
    id: Date.now(),
    type: currentWishType,
    be, do: do_, have,
    sight: document.getElementById('wish-sight') ? document.getElementById('wish-sight').value.trim() : '',
    sound: document.getElementById('wish-sound') ? document.getElementById('wish-sound').value.trim() : '',
    touch: document.getElementById('wish-touch') ? document.getElementById('wish-touch').value.trim() : '',
    feel: document.getElementById('wish-feel') ? document.getElementById('wish-feel').value.trim() : '',
    firstAction: document.getElementById('wish-first-action') ? document.getElementById('wish-first-action').value.trim() : '',
    done: false,
    date: getTodayStr(),
    skyX: Math.random() * 70 + 15,
    skyY: Math.random() * 50 + 15,
  };

  state.wishes.unshift(wish);
  saveState();
  addEnergy(30, '许下愿望');

  const pendingEl = document.getElementById('pending-star');
  if (pendingEl) {
    pendingEl.classList.remove('hidden');
    pendingEl.style.bottom = '20px';
    pendingEl.style.left = '50%';
    pendingEl.dataset.wishId = wish.id;
  }

  renderSkyWishes();
  renderWishList();
  initWishStarDrag();
  showToast('⭐ 许愿星已生成，把它拖到天上去吧～');
  speak('你的许愿星已经生成了，把它拖到天上去吧～');
}

function renderSkyWishes() {
  const sky = document.getElementById('sky-wishes');
  if (!sky) return;
  sky.innerHTML = state.wishes.map(w => `
    <div class="absolute cursor-pointer transition-all duration-500 ${w.done ? 'animate-breath' : 'animate-twinkle'}"
      style="left:${w.skyX}%; top:${w.skyY}%; font-size:${w.done ? '26px' : '18px'}; filter:${w.done ? 'drop-shadow(0 0 10px #FCD34D)' : 'none'}"
      onclick="toggleWishDone(${w.id})" title="${w.be || w.have || '愿望'}">
      ${w.done ? '🌟' : '⭐'}
    </div>
  `).join('');
}

function renderWishList() {
  const el = document.getElementById('wish-list');
  if (!el) return;
  setText('wish-count', state.wishes.length);
  if (state.wishes.length === 0) {
    el.innerHTML = `<div class="text-center py-8">
      <div class="text-4xl mb-3">🌠</div>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">还没有愿望呢～</p>
      <p class="text-xs mb-5" style="color:var(--theme-text); opacity:0.4">向宇宙下第一个订单吧，它听得见哦 ✨</p>
      <button onclick="openNewWishModal()" class="soft-btn btn-primary px-6 py-2.5 text-sm font-title">许下第一个愿望 🌟</button>
    </div>`;
    return;
  }
  const typeIcons = { love: '💖', money: '💰', beauty: '✨', heal: '🧘', life: '🏠', study: '📚' };
  el.innerHTML = state.wishes.slice(0, 10).map(w => `
    <div class="wish-card ${w.done ? 'manifested' : ''}">
      <div class="flex items-start justify-between mb-2">
        <span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(255,255,255,0.6); color:var(--theme-text)">${typeIcons[w.type] || '✨'}</span>
        ${w.done ? '<span class="text-xs text-amber-600 font-medium">✨ 已显化</span>' : ''}
      </div>
      ${w.be ? `<div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.7"><span style="opacity:0.5">BE：</span>${w.be.substring(0, 25)}${w.be.length > 25 ? '...' : ''}</div>` : ''}
      ${w.do ? `<div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.7"><span style="opacity:0.5">DO：</span>${w.do.substring(0, 25)}${w.do.length > 25 ? '...' : ''}</div>` : ''}
      ${w.have ? `<div class="text-xs" style="color:var(--theme-text); opacity:0.7"><span style="opacity:0.5">HAVE：</span>${w.have.substring(0, 25)}${w.have.length > 25 ? '...' : ''}</div>` : ''}
      <div class="flex items-center gap-1 mt-2">
        ${!w.done ? `<button onclick="toggleWishDone(${w.id})" class="text-xs px-2 py-1 rounded-full" style="background:rgba(245,230,200,0.4); color:#B8955A">✨ 标记已显化</button>` : ''}
        <button onclick="deleteWish(${w.id})" class="text-xs px-2 py-1 ml-auto" style="color:var(--theme-text); opacity:0.4">删除</button>
      </div>
    </div>
  `).join('');
}

function toggleWishDone(id) {
  const w = state.wishes.find(x => x.id === id);
  if (!w) return;
  if (!w.done) {
    const review = prompt('写下你的星愿复盘吧～（选填）');
    w.done = true;
    w.review = review || '';
    addEnergy(200, '星愿成真');
    triggerConfetti();
    playSound('bloom');
    showToast('🎉 恭喜公主星愿成真！');
    speak('恭喜公主星愿成真，你真棒！');
  } else {
    w.done = false;
    showToast('已取消标记');
  }
  saveState();
  renderSkyWishes();
  renderWishList();
  checkBadges();
}

function deleteWish(id) {
  if (!confirm('确定要删除这个愿望吗？')) return;
  state.wishes = state.wishes.filter(w => w.id !== id);
  saveState();
  renderSkyWishes();
  renderWishList();
  showToast('已删除');
}

// 拖动星星
function initWishStarDrag() {
  const star = document.getElementById('pending-star');
  const sky = document.getElementById('wish-sky');
  if (!star || !sky || star.classList.contains('hidden')) return;
  if (star._dragBound) return;
  star._dragBound = true;

  let isDragging = false;
  let startX, startY, origX, origY;

  const onStart = (e) => {
    isDragging = true;
    const rect = star.getBoundingClientRect();
    const skyRect = sky.getBoundingClientRect();
    origX = rect.left - skyRect.left;
    origY = rect.top - skyRect.top;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    star.style.transition = 'none';
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    star.style.left = (origX + dx) + 'px';
    star.style.top = (origY + dy) + 'px';
    star.style.bottom = 'auto';
    star.style.transform = 'rotate(15deg)';
    e.preventDefault();
  };
  const onEnd = (e) => {
    if (!isDragging) return;
    isDragging = false;
    star.style.transition = '';
    star.style.transform = '';
    const starRect = star.getBoundingClientRect();
    const skyRect = sky.getBoundingClientRect();
    const starCenterX = starRect.left + starRect.width / 2;
    const starCenterY = starRect.top + starRect.height / 2;

    if (starCenterX > skyRect.left && starCenterX < skyRect.right &&
        starCenterY > skyRect.top && starCenterY < skyRect.bottom) {
      const wishId = parseInt(star.dataset.wishId);
      const w = state.wishes.find(x => x.id === wishId);
      if (w) {
        w.skyX = ((starCenterX - skyRect.left) / skyRect.width * 100);
        w.skyY = ((starCenterY - skyRect.top) / skyRect.height * 100);
        saveState();
      }
      createSkyRipple(starCenterX - skyRect.left, starCenterY - skyRect.top);
      playSound('ding');
      star.classList.add('hidden');
      renderSkyWishes();
      speak('你的愿望已经被宇宙稳稳接住啦，会慢慢实现的💫');
      showToast('⭐ 愿望已送上星空！');
      ['wish-be', 'wish-do', 'wish-have', 'wish-sight', 'wish-sound', 'wish-touch', 'wish-feel', 'wish-first-action'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
    } else {
      star.style.left = '';
      star.style.top = '';
      star.style.bottom = '20px';
    }
  };

  star.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  star.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
}

// Chunk exports
window.selectWishType = selectWishType;
window.saveWishDraft = saveWishDraft;
window.loadWishDraft = loadWishDraft;
window.renderStars = renderStars;
window.createWishStar = createWishStar;
window.renderSkyWishes = renderSkyWishes;
window.renderWishList = renderWishList;
window.toggleWishDone = toggleWishDone;
window.deleteWish = deleteWish;
window.initWishStarDrag = initWishStarDrag;

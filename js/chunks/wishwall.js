// ============================================================
// 心愿墙
function renderWishWall() {
  const wishes = state.wishes || [];
  const total = wishes.length;
  const done = wishes.filter(w => w.done).length;
  const rate = total > 0 ? Math.round(done / total * 100) : 0;

  setText('ww-total', total);
  setText('ww-done', done);
  setText('ww-rate', rate + '%');

  const grid = document.getElementById('wishwall-grid');
  if (total === 0) {
    grid.innerHTML = `<div class="text-center py-8 text-sm col-span-full" style="color:var(--theme-text); opacity:0.4">还没有愿望木牌，写下第一个愿望吧 🌟</div>`;
    return;
  }

  grid.innerHTML = wishes.map((w, i) => {
    const title = w.title || w.be || w.have || w.do || '我的愿望';
    return `
    <div class="wish-plaque ${w.done ? 'done' : ''}" onclick="openWishDetail(${i})" style="transform: rotate(${(i % 5 - 2) * 2}deg)">
      <div class="wish-plaque-string"></div>
      <div class="wish-plaque-body">
        <div class="text-[10px] font-medium truncate" style="color:${w.done ? '#78350F' : '#5D4037'}">${title.substring(0, 12)}</div>
        ${w.done ? '<div class="text-[9px] mt-0.5" style="color:#D97706">✨ 已显化</div>' : ''}
      </div>
      ${w.done ? '<div class="absolute -top-1 -right-1 text-xs animate-twinkle">⭐</div>' : ''}
    </div>
  `;}).join('');
}

function openWishDetail(i) {
  const w = state.wishes[i];
  if (!w) return;
  const title = w.title || w.be || w.have || w.do || '我的愿望';
  const desc = w.desc || [w.be && `BE：${w.be}`, w.do && `DO：${w.do}`, w.have && `HAVE：${w.have}`].filter(Boolean).join('\n');
  setText('wd-title', w.done ? '✨ 已显化的愿望' : '🌠 进行中的愿望');
  
  const progressHtml = (w.progress || []).map((p, pi) => `
    <div class="p-2 rounded-lg mb-2" style="background:rgba(184,169,201,0.08)">
      <div class="text-[10px] mb-0.5" style="color:var(--theme-text); opacity:0.5">${p.date}</div>
      <div class="text-xs" style="color:var(--theme-text)">${p.text}</div>
    </div>
  `).join('') || '<div class="text-xs text-center py-2" style="color:var(--theme-text); opacity:0.4">还没有进度记录～</div>';

  setHTML('wish-detail-content', `
    <div class="p-4 rounded-xl mb-4" style="background:linear-gradient(135deg, ${w.done ? 'rgba(245,230,200,0.3)' : 'rgba(212,181,199,0.2)'}, rgba(184,169,201,0.1))">
      <div class="text-xs mb-2" style="color:var(--theme-text); opacity:0.6">${w.date || ''}</div>
      <div class="text-base font-title mb-2" style="color:var(--theme-text)">${title}</div>
      ${desc ? `<div class="text-xs whitespace-pre-line" style="color:var(--theme-text); opacity:0.8">${desc}</div>` : ''}
    </div>

    ${!w.done ? `
    <div class="mb-4">
      <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">📝 显化进度记录</div>
      <div class="max-h-40 overflow-y-auto mb-3">${progressHtml}</div>
      <div class="flex gap-2">
        <input type="text" id="wish-progress-input" placeholder="记录一下进展..." class="dream-input text-sm flex-1 !p-2"/>
        <button onclick="addWishProgress(${i})" class="soft-btn btn-primary px-3 text-sm">记录</button>
      </div>
    </div>
    <button onclick="markWishDone(${i})" class="soft-btn w-full py-2.5 text-sm font-title mb-2" style="background:linear-gradient(135deg, #F5E6C8, #E8C87A); color:#78350F; box-shadow:0 4px 14px rgba(245,158,11,0.25)">
      ✨ 标记已显化
    </button>
    ` : `
    <div class="p-3 rounded-xl mb-3 text-center" style="background:rgba(245,230,200,0.25)">
      <div class="text-sm font-medium mb-1" style="color:#D97706">🎉 恭喜你星愿成真！</div>
      <div class="text-xs" style="color:var(--theme-text); opacity:0.7">相信的力量，让愿望成真了 ✨</div>
    </div>
    `}
    <button onclick="deleteWishByIndex(${i})" class="soft-btn w-full py-2 text-xs" style="background:rgba(245,213,213,0.2); color:#B87590">
      删除这个愿望
    </button>
  `);
  showModal('wish-detail-modal');
  playSound('page');
}

function closeWishDetail() {
  hideModal('wish-detail-modal');
}

function addWishProgress(i) {
  const input = document.getElementById('wish-progress-input');
  if (!input) { showToast('请先打开愿望详情页'); return; }
  const text = input.value.trim();
  if (!text) { showToast('写点什么吧～'); return; }
  if (!state.wishes[i]) { showToast('愿望不存在'); return; }
  if (!state.wishes[i].progress) state.wishes[i].progress = [];
  state.wishes[i].progress.unshift({ text, date: getTodayStr() });
  saveState();
  playSound('sparkle');
  addEnergy(5, '记录显化进度');
  openWishDetail(i);
  renderWishWall();
}

function markWishDone(i) {
  if (!confirm('确定这个愿望已经显化了吗？✨')) return;
  if (!state.wishes[i]) { showToast('愿望不存在'); return; }
  state.wishes[i].done = true;
  state.wishes[i].doneDate = getTodayStr();
  saveState();
  playSound('bloom');
  addEnergy(50, '愿望显化');
  triggerConfetti();
  closeWishDetail();
  renderWishWall();
  renderStars();
  checkBadges();
}

function deleteWishByIndex(i) {
  if (!confirm('确定要删除这个愿望吗？')) return;
  state.wishes.splice(i, 1);
  saveState();
  closeWishDetail();
  renderWishWall();
  renderStars();
  showToast('已删除～');
}

function openNewWishModal() {
  // 跳转到许愿星台页面去许愿
  openModule('stars');
  showToast('去许愿星台写下你的愿望吧～');
}

// Chunk exports
window.renderWishWall = renderWishWall;
window.openWishDetail = openWishDetail;
window.closeWishDetail = closeWishDetail;
window.addWishProgress = addWishProgress;
window.markWishDone = markWishDone;
window.deleteWishByIndex = deleteWishByIndex;
window.openNewWishModal = openNewWishModal;

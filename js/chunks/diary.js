// 星愿花园 - 显化日志馆模块 (动态加载 chunk)
// Auto-extracted from app.js

//  显化日志馆
// ============================================================

let currentDiaryTemplate = 'gratitude';
let currentPaperSkin = 'sakura';
let diaryPromptIdx = 0;

function renderDiary() {
  setText('diary-total', state.diaries.length);
  setText('diary-streak', state.diaryStreak || 0);
  newDiaryPrompt();
}

function selectDiaryTemplate(tpl, btn) {
  currentDiaryTemplate = tpl;
  state.diaryTemplate = tpl;
  saveState();
  document.querySelectorAll('#page-diary .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const labels = { gratitude: '感恩日记', future: '未来日记', success: '星愿成真日志' };
  const placeholders = {
    gratitude: '今天我感恩的3件小事：\n1. \n2. \n3. ',
    future: '（以愿望已经实现的你写今天）\n\n今天是美好的一天...',
    success: '今天我星愿成真的事：\n\n（哪怕是小事也要记下来哦～）',
  };
  setText('diary-template-label', labels[tpl] || '日记');
  const ta = document.getElementById('diary-content');
  if (ta && !ta.value) ta.placeholder = placeholders[tpl] || '写点什么吧...';
  playSound('page');
}

function selectPaperSkin(skin, btn) {
  currentPaperSkin = skin;
  state.paperSkin = skin;
  saveState();
  document.querySelectorAll('.paper-skin-btn').forEach(b => {
    b.style.borderColor = 'transparent';
  });
  btn.style.borderColor = '#D4B5C7';
  const paper = document.getElementById('diary-paper');
  if (paper) {
    const colors = {
      sakura: 'linear-gradient(180deg, #FFFEFF, #FDF2F8)',
      star: 'linear-gradient(180deg, #F8FAFC, #EEF2FF)',
      rose: 'linear-gradient(180deg, #FFF1F2, #FECDD3)',
      lily: 'linear-gradient(180deg, #F0FDF4, #BBF7D0)',
      cloud: 'linear-gradient(180deg, #EFF6FF, #DBEAFE)',
    };
    paper.style.background = colors[skin] || colors.sakura;
  }
  playSound('page');
}

function saveDiary() {
  const dateEl = document.getElementById('diary-date');
  const contentEl = document.getElementById('diary-content');
  if (!dateEl || !contentEl) { showToast('页面元素未加载，请刷新试试'); return; }
  const date = dateEl.value.trim();
  const content = contentEl.value.trim();
  if (!content) { showToast('写点什么吧公主～'); return; }
  state.diaries.unshift({
    id: Date.now(),
    date: date || getTodayStr(),
    content,
    template: currentDiaryTemplate,
    skin: currentPaperSkin,
    created: getTodayStr(),
  });
  const today = getTodayStr();
  if (state.lastDiaryDate !== today) {
    if (state.lastDiaryDate) {
      const lastDate = new Date(state.lastDiaryDate);
      const todayDate = new Date(today);
      if (isNaN(lastDate.getTime()) || isNaN(todayDate.getTime())) {
        state.diaryStreak = 1;
      } else {
        const diff = Math.floor((todayDate - lastDate) / (1000*60*60*24));
        if (diff === 1) state.diaryStreak++;
        else if (diff > 1) state.diaryStreak = 1;
      }
    } else {
      state.diaryStreak = 1;
    }
    state.lastDiaryDate = today;
  }
  saveState();
  addEnergy(15, '写日记');
  logActivity('diary', '写日记');
  const diaryDate = document.getElementById('diary-date');
  const diaryContent = document.getElementById('diary-content');
  if (diaryDate) diaryDate.value = '';
  if (diaryContent) diaryContent.value = '';
  playSound('page');
  showToast('📔 日记已保存');
  speak('日记已保存，你的每一份心情都很珍贵～');
  checkBadges();
  renderDiary();
}

function showDiaryHistory() {
  const el = document.getElementById('diary-history-list');
  if (state.diaries.length === 0) {
    el.innerHTML = `<div class="text-center py-10">
      <div class="text-4xl mb-3">📔</div>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">还没有写过日记哦～</p>
      <p class="text-xs mb-5" style="color:var(--theme-text); opacity:0.4">写日记不是任务，是和自己温柔对话的时间 💕</p>
      <button onclick="closeBookModal(); switchTab('journal')" class="soft-btn btn-primary px-6 py-2.5 text-sm font-title">去写第一篇日记 ✨</button>
    </div>`;
  } else {
    el.innerHTML = state.diaries.map((d, i) => `
      <div class="p-3 rounded-xl cursor-pointer card-hover" style="background:linear-gradient(135deg, rgba(240,213,224,0.15), rgba(184,169,201,0.08))" onclick="viewDiary(${i})">
        <div class="text-xs mb-1" style="color:var(--theme-text); opacity:0.5">📅 ${d.date}</div>
        <div class="text-xs line-clamp-2" style="color:var(--theme-text); opacity:0.8">${escapeHtml((d.content||'').substring(0, 60))}${(d.content||'').length > 60 ? '...' : ''}</div>
      </div>
    `).join('');
  }
  showModal('diary-modal');
  playSound('page');
}

function closeDiaryModal() {
  hideModal('diary-modal');
}

function viewDiary(i) {
  const d = state.diaries[i];
  const el = document.getElementById('diary-history-list');
  if (!el) return;
  el.innerHTML = `
    <button onclick="showDiaryHistory()" class="text-xs mb-3" style="color:#B8A9C9">← 返回列表</button>
    <div class="letter-paper p-4 min-h-[300px] page-turn-anim" style="background:linear-gradient(180deg, #FFFEFF, #FAF5F7)">
      <div class="text-xs mb-2" style="color:var(--theme-text); opacity:0.5">📅 ${d.date}</div>
      <div class="text-sm whitespace-pre-wrap leading-7" style="color:var(--theme-text)">${escapeHtml(d.content)}</div>
    </div>
  `;
  playSound('page');
}

function newDiaryPrompt() {
  const prompt = DIARY_PROMPTS[diaryPromptIdx % DIARY_PROMPTS.length];
  setText('diary-prompt', prompt);
  diaryPromptIdx++;
}

// ============================================================

// Mount functions to window for HTML onclick compatibility
window.renderDiary = renderDiary;
window.selectDiaryTemplate = selectDiaryTemplate;
window.selectPaperSkin = selectPaperSkin;
window.saveDiary = saveDiary;
window.showDiaryHistory = showDiaryHistory;
window.closeDiaryModal = closeDiaryModal;
window.viewDiary = viewDiary;
window.newDiaryPrompt = newDiaryPrompt;

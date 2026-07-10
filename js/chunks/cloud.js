
// ============================================================
//  云端冥想城堡
// ============================================================

let satsInterval = null;
let satsTime = 0;
let satsRunning = false;
let satsCurrentStep = 1;
let currentAffirmCat = 'love';
let currentAffirmSub = 'sp';

function renderCloud() {
  renderAffirmList('love');
  renderMDDiet();
}

function startSATS(type) {
  remCls('sats-area', 'hidden');
  setText('sats-title', '🌙 SATS · ' + type);
  satsTime = 0;
  satsCurrentStep = 1;
  updateSATSStep(1);
  updateSATSTimer();
  const satsArea = document.getElementById('sats-area');
  if (satsArea) satsArea.scrollIntoView({ behavior: 'smooth', block:'center' });
  playSound('chime');
}

function updateSATSStep(step) {
  satsCurrentStep = step;
  // 更新步骤指示器
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById('sats-dot-' + i);
    if (!dot) continue;
    if (i < step) {
      dot.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
      dot.style.color = 'white';
      dot.style.opacity = '1';
      dot.textContent = '✓';
    } else if (i === step) {
      dot.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
      dot.style.color = 'white';
      dot.style.opacity = '1';
      dot.textContent = i;
    } else {
      dot.style.background = 'rgba(184,169,201,0.15)';
      dot.style.color = 'var(--theme-text)';
      dot.style.opacity = '0.5';
      dot.textContent = i;
    }
  }

  // 各步骤引导文字
  const guides = SATS_GUIDES[type] || SATS_GUIDES['情绪疗愈'];
  const stepTexts = {
    1: `
      <p class="mb-2"><b>第1步 · 逐部位放松身体</b></p>
      <p class="mb-2">🦶 先放松你的脚趾... 让脚趾慢慢放松，释放所有紧张...</p>
      <p class="mb-2">🦵 放松小腿... 大腿... 让双腿变得越来越沉越来越沉...</p>
      <p class="mb-2">💫 放松腹部... 胸口... 随着呼吸，让身体越来越放松...</p>
      <p class="mb-2">💪 放松双手... 手臂... 肩膀... 释放所有压力...</p>
      <p class="mb-2">🧘 放松脖子... 脸... 头皮... 整个人都软下来了...</p>
      <p class="text-xs opacity-60">（跟着呼吸光圈慢慢放松，大概2分钟后进入下一步）</p>
    `,
    2: `
      <p class="mb-2"><b>第2步 · 进入半梦半醒的状态</b></p>
      <p class="mb-2">🌙 现在你的身体已经完全放松了...</p>
      <p class="mb-2">你感到眼皮越来越沉，越来越困...</p>
      <p class="mb-2">你快要睡着了，但意识还是清醒的...</p>
      <p class="mb-2">这就是SATS的黄金时刻——似睡非睡的状态...</p>
      <p class="mb-2">在这个状态下，你的潜意识最容易接受新的信念...</p>
      <p class="text-xs opacity-60">（继续深呼吸，保持这个状态）</p>
    `,
    3: `
      <p class="mb-2"><b>第3步 · 构建愿望实现的第一个小动作</b></p>
      <p class="mb-2">✨ 现在，想象你的愿望已经实现了...</p>
      <p class="mb-2">找到一个<b>简单的小动作</b>——愿望实现后你会做的第一件小事...</p>
      <p class="mb-2">比如：朋友拍你肩膀说恭喜、你摸到喜欢的人的手、你看到工资到账的短信...</p>
      <p class="mb-2">让这个场景<b>简短、具体、多感官</b>：</p>
      <p class="mb-2">👀 你看到了什么？👂 你听到了什么？🤲 你摸到了什么？💗 你心里是什么感觉？</p>
      <p class="text-xs opacity-60">（越细节越真实，显化越快）</p>
    `,
    4: `
      <p class="mb-2"><b>第4步 · 循环这个小场景</b></p>
      <p class="mb-2">🔄 现在，一遍一遍地循环这个小动作...</p>
      <p class="mb-2">每一次循环，都让感觉更真实一点...</p>
      <p class="mb-2">感受那份喜悦、那份满足...</p>
      <p class="mb-2">你不是在「想象」，你是在「体验」...</p>
      <p class="mb-2">它已经是真实的了，它已经发生了...</p>
      <p class="text-xs opacity-60">（循环到你有困意就好，不用勉强）</p>
    `,
    5: `
      <p class="mb-2"><b>第5步 · 带着感觉入睡/结束</b></p>
      <p class="mb-2">💫 做得好棒呀～</p>
      <p class="mb-2">带着这份美好的感觉，它已经种在了你的潜意识里...</p>
      <p class="mb-2">你的愿望已经在来的路上了...</p>
      <p class="mb-2">相信它就像你种下一颗种子，不需要每天挖出来看有没有发芽...</p>
      <p class="mb-2">你只需要好好生活，好好感受已经播下的种子会自己生长🌱</p>
      <p>✨ 感谢宇宙，一切都是最好的安排 ✨</p>
    `,
  };
  setHTML('sats-text', stepTexts[step] || guides);
}

function toggleSATS() {
  const btn = document.getElementById('sats-toggle-btn');
  if (satsRunning) {
    satsRunning = false;
    clearInterval(satsInterval);
    satsInterval = null;
    btn.innerHTML = '▶️ 继续';
  } else {
    if (satsInterval) { clearInterval(satsInterval); satsInterval = null; }
    satsRunning = true;
    btn.innerHTML = '⏸️ 暂停';
    satsInterval = setInterval(() => {
      satsTime++;
      updateSATSTimer();
      // 步骤推进时间点
      if (satsTime === 10) updateSATSStep(1); // 0-2分钟：放松
      if (satsTime === 120) updateSATSStep(2); // 2分钟：入境
      if (satsTime === 240) updateSATSStep(3); // 4分钟：构建场景
      if (satsTime === 360) updateSATSStep(4); // 6分钟：循环
      if (satsTime === 720) updateSATSStep(5); // 12分钟：结束
      if (satsTime >= 900) { stopSATS(); completeSATS(); }
    }, 1000);
    playSound('chime');
  }
}

function updateSATSTimer() {
  const mins = Math.floor(satsTime / 60);
  const secs = satsTime % 60;
  const timerEl = document.getElementById('sats-timer');
  if (timerEl) timerEl.textContent =
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')} / 15:00`;
  const cycle = satsTime % 14;
  const breathText = document.getElementById('sats-breath-text');
  if (breathText) {
    if (cycle < 4) breathText.textContent = '吸气';
    else if (cycle < 8) breathText.textContent = '屏息';
    else breathText.textContent = '呼气';
  }
}

function stopSATS() {
  satsRunning = false;
  if (satsInterval) { clearInterval(satsInterval); satsInterval = null; }
  setHTML('sats-toggle-btn', '▶️ 开始');
}

// SATS笔记自动保存
let satsSaveTimer = null;
function saveSATSScene() {
  clearTimeout(satsSaveTimer);
  const statusEl = document.getElementById('sats-save-status');
  if (statusEl) statusEl.textContent = '保存中...';
  satsSaveTimer = setTimeout(() => {
    const scene = document.getElementById('sats-scene')?.value || '';
    const feeling = document.getElementById('sats-feeling')?.value || '';
    const title = document.getElementById('sats-title')?.textContent?.replace('🌙 SATS · ', '') || 'SATS冥想';
    if (!state.satsRecords) state.satsRecords = [];
    const today = getTodayStr();
    const todayIdx = state.satsRecords.findIndex(r => r.date === today && r.type === title);
    if (todayIdx > -1) {
      state.satsRecords[todayIdx].scene = scene;
      state.satsRecords[todayIdx].feeling = feeling;
    } else {
      state.satsRecords.unshift({ type: title, scene, feeling, date: today });
    }
    if (state.satsRecords.length > 50) state.satsRecords = state.satsRecords.slice(0, 50);
    saveState();
    if (statusEl) {
      statusEl.textContent = '✓ 已保存';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
    }
  }, 500);
}


function completeSATS() {
  state.satsCount = (state.satsCount || 0) + 1;
  saveState();
  addEnergy(40, 'SATS冥想');
  addCls('sats-area', 'hidden');
  stopSATS();
  showAlert('🌙', 'SATS完成', '带着这份美好的感觉，愿望已经在来的路上了～ 💫');
  checkBadges();
}

// 情绪调频
function setEmotionLevel(level) {
  state.emotionLevel = level;
  saveState();
  const marker = document.getElementById('emotion-marker');
  if (marker) marker.style.left = level + '%';
  let name = '平静/中性', band = 'mid';
  for (const s of EMOTION_SCALE) { if (level >= s.level) name = s.name; }
  if (level < 35) band = 'low';
  else if (level > 70) band = 'high';
  setText('emotion-level-text', name);
  const guide = EMOTION_GUIDES[band];
  setHTML('emotion-guide', `
    <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">💡 你现在在「${name}」的位置</div>
    <div class="text-xs mb-2" style="color:var(--theme-text)); opacity:0.8">${guide.title}</div>
    <ol class="text-xs space-y-1.5 list-decimal list-inside" style="color:var(--theme-text); opacity:0.7">
      ${guide.steps.map(s => `<li>${s}</li>`).join('')}
    </ol>
  `);
  playSound('sparkle');
  updateTimeAndWeather();
}

// 精神节食
const MD_REPLACEMENTS = {
  '我不够好': '我本来就很好，值得被爱被珍惜',
  '他不爱我': '我值得被全心全意地爱着',
  '我赚不到钱': '金钱轻松向我涌来，我是吸金体质',
  '我做不到': '我有能力做到任何我想做的事',
  '我很焦虑': '我是安全的，一切都在最好的安排中',
  '没人在乎我': '我被很多人爱着，我本身就很重要',
  '我很失败': '每一次经历都是成长，我一直在进步',
  '我不漂亮': '我本来就很美，由内而外发光',
};

function getMDReplacement(neg) {
  // 精确匹配
  if (MD_REPLACEMENTS[neg]) return MD_REPLACEMENTS[neg];
  // 关键词匹配
  const keys = Object.keys(MD_REPLACEMENTS);
  for (const k of keys) {
    if (neg.includes(k.slice(0, 3)) || k.includes(neg.slice(0, 3))) return MD_REPLACEMENTS[k];
  }
  // 默认返回通用肯定语
  let allAffirms = [];
  if (typeof AFFIRMATIONS !== 'undefined') {
    ['heal', 'self'].forEach(c => {
      const cat = AFFIRMATIONS[c];
      if (cat && cat.subs) {
        Object.values(cat.subs).forEach(sub => {
          if (sub && Array.isArray(sub.list)) {
            allAffirms = allAffirms.concat(sub.list);
          }
        });
      }
    });
  }
  if (allAffirms.length === 0) return '我每天都在变得更好';
  return allAffirms[Math.floor(Math.random() * allAffirms.length)];
}

function addMDDiet() {
  const input = document.getElementById('md-input');
  const text = input.value.trim();
  if (!text) { showToast('写下你的负面想法吧～'); return; }
  processMDDiet(text);
  input.value = '';
}

function quickMDDiet(text) {
  processMDDiet(text);
}

function processMDDiet(neg) {
  const pos = getMDReplacement(neg);
  const today = getTodayStr();

  // 记录
  if (!state.mentalDiet.records) state.mentalDiet.records = [];
  state.mentalDiet.records.unshift({ neg, pos, date: today });
  if (state.mentalDiet.records.length > 100) state.mentalDiet.records.pop();

  state.mentalDiet.total = (state.mentalDiet.total || 0) + 1;
  state.mentalDiet.todayCount = (state.mentalDiet.todayCount || 0) + 1;

  // 连续天数
  const last = state.mentalDiet.lastCheckin;
  if (last !== today) {
    if (last) {
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      if (isNaN(lastDate.getTime()) || isNaN(todayDate.getTime())) {
        state.mentalDiet.streak = 1;
      } else {
        const diff = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) state.mentalDiet.streak = (state.mentalDiet.streak || 0) + 1;
        else if (diff > 1) state.mentalDiet.streak = 1;
      }
    } else {
      state.mentalDiet.streak = 1;
    }
    state.mentalDiet.lastCheckin = today;
  }

  saveState();
  addEnergy(5, '精神节食');

  // 显示替换结果
  setText('md-neg-text', neg);
  setText('md-pos-text', pos);
  remCls('md-result', 'hidden');
  addCls('md-result', 'animate-soft-pop');
  
  playSound('sparkle');
  renderMDDiet();
  checkBadges();
}

function renderMDDiet() {
  const md = state.mentalDiet;
  setText('md-day', md.streak || 0);
  setStyle('md-progress', 'width', Math.min((md.streak || 0) / 21 * 100, 100) + '%');
  setText('md-today-count', md.todayCount || 0);
  setText('md-total-count', md.total || 0);
  setText('md-streak', md.streak || 0);

  // 日历
  const cal = document.getElementById('md-calendar');
  if (!cal) return;
  let html = '';
  for (let i = 1; i <= 21; i++) {
    const done = i <= (md.streak || 0);
    html += `<div class="aspect-square rounded-lg flex items-center justify-center text-[10px]" style="background:${done ? 'linear-gradient(135deg, #D4B5C7, #B8A9C9)' : 'rgba(184,169,201,0.08)'}; color:${done ? 'white' : 'rgba(93,78,109,0.4)'}">${done ? '✨' : i}</div>`;
  }
  cal.innerHTML = html;
}

function doEmotionPractice(type) {
  const practices = {
    'EFT敲击': '用手指轻轻敲击眉心、太阳穴、锁骨下，每处敲7次，同时说"虽然我有这个情绪，但我深深地爱并接纳我自己"。',
    '478呼吸': '用鼻子吸气4秒，屏息7秒，用嘴呼气8秒。重复5次，你会感觉平静很多。',
    '书写释放': '把你所有的情绪和想法都写在纸上，想写什么写什么，写完可以撕掉扔掉，把情绪释放出去。',
  };
  showAlert('🧘', type, practices[type] || '开始练习吧～');
  speak(`我们来做${type}练习吧～`);
}

// 肯定语
function switchAffirmCat(cat, btn) {
  document.querySelectorAll('#page-cloud .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentAffirmCat = cat;
  // 重置子分类到第一个
  if (cat !== 'saved' && AFFIRMATIONS[cat]) {
    currentAffirmSub = Object.keys(AFFIRMATIONS[cat].subs)[0];
  }
  renderAffirmSubcats();
  renderAffirmList(cat);
}

function switchAffirmSub(sub, btn) {
  document.querySelectorAll('#affirm-subcats .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentAffirmSub = sub;
  renderAffirmList(currentAffirmCat);
  playSound('ding');
}

function renderAffirmSubcats() {
  const el = document.getElementById('affirm-subcats');
  if (!el) return;
  if (currentAffirmCat === 'saved') {
    el.innerHTML = '';
    return;
  }
  const cat = AFFIRMATIONS[currentAffirmCat];
  if (!cat || !cat.subs) { el.innerHTML = ''; return; }
  const subs = Object.entries(cat.subs);
  el.innerHTML = subs.map(([key, sub], i) => `
    <button class="chip-soft ${i === 0 ? 'active' : ''}" onclick="switchAffirmSub('${key}', this)">${sub.name}</button>
  `).join('');
}

function renderAffirmList(cat) {
  const el = document.getElementById('affirm-list');
  if (!el) return;
  if (cat === 'saved') {
    const saved = state.affirmations.saved;
    if (saved.length === 0) {
      el.innerHTML = `<div class="col-span-full text-center py-8 text-sm" style="color:var(--theme-text); opacity:0.4">还没有收藏的肯定语，点击卡片就可以收藏哦～ 💖</div>`;
      return;
    }
    el.innerHTML = saved.map(a => `
      <div class="affirm-card saved" onclick="playAffirm('${(a||'').replace(/'/g, "\\'")}')">💫 ${a}</div>
    `).join('');
    return;
  }
  const catData = AFFIRMATIONS[cat];
  if (!catData || !catData.subs) { el.innerHTML = ''; return; }
  const sub = catData.subs[currentAffirmSub];
  const list = sub ? sub.list : [];
  el.innerHTML = list.map(a => {
    const isSaved = state.affirmations.saved.includes(a);
    return `<div class="affirm-card ${isSaved ? 'saved' : ''}" onclick="playAffirm('${(a||'').replace(/'/g, "\\'")}')">
      💫 ${a}
      <div class="text-right mt-1">
        <button onclick="event.stopPropagation(); toggleSaveAffirm('${(a||'').replace(/'/g, "\\'")}')" class="text-xs" style="color:${isSaved ? '#D4A5B8' : 'rgba(93,78,109,0.4)'}">
          ${isSaved ? '💖 已收藏' : '🤍 收藏'}
        </button>
      </div>
    </div>`;
  }).join('');
}

function playAffirm(text) {
  speak(text);
  playSound('chime');
}


function toggleSaveAffirm(text) {
  const idx = state.affirmations.saved.indexOf(text);
  if (idx >= 0) {
    state.affirmations.saved.splice(idx, 1);
    showToast('已取消收藏');
  } else {
    state.affirmations.saved.push(text);
    showToast('💖 已收藏');
    playSound('ding');
  }
  saveState();
  renderAffirmList(currentAffirmCat);
  checkBadges();
}

function openAffirmModal() {
  showModal('affirm-modal');
}

function closeAffirmModal() {
  hideModal('affirm-modal');
}

function addCustomAffirm() {
  const text = document.getElementById('custom-affirm-text').value.trim();
  const cat = document.getElementById('custom-affirm-cat').value;
  if (!text) { showToast('写下你的肯定语呀～'); return; }
  if (!state.affirmations.custom[cat]) state.affirmations.custom[cat] = [];
  if (!state.affirmations.custom[cat].includes(text)) state.affirmations.custom[cat].push(text);
  if (!state.affirmations.saved.includes(text)) state.affirmations.saved.push(text);
  saveState();
  closeAffirmModal();
  document.getElementById('custom-affirm-text').value = '';
  showToast('💖 已添加到我的肯定语库');
  renderAffirmList(currentAffirmCat);
  checkBadges();
}
// Chunk exports
window.renderCloud = renderCloud;
window.startSATS = startSATS;
window.updateSATSStep = updateSATSStep;
window.toggleSATS = toggleSATS;
window.updateSATSTimer = updateSATSTimer;
window.stopSATS = stopSATS;
window.saveSATSScene = saveSATSScene;
window.completeSATS = completeSATS;
window.setEmotionLevel = setEmotionLevel;
window.getMDReplacement = getMDReplacement;
window.addMDDiet = addMDDiet;
window.quickMDDiet = quickMDDiet;
window.processMDDiet = processMDDiet;
window.renderMDDiet = renderMDDiet;
window.doEmotionPractice = doEmotionPractice;
window.switchAffirmCat = switchAffirmCat;
window.switchAffirmSub = switchAffirmSub;
window.renderAffirmSubcats = renderAffirmSubcats;
window.renderAffirmList = renderAffirmList;
window.playAffirm = playAffirm;
window.toggleSaveAffirm = toggleSaveAffirm;
window.openAffirmModal = openAffirmModal;
window.closeAffirmModal = closeAffirmModal;
window.addCustomAffirm = addCustomAffirm;

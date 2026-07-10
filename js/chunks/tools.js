function initBootcamp() {
  loadBootcampState();
  const certDate = document.getElementById('cert-date');
  if(certDate) certDate.textContent = new Date().toLocaleDateString('zh-CN');
  renderBootcamp();
}

function renderBootcamp() {
  const title = document.getElementById('bootcamp-title');
  const list = document.getElementById('bootcamp-list');
  const progress = document.getElementById('bootcamp-progress');
  if(!list) return;
  
  if(title) title.textContent = bootcampState.finished ? '🎉 训练营已完成' : BOOTCAMP_DATA.name;
  
  const totalTasks = BOOTCAMP_DATA.days.reduce((sum,d) => sum + d.tasks.length, 0);
  const completedCount = Object.values(bootcampState.completedTasks).filter(Boolean).length;
  if(progress) progress.style.width = (completedCount/totalTasks*100)+'%';
  
  list.innerHTML = BOOTCAMP_DATA.days.map((day, idx) => {
    const dayNum = idx + 1;
    const isCurrent = dayNum === bootcampState.currentDay;
    const isLocked = dayNum > bootcampState.currentDay && !bootcampState.finished;
    const dayTasks = day.tasks.map((t, tidx) => {
      const key = `d${dayNum}_t${tidx}`;
      const done = bootcampState.completedTasks[key];
      return `<div class="flex items-center gap-2 p-2 rounded-lg ${done ? 'bg-green-50' : 'bg-white/50'}" style="border:1px solid rgba(212,181,199,0.2)"><div class="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style="background:${done ? '#86EFAC' : 'rgba(212,181,199,0.2)'};color:${done ? '#166534' : 'var(--text-mute)'}">${done ? '✓' : (tidx+1)}</div><span class="text-xs ${done ? 'line-through opacity-50' : ''}" style="color:var(--theme-text)">${t}</span></div>`;
    }).join('');
    
    return `<div class="glass-card p-4 mb-3 ${isLocked ? 'opacity-50' : ''}"><div class="flex items-center justify-between mb-2"><div class="font-medium text-sm" style="color:var(--theme-text)">${day.title}</div>${isCurrent ? '<span class="text-xs px-2 py-0.5 rounded-full" style="background:linear-gradient(135deg,#D4B5C7,#B8A9C9);color:white">今日</span>' : ''}</div><div class="text-xs mb-3" style="color:var(--text-soft)">${day.lesson}</div><div class="space-y-1.5">${dayTasks}</div>${isCurrent && !isLocked ? `<button onclick="finishBootcampDay(${dayNum})" class="btn-primary w-full py-2 rounded-xl text-xs mt-3">完成今日课程</button>` : ''}</div>`;
  }).join('');
  
  const cert = document.getElementById('bootcamp-certificate');
  if(cert) cert.style.display = bootcampState.finished ? 'block' : 'none';
}

function finishBootcampDay(dayNum) {
  const day = BOOTCAMP_DATA.days[dayNum-1];
  if(!day) return;
  day.tasks.forEach((t, i) => {
    bootcampState.completedTasks[`d${dayNum}_t${i}`] = true;
  });
  if(dayNum < 7) {
    bootcampState.currentDay = dayNum + 1;
    showToast(`🎉 第${dayNum}天完成！明日解锁第${dayNum+1}天`);
  } else {
    bootcampState.finished = true;
    showToast('🎉 训练营毕业！你是显化大师了');
    triggerConfetti();
  }
  saveBootcampState();
  renderBootcamp();
}

function resetBootcamp() {
  if(!confirm('确定要重置训练营进度吗？')) return;
  bootcampState = { currentDay: 1, completedTasks: {}, started: false, finished: false };
  saveBootcampState();
  renderBootcamp();
  showToast('训练营已重置');
}

function shareBootcampCertificate() {
  const text = `✨ 我在「星愿花园」完成了7天显化速训营！\n\n从设定意图到活在终点，我每天都在创造自己的现实。\n\n显化不是等待，而是成为。🌙\n\n🏝️ 下载星愿花园，一起显化梦想！`;
  if(navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('证书文案已复制 ✨')).catch(err => console.warn('剪贴板复制失败:', err)); }
}

// ===== 星辰社区增强 v3.5 =====
let communityPosts = [];
function loadCommunityPosts() { try { const s = StorageUtil.get('community_posts', []); if(s) communityPosts = s; } catch(e){} }
function saveCommunityPosts() { StorageUtil.set('community_posts', communityPosts.slice(-50)); }

function submitCommunityPost() {
  const content = document.getElementById('community-post-input');
  const mood = document.getElementById('community-post-mood');
  if(!content) return;
  const text = content.value.trim();
  if(!text) { showToast('请输入内容'); return; }
  if(text.length < 5) { showToast('内容太短啦'); return; }
  const post = {
    id: Date.now(),
    text: text,
    mood: mood ? mood.value : '💭',
    date: new Date().toLocaleDateString('zh-CN'),
    likes: 0,
    liked: false
  };
  communityPosts.unshift(post);
  saveCommunityPosts();
  content.value = '';
  renderCommunityFeed();
  showToast('✨ 发布成功！');
  earnCrystals(5, '星辰社区投稿');
}

function likeCommunityPost(id) {
  const post = communityPosts.find(p => p.id === id);
  if(!post || post.liked) return;
  post.likes++;
  post.liked = true;
  saveCommunityPosts();
  renderCommunityFeed();
  showToast('💖 已点赞');
}

function renderCommunityFeed() {
  const el = document.getElementById('community-feed-v35');
  if(!el) return;
  loadCommunityPosts();
  
  const defaultPosts = [
    {id:'d1',text:'连续21天打卡！SP昨天真的给我发消息了，和我在SATS里想象的一模一样！感恩宇宙 💖',mood:'💕',date:'2小时前',likes:128,liked:false},
    {id:'d2',text:'用财富肯定语3个月，意外收到了一笔奖金，刚好是我affirm的数字！显化真的有用！',mood:'💰',date:'5小时前',likes:89,liked:false},
    {id:'d3',text:'第一次尝试SATS冥想，没想到真的睡着了，还做了很美的梦。今天心情特别好～',mood:'🌙',date:'昨天',likes:56,liked:false}
  ];
  
  const all = [...communityPosts, ...defaultPosts];
  if(!all.length) { el.innerHTML = '<div class="text-center text-sm py-6" style="color:var(--text-mute)">还没有帖子，来做第一个分享者吧 ✨</div>'; return; }
  
  el.innerHTML = all.map(p => `<div class="glass-card p-4 mb-3"><div class="flex items-center gap-2 mb-2"><div class="text-lg">${p.mood}</div><div class="text-xs" style="color:var(--text-mute)">${p.date}</div></div><p class="text-sm mb-3" style="color:var(--theme-text)">${escapeHtml(p.text)}</p><div class="flex items-center gap-3"><button onclick="likeCommunityPost(${p.id})" class="text-xs flex items-center gap-1 ${p.liked ? 'text-red-400' : ''}" style="color:var(--text-mute)"><span>${p.liked ? '💖' : '❤️'}</span> ${p.likes}</button><span class="text-xs" style="color:var(--text-mute)">💬 评论</span></div></div>`).join('');
}

// ===== 反馈系统 =====
function showFeedbackModal() {
  const m = document.getElementById('feedback-modal');
  if(m) m.classList.add('show');
}

function closeFeedbackModal() {
  const m = document.getElementById('feedback-modal');
  if(m) m.classList.remove('show');
}

function submitFeedback() {
  const text = document.getElementById('feedback-text');
  const type = document.getElementById('feedback-type');
  if(!text) return;
  const t = text.value.trim();
  if(!t) { showToast('请填写反馈内容'); return; }
  const feedback = {
    text: t,
    type: type ? type.value : 'other',
    date: new Date().toISOString(),
    userAgent: (navigator.userAgent || '').substring(0, 50)
  };
  let history = StorageUtil.get('feedback_history', []);
  history.unshift(feedback);
  StorageUtil.set('feedback_history', history.slice(-20));
  text.value = '';
  closeFeedbackModal();
  showToast('💌 反馈已提交，感谢你的声音！');
  earnCrystals(5, '提交反馈');
  logActivity('feedback', '提交反馈');
}

// ===== 星辰搜索系统 =====
function openSearch() { showPage('search'); initSearch(); }

function initSearch() {
  const input = document.getElementById('search-input');
  if(input) { input.value = ''; input.focus(); }
  renderSearchResults('');
}

function onSearchInput(val) {
  renderSearchResults(val.trim());
}

function renderSearchResults(query) {
  const el = document.getElementById('search-results');
  if(!el) return;
  if(!query) { el.innerHTML = '<div class="text-center py-8 text-sm" style="color:var(--text-mute)">输入关键词搜索肯定语、书籍、电影、场景...</div>'; return; }
  
  const q = query.toLowerCase();
  const results = [];
  
  // Search affirmations
  const allAffirmations = [];
  if(typeof WEALTH_AFFIRMATIONS !== 'undefined') allAffirmations.push(...WEALTH_AFFIRMATIONS.map(a => ({type:'肯定语',cat:'财富',text:a})));
  if(typeof SP_AFFIRMATIONS !== 'undefined') {
    for(const cat in SP_AFFIRMATIONS) {
      allAffirmations.push(...SP_AFFIRMATIONS[cat].map(a => ({type:'肯定语',cat:'SP',text:a})));
    }
  }
  allAffirmations.forEach((a, i) => { if(a.text && a.text.toLowerCase().includes(q)) results.push({...a, id:'affirm_'+i, kind:'affirm', data:a.text.replace(/'/g,"\\'").replace(/"/g,'&quot;')}); });
  
  // Search books
  if(typeof BOOK_DETAILS !== 'undefined') {
    Object.entries(BOOK_DETAILS).forEach(([id, b]) => {
      if((b.title && b.title.toLowerCase().includes(q)) || (b.desc && b.desc.toLowerCase().includes(q))) {
        results.push({type:'书籍',cat:'经典',text:b.title, id:'book_'+id, kind:'book', data:id});
      }
    });
  }
  
  // Search movies
  if(typeof MOVIE_PRESCRIPTIONS !== 'undefined') {
    MOVIE_PRESCRIPTIONS.forEach((m, i) => {
      if((m.title && m.title.toLowerCase().includes(q)) || (m.theme && m.theme.toLowerCase().includes(q)) || (m.lesson && m.lesson.toLowerCase().includes(q))) {
        results.push({type:'电影',cat:'疗愈',text:m.title, id:'movie_'+i, kind:'movie', data:m.title});
      }
    });
  }
  
  // Search SATS scenes
  if(typeof SATS_SCENES !== 'undefined') {
    SATS_SCENES.forEach((s, i) => {
      if((s.title && s.title.toLowerCase().includes(q)) || (s.desc && s.desc.toLowerCase().includes(q))) {
        results.push({type:'冥想',cat:'SATS',text:s.title, id:'sats_'+i, kind:'sats', data:s.title});
      }
    });
  }
  
  if(!results.length) { el.innerHTML = '<div class="text-center py-8 text-sm" style="color:var(--text-mute)">没有找到相关内容，换个关键词试试 ✨</div>'; return; }
  
  el.innerHTML = results.map((r, i) => `<div class="glass-card p-4 mb-3 cursor-pointer card-hover" data-search-kind="${r.kind}" data-search-id="${r.id}" data-search-data="${(r.data||'').replace(/"/g,'&quot;')}"><div class="flex items-center gap-2 mb-1"><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">${r.type}</span><span class="text-xs" style="color:var(--text-mute)">${r.cat}</span></div><div class="text-sm font-medium" style="color:var(--theme-text)">${escapeHtml(r.text)}</div></div>`).join('');
  
  // Bind click handlers safely via event delegation
  el.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('click', function() {
      const kind = this.dataset.searchKind;
      const data = this.dataset.searchData;
      if (kind === 'affirm') { speakText(data); showToast('已播放 ✨'); }
      else if (kind === 'book') { openBookDetail(data, 'book'); }
      else if (kind === 'movie') { showToast('🎬 ' + data); }
      else if (kind === 'sats') { showPage('sats'); showToast('🌙 ' + data); }
    });
  });
}


// Chunk exports
window.initBootcamp = initBootcamp;
window.renderBootcamp = renderBootcamp;
window.finishBootcampDay = finishBootcampDay;
window.resetBootcamp = resetBootcamp;
window.shareBootcampCertificate = shareBootcampCertificate;
window.loadCommunityPosts = loadCommunityPosts;
window.saveCommunityPosts = saveCommunityPosts;
window.submitCommunityPost = submitCommunityPost;
window.likeCommunityPost = likeCommunityPost;
window.renderCommunityFeed = renderCommunityFeed;
window.showFeedbackModal = showFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.submitFeedback = submitFeedback;
window.openSearch = openSearch;
window.initSearch = initSearch;
window.onSearchInput = onSearchInput;
window.renderSearchResults = renderSearchResults;

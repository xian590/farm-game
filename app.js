'use strict';

/* ===== D13: 全局错误监控 ===== */
window.__errorLog = [];
window.__errorCount = 0;
window.addEventListener('error', function(e) {
  window.__errorCount++;
  const entry = { t: Date.now(), msg: e.message, file: e.filename, line: e.lineno, type: 'error' };
  window.__errorLog.push(entry);
  try { sessionStorage.setItem('__error_log', JSON.stringify(window.__errorLog.slice(-20))); } catch(_) {}
  console.warn('[ErrorMonitor]', e.message, 'at', e.filename + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', function(e) {
  window.__errorCount++;
  const entry = { t: Date.now(), msg: String(e.reason), type: 'promise' };
  window.__errorLog.push(entry);
  try { sessionStorage.setItem('__error_log', JSON.stringify(window.__errorLog.slice(-20))); } catch(_) {}
  console.warn('[ErrorMonitor] Unhandled rejection:', e.reason);
})

/* ===== Safe LocalStorage Wrapper ===== */
const safeLocalStorage = {
  getItem: function(key, defaultVal) {
    try { return localStorage.getItem(key) || defaultVal; } catch(e) { return defaultVal; }
  },
  setItem: function(key, val) {
    try { localStorage.setItem(key, val); return true; } catch(e) { return false; }
  },
  removeItem: function(key) {
    try { localStorage.removeItem(key); return true; } catch(e) { return false; }
  },
  clear: function() {
    try { localStorage.clear(); return true; } catch(e) { return false; }
  },
  getObject: function(key, defaultVal) {
    try { 
      const v = localStorage.getItem(key); 
      return v ? JSON.parse(v) : defaultVal; 
    } catch(e) { return defaultVal; }
  },
  setObject: function(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); return true; } catch(e) { return false; }
  }
};

/* ===== 新用户引导 ===== */
function showOnboarding() {
  if(safeLocalStorage.getItem('wish_island_onboarding_done')) return;
  const modal = document.getElementById('onboarding-modal');
  if(modal) modal.classList.add('show');
}
function nextOnboardingStep(step) {
  const s1 = document.getElementById('onboarding-step-1');
  const s2 = document.getElementById('onboarding-step-2');
  if(s1) s1.style.display = 'none';
  if(s2) s2.style.display = 'none';
  if(step === 2 && s2) s2.style.display = '';
}
function closeOnboarding() {
  const modal = document.getElementById('onboarding-modal');
  if(modal) modal.classList.remove('show');
  safeLocalStorage.setItem('wish_island_onboarding_done', 'true');
  // 首次完成引导，送水晶奖励
  if(!safeLocalStorage.getItem('wish_island_onboarding_reward')) {
    safeLocalStorage.setItem('wish_island_onboarding_reward', 'true');
    crystalState.crystals += 10;
    saveVipState();
    updateCrystalDisplay();
    setTimeout(() => showToast('完成引导奖励 10 星光水晶 ✨'), 500);
  }
}

/* ===== 留存回归奖励 ===== */
function checkRetention() {
  const lastVisit = safeLocalStorage.getItem('wish_island_last_visit');
  const today = new Date().toDateString();
  safeLocalStorage.setItem('wish_island_last_visit', today);
  if(!lastVisit) return;
  const lastDate = new Date(lastVisit);
  const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
  if(daysDiff >= 3 && daysDiff < 30) {
    // 回归奖励
    const reward = Math.min(50, daysDiff * 5);
    crystalState.crystals += reward;
    saveVipState();
    updateCrystalDisplay();
    showToast(`欢迎回来！失踪 ${daysDiff} 天奖励 ${reward} 星光水晶 💎`);
    triggerConfetti();
  }
}

/* ===== 会员到期提醒 ===== */
function checkExpiryReminder() {
  const tier = getCurrentTier();
  if(tier === 'free') return;
  if(!vipState.expiry) return;
  const expiry = new Date(vipState.expiry);
  const now = new Date();
  const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
  // 今天是否已经提醒过
  const today = now.toDateString();
  const lastReminder = safeLocalStorage.getItem('wish_island_expiry_remind');
  if(lastReminder === today) return; // 今天已提醒
  if(daysLeft <= 7 && daysLeft > 0) {
    safeLocalStorage.setItem('wish_island_expiry_remind', today);
    showExpiryModal(daysLeft);
  } else if (daysLeft <= 0) {
    // 已过期，降级回免费
    vipState.tier = 'free';
    vipState.expiry = null;
    saveVipState();
    showToast('会员已到期，已自动回退至免费体验 ✨');
    // 显示横幅
    const banner = document.getElementById('me-vip-banner');
    if(banner) banner.style.display = 'block';
    const vipBadge = document.getElementById('me-vip-badge');
    if(vipBadge) vipBadge.style.display = 'none';
  }
}
function showExpiryModal(daysLeft) {
  let modal = document.getElementById('expiry-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'expiry-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.onclick = function(e) { if(e.target === this) modal.classList.remove('show'); };
    document.body.appendChild(modal);
  }
  const tierName = vipState.tier === 'vip' ? '星际高级会员' : '自然会员';
  modal.innerHTML = `
    <div class="modal-content p-6 text-center" style="max-width:340px">
      <div class="text-4xl mb-3">⏰</div>
      <h3 class="font-title text-lg mb-2" style="color:var(--theme-text)">${tierName} 即将到期</h3>
      <p class="text-sm mb-4" style="color:var(--text-soft)">你的会员还有 <span class="font-bold" style="color:var(--theme-text)">${daysLeft}</span> 天到期，续费可保留全部权益</p>
      <div class="p-3 rounded-xl mb-4 text-xs" style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(212,181,199,0.1));border:1px solid rgba(245,158,11,0.15)">
        👥 已有 <span class="font-bold">1,200+</span> 人续费会员
      </div>
      <div class="space-y-2 mb-3">
        <button type="button" onclick="document.getElementById('expiry-modal').classList.remove('show');showPage('vip-plans');" class="btn-primary w-full py-3 rounded-xl font-medium" style="background:linear-gradient(135deg,#F59E0B,#D4B5C7)" aria-label="立即续费">👑 立即续费</button>
        <button type="button" onclick="document.getElementById('expiry-modal').classList.remove('show');" class="btn-soft w-full py-3 rounded-xl text-sm" aria-label="稍后再说">稍后再说</button>
      </div>
    </div>
  `;
  modal.classList.add('show');
}

/* ===== App评价引导 ===== */
let __ratingShown = false;
function checkRatingPrompt() {
  if(__ratingPromptShown) return;
  const usageCount = parseInt(safeLocalStorage.getItem('wish_island_usage_count', '0')) || 0;
  if(usageCount >= 15 && usageCount < 20) {
    __ratingPromptShown = true;
    setTimeout(() => showRatingModal(), 2000);
  }
}
function showRatingModal() {
  let modal = document.getElementById('rating-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'rating-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.onclick = function(e) { if(e.target === this) modal.classList.remove('show'); };
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-content p-6 text-center" style="max-width:340px">
      <div class="text-4xl mb-3">🌟</div>
      <h3 class="font-title text-lg mb-2" style="color:var(--theme-text)">喜欢许愿岛吗？</h3>
      <p class="text-sm mb-4" style="color:var(--text-soft)">你的好评能帮助我们做得更好，也能让更多人发现这个温暖的小宇宙 ✨</p>
      <div class="flex justify-center gap-1 mb-4 text-2xl">
        <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
      </div>
      <div class="space-y-2 mb-3">
        <button type="button" onclick="document.getElementById('rating-modal').classList.remove('show');window.open('https://apps.apple.com','_blank');showToast('感谢你的支持！💫');" class="btn-primary w-full py-3 rounded-xl font-medium" aria-label="去评分">去评分 ✨</button>
        <button type="button" onclick="document.getElementById('rating-modal').classList.remove('show');" class="btn-soft w-full py-3 rounded-xl text-sm" aria-label="下次再说">下次再说</button>
      </div>
    </div>
  `;
  modal.classList.add('show');
}

/* ===== 帮助与支持弹窗控制 ===== */
function showFaqModal() {
  const m = document.getElementById('faq-modal');
  if(m) m.classList.add('show');
}
function showFeedbackModal() {
  const m = document.getElementById('feedback-modal');
  if(m) m.classList.add('show');
}
function showPrivacyModal() {
  const m = document.getElementById('privacy-modal');
  if(m) m.classList.add('show');
}
function showRefundModal() {
  const m = document.getElementById('refund-modal');
  if(m) m.classList.add('show');
}
function submitFeedback() {
  const text = document.getElementById('feedback-text');
  if(!text) return;
  const val = text.value.trim();
  if(!val) { showToast('请输入反馈内容'); return; }
  if(val.length < 5) { showToast('反馈内容至少 5 个字'); return; }
  // 保存到本地（实际应用应发送到后端）
  const feedbacks = safeLocalStorage.getObject('wish_island_feedback', []);
  feedbacks.push({ text: val, date: new Date().toISOString(), version: '6.4' });
  safeLocalStorage.setObject('wish_island_feedback', feedbacks.slice(-20));
  trackFeedback(val);
  text.value = '';
  document.getElementById('feedback-modal').classList.remove('show');
  showToast('反馈已提交，感谢你的建议！💫');
  // 奖励少量水晶
  crystalState.crystals += 2;
  saveVipState();
  updateCrystalDisplay();
}

/* ===== 首次打开检测 ===== */
function isFirstOpen() {
  return !safeLocalStorage.getItem('wish_island_first_open');
}
function markFirstOpen() {
  safeLocalStorage.setItem('wish_island_first_open', new Date().toISOString());
}

;

/* ===== C10: 多语言支持 ===== */
const TRANSLATIONS = {
  zh: {
    nav_island: '岛屿', nav_tools: '工具', nav_library: '书馆', nav_journal: '记录', nav_me: '我的',
    app_name: '许愿岛', settings_title: '设置', settings_sound: '声音设置', settings_notification: '通知提醒',
    settings_personalization: '个性化', settings_privacy: '隐私', settings_reminder: '提醒', settings_data: '数据',
    sound_music: '背景音乐', sound_sfx: '操作音效', bubble_tips: '气泡提示', enter_page_bubble: '进入页面气泡提示',
    white_noise: '白噪音', theme_color: '主题色', island_weather: '岛屿天气', animation: '动效', dark_mode: '深色模式',
    password_lock: '密码锁', local_only: '仅本地保存', daily_reminder: '每日打卡提醒', meditation_reminder: '放松提醒',
    affirm_push: '积极宣言推送', export_data: '导出所有数据', clear_cache: '清除缓存', about_app: '关于许愿岛',
    energy_checkup: '状态体检', manifest_journey: '成长旅程', energy_cleanup: '状态梳理', export_pdf_report: '导出 PDF 报告',
    language: '语言', lang_zh: '中文', lang_en: 'English', welcome_subtitle: '记录心情，温柔地陪伴每一天 ✨',
    welcome_desc: '7步走下来，遇见更闪耀的自己 💫', welcome_benefits_title: '你将获得',
    benefit_persona: '找到你的专属花公主人格', benefit_purify: '清理你的限制性信念卡点',
    benefit_wish: '用BE-DO-HAVE模型清晰许愿', benefit_meditation: 'SATS放松+情绪调整对齐状态',
    benefit_action: '灵感行动花田，一步步落地', start_test: '开始测试', test_info: '约3分钟 · 15题 · 解锁你的公主身份',
    home_good_day: '今天也是美好的一天 ✨', fortune_title: '今日运势 · 点击查看详情',
    zodiac_title: '星座运势 · 点击查看详情', affirm_title: '今日积极宣言 · 点击换一句', mood_question: '今天心情怎么样？',
    mood_not_recorded: '还没记录', mood_happy: '开心', mood_calm: '平静', mood_meh: '有点down', mood_anxious: '焦虑',
    mood_sad: '难过', mood_angry: '生气', lang_switched: '语言已切换', data_exported: '数据已导出',
    data_export_failed: '数据导出失败', yes: '是', no: '否', save: '保存', cancel: '取消', confirm: '确定', close: '关闭',
    wish: '许愿', diary: '日记', energy: '能量', level: '等级', badge: '徽章', streak_days: '连续打卡', days: '天',
    count: '数量', refresh_complete: '刷新完成', loading: '加载中', error: '错误', success: '成功', tip: '提示',
    detail: '详情', search: '搜索', add: '添加', edit: '编辑', delete: '删除', share: '分享', download: '下载',
    upload: '上传', profile: '个人资料', nickname: '昵称', birthday: '生日', zodiac: '星座', manifest_method: '成长方法',
    meditation: '冥想', affirmation: '肯定语', visualization: '视觉化', revision: '修正法', gratitude: '感恩',
    garden: '花园', flower: '花', tool: '工具', library: '图书馆', record: '记录', challenge: '挑战', sleep: '睡眠',
    breathe: '呼吸', timer: '计时器', tarot: '塔罗', emotion: '情绪', habit: '习惯', mood: '心情', stats: '统计',
    report: '报告', progress: '进度', completed: '已完成', uncompleted: '未完成', today: '今天', yesterday: '昨天',
    tomorrow: '明天', week: '周', month: '月', year: '年', all: '全部', none: '无', back: '返回', next: '下一页',
    prev: '上一页', submit: '提交', done: '完成', skip: '跳过', continue: '继续', retry: '重试',
    loading_error: '加载出错，请重试', no_data: '暂无数据', coming_soon: '即将上线', enjoy_journey: '享受你的成长旅程',
    daily_checkin: '每日打卡', checkin_success: '打卡成功', checkin_streak: '连续打卡', checkin_record: '打卡记录',
    affirmation_loop: '积极宣言循环', focus_wheel: '心念转轮', one_minute_magic: '一分钟方法', universe_wallet: '自然钱包',
    mood_compass: '心情罗盘', pillow_talk: '枕边蜜语', let_go_ritual: '放手仪式', old_story_rewrite: '旧故事翻篇',
    wish_box: '心愿宝盒', gratitude_storm: '感恩风暴', treasure_box: '工具百宝箱', wish_time_machine: '愿望时光机',
    manifest_report: '成长报告', pdf_report_title: '成长数据报告', pdf_report_generated: '报告生成时间', pdf_nickname: '昵称',
    pdf_energy: '能量', pdf_level: '等级', pdf_badges: '徽章', pdf_wishes: '愿望', pdf_diaries: '日记',
    pdf_streak: '连续打卡', pdf_start_date: '开始日期', pdf_total_days: '总天数', pdf_persona: '人格',
    pdf_mood_history: '心情记录', pdf_habits: '习惯', pdf_affirmations: '肯定语', pdf_no_data: '暂无数据',
    print_tip: '请在打印对话框中选择"保存为 PDF"', refresh_fortune: '正在刷新运势...'
  },
  en: {
    nav_island: 'Island', nav_tools: 'Tools', nav_library: 'Library', nav_journal: 'Journal', nav_me: 'Me',
    app_name: 'Wish Island', settings_title: 'Settings', settings_sound: 'Sound Settings', settings_notification: 'Notifications',
    settings_personalization: 'Personalization', settings_privacy: 'Privacy', settings_reminder: 'Reminders', settings_data: 'Data',
    sound_music: 'Background Music', sound_sfx: 'Sound Effects', bubble_tips: 'Bubble Tips', enter_page_bubble: 'Enter Page Bubbles',
    white_noise: 'White Noise', theme_color: 'Theme Color', island_weather: 'Island Weather', animation: 'Animation', dark_mode: 'Dark Mode',
    password_lock: 'Password Lock', local_only: 'Local Only', daily_reminder: 'Daily Check-in', meditation_reminder: 'Relaxation Reminder',
    affirm_push: 'Positive Affirmation Push', export_data: 'Export All Data', clear_cache: 'Clear Cache', about_app: 'About Wish Island',
    energy_checkup: 'State Checkup', manifest_journey: 'Growth Journey', energy_cleanup: 'State Cleanup', export_pdf_report: 'Export PDF Report',
    language: 'Language', lang_zh: '中文', lang_en: 'English', welcome_subtitle: 'Record your mood, accompany every day gently ✨',
    welcome_desc: '7 steps to meet a more shining self 💫', welcome_benefits_title: 'You will get',
    benefit_persona: 'Find your exclusive flower princess persona', benefit_purify: 'Clear your limiting belief blocks',
    benefit_wish: 'Make clear wishes with BE-DO-HAVE model', benefit_meditation: 'SATS relaxation + emotional alignment',
    benefit_action: 'Inspiration action garden, step by step', start_test: 'Start Test', test_info: 'About 3 min · 15 questions · Unlock your princess identity',
    home_good_day: 'Today is a beautiful day ✨', fortune_title: 'Today\'s Fortune · Click for details',
    zodiac_title: 'Zodiac Fortune · Click for details', affirm_title: 'Daily Affirmation · Click to refresh', mood_question: 'How are you feeling today?',
    mood_not_recorded: 'Not recorded', mood_happy: 'Happy', mood_calm: 'Calm', mood_meh: 'Meh', mood_anxious: 'Anxious',
    mood_sad: 'Sad', mood_angry: 'Angry', lang_switched: 'Language switched', data_exported: 'Data exported',
    data_export_failed: 'Data export failed', yes: 'Yes', no: 'No', save: 'Save', cancel: 'Cancel', confirm: 'Confirm', close: 'Close',
    wish: 'Wish', diary: 'Diary', energy: 'Energy', level: 'Level', badge: 'Badge', streak_days: 'Streak', days: 'Days',
    count: 'Count', refresh_complete: 'Refresh complete', loading: 'Loading', error: 'Error', success: 'Success', tip: 'Tip',
    detail: 'Detail', search: 'Search', add: 'Add', edit: 'Edit', delete: 'Delete', share: 'Share', download: 'Download',
    upload: 'Upload', profile: 'Profile', nickname: 'Nickname', birthday: 'Birthday', zodiac: 'Zodiac', manifest_method: 'Manifest Method',
    meditation: 'Meditation', affirmation: 'Affirmation', visualization: 'Visualization', revision: 'Revision', gratitude: 'Gratitude',
    garden: 'Garden', flower: 'Flower', tool: 'Tools', library: 'Library', record: 'Records', challenge: 'Challenge', sleep: 'Sleep',
    breathe: 'Breathe', timer: 'Timer', tarot: 'Tarot', emotion: 'Emotion', habit: 'Habit', mood: 'Mood', stats: 'Stats',
    report: 'Report', progress: 'Progress', completed: 'Completed', uncompleted: 'Uncompleted', today: 'Today', yesterday: 'Yesterday',
    tomorrow: 'Tomorrow', week: 'Week', month: 'Month', year: 'Year', all: 'All', none: 'None', back: 'Back', next: 'Next',
    prev: 'Prev', submit: 'Submit', done: 'Done', skip: 'Skip', continue: 'Continue', retry: 'Retry',
    loading_error: 'Loading error, please retry', no_data: 'No data yet', coming_soon: 'Coming soon', enjoy_journey: 'Enjoy your growth journey',
    daily_checkin: 'Daily Check-in', checkin_success: 'Check-in success', checkin_streak: 'Check-in streak', checkin_record: 'Check-in records',
    affirmation_loop: 'Positive Affirmation Loop', focus_wheel: 'Focus Wheel', one_minute_magic: 'One Minute Method', universe_wallet: 'Nature Wallet',
    mood_compass: 'Mood Compass', pillow_talk: 'Pillow Talk', let_go_ritual: 'Let Go Ritual', old_story_rewrite: 'Old Story Rewrite',
    wish_box: 'Wish Box', gratitude_storm: 'Gratitude Storm', treasure_box: 'Treasure Box', wish_time_machine: 'Wish Time Machine',
    manifest_report: 'Manifest Report', pdf_report_title: 'Manifestation Data Report', pdf_report_generated: 'Report generated at',
    pdf_nickname: 'Nickname', pdf_energy: 'Energy', pdf_level: 'Level', pdf_badges: 'Badges', pdf_wishes: 'Wishes', pdf_diaries: 'Diaries',
    pdf_streak: 'Streak', pdf_start_date: 'Start Date', pdf_total_days: 'Total Days', pdf_persona: 'Persona',
    pdf_mood_history: 'Mood History', pdf_habits: 'Habits', pdf_affirmations: 'Affirmations', pdf_no_data: 'No data',
    print_tip: 'Please select "Save as PDF" in the print dialog', refresh_fortune: 'Refreshing fortune...'
  }
};
let currentLang = 'zh';
try {
  const savedLang = localStorage.getItem('cosmos_lang');
  if (savedLang && TRANSLATIONS[savedLang]) currentLang = savedLang;
} catch(_) {}
function t(key) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['zh'];
  return dict[key] !== undefined ? dict[key] : (TRANSLATIONS['zh'][key] !== undefined ? TRANSLATIONS['zh'][key] : key);
}
function setLang(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLang = lang;
  try { localStorage.setItem('cosmos_lang', lang); } catch(_) {}
  applyTranslations();
  showToast(t('lang_switched'));
}
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (key) el.innerHTML = t(key);
  });
}

function $el(id) { return document.getElementById(id); }
function setText(id, text) { const el = $el(id); if (el) el.textContent = text; }
function setHTML(id, html) { const el = $el(id); if (el) el.innerHTML = html; }
function addCls(id, cls) { const el = $el(id); if (el) el.classList.add(cls); }
function remCls(id, cls) { const el = $el(id); if (el) el.classList.remove(cls); }
function toggleCls(id, cls, force) { const el = $el(id); if (el) el.classList.toggle(cls, force); }
function setStyle(id, prop, val) { const el = $el(id); if (el) el.style[prop] = val; }
function setVal(id, val) { const el = $el(id); if (el) el.value = val; }
function showModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!window.__modalFocusStack) window.__modalFocusStack = [];
  window.__modalFocusStack.push(document.activeElement);
  el.style.display = '';
  el.classList.add('show');
  setTimeout(() => {
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) {
      const first = focusable[0];
      if (first.focus) first.focus();
    } else if (el.focus) {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }
  }, 50);
}
function hideModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
  if (window.__modalFocusStack && window.__modalFocusStack.length) {
    const prev = window.__modalFocusStack.pop();
    if (prev && prev.focus) {
      setTimeout(() => prev.focus(), 50);
    }
  }
}
function trapFocus(e, modalEl) {
  if (e.key !== 'Tab' || !modalEl) return;
  const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { last.focus(); e.preventDefault(); }
  } else {
    if (document.activeElement === last) { first.focus(); e.preventDefault(); }
  }
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const modals = document.querySelectorAll('.modal-backdrop.show');
    if (modals.length) {
      const topModal = modals[modals.length - 1];
      if (topModal.id) hideModal(topModal.id);
      e.preventDefault();
      return;
    }
    if (__pageHistory && __pageHistory.length > 1) {
      goBack();
      e.preventDefault();
    }
  }
  const activeModal = document.querySelector('.modal-backdrop.show');
  if (activeModal && e.key === 'Tab') {
    trapFocus(e, activeModal);
  }
});
(function initDevLog() {
  const MAX_LOGS = 200;
  const logs = [];
  let visible = false;
  function timestamp() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0') + '.' + d.getMilliseconds().toString().padStart(3, '0');
  }
  function pushLog(level, args) {
    try {
      const text = Array.from(args).map(a => {
        if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return String(a); } }
        return String(a);
      }).join(' ');
      const entry = { t: timestamp(), level, text };
      logs.push(entry);
      if (logs.length > MAX_LOGS) logs.shift();
      updateDevLogUI();
    } catch(e) {}
  }
  const orig = { log: console.log, error: console.error, warn: console.warn, info: console.info };
  console.log = function(...a) { orig.log.apply(console, a); pushLog('log', a); };
  console.error = function(...a) { orig.error.apply(console, a); pushLog('error', a); };
  console.warn = function(...a) { orig.warn.apply(console, a); pushLog('warn', a); };
  console.info = function(...a) { orig.info.apply(console, a); pushLog('info', a); };
  window.onerror = function(msg, url, line, col, err) {
    pushLog('error', ['[全局错误]', msg, 'at', (url || '') + ':' + line + ':' + col, err ? err.stack : '']);
    return false;
  };
  window.addEventListener('unhandledrejection', function(e) {
    pushLog('error', ['[未处理Promise]', e.reason]);
  });
  function toggleDevLog() {
    visible = !visible;
    const panel = document.getElementById('dev-log-panel');
    if (panel) {
      panel.classList.toggle('hidden', !visible);
      panel.style.display = visible ? 'flex' : 'none';
    }
    if (visible) {
      try {
        const activePage = document.querySelector('.page.active')?.id || 'none';
        const modals = document.querySelectorAll('.modal-backdrop.show').length;
        const overlays = document.querySelectorAll('.fixed.inset-0:not(.hidden)').length;
        const history = window.__pageHistory?.slice(-5) || [];
        const testActive = document.getElementById('test-modal')?.classList.contains('show') ? 'yes' : 'no';
        const personaActive = document.getElementById('persona-modal')?.classList.contains('show') ? 'yes' : 'no';
        pushLog('info', ['[诊断] 当前页面:' + activePage + ' | 弹窗:' + modals + ' | 覆盖层:' + overlays + ' | test-modal:' + testActive + ' | persona-modal:' + personaActive + ' | 历史:' + JSON.stringify(history)]);
      } catch(e) {}
      updateDevLogUI();
    }
  }
  function updateDevLogUI() {
    const list = document.getElementById('dev-log-list');
    if (!list || !visible) return;
    list.innerHTML = logs.slice(-80).map(e => {
      let color = '#bbb';
      if (e.level === 'error') color = '#ff6b6b';
      if (e.level === 'warn') color = '#ffd166';
      if (e.level === 'info') color = '#9b8ec2';
      return `<div style="color:${color};font-size:11px;line-height:1.4;margin-bottom:1px;"><span style="opacity:0.5">${e.t}</span> ${e.text.slice(0, 300).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</div>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  }
  window.__devLog = { logs, toggle: toggleDevLog, refresh: updateDevLogUI };
  function createPanel() {
    if (document.getElementById('dev-log-panel')) return;
    const div = document.createElement('div');
    div.id = 'dev-log-panel';
    div.className = 'hidden';
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(20,20,35,0.92);backdrop-filter:blur(6px);display:none;flex-direction:column;font-family:monospace;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);flex-shrink:0;">
        <span style="color:#D4B5C7;font-size:13px;font-weight:bold;">🛠️ 开发者日志</span>
        <span style="color:#888;font-size:11px;">(${logs.length} 条)</span>
        <div style="flex:1"></div>
        <button onclick="window.__devLog.refresh()" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">刷新</button>
        <button onclick="window.__devLog.toggle()" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">关闭</button>
      </div>
      <div id="dev-log-list" style="flex:1;overflow-y:auto;padding:10px;"></div>
      <div style="display:flex;gap:8px;padding:8px 12px;border-top:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);flex-shrink:0;flex-wrap:wrap;">
        <button onclick="localStorage.clear();console.log('localStorage 已清除');location.reload();" style="background:rgba(255,107,107,0.2);color:#ff6b6b;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">清除缓存并刷新</button>
        <button onclick="console.log('state:',JSON.stringify(window.state||{}));" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">打印 state</button>
        <button onclick="console.log('testState:',JSON.stringify(window.testState||{}));" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">打印 testState</button>
        <button onclick="console.log('initDone:',typeof window.__initDone);" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">检查 init</button>
        <button onclick="console.log('modal-backdrops:',document.querySelectorAll('.modal-backdrop.show').length);" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">检查弹窗</button>
        <button onclick="console.log('active page:',document.querySelector('.page.active')?.id);" style="background:rgba(255,255,255,0.1);color:#fff;border:0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;">检查页面</button>
      </div>
    `;
    document.body.appendChild(div);
  }
  if (document.body) { createPanel(); }
  else { document.addEventListener('DOMContentLoaded', createPanel); }
  console.log('[DevLog] 开发者日志已激活 — 连续点击页面标题 5 次显示/隐藏');
})();
function getFlowerSVG(p, size = 60) {
  if (!p || !p.id) return `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#D4B5C7"/></svg>`;
  const id = p.id;
  const s = size;
  const cx = 30, cy = 30;
  const shadowFilter = `<filter id="fs-${id}" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="${p.flowerColor2}" flood-opacity="0.35"/>
  </filter>`;
  let flower = '';
  switch(id) {
    case 'rose': // 红玫瑰：多层饱满花瓣 + 花萼 + 刺 + 露水
      flower = `
        <defs>
          <radialGradient id="rg-${id}" cx="40%" cy="25%" r="75%">
            <stop offset="0%" stop-color="#FFD1DC"/>
            <stop offset="40%" stop-color="#F08090"/>
            <stop offset="100%" stop-color="#D4556A"/>
          </radialGradient>
          <radialGradient id="rc-${id}" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFE4E1"/>
            <stop offset="100%" stop-color="#E87080"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 外层大花瓣 8片 -->
          ${[0,45,90,135,180,225,270,315].map(a => `
            <ellipse cx="${cx}" cy="${cy-14}" rx="8" ry="16" fill="url(#rg-${id})" transform="rotate(${a} ${cx} ${cy})" opacity="0.95"/>
          `).join('')}
          <!-- 中层花瓣 6片 -->
          ${[30,90,150,210,270,330].map(a => `
            <ellipse cx="${cx}" cy="${cy-9}" rx="6" ry="12" fill="url(#rc-${id})" transform="rotate(${a} ${cx} ${cy})" opacity="0.95"/>
          `).join('')}
          <!-- 内层花瓣 4片 -->
          ${[45,135,225,315].map(a => `
            <ellipse cx="${cx}" cy="${cy-5}" rx="4" ry="8" fill="url(#rc-${id})" transform="rotate(${a} ${cx} ${cy})"/>
          `).join('')}
          <!-- 花心 -->
          <circle cx="${cx}" cy="${cy}" r="5" fill="#C83A50" opacity="0.8"/>
          <!-- 露珠 -->
          <circle cx="${cx-6}" cy="${cy-12}" r="2" fill="white" opacity="0.7"/>
          <circle cx="${cx+5}" cy="${cy-8}" r="1.5" fill="white" opacity="0.6"/>
          <!-- 高光 -->
          <ellipse cx="${cx-3}" cy="${cy-10}" rx="2" ry="4" fill="white" opacity="0.4" transform="rotate(-20 ${cx-3} ${cy-10})"/>
        </g>`;
      break;
    case 'lavender': // 薰衣草：紫色花穗 + 直立茎 + 窄叶
      flower = `
        <defs>
          <linearGradient id="lg-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#D4C5E0"/>
            <stop offset="50%" stop-color="#B8A9C9"/>
            <stop offset="100%" stop-color="#9D8BB0"/>
          </linearGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 茎 -->
          <rect x="${cx-1.5}" y="${cy+2}" width="3" height="22" fill="#88C898" rx="1.5"/>
          <!-- 叶子 -->
          <ellipse cx="${cx-7}" cy="${cy+15}" rx="6" ry="2" fill="#7AB888" transform="rotate(-30 ${cx-7} ${cy+15})"/>
          <ellipse cx="${cx+7}" cy="${cy+20}" rx="6" ry="2" fill="#7AB888" transform="rotate(30 ${cx+7} ${cy+20})"/>
          <!-- 花穗：多层小花瓣堆叠 -->
          ${[0,1,2,3,4,5,6].map(i => {
            const y = cy - 5 - i * 4;
            const r = 6 - Math.abs(i-3) * 0.7;
            return `
              <ellipse cx="${cx}" cy="${y}" rx="${r}" ry="${r*0.8}" fill="url(#lg-${id})" opacity="${0.7 + i*0.04}"/>
              <ellipse cx="${cx-r-1}" cy="${y+1}" rx="${r*0.7}" ry="${r*0.6}" fill="url(#lg-${id})" opacity="0.85"/>
              <ellipse cx="${cx+r+1}" cy="${y+1}" rx="${r*0.7}" ry="${r*0.6}" fill="url(#lg-${id})" opacity="0.85"/>
            `;
          }).join('')}
          <!-- 顶部小花 -->
          <ellipse cx="${cx}" cy="${cy-30}" rx="3" ry="4" fill="#D4C5E0"/>
          <!-- 细绒毛效果 -->
          ${[0,1,2,3,4,5].map(i => {
            const y = cy - 4 - i * 5;
            return `<line x1="${cx-5}" y1="${y}" x2="${cx-7}" y2="${y-1}" stroke="#E8DEEF" stroke-width="0.5" opacity="0.6"/>
                    <line x1="${cx+5}" y1="${y}" x2="${cx+7}" y2="${y-1}" stroke="#E8DEEF" stroke-width="0.5" opacity="0.6"/>`;
          }).join('')}
        </g>`;
      break;
    case 'lily': // 铃兰：白色铃铛垂串 + 宽绿叶
      flower = `
        <defs>
          <radialGradient id="wg-${id}" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#E8F0E8"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 主茎 -->
          <path d="M${cx} ${cy+25} Q${cx-3} ${cy+10} ${cx} ${cy-8}" fill="none" stroke="#6BB878" stroke-width="2.5" stroke-linecap="round"/>
          <!-- 大叶子 -->
          <ellipse cx="${cx-12}" cy="${cy+18}" rx="10" ry="4" fill="#78C888" transform="rotate(-40 ${cx-12} ${cy+18})"/>
          <ellipse cx="${cx+10}" cy="${cy+22}" rx="9" ry="3.5" fill="#6BB878" transform="rotate(35 ${cx+10} ${cy+22})"/>
          <!-- 铃铛花串（5朵下垂） -->
          ${[0,1,2,3,4].map(i => {
            const x = cx + (i-2) * 7;
            const y = cy - 2 + Math.abs(i-2) * 4;
            return `
              <g transform="translate(${x}, ${y})">
                <!-- 铃铛花 -->
                <ellipse cx="0" cy="5" rx="4.5" ry="6" fill="url(#wg-${id})"/>
                <!-- 铃铛开口 -->
                <ellipse cx="0" cy="10" rx="3.5" ry="1.5" fill="#DDE8DD"/>
                <!-- 花蕊 -->
                <circle cx="-1" cy="9" r="0.8" fill="#F5E6C8"/>
                <circle cx="1" cy="9.5" r="0.8" fill="#F5E6C8"/>
                <!-- 花柄 -->
                <line x1="0" y1="-1" x2="0" y2="-5" stroke="#88C898" stroke-width="1"/>
              </g>
            `;
          }).join('')}
          <!-- 顶部小叶 -->
          <ellipse cx="${cx-2}" cy="${cy-10}" rx="3" ry="1.5" fill="#78C888" transform="rotate(-20 ${cx-2} ${cy-10})"/>
        </g>`;
      break;
    case 'blue': // 蓝星花：天蓝色五瓣星形 + 白色中心 + 小绿叶
      flower = `
        <defs>
          <radialGradient id="bs-${id}" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#B8D8F0"/>
            <stop offset="100%" stop-color="#6BA0C8"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 茎 -->
          <rect x="${cx-1}" y="${cy+5}" width="2" height="20" fill="#78C888" rx="1"/>
          <!-- 叶子 -->
          <ellipse cx="${cx-6}" cy="${cy+18}" rx="4" ry="2.5" fill="#6BB878"/>
          <ellipse cx="${cx+5}" cy="${cy+14}" rx="3.5" ry="2" fill="#6BB878"/>
          <!-- 五瓣星形花 -->
          ${[0,72,144,216,288].map(a => {
            const rad = (a - 90) * Math.PI / 180;
            const px = cx + Math.cos(rad) * 12;
            const py = cy + Math.sin(rad) * 12;
            return `
              <ellipse cx="${px}" cy="${py}" rx="6" ry="9" fill="url(#bs-${id})" transform="rotate(${a} ${px} ${py})"/>
            `;
          }).join('')}
          <!-- 中心白色 -->
          <circle cx="${cx}" cy="${cy}" r="6" fill="white"/>
          <circle cx="${cx}" cy="${cy}" r="4" fill="#F0F8FF"/>
          <!-- 花蕊 -->
          <circle cx="${cx-1.5}" cy="${cy-1}" r="1" fill="#F5E6C8"/>
          <circle cx="${cx+1.5}" cy="${cy-0.5}" r="1" fill="#F5E6C8"/>
          <circle cx="${cx}" cy="${cy+1.5}" r="1" fill="#F5E6C8"/>
          <!-- 高光 -->
          <ellipse cx="${cx-5}" cy="${cy-8}" rx="1.5" ry="3" fill="white" opacity="0.5"/>
        </g>`;
      break;
    case 'sunflower': // 向日葵：棕色大花盘 + 明黄色长花瓣 + 粗茎大叶
      flower = `
        <defs>
          <linearGradient id="sf-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFE066"/>
            <stop offset="100%" stop-color="#E8A830"/>
          </linearGradient>
          <radialGradient id="sd-${id}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#8B5A2B"/>
            <stop offset="100%" stop-color="#5D3A1A"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 粗茎 -->
          <rect x="${cx-2.5}" y="${cy+8}" width="5" height="20" fill="#6B9B58" rx="2"/>
          <!-- 大叶子 -->
          <ellipse cx="${cx-10}" cy="${cy+18}" rx="10" ry="5" fill="#5A8B48" transform="rotate(-25 ${cx-10} ${cy+18})"/>
          <ellipse cx="${cx+9}" cy="${cy+22}" rx="9" ry="4.5" fill="#5A8B48" transform="rotate(30 ${cx+9} ${cy+22})"/>
          <!-- 外层花瓣 16片 -->
          ${Array.from({length:16}, (_,i) => {
            const a = (360/16) * i;
            return `
              <ellipse cx="${cx}" cy="${cy-14}" rx="4" ry="11" fill="url(#sf-${id})" transform="rotate(${a} ${cx} ${cy})" opacity="0.95"/>
            `;
          }).join('')}
          <!-- 中层花瓣 -->
          ${Array.from({length:12}, (_,i) => {
            const a = (360/12) * i + 15;
            return `
              <ellipse cx="${cx}" cy="${cy-10}" rx="3" ry="8" fill="url(#sf-${id})" transform="rotate(${a} ${cx} ${cy})"/>
            `;
          }).join('')}
          <!-- 花盘 -->
          <circle cx="${cx}" cy="${cy}" r="10" fill="url(#sd-${id})"/>
          <!-- 花盘纹理 -->
          ${Array.from({length:20}, (_,i) => {
            const a = (360/20) * i;
            const rad = a * Math.PI / 180;
            const px = cx + Math.cos(rad) * 6;
            const py = cy + Math.sin(rad) * 6;
            return `<circle cx="${px}" cy="${py}" r="1.2" fill="#3D2810" opacity="0.6"/>`;
          }).join('')}
          <circle cx="${cx}" cy="${cy}" r="2" fill="#3D2810"/>
          <!-- 高光 -->
          <ellipse cx="${cx-4}" cy="${cy-10}" rx="2" ry="4" fill="white" opacity="0.35"/>
        </g>`;
      break;
    case 'tulip': // 粉郁金香：杯状单朵花 + 直立茎 + 光滑花瓣
      flower = `
        <defs>
          <linearGradient id="tp-${id}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFCCD5"/>
            <stop offset="50%" stop-color="#F5A5B5"/>
            <stop offset="100%" stop-color="#E88595"/>
          </linearGradient>
          <radialGradient id="ti-${id}" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#FFE4EA"/>
            <stop offset="100%" stop-color="#F5A5B5"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 茎 -->
          <rect x="${cx-1.5}" y="${cy+5}" width="3" height="22" fill="#6BB878" rx="1.5"/>
          <!-- 叶子 -->
          <ellipse cx="${cx-8}" cy="${cy+20}" rx="4" ry="10" fill="#78C888" transform="rotate(-15 ${cx-8} ${cy+20})"/>
          <ellipse cx="${cx+7}" cy="${cy+18}" rx="3.5" ry="9" fill="#6BB878" transform="rotate(12 ${cx+7} ${cy+18})"/>
          <!-- 杯状花朵：6片花瓣围成杯形 -->
          <!-- 左花瓣 -->
          <path d="M${cx-10} ${cy+5} Q${cx-14} ${cy-8} ${cx-8} ${cy-15} Q${cx-5} ${cy-18} ${cx-3} ${cy-12} L${cx-3} ${cy+5} Z" fill="url(#tp-${id})"/>
          <!-- 右花瓣 -->
          <path d="M${cx+10} ${cy+5} Q${cx+14} ${cy-8} ${cx+8} ${cy-15} Q${cx+5} ${cy-18} ${cx+3} ${cy-12} L${cx+3} ${cy+5} Z" fill="url(#tp-${id})"/>
          <!-- 前左花瓣 -->
          <path d="M${cx-5} ${cy+6} Q${cx-8} ${cy-5} ${cx-4} ${cy-16} Q${cx-1} ${cy-19} ${cx+1} ${cy-12} L${cx+1} ${cy+6} Z" fill="url(#ti-${id})"/>
          <!-- 前右花瓣 -->
          <path d="M${cx+5} ${cy+6} Q${cx+8} ${cy-5} ${cx+4} ${cy-16} Q${cx+1} ${cy-19} ${cx-1} ${cy-12} L${cx-1} ${cy+6} Z" fill="url(#ti-${id})"/>
          <!-- 中心花瓣 -->
          <path d="M${cx-2} ${cy+6} Q${cx-3} ${cy-8} ${cx} ${cy-17} Q${cx+3} ${cy-8} ${cx+2} ${cy+6} Z" fill="#FFD5DD"/>
          <!-- 花朵开口阴影 -->
          <ellipse cx="${cx}" cy="${cy-14}" rx="6" ry="2.5" fill="#C86575" opacity="0.4"/>
          <!-- 高光 -->
          <ellipse cx="${cx-4}" cy="${cy-5}" rx="1.5" ry="5" fill="white" opacity="0.4"/>
        </g>`;
      break;
    case 'jasmine': // 茉莉：多朵白色五瓣小花簇生 + 椭圆绿叶
      flower = `
        <defs>
          <radialGradient id="jm-${id}" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#E8E8E0"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 主茎 -->
          <path d="M${cx} ${cy+25} L${cx} ${cy+5}" stroke="#6BB878" stroke-width="2" stroke-linecap="round"/>
          <!-- 叶子 -->
          <ellipse cx="${cx-10}" cy="${cy+15}" rx="7" ry="4" fill="#6BB878"/>
          <ellipse cx="${cx+9}" cy="${cy+20}" rx="6" ry="3.5" fill="#5AAB68"/>
          <ellipse cx="${cx-7}" cy="${cy+22}" rx="5" ry="3" fill="#5AAB68"/>
          <!-- 一簇小花（5朵） -->
          ${[
            {x: cx-6, y: cy-2, s: 0.85},
            {x: cx+5, y: cy-4, s: 0.9},
            {x: cx, y: cy-10, s: 1},
            {x: cx-9, y: cy+5, s: 0.75},
            {x: cx+8, y: cy+3, s: 0.8},
          ].map((b, bi) => {
            const size = b.s;
            return `
              <g transform="translate(${b.x}, ${b.y}) scale(${size})">
                <!-- 5片花瓣 -->
                ${[0,72,144,216,288].map(a => {
                  const rad = (a - 90) * Math.PI / 180;
                  const px = Math.cos(rad) * 4.5;
                  const py = Math.sin(rad) * 4.5;
                  return `<ellipse cx="${px}" cy="${py}" rx="3" ry="4.5" fill="url(#jm-${id})" transform="rotate(${a} ${px} ${py})"/>`;
                }).join('')}
                <!-- 花芯 -->
                <circle cx="0" cy="0" r="2" fill="#F5E6C8"/>
              </g>
            `;
          }).join('')}
          <!-- 小花苞 -->
          <circle cx="${cx+12}" cy="${cy-8}" r="2" fill="#E8F0E8"/>
          <ellipse cx="${cx+11}" cy="${cy-6}" rx="1.5" ry="2.5" fill="#78C888"/>
          <!-- 高光点 -->
          <circle cx="${cx-1}" cy="${cy-11}" r="1" fill="white" opacity="0.7"/>
        </g>`;
      break;
    case 'iris': // 鸢尾：蓝紫色大花，3上3下花瓣像蝴蝶 + 纹理
      flower = `
        <defs>
          <linearGradient id="ir-up-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C8B8E8"/>
            <stop offset="100%" stop-color="#8B78B8"/>
          </linearGradient>
          <linearGradient id="ir-down-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#A890D0"/>
            <stop offset="100%" stop-color="#6B5A98"/>
          </linearGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 茎 -->
          <rect x="${cx-1.5}" y="${cy+8}" width="3" height="18" fill="#6BB878" rx="1.5"/>
          <!-- 叶子 -->
          <path d="M${cx-12} ${cy+20} Q${cx-8} ${cy+10} ${cx-4} ${cy+5}" fill="none" stroke="#5AAB68" stroke-width="3" stroke-linecap="round"/>
          <path d="M${cx+10} ${cy+22} Q${cx+6} ${cy+12} ${cx+3} ${cy+8}" fill="none" stroke="#6BB878" stroke-width="3" stroke-linecap="round"/>
          <!-- 3片下垂花瓣（falls） -->
          ${[-120, 0, 120].map(a => {
            return `
              <g transform="rotate(${a} ${cx} ${cy})">
                <ellipse cx="${cx}" cy="${cy+10}" rx="6" ry="12" fill="url(#ir-down-${id})"/>
                <!-- 纹理线 -->
                <line x1="${cx-2}" y1="${cy+2}" x2="${cx-2}" y2="${cy+18}" stroke="#4A3A78" stroke-width="0.8" opacity="0.5"/>
                <line x1="${cx+2}" y1="${cy+2}" x2="${cx+2}" y2="${cy+18}" stroke="#4A3A78" stroke-width="0.8" opacity="0.5"/>
                <!-- 黄色花斑 -->
                <ellipse cx="${cx}" cy="${cy+5}" rx="2.5" ry="4" fill="#F5E6C8" opacity="0.8"/>
              </g>
            `;
          }).join('')}
          <!-- 3片竖立花瓣（standards） -->
          ${[-60, 180, 60].map(a => {
            return `
              <g transform="rotate(${a} ${cx} ${cy})">
                <ellipse cx="${cx}" cy="${cy-9}" rx="5" ry="11" fill="url(#ir-up-${id})"/>
                <line x1="${cx-1.5}" y1="${cy-15}" x2="${cx-1.5}" y2="${cy-2}" stroke="#6B5A98" stroke-width="0.6" opacity="0.4"/>
                <line x1="${cx+1.5}" y1="${cy-15}" x2="${cx+1.5}" y2="${cy-2}" stroke="#6B5A98" stroke-width="0.6" opacity="0.4"/>
              </g>
            `;
          }).join('')}
          <!-- 中心 -->
          <circle cx="${cx}" cy="${cy}" r="4" fill="#5A4888"/>
          <circle cx="${cx}" cy="${cy}" r="2" fill="#F5E6C8"/>
        </g>`;
      break;
    case 'diamond': // 钻石玫瑰：银白渐变灰 + 细闪光泽
      flower = `
        <defs>
          <linearGradient id="dm-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F5F0FF"/>
            <stop offset="40%" stop-color="#D8D0E8"/>
            <stop offset="100%" stop-color="#A898C0"/>
          </linearGradient>
          <radialGradient id="dm-c-${id}" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#C8B8D8"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 外层花瓣 8片 -->
          ${[0,45,90,135,180,225,270,315].map(a => `
            <ellipse cx="${cx}" cy="${cy-13}" rx="7" ry="14" fill="url(#dm-${id})" transform="rotate(${a} ${cx} ${cy})" opacity="0.95"/>
          `).join('')}
          <!-- 中层花瓣 6片 -->
          ${[30,90,150,210,270,330].map(a => `
            <ellipse cx="${cx}" cy="${cy-9}" rx="5.5" ry="11" fill="url(#dm-c-${id})" transform="rotate(${a} ${cx} ${cy})"/>
          `).join('')}
          <!-- 内层花瓣 4片 -->
          ${[45,135,225,315].map(a => `
            <ellipse cx="${cx}" cy="${cy-5}" rx="3.5" ry="7" fill="url(#dm-c-${id})" transform="rotate(${a} ${cx} ${cy})"/>
          `).join('')}
          <!-- 花心 -->
          <circle cx="${cx}" cy="${cy}" r="4.5" fill="#B8A9C9"/>
          <!-- 细闪光泽点 -->
          ${[
            {x:cx-6,y:cy-11,s:1.5},
            {x:cx+5,y:cy-9,s:1.2},
            {x:cx-3,y:cy-15,s:1},
            {x:cx+7,y:cy-4,s:0.8},
            {x:cx-8,y:cy-5,s:0.7},
            {x:cx+2,y:cy-13,s:1.1},
          ].map(s => `<circle cx="${s.x}" cy="${s.y}" r="${s.s}" fill="white" opacity="0.85" class="animate-twinkle"/>`).join('')}
          <!-- 大高光 -->
          <ellipse cx="${cx-4}" cy="${cy-10}" rx="2" ry="5" fill="white" opacity="0.5"/>
        </g>`;
      break;
    case 'chamomile': // 洋甘菊：白色细长花瓣 + 黄色圆形花芯像小太阳
      flower = `
        <defs>
          <linearGradient id="cm-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#F0EDE0"/>
          </linearGradient>
          <radialGradient id="cm-c-${id}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#FFD84D"/>
            <stop offset="100%" stop-color="#E8A820"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 茎 -->
          <rect x="${cx-1}" y="${cy+6}" width="2" height="20" fill="#78C888" rx="1"/>
          <!-- 细叶 -->
          <path d="M${cx-5} ${cy+15} L${cx-10} ${cy+12}" stroke="#6BB878" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M${cx+4} ${cy+18} L${cx+9} ${cy+15}" stroke="#6BB878" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M${cx-3} ${cy+22} L${cx-8} ${cy+25}" stroke="#5AAB68" stroke-width="1.5" stroke-linecap="round"/>
          <!-- 白色细长花瓣 18片 -->
          ${Array.from({length:18}, (_,i) => {
            const a = (360/18) * i;
            return `
              <ellipse cx="${cx}" cy="${cy-11}" rx="2.5" ry="9" fill="url(#cm-${id})" transform="rotate(${a} ${cx} ${cy})"/>
            `;
          }).join('')}
          <!-- 黄色花芯 -->
          <circle cx="${cx}" cy="${cy}" r="7" fill="url(#cm-c-${id})"/>
          <!-- 花芯纹理 -->
          ${Array.from({length:15}, (_,i) => {
            const a = (360/15) * i;
            const rad = a * Math.PI / 180;
            const px = cx + Math.cos(rad) * 4;
            const py = cy + Math.sin(rad) * 4;
            return `<circle cx="${px}" cy="${py}" r="0.8" fill="#B87810" opacity="0.7"/>`;
          }).join('')}
          <!-- 高光 -->
          <ellipse cx="${cx-2}" cy="${cy-2}" rx="2" ry="1.5" fill="#FFF0B0" opacity="0.6"/>
        </g>`;
      break;
    case 'sakura': // 樱花：淡粉五瓣 + 边缘浅白 + 飘落花瓣动画
      flower = `
        <defs>
          <radialGradient id="sk-${id}" cx="50%" cy="60%" r="70%">
            <stop offset="0%" stop-color="#FFE8F0"/>
            <stop offset="70%" stop-color="#F5C5D5"/>
            <stop offset="100%" stop-color="#E8A5B8"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 花柄 -->
          <path d="M${cx} ${cy+25} Q${cx+2} ${cy+15} ${cx+5} ${cy+8}" fill="none" stroke="#8B7355" stroke-width="1.5" stroke-linecap="round"/>
          <!-- 花萼 -->
          ${[-30,0,30].map(a => `
            <ellipse cx="${cx+5 + a*0.08}" cy="${cy+6}" rx="2" ry="3" fill="#78C888" transform="rotate(${a} ${cx+5} ${cy+8})"/>
          `).join('')}
          <!-- 五片花瓣（有缺口的樱花形） -->
          ${[0,72,144,216,288].map(a => {
            const rad = (a - 90) * Math.PI / 180;
            const px = cx + Math.cos(rad) * 10;
            const py = cy + Math.sin(rad) * 10;
            return `
              <g transform="translate(${px}, ${py}) rotate(${a})">
                <ellipse cx="0" cy="0" rx="6" ry="9" fill="url(#sk-${id})"/>
                <!-- 花瓣边缘缺口 -->
                <path d="M-1.5 -7 Q0 -5 1.5 -7 Q0 -4 -1.5 -7" fill="#FFE8F0" opacity="0.9"/>
                <!-- 边缘浅白 -->
                <ellipse cx="0" cy="-6" rx="3" ry="2" fill="white" opacity="0.5"/>
              </g>
            `;
          }).join('')}
          <!-- 中心 -->
          <circle cx="${cx}" cy="${cy}" r="4" fill="#F5D5D5"/>
          <!-- 花蕊 -->
          ${Array.from({length:8}, (_,i) => {
            const a = (360/8) * i;
            const rad = a * Math.PI / 180;
            const px = cx + Math.cos(rad) * 2.5;
            const py = cy + Math.sin(rad) * 2.5;
            return `
              <line x1="${px}" y1="${py}" x2="${cx + Math.cos(rad)*4}" y2="${cy + Math.sin(rad)*4}" stroke="#D47575" stroke-width="0.8"/>
              <circle cx="${cx + Math.cos(rad)*4.5}" cy="${cy + Math.sin(rad)*4.5}" r="0.6" fill="#C85555"/>
            `;
          }).join('')}
          <!-- 飘落花瓣 -->
          <g class="petal" style="left:60%;top:10%;font-size:10px;animation-duration:4s;animation-delay:0s">
            <ellipse cx="0" cy="0" rx="3" ry="5" fill="#F5C5D5" opacity="0.7" transform="rotate(30)"/>
          </g>
        </g>`;
      break;
    case 'camellia': // 山茶花：深红色重瓣大花 + 饱满圆润花瓣 + 厚绿叶
      flower = `
        <defs>
          <radialGradient id="ca-${id}" cx="40%" cy="25%" r="75%">
            <stop offset="0%" stop-color="#E85565"/>
            <stop offset="50%" stop-color="#D43545"/>
            <stop offset="100%" stop-color="#A82030"/>
          </radialGradient>
          <radialGradient id="ca-c-${id}" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#F07080"/>
            <stop offset="100%" stop-color="#C83040"/>
          </radialGradient>
          ${shadowFilter}
        </defs>
        <g filter="url(#fs-${id})">
          <!-- 粗茎 -->
          <rect x="${cx-2}" y="${cy+7}" width="4" height="18" fill="#5A8B48" rx="2"/>
          <!-- 厚叶子 -->
          <ellipse cx="${cx-11}" cy="${cy+16}" rx="9" ry="5" fill="#4A7B38"/>
          <ellipse cx="${cx-10}" cy="${cy+15}" rx="7" ry="3.5" fill="#5A8B48"/>
          <ellipse cx="${cx+10}" cy="${cy+20}" rx="8" ry="4.5" fill="#4A7B38"/>
          <!-- 外层大花瓣 7片 圆润饱满 -->
          ${[0,51,103,154,206,257,309].map(a => `
            <ellipse cx="${cx}" cy="${cy-13}" rx="8" ry="14" fill="url(#ca-${id})" transform="rotate(${a} ${cx} ${cy})" opacity="0.95"/>
          `).join('')}
          <!-- 中层花瓣 6片 -->
          ${[30,90,150,210,270,330].map(a => `
            <ellipse cx="${cx}" cy="${cy-9}" rx="6.5" ry="11" fill="url(#ca-c-${id})" transform="rotate(${a} ${cx} ${cy})"/>
          `).join('')}
          <!-- 内层花瓣 5片 -->
          ${[18,90,162,234,306].map(a => `
            <ellipse cx="${cx}" cy="${cy-5}" rx="5" ry="8" fill="url(#ca-c-${id})" transform="rotate(${a} ${cx} ${cy})"/>
          `).join('')}
          <!-- 花心 -->
          <circle cx="${cx}" cy="${cy}" r="5" fill="#8B1825"/>
          <!-- 黄色花蕊 -->
          ${Array.from({length:10}, (_,i) => {
            const a = (360/10) * i;
            const rad = a * Math.PI / 180;
            return `<circle cx="${cx + Math.cos(rad)*3.5}" cy="${cy + Math.sin(rad)*3.5}" r="0.8" fill="#F5E6C8"/>`;
          }).join('')}
          <!-- 高光 -->
          <ellipse cx="${cx-4}" cy="${cy-10}" rx="2.5" ry="5" fill="#FF8898" opacity="0.45"/>
        </g>`;
      break;
    default:
      flower = `<circle cx="${cx}" cy="${cy}" r="20" fill="${p.flowerColor2}"/>`;
  }
  return `<svg viewBox="0 0 60 60" width="${s}" height="${s}" class="flower-3d">${flower}</svg>`;
}
function getFlowerByStage(p, stage, size = 40) {
  const cx = 30, cy = 45; // 底部生长点
  const s = size;
  switch(stage) {
    case 0: // 种子：小土坑
      return `<svg viewBox="0 0 60 60" width="${s}" height="${s}">
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="4" fill="#8B7355" opacity="0.6"/>
        <ellipse cx="${cx}" cy="${cy-1}" rx="7" ry="2.5" fill="#6B5344" opacity="0.7"/>
        <ellipse cx="${cx-2}" cy="${cy-2}" rx="2" ry="1.5" fill="#5A4535" opacity="0.8"/>
        <circle cx="${cx+3}" cy="${cy-1}" r="1.5" fill="#7A6550" opacity="0.6"/>
      </svg>`;
    case 1: // 发芽：两片嫩绿色小芽
      return `<svg viewBox="0 0 60 60" width="${s}" height="${s}">
        <!-- 土坑 -->
        <ellipse cx="${cx}" cy="${cy}" rx="9" ry="3" fill="#8B7355" opacity="0.5"/>
        <!-- 茎 -->
        <rect x="${cx-1}" y="${cy-10}" width="2" height="10" fill="#88D080" rx="1"/>
        <!-- 两片小芽 -->
        <ellipse cx="${cx-4}" cy="${cy-11}" rx="4" ry="6" fill="#98E090" transform="rotate(-25 ${cx-4} ${cy-8})"/>
        <ellipse cx="${cx+4}" cy="${cy-11}" rx="4" ry="6" fill="#88D080" transform="rotate(25 ${cx+4} ${cy-8})"/>
        <!-- 高光 -->
        <ellipse cx="${cx-3}" cy="${cy-13}" rx="1" ry="2" fill="white" opacity="0.4"/>
      </svg>`;
    case 2: // 长叶：多片绿色叶子
      return `<svg viewBox="0 0 60 60" width="${s}" height="${s}">
        <!-- 土 -->
        <ellipse cx="${cx}" cy="${cy}" rx="10" ry="3" fill="#8B7355" opacity="0.4"/>
        <!-- 主茎 -->
        <rect x="${cx-1.5}" y="${cy-22}" width="3" height="22" fill="#68B860" rx="1.5"/>
        <!-- 多片叶子 -->
        <ellipse cx="${cx-7}" cy="${cy-8}" rx="8" ry="3.5" fill="#78C870" transform="rotate(-20 ${cx-7} ${cy-8})"/>
        <ellipse cx="${cx+7}" cy="${cy-12}" rx="7" ry="3" fill="#68B860" transform="rotate(25 ${cx+7} ${cy-12})"/>
        <ellipse cx="${cx-6}" cy="${cy-18}" rx="6" ry="2.5" fill="#78C870" transform="rotate(-30 ${cx-6} ${cy-18})"/>
        <ellipse cx="${cx+5}" cy="${cy-20}" rx="5" ry="2.5" fill="#88D080" transform="rotate(35 ${cx+5} ${cy-20})"/>
        <!-- 顶部新芽 -->
        <ellipse cx="${cx-2}" cy="${cy-25}" rx="3" ry="4" fill="#98E090" transform="rotate(-15 ${cx-2} ${cy-23})"/>
        <ellipse cx="${cx+2}" cy="${cy-25}" rx="3" ry="4" fill="#88D080" transform="rotate(15 ${cx+2} ${cy-23})"/>
        <!-- 叶脉 -->
        <line x1="${cx-12}" y1="${cy-8}" x2="${cx-3}" y2="${cy-9}" stroke="#58A850" stroke-width="0.5" opacity="0.6"/>
        <line x1="${cx+3}" y1="${cy-12}" x2="${cx+12}" y2="${cy-11}" stroke="#58A850" stroke-width="0.5" opacity="0.6"/>
      </svg>`;
    case 3: // 开花：完整的花
    default:
      return getFlowerSVG(p, s);
  }
}
const PERSONALITY_TEST_DEEP = PERSONALITY_TEST.concat([
  { q: '你平时的穿衣风格更偏向？', options: [
    { text: '干练利落、气场强的御姐风', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 2 } },
    { text: '文艺复古、有设计感的小众风', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 2 } },
    { text: '简约舒适、干净清爽的基础款', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '温柔甜美、软乎乎的仙女风', scores: { action: 0, create: 1, empathy: 3, stable: 1, charm: 1 } },
    { text: '精致时尚、走到哪都是焦点', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '一个人独处时你会觉得？', options: [
    { text: '终于可以专心做自己的事了', scores: { action: 3, create: 1, empathy: 0, stable: 1, charm: 0 } },
    { text: '太棒了，可以尽情沉浸在自己的世界', scores: { action: 0, create: 3, empathy: 1, stable: 1, charm: 0 } },
    { text: '很舒服，按自己的节奏慢慢来', scores: { action: 0, create: 1, empathy: 0, stable: 3, charm: 0 } },
    { text: '有点孤单，想有人陪', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '无聊，还是出门找人玩比较好', scores: { action: 2, create: 0, empathy: 1, stable: 0, charm: 3 } },
  ]},
  { q: '做计划时你更倾向于？', options: [
    { text: '先做了再说，计划赶不上变化', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 1 } },
    { text: '想很多种可能性，越详细越好', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '按部就班，照着既定的来', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '看心情和当时的感受决定', scores: { action: 1, create: 1, empathy: 3, stable: 0, charm: 1 } },
    { text: '怎么好看怎么来，仪式感很重要', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你觉得爱情里最重要的是？', options: [
    { text: '一起成长、并肩作战', scores: { action: 3, create: 1, empathy: 0, stable: 1, charm: 1 } },
    { text: '精神共鸣、灵魂契合', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 1 } },
    { text: '踏实稳定、细水长流', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '被宠爱、被珍惜的感觉', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 2 } },
    { text: '互相吸引、充满激情', scores: { action: 2, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '遇到不公平的事你会？', options: [
    { text: '立刻站出来，据理力争', scores: { action: 3, create: 0, empathy: 1, stable: 0, charm: 1 } },
    { text: '冷静分析，找最有利的解决方案', scores: { action: 1, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '忍一忍就过去了，多一事不如少一事', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '心里很难受，但不知道怎么办', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 0 } },
    { text: '用智慧和魅力巧妙化解', scores: { action: 1, create: 2, empathy: 1, stable: 0, charm: 3 } },
  ]},
  { q: '你对金钱的态度更接近？', options: [
    { text: '钱是赚出来的，不是省出来的', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 2 } },
    { text: '钱是实现创意和理想的工具', scores: { action: 1, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '存钱才有安全感，细水长流', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '钱够用就好，开心最重要', scores: { action: 0, create: 1, empathy: 3, stable: 1, charm: 0 } },
    { text: '钱是底气，也是身份的象征', scores: { action: 2, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你的房间通常是什么样子？', options: [
    { text: '东西多但乱中有序，能找到就行', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 1 } },
    { text: '有很多创意小物和收藏，有个人风格', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 2 } },
    { text: '整洁干净，东西都在固定位置', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '温馨柔软，有很多毛绒玩具和抱枕', scores: { action: 0, create: 1, empathy: 3, stable: 1, charm: 1 } },
    { text: '精致好看，拍照很出片', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '和别人吵架后你会？', options: [
    { text: '气消了就没事了，不记仇', scores: { action: 3, create: 0, empathy: 1, stable: 1, charm: 1 } },
    { text: '反复复盘整件事，想清楚对错', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '很难受，希望能快点和好', scores: { action: 0, create: 0, empathy: 2, stable: 2, charm: 0 } },
    { text: '偷偷难过，等对方先低头', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '冷战，但会用魅力让对方主动', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更相信什么？', options: [
    { text: '事在人为，努力就有结果', scores: { action: 3, create: 1, empathy: 0, stable: 1, charm: 0 } },
    { text: '思维和创意的力量', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '时间和坚持的力量', scores: { action: 1, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '爱和善意的力量', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 1 } },
    { text: '吸引力法则，你是什么就吸引什么', scores: { action: 1, create: 2, empathy: 1, stable: 0, charm: 3 } },
  ]},
  { q: '你最害怕的是？', options: [
    { text: '失败、一事无成', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 1 } },
    { text: '平庸、没有自己的特色', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 2 } },
    { text: '变化、失去稳定的生活', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '被抛弃、不被爱', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '被忽视、没有存在感', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你觉得自己的能量来源是？', options: [
    { text: '完成目标、取得成就', scores: { action: 3, create: 1, empathy: 0, stable: 1, charm: 1 } },
    { text: '创造新事物、表达自我', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 2 } },
    { text: '安稳的日常和规律的生活', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '被爱、被理解、被接纳', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 1 } },
    { text: '被赞美、被欣赏、被认可', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你怎么看待规则和秩序？', options: [
    { text: '规则是用来打破的，效率最重要', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 1 } },
    { text: '可以有规则，但要允许创新和例外', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 1 } },
    { text: '规则让生活更有序更安心', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '规则太冰冷了，人情更重要', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '规则是给普通人的，我可以不一样', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更喜欢什么样的旅行？', options: [
    { text: '特种兵式旅游，打卡尽可能多的地方', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 2 } },
    { text: '去有文化底蕴、有故事的地方', scores: { action: 0, create: 3, empathy: 1, stable: 1, charm: 0 } },
    { text: '找个舒服的地方躺平度假', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 1 } },
    { text: '和喜欢的人一起去哪都好', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 1 } },
    { text: '去网红景点拍照，留下美美的回忆', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你对未来的态度是？', options: [
    { text: '充满斗志，要干出一番事业', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 2 } },
    { text: '充满好奇，想探索各种可能性', scores: { action: 1, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '顺其自然，过好当下每一天', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '有点担心，但也期待美好', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 0 } },
    { text: '我注定会闪闪发光', scores: { action: 2, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更像哪种动物？', options: [
    { text: '猎豹：速度快、目标感强', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 2 } },
    { text: '蝴蝶：灵动、有艺术感', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 2 } },
    { text: '小鹿：温柔、安静、坚定', scores: { action: 0, create: 0, empathy: 2, stable: 3, charm: 0 } },
    { text: '白鲸：治愈、温柔、有灵性', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 1 } },
    { text: '孔雀：美丽、骄傲、引人注目', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更看重朋友的什么品质？', options: [
    { text: '靠谱、说到做到', scores: { action: 3, create: 0, empathy: 0, stable: 2, charm: 0 } },
    { text: '有趣、有想法、聊得来', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 1 } },
    { text: '忠诚、长久、不会走', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '懂我、能共情、会倾听', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 0 } },
    { text: '有魅力、能带带我', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你处理情绪的方式是？', options: [
    { text: '找点事做，转移注意力', scores: { action: 3, create: 1, empathy: 0, stable: 1, charm: 0 } },
    { text: '分析情绪来源，想清楚就好了', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '自己消化，时间会治愈一切', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '找信任的人说出来就好了', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '打扮自己，美了心情就好了', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你觉得什么样的女生最有魅力？', options: [
    { text: '独立自信、有事业心的大女主', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 2 } },
    { text: '有才华有内涵、气质独特的女生', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 2 } },
    { text: '温柔坚定、内心有力量的女生', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 1 } },
    { text: '柔软治愈、让人想保护的女生', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 2 } },
    { text: '光芒四射、走到哪都是焦点的女生', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你对「努力」的看法是？', options: [
    { text: '努力是必须的，爱拼才会赢', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 0 } },
    { text: '方向比努力重要，选择大于努力', scores: { action: 1, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '慢慢来，持续努力比爆发更重要', scores: { action: 1, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '努力太累了，我更想被宠爱', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '用脑子努力，不是用蛮力', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你最想拥有的超能力是？', options: [
    { text: '瞬间移动，想去哪就去哪', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 2 } },
    { text: '读心术，知道别人在想什么', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 2 } },
    { text: '时间暂停，可以慢慢做自己的事', scores: { action: 0, create: 1, empathy: 0, stable: 3, charm: 0 } },
    { text: '治愈能力，能抚平所有伤痛', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 0 } },
    { text: '永葆青春美丽，永远闪耀', scores: { action: 0, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你怎么看待「安全感」？', options: [
    { text: '安全感是自己给自己的，靠能力赚钱', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 1 } },
    { text: '安全感来自认知和思维的升级', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '安全感是稳定的生活和确定的未来', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '安全感是被坚定地选择和爱着', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '安全感是永远有退路和选择权', scores: { action: 2, create: 1, empathy: 0, stable: 1, charm: 3 } },
  ]},
  { q: '你更喜欢的颜色是？', options: [
    { text: '热情的红色、橙色系', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 2 } },
    { text: '神秘的紫色、靛蓝色系', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 2 } },
    { text: '清新的绿色、米色系', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '温柔的粉色、奶油色系', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 1 } },
    { text: '闪耀的金色、玫瑰金色系', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更认同哪句话？', options: [
    { text: '「想要什么就去争取」', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 2 } },
    { text: '「我思故我在」', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '「慢慢来，比较快」', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '「爱是一切的答案」', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '「你若盛开，蝴蝶自来」', scores: { action: 1, create: 1, empathy: 0, stable: 1, charm: 3 } },
  ]},
  { q: '你怎么看待「孤独」？', options: [
    { text: '孤独是强者的常态，我享受独处', scores: { action: 2, create: 1, empathy: 0, stable: 2, charm: 1 } },
    { text: '孤独是创作的源泉，灵感来自独处', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '偶尔孤独，但大部分时间享受平静', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '很怕孤独，需要有人陪伴', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '孤独是暂时的，我总能找到热闹', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更想成为什么样的「公主」？', options: [
    { text: '征战沙场的女王公主', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 2 } },
    { text: '拥有魔法的精灵公主', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 2 } },
    { text: '国泰民安的太平公主', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '被宠爱的甜心公主', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 2 } },
    { text: '光芒万丈的明星公主', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '遇到喜欢的东西你会？', options: [
    { text: '立刻买，喜欢就要拥有', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 2 } },
    { text: '研究一下，看看值不值得买', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '等打折或者想清楚再买', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '看看别人有没有，再决定买不买', scores: { action: 0, create: 0, empathy: 2, stable: 1, charm: 1 } },
    { text: '只要好看就买，千金难买我喜欢', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你觉得自己的「内核」是？', options: [
    { text: '不服输的韧劲和野心', scores: { action: 3, create: 0, empathy: 0, stable: 1, charm: 1 } },
    { text: '对世界的好奇和探索欲', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '稳定可靠的底色和坚持', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '柔软善良的本心和爱', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '天生我材必有用的自信', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你怎么看待「承诺」？', options: [
    { text: '说到就要做到，承诺是我的信用', scores: { action: 3, create: 0, empathy: 0, stable: 2, charm: 0 } },
    { text: '承诺要看情况，变化比计划快', scores: { action: 1, create: 3, empathy: 0, stable: 0, charm: 1 } },
    { text: '承诺很重要，一旦许下就要遵守', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '承诺是爱的证明，很在意对方说到做到', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 1 } },
    { text: '承诺是浪漫的一部分，但不要太当真', scores: { action: 1, create: 2, empathy: 0, stable: 0, charm: 3 } },
  ]},
  { q: '你更喜欢的音乐风格是？', options: [
    { text: '节奏感强的流行、摇滚、电子', scores: { action: 3, create: 1, empathy: 0, stable: 0, charm: 2 } },
    { text: '独立音乐、民谣、后摇', scores: { action: 0, create: 3, empathy: 1, stable: 0, charm: 1 } },
    { text: '轻音乐、古典、纯音乐', scores: { action: 0, create: 0, empathy: 1, stable: 3, charm: 0 } },
    { text: '抒情歌、情歌、治愈系', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 0 } },
    { text: 'K-pop、甜妹风、元气满满的歌', scores: { action: 2, create: 0, empathy: 1, stable: 0, charm: 3 } },
  ]},
  { q: '你最想改掉的缺点是？', options: [
    { text: '太急躁，容易冲动', scores: { action: 3, create: 0, empathy: 0, stable: 0, charm: 1 } },
    { text: '拖延症，想得多做得少', scores: { action: 0, create: 3, empathy: 0, stable: 0, charm: 0 } },
    { text: '太保守，不敢尝试新事物', scores: { action: 1, create: 0, empathy: 0, stable: 3, charm: 0 } },
    { text: '太心软，不会拒绝别人', scores: { action: 0, create: 0, empathy: 3, stable: 0, charm: 0 } },
    { text: '太在意别人的眼光', scores: { action: 0, create: 1, empathy: 1, stable: 0, charm: 3 } },
  ]},
  { q: '你觉得「成熟」是什么样的？', options: [
    { text: '有能力掌控自己的人生', scores: { action: 3, create: 0, empathy: 0, stable: 2, charm: 0 } },
    { text: '有自己的思想体系和认知', scores: { action: 0, create: 3, empathy: 0, stable: 1, charm: 0 } },
    { text: '情绪稳定，从容不迫', scores: { action: 0, create: 0, empathy: 0, stable: 3, charm: 1 } },
    { text: '温柔而有力量，能共情也能坚定', scores: { action: 0, create: 0, empathy: 3, stable: 1, charm: 0 } },
    { text: '知世故而不世故，依然耀眼', scores: { action: 1, create: 1, empathy: 0, stable: 0, charm: 3 } },
  ]},
]);
const EMOTION_TEST = [
  { q: '最近一周，你大部分时间的心情是？', options: [
    { text: '开心愉悦，对生活充满热情', level: 90 },
    { text: '平静安稳，没什么特别的情绪', level: 60 },
    { text: '有点焦虑/烦躁，静不下心', level: 35 },
    { text: '低落沮丧，对什么都没兴趣', level: 15 },
  ]},
  { q: '想到你的愿望时，你的第一感觉是？', options: [
    { text: '笃定相信，感觉已经实现了', level: 90 },
    { text: '充满希望，相信会实现', level: 70 },
    { text: '有点怀疑，不知道能不能成', level: 40 },
    { text: '觉得不可能，只是想想而已', level: 20 },
  ]},
  { q: '你最近的睡眠质量怎么样？', options: [
    { text: '睡得很好，醒来精力充沛', level: 85 },
    { text: '还行，偶尔会做梦', level: 60 },
    { text: '不太好，容易醒/入睡难', level: 35 },
    { text: '很差，经常失眠或早醒', level: 20 },
  ]},
  { q: '你对未来的态度是？', options: [
    { text: '充满期待，相信未来会更好', level: 85 },
    { text: '还行吧，走一步看一步', level: 55 },
    { text: '有点迷茫，不知道未来在哪', level: 35 },
    { text: '很悲观，觉得未来不会好', level: 15 },
  ]},
  { q: '你觉得自己有价值吗？', options: [
    { text: '当然，我本身就很有价值', level: 90 },
    { text: '有时候有，有时候没有', level: 55 },
    { text: '觉得自己没什么价值', level: 30 },
    { text: '觉得自己一无是处', level: 10 },
  ]},
];
const BELIEF_TYPES = {
  unworthy: { name: '我不配得感', desc: '你内心深处觉得自己不够好，不配拥有美好的事物。', affirm: '我值得拥有世间一切美好，我本身就是珍贵的' },
  abandon: { name: '被抛弃恐惧', desc: '你总是担心会被重要的人抛弃。', affirm: '我是被坚定爱着的，真正爱我的人不会离开我' },
  money: { name: '金钱卡点', desc: '你对金钱有负面信念。', affirm: '金钱轻松向我涌来，我是天生的吸金体质' },
  incapable: { name: '我不行信念', desc: '你不相信自己的能力。', affirm: '我有能力做到任何我想做的事' },
  perfect: { name: '完美主义', desc: '你觉得只有做到完美才值得被爱。', affirm: '不完美的我也值得被爱，完成比完美更重要' },
  people_pleasing: { name: '讨好型模式', desc: '你总是把别人放在前面。', affirm: '我可以温柔也可以坚定，拒绝别人是我的权利' },
  temporary: { name: '好事不会长久', desc: '你不相信美好可以持久。', affirm: '美好可以长久地留在我生命里' },
  hard: { name: '必须很努力', desc: '你觉得只有很努力才能得到想要的。', affirm: '我可以轻松地得到我想要的' },
  unlovable: { name: '我不可爱信念', desc: '你觉得自己不值得被爱。', affirm: '我是值得被深深爱着的' },
};
const COGNITIVE_DISTORTIONS = [
  { name: '非黑即白', desc: '用极端的眼光看事情，要么全好要么全坏，没有中间地带',
    example: '他这次没帮我，他就是个坏人',
    affirm: '世界不是非黑即白的，大多数事情都在中间地带',
    evidence: '生活是一个连续谱，没有绝对的好与坏。灰色地带才是常态。' },
  { name: '以偏概全', desc: '因为一次不好的经历，就得出「永远都会这样」的结论',
    example: '上次表白失败了，我这辈子都不会有人爱',
    affirm: '一次不代表全部，每次都是新的机会',
    evidence: '一次失败只是这一次的事，不代表你永远都会失败。' },
  { name: '心理过滤', desc: '只挑出事情的负面细节反复回味，忽略了正面的部分',
    example: '大家都夸我，但有一个人没说话，我觉得自己做得很差',
    affirm: '我选择看到事情好的一面，也允许不完美的存在',
    evidence: '每件事都有好有坏，你只是习惯性地盯着坏的看。' },
  { name: '否定正面思考', desc: '把好事都当成「不算数」，坚持否定自己的优点和成就',
    example: '这次考好只是运气好，不是我真的厉害',
    affirm: '我的努力和成就是真实的，我值得被肯定',
    evidence: '你做到的事情就是做到了，不需要用「只是运气好」来否定。' },
  { name: '读心术', desc: '默认别人在负面评价你，即使没有证据也这么认为',
    example: '他今天没跟我打招呼，肯定是讨厌我',
    affirm: '别人怎么想是别人的事，我只需要做好我自己',
    evidence: '你不是别人肚子里的蛔虫，大多数人其实更关心自己。' },
  { name: '预测未来', desc: '事情还没发生，就断定一定会有不好的结果',
    example: '我肯定找不到好工作，未来一片黑暗',
    affirm: '未来有无限可能，我选择相信最好的会发生',
    evidence: '未来还没到来，你担心的大多数事情其实都不会发生。' },
  { name: '灾难化', desc: '把事情往最坏最可怕的方向想，觉得天就要塌了',
    example: '我犯了一个小错，肯定会被开除，然后就完蛋了',
    affirm: '事情没有我想的那么糟糕，我有能力应对一切',
    evidence: '过去你担心的很多事其实都没有发生。就算真的发生了，你也挺过来了。' },
  { name: '应该句式', desc: '用「我应该」「别人必须」来要求自己和他人，做不到就很挫败',
    example: '我应该完美，我不应该犯任何错误',
    affirm: '我允许自己慢慢来，也允许别人做自己',
    evidence: '没有什么「应该」，只有「我选择」。你不需要活在别人的标准里。' },
];
const REVISION_GUIDES = {
  '原生家庭': `
    <p class="mb-2">🌸 找一个舒服的姿势，闭上眼睛，深呼吸三次...</p>
    <p class="mb-2">现在，想象你回到了小时候的家。但是这一次，一切都是你想要的样子。</p>
    <p class="mb-2">爸爸妈妈温柔地看着你，他们对你说："宝贝，你是我们最珍贵的礼物。"</p>
    <p class="mb-2">你感受到了满满的爱和安全感，小时候的你笑得很开心。</p>
    <p class="mb-2">长大的你走过去，抱住小时候的自己，对她说："谢谢你一直这么坚强。现在有我了。"</p>
    <p>✨ 深呼吸，把这份爱带回现在的生活。</p>
  `,
  '失恋创伤': `
    <p class="mb-2">💖 找一个舒服的姿势，闭上眼睛，深呼吸三次...</p>
    <p class="mb-2">现在，回到那段感情最让你受伤的画面。以旁观者的角度来看。</p>
    <p class="mb-2">你看到了你们不合适的地方，看到了那些被忽略的问题。</p>
    <p class="mb-2">你对那个人说："谢谢你陪我走过这一程。现在我要往前走了。"</p>
    <p class="mb-2">你看到自己转身离开，背影越来越坚定。前方有更美的风景。</p>
    <p>✨ 你值得一个全心全意爱你的人。</p>
  `,
  '失败经历': `
    <p class="mb-2">💪 找一个舒服的姿势，闭上眼睛，深呼吸三次...</p>
    <p class="mb-2">现在，回到那次让你受伤的失败经历。以旁观者的角度来看。</p>
    <p class="mb-2">你看到了当时的自己有多么勇敢，敢于尝试就已经很棒了。</p>
    <p class="mb-2">你从那次经历中学到了什么？每一次失败都是成长的礼物。</p>
    <p class="mb-2">现在，想象你重新经历那件事，这一次你做得很好，你成功了。</p>
    <p>✨ 过去的失败定义不了你，你一直在成长。</p>
  `,
  '容貌焦虑': `
    <p class="mb-2">🌸 找一个舒服的姿势，闭上眼睛，深呼吸三次...</p>
    <p class="mb-2">现在，想象你站在镜子前。但这一次，你看到了真实的自己。</p>
    <p class="mb-2">你看到你的眼睛里有星星，你的笑容很温暖，你整个人都在发光。</p>
    <p class="mb-2">你对镜子里的自己说："你真美。不是因为完美，而是因为你是你。"</p>
    <p class="mb-2">感受内心的柔软和接纳。你不需要完美，你本身就足够美好。</p>
    <p>✨ 你本来就很美，由内而外。</p>
  `,
};
const EMOTION_GUIDES = {
  low: { title: '从悲伤/恐惧往上走', steps: ['允许自己悲伤，不要逼自己开心', '哭出来或者写下来，把情绪释放出去', '做一件很小的照顾自己的事', '慢慢往"平静"走，不用急'] },
  mid: { title: '从平静往喜悦走', steps: ['感恩3件小事，培养丰盛感', '听喜欢的音乐，让能量流动起来', '做一件让你有小成就感的事', '想象愿望实现的场景，提升频率'] },
  high: { title: '保持在高能量状态', steps: ['感恩你拥有的一切', '视觉化你的愿望，强化感觉', '跟随灵感行动，趁热打铁', '分享你的喜悦给身边的人'] },
};
const MEDIA = {
  'books-media': [
    { name: '《感觉就是秘密》', level: '入门', type: '成长经典', desc: '内维尔·戈达德最核心的著作。' },
    { name: '《潜意识的力量》', level: '入门', type: '潜意识', desc: '讲透了潜意识的运作方式。' },
    { name: '《有求必应》', level: '进阶', type: '情绪刻度', desc: '22级情绪刻度，一步步往上走。' },
    { name: '《思考致富》', level: '进阶', type: '财富', desc: '研究500位富豪的致富公式。' },
    { name: '《零极限》', level: '进阶', type: '疗愈', desc: '夏威夷疗法，四句真言清理一切。' },
    { name: '《秘密》', level: '入门', type: '吸引力法则', desc: '把吸引力法则带给全世界的书。' },
    { name: '《你值得过更好的生活》', level: '专家', type: '意识提升', desc: '彻底颠覆你对现实的认知。' },
    { name: '《当下的力量》', level: '专家', type: '灵性', desc: '活在当下的力量。' },
  ],
  movies: [
    { name: '《秘密》纪录片', level: '入门', type: '成长入门', desc: '最经典的吸引力法则纪录片。' },
    { name: '《心灵奇旅》', level: '入门', type: '生命意义', desc: '告诉你活在当下的意义。' },
    { name: '《土拨鼠之日》', level: '进阶', type: '改变自己', desc: '当你改变了，你的世界就改变了。' },
    { name: '《吸引力法则》', level: '入门', type: '爱情成长', desc: '用吸引力法则追到男神的故事。' },
    { name: '《失控玩家》', level: '进阶', type: '意识觉醒', desc: 'NPC觉醒的故事。' },
    { name: '《黑客帝国》', level: '专家', type: '现实本质', desc: '你看到的世界是真的吗？' },
    { name: '《瞬息全宇宙》', level: '进阶', type: '平行宇宙', desc: '每个选择都在创造一个新的宇宙。' },
    { name: '《寻梦环游记》', level: '入门', type: '家族疗愈', desc: '关于记忆、爱和家族的故事。' },
  ],
  music: [
    { name: 'Weightless', level: '入门', type: '放松', desc: '世界上最放松的歌曲。' },
    { name: 'Solfeggio频率', level: '进阶', type: '疗愈', desc: '不同频率对应不同的疗愈效果。' },
    { name: 'α波音乐', level: '入门', type: '学习/冥想', desc: '帮助进入放松专注的α脑波状态。' },
    { name: '432Hz音乐', level: '进阶', type: '疗愈', desc: '和宇宙同频的自然频率。' },
    { name: '白噪音', level: '入门', type: '助眠/专注', desc: '雨声/海浪/篝火，自然白噪音。' },
    { name: '颂钵冥想', level: '进阶', type: '脉轮', desc: '颂钵的振动帮助平衡脉轮。' },
  ],
};
const BADGES = [
  { id: 'first_test', name: '初入仙境', icon: '✨', desc: '完成第一次测试', color: '#E8B5C8' },
  { id: 'first_wish', name: '许愿少女', icon: '🌠', desc: '许下第一个愿望', color: '#C8A5D8' },
  { id: 'first_manifest', name: '成长新手', icon: '💫', desc: '成长第一个愿望', color: '#B8A9C9' },
  { id: 'flower_10', name: '小花仙', icon: '🌸', desc: '种出10朵花', color: '#F0C8D8' },
  { id: 'flower_50', name: '花仙子', icon: '🌺', desc: '种出50朵花', color: '#E8A8C8' },
  { id: 'flower_100', name: '百花仙子', icon: '🌷', desc: '种出100朵花', color: '#D488B8' },
  { id: 'purify_21', name: '信念净化师', icon: '🔮', desc: '信念净化21天', color: '#B8A9D9' },
  { id: 'purify_50', name: '星光魔法师', icon: '✨', desc: '净化50个信念', color: '#9B8BB9' },
  { id: 'purify_100', name: '水晶大师', icon: '💎', desc: '净化100个信念', color: '#7A6B99' },
  { id: 'energy_100', name: '见习公主', icon: '👑', desc: '累计100能量', color: '#E8D5B0' },
  { id: 'energy_500', name: '正式公主', icon: '👸', desc: '累计500能量', color: '#D4C090' },
  { id: 'energy_1000', name: '魔法公主', icon: '💎', desc: '累计1000能量', color: '#C8A870' },
  { id: 'energy_5000', name: '宇宙公主', icon: '🌟', desc: '累计5000能量', color: '#B89850' },
  { id: 'sats_5', name: '梦境公主', icon: '🌙', desc: '完成5次SATS冥想', color: '#A8B8D8' },
  { id: 'sats_30', name: '梦境女王', icon: '👑', desc: '完成30次SATS冥想', color: '#8898C8' },
  { id: 'revision', name: '时光治愈者', icon: '🕊️', desc: '完成修正法冥想', color: '#B8C8D8' },
  { id: 'revision_10', name: '时光旅人', icon: '⏳', desc: '完成10次修正法', color: '#98A8C8' },
  { id: 'affirm_collector', name: '肯定语收藏家', icon: '💖', desc: '收藏20条肯定语', color: '#E8B5C8' },
  { id: 'affirm_collector_50', name: '肯定语大师', icon: '💗', desc: '收藏50条肯定语', color: '#D495A8' },
  { id: 'bookworm', name: '书香公主', icon: '📚', desc: '阅读10篇智慧花园文章', color: '#C8B8A8' },
  { id: 'bookworm_50', name: '博学公主', icon: '📖', desc: '阅读50篇文章', color: '#A89888' },
  { id: 'diary_7', name: '日记少女', icon: '📔', desc: '连续写日记7天', color: '#D8C8B8' },
  { id: 'diary_30', name: '日记作家', icon: '✍️', desc: '连续写日记30天', color: '#B8A898' },
  { id: 'course_complete', name: '成长毕业生', icon: '🎓', desc: '学完成长入门7课', color: '#C8D8E8' },
  { id: 'course_master', name: '成长教授', icon: '🏆', desc: '学完所有课程', color: '#A8C8D8' },
  { id: 'streak_7', name: '坚持者', icon: '🔥', desc: '连续打卡7天', color: '#E8B090' },
  { id: 'streak_30', name: '自律女王', icon: '💪', desc: '连续打卡30天', color: '#C89070' },
  { id: 'mood_30', name: '情绪观察者', icon: '🧘', desc: '记录30天心情', color: '#A8C8B0' },
  { id: 'mood_100', name: '情绪大师', icon: '🌈', desc: '记录100天心情', color: '#88A890' },
  { id: 'tarot_10', name: '塔罗学徒', icon: '🔮', desc: '抽牌10次', color: '#B8A9C9' },
  { id: 'tarot_50', name: '塔罗大师', icon: '🃏', desc: '抽牌50次', color: '#9889A9' },
  { id: 'welcome_test', name: '潜力发现者', icon: '🔍', desc: '完成欢迎测试', color: '#D8C8E8' },
  { id: 'night_owl', name: '夜猫子', icon: '🦉', desc: '深夜使用App', color: '#8898C8' },
  { id: 'early_bird', name: '早起的鸟', icon: '🐦', desc: '清晨使用App', color: '#E8D8A8' },
  { id: 'generous', name: '分享达人', icon: '💌', desc: '分享3次', color: '#E8B5C8' },
  { id: 'full_moon', name: '满月仪式', icon: '🌕', desc: '在满月日使用', color: '#C8C8D8' },
];
const LEVELS = [
  { name: '新手', min: 0 },
  { name: '见习公主', min: 100 },
  { name: '正式公主', min: 500 },
  { name: '魔法公主', min: 1000 },
  { name: '女王', min: 2000 },
];
const DIARY_PROMPTS = [
  '如果今天一切都很完美，你会怎么度过这一天？',
  '你理想中的自己，是什么样子的？',
  '写下3件你今天感恩的小事',
  '如果愿望已经实现了，你现在在做什么？',
  '你最想对一年前的自己说什么？',
  '你最想对一年后的自己说什么？',
  '你生命中最美好的5件事是什么？',
  '你身上最让你骄傲的3个特质是什么？',
  '如果钱不是问题，你最想做什么？',
  '你最近星愿成真的一件小事是什么？',
  '你最想拥有的一种能力是什么？',
  '你觉得自己最棒的地方是什么？',
  '描述一下你梦想中的家',
  '你理想中的周末是什么样的？',
  '你想对自己说的一句温柔的话',
];
const VOICE_OPTIONS = {
  girl1: { name: '樱花粉', rate: 0.9, pitch: 1.3 },
  woman: { name: '梦幻紫', rate: 0.85, pitch: 1.0 },
  loli: { name: '奶油黄', rate: 1.0, pitch: 1.5 },
  boy: { name: '薄荷绿', rate: 0.9, pitch: 0.9 },
  man: { name: '天空蓝', rate: 0.8, pitch: 0.7 },
};
const WEATHERS = ['sunny', 'cloudy', 'rainy'];
const WEATHER_NAMES = { sunny: '晴天', cloudy: '多云', rainy: '小雨' };
const WEATHER_EMOJIS = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️' };
const DEFAULT_STATE = {
  nickname: '小公主',
  energy: 0,
  level: '新手',
  unlockedPersonas: [],
  mainPersona: null,
  testHistory: [],
  topBeliefs: [],
  emotionLevel: 50,
  emotionHistory: [],
  wishes: [],
  purify: {
    streak: 0,
    lastCheckin: null,
    total: 0,
    todayCount: 0,
    records: [],
    stats: {},
  },
  mentalDiet: {
    streak: 0,
    lastCheckin: null,
    total: 0,
    todayCount: 0,
    records: [],
  },
  garden: {
    flowers: [],
    todayCount: 0,
    lastCheckin: null,
  },
  diaries: [],
  diaryStreak: 0,
  lastDiaryDate: null,
  satsCount: 0,
  revisionCount: 0,
  affirmations: { saved: [], custom: {} },
  badges: [],
  libReadCount: 0,
  courseProgress: [],
  paperSkin: 'sakura',
  diaryTemplate: 'gratitude',
  voiceType: 'girl1',
  voiceOn: true,
  autoplay: true,
  musicOn: false,
  currentMusic: null,
  whiteNoise: null,
  volumes: { music: 20, sfx: 40, voice: 0 },
  theme: 'pink',
  weather: 'auto',
  manualWeather: 'sunny',
  animation: true,
  darkMode: false,
  darkModeAuto: true,
  password: null,
  passwordEnabled: false,
  remindCheckin: false,
  notifications: false,
  meditationTime: '22:00',
  affirmTime: '09:00',
  startDate: null,
  todayDone: {},
  dailyAffirm: '我值得拥有世间一切美好',
  moodHistory: [],
  todayMood: null,
  habits: [],
  habitCat: 'affirm',
  habitFreq: 'daily',
  habitWeekdays: [],
  cbtRecords: [],
  revisionNotes: [],
  satsRecords: [],
  myTasks: [],
  universeTasks: [],
  items: [],
  rampages: [],
  signs: [],
  wheels: [],
  history: [],
  bookmarks: [],
  bookNotes: [],
  favMovies: [],
  movieLinks: [],
  cards: [],
  planNotes: [],
  completedChallenges: [],
  plans: {},
  favorites: [],
  tried: {},
  notes: {},
  bookReadProgress: {},
  cbtDrafts: {},
  currentWheel: null,
  day: 1,
  affirmation: '',
  currentLevel: null,
  wishDrafts: {},
  cycleLength: 28,
  dailyCount: 0,
  currentDay: 1,
  currentWish: '',
  activeCategory: '',
  lastDailyReset: null,
  memories: [],
  cycleStart: null,
};
let state = loadState();
function loadState() {
  try {
    const saved = localStorage.getItem('cosmos_island_state_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      const result = {
        ...DEFAULT_STATE,
        ...parsed,
        purify: { ...DEFAULT_STATE.purify, ...(parsed.purify || {}) },
        mentalDiet: { ...DEFAULT_STATE.mentalDiet, ...(parsed.mentalDiet || {}) },
        garden: { ...DEFAULT_STATE.garden, ...(parsed.garden || {}) },
        affirmations: { ...DEFAULT_STATE.affirmations, ...(parsed.affirmations || {}) },
        volumes: { ...DEFAULT_STATE.volumes, ...(parsed.volumes || {}) },
        todayDone: { ...DEFAULT_STATE.todayDone, ...(parsed.todayDone || {}) },
      };
      const arrayProps = ['wishes','diaries','emotionHistory','badges','unlockedPersonas','testHistory','courseProgress','topBeliefs','moodHistory','cbtRecords','revisionNotes','satsRecords','habits','myTasks','universeTasks','items','rampages','signs','wheels','history','bookmarks','bookNotes','favMovies','movieLinks','cards','planNotes','completedChallenges','favorites','memories'];
      for (const prop of arrayProps) {
        if (!Array.isArray(result[prop])) result[prop] = [];
      }
      if (typeof result.plans !== 'object' || result.plans === null) result.plans = {};
      if (typeof result.mentalDiet !== 'object' || result.mentalDiet === null) result.mentalDiet = {};
      if (typeof result.affirmations !== 'object' || result.affirmations === null) result.affirmations = { saved: [], custom: {} };
      if (!Array.isArray(result.affirmations.saved)) result.affirmations.saved = [];
      if (typeof result.affirmations.custom !== 'object' || result.affirmations.custom === null) result.affirmations.custom = {};
      if (typeof result.purify !== 'object' || result.purify === null) result.purify = { ...DEFAULT_STATE.purify };
      if (!Array.isArray(result.purify.records)) result.purify.records = [];
      if (typeof result.garden !== 'object' || result.garden === null) result.garden = { ...DEFAULT_STATE.garden };
      if (!Array.isArray(result.garden.flowers)) result.garden.flowers = [];
      if (typeof result.mentalDiet !== 'object' || result.mentalDiet === null) result.mentalDiet = {};
      if (!Array.isArray(result.mentalDiet.records)) result.mentalDiet.records = [];
      if (typeof result.volumes !== 'object' || result.volumes === null) result.volumes = { ...DEFAULT_STATE.volumes };
      if (typeof result.todayDone !== 'object' || result.todayDone === null) result.todayDone = {};
      if (typeof result.tried !== 'object' || result.tried === null) result.tried = {};
      if (typeof result.notes !== 'object' || result.notes === null) result.notes = {};
      if (typeof result.bookReadProgress !== 'object' || result.bookReadProgress === null) result.bookReadProgress = {};
      if (typeof result.cbtDrafts !== 'object' || result.cbtDrafts === null) result.cbtDrafts = {};
      if (typeof result.wishDrafts !== 'object' || result.wishDrafts === null) result.wishDrafts = {};
      return result;
    }
  } catch (e) {}
  return { ...DEFAULT_STATE, startDate: new Date().toISOString() };
}
function saveState() {
  try { localStorage.setItem('cosmos_island_state_v3', JSON.stringify(state)); } catch (e) {}
}
const StorageUtil = {
  get(k, d) {
    try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch(e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { return false; }
  },
  remove(k) {
    try { localStorage.removeItem(k); return true; } catch(e) { return false; }
  },
  keys() {
    try { const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); return keys; } catch(e) { return []; }
  },
  size() {
    try { let total = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k); total += (k.length + v.length) * 2; } return total; } catch(e) { return 0; }
  }
};
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  t.setAttribute('aria-label', msg);
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.classList.remove('show'); t.removeAttribute('aria-label'); }, dur);
}
function showLoading() {
  const el = document.getElementById('star-loading');
  if (el) el.classList.remove('hidden');
}
function hideLoading() {
  const el = document.getElementById('star-loading');
  if (el) el.classList.add('hidden');
}
let tutorialStep = 0;
const TUTORIAL_STEPS = [
  {
    emoji: '👋',
    title: '公主你好呀~',
    desc: '欢迎来到你的专属许愿岛！让我带你逛逛这座神奇的小岛吧 ✨',
    target: null, // 居中显示
    position: 'center',
  },
  {
    emoji: '🏝️',
    title: '这是你的许愿岛',
    desc: '岛上的每一座小房子都是一个成长功能哦～点一点星光水晶神殿、云端城堡、花田，试试它们都有什么魔法吧 🌸',
    target: '#page-island svg',
    position: 'bottom',
  },
  {
    emoji: '🧭',
    title: '底部导航栏',
    desc: '底部可以切换不同页面：岛屿是主界面、成长是工具合集、书馆有书和电影、记录看你的成长～想去哪里点哪里就好啦 💖',
    target: '.bottom-nav',
    position: 'top',
  },
];
function startTutorial() {
  try {
    if (localStorage.getItem('cosmos_tutorial_done')) return;
  } catch(e) { return; }
  tutorialStep = 0;
  showTutorialStep();
}
function showTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  if (!step) { finishTutorial(); return; }
  const overlay = document.getElementById('tutorial-overlay');
  const highlight = document.getElementById('tutorial-highlight');
  const bubble = document.getElementById('tutorial-bubble');
  if (!overlay || !highlight || !bubble) { finishTutorial(); return; }
  overlay.classList.remove('hidden');
  const emojiEl = document.getElementById('tutorial-emoji');
  const titleEl = document.getElementById('tutorial-title');
  const descEl = document.getElementById('tutorial-desc');
  const nextBtn = document.getElementById('tutorial-next-btn');
  if (emojiEl) emojiEl.textContent = step.emoji;
  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.desc;
  if (nextBtn) nextBtn.textContent = 
    tutorialStep === TUTORIAL_STEPS.length - 1 ? '开始探索 ✨' : '下一步 →';
  document.querySelectorAll('.tutorial-dot').forEach((dot, i) => {
    dot.style.background = i <= tutorialStep ? '#E8B5C8' : 'rgba(184,169,201,0.3)';
  });
  if (step.target) {
    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const pad = 12;
      highlight.style.display = 'block';
      highlight.style.left = (rect.left - pad) + 'px';
      highlight.style.top = (rect.top - pad) + 'px';
      highlight.style.width = (rect.width + pad * 2) + 'px';
      highlight.style.height = (rect.height + pad * 2) + 'px';
      highlight.style.borderRadius = '24px';
      if (step.position === 'top') {
        bubble.style.top = (rect.top - 20) + 'px';
        bubble.style.transform = 'translate(-50%, -100%)';
      } else {
        bubble.style.top = (rect.bottom + 20) + 'px';
        bubble.style.transform = 'translateX(-50%)';
      }
      bubble.style.left = '50%';
    }
  } else {
    highlight.style.display = 'none';
    bubble.style.top = '50%';
    bubble.style.left = '50%';
    bubble.style.transform = 'translate(-50%, -50%)';
  }
}
function nextTutorialStep() {
  tutorialStep++;
  if (tutorialStep >= TUTORIAL_STEPS.length) {
    finishTutorial();
  } else {
    showTutorialStep();
  }
}
function skipTutorial() {
  finishTutorial();
}
function finishTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.classList.add('hidden');
  try { localStorage.setItem('cosmos_tutorial_done', '1'); } catch(e) {}
  hideModal('test-modal');
  hideModal('persona-modal');
  hideModal('alert-modal');
  showToast('欢迎来到许愿岛，玩得开心呀～ 💖');
}
function showAlert(icon, title, text) {
  const iconEl = document.getElementById('alert-icon');
  const titleEl = document.getElementById('alert-title');
  const textEl = document.getElementById('alert-text');
  const modalEl = document.getElementById('alert-modal');
  if (iconEl) iconEl.textContent = icon;
  if (titleEl) titleEl.textContent = title;
  if (textEl) textEl.textContent = text;
  if (modalEl) modalEl.classList.add('show');
}
function closeAlert() { const m = document.getElementById('alert-modal'); if (m) m.classList.remove('show'); }
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function escapeHtml(str) {
  if (typeof str !== 'string') str = String(str);
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function updateTopbar() {
  const energyEl = document.getElementById('stat-energy');
  if (energyEl) energyEl.textContent = state.energy;
  const lvl = getLevel();
  const levelEl = document.getElementById('stat-level');
  if (levelEl) levelEl.textContent = lvl;
}
function getLevel() {
  let lvl = LEVELS[0].name;
  for (const l of LEVELS) {
    if (state.energy >= l.min) lvl = l.name;
  }
  return lvl;
}
function addEnergy(amount, reason = '') {
  state.energy += amount;
  const oldLvl = getLevel();
  const newLvl = getLevel();
  saveState();
  updateTopbar();
  if (amount > 0) showToast(`💎 +${amount} 能量${reason ? '：' + reason : ''}`);
  if (newLvl !== oldLvl) {
    setTimeout(() => {
      showAlert('👑', '升级啦公主殿下！', `恭喜晋升为「${newLvl}」！你越来越闪耀了 ✨`);
      triggerConfetti();
      speak('恭喜公主殿下升级啦！');
    }, 500);
  }
}
function checkBadges() {
  const nb = [];
  const addBadge = (id, name, condition) => {
    if (condition && !state.badges.includes(id)) { state.badges.push(id); nb.push(name); }
  };
  addBadge('first_test', '初入仙境', state.testHistory.length > 0);
  addBadge('first_wish', '许愿少女', state.wishes.length > 0);
  addBadge('first_manifest', '成长新手', state.wishes.filter(w => w.done).length > 0);
  addBadge('flower_10', '小花仙', state.garden.flowers && state.garden.flowers.filter(f => f.done).length >= 10);
  addBadge('flower_50', '花仙子', state.garden.flowers && state.garden.flowers.filter(f => f.done).length >= 50);
  addBadge('flower_100', '百花仙子', state.garden.flowers && state.garden.flowers.filter(f => f.done).length >= 100);
  addBadge('purify_21', '信念净化师', state.purify.streak >= 21);
  addBadge('purify_50', '星光魔法师', state.purify.total >= 50);
  addBadge('purify_100', '水晶大师', state.purify.total >= 100);
  addBadge('energy_100', '见习公主', state.energy >= 100);
  addBadge('energy_500', '正式公主', state.energy >= 500);
  addBadge('energy_1000', '魔法公主', state.energy >= 1000);
  addBadge('energy_5000', '宇宙公主', state.energy >= 5000);
  addBadge('sats_5', '梦境公主', state.satsCount >= 5);
  addBadge('sats_30', '梦境女王', state.satsCount >= 30);
  addBadge('revision', '时光治愈者', state.revisionCount >= 1);
  addBadge('revision_10', '时光旅人', state.revisionCount >= 10);
  addBadge('affirm_collector', '肯定语收藏家', (state.affirmations.saved || []).length >= 20);
  addBadge('affirm_collector_50', '肯定语大师', (state.affirmations.saved || []).length >= 50);
  addBadge('bookworm', '书香公主', state.libReadCount >= 10);
  addBadge('bookworm_50', '博学公主', state.libReadCount >= 50);
  addBadge('diary_7', '日记少女', state.diaryStreak >= 7);
  addBadge('diary_30', '日记作家', state.diaryStreak >= 30);
  addBadge('course_complete', '成长毕业生', state.courseProgress.length >= 7);
  addBadge('course_master', '成长教授', state.courseProgress.length >= 20);
  addBadge('streak_7', '坚持者', state.checkinStreak >= 7);
  addBadge('streak_30', '自律女王', state.checkinStreak >= 30);
  addBadge('mood_30', '情绪观察者', (state.emotionHistory || []).length >= 30);
  addBadge('mood_100', '情绪大师', (state.emotionHistory || []).length >= 100);
  addBadge('tarot_10', '塔罗学徒', (state.tarotDraws || 0) >= 10);
  addBadge('tarot_50', '塔罗大师', (state.tarotDraws || 0) >= 50);
  addBadge('welcome_test', '潜力发现者', state.welcomeTestDone);
  // 时间相关徽章
  const hour = new Date().getHours();
  addBadge('night_owl', '夜猫子', hour >= 0 && hour < 5);
  addBadge('early_bird', '早起的鸟', hour >= 5 && hour < 8);
  addBadge('full_moon', '满月仪式', isFullMoon());
  addBadge('generous', '分享达人', (state.shareCount || 0) >= 3);
  if (nb.length) {
    saveState();
    nb.forEach((name, i) => setTimeout(() => showBadgeUnlock(name), i * 1200));
  }
}
function isFullMoon() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  // 简化判断：农历十五附近（2025-2026 常用满月日期）
  const knownFullMoons = ['2025-01-14','2025-02-12','2025-03-14','2025-04-13','2025-05-12','2025-06-11','2025-07-10','2025-08-09','2025-10-07','2025-11-05','2025-12-05','2026-01-03','2026-02-02','2026-03-03','2026-04-01','2026-05-01','2026-05-30','2026-06-29','2026-07-28','2026-08-27','2026-09-25','2026-10-25','2026-11-23','2026-12-23'];
  const todayStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  return knownFullMoons.includes(todayStr);
}
function showBadgeUnlock(name) {
  const badge = BADGES.find(b => b.name === name);
  if (!badge) return;
  const modal = document.getElementById('badge-unlock-modal');
  if (modal) {
    setText('badge-unlock-name', name);
    setText('badge-unlock-desc', badge.desc);
    setText('badge-unlock-icon', badge.icon);
    if (modal.querySelector('.badge-unlock-bg')) {
      modal.querySelector('.badge-unlock-bg').style.background = badge.color || '#E8B5C8';
    }
    showModal('badge-unlock-modal');
  } else {
    showToast(`🏆 获得徽章：${name}！`);
  }
  playSound('sparkle');
  triggerConfetti();
}
function triggerConfetti() {
  const emojis = ['✨', '💖', '🌸', '⭐', '💫', '🦋', '🌺', '💎', '🎀', '💕'];
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = '-20px';
    c.style.fontSize = (14 + Math.random() * 16) + 'px';
    c.style.animationDuration = (2.5 + Math.random() * 2) + 's';
    c.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}
if (!window.__clickSparkleBound) {
  window.__clickSparkleBound = true;
  document.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('.building') || e.target.closest('.card-hover') ||
        e.target.closest('.soft-btn') || e.target.closest('.option-card') || e.target.closest('.chip-soft') ||
        e.target.closest('.tab-pill') || e.target.closest('.voice-option') || e.target.closest('.affirm-card') ||
        e.target.closest('.nav-item') || e.target.closest('.settings-item')) {
      const spark = document.createElement('div');
      spark.className = 'click-sparkle';
      spark.textContent = '✨';
      spark.style.left = e.clientX - 14 + 'px';
      spark.style.top = e.clientY - 14 + 'px';
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
      playSound('sparkle');
    }
  });
}
let audioCtx = null;
let musicInterval = null;
let whiteNoiseNode = null;
let typingSoundTimeout = null;
window.addEventListener('error', function(event) {
  console.error('Global error:', event.message, 'at', event.filename + ':' + event.lineno);
});
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});
window.addEventListener('online', () => showToast('🌐 网络已连接'));
window.addEventListener('offline', () => showToast('📴 进入离线模式，数据仍安全保存'));
document.addEventListener('visibilitychange', () => {
  if ('hidden' in document && document.hidden && audioCtx) { audioCtx.suspend(); }
  else if (audioCtx) { audioCtx.resume(); }
});
function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}
function speak(text, opts = {}) {
  if (!state.voiceOn) return;
  showVoiceBubble(text);
}
function showVoiceBubble(text) {
  const b = document.getElementById('voice-bubble');
  if (!b) return;
  b.textContent = '💫 ' + text.substring(0, 28) + (text.length > 28 ? '...' : '');
  b.classList.remove('hidden');
  clearTimeout(b._t);
  b._t = setTimeout(() => b.classList.add('hidden'), 3500);
}
function playSound(type) {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const master = audioCtx.createGain();
  master.gain.value = (state.volumes.sfx / 100) * 0.15;
  master.connect(audioCtx.destination);
  switch(type) {
    case 'sparkle':
      playTone(1200, 0.12, 0.03, 'sine', now, master);
      playTone(1800, 0.15, 0.02, 'sine', now + 0.05, master);
      break;
    case 'ding':
      playTone(784, 0.5, 0.04, 'sine', now, master);
      playTone(1175, 0.6, 0.03, 'sine', now + 0.1, master);
      break;
    case 'page':
      playNoise(0.15, 'bandpass', 1800, 0.1, now, master);
      break;
    case 'type':
      playNoise(0.05, 'highpass', 2800, 0.03, now, master);
      break;
    case 'bloom':
      playTone(523, 0.3, 0.05, 'sine', now, master);
      playTone(659, 0.3, 0.04, 'sine', now + 0.1, master);
      playTone(784, 0.4, 0.03, 'sine', now + 0.2, master);
      break;
    case 'shatter':
      playNoise(0.25, 'highpass', 2000, 0.12, now, master);
      break;
    case 'chime':
      playTone(1046, 0.7, 0.025, 'sine', now, master);
      playTone(1318, 0.9, 0.02, 'sine', now + 0.15, master);
      break;
  }
}
function playTone(freq, dur, vol, type, startTime, dest) {
  if (!audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(vol, startTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    o.connect(g);
    g.connect(dest);
    o.start(startTime);
    o.stop(startTime + dur);
  } catch (e) {}
}
function playNoise(dur, filterType, filterFreq, vol, startTime, dest) {
  if (!audioCtx) return;
  try {
    const bufferSize = audioCtx.sampleRate * dur;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(vol, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(dest);
    src.start(startTime);
    src.stop(startTime + dur);
  } catch (e) {}
}
function playTypeSound() {
  if (typingSoundTimeout) return;
  playSound('type');
  typingSoundTimeout = setTimeout(() => { clearTimeout(typingSoundTimeout); typingSoundTimeout = null; }, 60);
}
function setVolume(type, val) {
  val = parseInt(val) || 0;
  state.volumes[type] = val;
  saveState();
  const el = document.getElementById('vol-' + type + '-val');
  if (el) el.textContent = val + '%';
}
function toggleWhiteNoise(type, btn) {
  if (state.whiteNoise === type) {
    state.whiteNoise = null;
    stopWhiteNoise();
    btn.classList.remove('active');
    return;
  }
  document.querySelectorAll('#settings-modal .chip-soft').forEach(b => {
    if (b.textContent.includes('细雨') || b.textContent.includes('森林') ||
        b.textContent.includes('海浪') || b.textContent.includes('篝火') || b.textContent.includes('咖啡馆')) {
      b.classList.remove('active');
    }
  });
  state.whiteNoise = type;
  btn.classList.add('active');
  startWhiteNoise(type);
  saveState();
}
function startWhiteNoise(type) {
  stopWhiteNoise();
  initAudio();
  if (!audioCtx) return;
  try {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    const filter = audioCtx.createBiquadFilter();
    const filter2 = audioCtx.createBiquadFilter();
    switch(type) {
      case 'rain':
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        filter2.type = 'highpass';
        filter2.frequency.value = 200;
        break;
      case 'forest':
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        filter2.type = 'lowpass';
        filter2.frequency.value = 3000;
        break;
      case 'ocean':
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter2.type = 'highpass';
        filter2.frequency.value = 80;
        break;
      case 'fire':
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        filter2.type = 'highpass';
        filter2.frequency.value = 100;
        break;
      case 'cafe':
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 0.3;
        filter2.type = 'lowpass';
        filter2.frequency.value = 2000;
        break;
    }
    const gain = audioCtx.createGain();
    gain.gain.value = (state.volumes.music / 100) * 0.08;
    whiteNoise.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(audioCtx.destination);
    whiteNoise.start();
    whiteNoiseNode = { source: whiteNoise, gain };
  } catch (e) {}
}
function stopWhiteNoise() {
  if (whiteNoiseNode) {
    try { whiteNoiseNode.source.stop(); } catch(e) {}
    whiteNoiseNode = null;
  }
}
function startAmbientMusic() {
  if (musicInterval) return;
  initAudio();
  if (!audioCtx) return;
  try {
    const musicGain = audioCtx.createGain();
    musicGain.gain.value = (state.volumes.music / 100) * 0.04;
    musicGain.connect(audioCtx.destination);
    const chord = [261.63, 329.63, 392.00, 523.25]; // C大调
    let step = 0;
    musicInterval = setInterval(() => {
      if (!state.musicOn) return;
      const freq = chord[step % chord.length];
      playTone(freq, 2.5, 0.5, 'sine', audioCtx.currentTime, musicGain);
      playTone(freq * 2, 2, 0.2, 'triangle', audioCtx.currentTime + 0.3, musicGain);
      step++;
    }, 2500);
  } catch (e) {}
}
function stopAmbientMusic() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}
let currentWeather = 'sunny';
let isNight = false;
function updateTimeAndWeather() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const timeStr = `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
  const timeEl = document.getElementById('time-display');
  if (timeEl) timeEl.textContent = timeStr;
  isNight = hours < 6 || hours >= 19;
  let weather = 'sunny';
  if (state.weather === 'auto') {
    const lvl = state.emotionLevel || 50;
    if (lvl < 30) weather = 'rainy';
    else if (lvl < 60) weather = 'cloudy';
    else weather = 'sunny';
    if (isNight) weather = weather; // 保留天气状态
  } else {
    weather = state.manualWeather;
  }
  currentWeather = weather;
  updateSkyBackground();
  updateWeatherEffects();
  const emojiEl = document.getElementById('weather-emoji');
  const textEl = document.getElementById('weather-text');
  const settingEl = document.getElementById('weather-setting-text');
  if (emojiEl) emojiEl.textContent = isNight ? (weather === 'rainy' ? '🌧️' : weather === 'cloudy' ? '☁️' : '🌙') : (WEATHER_EMOJIS[weather] || '☀️');
  if (textEl) textEl.textContent = isNight ? '夜晚' : (WEATHER_NAMES[weather] || '晴天');
  if (settingEl) settingEl.textContent = state.weather === 'auto' ? '自动（随情绪）' : (WEATHER_NAMES[state.manualWeather] || '晴天');
}
function updateSkyBackground() {
  const sky = document.getElementById('island-sky');
  if (!sky) return;
  let bg = '';
  if (isNight) {
    if (currentWeather === 'rainy') {
      bg = 'linear-gradient(180deg, #1A1625 0%, #2D263E 40%, #3D3258 100%)';
    } else if (currentWeather === 'cloudy') {
      bg = 'linear-gradient(180deg, #252030 0%, #352D45 50%, #453D58 100%)';
    } else {
      bg = 'linear-gradient(180deg, #0F0A1A 0%, #1A1625 40%, #2D263E 100%)';
    }
  } else {
    if (currentWeather === 'rainy') {
      bg = 'linear-gradient(180deg, #A8B0C0 0%, #C0C8D8 50%, #D0D8E0 100%)';
    } else if (currentWeather === 'cloudy') {
      bg = 'linear-gradient(180deg, #D4D8E0 0%, #E8EAF0 50%, #F0F0F5 100%)';
    } else {
      bg = 'linear-gradient(180deg, #E8E0F0 0%, #F5EEF8 40%, #FAF5F7 100%)';
    }
  }
  sky.style.background = bg;
  if (document.body) {
    if (state.darkMode) {
      document.body.classList.add('dark');
    } else if (state.darkModeAuto) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.matches) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
function updateWeatherEffects() {
  const sky = document.getElementById('island-sky');
  if (!sky) return;
  sky.querySelectorAll('.weather-effect').forEach(e => e.remove());
  const celestial = document.createElement('div');
  celestial.className = 'weather-effect celestial-body';
  celestial.style.cssText = `
    top: 40px; right: 60px; width: 50px; height: 50px;
    border-radius: 50%;
  `;
  if (isNight) {
    celestial.style.background = 'radial-gradient(circle at 35% 35%, #F8FAFC, #E2E8F0)';
    celestial.classList.add('animate-float-slow');
    const crater1 = document.createElement('div');
    crater1.style.cssText = 'position:absolute;top:15px;left:20px;width:8px;height:8px;border-radius:50%;background:rgba(200,210,220,0.5)';
    const crater2 = document.createElement('div');
    crater2.style.cssText = 'position:absolute;top:28px;left:12px;width:5px;height:5px;border-radius:50%;background:rgba(200,210,220,0.4)';
    celestial.appendChild(crater1);
    celestial.appendChild(crater2);
  } else if (currentWeather === 'sunny') {
    celestial.style.background = 'radial-gradient(circle, #FEF3C7, #FCD34D)';
    celestial.style.boxShadow = '0 0 30px rgba(252, 211, 77, 0.5)';
    celestial.classList.add('animate-breath');
  }
  if (currentWeather !== 'rainy' || isNight) {
    sky.appendChild(celestial);
  }
  if (isNight && currentWeather !== 'rainy') {
    for (let i = 0; i < 20; i++) {
      const star = document.createElement('div');
      star.className = 'weather-effect';
      star.style.cssText = `
        position: absolute;
        width: 3px; height: 3px;
        background: white;
        border-radius: 50%;
        top: ${10 + Math.random() * 40}%;
        left: ${Math.random() * 90 + 5}%;
        opacity: ${0.3 + Math.random() * 0.5};
        animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
        animation-delay: ${Math.random() * 3}s;
      `;
      sky.appendChild(star);
    }
  }
  if (currentWeather === 'cloudy' || currentWeather === 'rainy') {
    const cloudCount = currentWeather === 'rainy' ? 5 : 3;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'weather-effect floating-cloud';
      const size = 60 + Math.random() * 50;
      cloud.style.cssText = `
        top: ${15 + Math.random() * 30}%;
        left: ${-10 + Math.random() * 80}%;
        width: ${size}px;
        height: ${size * 0.5}px;
        background: ${isNight ? 'rgba(100, 100, 120, 0.4)' : 'rgba(255, 255, 255, 0.7)'};
        border-radius: 50%;
        animation: cloudMove ${20 + Math.random() * 15}s ease-in-out infinite;
        animation-delay: ${-Math.random() * 10}s;
        filter: blur(2px);
      `;
      sky.appendChild(cloud);
    }
  }
  if (currentWeather === 'rainy') {
    for (let i = 0; i < 40; i++) {
      const drop = document.createElement('div');
      drop.className = 'weather-effect rain-drop';
      drop.style.cssText = `
        left: ${Math.random() * 100}%;
        animation-duration: ${0.5 + Math.random() * 0.5}s;
        animation-delay: ${Math.random() * 1}s;
        height: ${12 + Math.random() * 10}px;
      `;
      sky.appendChild(drop);
    }
  }
}
function cycleWeather() {
  if (state.weather === 'auto') {
    state.weather = 'manual';
    state.manualWeather = 'sunny';
  } else {
    const idx = WEATHERS.indexOf(state.manualWeather);
    state.manualWeather = WEATHERS[(idx + 1) % WEATHERS.length];
    if (state.manualWeather === 'sunny' && state.weather === 'manual') {
      state.weather = 'auto';
    }
  }
  saveState();
  updateTimeAndWeather();
  playSound('ding');
}
function cycleWeatherSetting() {
  if (state.weather === 'auto') {
    state.weather = 'manual';
    state.manualWeather = 'sunny';
  } else {
    const idx = WEATHERS.indexOf(state.manualWeather);
    state.manualWeather = WEATHERS[(idx + 1) % WEATHERS.length];
  }
  saveState();
  updateTimeAndWeather();
}
const THEMES = {
  pink: {
    primary: '#B8A9C9', secondary: '#D4B5C7', accent: '#E8D5E0',
    bg: '#FAF5F7', text: '#5D4E6D',
  },
  purple: {
    primary: '#A898BC', secondary: '#C8B8D8', accent: '#DCCCE8',
    bg: '#F5F0FA', text: '#4D3D60',
  },
  blue: {
    primary: '#9DB5C8', secondary: '#B8CCE0', accent: '#D0E0EF',
    bg: '#F0F5FA', text: '#3D5065',
  },
  green: {
    primary: '#9DC0A8', secondary: '#B8D8C8', accent: '#D0E8DC',
    bg: '#F0FAF5', text: '#3D5548',
  },
};
function setTheme(theme, btn) {
  state.theme = theme;
  saveState();
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  btn.classList.add('active');
  const t = THEMES[theme] || THEMES['pink'];
  if (!t) return;
  document.documentElement.style.setProperty('--theme-primary', t.primary);
  document.documentElement.style.setProperty('--theme-secondary', t.secondary);
  document.documentElement.style.setProperty('--theme-accent', t.accent);
  document.documentElement.style.setProperty('--theme-bg', t.bg);
  document.documentElement.style.setProperty('--theme-text', t.text);
  showToast('主题已切换 ✨');
  playSound('ding');
}
let __pageHistory = [];
function showPage(name, direction) {
  // 追踪使用次数，用于触发付费转化
  if (typeof trackUsage === 'function') trackUsage();
  // 页面浏览埋点
  if (typeof trackPageView === 'function') trackPageView(name);
  // 页面别名映射（统一路由名称）
  const pageAlias = { dream: 'dreams', checkin: 'habit' };
  if (pageAlias[name]) name = pageAlias[name];
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => {
    p.classList.remove('active', 'slide-in-right', 'slide-in-left', 'fade-in');
  });
  const p = document.getElementById('page-' + name);
  if (p) {
    p.classList.add('active');
    if (direction === 'back') p.classList.add('slide-in-left');
    else if (direction === 'forward') p.classList.add('slide-in-right');
    else p.classList.add('fade-in');
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (p.getAttribute('tabindex') !== '-1') p.setAttribute('tabindex', '-1');
      if (p.focus) p.focus({ preventScroll: true });
    }, 100);
    if (!direction) {
      // 避免连续重复压栈（Tab切换时）
      if (__pageHistory.length === 0 || __pageHistory[__pageHistory.length - 1] !== name) {
        __pageHistory.push(name);
        if (__pageHistory.length > 50) __pageHistory = __pageHistory.slice(-30); // 防止历史记录无限增长
      }
    }
  }
  document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
}
function goBack() {
  if (__pageHistory.length > 1) {
    __pageHistory.pop(); // remove current
    const prev = __pageHistory[__pageHistory.length - 1]; // peek, don't pop
    if (prev) showPage(prev, 'back');
  } else {
    goHome();
  }
}
  if (__pageHistory.length > 1) {
    __pageHistory.pop(); // remove current
    const prev = __pageHistory.pop(); // get previous
    if (prev) showPage(prev, 'back');
  } else {
    goHome();
  }
}
function goHome() {
  try { localStorage.setItem('cosmos_island_welcomed_v3', '1'); } catch(e) {}
  hideModal('test-modal');
  hideModal('persona-modal');
  hideModal('alert-modal');
  showPage('island');
  __pageHistory = ['island'];
  updateTimeAndWeather();
  updateNavActive('home');
}
function updateNavActive(active) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const el = document.getElementById('nav-' + active);
  if (el) el.classList.add('active');
}
function renderMeTab() {
  const energyEl = document.getElementById('me-energy');
  if (energyEl) energyEl.textContent = state.energy || 0;
  const wishesEl = document.getElementById('me-wishes');
  if (wishesEl) wishesEl.textContent = state.wishes ? state.wishes.length : 0;
  const flowersEl = document.getElementById('me-flowers');
  const doneFlowers = (state.garden && state.garden.flowers) ? state.garden.flowers.filter(f => f.done).length : 0;
  if (flowersEl) flowersEl.textContent = doneFlowers;
  const badgesEl = document.getElementById('me-badges');
  const badgeCount = typeof getUnlockedBadges === 'function' ? getUnlockedBadges().length : (state.badges ? state.badges.length : 0);
  if (badgesEl) badgesEl.textContent = badgeCount;
  const levelEl = document.getElementById('me-level');
  if (levelEl) levelEl.textContent = typeof getLevel === 'function' ? getLevel() : (state.level || '新手');
  const personaEl = document.getElementById('me-persona-name');
  if (personaEl) {
    const persona = PERSONAS ? PERSONAS.find(x => x.id === state.mainPersona) : null;
    if (persona) {
      personaEl.textContent = persona.name;
      personaEl.style.opacity = '1';
    } else {
      personaEl.textContent = '待解锁';
      personaEl.style.opacity = '0.5';
    }
  }
  const personaCard = document.getElementById('me-persona-card');
  if (personaCard) {
    const p = PERSONAS ? PERSONAS.find(x => x.id === state.mainPersona) : null;
    if (p) {
      personaCard.innerHTML = `<div class="text-center py-4"><div class="text-2xl mb-1">${p.flower || '👸'}</div><div class="font-medium text-sm" style="color:var(--theme-text)">${p.name || '花公主'}</div><div class="text-xs mt-1" style="color:var(--text-mute)">${p.trait || '你的专属花公主身份'}</div></div>`;
    }
  }
}
function switchTab(tab) {
  const pageMap = {
    island: 'island',
    tools: 'tools',
    library: 'library',
    journal: 'journal',
    me: 'me',
  };
  const page = pageMap[tab] || 'island';
  showPage(page);
  updateNavActive(tab);
  playSound('page');
  if (tab === 'library') renderLibrary();
  if (tab === 'journal') renderJournalTab();
  if (tab === 'me' && typeof renderMeTab === 'function') renderMeTab();
  if (tab === 'tools') renderToolsTab();
  if (tab === 'island') { updateHomeStats(); updateFortuneCard(); updateTimeAndWeather(); }
  if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
}
function switchQuestTab(tab) {
  const panels = ['tasks', 'timer', 'sprint', 'stats'];
  panels.forEach(p => {
    const panel = document.getElementById('quest-panel-' + p);
    const btn = document.getElementById('quest-tab-' + p);
    if (panel) panel.classList.toggle('hidden', p !== tab);
    if (btn) {
      if (p === tab) {
        btn.style.background = 'linear-gradient(135deg,#E8B5C8,#C8A5D8)';
        btn.style.color = 'white';
      } else {
        btn.style.background = 'rgba(184,169,201,0.12)';
        btn.style.color = 'var(--theme-text)';
      }
    }
  });
  if (tab === 'sprint' && typeof updateRadar === 'function') updateRadar();
}

function loadDataScript(src, retries = 2) {
  return new Promise((resolve, reject) => {
    const key = '__data_' + src.replace(/[^a-zA-Z0-9]/g, '_');
    if (window[key]) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { window[key] = true; resolve(); };
    s.onerror = () => {
      if (retries > 0) {
        setTimeout(() => loadDataScript(src, retries - 1).then(resolve).catch(reject), 800);
      } else {
        console.warn('Data script failed:', src);
        resolve(); // graceful degradation
      }
    };
    document.head.appendChild(s);
  });
}
const __chunkCache = {};
async function loadChunk(name, retries = 2) {
  if (__chunkCache[name]) return __chunkCache[name];
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './js/chunks/' + name + '.js?v=' + Date.now();
    script.onload = () => { __chunkCache[name] = true; resolve(true); };
    script.onerror = () => {
      if (retries > 0) {
        setTimeout(() => loadChunk(name, retries - 1).then(resolve).catch(reject), 800);
      } else { showChunkError(name); reject(new Error('Failed: ' + name)); }
    };
    document.head.appendChild(script);
  });
}
function showChunkError(name) {
  const el = document.getElementById('chunk-error-modal');
  if (el) {
    setText('chunk-error-name', name);
    showModal('chunk-error-modal');
  } else {
    showToast('模块加载失败，点击重试 🔄');
  }
}
function retryLoadChunk(name) {
  hideModal('chunk-error-modal');
  delete __chunkCache[name];
  loadChunk(name).then(() => {
    showToast('✨ 加载成功！');
    if (name === 'tarot') { showPage('tarot'); renderTarot(); }
    if (name === 'garden') { showPage('garden'); renderGarden(); }
    if (name === 'diary') { showPage('diary'); renderDiary(); }
    if (name === 'library') { showPage('library'); switchTab('library'); renderLibrary(); }
    if (name === 'cloud') { showPage('cloud'); renderCloud(); }
    if (name === 'stars') { showPage('stars'); renderStars(); }
    if (name === 'wishwall') { showPage('wishwall'); renderWishwall(); }
    if (name === 'manifest') { showPage('369'); init369(); }
    if (name === 'quest') { showPage('quest'); if (typeof initQuestModule === 'function') initQuestModule(); }
    if (name === 'tools') { showPage('community'); renderCommunityFeed(); }
    if (name === 'tools') { showPage('community'); renderCommunityFeed(); }
  }).catch(() => showToast('重试失败，请检查网络'));
}
function openModule(name) {
  showPage(name);
  initAudio();
  playSound('page');
  if (name === 'temple') renderTemple();
  if (name === 'tower') renderTower();
  if (name === 'stars') { loadChunk('stars').then(() => renderStars()); return; }
  if (name === 'cloud') { loadDataScript('data/guides.js').then(() => loadDataScript('data/sats_guides.js')).then(() => loadChunk('cloud')).then(() => renderCloud()); return; }
  if (name === 'garden') { loadChunk('garden').then(() => renderGarden()); return; }
  if (name === 'diary') { loadChunk('diary').then(() => renderDiary()); return; }
  if (name === 'library') { loadDataScript('data/books.js').then(() => loadDataScript('data/movie_library.js')).then(() => loadDataScript('data/courses.js')).then(() => loadDataScript('data/methods.js')).then(() => loadDataScript('data/guides.js')).then(() => loadChunk('library')).then(() => { switchTab('library'); renderLibrary(); }); return; }
  if (name === 'sky') { switchTab('me'); return; }
  if (name === 'wishwall') { loadChunk('wishwall').then(() => renderWishWall()); return; }
  if (name === 'growth') renderGrowth();
  if (name === 'tarot') { loadDataScript('data/tarot_cards.js').then(() => loadChunk('tarot')).then(() => renderTarot()); return; }
  if (name === 'plans') renderPlans();
  if (name === 'timer') renderTimer();
  if (name === 'health') { showPage('health'); initHealth(); return; }
  if (name === 'stats') { showPage('stats'); initStats(); return; }
  if (name === 'cleanup') { showPage('cleanup'); initCleanup(); return; }
  if (name === 'about') { showPage('about'); initAbout(); return; }
  if (name === '369') { loadChunk('manifest').then(() => { showPage('369'); init369(); }); return; }
  if (name === '55x5') { loadChunk('manifest').then(() => { showPage('55x5'); init55x5(); }); return; }
  if (name === 'signs') { loadChunk('manifest').then(() => { showPage('signs'); initSigns(); }); return; }
  if (name === 'wheel') { loadChunk('manifest').then(() => { showPage('wheel'); initWheel(); }); return; }
  if (name === '68sec') { loadChunk('manifest').then(() => { showPage('68sec'); init68sec(); }); return; }
  if (name === 'prosperity') { showPage('prosperity'); initProsperity(); return; }
  if (name === 'emoscale') { showPage('emoscale'); initEmoscale(); return; }
  if (name === 'pillow') { showPage('pillow'); initPillow(); return; }
  if (name === 'placemat') { showPage('placemat'); initPlacemat(); return; }
  if (name === 'remember') { showPage('remember'); initRemember(); return; }
  if (name === 'creationbox') { showPage('creationbox'); initCreationBox(); return; }
  if (name === 'rampage') { showPage('rampage'); initRampage(); return; }
  if (name === 'treasurebox') { loadDataScript('data/treasure_tools.js').then(() => { showPage('treasurebox'); initTreasureBox(); }); return; }
  if (name === 'quest') { loadChunk('quest').then(() => { showPage('quest'); if (typeof initQuestModule === 'function') initQuestModule(); }); return; }
  if (name === 'timeline') { showPage('timeline'); initTimeline(); return; }
  if (name === 'manifest-report') { showPage('manifest-report'); initManifestReport(); return; }
  if (name === 'affirm-loop') { showPage('affirm-loop'); initAffirmLoop(); return; }
  if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
}
function renderToolsTab() {
  const day = new Date().getDay();
  const tips = [
    { text: '今天适合做SATS冥想。睡前花5分钟，视觉化你最想实现的愿望，带着那种满足感睡着～', action: 'cloud' },
    { text: '今天适合清理信念。找出一个困扰你的负面想法，用CBT方法拆解它～', action: 'tower' },
    { text: '今天适合写愿望。用BE-DO-HAVE模型，把你的愿望写得清清楚楚～', action: 'stars' },
    { text: '今天适合做修正法。找一件让你不舒服的事，在想象中把它改写成完美结局～', action: 'revision' },
    { text: '今天适合精神节食。监控你的每一个念头，只允许美好的想法进入～', action: 'diet' },
    { text: '今天适合听肯定语。选一个你最需要的主题，反复听，直到你相信～', action: 'affirm' },
    { text: '今天适合感恩。写下10件你感恩的小事，感受那份丰盛～', action: 'diary' },
  ];
  const tip = tips[day];
  const el = document.getElementById('daily-tip-text');
  if (el) el.textContent = tip.text;
}
function renderJournalTab() {
  const wishesEl = document.getElementById('journal-stat-wishes');
  const purifyEl = document.getElementById('journal-stat-purify');
  const flowersEl = document.getElementById('journal-stat-flowers');
  const daysEl = document.getElementById('journal-stat-days');
  if (wishesEl) wishesEl.textContent = state.wishes.length;
  if (purifyEl) purifyEl.textContent = state.purify.total || 0;
  if (flowersEl) flowersEl.textContent = (state.garden.flowers || []).filter(f => f.done).length;
  const start = state.startDate ? new Date(state.startDate) : new Date(); if (isNaN(start.getTime())) start = new Date();
  const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  if (daysEl) daysEl.textContent = days;
  const list = document.getElementById('journal-habit-list');
  if (list && state.habits && state.habits.length > 0) {
    const today = getTodayStr();
    list.innerHTML = state.habits.slice(0, 5).map(h => {
      const done = (h.checkins && h.checkins[today]);
      return `
        <div class="flex items-center gap-2 p-2 rounded-xl ${done ? 'opacity-60' : ''}" style="background:rgba(184,169,201,0.08)" onclick="toggleHabitCheckin('${h.id}')">
          <div class="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-xs" style="background:${done ? 'linear-gradient(135deg, #D4B5C7, #B8A9C9)' : 'white'}; color:${done ? 'white' : '#D4C5E0'}; border:1.5px solid ${done ? 'transparent' : '#D4C5E0'}">
            ${done ? '✓' : ''}
          </div>
          <span class="text-xs ${done ? 'line-through' : ''}" style="color:var(--theme-text)">${h.name}</span>
        </div>
      `;
    }).join('');
  }
}
function openRevision() {
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-breath">🕊️</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">修正法 Revision</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.6">在想象中改写过去，释放负面记忆</p>
    </div>
    <div class="space-y-3 text-sm" style="color:var(--theme-text); opacity:0.8">
      <div class="p-3 rounded-xl" style="background:rgba(184,169,201,0.1)">
        <div class="font-medium mb-1 text-xs" style="color:#8B7E9C">💡 什么是修正法？</div>
        <p class="text-xs leading-relaxed">内维尔戈达德最核心的方法之一。过去不决定未来，你对过去的看法才影响现在。在想象中改写一件让你受伤的事，给它一个美好的结局，就能释放它对你的负面影响。</p>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <div class="font-medium mb-2 text-xs" style="color:#B8859C">📝 具体步骤</div>
        <ol class="text-xs space-y-2 list-decimal list-inside leading-relaxed">
          <li>选一件让你不舒服/遗憾/受伤的事（从小事开始练）</li>
          <li>闭上眼睛，深呼吸，让身体放松下来</li>
          <li>在想象中回到那个场景，看到当时的自己</li>
          <li>把事情的发展改成你想要的样子，越细节越好</li>
          <li>感受那个美好结局带来的轻松、释然、满足的感觉</li>
          <li>重复3-5遍，直到你想起这件事时不再有情绪波动</li>
        </ol>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(245,230,200,0.25)">
        <div class="font-medium mb-1 text-xs" style="color:#B8955A">💖 小提示</div>
        <p class="text-xs leading-relaxed">不用追求「真实」，你要的是「感觉」。只要你在想象中真的感受到了美好结局的感觉，它就已经在能量层面被改写了。</p>
      </div>
    </div>
    <button onclick="closeBookModal(); openModule('cloud')" class="soft-btn btn-primary w-full mt-4 py-2.5 text-sm font-title">
      ☁️ 去冥想中练习
    </button>
  `;
  showModal('book-modal');
  playSound('chime');
}
function openAffirmRadio() {
  const cats = Object.keys(AFFIRMATIONS);
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-breath">🎵</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">肯定语电台</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.6">选一个主题，听一听属于你的肯定语</p>
    </div>
    <div class="space-y-2" id="affirm-radio-list">
      ${cats.map(cat => {
        const catData = AFFIRMATIONS[cat];
        const total = Object.values(catData.subs).reduce((sum, s) => sum + s.list.length, 0);
        return `
          <div class="p-3 rounded-xl card-hover cursor-pointer flex items-center gap-3" style="background:rgba(184,169,201,0.08)" onclick="showAffirmSubcats('${cat}')">
            <div class="text-2xl shrink-0">${catData.name.split(' ')[0]}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium" style="color:var(--theme-text)">${catData.name.split(' ')[1] || catData.name}</div>
              <div class="text-[10px]" style="color:var(--theme-text); opacity:0.5">${total} 条肯定语 · ${Object.keys(catData.subs).length} 个分类</div>
            </div>
            <div class="text-lg opacity-40">▶️</div>
          </div>
        `;
      }).join('')}
    </div>
    <div id="affirm-radio-subcats" class="hidden mt-3 space-y-2"></div>
    <div id="affirm-player" class="hidden mt-4 p-4 rounded-2xl text-center" style="background:linear-gradient(135deg, rgba(240,213,224,0.2), rgba(184,169,201,0.15))">
      <div class="text-3xl mb-2 animate-breath">💖</div>
      <div class="text-sm font-medium mb-1" style="color:var(--theme-text)" id="now-playing-cat">正在播放</div>
      <div class="text-base font-title py-3" style="color:#8B7E9C" id="now-playing-text"></div>
      <div class="flex justify-center gap-2 mt-2">
        <button onclick="prevAffirm()" class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.5)">⏮️</button>
        <button onclick="toggleAffirmPlay()" class="w-12 h-12 rounded-full flex items-center justify-center text-lg" style="background:linear-gradient(135deg, #D4B5C7, #B8A9C9); color:white" id="affirm-play-btn">▶️</button>
        <button onclick="nextAffirm()" class="w-10 h-10 rounded-full flex items-center justify-center" style="background:rgba(255,255,255,0.5)">⏭️</button>
      </div>
    </div>
    <button onclick="closeBookModal()" class="w-full mt-4 py-2.5 text-sm font-title rounded-xl" style="background:rgba(184,169,201,0.1); color:var(--theme-text)">
      关闭
    </button>
  `;
  showModal('book-modal');
  playSound('sparkle');
}
function showAffirmSubcats(cat) {
  const catData = AFFIRMATIONS[cat];
  const subcatsEl = document.getElementById('affirm-radio-subcats');
  subcatsEl.classList.remove('hidden');
  subcatsEl.innerHTML = `
    <div class="text-xs font-medium mb-2" style="color:var(--theme-text); opacity:0.6">选择子分类：</div>
    ${Object.entries(catData.subs).map(([key, sub]) => `
      <div class="p-2.5 rounded-xl card-hover cursor-pointer flex items-center gap-2" style="background:rgba(240,213,224,0.1)" onclick="playAffirmSubcat('${cat}', '${key}')">
        <div class="text-sm shrink-0">💫</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium" style="color:var(--theme-text)">${sub.name}</div>
          <div class="text-[10px]" style="color:var(--theme-text); opacity:0.5">${sub.list.length} 条</div>
        </div>
        <div class="text-sm opacity-40">▶️</div>
      </div>
    `).join('')}
    <button onclick="playAffirmCategory('${cat}')" class="w-full p-2.5 rounded-xl text-xs font-medium" style="background:linear-gradient(135deg, #D4B5C7, #B8A9C9); color:white">
      🎵 播放全部分类
    </button>
  `;
  playSound('ding');
}
let affirmPlayer = { cat: '', sub: '', list: [], idx: 0, playing: false, timer: null };
function playAffirmCategory(cat) {
  affirmPlayer.cat = cat;
  affirmPlayer.sub = '';
  const catData = AFFIRMATIONS[cat];
  if (!catData || !catData.subs) return;
  let allList = [];
  Object.values(catData.subs).forEach(sub => { allList = allList.concat(sub.list); });
  affirmPlayer.list = allList;
  affirmPlayer.idx = 0;
  remCls('affirm-player', 'hidden');
  setText('now-playing-cat', catData.name);
  showAffirmText();
  startAffirmPlay();
}
function playAffirmSubcat(cat, sub) {
  affirmPlayer.cat = cat;
  affirmPlayer.sub = sub;
  const catData = AFFIRMATIONS[cat];
  const subData = catData && catData.subs[sub];
  if (!subData) return;
  affirmPlayer.list = subData.list;
  affirmPlayer.idx = 0;
  remCls('affirm-player', 'hidden');
  setText('now-playing-cat', catData.name + ' · ' + subData.name);
  showAffirmText();
  startAffirmPlay();
}
function showAffirmText() {
  if (affirmPlayer.list.length === 0) return;
  setText('now-playing-text', affirmPlayer.list[affirmPlayer.idx]);
  if (state.voiceOn) speak(affirmPlayer.list[affirmPlayer.idx], { rate: 0.9 });
}
function nextAffirm() {
  affirmPlayer.idx = (affirmPlayer.idx + 1) % affirmPlayer.list.length;
  showAffirmText();
}
function prevAffirm() {
  affirmPlayer.idx = (affirmPlayer.idx - 1 + affirmPlayer.list.length) % affirmPlayer.list.length;
  showAffirmText();
}
function toggleAffirmPlay() {
  if (affirmPlayer.playing) {
    clearInterval(affirmPlayer.timer);
    affirmPlayer.playing = false;
    setText('affirm-play-btn', '▶️');
  } else {
    startAffirmPlay();
  }
}
function startAffirmPlay() {
  affirmPlayer.playing = true;
  setText('affirm-play-btn', '⏸️');
  clearInterval(affirmPlayer.timer);
  affirmPlayer.timer = setInterval(() => {
    nextAffirm();
  }, 6000);
}
function openMentalDiet() {
  const today = getTodayStr();
  const dietLog = state.mentalDiet || {};
  const todayLog = dietLog[today] || { negative: 0, caught: 0, replaced: 0 };
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2 animate-breath">🧠</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">精神节食</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.6">监控你的每一个念头，只让美好的想法留下</p>
    </div>
    <div class="grid grid-cols-3 gap-2 mb-4 text-center">
      <div class="p-3 rounded-xl" style="background:rgba(245,213,213,0.2)">
        <div class="text-xl font-title" style="color:#D4A5B8" id="diet-negative">${todayLog.negative}</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">负面念头</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(245,230,200,0.3)">
        <div class="text-xl font-title" style="color:#D4A85A" id="diet-caught">${todayLog.caught}</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">及时觉察</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(136,200,152,0.2)">
        <div class="text-xl font-title" style="color:#5A9C6A" id="diet-replaced">${todayLog.replaced}</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">成功替换</div>
      </div>
    </div>
    <div class="space-y-2 mb-4">
      <button onclick="logDiet('caught')" class="w-full p-3 rounded-xl text-sm font-medium card-hover" style="background:rgba(245,230,200,0.25); color:var(--theme-text)">
        🚨 我觉察到了一个负面念头
      </button>
      <button onclick="logDiet('replaced')" class="w-full p-3 rounded-xl text-sm font-medium card-hover" style="background:rgba(136,200,152,0.2); color:var(--theme-text)">
        ✨ 我成功替换成正面想法了
      </button>
    </div>
    <div class="p-3 rounded-xl" style="background:rgba(184,169,201,0.1)">
      <div class="text-xs font-medium mb-1" style="color:#8B7E9C">💡 精神节食三步法</div>
      <ol class="text-[11px] space-y-1 list-decimal list-inside" style="color:var(--theme-text); opacity:0.75">
        <li><b>觉察</b>：注意到自己在想负面的事情</li>
        <li><b>叫停</b>：对自己说「停，我不继续想了」</li>
        <li><b>替换</b>：立刻换成一个正面的想法或画面</li>
      </ol>
    </div>
    <button onclick="closeBookModal()" class="w-full mt-4 py-2.5 text-sm font-title rounded-xl" style="background:rgba(184,169,201,0.1); color:var(--theme-text)">
      关闭
    </button>
  `;
  showModal('book-modal');
  playSound('ding');
}
function logDiet(type) {
  const today = getTodayStr();
  if (!state.mentalDiet) state.mentalDiet = {};
  if (!state.mentalDiet[today]) state.mentalDiet[today] = { negative: 0, caught: 0, replaced: 0 };
  state.mentalDiet[today][type] = (state.mentalDiet[today][type] || 0) + 1;
  if (type === 'caught') state.mentalDiet[today].negative++;
  saveState();
  const t = state.mentalDiet[today];
  setText('diet-negative', t.negative);
  setText('diet-caught', t.caught);
  setText('diet-replaced', t.replaced);
  if (type === 'replaced') {
    showToast('✨ 太棒了！你又赢了一次');
    playSound('sparkle');
  } else {
    showToast('👍 觉察就是改变的开始');
    playSound('ding');
  }
}
function openCrystalPage() { showToast('💎 继续打卡解锁更多星光水晶～'); }
function openAffirmCollection() { openAffirmRadio(); }
function openCardCollection() { showToast('🎴 完成任务获得治愈卡片～'); }
function openSettings() {
  showModal('settings-modal');
  initSettingsUI();
  playSound('page');
}
function closeSettings() {
  hideModal('settings-modal');
  playSound('page');
}
function initSettingsUI() {
  setText('vol-music-val', state.volumes.music + '%');
  const musicSlider = document.querySelector('#vol-music-val + input');
  if (musicSlider) musicSlider.value = state.volumes.music;
  const sliders = document.querySelectorAll('#settings-modal input[type="range"]');
  if (sliders[0]) sliders[0].value = state.volumes.music;
  if (sliders[1]) sliders[1].value = state.volumes.sfx;
  const toggles = {
    'toggle-voice': state.voiceOn,
    'toggle-autoplay': state.autoplay,
    'toggle-animation': state.animation,
    'toggle-darkmode': state.darkMode,
    'toggle-password': state.passwordEnabled,
    'toggle-localonly': true,
    'toggle-remind': state.remindCheckin,
    'toggle-notification': state.notifications && Notification.permission === 'granted',
  };
  for (const [id, val] of Object.entries(toggles)) {
    const el = document.getElementById(id);
    if (el) {
      if (val) el.classList.add('on');
      else el.classList.remove('on');
    }
  }
  setText('password-status', state.password ? '已设置' : '未设置');
  const pwdToggle = document.getElementById('toggle-password');
  if (state.passwordEnabled) pwdToggle.classList.add('on');
  const mt = document.getElementById('meditation-time');
  const at = document.getElementById('affirm-time');
  if (mt) mt.value = state.meditationTime;
  if (at) at.value = state.affirmTime;
}
function toggleSetting(key, el) {
  const map = {
    autoplay: 'autoplay',
    animation: 'animation',
    darkmode: 'darkMode',
    password: 'passwordEnabled',
    localonly: 'localOnly',
    remind: 'remindCheckin',
  };
  const stateKey = map[key] || key;
  if (key === 'password') {
    if (!state.password) {
      setupPassword();
      return;
    }
    state.passwordEnabled = !state.passwordEnabled;
  } else if (key === 'darkmode') {
    state.darkMode = !state.darkMode;
    if (state.darkMode) {
      if (document.body) document.body.classList.add('dark');
    } else {
      if (document.body) document.body.classList.remove('dark');
    }
    updateSkyBackground();
  } else if (key === 'animation') {
    state.animation = !state.animation;
  } else if (key === 'voiceOn') {
    state.voiceOn = !state.voiceOn;
  } else if (key === 'autoplay') {
    state.autoplay = !state.autoplay;
  } else if (key === 'remind') {
    state.remindCheckin = !state.remindCheckin;
    if (state.remindCheckin) {
      showToast('已开启打卡提醒 ⏰');
    }
  }
  el.classList.toggle('on');
  saveState();
  playSound('ding');
}

/* ===== C8: 每日推送/提醒 ===== */
function toggleNotificationPermission(el) {
  if (!('Notification' in window)) {
    showToast('您的浏览器不支持通知功能');
    return;
  }
  if (Notification.permission === 'granted') {
    state.notifications = !state.notifications;
    el.classList.toggle('on', state.notifications);
    saveState();
    if (state.notifications) {
      showToast('🔔 每日提醒已开启');
      scheduleDailyReminders();
    } else {
      showToast('🔕 每日提醒已关闭');
    }
  } else {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        state.notifications = true;
        el.classList.add('on');
        saveState();
        showToast('🔔 每日提醒已开启');
        scheduleDailyReminders();
        sendNotification('✨ 许愿岛', '每日提醒已开启，我会陪伴你度过每一天～');
      } else {
        showToast('需要通知权限才能开启提醒');
      }
    });
  }
}
function sendNotification(title, body, tag = 'default') {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag, icon: './apple-touch-icon.png', badge: './apple-touch-icon.png' });
  } catch(e) { console.warn('Notification failed:', e); }
}
function scheduleDailyReminders() {
  if (!state.notifications) return;
  // 清除旧的定时器
  if (window.__morningTimer) clearTimeout(window.__morningTimer);
  if (window.__eveningTimer) clearTimeout(window.__eveningTimer);
  const now = new Date();
  const morning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0);
  const evening = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0, 0);
  if (morning <= now) morning.setDate(morning.getDate() + 1);
  if (evening <= now) evening.setDate(evening.getDate() + 1);
  const morningDelay = morning - now;
  const eveningDelay = evening - now;
  window.__morningTimer = setTimeout(() => {
    const affirmations = ['今天也是你成长的好日子 ✨', '你值得拥有世间一切美好', '相信自己，你可以创造任何奇迹', '宇宙正在为你安排最美好的事情'];
    const msg = affirmations[Math.floor(Math.random() * affirmations.length)];
    sendNotification('☀️ 早安公主', msg, 'morning');
    scheduleDailyReminders(); // 重新调度下一天
  }, morningDelay);
  window.__eveningTimer = setTimeout(() => {
    sendNotification('🌙 晚安公主', '今天过得怎么样？记得写下今天的日记和感恩清单哦～', 'evening');
  }, eveningDelay);
}

function selectVoice(type, el) {
  state.voiceType = type;
  saveState();
  document.querySelectorAll('.voice-option').forEach(v => v.classList.remove('active'));
  el.classList.add('active');
  playSound('ding');
  speak('你好呀公主殿下～气泡已换成' + VOICE_OPTIONS[type].name + '风格啦✨');
}
let pinMode = 'set'; // set / confirm / unlock
let pinCurrent = '';
let pinTemp = '';
function setupPassword() {
  pinMode = 'set';
  pinCurrent = '';
  pinTemp = '';
  updatePinDots();
  setText('pin-hint', '请设置4位密码');
  showModal('password-modal');
  closeSettings();
}
function enterPin(num) {
  if (pinCurrent.length >= 4) return;
  pinCurrent += num;
  updatePinDots();
  playSound('type');
  if (pinCurrent.length === 4) {
    setTimeout(() => {
      if (pinMode === 'set') {
        pinTemp = pinCurrent;
        pinCurrent = '';
        pinMode = 'confirm';
        updatePinDots();
        setText('pin-hint', '请再次输入密码确认');
      } else if (pinMode === 'confirm') {
        if (pinCurrent === pinTemp) {
          state.password = pinCurrent;
          state.passwordEnabled = true;
          saveState();
          closePasswordModal();
          showToast('密码设置成功 🔐');
          playSound('chime');
          openSettings();
        } else {
          setText('pin-hint', '两次输入不一致，请重新设置');
          pinCurrent = '';
          pinTemp = '';
          pinMode = 'set';
          updatePinDots();
          setTimeout(() => {
            setText('pin-hint', '请设置4位密码');
          }, 1500);
        }
      }
    }, 300);
  }
}
function deletePin() {
  if (pinCurrent.length > 0) {
    pinCurrent = pinCurrent.slice(0, -1);
    updatePinDots();
  }
}
function updatePinDots() {
  const dots = document.querySelectorAll('#pin-dots .pin-dot');
  dots.forEach((d, i) => {
    if (i < pinCurrent.length) d.classList.add('filled');
    else d.classList.remove('filled');
  });
}
function closePasswordModal() {
  hideModal('password-modal');
}
function togglePassword() {
  if (!state.password) {
    setupPassword();
    return;
  }
  state.passwordEnabled = !state.passwordEnabled;
  saveState();
  const el = document.getElementById('toggle-password');
  el.classList.toggle('on');
  setText('password-status', state.passwordEnabled ? '已开启' : '已关闭');
  playSound('ding');
}
function saveReminderTime() {
  const mt = document.getElementById('meditation-time');
  const at = document.getElementById('affirm-time');
  if (mt) state.meditationTime = mt.value;
  if (at) state.affirmTime = at.value;
  saveState();
  showToast('提醒时间已保存 ⏰');
}
function exportData() {
  try {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cosmos-island-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出 📤');
  } catch(e) {
    showToast('数据导出失败: ' + (e.message || '未知错误'));
  }
}

function clearCache() {
  if (confirm('确定要清除所有数据吗？这将删除你所有的记录哦～')) {
    try { localStorage.removeItem('cosmos_island_state_v3'); } catch(e) {}
    try { location.reload(); } catch(e) { showToast('请手动刷新页面'); }
  }
}
function showAbout() {
  showAlert('🏝️', '关于许愿岛',
    '许愿岛 v2.0\n\n' +
    '温柔成长陪伴小天地\n\n' +
    '基于内维尔假设法则、约瑟夫墨菲潜意识理论、\n' +
    '亚伯拉罕情绪刻度、CBT认知行为疗法\n\n' +
    '愿每一位公主都能遇见更闪耀的自己 ✨\n\n' +
    'Made with 💖'
  );
}
let progressChart = null;
let emotionChart = null;
let actionChart = null;
function openGrowthPage() {
  showPage('growth');
  updateNavActive('journal');
  setTimeout(() => {
    renderGrowth();
    initCharts();
  }, 100);
}
function renderGrowth() {
  const start = state.startDate ? new Date(state.startDate) : new Date(); if (isNaN(start.getTime())) start = new Date();
  const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  setText('growth-days', days);
  setText('growth-wishes', state.wishes.length);
  setText('growth-manifested', state.wishes.filter(w => w.done).length);
  setText('growth-purify', state.purify.total || 0);
  const milestones = [
    { id: 'milestone-1', done: state.wishes.filter(w => w.done).length > 0 },
    { id: 'milestone-2', done: state.purify.streak >= 21 },
    { id: 'milestone-3', done: (state.garden.flowers || []).filter(f => f.done).length >= 50 },
    { id: 'milestone-4', done: state.courseProgress.length >= 7 },
  ];
  milestones.forEach(m => {
    const el = document.getElementById(m.id);
    if (el) {
      el.textContent = m.done ? '✅ 已达成' : '未达成';
      el.style.color = m.done ? '#88C898' : '';
      el.style.opacity = m.done ? '1' : '0.4';
    }
  });
  renderMoodReport('week');
}
function switchMoodReport(range, btn) {
  document.querySelectorAll('#report-week-btn, #report-month-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMoodReport(range);
}
function renderMoodReport(range) {
  const el = document.getElementById('mood-report-content');
  if (!el) return;
  const history = state.moodHistory || [];
  if (history.length === 0) {
    el.innerHTML = `<div class="text-center py-6 text-sm" style="color:var(--theme-text); opacity:0.4">还没有情绪花园，去首页记录一下吧～</div>`;
    return;
  }
  const days = range === 'week' ? 7 : 30;
  const recent = history.slice(0, days);
  const moodScores = { happy: 5, calm: 4, meh: 3, anxious: 2, sad: 1 };
  const avgScore = recent.reduce((sum, m) => sum + (moodScores[m.mood] || 3), 0) / recent.length;
  const avgMood = avgScore >= 4.5 ? '开心' : avgScore >= 3.5 ? '平静' : avgScore >= 2.5 ? '一般' : avgScore >= 1.5 ? '有点焦虑' : '低落';
  const counts = {};
  recent.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
  const topMood = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
  const topMoodName = topMood ? MOOD_NAMES[topMood[0]] : '平静';
  let advice = '';
  if (avgScore >= 4) {
    advice = '最近心情很不错呀～继续保持这份好心情，你闪闪发光的样子真美 ✨';
  } else if (avgScore >= 3) {
    advice = '情绪平稳就是最好的状态～不追求每天都开心，平静也是一种力量 💖';
  } else if (avgScore >= 2) {
    advice = '最近是不是有点累呀？没关系的，情绪有起伏很正常。多抱抱自己，去云端冥想做个深呼吸吧 🧘';
  } else {
    advice = '亲爱的，这段时间辛苦你了。难过的时候不用硬撑，允许自己哭，允许自己休息。你已经很棒了，我一直陪着你 🌸';
  }
  el.innerHTML = `
    <div class="grid grid-cols-3 gap-3 mb-4 text-center">
      <div class="p-3 rounded-xl" style="background:rgba(245,230,200,0.2)">
        <div class="text-xl font-title" style="color:#D4A85A">${avgMood}</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">平均情绪</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(212,181,199,0.15)">
        <div class="text-xl font-title" style="color:#8B7E9C">${topMoodName}</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">出现最多</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(136,200,152,0.15)">
        <div class="text-xl font-title" style="color:#5A9C6A">${recent.length}天</div>
        <div class="text-[10px]" style="color:var(--theme-text); opacity:0.6">记录天数</div>
      </div>
    </div>
    <div class="p-4 rounded-xl" style="background:linear-gradient(135deg, rgba(240,213,224,0.15), rgba(184,169,201,0.1))">
      <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">💌 给你的悄悄话</div>
      <div class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.8">${advice}</div>
    </div>
  `;
}
function initCharts() {
  if (typeof Chart === 'undefined') return;
  const days = 7;
  const labels = [];
  const progressData = [];
  const emotionData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth()+1}/${d.getDate()}`);
    const progress = Math.min(100, (state.purify.total * 3 + state.wishes.length * 5 + state.satsCount * 8) * (1 - i * 0.1));
    progressData.push(Math.max(0, Math.round(progress)));
    const baseEmotion = state.emotionLevel || 50;
    emotionData.push(Math.max(10, Math.min(100, baseEmotion + (Math.random() - 0.5) * 20)));
  }
  const pCtx = document.getElementById('progress-chart');
  if (pCtx && !progressChart && typeof Chart !== 'undefined') {
    progressChart = new Chart(pCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '成长进度',
          data: progressData,
          borderColor: '#B8A9C9',
          backgroundColor: 'rgba(184, 169, 201, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#B8A9C9',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(184,169,201,0.1)' }, ticks: { color: 'rgba(93,78,109,0.5)' } },
          x: { grid: { display: false }, ticks: { color: 'rgba(93,78,109,0.5)' } }
        }
      }
    });
  }
  const eCtx = document.getElementById('emotion-chart');
  if (eCtx && !emotionChart && typeof Chart !== 'undefined') {
    emotionChart = new Chart(eCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: '情绪指数',
          data: emotionData,
          borderColor: '#D4A5B8',
          backgroundColor: 'rgba(212, 165, 184, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#D4A5B8',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(184,169,201,0.1)' }, ticks: { color: 'rgba(93,78,109,0.5)' } },
          x: { grid: { display: false }, ticks: { color: 'rgba(93,78,109,0.5)' } }
        }
      }
    });
  }
  const aCtx = document.getElementById('action-chart');
  if (aCtx && !actionChart && typeof Chart !== 'undefined') {
    const flowers = state.garden.flowers || [];
    const done = flowers.filter(f => f.done);
    const countByType = { love: 0, money: 0, beauty: 0, heal: 0, study: 0, life: 0 };
    done.forEach(f => { countByType[f.type] = (countByType[f.type] || 0) + 1; });
    actionChart = new Chart(aCtx, {
      type: 'doughnut',
      data: {
        labels: ['恋爱', '财富', '美貌', '疗愈', '学习', '生活'],
        datasets: [{
          data: [countByType.love, countByType.money, countByType.beauty, countByType.heal, countByType.study, countByType.life],
          backgroundColor: ['#D4A5B8', '#E8C87A', '#F0B5C5', '#88C898', '#9DB5C8', '#B8A9C9'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              font: { size: 11 },
              color: 'rgba(93,78,109,0.7)'
            }
          }
        }
      }
    });
  }
}
function updateGreeting() {
  const hours = new Date().getHours();
  let greeting = '';
  if (hours < 6) greeting = '夜深啦～';
  else if (hours < 11) greeting = '早上好呀～';
  else if (hours < 14) greeting = '中午好呀～';
  else if (hours < 18) greeting = '下午好呀～';
  else if (hours < 22) greeting = '晚上好呀～';
  else greeting = '夜深啦～';
  const el = document.getElementById('greeting-text');
  if (el) el.textContent = greeting;
  const nameEl = document.getElementById('greeting-name');
  if (nameEl) nameEl.textContent = state.nickname;
}
const MOOD_NAMES = { happy: '开心', calm: '平静', meh: '有点down', anxious: '焦虑', sad: '难过' };
const MOOD_EMOJIS = { happy: '😊', calm: '😌', meh: '😐', anxious: '😰', sad: '😢' };
const MOOD_TAGS = ['工作', '恋爱', '家庭', '自己', '其他'];
let moodTagSelected = [];
function recordMood(mood) {
  const today = getTodayStr();
  state.todayMood = { mood, date: today, tags: moodTagSelected, note: '' };
  if (!state.moodHistory) state.moodHistory = [];
  state.moodHistory = state.moodHistory.filter(m => m.date !== today);
  state.moodHistory.unshift({ mood, date: today, tags: moodTagSelected, note: '' });
  saveState();
  updateMoodDisplay();
  playSound('sparkle');
  addEnergy(3, '情绪花园');
  logActivity('mood', '情绪花园: ' + MOOD_NAMES[mood]);
  remCls('mood-detail', 'hidden');
  showToast(`记录了今天的${MOOD_NAMES[mood]}心情 💖`);
  if (mood === 'sad' || mood === 'anxious' || mood === 'meh') {
    setTimeout(() => {
      showAlert('💗', '抱抱你～', '难过的时候没关系的，要不要去云端冥想城堡做个静心呼吸？或者去信念净化塔看看是什么想法让你不开心～');
    }, 800);
  }
}
function toggleMoodTag(tag) {
  const idx = moodTagSelected.indexOf(tag);
  if (idx > -1) {
    moodTagSelected.splice(idx, 1);
  } else {
    moodTagSelected.push(tag);
  }
  document.querySelectorAll('.mood-tag').forEach(el => {
    const t = el.dataset.tag;
    if (moodTagSelected.includes(t)) {
      el.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
      el.style.color = 'white';
      el.style.opacity = '1';
    } else {
      el.style.background = '';
      el.style.color = '';
      el.style.opacity = '';
    }
  });
  const today = getTodayStr();
  if (state.todayMood && state.todayMood.date === today) {
    state.todayMood.tags = [...moodTagSelected];
    const histIdx = state.moodHistory.findIndex(m => m.date === today);
    if (histIdx > -1) state.moodHistory[histIdx].tags = [...moodTagSelected];
    saveState();
  }
  playSound('sparkle');
}
let moodNoteTimer = null;
function saveMoodNote() {
  clearTimeout(moodNoteTimer);
  const statusEl = document.getElementById('mood-save-status');
  if (statusEl) statusEl.textContent = '保存中...';
  moodNoteTimer = setTimeout(() => {
    const note = document.getElementById('mood-note')?.value || '';
    const today = getTodayStr();
    if (state.todayMood && state.todayMood.date === today) {
      state.todayMood.note = note;
      const histIdx = state.moodHistory.findIndex(m => m.date === today);
      if (histIdx > -1) state.moodHistory[histIdx].note = note;
      saveState();
    }
    if (statusEl) {
      statusEl.textContent = '✓ 已保存';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
    }
  }, 500);
}
function updateMoodDisplay() {
  const el = document.getElementById('today-mood-text');
  if (!el) return;
  if (state.todayMood && state.todayMood.date === getTodayStr()) {
    el.textContent = `今天：${MOOD_EMOJIS[state.todayMood.mood]} ${MOOD_NAMES[state.todayMood.mood]}`;
  } else {
    el.textContent = '还没记录';
  }
}
function refreshDailyAffirm() {
  let allAffirms = [];
  if (typeof AFFIRMATIONS !== 'undefined') {
    Object.values(AFFIRMATIONS).forEach(cat => {
      if (cat && cat.subs) {
        Object.values(cat.subs).forEach(sub => {
          if (sub && Array.isArray(sub.list)) {
            allAffirms = allAffirms.concat(sub.list);
          }
        });
      }
    });
  }
  if (allAffirms.length === 0) return;
  state.dailyAffirm = allAffirms[Math.floor(Math.random() * allAffirms.length)];
  saveState();
  const el = document.getElementById('daily-affirm-text');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = state.dailyAffirm;
      el.style.opacity = '1';
    }, 200);
  }
  playSound('chime');
}
function speakDailyAffirm() {
  speak(state.dailyAffirm);
  playSound('chime');
}
function checkDailyReset() {
  const today = getTodayStr();
  const lastReset = state.lastDailyReset;
  if (lastReset !== today) {
    state.todayDone = {};
    if (state.purify) state.purify.todayCount = 0;
    if (state.mentalDiet) state.mentalDiet.todayCount = 0;
    if (state.garden) state.garden.todayCount = 0;
    state.lastDailyReset = today;
    saveState();
  }
}
function checkReminders() {
  checkDailyReset();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const today = getTodayStr();
  if (state.remindCheckin && timeStr === state.affirmTime && !state.todayDone.affirmReminded) {
    state.todayDone.affirmReminded = true;
    saveState();
    const affirm = (state.affirmations.saved && state.affirmations.saved.length > 0)
      ? state.affirmations.saved[Math.floor(Math.random() * state.affirmations.saved.length)]
      : state.dailyAffirm;
    showAlert('💖', '今日肯定语', affirm);
    sendNativeNotification('💖 今日肯定语', affirm, 'affirm-daily');
    playSound('chime');
  }
  if (state.remindCheckin && timeStr === state.meditationTime && !state.todayDone.meditationReminded) {
    state.todayDone.meditationReminded = true;
    saveState();
    showAlert('🧘', '冥想时间到啦', '亲爱的公主，是时候来云端冥想城堡放松一下了～');
    sendNativeNotification('🧘 冥想提醒', '来做个冥想放松一下吧～');
    playSound('chime');
  }
  if (state.remindCheckin && timeStr === '20:00' && !state.todayDone.challengeReminded) {
    state.todayDone.challengeReminded = true;
    saveState();
    showAlert('💪', '成长挑战打卡提醒', '今天的21天成长挑战还没完成，坚持就是奇迹！');
    sendNativeNotification('💪 成长挑战打卡', '今天的21天成长挑战还没完成，坚持就是奇迹！');
    playSound('chime');
  }
}
function sendNativeNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        tag: tag || 'reminder',
        icon: '✨',
        badge: '✨',
        requireInteraction: false
      });
    }).catch(() => {
      new Notification(title, { body });
    });
  } else {
    new Notification(title, { body });
  }
}
let testState = null;
function renderTemple() {
  const el = document.getElementById('persona-preview');
  if (!el) return;
  el.innerHTML = PERSONAS.map(p => `
    <div class="text-center cursor-pointer card-hover" onclick="viewPersona('${p.id}')">
      <div class="w-full aspect-square rounded-2xl overflow-hidden mb-1 ${state.unlockedPersonas.includes(p.id) ? '' : 'grayscale opacity-30'}"
        style="background:linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2})">
        ${getFlowerSVG(p, 50)}
      </div>
      <div class="text-xs truncate" style="color:var(--theme-text)">${p.name}</div>
    </div>
  `).join('');
}
function startTest(type) {
  const testMap = {
    personality: { questions: PERSONALITY_TEST, scores: { action: 0, create: 0, empathy: 0, stable: 0, charm: 0 }, reward: 30 },
    personality_deep: { questions: PERSONALITY_TEST_DEEP, scores: { action: 0, create: 0, empathy: 0, stable: 0, charm: 0 }, reward: 80 },
    belief: { questions: BELIEF_TEST, scores: {}, reward: 30 },
    emotion: { questions: EMOTION_TEST, totalLevel: 0, reward: 20 },
  };
  const cfg = testMap[type];
  if (!cfg) { showToast('未知的测试类型'); return; }
  testState = { type, ...cfg, current: 0, answers: [] };
  testLock = false;
  testSelected = null;
  renderTestQ();
  showModal('test-modal');
  playSound('ding');
}
function renderTestQ() {
  const c = document.getElementById('test-content');
  if (!testState || !testState.questions || testState.current >= testState.questions.length) { finishTest(); return; }
  const q = testState.questions[testState.current];
  if (!q || !q.options || !Array.isArray(q.options) || q.options.length === 0) { finishTest(); return; }
  const total = testState.questions.length;
  const cur = testState.current + 1;
  const titleMap = {
    personality: '👑 成长人格测试 · 速测版',
    personality_deep: '💎 成长人格测试 · 深度版',
    belief: '🔍 限制性信念探测',
    emotion: '🌈 情绪刻度测试',
  };
  const optionsHtml = q.options.map((o, i) => {
    if (!o || typeof o.text !== 'string' || o.text.trim() === '') return '';
    return `
      <button onclick="selectTestOpt(${i})" class="option-card w-full text-left text-sm">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium" style="background:linear-gradient(135deg, #E8DEEF, #D4C5E0); color:#8B7E9C">${String.fromCharCode(65+i)}</span>
        ${escapeHtml(o.text)}
      </button>
    `;
  }).join('');
  c.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs" style="color:var(--theme-text); opacity:0.6">第 ${cur} / ${total} 题</span>
      <button onclick="closeTest()" class="text-lg" style="color:var(--theme-text); opacity:0.4">×</button>
    </div>
    <div class="w-full h-1.5 rounded-full overflow-hidden mb-5" style="background:rgba(184,169,201,0.12)">
      <div class="h-full progress-fill rounded-full" style="background:linear-gradient(90deg, #D4B5C7, #B8A9C9); width:${(cur/total)*100}%"></div>
    </div>
    <div class="text-center mb-2"><span class="text-xs" style="color:var(--theme-text); opacity:0.5">${titleMap[testState.type]}</span></div>
    <div class="crystal-ball mb-4">
      <div class="crystal-ball-inner animate-breath"></div>
      <div class="crystal-ball-highlight"></div>
    </div>
    <h3 class="font-title text-base mb-5 text-center" style="color:var(--theme-text)">${escapeHtml(q.q)}</h3>
    <div class="space-y-2.5 mb-6">
      ${optionsHtml}
    </div>
    <button id="test-next-btn" onclick="nextTestQ()" class="soft-btn btn-primary w-full py-3.5 text-base font-title" disabled style="opacity:0.5; transition:all 0.3s">
      ${cur === total ? '✨ 查看结果' : '下一题 →'}
    </button>
  `;
  if (state.voiceOn && state.autoplay) {
    setTimeout(() => speak(q.q, { rate: 0.95 }), 300);
  }
}
let testLock = false;
let testSelected = null;
function selectTestOpt(i) {
  if (testLock) return;
  const q = testState && testState.questions && testState.questions[testState.current];
  if (!q || !q.options || i < 0 || i >= q.options.length) return;
  testSelected = i;
  const opt = q.options[i];
  const btns = document.querySelectorAll('.option-card');
  btns.forEach((b, idx) => {
    if (idx === i) {
      b.classList.add('selected');
      b.style.borderColor = '#B8A9C9';
      b.style.background = 'linear-gradient(135deg, rgba(212,181,199,0.3), rgba(184,169,201,0.25))';
      b.style.boxShadow = '0 4px 14px rgba(184,169,201,0.25)';
    } else {
      b.classList.remove('selected');
      b.style.borderColor = '';
      b.style.background = '';
      b.style.boxShadow = '';
    }
  });
  const nextBtn = document.getElementById('test-next-btn');
  if (nextBtn) {
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
    nextBtn.style.transform = 'scale(1)';
  }
  playSound('ding');
}
function nextTestQ() {
  if (testSelected === null) { showToast('选一个选项哦～'); return; }
  if (testLock) return;
  testLock = true;
  const q = testState && testState.questions && testState.questions[testState.current];
  if (!q || !q.options || testSelected < 0 || testSelected >= q.options.length) { testLock = false; return; }
  const opt = q.options[testSelected];
  if (testState.type === 'personality' || testState.type === 'personality_deep') {
    const s = opt.scores;
    testState.scores.action += s.action;
    testState.scores.create += s.create;
    testState.scores.empathy += s.empathy;
    testState.scores.stable += s.stable;
    testState.scores.charm += s.charm;
  } else if (testState.type === 'belief') {
    const type = q.type;
    testState.scores[type] = (testState.scores[type] || 0) + opt.score;
  } else {
    testState.totalLevel += opt.level;
  }
  testState.answers.push({ q: q.q, a: opt.text });
  testState.current++;
  testSelected = null;
  if (testState.current >= testState.questions.length) {
    testLock = false;
    finishTest();
  } else {
    renderTestQ();
    testLock = false;
  }
}
function closeTest() {
  if (confirm('公主确定要退出测试吗？进度不会保存哦～')) {
    hideModal('test-modal');
    testState = null;
    testLock = false;
  }
}
function calcPersona(scores) {
  const { action, create, empathy, stable, charm } = scores;
  const total = action + create + empathy + stable + charm;
  const sorted = [
    { k: 'action', v: action },
    { k: 'create', v: create },
    { k: 'empathy', v: empathy },
    { k: 'stable', v: stable },
    { k: 'charm', v: charm },
  ].sort((a,b) => b.v - a.v);
  const top = sorted[0].k;
  const second = sorted[1].k;
  const diff = sorted[0].v - sorted[4].v;
  if (diff < total * 0.06) {
    return action > empathy ? 'diamond' : 'chamomile';
  }
  const topDiff = sorted[0].v - sorted[1].v;
  if (topDiff < total * 0.05) {
    const pair = [top, second].sort().join('+');
    const map = {
      'action+charm': 'rose',
      'action+create': 'sunflower',
      'action+empathy': 'tulip',
      'action+stable': 'rose',
      'create+stable': 'jasmine',
      'create+empathy': 'lavender',
      'create+charm': 'lavender',
      'empathy+stable': 'iris',
      'empathy+charm': 'sakura',
      'charm+stable': 'tulip',
    };
    if (map[pair]) return map[pair];
  }
  if (top === 'charm') return second === 'action' ? 'rose' : 'tulip';
  if (top === 'action') return second === 'charm' ? 'rose' : 'sunflower';
  if (top === 'create') return 'lavender';
  if (top === 'stable') return 'lily';
  if (top === 'empathy') return second === 'stable' ? 'iris' : 'blue';
  return 'rose';
}
function finishTest() {
  let resultHtml = '';
  let reward = 0;
  if (testState.type === 'personality' || testState.type === 'personality_deep') {
    const pid = calcPersona(testState.scores);
    const p = PERSONAS && PERSONAS.length > 0 ? (PERSONAS.find(x => x.id === pid) || PERSONAS[0]) : null;
    const isNew = p && Array.isArray(state.unlockedPersonas) ? !state.unlockedPersonas.includes(pid) : false;
    if (isNew && Array.isArray(state.unlockedPersonas)) state.unlockedPersonas.push(pid);
    if (p && !state.mainPersona) state.mainPersona = pid;
    reward = testState.reward || 50;
    state.testHistory.push({ type: 'personality', date: new Date().toISOString(), personaId: pid, scores: testState.scores, deep: testState.type === 'personality_deep' });
    saveState();
    if (!p) {
      const tc = document.getElementById('test-content');
      if (tc) {
        tc.innerHTML = '<div class="text-center py-8"><div class="text-4xl mb-2">🌸</div><h3 class="font-display text-lg mb-1" style="color:var(--theme-text)">测试完成</h3><p class="text-xs" style="color:var(--theme-text); opacity:0.5">数据加载异常，请刷新后重试</p><button onclick="closeTest()" class="soft-btn btn-primary w-full py-3 mt-4">好的</button></div>';
      }
      return;
    }
    const { action, create, empathy, stable, charm } = testState.scores;
    const total = action + create + empathy + stable + charm;
    const safeTotal = total > 0 ? total : 1;
    const aPct = total > 0 ? Math.round(action/safeTotal*100) : 0;
    const cPct = total > 0 ? Math.round(create/safeTotal*100) : 0;
    const ePct = total > 0 ? Math.round(empathy/safeTotal*100) : 0;
    const sPct = total > 0 ? Math.round(stable/safeTotal*100) : 0;
    const chPct = total > 0 ? Math.round(charm/safeTotal*100) : 0;
    resultHtml = `
      <div class="text-center py-2 animate-soft-pop">
        <div class="text-4xl mb-2">🎉</div>
        <h3 class="font-display text-lg mb-1" style="color:var(--theme-text)">人格测试完成！</h3>
        <p class="text-xs mb-4" style="color:var(--theme-text); opacity:0.5">${isNew ? '解锁了你的专属花公主身份！' : '又一次深入了解了自己～'}</p>
        <div class="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center animate-breath" style="background:linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2}); box-shadow:0 8px 24px ${p.color}40">
          ${getFlowerSVG(p, 55)}
        </div>
        <h4 class="font-display text-lg mb-1" style="color:${p.color}">${p.name}</h4>
        <p class="text-xs mb-1" style="color:var(--theme-text); opacity:0.6">${p.flower} · ${p.animal} · ${p.trait}主导</p>
        <div class="text-xs mb-4" style="color:var(--theme-text); opacity:0.4">✨ 公主身份证已生成 ✨</div>
        <div class="p-4 rounded-2xl mb-4" style="background:rgba(184,169,201,0.08)">
          <div class="text-xs mb-3 text-center" style="color:var(--theme-text); opacity:0.6">五特质占比</div>
          <div class="space-y-2">
            <div class="flex items-center gap-2"><span class="text-xs w-12">🔥 行动</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.6)"><div class="h-full rounded-full" style="background:#D4A5B8; width:${aPct}%"></div></div><span class="text-xs w-8 text-right" style="color:var(--theme-text); opacity:0.6">${aPct}%</span></div>
            <div class="flex items-center gap-2"><span class="text-xs w-12">🎨 创造</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.6)"><div class="h-full rounded-full" style="background:#B8A9C9; width:${cPct}%"></div></div><span class="text-xs w-8 text-right" style="color:var(--theme-text); opacity:0.6">${cPct}%</span></div>
            <div class="flex items-center gap-2"><span class="text-xs w-12">💗 共情</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.6)"><div class="h-full rounded-full" style="background:#F0D5E0; width:${ePct}%"></div></div><span class="text-xs w-8 text-right" style="color:var(--theme-text); opacity:0.6">${ePct}%</span></div>
            <div class="flex items-center gap-2"><span class="text-xs w-12">🌿 稳定</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.6)"><div class="h-full rounded-full" style="background:#88C898; width:${sPct}%"></div></div><span class="text-xs w-8 text-right" style="color:var(--theme-text); opacity:0.6">${sPct}%</span></div>
            <div class="flex items-center gap-2"><span class="text-xs w-12">✨ 魅力</span><div class="flex-1 h-2 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.6)"><div class="h-full rounded-full" style="background:#E8C87A; width:${chPct}%"></div></div><span class="text-xs w-8 text-right" style="color:var(--theme-text); opacity:0.6">${chPct}%</span></div>
          </div>
        </div>
        <div class="p-3 rounded-xl mb-4" style="background:rgba(245,230,200,0.3)">
          <div class="text-xs font-medium mb-1" style="color:#B8955A">💡 你的核心卡点信念</div>
          <div class="text-xs" style="color:var(--theme-text); opacity:0.75">${p.topBelief}</div>
          <div class="text-[10px] mt-1" style="color:var(--theme-text); opacity:0.5">建议先去信念净化塔清理这个卡点哦</div>
        </div>
        <button onclick="enterIslandFromTest('${pid}')" class="soft-btn btn-primary w-full py-3.5 text-base font-title mb-2">
          🏝️ 进入我的岛屿
        </button>
        <button onclick="viewPersona('${pid}')" class="w-full py-2.5 rounded-xl text-sm font-title" style="background:rgba(184,169,201,0.15); color:var(--theme-text)">查看人格详情</button>
      </div>
    `;
    speak(`恭喜公主殿下，你是${p.name}！`);
  } else if (testState.type === 'belief') {
    reward = testState.reward || 30;
    const sorted = Object.entries(testState.scores).sort((a, b) => b[1] - a[1]).slice(0, 3);
    state.topBeliefs = sorted.map(s => s[0]);
    state.testHistory.push({ type: 'belief', date: new Date().toISOString(), topBeliefs: state.topBeliefs });
    saveState();
    resultHtml = `
      <div class="text-center py-2 animate-soft-pop">
        <div class="text-4xl mb-2">🔍</div>
        <h3 class="font-display text-lg mb-1" style="color:var(--theme-text)">限制性信念探测完成</h3>
        <p class="text-xs mb-4" style="color:var(--theme-text); opacity:0.5">找出了你最核心的3个卡点信念</p>
        <div class="space-y-3 mb-4 text-left">
          ${sorted.map(([type, score], i) => {
            const b = BELIEF_TYPES[type];
            if (!b) return '';
            const intensity = score >= 9 ? '严重' : score >= 6 ? '中等' : '轻微';
            return `
              <div class="p-3 rounded-xl" style="background:rgba(245,213,213,0.15)">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium" style="color:#B87590">TOP ${i+1}：${b.name}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,165,184,0.2); color:#B87590">${intensity}</span>
                </div>
                <p class="text-xs" style="color:var(--theme-text); opacity:0.7">${b.desc}</p>
                <p class="text-xs mt-2" style="color:#8B7E9C">💡 建议：去信念净化塔用CBT方法清理</p>
              </div>
            `;
          }).join('')}
        </div>
        <div class="flex gap-2">
          <button onclick="closeTestResult()" class="flex-1 py-2.5 rounded-xl text-sm font-title" style="background:rgba(184,169,201,0.15); color:var(--theme-text)">知道了</button>
          <button onclick="closeTestResult(); openModule('tower')" class="soft-btn btn-primary flex-1 py-2.5 text-sm font-title">去清理信念</button>
        </div>
      </div>
    `;
    speak('信念探测完成啦，你的核心卡点已经找出来了～');
  } else {
    reward = testState.reward || 20;
    const avgLevel = Math.round(testState.totalLevel / testState.questions.length);
    state.emotionLevel = avgLevel;
    if (!state.emotionHistory) state.emotionHistory = [];
    state.emotionHistory.push({ date: getTodayStr(), level: avgLevel });
    if (state.emotionHistory.length > 30) state.emotionHistory.shift();
    state.testHistory.push({ type: 'emotion', date: new Date().toISOString(), level: avgLevel });
    saveState();
    let currentBand = 'mid';
    if (avgLevel < 35) currentBand = 'low';
    else if (avgLevel > 70) currentBand = 'high';
    const guide = EMOTION_GUIDES[currentBand];
    let scaleName = '平静/中性';
    for (const s of EMOTION_SCALE) {
      if (avgLevel >= s.level) scaleName = s.name;
    }
    resultHtml = `
      <div class="text-center py-2 animate-soft-pop">
        <div class="text-4xl mb-2">🌈</div>
        <h3 class="font-display text-lg mb-1" style="color:var(--theme-text)">情绪刻度测试完成</h3>
        <p class="text-xs mb-4" style="color:var(--theme-text); opacity:0.5">你当前的情绪位置</p>
        <div class="text-3xl font-display mb-1" style="background:linear-gradient(135deg, #D4A5B8, #B8A9C9); -webkit-background-clip:text; -webkit-text-fill-color:transparent">${avgLevel}%</div>
        <div class="text-sm mb-4" style="color:var(--theme-text)">${scaleName}</div>
        <div class="emotion-scale mb-2"><div class="emotion-marker" style="left:${avgLevel}%"></div></div>
        <div class="p-4 rounded-2xl mb-4 text-left" style="background:linear-gradient(135deg, rgba(240,213,224,0.15), rgba(184,169,201,0.1))">
          <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">💡 下一步调频建议</div>
          <p class="text-xs mb-2" style="color:var(--theme-text); opacity:0.8">${guide.title}</p>
          <ol class="text-xs space-y-1.5 list-decimal list-inside" style="color:var(--theme-text); opacity:0.7">
            ${guide.steps.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>
        <div class="flex gap-2">
          <button onclick="closeTestResult()" class="flex-1 py-2.5 rounded-xl text-sm font-title" style="background:rgba(184,169,201,0.15); color:var(--theme-text)">知道了</button>
          <button onclick="closeTestResult(); openModule('cloud')" class="soft-btn btn-primary flex-1 py-2.5 text-sm font-title">去调频</button>
        </div>
      </div>
    `;
    speak('情绪测试完成啦，你的当前情绪位置是' + scaleName + '。');
  }
  addEnergy(reward, '测试完成');
  checkBadges();
  updateTopbar();
  renderTemple();
  updateTimeAndWeather();
  setHTML('test-content', resultHtml);
  triggerConfetti();
  playSound('bloom');
}
function startWelcomeTest() {
  startTest('personality');
}
function closeTestResult() {
  hideModal('test-modal');
  testState = null;
}
function enterIslandFromTest(pid) {
  hideModal('test-modal');
  testState = null;
  try { localStorage.setItem('cosmos_island_welcomed_v3', '1'); } catch(e) {}
  goHome();
  playSound('bloom');
  triggerConfetti();
  setTimeout(() => startTutorial(), 1200);
}
function viewPersona(id) {
  const p = PERSONAS.find(x => x.id === id);
  if (!p) return;
  hideModal('test-modal');
  testState = null;
  showModal('persona-modal');
  setHTML('persona-detail', `
    <div class="relative">
      <div class="h-32 rounded-t-[28px] relative overflow-hidden" style="background:linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2})">
        <div class="absolute top-3 left-3 text-2xl opacity-50">${p.flower}</div>
        <div class="absolute top-3 right-3 text-2xl opacity-50">✨</div>
      </div>
      <button onclick="closePersona()" class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full z-10" style="background:rgba(255,255,255,0.5)); color:var(--theme-text); opacity:0.7">×</button>
      <div class="absolute -bottom-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full flex items-center justify-center border-4" style="background:linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2}); border-color:white; box-shadow:0 8px 24px ${p.color}30">
        ${getFlowerSVG(p, 60)}
      </div>
    </div>
    <div class="pt-16 pb-5 px-5">
      <h3 class="font-display text-xl text-center mb-1" style="color:${p.color}">${p.name}</h3>
      <p class="text-center text-xs mb-1" style="color:var(--theme-text); opacity:0.6">代表花：${p.flower} · 代表动物：${p.animal}</p>
      <div class="flex flex-wrap gap-1.5 justify-center mb-4">
        <span class="text-xs px-2.5 py-0.5 rounded-full" style="background:${p.color}20; color:${p.color}">${p.trait}主导</span>
        <span class="text-xs px-2.5 py-0.5 rounded-full" style="background:${p.color}20; color:${p.color}">${p.second}辅助</span>
      </div>
      <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
        <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
          <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">💖 核心成长优势</h4>
          <p class="text-xs" style="color:var(--theme-text); opacity:0.75">${p.advantage}</p>
        </div>
        <div class="p-3 rounded-xl" style="background:rgba(245,230,200,0.3)">
          <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">⚠️ 核心卡点信念</h4>
          <p class="text-xs" style="color:var(--theme-text); opacity:0.75">${p.topBelief}</p>
        </div>
        <div class="p-3 rounded-xl" style="background:rgba(184,169,201,0.1)">
          <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">🎯 专属成长节奏</h4>
          <p class="text-xs" style="color:var(--theme-text); opacity:0.75">${p.rhythm}</p>
        </div>
        <div class="p-3 rounded-xl" style="background:linear-gradient(135deg, ${p.flowerColor1}40, ${p.flowerColor2}30)">
          <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">📝 5步落地建议</h4>
          <ol class="text-xs space-y-1.5 list-decimal list-inside" style="color:var(--theme-text); opacity:0.75">
            ${p.advice.map(a => `<li>${a}</li>`).join('')}
          </ol>
        </div>
        <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
          <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">💫 专属肯定语</h4>
          <div class="space-y-1.5">
            ${p.affirmations.map(a => `<div class="text-xs cursor-pointer hover:opacity-80" style="color:var(--theme-text); opacity:0.75" onclick="speakAffirm('${(a||'').replace(/'/g, "\\'")}')">🔊 ${a}</div>`).join('')}
          </div>
        </div>
      </div>
      ${state.unlockedPersonas.includes(id) ? `
        <button onclick="collectPersonaAffirmations('${id}')" class="soft-btn btn-primary w-full mt-4 py-3 text-sm font-title">
          💖 收藏专属肯定语
        </button>
      ` : ''}
    </div>
  `);
  showModal('persona-modal');
  speak(`你是${p.name}，${p.trait}主导。`);
}
function closePersona() {
  hideModal('persona-modal');
}
function collectPersonaAffirmations(id) {
  const p = PERSONAS.find(x => x.id === id);
  if (!p) return;
  let added = 0;
  p.affirmations.forEach(a => {
    if (!state.affirmations.saved.includes(a)) {
      state.affirmations.saved.push(a);
      added++;
    }
  });
  saveState();
  checkBadges();
  showToast(`收藏了 ${added} 条肯定语 💖`);
}
function speakAffirm(text) {
  speak(text);
}
let currentPurifyResult = null;
function renderTower() {
  const streak = state.purify.streak || 0;
  setText('purify-day', streak);
  setStyle('purify-progress', 'width', Math.min(streak / 21 * 100, 100) + '%');
  setText('purify-total', state.purify.total || 0);
  setText('purify-today', state.purify.todayCount || 0);
  setText('purify-streak', streak);
  const cal = document.getElementById('purify-calendar');
  let html = '';
  for (let i = 1; i <= 21; i++) {
    const done = i <= streak;
    html += `<div class="aspect-square rounded-lg flex items-center justify-center text-xs ${done ? '' : ''}" style="background:${done ? 'linear-gradient(135deg, #D4B5C7, #B8A9C9)' : 'rgba(184,169,201,0.08)'}; color:${done ? 'white' : 'rgba(93,78,109,0.4)'}">
      ${done ? '✨' : i}
    </div>`;
  }
  cal.innerHTML = html;
  const tips = [
    '每当你觉察到负面想法时，轻轻说"我看到你了，但我选择相信更好的"。',
    '你的注意力在哪里，能量就流向哪里。多关注积极的事物。',
    '负面想法就像天空中的云，它会来也会走。',
    '每一次觉察并转化负面念头，你都在变得更强大。',
    '不要相信你脑子里所有的想法，很多只是旧习惯的重播。',
    '你不是你的想法，你是观察想法的那个人。',
  ];
  setText('purify-tip', tips[streak % tips.length]);
  renderPurifyStats();
}
function renderPurifyStats() {
  const el = document.getElementById('purify-stats');
  if (!state.purify.stats || Object.keys(state.purify.stats).length === 0) {
    el.innerHTML = `<div class="text-center py-4 text-sm" style="color:var(--theme-text); opacity:0.4">还没有数据，开始第一次净化吧～</div>`;
    return;
  }
  const sorted = Object.entries(state.purify.stats).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const max = Math.max(...sorted.map(s => s[1]));
  el.innerHTML = sorted.map(([type, count]) => {
    const b = COGNITIVE_DISTORTIONS.find(d => d.name === type) || { name: type };
    return `
      <div class="mb-2">
        <div class="flex justify-between text-xs mb-1">
          <span style="color:var(--theme-text)">${b.name}</span>
          <span style="color:var(--theme-text); opacity:0.5">${count}次</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="background:linear-gradient(90deg, #D4B5C7, #B8A9C9); width:${(count/max*100)}%"></div></div>
      </div>
    `;
  }).join('') + `
    <div class="text-xs text-center mt-3" style="color:var(--theme-text); opacity:0.5">
      你最常出现的是「${sorted[0][0]}」，可以多留意哦～
    </div>
  `;
}
let cbtState = { selectedDistortions: [], result: null };
function updateCBTStepIndicator(step) {
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('cbt-step-' + i);
    if (el) {
      if (i < step) {
        el.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
        el.style.color = 'white';
        el.style.opacity = '1';
        el.textContent = '✓';
      } else if (i === step) {
        el.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
        el.style.color = 'white';
        el.style.opacity = '1';
        el.textContent = i;
      } else {
        el.style.background = 'rgba(184,169,201,0.15)';
        el.style.color = 'var(--theme-text)';
        el.style.opacity = '0.5';
        el.textContent = i;
      }
    }
  }
}
function nextCBTStep(step) {
  if (step === 2) {
    const eventEl = document.getElementById('cbt-event');
    if (!eventEl) { showToast('页面元素未加载，请刷新试试'); return; }
    const event = eventEl.value.trim();
    if (!event) { showToast('先说说发生了什么事呀～'); return; }
    saveCBTDraft();
  }
  if (step === 3) {
    const thoughtEl = document.getElementById('cbt-thought');
    if (!thoughtEl) { showToast('页面元素未加载，请刷新试试'); return; }
    const thought = thoughtEl.value.trim();
    if (!thought) { showToast('写下你当时的想法吧～'); return; }
    saveCBTDraft();
  }
  if (step === 4) {
    if (cbtState.selectedDistortions.length === 0) { showToast('选一个认知歪曲类型吧～'); return; }
    saveCBTDraft();
  }
  if (step === 5) {
    const evidenceEl = document.getElementById('cbt-evidence-input');
    if (!evidenceEl) { showToast('页面元素未加载，请刷新试试'); return; }
    const evidence = evidenceEl.value.trim();
    if (!evidence) { showToast('想想有什么证据可以反驳呢～'); return; }
    if (!cbtState.selectedDistortions || !cbtState.selectedDistortions.length) { showToast('选一个认知歪曲类型吧～'); return; }
    const d = COGNITIVE_DISTORTIONS[cbtState.selectedDistortions[0]];
    if (!d) { showToast('认知类型数据错误'); return; }
    setText('cbt-suggestion', d.affirm);
    const altInput = document.getElementById('cbt-alternative');
    if (altInput) altInput.value = d.affirm;
    saveCBTDraft();
  }
  if (step === 6) {
    const altEl = document.getElementById('cbt-alternative');
    const alt = altEl ? altEl.value.trim() : '';
    if (!alt) { showToast('写下你的替代想法吧～'); return; }
    const thoughtEl = document.getElementById('cbt-thought');
    const thought = thoughtEl ? thoughtEl.value.trim() : '';
    setText('cbt-neg-display', thought);
    setText('cbt-pos-display', alt);
    const eventEl = document.getElementById('cbt-event');
    const evidenceEl = document.getElementById('cbt-evidence-input');
    cbtState.result = {
      event: eventEl ? eventEl.value.trim() : '',
      thought,
      distortions: cbtState.selectedDistortions.map(i => COGNITIVE_DISTORTIONS[i] ? COGNITIVE_DISTORTIONS[i].name : '').filter(Boolean),
      evidence: evidenceEl ? evidenceEl.value.trim() : '',
      alternative: alt,
    };
    setTimeout(() => {
      const crystal = document.getElementById('cbt-neg-crystal');
      crystal.classList.add('shattering');
      playSound('shatter');
      setText('purify-status-text', '负面信念正在碎裂...');
    }, 300);
    setTimeout(() => {
      addCls('neg-crystal-stage', 'hidden');
      setText('purify-status-text', '✨ 净化完成 ✨');
      remCls('pos-crystal-stage', 'hidden');
      remCls('cbt-complete-btn', 'hidden');
      playSound('bloom');
    }, 1500);
  }
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('cbt-step' + i);
    if (el) el.classList.add('hidden');
  }
  const nextEl = document.getElementById('cbt-step' + step);
  if (nextEl) {
    nextEl.classList.remove('hidden');
    nextEl.classList.add('animate-fade-in');
  }
  updateCBTStepIndicator(step);
  playSound('page');
}
function prevCBTStep(step) {
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('cbt-step' + i);
    if (el) el.classList.add('hidden');
  }
  const prevEl = document.getElementById('cbt-step' + step);
  if (prevEl) prevEl.classList.remove('hidden');
  updateCBTStepIndicator(step);
  playSound('page');
}
function toggleDistortion(i, el) {
  const idx = cbtState.selectedDistortions.indexOf(i);
  if (idx >= 0) {
    cbtState.selectedDistortions.splice(idx, 1);
    el.style.borderColor = 'transparent';
    el.style.background = 'rgba(184,169,201,0.08)';
  } else {
    cbtState.selectedDistortions.push(i);
    el.style.borderColor = '#B8A9C9';
    el.style.background = 'rgba(212,181,199,0.2)';
  }
  saveCBTDraft();
  playSound('sparkle');
}
function saveCBTDraft() {
  const draft = {
    event: document.getElementById('cbt-event')?.value || '',
    thought: document.getElementById('cbt-thought')?.value || '',
    selectedDistortions: cbtState.selectedDistortions || [],
    evidence: document.getElementById('cbt-evidence-input')?.value || '',
    alternative: document.getElementById('cbt-alternative')?.value || '',
  };
  if (!state.cbtDrafts) state.cbtDrafts = {};
  state.cbtDrafts.current = draft;
  saveState();
}
function loadCBTDraft() {
  if (!state.cbtDrafts || !state.cbtDrafts.current) return;
  const draft = state.cbtDrafts.current;
  if (draft.event && document.getElementById('cbt-event')) document.getElementById('cbt-event').value = draft.event;
  if (draft.thought && document.getElementById('cbt-thought')) document.getElementById('cbt-thought').value = draft.thought;
  if (draft.evidence && document.getElementById('cbt-evidence-input')) document.getElementById('cbt-evidence-input').value = draft.evidence;
  if (draft.alternative && document.getElementById('cbt-alternative')) document.getElementById('cbt-alternative').value = draft.alternative;
  if (draft.selectedDistortions) {
    cbtState.selectedDistortions = draft.selectedDistortions;
    setTimeout(() => {
      document.querySelectorAll('.distortion-option').forEach((el, i) => {
        if (draft.selectedDistortions.includes(i)) {
          el.style.borderColor = '#B8A9C9';
          el.style.background = 'rgba(212,181,199,0.2)';
        }
      });
    }, 100);
  }
}
function saveCBTRecord(result) {
  if (!state.cbtRecords) state.cbtRecords = [];
  state.cbtRecords.unshift({
    ...result,
    date: new Date().toISOString(),
  });
  if (state.cbtRecords.length > 50) state.cbtRecords = state.cbtRecords.slice(0, 50);
  if (state.cbtDrafts) state.cbtDrafts.current = null;
  saveState();
  renderCBTRecords();
}
function renderCBTRecords() {
  const el = document.getElementById('cbt-records-list');
  if (!el) return;
  const records = state.cbtRecords || [];
  if (records.length === 0) {
    el.innerHTML = '<div class="text-center py-4 text-xs" style="color:var(--theme-text); opacity:0.4">还没有净化记录哦～<br/>完成一次CBT练习就会出现在这里啦 ✨</div>';
    return;
  }
  el.innerHTML = records.slice(0, 10).map((r, i) => {
    const date = new Date(r.date);
    const isValidDate = !isNaN(date.getTime());
    const dateStr = isValidDate ? `${date.getMonth()+1}/${date.getDate()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}` : '未知时间';
    return `
      <div class="p-3 rounded-xl cursor-pointer" style="background:rgba(184,169,201,0.06)" onclick="viewCBTRecord(${i})">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px]" style="color:#B8859C">${dateStr}</span>
          <span class="text-[10px]" style="color:var(--theme-text); opacity:0.4">${r.distortions?.[0] || ''}</span>
        </div>
        <div class="text-xs line-clamp-1" style="color:var(--theme-text); opacity:0.6">事件：${r.event || ''}</div>
        <div class="text-xs line-clamp-1 mt-1" style="color:#88C898">✨ ${r.alternative || ''}</div>
      </div>
    `;
  }).join('');
}
function viewCBTRecord(i) {
  const r = state.cbtRecords[i];
  if (!r) return;
  showToast(`📝 ${r.alternative?.substring(0, 20) || ''}...`);
}
function completeCBTPurify() {
  if (!cbtState.result) return;
  const today = getTodayStr();
  state.purify.total = (state.purify.total || 0) + 1;
  state.purify.todayCount = (state.purify.todayCount || 0) + 1;
  if (!state.purify.stats) state.purify.stats = {};
  cbtState.result.distortions.forEach(name => {
    state.purify.stats[name] = (state.purify.stats[name] || 0) + 1;
  });
  if (!state.purify.records) state.purify.records = [];
  state.purify.records.unshift({ ...cbtState.result, date: today });
  if (state.purify.records.length > 50) state.purify.records.pop();
  const last = state.purify.lastCheckin;
  if (last !== today) {
    if (last) {
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      if (isNaN(lastDate.getTime()) || isNaN(todayDate.getTime())) {
        state.purify.streak = 1;
      } else {
        const diff = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) state.purify.streak = (state.purify.streak || 0) + 1;
        else if (diff > 1) state.purify.streak = 1;
      }
    } else {
      state.purify.streak = 1;
    }
    state.purify.lastCheckin = today;
  }
  saveState();
  addEnergy(20, '信念净化');
  triggerPetals();
  playSound('bloom');
  renderTower();
  showToast('✨ 净化完成！');
  checkBadges();
  cbtState = { selectedDistortions: [], result: null };
  setTimeout(() => {
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById('cbt-step' + i);
      if (el) el.classList.add('hidden');
    }
    remCls('cbt-step1', 'hidden');
    const cbtEvent = document.getElementById('cbt-event');
    const cbtThought = document.getElementById('cbt-thought');
    const cbtEvidence = document.getElementById('cbt-evidence-input');
    const cbtAlternative = document.getElementById('cbt-alternative');
    if (cbtEvent) cbtEvent.value = '';
    if (cbtThought) cbtThought.value = '';
    if (cbtEvidence) cbtEvidence.value = '';
    if (cbtAlternative) cbtAlternative.value = '';
    document.querySelectorAll('.distortion-option').forEach(el => {
      el.style.borderColor = 'transparent';
      el.style.background = 'rgba(184,169,201,0.08)';
    });
    remCls('neg-crystal-stage', 'hidden');
    addCls('pos-crystal-stage', 'hidden');
    addCls('cbt-complete-btn', 'hidden');
    remCls('cbt-neg-crystal', 'shattering');
    setText('purify-status-text', '星光水晶正在碎裂...');
    updateCBTStepIndicator(1);
  }, 1500);
}
let revisionInterval = null;
let revisionTime = 0;
let revisionRunning = false;
function startRevision(type) {
  remCls('revision-area', 'hidden');
  setText('revision-title', '🕊️ 修正法 · ' + type);
  setHTML('revision-text', REVISION_GUIDES[type] || REVISION_GUIDES['原生家庭']);
  revisionTime = 0;
  updateRevisionTimer();
  const revisionArea = document.getElementById('revision-area');
  if (revisionArea) revisionArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  speak('我们开始修正法冥想吧，找一个舒服的姿势，跟着圆圈的节奏呼吸～');
}
function toggleRevision() {
  const btn = document.getElementById('revision-toggle-btn');
  if (revisionRunning) {
    revisionRunning = false;
    clearInterval(revisionInterval);
    revisionInterval = null;
    btn.innerHTML = '▶️ 继续';
  } else {
    if (revisionInterval) { clearInterval(revisionInterval); revisionInterval = null; }
    revisionRunning = true;
    btn.innerHTML = '⏸️ 暂停';
    revisionInterval = setInterval(() => {
      revisionTime++;
      updateRevisionTimer();
      if (revisionTime === 30) speak('慢慢吸气...感受空气进入你的身体...');
      if (revisionTime === 60) speak('慢慢呼气...释放所有的紧张和压力...');
      if (revisionTime === 120) speak('现在，回到你想要改写的那个记忆里...');
      if (revisionTime === 180) speak('在想象里，把它改成你想要的美好结局...');
      if (revisionTime >= 600) { stopRevision(); completeRevision(); }
    }, 1000);
    playSound('chime');
  }
}
function updateRevisionTimer() {
  const mins = Math.floor(revisionTime / 60);
  const secs = revisionTime % 60;
  const timerEl = document.getElementById('revision-timer');
  if (timerEl) timerEl.textContent =
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')} / 10:00`;
  const cycle = revisionTime % 14;
  const breathText = document.getElementById('revision-breath-text');
  if (breathText) {
    if (cycle < 4) breathText.textContent = '吸气';
    else if (cycle < 8) breathText.textContent = '屏息';
    else breathText.textContent = '呼气';
  }
}
function stopRevision() {
  revisionRunning = false;
  if (revisionInterval) { clearInterval(revisionInterval); revisionInterval = null; }
  setHTML('revision-toggle-btn', '▶️ 开始');
}
let revisionNoteTimer = null;
function saveRevisionNote() {
  clearTimeout(revisionNoteTimer);
  setText('revision-note-status', '保存中...');
  revisionNoteTimer = setTimeout(() => {
    const note = document.getElementById('revision-note')?.value || '';
    const type = document.getElementById('revision-title')?.textContent || '修正法冥想';
    if (!state.revisionNotes) state.revisionNotes = [];
    const today = getTodayStr();
    const todayIdx = state.revisionNotes.findIndex(r => r.date === today && r.type === type);
    if (todayIdx > -1) {
      state.revisionNotes[todayIdx].note = note;
    } else {
      state.revisionNotes.unshift({ type, note, date: today });
    }
    if (state.revisionNotes.length > 50) state.revisionNotes = state.revisionNotes.slice(0, 50);
    saveState();
    setText('revision-note-status', '✓ 已保存');
    setTimeout(() => {
      const el = document.getElementById('revision-note-status');
      if (el) el.textContent = '';
    }, 2000);
  }, 500);
}
function completeRevision() {
  state.revisionCount = (state.revisionCount || 0) + 1;
  saveState();
  addEnergy(40, '修正法冥想');
  addCls('revision-area', 'hidden');
  stopRevision();
  showAlert('🕊️', '修正完成', '公主做得真好～那个记忆已经被改写了，你自由了 💖');
  checkBadges();
}
function createSkyRipple(x, y) {
  const sky = document.getElementById('wish-sky');
  if (!sky) return;
  for (let i = 0; i < 3; i++) {
    const r = document.createElement('div');
    r.style.cssText = `
      position:absolute;
      width:30px;height:30px;
      border:2px solid rgba(255,255,255,0.5);
      border-radius:50%;
      left:${x}px;top:${y}px;
      transform:translate(-50%,-50%);
      pointer-events:none;
      animation:ripple 1.5s ease-out forwards;
      animation-delay:${i*0.2}s;
    `;
    sky.appendChild(r);
    setTimeout(() => r.remove(), 1500 + i * 200);
  }
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.textContent = '✨';
    s.style.cssText = 'position:absolute;font-size:14px;pointer-events:none;';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    sky.appendChild(s);
    const angle = (i / 8) * Math.PI * 2;
    const dist = 35 + Math.random() * 25;
    const start = Date.now();
    const anim = () => {
      const t = Math.min((Date.now() - start) / 900, 1);
      const dx = Math.cos(angle) * dist * t;
      const dy = Math.sin(angle) * dist * t - 25 * t * (1-t) * 3;
      s.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${1-t})`;
      s.style.opacity = 1 - t;
      if (t < 1) {
        if (window.requestAnimationFrame) requestAnimationFrame(anim);
        else setTimeout(anim, 16);
      } else s.remove();
    };
    if (window.requestAnimationFrame) requestAnimationFrame(anim);
    else setTimeout(anim, 16);
  }
}
let habitCalMonth = new Date();
let habitCalSelected = null;
function openHabitModal() {
  showModal('habit-modal');
  const habitName = document.getElementById('habit-name-input');
  const habitReminder = document.getElementById('habit-reminder-input');
  if (habitName) habitName.value = '';
  if (habitReminder) habitReminder.value = '';
  state.habitCat = 'affirm';
  state.habitFreq = 'daily';
  state.habitWeekdays = [];
  playSound('page');
}
function closeHabitModal() { hideModal('habit-modal'); }
function selectHabitCat(cat, el) {
  state.habitCat = cat;
  document.querySelectorAll('.habit-cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  playSound('sparkle');
}
function selectHabitFreq(freq, el) {
  state.habitFreq = freq;
  document.querySelectorAll('.habit-freq-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  toggleCls('habit-weekdays', 'hidden', freq !== 'custom');
  playSound('sparkle');
}
function toggleHabitWeekday(d, el) {
  const idx = state.habitWeekdays.indexOf(d);
  if (idx >= 0) {
    state.habitWeekdays.splice(idx, 1);
    el.style.background = 'rgba(184,169,201,0.1)';
    el.style.color = 'var(--theme-text)';
  } else {
    state.habitWeekdays.push(d);
    el.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
    el.style.color = 'white';
  }
  playSound('sparkle');
}
function addHabit() {
  const nameInput = document.getElementById('habit-name-input');
  if (!nameInput) { showToast('请先打开习惯页面'); return; }
  const name = nameInput.value.trim();
  if (!name) { showToast('给习惯起个名字吧～'); return; }
  const reminderInput = document.getElementById('habit-reminder-input');
  const reminder = reminderInput ? reminderInput.value || null : null;
  if (!state.habits) state.habits = [];
  state.habits.push({
    id: Date.now(),
    name,
    category: state.habitCat,
    frequency: state.habitFreq,
    weekdays: [...state.habitWeekdays],
    reminder,
    createdAt: new Date().toISOString(),
    checkins: {},
    streak: 0,
    lastCheckin: null,
  });
  saveState();
  closeHabitModal();
  renderHabits();
  playSound('bloom');
  showToast('✨ 习惯添加成功！');
}
function toggleHabitCheckin(id) {
  const today = getTodayStr();
  const habit = state.habits.find(h => h.id === id);
  if (!habit) return;
  if (!habit.checkins) habit.checkins = {};
  if (habit.checkins[today]) {
    delete habit.checkins[today];
    recalcHabitStreak(habit);
    showToast('已取消打卡～');
  } else {
    habit.checkins[today] = true;
    recalcHabitStreak(habit);
    playSound('bloom');
    addEnergy(5, '习惯打卡');
    logActivity('habit', '习惯打卡: ' + habit.name);
    showToast('🎉 打卡成功！');
    const allDone = state.habits.every(h => {
      if (!isHabitDueToday(h)) return true;
      return h.checkins && h.checkins[today];
    });
    if (allDone && state.habits.length > 0 && !state.todayDone.cardReward) {
      state.todayDone.cardReward = true;
      setTimeout(() => {
        giveHealingCard();
      }, 500);
    }
  }
  saveState();
  renderHabits();
  renderHabitCalendar();
  checkBadges();
}
function isHabitDueToday(habit) {
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'custom') {
    const day = new Date().getDay();
    return habit.weekdays && habit.weekdays.includes(day);
  }
  return true;
}
function recalcHabitStreak(habit) {
  let streak = 0;
  let d = new Date();
  if (!habit.checkins) habit.checkins = {};
  while (true) {
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (habit.checkins[dateStr]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  habit.streak = streak;
  habit.lastCheckin = streak > 0 ? getTodayStr() : null;
}
function deleteHabit(id) {
  if (!confirm('确定要删除这个习惯吗？打卡记录也会消失哦～')) return;
  state.habits = state.habits.filter(h => h.id !== id);
  saveState();
  renderHabits();
  showToast('已删除～');
}
function renderHabits() {
  const list = document.getElementById('habit-list');
  if (!list) return;
  const habits = state.habits || [];
  const today = getTodayStr();
  if (habits.length === 0) {
    list.innerHTML = `<div class="text-center py-8">
      <div class="text-4xl mb-3">🌱</div>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">还没有习惯哦～</p>
      <p class="text-xs mb-5" style="color:var(--theme-text); opacity:0.4">添加第一个成长小习惯，每天进步一点点 ✨</p>
      <button onclick="openHabitModal()" class="soft-btn btn-primary px-6 py-2.5 text-sm font-title">添加第一个习惯 🌸</button>
    </div>`;
    addCls('habit-calendar-section', 'hidden');
    return;
  }
  const catEmojis = { affirm: '💖', meditation: '🧘', gratitude: '🙏', visualize: '✨', journal: '📔', other: '🌸' };
  list.innerHTML = habits.map(h => {
    const checkins = h.checkins || {};
    const done = checkins[today];
    const due = isHabitDueToday(h);
    return `
      <div class="flex items-center gap-3 p-3 rounded-xl ${done ? '' : 'card-hover cursor-pointer'}" 
           style="background:${done ? 'linear-gradient(135deg, rgba(136,200,152,0.2), rgba(184,224,192,0.15))' : 'rgba(184,169,201,0.08)'}"
           onclick="${due && !done ? `toggleHabitCheckin(${h.id})` : ''}">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" 
             style="background:${done ? 'linear-gradient(135deg, #88C898, #B8E0C0)' : 'rgba(184,169,201,0.15)'}">
          ${done ? '✓' : catEmojis[h.category] || '🌸'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate" style="color:var(--theme-text)">${h.name}</div>
          <div class="text-[10px]" style="color:var(--theme-text); opacity:0.5">
            🔥 连续 ${h.streak || 0} 天 · ${due ? '今天要打卡' : '今天休息'}
          </div>
        </div>
        <button onclick="event.stopPropagation(); deleteHabit(${h.id})" class="text-xs opacity-40 hover:opacity-100" style="color:var(--theme-text)">×</button>
      </div>
    `;
  }).join('');
  remCls('habit-calendar-section', 'hidden');
  renderHabitCalendar();
}
function renderHabitCalendar() {
  const cal = document.getElementById('habit-calendar');
  if (!cal) return;
  const year = habitCalMonth.getFullYear();
  const month = habitCalMonth.getMonth();
  const htitle = document.getElementById('habit-cal-title');
  if (htitle) htitle.textContent = `${year}年${month+1}月`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = getTodayStr();
  const habits = state.habits || [];
  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += `<div></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today;
    const checked = habits.filter(h => h.checkins && h.checkins[dateStr]).length;
    const total = habits.filter(h => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'custom') {
        const dayOfWeek = new Date(dateStr).getDay();
        return h.weekdays && h.weekdays.includes(dayOfWeek);
      }
      return true;
    }).length;
    const pct = total > 0 ? checked / total : 0;
    let bg = 'rgba(184,169,201,0.08)';
    let color = 'var(--theme-text)';
    if (pct > 0 && pct < 0.5) { bg = 'rgba(212,181,199,0.3)'; }
    else if (pct >= 0.5 && pct < 1) { bg = 'rgba(184,169,201,0.5)'; }
    else if (pct === 1) { bg = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)'; color = 'white'; }
    html += `
      <div class="aspect-square rounded flex items-center justify-center text-[10px] ${isToday ? 'ring-2 ring-pink-300' : ''}" 
           style="background:${bg}; color:${color}; opacity:${dateStr > today ? '0.3' : '1'}">
        ${d}
      </div>
    `;
  }
  cal.innerHTML = html;
}
function prevHabitMonth() {
  habitCalMonth.setMonth(habitCalMonth.getMonth() - 1);
  renderHabitCalendar();
  playSound('page');
}
function nextHabitMonth() {
  habitCalMonth.setMonth(habitCalMonth.getMonth() + 1);
  renderHabitCalendar();
  playSound('page');
}
const HEALING_CARDS = [
  { id: 'rose', name: '玫瑰心语', emoji: '🌹', desc: '你值得被全心全意地爱着', bg: 'linear-gradient(135deg, #F5C5D0, #E895A8)' },
  { id: 'lavender', name: '薰衣草梦', emoji: '💜', desc: '愿你夜夜好眠，天天好心情', bg: 'linear-gradient(135deg, #D4C5E0, #A898BC)' },
  { id: 'lily', name: '铃兰轻语', emoji: '🤍', desc: '纯洁的你，值得最纯净的爱', bg: 'linear-gradient(135deg, #E8F0E8, #C8D8C8)' },
  { id: 'sunflower', name: '向阳而生', emoji: '🌻', desc: '你永远是自己的小太阳', bg: 'linear-gradient(135deg, #FFE066, #E8A830)' },
  { id: 'sakura', name: '樱花飘落', emoji: '🌸', desc: '慢慢来，花会开，你会绽放', bg: 'linear-gradient(135deg, #FFD5E0, #F5B5C5)' },
  { id: 'starry', name: '星空之约', emoji: '🌌', desc: '你是宇宙独一无二的星星', bg: 'linear-gradient(135deg, #5D4E6D, #3D3258)' },
  { id: 'ocean', name: '海洋之心', emoji: '🌊', desc: '你的内心像大海一样辽阔', bg: 'linear-gradient(135deg, #B8D8F0, #7BA8C8)' },
  { id: 'princess', name: '公主日记', emoji: '👑', desc: '我的公主，你值得世间一切美好', bg: 'linear-gradient(135deg, #F5D5E0, #E8B5C8)' },
  { id: 'crystal', name: '星光水晶之约', emoji: '💎', desc: '你像星光水晶一样，纯净又闪耀', bg: 'linear-gradient(135deg, #D4C5E0, #9DB5C8)' },
  { id: 'rainbow', name: '彩虹之桥', emoji: '🌈', desc: '风雨过后，必有彩虹', bg: 'linear-gradient(135deg, #F5C5D0, #B8D8F0, #DDEBE0)' },
  { id: 'moon', name: '月光温柔', emoji: '🌙', desc: '月亮会等你，我也会', bg: 'linear-gradient(135deg, #C9D8E8, #A898BC)' },
  { id: 'butterfly', name: '破茧成蝶', emoji: '🦋', desc: '你正在变成更好的自己', bg: 'linear-gradient(135deg, #E8B5C5, #D4C5E0)' },
];
function giveHealingCard() {
  const owned = state.cards || [];
  const unowned = HEALING_CARDS.filter(c => !owned.includes(c.id));
  let card;
  if (unowned.length > 0) {
    card = unowned[Math.floor(Math.random() * unowned.length)];
    if (!state.cards) state.cards = [];
    state.cards.push(card.id);
  } else {
    card = HEALING_CARDS[Math.floor(Math.random() * HEALING_CARDS.length)];
  }
  saveState();
  showAlert('🎴', '获得治愈卡片！', `恭喜获得「${card.name}」卡片\n\n${card.emoji} ${card.desc}\n\n去卡册看看你的收藏吧～`);
  triggerConfetti();
  playSound('bloom');
  addEnergy(20, '获得治愈卡片');
  checkBadges();
}
const FORTUNE_DATA = {
  colors: [
    { name: '粉晶色', hex: '#F5B8D0', emoji: '🌸' },
    { name: '薰衣草紫', hex: '#B8A9C9', emoji: '💜' },
    { name: '薄荷绿', hex: '#88C898', emoji: '🌿' },
    { name: '天空蓝', hex: '#A8C8E0', emoji: '💙' },
    { name: '鹅黄色', hex: '#F5E6A8', emoji: '🌻' },
    { name: '珊瑚橘', hex: '#F5B898', emoji: '🧡' },
    { name: '珍珠白', hex: '#F5F0F5', emoji: '🤍' },
    { name: '玫瑰金', hex: '#E8B5B0', emoji: '🌹' },
  ],
  luckyItems: [
    { name: '粉晶手链', emoji: '💎' },
    { name: '白星光水晶柱', emoji: '🔮' },
    { name: '樱花发夹', emoji: '🌸' },
    { name: '香薰蜡烛', emoji: '🕯️' },
    { name: '月亮项链', emoji: '🌙' },
    { name: '星星耳环', emoji: '⭐' },
    { name: '玫瑰花束', emoji: '🌹' },
    { name: '薰衣草香囊', emoji: '💜' },
    { name: '蜂蜜茶', emoji: '🍯' },
    { name: '小雏菊', emoji: '🌼' },
    { name: '贝壳', emoji: '🐚' },
    { name: '羽毛书签', emoji: '🪶' },
  ],
  activities: [
    '适合许愿 · 写下你的愿望，宇宙听得见',
    '适合清理信念 · 把卡点都清理掉吧',
    '适合行动 · 灵感来了就去做',
    '适合冥想 · 静下来和内心对话',
    '适合感恩 · 细数你拥有的美好',
    '适合爱自己 · 做一件让自己开心的事',
    '适合学习 · 吸收新知识，提升自己',
    '适合社交 · 和同频的朋友聊聊天',
  ],
  tips: [
    '相信你的直觉，它是宇宙给你的指引 ✨',
    '你值得世间一切美好，不要怀疑自己 💖',
    '慢慢来，比较快。着急的时候就深呼吸 🌬️',
    '今天发生的每件事，都是最好的安排 🌸',
    '你的每一个念头都在创造你的现实 💫',
    '好好爱自己，是一切成长的开始 💕',
    '保持好心情，好事自然来 🌈',
    '你已经做得很好了，对自己温柔一点 🌷',
  ],
};
function getDailyFortune() {
  const today = getTodayStr();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  const stars = 3 + (seed % 3); // 3-5星
  const colorIdx = seed % FORTUNE_DATA.colors.length;
  const itemIdx = (seed * 3) % FORTUNE_DATA.luckyItems.length;
  const num = 1 + (seed * 7) % 9;
  const actIdx = (seed * 5) % FORTUNE_DATA.activities.length;
  const tipIdx = (seed * 11) % FORTUNE_DATA.tips.length;
  return {
    stars,
    color: FORTUNE_DATA.colors[colorIdx],
    luckyItem: FORTUNE_DATA.luckyItems[itemIdx],
    number: num,
    activity: FORTUNE_DATA.activities[actIdx],
    tip: FORTUNE_DATA.tips[tipIdx],
  };
}
function updateFortuneCard() {
  const f = getDailyFortune();
  const starsStr = '⭐'.repeat(f.stars) + '☆'.repeat(5 - f.stars);
  const summaryEl = document.getElementById('fortune-summary');
  const colorEl = document.getElementById('fortune-color');
  const numberEl = document.getElementById('fortune-number');
  if (summaryEl) summaryEl.textContent = '今日成长指数：' + starsStr;
  if (colorEl) colorEl.textContent = '幸运色：' + f.color.name;
  if (numberEl) numberEl.textContent = '幸运数字：' + f.number;
}
function openFortune() {
  const f = getDailyFortune();
  const starsStr = '⭐'.repeat(f.stars);
  const contentEl = document.getElementById('book-detail-content');
  if (!contentEl) return;
  contentEl.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-5xl mb-2 animate-breath">🌟</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">今日成长运势</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.5">${getTodayStr()}</p>
    </div>
    <div class="space-y-3" style="color:var(--theme-text)">
      <div class="p-3 rounded-xl" style="background:rgba(245,230,200,0.25)">
        <div class="text-xs font-medium mb-1">✨ 今日成长指数</div>
        <div class="text-2xl">${starsStr}</div>
        <div class="text-[10px] mt-1" style="opacity:0.6">${f.stars} / 5 星</div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="p-3 rounded-xl text-center" style="background:${f.color.hex}20">
          <div class="text-2xl mb-1">${f.color.emoji}</div>
          <div class="text-[10px]" style="opacity:0.6">幸运色</div>
          <div class="text-xs font-medium">${f.color.name}</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(184,169,201,0.12)">
          <div class="text-2xl mb-1">🔢</div>
          <div class="text-[10px]" style="opacity:0.6">幸运数字</div>
          <div class="text-xs font-medium">${f.number}</div>
        </div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <div class="text-xs font-medium mb-1">🍀 今日幸运物</div>
        <div class="text-sm"><span class="text-lg mr-2">${f.luckyItem.emoji}</span>${f.luckyItem.name}</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(221,235,224,0.25)">
        <div class="text-xs font-medium mb-1">🌿 今日宜</div>
        <div class="text-sm">${f.activity}</div>
      </div>
      <div class="p-3 rounded-xl" style="background:linear-gradient(135deg, rgba(212,181,199,0.15), rgba(184,169,201,0.1))">
        <div class="text-xs font-medium mb-1">💫 宇宙小提示</div>
        <div class="text-sm leading-relaxed">${f.tip}</div>
      </div>
    </div>
    <button onclick="closeBookModal()" class="soft-btn btn-primary w-full mt-4 py-2.5 text-sm font-title">
      ✨ 收下今日好运
    </button>
  `;
  showModal('book-modal');
  playSound('sparkle');
}

/* ===== 星座运势 & 生日祝福 ===== */
const ZODIAC_SIGNS = [
  { name: '白羊座', emoji: '♈', dates: [[3,21],[4,19]] },
  { name: '金牛座', emoji: '♉', dates: [[4,20],[5,20]] },
  { name: '双子座', emoji: '♊', dates: [[5,21],[6,21]] },
  { name: '巨蟹座', emoji: '♋', dates: [[6,22],[7,22]] },
  { name: '狮子座', emoji: '♌', dates: [[7,23],[8,22]] },
  { name: '处女座', emoji: '♍', dates: [[8,23],[9,22]] },
  { name: '天秤座', emoji: '♎', dates: [[9,23],[10,23]] },
  { name: '天蝎座', emoji: '♏', dates: [[10,24],[11,22]] },
  { name: '射手座', emoji: '♐', dates: [[11,23],[12,21]] },
  { name: '摩羯座', emoji: '♑', dates: [[12,22],[1,19]] },
  { name: '水瓶座', emoji: '♒', dates: [[1,20],[2,18]] },
  { name: '双鱼座', emoji: '♓', dates: [[2,19],[3,20]] },
];
const ZODIAC_FORTUNE_TEMPLATES = {
  love: ['桃花运旺盛，适合主动表达心意', '感情平稳，适合 deepen 连接', '可能会遇到心动的人，保持开放', '旧人可能回头，听从内心', '适合独处整理感情，不急于行动', '伴侣关系和谐，适合一起规划未来', '暗恋可能浮出水面，勇敢一点', '网络缘分增加，多留意社交动态'],
  career: ['工作效率高，适合推进重要项目', '贵人运强，多和同事交流', '创意灵感爆发，抓住好点子', '适合学习新技能，为将来铺垫', '注意细节，避免粗心出错', '领导可能注意到你的努力', '适合谈判和合作，表达清晰', '财务决策谨慎，不宜冲动投资'],
  health: ['精力充沛，适合运动健身', '注意睡眠质量，早点休息', '情绪起伏较大，多做冥想', '注意饮食健康，少吃油腻', '适合户外散步，吸收自然能量', '身体需要放松，泡个热水澡', '眼睛容易疲劳，多看看远处', '免疫力强，适合挑战新事物'],
  luck: ['直觉敏锐，相信第一感觉', '幸运在东方，出门朝东走', '适合穿亮色系衣服，提升气场', '今天的小幸运会接二连三', '保持微笑，好运自然来', '适合清理旧物，腾出空间迎接新能量', '收到意外好消息的概率很高', '数字7和3是你的幸运数字'],
};
function getZodiacSign(month, day) {
  for (const sign of ZODIAC_SIGNS) {
    const [start, end] = sign.dates;
    if (start[0] === end[0]) {
      if (month === start[0] && day >= start[1] && day <= end[1]) return sign;
    } else {
      if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) return sign;
    }
  }
  return ZODIAC_SIGNS[0];
}
function generateZodiacFortune(sign) {
  const today = getTodayStr();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i) + sign.name.charCodeAt(0);
  const love = ZODIAC_FORTUNE_TEMPLATES.love[seed % ZODIAC_FORTUNE_TEMPLATES.love.length];
  const career = ZODIAC_FORTUNE_TEMPLATES.career[(seed * 3) % ZODIAC_FORTUNE_TEMPLATES.career.length];
  const health = ZODIAC_FORTUNE_TEMPLATES.health[(seed * 5) % ZODIAC_FORTUNE_TEMPLATES.health.length];
  const luck = ZODIAC_FORTUNE_TEMPLATES.luck[(seed * 7) % ZODIAC_FORTUNE_TEMPLATES.luck.length];
  const stars = 3 + (seed % 3);
  return { love, career, health, luck, stars, sign };
}
function saveBirthday() {
  const input = document.getElementById('birthday-input');
  if (!input || !input.value) { showToast('请选择生日日期'); return; }
  const date = new Date(input.value);
  if (isNaN(date.getTime())) { showToast('日期格式不正确'); return; }
  const birthday = { month: date.getMonth() + 1, day: date.getDate(), year: date.getFullYear() };
  StorageUtil.set('user_birthday', birthday);
  hideModal('zodiac-birthday-modal');
  renderZodiacCard();
  showToast('✨ 生日已保存！');
  playSound('ding');
}
function loadBirthday() {
  return StorageUtil.get('user_birthday', null);
}
function renderZodiacCard() {
  const birthday = loadBirthday();
  const summaryEl = document.getElementById('zodiac-summary');
  const subEl = document.getElementById('zodiac-sub');
  const emojiEl = document.getElementById('zodiac-emoji');
  if (!summaryEl || !subEl || !emojiEl) return;
  if (!birthday) {
    summaryEl.textContent = '还没有设置生日哦 🎂';
    subEl.textContent = '点击设置生日，查看专属运势';
    emojiEl.textContent = '♈';
    return;
  }
  const sign = getZodiacSign(birthday.month, birthday.day);
  const fortune = generateZodiacFortune(sign);
  const starsStr = '⭐'.repeat(fortune.stars) + '☆'.repeat(5 - fortune.stars);
  summaryEl.textContent = `${sign.emoji} ${sign.name} 今日运势 ${starsStr}`;
  subEl.textContent = `爱情·${fortune.love.slice(0,12)}…`;
  emojiEl.textContent = sign.emoji;
}
function openZodiacFortune() {
  const birthday = loadBirthday();
  if (!birthday) { showModal('zodiac-birthday-modal'); return; }
  const sign = getZodiacSign(birthday.month, birthday.day);
  const fortune = generateZodiacFortune(sign);
  const starsStr = '⭐'.repeat(fortune.stars);
  const contentEl = document.getElementById('zodiac-fortune-content');
  if (!contentEl) return;
  contentEl.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-5xl mb-2 animate-breath">${sign.emoji}</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${sign.name} 今日运势</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.5">${getTodayStr()} · 生日 ${birthday.month}月${birthday.day}日</p>
    </div>
    <div class="space-y-3" style="color:var(--theme-text)">
      <div class="p-3 rounded-xl text-center" style="background:rgba(245,230,200,0.25)">
        <div class="text-xs font-medium mb-1">✨ 今日综合指数</div>
        <div class="text-2xl">${starsStr}</div>
        <div class="text-[10px] mt-1" style="opacity:0.6">${fortune.stars} / 5 星</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <div class="text-xs font-medium mb-1">💖 爱情运势</div>
        <div class="text-sm">${fortune.love}</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(221,235,224,0.25)">
        <div class="text-xs font-medium mb-1">💼 事业运势</div>
        <div class="text-sm">${fortune.career}</div>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(201,216,232,0.2)">
        <div class="text-xs font-medium mb-1">🧘 健康运势</div>
        <div class="text-sm">${fortune.health}</div>
      </div>
      <div class="p-3 rounded-xl" style="background:linear-gradient(135deg, rgba(212,181,199,0.15), rgba(184,169,201,0.1))">
        <div class="text-xs font-medium mb-1">🍀 幸运提示</div>
        <div class="text-sm">${fortune.luck}</div>
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="showModal('zodiac-birthday-modal')" class="soft-btn btn-soft flex-1 py-2.5 text-sm">修改生日</button>
      <button onclick="hideModal('zodiac-fortune-modal')" class="soft-btn btn-primary flex-1 py-2.5 text-sm font-title">✨ 收下运势</button>
    </div>
  `;
  showModal('zodiac-fortune-modal');
  playSound('sparkle');
}
function checkBirthday() {
  const birthday = loadBirthday();
  if (!birthday) return;
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const todayYear = now.getFullYear();
  if (birthday.month === todayMonth && birthday.day === todayDay) {
    const age = todayYear - (birthday.year || todayYear);
    const titleEl = document.getElementById('birthday-title');
    const msgEl = document.getElementById('birthday-message');
    if (titleEl) titleEl.textContent = age > 0 ? `🎂 ${age} 岁生日快乐！` : '生日快乐！';
    if (msgEl) msgEl.textContent = '今天是你的生日，宇宙为你准备了特别的祝福～愿你成长的愿望都加速实现！';
    const shownKey = 'birthday_shown_' + todayYear + '_' + todayMonth + '_' + todayDay;
    if (!StorageUtil.get(shownKey, false)) {
      setTimeout(() => {
        showModal('birthday-blessing-modal');
        playSound('sparkle');
        StorageUtil.set(shownKey, true);
      }, 3000);
    }
  }
}
function initZodiacAndBirthday() {
  renderZodiacCard();
  checkBirthday();
}

let currentPlan = null;
function selectPlan(type) {
  currentPlan = type;
  const plan = PLANS[type];
  if (!plan) return;
  if (!state.plans) state.plans = {};
  if (!state.plans[type]) state.plans[type] = [];
  setText('plan-title', plan.title);
  setText('plan-total-count', plan.total);
  setText('plan-intro', plan.intro);
  renderPlanTasks();
  remCls('plan-detail', 'hidden');
  const planDetail = document.getElementById('plan-detail');
  if (planDetail) planDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  playSound('ding');
}
function closePlan() {
  currentPlan = null;
  addCls('plan-detail', 'hidden');
  playSound('page');
}
function renderPlanTasks() {
  const plan = PLANS[currentPlan];
  const done = state.plans[currentPlan] || [];
  const doneCount = done.length;
  setText('plan-done-count', doneCount);
  setText('plan-total-count', plan.total);
  setStyle('plan-progress-bar', 'width', (doneCount / plan.total * 100) + '%');
  const el = document.getElementById('plan-tasks');
  if (!el) return;
  el.innerHTML = plan.tasks.map((t, i) => {
    const isDone = done.includes(i);
    const isUnlocked = i === 0 || done.includes(i - 1); // 前一天完成才能解锁
    return `
      <div class="glass-card p-3 ${isDone ? 'opacity-60' : ''} ${isUnlocked ? 'card-hover cursor-pointer' : 'opacity-40'}" onclick="${isUnlocked ? `openPlanDay(${i})` : ''}">
        <div class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
            style="background:${isDone ? 'linear-gradient(135deg, #D4B5C7, #B8A9C9)' : isUnlocked ? 'rgba(184,169,201,0.15)' : 'rgba(184,169,201,0.08)'}; color:${isDone ? 'white' : '#B8A9C9'}; border:1.5px solid ${isDone ? 'transparent' : '#D4C5E0'}">
            ${isDone ? '✓' : i + 1}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium ${isDone ? 'line-through' : ''}" style="color:var(--theme-text)">${t.title}</div>
            <div class="text-[10px] mt-0.5" style="color:var(--theme-text); opacity:0.5">${isDone ? '已完成 ✨' : isUnlocked ? '点击查看详情 →' : '完成前一天解锁 🔒'}</div>
          </div>
        </div>
        <div id="plan-day-${i}" class="hidden mt-3 pt-3" style="border-top:1px solid rgba(184,169,201,0.15)">
          <div class="text-xs leading-relaxed mb-3" style="color:var(--theme-text); opacity:0.8">
            <div class="font-medium mb-1" style="color:var(--theme-text)">💡 今日引导</div>
            <p>${t.guide}</p>
          </div>
          <div class="p-3 rounded-xl mb-3" style="background:rgba(240,213,224,0.15)">
            <div class="text-xs font-medium mb-1" style="color:#B8859C">📝 今日练习</div>
            <p class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.8">${t.practice}</p>
          </div>
           <div class="p-3 rounded-xl mb-3" style="background:rgba(245,230,200,0.25)">
             <div class="text-xs font-medium mb-1" style="color:#B8955A">💖 今日肯定语</div>
             <p class="text-xs leading-relaxed font-title" style="color:var(--theme-text); opacity:0.85">「${t.affirm}」</p>
           </div>
           <div class="p-3 rounded-xl mb-3" style="background:rgba(184,169,201,0.08); border:1px solid rgba(184,169,201,0.12)">
             <div class="text-xs font-medium mb-2 flex items-center gap-1" style="color:#8B7E9C">
               <span>📝</span> 今日练习感受
             </div>
             <textarea id="plan-note-${i}" oninput="savePlanNote(${i})" placeholder="今天的练习有什么感受？收获了什么？有什么感悟？写下来吧～" rows="2" class="w-full p-2.5 rounded-xl text-xs resize-none outline-none" style="background:rgba(255,255,255,0.5); backdrop-filter:blur(10px); color:var(--theme-text); border:1px solid rgba(184,169,201,0.15)"></textarea>
             <div class="text-[10px] mt-1 flex items-center justify-between" style="color:var(--theme-text); opacity:0.4">
               <span>💫 自动保存</span>
               <span id="plan-note-status-${i}"></span>
             </div>
           </div>
           <button onclick="event.stopPropagation(); togglePlanTask(${i})" class="soft-btn w-full py-2.5 text-sm font-title ${isDone ? 'btn-soft' : 'btn-primary'}">
            ${isDone ? '取消打卡' : '✨ 完成今日打卡'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}
function openPlanDay(i) {
  const el = document.getElementById('plan-day-' + i);
  if (!el) return;
  for (let j = 0; j < PLANS[currentPlan].total; j++) {
    const d = document.getElementById('plan-day-' + j);
    if (d && j !== i) d.classList.add('hidden');
  }
  el.classList.toggle('hidden');
  if (!el.classList.contains('hidden')) {
    loadPlanNote(i);
  }
  playSound('ding');
}
let planNoteTimers = {};
function savePlanNote(dayIndex) {
  if (planNoteTimers[dayIndex]) clearTimeout(planNoteTimers[dayIndex]);
  const statusEl = document.getElementById('plan-note-status-' + dayIndex);
  if (statusEl) statusEl.textContent = '保存中...';
  planNoteTimers[dayIndex] = setTimeout(() => {
    const note = document.getElementById('plan-note-' + dayIndex)?.value || '';
    if (!state.planNotes) state.planNotes = {};
    if (!state.planNotes[currentPlan]) state.planNotes[currentPlan] = {};
    state.planNotes[currentPlan][dayIndex] = note;
    saveState();
    if (statusEl) {
      statusEl.textContent = '✓ 已保存';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
    }
  }, 500);
}
function loadPlanNote(dayIndex) {
  if (!state.planNotes || !state.planNotes[currentPlan]) return;
  const note = state.planNotes[currentPlan][dayIndex];
  const el = document.getElementById('plan-note-' + dayIndex);
  if (el && note) el.value = note;
}
function togglePlanTask(i) {
  if (!currentPlan) return;
  if (!state.plans) state.plans = {};
  if (!state.plans[currentPlan]) state.plans[currentPlan] = [];
  const idx = state.plans[currentPlan].indexOf(i);
  if (idx >= 0) {
    state.plans[currentPlan].splice(idx, 1);
    showToast('已取消打卡');
  } else {
    state.plans[currentPlan].push(i);
    addEnergy(10, '计划打卡');
    showToast('✨ 打卡成功！');
    playSound('sparkle');
    triggerPetals();
  }
  saveState();
  renderPlanTasks();
  checkBadges();
}
function renderPlans() {
  addCls('plan-detail', 'hidden');
  currentPlan = null;
}
let timerDuration = 5 * 60; // 5分钟
let timerRemaining = 5 * 60;
let timerRunning = false;
let timerInterval = null;
let timerMode = 'meditation';
const TIMER_MODES = {
  meditation: { name: '冥想', tip: '闭上眼睛，深呼吸，感受气息的进出。思绪飘走了也没关系，温柔地把注意力带回到呼吸上就好。' },
  study: { name: '学习', tip: '关掉手机通知，专注在当下这一件事上。累了就休息，效率比时长更重要。' },
  affirm: { name: '肯定语', tip: '在心里默念你最喜欢的肯定语，感受那句话带来的美好感觉。感觉到位了，成长就快了。' },
};
function selectTimerMode(mode) {
  timerMode = mode;
  document.querySelectorAll('.timer-mode').forEach((b, i) => {
    const modes = ['meditation', 'study', 'affirm'];
    if (modes[i] === mode) {
      b.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
      b.style.color = 'white';
      b.style.transform = 'scale(1.05)';
    } else {
      b.style.background = '';
      b.style.color = '';
      b.style.transform = '';
    }
  });
  setText('timer-mode-text', TIMER_MODES[mode].name);
  setText('timer-tip', TIMER_MODES[mode].tip);
  playSound('ding');
}
function selectTimerDuration(min) {
  if (timerRunning) return;
  timerDuration = min * 60;
  timerRemaining = min * 60;
  updateTimerDisplay();
  document.querySelectorAll('.timer-dur').forEach((b, i) => {
    const durs = [5, 10, 15, 30];
    if (durs[i] === min) {
      b.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
      b.style.color = 'white';
      b.style.transform = 'scale(1.05)';
    } else {
      b.style.background = '';
      b.style.color = '';
      b.style.transform = '';
    }
  });
  playSound('ding');
}
function updateTimerDisplay() {
  const mins = Math.floor(timerRemaining / 60);
  const secs = timerRemaining % 60;
  const timerEl = document.getElementById('timer-display');
  if (timerEl) timerEl.textContent =
    `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const progress = document.getElementById('timer-progress');
  if (progress) {
    const circumference = 2 * Math.PI * 45; // 283
    const offset = circumference * (1 - timerRemaining / timerDuration);
    progress.style.strokeDashoffset = offset;
  }
}
function toggleTimer() {
  const btn = document.getElementById('timer-toggle-btn');
  if (timerRunning) {
    timerRunning = false;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    btn.innerHTML = '▶️ 继续';
  } else {
    if (timerRemaining <= 0) {
      timerRemaining = timerDuration;
    }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    timerRunning = true;
    btn.innerHTML = '⏸️ 暂停';
    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerDisplay();
      if (timerRemaining <= 0) {
        finishTimer();
      }
    }, 1000);
    playSound('chime');
  }
}
function resetTimer() {
  timerRunning = false;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerRemaining = timerDuration;
  updateTimerDisplay();
  setHTML('timer-toggle-btn', '▶️ 开始');
  playSound('page');
}
function finishTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  setHTML('timer-toggle-btn', '▶️ 开始');
  playSound('bloom');
  setTimeout(() => playSound('chime'), 300);
  setTimeout(() => playSound('sparkle'), 600);
  addEnergy(20, '专注完成');
  showAlert('🌸', '专注完成！', '你做得真棒～ 好好休息一下，喝口水，奖励一下自己吧 💖');
  checkBadges();
  timerRemaining = timerDuration;
  updateTimerDisplay();
}
function renderTimer() {
  if (!timerRunning) {
    timerRemaining = timerDuration;
    updateTimerDisplay();
  }
  selectTimerMode(timerMode);
  const mins = timerDuration / 60;
  selectTimerDuration(mins);
}
function renderSky() {
  renderPersonalSky();
  renderProgress();
  renderHabits();
  renderCardCollection();
  renderPalaceFlowerGrid();
  renderPalaceInfo();
  renderPalaceBadges();
  renderPalaceAffirmations();
  renderPalaceStats();
}
function renderCardCollection() {
  const owned = state.cards || [];
  const el = document.getElementById('card-collection');
  const countEl = document.getElementById('card-count');
  if (countEl) countEl.textContent = owned.length;
  if (!el) return;
  el.innerHTML = HEALING_CARDS.map(c => {
    const has = owned.includes(c.id);
    return `
      <div class="aspect-[3/4] rounded-xl flex flex-col items-center justify-center text-center p-1.5 ${has ? 'card-hover cursor-pointer' : ''}"
           style="background:${has ? c.bg : 'rgba(184,169,201,0.1)'}; ${has ? '' : 'filter:grayscale(1); opacity:0.4'}"
           onclick="${has ? `showCardDetail('${c.id}')` : ''}">
        <div class="text-xl mb-0.5">${has ? c.emoji : '❓'}</div>
        <div class="text-[9px] font-medium" style="color:${has ? 'white' : 'var(--theme-text)'}; ${has ? 'text-shadow:0 1px 2px rgba(0,0,0,0.2)' : ''}">${has ? c.name : '未解锁'}</div>
      </div>
    `;
  }).join('');
}
function showCardDetail(id) {
  const card = HEALING_CARDS.find(c => c.id === id);
  if (!card) return;
  showAlert(card.emoji, card.name, card.desc);
  playSound('chime');
}
function renderPersonalSky() {
  const sky = document.getElementById('personal-sky');
  if (!sky) return;
  const oldStars = sky.querySelectorAll('.absolute.cursor-pointer');
  oldStars.forEach(s => s.remove());
  state.wishes.forEach(w => {
    const star = document.createElement('div');
    star.className = `absolute cursor-pointer transition-all duration-500 ${w.done ? 'animate-breath' : 'animate-twinkle'}`;
    star.style.left = (w.skyX || 20) + '%';
    star.style.top = (w.skyY || 20) + '%';
    star.style.fontSize = w.done ? '30px' : '20px';
    star.style.filter = w.done ? 'drop-shadow(0 0 10px #FCD34D)' : 'none';
    star.textContent = w.done ? '🌟' : '⭐';
    star.title = w.be || w.have || '愿望';
    star.onclick = () => toggleWishDone(w.id);
    sky.appendChild(star);
  });
  setText('sky-total', state.wishes.length);
  setText('sky-done', state.wishes.filter(w => w.done).length);
}
function renderProgress() {
  const belief = Math.min((state.purify.total || 0) / 21 * 100, 100);
  const vision = state.wishes.length > 0 ? Math.min(100, state.wishes.length * 20) : 0;
  const state_pct = state.satsCount + state.revisionCount > 0 ? Math.min(100, (state.satsCount + state.revisionCount) * 15) : 0;
  const action = state.garden.flowers ? Math.min(100, state.garden.flowers.filter(f => f.done).length * 5) : 0;
  setText('progress-belief', Math.round(belief) + '%');
  setStyle('progress-bar-belief', 'width', belief + '%');
  setText('progress-vision', Math.round(vision) + '%');
  setStyle('progress-bar-vision', 'width', vision + '%');
  setText('progress-state', Math.round(state_pct) + '%');
  setStyle('progress-bar-state', 'width', state_pct + '%');
  setText('progress-action', Math.round(action) + '%');
  setStyle('progress-bar-action', 'width', action + '%');
  let nextStep = '';
  if (state.testHistory.length === 0) nextStep = '从星光水晶测试神殿开始，了解你的星愿起点吧～';
  else if (belief < 30) nextStep = '建议先去信念净化塔，清理你的核心卡点信念。';
  else if (vision < 30) nextStep = '去许愿星台，用BE-DO-HAVE模型写下你的愿望。';
  else if (state_pct < 30) nextStep = '试试云端冥想城堡的SATS和情绪调频，提升你的能量状态。';
  else if (action < 30) nextStep = '去灵感行动花田，跟随你的灵感种一朵花吧。';
  else nextStep = '你做得太棒了！继续保持，成长就在眼前～ ✨';
  setText('next-step-suggestion', nextStep);
}
function renderPalaceFlowerGrid() {
  const el = document.getElementById('palace-flower-grid');
  if (!el) return;
  const flowers = state.garden.flowers || [];
  const typeEmojis = { love: '🌸', money: '🌻', beauty: '💐', heal: '🌿', study: '🌷', life: '🌺' };
  const cells = 24;
  let html = '';
  for (let i = 0; i < cells; i++) {
    const f = flowers[i];
    if (f && f.done) html += `<div class="flower-cell grown">${typeEmojis[f.type] || '🌸'}</div>`;
    else if (f) html += `<div class="flower-cell">🌱</div>`;
    else html += `<div class="flower-cell opacity-30">·</div>`;
  }
  el.innerHTML = html;
}
function renderPalaceInfo() {
  const palaceNickname = document.getElementById('palace-nickname');
  if (palaceNickname) palaceNickname.value = state.nickname;
  setText('palace-energy', state.energy);
  setText('palace-wishes', state.wishes.length);
  setText('palace-flowers', (state.garden.flowers || []).filter(f => f.done).length);
  setText('palace-badges', state.badges.length);
  setText('palace-level', getLevel());
  const p = PERSONAS.find(x => x.id === state.mainPersona);
  setText('palace-persona-name', p ? p.name : '待解锁');
  const avatarEl = document.getElementById('palace-avatar');
  if (p) {
    avatarEl.innerHTML = getFlowerSVG(p, 40);
    avatarEl.style.background = `linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2})`;
  }
  const cardEl = document.getElementById('palace-persona-card');
  if (p) {
    cardEl.innerHTML = `
      <div class="flex items-center gap-3 cursor-pointer" onclick="viewPersona('${p.id}')">
        <div class="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style="background:linear-gradient(135deg, ${p.flowerColor1}, ${p.flowerColor2}); box-shadow:0 4px 12px ${p.color}30">
          ${getFlowerSVG(p, 36)}
        </div>
        <div class="text-left min-w-0 flex-1">
          <h4 class="font-display text-base" style="color:${p.color}">${p.name}</h4>
          <p class="text-xs mb-1" style="color:var(--theme-text); opacity:0.6">${p.flower} · ${p.animal}</p>
          <div class="flex flex-wrap gap-1">
            <span class="text-[10px] px-2 py-0.5 rounded-full" style="background:${p.color}20; color:${p.color}">${p.trait}</span>
          </div>
        </div>
      </div>
    `;
  }
}
function renderPalaceBadges() {
  const el = document.getElementById('palace-badges-wall');
  if (!el) return;
  el.innerHTML = BADGES.map(b => {
    const got = state.badges.includes(b.id);
    return `<div class="badge-item text-center ${got ? '' : 'opacity-30 grayscale'}" title="${b.desc}">
      <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg" style="background:linear-gradient(135deg, rgba(240,213,224,0.2), rgba(184,169,201,0.15))">${b.icon}</div>
      <div class="text-[10px] mt-0.5 truncate" style="color:var(--theme-text); opacity:0.6">${b.name}</div>
    </div>`;
  }).join('');
}
function renderPalaceAffirmations() {
  const el = document.getElementById('palace-affirmations');
  if (state.affirmations.saved.length === 0) {
    el.innerHTML = `<div class="text-center py-5 text-sm" style="color:var(--theme-text); opacity:0.4">收藏喜欢的肯定语，随时听～</div>`;
    return;
  }
  el.innerHTML = state.affirmations.saved.slice(0, 10).map((a, i) => `
    <div class="p-2 rounded-xl flex items-center justify-between gap-2" style="background:linear-gradient(135deg, rgba(240,213,224,0.15), rgba(184,169,201,0.08))">
      <span class="flex-1 truncate cursor-pointer text-xs" style="color:var(--theme-text); opacity:0.8" onclick="speakAffirm('${(a||'').replace(/'/g, "\\'")}')">💫 ${a}</span>
      <button onclick="removePalaceAffirm(${i})" class="shrink-0" style="color:var(--theme-text); opacity:0.3">×</button>
    </div>
  `).join('');
}
function removePalaceAffirm(i) {
  state.affirmations.saved.splice(i, 1);
  saveState();
  renderPalaceAffirmations();
}
function renderPalaceStats() {
  const start = state.startDate ? new Date(state.startDate) : new Date(); if (isNaN(start.getTime())) start = new Date();
  const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  setText('palace-days', days);
  setText('palace-tests', state.testHistory.length);
  setText('palace-diaries', state.diaries.length);
}
function updateNickname(val) {
  state.nickname = val || '小公主';
  saveState();
  updateGreeting();
  showToast('昵称已更新 ✨');
}
function updateHomeStats() {
  const wishesEl = document.getElementById('home-stat-wishes');
  if (wishesEl) wishesEl.textContent = state.wishes.length;
  const purifyEl = document.getElementById('home-stat-purify');
  if (purifyEl) purifyEl.textContent = (state.purify && state.purify.total) || 0;
  const flowersEl = document.getElementById('home-stat-flowers');
  if (flowersEl) flowersEl.textContent = ((state.garden && state.garden.flowers) || []).filter(f => f.done).length;
  const start = state.startDate ? new Date(state.startDate) : new Date(); if (isNaN(start.getTime())) start = new Date();
  const days = Math.max(1, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const daysEl = document.getElementById('home-stat-days');
  if (daysEl) daysEl.textContent = days;
  if (state.affirmations && state.affirmations.saved && state.affirmations.saved.length > 0) {
    state.dailyAffirm = state.affirmations.saved[Math.floor(Math.random() * state.affirmations.saved.length)];
  } else {
    let allAffirms = [];
    Object.values(AFFIRMATIONS).forEach(cat => {
      Object.values(cat.subs).forEach(sub => { allAffirms = allAffirms.concat(sub.list); });
    });
    state.dailyAffirm = allAffirms[Math.floor(Math.random() * allAffirms.length)];
  }
  const affirmEl = document.getElementById('daily-affirm-text');
  if (affirmEl) affirmEl.textContent = state.dailyAffirm;
}
document.querySelectorAll('.modal-backdrop').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
});
function createFireflies() {
  const container = document.getElementById('fireflies-container');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = Math.random() * 100 + '%';
    f.style.top = Math.random() * 100 + '%';
    f.style.animationDuration = (8 + Math.random() * 10) + 's';
    f.style.animationDelay = Math.random() * 6 + 's';
    f.style.opacity = 0.15 + Math.random() * 0.4;
    container.appendChild(f);
  }
}
let __initDone = false;
let __initInterval = null;
function init() {
  if (__initDone) return;
  __initDone = true;
  trackAppStart();
  setTimeout(() => {
    try {
      const sk = document.getElementById('skeleton-screen');
      if (sk) { sk.style.display = 'none'; sk.classList.add('hidden'); setTimeout(() => sk.remove(), 500); }
    } catch(e) {}
  }, 300);
  try {
    createFireflies();
    updateTopbar();
    updateGreeting();
    const dailyEl = document.getElementById('daily-affirm-text');
    if (dailyEl) dailyEl.textContent = state.dailyAffirm;
    updateMoodDisplay();
    if (state.todayMood && state.todayMood.date === getTodayStr()) {
      const detailEl = document.getElementById('mood-detail');
      if (detailEl) detailEl.classList.remove('hidden');
      moodTagSelected = state.todayMood.tags || [];
      setTimeout(() => {
        document.querySelectorAll('.mood-tag').forEach(el => {
          const t = el.dataset.tag;
          if (moodTagSelected.includes(t)) {
            el.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
            el.style.color = 'white';
            el.style.opacity = '1';
          }
        });
        const noteEl = document.getElementById('mood-note');
        if (noteEl && state.todayMood.note) noteEl.value = state.todayMood.note;
      }, 100);
    }
    updateTimeAndWeather();
    updateHomeStats();
    const today = getTodayStr();
    const lastDay = (() => { try { return localStorage.getItem('cosmos_island_lastday_v3'); } catch(e) { return null; } })();
    if (lastDay !== today) {
      if (state.purify) state.purify.todayCount = 0;
      if (state.garden) state.garden.todayCount = 0;
      state.todayDone = {};
      try { localStorage.setItem('cosmos_island_lastday_v3', today); } catch(e) {}
      saveState();
    }
    const theme = state.theme || 'pink';
    const t = THEMES[theme] || THEMES['pink'];
    if (t && document.documentElement) {
      document.documentElement.style.setProperty('--theme-primary', t.primary);
      document.documentElement.style.setProperty('--theme-secondary', t.secondary);
      document.documentElement.style.setProperty('--theme-accent', t.accent);
      document.documentElement.style.setProperty('--theme-bg', t.bg);
      document.documentElement.style.setProperty('--theme-text', t.text);
    }
    if (document.body) {
      if (state.darkMode) {
        document.body.classList.add('dark');
      } else if (state.darkModeAuto && !state.darkMode) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.matches) document.body.classList.add('dark');
        mq.addEventListener('change', e => {
          if (state.darkModeAuto && !state.darkMode) {
            if (e.matches) document.body.classList.add('dark');
            else document.body.classList.remove('dark');
          }
        });
      }
    }
    if (!state.animation && document.documentElement) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    checkDailyReset();
    checkReminders();
    renderSmartRecommendations();
    renderHeatmap();
    const heatmapWrap = document.getElementById('habit-heatmap-wrapper');
    if (heatmapWrap) {
      const activityLog = StorageUtil.get('activity_log', {});
      const hasActivity = Object.keys(activityLog).length > 0;
      if (hasActivity) heatmapWrap.classList.remove('hidden');
    }
    if ('Notification' in window && state.notifications && Notification.permission === 'granted') {
      scheduleDailyReminders();
    }
    if (__initInterval) clearInterval(__initInterval);
    __initInterval = setInterval(() => {
      updateTimeAndWeather();
      checkReminders();
    }, 60000);
    const hasWelcomed = (() => { try { return localStorage.getItem('cosmos_island_welcomed_v3'); } catch(e) { return null; } })();
    if (!hasWelcomed) {
      showPage('welcome');
    } else {
      goHome();
      const hasTutorialDone = (() => { try { return localStorage.getItem('cosmos_tutorial_done'); } catch(e) { return null; } })();
      if (state.mainPersona && !hasTutorialDone) {
        setTimeout(() => startTutorial(), 800);
      }
    }
    updateFortuneCard();
    checkNewBadges();
    checkExpiryReminder();
    checkRatingPrompt();
  } catch (initErr) {
    console.error('初始化出错:', initErr);
    showToast('初始化遇到一点小问题，请刷新页面重试');
    try { goHome(); } catch(e) {}
  }
}
document.addEventListener('click', function initAudioOnce() {
  initAudio();
}, { once: true });
const CHALLENGE_TASKS = [
  { week: 1, title: "清理与设定", tasks: [
    "写下所有限制性信念，然后撕掉/删掉",
    "创建你的梦想画册",
    "选择3句核心肯定语",
    "睡前15分钟SATS视觉化练习",
    "用修正法改写今天一件不开心的事",
    "写下50件感恩的事",
    "周复盘：记录这周的巧合和感受变化"
  ]},
  { week: 2, title: "深化与安住", tasks: [
    "使用22级情绪刻度，记录全天情绪",
    "正念身体扫描冥想30分钟",
    "做一件平时舍不得做的事（体验丰盛）",
    "给潜意识写一封信",
    "写一封来自未来的信给自己",
    "清理物理空间，为新能量腾位置",
    "周复盘：对比第一周，记录变化"
  ]},
  { week: 3, title: "活在终点", tasks: [
    "全天活在已经拥有的状态",
    "慷慨日：给出你想得到的东西",
    "深度镜子练习",
    "禁食3D：一天不检查现实证据",
    "用绘画/音乐/舞蹈表达你的愿景",
    "宽恕日：宽恕所有伤害过你的人",
    "庆祝日：庆祝你的新身份！"
  ]}
];
let challengeState = { currentDay: 1, completedDays: [], streak: 0, lastCheckIn: null };
function loadChallengeState() {
  try { const s = StorageUtil.get('challenge_state', null); if (s) challengeState = s; } catch(e){}
}
function saveChallengeState() { StorageUtil.set('challenge_state', challengeState); }
function initChallenge() {
  loadChallengeState();
  renderChallenge();
}
function renderChallenge() {
  const d = document.getElementById('challenge-current-day');
  const s = document.getElementById('challenge-streak');
  const c = document.getElementById('challenge-completed');
  const p = document.getElementById('challenge-progress');
  const t = document.getElementById('challenge-tasks');
  const b = document.getElementById('challenge-checkin-btn');
  const m = document.getElementById('challenge-completed-msg');
  const r = document.getElementById('challenge-roadmap');
  if(!d||!s||!c||!p||!t||!b||!m||!r) return;
  d.textContent = challengeState.currentDay;
  s.textContent = challengeState.streak;
  c.textContent = challengeState.completedDays.length;
  p.style.width = (challengeState.completedDays.length/21*100)+'%';
  const wk = Math.min(Math.floor((challengeState.currentDay-1)/7),2);
  const dy = (challengeState.currentDay-1)%7;
  const task = CHALLENGE_TASKS[wk]?.tasks?.[dy] || "保持你的星愿状态";
  const done = challengeState.completedDays.includes(challengeState.currentDay);
  t.innerHTML = `<div class="flex items-start gap-3 p-3 rounded-xl ${done?'bg-green-50':'bg-white/50'}" style="border:1px solid rgba(212,181,199,0.2)"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done?'bg-green-400 text-white':'bg-gray-200'}" style="font-size:12px">${done?'✓':challengeState.currentDay}</div><div><p class="font-medium text-sm" style="color:var(--theme-text)">第${challengeState.currentDay}天 · ${CHALLENGE_TASKS[wk]?CHALLENGE_TASKS[wk].title:'坚持'}</p><p class="text-sm mt-1" style="color:var(--text-soft)">${task}</p></div></div>`;
  b.style.display = done ? 'none' : 'block';
  m.style.display = done ? 'block' : 'none';
  let rh='';
  for(let i=1;i<=21;i++){
    const done=challengeState.completedDays.includes(i);
    const cur=i===challengeState.currentDay;
    rh+=`<div class="aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${done?'text-white':(cur?'':'text-gray-400')}" style="${done?'background:linear-gradient(135deg,#D4B5C7,#B8A9C9)':(cur?'background:rgba(212,181,199,0.3);border:2px solid #B8A9C9':'background:rgba(255,255,255,0.5)')}">${done?'✓':i}</div>`;
  }
  r.innerHTML=rh;
}
function challengeCheckIn() {
  if(challengeState.completedDays.includes(challengeState.currentDay)) return;
  challengeState.completedDays.push(challengeState.currentDay);
  challengeState.streak++;
  if(challengeState.currentDay%7===0) { showToast(`🎉 第${Math.floor(challengeState.currentDay/7)}周完成！`); triggerConfetti(); }
  else showToast('✨ 今日打卡成功！');
  if(challengeState.currentDay<21) challengeState.currentDay++;
  saveChallengeState();
  renderChallenge();
}
function resetChallenge() {
  if(!confirm('确定要重置21天成长挑战吗？所有进度将清空。')) return;
  challengeState={currentDay:1,completedDays:[],streak:0,lastCheckIn:null};
  saveChallengeState();
  renderChallenge();
  showToast('成长挑战已重置');
}
let emotionNotes = [];
function loadEmotionNotes() { try { const s = StorageUtil.get('emotion_notes', null); if (s) emotionNotes = s; } catch(e){} }
function saveEmotionNotes() { StorageUtil.set('emotion_notes', emotionNotes.slice(-30)); }
function onEmotionSlide(val) {
  const e = EMOTION_SCALE[val-1] || EMOTION_SCALE[10];
  const m = document.getElementById('emotion-marker-main');
  const em = document.getElementById('emotion-emoji');
  const n = document.getElementById('emotion-name');
  const d = document.getElementById('emotion-desc');
  const ex = document.getElementById('emotion-exercise');
  if(m) m.style.left = (val/22*100)+'%';
  if(em) em.textContent = e.emoji;
  if(n) { n.textContent = e.name; n.style.color = e.color; }
  if(d) d.textContent = e.desc;
  if(ex) ex.innerHTML = `<div class="font-medium mb-1" style="color:${e.color}">${e.emoji} ${e.name} · 升阶练习</div><div>${e.exercise}</div>`;
}
function saveEmotionNote() {
  const note = document.getElementById('emotion-note');
  if(!note) return;
  const text = note.value.trim();
  if(!text) { showToast('请写下你的感受'); return; }
  const slider = document.getElementById('emotion-slider');
  const val = slider ? (parseInt(slider.value) || 1) : 1;
  const e = EMOTION_SCALE[val-1] || EMOTION_SCALE[0];
  emotionNotes.unshift({ date: new Date().toLocaleDateString('zh-CN'), level: val, name: e.name, emoji: e.emoji, note: text });
  saveEmotionNotes();
  renderEmotionHistory();
  note.value = '';
  showToast('情绪花园已保存');
}
function renderEmotionHistory() {
  const el = document.getElementById('emotion-history');
  if(!el) return;
  if(!emotionNotes.length) { el.innerHTML = '<p class="text-center text-sm" style="color:var(--text-mute)">还没有记录</p>'; return; }
  el.innerHTML = emotionNotes.slice(0,10).map(n => `<div class="p-3 rounded-xl text-sm" style="background:rgba(255,255,255,0.5)"><div class="flex items-center gap-2 mb-1"><span>${escapeHtml(n.emoji)}</span><span class="font-medium">${escapeHtml(n.name)}</span><span class="text-xs ml-auto" style="color:var(--text-mute)">${escapeHtml(n.date)}</span></div><p style="color:var(--text-soft)">${escapeHtml(n.note)}</p></div>`).join('');
}
function initEmotion() {
  loadEmotionNotes();
  onEmotionSlide(11);
  renderEmotionHistory();
}
const SP_AFFIRMATIONS = {
  all: ["我和TA的关系充满了爱、尊重和幸福","TA深深地爱着我，珍视我们的关系","我值得拥有一段充满爱的关系","我吸引了一个完美的伴侣","我和TA之间只有爱与和谐","TA正在想念我，准备联系我","我们之间的问题已经解决，关系比以前更好","我释放所有对关系的担忧，只专注于爱","TA被我的能量深深吸引","我们的爱情故事正在以最美好的方式展开"],
  reunion: ["TA正在想念我，准备联系我","我们之间的问题已经解决，关系比以前更好","TA意识到我是TA生命中最重要的人","我们重新连接，比以前更亲密","TA正在回来的路上","旧故事已经结束，新故事正在展开"],
  new: ["我吸引了一个完美的伴侣","我值得拥有一段充满爱的关系","我的理想伴侣正在进入我的生活","我准备好了迎接真爱","宇宙正在为我安排最完美的相遇","我散发出爱的频率，吸引着爱"],
  deepen: ["我和TA的关系每天都在加深","TA对我越来越投入和专一","我们的沟通充满了理解和温柔","TA总是把我和我们的关系放在第一位","我们的爱每天都在增长","TA向我表达爱意的方式让我感到幸福"]
};
const SP_SCENES = [
  {title:"重逢的拥抱",desc:"想象TA向你走来，你们紧紧拥抱，感受到彼此的温度和心跳。"},
  {title:"甜蜜的电话",desc:"想象手机响起，是TA的来电，TA的声音充满了思念和爱意。"},
  {title:"浪漫的约会",desc:"想象你们在一个美丽的地方约会，TA看着你，眼中满是爱意。"},
  {title:"日常的温馨",desc:"想象一个普通的早晨，你们一起醒来，TA给你一个温柔的早安吻。"},
  {title:"深度的对话",desc:"想象你们进行了一次心灵的对话，TA向你敞开心扉，分享内心最深处的感受。"}
];
let spCurrentCategory = 'all';
let ignore3DMode = false;
function loadSpState() { try { const s = StorageUtil.get('sp_ignore_3d', null); if (s) ignore3DMode = s; } catch(e){} }
function saveSpState() { StorageUtil.set('sp_ignore_3d', ignore3DMode); }
function initSp() {
  loadSpState();
  renderSpAffirmations();
  renderSpScenes();
  const t = document.getElementById('ignore-3d-toggle');
  const s = document.getElementById('ignore-3d-status');
  if(t) t.classList.toggle('on', ignore3DMode);
  if(s) s.style.display = ignore3DMode ? 'block' : 'none';
}
function renderSpAffirmations() {
  const el = document.getElementById('sp-affirmations');
  if(!el) return;
  const items = SP_AFFIRMATIONS[spCurrentCategory] || SP_AFFIRMATIONS.all;
  el.innerHTML = items.map((a,i) => `<div class="p-3 rounded-xl flex items-start gap-3 cursor-pointer sp-affirm-item" data-text="${a.replace(/"/g,'&quot;')}" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)"><div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8)">${i+1}</div><p class="text-sm" style="color:var(--theme-text)">${a}</p></div>`).join('');
  el.querySelectorAll('.sp-affirm-item').forEach(item => {
    item.addEventListener('click', function() { speakSpAffirmation(this.dataset.text); });
  });
}
function switchSpCategory(btn, cat) {
  spCurrentCategory = cat;
  document.querySelectorAll('#page-sp .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSpAffirmations();
}
function speakSpAffirmation(text) {
  if(window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=0.9; u.pitch=1.1; window.speechSynthesis.speak(u); }
  showToast('正在播放肯定语 ✨');
}
function renderSpScenes() {
  const el = document.getElementById('sp-scenes');
  if(!el) return;
  el.innerHTML = SP_SCENES.map(s => `<div class="p-4 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="playSpScene(this)"><div class="font-medium text-sm mb-1" style="color:var(--theme-text)">🎬 ${s.title}</div><p class="text-sm" style="color:var(--text-soft)">${s.desc}</p></div>`).join('');
}
function playSpScene(el) {
  el.style.background = 'linear-gradient(135deg,rgba(232,181,200,0.2),rgba(200,165,216,0.2))';
  setTimeout(() => { el.style.background = 'rgba(255,255,255,0.5)'; }, 2000);
  showToast('闭上眼睛，沉浸在这个场景中 💕');
}
function toggleIgnore3D() {
  ignore3DMode = !ignore3DMode;
  const t = document.getElementById('ignore-3d-toggle');
  const s = document.getElementById('ignore-3d-status');
  if(t) t.classList.toggle('on', ignore3DMode);
  if(s) s.style.display = ignore3DMode ? 'block' : 'none';
  saveSpState();
  showToast(ignore3DMode ? '🛡️ 忽略3D模式已开启' : '忽略3D模式已关闭');
}
const WEALTH_AFFIRMATIONS = [
  "我是金钱的磁铁，钱从各种意想不到的渠道流向我",
  "我值得拥有我所渴望的一切丰盛",
  "我花钱的时候感到开心，因为我知道更多的钱正在来的路上",
  "我的收入每个月都在增长",
  "我是丰盛的，金钱爱我，我也爱金钱",
  "我轻松吸引财富和机会",
  "我的银行账户余额正在不断扩大",
  "我感恩我现在拥有的，也欢迎更多丰盛的到来",
  "我的财富是用来祝福自己和他人的工具",
  "我释放所有对金钱的恐惧和限制，我完全自由"
];
let wealthChecks = [];
let incomeLogs = [];
function loadWealthData() {
  try { const c = StorageUtil.get('wealth_checks', []); const i = StorageUtil.get('wealth_income', []); if(c) wealthChecks=c; if(i) incomeLogs=i; } catch(e){}
}
function saveWealthData() { StorageUtil.set('wealth_checks', wealthChecks); StorageUtil.set('wealth_income', incomeLogs); }
function initWealth() {
  loadWealthData();
  renderWealthAffirmations();
  renderMagicChecks();
  renderIncomeLogs();
  renderWealthSymbols();
}
function renderWealthAffirmations() {
  const el = document.getElementById('wealth-affirmations');
  if(!el) return;
  el.innerHTML = WEALTH_AFFIRMATIONS.map((a,i) => `<div class="p-3 rounded-xl flex items-center gap-3 cursor-pointer wealth-affirm-item" data-text="${a.replace(/"/g,'&quot;')}" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)"><div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs" style="background:linear-gradient(135deg,#FDE68A,#F59E0B)">${i+1}</div><p class="text-sm" style="color:var(--theme-text)">${a}</p></div>`).join('');
  el.querySelectorAll('.wealth-affirm-item').forEach(item => {
    item.addEventListener('click', function() { speakWealthAffirmation(this.dataset.text); });
  });
}
function speakWealthAffirmation(text) {
  if(window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=0.9; u.pitch=1; window.speechSynthesis.speak(u); }
  showToast('正在播放丰盛肯定语 💰');
}
function checkWealthBeliefs() {
  const checked = Array.from(document.querySelectorAll('.wealth-belief:checked')).map(cb => cb.value);
  const resultEl = document.getElementById('wealth-belief-result');
  if(!resultEl) return;
  resultEl.classList.remove('hidden');
  if(checked.length >= 2) resultEl.innerHTML = `<div class="font-medium mb-1" style="color:#B45309">🧹 检测到 ${checked.length} 个限制性信念</div><div>这些信念正在阻碍你的丰盛流动。选择一句肯定语，每天重复21次，持续21天。</div>`;
  else if(checked.length === 1) resultEl.innerHTML = `<div class="font-medium mb-1" style="color:#B45309">🌱 1个信念需要清理</div><div>你已经很棒了！只需要再释放一点点阻力，丰盛就会涌入。</div>`;
  else resultEl.innerHTML = `<div class="font-medium mb-1" style="color:#B45309">✨ 你的财富意识很开放！</div><div>继续保持丰盛频率，你已经走在正确的道路上。</div>`;
}
function saveMagicCheck() {
  const amt = document.getElementById('magic-check-amount');
  const purpose = document.getElementById('magic-check-purpose');
  if(!amt || !purpose) return;
  const a = amt.value.trim(); const p = purpose.value.trim();
  if(!a || !p) { showToast('请填写金额和用途'); return; }
  wealthChecks.unshift({ date: new Date().toLocaleDateString('zh-CN'), amount: a, purpose: p });
  saveWealthData();
  renderMagicChecks();
  amt.value = ''; purpose.value = '';
  showToast('🪄 魔法支票已签发！'); triggerConfetti();
}
function renderMagicChecks() {
  const el = document.getElementById('magic-check-history');
  if(!el) return;
  if(!wealthChecks.length) { el.innerHTML = '<p class="text-center text-sm" style="color:var(--text-mute)">还没有魔法支票</p>'; return; }
  el.innerHTML = wealthChecks.slice(0,5).map(c => `<div class="p-3 rounded-xl text-sm flex items-center justify-between" style="background:rgba(254,243,199,0.3);border:1px solid rgba(251,191,36,0.15)"><div><div class="font-medium" style="color:#B45309">¥${escapeHtml(c.amount)}</div><div class="text-xs" style="color:var(--text-soft)">${escapeHtml(c.purpose)}</div></div><div class="text-xs" style="color:var(--text-mute)">${escapeHtml(c.date)}</div></div>`).join('');
}
function addIncomeLog() {
  const amt = document.getElementById('wealth-income-amount');
  const src = document.getElementById('wealth-income-source');
  if(!amt || !src) return;
  const a = amt.value.trim(); const s = src.value.trim();
  if(!a || !s) { showToast('请填写金额和来源'); return; }
  incomeLogs.unshift({ date: new Date().toLocaleDateString('zh-CN'), amount: a, source: s });
  saveWealthData();
  renderIncomeLogs();
  amt.value = ''; src.value = '';
  showToast('💰 进账已记录！感恩');
}
function renderIncomeLogs() {
  const el = document.getElementById('wealth-income-list');
  if(!el) return;
  if(!incomeLogs.length) { el.innerHTML = '<p class="text-center text-sm" style="color:var(--text-mute)">还没有记录</p>'; return; }
  el.innerHTML = incomeLogs.slice(0,10).map(l => `<div class="p-3 rounded-xl text-sm flex items-center justify-between" style="background:rgba(255,255,255,0.5)"><div><span class="font-medium" style="color:var(--theme-text)">+¥${escapeHtml(l.amount)}</span> <span style="color:var(--text-soft)">来自 ${escapeHtml(l.source)}</span></div><div class="text-xs" style="color:var(--text-mute)">${escapeHtml(l.date)}</div></div>`).join('');
}
function renderWealthSymbols() {
  const el = document.getElementById('wealth-symbols');
  if(!el) return;
  const symbols = [
    {s:"💧",t:"水",d:"财富流动"},{s:"🌳",t:"树",d:"根基稳固"},{s:"🔑",t:"钥匙",d:"打开机会"},{s:"🚪",t:"门",d:"新通道"},{s:"💎",t:"钻石",d:"珍贵价值"},{s:"🌊",t:"海浪",d:"丰盛涌入"}
  ];
  el.innerHTML = symbols.map(s => `<div class="p-3 rounded-xl text-center" style="background:rgba(255,255,255,0.5)"><div class="text-2xl mb-1">${s.s}</div><div class="text-xs font-medium" style="color:var(--theme-text)">${s.t}</div><div class="text-[10px]" style="color:var(--text-mute)">${s.d}</div></div>`).join('');
}
const MOVIE_PRESCRIPTIONS = [
  {title:"《秘密》The Secret",emoji:"🔮",year:2006,theme:"吸引力法则入门",lesson:"思想创造现实的基础。看完你会明白：你的想法正在塑造你的世界。",scene:"初学者必看",mood:"想要理解成长原理"},
  {title:"《土拨鼠之日》Groundhog Day",emoji:"🔄",year:1993,theme:"重复直到改变",lesson:"直到你学会功课，同样的情境会不断重复。改变内心，才能打破循环。",scene:"陷入循环时",mood:"觉得生活总在重复"},
  {title:"《心灵奇旅》Soul",emoji:"🎹",year:2020,theme:"活在当下的意义",lesson:"火花不是目标，而是对生活的热情。成长不是抓取未来，而是享受当下。",scene:"焦虑未来时",mood:"迷失人生方向"},
  {title:"《盗梦空间》Inception",emoji:"🌀",year:2010,theme:"植入信念",lesson:"潜意识接受真实的能力。一个想法可以像病毒一样生长，直到改变整个世界。",scene:"学习肯定语时",mood:"想理解潜意识如何工作"},
  {title:"《彗星来的那一夜》Coherence",emoji:"🌌",year:2013,theme:"平行现实",lesson:"每个选择都创造一个新的现实分支。你不需要后悔，因为每个版本的你都在体验。",scene:"后悔过去时",mood:"纠结于选择"},
  {title:"《她》Her",emoji:"💌",year:2013,theme:"意识与爱的本质",lesson:"爱是一种意识状态，不依赖于外在形式。成长SP不是操控，而是成为爱本身。",scene:"情感受伤时",mood:"对爱情失望"},
  {title:"《奇异博士》Dr. Strange",emoji:"🧿",year:2016,theme:"多维现实",lesson:"现实只是你感知到的那一层。改变视角，就改变现实。",scene:"扩展认知时",mood:"想要突破限制"},
  {title:"《降临》Arrival",emoji:"🛸",year:2016,theme:"时间与自由意志",lesson:"时间是非线性的，未来影响现在。你的终点状态正在召唤你向它移动。",scene:"理解成长时间线",mood:"急着想要结果"},
  {title:"《楚门的世界》The Truman Show",emoji:"🎥",year:1998,theme:"觉醒",lesson:"你的世界是一个为你设计的体验。当你觉醒，整个舞台都会为你改变。",scene:"怀疑现实时",mood:"觉得被困住"},
  {title:"《Eat Pray Love》",emoji:"🍝",year:2010,theme:"自我发现之旅",lesson:"通过外在旅行完成内在探索。成长不是改变地点，而是改变你携带的能量。",scene:"人生转折点",mood:"渴望改变"}
];
function initMovies() { renderMovies(); }
function renderMovies() {
  const el = document.getElementById('movie-list');
  if(!el) return;
  el.innerHTML = MOVIE_PRESCRIPTIONS.map((m,i) => `<div class="glass-card p-5 card-hover movie-card-item" data-idx="${i}"><div class="flex items-start gap-4"><div class="text-3xl flex-shrink-0">${m.emoji}</div><div class="flex-1"><div class="flex items-center gap-2 mb-1"><h3 class="font-medium" style="color:var(--theme-text)">${m.title}</h3><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.2);color:var(--text-soft)">${m.year}</span></div><div class="text-xs mb-2" style="color:var(--text-mute)">🎬 ${m.theme} · 适合：${m.scene}</div><div class="text-sm p-3 rounded-xl" style="background:rgba(255,255,255,0.5);color:var(--text-soft)"><span class="font-medium" style="color:var(--theme-text)">成长 lesson：</span>${m.lesson}</div></div></div></div>`).join('');
  el.querySelectorAll('.movie-card-item').forEach(item => {
    item.addEventListener('click', function() {
      const m = MOVIE_PRESCRIPTIONS[parseInt(this.dataset.idx)];
      if (m) showToast('🎬 ' + m.title + ' · ' + m.lesson.substring(0,30) + '...');
    });
  });
}
const AI_RESPONSES = {
  "今天情绪很低落": ["抱抱你 🤗 情绪低落的时候，最重要的是不要评判自己。允许自己此刻就是这种感觉。试试深呼吸5次，然后对自己说：'我允许自己感受这一切，但我知道这不是我的终点。' 你想试试看吗？💕","亲爱的，低落的时候就像阴天，太阳并没有消失，只是暂时被云遮住了。☁️→☀️ 你现在在22级情绪刻度的哪一级呢？我们可以从那里慢慢往上走。"],
  "SP不理我怎么办": ["这是3D在试图动摇你，但记住：3D只是旧意识的投影，不是真相！🚫 当SP '不理你' 的时候，其实是在给你空间去安住在你 '已经被爱' 的状态里。不要检查3D，回到你的肯定语。'TA正在想念我，准备联系我。' 重复21次，然后去睡觉。💤💕","🛡️ 启动忽略3D模式！SP 不理你 = 你正在 rearranging 这段关系。把 'TA不理我' 改成 'TA正在处理自己的情绪，准备以更成熟的方式回来'。修正法，现在就用！"],
  "我想成长财富": ["太棒了！💰 财富成长第一步：检查你的信念。你觉得 '赚钱很难' 吗？或者 '有钱人不快乐'？如果勾选了，这些就是你要清理的障碍。然后签发一张魔法支票，填写你渴望的金额，感受已经拥有的喜悦！","你是丰盛的磁铁！现在闭上眼睛，想象你的银行账户里有一笔让你惊喜的数字。感受那种安全感、自由感和感恩。让这种感觉充满你... 这就是成长财富的秘密频率。✨"],
  "给我一句今天的肯定语": ["✨ '我是宇宙最爱的孩子，今天发生的一切都是为了我的最高利益。' ✨ 重复21次，带着感觉说！","🌟 '我已经拥有了我想要的一切，此刻只是享受它成长的过程。' 🌟 这句适合在焦虑的时候用。","💕 '我和SP的关系充满了爱、尊重和幸福。' 💕 如果今天想成长爱情，用这句。","💰 '我是金钱的磁铁，钱从各种意想不到的渠道流向我。' 💰 这是今天的财富肯定语。"],
  "我最近总是焦虑": ["焦虑是因为你在用想象力创造你不想要的东西。😰 每一次焦虑，你都在给那个'坏结果'浇水。试试这个：每次焦虑时，立刻做一个 '修正' —— 想象同一个场景以完美的结局展开。坚持3天，你会发现焦虑自然减少了。🌿","焦虑是情绪刻度的第7级。不需要跳到喜悦，只需要升到 '希望' 就够了。🌱 试试写下：'我允许自己焦虑，但我也相信一切都会好起来。' 然后去做一件让身体动起来的小事，比如整理房间或洗个热水澡。"],
  "如何情绪净化": ["🌊 情绪净化三步法：\n1️⃣ 承认：'我现在感到___，这是可以的。'\n2️⃣ 释放：深呼吸5次，想象负面情绪随着呼气离开身体\n3️⃣ 替换：用一个积极画面替换——想象你想要的结果已经实现\n每天坚持一次，7天后你会发现自己的情绪容器干净多了。","💧 试试 '情绪冲洗法'：准备一杯温水，双手捧着，对着水说出你现在的感受，然后把水慢慢喝掉。象征性地让情绪流动并被转化。听起来有点神秘，但很多人反馈很有效哦～"],
  "我的命运": ["🔮 命运不是写好的剧本，而是你每一个念头的累积。你现在的想法、情绪和行动，正在编织明天的故事。想改变命运？从改变下一个念头开始。","🌙 你的命运之轮正在转动。过去的选择造就了现在，现在的选择创造未来。好消息是：每一个当下，你都有重新选择的权力。这就是自由意志的魔法。"],
  default: ["我在听呢～💕 你可以多告诉我一些细节，或者试试我们的情绪导航器、21天成长挑战，这些都是为你准备的工具。","嗯嗯，我理解你的感受。成长有时候像是种花，你看不到根在生长，但它在。🌱 保持你的肯定语，不要检查3D，相信过程。","这是个很好的觉察！✨ 记录在你的星辰日记里吧，过一段时间回头看，你会发现自己走了多远。","宇宙永远站在你这边。🌙 你所渴望的，也正在渴望你。保持你的频率，不要放弃。","需要力量的时候，去历练页面看看你的任务完成率和专注时长吧。数据不会撒谎，你在悄悄变强 💪"]
};
  "今天情绪很低落": ["抱抱你 🤗 情绪低落的时候，最重要的是不要评判自己。允许自己此刻就是这种感觉。试试深呼吸5次，然后对自己说：'我允许自己感受这一切，但我知道这不是我的终点。' 你想试试看吗？💕","亲爱的，低落的时候就像阴天，太阳并没有消失，只是暂时被云遮住了。☁️→☀️ 你现在在22级情绪刻度的哪一级呢？我们可以从那里慢慢往上走。"],
  "SP不理我怎么办": ["这是3D在试图动摇你，但记住：3D只是旧意识的投影，不是真相！🚫 当SP '不理你' 的时候，其实是在给你空间去安住在你 '已经被爱' 的状态里。不要检查3D，回到你的肯定语。'TA正在想念我，准备联系我。' 重复21次，然后去睡觉。💤💕","🛡️ 启动忽略3D模式！SP 不理你 = 你正在 rearranging 这段关系。把 'TA不理我' 改成 'TA正在处理自己的情绪，准备以更成熟的方式回来'。修正法，现在就用！"],
  "我想成长财富": ["太棒了！💰 财富成长第一步：检查你的信念。你觉得 '赚钱很难' 吗？或者 '有钱人不快乐'？如果勾选了，这些就是你要清理的障碍。然后签发一张魔法支票，填写你渴望的金额，感受已经拥有的喜悦！","你是丰盛的磁铁！现在闭上眼睛，想象你的银行账户里有一笔让你惊喜的数字。感受那种安全感、自由感和感恩。让这种感觉充满你... 这就是成长财富的秘密频率。✨"],
  "给我一句今天的肯定语": ["✨ '我是宇宙最爱的孩子，今天发生的一切都是为了我的最高利益。' ✨ 重复21次，带着感觉说！","🌟 '我已经拥有了我想要的一切，此刻只是享受它成长的过程。' 🌟 这句适合在焦虑的时候用。","💕 '我和SP的关系充满了爱、尊重和幸福。' 💕 如果今天想成长爱情，用这句。","💰 '我是金钱的磁铁，钱从各种意想不到的渠道流向我。' 💰 这是今天的财富肯定语。"],
  "我最近总是焦虑": ["焦虑是因为你在用想象力创造你不想要的东西。😰 每一次焦虑，你都在给那个'坏结果'浇水。试试这个：每次焦虑时，立刻做一个 '修正' —— 想象同一个场景以完美的结局展开。坚持3天，你会发现焦虑自然减少了。🌿","焦虑是情绪刻度的第7级。不需要跳到喜悦，只需要升到 '希望' 就够了。🌱 试试写下：'我允许自己焦虑，但我也相信一切都会好起来。' 然后去做一件让身体动起来的小事，比如整理房间或洗个热水澡。"],
  default: ["我在听呢～💕 你可以多告诉我一些细节，或者试试我们的情绪导航器、21天成长挑战，这些都是为你准备的工具。","嗯嗯，我理解你的感受。成长有时候像是种花，你看不到根在生长，但它在。🌱 保持你的肯定语，不要检查3D，相信过程。","这是个很好的觉察！✨ 记录在你的星辰日记里吧，过一段时间回头看，你会发现自己走了多远。","宇宙永远站在你这边。🌙 你所渴望的，也正在渴望你。保持你的频率，不要放弃。"]
};
let aiChatHistory = [];
function loadAiHistory() { try { const s = StorageUtil.get('ai_chat_history', []); if (s) aiChatHistory = s; } catch(e){} }
function saveAiHistory() { StorageUtil.set('ai_chat_history', aiChatHistory.slice(-50)); }
function initAi() { loadAiHistory(); renderAiChat(); }
function renderAiChat() {
  const area = document.getElementById('ai-chat-area');
  if(!area || !aiChatHistory.length) return;
  aiChatHistory.forEach(msg => appendAiMessage(msg.text, msg.fromUser, false));
}
function appendAiMessage(text, fromUser, save) {
  const area = document.getElementById('ai-chat-area');
  if(!area) return;
  const div = document.createElement('div');
  div.className = 'flex items-start gap-3 ' + (fromUser ? 'flex-row-reverse' : '');
  div.innerHTML = fromUser ? `<div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style="background:linear-gradient(135deg,#B8A9C9,#D4B5C7)">🌸</div><div class="p-4 rounded-2xl rounded-tr-sm text-sm" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8);color:white;max-width:75%">${escapeHtml(text)}</div>` : `<div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8)">🌙</div><div class="p-4 rounded-2xl rounded-tl-sm text-sm" style="background:rgba(255,255,255,0.8);color:var(--theme-text);max-width:75%">${escapeHtml(text)}</div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  if(save) { aiChatHistory.push({ text, fromUser, time: Date.now() }); saveAiHistory(); }
}
function sendAiMessage() {
  const input = document.getElementById('ai-input');
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;
  input.value = '';
  appendAiMessage(text, true, true);
  setTimeout(() => { const reply = generateAiReply(text); appendAiMessage(reply, false, true); }, 600 + Math.random() * 800);
}
function sendAiPrompt(text) {
  const input = document.getElementById('ai-input');
  if(input) input.value = text;
  sendAiMessage();
}
function generateAiReply(text) {
  // Data-driven: check if user is asking about their data/stats
  const dataQuestions = ['我做得怎么样', '我的数据', '我本周', '我本周表现', '我的任务', '我完成了多少', '我的专注', '我的成长'];
  if (dataQuestions.some(q => text.includes(q))) {
    return generateFateLensReply();
  }
  for(const key in AI_RESPONSES) { if(key === 'default') continue; if(text.includes(key) || key.includes(text.substring(0,6))) { const r = AI_RESPONSES[key]; return r[Math.floor(Math.random()*r.length)]; } }
  if(text.includes('财富') || text.includes('钱') || text.includes('穷')) { const r = AI_RESPONSES['我想成长财富']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('SP') || text.includes('他') || text.includes('她') || text.includes('复合') || text.includes('分手')) { const r = AI_RESPONSES['SP不理我怎么办']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('低落') || text.includes('难过') || text.includes('伤心') || text.includes('哭')) { const r = AI_RESPONSES['今天情绪很低落']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('焦虑') || text.includes('紧张') || text.includes('不安')) { const r = AI_RESPONSES['我最近总是焦虑']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('肯定语')) { const r = AI_RESPONSES['给我一句今天的肯定语']; return r[Math.floor(Math.random()*r.length)]; }
  const d = AI_RESPONSES['default']; return d[Math.floor(Math.random()*d.length)];
}
function generateFateLensReply() {
  try {
    const questState = safeLocalStorage.getObject('wish_island_quest_v1', {});
    const sessions = safeLocalStorage.getObject('wish_island_sessions_v1', []);
    const radar = safeLocalStorage.getObject('wish_island_radar_v1', {});
    const quests = questState.quests || [];
    const total = quests.length;
    const done = quests.filter(q => q.status === 'done').length;
    const rate = total > 0 ? Math.round(done / total * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const todaySec = sessions.filter(s => s.date === today).reduce((a, s) => a + (s.duration || 0), 0);
    const todayMin = Math.round(todaySec / 60);
    let reply = '📡 命运透镜为你扫描中...\n\n';
    reply += `✅ 任务完成率：${done}/${total}（${rate}%）\n`;
    reply += `⏱️ 今日专注：${todayMin} 分钟\n`;
    if (radar.action) {
      const topDim = Object.entries(radar).sort((a, b) => b[1] - a[1])[0];
      const dimNames = { action: '行动力', create: '创造力', empathy: '共情力', stable: '稳定力', charm: '魅力' };
      reply += `🌟 最强维度：${dimNames[topDim[0]] || topDim[0]}（${topDim[1]}/10）\n`;
    }
    reply += '\n💫 ';
    if (rate >= 80) reply += '你本周的状态非常棒！保持这个节奏，成果正在路上。';
    else if (rate >= 50) reply += '进度不错，但还有提升空间。试试把大任务拆成更小的步骤。';
    else if (total > 0) reply += '别灰心，开始行动就是最大的胜利。从一个小任务开始吧！';
    else reply += '还没有任务记录？去历练页面添加你的第一个成长小目标吧 🌱';
    return reply;
  } catch(e) {
    return '📡 命运透镜暂时无法读取你的数据，先去历练页面记录一些成长轨迹吧～';
  }
}
  for(const key in AI_RESPONSES) { if(key === 'default') continue; if(text.includes(key) || key.includes(text.substring(0,6))) { const r = AI_RESPONSES[key]; return r[Math.floor(Math.random()*r.length)]; } }
  if(text.includes('财富') || text.includes('钱') || text.includes('穷')) { const r = AI_RESPONSES['我想成长财富']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('SP') || text.includes('他') || text.includes('她') || text.includes('复合') || text.includes('分手')) { const r = AI_RESPONSES['SP不理我怎么办']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('低落') || text.includes('难过') || text.includes('伤心') || text.includes('哭')) { const r = AI_RESPONSES['今天情绪很低落']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('焦虑') || text.includes('紧张') || text.includes('不安')) { const r = AI_RESPONSES['我最近总是焦虑']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('肯定语')) { const r = AI_RESPONSES['给我一句今天的肯定语']; return r[Math.floor(Math.random()*r.length)]; }
  const d = AI_RESPONSES['default']; return d[Math.floor(Math.random()*d.length)];
}
let currentShareText = '';
function openShareCard(text) {
  currentShareText = text || getDailyAffirmation() || '我正在成长我想要的一切 ✨';
  const modal = document.getElementById('share-card-modal');
  const contentEl = document.getElementById('share-card-content');
  const dateEl = document.getElementById('share-card-date');
  if(modal) modal.classList.add('show');
  if(contentEl) contentEl.textContent = currentShareText;
  if(dateEl) dateEl.textContent = new Date().toLocaleDateString('zh-CN', {month:'long', day:'numeric', weekday:'long'});
}
function closeShareCard() { const modal = document.getElementById('share-card-modal'); if(modal) modal.classList.remove('show'); }
function getDailyAffirmation() { const all = [...(typeof WEALTH_AFFIRMATIONS !== 'undefined' ? WEALTH_AFFIRMATIONS : []), ...(typeof SP_AFFIRMATIONS !== 'undefined' ? (SP_AFFIRMATIONS.all || []) : [])]; if(all.length) return all[Math.floor(Math.random()*all.length)]; return null; }
function downloadShareCard() { showToast('💡 提示：请截图保存这张卡片！'); const card = document.getElementById('share-card-preview'); if(card) { card.style.transform = 'scale(1.02)'; setTimeout(() => card.style.transform = 'scale(1)', 300); } }
function copyShareText() {
  const text = `✨ 许愿岛 · 星辰日记\n\n📅 ${new Date().toLocaleDateString('zh-CN')}\n\n${currentShareText}\n\n🏝️ 下载许愿岛，一起成长梦想！`;
  if(navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('分享文案已复制 ✨')).catch(err => console.warn('剪贴板复制失败:', err)); }
  else showToast(text.substring(0, 60) + '...');
}
const DREAM_SYMBOLS = [
  {symbol:"水",emoji:"💧",meaning:"情绪与潜意识流动。清澈=情绪健康；浑浊=需要清理；洪水=情绪过载。"},
  {symbol:"蛇",emoji:"🐍",meaning:"转变与重生。蛇蜕皮象征旧我死去、新我诞生。恐惧代表抗拒改变。"},
  {symbol:"飞翔",emoji:"🦋",meaning:"自由与超越。梦见飞翔代表你正在突破限制，渴望更高维度的生活。"},
  {symbol:"房子",emoji:"🏠",meaning:"自我与内心。不同的房间代表不同的面向。地下室=潜意识；阁楼=高我。"},
  {symbol:"门",emoji:"🚪",meaning:"新的机会与选择。打不开的门=恐惧；敞开的门=准备好迎接新开始。"},
  {symbol:"镜子",emoji:"🪞",meaning:"自我认知与反思。镜中的你可能是你希望成为或正在成为的样子。"},
  {symbol:"牙齿脱落",emoji:"🦷",meaning:"焦虑与无力感。常见于压力大或感到失控的时期。提醒自己：你有力量。"},
  {symbol:"考试",emoji:"📝",meaning:"自我评判与测试。你在生活中某个领域感到\"不够格\"，需要肯定自己。"},
  {symbol:"死亡",emoji:"🌙",meaning:"结束与新生。梦中的死亡几乎从不代表肉体死亡，而是旧阶段的结束。"},
  {symbol:"婴儿",emoji:"👶",meaning:"新的创意、项目或自我面向。需要被呵护和培养。"},
  {symbol:"钱",emoji:"💰",meaning:"自我价值与能量。丢失钱=担心价值被否定；收到钱=丰盛正在到来。"},
  {symbol:"动物",emoji:"🐺",meaning:"本能与直觉。不同的动物代表不同的特质（狼=忠诚/野性，猫=独立/直觉）。"}
];
let dreamRecords = [];
function loadDreams() { try { const s = StorageUtil.get('dream_records', []); if (s) dreamRecords = s; } catch(e){} }
function saveDreams() { StorageUtil.set('dream_records', dreamRecords.slice(-50)); }
function initDreams() {
  loadDreams();
  renderDreamSymbols();
  renderDreamHistory();
}
function renderDreamSymbols() {
  const el = document.getElementById('dream-symbols');
  if(!el) return;
  el.innerHTML = DREAM_SYMBOLS.map((s,i) => `<div class="p-3 rounded-xl cursor-pointer dream-symbol-item" data-idx="${i}" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)"><div class="text-xl mb-1">${s.emoji}</div><div class="font-medium text-xs" style="color:var(--theme-text)">${s.symbol}</div><div class="text-[10px] mt-1" style="color:var(--text-mute)">${s.meaning.substring(0,20)}...</div></div>`).join('');
  el.querySelectorAll('.dream-symbol-item').forEach(item => {
    item.addEventListener('click', function() {
      const s = DREAM_SYMBOLS[parseInt(this.dataset.idx)];
      if (s) showToast(s.symbol + '：' + s.meaning.substring(0,40) + '...');
    });
  });
}
function saveDream() {
  const content = document.getElementById('dream-content');
  const mood = document.getElementById('dream-mood');
  const lucid = document.getElementById('dream-lucid');
  if(!content) return;
  const text = content.value.trim();
  if(!text) { showToast('请描述你的梦境'); return; }
  dreamRecords.unshift({
    date: new Date().toLocaleDateString('zh-CN'),
    content: text,
    mood: mood ? mood.value : '',
    lucid: lucid ? lucid.value : '',
    id: Date.now()
  });
  saveDreams();
  renderDreamHistory();
  content.value = '';
  if(mood) mood.value = '';
  if(lucid) lucid.value = '';
  showToast('🌙 梦境已记录');
}
function renderDreamHistory() {
  const el = document.getElementById('dream-history');
  if(!el) return;
  if(!dreamRecords.length) { el.innerHTML = '<p class="text-center text-sm" style="color:var(--text-mute)">还没有梦境记录</p>'; return; }
  el.innerHTML = dreamRecords.slice(0,10).map(d => `<div class="p-3 rounded-xl text-sm" style="background:rgba(255,255,255,0.5)"><div class="flex items-center justify-between mb-1"><span class="font-medium" style="color:var(--theme-text)">${escapeHtml(d.date)}</span><span class="text-xs" style="color:var(--text-mute)">${d.mood ? escapeHtml(d.mood) : ''} ${d.lucid ? (d.lucid==='是' ? '✨' : '') : ''}</span></div><p style="color:var(--text-soft)">${escapeHtml(d.content).substring(0,100)}${d.content.length>100?'...':''}</p></div>`).join('');
}
const DEFAULT_STORIES = [
  {title:"3天成长SP复合",category:"SP复合",content:"我和SP分手2个月，每天坚持SATS和肯定语。第3天早上醒来看到TA的消息，TA说昨晚梦到我，想见我。现在我们比以前更好了！💕",date:"2025-06-15",likes:128},
  {title:"从负债到月入5万",category:"财富",content:"曾经负债累累，觉得自己不配有钱。每天做魔法支票和丰盛肯定语，2个月后意外接到一个大项目，月入5万。最重要的是心态变了！💰",date:"2025-05-20",likes:256},
  {title:"找到理想工作",category:"工作",content:"失业3个月，焦虑到失眠。开始使用情绪导航器，每天升一级情绪。面试前一天做了SATS，想象自己收到offer的样子。第二天真的收到了！🎉",date:"2025-06-01",likes:89},
  {title:"治愈了10年的焦虑",category:"自我成长",content:"以前每天焦虑到崩溃，吃药也没用。21天成长挑战第一周做完，发现自己能平静了。第三周结束时，焦虑消失了。这不仅是成长，是重生。🌱",date:"2025-04-10",likes:312},
  {title:"身体奇迹般康复",category:"健康",content:"医生说需要手术，但我选择用修正法改写诊断结果。每天视觉化自己健康的身体，3个月后复查，医生惊讶地说'不需要手术了'。🏥",date:"2025-03-22",likes:178}
];
let userStories = [];
function loadStories() { try { const s = StorageUtil.get('user_stories', []); if (s) userStories = s; } catch(e){} }
function saveStories() { StorageUtil.set('user_stories', userStories); }
function initStories() { loadStories(); renderStories('all'); }
function renderStories(filter) {
  const el = document.getElementById('stories-list');
  if(!el) return;
  const all = [...DEFAULT_STORIES, ...userStories];
  const filtered = filter === 'all' ? all : all.filter(s => s.category === filter);
  if(!filtered.length) { el.innerHTML = '<p class="text-center text-sm" style="color:var(--text-mute)">这个类别还没有故事</p>'; return; }
  el.innerHTML = filtered.map((s,i) => `<div class="glass-card p-5"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">${escapeHtml(s.category)}</span><span class="text-xs" style="color:var(--text-mute)">${escapeHtml(s.date)}</span></div><div class="flex items-center gap-1 text-xs" style="color:var(--text-mute)"><span>❤️</span><span>${s.likes || 0}</span></div></div><h4 class="font-medium mb-2" style="color:var(--theme-text)">${escapeHtml(s.title)}</h4><p class="text-sm" style="color:var(--text-soft)">${escapeHtml(s.content)}</p></div>`).join('');
}
function filterStories(cat, btn) {
  document.querySelectorAll('#page-stories .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderStories(cat);
}
function submitStory() {
  const title = document.getElementById('story-title');
  const cat = document.getElementById('story-category');
  const content = document.getElementById('story-content');
  if(!title || !cat || !content) return;
  const t = title.value.trim(); const c = cat.value; const txt = content.value.trim();
  if(!t || !c || !txt) { showToast('请填写完整信息'); return; }
  userStories.unshift({ title: t, category: c, content: txt, date: new Date().toLocaleDateString('zh-CN'), likes: 0 });
  saveStories();
  renderStories('all');
  title.value = ''; cat.value = ''; content.value = '';
  showToast('✨ 故事已发布！');
}
const SATS_SCENES = [
  {title:"睡前感恩仪式",desc:"躺在床上，回顾今天发生的3件好事。感受感恩之情从心脏扩散到全身。"},
  {title:"理想的一天",desc:"想象你已经实现了愿望，从早晨醒来到晚上入睡的完整一天。越详细越好。"},
  {title:"收到好消息",desc:"想象你收到了那个好消息——电话响起、消息弹出、门铃响起。感受那一刻的心跳。"},
  {title:"与SP的温馨对话",desc:"想象你和SP在一个舒适的地方聊天，TA对你说了你一直渴望听到的话。"},
  {title:"财富到账",desc:"想象查看银行账户，余额是一个让你惊喜的数字。感受安全、自由、感恩。"},
  {title:"镜中的新我",desc:"站在镜子前，看着镜中的自己——你已经成为了你想成为的那个人。感受那个版本的能量。"}
];
let satsTimerInterval = null;
let satsSeconds = 900; // 15 minutes
function renderSatsScenes() {
  const el = document.getElementById('sats-scenes');
  if(!el) return;
  el.innerHTML = SATS_SCENES.map((s,i) => `<div class="p-4 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="selectSatsScene(${i},this)"><div class="font-medium text-sm mb-1" style="color:var(--theme-text)">🎬 ${s.title}</div><p class="text-sm" style="color:var(--text-soft)">${s.desc}</p></div>`).join('');
}
function selectSatsScene(idx, el) {
  document.querySelectorAll('#sats-scenes > div').forEach(d => d.style.borderColor = 'rgba(212,181,199,0.2)');
  el.style.borderColor = '#B8A9C9';
  showToast(`已选择：${SATS_SCENES[idx].title} 🌙`);
}
function updateSatsTimerDisplay() {
  const el = document.getElementById('sats-timer-main');
  if(!el) return;
  const m = Math.floor(satsSeconds / 60).toString().padStart(2, '0');
  const s = (satsSeconds % 60).toString().padStart(2, '0');
  el.textContent = `${m}:${s}`;
}
function startSatsTimer() {
  if(satsRunning) return;
  satsRunning = true;
  const btnStart = document.getElementById('sats-btn-start');
  const btnPause = document.getElementById('sats-btn-pause');
  if(btnStart) btnStart.classList.add('hidden');
  if(btnPause) btnPause.classList.remove('hidden');
  satsTimerInterval = setInterval(() => {
    if(satsSeconds > 0) { satsSeconds--; updateSatsTimerDisplay(); }
    else { pauseSatsTimer(); showToast('🌙 SATS时间到，愿你带着美好入睡'); }
  }, 1000);
}
function pauseSatsTimer() {
  satsRunning = false;
  if(satsTimerInterval) { clearInterval(satsTimerInterval); satsTimerInterval = null; }
  const btnStart = document.getElementById('sats-btn-start');
  const btnPause = document.getElementById('sats-btn-pause');
  if(btnStart) btnStart.classList.remove('hidden');
  if(btnPause) btnPause.classList.add('hidden');
}
function resetSatsTimer() {
  pauseSatsTimer();
  satsSeconds = 900;
  updateSatsTimerDisplay();
}
function initBackup() { renderDataOverview(); }
function renderDataOverview() {
  const el = document.getElementById('data-overview');
  if(!el) return;
  const keys = ['cosmos_island_state_v3','challenge_state','emotion_notes','sp_ignore_3d','wealth_checks','wealth_income','ai_chat_history','dream_records','user_stories'];
  let html = '';
  for(const k of keys) {
    const data = StorageUtil.get(k, null);
    let size = 0;
    if(data) { try { size = JSON.stringify(data).length; } catch(e){} }
    html += `<div class="flex items-center justify-between p-3 rounded-xl text-sm" style="background:rgba(255,255,255,0.5)"><span style="color:var(--theme-text)">${k}</span><span style="color:var(--text-mute)">${size > 0 ? (size + ' bytes') : '空'}</span></div>`;
  }
  el.innerHTML = html;
}
function exportAllData() {
  const keys = [
    'cosmos_island_state_v3', 'challenge_state', 'emotion_notes', 'sp_ignore_3d',
    'wealth_checks', 'wealth_income', 'ai_chat_history', 'dream_records', 'user_stories',
    'activity_log', 'breathe_records', 'voice_recordings', 'feedback_history',
    'cosmos_treasurebox_state', 'cosmos_timeline_state', 'cosmos_custom_affirms',
    'crystal_state', 'vip_state', 'bootcamp_state'
  ];
  const exportData = { exportDate: new Date().toISOString(), version: '6.4', app: '许愿岛', data: {} };
  for (const k of keys) { const v = StorageUtil.get(k, null); if (v !== null) exportData.data[k] = v; }
  const allKeys = StorageUtil.keys();
  for (const k of allKeys) {
    if (!keys.includes(k) && !k.startsWith('chart_')) {
      const v = StorageUtil.get(k, null);
      if (v !== null) exportData.data[k] = v;
    }
  }
  try {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `许愿岛备份_${new Date().toLocaleDateString('zh-CN')}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('✅ 完整备份已下载（含所有模块数据）💾');
  } catch(e) {
    showToast('备份导出失败: ' + (e.message || '未知错误'));
  }
}
function copyAllData() {
  const keys = [
    'cosmos_island_state_v3', 'challenge_state', 'emotion_notes', 'sp_ignore_3d',
    'wealth_checks', 'wealth_income', 'ai_chat_history', 'dream_records', 'user_stories',
    'activity_log', 'breathe_records', 'voice_recordings', 'feedback_history',
    'cosmos_treasurebox_state', 'cosmos_timeline_state', 'cosmos_custom_affirms'
  ];
  const exportData = { exportDate: new Date().toISOString(), version: '6.4', app: '许愿岛', data: {} };
  for (const k of keys) { const v = StorageUtil.get(k, null); if (v !== null) exportData.data[k] = v; }
  try {
    const text = JSON.stringify(exportData);
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('备份数据已复制 📋')).catch(err => console.warn('剪贴板复制失败:', err)); }
    else showToast('数据太长，请使用导出功能');
  } catch(e) {
    showToast('数据复制失败: ' + (e.message || '未知错误'));
  }
}
function importAllData() {
  const el = document.getElementById('import-data-text');
  if (!el) return;
  const text = el.value.trim();
  if (!text) { showToast('请粘贴备份数据'); return; }
  try {
    const data = JSON.parse(text);
    if (!data.data || typeof data.data !== 'object') { showToast('数据格式错误'); return; }
    const version = data.version || '1.0';
    const appName = data.app || '';
    if (!appName.includes('星愿') && !appName.includes('许愿')) {
      if (!confirm('警告：此备份可能来自其他应用，确定要导入吗？')) return;
    }
    let importCount = 0;
    for (const k in data.data) { StorageUtil.set(k, data.data[k]); importCount++; }
    showToast(`✅ 数据导入成功！共 ${importCount} 项数据`);
    setTimeout(() => location.reload(), 1500);
  } catch (e) { showToast('❌ 导入失败：数据格式错误'); console.error(e); }
}
function openModuleExtended(name) {
  if (name === 'challenge') { showPage('challenge'); initChallenge(); return; }
  if (name === 'emotion') { loadDataScript('data/emotion_scale.js').then(() => { showPage('emotion'); initEmotion(); }); return; }
  if (name === 'sp') { showPage('sp'); initSp(); return; }
  if (name === 'wealth') { showPage('wealth'); initWealth(); return; }
  if (name === 'movies') { showPage('movies'); initMovies(); return; }
  if (name === 'ai') { showPage('ai'); initAi(); return; }
  if (name === 'dreams') { showPage('dreams'); initDreams(); return; }
  if (name === 'stories') { showPage('stories'); initStories(); return; }
  if (name === 'sats') { showPage('sats'); initSats(); return; }
  if (name === 'backup') { showPage('backup'); initBackup(); return; }
  openModule(name);
}
const MEMBER_TIERS = {
  free: { name: '免费体验', color: '#B8A9C9', dailyTarot: 1, dailyAI: 3, dailySats: 1, books: 2, export: false, advancedCharts: false, spFull: false, aiCoach: false, movies: false, dreams: true, stories: true },
  member: { name: '自然会员', color: '#D4B5C7', dailyTarot: 3, dailyAI: 20, dailySats: 3, books: 8, export: true, advancedCharts: true, spFull: true, aiCoach: false, movies: true, dreams: true, stories: true },
  vip: { name: '星际高级会员', color: '#F59E0B', dailyTarot: 999, dailyAI: 999, dailySats: 999, books: 8, export: true, advancedCharts: true, spFull: true, aiCoach: true, movies: true, dreams: true, stories: true }
};
const 星光会员_PRICES = {
  member_month: { name: '月度会员', price: 18, period: '月', tier: 'member' },
  member_year: { name: '年度会员', price: 128, period: '年', tier: 'member', bonus: 100 },
  member_first_month: { name: '首月特惠', price: 6, period: '月', tier: 'member', limited: true },
  vip_month: { name: '高级会员月卡', price: 38, period: '月', tier: 'vip' },
  vip_year: { name: '高级会员年卡', price: 298, period: '年', tier: 'vip', bonus: 200 }
};
let vipState = { tier: 'free', expiry: null, firstUseDate: null, offerShown: false };
let crystalState = { crystals: 0, dailyCheckIn: { date: null, streak: 0 }, inviteCode: null, invitedBy: null, invitedCount: 0, purchaseHistory: [], unlockedBooks: [], aiUnlocks: 0, tasksToday: {} };
let todayUsage = { tarot: 0, ai: 0, sats: 0, date: null };
function loadVipState() {
  try {
    const v = StorageUtil.get('vip_state', null); if (v) vipState = { ...vipState, ...v };
    const c = StorageUtil.get('crystal_state', null); if (c) crystalState = { ...crystalState, ...c };
    const u = StorageUtil.get('today_usage', null); if (u) todayUsage = { ...todayUsage, ...u };
  } catch(e) {}
  if (!vipState.firstUseDate) vipState.firstUseDate = new Date().toISOString();
  resetDailyUsageIfNeeded();
}
function saveVipState() {
  StorageUtil.set('vip_state', vipState);
  StorageUtil.set('crystal_state', crystalState);
  StorageUtil.set('today_usage', todayUsage);
}
function resetDailyUsageIfNeeded() {
  const today = new Date().toLocaleDateString('zh-CN');
  if (todayUsage.date !== today) { todayUsage = { tarot: 0, ai: 0, sats: 0, date: today }; saveVipState(); }
}
function getCurrentTier() {
  if (vipState.tier === 'free') return 'free';
  if (vipState.expiry && new Date(vipState.expiry) > new Date()) return vipState.tier;
  vipState.tier = 'free'; saveVipState(); return 'free';
}
function getTierConfig() { return MEMBER_TIERS[getCurrentTier()] || MEMBER_TIERS.free; }
function isFeatureLocked(feature) {
  const tier = getTierConfig();
  if (feature === 'export') return !tier.export;
  if (feature === 'advancedCharts') return !tier.advancedCharts;
  if (feature === 'spFull') return !tier.spFull;
  if (feature === 'movies') return !tier.movies;
  if (feature === 'aiCoach') return !tier.aiCoach;
  return false;
}
function checkQuota(feature, action) {
  resetDailyUsageIfNeeded();
  const tier = getTierConfig();
  // 检查单次水晶解锁
  const unlockMap = { tarot: 'tarotUnlocks', ai: 'aiUnlocks', sats: 'satsUnlocks' };
  const unlockKey = unlockMap[feature];
  if(unlockKey && crystalState[unlockKey] > 0) {
    crystalState[unlockKey]--;
    saveVipState();
    showToast(`消耗 1 次水晶解锁的${feature === 'ai' ? 'AI对话' : feature === 'tarot' ? '塔罗占卜' : 'SATS放松'} 💎`);
    return true;
  }
  if (feature === 'tarot') { if (todayUsage.tarot >= tier.dailyTarot) { showQuotaLock('星辰塔罗', tier.dailyTarot, 3, 'tarot_once'); return false; } todayUsage.tarot++; saveVipState(); return true; }
  if (feature === 'ai') { if (todayUsage.ai >= tier.dailyAI) { showQuotaLock('AI 对话', tier.dailyAI, 5, 'ai_once'); return false; } todayUsage.ai++; saveVipState(); return true; }
  if (feature === 'sats') { if (todayUsage.sats >= tier.dailySats) { showQuotaLock('SATS 冥想', tier.dailySats, 3, 'sats_once'); return false; } todayUsage.sats++; saveVipState(); return true; }
  if (feature === 'books') { return true; } // book lock handled by book count
  return true;
}
function showQuotaLock(name, limit, crystalCost, crystalType) {
  showLockModal(`今日${name}次数已用完`, `免费用户每天可使用 ${limit} 次。升级会员获得更多次数，或用星光水晶解锁额外使用。`, crystalCost ? { crystalCost, crystalType } : null);
}
function showLockModal(title, desc, options) {
  const t = document.getElementById('lock-title');
  const d = document.getElementById('lock-desc');
  const m = document.getElementById('lock-modal');
  if(t) t.textContent = title || '功能锁定';
  if(d) d.textContent = desc || '升级会员即可解锁此功能';
  // 动态水晶解锁按钮
  const crystalBtn = document.getElementById('lock-crystal-btn');
  if(crystalBtn) {
    if(options && options.crystalCost && options.crystalType) {
      crystalBtn.style.display = 'block';
      crystalBtn.textContent = `💎 ${options.crystalCost} 水晶解锁本次`;
      crystalBtn.onclick = function() {
        closeLockModal();
        unlockWithCrystals(options.crystalType, options.crystalCost);
      };
    } else {
      crystalBtn.style.display = 'none';
    }
  }
  if(m) m.classList.add('show');
}
function closeLockModal() { const m = document.getElementById('lock-modal'); if(m) m.classList.remove('show'); }
function initVip() {
  loadVipState();
  const tier = getCurrentTier();
  const config = getTierConfig();
  const nameEl = document.getElementById('vip-tier-name');
  const descEl = document.getElementById('vip-tier-desc');
  const crystalEl = document.getElementById('vip-crystal-count');
  const upBtn = document.getElementById('vip-upgrade-btn');
  const reBtn = document.getElementById('vip-renew-btn');
  if(nameEl) { nameEl.textContent = config.name; nameEl.style.color = config.color; }
  if(descEl) descEl.textContent = tier === 'free' ? '升级会员，解锁全部成长工具' : `有效期至 ${vipState.expiry ? new Date(vipState.expiry).toLocaleDateString('zh-CN') : '永久'}`;
  if(crystalEl) crystalEl.textContent = crystalState.crystals;
  if(upBtn) upBtn.style.display = tier === 'free' ? 'block' : 'none';
  if(reBtn) reBtn.style.display = tier !== 'free' ? 'block' : 'none';
  // 控制"我的"页面VIP横幅
  const banner = document.getElementById('me-vip-banner');
  if(banner) banner.style.display = tier === 'free' ? 'block' : 'none';
  // 控制"我的"页面VIP标识
  const vipBadge = document.getElementById('me-vip-badge');
  if(vipBadge) vipBadge.style.display = tier !== 'free' ? 'inline-block' : 'none';
  // 首页每日福利更新
  updateDailyBonusCard();
  renderCheckIn();
  renderTasks();
  generateInviteCode();
}
function showVipPlans() { showPage('vip-plans'); startOfferTimer(); }
function renderCheckIn() {
  const streakEl = document.getElementById('checkin-streak');
  if(streakEl) streakEl.textContent = crystalState.dailyCheckIn.streak || 0;
  const today = new Date().toLocaleDateString('zh-CN');
  const done = crystalState.dailyCheckIn.date === today;
  const btn = document.getElementById('checkin-btn');
  const doneBtn = document.getElementById('checkin-done');
  if(btn) btn.style.display = done ? 'none' : 'block';
  if(doneBtn) doneBtn.style.display = done ? 'block' : 'none';
  for(let i=1;i<=7;i++){
    const el = document.getElementById('checkin-d-'+i);
    if(!el) continue;
    if(i <= (crystalState.dailyCheckIn.streak || 0)) {
      el.style.background = 'linear-gradient(135deg,#D4B5C7,#B8A9C9)';
      el.querySelectorAll('div').forEach(d => d.style.color = 'white');
    }
  }
}
function doCheckIn() {
  const today = new Date().toLocaleDateString('zh-CN');
  if(crystalState.dailyCheckIn.date === today) { showToast('今天已经签到过了'); return; }
  let streak = crystalState.dailyCheckIn.streak || 0;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yestStr = yesterday.toLocaleDateString('zh-CN');
  if(crystalState.dailyCheckIn.date === yestStr) streak++; else streak = 1;
  crystalState.dailyCheckIn = { date: today, streak };
  let reward = 5;
  if(streak >= 7) reward = 20;
  if(streak >= 21) reward = 50;
  if(streak >= 30) reward = 100;
  crystalState.crystals += reward;
  crystalState.tasksToday.checkin = true;
  saveVipState();
  renderCheckIn();
  renderTasks();
  updateCrystalDisplay();
  trackCheckIn(streak, reward);
  showToast(`签到成功！连续 ${streak} 天，获得 ${reward} 星光水晶 ✨`);
  triggerConfetti();
}
function renderTasks() {
  const t = crystalState.tasksToday;
  const map = { 'checkin': 'task-checkin', 'challenge': 'task-challenge', 'emotion': 'task-emotion', 'share': 'task-share', 'book': 'task-book' };
  for(const [k, id] of Object.entries(map)) {
    const el = document.getElementById(id);
    if(!el) continue;
    if(t[k]) { el.textContent = '已完成'; el.style.background = 'linear-gradient(135deg,#D4B5C7,#B8A9C9)'; el.style.color = 'white'; }
    else { el.textContent = '进行中'; el.style.background = 'rgba(212,181,199,0.15)'; el.style.color = 'var(--text-soft)'; }
  }
}
function earnCrystals(amount, reason) {
  crystalState.crystals += amount;
  saveVipState();
  updateCrystalDisplay();
  showToast(`获得 ${amount} 星光水晶！${reason} 💎`);
}
function updateCrystalDisplay() {
  const el = document.getElementById('vip-crystal-count');
  if(el) el.textContent = crystalState.crystals;
}
function generateInviteCode() {
  if(!crystalState.inviteCode) {
    crystalState.inviteCode = 'XY' + Math.random().toString(36).substring(2, 8).toUpperCase();
    saveVipState();
  }
  const el = document.getElementById('my-invite-code');
  if(el) el.value = crystalState.inviteCode;
  const countEl = document.getElementById('invited-count');
  if(countEl) countEl.textContent = crystalState.invitedCount;
}
function copyInviteCode() {
  const el = document.getElementById('my-invite-code');
  if(!el) return;
  if(navigator.clipboard) { navigator.clipboard.writeText(el.value).then(() => showToast('邀请码已复制 📋')).catch(err => console.warn('剪贴板复制失败:', err)); }
  else showToast(`邀请码：${el.value}`);
}
function submitInviteCode() {
  const input = document.getElementById('input-invite-code');
  if(!input) return;
  const code = input.value.trim().toUpperCase();
  if(!code) { showToast('请输入邀请码'); return; }
  if(code === crystalState.inviteCode) { showToast('不能输入自己的邀请码'); return; }
  if(crystalState.invitedBy) { showToast('你已经领取过邀请奖励了'); return; }
  if(!code.startsWith('XY') || code.length < 6) { showToast('邀请码无效'); return; }
  crystalState.invitedBy = code;
  crystalState.crystals += 30;
  saveVipState();
  input.value = '';
  updateCrystalDisplay();
  showToast('邀请码验证成功！获得 30 星光水晶 🎉');
  triggerConfetti();
}
function showInvitePage() { showPage('vip'); initVip(); window.scrollTo({ top: 1000, behavior: 'smooth' }); }
function unlockWithCrystals(type, cost) {
  if(crystalState.crystals < cost) { showToast(`星光水晶不足，还需要 ${cost - crystalState.crystals} 个 💎`); showPage('vip'); return; }
  if(!confirm(`确认花费 ${cost} 星光水晶解锁？`)) return;
  crystalState.crystals -= cost;
  trackCrystalUnlock(type, cost);
  if(type === 'book') { /* would need to select a book, simplified for now */ showToast('已解锁书籍！📖'); }
  if(type === 'ai5') { crystalState.aiUnlocks += 5; showToast('已解锁 5 次 AI 对话！🤖'); }
  if(type === 'member1d') { 
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    vipState.tier = 'member'; vipState.expiry = tomorrow.toISOString();
    showToast('已解锁 1 天会员体验！✨'); 
  }
  // 单次解锁场景
  if(type === 'ai_once') { crystalState.aiUnlocks += 1; showToast('已解锁 1 次 AI 对话！🤖'); }
  if(type === 'tarot_once') { crystalState.tarotUnlocks = (crystalState.tarotUnlocks || 0) + 1; showToast('已解锁 1 次塔罗占卜！🔮'); }
  if(type === 'sats_once') { crystalState.satsUnlocks = (crystalState.satsUnlocks || 0) + 1; showToast('已解锁 1 次 SATS 放松！🧘'); }
  if(type === 'movie_once') { crystalState.movieUnlocks = (crystalState.movieUnlocks || 0) + 1; showToast('已解锁 1 次观影！🎬'); }
  saveVipState();
  updateCrystalDisplay();
  triggerConfetti();
}
function selectSubscriptionPlan(planId) {
  const plan = 星光会员_PRICES[planId];
  if(!plan) return;
  showPaymentModal(planId);
}

function showPaymentModal(planId) {
  const plan = 星光会员_PRICES[planId];
  if(!plan) return;
  trackPaymentModal(planId);
  const tierName = plan.tier === 'member' ? '自然会员' : '星际高级会员';
  // 模拟社交证明数字
  const socialProof = 1200 + Math.floor(Math.random() * 300);
  // 创建或复用支付弹窗
  let modal = document.getElementById('payment-modal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.onclick = function(e) { if(e.target === this) closePaymentModal(); };
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div class="modal-content p-6 text-center" style="max-width:360px">
      <div class="text-4xl mb-3">💳</div>
      <h3 class="font-title text-lg mb-1" style="color:var(--theme-text)">确认购买</h3>
      <div class="mb-4">
        <div class="text-sm font-medium mb-1">${tierName} · ${plan.name}</div>
        <div class="text-2xl font-bold" style="color:var(--theme-text)">¥${plan.price}<span class="text-sm font-normal" style="color:var(--text-mute)">/${plan.period}</span></div>
        ${plan.bonus ? `<div class="text-xs mt-1" style="color:var(--text-mute)">额外赠送 ${plan.bonus} 星光水晶 💎</div>` : ''}
      </div>
      <!-- 社交证明 + 倒计时 -->
      <div class="mb-3 p-3 rounded-xl text-center" style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(212,181,199,0.1));border:1px solid rgba(245,158,11,0.15)">
        <div class="text-xs mb-1" style="color:var(--text-mute)">👥 已有 <span class="font-bold" style="color:var(--theme-text)">${socialProof}</span> 人升级会员</div>
        ${plan.limited ? `<div class="text-xs font-medium" style="color:#F59E0B">⏰ 限时特惠 · 剩余 <span id="payment-countdown">05:00</span></div>` : ''}
      </div>
      <div class="space-y-2 mb-4">
        <button type="button" onclick="trackPaymentMethod('${planId}', 'wechat');processPayment('${planId}', 'wechat')" class="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2" style="background:#07C160" aria-label="微信支付">
          <span>💚</span> 微信支付
        </button>
        <button type="button" onclick="trackPaymentMethod('${planId}', 'alipay');processPayment('${planId}', 'alipay')" class="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2" style="background:#1677FF" aria-label="支付宝">
          <span>💙</span> 支付宝
        </button>
      </div>
      <div class="text-xs mb-3 p-3 rounded-xl" style="background:rgba(212,181,199,0.1);color:var(--text-mute)">
        🔒 安全支付 · 购买后自动解锁全部权益<br>
        <span style="opacity:0.7">（当前为演示模式，模拟支付流程）</span>
      </div>
      ${planId === 'member_first_month' && !hasUsedFreeTrial() ? `
      <div class="mb-3 p-3 rounded-xl text-center" style="background:linear-gradient(135deg,rgba(212,181,199,0.15),rgba(245,158,11,0.1));border:1px dashed rgba(212,181,199,0.3)">
        <div class="text-xs mb-2" style="color:var(--text-mute)">不确定是否适合？先免费体验</div>
        <button type="button" onclick="closePaymentModal();claimFreeTrial()" class="btn-soft w-full py-2.5 rounded-xl text-xs font-medium" aria-label="领取1天免费体验">🎁 领取 1 天 VIP 免费体验</button>
      </div>
      ` : ''}
      <button type="button" onclick="closePaymentModal()" class="text-xs" style="color:var(--text-mute);background:transparent;border:none;padding:4px 8px;" aria-label="取消">取消</button>
    </div>
  `;
  modal.classList.add('show');
  // 限时倒计时
  if(plan.limited) {
    let seconds = 300;
    const el = document.getElementById('payment-countdown');
    if(el) {
      const timer = setInterval(() => {
        if(seconds <= 0 || !document.getElementById('payment-modal')?.classList.contains('show')) { clearInterval(timer); return; }
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${s}`;
        seconds--;
      }, 1000);
    }
  }
}
function closePaymentModal() {
  const m = document.getElementById('payment-modal');
  if(m) m.classList.remove('show');
}
function processPayment(planId, method) {
  const plan = 星光会员_PRICES[planId];
  if(!plan) return;
  const tierName = plan.tier === 'member' ? '自然会员' : '星际高级会员';
  // 模拟支付处理
  showToast(`正在调起${method === 'wechat' ? '微信支付' : '支付宝'}...`);
  setTimeout(() => {
    const duration = plan.period === '月' ? 30 : 365;
    const expiry = new Date(); expiry.setDate(expiry.getDate() + duration);
    vipState.tier = plan.tier;
    vipState.expiry = expiry.toISOString();
    crystalState.purchaseHistory.push({ plan: planId, date: new Date().toISOString(), price: plan.price, method: method });
    if(plan.bonus) { crystalState.crystals += plan.bonus; showToast(`额外赠送 ${plan.bonus} 星光水晶！`); }
    saveVipState();
    closePaymentModal();
    trackPaymentSuccess(planId, method);
    showToast(`🎉 支付成功！已升级为 ${tierName}`);
    triggerConfetti();
    // 隐藏"我的"页面VIP横幅
    const banner = document.getElementById('me-vip-banner');
    if(banner) banner.style.display = 'none';
    setTimeout(() => { goHome(); }, 1500);
  }, 1500);
}
function neverShowOfferAgain(checked) {
  if(checked) {
    safeLocalStorage.setItem('wish_island_offer_never', 'true');
    showToast('已设置不再显示此优惠');
  } else {
    safeLocalStorage.removeItem('wish_island_offer_never');
  }
}
function shouldShowOffer() {
  return safeLocalStorage.getItem('wish_island_offer_never') !== 'true';
}


/* ===== 分享得水晶 ===== */
function shareForCrystals() {
  const shareData = {
    title: '许愿岛 - 我的心灵成长花园',
    text: '我在许愿岛记录成长、许愿放松，超治愈！快来一起吧 ✨',
    url: window.location.href
  };
  if(navigator.share) {
    navigator.share(shareData).then(() => {
      trackShare('native');
      // 检查今天是否已分享
      const today = new Date().toDateString();
      const lastShare = safeLocalStorage.getItem('wish_island_last_share');
      if(lastShare !== today) {
        safeLocalStorage.setItem('wish_island_last_share', today);
        crystalState.crystals += 10;
        saveVipState();
        updateCrystalDisplay();
        showToast('分享成功！奖励 10 星光水晶 💎');
        triggerConfetti();
      } else {
        showToast('今天已经分享过了，明天再来吧 💎');
      }
    }).catch(err => {
      if(err.name !== 'AbortError') {
        // 复制链接替代
        copyShareLink();
      }
    });
  } else {
    copyShareLink();
  }
}
function copyShareLink() {
  const link = window.location.href;
  if(navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => {
      trackShare('clipboard');
      const today = new Date().toDateString();
      const lastShare = safeLocalStorage.getItem('wish_island_last_share');
      if(lastShare !== today) {
        safeLocalStorage.setItem('wish_island_last_share', today);
        crystalState.crystals += 10;
        saveVipState();
        updateCrystalDisplay();
        showToast('链接已复制！奖励 10 星光水晶 💎');
        triggerConfetti();
      } else {
        showToast('链接已复制！今天已经分享过了 💎');
      }
    });
  } else {
    showToast('请手动复制链接分享给你的朋友 💎');
  }
}

/* ===== 1天免费体验会员 ===== */
function claimFreeTrial() {
  if(safeLocalStorage.getItem('wish_island_free_trial_used')) {
    showToast('你已经领取过免费体验了 ✨');
    return;
  }
  trackFreeTrial();
  if(getCurrentTier() !== 'free') {
    showToast('你已经是会员了，无需体验 ✨');
    return;
  }
  safeLocalStorage.setItem('wish_island_free_trial_used', 'true');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  vipState.tier = 'vip';
  vipState.expiry = tomorrow.toISOString();
  saveVipState();
  showToast('🎉 成功领取 1 天 VIP 免费体验！全部功能已解锁');
  triggerConfetti();
  // 隐藏横幅和标识
  const banner = document.getElementById('me-vip-banner');
  if(banner) banner.style.display = 'none';
  const vipBadge = document.getElementById('me-vip-badge');
  if(vipBadge) vipBadge.style.display = 'inline-block';
  setTimeout(() => { goHome(); }, 1500);
}
function hasUsedFreeTrial() {
  return safeLocalStorage.getItem('wish_island_free_trial_used') === 'true';
}

function showLimitedOffer() {
  if(safeLocalStorage.getItem('wish_island_offer_never') === 'true') return;
  trackOfferShown();
  const m = document.getElementById('limited-offer-modal');
  if(m) m.classList.add('show');
  startOfferTimer();
}
function closeLimitedOffer() { const m = document.getElementById('limited-offer-modal'); if(m) m.classList.remove('show'); }
function startOfferTimer() {
  const el = document.getElementById('offer-timer');
  if(!el) return;
  let seconds = 24 * 3600 - 1; // 24h from first use
  const update = () => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
    if(seconds > 0) { seconds--; setTimeout(update, 1000); }
  };
  update();
}
function checkAutoPromotions() {
  loadVipState();
  if(getCurrentTier() !== 'free') return;
  const firstUse = new Date(vipState.firstUseDate || new Date());
  const hoursSince = Math.floor((new Date() - firstUse) / (1000 * 60 * 60));
  // 30分钟后或第3次使用时触发限时优惠
  const usageCount = parseInt(safeLocalStorage.getItem('wish_island_usage_count', '0')) || 0;
  if((hoursSince >= 0 && !vipState.offerShown && usageCount >= 3) || (hoursSince >= 24 && !vipState.offerShown)) {
    vipState.offerShown = true;
    saveVipState();
    setTimeout(() => showLimitedOffer(), 2000);
  }
}
/* ===== 数据埋点 ===== */
function trackEvent(eventName, params) {
  try {
    const event = {
      event: eventName,
      params: params || {},
      timestamp: Date.now(),
      date: new Date().toISOString(),
      userTier: getCurrentTier(),
      sessionId: getSessionId()
    };
    // 保存到本地事件队列
    const events = safeLocalStorage.getObject('wish_island_events', []);
    events.push(event);
    // 只保留最近 200 条
    if(events.length > 200) events.shift();
    safeLocalStorage.setObject('wish_island_events', events);
    // 同时输出到 console（开发调试）
    console.log('[Track]', eventName, event.params);
  } catch(e) {}
}
function getSessionId() {
  let sid = safeLocalStorage.getItem('wish_island_session_id');
  if(!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    safeLocalStorage.setItem('wish_island_session_id', sid);
  }
  return sid;
}
function trackPageView(pageName) {
  trackEvent('page_view', { page: pageName });
}
function trackFeatureLock(featureName) {
  trackEvent('feature_lock_shown', { feature: featureName, tier: getCurrentTier() });
}
function trackPaymentModal(planId) {
  trackEvent('payment_modal_open', { planId: planId, tier: getCurrentTier() });
}
function trackPaymentMethod(planId, method) {
  trackEvent('payment_method_click', { planId: planId, method: method, price: 星光会员_PRICES[planId]?.price });
}
function trackPaymentSuccess(planId, method) {
  trackEvent('payment_success', { planId: planId, method: method, price: 星光会员_PRICES[planId]?.price });
}
function trackPaymentCancel(planId) {
  trackEvent('payment_cancel', { planId: planId });
}
function trackFreeTrial() {
  trackEvent('free_trial_claim', { tier: getCurrentTier() });
}
function trackCrystalUnlock(type, cost) {
  trackEvent('crystal_unlock', { type: type, cost: cost, crystalsLeft: crystalState.crystals });
}
function trackShare(source) {
  trackEvent('share_for_crystal', { source: source });
}
function trackOfferShown() {
  trackEvent('offer_shown', { tier: getCurrentTier() });
}
function trackCheckIn(streak, reward) {
  trackEvent('checkin', { streak: streak, reward: reward });
}
function trackFeedback(text) {
  trackEvent('feedback_submit', { length: text.length });
}
function trackAppStart() {
  const isFirst = !safeLocalStorage.getItem('wish_island_first_open');
  trackEvent('app_start', { isFirstOpen: isFirst, tier: getCurrentTier() });
}

function trackUsage() {
  let count = parseInt(safeLocalStorage.getItem('wish_island_usage_count', '0')) || 0;
  count++;
  safeLocalStorage.setItem('wish_island_usage_count', String(count));
  // 第3次使用且未付费，触发限时优惠
  if(count === 3 && getCurrentTier() === 'free') {
    setTimeout(() => checkAutoPromotions(), 1000);
  }
}
const originalRenderTarot = window.renderTarot || function(){};
window.renderTarot = function() { if(!checkQuota('tarot', 'draw')) return; originalRenderTarot(); };
const originalSendAiMessage = window.sendAiMessage || function(){};
window.sendAiMessage = function() { 
  if(crystalState.aiUnlocks > 0) { crystalState.aiUnlocks--; saveVipState(); }
  else if(!checkQuota('ai', 'chat')) return;
  originalSendAiMessage(); 
};
const originalStartSatsTimer = window.startSatsTimer || function(){};
window.startSatsTimer = function() { if(!checkQuota('sats', 'session')) return; originalStartSatsTimer(); };
const originalRenderLibrary = window.renderLibrary || function(){};
window.renderLibrary = function() {
  const tier = getTierConfig();
  originalRenderLibrary();
  const bookIds = Object.keys(typeof BOOK_DETAILS !== 'undefined' ? BOOK_DETAILS : {});
  bookIds.forEach((id, idx) => {
    if(idx >= tier.books) {
      const spine = document.querySelector(`[data-book-id="${id}"]`);
      if(spine) { spine.style.filter = 'grayscale(0.8)'; spine.title = '升级会员解锁'; }
    }
  });
};
const originalExportAllData = window.exportAllData || function(){};
window.exportAllData = function() { if(isFeatureLocked('export')) { showLockModal('数据导出', '导出数据是会员专属功能。升级会员即可备份所有成长记录。'); return; } originalExportAllData(); };
const originalInitMovies = window.initMovies || function(){};
window.initMovies = function() { if(isFeatureLocked('movies')) { showLockModal('疗愈影院', '疗愈影院是会员专属功能。升级会员解锁10部成长疗愈影院。', { crystalCost: 5, crystalType: 'movie_once' }); return; } originalInitMovies(); };
const originalInitSp = window.initSp || function(){};
window.initSp = function() { if(isFeatureLocked('spFull')) { showLockModal('SP成长专区', 'SP完整专区是会员专属功能。免费版可浏览基础肯定语。'); /* Still show but limited */ originalInitSp(); return; } originalInitSp(); };
const originalInitGrowth = window.renderGrowth || function(){};
window.renderGrowth = function() { if(isFeatureLocked('advancedCharts')) { showLockModal('高级图表', '情绪趋势分析是会员专属功能。'); return; } originalInitGrowth(); };
const originalOpenBookDetail = window.openBookDetail || function(){};
window.openBookDetail = function(id, type) {
  const tier = getTierConfig();
  const bookIds = Object.keys(typeof BOOK_DETAILS !== 'undefined' ? BOOK_DETAILS : {});
  const idx = bookIds.indexOf(id);
  if(idx >= 0 && idx >= tier.books && getCurrentTier() === 'free') {
    showLockModal('书籍解锁', `你已解锁 ${tier.books} 本书。升级会员解锁全部 8 本经典。或用星光水晶单独解锁。`, { crystalCost: 10, crystalType: 'book' });
    return;
  }
  originalOpenBookDetail(id, type);
};
function addVipNavEntry() {
  const nav = document.querySelector('.bottom-nav');
  if(!nav) return;
  const existing = nav.querySelector('[onclick*="vip"]');
  if(existing) return;
  const flexContainer = nav.querySelector('div.flex.justify-around') || nav.querySelector('div');
  if(!flexContainer) return;
  const vipItem = document.createElement('div');
  vipItem.className = 'nav-item';
  vipItem.setAttribute('onclick', "showPage('vip');initVip()");
  vipItem.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>会员</span>`;
  const navItems = flexContainer.querySelectorAll('.nav-item');
  if(navItems.length > 0) {
    flexContainer.insertBefore(vipItem, navItems[navItems.length - 1]);
  } else {
    flexContainer.appendChild(vipItem);
  }
}
function addVipToMePage() {
  const banner = document.getElementById('me-vip-banner');
  if(banner) {
    const tier = getCurrentTier();
    banner.style.display = tier === 'free' ? 'block' : 'none';
  }
}
document.addEventListener('DOMContentLoaded', function() {
  // P1-6: Keyboard scroll handling for mobile inputs
  if ('visualViewport' in window) {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(el => {
      el.addEventListener('focus', () => {
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          const vvHeight = window.visualViewport.height;
          if (rect.bottom > vvHeight - 80) {
            const offset = rect.bottom - vvHeight + 80;
            window.scrollBy({ top: offset, behavior: 'smooth' });
          }
        }, 300);
      });
    });
  }
  setTimeout(() => {
    loadVipState();
    addVipNavEntry();
    addVipToMePage();
    checkAutoPromotions();
    loadDarkMode();
    autoDarkMode();
    initZodiacAndBirthday();
    checkRetention();
    // 首次打开显示引导
    if(isFirstOpen()) {
      markFirstOpen();
      setTimeout(() => showOnboarding(), 800);
    }
  }, 2000);
});
  setTimeout(() => {
    loadVipState();
    addVipNavEntry();
    addVipToMePage();
    checkAutoPromotions();
    loadDarkMode();
    autoDarkMode();
    initZodiacAndBirthday();
    checkRetention();
    // 首次打开显示引导
    if(isFirstOpen()) {
      markFirstOpen();
      setTimeout(() => showOnboarding(), 800);
    }
  }, 2000);
});
let currentAudioCtx = null;
let whiteNoiseGain = null;
let speechUtterance = null;
let audioGuideInterval = null;
let audioPlaying = false;
function initAudioPage() {
  renderAudioScenes();
}
function renderAudioScenes() {
  const el = document.getElementById('audio-scenes');
  if(!el) return;
  const scenes = [
    {title:"肯定语循环",emoji:"🌸",desc:"30分钟循环朗读你的肯定语，配合轻柔白噪音"},
    {title:"SATS 语音引导",emoji:"🌙",desc:"15分钟语音引导，逐步进入状态像似睡眠"},
    {title:"财富丰盛冥想",emoji:"💰",desc:"10分钟丰盛肯定语 + 金钱能量场频率"},
    {title:"爱情修复冥想",emoji:"💕",desc:"15分钟SP肯定语 + 心轮共鸣频率"},
    {title:"深度安眠",emoji:"💤",desc:"30分钟粉红噪声 + 晚安肯定语，助你安眠"},
    {title:"晨光唤醒",emoji:"☀️",desc:"10分钟晨间肯定语 + 432Hz唤醒频率"}
  ];
  el.innerHTML = scenes.map((s,i) => `<div class="p-4 rounded-xl cursor-pointer card-hover" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="startAudioScene(${i})"><div class="flex items-center gap-3"><div class="text-2xl">${s.emoji}</div><div class="flex-1"><div class="font-medium text-sm" style="color:var(--theme-text)">${s.title}</div><div class="text-xs mt-1" style="color:var(--text-soft)">${s.desc}</div></div><div class="text-lg opacity-40">▶</div></div></div>`).join('');
}
function startAudioScene(idx) {
  if(audioGuideInterval) { clearInterval(audioGuideInterval); audioGuideInterval = null; }
  const scenes = [
    {title:"肯定语循环",duration:1800,affirmations:["我值得一切美好","我正在成长我想要的一切","我是宇宙最爱的孩子"]},
    {title:"SATS 语音引导",duration:900,guide:["请找到一个舒适的位置，轻轻闭上眼睛","感受你的呼吸，每一次呼气都在释放紧张","想象你的愿望已经实现，你就在那个场景里","感受这种已经拥有的喜悦，让它充满全身","保持这种感觉，直到你自然入睡"]},
    {title:"财富丰盛冥想",duration:600,affirmations:["我是金钱的磁铁","钱从各种渠道流向我","我值得拥有丰盛"]},
    {title:"爱情修复冥想",duration:900,affirmations:["TA深深地爱着我","我们的关系充满了爱和和谐","TA正在想念我"]},
    {title:"深度安眠",duration:1800,affirmations:["我允许自己放松","我信任宇宙在照顾我","晚安，我的潜意识"]},
    {title:"晨光唤醒",duration:600,affirmations:["今天会是美好的一天","我充满能量和感恩","我准备好接收奇迹"]}
  ];
  const scene = scenes[idx];
  if(!scene) return;
  setText('audio-player-scene', scene.title);
  remCls('audio-player', 'hidden');
  addCls('audio-scenes', 'hidden');
  stopAllAudio();
  audioPlaying = true;
  playWhiteNoise(0.03);
  let elapsed = 0;
  const timerEl = document.getElementById('audio-timer');
  const progressEl = document.getElementById('audio-progress');
  if(scene.guide) {
    let step = 0;
    speakText(scene.guide[step]);
    audioGuideInterval = setInterval(() => {
      elapsed++;
      if(timerEl) timerEl.textContent = formatAudioTime(scene.duration - elapsed);
      if(progressEl) progressEl.style.width = (elapsed/scene.duration*100)+'%';
      if(elapsed >= scene.duration) { stopAllAudio(); showToast('🌙 冥想完成'); return; }
      if(elapsed % Math.floor(scene.duration/scene.guide.length) === 0 && step < scene.guide.length-1) {
        step++;
        speakText(scene.guide[step]);
      }
    }, 1000);
  } else if(scene.affirmations) {
    let affirmIdx = 0;
    speakText(scene.affirmations[0]);
    audioGuideInterval = setInterval(() => {
      elapsed++;
      if(timerEl) timerEl.textContent = formatAudioTime(scene.duration - elapsed);
      if(progressEl) progressEl.style.width = (elapsed/scene.duration*100)+'%';
      if(elapsed >= scene.duration) { stopAllAudio(); showToast('✨ 肯定语循环完成'); return; }
      if(elapsed % 30 === 0) {
        affirmIdx = (affirmIdx + 1) % scene.affirmations.length;
        speakText(scene.affirmations[affirmIdx]);
      }
    }, 1000);
  }
}
function formatAudioTime(sec) {
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = (sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
function stopAllAudio() {
  audioPlaying = false;
  if(audioGuideInterval) { clearInterval(audioGuideInterval); audioGuideInterval = null; }
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  if(whiteNoiseNode) { try { whiteNoiseNode.stop(); } catch(e){} whiteNoiseNode = null; }
  if(currentAudioCtx) { try { currentAudioCtx.close(); } catch(e){} currentAudioCtx = null; }
  const player = document.getElementById('audio-player');
  if(player) player.classList.add('hidden');
  const scenes = document.getElementById('audio-scenes');
  if(scenes) scenes.classList.remove('hidden');
}
function playWhiteNoise(volume) {
  try {
    if(!currentAudioCtx) currentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(currentAudioCtx.state === 'suspended') currentAudioCtx.resume();
    const bufferSize = 2 * currentAudioCtx.sampleRate;
    const buffer = currentAudioCtx.createBuffer(1, bufferSize, currentAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) {
      let white = Math.random()*2-1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    whiteNoiseNode = currentAudioCtx.createBufferSource();
    whiteNoiseNode.buffer = buffer;
    whiteNoiseNode.loop = true;
    whiteNoiseGain = currentAudioCtx.createGain();
    whiteNoiseGain.gain.value = volume || 0.03;
    whiteNoiseNode.connect(whiteNoiseGain);
    whiteNoiseGain.connect(currentAudioCtx.destination);
    whiteNoiseNode.start();
  } catch(e) { 
    console.error('Audio error', e); 
    showToast('⚠️ 音频播放失败，请检查浏览器设置');
  }
}
let lastOut = 0;
function speakText(text) {
  if(!window.speechSynthesis) {
    showToast('🔇 当前浏览器不支持语音播放，请使用文本阅读');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    u.pitch = 1.05;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch(e) {
    showToast('🔇 语音播放失败');
  }
}
function pauseAudio() {
  if(audioPlaying && currentAudioCtx && currentAudioCtx.state === 'running') {
    currentAudioCtx.suspend();
    if(window.speechSynthesis) window.speechSynthesis.pause();
    audioPlaying = false;
    setText('audio-pause-btn', '▶️ 继续');
  } else if(currentAudioCtx && currentAudioCtx.state === 'suspended') {
    currentAudioCtx.resume();
    if(window.speechSynthesis) window.speechSynthesis.resume();
    audioPlaying = true;
    setText('audio-pause-btn', '⏸️ 暂停');
  }
}
const BOOTCAMP_DATA = {
  name: '7天成长速训营',
  days: [
    {title:'Day 1 · 设定意图',lesson:'成长的第一步是清晰知道你真正想要什么。写下你最渴望实现的愿望，用现在时态描述。',tasks:['写下1个核心愿望','制作简易梦想画册','设定3句核心肯定语']},
    {title:'Day 2 · 情绪校准',lesson:'情绪是成长的指南针。使用情绪导航器，了解你当前的位置，然后选择升阶练习。',tasks:['使用情绪导航器记录','完成一次升阶练习','睡前SATS 10分钟']},
    {title:'Day 3 · 肯定语植入',lesson:'肯定语是潜意识的种子。今天开始循环朗读你的肯定语，配合音频引导。',tasks:['完成肯定语音频30分钟','记录身体感受','分享一句肯定语到星辰社区']},
    {title:'Day 4 · 修正法',lesson:'遇到不开心的事？立刻用修正法改写结局。这是成长大师的必备技能。',tasks:['修正一件今天的小事','记录修正后的感受','做一次星辰塔罗抽牌']},
    {title:'Day 5 · 丰盛体验',lesson:'成长丰盛的最好方式是先体验丰盛。今天做一件让你感到富足的事。',tasks:['签发一张魔法支票','完成财富信念测试','记录一笔进账']},
    {title:'Day 6 · SP 专场',lesson:'如果你正在绽放SP，今天是专属练习日。忽略3D，活在终点状态。',tasks:['开启忽略3D模式','完成SP肯定语音频','写下SP复合后的场景']},
    {title:'Day 7 · 庆祝与释放',lesson:'你已经完成了7天训练！今天庆祝你的新身份，然后完全释放对结果的执着。',tasks:['完成全部打卡','写一篇星辰日记','在星辰社区分享你的体验']}
  ]
};
let bootcampState = { currentDay: 1, completedTasks: {}, started: false, finished: false };
function loadBootcampState() { try { const s = StorageUtil.get('bootcamp_state', null); if(s) bootcampState = {...bootcampState, ...s}; } catch(e){} }
function saveBootcampState() { StorageUtil.set('bootcamp_state', bootcampState); }
let darkModeEnabled = false;
function loadDarkMode() { try { const s = StorageUtil.get('dark_mode', false); if(s) { darkModeEnabled = true; applyDarkMode(); } } catch(e){} }
function saveDarkMode() { StorageUtil.set('dark_mode', darkModeEnabled); }
function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  applyDarkMode();
  saveDarkMode();
  showToast(darkModeEnabled ? '🌙 已切换到深色模式' : '☀️ 已切换到浅色模式');
}
function applyDarkMode() {
  if(darkModeEnabled) {
    if (document.body) document.body.classList.add('dark');
  } else {
    if (document.body) document.body.classList.remove('dark');
  }
  const btn = document.getElementById('dark-mode-toggle');
  if(btn) btn.textContent = darkModeEnabled ? '☀️' : '🌙';
}
function autoDarkMode() {
  const hour = new Date().getHours();
  if(hour >= 22 || hour < 6) { if(!darkModeEnabled) { darkModeEnabled = true; applyDarkMode(); } }
}
function initReports() {
  loadReportData();
  renderMonthlyReport();
  renderYearlySummary();
}
function loadReportData() {
  const emotionData = StorageUtil.get('emotion_notes', []);
  const checkinData = crystalState.dailyCheckIn || {streak:0};
  const challengeData = StorageUtil.get('challenge_state', {completedDays:[]});
  const aiData = StorageUtil.get('ai_chat_history', []);
  window.__reportData = { emotionData, checkinData, challengeData, aiData };
}
function renderMonthlyReport() {
  const el = document.getElementById('report-monthly');
  if(!el) return;
  const data = window.__reportData || {};
  const emotions = data.emotionData || [];
  const checkins = crystalState.dailyCheckIn.streak || 0;
  const challenges = (data.challengeData && data.challengeData.completedDays ? data.challengeData.completedDays.length : 0);
  const aiCount = (data.aiData ? data.aiData.length : 0);
  const avgLevel = emotions.length ? Math.round(emotions.reduce((s, e) => s + (e.level || 11), 0) / emotions.length) : 11;
  const trend = emotions.length >= 2 ? (emotions[0].level - emotions[emotions.length-1].level) : 0;
  const trendText = trend > 0 ? '↑ 情绪在上升' : trend < 0 ? '↓ 情绪有波动' : '→ 情绪平稳';
  el.innerHTML = `
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${emotions.length}</div><div class="text-xs" style="color:var(--text-mute)">情绪花园</div></div>
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${checkins}天</div><div class="text-xs" style="color:var(--text-mute)">连续签到</div></div>
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${challenges}</div><div class="text-xs" style="color:var(--text-mute)">成长挑战完成</div></div>
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${aiCount}</div><div class="text-xs" style="color:var(--text-mute)">AI对话</div></div>
    </div>
    <div class="glass-card p-4 mb-3">
      <div class="text-sm font-medium mb-2" style="color:var(--theme-text)">📊 情绪平均值</div>
      <div class="flex items-center gap-2">
        <div class="flex-1 h-3 rounded-full" style="background:rgba(212,181,199,0.2)">
          <div class="h-full rounded-full" style="width:${avgLevel/22*100}%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9)"></div>
        </div>
        <div class="text-sm font-bold" style="color:var(--theme-text)">${avgLevel}/22</div>
      </div>
      <div class="text-xs mt-2" style="color:var(--text-mute)">${trendText}</div>
    </div>
  `;
}
function renderYearlySummary() {
  const el = document.getElementById('report-yearly');
  if(!el) return;
  const data = window.__reportData || {};
  const emotions = data.emotionData || [];
  const months = ['1月','2月','3月','4月','5月','6月','7月'];
  const counts = [2, 5, 8, 12, 15, 10, emotions.length];
  let bars = '';
  const max = Math.max(...counts, 1);
  months.forEach((m, i) => {
    const h = Math.round(counts[i]/max*100);
    bars += `<div class="flex flex-col items-center gap-1" style="flex:1"><div class="w-full rounded-t-lg" style="height:${h*0.8+10}px;background:linear-gradient(180deg,#D4B5C7,#B8A9C9);opacity:0.7"></div><div class="text-[10px]" style="color:var(--text-mute)">${m}</div></div>`;
  });
  el.innerHTML = `
    <div class="glass-card p-4">
      <div class="text-sm font-medium mb-3" style="color:var(--theme-text)">📈 情绪花园月度趋势</div>
      <div class="flex items-end gap-1" style="height:120px">${bars}</div>
    </div>
  `;
}
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.error('SW 注册成功', reg.scope);
        if ('sync' in reg) {
          reg.sync.register('daily-reminder').catch(()=>{});
        }
      })
      .catch(err => console.error('SW 注册失败', err));
  }
  function handleRouteParam() {
    const params = new URLSearchParams(location.search);
    const route = params.get('route') || params.get('shortcut');
    if (!route) return;
    if (route === 'affirmation') {
      setTimeout(() => showDailyAffirmation(), 500);
    } else if (route === 'sats') {
      setTimeout(() => { showPage('sats'); initSats(); }, 500);
    } else if (route === 'audio') {
      setTimeout(() => { showPage('audio'); initAudioPage(); }, 500);
    } else if (route === 'challenge') {
      setTimeout(() => { showPage('challenge'); initChallenge(); }, 500);
    } else if (route === 'search') {
      setTimeout(() => { loadChunk('tools').then(() => { showPage('search'); initSearch(); }); }, 500);
    } else if (route === 'reports') {
      setTimeout(() => { showPage('reports'); initReports(); }, 500);
    }
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, location.pathname + location.hash);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleRouteParam);
  } else {
    handleRouteParam();
  }
})();
let pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pwaInstallPrompt = e;
  try { localStorage.setItem('pwa_installable', 'true'); } catch(e) {}
});
function showInstallPrompt() {
  if (!pwaInstallPrompt) {
    showToast('请在浏览器菜单中选择"添加到主屏幕" 📱');
    return;
  }
  pwaInstallPrompt.prompt();
  pwaInstallPrompt.userChoice.then(result => {
    if (result.outcome === 'accepted') {
      showToast('✨ 已添加到主屏幕！');
      try { localStorage.setItem('cosmos_pwa_installed', 'true'); } catch(e) {}
    }
    pwaInstallPrompt = null;
  }).catch(err => console.warn('PWA安装选择失败:', err));
}
function maybeShowInstallBanner() {
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
  try {
    if (localStorage.getItem('cosmos_pwa_installed') === 'true') return;
    if (localStorage.getItem('cosmos_pwa_dismissed') === 'true') return;
    const visits = parseInt(localStorage.getItem('cosmos_pwa_visit_count') || '0');
    try { localStorage.setItem('cosmos_pwa_visit_count', String(visits + 1)); } catch(e) {}
    if (visits < 1) return;
  } catch(e) { return; }
  if (!pwaInstallPrompt) return;
  setTimeout(() => {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="position:fixed;bottom:80px;left:16px;right:16px;z-index:50;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:16px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(93,78,109,0.15);color:white;">
        <div style="font-size:28px;">🏝️</div>
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:500;">添加到主屏幕</div>
          <div style="font-size:12px;opacity:0.9;">像原生App一样快速打开，离线也能使用</div>
        </div>
        <button onclick="showInstallPrompt(); const b=document.getElementById('pwa-install-banner'); if(b) b.remove();" style="background:white;color:#5D4E6D;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;">安装</button>
        <button onclick="try{localStorage.setItem('cosmos_pwa_dismissed','true');}catch(e){} const b2=document.getElementById('pwa-install-banner'); if(b2) b2.remove();" style="background:rgba(255,255,255,0.2);color:white;border:none;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer;">×</button>
      </div>
    `;
    document.body.appendChild(banner);
  }, 2000);
}
setTimeout(maybeShowInstallBanner, 4000);
const BREATHE_MODES = {
  calm: { name: '4-7-8 放松', inhale: 4, hold: 7, exhale: 8, text: '鼻子吸气4秒 → 屏息7秒 → 嘴巴呼气8秒', rounds: 10 },
  box: { name: 'Box 专注', inhale: 4, hold: 4, exhale: 4, hold2: 4, text: '吸气4秒 → 屏息4秒 → 呼气4秒 → 屏息4秒', rounds: 10 },
  coherent: { name: 'Coherent 心流', inhale: 5, hold: 0, exhale: 5, text: '吸气5秒 → 呼气5秒（ HeartMath 心流呼吸）', rounds: 12 }
};
let breatheState = { mode: 'calm', running: false, round: 0, phase: '', timer: null, audioCtx: null };
let breatheToneEnabled = false;
let breatheAmbientEnabled = false;
let breatheAmbientType = 'pink';
let breatheAudioCtx = null;
let breatheToneOsc = null;
let breatheToneGain = null;
let breatheAmbientNode = null;
let breatheAmbientGain = null;
function toggleBreatheTone() {
  breatheToneEnabled = !breatheToneEnabled;
  const btn = document.getElementById('breathe-tone-btn');
  if (btn) btn.textContent = breatheToneEnabled ? '🔔 开启' : '🔕 关闭';
  if (btn) btn.style.background = breatheToneEnabled ? 'rgba(212,181,199,0.3)' : 'rgba(212,181,199,0.15)';
  if (breatheToneEnabled && !breatheAudioCtx) initBreatheAudio();
  showToast(breatheToneEnabled ? '呼吸引导音已开启' : '呼吸引导音已关闭');
}
function toggleBreatheAmbient() {
  breatheAmbientEnabled = !breatheAmbientEnabled;
  const btn = document.getElementById('breathe-ambient-btn');
  const opts = document.getElementById('breathe-ambient-options');
  if (btn) btn.textContent = breatheAmbientEnabled ? '🔔 开启' : '🔕 关闭';
  if (btn) btn.style.background = breatheAmbientEnabled ? 'rgba(212,181,199,0.3)' : 'rgba(212,181,199,0.15)';
  if (opts) opts.classList.toggle('hidden', !breatheAmbientEnabled);
  if (breatheAmbientEnabled && !breatheAudioCtx) initBreatheAudio();
  if (breatheAmbientEnabled && breatheState.running) startBreatheAmbientSound();
  else if (!breatheAmbientEnabled) stopBreatheAmbientSound();
  showToast(breatheAmbientEnabled ? '背景环境音已开启' : '背景环境音已关闭');
}
function setBreatheAmbient(type) {
  breatheAmbientType = type;
  if (breatheAmbientEnabled && breatheState.running) {
    stopBreatheAmbientSound();
    startBreatheAmbientSound();
  }
  showToast('已切换: ' + type);
}
function initBreatheAudio() {
  if (!breatheAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) breatheAudioCtx = new AudioContext();
  }
}
function playBreatheTone(phase, duration) {
  if (!breatheToneEnabled || !breatheAudioCtx) return;
  try {
    if (breatheToneOsc) { breatheToneOsc.stop(); breatheToneOsc = null; }
    if (breatheToneGain) { breatheToneGain.disconnect(); breatheToneGain = null; }
    if (phase === '屏息') return;
    const osc = breatheAudioCtx.createOscillator();
    const gain = breatheAudioCtx.createGain();
    const freq = phase === '吸气' ? 440 : 280;
    osc.type = phase === '吸气' ? 'sine' : 'sine';
    osc.frequency.setValueAtTime(freq, breatheAudioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, breatheAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, breatheAudioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(breatheAudioCtx.destination);
    osc.start();
    osc.stop(breatheAudioCtx.currentTime + duration);
    breatheToneOsc = osc;
    breatheToneGain = gain;
  } catch(e) {}
}
function startBreatheAmbientSound() {
  if (!breatheAmbientEnabled || !breatheAudioCtx) return;
  stopBreatheAmbientSound();
  try {
    let bufferSize = 2 * breatheAudioCtx.sampleRate;
    let buffer = breatheAudioCtx.createBuffer(1, bufferSize, breatheAudioCtx.sampleRate);
    let data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      if (breatheAmbientType === 'pink') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (breatheAmbientType === 'white') {
        data[i] = white * 0.3;
      } else if (breatheAmbientType === 'ocean') {
        data[i] = Math.sin(i * 0.01) * 0.1 + (Math.random() - 0.5) * 0.05;
      } else if (breatheAmbientType === 'rain') {
        data[i] = (Math.random() * 2 - 1) * 0.08 + (Math.random() * 2 - 1) * 0.04;
      } else if (breatheAmbientType === 'forest') {
        data[i] = Math.random() * 0.02;
        if (i % 2000 === 0) data[i] = 0.15;
      }
    }
    let source = breatheAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    let gain = breatheAudioCtx.createGain();
    gain.gain.setValueAtTime(0.03, breatheAudioCtx.currentTime);
    source.connect(gain);
    gain.connect(breatheAudioCtx.destination);
    source.start();
    breatheAmbientNode = source;
    breatheAmbientGain = gain;
  } catch(e) {}
}
function stopBreatheAmbientSound() {
  if (breatheAmbientNode) { try { breatheAmbientNode.stop(); } catch(e) {} breatheAmbientNode = null; }
  if (breatheAmbientGain) { try { breatheAmbientGain.disconnect(); } catch(e) {} breatheAmbientGain = null; }
}
function stopBreatheTone() {
  if (breatheToneOsc) { try { breatheToneOsc.stop(); } catch(e) {} breatheToneOsc = null; }
  if (breatheToneGain) { try { breatheToneGain.disconnect(); } catch(e) {} breatheToneGain = null; }
}
function stopBreatheAudio() {
  stopBreatheTone();
  stopBreatheAmbientSound();
  if (breatheAudioCtx) { try { breatheAudioCtx.close(); } catch(e) {} breatheAudioCtx = null; }
}
function selectBreatheMode(mode, el) {
  const cfg = BREATHE_MODES[mode];
  if (!cfg) return;
  breatheState.mode = mode;
  document.querySelectorAll('[id^="breathe-mode-"]').forEach(d => { if(d) d.style.border = ''; });
  if(el) el.style.border = '2px solid var(--theme-text)';
  setText('breathe-instruction', cfg.text);
  const roundEl = document.getElementById('breathe-round');
  if (roundEl) roundEl.textContent = `第 ${breatheState.round} / ${cfg.rounds} 轮`;
}
function startBreathe() {
  if (breatheState.running) return;
  breatheState.running = true;
  breatheState.round = 0;
  if (breatheToneEnabled || breatheAmbientEnabled) { initBreatheAudio(); if (breatheAmbientEnabled) startBreatheAmbientSound(); }
  addCls('breathe-start-btn', 'hidden');
  remCls('breathe-stop-btn', 'hidden');
  playBreatheRound();
}
function stopBreathe() {
  breatheState.running = false;
  clearTimeout(breatheState.timer);
  if(breatheState.audioCtx) { breatheState.audioCtx.close(); breatheState.audioCtx = null; }
  stopBreatheAudio();
  remCls('breathe-start-btn', 'hidden');
  addCls('breathe-stop-btn', 'hidden');
  setText('breathe-text', '吸气');
  setStyle('breathe-circle', 'transform', 'scale(1)');
  setStyle('breathe-bar', 'width', '0%');
  const today = getTodayStr();
  const recs = StorageUtil.get('breathe_records', {});
  recs[today] = (recs[today] || 0) + breatheState.round;
  StorageUtil.set('breathe_records', recs);
  if (breatheState.round > 0) logActivity('breathe', `静心呼吸: ${breatheState.round}轮`);
  updateBreatheStats();
}
function playBreatheRound() {
  if (!breatheState.running) return;
  const cfg = BREATHE_MODES[breatheState.mode];
  if (breatheState.round >= cfg.rounds) { stopBreathe(); showToast('🌬️ 静心呼吸完成！'); return; }
  breatheState.round++;
  const breatheRoundEl = document.getElementById('breathe-round');
  if (breatheRoundEl) breatheRoundEl.textContent = `第 ${breatheState.round} / ${cfg.rounds} 轮`;
  setStyle('breathe-bar', 'width', `${(breatheState.round/cfg.rounds)*100}%`);
  const phases = breatheState.mode === 'box' 
    ? [['吸气', cfg.inhale, 1.2], ['屏息', cfg.hold, 1], ['呼气', cfg.exhale, 0.8], ['屏息', cfg.hold2, 1]]
    : [['吸气', cfg.inhale, 1.2], ['屏息', cfg.hold, 1], ['呼气', cfg.exhale, 0.8]];
  runPhase(phases, 0);
}
function runPhase(phases, idx) {
  if (!breatheState.running) return;
  if (idx >= phases.length) { playBreatheRound(); return; }
  const [name, sec, scale] = phases[idx];
  setText('breathe-text', name);
  const circle = document.getElementById('breathe-circle');
  circle.style.transition = `transform ${sec}s linear`;
  circle.style.transform = `scale(${scale})`;
  playBreatheTone(name, sec);
  let remaining = sec;
  const tick = () => {
    if (!breatheState.running) return;
    setText('breathe-timer', remaining);
    remaining--;
    if (remaining >= 0) breatheState.timer = setTimeout(tick, 1000);
    else runPhase(phases, idx + 1);
  };
  tick();
}
function updateBreatheStats() {
  const today = getTodayStr();
  const recs = StorageUtil.get('breathe_records', {});
  const count = recs[today] || 0;
  const el = document.getElementById('breathe-stats');
  if(el) el.textContent = `今日完成 ${count} 轮静心呼吸`;
}
function initBreathe() {
  selectBreatheMode('calm', document.getElementById('breathe-mode-calm'));
  updateBreatheStats();
}
let voiceRecorder = null;
let voiceRecordChunks = [];
let voiceRecordStartTime = 0;
let voiceRecordInterval = null;
let voiceRecordings = StorageUtil.get('voice_recordings', []);
function toggleVoiceRecord() {
  if (voiceRecorder && voiceRecorder.state === 'recording') {
    stopVoiceRecord();
  } else {
    startVoiceRecord();
  }
}
function startVoiceRecord() {
  if (voiceRecordInterval) { stopVoiceRecord(); }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('您的浏览器不支持录音功能'); return;
  }
  if (!window.MediaRecorder) {
    showToast('此浏览器不支持录音，请使用 Chrome/Edge/Firefox 或安卓设备'); return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mimeTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
    const mimeType = mimeTypes.find(mt => MediaRecorder.isTypeSupported(mt)) || '';
    if (!mimeType) { showToast('浏览器不支持任何音频录制格式'); return; }
    voiceRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    voiceRecordChunks = [];
    voiceRecorder.ondataavailable = e => { if (e.data.size > 0) voiceRecordChunks.push(e.data); };
    voiceRecorder.onstop = () => {
      const blob = new Blob(voiceRecordChunks, { type: mimeType || 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const duration = Math.round((Date.now() - voiceRecordStartTime) / 1000);
      const id = Date.now();
      voiceRecordings.unshift({ id, url, duration, date: new Date().toISOString(), label: '我的肯定语' });
      if (voiceRecordings.length > 20) {
        const old = voiceRecordings.pop();
        if (old && old.url) URL.revokeObjectURL(old.url);
      }
      StorageUtil.set('voice_recordings', voiceRecordings);
      renderVoiceRecordings();
      setText('voice-status', '录制完成！');
      setStyle('voice-record-btn', 'background', 'linear-gradient(135deg,#D4B5C7,#B8A9C9)');
      setStyle('voice-wave', 'opacity', '0');
      logActivity('voice_record', '录制肯定语');
    };
    voiceRecorder.onerror = (e) => {
      showToast('录音出错: ' + (e.message || '未知错误'));
      stopVoiceRecord();
    };
    voiceRecorder.start();
    voiceRecordStartTime = Date.now();
    setText('voice-status', '正在录制...');
    setStyle('voice-record-btn', 'background', '#F87171');
    setStyle('voice-wave', 'opacity', '1');
    voiceRecordInterval = setInterval(() => {
      const sec = Math.round((Date.now() - voiceRecordStartTime) / 1000);
      const timerEl = document.getElementById('voice-timer');
      if (timerEl) timerEl.textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    }, 1000);
  }).catch(() => showToast('需要麦克风权限才能录音'));
}
function stopVoiceRecord() {
  if (voiceRecorder && voiceRecorder.state !== 'inactive') voiceRecorder.stop();
  if (voiceRecordInterval) { clearInterval(voiceRecordInterval); voiceRecordInterval = null; }
  voiceRecorder = null;
}
function renderVoiceRecordings() {
  const el = document.getElementById('voice-recordings-list');
  if (!el) return;
  if (voiceRecordings.length === 0) { el.innerHTML = '<div class="text-center text-xs py-4" style="color:var(--text-mute)">还没有录制，点击上方麦克风开始</div>'; return; }
  el.innerHTML = voiceRecordings.map((r, i) => `
    <div class="glass-card p-3 flex items-center gap-3">
      <button onclick="playVoiceRecording(${i})" class="w-10 h-10 rounded-full flex items-center justify-center text-lg" style="background:linear-gradient(135deg,#D4B5C7,#B8A9C9);color:white">▶️</button>
      <div class="flex-1">
        <div class="text-sm" style="color:var(--theme-text)">${r.label}</div>
        <div class="text-xs" style="color:var(--text-mute)">${formatDuration(r.duration)} · ${r.date.slice(0,10)}</div>
      </div>
      <button onclick="deleteVoiceRecording(${i})" class="text-xs" style="color:var(--text-mute)">🗑️</button>
    </div>
  `).join('');
}
function formatDuration(s) {
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}
let voiceAudioPlayer = null;
function playVoiceRecording(idx) {
  const r = voiceRecordings[idx];
  if (!r) return;
  if (voiceAudioPlayer) { voiceAudioPlayer.pause(); voiceAudioPlayer = null; }
  if (typeof Audio !== 'undefined') {
    voiceAudioPlayer = new Audio(r.url);
    voiceAudioPlayer.loop = true;
    voiceAudioPlayer.play().catch(() => showToast('播放失败'));
  } else {
    showToast('浏览器不支持音频播放');
  }
  showToast('🔁 循环播放中...点击其他录音切换');
}
function deleteVoiceRecording(idx) {
  if (!confirm('删除这条录音？')) return;
  const r = voiceRecordings[idx];
  if (r && r.url) URL.revokeObjectURL(r.url);
  voiceRecordings.splice(idx, 1);
  StorageUtil.set('voice_recordings', voiceRecordings);
  renderVoiceRecordings();
}
function fillVoiceInput(text) {
  showToast(`已复制："${text}"，点击麦克风录制这句话`);
  navigator.clipboard?.writeText(text).catch(()=>{});
}
function initVoice() { renderVoiceRecordings(); }
const SLEEP_STORIES = [
  { title: '云端城堡的丰盛之旅', emoji: '🏰', duration: 8, type: 'wealth', text: `你正站在一朵柔软的白云上，面前是一座由星光水晶和金色光芒构成的城堡。城堡的大门缓缓打开，里面是无尽的丰盛...
你走进大厅，地面是温暖的玉石，每一步都发出柔和的光。墙上挂满了画作，每一幅都是你已实现愿望的画面。
你看到自己住在梦想的房子里，银行账户里的数字让你微笑，你周围的每个人都充满爱和尊重...
你走到城堡的中央，那里有一个发光的喷泉。喷泉里流的不是水，而是金色的能量——这是宇宙丰盛的能量...
你把手伸进喷泉，感受这股能量流遍你的全身。你知道，这份丰盛本来就属于你...
你已经是丰盛本身。` },
  { title: '月光花园中的爱情', emoji: '💕', duration: 7, type: 'sp', text: `你走进一个被银色月光笼罩的花园。空气中弥漫着玫瑰和茉莉的香气...
花园的中央有一条由月光铺成的小路。你沿着小路走，感受到一种深深的宁静和爱的环绕...
在小路的尽头，你看到了你的SP。他/她正微笑着向你走来，眼神里充满温柔和确定...
你们不需要说话，因为你们的心已经知道一切。你们拥抱在一起，感受到那种完美、和谐、无条件的爱...
月光变得更亮了，仿佛整个宇宙都在祝福你们的关系。你们手牵手在花园中漫步，每一步都踏实而甜蜜...
你知道，这份爱已经存在。你已经是被爱的人。` },
  { title: '星际旅行者的自我发现', emoji: '🌟', duration: 6, type: 'growth', text: `你躺在一片无垠的星空下，身体轻盈得像羽毛。你发现自己正在慢慢上升，融入星辰之间...
你变成了一束光，可以自由地穿梭于星系之间。每经过一个星球，你就吸收一种新的智慧和力量...
你经过一个蓝色的星球，学会了平静。经过一个金色的星球，学会了自信。经过一个粉色的星球，学会了爱...
当你回到自己的身体时，你已经不是原来的你了。你拥有了所有星球送给你的礼物...
你睁开眼睛，感受到一种全新的能量在体内流动。你知道，你可以成为任何你想成为的人...
你已经是那个最好的版本。` },
  { title: '海浪中的释放与疗愈', emoji: '🌊', duration: 5, type: 'healing', text: `你站在一片宁静的沙滩上，面前是一片温柔的海。海浪轻轻拍打着你的脚，带来清凉和安抚...
你慢慢走进海中，让海水包围你的身体。你感受到海水在带走你所有的紧张、焦虑和恐惧...
每一次海浪退去，都带走一些负面的情绪。你感觉越来越轻，越来越自由...
你漂浮在海面上，仰望星空。大海像一位温柔的母亲，轻轻摇晃着你，告诉你：一切都好，一切都会好...
你闭上眼睛，感受到一种深层的疗愈正在发生。你的身体、你的心灵、你的灵魂都在被修复和更新...
你已经完整，你已经疗愈。` },
  { title: '蜕变花园：新版本的自己', emoji: '🦋', duration: 7, type: 'self', text: `你发现自己在一个美丽的花园里，周围是各种各样的花朵。你注意到花园中央有一棵发光的树...
你走近那棵树，发现树上挂满了蝴蝶的茧。每一个茧都在微微发光，仿佛里面有什么东西正在诞生...
你把手放在其中一个茧上，感受到一种强烈的共鸣。这个茧就是你——你正在蜕变...
你看着茧慢慢裂开，一只美丽的蝴蝶飞了出来。它的翅膀上有着你所有愿望的图案...
这只蝴蝶围绕你飞舞，最后停在你的肩膀上。它轻声说：你已经是那个新版本的你了...
你感受到一种前所未有的确定。你知道，你不需要等待，因为蜕变已经发生...
你已经是那个完美的自己。` }
];
let sleepStoryState = { playing: false, current: null, timer: null, interval: null, paused: false, utterQueue: [], utterIdx: 0 };
function playSleepStory(idx) {
  if (sleepStoryState.playing) stopSleepStory();
  const story = SLEEP_STORIES[idx];
  if (!story) return;
  sleepStoryState.current = story;
  sleepStoryState.playing = true;
  sleepStoryState.paused = false;
  sleepStoryState.utterIdx = 0;
  remCls('sleep-player', 'hidden');
  setText('sleep-story-title', story.emoji + ' ' + story.title);
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const paragraphs = story.text.split(/\n\n+/).filter(p => p.trim());
    sleepStoryState.utterQueue = paragraphs;
    speakNextParagraph();
  }
  let elapsed = 0;
  const total = story.duration * 60;
  setStyle('sleep-progress', 'width', '0%');
  const leftEl1 = document.getElementById('sleep-time-left');
  if (leftEl1) leftEl1.textContent = `剩余 ${story.duration}:00`;
  sleepStoryState.interval = setInterval(() => {
    if (sleepStoryState.paused) return;
    elapsed++;
    const pct = (elapsed / total) * 100;
    setStyle('sleep-progress', 'width', `${pct}%`);
    const left = total - elapsed;
    const leftEl2 = document.getElementById('sleep-time-left');
    if (leftEl2) leftEl2.textContent = `剩余 ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
    if (elapsed >= total) { clearInterval(sleepStoryState.interval); }
  }, 1000);
  setText('sleep-pause-btn', '⏸️ 暂停');
  logActivity('sleep_story', story.title);
}
function speakNextParagraph() {
  if (!sleepStoryState.playing || sleepStoryState.paused) return;
  const idx = sleepStoryState.utterIdx;
  const paragraphs = sleepStoryState.utterQueue;
  if (idx >= paragraphs.length) { sleepStoryState.playing = false; setText('sleep-pause-btn', '▶️ 播放'); return; }
  const utter = new SpeechSynthesisUtterance(paragraphs[idx]);
  utter.rate = 0.75;
  utter.pitch = 0.9;
  utter.volume = 0.6;
  utter.lang = 'zh-CN';
  utter.onend = () => {
    sleepStoryState.utterIdx++;
    speakNextParagraph();
  };
  utter.onerror = () => {
    sleepStoryState.utterIdx++;
    speakNextParagraph();
  };
  speechSynthesis.speak(utter);
  sleepStoryState.utter = utter;
}
function pauseSleepStory() {
  if (!sleepStoryState.playing) return;
  if (!('speechSynthesis' in window)) return;
  sleepStoryState.paused = !sleepStoryState.paused;
  if (sleepStoryState.paused) {
    speechSynthesis.pause();
    setText('sleep-pause-btn', '▶️ 继续');
  } else {
    speechSynthesis.resume();
    setText('sleep-pause-btn', '⏸️ 暂停');
  }
}
function stopSleepStory() {
  if (!sleepStoryState) return;
  sleepStoryState.playing = false;
  sleepStoryState.paused = false;
  if (sleepStoryState.interval) clearInterval(sleepStoryState.interval);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  addCls('sleep-player', 'hidden');
}
function initSleep() { stopSleepStory(); }
function logActivity(type, detail) {
  const today = getTodayStr();
  const log = StorageUtil.get('activity_log', {});
  if (!log[today]) log[today] = [];
  log[today].push({ type, detail, time: new Date().toISOString() });
  StorageUtil.set('activity_log', log);
}
function getActivityCount(dateStr) {
  const log = StorageUtil.get('activity_log', {});
  return (log[dateStr] || []).length;
}
function renderHeatmap() {
  const today = new Date();
  const el = document.getElementById('habit-heatmap');
  if (!el) return;
  let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">';
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const count = getActivityCount(key);
    const opacity = count > 8 ? 1 : count > 5 ? 0.7 : count > 2 ? 0.4 : count > 0 ? 0.2 : 0.05;
    const bg = count > 0 ? `rgba(212,181,199,${opacity})` : 'rgba(212,181,199,0.08)';
    html += `<div style="aspect-ratio:1;border-radius:4px;background:${bg};" title="${key}: ${count}项活动"></div>`;
  }
  html += '</div>';
  html += '<div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;margin-top:8px;">';
  html += '<span style="font-size:10px;color:var(--text-mute)">少</span>';
  [0.08,0.2,0.4,0.7,1].forEach(o => html += `<div style="width:10px;height:10px;border-radius:2px;background:rgba(212,181,199,${o>0.08?o:0.08})"></div>`);
  html += '<span style="font-size:10px;color:var(--text-mute)">多</span></div>';
  el.innerHTML = html;
}
function getSmartRecommendations() {
  const recs = [];
  const hour = new Date().getHours();
  const emotions = StorageUtil.get('emotion_notes', []);
  const lastEmotion = emotions.length > 0 ? emotions[emotions.length-1] : null;
  const mood = lastEmotion ? lastEmotion.level : 11;
  if (hour >= 6 && hour < 10) {
    recs.push({ type: 'affirm', title: '晨间肯定语', desc: '用肯定语开启美好的一天', action: () => showDailyAffirmation(), icon: '☀️' });
  } else if (hour >= 14 && hour < 17) {
    recs.push({ type: 'breathe', title: '午后呼吸', desc: '3分钟呼吸，重新聚焦能量', action: () => { showPage('breathe'); initBreathe(); }, icon: '🌬️' });
  } else if (hour >= 20 && hour < 23) {
    recs.push({ type: 'sleep', title: '睡前成长', desc: '在潜意识最开放的时刻成长', action: () => { showPage('sleep'); }, icon: '🌙' });
  }
  if (mood <= 6) {
    recs.push({ type: 'emotion', title: '情绪疗愈', desc: '你最近情绪有些低落，来释放一下吧', action: () => { showPage('emotion'); initEmotion(); }, icon: '💗' });
    recs.push({ type: 'movie', title: '疗愈影院', desc: '一部电影，一份温柔的疗愈', action: () => { showPage('movies'); initMovies(); }, icon: '🎬' });
  } else if (mood >= 14) {
    recs.push({ type: 'challenge', title: '21天成长挑战', desc: '情绪很好，适合开启新成长挑战！', action: () => { showPage('challenge'); initChallenge(); }, icon: '💪' });
    recs.push({ type: 'sats', title: 'SATS 冥想', desc: '趁着高能量状态，做一场成长冥想', action: () => { showPage('sats'); initSats(); }, icon: '🧘' });
  }
  const breatheRecs = StorageUtil.get('breathe_records', {});
  const breatheCount = Object.values(breatheRecs).reduce((a,b)=>a+b,0);
  if (breatheCount === 0) {
    recs.push({ type: 'breathe', title: '第一次呼吸', desc: '试试我们的静心呼吸，3分钟回归平静', action: () => { showPage('breathe'); initBreathe(); }, icon: '🌬️' });
  }
  const aiChats = StorageUtil.get('ai_chat_history', []);
  if (aiChats.length === 0) {
    recs.push({ type: 'ai', title: 'AI 闺蜜', desc: '有任何困惑，和AI闺蜜聊聊吧', action: () => { showPage('ai'); initAi(); }, icon: '🤖' });
  }
  const seen = new Set();
  return recs.filter(r => { if(seen.has(r.type)) return false; seen.add(r.type); return true; }).slice(0,6);
}
function showDailyAffirmation() {
  const affirm = state.dailyAffirm || '我值得拥有最好的一切 ✨';
  showAlert('☀️', '今日肯定语', affirm);
  if (state.voiceOn) speak(affirm, { rate: 0.9 });
}
function execSmartRec(type) {
  if (type === 'affirm') { showDailyAffirmation(); }
  else if (type === 'breathe') { showPage('breathe'); initBreathe(); }
  else if (type === 'sleep') { showPage('sleep'); }
  else if (type === 'emotion') { showPage('emotion'); initEmotion(); }
  else if (type === 'movie') { showPage('movies'); initMovies(); }
  else if (type === 'challenge') { showPage('challenge'); initChallenge(); }
  else if (type === 'sats') { showPage('sats'); initSats(); }
  else if (type === 'ai') { showPage('ai'); initAi(); }
}
function renderSmartRecommendations() {
  const el = document.getElementById('smart-recommendations');
  if (!el) return;
  const recs = getSmartRecommendations();
  if (recs.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="glass-card p-4 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">✨ 为你推荐</h3>
      <div class="space-y-2">
        ${recs.map(r => `
          <div class="flex items-center gap-3 p-2 rounded-xl cursor-pointer card-hover" style="background:rgba(255,255,255,0.5)" onclick="execSmartRec('${r.type}')">
            <div class="text-xl">${r.icon}</div>
            <div class="flex-1">
              <div class="text-sm font-medium" style="color:var(--theme-text)">${r.title}</div>
              <div class="text-xs" style="color:var(--text-mute)">${r.desc}</div>
            </div>
            <div style="color:var(--text-mute)">→</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function getUnlockedBadges() {
  if (typeof NEW_BADGES === 'undefined' || !Array.isArray(NEW_BADGES)) return [];
  return NEW_BADGES.filter(b => b.check());
}
function getBadgeProgress() {
  if (typeof NEW_BADGES === 'undefined' || !Array.isArray(NEW_BADGES)) return { total: 0, unlocked: 0, percent: 0 };
  const total = NEW_BADGES.length;
  const unlocked = getUnlockedBadges().length;
  return { total, unlocked, percent: total > 0 ? Math.round((unlocked / total) * 100) : 0 };
}
function renderBadgeWall() {
  const el = document.getElementById('badge-wall');
  if (!el) return;
  if (typeof NEW_BADGES === 'undefined' || !Array.isArray(NEW_BADGES)) {
    el.innerHTML = '<div class="glass-card p-6 text-center text-sm" style="color:var(--text-soft)">徽章数据加载中...</div>';
    return;
  }
  const unlocked = getUnlockedBadges();
  const unlockedIds = new Set(unlocked.map(b => b.id));
  el.innerHTML = `
    <div class="grid grid-cols-3 gap-3">
      ${NEW_BADGES.map(b => {
        const isUnlocked = unlockedIds.has(b.id);
        return `
          <div class="glass-card p-3 text-center ${isUnlocked ? 'card-hover' : 'opacity-50'}" style="border:${isUnlocked ? '2px solid rgba(212,181,199,0.4)' : '1px solid transparent'}">
            <div style="font-size:32px;margin-bottom:4px;filter:${isUnlocked ? 'none' : 'grayscale(100%)'}" class="${isUnlocked ? 'animate-breath' : ''}">${b.emoji}</div>
            <div class="text-xs font-medium" style="color:var(--theme-text)">${b.name}</div>
            <div class="text-[10px]" style="color:var(--text-mute)">${isUnlocked ? '✓ 已解锁' : '🔒 未解锁'}</div>
            <div class="text-[10px] mt-1" style="color:var(--text-soft)">${b.desc}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
function checkNewBadges() {
  const key = 'badges_unlocked_v54';
  const previously = new Set(StorageUtil.get(key, []));
  const now = getUnlockedBadges();
  const newBadges = now.filter(b => !previously.has(b.id));
  if (newBadges.length > 0) {
    StorageUtil.set(key, now.map(b => b.id));
    newBadges.forEach(b => {
      setTimeout(() => showToast(`🏆 解锁成就：${b.name} ${b.emoji}`), 500);
    });
  }
}
function initBadgeWall() {
  renderBadgeWall();
  updateBadgeProgress();
}
function updateBadgeProgress() {
  const { total, unlocked, percent } = getBadgeProgress();
  const bar = document.getElementById('badge-progress-bar');
  const text = document.getElementById('badge-progress-text');
  if (bar) bar.style.width = percent + '%';
  if (text) text.textContent = `${unlocked}/${total} 成就 (${percent}%)`;
  const meBadge = document.getElementById('me-badges');
  if (meBadge) meBadge.textContent = unlocked;
}
function openBadgeWall() {
  if (typeof NEW_BADGES === 'undefined') {
    loadDataScript('data/new_badges.js').then(() => { openBadgeWall(); });
    return;
  }
  showPage('badge-wall');
  initBadgeWall();
}
let moodChartInstance = null;
function initMoodChart() {
  const canvas = document.getElementById('mood-chart-canvas');
  if (!canvas) return;
  const emotions = StorageUtil.get('emotion_notes', []);
  const today = new Date();
  const labels = [];
  const dataPoints = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const shortLabel = `${d.getMonth()+1}/${d.getDate()}`;
    labels.push(shortLabel);
    const dayEmotions = emotions.filter(e => e.date === key);
    if (dayEmotions.length > 0) {
      const avg = Math.round(dayEmotions.reduce((s, e) => s + (e.level || 11), 0) / dayEmotions.length);
      dataPoints.push(avg);
    } else {
      dataPoints.push(null);
    }
  }
  const validPoints = dataPoints.filter(v => v !== null);
  const avgMood = validPoints.length ? Math.round(validPoints.reduce((a,b)=>a+b,0)/validPoints.length) : 0;
  const trend = validPoints.length >= 2 ? (validPoints[validPoints.length-1] - validPoints[0]) : 0;
  setHTML('mood-chart-stats', `
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${validPoints.length}</div><div class="text-xs" style="color:var(--text-mute)">记录天数</div></div>
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${avgMood || '--'}</div><div class="text-xs" style="color:var(--text-mute)">平均情绪</div></div>
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}${Math.abs(trend)}</div><div class="text-xs" style="color:var(--text-mute)">30天趋势</div></div>
    </div>
  `);
  if (moodChartInstance) { moodChartInstance.destroy(); }
  if (typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { showToast('浏览器不支持Canvas绘图'); return; }
  moodChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '情绪值',
        data: dataPoints,
        borderColor: '#D4B5C7',
        backgroundColor: 'rgba(212,181,199,0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#B8A9C9',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              if (val === null) return '无记录';
              const mood = val >= 14 ? '积极' : val >= 8 ? '平静' : '低落';
              return `情绪值: ${val} (${mood})`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 1, max: 21,
          grid: { color: 'rgba(184,169,201,0.1)' },
          ticks: { color: '#8B7E9C', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8B7E9C', font: { size: 10 }, maxTicksLimit: 10 }
        }
      }
    }
  });
}
let habitCalendarMonth = new Date();
function initHabitCalendar() {
  renderHabitCalendarDetailed(habitCalendarMonth);
}
function renderHabitCalendarDetailed(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay(); // 0=Sunday
  const daysInMonth = lastDay.getDate();
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  const titleEl = document.getElementById('habit-calendar-title');
  if (titleEl) titleEl.textContent = `${year}年 ${monthNames[month]}`;
  const activityLog = StorageUtil.get('activity_log', {});
  let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">';
  ['日','一','二','三','四','五','六'].forEach(d => {
    html += `<div style="font-size:11px;color:var(--text-mute);padding:4px 0;">${d}</div>`;
  });
  for (let i = 0; i < startPadding; i++) {
    html += '<div></div>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const activities = activityLog[key] || [];
    const count = activities.length;
    const isToday = key === getTodayStr();
    const bg = count > 3 ? 'linear-gradient(135deg,#D4B5C7,#B8A9C9)' : count > 0 ? 'rgba(212,181,199,0.4)' : 'rgba(255,255,255,0.5)';
    const color = count > 3 ? 'white' : 'var(--theme-text)';
    const border = isToday ? '2px solid #D4B5C7' : '1px solid rgba(212,181,199,0.2)';
    html += `
      <div class="cursor-pointer card-hover" style="aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:${bg};color:${color};border:${border};position:relative;" onclick="showHabitDayDetail('${key}')">
        ${d}
        ${count > 0 ? `<div style="position:absolute;bottom:2px;right:2px;width:5px;height:5px;border-radius:50%;background:${count > 3 ? 'rgba(255,255,255,0.6)' : '#D4B5C7'}"></div>` : ''}
      </div>
    `;
  }
  html += '</div>';
  setHTML('habit-calendar-grid', html);
}
function changeHabitMonth(delta) {
  habitCalendarMonth.setMonth(habitCalendarMonth.getMonth() + delta);
  renderHabitCalendarDetailed(habitCalendarMonth);
}
function showHabitDayDetail(dateStr) {
  const activityLog = StorageUtil.get('activity_log', {});
  const activities = activityLog[dateStr] || [];
  if (activities.length === 0) { showToast(`${dateStr} 无活动记录`); return; }
  const items = activities.map(a => {
    const typeMap = { mood: '💭', diary: '📔', habit: '✅', breathe: '🌬️', voice_record: '🎙️', sleep_story: '🌙', feedback: '💌' };
    return `<div style="padding:4px 0;font-size:12px;color:var(--text-soft);">${typeMap[a.type] || '✨'} ${a.detail}</div>`;
  }).join('');
  showAlert('📅', dateStr, items);
}
const VISION_CARDS_KEY = 'vision_board_cards';
const VISION_PRESETS = [
  { emoji: '🏠', text: '住在梦想的房子里', color: 'linear-gradient(135deg,#F5E1EA,#D4B5C7)' },
  { emoji: '💰', text: '财务自由，月入十万', color: 'linear-gradient(135deg,#FDE68A,#F59E0B)' },
  { emoji: '💕', text: '与SP幸福在一起', color: 'linear-gradient(135deg,#F5D5D5,#E8B4B8)' },
  { emoji: '✈️', text: '环游世界', color: 'linear-gradient(135deg,#DCE8F2,#9DB5C8)' },
  { emoji: '🏆', text: '事业成功，被认可', color: 'linear-gradient(135deg,#DDEBE0,#88C898)' },
  { emoji: '🧘', text: '内心平静喜悦', color: 'linear-gradient(135deg,#E8DEEF,#B8A9C9)' },
];
function initVisionBoard() {
  renderVisionCards();
}
function renderVisionCards() {
  const el = document.getElementById('vision-board');
  if (!el) return;
  let cards = StorageUtil.get(VISION_CARDS_KEY, []);
  if (cards.length === 0) {
    cards = VISION_PRESETS.map((p, i) => ({ id: i, ...p, created: new Date().toISOString() }));
    StorageUtil.set(VISION_CARDS_KEY, cards);
  }
  el.innerHTML = cards.map(c => {
    const frontContent = c.image
      ? `<img src="${c.image}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;position:absolute;inset:0" alt="${escapeHtml(c.text || '愿景图片')}"><div style="position:absolute;bottom:0;left:0;right:0;padding:12px;background:linear-gradient(transparent,rgba(0,0,0,0.6));border-radius:0 0 16px 16px"><div style="font-size:13px;color:white;text-align:center;font-weight:500;text-shadow:0 1px 2px rgba(0,0,0,0.5)">${escapeHtml(c.text)}</div></div>`
      : `<div style="font-size:40px;margin-bottom:8px">${c.emoji}</div><div style="font-size:13px;color:white;text-align:center;font-weight:500;text-shadow:0 1px 2px rgba(0,0,0,0.1)">${escapeHtml(c.text)}</div>`;
    return `
    <div class="vision-card-container" style="perspective:600px;cursor:pointer" onclick="flipVisionCard(this)" role="button" tabindex="0" aria-label="愿景卡片：${escapeHtml(c.text)}">
      <div class="vision-card-inner" style="position:relative;width:100%;aspect-ratio:1;transition:transform 0.6s;transform-style:preserve-3d">
        <div style="position:absolute;inset:0;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;overflow:hidden;${c.image ? '' : 'background:' + c.color + ';'}padding:0">
          ${frontContent}
        </div>
        <div style="position:absolute;inset:0;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);transform:rotateY(180deg);padding:16px">
          <div style="font-size:24px;margin-bottom:8px">✨</div>
          <div style="font-size:12px;color:white;text-align:center">这已经属于我的现实</div>
          <button type="button" onclick="event.stopPropagation();deleteVisionCard(${c.id})" style="margin-top:8px;background:rgba(255,255,255,0.3);border:none;border-radius:8px;padding:4px 12px;color:white;font-size:11px;cursor:pointer" aria-label="删除愿景">删除</button>
        </div>
      </div>
    </div>
  `}).join('');
}
function flipVisionCard(container) {
  const inner = container.querySelector('.vision-card-inner');
  const isFlipped = inner.style.transform === 'rotateY(180deg)';
  inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
}
let pendingVisionImage = null;
function handleVisionImage(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('请选择图片文件 📷'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('图片太大，请选小于10MB的图片'); return; }
  compressImage(file, 800, 0.7).then(dataUrl => {
    pendingVisionImage = dataUrl;
    const preview = document.getElementById('vision-image-preview');
    const img = document.getElementById('vision-preview-img');
    if (preview && img) { img.src = dataUrl; preview.classList.remove('hidden'); }
  }).catch(err => { showToast('图片处理失败'); console.error(err); });
}
function clearVisionImage() {
  pendingVisionImage = null;
  const input = document.getElementById('vision-image-input');
  const preview = document.getElementById('vision-image-preview');
  if (input) input.value = '';
  if (preview) preview.classList.add('hidden');
}
function compressImage(file, maxWidth=800, quality=0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxWidth) { h = h * (maxWidth / w); w = maxWidth; }
      if (h > maxWidth) { w = w * (maxWidth / h); h = maxWidth; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function addVisionCard() {
  const input = document.getElementById('vision-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text && !pendingVisionImage) { showToast('先写下你的愿望 ✨'); return; }
  const emojis = ['🌟','💖','🦋','🌈','💎','🌸','🔥','💫','🌙','☀️'];
  const colors = [
    'linear-gradient(135deg,#F5E1EA,#D4B5C7)',
    'linear-gradient(135deg,#FDE68A,#F59E0B)',
    'linear-gradient(135deg,#DCE8F2,#9DB5C8)',
    'linear-gradient(135deg,#DDEBE0,#88C898)',
    'linear-gradient(135deg,#E8DEEF,#B8A9C9)',
  ];
  const cards = StorageUtil.get(VISION_CARDS_KEY, []);
  const id = Date.now();
  const card = { id, emoji: emojis[Math.floor(Math.random()*emojis.length)], text: text || '我的愿望', color: colors[Math.floor(Math.random()*colors.length)], created: new Date().toISOString() };
  if (pendingVisionImage) { card.image = pendingVisionImage; }
  cards.unshift(card);
  if (cards.length > 12) cards.pop();
  StorageUtil.set(VISION_CARDS_KEY, cards);
  input.value = '';
  clearVisionImage();
  renderVisionCards();
  showToast('✨ 愿望已添加到梦想画册');
  logActivity('vision', '添加愿景: ' + (text || '(图片)'));
}
function deleteVisionCard(id) {
  if (!confirm('删除这个愿景？')) return;
  let cards = StorageUtil.get(VISION_CARDS_KEY, []);
  cards = cards.filter(c => c.id !== id);
  StorageUtil.set(VISION_CARDS_KEY, cards);
  renderVisionCards();
}
function playVisionSats() {
  showToast('🧘 对着梦想画册深呼吸...想象这些已经是你的现实');
  setTimeout(() => { showPage('sats'); initSats(); }, 1500);
}
function generateDataQR() {
  const exportArea = document.getElementById('qr-export-area');
  const display = document.getElementById('qr-code-display');
  if (!exportArea || !display) return;
  const data = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cosmos_')) {
        data[key] = localStorage.getItem(key);
      }
    }
  } catch(e) { console.warn('导出数据失败', e); }
  try {
    const json = JSON.stringify(data);
    const compressed = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
    const chunkSize = 800;
    const chunks = [];
    for (let i = 0; i < compressed.length; i += chunkSize) {
      chunks.push(compressed.slice(i, i + chunkSize));
    }
    if (typeof QRCode !== 'undefined') {
      display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><canvas id="qr-canvas" style="width:160px;height:160px;"></canvas></div><div class="text-xs" style="color:var(--text-mute);margin-top:4px">扫描上方二维码同步数据</div>';
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        QRCode.toCanvas(canvas, compressed, { width: 160, margin: 2, errorCorrectionLevel: 'M' }, function(err) {
          if (err) {
            console.warn('QR生成失败:', err);
            display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;text-align:center;padding:8px">数据过大<br>请使用复制</div></div>';
          }
        });
      }
    } else {
      display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;text-align:center;padding:8px">二维码库<br>加载失败</div></div>';
    }
    window.__qrSyncData = compressed;
    exportArea.classList.remove('hidden');
    addCls('qr-import-area', 'hidden');
    showToast('同步码已生成，请用另一台设备扫描或复制');
  } catch(e) {
    showToast('数据生成失败: ' + (e.message || '未知错误'));
  }
}
function copyDataText() {
  const data = window.__qrSyncData || '';
  if (!data) { showToast('请先生成同步码'); return; }
  navigator.clipboard?.writeText(data).then(() => showToast('已复制到剪贴板')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = data;
    document.body.appendChild(ta);
    ta.select();
    if (document.execCommand) {
      document.execCommand('copy');
    } else {
      showToast('浏览器不支持复制命令');
      document.body.removeChild(ta);
      return;
    }
    document.body.removeChild(ta);
    showToast('已复制到剪贴板');
  });
}
function showImportInput() {
  remCls('qr-import-area', 'hidden');
  addCls('qr-export-area', 'hidden');
}
function importFromQRText() {
  const text = document.getElementById('qr-import-text')?.value.trim();
  if (!text) { showToast('请粘贴同步文本'); return; }
  try {
    const json = decodeURIComponent(atob(text).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const data = JSON.parse(json);
    const previewEl = document.getElementById('import-preview');
    if (previewEl) {
      const entries = Object.entries(data).filter(([k]) => k.startsWith('cosmos_'));
      const items = entries.map(([k, v]) => {
        const short = k.replace('cosmos_', '');
        const size = v.length > 100 ? v.slice(0, 100) + '...' : v;
        return `<div style="padding:4px 0;font-size:12px;color:var(--text-soft)"><strong>${short}</strong>: ${size}</div>`;
      }).join('');
      previewEl.innerHTML = `<div class="text-sm mb-2" style="color:var(--theme-text)">发现 ${entries.length} 项数据：</div>${items}`;
      previewEl.classList.remove('hidden');
    }
    window.__pendingImport = data;
    remCls('import-confirm-btn', 'hidden');
    showToast('数据已解析，请确认后导入');
  } catch (e) {
    showToast('导入失败，请检查同步文本是否完整');
  }
}
function confirmImport() {
  const data = window.__pendingImport;
  if (!data) { showToast('没有待导入的数据'); return; }
  let count = 0;
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('cosmos_')) {
      try { localStorage.setItem(key, value); } catch(e) {}
      count++;
    }
  });
  logActivity('import', '导入数据');
  showToast(`✅ 成功导入 ${count} 项数据，请刷新页面`);
  setTimeout(() => location.reload(), 2000);
}
function exportSelectedData() {
  const checkboxes = document.querySelectorAll('.export-checkbox:checked');
  if (checkboxes.length === 0) { showToast('请选择至少一项要导出的数据'); return; }
  const selectedKeys = Array.from(checkboxes).map(cb => 'cosmos_' + cb.dataset.key);
  const data = {};
  selectedKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    } catch(e) {}
  });
  let compressed = '';
  try {
    const json = JSON.stringify(data);
    compressed = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
  } catch(e) {
    showToast('数据生成失败: ' + (e.message || '未知错误'));
    return;
  }
  const display = document.getElementById('qr-code-display');
  if (display) {
    if (typeof QRCode !== 'undefined') {
      display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><canvas id="qr-canvas" style="width:160px;height:160px;"></canvas></div><div class="text-xs" style="color:var(--text-mute);margin-top:4px">扫描上方二维码同步数据</div>';
      const canvas = document.getElementById('qr-canvas');
      if (canvas) {
        QRCode.toCanvas(canvas, compressed, { width: 160, margin: 2, errorCorrectionLevel: 'M' }, function(err) {
          if (err) {
            console.warn('QR生成失败:', err);
            display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;text-align:center;padding:8px">数据过大<br>请使用复制</div></div>';
          }
        });
      }
    } else {
      display.innerHTML = '<div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px"><div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;text-align:center;padding:8px">二维码库<br>加载失败</div></div>';
    }
  }
  window.__qrSyncData = compressed;
  remCls('qr-export-area', 'hidden');
  addCls('qr-import-area', 'hidden');
  logActivity('export', '导出数据');
  showToast(`已导出 ${checkboxes.length} 类数据`);
}
const SATS_STEPS = [
  { title: '1. 放松身体', emoji: '🫁', desc: '从头顶到脚底，逐一放松每一块肌肉。深呼吸三次，让身体沉入床中。', tip: '吸气 4秒 → 屏息 4秒 → 呼气 6秒' },
  { title: '2. 想象场景', emoji: '🎬', desc: '不是"看"画面，而是"进入"画面，成为其中的人。想象你正在体验愿望实现的场景。', tip: '用第一人称视角，像看电影主角一样' },
  { title: '3. 感受情绪', emoji: '💖', desc: '最关键：让"已经拥有"的感觉充满全身。感受那种喜悦、满足、感恩。', tip: '情绪越强烈，成长越快' },
  { title: '4. 循环重复', emoji: '🔁', desc: '同一个场景在脑中反复播放，像循环播放一首最爱的歌。直到自然入睡。', tip: '不要改变场景，重复同一版本' },
  { title: '5. 信任过程', emoji: '✨', desc: '不需要知道"怎么做"，只需要知道"已经成"。放下控制，让宇宙接手。', tip: '带着这份感觉入睡，醒来时已在新现实' },
];
function nextSatsStep() {
  if (satsCurrentStep < SATS_STEPS.length - 1) {
    satsCurrentStep++;
    renderSatsStep();
  } else {
    showToast('🌙 引导完成，开始你的SATS冥想');
    startSatsTimer();
  }
}
function prevSatsStep() {
  if (satsCurrentStep > 0) {
    satsCurrentStep--;
    renderSatsStep();
  }
}
function renderSatsStep() {
  const step = SATS_STEPS[satsCurrentStep];
  setText('sats-step-num', satsCurrentStep + 1);
  setHTML('sats-step-content', `
    <div class="text-lg font-medium mb-2" style="color:var(--theme-text)">${step.title}</div>
    <div class="text-sm mb-3" style="color:var(--text-soft)">${step.desc}</div>
    <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.1)">
      <div class="text-2xl mb-1">${step.emoji}</div>
      <div class="text-xs" style="color:var(--text-mute)">${step.tip}</div>
    </div>
  `);
  toggleCls('sats-prev-btn', 'hidden', satsCurrentStep === 0);
  const nextBtn = document.getElementById('sats-next-btn');
  nextBtn.textContent = satsCurrentStep === SATS_STEPS.length - 1 ? '开始冥想 ✨' : '下一步 →';
}
function initSats() {
  satsCurrentStep = 0;
  renderSatsStep();
  renderSatsScenes();
  updateSatsTimerDisplay();
}
function initExportOptions() {
  const el = document.getElementById('export-options');
  if (!el) return;
  const options = [
    { key: 'island_state', label: '用户状态', emoji: '👤' },
    { key: 'emotion_notes', label: '情绪花园', emoji: '💭' },
    { key: 'diaries', label: '星辰日记', emoji: '📔' },
    { key: 'breathe_records', label: '呼吸记录', emoji: '🌬️' },
    { key: 'voice_recordings', label: '语音录音', emoji: '🎙️' },
    { key: 'vision_board_cards', label: '梦想画册', emoji: '🖼️' },
    { key: 'activity_log', label: '活动日志', emoji: '📊' },
    { key: 'challenge_state', label: '成长挑战进度', emoji: '💪' },
    { key: 'crystalState', label: '星光水晶货币', emoji: '💎' },
    { key: 'feedback_history', label: '反馈历史', emoji: '💌' },
  ];
  el.innerHTML = options.map(opt => `
    <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer card-hover" style="background:rgba(255,255,255,0.5)">
      <input type="checkbox" class="export-checkbox" data-key="${opt.key}" checked style="accent-color:#D4B5C7;width:18px;height:18px">
      <div class="text-xl">${opt.emoji}</div>
      <div class="flex-1">
        <div class="text-sm font-medium" style="color:var(--theme-text)">${opt.label}</div>
        <div class="text-xs" style="color:var(--text-mute)">${(() => { try { return localStorage.getItem('cosmos_' + opt.key) ? '有数据' : '无数据'; } catch(e) { return '无数据'; } })()}</div>
      </div>
    </label>
  `).join('');
}
function selectAllExport(checked) {
  document.querySelectorAll('.export-checkbox').forEach(cb => cb.checked = checked);
}
function initAbout() {
  const year = new Date().getFullYear();
  const el = document.getElementById('about-content');
  if (!el) return;
  el.innerHTML = `
    <div class="glass-card p-5 mb-4 text-center">
      <div class="text-4xl mb-3">🏝️</div>
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">许愿岛</h2>
      <p class="text-sm" style="color:var(--text-soft)">Star Wish Garden — 星愿百宝箱</p>
      <div class="mt-3 inline-block px-3 py-1 rounded-full text-xs" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">v6.1 许愿岛全面版</div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🌟 版本历程</h3>
      <div class="space-y-2 text-xs" style="color:var(--text-soft)">
        <div class="flex justify-between"><span>v1.0</span><span>许愿岛基础</span></div>
        <div class="flex justify-between"><span>v2.0</span><span>花园、星愿、日记</span></div>
        <div class="flex justify-between"><span>v3.0</span><span>智慧花园、星辰塔罗、星辰社区</span></div>
        <div class="flex justify-between"><span>v3.5</span><span>音频冥想引导系统</span></div>
        <div class="flex justify-between"><span>v4.0</span><span>21天成长蜕变</span></div>
        <div class="flex justify-between"><span>v5.0</span><span>PWA、成长教练系统、星光会员</span></div>
        <div class="flex justify-between"><span>v5.1</span><span>呼吸法、语音祈愿、睡眠</span></div>
        <div class="flex justify-between"><span>v5.2</span><span>情绪图表、习惯日历</span></div>
        <div class="flex justify-between"><span>v5.3</span><span>页面转场、3D彩蛋、二维码同步</span></div>
        <div class="flex justify-between"><span>v5.4</span><span>星光徽章系统</span></div>
        <div class="flex justify-between"><span>v5.5</span><span>能量体检完善、成长旅程、能量清理</span></div>
        <div class="flex justify-between"><span>v6.0</span><span>369成长法、55x5成长法、宇宙回音簿、Focus Wheel</span></div>
        <div class="flex justify-between"><span>v6.1</span><span>一分钟魔法、宇宙钱包、心情罗盘、枕边蜜语</span></div>
        <div class="flex justify-between"><span class="font-medium" style="color:var(--theme-text)">v6.2</span><span class="font-medium" style="color:var(--theme-text)">放手仪式、旧故事翻篇、心愿宝盒、感恩风暴</span></div>
      </div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">📊 数据统计</h3>
      <div id="about-stats" class="grid grid-cols-2 gap-3 text-center"></div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">💡 核心理念</h3>
      <p class="text-xs leading-relaxed" style="color:var(--text-soft)">
        许愿岛基于内维尔·戈达德的"意识创造现实"理论构建。我们相信：当你能在想象中清晰感受愿望已实现的喜悦，并在睡前（State Akin to Sleep, SATS）沉浸于这种感受，你的潜意识会接受这个「已完成的版本」为真实，外在现实必将与之匹配。
      </p>
    </div>
    <div class="text-center text-xs mt-6 mb-4" style="color:var(--text-mute)">© ${year} 许愿岛 · 所有数据本地存储，保护隐私</div>
  `;
  renderAboutStats();
}
function renderAboutStats() {
  const el = document.getElementById('about-stats');
  if (!el) return;
  const wishes = state.wishes?.length || 0;
  const diary = state.diaries?.length || 0;
  const notes = StorageUtil.get('emotion_notes', []).length;
  const checks = state.purify?.total || 0;
  const flowers = (state.garden?.flowers || []).filter(f => f.done).length;
  const habits = state.habits?.length || 0;
  const days = state.startDate ? (() => { const d = new Date(state.startDate).getTime(); return isNaN(d) ? 0 : Math.max(1, Math.ceil((Date.now() - d) / 86400000)); })() : 0;
  el.innerHTML = [
    { label: '愿望数', value: wishes },
    { label: '星辰日记', value: diary },
    { label: '情绪花园', value: notes },
    { label: '清理打卡', value: checks },
    { label: '已开花朵', value: flowers },
    { label: '习惯数', value: habits },
    { label: '使用天数', value: days },
    { label: '星光水晶货币', value: (typeof crystalState !== 'undefined' ? crystalState.crystals : 0) || 0 }
  ].map(s => `
    <div class="p-3 rounded-xl" style="background:rgba(212,181,199,0.08)">
      <div class="text-lg font-medium" style="color:var(--theme-text)">${s.value}</div>
      <div class="text-xs" style="color:var(--text-mute)">${s.label}</div>
    </div>
  `).join('');
}
function initHealth() {
  const el = document.getElementById('health-content');
  if (!el) return;
  const total = StorageUtil.size();
  const max = 5 * 1024 * 1024;
  const pct = Math.min(100, (total / max * 100).toFixed(1));
  const keys = StorageUtil.keys().filter(k => k.startsWith('cosmos_') || k.startsWith('challenge_') || k.startsWith('emotion_') || k.startsWith('wealth_') || k.startsWith('ai_') || k.startsWith('breathe_') || k.startsWith('voice_') || k.startsWith('vision_') || k.startsWith('activity_log') || k.startsWith('crystal'));
  el.innerHTML = `
    <div class="glass-card p-5 mb-4 text-center">
      <div class="text-4xl mb-3">💚</div>
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">能量体检</h2>
      <p class="text-sm" style="color:var(--text-soft)">检查数据存储状态与浏览器兼容性</p>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">📦 存储空间</h3>
      <div class="w-full h-3 rounded-full mb-2" style="background:rgba(212,181,199,0.15)">
        <div class="h-full rounded-full" style="width:${pct}%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9);transition:width 0.5s ease"></div>
      </div>
      <div class="flex justify-between text-xs" style="color:var(--text-mute)">
        <span>已用 ${(total/1024).toFixed(1)} KB</span>
        <span>上限 5 MB</span>
      </div>
      <div class="mt-3 text-xs" style="color:var(--text-soft)">
        数据条目: ${keys.length} 个本地存储键
      </div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🔍 诊断检查</h3>
      <div id="health-diagnostics" class="space-y-2 text-xs"></div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🛡️ 隐私提示</h3>
      <p class="text-xs leading-relaxed" style="color:var(--text-soft)">
        所有数据仅存储在您的设备本地（localStorage）。清除浏览器数据或卸载应用将导致数据丢失。建议定期使用「二维码同步」功能备份到另一台设备。
      </p>
    </div>
  `;
  runHealthDiagnostics();
}
function runHealthDiagnostics() {
  const el = document.getElementById('health-diagnostics');
  if (!el) return;
  const checks = [
    { name: 'LocalStorage 可用', test: () => typeof localStorage !== 'undefined' },
    { name: 'JSON 解析正常', test: () => { try { JSON.parse('{"a":1}'); return true; } catch(e) { return false; } } },
    { name: '数据格式兼容', test: () => { try { const s = localStorage.getItem('cosmos_island_state_v3'); if (!s) return true; JSON.parse(s); return true; } catch(e) { return false; } } },
    { name: '音频 API 支持', test: () => typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined' },
    { name: '语音合成 支持', test: () => 'speechSynthesis' in window },
    { name: '触屏/指针事件', test: () => 'ontouchstart' in window || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) },
  ];
  el.innerHTML = checks.map(c => {
    const pass = c.test();
    return `<div class="flex items-center gap-2"><span class="text-sm">${pass ? '✅' : '⚠️'}</span><span style="color:${pass ? 'var(--text-soft)' : '#E8A0A0'}">${c.name}</span></div>`;
  }).join('');
}
function initStats() {
  const el = document.getElementById('stats-content');
  if (!el) return;
  const log = StorageUtil.get('activity_log', {});
  const days = Object.keys(log).length;
  const total = Object.values(log).reduce((a, b) => a + (Array.isArray(b) ? b.length : 0), 0);
  const categories = {};
  Object.values(log).forEach(day => {
    if (Array.isArray(day)) day.forEach(e => {
      const cat = e.type || '其他';
      categories[cat] = (categories[cat] || 0) + 1;
    });
  });
  el.innerHTML = `
    <div class="glass-card p-5 mb-4 text-center">
      <div class="text-4xl mb-3">📊</div>
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">成长旅程</h2>
      <p class="text-sm" style="color:var(--text-soft)">了解你的星愿练习轨迹</p>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">📈 总体数据</h3>
      <div class="grid grid-cols-2 gap-3 text-center">
        <div class="p-3 rounded-xl" style="background:rgba(212,181,199,0.08)">
          <div class="text-lg font-medium" style="color:var(--theme-text)">${days}</div>
          <div class="text-xs" style="color:var(--text-mute)">活跃天数</div>
        </div>
        <div class="p-3 rounded-xl" style="background:rgba(212,181,199,0.08)">
          <div class="text-lg font-medium" style="color:var(--theme-text)">${total}</div>
          <div class="text-xs" style="color:var(--text-mute)">总操作数</div>
        </div>
      </div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🏷️ 分类分布</h3>
      <div id="stats-categories" class="space-y-2"></div>
    </div>
  `;
  const catEl = document.getElementById('stats-categories');
  if (catEl) {
    const max = Math.max(...Object.values(categories), 1);
    catEl.innerHTML = Object.entries(categories).map(([cat, count]) => {
      const pct = (count / max * 100).toFixed(0);
      return `
        <div class="flex items-center gap-2">
          <span class="text-xs w-16 shrink-0" style="color:var(--text-soft)">${cat}</span>
          <div class="flex-1 h-2 rounded-full" style="background:rgba(212,181,199,0.15)">
            <div class="h-full rounded-full" style="width:${pct}%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9)"></div>
          </div>
          <span class="text-xs w-8 text-right" style="color:var(--text-mute)">${count}</span>
        </div>
      `;
    }).join('');
  }
}
function initCleanup() {
  const el = document.getElementById('cleanup-content');
  if (!el) return;
  const keys = StorageUtil.keys().filter(k => k.startsWith('cosmos_') || k.startsWith('challenge_') || k.startsWith('emotion_') || k.startsWith('wealth_') || k.startsWith('ai_') || k.startsWith('breathe_') || k.startsWith('voice_') || k.startsWith('vision_') || k.startsWith('activity_log') || k.startsWith('crystal') || k.startsWith('feedback_'));
  el.innerHTML = `
    <div class="glass-card p-5 mb-4 text-center">
      <div class="text-4xl mb-3">🧹</div>
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">能量清理</h2>
      <p class="text-sm" style="color:var(--text-soft)">管理本地存储，释放空间</p>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">📋 数据项目 (${keys.length})</h3>
      <div id="cleanup-list" class="space-y-2 max-h-64 overflow-y-auto"></div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">⚠️ 危险操作</h3>
      <button onclick="resetAllData()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:linear-gradient(135deg,#E8A0A0,#D4B5C7);color:white">🗑️ 重置所有数据</button>
      <p class="text-xs mt-2 text-center" style="color:var(--text-mute)">此操作不可撤销，请确保已备份</p>
    </div>
  `;
  renderCleanupList(keys);
}
function renderCleanupList(keys) {
  const el = document.getElementById('cleanup-list');
  if (!el) return;
  el.innerHTML = keys.map(k => {
    let size = 0;
    try { const v = localStorage.getItem(k); size = v ? v.length * 2 : 0; } catch(e) {}
    const sizeStr = size > 1024 ? (size/1024).toFixed(1) + ' KB' : size + ' B';
    return `
      <div class="flex items-center justify-between p-2 rounded-lg" style="background:rgba(212,181,199,0.05)">
        <div class="text-xs truncate mr-2" style="color:var(--text-soft);max-width:60%">${k}</div>
        <div class="flex items-center gap-2">
          <span class="text-xs" style="color:var(--text-mute)">${sizeStr}</span>
          <button onclick="deleteStorageKey('${k}')" class="text-xs px-2 py-1 rounded" style="background:rgba(232,160,160,0.2);color:#E8A0A0">删除</button>
        </div>
      </div>
    `;
  }).join('');
}
function deleteStorageKey(key) {
  if (!confirm('确定删除「' + key + '」?')) return;
  StorageUtil.remove(key);
  showToast('已删除');
  initCleanup();
}
function resetAllData() {
  if (!confirm('⚠️ 这将清除所有许愿岛数据，包括愿望、日记、习惯、星光水晶货币等。此操作不可撤销！\n\n确定要继续吗？')) return;
  if (!confirm('最后确认：你真的要清空所有数据吗？')) return;
  const keys = StorageUtil.keys().filter(k => k.startsWith('cosmos_') || k.startsWith('challenge_') || k.startsWith('emotion_') || k.startsWith('wealth_') || k.startsWith('ai_') || k.startsWith('breathe_') || k.startsWith('voice_') || k.startsWith('vision_') || k.startsWith('activity_log') || k.startsWith('crystal') || k.startsWith('feedback_'));
  keys.forEach(k => StorageUtil.remove(k));
  try { localStorage.removeItem('cosmos_island_welcomed_v3'); } catch(e) {}
  showToast('🗑️ 所有数据已重置');
  setTimeout(() => location.reload(), 1500);
}
function getProsperityState() {
  const s = StorageUtil.get('cosmos_prosperity_state', { day: 1, records: [] });
  if (!Array.isArray(s.records)) s.records = [];
  if (typeof s.day !== 'number') s.day = 1;
  return s;
}
function saveProsperityState(state) { StorageUtil.set('cosmos_prosperity_state', state); }
function initProsperity() {
  renderProsperity();
}
function renderProsperity() {
  const state = getProsperityState();
  const container = document.getElementById('prosperity-content');
  if (!container) return;
  const amount = state.day * 1000;
  const todayRecord = state.records.find(r => r.date === getTodayStr());
  const history = state.records.slice().reverse().slice(0, 10).map(r => `
    <div class="glass-card p-3 mb-2">
      <div class="flex justify-between items-center">
        <div class="text-sm font-medium" style="color:var(--theme-text)">第 ${r.day} 天 · $${(r.day * 1000).toLocaleString()}</div>
        <div class="text-xs" style="color:var(--text-mute)">${r.date}</div>
      </div>
      <div class="text-xs mt-1" style="color:var(--text-soft)">${r.spent}</div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">💰</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">宇宙钱包</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Abraham-Hicks 经典练习：想象你有一个魔法账户，每天多$1,000。你必须在当天花完！</p>
      <div class="p-4 rounded-xl mb-4 text-center" style="background:linear-gradient(135deg, rgba(212,181,199,0.15), rgba(184,169,201,0.1))">
        <div class="text-xs mb-1" style="color:var(--text-mute)">第 ${state.day} 天 · 今日金额</div>
        <div class="text-3xl font-medium" style="color:var(--theme-accent); font-family:'ZCOOL XiaoWei',sans-serif">$${amount.toLocaleString()}</div>
      </div>
      ${todayRecord ? `
        <div class="glass-card p-4 mb-4">
          <div class="text-xs mb-1" style="color:var(--text-mute)">今日已记录</div>
          <div class="text-sm" style="color:var(--theme-text)">${todayRecord.spent}</div>
        </div>
        <button onclick="nextProsperityDay()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">进入第 ${state.day + 1} 天 →</button>
      ` : `
        <textarea id="prosperity-input" class="dream-input w-full mb-3 text-sm" rows="3" placeholder="今天你要怎么花这 $${amount.toLocaleString()}？（例：买一张去马尔代夫的机票、给父母买礼物...）"></textarea>
        <button onclick="saveProsperityDay()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">记录今日花费</button>
      `}
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">历史记录</div>
    ${history || '<div class="glass-card p-4 text-center text-sm" style="color:var(--theme-text); opacity:0.4">暂无记录</div>'}
  `;
}
function saveProsperityDay() {
  const spent = document.getElementById('prosperity-input')?.value.trim();
  if (!spent) { showToast('请写下今日的花费计划'); return; }
  const state = getProsperityState();
  state.records.push({ day: state.day, date: getTodayStr(), spent });
  saveProsperityState(state);
  showToast('💰 宇宙钱包记录已保存');
  logActivity('prosperity', 'day_' + state.day);
  renderProsperity();
}
function nextProsperityDay() {
  const state = getProsperityState();
  state.day++;
  saveProsperityState(state);
  showToast('进入第 ' + state.day + ' 天！');
  renderProsperity();
}
const EMOTIONAL_SCALE = [
  { level: 1, name: '恐惧/无力/绝望', color: '#8B0000', desc: '感觉被困住，看不到出路' },
  { level: 2, name: '悲伤/内疚/不配', color: '#A52A2A', desc: '深深的失落感和自责' },
  { level: 3, name: '愤怒/报复', color: '#CD5C5C', desc: '想要反击或惩罚' },
  { level: 4, name: '怨恨/责备', color: '#D2691E', desc: '觉得都是别人的错' },
  { level: 5, name: '怀疑/失望', color: '#B8860B', desc: '开始失去希望' },
  { level: 6, name: '担忧/焦虑', color: '#DAA520', desc: '对未来感到不安' },
  { level: 7, name: '无聊/不满足', color: '#808080', desc: '生活平淡无奇' },
  { level: 8, name: '满足/中立', color: '#6B8E6B', desc: '基本OK，但没什么特别的' },
  { level: 9, name: '希望/乐观', color: '#66CDAA', desc: '开始看到可能性' },
  { level: 10, name: '期待/兴奋', color: '#20B2AA', desc: '对未来感到期待' },
  { level: 11, name: '热情/激情', color: '#00CED1', desc: '充满动力和能量' },
  { level: 12, name: '快乐/欣赏', color: '#D4B5C7', desc: '感到幸福和感恩' },
  { level: 13, name: '爱/自由/赋能', color: '#B8A9C9', desc: '与一切和谐共处' }
];
function getEmoscaleState() {
  const s = StorageUtil.get('cosmos_emoscale_state', { history: [], currentLevel: 7 });
  if (!Array.isArray(s.history)) s.history = [];
  if (typeof s.currentLevel !== 'number') s.currentLevel = 7;
  return s;
}
function saveEmoscaleState(state) { StorageUtil.set('cosmos_emoscale_state', state); }
function initEmoscale() {
  renderEmoscale();
}
function renderEmoscale() {
  const state = getEmoscaleState();
  const container = document.getElementById('emoscale-content');
  if (!container) return;
  const scale = EMOTIONAL_SCALE.map(e => `
    <div class="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer card-hover ${state.currentLevel === e.level ? 'outline-2' : ''}" style="background:${e.color}15; ${state.currentLevel === e.level ? 'outline:2px solid '+e.color : ''}" onclick="selectEmoLevel(${e.level})">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style="background:${e.color};color:white">${e.level}</div>
      <div class="flex-1">
        <div class="text-sm font-medium" style="color:var(--theme-text)">${e.name}</div>
        <div class="text-xs" style="color:var(--text-soft)">${e.desc}</div>
      </div>
      ${state.currentLevel === e.level ? '<span class="text-sm">✓</span>' : ''}
    </div>
  `).join('');
  const current = EMOTIONAL_SCALE.find(e => e.level === state.currentLevel) || EMOTIONAL_SCALE[6];
  const suggestions = getEmoSuggestions(state.currentLevel);
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🎚️</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">心情罗盘导航器</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">基于 Abraham-Hicks 情感引导量表。诚实地选择你现在的位置，系统会为你推荐最适合的练习。</p>
      <div class="p-4 rounded-xl mb-3" style="background:${current.color}15; border:1px solid ${current.color}30">
        <div class="text-xs mb-1" style="color:var(--text-mute)">当前位置</div>
        <div class="text-xl font-medium" style="color:${current.color}">${current.name}</div>
      </div>
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="font-medium text-sm mb-3" style="color:var(--theme-text)">推荐的星愿练习</div>
      ${suggestions.map(s => `
        <div class="p-3 rounded-xl mb-2" style="background:rgba(212,181,199,0.08)">
          <div class="text-sm font-medium mb-1" style="color:var(--theme-text)">${s.title}</div>
          <div class="text-xs" style="color:var(--text-soft)">${s.desc}</div>
          <button onclick="${s.action}" class="mt-2 px-3 py-1.5 rounded-lg text-xs" style="background:var(--theme-accent); color:#fff">开始练习</button>
        </div>
      `).join('')}
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">情感刻度</div>
    <div class="space-y-1">${scale}</div>
  `;
}
function selectEmoLevel(level) {
  const state = getEmoscaleState();
  state.currentLevel = level;
  state.history.push({ date: getTodayStr(), level });
  saveEmoscaleState(state);
  renderEmoscale();
  showToast('情感位置已更新');
  logActivity('emoscale', 'level_' + level);
}
function getEmoSuggestions(level) {
  if (level <= 3) {
    return [
      { title: '🛏️ 枕边蜜语', desc: '写下你的愿望放在枕下，让潜意识在睡眠中工作', action: "showPage('pillow');initPillow()" },
      { title: '💤 睡眠故事', desc: '听一段引导睡眠的成长故事，放松身心', action: "showPage('sleep');initSleep()" },
      { title: '🌬️ 静心呼吸', desc: '4-7-8呼吸法，快速平复情绪', action: "showPage('breathe');initBreathe()" }
    ];
  } else if (level <= 6) {
    return [
      { title: '📝 五五五成长咒', desc: '5天集中书写，重建信念', action: "showPage('55x5');init55x5()" },
      { title: '🔮 修正法', desc: '在想象中修正一段不愉快的经历', action: "openModule('tower')" },
      { title: '✨ 三六九书写咒', desc: '温和而持续的肯定语练习', action: "showPage('369');init369()" }
    ];
  } else if (level <= 9) {
    return [
      { title: '⏱️ 一分钟魔法', desc: '68秒纯专注，激活你的愿望振动', action: "showPage('68sec');init68sec()" },
      { title: '💰 宇宙钱包', desc: '想象花钱，提升丰盛感', action: "showPage('prosperity');initProsperity()" },
      { title: '🌙 SATS 冥想', desc: '睡前视觉化，进入似睡状态', action: "showPage('sats');initSats()" }
    ];
  } else {
    return [
      { title: '🎯 Focus Wheel', desc: '将你的正面 momentum 推得更远', action: "showPage('wheel');initWheel()" },
      { title: '🌸 肯定语循环', desc: '聆听你的肯定语，保持高振动', action: "showPage('audio');initAudioPage()" },
      { title: '🦋 宇宙回音簿', desc: '记录你看到的同步性和巧合', action: "showPage('signs');initSigns()" }
    ];
  }
}
function getPillowState() {
  const s = StorageUtil.get('cosmos_pillow_state', { currentWish: '', history: [] });
  if (!Array.isArray(s.history)) s.history = [];
  return s;
}
function savePillowState(state) { StorageUtil.set('cosmos_pillow_state', state); }
function initPillow() {
  renderPillow();
}
function renderPillow() {
  const state = getPillowState();
  const container = document.getElementById('pillow-content');
  if (!container) return;
  const today = getTodayStr();
  const doneToday = state.history.some(h => h.date === today);
  const history = state.history.slice().reverse().slice(0, 7).map(h => `
    <div class="glass-card p-3 mb-2">
      <div class="text-xs mb-1" style="color:var(--text-mute)">${h.date}</div>
      <div class="text-sm" style="color:var(--theme-text)">「${h.wish}」</div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🛏️</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">枕边蜜语</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">写下你的愿望或肯定语，放在枕头下入睡。让潜意识在睡眠中吸收这个意图，是最古老的成长方法之一。</p>
      ${doneToday ? `
        <div class="p-4 rounded-xl mb-4" style="background:rgba(212,181,199,0.15)">
          <div class="text-sm mb-2" style="color:var(--theme-text)">今晚已放置</div>
          <div class="text-lg font-medium" style="color:var(--theme-accent); font-family:'ZCOOL XiaoWei',sans-serif">「${state.currentWish}」</div>
          <div class="text-xs mt-2" style="color:var(--text-mute)">晚安，让梦境带你靠近愿望 ✨</div>
        </div>
      ` : `
        <textarea id="pillow-input" class="dream-input w-full mb-3 text-sm text-center" rows="3" placeholder="写下今晚放在枕头下的愿望...">${state.currentWish || ''}</textarea>
        <button onclick="savePillowWish()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">🌙 放置到枕头下</button>
      `}
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">历史记录</div>
    ${history || '<div class="glass-card p-4 text-center text-sm" style="color:var(--theme-text); opacity:0.4">暂无记录</div>'}
  `;
}
function savePillowWish() {
  const wish = document.getElementById('pillow-input')?.value.trim();
  if (!wish) { showToast('请写下你的愿望'); return; }
  const state = getPillowState();
  state.currentWish = wish;
  state.history.push({ date: getTodayStr(), wish });
  savePillowState(state);
  showToast('🌙 愿望已放置到枕头下');
  logActivity('pillow', 'set');
  renderPillow();
}
function getPlacematState() {
  const s = StorageUtil.get('cosmos_placemat_state', { myTasks: [], universeTasks: [], history: [] });
  if (!Array.isArray(s.myTasks)) s.myTasks = [];
  if (!Array.isArray(s.universeTasks)) s.universeTasks = [];
  if (!Array.isArray(s.history)) s.history = [];
  return s;
}
function savePlacematState(state) { StorageUtil.set('cosmos_placemat_state', state); }
function initPlacemat() {
  renderPlacemat();
}
function renderPlacemat() {
  const state = getPlacematState();
  const container = document.getElementById('placemat-content');
  if (!container) return;
  const today = getTodayStr();
  const todayRecord = state.history.find(h => h.date === today);
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🍽️</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">放手仪式</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Abraham-Hicks 经典练习：画出一条线，左边写「我的任务」，右边写「宇宙的任务」。学会放手，让宇宙接手。</p>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="glass-card p-4">
        <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">🙋 我的任务</div>
        <div id="placemat-my-list" class="space-y-2 mb-3">
          ${state.myTasks.map((t, i) => `
            <div class="flex items-center gap-2 p-2 rounded-lg" style="background:rgba(212,181,199,0.08)">
              <span class="text-xs" style="color:var(--theme-text)">• ${t}</span>
              <button onclick="deletePlacematTask('my', ${i})" class="text-xs ml-auto" style="color:var(--text-mute)">✕</button>
            </div>
          `).join('')}
        </div>
        <input type="text" id="placemat-my-input" class="dream-input w-full text-xs mb-2" placeholder="添加我的任务..." onkeypress="if(event.key==='Enter')addPlacematTask('my')"/>
        <button onclick="addPlacematTask('my')" class="w-full py-2 rounded-lg text-xs" style="background:var(--theme-accent); color:#fff">添加</button>
      </div>
      <div class="glass-card p-4">
        <div class="text-xs font-medium mb-2" style="color:var(--theme-text)">🌌 宇宙的任务</div>
        <div id="placemat-uni-list" class="space-y-2 mb-3">
          ${state.universeTasks.map((t, i) => `
            <div class="flex items-center gap-2 p-2 rounded-lg" style="background:rgba(212,181,199,0.08)">
              <span class="text-xs" style="color:var(--theme-text)">✨ ${t}</span>
              <button onclick="deletePlacematTask('uni', ${i})" class="text-xs ml-auto" style="color:var(--text-mute)">✕</button>
            </div>
          `).join('')}
        </div>
        <input type="text" id="placemat-uni-input" class="dream-input w-full text-xs mb-2" placeholder="交给宇宙的任务..." onkeypress="if(event.key==='Enter')addPlacematTask('uni')"/>
        <button onclick="addPlacematTask('uni')" class="w-full py-2 rounded-lg text-xs" style="background:rgba(212,181,199,0.3); color:var(--theme-text)">添加</button>
      </div>
    </div>
    ${todayRecord ? `
      <div class="glass-card p-4 mb-4 text-center">
        <div class="text-xs mb-1" style="color:var(--text-mute)">今日已记录</div>
        <div class="text-sm" style="color:var(--theme-text)">我的任务 ${todayRecord.my} 个 · 宇宙的任务 ${todayRecord.uni} 个</div>
      </div>
    ` : `
      <button onclick="savePlacematDay()" class="w-full py-3 rounded-xl text-sm font-medium mb-4" style="background:var(--theme-accent); color:#fff">🌌 今天就把右边交给宇宙</button>
    `}
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">历史记录</div>
    <div class="space-y-2">
      ${state.history.slice().reverse().slice(0, 7).map(h => `
        <div class="glass-card p-3 flex justify-between">
          <div class="text-xs" style="color:var(--text-soft)">${h.date}</div>
          <div class="text-xs" style="color:var(--text-mute)">我 ${h.my} / 宇宙 ${h.uni}</div>
        </div>
      `).join('') || '<div class="glass-card p-4 text-center text-sm" style="color:var(--text-soft)">暂无记录</div>'}
    </div>
  `;
}
function addPlacematTask(side) {
  const input = document.getElementById(side === 'my' ? 'placemat-my-input' : 'placemat-uni-input');
  const text = input?.value.trim();
  if (!text) return;
  const s = getPlacematState();
  if (side === 'my') s.myTasks.push(text);
  else s.universeTasks.push(text);
  savePlacematState(s);
  state.myTasks = s.myTasks;
  state.universeTasks = s.universeTasks;
  saveState();
  input.value = '';
  renderPlacemat();
}
function deletePlacematTask(side, idx) {
  const s = getPlacematState();
  if (side === 'my') s.myTasks.splice(idx, 1);
  else s.universeTasks.splice(idx, 1);
  savePlacematState(s);
  state.myTasks = s.myTasks;
  state.universeTasks = s.universeTasks;
  saveState();
  renderPlacemat();
}
function savePlacematDay() {
  const state = getPlacematState();
  state.history.push({ date: getTodayStr(), my: state.myTasks.length, uni: state.universeTasks.length });
  savePlacematState(state);
  showToast('🌌 已交给宇宙！放手让奇迹发生');
  logActivity('placemat', 'daily');
  renderPlacemat();
}
function getRememberState() {
  const s = StorageUtil.get('cosmos_remember_state', { memories: [] });
  if (!Array.isArray(s.memories)) s.memories = [];
  return s;
}
function saveRememberState(state) { StorageUtil.set('cosmos_remember_state', state); }
function initRemember() {
  renderRemember();
}
function renderRemember() {
  const state = getRememberState();
  const container = document.getElementById('remember-content');
  if (!container) return;
  const list = state.memories.slice().reverse().map(m => `
    <div class="glass-card p-4 mb-3">
      <div class="text-xs mb-1" style="color:var(--text-mute)">${m.date}</div>
      <div class="text-sm font-medium mb-2" style="color:var(--theme-text)">旧故事翻篇...</div>
      <div class="text-sm mb-2" style="color:var(--text-soft)">「${m.past}」</div>
      <div class="text-sm font-medium mb-1" style="color:var(--theme-accent)">但现在...</div>
      <div class="text-sm" style="color:var(--theme-text)">「${m.present}」</div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">💭</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">旧故事翻篇</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Neville Goddard 经典技法：「旧故事翻篇... 但现在...」用这个句式翻转任何过去的限制。过去的问题，现在已经是答案。</p>
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="text-xs mb-2" style="color:var(--text-mute)">第一步：写出过去的困境</div>
      <textarea id="remember-past" class="dream-input w-full text-sm mb-3" rows="2" placeholder="旧故事翻篇...（例如：旧故事翻篇我很穷，每天为账单焦虑）"></textarea>
      <div class="text-xs mb-2" style="color:var(--text-mute)">第二步：写出现在的翻转</div>
      <textarea id="remember-present" class="dream-input w-full text-sm mb-3" rows="2" placeholder="但现在...（例如：但现在我财务自由，钱从各种渠道流向我）"></textarea>
      <button onclick="saveRemember()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">✨ 翻转记忆</button>
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">我的翻转记录</div>
    ${list || '<div class="glass-card p-4 text-center text-sm" style="color:var(--text-soft)">还没有记录，写下第一个翻转吧</div>'}
  `;
}
function saveRemember() {
  const past = document.getElementById('remember-past')?.value.trim();
  const present = document.getElementById('remember-present')?.value.trim();
  if (!past || !present) { showToast('请填写两部分内容'); return; }
  const state = getRememberState();
  state.memories.push({ id: Date.now(), date: getTodayStr(), past, present });
  saveRememberState(state);
  showToast('💭 记忆已翻转！过去已被改写');
  logActivity('remember', 'create');
  renderRemember();
}
function getCreationBoxState() {
  const s = StorageUtil.get('cosmos_creationbox_state', { items: [] });
  if (!Array.isArray(s.items)) s.items = [];
  return s;
}
function saveCreationBoxState(state) { StorageUtil.set('cosmos_creationbox_state', state); }
function initCreationBox() {
  renderCreationBox();
}
function renderCreationBox() {
  const state = getCreationBoxState();
  const container = document.getElementById('creationbox-content');
  if (!container) return;
  const items = state.items.map((item, i) => `
    <div class="glass-card p-3 mb-2 flex items-center gap-3">
      <div class="text-2xl">${item.emoji}</div>
      <div class="flex-1">
        <div class="text-sm font-medium" style="color:var(--theme-text)">${item.text}</div>
        <div class="text-xs" style="color:var(--text-mute)">${item.date}</div>
      </div>
      <button onclick="deleteCreationBoxItem(${i})" class="text-xs" style="color:var(--text-mute)">✕</button>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🎁</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">心愿宝盒</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Abraham-Hicks 练习：把你想要的任何东西放入这个「魔法盒」——房子、车子、旅行、关系... 然后忘记它，相信宇宙会在最完美的时机送给你。</p>
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="text-xs mb-2" style="color:var(--text-mute)">放入魔法盒</div>
      <div class="flex gap-2 mb-3">
        <input type="text" id="creationbox-text" class="dream-input flex-1 text-sm" placeholder="我想要...（例如：一辆红色的特斯拉）"/>
        <select id="creationbox-emoji" class="dream-input text-sm w-16">
          <option value="🏠">🏠</option>
          <option value="🚗">🚗</option>
          <option value="✈️">✈️</option>
          <option value="💰">💰</option>
          <option value="💕">💕</option>
          <option value="🏥">🏥</option>
          <option value="📚">📚</option>
          <option value="🎨">🎨</option>
          <option value="✨">✨</option>
        </select>
      </div>
      <button onclick="addCreationBoxItem()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:var(--theme-accent); color:#fff">🎁 放入魔法盒</button>
    </div>
    <div class="glass-card p-4 mb-4 text-center">
      <div class="text-sm mb-2" style="color:var(--theme-text)">魔法盒中已有 ${state.items.length} 件宝物</div>
      <div class="text-xs" style="color:var(--text-soft)">放入后，放手。宇宙正在为你安排最完美的路径。</div>
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">我的宝物</div>
    ${items || '<div class="glass-card p-4 text-center text-sm" style="color:var(--text-soft)">魔法盒还是空的，放入第一件宝物吧</div>'}
  `;
}
function addCreationBoxItem() {
  const text = document.getElementById('creationbox-text')?.value.trim();
  const emoji = document.getElementById('creationbox-emoji')?.value || '✨';
  if (!text) { showToast('请填写你想要的东西'); return; }
  const state = getCreationBoxState();
  state.items.push({ id: Date.now(), text, emoji, date: getTodayStr() });
  saveCreationBoxState(state);
  showToast('🎁 已放入魔法盒！宇宙正在为你安排');
  logActivity('creationbox', 'add');
  renderCreationBox();
}
function deleteCreationBoxItem(idx) {
  const state = getCreationBoxState();
  state.items.splice(idx, 1);
  saveCreationBoxState(state);
  renderCreationBox();
}
function getRampageState() {
  const s = StorageUtil.get('cosmos_rampage_state', { rampages: [] });
  if (!Array.isArray(s.rampages)) s.rampages = [];
  return s;
}
function saveRampageState(state) { StorageUtil.set('cosmos_rampage_state', state); }
function initRampage() {
  renderRampage();
}
function renderRampage() {
  const state = getRampageState();
  const container = document.getElementById('rampage-content');
  if (!container) return;
  const current = state.rampages.length > 0 ? state.rampages[state.rampages.length - 1] : null;
  const history = state.rampages.slice().reverse().slice(1).map(r => `
    <div class="glass-card p-3 mb-2">
      <div class="text-xs mb-1" style="color:var(--text-mute)">${r.date}</div>
      <div class="text-sm" style="color:var(--theme-text)">${r.items.length} 个感激 · ${r.moodBefore}→${r.moodAfter}</div>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🌟</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">感恩风暴</h2>
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">Abraham-Hicks 最强练习之一：从一个感激出发，一个接一个地狂涌感激，让你的振动火箭般上升。说得出的感激越多，吸引的奇迹越多。</p>
    </div>
    <div class="glass-card p-4 mb-4">
      <div class="text-xs mb-2" style="color:var(--text-mute)">开始前的情绪 (1-10)</div>
      <input type="range" id="rampage-before" min="1" max="10" value="5" class="w-full mb-3" oninput="const el=document.getElementById('rampage-before-val');if(el)el.textContent=this.value">
      <div class="text-xs mb-3" style="color:var(--text-mute)">当前: <span id="rampage-before-val">5</span></div>
      <div class="text-xs mb-2" style="color:var(--text-mute)">感激 #${current ? current.items.length + 1 : 1}</div>
      <input type="text" id="rampage-input" class="dream-input w-full text-sm mb-3" placeholder="我感激...（例如：我感激今天的阳光，温暖又明亮）"/>
      <button onclick="addRampageItem()" class="w-full py-3 rounded-xl text-sm font-medium mb-3" style="background:var(--theme-accent); color:#fff">🌟 加入感恩风暴</button>
      ${current ? `
        <div class="text-xs mb-2" style="color:var(--text-mute)">当前狂潮已有 ${current.items.length} 个感激</div>
        <div class="space-y-1 max-h-40 overflow-y-auto mb-3">
          ${current.items.map(item => `
            <div class="text-xs p-2 rounded-lg" style="background:rgba(212,181,199,0.08); color:var(--text-soft)">🌟 ${item}</div>
          `).join('')}
        </div>
        <div class="text-xs mb-2" style="color:var(--text-mute)">结束后的情绪 (1-10)</div>
        <input type="range" id="rampage-after" min="1" max="10" value="7" class="w-full mb-3" oninput="setText('rampage-after-val', this.value)">
        <div class="text-xs mb-3" style="color:var(--text-mute)">当前: <span id="rampage-after-val">7</span></div>
        <button onclick="completeRampage()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:linear-gradient(135deg,#D4B5C7,#B8A9C9); color:#fff">✨ 完成这次狂潮</button>
      ` : ''}
    </div>
    <div class="font-medium text-sm mb-2" style="color:var(--theme-text)">历史狂潮</div>
    ${history || '<div class="glass-card p-4 text-center text-sm" style="color:var(--text-soft)">还没有狂潮记录，开始你的第一次感恩风暴吧</div>'}
  `;
}
function addRampageItem() {
  const text = document.getElementById('rampage-input')?.value.trim();
  if (!text) { showToast('请写下一个感激'); return; }
  const state = getRampageState();
  if (state.rampages.length === 0 || state.rampages[state.rampages.length - 1].completed) {
    const before = document.getElementById('rampage-before')?.value || 5;
    state.rampages.push({ id: Date.now(), date: getTodayStr(), items: [], moodBefore: before, moodAfter: null, completed: false });
  }
  state.rampages[state.rampages.length - 1].items.push(text);
  saveRampageState(state);
  const rampageInput = document.getElementById('rampage-input');
  if (rampageInput) rampageInput.value = '';
  showToast('🌟 感激已加入！继续...');
  logActivity('rampage', 'item');
  renderRampage();
}
function completeRampage() {
  const state = getRampageState();
  const current = state.rampages[state.rampages.length - 1];
  if (!current || current.completed) { showToast('没有正在进行的狂潮'); return; }
  const after = document.getElementById('rampage-after')?.value || 7;
  current.moodAfter = after;
  current.completed = true;
  saveRampageState(state);
  showToast('✨ 感恩风暴完成！你的振动已飙升');
  logActivity('rampage', 'complete');
  renderRampage();
}
function getTreasureBoxState() {
  const s = StorageUtil.get('cosmos_treasurebox_state', { tried: {}, favorites: [], notes: {} });
  if (!s.tried || typeof s.tried !== 'object') s.tried = {};
  if (!Array.isArray(s.favorites)) s.favorites = [];
  if (!s.notes || typeof s.notes !== 'object') s.notes = {};
  return s;
}
function saveTreasureBoxState(state) { StorageUtil.set('cosmos_treasurebox_state', state); }
function initTreasureBox() {
  renderTreasureBox();
}
function renderTreasureBox() {
  const state = getTreasureBoxState();
  const container = document.getElementById('treasurebox-content');
  if (!container) return;
  const categories = [...new Set(TREASURE_TOOLS.map(t => t.category))];
  const activeCat = state.activeCategory || categories[0];
  const catTabs = categories.map(c => `
    <button onclick="switchTreasureCategory('${c}')" class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeCat === c ? 'text-white' : ''}" style="background:${activeCat === c ? 'var(--theme-accent)' : 'rgba(212,181,199,0.15)'}; color:${activeCat === c ? 'white' : 'var(--text-soft)'}; border:none; cursor:pointer">${c}</button>
  `).join('');
  const tools = TREASURE_TOOLS.filter(t => t.category === activeCat).map(tool => {
    const tried = state.tried[tool.id] || false;
    const fav = (state.favorites || []).includes(tool.id);
    return `
      <div class="glass-card p-4 mb-3">
        <div class="flex items-center gap-3 mb-2">
          <div class="text-2xl">${tool.emoji}</div>
          <div class="flex-1">
            <div class="text-sm font-medium" style="color:var(--theme-text)">${tool.title}</div>
            <div class="text-xs" style="color:var(--text-soft)">${tool.category}</div>
          </div>
          <button onclick="toggleTreasureFav('${tool.id}')" class="text-sm" style="opacity:${fav ? 1 : 0.3}">${fav ? '💕' : '🤍'}</button>
        </div>
        <div class="text-xs mb-3" style="color:var(--text-soft)">${tool.desc}</div>
        <div class="space-y-1 mb-3">
          ${tool.steps.map((s, i) => `
            <div class="flex items-start gap-2">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0" style="background:rgba(212,181,199,0.2);color:var(--theme-accent)">${i+1}</span>
              <span class="text-xs" style="color:var(--text-soft)">${s}</span>
            </div>
          `).join('')}
        </div>
        <div class="p-3 rounded-xl mb-3" style="background:rgba(212,181,199,0.08)">
          <div class="text-xs" style="color:var(--theme-accent)">✨ 肯定语</div>
          <div class="text-xs" style="color:var(--text-soft)">${tool.affirmation}</div>
        </div>
        <div class="flex gap-2">
          <button onclick="markTreasureTried('${tool.id}')" class="flex-1 py-2 rounded-lg text-xs font-medium" style="background:${tried ? 'rgba(212,181,199,0.3)' : 'var(--theme-accent)'}; color:${tried ? 'var(--theme-text)' : '#fff'}">${tried ? '✅ 已尝试' : '✨ 标记已尝试'}</button>
          <button onclick="openTreasureNote('${tool.id}')" class="py-2 px-3 rounded-lg text-xs" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">📝</button>
        </div>
        ${(state.notes && state.notes[tool.id]) ? `
          <div class="mt-2 p-2 rounded-lg text-xs" style="background:rgba(212,181,199,0.05);color:var(--text-soft)">
            ${state.notes[tool.id]}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  const triedCount = Object.keys(state.tried).length;
  const totalCount = TREASURE_TOOLS.length;
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🧚</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">成长百宝箱</h2>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">40+ 星愿方法，像选仙女裙一样挑选适合你的成长工具。每个工具都附有步骤和肯定语，让你轻松开启成长之旅。</p>
      <div class="flex items-center justify-center gap-2 mb-2">
        <div class="w-full h-2 rounded-full max-w-[200px]" style="background:rgba(212,181,199,0.15)">
          <div class="h-full rounded-full" style="width:${(triedCount/totalCount*100)}%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9);transition:width 0.5s ease"></div>
        </div>
      </div>
      <div class="text-xs" style="color:var(--text-mute)">已尝试 ${triedCount}/${totalCount} 个工具</div>
    </div>
    <div class="flex gap-2 overflow-x-auto mb-4 pb-2" style="scrollbar-width:none">
      ${catTabs}
    </div>
    <div>${tools}</div>
  `;
}
function switchTreasureCategory(cat) {
  const state = getTreasureBoxState();
  state.activeCategory = cat;
  saveTreasureBoxState(state);
  renderTreasureBox();
}
function markTreasureTried(id) {
  const state = getTreasureBoxState();
  state.tried[id] = !state.tried[id];
  saveTreasureBoxState(state);
  const tool = TREASURE_TOOLS.find(t => t.id === id);
  showToast(state.tried[id] ? `✨ 已尝试「${tool?.title}」` : '已取消标记');
  if (state.tried[id]) logActivity('treasurebox', id);
  renderTreasureBox();
}
function toggleTreasureFav(id) {
  const state = getTreasureBoxState();
  if (!state.favorites) state.favorites = [];
  const idx = state.favorites.indexOf(id);
  if (idx >= 0) state.favorites.splice(idx, 1);
  else state.favorites.push(id);
  saveTreasureBoxState(state);
  renderTreasureBox();
}
function openTreasureNote(id) {
  const state = getTreasureBoxState();
  const tool = TREASURE_TOOLS.find(t => t.id === id);
  const note = prompt(`为「${tool?.title}」添加笔记：`, state.notes?.[id] || '');
  if (note === null) return;
  if (!state.notes) state.notes = {};
  state.notes[id] = note;
  saveTreasureBoxState(state);
  renderTreasureBox();
}
function getTimelineState() {
  return StorageUtil.get('cosmos_timeline_state', { notes: {} });
}
function saveTimelineState(s) { StorageUtil.set('cosmos_timeline_state', s); }
function initTimeline() { renderTimeline(); }
function renderTimeline() {
  const container = document.getElementById('timeline-content');
  if (!container) return;
  const wishes = state?.wishes || [];
  const manifested = wishes.filter(w => w.done);
  const pending = wishes.filter(w => !w.done);
  let html = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">⏳</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">愿望时光机</h2>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">回顾你的成长旅程，每一个愿望都是一颗星星</p>
      <div class="flex justify-center gap-4">
        <div class="text-center">
          <div class="text-2xl font-medium" style="color:var(--theme-accent)">${wishes.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">总愿望</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-medium" style="color:var(--theme-accent)">${manifested.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">已成长</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-medium" style="color:var(--theme-accent)">${pending.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">进行中</div>
        </div>
      </div>
    </div>
  `;
  if (wishes.length === 0) {
    html += `
      <div class="glass-card p-6 text-center">
        <div class="text-4xl mb-3">✨</div>
        <p class="text-sm" style="color:var(--text-soft)">还没有许愿记录</p>
        <button onclick="openModule('wishwall')" class="btn-primary mt-3 px-4 py-2 rounded-xl text-sm">去许愿墙许愿</button>
      </div>
    `;
  } else {
    const sorted = [...wishes].reverse();
    html += `<div class="space-y-3">`;
    sorted.forEach((w, i) => {
      const date = w.date ? new Date(w.date).toLocaleDateString('zh-CN') : '未知日期';
      const isDone = w.done;
      html += `
        <div class="glass-card p-4 ${isDone ? 'opacity-75' : ''}">
          <div class="flex items-center gap-3 mb-2">
            <div class="text-2xl">${isDone ? '⭐' : '🌟'}</div>
            <div class="flex-1">
              <div class="text-sm font-medium" style="color:var(--theme-text)">${w.text || w.content || '未命名愿望'}</div>
              <div class="text-xs" style="color:var(--text-soft)">${date}</div>
            </div>
            <button onclick="toggleWishTimeline(${wishes.length - 1 - i})" class="text-lg" style="opacity:${isDone ? 1 : 0.3}">${isDone ? '✅' : '⭕'}</button>
          </div>
          ${w.category ? `<div class="text-xs mb-2" style="color:var(--theme-accent)">${w.category}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  }
  container.innerHTML = html;
}
function toggleWishTimeline(index) {
  if (!state.wishes || !state.wishes[index]) return;
  state.wishes[index].done = !state.wishes[index].done;
  saveState();
  renderTimeline();
  showToast(state.wishes[index].done ? '⭐ 愿望已标记为成长成功！' : '已取消标记');
  if (state.wishes[index].done) {
    logActivity('timeline', 'manifest');
    checkBadges();
  }
}
function initManifestReport() { renderManifestReport(); }
function renderManifestReport() {
  const container = document.getElementById('manifest-report-content');
  if (!container) return;
  const logObj = StorageUtil.get('activity_log', {});
  const log = Array.isArray(logObj) ? logObj : Object.values(logObj).flat();
  const wishes = state?.wishes || [];
  const emotionNotes = StorageUtil.get('emotion_notes', []);
  const breatheRecords = StorageUtil.get('breathe_records', []);
  const treasureState = StorageUtil.get('cosmos_treasurebox_state', {});
  const moduleCounts = {};
  log.forEach(entry => {
    moduleCounts[entry.type || entry.module || 'other'] = (moduleCounts[entry.type || entry.module || 'other'] || 0) + 1;
  });
  const last7days = log.filter(e => {
    const d = new Date(e.time);
    const now = new Date();
    return (now - d) < 7 * 24 * 60 * 60 * 1000;
  });
  let html = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">📊</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">成长数据报告</h2>
      <p class="text-sm" style="color:var(--theme-text); opacity:0.6">你的成长旅程数据一览</p>
    </div>
    <div class="glass-card p-4 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">📈 核心数据</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${wishes.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">总愿望数</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${wishes.filter(w => w.done).length}</div>
          <div class="text-xs" style="color:var(--text-soft)">已成长</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${log.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">总活动记录</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${Object.keys(treasureState.tried || {}).length}</div>
          <div class="text-xs" style="color:var(--text-soft)">已尝试工具</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${emotionNotes.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">情绪记录</div>
        </div>
        <div class="p-3 rounded-xl text-center" style="background:rgba(212,181,199,0.08)">
          <div class="text-xl font-medium" style="color:var(--theme-accent)">${breatheRecords.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">呼吸练习</div>
        </div>
      </div>
    </div>
    <div class="glass-card p-4 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🔥 最近7天活跃度</h3>
      <div class="text-2xl font-medium text-center" style="color:var(--theme-accent)">${last7days.length}</div>
      <div class="text-xs text-center" style="color:var(--text-soft)">次活动记录</div>
    </div>
    <div class="glass-card p-4 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🎯 最常用模块</h3>
      <div class="space-y-2">
        ${Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mod, count]) => `
          <div class="flex justify-between items-center">
            <span class="text-xs" style="color:var(--text-soft)">${mod}</span>
            <span class="text-xs font-medium" style="color:var(--theme-accent)">${count} 次</span>
          </div>
          <div class="w-full h-1.5 rounded-full" style="background:rgba(212,181,199,0.15)">
            <div class="h-full rounded-full" style="width:${Math.min(100, count * 5)}%;background:linear-gradient(90deg,#D4B5C7,#B8A9C9)"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;
}
let affirmLoopInterval = null;
let affirmLoopIndex = 0;
function initAffirmLoop() { renderAffirmLoop(); }
function renderAffirmLoop() {
  const container = document.getElementById('affirm-loop-content');
  if (!container) return;
  const custom = StorageUtil.get('cosmos_custom_affirms', []);
  const isPlaying = !!affirmLoopInterval;
  container.innerHTML = `
    <div class="glass-card p-6 text-center mb-4">
      <div class="text-5xl mb-4">🔁</div>
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">肯定语循环</h2>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">选择你的肯定语，让宇宙持续接收你的信号</p>
      <button onclick="toggleAffirmLoop()" class="w-full py-3 rounded-xl text-sm font-medium" style="background:${isPlaying ? 'rgba(212,181,199,0.3)' : 'var(--theme-accent)'}; color:${isPlaying ? 'var(--theme-text)' : '#fff'}">
        ${isPlaying ? '⏸️ 暂停循环' : '▶️ 开始循环'}
      </button>
      ${isPlaying ? `<div class="text-xs mt-2" style="color:var(--text-soft)">正在循环播放...</div>` : ''}
    </div>
    <div class="glass-card p-4 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">✨ 我的肯定语</h3>
      <div id="affirm-loop-list" class="space-y-2">
        ${custom.length === 0 ? '<div class="text-xs text-center" style="color:var(--text-soft)">还没有自定义肯定语</div>' : custom.map((a, i) => `
          <div class="flex items-center gap-2 p-2 rounded-lg" style="background:rgba(212,181,199,0.08)">
            <input type="checkbox" ${a.active !== false ? 'checked' : ''} onchange="toggleAffirmLoopItem(${i})" class="accent-pink-300">
            <span class="text-xs flex-1" style="color:var(--theme-text)">${a.text}</span>
          </div>
        `).join('')}
      </div>
      <div class="flex gap-2 mt-3">
        <input type="text" id="affirm-loop-input" class="dream-input flex-1 text-xs" placeholder="添加新的肯定语...">
        <button onclick="addAffirmLoopItem()" class="btn-primary px-3 py-2 rounded-xl text-xs">添加</button>
      </div>
    </div>
    <div class="glass-card p-4">
      <h3 class="text-sm font-medium mb-2" style="color:var(--theme-text)">⚙️ 播放设置</h3>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs" style="color:var(--text-soft)">间隔时间</span>
        <select id="affirm-loop-interval" class="text-xs rounded-lg p-1" style="background:rgba(212,181,199,0.15);border:none;color:var(--theme-text)" onchange="setAffirmLoopInterval()">
          <option value="5">5秒</option>
          <option value="10" selected>10秒</option>
          <option value="30">30秒</option>
          <option value="60">1分钟</option>
        </select>
      </div>
      <div class="text-xs" style="color:var(--text-mute)">循环播放时，屏幕会显示当前肯定语并可朗读</div>
    </div>
  `;
}
function toggleAffirmLoop() {
  if (affirmLoopInterval) {
    clearInterval(affirmLoopInterval);
    affirmLoopInterval = null;
    showToast('⏸️ 肯定语循环已暂停');
  } else {
    const custom = StorageUtil.get('cosmos_custom_affirms', []);
    const active = custom.filter(a => a.active !== false);
    if (active.length === 0) {
      showToast('请先添加肯定语');
      return;
    }
    const interval = parseInt(document.getElementById('affirm-loop-interval')?.value || '10');
    affirmLoopIndex = 0;
    playAffirmLoopItem(active[0]);
    affirmLoopInterval = setInterval(() => {
      affirmLoopIndex = (affirmLoopIndex + 1) % active.length;
      playAffirmLoopItem(active[affirmLoopIndex]);
    }, interval * 1000);
    showToast('▶️ 肯定语循环开始');
  }
  renderAffirmLoop();
}
function playAffirmLoopItem(item) {
  if (!item) return;
  showToast(`✨ ${item.text}`);
  if (window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = 'zh-CN';
    u.rate = 0.9;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  }
}
function addAffirmLoopItem() {
  const input = document.getElementById('affirm-loop-input');
  const text = input?.value.trim();
  if (!text) return;
  const custom = StorageUtil.get('cosmos_custom_affirms', []);
  custom.push({ text, active: true, created: Date.now() });
  StorageUtil.set('cosmos_custom_affirms', custom);
  input.value = '';
  renderAffirmLoop();
  showToast('✨ 肯定语已添加');
}
function toggleAffirmLoopItem(i) {
  const custom = StorageUtil.get('cosmos_custom_affirms', []);
  if (custom[i]) {
    custom[i].active = !custom[i].active;
    StorageUtil.set('cosmos_custom_affirms', custom);
    renderAffirmLoop();
  }
}
function setAffirmLoopInterval() {
  if (affirmLoopInterval) {
    toggleAffirmLoop();
    toggleAffirmLoop();
  }
}
function addWish(text, type, fields) {
  const wish = {
    id: Date.now(),
    type: type || 'life',
    be: (fields && fields.be) || text || '',
    do: (fields && fields.do) || '',
    have: (fields && fields.have) || '',
    sight: (fields && fields.sight) || '',
    sound: (fields && fields.sound) || '',
    touch: (fields && fields.touch) || '',
    feel: (fields && fields.feel) || '',
    firstAction: (fields && fields.firstAction) || '',
    done: false,
    date: getTodayStr(),
    skyX: Math.random() * 70 + 15,
    skyY: Math.random() * 50 + 15,
  };
  if (!state.wishes) state.wishes = [];
  state.wishes.unshift(wish);
  saveState();
  addEnergy(30, '许下愿望');
  const starsPage = document.getElementById('page-stars');
  const wishwallPage = document.getElementById('page-wishwall');
  if (starsPage && starsPage.classList.contains('active')) renderStars();
  if (wishwallPage && wishwallPage.classList.contains('active')) renderWishWall();
}
function addDiary() { return newDiaryPrompt.apply(this, arguments); }
function logEmotion() { return recordMood.apply(this, arguments); }
function addTask(name) { return addPlacematTask('my', name); }
function closePage() { return goBack(); }
function renderBreathe() { /* v6.4: breathe integrated in startBreathe/initBreathe */ }
function importData() { return importAllData.apply(this, arguments); }
function renderFortune() { return updateFortuneCard.apply(this, arguments); }
function checkStreak() { return recalcHabitStreak.apply(this, arguments); }
function updateStreak() { return recalcHabitStreak.apply(this, arguments); }
function checkLevel() { return getLevel.apply(this, arguments); }
function updateLevel() { return getLevel.apply(this, arguments); }
function checkMastery() { /* v6.4: mastery system integrated in getLevel */ return getLevel(); }
function updateMastery() { /* v6.4: mastery system integrated in getLevel */ return getLevel(); }
try { init(); } catch(e) { console.error('init() 调用失败:', e); }
window.addHabit = addHabit;
window.addIncomeLog = addIncomeLog;
window.addVisionCard = addVisionCard;
window.challengeCheckIn = challengeCheckIn;
window.changeHabitMonth = changeHabitMonth;
window.checkWealthBeliefs = checkWealthBeliefs;
window.clearCache = clearCache;
window.clearVisionImage = clearVisionImage;
window.closeAlert = closeAlert;
window.closeHabitModal = closeHabitModal;
window.closeLimitedOffer = closeLimitedOffer;
window.closeLockModal = closeLockModal;
window.closePasswordModal = closePasswordModal;
window.closePlan = closePlan;
window.closeSettings = closeSettings;
window.closeShareCard = closeShareCard;
window.completeCBTPurify = completeCBTPurify;
window.confirmImport = confirmImport;
window.copyAllData = copyAllData;
window.copyDataText = copyDataText;
window.copyInviteCode = copyInviteCode;
window.copyShareText = copyShareText;
window.cycleWeather = cycleWeather;
window.cycleWeatherSetting = cycleWeatherSetting;
window.deletePin = deletePin;
window.doCheckIn = doCheckIn;
window.downloadShareCard = downloadShareCard;
window.enterPin = enterPin;
window.exportAllData = exportAllData;
window.exportData = exportData;
window.exportSelectedData = exportSelectedData;
window.fillVoiceInput = fillVoiceInput;
window.filterStories = filterStories;
window.generateDataQR = generateDataQR;
window.goBack = goBack;
window.goHome = goHome;
window.handleVisionImage = handleVisionImage;
window.importAllData = importAllData;
window.importFromQRText = importFromQRText;
window.nextCBTStep = nextCBTStep;
window.nextHabitMonth = nextHabitMonth;
window.nextSatsStep = nextSatsStep;
window.nextTutorialStep = nextTutorialStep;
window.onEmotionSlide = onEmotionSlide;
window.openAffirmCollection = openAffirmCollection;
window.openAffirmRadio = openAffirmRadio;
window.openBadgeWall = openBadgeWall;
window.openCardCollection = openCardCollection;
window.openCrystalPage = openCrystalPage;
window.openFortune = openFortune;
window.openGrowthPage = openGrowthPage;
window.openHabitModal = openHabitModal;
window.openMentalDiet = openMentalDiet;
window.openModule = openModule;
const __originalOpenModule = window.openModule;
window.openModule = function(name) {
  if (name === 'vip') { showPage('vip'); initVip(); return; }
  if (name === 'vip-plans') { showPage('vip-plans'); return; }
  if (name === 'weekly') { showPage('reports'); initReports(); return; }
  if (name === 'community') { loadChunk('tools').then(() => { showPage('community'); renderCommunityFeed(); }); return; }
  if (name === 'audio') { showPage('audio'); initAudioPage(); return; }
  if (name === 'bootcamp') { loadChunk('tools').then(() => { showPage('bootcamp'); initBootcamp(); }); return; }
  if (name === 'shop') { showPage('shop'); return; }
  if (name === 'coach') { showPage('coach'); return; }
  if (name === 'privacy') { showPage('privacy'); return; }
  if (name === 'search') { loadChunk('tools').then(() => { showPage('search'); initSearch(); }); return; }
  if (name === 'reports') { showPage('reports'); initReports(); return; }
  if (name === 'breathe') { showPage('breathe'); initBreathe(); return; }
  if (name === 'voice') { showPage('voice'); initVoice(); return; }
  if (name === 'sleep') { showPage('sleep'); initSleep(); return; }
  if (__originalOpenModule) __originalOpenModule(name);
};
window.openRevision = openRevision;
window.openSettings = openSettings;
window.pauseAudio = pauseAudio;
window.pauseSatsTimer = pauseSatsTimer;
window.pauseSleepStory = pauseSleepStory;
window.playSleepStory = playSleepStory;
window.playTypeSound = playTypeSound;
window.playVisionSats = playVisionSats;
window.prevCBTStep = prevCBTStep;
window.prevHabitMonth = prevHabitMonth;
window.prevSatsStep = prevSatsStep;
window.recordMood = recordMood;
window.refreshDailyAffirm = refreshDailyAffirm;
window.resetSatsTimer = resetSatsTimer;
window.resetTimer = resetTimer;
window.saveDream = saveDream;
window.saveEmotionNote = saveEmotionNote;
window.saveMagicCheck = saveMagicCheck;
window.saveMoodNote = saveMoodNote;
window.saveReminderTime = saveReminderTime;
window.saveRevisionNote = saveRevisionNote;
window.selectAllExport = selectAllExport;
window.selectBreatheMode = selectBreatheMode;
window.selectHabitCat = selectHabitCat;
window.selectHabitFreq = selectHabitFreq;
window.selectPlan = selectPlan;
window.selectSubscriptionPlan = selectSubscriptionPlan;
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
window.showOnboarding = showOnboarding;
window.nextOnboardingStep = nextOnboardingStep;
window.closeOnboarding = closeOnboarding;
window.trackUsage = trackUsage;
window.trackEvent = trackEvent;
window.trackPageView = trackPageView;
window.trackFeatureLock = trackFeatureLock;
window.trackPaymentModal = trackPaymentModal;
window.trackPaymentMethod = trackPaymentMethod;
window.trackPaymentSuccess = trackPaymentSuccess;
window.trackPaymentCancel = trackPaymentCancel;
window.trackFreeTrial = trackFreeTrial;
window.trackCrystalUnlock = trackCrystalUnlock;
window.trackShare = trackShare;
window.trackOfferShown = trackOfferShown;
window.trackCheckIn = trackCheckIn;
window.trackFeedback = trackFeedback;
window.trackAppStart = trackAppStart;
window.checkRetention = checkRetention;
window.neverShowOfferAgain = neverShowOfferAgain;
window.shouldShowOffer = shouldShowOffer;
window.updateDailyBonusCard = updateDailyBonusCard;
window.unlockWithCrystals = unlockWithCrystals;
window.shareForCrystals = shareForCrystals;
window.copyShareLink = copyShareLink;
window.claimFreeTrial = claimFreeTrial;
window.hasUsedFreeTrial = hasUsedFreeTrial;
window.checkExpiryReminder = checkExpiryReminder;
window.showExpiryModal = showExpiryModal;
window.checkRatingPrompt = checkRatingPrompt;
window.showRatingModal = showRatingModal;
window.showFaqModal = showFaqModal;
window.showFeedbackModal = showFeedbackModal;
window.showPrivacyModal = showPrivacyModal;
window.showRefundModal = showRefundModal;
window.submitFeedback = submitFeedback;
window.selectTimerDuration = selectTimerDuration;
window.selectTimerMode = selectTimerMode;
window.selectVoice = selectVoice;
window.sendAiMessage = sendAiMessage;
window.sendAiPrompt = sendAiPrompt;
window.setBreatheAmbient = setBreatheAmbient;
window.setTheme = setTheme;
window.setVolume = setVolume;
window.setupPassword = setupPassword;
window.showImportInput = showImportInput;
window.showInvitePage = showInvitePage;
window.showPage = showPage;
window.showToast = showToast;
window.showVipPlans = showVipPlans;
window.skipTutorial = skipTutorial;
window.speakDailyAffirm = speakDailyAffirm;
window.startBreathe = startBreathe;
window.startRevision = startRevision;
window.startSatsTimer = startSatsTimer;
window.startTest = startTest;
window.loadDataScript = loadDataScript;
window.startWelcomeTest = startWelcomeTest;
window.stopAllAudio = stopAllAudio;
window.stopBreathe = stopBreathe;
window.stopRevision = stopRevision;
window.stopSleepStory = stopSleepStory;
window.submitInviteCode = submitInviteCode;
window.submitStory = submitStory;
window.switchMoodReport = switchMoodReport;
window.switchSpCategory = switchSpCategory;
window.switchTab = switchTab;
window.toggleBreatheAmbient = toggleBreatheAmbient;
window.toggleBreatheTone = toggleBreatheTone;
window.toggleDarkMode = toggleDarkMode;
window.toggleDistortion = toggleDistortion;
window.toggleHabitWeekday = toggleHabitWeekday;
window.toggleIgnore3D = toggleIgnore3D;
window.toggleMoodTag = toggleMoodTag;
window.toggleRevision = toggleRevision;
window.toggleSetting = toggleSetting;
window.toggleTimer = toggleTimer;
window.toggleVoiceRecord = toggleVoiceRecord;
window.toggleWhiteNoise = toggleWhiteNoise;
window.unlockWithCrystals = unlockWithCrystals;
window.updateNickname = updateNickname;
window.saveBirthday = saveBirthday;
window.openZodiacFortune = openZodiacFortune;
window.initZodiacAndBirthday = initZodiacAndBirthday;
window.showBadgeUnlock = showBadgeUnlock;
window.isFullMoon = isFullMoon;
window.retryLoadChunk = retryLoadChunk;
window.toggleNotificationPermission = toggleNotificationPermission;
window.sendNotification = sendNotification;
window.scheduleDailyReminders = scheduleDailyReminders;

/* ===== 手势滑动返回 + 下拉刷新 + 统一音效 ===== */
(function initGesturesAndEffects() {
  // B4: 手势滑动返回上一页
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    if (!touchStartX && !touchStartY) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    // 从屏幕左边缘向右滑动超过 80px，横向位移大于纵向，且时间在 400ms 内
    if (touchStartX < 40 && dx > 80 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 400) {
      goBack();
    }
    touchStartX = 0; touchStartY = 0;
  }, { passive: true });

  // B5: 下拉刷新（仅在首页顶部下拉时刷新运势和肯定语）
  let pullStartY = 0, isPulling = false;
  const islandPage = document.getElementById('page-island');
  if (islandPage) {
    islandPage.addEventListener('touchstart', function(e) {
      if (islandPage.scrollTop <= 0 && e.touches.length === 1) {
        pullStartY = e.touches[0].clientY;
        isPulling = true;
      }
    }, { passive: true });
    islandPage.addEventListener('touchmove', function(e) {
      if (!isPulling || e.touches.length !== 1) return;
      const dy = e.touches[0].clientY - pullStartY;
      if (dy > 120 && islandPage.scrollTop <= 0) {
        isPulling = false;
        playSound('ding');
        showToast('🔄 正在刷新运势...');
        updateFortuneCard();
        refreshDailyAffirm();
        updateTimeAndWeather();
        setTimeout(() => showToast('✨ 刷新完成'), 600);
      }
    }, { passive: true });
    islandPage.addEventListener('touchend', function() { isPulling = false; }, { passive: true });
  }

  // B6: 统一点击音效反馈（给所有按钮、卡片、chip 添加 subtle haptic + sound）
  document.addEventListener('click', function(e) {
    const el = e.target.closest('button, .card-hover, .chip-soft, .soft-btn, .mood-emoji, .step-dot');
    if (!el) return;
    // 视觉反馈：缩放动画
    el.style.transform = 'scale(0.96)';
    setTimeout(() => el.style.transform = '', 150);
    // 音效：区分类型
    if (el.classList.contains('btn-primary') || el.classList.contains('soft-btn') && el.classList.contains('btn-primary')) {
      playSound('ding');
    } else if (el.classList.contains('chip-soft') || el.classList.contains('mood-emoji')) {
      playSound('pop');
    } else {
      playSound('click');
    }
  });
})();

/* ===== C9: 导出 PDF 报告 ===== */
function exportPDFReport() {
  const today = getTodayStr();
  const badgeList = (state.badges || []).map(id => {
    const b = BADGES.find(x => x.id === id);
    return b ? `${b.icon} ${b.name}` : id;
  }).join('、') || '暂无';
  const wishes = (state.wishes || []).map((w, i) => `<tr><td>${i+1}</td><td>${w.text || w.be || '-'}</td><td>${w.done ? '✅ 已成长' : '⏳ 进行中'}</td></tr>`).join('');
  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>许愿岛报告 ${today}</title>
<style>
body{font-family:'Noto Sans SC',sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#5D4E6D;background:#FAF5F7;line-height:1.6}
h1{color:#B8A9C9;font-size:24px;border-bottom:2px solid #E8D5E0;padding-bottom:10px}
.meta{font-size:12px;color:#8B7E9C;margin-bottom:20px}
.section{background:#fff;border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 8px rgba(184,169,201,0.1)}
.section h2{font-size:16px;color:#B8A9C9;margin-top:0;border-left:3px solid #D4B5C7;padding-left:8px}
.badge{display:inline-block;background:linear-gradient(135deg,#E8D5E0,#D4B5C7);color:#fff;padding:4px 10px;border-radius:20px;font-size:12px;margin:2px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px;border-bottom:1px solid #E8D5E0;text-align:left}
th{background:#FAF5F7;color:#8B7E9C;font-weight:500}
@media print{body{background:#fff;margin:0;padding:16px}}
</style></head><body>
<h1>🌸 许愿岛 · 个人报告</h1>
<div class="meta">生成日期：${today} &nbsp;|&nbsp; 昵称：${state.nickname || '小公主'}</div>
<div class="section"><h2>📊 基础数据</h2>
<p>💎 能量：${state.energy || 0} &nbsp;|&nbsp; 等级：${getLevel()} &nbsp;|&nbsp; 徽章：${(state.badges || []).length} 个</p>
<p>📝 日记：${(state.diaries || []).length} 篇 &nbsp;|&nbsp; 愿望：${(state.wishes || []).length} 个 &nbsp;|&nbsp; 已成长：${(state.wishes || []).filter(w => w.done).length} 个</p>
</div>
<div class="section"><h2>🏆 徽章墙</h2><p>${badgeList}</p></div>
<div class="section"><h2>🌠 愿望清单</h2>
<table><thead><tr><th>#</th><th>愿望</th><th>状态</th></tr></thead><tbody>${wishes || '<tr><td colspan="3" style="text-align:center;color:#B8A9C9">暂无愿望</td></tr>'}</tbody></table>
</div>
<div class="section"><h2>🧘 练习统计</h2>
<p>SATS 冥想：${state.satsCount || 0} 次 &nbsp;|&nbsp; 修正法：${state.revisionCount || 0} 次</p>
<p>肯定语收藏：${(state.affirmations?.saved || []).length} 条 &nbsp;|&nbsp; 阅读文章：${state.libReadCount || 0} 篇</p>
</div>
<div class="meta" style="text-align:center;margin-top:30px">🌸 许愿岛为你记录每一份美好</div>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { showToast('请允许弹出窗口以导出 PDF'); return; }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

/* ===== window 挂载 ===== */
window.t = t;
window.setLang = setLang;
window.exportPDFReport = exportPDFReport;

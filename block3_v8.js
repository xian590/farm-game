

// ===== 21天显化显化挑战系统 =====
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
  const task = CHALLENGE_TASKS[wk] ? CHALLENGE_TASKS[wk].tasks[dy] : "保持你的星愿状态";
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
  if(!confirm('确定要重置21天显化挑战吗？所有进度将清空。')) return;
  challengeState={currentDay:1,completedDays:[],streak:0,lastCheckIn:null};
  saveChallengeState();
  renderChallenge();
  showToast('显化挑战已重置');
}

// ===== 情绪导航器 =====
const EMOTION_SCALE = [
  {level:1,name:"绝望",emoji:"😫",desc:"最深的低谷，但这也意味着即将反弹",color:"#8B5CF6",exercise:"深呼吸5次，告诉自己'这只是暂时的'。写下3件你仍然拥有的小事。"},
  {level:2,name:"恐惧",emoji:"😨",desc:"恐惧是未发生之事的影子",color:"#7C3AED",exercise:"问自己'最坏的结果是什么？我能承受吗？' 然后做 grounding 练习：说出5样看到的东西。"},
  {level:3,name:"焦虑",emoji:"😰",desc:"对未来的担忧正在消耗你的现在",color:"#6366F1",exercise:"4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒。重复5轮。"},
  {level:4,name:"怀疑",emoji:"🤔",desc:"怀疑是转变的前奏",color:"#818CF8",exercise:"写下'我怀疑______，但我也相信______'。让两种声音对话。"},
  {level:5,name:"失望",emoji:"😞",desc:"期望与现实的落差",color:"#A78BFA",exercise:"修正法：闭上眼睛，想象那个让你失望的场景以完美结局重新播放。"},
  {level:6,name:"担忧",emoji:"😟",desc:"轻度的不安在提醒你去行动",color:"#C4B5FD",exercise:"准备一个'担忧盒子'，把所有担忧写在小纸条上放进盒子，告诉自己'明天再处理'。"},
  {level:7,name:"不耐烦",emoji:"😤",desc:"渴望改变的信号",color:"#DDD6FE",exercise:"问自己'如果已经实现了，我现在会做什么？' 然后去做那件事的一小部分。"},
  {level:8,name:"无聊",emoji:"😐",desc:"稳定但缺乏热情",color:"#E9D5FF",exercise:"尝试一件新鲜事，或听一首能让你情绪上升的音乐。"},
  {level:9,name:"满足",emoji:"😊",desc:"平静而舒适的状态",color:"#F5D5E0",exercise:"感恩练习：说出或写下此刻让你感恩的3件事。"},
  {level:10,name:"希望",emoji:"🌱",desc:"向上生长的力量",color:"#FBCFE8",exercise:"视觉化：闭上眼睛，想象一个让你感到希望的场景，越详细越好。"},
  {level:11,name:"乐观",emoji:"😄",desc:"相信好事正在发生",color:"#F9A8D4",exercise:"肯定语：大声说出'我值得一切美好，好事正在来的路上'。"},
  {level:12,name:"期待",emoji:"🤩",desc:"对未来充满好奇与兴奋",color:"#F472B6",exercise:"写下'我期待______'，然后想象它实现的画面，沉浸在那个感觉里。"},
  {level:13,name:"兴奋",emoji:"🥳",desc:"能量高涨，创造力爆发",color:"#EC4899",exercise:"行动！把这份兴奋转化为具体的下一步行动。"},
  {level:14,name:"热情",emoji:"🔥",desc:"内在火焰在燃烧",color:"#DB2777",exercise:"分享！把你的热情传递给身边的人，能量会倍增。"},
  {level:15,name:"爱",emoji:"❤️",desc:"连接与慈悲",color:"#BE185D",exercise:"心轮冥想：把手放在心口，想象粉色的光从心脏发出，包围全身。"},
  {level:16,name:"感恩",emoji:"🙏",desc:"丰盛意识觉醒",color:"#9D174D",exercise:"写50件感恩的事，越多越好，写到流泪为止。"},
  {level:17,name:"平和",emoji:"☮️",desc:"一切如是，无需改变",color:"#831843",exercise:"静坐15分钟，什么都不做，只是存在。"},
  {level:18,name:"喜悦",emoji:"😆",desc:"纯粹的开心",color:"#701A75",exercise:"庆祝！做任何让你感到快乐的事，把这份快乐分享给世界。"},
  {level:19,name:"自由",emoji:"🕊️",desc:"超越限制的感觉",color:"#86198F",exercise:"写下'如果我完全自由，我会______'，然后选择一件今天就能做的事。"},
  {level:20,name:"赋能",emoji:"💪",desc:"我知道我可以创造一切",color:"#A21CAF",exercise:"回顾你的星愿成功日记，确认你创造过的所有奇迹。"},
  {level:21,name:"智慧",emoji:"🦉",desc:"洞察与理解",color:"#C026D3",exercise:"冥想一个问题，然后静默等待答案从内心升起。"},
  {level:22,name:"合一",emoji:"✨",desc:"与宇宙合一的最高状态",color:"#D946EF",exercise:"SATS：在入睡前，沉浸在你已经是的一切之中。"}
];

let emotionNotes = [];
function loadEmotionNotes() { try { const s = StorageUtil.get('emotion_notes', null); if (s) emotionNotes = s; } catch(e){} }
function saveEmotionNotes() { StorageUtil.set('emotion_notes', emotionNotes.slice(-30)); }

function onEmotionSlide(val) {
  const e = EMOTION_SCALE[val-1] || EMOTION_SCALE[10];
  const m = document.getElementById('emotion-marker');
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
  const val = parseInt(document.getElementById('emotion-slider').value);
  const e = EMOTION_SCALE[val-1];
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
  el.innerHTML = emotionNotes.slice(0,10).map(n => `<div class="p-3 rounded-xl text-sm" style="background:rgba(255,255,255,0.5)"><div class="flex items-center gap-2 mb-1"><span>${n.emoji}</span><span class="font-medium">${n.name}</span><span class="text-xs ml-auto" style="color:var(--text-mute)">${n.date}</span></div><p style="color:var(--text-soft)">${n.note}</p></div>`).join('');
}

function initEmotion() {
  loadEmotionNotes();
  onEmotionSlide(11);
  renderEmotionHistory();
}

// ===== SP显化专区 =====
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
  el.innerHTML = items.map((a,i) => `<div class="p-3 rounded-xl flex items-start gap-3 cursor-pointer" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="speakSpAffirmation('${a.replace(/'/g,"\\'")}')"><div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8)">${i+1}</div><p class="text-sm" style="color:var(--theme-text)">${a}</p></div>`).join('');
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

// ===== 财富丰盛专区 =====
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
  el.innerHTML = WEALTH_AFFIRMATIONS.map((a,i) => `<div class="p-3 rounded-xl flex items-center gap-3 cursor-pointer" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="speakWealthAffirmation('${a.replace(/'/g,"\\'")}')"><div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs" style="background:linear-gradient(135deg,#FDE68A,#F59E0B)">${i+1}</div><p class="text-sm" style="color:var(--theme-text)">${a}</p></div>`).join('');
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
  el.innerHTML = wealthChecks.slice(0,5).map(c => `<div class="p-3 rounded-xl text-sm flex items-center justify-between" style="background:rgba(254,243,199,0.3);border:1px solid rgba(251,191,36,0.15)"><div><div class="font-medium" style="color:#B45309">¥${c.amount}</div><div class="text-xs" style="color:var(--text-soft)">${c.purpose}</div></div><div class="text-xs" style="color:var(--text-mute)">${c.date}</div></div>`).join('');
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
  el.innerHTML = incomeLogs.slice(0,10).map(l => `<div class="p-3 rounded-xl text-sm flex items-center justify-between" style="background:rgba(255,255,255,0.5)"><div><span class="font-medium" style="color:var(--theme-text)">+¥${l.amount}</span> <span style="color:var(--text-soft)">来自 ${l.source}</span></div><div class="text-xs" style="color:var(--text-mute)">${l.date}</div></div>`).join('');
}

function renderWealthSymbols() {
  const el = document.getElementById('wealth-symbols');
  if(!el) return;
  const symbols = [
    {s:"💧",t:"水",d:"财富流动"},{s:"🌳",t:"树",d:"根基稳固"},{s:"🔑",t:"钥匙",d:"打开机会"},{s:"🚪",t:"门",d:"新通道"},{s:"💎",t:"钻石",d:"珍贵价值"},{s:"🌊",t:"海浪",d:"丰盛涌入"}
  ];
  el.innerHTML = symbols.map(s => `<div class="p-3 rounded-xl text-center" style="background:rgba(255,255,255,0.5)"><div class="text-2xl mb-1">${s.s}</div><div class="text-xs font-medium" style="color:var(--theme-text)">${s.t}</div><div class="text-[10px]" style="color:var(--text-mute)">${s.d}</div></div>`).join('');
}

// ===== 疗愈影院模块 =====
const MOVIE_PRESCRIPTIONS = [
  {title:"《秘密》The Secret",emoji:"🔮",year:2006,theme:"吸引力法则入门",lesson:"思想创造现实的基础。看完你会明白：你的想法正在塑造你的世界。",scene:"初学者必看",mood:"想要理解显化原理"},
  {title:"《土拨鼠之日》Groundhog Day",emoji:"🔄",year:1993,theme:"重复直到改变",lesson:"直到你学会功课，同样的情境会不断重复。改变内心，才能打破循环。",scene:"陷入循环时",mood:"觉得生活总在重复"},
  {title:"《心灵奇旅》Soul",emoji:"🎹",year:2020,theme:"活在当下的意义",lesson:"火花不是目标，而是对生活的热情。显化不是抓取未来，而是享受当下。",scene:"焦虑未来时",mood:"迷失人生方向"},
  {title:"《盗梦空间》Inception",emoji:"🌀",year:2010,theme:"植入信念",lesson:"潜意识接受真实的能力。一个想法可以像病毒一样生长，直到改变整个世界。",scene:"学习肯定语时",mood:"想理解潜意识如何工作"},
  {title:"《彗星来的那一夜》Coherence",emoji:"🌌",year:2013,theme:"平行现实",lesson:"每个选择都创造一个新的现实分支。你不需要后悔，因为每个版本的你都在体验。",scene:"后悔过去时",mood:"纠结于选择"},
  {title:"《她》Her",emoji:"💌",year:2013,theme:"意识与爱的本质",lesson:"爱是一种意识状态，不依赖于外在形式。显化SP不是操控，而是成为爱本身。",scene:"情感受伤时",mood:"对爱情失望"},
  {title:"《奇异博士》Dr. Strange",emoji:"🧿",year:2016,theme:"多维现实",lesson:"现实只是你感知到的那一层。改变视角，就改变现实。",scene:"扩展认知时",mood:"想要突破限制"},
  {title:"《降临》Arrival",emoji:"🛸",year:2016,theme:"时间与自由意志",lesson:"时间是非线性的，未来影响现在。你的终点状态正在召唤你向它移动。",scene:"理解显化时间线",mood:"急着想要结果"},
  {title:"《楚门的世界》The Truman Show",emoji:"🎥",year:1998,theme:"觉醒",lesson:"你的世界是一个为你设计的体验。当你觉醒，整个舞台都会为你改变。",scene:"怀疑现实时",mood:"觉得被困住"},
  {title:"《Eat Pray Love》",emoji:"🍝",year:2010,theme:"自我发现之旅",lesson:"通过外在旅行完成内在探索。显化不是改变地点，而是改变你携带的能量。",scene:"人生转折点",mood:"渴望改变"}
];

function initMovies() { renderMovies(); }
function renderMovies() {
  const el = document.getElementById('movie-list');
  if(!el) return;
  el.innerHTML = MOVIE_PRESCRIPTIONS.map(m => `<div class="glass-card p-5 card-hover" onclick="showToast('🎬 ${m.title} · ${m.lesson.substring(0,30)}...')"><div class="flex items-start gap-4"><div class="text-3xl flex-shrink-0">${m.emoji}</div><div class="flex-1"><div class="flex items-center gap-2 mb-1"><h3 class="font-medium" style="color:var(--theme-text)">${m.title}</h3><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.2);color:var(--text-soft)">${m.year}</span></div><div class="text-xs mb-2" style="color:var(--text-mute)">🎬 ${m.theme} · 适合：${m.scene}</div><div class="text-sm p-3 rounded-xl" style="background:rgba(255,255,255,0.5);color:var(--text-soft)"><span class="font-medium" style="color:var(--theme-text)">显化 lesson：</span>${m.lesson}</div></div></div></div>`).join('');
}

// ===== AI 宇宙闺蜜 =====
const AI_RESPONSES = {
  "今天情绪很低落": ["抱抱你 🤗 情绪低落的时候，最重要的是不要评判自己。允许自己此刻就是这种感觉。试试深呼吸5次，然后对自己说：'我允许自己感受这一切，但我知道这不是我的终点。' 你想试试看吗？💕","亲爱的，低落的时候就像阴天，太阳并没有消失，只是暂时被云遮住了。☁️→☀️ 你现在在22级情绪刻度的哪一级呢？我们可以从那里慢慢往上走。"],
  "SP不理我怎么办": ["这是3D在试图动摇你，但记住：3D只是旧意识的投影，不是真相！🚫 当SP '不理你' 的时候，其实是在给你空间去安住在你 '已经被爱' 的状态里。不要检查3D，回到你的肯定语。'TA正在想念我，准备联系我。' 重复21次，然后去睡觉。💤💕","🛡️ 启动忽略3D模式！SP 不理你 = 你正在 rearranging 这段关系。把 'TA不理我' 改成 'TA正在处理自己的情绪，准备以更成熟的方式回来'。修正法，现在就用！"],
  "我想显化财富": ["太棒了！💰 财富显化第一步：检查你的信念。你觉得 '赚钱很难' 吗？或者 '有钱人不快乐'？如果勾选了，这些就是你要清理的障碍。然后签发一张魔法支票，填写你渴望的金额，感受已经拥有的喜悦！","你是丰盛的磁铁！现在闭上眼睛，想象你的银行账户里有一笔让你惊喜的数字。感受那种安全感、自由感和感恩。让这种感觉充满你... 这就是显化财富的秘密频率。✨"],
  "给我一句今天的肯定语": ["✨ '我是宇宙最爱的孩子，今天发生的一切都是为了我的最高利益。' ✨ 重复21次，带着感觉说！","🌟 '我已经拥有了我想要的一切，此刻只是享受它显化的过程。' 🌟 这句适合在焦虑的时候用。","💕 '我和SP的关系充满了爱、尊重和幸福。' 💕 如果今天想显化爱情，用这句。","💰 '我是金钱的磁铁，钱从各种意想不到的渠道流向我。' 💰 这是今天的财富肯定语。"],
  "我最近总是焦虑": ["焦虑是因为你在用想象力创造你不想要的东西。😰 每一次焦虑，你都在给那个'坏结果'浇水。试试这个：每次焦虑时，立刻做一个 '修正' —— 想象同一个场景以完美的结局展开。坚持3天，你会发现焦虑自然减少了。🌿","焦虑是情绪刻度的第7级。不需要跳到喜悦，只需要升到 '希望' 就够了。🌱 试试写下：'我允许自己焦虑，但我也相信一切都会好起来。' 然后去做一件让身体动起来的小事，比如整理房间或洗个热水澡。"],
  default: ["我在听呢～💕 你可以多告诉我一些细节，或者试试我们的情绪导航器、21天显化挑战，这些都是为你准备的工具。","嗯嗯，我理解你的感受。显化有时候像是种花，你看不到根在生长，但它在。🌱 保持你的肯定语，不要检查3D，相信过程。","这是个很好的觉察！✨ 记录在你的星辰日记里吧，过一段时间回头看，你会发现自己走了多远。","宇宙永远站在你这边。🌙 你所渴望的，也正在渴望你。保持你的频率，不要放弃。"]
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
  div.innerHTML = fromUser ? `<div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style="background:linear-gradient(135deg,#B8A9C9,#D4B5C7)">🌸</div><div class="p-4 rounded-2xl rounded-tr-sm text-sm" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8);color:white;max-width:75%">${text}</div>` : `<div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8)">🌙</div><div class="p-4 rounded-2xl rounded-tl-sm text-sm" style="background:rgba(255,255,255,0.8);color:var(--theme-text);max-width:75%">${text}</div>`;
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
  for(const key in AI_RESPONSES) { if(key === 'default') continue; if(text.includes(key) || key.includes(text.substring(0,6))) { const r = AI_RESPONSES[key]; return r[Math.floor(Math.random()*r.length)]; } }
  if(text.includes('财富') || text.includes('钱') || text.includes('穷')) { const r = AI_RESPONSES['我想显化财富']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('SP') || text.includes('他') || text.includes('她') || text.includes('复合') || text.includes('分手')) { const r = AI_RESPONSES['SP不理我怎么办']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('低落') || text.includes('难过') || text.includes('伤心') || text.includes('哭')) { const r = AI_RESPONSES['今天情绪很低落']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('焦虑') || text.includes('紧张') || text.includes('不安')) { const r = AI_RESPONSES['我最近总是焦虑']; return r[Math.floor(Math.random()*r.length)]; }
  if(text.includes('肯定语')) { const r = AI_RESPONSES['给我一句今天的肯定语']; return r[Math.floor(Math.random()*r.length)]; }
  const d = AI_RESPONSES['default']; return d[Math.floor(Math.random()*d.length)];
}

// ===== 分享卡片功能 =====
let currentShareText = '';
function openShareCard(text) {
  currentShareText = text || getDailyAffirmation() || '我正在显化我想要的一切 ✨';
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
  const text = `✨ 星愿花园 · 星辰日记\n\n📅 ${new Date().toLocaleDateString('zh-CN')}\n\n${currentShareText}\n\n🏝️ 下载星愿花园，一起显化梦想！`;
  if(navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('分享文案已复制 ✨')); }
  else showToast(text.substring(0, 60) + '...');
}

// ===== 梦境工坊 =====
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
  el.innerHTML = DREAM_SYMBOLS.map(s => `<div class="p-3 rounded-xl cursor-pointer" style="background:rgba(255,255,255,0.5);border:1px solid rgba(212,181,199,0.2)" onclick="showToast('${s.symbol}：${s.meaning.substring(0,40)}...')"><div class="text-xl mb-1">${s.emoji}</div><div class="font-medium text-xs" style="color:var(--theme-text)">${s.symbol}</div><div class="text-[10px] mt-1" style="color:var(--text-mute)">${s.meaning.substring(0,20)}...</div></div>`).join('');
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
  el.innerHTML = dreamRecords.slice(0,10).map(d => `<div class="p-3 rounded-xl text-sm" style="background:rgba(255,255,255,0.5)"><div class="flex items-center justify-between mb-1"><span class="font-medium" style="color:var(--theme-text)">${d.date}</span><span class="text-xs" style="color:var(--text-mute)">${d.mood ? d.mood : ''} ${d.lucid ? (d.lucid==='是' ? '✨' : '') : ''}</span></div><p style="color:var(--text-soft)">${d.content.substring(0,100)}${d.content.length>100?'...':''}</p></div>`).join('');
}

// ===== 星愿成真故事墙 =====
const DEFAULT_STORIES = [
  {title:"3天显化SP复合",category:"SP复合",content:"我和SP分手2个月，每天坚持SATS和肯定语。第3天早上醒来看到TA的消息，TA说昨晚梦到我，想见我。现在我们比以前更好了！💕",date:"2025-06-15",likes:128},
  {title:"从负债到月入5万",category:"财富",content:"曾经负债累累，觉得自己不配有钱。每天做魔法支票和丰盛肯定语，2个月后意外接到一个大项目，月入5万。最重要的是心态变了！💰",date:"2025-05-20",likes:256},
  {title:"找到理想工作",category:"工作",content:"失业3个月，焦虑到失眠。开始使用情绪导航器，每天升一级情绪。面试前一天做了SATS，想象自己收到offer的样子。第二天真的收到了！🎉",date:"2025-06-01",likes:89},
  {title:"治愈了10年的焦虑",category:"自我成长",content:"以前每天焦虑到崩溃，吃药也没用。21天显化挑战第一周做完，发现自己能平静了。第三周结束时，焦虑消失了。这不仅是显化，是重生。🌱",date:"2025-04-10",likes:312},
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
  el.innerHTML = filtered.map((s,i) => `<div class="glass-card p-5"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">${s.category}</span><span class="text-xs" style="color:var(--text-mute)">${s.date}</span></div><div class="flex items-center gap-1 text-xs" style="color:var(--text-mute)"><span>❤️</span><span>${s.likes || 0}</span></div></div><h4 class="font-medium mb-2" style="color:var(--theme-text)">${s.title}</h4><p class="text-sm" style="color:var(--text-soft)">${s.content}</p></div>`).join('');
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

// ===== SATS冥想 =====
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
// satsRunning declared earlier at line ~11398

function initSats() { renderSatsScenes(); updateSatsTimerDisplay(); }
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
  const el = document.getElementById('sats-timer');
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

// ===== 数据备份 =====
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
  const exportData = { exportDate: new Date().toISOString(), version: '6.4', app: '星愿花园', data: {} };
  for (const k of keys) { const v = StorageUtil.get(k, null); if (v !== null) exportData.data[k] = v; }
  // 也导出所有 localStorage（兼容旧数据）
  const allKeys = StorageUtil.keys();
  for (const k of allKeys) {
    if (!keys.includes(k) && !k.startsWith('chart_')) {
      const v = StorageUtil.get(k, null);
      if (v !== null) exportData.data[k] = v;
    }
  }
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `星愿花园备份_${new Date().toLocaleDateString('zh-CN')}.json`; a.click();
  URL.revokeObjectURL(url);
  showToast('✅ 完整备份已下载（含所有模块数据）💾');
}

function copyAllData() {
  const keys = [
    'cosmos_island_state_v3', 'challenge_state', 'emotion_notes', 'sp_ignore_3d',
    'wealth_checks', 'wealth_income', 'ai_chat_history', 'dream_records', 'user_stories',
    'activity_log', 'breathe_records', 'voice_recordings', 'feedback_history',
    'cosmos_treasurebox_state', 'cosmos_timeline_state', 'cosmos_custom_affirms'
  ];
  const exportData = { exportDate: new Date().toISOString(), version: '6.4', app: '星愿花园', data: {} };
  for (const k of keys) { const v = StorageUtil.get(k, null); if (v !== null) exportData.data[k] = v; }
  const text = JSON.stringify(exportData);
  if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('备份数据已复制 📋')); }
  else showToast('数据太长，请使用导出功能');
}

function importAllData() {
  const el = document.getElementById('import-data-text');
  if (!el) return;
  const text = el.value.trim();
  if (!text) { showToast('请粘贴备份数据'); return; }
  try {
    const data = JSON.parse(text);
    if (!data.data || typeof data.data !== 'object') { showToast('数据格式错误'); return; }
    // 验证版本兼容性
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

function copyAllData() {
  const keys = ['cosmos_island_state_v3','challenge_state','emotion_notes','sp_ignore_3d','wealth_checks','wealth_income','ai_chat_history','dream_records','user_stories'];
  const exportData = { exportDate: new Date().toISOString(), version: '2.0', data: {} };
  for(const k of keys) { const v = StorageUtil.get(k, null); if(v !== null) exportData.data[k] = v; }
  const text = JSON.stringify(exportData, null, 2);
  if(navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('备份数据已复制 📋')); }
  else showToast('数据太长，请使用导出功能');
}

function importAllData() {
  const el = document.getElementById('import-data-text');
  if(!el) return;
  const text = el.value.trim();
  if(!text) { showToast('请粘贴备份数据'); return; }
  try {
    const data = JSON.parse(text);
    if(!data.data || typeof data.data !== 'object') { showToast('数据格式错误'); return; }
    for(const k in data.data) { StorageUtil.set(k, data.data[k]); }
    showToast('✅ 数据导入成功！即将刷新...');
    setTimeout(() => location.reload(), 1500);
  } catch(e) { showToast('❌ 导入失败：数据格式错误'); }
}

// ===== 导航扩展 =====
function openModuleExtended(name) {
  if (name === 'challenge') { showPage('challenge'); initChallenge(); return; }
  if (name === 'emotion') { showPage('emotion'); initEmotion(); return; }
  if (name === 'sp') { showPage('sp'); initSp(); return; }
  if (name === 'wealth') { showPage('wealth'); initWealth(); return; }
  if (name === 'movies') { showPage('movies'); initMovies(); return; }
  if (name === 'ai') { showPage('ai'); initAi(); return; }
  if (name === 'dreams') { showPage('dreams'); initDreams(); return; }
  if (name === 'stories') { showPage('stories'); initStories(); return; }
  if (name === 'sats') { showPage('sats'); initSats(); return; }
  if (name === 'backup') { showPage('backup'); initBackup(); return; }
  // fallback to original openModule
  openModule(name);
}


// ===== 商业化系统 · 会员+星光水晶+裂变 =====
const MEMBER_TIERS = {
  free: { name: '免费体验', color: '#B8A9C9', dailyTarot: 1, dailyAI: 3, dailySats: 1, books: 2, export: false, advancedCharts: false, spFull: false, aiCoach: false, movies: false, dreams: true, stories: true },
  member: { name: '宇宙会员', color: '#D4B5C7', dailyTarot: 3, dailyAI: 20, dailySats: 3, books: 8, export: true, advancedCharts: true, spFull: true, aiCoach: false, movies: true, dreams: true, stories: true },
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
  if (feature === 'tarot') { if (todayUsage.tarot >= tier.dailyTarot) { showQuotaLock('星辰塔罗', tier.dailyTarot); return false; } todayUsage.tarot++; saveVipState(); return true; }
  if (feature === 'ai') { if (todayUsage.ai >= tier.dailyAI) { showQuotaLock('AI 对话', tier.dailyAI); return false; } todayUsage.ai++; saveVipState(); return true; }
  if (feature === 'sats') { if (todayUsage.sats >= tier.dailySats) { showQuotaLock('SATS 冥想', tier.dailySats); return false; } todayUsage.sats++; saveVipState(); return true; }
  if (feature === 'books') { return true; } // book lock handled by book count
  return true;
}

function showQuotaLock(name, limit) {
  showLockModal(`今日${name}次数已用完`, `免费用户每天可使用 ${limit} 次。升级会员获得更多次数，或用星光水晶解锁额外使用。`);
}

function showLockModal(title, desc) {
  const t = document.getElementById('lock-title');
  const d = document.getElementById('lock-desc');
  const m = document.getElementById('lock-modal');
  if(t) t.textContent = title || '功能锁定';
  if(d) d.textContent = desc || '升级会员即可解锁此功能';
  if(m) m.classList.add('show');
}

function closeLockModal() { const m = document.getElementById('lock-modal'); if(m) m.classList.remove('show'); }

// ===== 会员页面 =====
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
  if(descEl) descEl.textContent = tier === 'free' ? '升级会员，解锁全部显化工具' : `有效期至 ${vipState.expiry ? new Date(vipState.expiry).toLocaleDateString('zh-CN') : '永久'}`;
  if(crystalEl) crystalEl.textContent = crystalState.crystals;
  if(upBtn) upBtn.style.display = tier === 'free' ? 'block' : 'none';
  if(reBtn) reBtn.style.display = tier !== 'free' ? 'block' : 'none';
  renderCheckIn();
  renderTasks();
  generateInviteCode();
}

function showVipPlans() { showPage('vip-plans'); startOfferTimer(); }

// ===== 签到系统 =====
function renderCheckIn() {
  const streakEl = document.getElementById('checkin-streak');
  if(streakEl) streakEl.textContent = crystalState.dailyCheckIn.streak || 0;
  const today = new Date().toLocaleDateString('zh-CN');
  const done = crystalState.dailyCheckIn.date === today;
  const btn = document.getElementById('checkin-btn');
  const doneBtn = document.getElementById('checkin-done');
  if(btn) btn.style.display = done ? 'none' : 'block';
  if(doneBtn) doneBtn.style.display = done ? 'block' : 'none';
  // highlight checked days
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
  // Check if consecutive
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
  showToast(`签到成功！连续 ${streak} 天，获得 ${reward} 星光水晶 ✨`);
  triggerConfetti();
}

// ===== 任务追踪 =====
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

// ===== 邀请系统 =====
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
  if(navigator.clipboard) { navigator.clipboard.writeText(el.value).then(() => showToast('邀请码已复制 📋')); }
  else showToast(`邀请码：${el.value}`);
}

function submitInviteCode() {
  const input = document.getElementById('input-invite-code');
  if(!input) return;
  const code = input.value.trim().toUpperCase();
  if(!code) { showToast('请输入邀请码'); return; }
  if(code === crystalState.inviteCode) { showToast('不能输入自己的邀请码'); return; }
  if(crystalState.invitedBy) { showToast('你已经领取过邀请奖励了'); return; }
  // Simulate validation (in real app this would be server-side)
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

// ===== 星光水晶解锁 =====
function unlockWithCrystals(type, cost) {
  if(crystalState.crystals < cost) { showToast(`星光水晶不足，还需要 ${cost - crystalState.crystals} 个 💎`); showPage('vip'); return; }
  if(!confirm(`确认花费 ${cost} 星光水晶解锁？`)) return;
  crystalState.crystals -= cost;
  if(type === 'book') { /* would need to select a book, simplified for now */ showToast('已解锁书籍！📖'); }
  if(type === 'ai5') { crystalState.aiUnlocks += 5; showToast('已解锁 5 次 AI 对话！🤖'); }
  if(type === 'member1d') { 
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    vipState.tier = 'member'; vipState.expiry = tomorrow.toISOString();
    showToast('已解锁 1 天会员体验！✨'); 
  }
  saveVipState();
  updateCrystalDisplay();
  triggerConfetti();
}

// ===== 订阅选择（模拟支付） =====
function selectPlan(planId) {
  const plan = 星光会员_PRICES[planId];
  if(!plan) return;
  const tierName = plan.tier === 'member' ? '宇宙会员' : '星际高级会员';
  const period = plan.period === '月' ? '月' : '年';
  const confirmMsg = `确认购买 ${tierName} ${plan.name}？\n价格：¥${plan.price}/${period}\n\n（此为演示，实际支付需接入支付系统）`;
  if(!confirm(confirmMsg)) return;
  // Simulate purchase
  const duration = plan.period === '月' ? 30 : 365;
  const expiry = new Date(); expiry.setDate(expiry.getDate() + duration);
  vipState.tier = plan.tier;
  vipState.expiry = expiry.toISOString();
  crystalState.purchaseHistory.push({ plan: planId, date: new Date().toISOString(), price: plan.price });
  if(plan.bonus) { crystalState.crystals += plan.bonus; showToast(`额外赠送 ${plan.bonus} 星光水晶！`); }
  saveVipState();
  showToast(`🎉 购买成功！已升级为 ${tierName}`);
  triggerConfetti();
  setTimeout(() => { goHome(); }, 1500);
}

// ===== 限时优惠弹窗 =====
function showLimitedOffer() {
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

// ===== 自动促活弹窗 =====
function checkAutoPromotions() {
  loadVipState();
  if(getCurrentTier() !== 'free') return;
  // Show limited offer after first use (3 days)
  const firstUse = new Date(vipState.firstUseDate || new Date());
  const daysSince = Math.floor((new Date() - firstUse) / (1000 * 60 * 60 * 24));
  if(daysSince >= 1 && !vipState.offerShown) {
    vipState.offerShown = true;
    saveVipState();
    setTimeout(() => showLimitedOffer(), 3000);
  }
}

// ===== 在现有功能中植入权限检查 =====
// 1. Tarot - 限制每日次数
const originalRenderTarot = window.renderTarot || function(){};
window.renderTarot = function() { if(!checkQuota('tarot', 'draw')) return; originalRenderTarot(); };

// 2. AI - 限制对话次数
const originalSendAiMessage = window.sendAiMessage || function(){};
window.sendAiMessage = function() { 
  if(crystalState.aiUnlocks > 0) { crystalState.aiUnlocks--; saveVipState(); }
  else if(!checkQuota('ai', 'chat')) return;
  originalSendAiMessage(); 
};

// 3. SATS - 限制次数
const originalStartSatsTimer = window.startSatsTimer || function(){};
window.startSatsTimer = function() { if(!checkQuota('sats', 'session')) return; originalStartSatsTimer(); };

// 4. Books - 限制可阅读数量
const originalRenderLibrary = window.renderLibrary || function(){};
window.renderLibrary = function() {
  const tier = getTierConfig();
  // Modify library rendering to show lock on books beyond limit
  originalRenderLibrary();
  // Add locks to books beyond tier.books
  const bookIds = Object.keys(BOOK_DETAILS || {});
  bookIds.forEach((id, idx) => {
    if(idx >= tier.books) {
      const spine = document.querySelector(`[data-book-id="${id}"]`);
      if(spine) { spine.style.filter = 'grayscale(0.8)'; spine.title = '升级会员解锁'; }
    }
  });
};

// 5. Export - 锁定
const originalExportAllData = window.exportAllData || function(){};
window.exportAllData = function() { if(isFeatureLocked('export')) { showLockModal('数据导出', '导出数据是会员专属功能。升级会员即可备份所有显化记录。'); return; } originalExportAllData(); };

// 6. Movies - 锁定
const originalInitMovies = window.initMovies || function(){};
window.initMovies = function() { if(isFeatureLocked('movies')) { showLockModal('疗愈影院', '疗愈影院是会员专属功能。升级会员解锁10部显化疗愈影院。'); return; } originalInitMovies(); };

// 7. SP Full - 锁定完整内容
const originalInitSp = window.initSp || function(){};
window.initSp = function() { if(isFeatureLocked('spFull')) { showLockModal('SP显化专区', 'SP完整专区是会员专属功能。免费版可浏览基础肯定语。'); /* Still show but limited */ originalInitSp(); return; } originalInitSp(); };

// 8. Growth advanced charts - 锁定
const originalInitGrowth = window.renderGrowth || function(){};
window.renderGrowth = function() { if(isFeatureLocked('advancedCharts')) { showLockModal('高级图表', '情绪趋势分析是会员专属功能。'); return; } originalInitGrowth(); };

// ===== 书籍点击锁定 =====
const originalOpenBookDetail = window.openBookDetail || function(){};
window.openBookDetail = function(id, type) {
  const tier = getTierConfig();
  const bookIds = Object.keys(BOOK_DETAILS || {});
  const idx = bookIds.indexOf(id);
  if(idx >= 0 && idx >= tier.books && getCurrentTier() === 'free') {
    showLockModal('书籍解锁', `你已解锁 ${tier.books} 本书。升级会员解锁全部 8 本经典。或用星光水晶单独解锁。`);
    return;
  }
  originalOpenBookDetail(id, type);
};

// ===== 导航添加会员入口 =====
function addVipNavEntry() {
  const nav = document.querySelector('.bottom-nav');
  if(!nav) return;
  const existing = nav.querySelector('[onclick*="vip"]');
  if(existing) return;
  const lastItem = nav.querySelector('.nav-item:last-child');
  if(!lastItem) return;
  const vipItem = document.createElement('div');
  vipItem.className = 'nav-item';
  vipItem.setAttribute('onclick', "showPage('vip');initVip()");
  vipItem.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>会员</span>`;
  nav.insertBefore(vipItem, lastItem);
}

// ===== 在'我的'页面添加会员入口 =====
function addVipToMePage() {
  const mePage = document.getElementById('page-me');
  if(!mePage) return;
  const firstCard = mePage.querySelector('.glass-card');
  if(!firstCard) return;
  const vipCard = document.createElement('div');
  vipCard.className = 'glass-card p-4 mb-4 cursor-pointer card-hover';
  vipCard.setAttribute('onclick', "showPage('vip');initVip()");
  vipCard.innerHTML = `<div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style="background:linear-gradient(135deg,#E8B5C8,#C8A5D8)">👑</div><div class="flex-1"><div class="font-medium text-sm" style="color:var(--theme-text)">会员中心</div><div class="text-xs" style="color:var(--text-mute)">升级解锁全部显化工具</div></div><div class="text-lg opacity-40">→</div></div>`;
  mePage.insertBefore(vipCard, firstCard);
}

// ===== 自动初始化 =====
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    loadVipState();
    addVipNavEntry();
    addVipToMePage();
    checkAutoPromotions();
    loadDarkMode();
    autoDarkMode();
  }, 2000);
});

// ===== openModule 路由修复 =====
const __originalOpenModule = window.openModule;
window.openModule = function(name) {
  if (name === 'challenge') { showPage('challenge'); initChallenge(); return; }
  if (name === 'emotion') { showPage('emotion'); initEmotion(); return; }
  if (name === 'sp') { showPage('sp'); initSp(); return; }
  if (name === 'wealth') { showPage('wealth'); initWealth(); return; }
  if (name === 'movies') { showPage('movies'); initMovies(); return; }
  if (name === 'ai') { showPage('ai'); initAi(); return; }
  if (name === 'dreams') { showPage('dreams'); initDreams(); return; }
  if (name === 'stories') { showPage('stories'); initStories(); return; }
  if (name === 'sats') { showPage('sats'); initSats(); return; }
  if (name === 'backup') { showPage('backup'); initBackup(); return; }
  if (name === 'vip') { showPage('vip'); initVip(); return; }
  if (name === 'vip-plans') { showPage('vip-plans'); return; }
  if (name === 'weekly') { showPage('reports'); initReports(); return; }
  if (name === 'community') { showPage('community'); renderCommunityFeed(); return; }
  if (name === 'audio') { showPage('audio'); initAudioPage(); return; }
  if (name === 'bootcamp') { showPage('bootcamp'); initBootcamp(); return; }
  if (name === 'shop') { showPage('shop'); return; }
  if (name === 'coach') { showPage('coach'); return; }
  if (name === 'privacy') { showPage('privacy'); return; }
  if (name === 'search') { showPage('search'); initSearch(); return; }
  if (name === 'reports') { showPage('reports'); initReports(); return; }
  if (name === 'breathe') { showPage('breathe'); initBreathe(); return; }
  if (name === 'voice') { showPage('voice'); initVoice(); return; }
  if (name === 'sleep') { showPage('sleep'); initSleep(); return; }
  if (name === 'health') { showPage('health'); initHealth(); return; }
  if (name === 'stats') { showPage('stats'); initStats(); return; }
  if (name === 'cleanup') { showPage('cleanup'); initCleanup(); return; }
  if (name === 'about') { showPage('about'); initAbout(); return; }
  if (__originalOpenModule) __originalOpenModule(name);
};

// ===== 音频冥想引导系统 v3.5 =====
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
  const scenes = [
    {title:"肯定语循环",duration:1800,affirmations:["我值得一切美好","我正在显化我想要的一切","我是宇宙最爱的孩子"]},
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
  } catch(e) { console.log('Audio error', e); }
}
let lastOut = 0;

function speakText(text) {
  if(!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    u.pitch = 1.05;
    u.volume = 0.8;
    window.speechSynthesis.speak(u);
  } catch(e) {}
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

// ===== 训练营课程化 v3.5 =====
const BOOTCAMP_DATA = {
  name: '7天显化速训营',
  days: [
    {title:'Day 1 · 设定意图',lesson:'显化的第一步是清晰知道你真正想要什么。写下你最渴望实现的愿望，用现在时态描述。',tasks:['写下1个核心愿望','制作简易梦想画册','设定3句核心肯定语']},
    {title:'Day 2 · 情绪校准',lesson:'情绪是显化的指南针。使用情绪导航器，了解你当前的位置，然后选择升阶练习。',tasks:['使用情绪导航器记录','完成一次升阶练习','睡前SATS 10分钟']},
    {title:'Day 3 · 肯定语植入',lesson:'肯定语是潜意识的种子。今天开始循环朗读你的肯定语，配合音频引导。',tasks:['完成肯定语音频30分钟','记录身体感受','分享一句肯定语到星辰社区']},
    {title:'Day 4 · 修正法',lesson:'遇到不开心的事？立刻用修正法改写结局。这是显化大师的必备技能。',tasks:['修正一件今天的小事','记录修正后的感受','做一次星辰塔罗抽牌']},
    {title:'Day 5 · 丰盛体验',lesson:'显化丰盛的最好方式是先体验丰盛。今天做一件让你感到富足的事。',tasks:['签发一张魔法支票','完成财富信念测试','记录一笔进账']},
    {title:'Day 6 · SP 专场',lesson:'如果你正在绽放SP，今天是专属练习日。忽略3D，活在终点状态。',tasks:['开启忽略3D模式','完成SP肯定语音频','写下SP复合后的场景']},
    {title:'Day 7 · 庆祝与释放',lesson:'你已经完成了7天训练！今天庆祝你的新身份，然后完全释放对结果的执着。',tasks:['完成全部打卡','写一篇星辰日记','在星辰社区分享你的体验']}
  ]
};

let bootcampState = { currentDay: 1, completedTasks: {}, started: false, finished: false };
function loadBootcampState() { try { const s = StorageUtil.get('bootcamp_state', null); if(s) bootcampState = {...bootcampState, ...s}; } catch(e){} }
function saveBootcampState() { StorageUtil.set('bootcamp_state', bootcampState); }

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
  if(navigator.clipboard) { navigator.clipboard.writeText(text).then(() => showToast('证书文案已复制 ✨')); }
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
  
  el.innerHTML = all.map(p => `<div class="glass-card p-4 mb-3"><div class="flex items-center gap-2 mb-2"><div class="text-lg">${p.mood}</div><div class="text-xs" style="color:var(--text-mute)">${p.date}</div></div><p class="text-sm mb-3" style="color:var(--theme-text)">${p.text}</p><div class="flex items-center gap-3"><button onclick="likeCommunityPost(${p.id})" class="text-xs flex items-center gap-1 ${p.liked ? 'text-red-400' : ''}" style="color:var(--text-mute)"><span>${p.liked ? '💖' : '❤️'}</span> ${p.likes}</button><span class="text-xs" style="color:var(--text-mute)">💬 评论</span></div></div>`).join('');
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
    userAgent: navigator.userAgent.substring(0, 50)
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
  allAffirmations.forEach((a, i) => { if(a.text.toLowerCase().includes(q)) results.push({...a, id:'affirm_'+i, action:`speakText('${a.text.replace(/'/g,"\\'")}');showToast('已播放 ✨')`}); });
  
  // Search books
  if(typeof BOOK_DETAILS !== 'undefined') {
    Object.entries(BOOK_DETAILS).forEach(([id, b]) => {
      if((b.title && b.title.toLowerCase().includes(q)) || (b.desc && b.desc.toLowerCase().includes(q))) {
        results.push({type:'书籍',cat:'经典',text:b.title, id, action:`openBookDetail('${id}', 'book')`});
      }
    });
  }
  
  // Search movies
  if(typeof MOVIE_PRESCRIPTIONS !== 'undefined') {
    MOVIE_PRESCRIPTIONS.forEach((m, i) => {
      if(m.title.toLowerCase().includes(q) || m.theme.toLowerCase().includes(q) || m.lesson.toLowerCase().includes(q)) {
        results.push({type:'电影',cat:'疗愈',text:m.title, id:'movie_'+i, action:`showToast('🎬 ${m.title} · ${m.lesson.substring(0,30)}...')`});
      }
    });
  }
  
  // Search SATS scenes
  if(typeof SATS_SCENES !== 'undefined') {
    SATS_SCENES.forEach((s, i) => {
      if(s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) {
        results.push({type:'冥想',cat:'SATS',text:s.title, id:'sats_'+i, action:`showPage('sats');showToast('🌙 ${s.title}')`});
      }
    });
  }
  
  if(!results.length) { el.innerHTML = '<div class="text-center py-8 text-sm" style="color:var(--text-mute)">没有找到相关内容，换个关键词试试 ✨</div>'; return; }
  
  el.innerHTML = results.map((r, i) => `<div class="glass-card p-4 mb-3 cursor-pointer card-hover" onclick="${r.action}"><div class="flex items-center gap-2 mb-1"><span class="text-xs px-2 py-0.5 rounded-full" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">${r.type}</span><span class="text-xs" style="color:var(--text-mute)">${r.cat}</span></div><div class="text-sm font-medium" style="color:var(--theme-text)">${r.text}</div></div>`).join('');
}

// ===== 暗黑模式 =====
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
  if(darkModeEnabled) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  const btn = document.getElementById('dark-mode-toggle');
  if(btn) btn.textContent = darkModeEnabled ? '☀️' : '🌙';
}
function autoDarkMode() {
  const hour = new Date().getHours();
  if(hour >= 22 || hour < 6) { if(!darkModeEnabled) { darkModeEnabled = true; applyDarkMode(); } }
}

// ===== 数据报告增强 =====
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
      <div class="glass-card p-3 text-center"><div class="text-xl font-bold" style="color:var(--theme-text)">${challenges}</div><div class="text-xs" style="color:var(--text-mute)">显化挑战完成</div></div>
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
  
  // Monthly aggregation (demo)
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


// ===== PWA Service Worker 注册 =====
(function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('SW 注册成功', reg.scope);
        // 注册后台同步标签（用于提醒）
        if ('sync' in reg) {
          reg.sync.register('daily-reminder').catch(()=>{});
        }
      })
      .catch(err => console.log('SW 注册失败', err));
  }

  // 处理 manifest shortcuts / 推送通知跳转路由
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
      setTimeout(() => openSearch(), 500);
    } else if (route === 'reports') {
      setTimeout(() => { showPage('reports'); initReports(); }, 500);
    }
    // 清理 URL 参数
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, location.pathname + location.hash);
    }
  }

  // 等待页面初始化完成后处理路由
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleRouteParam);
  } else {
    handleRouteParam();
  }
})();

// ===== PWA 安装引导 =====
let pwaInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  pwaInstallPrompt = e;
  // 记录可安装状态
  localStorage.setItem('pwa_installable', 'true');
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
      localStorage.setItem('pwa_installed', 'true');
    }
    pwaInstallPrompt = null;
  });
}

function maybeShowInstallBanner() {
  // 已安装或已拒绝则不显示
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (localStorage.getItem('pwa_installed') === 'true') return;
  if (localStorage.getItem('pwa_dismissed') === 'true') return;
  // 第二次访问才显示
  const visits = parseInt(localStorage.getItem('pwa_visit_count') || '0');
  localStorage.setItem('pwa_visit_count', String(visits + 1));
  if (visits < 1) return;
  if (!pwaInstallPrompt) return;
  // 延迟显示
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
        <button onclick="showInstallPrompt(); document.getElementById('pwa-install-banner').remove();" style="background:white;color:#5D4E6D;border:none;border-radius:10px;padding:8px 14px;font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;">安装</button>
        <button onclick="try{localStorage.setItem('pwa_dismissed','true');}catch(e){} document.getElementById('pwa-install-banner').remove();" style="background:rgba(255,255,255,0.2);color:white;border:none;border-radius:10px;padding:8px 10px;font-size:12px;cursor:pointer;">×</button>
      </div>
    `;
    document.body.appendChild(banner);
  }, 2000);
}

// 页面初始化完成后检查是否显示安装引导
setTimeout(maybeShowInstallBanner, 4000);

// ===== v5.1 静心呼吸器 =====
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
  // 记录
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
  document.getElementById('breathe-round').textContent = `第 ${breatheState.round} / ${cfg.rounds} 轮`;
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
  // 倒计时
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

// ===== v5.1 语音肯定语录制 =====
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
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('您的浏览器不支持录音功能'); return;
  }
  if (!window.MediaRecorder) {
    showToast('此浏览器不支持录音，请使用 Chrome/Edge/Firefox 或安卓设备'); return;
  }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    // 检测支持的 MIME 类型
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
      if (voiceRecordings.length > 20) voiceRecordings.pop();
      StorageUtil.set('voice_recordings', voiceRecordings);
      renderVoiceRecordings();
      setText('voice-status', '录制完成！');
      setStyle('voice-record-btn', 'background', 'linear-gradient(135deg,#D4B5C7,#B8A9C9)');
      setStyle('voice-wave', 'opacity', '0');
      logActivity('voice_record', '录制肯定语');
    };
    voiceRecorder.start();
    voiceRecordStartTime = Date.now();
    setText('voice-status', '正在录制...');
    setStyle('voice-record-btn', 'background', '#F87171');
    setStyle('voice-wave', 'opacity', '1');
    // 计时器
    voiceRecordInterval = setInterval(() => {
      const sec = Math.round((Date.now() - voiceRecordStartTime) / 1000);
      document.getElementById('voice-timer').textContent = `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
    }, 1000);
  }).catch(() => showToast('需要麦克风权限才能录音'));
}

function stopVoiceRecord() {
  if (voiceRecorder && voiceRecorder.state !== 'inactive') voiceRecorder.stop();
  if (voiceRecordInterval) clearInterval(voiceRecordInterval);
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
  voiceAudioPlayer = new Audio(r.url);
  voiceAudioPlayer.loop = true;
  voiceAudioPlayer.play().catch(() => showToast('播放失败'));
  showToast('🔁 循环播放中...点击其他录音切换');
}

function deleteVoiceRecording(idx) {
  if (!confirm('删除这条录音？')) return;
  voiceRecordings.splice(idx, 1);
  StorageUtil.set('voice_recordings', voiceRecordings);
  renderVoiceRecordings();
}

function fillVoiceInput(text) {
  showToast(`已复制："${text}"，点击麦克风录制这句话`);
  navigator.clipboard?.writeText(text).catch(()=>{});
}

function initVoice() { renderVoiceRecordings(); }

// ===== v5.1 睡眠故事 =====
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
  
  // 分段语音合成（避免长文本被iOS截断）
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const paragraphs = story.text.split(/\n\n+/).filter(p => p.trim());
    sleepStoryState.utterQueue = paragraphs;
    speakNextParagraph();
  }
  
  // 进度条
  let elapsed = 0;
  const total = story.duration * 60;
  setStyle('sleep-progress', 'width', '0%');
  document.getElementById('sleep-time-left').textContent = `剩余 ${story.duration}:00`;
  sleepStoryState.interval = setInterval(() => {
    if (sleepStoryState.paused) return;
    elapsed++;
    const pct = (elapsed / total) * 100;
    setStyle('sleep-progress', 'width', `${pct}%`);
    const left = total - elapsed;
    document.getElementById('sleep-time-left').textContent = `剩余 ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
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

// ===== v5.1.1 综合活动记录 =====
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

// ===== v5.1 习惯打卡热力图 =====
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

// ===== v5.1 智能推荐引擎 =====
function getSmartRecommendations() {
  const recs = [];
  const hour = new Date().getHours();
  const emotions = StorageUtil.get('emotion_notes', []);
  const lastEmotion = emotions.length > 0 ? emotions[emotions.length-1] : null;
  const mood = lastEmotion ? lastEmotion.level : 11;
  
  // 时间推荐
  if (hour >= 6 && hour < 10) {
    recs.push({ type: 'affirm', title: '晨间肯定语', desc: '用肯定语开启美好的一天', action: () => showDailyAffirmation(), icon: '☀️' });
  } else if (hour >= 14 && hour < 17) {
    recs.push({ type: 'breathe', title: '午后呼吸', desc: '3分钟呼吸，重新聚焦能量', action: () => { showPage('breathe'); initBreathe(); }, icon: '🌬️' });
  } else if (hour >= 20 && hour < 23) {
    recs.push({ type: 'sleep', title: '睡前显化', desc: '在潜意识最开放的时刻显化', action: () => { showPage('sleep'); }, icon: '🌙' });
  }
  
  // 情绪推荐
  if (mood <= 6) {
    recs.push({ type: 'emotion', title: '情绪疗愈', desc: '你最近情绪有些低落，来释放一下吧', action: () => { showPage('emotion'); initEmotion(); }, icon: '💗' });
    recs.push({ type: 'movie', title: '疗愈影院', desc: '一部电影，一份温柔的疗愈', action: () => { showPage('movies'); initMovies(); }, icon: '🎬' });
  } else if (mood >= 14) {
    recs.push({ type: 'challenge', title: '21天显化挑战', desc: '情绪很好，适合开启新显化挑战！', action: () => { showPage('challenge'); initChallenge(); }, icon: '💪' });
    recs.push({ type: 'sats', title: 'SATS 冥想', desc: '趁着高能量状态，做一场显化冥想', action: () => { showPage('sats'); initSats(); }, icon: '🧘' });
  }
  
  // 行为推荐（基于使用频次）
  const breatheRecs = StorageUtil.get('breathe_records', {});
  const breatheCount = Object.values(breatheRecs).reduce((a,b)=>a+b,0);
  if (breatheCount === 0) {
    recs.push({ type: 'breathe', title: '第一次呼吸', desc: '试试我们的静心呼吸，3分钟回归平静', action: () => { showPage('breathe'); initBreathe(); }, icon: '🌬️' });
  }
  
  const aiChats = StorageUtil.get('ai_chat_history', []);
  if (aiChats.length === 0) {
    recs.push({ type: 'ai', title: 'AI 闺蜜', desc: '有任何困惑，和AI闺蜜聊聊吧', action: () => { showPage('ai'); initAi(); }, icon: '🤖' });
  }
  
  // 去重，最多6条
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

// ===== v5.4 星光徽章系统 =====
const NEW_BADGES = [
  { id: 'first_mood', name: '情绪觉察', emoji: '💭', desc: '第一次记录情绪', check: () => StorageUtil.get('emotion_notes', []).length > 0 },
  { id: 'mood_7', name: '情绪日记', emoji: '📓', desc: '连续记录情绪7天', check: () => { const notes = StorageUtil.get('emotion_notes', []); const dates = [...new Set(notes.map(n => n.date))].slice(0, 7); return dates.length >= 7; } },
  { id: 'first_diary', name: '显化记录', emoji: '✍️', desc: '写下第一篇星辰日记', check: () => state.diaries.length > 0 },
  { id: 'diary_7', name: '书写者', emoji: '📝', desc: '连续写日记7天', check: () => { const d = state.diaries; const dates = [...new Set(d.map(x => x.date))].slice(0, 7); return dates.length >= 7; } },
  { id: 'first_breathe', name: '深呼吸', emoji: '🌬️', desc: '完成第一次静心呼吸', check: () => Object.keys(StorageUtil.get('breathe_records', {})).length > 0 },
  { id: 'breathe_30', name: '呼吸大师', emoji: '🧘', desc: '累计完成30轮呼吸', check: () => { const r = StorageUtil.get('breathe_records', {}); return Object.values(r).reduce((a,b) => a + b, 0) >= 30; } },
  { id: 'first_voice', name: '我的声音', emoji: '🎙️', desc: '录制第一条语音肯定语', check: () => StorageUtil.get('voice_recordings', []).length > 0 },
  { id: 'first_sleep', name: '睡前显化', emoji: '🌙', desc: '播放一次睡眠故事', check: () => { const log = StorageUtil.get('activity_log', {}); return Object.values(log).flat().some(a => a.type === 'sleep_story'); } },
  { id: 'first_challenge', name: '显化挑战开始', emoji: '💪', desc: '完成21天显化挑战第一天', check: () => { const c = StorageUtil.get('challenge_state', {}); return (c.completedDays || []).length >= 1; } },
  { id: 'challenge_21', name: '显化勇士', emoji: '🏆', desc: '完成21天显化显化挑战', check: () => { const c = StorageUtil.get('challenge_state', {}); return (c.completedDays || []).length >= 21; } },
  { id: 'first_sats', name: 'SATS初体验', emoji: '🔮', desc: '完成第一次SATS冥想', check: () => { const log = StorageUtil.get('activity_log', {}); return Object.values(log).flat().some(a => a.type === 'sats'); } },
  { id: 'first_vision', name: '愿景创造者', emoji: '🖼️', desc: '在梦想画册添加第一个愿望', check: () => StorageUtil.get('vision_board_cards', []).length > 0 },
  { id: 'checkin_7', name: '签到达人', emoji: '📅', desc: '连续签到7天', check: () => { const c = StorageUtil.get('crystalState', {}); return (c.dailyCheckIn || {}).streak >= 7; } },
  { id: 'checkin_30', name: '显化习惯', emoji: '💎', desc: '连续签到30天', check: () => { const c = StorageUtil.get('crystalState', {}); return (c.dailyCheckIn || {}).streak >= 30; } },
  { id: 'feedback', name: '建设者', emoji: '💌', desc: '提交一次反馈', check: () => StorageUtil.get('feedback_history', []).length > 0 },
  { id: 'dark_mode', name: '夜行者', emoji: '🌙', desc: '使用深色模式', check: () => document.body.classList.contains('dark') },
  { id: 'all_tools', name: '工具通', emoji: '🧰', desc: '使用5种不同工具', check: () => { const log = StorageUtil.get('activity_log', {}); const types = new Set(Object.values(log).flat().map(a => a.type)); return types.size >= 5; } },
  { id: 'export_data', name: '数据管家', emoji: '📲', desc: '导出或同步数据', check: () => { const log = StorageUtil.get('activity_log', {}); return Object.values(log).flat().some(a => a.type === 'export' || a.type === 'import'); } },
];

function getUnlockedBadges() {
  return NEW_BADGES.filter(b => b.check());
}

function getBadgeProgress() {
  const total = NEW_BADGES.length;
  const unlocked = getUnlockedBadges().length;
  return { total, unlocked, percent: Math.round((unlocked / total) * 100) };
}

function renderBadgeWall() {
  const el = document.getElementById('badge-wall');
  if (!el) return;
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
  // Update me page badge count
  const meBadge = document.getElementById('me-badges');
  if (meBadge) meBadge.textContent = unlocked;
}

function openBadgeWall() {
  showPage('badge-wall');
  initBadgeWall();
}

// ===== Chart.js 数据可视化 =====
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
  
  // 统计
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
  renderHabitCalendar(habitCalendarMonth);
}

function renderHabitCalendar(date) {
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
  
  // 星期头
  ['日','一','二','三','四','五','六'].forEach(d => {
    html += `<div style="font-size:11px;color:var(--text-mute);padding:4px 0;">${d}</div>`;
  });
  
  // 前导空白
  for (let i = 0; i < startPadding; i++) {
    html += '<div></div>';
  }
  
  // 日期格子
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
  renderHabitCalendar(habitCalendarMonth);
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

// ===== v5.3 3D 梦想画册 =====
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
  // 默认预设卡片
  if (cards.length === 0) {
    cards = VISION_PRESETS.map((p, i) => ({ id: i, ...p, created: new Date().toISOString() }));
    StorageUtil.set(VISION_CARDS_KEY, cards);
  }
  el.innerHTML = cards.map(c => `
    <div class="vision-card-container" style="perspective:600px;cursor:pointer" onclick="flipVisionCard(this)">
      <div class="vision-card-inner" style="position:relative;width:100%;aspect-ratio:1;transition:transform 0.6s;transform-style:preserve-3d">
        <div style="position:absolute;inset:0;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;background:${c.color};padding:16px">
          <div style="font-size:40px;margin-bottom:8px">${c.emoji}</div>
          <div style="font-size:13px;color:white;text-align:center;font-weight:500;text-shadow:0 1px 2px rgba(0,0,0,0.1)">${c.text}</div>
        </div>
        <div style="position:absolute;inset:0;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);transform:rotateY(180deg);padding:16px">
          <div style="font-size:24px;margin-bottom:8px">✨</div>
          <div style="font-size:12px;color:white;text-align:center">这已经属于我的现实</div>
          <button onclick="event.stopPropagation();deleteVisionCard(${c.id})" style="margin-top:8px;background:rgba(255,255,255,0.3);border:none;border-radius:8px;padding:4px 12px;color:white;font-size:11px;cursor:pointer">删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function flipVisionCard(container) {
  const inner = container.querySelector('.vision-card-inner');
  const isFlipped = inner.style.transform === 'rotateY(180deg)';
  inner.style.transform = isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)';
}

function addVisionCard() {
  const input = document.getElementById('vision-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) { showToast('先写下你的愿望 ✨'); return; }
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
  cards.unshift({ id, emoji: emojis[Math.floor(Math.random()*emojis.length)], text, color: colors[Math.floor(Math.random()*colors.length)], created: new Date().toISOString() });
  if (cards.length > 12) cards.pop();
  StorageUtil.set(VISION_CARDS_KEY, cards);
  input.value = '';
  renderVisionCards();
  showToast('✨ 愿望已添加到梦想画册');
  logActivity('vision', '添加愿景: ' + text);
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

// ===== v5.3 数据 QR 码同步 =====
function generateDataQR() {
  const exportArea = document.getElementById('qr-export-area');
  const display = document.getElementById('qr-code-display');
  if (!exportArea || !display) return;
  
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cosmos_')) {
      data[key] = localStorage.getItem(key);
    }
  }
  const json = JSON.stringify(data);
  const compressed = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
  
  // 简单 QR 码模拟（文本展示 + 复制）
  const chunkSize = 800;
  const chunks = [];
  for (let i = 0; i < compressed.length; i += chunkSize) {
    chunks.push(compressed.slice(i, i + chunkSize));
  }
  
  display.innerHTML = `
    <div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px">
      <div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:48px">📲</div>
    </div>
    <div class="text-xs" style="color:var(--text-mute);word-break:break-all;max-width:200px;max-height:80px;overflow:hidden">${compressed.slice(0, 60)}...</div>
  `;
  
  window.__qrSyncData = compressed;
  exportArea.classList.remove('hidden');
  addCls('qr-import-area', 'hidden');
  showToast('同步码已生成，请用另一台设备扫描或复制');
}

function copyDataText() {
  const data = window.__qrSyncData || '';
  if (!data) { showToast('请先生成同步码'); return; }
  navigator.clipboard?.writeText(data).then(() => showToast('已复制到剪贴板')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = data;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
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
    
    // 预览导入内容
    const previewEl = document.getElementById('import-preview');
    if (previewEl) {
      const items = Object.entries(data).filter(([k]) => k.startsWith('cosmos_')).map(([k, v]) => {
        const short = k.replace('cosmos_', '');
        const size = v.length > 100 ? v.slice(0, 100) + '...' : v;
        return `<div style="padding:4px 0;font-size:12px;color:var(--text-soft)"><strong>${short}</strong>: ${size}</div>`;
      }).join('');
      previewEl.innerHTML = `<div class="text-sm mb-2" style="color:var(--theme-text)">发现 ${items.length} 项数据：</div>${items}`;
      previewEl.classList.remove('hidden');
    }
    
    // 存储待导入数据
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
      localStorage.setItem(key, value);
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
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  
  const json = JSON.stringify(data);
  const compressed = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1)));
  
  const display = document.getElementById('qr-code-display');
  if (display) {
    display.innerHTML = `
      <div style="background:white;padding:12px;border-radius:8px;margin-bottom:8px">
        <div style="width:160px;height:160px;background:linear-gradient(135deg,#D4B5C7,#B8A9C9);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:48px">📲</div>
      </div>
      <div class="text-xs" style="color:var(--text-mute);word-break:break-all;max-width:200px;max-height:80px;overflow:hidden">${compressed.slice(0, 60)}...</div>
    `;
  }
  
  window.__qrSyncData = compressed;
  remCls('qr-export-area', 'hidden');
  addCls('qr-import-area', 'hidden');
  logActivity('export', '导出数据');
  showToast(`已导出 ${checkboxes.length} 类数据`);
}

// ===== v5.4 睡梦显化引导 =====
const SATS_STEPS = [
  { title: '1. 放松身体', emoji: '🫁', desc: '从头顶到脚底，逐一放松每一块肌肉。深呼吸三次，让身体沉入床中。', tip: '吸气 4秒 → 屏息 4秒 → 呼气 6秒' },
  { title: '2. 想象场景', emoji: '🎬', desc: '不是"看"画面，而是"进入"画面，成为其中的人。想象你正在体验愿望实现的场景。', tip: '用第一人称视角，像看电影主角一样' },
  { title: '3. 感受情绪', emoji: '💖', desc: '最关键：让"已经拥有"的感觉充满全身。感受那种喜悦、满足、感恩。', tip: '情绪越强烈，显化越快' },
  { title: '4. 循环重复', emoji: '🔁', desc: '同一个场景在脑中反复播放，像循环播放一首最爱的歌。直到自然入睡。', tip: '不要改变场景，重复同一版本' },
  { title: '5. 信任过程', emoji: '✨', desc: '不需要知道"怎么做"，只需要知道"已经成"。放下控制，让宇宙接手。', tip: '带着这份感觉入睡，醒来时已在新现实' },
];

function nextSatsStep() {
  if (satsCurrentStep < SATS_STEPS.length - 1) {
    satsCurrentStep++;
    renderSatsStep();
  } else {
    // 完成引导，开始计时器
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
    { key: 'challenge_state', label: '显化挑战进度', emoji: '💪' },
    { key: 'crystalState', label: '星光水晶货币', emoji: '💎' },
    { key: 'feedback_history', label: '反馈历史', emoji: '💌' },
  ];
  
  el.innerHTML = options.map(opt => `
    <label class="flex items-center gap-3 p-3 rounded-xl cursor-pointer card-hover" style="background:rgba(255,255,255,0.5)">
      <input type="checkbox" class="export-checkbox" data-key="${opt.key}" checked style="accent-color:#D4B5C7;width:18px;height:18px">
      <div class="text-xl">${opt.emoji}</div>
      <div class="flex-1">
        <div class="text-sm font-medium" style="color:var(--theme-text)">${opt.label}</div>
        <div class="text-xs" style="color:var(--text-mute)">${localStorage.getItem('cosmos_' + opt.key) ? '有数据' : '无数据'}</div>
      </div>
    </label>
  `).join('');
}

function selectAllExport(checked) {
  document.querySelectorAll('.export-checkbox').forEach(cb => cb.checked = checked);
}

// ===== v5.5 能量体检完善 =====
function initAbout() {
  const year = new Date().getFullYear();
  const el = document.getElementById('about-content');
  if (!el) return;
  el.innerHTML = `
    <div class="glass-card p-5 mb-4 text-center">
      <div class="text-4xl mb-3">🏝️</div>
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">星愿花园</h2>
      <p class="text-sm" style="color:var(--text-soft)">Star Wish Garden — 星愿百宝箱</p>
      <div class="mt-3 inline-block px-3 py-1 rounded-full text-xs" style="background:rgba(212,181,199,0.15);color:var(--text-soft)">v6.1 星愿花园全面版</div>
    </div>
    <div class="glass-card p-5 mb-4">
      <h3 class="text-sm font-medium mb-3" style="color:var(--theme-text)">🌟 版本历程</h3>
      <div class="space-y-2 text-xs" style="color:var(--text-soft)">
        <div class="flex justify-between"><span>v1.0</span><span>星愿花园基础</span></div>
        <div class="flex justify-between"><span>v2.0</span><span>花园、星愿、日记</span></div>
        <div class="flex justify-between"><span>v3.0</span><span>智慧花园、星辰塔罗、星辰社区</span></div>
        <div class="flex justify-between"><span>v3.5</span><span>音频冥想引导系统</span></div>
        <div class="flex justify-between"><span>v4.0</span><span>21天显化蜕变</span></div>
        <div class="flex justify-between"><span>v5.0</span><span>PWA、显化教练系统、星光会员</span></div>
        <div class="flex justify-between"><span>v5.1</span><span>呼吸法、语音祈愿、睡眠</span></div>
        <div class="flex justify-between"><span>v5.2</span><span>情绪图表、习惯日历</span></div>
        <div class="flex justify-between"><span>v5.3</span><span>页面转场、3D彩蛋、二维码同步</span></div>
        <div class="flex justify-between"><span>v5.4</span><span>星光徽章系统</span></div>
        <div class="flex justify-between"><span>v5.5</span><span>能量体检完善、显化旅程、能量清理</span></div>
        <div class="flex justify-between"><span>v6.0</span><span>369显化法、55x5显化法、宇宙回音簿、Focus Wheel</span></div>
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
        星愿花园基于内维尔·戈达德的"意识创造现实"理论构建。我们相信：当你能在想象中清晰感受愿望已实现的喜悦，并在睡前（State Akin to Sleep, SATS）沉浸于这种感受，你的潜意识会接受这个「已完成的版本」为真实，外在现实必将与之匹配。
      </p>
    </div>
    <div class="text-center text-xs mt-6 mb-4" style="color:var(--text-mute)">© ${year} 星愿花园 · 所有数据本地存储，保护隐私</div>
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
    { name: '触屏/指针事件', test: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0 },
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
      <h2 class="text-xl font-medium mb-1" style="font-family:'ZCOOL XiaoWei',sans-serif">显化旅程</h2>
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
  localStorage.removeItem('cosmos_island_welcomed_v3');
  showToast('🗑️ 所有数据已重置');
  setTimeout(() => location.reload(), 1500);
}

// ==================== 三六九书写咒 ====================
function get369State() {
  return StorageUtil.get('cosmos_369_state', { affirmation: '', cycleLength: 21, cycleStart: '', records: {}, streak: 0 });
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
  return StorageUtil.get('cosmos_55x5_state', { affirmation: '', currentDay: 1, dailyCount: 0, records: {}, completedChallenges: [] });
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
    <button onclick="if(confirm('确定放弃当前显化挑战？')) { save55x5State({ affirmation: '', currentDay: 1, dailyCount: 0, records: {}, completedChallenges: state.completedChallenges }); render55x5(); showToast('已放弃显化挑战'); }" class="w-full py-2 rounded-lg text-sm" style="background:rgba(232,160,160,0.2); color:#E8A0A0">放弃当前显化挑战</button>
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
  return StorageUtil.get('cosmos_signs_state', { signs: [] });
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
  const category = document.getElementById('sign-category').value;
  const text = document.getElementById('sign-text').value.trim();
  const intensity = parseInt(document.getElementById('sign-intensity').value);
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
  return StorageUtil.get('cosmos_wheel_state', { wheels: [], currentWheel: null });
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
  return StorageUtil.get('cosmos_68sec_state', { records: [] });
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

// ==================== v6.1 宇宙钱包 ====================
function getProsperityState() {
  return StorageUtil.get('cosmos_prosperity_state', { day: 1, records: [] });
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

// ==================== v6.1 心情罗盘导航器 ====================
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
  return StorageUtil.get('cosmos_emoscale_state', { history: [], currentLevel: 7 });
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
    <div class="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer card-hover ${state.currentLevel === e.level ? 'ring-2' : ''}" style="background:${e.color}15; ${state.currentLevel === e.level ? 'ring-color:'+e.color : ''}" onclick="selectEmoLevel(${e.level})">
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
      { title: '💤 睡眠故事', desc: '听一段引导睡眠的显化故事，放松身心', action: "showPage('sleep');initSleep()" },
      { title: '🌬️ 静心呼吸', desc: '4-7-8呼吸法，快速平复情绪', action: "showPage('breathe');initBreathe()" }
    ];
  } else if (level <= 6) {
    return [
      { title: '📝 五五五显化咒', desc: '5天集中书写，重建信念', action: "showPage('55x5');init55x5()" },
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

// ==================== v6.1 枕边蜜语 ====================
function getPillowState() {
  return StorageUtil.get('cosmos_pillow_state', { currentWish: '', history: [] });
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
      <p class="text-sm mb-5" style="color:var(--theme-text); opacity:0.6">写下你的愿望或肯定语，放在枕头下入睡。让潜意识在睡眠中吸收这个意图，是最古老的显化方法之一。</p>
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



// ==================== v6.2 放手仪式 (Placemat Process) ====================
function getPlacematState() {
  return StorageUtil.get('cosmos_placemat_state', { myTasks: [], universeTasks: [], history: [] });
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
  const state = getPlacematState();
  if (side === 'my') state.myTasks.push(text);
  else state.universeTasks.push(text);
  savePlacematState(state);
  input.value = '';
  renderPlacemat();
}

function deletePlacematTask(side, idx) {
  const state = getPlacematState();
  if (side === 'my') state.myTasks.splice(idx, 1);
  else state.universeTasks.splice(idx, 1);
  savePlacematState(state);
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

// ==================== v6.2 旧故事翻篇 (I Remember When) ====================
function getRememberState() {
  return StorageUtil.get('cosmos_remember_state', { memories: [] });
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

// ==================== v6.2 心愿宝盒 (Magical Creation Box) ====================
function getCreationBoxState() {
  return StorageUtil.get('cosmos_creationbox_state', { items: [] });
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

// ==================== v6.2 感恩风暴 (Rampage of Appreciation) ====================
function getRampageState() {
  return StorageUtil.get('cosmos_rampage_state', { rampages: [] });
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
      <input type="range" id="rampage-before" min="1" max="10" value="5" class="w-full mb-3" oninput="document.getElementById('rampage-before-val').textContent=this.value">
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
  document.getElementById('rampage-input').value = '';
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

// ==================== v6.3 显化百宝箱 ====================
function getTreasureBoxState() {
  return StorageUtil.get('cosmos_treasurebox_state', { tried: {}, favorites: [], notes: {} });
}
function saveTreasureBoxState(state) { StorageUtil.set('cosmos_treasurebox_state', state); }

const TREASURE_TOOLS = [
  {
    id: 'twocup', category: '快速显化', emoji: '🥛',
    title: '两杯水魔法', desc: '两个杯子，一个代表现在的你，一个代表未来的你。将水从「现在」倒入「未来」，象征能量转移。',
    steps: ['拿两个杯子，一个贴「现在的我」，一个贴「未来的我」', '在「现在的我」杯子里装满水', '想象你的愿望已经实现', '将水倒入「未来的我」杯子', '喝下水，感受能量转移'],
    affirmation: '我已经从现在的现实跳到了我想要的现实。'
  },
  {
    id: '17sec', category: '快速显化', emoji: '✨',
    title: '17秒魔法', desc: 'Abraham-Hicks 教导：17秒纯专注的念头开始吸引同类思想。',
    steps: ['选择一个愿望', '闭上眼睛，专注17秒', '感受愿望已实现的喜悦', '放手，信任宇宙'], 
    affirmation: '17秒的专注，足以改变我的现实。'
  },
  {
    id: 'wishcandle', category: '快速显化', emoji: '🕯️',
    title: '许愿蜡烛', desc: '点燃蜡烛，凝视火焰，将你的愿望注入火焰中，让烟雾将你的愿望带到宇宙。',
    steps: ['点燃一支蜡烛', '凝视火焰30秒', '在心中说出你的愿望', '想象烟雾带着愿望上升', '感恩并吹灭蜡烛'],
    affirmation: '我的愿望随着烟雾，被宇宙接收。'
  },
  {
    id: 'wishbottle', category: '快速显化', emoji: '🫙',
    title: '许愿瓶', desc: '将愿望写在纸条上放入瓶中，满月时打开释放能量。',
    steps: ['写下愿望纸条', '放入漂亮的瓶子中', '满月时打开瓶子', '读纸条，然后烧掉或释放', '感谢宇宙'],
    affirmation: '我的愿望在瓶中酝酿，等待最完美的时机。'
  },
  {
    id: 'crystal', category: '能量疗愈', emoji: '💎',
    title: '水晶能量', desc: '不同水晶对应不同显化领域：紫水晶（灵性）、黄水晶（财富）、粉晶（爱情）、黑曜石（保护）。',
    steps: ['选择对应愿望的水晶', '净化水晶（流水或月光）', '握在手中，注入意图', '放在枕头下或随身携带', '定期感恩水晶'],
    affirmation: '水晶的能量放大我的星愿。'
  },
  {
    id: 'chakra', category: '能量疗愈', emoji: '🌈',
    title: '脉轮冥想', desc: '七大脉轮对应不同生命领域。平衡脉轮，平衡生活。',
    steps: ['从海底轮开始，逐一观想', '每个脉轮用对应颜色光球', '旋转光球，感受能量流动', '从海底轮到顶轮，一气呵成', '感受全身能量畅通'],
    affirmation: '我的脉轮如同彩虹，绽放光芒。'
  },
  {
    id: 'moon', category: '能量疗愈', emoji: '🌙',
    title: '月亮仪式', desc: '新月许愿，满月释放。月亮周期是女性能量的象征。',
    steps: ['新月：写下新愿望', '上弦月：为愿望行动', '满月：感恩已实现的，释放未实现的', '下弦月：清理能量，准备新周期'],
    affirmation: '月亮的周期，是我显化的节奏。'
  },
  {
    id: 'energyspray', category: '能量疗愈', emoji: '💨',
    title: '能量清理喷雾', desc: '想象金色光雾从你手中喷出，清理空间中的负面能量。',
    steps: ['双手合十，搓热', '想象金色光雾从掌心涌出', '在空间中喷洒', '感受空间变得明亮清新', '设立能量保护边界'],
    affirmation: '金色光雾清理一切，只留下爱与光。'
  },
  {
    id: 'reiki', category: '能量疗愈', emoji: '👐',
    title: '灵气疗愈', desc: '双手悬停，想象疗愈能量从掌心流出，疗愈自己或他人。',
    steps: ['双手搓热', '悬停在身体上方', '想象温暖的能量流入', '感受脉动或温暖', '感恩能量'],
    affirmation: '我的双手是宇宙能量的通道。'
  },
  {
    id: 'beliefdig', category: '心智翻转', emoji: '🔍',
    title: '信念挖掘', desc: '找出阻碍你的深层限制性信念，将其转化为支持性信念。',
    steps: ['写下你想显化的愿望', '问：为什么我觉得这不可能？', '继续问：为什么？直到找到根源', '将根源信念改写为积极版本', '重复新信念直到相信'],
    affirmation: '旧信念已被我发现，新信念正在生长。'
  },
  {
    id: 'fearrelease', category: '心智翻转', emoji: '🔥',
    title: '恐惧释放', desc: '将恐惧写在纸上，然后安全地烧掉或撕碎，象征释放。',
    steps: ['写下所有恐惧', '读一遍，感受它们', '然后撕碎或烧掉', '想象恐惧化为灰烬', '深呼吸，感受自由'],
    affirmation: '我的恐惧已化为灰烬，只留下勇气。'
  },
  {
    id: 'scarcity', category: '心智翻转', emoji: '🌊',
    title: '匮乏转化', desc: '将「我没有」转化为「我允许」。匮乏感是显化的最大障碍。',
    steps: ['列出你觉得匮乏的3件事', '改写为「我允许宇宙送我...」', '感受允许而非追求的轻松', '感恩已经拥有的', '信任宇宙会补充'],
    affirmation: '我不需要追求，我只需要允许。'
  },
  {
    id: 'abundance', category: '心智翻转', emoji: '💰',
    title: '丰盛心态', desc: '感受已经拥有的丰盛，而不是缺少的匮乏。',
    steps: ['列出你已经拥有的10件美好事物', '感受每一件带来的喜悦', '告诉自己：我已经足够丰盛', '从丰盛感出发去显化更多', '每天重复'],
    affirmation: '我是丰盛的源头，丰盛流向我。'
  },
  {
    id: 'perfectday', category: '心智翻转', emoji: '☀️',
    title: '完美一天可视化', desc: '想象你理想的一天的每个细节，从醒来到入睡。',
    steps: ['闭上眼睛', '想象醒来时的感觉', '想象早晨的例行活动', '想象工作/创造的时刻', '想象晚上的放松和睡眠', '感受一整天的喜悦'],
    affirmation: '我的完美一天，已经在某个现实中发生。'
  },
  {
    id: 'energyanchor', category: '身体显化', emoji: '⚓',
    title: '能量锚定', desc: '用特定的身体姿势锚定高振动状态，需要时调用。',
    steps: ['选择一个高振动时刻', '做出一个特定的姿势（如双手放胸口）', '深呼吸，感受那个状态', '重复3次，建立神经链接', '需要时做出这个姿势，立即提升'],
    affirmation: '我的身体记住高振动，随时可以调用。'
  },
  {
    id: 'bodyscan', category: '身体显化', emoji: '🔮',
    title: '身体能量扫描', desc: '从头顶到脚底，感受能量流动，发现堵塞并清理。',
    steps: ['躺下或坐直', '从头顶开始，感受能量', '缓慢向下移动注意力', '发现紧张或堵塞处', '用金色光清理堵塞', '感受全身畅通'],
    affirmation: '我的身体是能量的完美通道。'
  },
  {
    id: 'dance', category: '身体显化', emoji: '💃',
    title: '舞动显化', desc: '通过舞蹈或运动注入意图，让身体成为显化的工具。',
    steps: ['选择一首让你兴奋的音乐', '想象你的愿望已经实现', '用身体表达那种喜悦', '舞动中重复肯定语', '结束时感恩'],
    affirmation: '我的身体是星愿的舞者。'
  },
  {
    id: 'mudra', category: '身体显化', emoji: '🤲',
    title: '能量手印', desc: '特定手势引导能量流动。每个手印对应不同的意图。',
    steps: ['选择对应意图的手印', '双手合十，保持手印', '闭上眼睛，深呼吸', '感受掌心的能量', '保持3-5分钟'],
    affirmation: '我的手印，是宇宙能量的开关。'
  },
  {
    id: 'synchro', category: '宇宙连接', emoji: '🔗',
    title: '同步性解读', desc: '记录生活中的巧合，它们是宇宙给你的信号。',
    steps: ['准备一个同步性记录本', '当遇到巧合时记录', '问：这个巧合想告诉我什么？', '寻找模式和主题', '感谢宇宙的指引'],
    affirmation: '每一个巧合，都是宇宙给我的情书。'
  },
  {
    id: 'angelnum', category: '宇宙连接', emoji: '👼',
    title: '天使数字', desc: '111（新开始）、222（平衡）、333（保护）、444（天使同在）、555（变化）、666（回归内在）、777（幸运）、888（丰盛）、999（完成）。',
    steps: ['注意重复出现的数字', '查询数字含义', '思考数字与你当前生活的关联', '感谢天使的讯息', '按照指引行动'],
    affirmation: '天使数字是宇宙给我发的短信。'
  },
  {
    id: 'dream', category: '宇宙连接', emoji: '🌌',
    title: '梦境解析', desc: '梦境是潜意识的语言。记录并解析梦境，寻找显化线索。',
    steps: ['睡前设定意图：记住梦境', '醒来立即记录', '寻找梦境中的象征', '问：这个梦在告诉我什么？', '将启示应用到现实'],
    affirmation: '我的梦境是潜意识的花园，开满智慧之花。'
  },
  {
    id: 'intuition', category: '宇宙连接', emoji: '💫',
    title: '直觉训练', desc: '跟随第一直觉，无论它多么不合逻辑。直觉是宇宙的直接频道。',
    steps: ['每天做一个小的直觉测试', '比如：选择走哪条路', '记录直觉告诉你的', '记录结果是否准确', '逐渐信任并放大直觉'],
    affirmation: '我的直觉是宇宙给我的直接频道。'
  },
  {
    id: 'highself', category: '宇宙连接', emoji: '✨',
    title: '高我连接', desc: '与你的高我（更高版本的自己）对话，获得指导和答案。',
    steps: ['闭上眼睛，深呼吸', '想象你的高我坐在对面', '向高我提问', '等待答案浮现（可能是画面、感觉或话语）', '感谢高我的指导'],
    affirmation: '我的高我，永远在我身边，给我最完美的指引。'
  },
  {
    id: 'quantum', category: '高阶显化', emoji: '🌀',
    title: '量子跳跃', desc: '想象你已经跳到了平行现实中，那里你的愿望已经实现。',
    steps: ['闭上眼睛', '想象两个版本的现实', '在现在的现实和愿望实现之间', '跳跃！', '感受新的现实'],
    affirmation: '我轻轻一跨，就跳到了我想要的现实。'
  },
  {
    id: 'timeline', category: '高阶显化', emoji: '⏳',
    title: '时间线疗愈', desc: '回到过去的时间线，疗愈创伤，改变现在的现实。',
    steps: ['想象一条时间线', '找到需要疗愈的时刻', '带着现在的智慧回到过去', '疗愈那个时刻', '感受时间线改变'],
    affirmation: '过去已被疗愈，现在已是新的现实。'
  },
  {
    id: 'soulmission', category: '高阶显化', emoji: '🔮',
    title: '灵魂使命', desc: '发现你的人生目的。当你与灵魂使命对齐，显化变得毫不费力。',
    steps: ['问：什么事情让我忘记时间？', '问：什么是我从小就热爱的？', '问：世界需要我提供什么？', '将答案组合，找到使命', '每天向使命靠近一小步'],
    affirmation: '我的人生使命，是宇宙给我最美的礼物。'
  },
  {
    id: 'vortex', category: '高阶显化', emoji: '🌪️',
    title: '能量漩涡', desc: '创造个人能量漩涡，吸引你想要的一切。',
    steps: ['站立，双脚分开', '想象能量从地面涌入', '在头顶形成漩涡', '漩涡吸引你想要的一切', '感受能量旋转'],
    affirmation: '我是能量漩涡的中心，吸引一切美好。'
  },
  {
    id: 'portal', category: '高阶显化', emoji: '🚪',
    title: '显化门户', desc: '想象一扇门，门后就是你愿望实现的现实。打开门，走进去。',
    steps: ['想象一扇华丽的门', '门后是你要的现实', '感受门后的能量', '推开门，走进去', '感受新现实的一切'],
    affirmation: '我推开显化之门，走进我的新现实。'
  },
  {
    id: 'soulmate', category: '关系显化', emoji: '💕',
    title: '灵魂伴侣', desc: '吸引灵魂伴侣的完整练习。',
    steps: ['先成为自己想要吸引的人', '列出灵魂伴侣的品质', '每天视觉化相遇的场景', '感受在一起的喜悦', '放手，让宇宙安排'],
    affirmation: '我的灵魂伴侣，也在寻找我。'
  },
  {
    id: 'selflove', category: '关系显化', emoji: '🌸',
    title: '自爱花园', desc: '先爱自己，才能吸引真爱。',
    steps: ['每天对镜子说：我爱你', '列出你爱自己的10个理由', '为自己做一件美好的事', '原谅过去的自己', '成为自己最好的朋友'],
    affirmation: '我是自己最爱的人，也是最爱自己的人。'
  },
  {
    id: 'relationfix', category: '关系显化', emoji: '🌉',
    title: '关系修复', desc: '在想象中修复任何关系，外在现实会随之改变。',
    steps: ['想象那个人坐在你面前', '说出你想说的话', '想象对方的回应是完美的', '感受关系的和谐', '感谢这个修复'],
    affirmation: '所有关系都在我的想象中完美修复。'
  },
  {
    id: 'socialmagnet', category: '关系显化', emoji: '💫',
    title: '社交磁场', desc: '成为人群中的能量磁场，吸引志同道合的人。',
    steps: ['进入社交场合前，想象自己发光', '感受自己是爱的源头', '对每个人微笑（内心）', '分享你的光芒', '吸引同频的人'],
    affirmation: '我是社交场合中最温暖的光芒。'
  },
  {
    id: 'moneymagnet', category: '财富显化', emoji: '🧲',
    title: '金钱磁铁', desc: '成为吸引金钱的磁铁。',
    steps: ['想象自己是一块磁铁', '金钱像铁屑一样被你吸引', '感受磁铁的吸引力', '相信金钱喜欢你', '感恩已拥有的金钱'],
    affirmation: '我是金钱磁铁，金钱从四面八方流向我。'
  },
  {
    id: 'check', category: '财富显化', emoji: '💵',
    title: '丰盛支票', desc: '写一张给未来的自己的支票，设定日期和金额。',
    steps: ['写一张支票（虚拟或真实）', '日期：未来某一天', '收款人：你自己', '金额：你想要的数额', '每天看一次，感受已经拥有'],
    affirmation: '这张支票，是宇宙给我的承诺。'
  },
  {
    id: 'wealthmap', category: '财富显化', emoji: '🗺️',
    title: '财富蓝图', desc: '绘制你的理想财富地图，包括收入来源、生活方式等。',
    steps: ['拿一张大纸', '画下你的理想财富图景', '包括所有细节：房子、车子、旅行', '每天看，每天完善', '感受已经生活在其中'],
    affirmation: '我的财富蓝图，正在现实中展开。'
  },
  {
    id: 'perfecthealth', category: '健康显化', emoji: '✨',
    title: '完美健康', desc: '可视化身体的每个细胞都在完美运作。',
    steps: ['闭上眼睛', '想象身体发出金色光芒', '每个细胞都在欢快地跳舞', '感受无限活力', '感谢身体的智慧'],
    affirmation: '我的身体是完美的，每个细胞都在欢笑。'
  },
  {
    id: 'celldialog', category: '健康显化', emoji: '🔬',
    title: '细胞对话', desc: '与身体的细胞对话，请求它们恢复完美状态。',
    steps: ['将手放在需要疗愈的部位', '对细胞说：我爱你，请恢复完美', '想象细胞在响应', '感受疗愈正在进行', '感谢身体'],
    affirmation: '我的身体智慧无穷，正在自我修复。'
  },
  {
    id: 'natureheal', category: '健康显化', emoji: '🌿',
    title: '自然疗愈', desc: '利用自然元素的疗愈力量：阳光、空气、水、大地。',
    steps: ['赤脚站在大地上（接地）', '感受阳光温暖', '深呼吸新鲜空气', '喝水，想象水清理身体', '感受四元素的能量'],
    affirmation: '自然四元素在疗愈我的身体。'
  },
  {
    id: 'healthmap', category: '健康显化', emoji: '💪',
    title: '健康蓝图', desc: '绘制理想健康状态，包括身体、能量、情绪。',
    steps: ['画一个自己的身体轮廓', '在每个部位标注理想状态', '用颜色标注能量流动', '每天看，每天完善', '感受健康蓝图在实现'],
    affirmation: '我的健康蓝图，正在变成现实。'
  },
  {
    id: 'dailyintention', category: '日常仪式', emoji: '🌅',
    title: '每日意图', desc: '每天早晨设定一个意图，引导一天的方向。',
    steps: ['醒来第一件事：深呼吸', '问：今天我要体验什么？', '设定一个意图', '一天中重复这个意图', '晚上回顾'],
    affirmation: '我的每日意图，是宇宙给我的一天主题。'
  },
  {
    id: 'affirmwater', category: '日常仪式', emoji: '💧',
    title: '肯定语瀑布', desc: '连续快速说出肯定语，如同瀑布倾泻。',
    steps: ['设定5分钟计时', '尽可能快速说肯定语', '不要停顿，不要思考', '让肯定语如瀑布般倾泻', '感受能量飙升'],
    affirmation: '我的肯定语如瀑布，冲刷所有限制。'
  },
  {
    id: 'universeorder', category: '日常仪式', emoji: '📦',
    title: '宇宙订购', desc: '像点外卖一样向宇宙下单，然后放手等待。',
    steps: ['想象宇宙是一个巨大的外卖平台', '选择你的「餐点」（愿望）', '下单，写上详细要求', '放手，等待「送达」', '收到时给好评（感恩）'],
    affirmation: '我已经向宇宙下单，现在只需等待送达。'
  },
  {
    id: 'energyhandshake', category: '日常仪式', emoji: '🤝',
    title: '能量握手', desc: '与宇宙握手，建立能量连接。',
    steps: ['伸出右手', '想象宇宙也在伸出手', '握手！感受能量交换', '感受宇宙的支持和力量', '感谢这次握手'],
    affirmation: '我和宇宙握手，建立了永久的能量契约。'
  },
];

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
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">显化百宝箱</h2>
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">40+ 星愿方法，像选仙女裙一样挑选适合你的显化工具。每个工具都附有步骤和肯定语，让你轻松开启显化之旅。</p>
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

// ==================== v6.4 愿望时光机 ====================
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
      <p class="text-sm mb-4" style="color:var(--theme-text); opacity:0.6">回顾你的显化旅程，每一个愿望都是一颗星星</p>
      <div class="flex justify-center gap-4">
        <div class="text-center">
          <div class="text-2xl font-medium" style="color:var(--theme-accent)">${wishes.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">总愿望</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-medium" style="color:var(--theme-accent)">${manifested.length}</div>
          <div class="text-xs" style="color:var(--text-soft)">已显化</div>
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
        <button onclick="showPage('wishwall');initWishStarDrag()" class="btn-primary mt-3 px-4 py-2 rounded-xl text-sm">去许愿墙许愿</button>
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
  showToast(state.wishes[index].done ? '⭐ 愿望已标记为显化成功！' : '已取消标记');
  if (state.wishes[index].done) {
    logActivity('timeline', 'manifest');
    checkBadges();
  }
}

// ==================== v6.4 显化数据报告 ====================
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
      <h2 class="font-display text-lg mb-2" style="color:var(--theme-text)">显化数据报告</h2>
      <p class="text-sm" style="color:var(--theme-text); opacity:0.6">你的显化旅程数据一览</p>
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
          <div class="text-xs" style="color:var(--text-soft)">已显化</div>
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

// ==================== v6.4 语音肯定语循环播放器 ====================
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

// 初始化应用（确保所有 Block 3 函数已定义）
init();


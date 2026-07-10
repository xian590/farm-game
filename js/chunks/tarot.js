// 星愿花园 - 塔罗模块 (动态加载 chunk)
// Auto-extracted from app.js


let tarotCat = 'guide';
let tarotSpread = 'single';
let tarotDrawn = false;
let tarotThreeResult = [];

function selectTarotSpread(spread) {
  tarotSpread = spread;
  tarotDrawn = false;
  
  const s = document.getElementById('spread-single');
  const t = document.getElementById('spread-three');
  if (spread === 'single') {
    s.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
    s.style.color = 'white';
    t.style.background = 'rgba(184,169,201,0.1)';
    t.style.color = '';
    setText('tarot-draw-hint', '点击牌背抽一张牌');
    const tarotCardsContainer = document.getElementById('tarot-cards-container');
    if (tarotCardsContainer) tarotCardsContainer.innerHTML = `
      <div class="w-32 h-44 mx-auto rounded-xl flex items-center justify-center text-4xl cursor-pointer card-hover transition-transform hover:scale-105"
        onclick="drawTarot()" id="tarot-card-back"
        style="background:linear-gradient(135deg, #5D4E6D, #3D3258); box-shadow:0 10px 30px rgba(93,78,109,0.4); border:2px solid #B8A9C9;">
        ✨
      </div>
    `;
  } else {
    t.style.background = 'linear-gradient(135deg, #D4B5C7, #B8A9C9)';
    t.style.color = 'white';
    s.style.background = 'rgba(184,169,201,0.1)';
    s.style.color = '';
    setText('tarot-draw-hint', '点击牌背抽三张牌（过去·现在·未来）');
    const tarotCardsContainer2 = document.getElementById('tarot-cards-container');
    if (tarotCardsContainer2) tarotCardsContainer2.innerHTML = `
      <div class="flex justify-center gap-2">
        <div class="w-20 h-28 sm:w-24 sm:h-32 rounded-xl flex items-center justify-center text-2xl cursor-pointer card-hover transition-transform hover:scale-105"
          onclick="drawTarot()"
          style="background:linear-gradient(135deg, #5D4E6D, #3D3258); box-shadow:0 6px 20px rgba(93,78,109,0.4); border:2px solid #B8A9C9;">
          ✨
        </div>
        <div class="w-20 h-28 sm:w-24 sm:h-32 rounded-xl flex items-center justify-center text-2xl cursor-pointer card-hover transition-transform hover:scale-105"
          onclick="drawTarot()"
          style="background:linear-gradient(135deg, #5D4E6D, #3D3258); box-shadow:0 6px 20px rgba(93,78,109,0.4); border:2px solid #B8A9C9; transform:translateY(-8px)">
          ✨
        </div>
        <div class="w-20 h-28 sm:w-24 sm:h-32 rounded-xl flex items-center justify-center text-2xl cursor-pointer card-hover transition-transform hover:scale-105"
          onclick="drawTarot()"
          style="background:linear-gradient(135deg, #5D4E6D, #3D3258); box-shadow:0 6px 20px rgba(93,78,109,0.4); border:2px solid #B8A9C9;">
          ✨
        </div>
      </div>
    `;
  }
  
  remCls('tarot-draw-area', 'hidden');
  addCls('tarot-result', 'hidden');
  toggleCls('tarot-single-result', 'hidden', spread !== 'single');
  toggleCls('tarot-three-result', 'hidden', spread !== 'three');
  
  playSound('ding');
}

function selectTarotCat(cat) {
  tarotCat = cat;
  document.querySelectorAll('.tarot-cat').forEach((b, i) => {
    const cats = ['love', 'career', 'emotion', 'guide'];
    if (cats[i] === cat) {
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

function drawTarot() {
  if (tarotDrawn) return;
  tarotDrawn = true;
  
  playSound('chime');
  
  if (tarotSpread === 'single') {
    drawSingleTarot();
  } else {
    drawThreeTarot();
  }
}

function drawSingleTarot() {
  const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
  const isReversed = Math.random() > 0.5;
  
  // 翻牌动画
  const cardBack = document.getElementById('tarot-card-back');
  if (cardBack) {
    cardBack.style.transform = 'rotateY(90deg)';
    cardBack.style.transition = 'transform 0.4s';
  }
  
  setTimeout(() => {
    addCls('tarot-draw-area', 'hidden');
    remCls('tarot-result', 'hidden');
    remCls('tarot-single-result', 'hidden');
    addCls('tarot-three-result', 'hidden');
    
    setText('tarot-card-name', (isReversed ? '逆位 · ' : '正位 · ') + card.name);
    setText('tarot-card-pos', isReversed ? '逆位 REVERSED' : '正位 UPRIGHT');
    setText('tarot-card-front', card.emoji);
    setStyle('tarot-card-front', 'transform', isReversed ? 'rotate(180deg)' : '');
    
    const catNames = { love: '💖 感情', career: '💼 事业', emotion: '🧘 情绪', guide: '🌟 今日指引' };
    const sceneKey = isReversed ? 'reversed' : 'upright';
    const sceneText = card.scenes && card.scenes[sceneKey] && card.scenes[sceneKey][tarotCat]
      ? card.scenes[sceneKey][tarotCat]
      : (isReversed ? card.reversedMeaning : card.meaning);
    const generalMeaning = isReversed ? card.reversedMeaning : card.meaning;
    const advice = isReversed ? card.reversedAdvice : card.advice;
    
    setHTML('tarot-meaning', `
      <div class="mb-3">
        <div class="text-xs font-medium mb-2" style="color:#B8A9C9">📖 通用牌意</div>
        <div class="leading-relaxed">${generalMeaning}</div>
      </div>
      <div class="border-t pt-3" style="border-color:rgba(184,169,201,0.15)">
        <div class="text-xs font-medium mb-2" style="color:#D4A5B8">${catNames[tarotCat]} · 专属解读</div>
        <div class="leading-relaxed">${sceneText}</div>
      </div>
    `);
    setHTML('tarot-advice', advice);
    
    triggerConfetti();
  }, 400);
}

function drawThreeTarot() {
  // 抽3张不重复的牌
  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
  const cards = shuffled.slice(0, 3).map(c => ({
    ...c,
    reversed: Math.random() > 0.6,
  }));
  tarotThreeResult = cards;
  
  const positions = ['过去', '现在', '未来'];
  const posDesc = ['代表过去的能量和经历，是事情的根源', '代表当下的状态和你现在的处境', '代表未来的走向和可能的结果'];
  
  // 翻牌动画
  setTimeout(() => {
    addCls('tarot-draw-area', 'hidden');
    remCls('tarot-result', 'hidden');
    addCls('tarot-single-result', 'hidden');
    remCls('tarot-three-result', 'hidden');
    
    // 三张牌展示
    const threeCardsDisplay = document.getElementById('three-cards-display');
    if (threeCardsDisplay) threeCardsDisplay.innerHTML = cards.map((c, i) => `
      <div class="text-center">
        <div class="w-20 h-28 sm:w-24 sm:h-32 mx-auto rounded-xl flex items-center justify-center text-3xl mb-1"
          style="background:linear-gradient(135deg, #F5E1EA, #E8DEEF); box-shadow:0 4px 16px rgba(184,169,201,0.3); border:2px solid #D4B5C7; transform:${c.reversed ? 'rotate(180deg)' : ''};">
          ${c.emoji}
        </div>
        <div class="text-[10px] font-medium" style="color:var(--theme-text)">${positions[i]}</div>
        <div class="text-[9px]" style="color:var(--theme-text); opacity:0.5">${c.reversed ? '逆位' : '正位'} · ${c.name}</div>
      </div>
    `).join('');
    
    // 详细解读
    const catNames = { love: '感情', career: '事业', emotion: '情绪', guide: '今日指引' };
    const threeCardsDetail = document.getElementById('three-cards-detail');
    if (threeCardsDetail) threeCardsDetail.innerHTML = cards.map((c, i) => {
      const sceneKey = c.reversed ? 'reversed' : 'upright';
      const sceneText = c.scenes && c.scenes[sceneKey] && c.scenes[sceneKey][tarotCat]
        ? c.scenes[sceneKey][tarotCat]
        : (c.reversed ? c.reversedMeaning : c.meaning);
      const posText = c.positionInterpretation ? c.positionInterpretation[['past','present','future'][i]] : '';
      return `
        <div class="p-4 rounded-2xl" style="background:rgba(184,169,201,0.08); border:1px solid rgba(184,169,201,0.1)">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0" 
              style="background:linear-gradient(135deg, #F5E1EA, #E8DEEF); border:1.5px solid #D4B5C7; transform:${c.reversed ? 'rotate(180deg)' : ''};">
              ${c.emoji}
            </div>
            <div class="min-w-0">
              <div class="font-title text-sm" style="color:var(--theme-text)">${positions[i]} · ${c.reversed ? '逆位' : '正位'}${c.name}</div>
              <div class="text-[10px] mt-0.5" style="color:var(--theme-text); opacity:0.5">关键词：${c.keyword}</div>
            </div>
          </div>
          ${posText ? `
          <div class="mb-3 p-2.5 rounded-xl" style="background:rgba(240,213,224,0.12)">
            <div class="text-[10px] font-medium mb-1" style="color:#B8859C">📍 ${positions[i]}位置解读</div>
            <div class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.8">${posText}</div>
          </div>
          ` : ''}
          <div>
            <div class="text-[10px] font-medium mb-1.5" style="color:#8B7E9C">💫 ${catNames[tarotCat]}解读</div>
            <div class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.8">
              ${sceneText}
            </div>
          </div>
        </div>
      `;
    }).join('') + `
      <div class="p-4 rounded-2xl" style="background:linear-gradient(135deg, rgba(245,230,200,0.25), rgba(240,213,224,0.15)); border:1px solid rgba(245,230,200,0.3)">
        <div class="font-title text-sm mb-2" style="color:#B8955A">💫 综合能量解读</div>
        <div class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.85">
          ${generateThreeCardAdvice(cards)}
        </div>
      </div>
    `;
    
    triggerConfetti();
  }, 500);
}

function generateThreeCardAdvice(cards) {
  if (!cards || cards.length < 3) return '牌数不足，无法生成综合解读。';
  const keyThemes = cards.map(c => c.keyword).join('、');
  return `这三张牌串起了你的能量流动：从「${cards[0].name}」的过去能量，走到「${cards[1].name}」的当下状态，再走向「${cards[2].name}」的未来可能。整体来看，${cards[2].reversed ? '未来还有一些需要调整的地方' : '未来的走向是积极的'}。重点关注当下的「${cards[1].name}」这张牌给你的提示——它是连接过去和未来的桥梁。${cards[1].advice ? cards[1].advice.slice(0, 50) : ''}... 相信你的直觉，一步一步来，一切都会越来越好的 ✨`;
}

function resetTarot() {
  tarotDrawn = false;
  remCls('tarot-draw-area', 'hidden');
  addCls('tarot-result', 'hidden');
  const cardBack = document.getElementById('tarot-card-back');
  if (cardBack) cardBack.style.transform = '';
  playSound('page');
}

function renderTarot() {
  selectTarotCat(tarotCat);
  selectTarotSpread(tarotSpread);
  tarotDrawn = false;
  remCls('tarot-draw-area', 'hidden');
  addCls('tarot-result', 'hidden');
}

// Mount functions to window for HTML onclick compatibility
window.selectTarotSpread = selectTarotSpread;
window.selectTarotCat = selectTarotCat;
window.drawTarot = drawTarot;
window.drawSingleTarot = drawSingleTarot;
window.drawThreeTarot = drawThreeTarot;
window.generateThreeCardAdvice = generateThreeCardAdvice;
window.resetTarot = resetTarot;
window.renderTarot = renderTarot;

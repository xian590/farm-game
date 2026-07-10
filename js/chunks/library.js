// 星愿花园 - 宇宙智慧花园模块 (动态加载 chunk)
// Auto-extracted from app.js

//  宇宙智慧花园
// ============================================================

let currentLibTab = 'course';
let currentMediaTab = 'movies';

function renderLibrary() {
  renderCourses();
  renderBookshelf();
  renderMethodsList();
  renderGuides();
  renderLibPlansList();
  renderMedia();
}

function switchLibTab(tab, btn) {
  document.querySelectorAll('#page-library .tab-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentLibTab = tab;
  const courseEl = document.getElementById('lib-course');
  const booksEl = document.getElementById('lib-books');
  const methodsEl = document.getElementById('lib-methods');
  if (courseEl) courseEl.classList.toggle('hidden', tab !== 'course');
  if (booksEl) booksEl.classList.toggle('hidden', tab !== 'books');
  if (methodsEl) methodsEl.classList.toggle('hidden', tab !== 'methods');
  const guideEl = document.getElementById('lib-guide');
  const plansEl = document.getElementById('lib-plans');
  const mediaEl = document.getElementById('lib-media');
  if (guideEl) guideEl.classList.toggle('hidden', tab !== 'guide');
  if (plansEl) plansEl.classList.toggle('hidden', tab !== 'plans');
  if (mediaEl) mediaEl.classList.toggle('hidden', tab !== 'media');
  playSound('page');
}

function renderCourses() {
  const el = document.getElementById('course-list');
  if (!el) return;
  el.innerHTML = COURSES.map((c, i) => {
    const done = state.courseProgress.includes(i);
    return `
      <div class="p-4 rounded-xl cursor-pointer card-hover" style="background:rgba(184,169,201,0.08)" onclick="openCourse(${i})">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-title shrink-0" style="background:linear-gradient(135deg, #D4B5C7, #B8A9C9); color:white">${i + 1}</div>
          <div class="flex-1 min-w-0">
            <h4 class="font-title text-sm truncate" style="color:var(--theme-text)">${c.title}</h4>
            <p class="text-xs truncate" style="color:var(--theme-text); opacity:0.6">${c.summary}</p>
          </div>
          <div class="text-lg">${done ? '✅' : '▶️'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function openCourse(i) {
  const c = COURSES[i];
  setHTML('course-detail-content', `
    <div class="mb-4">
      <div class="text-xs mb-1" style="color:var(--theme-text)); opacity:0.5">第 ${i+1} 课 / 共 ${COURSES.length} 课</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${c.title}</h3>
    </div>
    <div class="max-h-[60vh] overflow-y-auto pr-1" style="color:var(--theme-text)">
      ${c.content}
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="prevCourse(${i})" class="soft-btn px-4 py-2 rounded-xl text-sm" style="background:rgba(184,169,201,0.15); color:var(--theme-text); ${i === 0 ? 'opacity:0.4' : ''}" ${i === 0 ? 'disabled' : ''}>上一课</button>
      <button onclick="markCourseDone(${i})" class="soft-btn btn-primary flex-1 py-2 text-sm font-title">
        ${state.courseProgress.includes(i) ? '✅ 已学完' : '✨ 学完了 +15能量'}
      </button>
      <button onclick="nextCourse(${i})" class="soft-btn px-4 py-2 rounded-xl text-sm" style="background:rgba(184,169,201,0.15); color:var(--theme-text); ${i === COURSES.length-1 ? 'opacity:0.4' : ''}" ${i === COURSES.length-1 ? 'disabled' : ''}>下一课</button>
    </div>
  `);
  showModal('course-modal');
  playSound('page');
}

function closeCourseModal() {
  hideModal('course-modal');
}

function prevCourse(i) { if (i > 0) openCourse(i - 1); }
function nextCourse(i) { if (i < COURSES.length - 1) openCourse(i + 1); }

function markCourseDone(i) {
  if (!state.courseProgress.includes(i)) {
    state.courseProgress.push(i);
    state.libReadCount = (state.libReadCount || 0) + 1;
    saveState();
    addEnergy(15, '学完一课');
    renderCourses();
    triggerConfetti();
    playSound('bloom');
    checkBadges();
  }
  closeCourseModal();
}

function renderBookshelf() {
  const el = document.getElementById('bookshelf');
  if (!el) return;
  el.innerHTML = BOOKS.map((b, i) => `
    <div class="book-stand" onclick="openBookDetail(${i}, 'book')">
      <div class="book-spine" style="background:linear-gradient(180deg, ${b.color1}, ${b.color2})">
        ${(b.title||'').replace(/《|》/g, '').substring(0, 6)}
      </div>
    </div>
  `).join('');
}

function openBookDetail(i, type) {
  let book = BOOKS[i];
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="w-16 h-24 mx-auto mb-3 rounded-lg flex items-center justify-center text-2xl" style="background:linear-gradient(180deg, ${book.color1}, ${book.color2}); box-shadow:0 6px 16px rgba(0,0,0,0.15)">
        📖
      </div>
      <h3 class="font-title text-base" style="color:var(--theme-text)">${book.title}</h3>
      <p class="text-xs mt-1" style="color:var(--theme-text); opacity:0.5">${book.author}</p>
    </div>
    <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1" style="color:var(--theme-text)">
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">📝 核心观点</h4>
        <p class="text-xs" style="opacity:0.75">${book.summary}</p>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(184,169,201,0.08)">
        <h4 class="font-title text-sm mb-2" style="color:var(--theme-text)">✨ 精华拆解</h4>
        <div class="text-xs leading-relaxed" style="opacity:0.75">${book.content}</div>
      </div>
    </div>
    <button onclick="markBookRead()" class="soft-btn btn-primary w-full mt-4 py-2 text-sm font-title">
      📚 我读完了 +5能量
    </button>
  `;
  showModal('book-modal');
  playSound('page');
  speak(book.title);
}

function markBookRead() {
  state.libReadCount = (state.libReadCount || 0) + 1;
  saveState();
  addEnergy(5, '读完一本书');
  closeBookModal();
  checkBadges();
  triggerConfetti();
  playSound('bloom');
  showToast('🎉 恭喜读完一本书！+5能量');
}

function closeBookModal() {
  hideModal('book-modal');
}

// ===== 书籍翻书阅读器 =====
let currentBookIndex = 0;
let currentPage = 0;
let bookPages = []; // 当前书籍的分页内容
let bookToc = []; // 目录

function openBookReader(index) {
  currentBookIndex = index;
  const book = BOOKS[index];
  
  // 构建书页内容
  buildBookPages(book);
  
  // 恢复阅读进度
  const progress = getBookProgress(book.title);
  currentPage = progress || 0;
  if (currentPage >= bookPages.length) currentPage = 0;
  
  // 更新标题
  setText('reader-book-title', book.title);
  setText('reader-book-author', book.author);
  setText('total-pages', bookPages.length);
  
  // 渲染目录
  renderToc();
  
  // 渲染当前页
  renderCurrentPage();
  
  // 更新按钮状态
  updatePageButtons();
  
  // 显示模态框
  showModal('book-reader-modal');
  playSound('page');
  
  // 标记阅读
  if (!state.bookReadProgress) state.bookReadProgress = {};
  if (!state.bookReadProgress[book.title]) {
    state.libReadCount = (state.libReadCount || 0) + 1;
    addEnergy(5, '开始阅读');
    checkBadges();
  }
  saveBookProgress(book.title, currentPage);
}

function closeBookReader() {
  const book = BOOKS[currentBookIndex];
  saveBookProgress(book.title, currentPage);
  hideModal('book-reader-modal');
  addCls('note-panel', 'hidden');
  addCls('toc-panel', 'hidden');
  playSound('page');
}

// 构建书页（按章节分页）
function buildBookPages(book) {
  bookPages = [];
  bookToc = [];
  
  // 第1页：封面
  bookPages.push({
    type: 'cover',
    content: `
      <div class="h-full flex flex-col items-center justify-center text-center">
        <div class="w-20 h-28 mb-4 rounded-lg flex items-center justify-center text-3xl" style="background:linear-gradient(180deg, ${book.color1}, ${book.color2}); box-shadow:0 8px 24px rgba(0,0,0,0.2)">
          📖
        </div>
        <h2 class="font-display text-xl mb-2" style="color:#5D4E6D">${book.title}</h2>
        <p class="text-xs mb-6" style="color:#8B7E9C">${book.author}</p>
        <p class="text-[10px] leading-relaxed max-w-[80%]" style="color:#8B7E9C; opacity:0.7">${book.summary}</p>
        <div class="mt-6 text-[10px]" style="color:#B8A9C9">— 翻开书页，开始阅读 —</div>
      </div>
    `
  });
  bookToc.push({ title: '封面', page: 0 });
  
  // 第2页：作者介绍
  bookPages.push({
    type: 'chapter',
    title: '👤 作者介绍',
    content: extractAuthorIntro(book)
  });
  bookToc.push({ title: '作者介绍', page: 1 });
  
  // 第3-N页：核心观点（每个观点一页）
  const ideas = extractCoreIdeas(book);
  ideas.forEach((idea, i) => {
    bookPages.push({
      type: 'chapter',
      title: `💡 核心观点 ${i+1}`,
      subtitle: idea.title,
      content: idea.content
    });
    bookToc.push({ title: idea.title, page: bookPages.length - 1 });
  });
  
  // 方法页
  const methods = extractMethods(book);
  if (methods.length > 0) {
    methods.forEach((m, i) => {
      bookPages.push({
        type: 'chapter',
        title: `🔑 核心方法 ${i+1}`,
        subtitle: m.title,
        content: m.content
      });
      bookToc.push({ title: m.title, page: bookPages.length - 1 });
    });
  }
  
  // 常见误区页
  const mistakes = extractMistakes(book);
  if (mistakes.length > 0) {
    bookPages.push({
      type: 'chapter',
      title: '⚠️ 新手常见误区',
      content: mistakes.map((m, i) => `<p class="mb-3"><b>${i+1}. ${m.q}</b><br><span style="opacity:0.75">${m.a}</span></p>`).join('')
    });
    bookToc.push({ title: '常见误区', page: bookPages.length - 1 });
  }
  
  // 练习作业页
  bookPages.push({
    type: 'chapter',
    title: '📝 本周练习作业',
    content: extractPractice(book)
  });
  bookToc.push({ title: '本周练习', page: bookPages.length - 1 });
  
  // 封底
  bookPages.push({
    type: 'cover',
    content: `
      <div class="h-full flex flex-col items-center justify-center text-center">
        <div class="text-4xl mb-4">✨</div>
        <h3 class="font-display text-lg mb-3" style="color:#5D4E6D">读完啦！</h3>
        <p class="text-xs leading-relaxed max-w-[80%] mb-4" style="color:#8B7E9C; opacity:0.8">
          恭喜你读完了《${(book.title||'').replace(/《|》/g, '')}》！<br>
          知识不是力量，行动才是。<br>
          把学到的方法用起来吧，你会看到改变的 💫
        </p>
        <button onclick="markBookReadFromReader()" class="soft-btn px-5 py-2 rounded-xl text-sm" style="background:linear-gradient(135deg, #D4B5C7, #B8A9C9); color:white">
          🎉 我读完了 +10能量
        </button>
      </div>
    `
  });
  bookToc.push({ title: '封底', page: bookPages.length - 1 });
}

// 从书籍内容中提取作者介绍
function extractAuthorIntro(book) {
  const match = book.content.match(/作者介绍<\/h4>([\s\S]*?)(?=<h4|$)/);
  if (match) return match[1].trim();
  return `<p>内维尔·戈达德（Neville Goddard）是20世纪最伟大的显化导师之一，出生于巴巴多斯，后移居美国。他的 teachings 影响了无数人，被称为「显化界的教父」。</p>`;
}

// 提取核心观点
function extractCoreIdeas(book) {
  const ideas = [];
  const regex = /核心观点[一二三四五六七八九十]*[：:]?<\/h4>([\s\S]*?)(?=<h4|$)/g;
  let match;
  while ((match = regex.exec(book.content)) !== null) {
    // 拆分观点段落
    const text = match[1].trim();
    const paras = text.split(/<p[^>]*>/).filter(p => p.trim().length > 10);
    if (paras.length > 0) {
      ideas.push({ title: '核心观点', content: text });
    }
  }
  // 如果没提取到，用默认的
  if (ideas.length === 0) {
    ideas.push({ title: '意识创造现实', content: `<p class="mb-3">意识是原因，现实是结果。你外在的世界，只是你内在意识的投射。不是你看到了才相信，而是你相信了才会看到。</p><p>改变你的意识，就能改变你的现实。这是所有显化法则的基础。</p>` });
  }
  return ideas;
}

// 提取方法
function extractMethods(book) {
  const methods = [];
  const regex = /核心方法[^<]*：?([^<]+)<\/h4>([\s\S]*?)(?=<h4|$)/g;
  let match;
  while ((match = regex.exec(book.content)) !== null) {
    methods.push({
      title: match[1].trim(),
      content: match[2].trim()
    });
  }
  return methods;
}

// 提取误区
function extractMistakes(book) {
  const mistakes = [];
  const match = book.content.match(/常见误区<\/h4>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (match) {
    const lis = match[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || [];
    lis.forEach(li => {
      const text = li.replace(/<[^>]+>/g, '').trim();
      if (text) mistakes.push({ q: text.substring(0, 30) + (text.length > 30 ? '...' : ''), a: text });
    });
  }
  return mistakes;
}

// 提取练习
function extractPractice(book) {
  const match = book.content.match(/配套练习<\/div>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  if (match) return `<p class="leading-relaxed">${match[1].trim()}</p>`;
  return `<p class="leading-relaxed">选择书中一个你最有感觉的方法，连续练习7天。记录下你的感受和变化。不用追求完美，开始了就是胜利 ✨</p>`;
}

function renderCurrentPage() {
  const page = bookPages[currentPage];
  const nextPage = bookPages[currentPage + 1];
  
  const leftEl = document.getElementById('page-left-content');
  const rightEl = document.getElementById('page-right-content');
  
  // 左页：当前页
  if (page) {
    let content = '';
    if (page.type === 'cover') {
      content = page.content;
    } else {
      content = `
        <div class="mb-4">
          <div class="text-[10px] mb-1" style="color:#B8A9C9; letter-spacing:2px">${page.title}</div>
          ${page.subtitle ? `<h3 class="font-title text-base mb-3" style="color:#5D4E6D">${page.subtitle}</h3>` : ''}
        </div>
        <div class="text-sm leading-relaxed" style="color:#4A3F5A">
          ${page.content}
        </div>
        <div class="absolute bottom-4 left-0 right-0 text-center text-[10px]" style="color:#B8A9C9">— ${currentPage + 1} —</div>
      `;
    }
    leftEl.innerHTML = `<div class="relative h-full">${content}</div>`;
  }
  
  // 右页：下一页（如果有）
  if (nextPage && currentPage + 1 < bookPages.length) {
    let content = '';
    if (nextPage.type === 'cover') {
      content = nextPage.content;
    } else {
      content = `
        <div class="mb-4">
          <div class="text-[10px] mb-1" style="color:#B8A9C9; letter-spacing:2px">${nextPage.title}</div>
          ${nextPage.subtitle ? `<h3 class="font-title text-base mb-3" style="color:#5D4E6D">${nextPage.subtitle}</h3>` : ''}
        </div>
        <div class="text-sm leading-relaxed" style="color:#4A3F5A">
          ${nextPage.content}
        </div>
        <div class="absolute bottom-4 left-0 right-0 text-center text-[10px]" style="color:#B8A9C9">— ${currentPage + 2} —</div>
      `;
    }
    rightEl.innerHTML = `<div class="relative h-full">${content}</div>`;
  } else {
    rightEl.innerHTML = '<div class="h-full flex items-center justify-center text-xs" style="color:#D4C5D9; opacity:0.5">— 完 —</div>';
  }
  
  // 更新页码显示
  setText('current-page', currentPage + 1);
  
  // 更新书签状态
  updateBookmarkBtn();
  
  // 更新笔记
  loadNoteForPage();
  
  // 保存进度
  const book = BOOKS[currentBookIndex];
  saveBookProgress(book.title, currentPage);
}

function nextPage() {
  if (currentPage + 2 < bookPages.length) {
    currentPage += 2;
    animatePageTurn('next');
    playSound('page');
  }
  updatePageButtons();
}

function prevPage() {
  if (currentPage >= 2) {
    currentPage -= 2;
    animatePageTurn('prev');
    playSound('page');
  }
  updatePageButtons();
}

function animatePageTurn(direction) {
  const leftPage = document.getElementById('page-left');
  const rightPage = document.getElementById('page-right');
  
  // 简单的翻页动画效果
  const animPage = direction === 'next' ? rightPage : leftPage;
  const startDeg = direction === 'next' ? 0 : -180;
  const endDeg = direction === 'next' ? -180 : 0;
  
  // 先更新内容，再加动画
  renderCurrentPage();
  
  animPage.style.transform = direction === 'next' ? 'rotateY(-10deg)' : 'rotateY(10deg)';
  animPage.style.transition = 'transform 0.3s ease';
  setTimeout(() => {
    animPage.style.transform = '';
  }, 300);
}

function updatePageButtons() {
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  
  prevBtn.style.opacity = currentPage === 0 ? '0.4' : '1';
  prevBtn.style.pointerEvents = currentPage === 0 ? 'none' : 'auto';
  
  const atEnd = currentPage + 1 >= bookPages.length - 1;
  nextBtn.style.opacity = atEnd ? '0.4' : '1';
  nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
}

// ===== 书签功能 =====
function getBookmarks(bookTitle) {
  if (!state.bookmarks) state.bookmarks = {};
  if (!state.bookmarks[bookTitle]) state.bookmarks[bookTitle] = [];
  return state.bookmarks[bookTitle];
}

function toggleBookmark() {
  const book = BOOKS[currentBookIndex];
  const bookmarks = getBookmarks(book.title);
  const pageIndex = currentPage;
  
  const idx = bookmarks.indexOf(pageIndex);
  if (idx > -1) {
    bookmarks.splice(idx, 1);
    showToast('🔖 已取消书签');
  } else {
    bookmarks.push(pageIndex);
    bookmarks.sort((a, b) => a - b);
    showToast('🔖 已添加书签');
    playSound('ding');
  }
  
  saveState();
  updateBookmarkBtn();
}

function updateBookmarkBtn() {
  const book = BOOKS[currentBookIndex];
  const bookmarks = getBookmarks(book.title);
  const btn = document.getElementById('bookmark-btn');
  
  if (bookmarks.includes(currentPage)) {
    btn.style.background = 'linear-gradient(135deg, #F5D0C5, #E8B4A8)';
    btn.style.color = 'white';
  } else {
    btn.style.background = 'rgba(255,255,255,0.3)';
    btn.style.color = 'var(--theme-text)';
  }
}

// ===== 笔记功能 =====
function getNotes(bookTitle) {
  if (!state.bookNotes) state.bookNotes = {};
  if (!state.bookNotes[bookTitle]) state.bookNotes[bookTitle] = {};
  return state.bookNotes[bookTitle];
}

function toggleNotePanel() {
  const panel = document.getElementById('note-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    addCls('toc-panel', 'hidden');
    loadNoteForPage();
    renderNotesList();
  }
  playSound('ding');
}

function loadNoteForPage() {
  const book = BOOKS[currentBookIndex];
  const notes = getNotes(book.title);
  const textarea = document.getElementById('note-textarea');
  if (textarea) {
    textarea.value = notes[currentPage] || '';
  }
}

function saveCurrentNote() {
  const book = BOOKS[currentBookIndex];
  const notes = getNotes(book.title);
  const textarea = document.getElementById('note-textarea');
  if (textarea) {
    notes[currentPage] = textarea.value;
    saveState();
    renderNotesList();
  }
}

function renderNotesList() {
  const book = BOOKS[currentBookIndex];
  const notes = getNotes(book.title);
  const listEl = document.getElementById('notes-list');
  if (!listEl) return;
  
  const noteEntries = Object.entries(notes)
    .filter(([page, text]) => text && text.trim())
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  
  if (noteEntries.length === 0) {
    listEl.innerHTML = '<div class="text-[10px] text-center py-2" style="color:var(--theme-text); opacity:0.3">还没有笔记哦～</div>';
    return;
  }
  
  listEl.innerHTML = noteEntries.map(([page, text]) => `
    <div class="p-2 rounded-lg cursor-pointer text-[10px]" style="background:rgba(184,169,201,0.1); color:var(--theme-text)" onclick="goToPage(${page})">
      <div class="font-medium mb-0.5" style="color:#B8859C">第 ${Number(page)+1} 页</div>
      <div class="line-clamp-2" style="opacity:0.7">${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</div>
    </div>
  `).join('');
}

function goToPage(page) {
  // 确保翻到正确的页（左页）
  currentPage = page % 2 === 0 ? page : page - 1;
  if (currentPage < 0) currentPage = 0;
  if (currentPage >= bookPages.length) currentPage = bookPages.length - 1;
  renderCurrentPage();
  updatePageButtons();
  playSound('page');
}

// ===== 目录功能 =====
function toggleToc() {
  const panel = document.getElementById('toc-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    addCls('note-panel', 'hidden');
  }
  playSound('ding');
}

function renderToc() {
  const tocEl = document.getElementById('toc-list');
  tocEl.innerHTML = bookToc.map((item, i) => `
    <div class="p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between" style="color:var(--theme-text)" 
      onmouseover="this.style.background='rgba(184,169,201,0.1)'" 
      onmouseout="this.style.background=''"
      onclick="goToPage(${item.page}); toggleToc()">
      <span class="truncate">${item.title}</span>
      <span class="text-[10px] shrink-0 ml-2" style="opacity:0.4">${item.page + 1}</span>
    </div>
  `).join('');
}

// ===== 阅读进度 =====
function saveBookProgress(bookTitle, page) {
  if (!state.bookReadProgress) state.bookReadProgress = {};
  state.bookReadProgress[bookTitle] = page;
  saveState();
}

function getBookProgress(bookTitle) {
  if (!state.bookReadProgress) return 0;
  return state.bookReadProgress[bookTitle] || 0;
}

function markBookReadFromReader() {
  state.libReadCount = (state.libReadCount || 0) + 1;
  saveState();
  addEnergy(10, '读完一本书');
  closeBookReader();
  checkBadges();
  triggerConfetti();
  playSound('bloom');
  showToast('🎉 恭喜读完一本书！+10能量');
}

function renderGuides() {
  const el = document.getElementById('guide-list');
  if (!el) return;
  el.innerHTML = GUIDES.map((g, i) => `
    <div class="p-4 rounded-xl cursor-pointer card-hover" style="background:rgba(184,169,201,0.08)" onclick="openGuide(${i})">
      <div class="text-2xl mb-2">${g.icon}</div>
      <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">${g.title}</h4>
      <p class="text-xs line-clamp-2" style="color:var(--theme-text); opacity:0.6">${g.summary}</p>
    </div>
  `).join('');
}

function renderMethodsList() {
  const el = document.getElementById('methods-list');
  if (!el) return;
  el.innerHTML = METHODS.map((m, i) => `
    <div class="p-4 rounded-xl cursor-pointer card-hover" style="background:rgba(184,169,201,0.08)" onclick="openMethod(${i})">
      <div class="text-2xl mb-2">${m.icon}</div>
      <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">${m.name}</h4>
      <p class="text-xs line-clamp-2" style="color:var(--theme-text); opacity:0.6">${m.summary}</p>
    </div>
  `).join('');
}

function openMethod(i) {
  const m = METHODS[i];
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">${m.icon}</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${m.name}</h3>
      <p class="text-xs" style="color:var(--theme-text); opacity:0.5">${m.summary}</p>
    </div>
    <div class="max-h-[55vh] overflow-y-auto pr-1" style="color:var(--theme-text)">
      <div class="text-xs leading-relaxed" style="opacity:0.8">${m.content}</div>
    </div>
    <button onclick="markBookRead(); closeBookModal();" class="soft-btn btn-primary w-full mt-4 py-2 text-sm font-title">
      ✨ 已阅读 +5能量
    </button>
  `;
  showModal('book-modal');
  playSound('page');
}

function renderLibPlansList() {
  const el = document.getElementById('lib-plans-list');
  if (!el) return;
  const plans = [
    { key: 'beginner', icon: '🌱', title: '21天新手计划', desc: '从入门到行动，循序渐进', color: '#D4B5C7' },
    { key: 'sp', icon: '💖', title: '7天SP恋爱计划', desc: '针对特定的人的7天练习', color: '#D4A5B8' },
    { key: 'money', icon: '💰', title: '14天财富计划', desc: '针对搞钱的14天练习', color: '#E8C87A' },
  ];
  el.innerHTML = plans.map(p => {
    const done = state.plans[p.key] || [];
    const total = PLANS[p.key].total;
    const percent = Math.round(done.length / total * 100);
    return `
      <div class="p-4 rounded-xl cursor-pointer card-hover" style="background:rgba(184,169,201,0.08)" onclick="closeBookModal(); openModule('plans'); setTimeout(()=>selectPlan('${p.key}'), 200)">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style="background:linear-gradient(135deg, ${p.color}30, ${p.color}15)">${p.icon}</div>
        <h4 class="font-title text-sm mb-1" style="color:var(--theme-text)">${p.title}</h4>
        <p class="text-xs mb-3" style="color:var(--theme-text); opacity:0.6">${p.desc}</p>
        <div class="w-full h-1.5 rounded-full overflow-hidden" style="background:rgba(184,169,201,0.15)">
          <div class="h-full rounded-full" style="background:linear-gradient(90deg, ${p.color}, ${p.color}aa); width:${percent}%"></div>
        </div>
        <div class="text-[10px] mt-1" style="color:var(--theme-text); opacity:0.5">${done.length}/${total}天 · ${percent}%</div>
      </div>
    `;
  }).join('');
}

function openGuide(i) {
  const g = GUIDES[i];
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">${g.icon}</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${g.title}</h3>
      <p class="text-xs" style="color:var(--theme-text); opacity:0.5">${g.summary}</p>
    </div>
    <div class="max-h-[55vh] overflow-y-auto pr-1" style="color:var(--theme-text)">
      <div class="text-xs leading-relaxed" style="opacity:0.8">${g.content}</div>
    </div>
    <button onclick="markBookRead(); closeBookModal();" class="soft-btn btn-primary w-full mt-4 py-2 text-sm font-title">
      ✨ 已阅读 +5能量
    </button>
  `;
  showModal('book-modal');
  playSound('page');
}

function renderMedia() {
  const btn = document.querySelector('#lib-media .chip-soft');
  if (btn) switchMediaTab('movies', btn);
}

let currentMovieCategory = 'selfGrowth';

function switchMediaTab(tab, btn) {
  if (!btn) return;
  document.querySelectorAll('#lib-media .chip-soft').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMediaTab = tab;
  const key = tab.replace('-media', '').replace('books-', 'books');
  const el = document.getElementById('media-content');

  if (key === 'movies') {
    renderMovieLibrary();
    return;
  }

  const data = MEDIA[key] || [];
  const levelColors = {
    '入门': 'background:rgba(136,200,152,0.2); color:#5A9C6A',
    '进阶': 'background:rgba(245,230,200,0.3); color:#B8955A',
    '专家': 'background:rgba(184,169,201,0.2); color:#8B7E9C',
  };
  el.innerHTML = `
    <div class="space-y-2">
      ${data.map(m => `
        <div class="p-3 rounded-xl cursor-pointer card-hover" style="background:rgba(184,169,201,0.08)" onclick="openMediaDetail('${(m.name||'').replace(/'/g, "\\'")}', '${m.level}', '${m.type}', '${(m.desc||'').replace(/'/g, "\\'")}')">
          <div class="flex items-center gap-3">
            <div class="text-xl">${key === 'books' ? '📚' : key === 'movies' ? '🎬' : '🎵'}</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate" style="color:var(--theme-text)">${m.name}</div>
              <div class="text-xs truncate" style="color:var(--theme-text); opacity:0.5">${m.type} · ${(m.desc||'').substring(0, 18)}...</div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full shrink-0" style="${levelColors[m.level]}">${m.level}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMovieLibrary() {
  const el = document.getElementById('media-content');
  const categories = [
    { key: 'selfGrowth', label: '🌱 自我成长', color: '#88C898' },
    { key: 'love', label: '💗 爱情关系', color: '#E8A5B8' },
    { key: 'career', label: '💰 财富事业', color: '#E8C87A' },
    { key: 'healing', label: '🧘 疗愈治愈', color: '#B8A9C9' },
  ];
  const movies = MOVIE_LIBRARY[currentMovieCategory] || [];
  const favorites = state.favMovies || [];

  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2 justify-center">
        ${categories.map(cat => `
          <button class="chip-soft text-xs ${currentMovieCategory === cat.key ? 'active' : ''}" 
            onclick="switchMovieCategory('${cat.key}', this)"
            style="${currentMovieCategory === cat.key ? `background:${cat.color}; color:white; border-color:${cat.color}` : ''}">
            ${cat.label}
          </button>
        `).join('')}
      </div>
      <div class="text-center text-xs" style="color:var(--theme-text); opacity:0.5">
        共 ${movies.length} 部 · 已收藏 ${movies.filter(m => favorites.includes(m.title + m.year)).length} 部
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${movies.map((m, i) => {
          const isFav = favorites.includes(m.title + m.year);
          const catColor = categories.find(c => c.key === currentMovieCategory)?.color || '#B8A9C9';
          return `
            <div class="glass-card p-4 cursor-pointer card-hover" onclick="openMovieDetail(${i}, '${currentMovieCategory}')">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-title font-medium truncate" style="color:var(--theme-text)">${m.title}</div>
                  <div class="text-[10px]" style="color:var(--theme-text); opacity:0.4">${m.year}</div>
                </div>
                <button onclick="event.stopPropagation(); toggleFavMovie('${m.title + m.year}')" 
                  class="text-base shrink-0" style="color:${isFav ? '#E8A5B8' : 'var(--theme-text)'};">
                  ${isFav ? '💖' : '🤍'}
                </button>
              </div>
              <p class="text-xs leading-relaxed mb-2 line-clamp-2" style="color:var(--theme-text); opacity:0.7">${m.summary}</p>
              <div class="flex items-center gap-1">
                <span class="text-[10px] px-2 py-0.5 rounded-full shrink-0" 
                  style="background:${catColor}22; color:${catColor}">
                  ✨ 显化视角
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function switchMovieCategory(key, btn) {
  currentMovieCategory = key;
  renderMovieLibrary();
  playSound('ding');
}

function toggleFavMovie(id) {
  if (!state.favMovies) state.favMovies = [];
  const idx = state.favMovies.indexOf(id);
  if (idx >= 0) {
    state.favMovies.splice(idx, 1);
  } else {
    state.favMovies.push(id);
    addEnergy(2);
  }
  saveState();
  renderMovieLibrary();
  playSound('sparkle');
}

function openMovieDetail(index, category) {
  const m = MOVIE_LIBRARY[category][index];
  const favorites = state.favMovies || [];
  const isFav = favorites.includes(m.title + m.year);
  const catLabels = {
    selfGrowth: '🌱 自我成长',
    love: '💗 爱情关系',
    career: '💰 财富事业',
    healing: '🧘 疗愈治愈',
  };
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">🎬</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${m.title}</h3>
      <div class="flex items-center justify-center gap-2 mt-1">
        <span class="text-xs" style="color:var(--theme-text); opacity:0.5">${m.year}</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full" style="background:rgba(245,230,200,0.3); color:#B8955A">${catLabels[category]}</span>
      </div>
    </div>
    <div class="space-y-3">
      <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
        <div class="text-xs font-title mb-1" style="color:var(--theme-text); opacity:0.6">📖 一句话简介</div>
        <p class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.85">${m.summary}</p>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(184,169,201,0.15)">
        <div class="text-xs font-title mb-1" style="color:var(--theme-text); opacity:0.6">✨ 显化角度解析</div>
        <p class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.85">${m.insight}</p>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(136,200,152,0.12)">
        <div class="text-xs font-title mb-1" style="color:var(--theme-text); opacity:0.6">💝 适合人群</div>
        <p class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.85">${m.audience}</p>
      </div>
      <div class="p-3 rounded-xl" style="background:rgba(245,200,180,0.15)">
        <div class="text-xs font-title mb-2" style="color:var(--theme-text); opacity:0.6">🔗 影片链接（自己填写，自动保存）</div>
        <input type="text" id="movie-link-input" placeholder="粘贴影片播放链接..." 
          class="w-full px-3 py-2 text-xs rounded-xl border outline-none" 
          style="background:rgba(255,255,255,0.6); border-color:rgba(245,200,180,0.3); color:var(--theme-text)"
          oninput="saveMovieLink('${m.title + m.year}', this.value)" />
        <div class="text-[10px] mt-1" style="color:var(--theme-text); opacity:0.4">💡 填好后自动保存到本地，下次打开还在～</div>
      </div>
    </div>
    <div class="flex gap-2 mt-4">
      <button onclick="toggleFavMovie('${m.title + m.year}'); closeBookModal();" class="soft-btn btn-primary flex-1 py-2 text-sm font-title">
        ${isFav ? '💖 已收藏' : '🤍 收藏电影 +2能量'}
      </button>
    </div>
  `;
  showModal('book-modal');
  // 回填已保存的链接
  const savedLinks = state.movieLinks || {};
  const savedLink = savedLinks[m.title + m.year];
  if (savedLink) {
    setTimeout(() => {
      const input = document.getElementById('movie-link-input');
      if (input) input.value = savedLink;
    }, 50);
  }
  playSound('page');
  speak(m.title);
}

function saveMovieLink(key, value) {
  if (!state.movieLinks) state.movieLinks = {};
  state.movieLinks[key] = value;
  saveState();
}

function openMediaDetail(name, level, type, desc) {
  const bookDetailContent = document.getElementById('book-detail-content'); if (bookDetailContent) bookDetailContent.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-4xl mb-2">🎬</div>
      <h3 class="font-display text-lg" style="color:var(--theme-text)">${name}</h3>
      <div class="flex items-center justify-center gap-2 mt-1">
        <span class="text-xs" style="color:var(--theme-text); opacity:0.5">${type}</span>
        <span class="text-[10px] px-2 py-0.5 rounded-full" style="background:rgba(245,230,200,0.3); color:#B8955A">${level}</span>
      </div>
    </div>
    <div class="p-3 rounded-xl" style="background:rgba(240,213,224,0.15)">
      <p class="text-xs leading-relaxed" style="color:var(--theme-text); opacity:0.75">${desc}</p>
    </div>
    <button onclick="markBookRead(); closeBookModal();" class="soft-btn btn-primary w-full mt-4 py-2 text-sm font-title">
      ✨ 加入我的清单 +5能量
    </button>
  `;
  showModal('book-modal');
  playSound('page');
  speak(name);
}


// Mount functions to window for HTML onclick compatibility
window.renderLibrary = renderLibrary;
window.switchLibTab = switchLibTab;
window.renderCourses = renderCourses;
window.openCourse = openCourse;
window.closeCourseModal = closeCourseModal;
window.prevCourse = prevCourse;
window.nextCourse = nextCourse;
window.markCourseDone = markCourseDone;
window.renderBookshelf = renderBookshelf;
window.openBookDetail = openBookDetail;
window.markBookRead = markBookRead;
window.closeBookModal = closeBookModal;
window.openBookReader = openBookReader;
window.closeBookReader = closeBookReader;
window.buildBookPages = buildBookPages;
window.extractAuthorIntro = extractAuthorIntro;
window.extractCoreIdeas = extractCoreIdeas;
window.extractMethods = extractMethods;
window.extractMistakes = extractMistakes;
window.extractPractice = extractPractice;
window.renderCurrentPage = renderCurrentPage;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.animatePageTurn = animatePageTurn;
window.updatePageButtons = updatePageButtons;
window.getBookmarks = getBookmarks;
window.toggleBookmark = toggleBookmark;
window.updateBookmarkBtn = updateBookmarkBtn;
window.getNotes = getNotes;
window.toggleNotePanel = toggleNotePanel;
window.loadNoteForPage = loadNoteForPage;
window.saveCurrentNote = saveCurrentNote;
window.renderNotesList = renderNotesList;
window.goToPage = goToPage;
window.toggleToc = toggleToc;
window.renderToc = renderToc;
window.saveBookProgress = saveBookProgress;
window.getBookProgress = getBookProgress;
window.markBookReadFromReader = markBookReadFromReader;
window.renderGuides = renderGuides;
window.renderMethodsList = renderMethodsList;
window.openMethod = openMethod;
window.renderLibPlansList = renderLibPlansList;
window.openGuide = openGuide;
window.renderMedia = renderMedia;
window.switchMediaTab = switchMediaTab;
window.renderMovieLibrary = renderMovieLibrary;
window.switchMovieCategory = switchMovieCategory;
window.toggleFavMovie = toggleFavMovie;
window.openMovieDetail = openMovieDetail;
window.saveMovieLink = saveMovieLink;
window.openMediaDetail = openMediaDetail;

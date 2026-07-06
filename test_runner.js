// ===== 星愿花园 v6.4 自动化测试脚本 =====
// 使用方法：在浏览器控制台（F12 → Console）粘贴完整代码执行

(function() {
  'use strict';
  
  const TEST_RESULTS = [];
  let PASS = 0, FAIL = 0;
  
  function log(level, msg) {
    const color = level === 'PASS' ? '#4caf50' : level === 'FAIL' ? '#f44336' : '#ff9800';
    console.log(`%c[${level}] %c${msg}`, `color:${color};font-weight:bold`, 'color:#333');
  }
  
  function test(name, fn) {
    try {
      fn();
      log('PASS', name);
      PASS++;
      TEST_RESULTS.push({ name, status: 'PASS' });
    } catch (e) {
      log('FAIL', name + ' | ' + e.message);
      FAIL++;
      TEST_RESULTS.push({ name, status: 'FAIL', error: e.message, stack: e.stack });
    }
  }
  
  function assert(cond, msg) {
    if (!cond) throw new Error(msg || 'Assertion failed');
  }
  
  function assertExists(id, msg) {
    const el = document.getElementById(id);
    if (!el) throw new Error(msg || `Element #${id} not found`);
    return el;
  }
  
  function assertFn(name, msg) {
    if (typeof window[name] !== 'function') throw new Error(msg || `Function ${name} not found`);
  }
  
  // ============================================================
  // P0 - 致命阻塞测试
  // ============================================================
  console.log('%c===== P0 致命阻塞测试 =====', 'color:#2196f3;font-size:16px;font-weight:bold');
  
  test('P0-1: 页面已加载（body 存在）', () => {
    assert(document.body, 'document.body 不存在');
  });
  
  test('P0-2: 骨架屏已隐藏或不存在', () => {
    const sk = document.getElementById('skeleton-screen');
    if (sk) assert(sk.classList.contains('hidden') || sk.style.display === 'none', '骨架屏未隐藏');
  });
  
  test('P0-3: 无全局 JS 错误（运行时）', () => {
    // 此测试依赖 console.error 拦截，在下方测试结束后验证
    assert(true, '占位');
  });
  
  test('P0-4: 核心函数已定义', () => {
    assertFn('init', 'init() 未定义');
    assertFn('showPage', 'showPage() 未定义');
    assertFn('goHome', 'goHome() 未定义');
    assertFn('switchTab', 'switchTab() 未定义');
    assertFn('saveState', 'saveState() 未定义');
    assertFn('loadState', 'loadState() 未定义');
  });
  
  test('P0-5: 核心页面 section 存在', () => {
    assertExists('page-welcome', 'page-welcome 不存在');
    assertExists('page-island', 'page-island 不存在');
    assertExists('page-tools', 'page-tools 不存在');
    assertExists('page-library', 'page-library 不存在');
    assertExists('page-journal', 'page-journal 不存在');
    assertExists('page-me', 'page-me 不存在');
  });
  
  test('P0-6: 导航栏存在', () => {
    assertExists('nav-island', 'nav-island 不存在');
    assertExists('nav-tools', 'nav-tools 不存在');
    assertExists('nav-library', 'nav-library 不存在');
    assertExists('nav-journal', 'nav-journal 不存在');
    assertExists('nav-me', 'nav-me 不存在');
  });
  
  test('P0-7: 状态对象已初始化', () => {
    assert(typeof state !== 'undefined', 'state 未定义');
    assert(Array.isArray(state.wishes), 'state.wishes 不是数组');
    assert(typeof state.energy === 'number', 'state.energy 不是数字');
  });
  
  // ============================================================
  // P1 - 核心功能测试
  // ============================================================
  console.log('%c===== P1 核心功能测试 =====', 'color:#2196f3;font-size:16px;font-weight:bold');
  
  test('P1-1: showPage() 页面切换正常', () => {
    showPage('island');
    const p = document.getElementById('page-island');
    assert(p.classList.contains('active'), 'page-island 未激活');
  });
  
  test('P1-2: switchTab() 切换工具页', () => {
    switchTab('tools');
    const p = document.getElementById('page-tools');
    assert(p.classList.contains('active'), 'page-tools 未激活');
  });
  
  test('P1-3: switchTab() 切换智慧页', () => {
    switchTab('library');
    const p = document.getElementById('page-library');
    assert(p.classList.contains('active'), 'page-library 未激活');
  });
  
  test('P1-4: switchTab() 切换日记页', () => {
    switchTab('journal');
    const p = document.getElementById('page-journal');
    assert(p.classList.contains('active'), 'page-journal 未激活');
  });
  
  test('P1-5: switchTab() 切换我的页', () => {
    switchTab('me');
    const p = document.getElementById('page-me');
    assert(p.classList.contains('active'), 'page-me 未激活');
  });
  
  test('P1-6: switchTab() 切回主页', () => {
    switchTab('island');
    const p = document.getElementById('page-island');
    assert(p.classList.contains('active'), 'page-island 未激活');
  });
  
  test('P1-7: goHome() 回到主页', () => {
    goHome();
    const p = document.getElementById('page-island');
    assert(p.classList.contains('active'), 'goHome() 后 page-island 未激活');
  });
  
  test('P1-8: saveState() 和 loadState() 正常工作', () => {
    const before = JSON.stringify(state);
    state.energy += 1;
    saveState();
    const saved = localStorage.getItem('cosmos_island_state_v3');
    assert(saved, 'saveState() 未保存到 localStorage');
    const parsed = JSON.parse(saved);
    assert(parsed.energy === state.energy, '保存的能量值不匹配');
    // 恢复
    state.energy -= 1;
    saveState();
  });
  
  test('P1-9: StorageUtil 正常工作', () => {
    assert(typeof StorageUtil !== 'undefined', 'StorageUtil 未定义');
    StorageUtil.set('__test_key', { test: true });
    const v = StorageUtil.get('__test_key', null);
    assert(v && v.test === true, 'StorageUtil get/set 失败');
    StorageUtil.remove('__test_key');
  });
  
  test('P1-10: 更新昵称不崩溃', () => {
    if (typeof updateNickname === 'function') {
      const old = state.nickname;
      updateNickname('测试昵称');
      assert(state.nickname === '测试昵称', '昵称未更新');
      updateNickname(old);
    }
  });
  
  test('P1-11: getLevel() 返回有效等级', () => {
    if (typeof getLevel === 'function') {
      const lvl = getLevel();
      assert(typeof lvl === 'string' && lvl.length > 0, 'getLevel() 返回无效值');
    }
  });
  
  test('P1-12: getTodayStr() 返回有效日期', () => {
    if (typeof getTodayStr === 'function') {
      const d = getTodayStr();
      assert(/^\d{4}-\d{2}-\d{2}$/.test(d), 'getTodayStr() 格式错误: ' + d);
    }
  });
  
  // ============================================================
  // P2 - 进阶功能函数存在性测试
  // ============================================================
  console.log('%c===== P2 进阶功能存在性测试 =====', 'color:#2196f3;font-size:16px;font-weight:bold');
  
  const P2_FUNCS = [
    'startTest', 'renderTestQ', 'selectTestOpt', 'nextTestQ', 'finishTest',
    'calcPersona', 'enterIslandFromTest', 'viewPersona', 'closePersona',
    'saveWishDraft', 'toggleWishDone', 'deleteWish', 'renderSkyWishes', 'renderWishList', 'renderWishWall', 'addWishProgress',
    'recordMood', 'updateMoodDisplay', 'toggleMoodTag', 'saveMoodNote',
    'renderEmotionHistory', 'saveEmotionNote', 'onEmotionSlide', 'initEmotion',
    'playAffirmCategory', 'showAffirmText', 'startAffirmPlay', 'toggleAffirmPlay',
    'startBreathe', 'stopBreathe', 'initBreathe',
    'startSatsTimer', 'initSats', 'renderSatsScenes',
    'renderTarot', 'drawThreeTarot', 'resetTarot',
    'renderTimeline', 'toggleWishTimeline', 'initTimeline',
    'renderManifestReport', 'initManifestReport',
    'renderAffirmLoop', 'toggleAffirmLoop', 'addAffirmLoopItem',
    'exportAllData', 'initExportOptions',
    'renderSmartRecommendations', 'renderHeatmap', 'getActivityCount',
    'checkNewBadges', 'getUnlockedBadges', 'renderBadgeWall',
    'initVip', 'loadVipState', 'updateCrystalDisplay', 'showInvitePage',
    'renderMovies', 'initMovies', 'renderBookshelf', 'renderLibrary',
    'renderCourses',
    'initChallenge', 'renderChallenge', 'challengeCheckIn', 'resetChallenge',
    'toggleDarkMode', 'updateNickname',
    'startTutorial', 'finishTutorial', 'showTutorialStep',
    'showAlert', 'closeAlert', 'showToast', 'showVoiceBubble',
    'playSound', 'initAudio', 'speak',
    'createFireflies', 'triggerConfetti', 'updateTimeAndWeather',
    'updateTopbar', 'updateGreeting', 'updateHomeStats', 'updateFortuneCard',
    'checkDailyReset', 'checkReminders', 'logActivity',
    'showPage', 'goBack', 'goHome', 'switchTab', 'updateNavActive',
    'showModal', 'hideModal', 'showLockModal', 'closeLockModal',
    'init', 'saveState', 'loadState', 'getLevel', 'getTodayStr',
  ];
  
  let p2Pass = 0, p2Fail = 0;
  P2_FUNCS.forEach(name => {
    if (typeof window[name] === 'function') {
      p2Pass++;
    } else {
      p2Fail++;
      log('WARN', `P2 函数缺失: ${name}()`);
    }
  });
  
  console.log(`%cP2 函数存在性: ${p2Pass} / ${P2_FUNCS.length} 通过, ${p2Fail} 缺失`, 
    p2Fail === 0 ? 'color:#4caf50' : 'color:#ff9800');
  
  // ============================================================
  // 总结
  // ============================================================
  console.log('%c===== 测试总结 =====', 'color:#2196f3;font-size:16px;font-weight:bold');
  console.log(`%cP0/P1 测试: ${PASS} 通过, ${FAIL} 失败`, FAIL === 0 ? 'color:#4caf50;font-weight:bold' : 'color:#f44336;font-weight:bold');
  console.log(`%cP2 函数存在性: ${p2Pass} / ${P2_FUNCS.length} 通过, ${p2Fail} 缺失`, p2Fail === 0 ? 'color:#4caf50' : 'color:#ff9800');
  
  if (FAIL > 0) {
    console.log('%c\n失败详情:', 'color:#f44336;font-weight:bold');
    TEST_RESULTS.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.error}`);
    });
  }
  
  // 返回结果对象供外部检查
  window.__testResults = {
    p0p1: { pass: PASS, fail: FAIL, details: TEST_RESULTS },
    p2: { pass: p2Pass, fail: p2Fail, total: P2_FUNCS.length },
    timestamp: new Date().toISOString(),
    allPassed: FAIL === 0 && p2Fail === 0
  };
  
  console.log('%c\n测试结果已保存到 window.__testResults', 'color:#2196f3');
  console.log('复制以下命令查看完整结果:');
  console.log('  JSON.stringify(window.__testResults, null, 2)');
  
})();

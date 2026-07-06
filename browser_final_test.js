// === 星愿花园 v6.4 浏览器最终验证脚本 ===
// 用法：在浏览器 F12 Console 中粘贴执行

(function() {
  const results = [];
  let pass = 0, fail = 0;
  
  function test(name, fn) {
    try { 
      if (fn()) { 
        results.push('✅ ' + name); 
        pass++; 
      } else { 
        results.push('❌ ' + name); 
        fail++; 
      }
    }
    catch(e) { 
      results.push('❌ ' + name + ' (异常: ' + e.message + ')'); 
      fail++; 
    }
  }
  
  // ===== P0: 基础对象 =====
  test('state对象存在', () => typeof state === 'object' && state !== null);
  test('state.startDate有效', () => { 
    const d = new Date(state.startDate); 
    return !isNaN(d.getTime()); 
  });
  test('state.wishes是数组', () => Array.isArray(state.wishes));
  test('state.diaries是数组', () => Array.isArray(state.diaries));
  test('state.badges是数组', () => Array.isArray(state.badges));
  test('state.emotionHistory是数组', () => Array.isArray(state.emotionHistory));
  test('state.completedChallenges是数组', () => Array.isArray(state.completedChallenges));
  test('state.purify是对象', () => typeof state.purify === 'object');
  test('state.mentalDiet是对象', () => typeof state.mentalDiet === 'object');
  test('state.garden是对象', () => typeof state.garden === 'object');
  test('state.affirmations是对象', () => typeof state.affirmations === 'object');
  
  // ===== P1: 核心函数 =====
  const coreFns = [
    'showPage','goHome','saveState','loadState','init','showToast','showLoading','hideLoading',
    'openModule','$el','setText','setHTML','escapeHtml','addCls','remCls','toggleCls','setStyle','setVal'
  ];
  coreFns.forEach(fn => test('函数存在: ' + fn, () => typeof window[fn] === 'function'));
  
  // ===== P2: 页面切换 =====
  const pages = [
    'home','affirm','wheel','sats','wish','diary','mood','settings','me','tools','books','audio',
    'test','badges','ai','search','community','plans','about','cbt','diet','meditation','369',
    '55x5','visualization','scripting','treasure','revision','celebration','garden','mindmovie'
  ];
  pages.forEach(p => test('页面可切换: ' + p, () => { 
    try { showPage(p); return true; } 
    catch(e) { return false; } 
  }));
  
  // ===== P3: 数据持久化 =====
  test('localStorage可读写', () => { 
    try { 
      localStorage.setItem('_test','1'); 
      const v = localStorage.getItem('_test'); 
      localStorage.removeItem('_test'); 
      return v === '1'; 
    } catch(e) { return false; } 
  });
  
  // ===== P4: 核心交互 =====
  test('showToast正常工作', () => { 
    try { showToast('测试'); return true; } 
    catch(e) { return false; } 
  });
  test('escapeHtml正常工作', () => { 
    try { return escapeHtml('<script>') === '&lt;script&gt;'; } 
    catch(e) { return false; } 
  });
  test('DOM安全助手$el存在', () => typeof window.$el === 'function');
  test('setHTML存在', () => typeof window.setHTML === 'function');
  
  // ===== P5: 工具函数 =====
  const utilFns = [
    'formatDate','formatTime','getToday','getTimeOfDay','debounce','throttle','clamp','rand',
    'shuffle','deepClone','generateId','isValidDate','getStreak','speakText','stopSpeak',
    'playSound','triggerConfetti','createFireflies','updateTimeAndWeather','checkReminders'
  ];
  utilFns.forEach(fn => test('工具函数: ' + fn, () => typeof window[fn] === 'function'));
  
  // ===== P6: 内存安全 =====
  test('stopAmbientMusic存在', () => typeof window.stopAmbientMusic === 'function');
  test('escapeHtml转义正确', () => escapeHtml('"test"') === '&quot;test&quot;');
  test('init防重复标志', () => typeof window.__initDone !== 'undefined');
  
  // ===== 打印结果 =====
  console.log('========== 星愿花园 v6.4 验证报告 ==========');
  console.log('测试时间: ' + new Date().toLocaleString());
  results.forEach(r => console.log(r));
  console.log('-------------------------------------------');
  console.log('✅ 通过: ' + pass + ' / ❌ 失败: ' + fail);
  console.log('总计: ' + (pass + fail));
  if (fail === 0) console.log('🎉 全部通过！代码运行正常。');
  else console.log('⚠️ 存在 ' + fail + ' 项失败，请检查上述标记 ❌ 的测试。');
  
  return { pass, fail, total: pass + fail };
})();

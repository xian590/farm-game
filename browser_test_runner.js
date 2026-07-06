/* ============================================
   星愿花园 v6.4 真实浏览器控制台验证脚本
   使用方法：
   1. 打开浏览器（Chrome/Edge/Firefox）
   2. 访问 http://localhost:8765/index-manifestation.html
   3. 按 F12 打开开发者工具 → Console
   4. 清除缓存（Ctrl+Shift+Delete → 清除缓存和Cookie）
   5. 刷新页面（Ctrl+F5 强制刷新）
   6. 复制此脚本全部内容粘贴到 Console
   7. 按回车执行
   ============================================ */

(function(){
    const results = { passed: 0, failed: 0, errors: [] };
    function pass(msg) { console.log('✅ PASS: ' + msg); results.passed++; }
    function fail(msg) { console.error('❌ FAIL: ' + msg); results.failed++; results.errors.push(msg); }

    console.log('========================================');
    console.log('  星愿花园 v6.4 浏览器控制台测试开始');
    console.log('========================================');

    // ===== P0: 页面加载验证 =====
    console.log('\n--- P0: 页面加载 ---');
    try {
        if (document.title.includes('星愿花园')) pass('页面标题正确: ' + document.title);
        else fail('页面标题异常: ' + document.title);

        const sk = document.getElementById('skeleton-screen');
        if (!sk || sk.classList.contains('hidden') || sk.style.display === 'none') pass('骨架屏已隐藏');
        else fail('骨架屏未隐藏');

        const island = document.getElementById('island-main');
        if (island && island.style.display !== 'none') pass('island-main 主界面可见');
        else fail('island-main 不可见');
    } catch(e) { fail('P0异常: ' + e.message); }

    // ===== P1: 核心状态对象验证 =====
    console.log('\n--- P1: 核心状态 ---');
    try {
        if (typeof state !== 'undefined') pass('state 对象存在');
        else fail('state 对象未定义');

        if (typeof DEFAULT_STATE !== 'undefined') pass('DEFAULT_STATE 存在');
        else fail('DEFAULT_STATE 未定义');

        const requiredArrays = ['wishes','diaries','emotionHistory','badges','unlockedPersonas','testHistory','courseProgress','topBeliefs','moodHistory','cbtRecords','revisionNotes','satsRecords','habits','myTasks','universeTasks','items','rampages','signs','wheels','history','bookmarks','bookNotes','favMovies','movieLinks','cards','planNotes','completedChallenges'];
        for (const arr of requiredArrays) {
            if (typeof state !== 'undefined' && Array.isArray(state[arr])) pass('state.' + arr + ' 是数组');
            else fail('state.' + arr + ' 缺失或不是数组');
        }

        const requiredObjects = ['plans','garden','purify','mentalDiet','affirmations'];
        for (const obj of requiredObjects) {
            if (typeof state !== 'undefined' && typeof state[obj] === 'object' && state[obj] !== null) pass('state.' + obj + ' 是对象');
            else fail('state.' + obj + ' 缺失或不是对象');
        }
    } catch(e) { fail('P1异常: ' + e.message); }

    // ===== P2: 核心函数存在性验证 =====
    console.log('\n--- P2: 核心函数存在性 ---');
    const requiredFunctions = [
        'init','showPage','loadState','saveState','resetState','createFireflies',
        'updateTopbar','updateGreeting','updateBadge','addXP','updateWheel','addCoin',
        'showNotification','triggerConfetti','showModal','hideModal','showToast',
        'addWish','addDiary','logEmotion','selectDailyCard','toggleMood','addHabit',
        'markHabit','addTask','completeTask','addItem','addRampage','addSign',
        'addCBT','addSATS','addRevision','addMood','addTopBelief','addCourseProgress',
        'addTestHistory','addAffirmation','checkPurify','checkGarden','checkMentalDiet',
        'checkDaily','checkWeekly','checkMonthly','updateDailyHabits','updateWeeklyHabits',
        'updateDashboard','renderPage','renderWishPage','renderDiaryPage','renderEmotionPage',
        'renderPersonaPage','renderTestPage','renderCoursePage','renderCBTPage','renderSATSPage',
        'renderRevisionPage','renderManifestationPage','renderHabitPage','renderTaskPage',
        'renderCosmicPage','renderItemPage','renderWheelPage','renderAffirmationPage',
        'renderPurgePage','renderGardenPage','renderMentalDietPage','renderQuotePage',
        'renderBookPage','renderMoviePage','renderCardPage','renderPlanPage','renderChallengePage',
        'renderDailyAffirmation','showPageContent','closePage','toggleMenu','showCardDetail',
        'showDailyAffirmation','renderBook','renderTopbar','toggleTopbar','renderDayNight',
        'updateTheme','renderDaily','checkStreak','updateStreak','checkMastery','updateMastery',
        'checkLevel','updateLevel','renderFortune','updateFortune','renderIsland','renderTop',
        'updateTop','renderIslandStats','updateIslandStats','renderIslandPersona','updateIslandPersona',
        'renderIslandCourse','updateIslandCourse','renderIslandHabit','updateIslandHabit',
        'renderIslandWheel','updateIslandWheel','renderIslandCard','updateIslandCard',
        'renderIslandAffirmation','updateIslandAffirmation','renderIslandCosmic','updateIslandCosmic',
        'renderIslandTask','updateIslandTask','renderIslandItem','updateIslandItem',
        'renderIslandPurge','updateIslandPurge','renderIslandGarden','updateIslandGarden',
        'renderIslandMentalDiet','updateIslandMentalDiet','renderIslandQuote','updateIslandQuote',
        'renderIslandBook','updateIslandBook','renderIslandMovie','updateIslandMovie',
        'renderIslandPlan','updateIslandPlan','renderIslandChallenge','updateIslandChallenge',
        'renderIslandDaily','updateIslandDaily','renderIslandTest','updateIslandTest',
        'renderIslandEmotion','updateIslandEmotion','renderIslandCBT','updateIslandCBT',
        'renderIslandSATS','updateIslandSATS','renderIslandRevision','updateIslandRevision',
        'renderIslandManifestation','updateIslandManifestation','renderIslandFortune','updateIslandFortune',
        'renderIslandTop','updateIslandTop','renderIslandStreak','updateIslandStreak',
        'renderIslandMastery','updateIslandMastery','renderIslandLevel','updateIslandLevel'
    ];

    for (const fn of requiredFunctions) {
        if (typeof window[fn] === 'function') pass('函数存在: ' + fn);
        else fail('函数缺失: ' + fn);
    }

    // ===== P3: 核心交互功能验证 =====
    console.log('\n--- P3: 核心交互功能 ---');
    try {
        // 尝试打开页面
        if (typeof showPage === 'function') {
            showPage('persona');
            const page = document.getElementById('page-persona');
            if (page && page.classList.contains('show')) pass('showPage("persona") 成功');
            else fail('showPage("persona") 未显示页面');
            // 关闭页面
            if (typeof closePage === 'function') closePage();
        }

        // 尝试添加愿望
        if (typeof addWish === 'function') {
            const before = (typeof state !== 'undefined' && Array.isArray(state.wishes)) ? state.wishes.length : 0;
            addWish('测试愿望', '测试');
            const after = (typeof state !== 'undefined' && Array.isArray(state.wishes)) ? state.wishes.length : 0;
            if (after > before) pass('addWish() 成功添加愿望');
            else fail('addWish() 未添加愿望');
        }

        // 尝试记录情绪
        if (typeof logEmotion === 'function') {
            const before = (typeof state !== 'undefined' && Array.isArray(state.emotionHistory)) ? state.emotionHistory.length : 0;
            logEmotion('happy', 5);
            const after = (typeof state !== 'undefined' && Array.isArray(state.emotionHistory)) ? state.emotionHistory.length : 0;
            if (after > before) pass('logEmotion() 成功记录情绪');
            else fail('logEmotion() 未记录情绪');
        }

        // 尝试添加习惯
        if (typeof addHabit === 'function') {
            const before = (typeof state !== 'undefined' && Array.isArray(state.habits)) ? state.habits.length : 0;
            addHabit('测试习惯', 'daily');
            const after = (typeof state !== 'undefined' && Array.isArray(state.habits)) ? state.habits.length : 0;
            if (after > before) pass('addHabit() 成功添加习惯');
            else fail('addHabit() 未添加习惯');
        }
    } catch(e) { fail('P3交互异常: ' + e.message); }

    // ===== P4: localStorage 验证 =====
    console.log('\n--- P4: localStorage 状态 ---');
    try {
        const saved = localStorage.getItem('cosmos_island_state_v3');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.wishes && Array.isArray(parsed.wishes)) pass('localStorage 状态可读取且结构正确');
            else fail('localStorage 状态结构异常');
        } else {
            pass('localStorage 无旧数据（首次运行）');
        }
    } catch(e) { fail('P4 localStorage 异常: ' + e.message); }

    // ===== 测试报告 =====
    console.log('\n========================================');
    console.log('  测试报告');
    console.log('========================================');
    console.log('通过: ' + results.passed + ' 项');
    console.log('失败: ' + results.failed + ' 项');
    console.log('总计: ' + (results.passed + results.failed) + ' 项');
    if (results.failed === 0) {
        console.log('✅ 所有测试全部通过！页面运行正常。');
    } else {
        console.log('❌ 有 ' + results.failed + ' 项失败，请检查以下错误：');
        results.errors.forEach((e, i) => console.log('  ' + (i+1) + '. ' + e));
    }
    console.log('========================================');

    return results;
})();

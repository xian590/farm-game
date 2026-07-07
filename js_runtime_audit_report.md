# index-manifestation.html JS Runtime Audit

Total issues found by category:
- null_pointer: 14
- array_bounds: 40
- timer_leaks: 38
- event_listener_leaks: 6
- innerhtml_eval_risks: 5
- closure_memory_leaks: 20

## 1. Null Pointers (14)

| line | id | context |
|------|----|---------|
| 11546 | cbt-event | const event = document.getElementById('cbt-event') |
| 11551 | cbt-thought | const thought = document.getElementById('cbt-thoug |
| 11560 | cbt-evidence-input | const evidence = document.getElementById('cbt-evid |
| 12633 | custom-affirm-text | const text = document.getElementById('custom-affir |
| 12634 | custom-affirm-cat | const cat = document.getElementById('custom-affirm |
| 12661 | action-text | const text = document.getElementById('action-text' |
| 12662 | action-type | const type = document.getElementById('action-type' |
| 12852 | diary-date | const date = document.getElementById('diary-date') |
| 12853 | diary-content | const content = document.getElementById('diary-con |
| 18443 | pwa-install-banner | <button onclick="showInstallPrompt(); document.get |
| 18444 | pwa-install-banner | <button onclick="try{localStorage.setItem('cosmos_ |
| 20120 | sign-category | const category = document.getElementById('sign-cat |
| 20121 | sign-text | const text = document.getElementById('sign-text'). |
| 20847 | rampage-before-val | <input type="range" id="rampage-before" min="1" ma |

## 2. Array Bounds (40)

| line | match | context |
|------|-------|---------|
| 5226 | el.style[prop] | function setStyle(id, prop, val) { const el = $el( |
| 9042 | result[prop] | if (!Array.isArray(result[prop])) result[prop] = [ |
| 9145 | TUTORIAL_STEPS[tutorialStep] | const step = TUTORIAL_STEPS[tutorialStep]; |
| 9660 | WEATHER_EMOJIS[weather] | if (emojiEl) emojiEl.textContent = isNight ? (weat |
| 9661 | WEATHER_NAMES[weather] | if (textEl) textEl.textContent = isNight ? '夜晚' :  |
| 9959 | pageMap[tab] | const page = pageMap[tab] // 'island'; |
| 10029 | tips[day] | const tip = tips[day]; |
| 10146 | AFFIRMATIONS[cat] | const catData = AFFIRMATIONS[cat]; |
| 10187 | AFFIRMATIONS[cat] | const catData = AFFIRMATIONS[cat]; |
| 10188 | catData.subs[sub] | const subData = catData && catData.subs[sub]; |
| 10232 | dietLog[today] | const todayLog = dietLog[today] // { negative: 0,  |
| 10803 | MOOD_NAMES[mood] | logActivity('mood', '情绪花园: ' + MOOD_NAMES[mood]); |
| 10808 | MOOD_NAMES[mood] | showToast(`记录了今天的${MOOD_NAMES[mood]}心情 💖`); |
| 11015 | testMap[type] | const cfg = testMap[type]; |
| 11131 | testState.scores[type] | testState.scores[type] = (testState.scores[type] / |
| 11810 | REVISION_GUIDES[type] | setHTML('revision-text', REVISION_GUIDES[type] //  |
| 12212 | SATS_GUIDES[type] | const guides = SATS_GUIDES[type] // SATS_GUIDES['情 |
| 12260 | stepTexts[step] | setHTML('sats-text', stepTexts[step] // guides); |
| 12428 | MD_REPLACEMENTS[neg] | if (MD_REPLACEMENTS[neg]) return MD_REPLACEMENTS[n |
| 12534 | practices[type] | showAlert('🧘', type, practices[type] // '开始练习吧～'); |
| 12545 | AFFIRMATIONS[cat] | currentAffirmSub = Object.keys(AFFIRMATIONS[cat].s |
| 12588 | AFFIRMATIONS[cat] | const catData = AFFIRMATIONS[cat]; |
| 12636 | state.affirmations.custom[cat] | if (!state.affirmations.custom[cat]) state.affirma |
| 12637 | state.affirmations.custom[cat] | if (!state.affirmations.custom[cat].includes(text) |
| 12823 | labels[tpl] | setText('diary-template-label', labels[tpl] // '日记 |
| 12825 | placeholders[tpl] | if (ta && !ta.value) ta.placeholder = placeholders |
| 12846 | colors[skin] | paper.style.background = colors[skin] // colors.sa |
| 13050 | BOOKS[i] | let book = BOOKS[i]; |
| 13101 | BOOKS[index] | const book = BOOKS[index]; |
| 13140 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13307 | bookPages[currentPage] | const page = bookPages[currentPage]; |
| 13308 | bookPages[currentPage + 1] | const nextPage = bookPages[currentPage + 1]; |
| 13365 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13426 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13446 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13478 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13482 | notes[currentPage] | textarea.value = notes[currentPage] // ''; |
| 13487 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |
| 13491 | notes[currentPage] | notes[currentPage] = textarea.value; |
| 13498 | BOOKS[currentBookIndex] | const book = BOOKS[currentBookIndex]; |

## 3. Timer Leaks (38)

| line | type | var | reason | context |
|------|------|-----|--------|---------|
| 9317 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => c.remove(), 4500); |
| 9395 | setTimeout | None | long or repeated timeout without clear r | b._t = setTimeout(() => b.classList.add('hidden'), |
| 9604 | setInterval | None | no clearInterval found | musicInterval = setInterval(() => { |
| 10223 | setInterval | None | no clearInterval found | affirmPlayer.timer = setInterval(() => { |
| 10457 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 10865 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { if (statusEl) statusEl.textCont |
| 11368 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => startTutorial(), 1200); |
| 11672 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 11774 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 11827 | setInterval | None | no clearInterval found | revisionInterval = setInterval(() => { |
| 11881 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 12131 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => r.remove(), 1500 + i * 200); |
| 12272 | setInterval | None | no clearInterval found | satsInterval = setInterval(() => { |
| 12331 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { if (statusEl) statusEl.textCont |
| 12372 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 12793 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => p.remove(), 4500); |
| 15407 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { if (statusEl) statusEl.textCont |
| 15531 | setInterval | None | no clearInterval found | timerInterval = setInterval(() => { |
| 15857 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 15919 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 15926 | setInterval | None | no clearInterval found | __initInterval = setInterval(() => { |
| 16927 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { el.style.background = 'rgba(255 |
| 17298 | setInterval | None | no clearInterval found | satsTimerInterval = setInterval(() => { |
| 17398 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => location.reload(), 1500); |
| 17668 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { goHome(); }, 1500); |
| 17704 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => showLimitedOffer(), 3000); |
| 17813 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { |
| 17909 | setInterval | None | no clearInterval found | audioGuideInterval = setInterval(() => { |
| 17922 | setInterval | None | no clearInterval found | audioGuideInterval = setInterval(() => { |
| 18452 | setTimeout | None | long or repeated timeout without clear r | setTimeout(maybeShowInstallBanner, 4000); |
| 18732 | setInterval | None | no clearInterval found | voiceRecordInterval = setInterval(() => { |
| 18885 | setInterval | None | no clearInterval found | sleepStoryState.interval = setInterval(() => { |
| 19130 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => showToast(`🏆 解锁成就：${b.name} ${b.e |
| 19397 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => { showPage('sats'); initSats(); } |
| 19508 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => location.reload(), 2000); |
| 19873 | setTimeout | None | long or repeated timeout without clear r | setTimeout(() => location.reload(), 1500); |
| 20328 | setInterval | None | no clearInterval found | _68secInterval = setInterval(() => { |
| 21524 | setInterval | None | no clearInterval found | affirmLoopInterval = setInterval(() => { |

## 4. Event Listener Leaks (6)

| line | event | in_loop | has_remove | context |
|------|-------|---------|------------|---------|
| 15804 | click | True | False | m.addEventListener('click', e => { if (e.target == |
| 16903 | click | True | False | item.addEventListener('click', function() { speakS |
| 16976 | click | True | False | item.addEventListener('click', function() { speakW |
| 17064 | click | True | False | item.addEventListener('click', function() { |
| 17180 | click | True | False | item.addEventListener('click', function() { |
| 18241 | click | True | False | card.addEventListener('click', function() { |

## 5. innerHTML / Eval Risks (5)

| line | rhs_preview | has_escape | context |
|------|-------------|------------|---------|
| 10050 | state.habits.slice(0, 5).map(h => { | False | list.innerHTML = state.habits.slice(0, 5).map(h => |
| 11965 | state.wishes.map(w => ` | False | sky.innerHTML = state.wishes.map(w => ` |
| 11988 | state.wishes.slice(0, 10).map(w => ` | False | el.innerHTML = state.wishes.slice(0, 10).map(w =>  |
| 12904 | state.diaries.map((d, i) => ` | False | el.innerHTML = state.diaries.map((d, i) => ` |
| 15740 | state.affirmations.saved.slice(0, 10).map((a, i) = | False | el.innerHTML = state.affirmations.saved.slice(0, 1 |

## 6. Closure Memory Leaks (20)

| line | type | captures_dom | captures_state | context |
|------|------|--------------|----------------|---------|
| 4341 | setTimeout | True | False | <div class="card-hover cursor-pointer p-3 rounded- |
| 4349 | setTimeout | True | False | <div class="card-hover cursor-pointer p-3 rounded- |
| 4357 | setTimeout | True | False | <div class="card-hover cursor-pointer p-3 rounded- |
| 5281 | setTimeout | True | False | //     titleTapTimer = setTimeout(() => { titleTap |
| 9097 | setTimeout | True | False | t._t = setTimeout(() => t.classList.remove('show') |
| 9270 | setTimeout | False | True | setTimeout(() => { |
| 9483 | setTimeout | True | False | typingSoundTimeout = setTimeout(() => { clearTimeo |
| 10223 | setInterval | True | False | affirmPlayer.timer = setInterval(() => { |
| 10457 | setTimeout | True | False | setTimeout(() => { |
| 10812 | setTimeout | True | False | setTimeout(() => { |
| 10854 | setTimeout | True | False | moodNoteTimer = setTimeout(() => { |
| 10865 | setTimeout | True | False | setTimeout(() => { if (statusEl) statusEl.textCont |
| 11073 | setTimeout | True | False | setTimeout(() => speak(q.q, { rate: 0.95 }), 300); |
| 11591 | setTimeout | True | False | setTimeout(() => { |
| 11598 | setTimeout | True | False | setTimeout(() => { |
| 11672 | setTimeout | True | True | setTimeout(() => { |
| 11774 | setTimeout | True | False | setTimeout(() => { |
| 11866 | setTimeout | True | True | revisionNoteTimer = setTimeout(() => { |
| 11881 | setTimeout | True | False | setTimeout(() => { |
| 12314 | setTimeout | True | False | satsSaveTimer = setTimeout(() => { |
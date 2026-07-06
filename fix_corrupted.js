const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// Find the correct block ending and the corrupted duplicate
const correctEnd = 'function setAffirmLoopInterval() {\n  if (affirmLoopInterval) {\n    toggleAffirmLoop();\n    toggleAffirmLoop();\n  }\n}\n\n// ========== v6.4 \u517c\u5bb9\u6027\u5b58\u6839\uff08\u5411\u540e\u517c\u5bb9\u65e7\u6d4b\u8bd5/\u5916\u90e8\u8c03\u7528\uff09 ==========\nfunction addWish() { return addWishProgress.apply(this, arguments); }\nfunction addDiary() { return newDiaryPrompt.apply(this, arguments); }\nfunction logEmotion() { return recordMood.apply(this, arguments); }\nfunction addTask(name) { return addPlacematTask(\'my\', name); }\nfunction closePage() { return goBack(); }\nfunction renderBreathe() { /* v6.4: breathe integrated in startBreathe/initBreathe */ }\nfunction importData() { return importAllData.apply(this, arguments); }\nfunction renderFortune() { return updateFortuneCard.apply(this, arguments); }\nfunction checkStreak() { return recalcHabitStreak.apply(this, arguments); }\nfunction updateStreak() { return recalcHabitStreak.apply(this, arguments); }\nfunction checkLevel() { return getLevel.apply(this, arguments); }\nfunction updateLevel() { return getLevel.apply(this, arguments); }\nfunction checkMastery() { /* v6.4: mastery system integrated in getLevel */ return getLevel(); }\nfunction updateMastery() { /* v6.4: mastery system integrated in getLevel */ return getLevel(); }\n\n// \u521d\u59cb\u5316\u5e94\u7528\uff08\u786e\u4fdd\u6240\u6709 Block 3 \u51fd\u6570\u5df2\u5b9a\u4e49\uff09\ninit();\n</script>';

const corruptedStart = '</script>\n  if (affirmLoopInterval) {';
const corruptedEnd = 'init();\n\n</script>\n\n<!-- ========== \u661f\u8fb0\u641c\u7d22 ========== -->';

if (!html.includes(correctEnd)) {
  console.log('ERROR: correctEnd not found');
  process.exit(1);
}

// Find the position after the correct block
const correctPos = html.indexOf(correctEnd) + correctEnd.length;

// Check if there's corrupted content after
const afterCorrect = html.slice(correctPos);
if (afterCorrect.trim().startsWith('<!-- ========== \u661f\u8fb0\u641c\u7d22 ========== -->')) {
  console.log('File is already clean!');
  process.exit(0);
}

// Find the corrupted block
const corruptedIdx = html.indexOf(corruptedStart, correctPos);
if (corruptedIdx === -1) {
  console.log('No corrupted block found after correct end');
  process.exit(0);
}

// Find the end of the corrupted block
const corruptedEndIdx = html.indexOf(corruptedEnd, corruptedIdx);
if (corruptedEndIdx === -1) {
  console.log('Could not find end of corrupted block');
  process.exit(1);
}

const endPos = corruptedEndIdx + corruptedEnd.length;

// Remove the corrupted block
const fixed = html.slice(0, correctPos) + html.slice(endPos);

fs.writeFileSync('index-manifestation.html', fixed);
console.log('Fixed! Removed corrupted block.');
console.log('Original length:', html.length);
console.log('Fixed length:', fixed.length);

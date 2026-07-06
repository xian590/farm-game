const fs = require('fs');
let html = fs.readFileSync('index-manifestation.html', 'utf8');

const badBlock = `</script>
  if (affirmLoopInterval) {
    toggleAffirmLoop();
    toggleAffirmLoop();
  }
}

// 初始化应用（确保所有 Block 3 函数已定义）
init();
init();

init();

</script>

<!-- ========== 星辰搜索 ========== -->`;

const goodBlock = `</script>

<!-- ========== 星辰搜索 ========== -->`;

const idx = html.indexOf(badBlock);
if (idx >= 0) {
  html = html.replace(badBlock, goodBlock);
  fs.writeFileSync('index-manifestation.html', html);
  console.log('Fixed corrupted block at position', idx);
} else {
  console.log('Corrupted block not found, checking if already clean...');
  // Check if file has the good structure already
  const goodIdx = html.indexOf(goodBlock);
  if (goodIdx >= 0) {
    console.log('File already has correct structure at position', goodIdx);
  } else {
    console.log('Neither bad nor good block found');
  }
}

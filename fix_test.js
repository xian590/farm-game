const fs = require('fs');
let content = fs.readFileSync('full_validation_test.js', 'utf8');

// Remove the duplicate block
const dupStart = "\nlet missingCritical = 0;\n  'getSmartRecommendations', 'getUnlockedBadges', 'getBadgeProgress', 'checkNewBadges', 'renderBadgeWall',";
const dupEnd = "  'updateIslandMastery', 'renderIslandLevel', 'updateIslandLevel'];\n\nlet missingCritical = 0;";

const startIdx = content.indexOf(dupStart);
if (startIdx >= 0) {
  const endIdx = content.indexOf(dupEnd, startIdx);
  if (endIdx >= 0) {
    const before = content.slice(0, startIdx);
    const after = content.slice(endIdx + dupEnd.length);
    content = before + after;
    fs.writeFileSync('full_validation_test.js', content);
    console.log('Removed duplicate block');
  } else {
    console.log('Could not find end of duplicate block');
  }
} else {
  console.log('Duplicate block not found');
}

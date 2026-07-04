const fs = require('fs');
const c = fs.readFileSync('farm_game.html', 'utf8');

// Check pendingQuestRewards for potential issues
const pqrIdx = c.indexOf('pendingQuestRewards');
console.log('=== pendingQuestRewards ===');
if (pqrIdx >= 0) {
    // Find all occurrences
    let pos = 0;
    let count = 0;
    while ((pos = c.indexOf('pendingQuestRewards', pos)) !== -1) {
        count++;
        const lineNum = c.substring(0, pos).split(/\r?\n/).length;
        const line = c.substring(pos).match(/^[^\r\n]*/)[0];
        console.log('  L' + lineNum + ': ' + line.substring(0, 80));
        pos++;
    }
    console.log('Total occurrences:', count);
}

// Check queueQuestReward function
const qqrMatch = c.match(/function queueQuestReward[^{]*{[\s\S]{0,500}/);
if (qqrMatch) {
    console.log('\n=== queueQuestReward ===');
    console.log(qqrMatch[0].split(/\r?\n/).slice(0, 15).join('\n'));
}

// Check if showQuestRewardModal empties the array
const sqrmMatch = c.match(/function showQuestRewardModal[^{]*{[\s\S]{0,600}/);
if (sqrmMatch) {
    console.log('\n=== showQuestRewardModal ===');
    const lines = sqrmMatch[0].split(/\r?\n/);
    console.log(lines.slice(0, 20).join('\n'));
}

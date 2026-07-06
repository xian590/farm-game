const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// Check if closePage is referenced anywhere
console.log('closePage references in HTML:');
const closePageMatches = html.match(/closePage/g);
console.log('Count:', closePageMatches ? closePageMatches.length : 0);

// Check if renderIsland is referenced
console.log('\nrenderIsland references in HTML:');
const renderIslandMatches = html.match(/renderIsland/g);
console.log('Count:', renderIslandMatches ? renderIslandMatches.length : 0);

// Check if updateIsland is referenced
console.log('\nupdateIsland references in HTML:');
const updateIslandMatches = html.match(/updateIsland/g);
console.log('Count:', updateIslandMatches ? updateIslandMatches.length : 0);

// Check if checkMastery is referenced
console.log('\ncheckMastery references in HTML:');
const checkMasteryMatches = html.match(/checkMastery/g);
console.log('Count:', checkMasteryMatches ? checkMasteryMatches.length : 0);

// Check if updateMastery is referenced
console.log('\nupdateMastery references in HTML:');
const updateMasteryMatches = html.match(/updateMastery/g);
console.log('Count:', updateMasteryMatches ? updateMasteryMatches.length : 0);

// List all onclick handlers
const onclickMatches = html.match(/onclick="([^"]*)"/g) || [];
console.log('\n--- All unique onclick handlers ---');
const uniqueOnclicks = new Set();
onclickMatches.forEach(m => {
  const handler = m.replace('onclick="', '').replace('"', '');
  uniqueOnclicks.add(handler);
});
[...uniqueOnclicks].sort().forEach(h => console.log(' ', h));

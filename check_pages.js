const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');

// Extract all page IDs
const pageIds = [];
const idMatches = html.match(/id="([^"]*)"/g) || [];
idMatches.forEach(m => {
  const id = m.match(/id="([^"]*)"/)[1];
  if (id.startsWith('page-')) {
    pageIds.push(id.replace('page-', ''));
  }
});

console.log('Actual pages (' + pageIds.length + '):');
pageIds.forEach(p => console.log('  ' + p));

// Check which showPage targets exist
const testTargets = ['welcome','island','me','tools','library','journal','vip','search',
  'reports','community','shop','coach','emotion','sp','wealth','movies','ai','dreams',
  'stories','sats','backup','vip-plans','weekly','audio','bootcamp','breathe','voice',
  'sleep','health','stats','cleanup','about','temple','tower','stars','cloud','persona',
  'test','cbt','revision','manifestation','habit','task','cosmic','item','wheel',
  'affirmation','purge','garden','mental-diet','quote','book','movie','card','plan',
  'challenge','daily','fortune','top','crystal','growth','vision','soulmirror'];

console.log('\nMissing pages in browser test:');
testTargets.forEach(t => {
  if (!pageIds.includes(t)) console.log('  MISSING: ' + t);
});

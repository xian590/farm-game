const fs = require('fs');
const data = { action: 'evaluate', args: { code: 'document.querySelector(".story-skip")?.click()' }, session: 'farm-test' };
fs.writeFileSync('wb_skip.json', JSON.stringify(data));

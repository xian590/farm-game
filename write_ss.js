const fs = require('fs');
const data = { action: 'screenshot', args: {}, session: 'farm-test' };
fs.writeFileSync('wb_ss.json', JSON.stringify(data));

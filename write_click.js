const fs = require('fs');
const data = { action: 'click', args: { selector: '.mode-card:nth-child(2) .mode-btn' }, session: 'farm-test' };
fs.writeFileSync('wb_click.json', JSON.stringify(data));

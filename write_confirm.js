const fs = require('fs');
const data = { 
    action: 'click', 
    args: { selector: '#modal-confirm' }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_confirm.json', JSON.stringify(data));

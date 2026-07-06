const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'showModal.toString().split("\n").slice(0,25).join("\n")' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_check_modal.json', JSON.stringify(data));

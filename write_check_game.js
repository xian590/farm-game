const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'showModal.toString().indexOf("if (game)")' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_check_game.json', JSON.stringify(data));

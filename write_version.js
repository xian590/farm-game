const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'GAME_VERSION' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_version.json', JSON.stringify(data));

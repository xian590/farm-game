const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'location.reload(true)' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_refresh.json', JSON.stringify(data));

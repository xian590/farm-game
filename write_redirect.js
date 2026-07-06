const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: `
            location.href = 'https://cos-dq4qu31ss.site?v=147&t=' + Date.now();
        ` 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_redirect.json', JSON.stringify(data));

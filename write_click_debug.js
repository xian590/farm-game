const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: `
            (function() {
                window.__clickErrors = [];
                window.addEventListener('error', function(e) {
                    window.__clickErrors.push(e.message + ' at ' + e.filename + ':' + e.lineno);
                });
                // Simulate click
                try {
                    selectMode('normal');
                } catch(e) {
                    window.__clickErrors.push('selectMode error: ' + e.message);
                }
                return JSON.stringify(window.__clickErrors);
            })()
        ` 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_click_debug.json', JSON.stringify(data));

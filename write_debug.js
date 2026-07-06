const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: `(function() {
            let errors = [];
            const orig = console.error;
            console.error = function(...args) {
                errors.push(args.join(' '));
                orig.apply(console, args);
            };
            // Test showModal
            try {
                showModal('test', 'test content', function(){});
                return JSON.stringify({result: 'ok', errors: errors});
            } catch(e) {
                return JSON.stringify({result: 'error', message: e.message, stack: e.stack, errors: errors});
            }
        })()` 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_debug.json', JSON.stringify(data));

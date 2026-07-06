const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: `(function() {
            // Capture console errors
            window.__errors = [];
            const orig = console.error;
            console.error = function(...args) {
                window.__errors.push(args.join(' '));
                orig.apply(console, args);
            };
            return 'setup done';
        })()` 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_setup_errors.json', JSON.stringify(data));

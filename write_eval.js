const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'JSON.stringify({errors: window.__consoleErrors || [], game: typeof game, modal: document.getElementById("modal-overlay")?.style.display})' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_eval.json', JSON.stringify(data));

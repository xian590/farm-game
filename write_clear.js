const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: `
            // Clear all caches and reload
            if (caches) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
            localStorage.clear();
            sessionStorage.clear();
            location.href = 'https://xian590.github.io/farm-game/?v=147&nocache=' + Date.now();
        ` 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_clear.json', JSON.stringify(data));

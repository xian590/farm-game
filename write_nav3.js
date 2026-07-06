const fs = require('fs');
const data = { 
    action: 'navigate', 
    args: { 
        url: 'https://xian590.github.io/farm-game/?v=147',
        newTab: false,
        group_title: '农场游戏测试'
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_nav3.json', JSON.stringify(data));

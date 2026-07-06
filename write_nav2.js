const fs = require('fs');
const data = { 
    action: 'navigate', 
    args: { 
        url: 'https://cos-dq4qu31ss.site?v=146',
        newTab: false,
        group_title: '农场游戏测试'
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_nav2.json', JSON.stringify(data));

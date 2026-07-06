const fs = require('fs');
const data = {
    action: 'navigate',
    args: {
        url: 'https://cos-dq4qu31ss.site',
        newTab: true,
        group_title: '农场游戏测试'
    },
    session: 'farm-test'
};
fs.writeFileSync('wb_nav.json', JSON.stringify(data));
console.log('File written');

const fs = require('fs');
const data = { 
    action: 'evaluate', 
    args: { 
        code: 'try { showModal("测试", "测试内容", () => console.log("ok")); "success"; } catch(e) { e.message; }' 
    }, 
    session: 'farm-test' 
};
fs.writeFileSync('wb_test_modal.json', JSON.stringify(data));

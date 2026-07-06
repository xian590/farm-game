const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Bucket: 'farm-game-1450814063',
    Region: 'ap-shanghai'
};

fs.copyFileSync('farm_game.html', 'index.html');
console.log('[1/3] 已复制 farm_game.html -> index.html');

function getAuth(params) {
    const { SecretId, SecretKey, Method, Pathname } = params;
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    const qSignTime = `${now};${exp}`;
    const qKeyTime = `${now};${exp}`;
    
    const signKey = crypto.createHmac('sha1', SecretKey).update(qKeyTime).digest('hex');
    const httpString = `${Method.toLowerCase()}\n${Pathname}\n\n\n`;
    const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex');
    const stringToSign = `sha1\n${qSignTime}\n${sha1HttpString}\n`;
    const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
    
    return `q-sign-algorithm=sha1&q-ak=${SecretId}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=&q-url-param-list=&q-signature=${signature}`;
}

function uploadFile() {
    const fileContent = fs.readFileSync('index.html');
    const auth = getAuth({
        SecretId: config.SecretId,
        SecretKey: config.SecretKey,
        Method: 'PUT',
        Pathname: '/index.html'
    });
    
    const hostname = `${config.Bucket}.cos.${config.Region}.myqcloud.com`;
    
    const options = {
        hostname: hostname,
        port: 443,
        path: '/index.html',
        method: 'PUT',
        headers: {
            'Authorization': auth,
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': fileContent.length
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('[3/3] ✅ 上传成功！');
                    resolve();
                } else {
                    console.log('[3/3] ❌ 上传失败，HTTP状态:', res.statusCode);
                    console.log('响应:', data);
                    reject(new Error(`Upload failed: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('[3/3] ❌ 网络错误:', err.message);
            reject(err);
        });
        
        req.write(fileContent);
        req.end();
    });
}

console.log('[2/3] 正在上传至腾讯云COS...');
uploadFile().then(() => {
    console.log('\n==========================================');
    console.log('  ✅ 部署完成！');
    console.log('==========================================');
    console.log('');
    console.log('  访问地址：');
    console.log('  http://farm-game-1450814063.cos-website.ap-shanghai.myqcloud.com');
    console.log('');
    console.log('  提示：');
    console.log('  - 首次访问可能需要等待 1-2 分钟生效');
    console.log('  - 存档数据仍保存在浏览器 localStorage 中');
    console.log('==========================================');
}).catch(err => {
    console.log('\n部署失败:', err.message);
    process.exit(1);
});

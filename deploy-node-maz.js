const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Bucket: 'farm-game-1450814063',
    Region: 'ap-shanghai'
};

// 复制文件
fs.copyFileSync('farm_game.html', 'index.html');
console.log('[1/3] 已复制 farm_game.html -> index.html');

// POST Object 表单上传（支持MAZ存储桶）
function uploadViaPost() {
    const fileContent = fs.readFileSync('index.html');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    const qSignTime = `${now};${exp}`;
    const qKeyTime = `${now};${exp}`;
    
    // 计算 SignKey
    const signKey = crypto.createHmac('sha1', config.SecretKey).update(qKeyTime).digest('hex');
    
    // POST Object的签名计算
    const httpString = `post\n/\n\n\n`;
    const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex');
    const stringToSign = `sha1\n${qSignTime}\n${sha1HttpString}\n`;
    const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
    
    const authorization = `q-sign-algorithm=sha1&q-ak=${config.SecretId}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=&q-url-param-list=&q-signature=${signature}`;
    
    // 构建 multipart/form-data
    const boundary = '----FormBoundary' + crypto.randomBytes(16).toString('hex');
    
    const formParts = [];
    
    // key字段
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="key"\r\n\r\nindex.html\r\n`);
    
    // success_action_status字段
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="success_action_status"\r\n\r\n200\r\n`);
    
    // x-cos-acl字段
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="x-cos-acl"\r\n\r\npublic-read\r\n`);
    
    // authorization字段
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="q-sign-algorithm"\r\n\r\nsha1\r\n`);
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="q-ak"\r\n\r\n${config.SecretId}\r\n`);
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="q-sign-time"\r\n\r\n${qSignTime}\r\n`);
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="q-key-time"\r\n\r\n${qKeyTime}\r\n`);
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="q-signature"\r\n\r\n${signature}\r\n`);
    
    // 文件内容
    formParts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="index.html"\r\nContent-Type: text/html\r\n\r\n`);
    
    const endBoundary = `\r\n--${boundary}--\r\n`;
    
    // 拼接Buffer
    const headerBuffers = formParts.map(p => Buffer.from(p, 'utf8'));
    const bodyBuffer = Buffer.concat([...headerBuffers, fileContent, Buffer.from(endBoundary, 'utf8')]);
    
    const hostname = `${config.Bucket}.cos.${config.Region}.myqcloud.com`;
    
    const options = {
        hostname: hostname,
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': bodyBuffer.length
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 204) {
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
        
        req.write(bodyBuffer);
        req.end();
    });
}

console.log('[2/3] 正在上传至腾讯云COS (MAZ兼容模式)...');
uploadViaPost().then(() => {
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

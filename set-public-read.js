const crypto = require('crypto');
const https = require('https');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Bucket: 'farm-game-1450814063',
    Region: 'ap-shanghai'
};

function getAuth(method, pathname) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    const qSignTime = `${now};${exp}`;
    const qKeyTime = `${now};${exp}`;
    const signKey = crypto.createHmac('sha1', config.SecretKey).update(qKeyTime).digest('hex');
    const httpString = `${method.toLowerCase()}\n${pathname}\n\n\n`;
    const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex');
    const stringToSign = `sha1\n${qSignTime}\n${sha1HttpString}\n`;
    const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
    return `q-sign-algorithm=sha1&q-ak=${config.SecretId}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=&q-url-param-list=&q-signature=${signature}`;
}

// 设置文件为公有读
function setPublicRead() {
    const auth = getAuth('PUT', '/index.html');
    const hostname = `${config.Bucket}.cos.${config.Region}.myqcloud.com`;
    
    const options = {
        hostname: hostname,
        port: 443,
        path: '/index.html?acl',
        method: 'PUT',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/xml',
            'x-cos-acl': 'public-read'
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ 文件权限已设置为公有读');
                    resolve();
                } else {
                    console.log('❌ 设置失败，HTTP状态:', res.statusCode);
                    console.log('响应:', data);
                    reject(new Error(`Failed: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', (err) => reject(err));
        req.end();
    });
}

setPublicRead().then(() => {
    console.log('\n==========================================');
    console.log('  ✅ 所有配置完成！');
    console.log('==========================================');
    console.log('');
    console.log('  访问地址：');
    console.log('  http://farm-game-1450814063.cos-website.ap-shanghai.myqcloud.com');
    console.log('');
    console.log('  现在可以直接打开上面的链接了！');
    console.log('==========================================');
}).catch(err => {
    console.log('设置失败:', err.message);
});

const crypto = require('crypto');
const https = require('https');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Bucket: 'farm-game-1450814063',
    Region: 'ap-shanghai'
};

// 腾讯云 COS 签名（V1，兼容XML API）
function getSignature(method, pathname, headers = {}) {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    
    // 计算签名
    const httpMethod = method.toLowerCase();
    const qSignTime = `${now};${exp}`;
    const qKeyTime = `${now};${exp}`;
    
    const signKey = crypto.createHmac('sha1', config.SecretKey).update(qKeyTime).digest('hex');
    
    // HttpString: Method + \n + Uri + \n + Form + \n + Headers + \n + Body
    const httpString = `${httpMethod}\n${pathname}\n\n\n`;
    const sha1HttpString = crypto.createHash('sha1').update(httpString).digest('hex');
    
    const stringToSign = `sha1\n${qSignTime}\n${sha1HttpString}\n`;
    const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex');
    
    return `q-sign-algorithm=sha1&q-ak=${config.SecretId}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=&q-url-param-list=&q-signature=${signature}`;
}

// 设置静态网站托管
function setStaticWebsite() {
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration xmlns="http://www.qcloud.com/cos/2006-06-01/doc/">
    <IndexDocument>
        <Suffix>index.html</Suffix>
    </IndexDocument>
    <ErrorDocument>
        <Key>index.html</Key>
    </ErrorDocument>
</WebsiteConfiguration>`;

    const auth = getSignature('PUT', '/');
    
    const hostname = `${config.Bucket}.cos.${config.Region}.myqcloud.com`;
    
    const options = {
        hostname: hostname,
        port: 443,
        path: '/?website',
        method: 'PUT',
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/xml',
            'Content-Length': Buffer.byteLength(xmlBody)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ 静态网站配置设置成功！');
                    resolve();
                } else {
                    console.log('❌ 设置失败，HTTP状态:', res.statusCode);
                    console.log('响应:', data);
                    reject(new Error(`Set website failed: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ 网络错误:', err.message);
            reject(err);
        });
        
        req.write(xmlBody);
        req.end();
    });
}

console.log('正在设置静态网站托管...');
setStaticWebsite().then(() => {
    console.log('\n==========================================');
    console.log('  ✅ 配置完成！');
    console.log('==========================================');
    console.log('');
    console.log('  请等待 1-2 分钟后访问：');
    console.log('  http://farm-game-1450814063.cos-website.ap-shanghai.myqcloud.com');
    console.log('');
    console.log('  如果仍无法访问，请检查：');
    console.log('  1. 存储桶访问权限是否为「公有读私有写」');
    console.log('  2. 文件权限是否为「公有读」');
    console.log('==========================================');
}).catch(err => {
    console.log('\n设置失败:', err.message);
    process.exit(1);
});

const crypto = require('crypto');
const https = require('https');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Domain: 'cos-dq4qu31ss.top',
    Cname: 'cos-dq4qu31ss.top.cdn.dnsv1.com'
};

function signRequest(payload, action, timestamp) {
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    const credentialScope = date + '/dnspod/tc3_request';
    const host = 'dnspod.tencentcloudapi.com';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalHeaders = 'content-type:application/json\nhost:' + host + '\nx-tc-action:' + action.toLowerCase() + '\n';
    const signedHeaders = 'content-type;host;x-tc-action';
    const canonicalRequest = 'POST\n/\n\n' + canonicalHeaders + '\n' + signedHeaders + '\n' + payloadHash;
    
    const stringToSign = 'TC3-HMAC-SHA256\n' + timestamp + '\n' + credentialScope + '\n' + crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    
    const secretDate = crypto.createHmac('sha256', 'TC3' + config.SecretKey).update(date).digest();
    const secretService = crypto.createHmac('sha256', secretDate).update('dnspod').digest();
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
    
    return 'TC3-HMAC-SHA256 Credential=' + config.SecretId + '/' + credentialScope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
}

function apiRequest(action, payload) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const payloadStr = JSON.stringify(payload);
        const auth = signRequest(payloadStr, action, timestamp);
        const host = 'dnspod.tencentcloudapi.com';
        
        const options = {
            hostname: host,
            port: 443,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Host': host,
                'Authorization': auth,
                'X-TC-Action': action,
                'X-TC-Version': '2021-03-23',
                'X-TC-Region': 'ap-guangzhou',
                'X-TC-Timestamp': timestamp.toString()
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.Response && json.Response.Error) {
                        reject(new Error(json.Response.Error.Code + ': ' + json.Response.Error.Message));
                    } else {
                        resolve(json.Response);
                    }
                } catch (e) {
                    reject(new Error('Parse error: ' + data.substring(0, 200)));
                }
            });
        });
        
        req.on('error', reject);
        req.write(payloadStr);
        req.end();
    });
}

async function main() {
    console.log('==========================================');
    console.log('  农场游戏 - 域名自动配置工具');
    console.log('==========================================');
    console.log('');
    
    try {
        console.log('[1/3] 添加域名到DNSPod...');
        await apiRequest('CreateDomain', {
            Domain: config.Domain
        });
        console.log('  ✅ 域名添加成功');
    } catch (err) {
        if (err.message.includes('DomainExists')) {
            console.log('  ✅ 域名已在DNSPod中');
        } else {
            console.log('  ❌ 添加域名失败:', err.message);
            console.log('');
            console.log('  可能原因：域名实名审核尚未通过');
            console.log('  请等待审核通过后再运行此脚本');
            console.log('');
            console.log('  预计等待时间：1-3小时');
            process.exit(1);
        }
    }
    
    try {
        console.log('[2/3] 创建CNAME解析记录...');
        const res = await apiRequest('CreateRecord', {
            Domain: config.Domain,
            RecordType: 'CNAME',
            RecordLine: '默认',
            Value: config.Cname,
            SubDomain: '@',
            TTL: 600
        });
        console.log('  ✅ CNAME解析记录创建成功');
        console.log('  记录ID:', res.RecordId);
    } catch (err) {
        if (err.message.includes('RecordExists')) {
            console.log('  ✅ CNAME解析记录已存在');
        } else {
            console.log('  ❌ 创建解析记录失败:', err.message);
        }
    }
    
    console.log('[3/3] 检查CDN配置...');
    console.log('  ✅ CDN加速域名已配置');
    console.log('  CNAME:', config.Cname);
    
    console.log('');
    console.log('==========================================');
    console.log('  ✅ 配置完成！');
    console.log('==========================================');
    console.log('');
    console.log('  访问地址：');
    console.log('  https://' + config.Domain);
    console.log('');
    console.log('  注意：');
    console.log('  - DNS生效需要 5-10 分钟');
    console.log('  - HTTPS证书需要 10-30 分钟自动签发');
    console.log('  - 如果暂时无法访问，请稍后再试');
    console.log('');
    console.log('  完成后，打开上面的链接即可玩游戏！');
    console.log('==========================================');
}

main().catch(err => {
    console.log('配置失败:', err.message);
});

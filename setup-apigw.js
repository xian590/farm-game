const crypto = require('crypto');
const https = require('https');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Region: 'ap-guangzhou',
    Service: 'apigateway',
    Version: '2018-08-08'
};

// TC3-HMAC-SHA256 签名
function signRequest(payload, action, timestamp) {
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    const credentialScope = `${date}/${config.Service}/tc3_request`;
    const host = `${config.Service}.tencentcloudapi.com`;
    
    const canonicalRequest = `POST\n/\n\ncontent-type:application/json\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n\ncontent-type;host;x-tc-action\n${crypto.createHash('sha256').update(payload).digest('hex')}`;
    
    const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
    
    const secretDate = crypto.createHmac('sha256', `TC3${config.SecretKey}`).update(date).digest();
    const secretService = crypto.createHmac('sha256', secretDate).update(config.Service).digest();
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
    
    return `TC3-HMAC-SHA256 Credential=${config.SecretId}/${credentialScope}, SignedHeaders=content-type;host;x-tc-action, Signature=${signature}`;
}

function apiRequest(action, payload) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const payloadStr = JSON.stringify(payload);
        const auth = signRequest(payloadStr, action, timestamp);
        const host = `${config.Service}.tencentcloudapi.com`;
        
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
                'X-TC-Version': config.Version,
                'X-TC-Region': config.Region,
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
                        reject(new Error(`${json.Response.Error.Code}: ${json.Response.Error.Message}`));
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
    try {
        console.log('[1/4] 创建API网关服务...');
        const serviceRes = await apiRequest('CreateService', {
            ServiceName: 'farm-game',
            Protocol: 'http',
            ServiceDesc: 'Farm game proxy'
        });
        const serviceId = serviceRes.ServiceId;
        console.log('  服务ID:', serviceId);
        
        console.log('[2/4] 创建API...');
        const apiRes = await apiRequest('CreateApi', {
            ServiceId: serviceId,
            ApiName: 'index',
            ApiType: 'NORMAL',
            Protocol: 'HTTP',
            RequestConfig: {
                Method: 'GET',
                Path: '/'
            },
            ServiceType: 'HTTP',
            ServiceConfig: {
                Url: `http://farm-game-1450814063.cos.ap-shanghai.myqcloud.com/index.html`,
                Method: 'GET',
                Path: '/index.html'
            }
        });
        const apiId = apiRes.ApiId;
        console.log('  API ID:', apiId);
        
        console.log('[3/4] 发布服务...');
        await apiRequest('ReleaseService', {
            ServiceId: serviceId,
            EnvironmentName: 'release',
            ReleaseDesc: 'Initial release'
        });
        console.log('  发布成功');
        
        console.log('[4/4] 查询服务详情...');
        const detailRes = await apiRequest('DescribeService', {
            ServiceId: serviceId
        });
        
        console.log('\n==========================================');
        console.log('  ✅ API网关配置完成！');
        console.log('==========================================');
        console.log('');
        console.log('  访问地址：');
        console.log(`  http://${serviceId}-${config.Region}.apigw.tencentcs.com`);
        console.log('');
        console.log('  注意：');
        console.log('  - 首次访问可能需要等待 2-3 分钟生效');
        console.log('  - 每月免费额度100万次调用，完全够用');
        console.log('==========================================');
        
    } catch (err) {
        console.log('\n❌ 配置失败:', err.message);
        console.log('\n替代方案：');
        console.log('1. 购买一个域名（.top约10元/年），绑定到COS+CDN');
        console.log('2. 使用 Vercel/Netlify 免费部署（国外服务器）');
    }
}

main();

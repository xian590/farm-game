const crypto = require('crypto');
const https = require('https');

const config = {
    SecretId: 'YOUR_SECRET_ID',  // 填入你的腾讯云SecretId
    SecretKey: 'YOUR_SECRET_KEY',  // 填入你的腾讯云SecretKey
    Region: 'ap-guangzhou',
    Domain: 'cos-dq4qu31ss.top',
    Bucket: 'farm-game-1450814063'
};

// TC3-HMAC-SHA256 签名
function signRequest(payload, action, service, timestamp) {
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    const credentialScope = `${date}/${service}/tc3_request`;
    const host = `${service}.tencentcloudapi.com`;
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    
    const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`;
    const signedHeaders = 'content-type;host;x-tc-action';
    const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
    
    const secretDate = crypto.createHmac('sha256', `TC3${config.SecretKey}`).update(date).digest();
    const secretService = crypto.createHmac('sha256', secretDate).update(service).digest();
    const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
    
    return `TC3-HMAC-SHA256 Credential=${config.SecretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

function apiRequest(service, action, version, payload, region) {
    return new Promise((resolve, reject) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const payloadStr = JSON.stringify(payload);
        const auth = signRequest(payloadStr, action, service, timestamp);
        const host = `${service}.tencentcloudapi.com`;
        
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
                'X-TC-Version': version,
                'X-TC-Region': region || config.Region,
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
        console.log('[1/5] 创建CDN加速域名...');
        const cdnRes = await apiRequest('cdn', 'AddCdnDomain', '2018-06-06', {
            Domain: config.Domain,
            ServiceType: 'web',
            Origin: {
                Origins: [`${config.Bucket}.cos.ap-shanghai.myqcloud.com`],
                OriginType: 'cos',
                OriginPullProtocol: 'http'
            }
        }, 'ap-guangzhou');
        console.log('  CDN域名创建成功');
        
        // 等待CDN分配CNAME
        console.log('[2/5] 等待CDN分配CNAME...');
        await new Promise(r => setTimeout(r, 3000));
        
        console.log('[3/5] 查询CDN域名信息...');
        const domainInfo = await apiRequest('cdn', 'DescribeDomains', '2018-06-06', {
            Filters: [{ Name: 'domain', Value: [config.Domain], Fuzzy: false }]
        }, 'ap-guangzhou');
        
        let cname = '';
        if (domainInfo.Domains && domainInfo.Domains.length > 0) {
            cname = domainInfo.Domains[0].Cname || '';
        }
        
        if (!cname) {
            console.log('  未获取到CNAME，使用默认格式...');
            cname = `${config.Domain}.cdn.dnsv1.com`;
        }
        console.log('  CDN CNAME:', cname);
        
        console.log('[4/5] 创建DNS解析记录...');
        await apiRequest('dnspod', 'CreateRecord', '2021-03-23', {
            Domain: config.Domain,
            RecordType: 'CNAME',
            RecordLine: '默认',
            Value: cname,
            SubDomain: '@',
            TTL: 600
        }, 'ap-guangzhou');
        console.log('  DNS解析记录创建成功');
        
        console.log('[5/5] 开启HTTPS...');
        await apiRequest('cdn', 'AddCdnDomain', '2018-06-06', {
            Domain: config.Domain,
            ServiceType: 'web',
            Https: {
                Switch: 'on',
                Http2: 'on'
            }
        }, 'ap-guangzhou').catch(() => {
            console.log('  HTTPS配置将在域名审核通过后自动申请');
        });
        
        console.log('\n==========================================');
        console.log('  ✅ 配置完成！');
        console.log('==========================================');
        console.log('');
        console.log('  访问地址：');
        console.log(`  http://${config.Domain}`);
        console.log(`  https://${config.Domain}`);
        console.log('');
        console.log('  CDN CNAME:', cname);
        console.log('');
        console.log('  注意：');
        console.log('  - 首次配置需要 5-10 分钟生效');
        console.log('  - HTTPS证书需要 5-30 分钟自动签发');
        console.log('  - 如果暂时无法访问，请稍后再试');
        console.log('==========================================');
        
    } catch (err) {
        console.log('\n❌ 自动配置失败:', err.message);
        console.log('\n请使用手动配置方案（我发给你步骤）。');
    }
}

main();

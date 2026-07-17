# 许愿岛后端建设方案 v1.0

## 一、现状诊断

| 问题 | 影响 | 优先级 |
|------|------|--------|
| 全部数据 localStorage | 换设备丢失、无法跨端同步 | P0 |
| 会员状态前端校验 | 可篡改、无安全性 | P0 |
| 无真实支付网关 | 无法商业化变现 | P0 |
| 无用户账号体系 | 无法识别用户、无法恢复数据 | P0 |
| 无服务端日志 | 无法排查问题、无法分析转化漏斗 | P1 |
| 无数据备份机制 | 用户误删无法恢复 | P1 |

---

## 二、技术选型对比

| 维度 | 腾讯云云开发(TCB) | LeanCloud | Supabase | 自建服务器 |
|------|-------------------|-----------|----------|------------|
| **国内访问速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **微信生态支持** | ⭐⭐⭐⭐⭐ (原生) | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **微信支付接入** | ⭐⭐⭐⭐⭐ (云函数SDK) | ⭐⭐⭐⭐ (云函数) | ⭐⭐ (需代理) | ⭐⭐⭐⭐ |
| **支付宝接入** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **免费额度** | 5GB/50万读/50万写/10万云函数次 | 开发版免费(有限流) | 500MB/2万用户 | 需买服务器 |
| **学习成本** | 中 | 低 | 中 | 高 |
| **长期成本** | 中等(按量) | 中低 | 中低 | 固定+维护 |
| **数据主权** | 腾讯云 | LeanCloud | 自建/托管 | 完全自有 |
| **PWA 支持** | ✅ | ✅ | ✅ | ✅ |
| **离线优先** | 需自己实现 | 需自己实现 | 需自己实现 | 需自己实现 |

### 推荐方案：腾讯云云开发（TCB）

**理由：**
1. 微信登录 + 微信支付原生支持，减少80%接入工作量
2. 国内CDN加速，PWA秒开
3. 云数据库 + 云函数 + 静态托管一体化，适合个人开发者快速上线
4. 与微信生态打通，未来可无缝迁移到微信小程序

**备选方案：LeanCloud**
- 如果未来考虑出海或多平台（iOS/Android/Web），LeanCloud 更灵活
- 文档更友好，社区活跃

---

## 三、系统架构

```
┌─────────────────────────────────────────────────────────┐
│                        客户端层                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  PWA Web│  │微信小程序│  │  iOS App│  │Android App│   │
│  │(当前)   │  │(未来)   │  │(未来)   │  │(未来)     │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼──────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                           │
                    ┌──────┴──────┐
                    │   CDN/HTTPS  │
                    │  (静态托管)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴────┐        ┌────┴────┐       ┌────┴────┐
   │ 云函数  │        │ 云函数  │       │ 云数据库 │
   │ 支付网关│        │ 业务API │       │ MongoDB │
   │(微信/支付)│      │(用户/数据)│      │         │
   └────┬────┘        └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                    ┌──────┴──────┐
                    │  云存储COS   │
                    │ (头像/备份)  │
                    └─────────────┘
```

---

## 四、数据模型设计

### 4.1 用户表 (users)
```json
{
  "_id": "ObjectId",
  "unionid": "wx_xxx",           // 微信 unionid（主键）
  "openid": "wx_xxx",            // 微信 openid
  "anonymousId": "anon_xxx",     // 匿名用户ID（未登录时）
  "nickname": "小公主",
  "avatar": "https://...",
  "createdAt": "2026-01-15T10:00:00Z",
  "lastLoginAt": "2026-01-20T08:00:00Z",
  "deviceId": "device_xxx"       // 设备绑定，用于数据迁移
}
```

### 4.2 用户数据表 (user_data)
```json
{
  "_id": "ObjectId",
  "userId": "user_xxx",
  "version": 6.4,
  "data": {
    "state": { ... },            // 完整前端 state 对象
    "vip_state": { ... },
    "crystal_state": { ... },
    "today_usage": { ... },
    "quest_data": { ... },
    "sessions": { ... }
  },
  "checksum": "sha256_xxx",      // 数据完整性校验
  "updatedAt": "2026-01-20T08:00:00Z",
  "deviceId": "device_xxx"
}
```

### 4.3 会员订单表 (orders)
```json
{
  "_id": "ObjectId",
  "userId": "user_xxx",
  "orderNo": "WI202601200001",
  "planId": "member_month",
  "planName": "月度会员",
  "price": 18,
  "currency": "CNY",
  "payMethod": "wechat",          // wechat / alipay
  "payStatus": "paid",            // pending / paid / refunded / expired
  "transactionId": "wx_xxx",     // 第三方支付流水号
  "paidAt": "2026-01-20T08:00:00Z",
  "expiryAt": "2026-02-20T08:00:00Z",
  "refundAmount": 0,
  "refundReason": "",
  "createdAt": "2026-01-20T08:00:00Z"
}
```

### 4.4 操作日志表 (logs)
```json
{
  "_id": "ObjectId",
  "userId": "user_xxx",
  "action": "pay_success",        // pay_success / feature_unlock / daily_checkin / error
  "detail": { "planId": "member_month", "price": 18 },
  "ip": "123.45.67.89",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-01-20T08:00:00Z"
}
```

---

## 五、API 接口设计

### 5.1 用户认证
```
POST /auth/login
  Body: { code: "wx_auth_code" }          // 微信登录凭证
  Response: { token: "jwt_xxx", user: {...} }

POST /auth/anonymous
  Body: { deviceId: "device_xxx" }
  Response: { token: "jwt_xxx", anonymousId: "anon_xxx" }

POST /auth/link
  Body: { anonymousToken: "jwt_xxx", wxCode: "wx_auth_code" }
  Response: { token: "jwt_xxx", user: {...} }  // 匿名数据迁移到微信账号
```

### 5.2 数据同步
```
GET /sync/pull
  Header: Authorization: Bearer jwt_xxx
  Response: { data: {...}, updatedAt: "...", checksum: "..." }

POST /sync/push
  Header: Authorization: Bearer jwt_xxx
  Body: { data: {...}, checksum: "...", deviceId: "..." }
  Response: { success: true, serverTime: "..." }

POST /sync/resolve
  Body: { localData: {...}, serverData: {...} }
  Response: { mergedData: {...}, conflicts: [...] }
```

### 5.3 会员与支付
```
GET /membership/status
  Response: { tier: "member", expiryAt: "...", isValid: true }

POST /payment/create
  Body: { planId: "member_month", method: "wechat" }
  Response: { orderNo: "...", prepayId: "...", paySign: "..." }

POST /payment/callback/wechat    // 微信支付回调（云函数）
  Body: { xml: "..." }
  Response: { code: "SUCCESS" }

POST /payment/refund
  Body: { orderNo: "...", reason: "..." }
  Response: { refundId: "...", status: "processing" }
```

---

## 六、支付接入方案

### 6.1 微信支付（JSAPI）

```javascript
// 云函数：创建订单
exports.main = async (event, context) => {
  const { planId, openid } = event;
  const plan = PLANS[planId];
  
  // 1. 创建内部订单
  const order = await db.collection('orders').add({
    data: {
      orderNo: generateOrderNo(),
      planId, price: plan.price,
      payStatus: 'pending',
      createdAt: new Date()
    }
  });
  
  // 2. 调用微信支付统一下单
  const unifiedOrder = await cloudPay.unifiedOrder({
    body: `许愿岛${plan.name}`,
    outTradeNo: order.orderNo,
    totalFee: plan.price * 100, // 分
    spbillCreateIp: context.CLIENTIP,
    subMchId: '商户号',
    openid: openid
  });
  
  // 3. 返回前端调起支付参数
  return {
    appId: unifiedOrder.appId,
    timeStamp: String(Math.floor(Date.now()/1000)),
    nonceStr: generateNonce(),
    package: `prepay_id=${unifiedOrder.prepayId}`,
    signType: 'RSA',
    paySign: generatePaySign(unifiedOrder)
  };
};
```

### 6.2 支付宝（手机网站支付）

```javascript
// 云函数：创建支付宝订单
exports.main = async (event, context) => {
  const { planId } = event;
  const plan = PLANS[planId];
  
  const order = await db.collection('orders').add({...});
  
  const alipayForm = await alipay.tradeWapPay({
    outTradeNo: order.orderNo,
    totalAmount: plan.price,
    subject: `许愿岛${plan.name}`,
    productCode: 'QUICK_WAP_WAY',
    quitUrl: 'https://wishisland.app/vip'
  });
  
  return { payUrl: alipayForm };
};
```

---

## 七、客户端适配方案

### 7.1 数据同步策略（离线优先）

```javascript
class SyncManager {
  async sync() {
    const localData = this.getLocalData();
    const serverData = await api.sync.pull();
    
    if (!serverData) {
      // 首次同步，推送本地数据到云端
      await api.sync.push(localData);
      return;
    }
    
    const localTime = new Date(localData.updatedAt);
    const serverTime = new Date(serverData.updatedAt);
    
    if (localTime > serverTime) {
      // 本地更新，推送
      await api.sync.push(localData);
    } else if (serverTime > localTime) {
      // 云端更新，拉取
      this.saveLocalData(serverData.data);
    } else {
      // 时间相同，检查 checksum
      if (localData.checksum !== serverData.checksum) {
        // 冲突，需要合并
        const merged = await api.sync.resolve(localData, serverData);
        this.saveLocalData(merged);
        await api.sync.push(merged);
      }
    }
  }
}
```

### 7.2 会员状态校验（防篡改）

```javascript
// 前端不再信任本地 vip_state
// 每次启动时，从服务端拉取真实会员状态
const serverStatus = await api.membership.status();
if (serverStatus.isValid) {
  // 显示会员功能
} else {
  // 降级到免费版
}
```

---

## 八、实施路线图

### 第一阶段：基础数据同步（2周）

| 任务 | 工作量 | 产出 |
|------|--------|------|
| 开通腾讯云云开发环境 | 0.5天 | 云开发控制台可用 |
| 部署用户认证（匿名+微信） | 2天 | 登录接口可用 |
| 实现数据同步 API（pull/push） | 3天 | 数据可跨设备同步 |
| 客户端接入 SyncManager | 3天 | 前端自动同步 |
| 数据备份/恢复功能 | 2天 | 用户可手动备份到云端 |

**里程碑：** 用户换设备登录后，数据自动恢复。

### 第二阶段：支付与会员（2周）

| 任务 | 工作量 | 产出 |
|------|--------|------|
| 申请微信支付商户号 | 3天（并行） | 商户号+API证书 |
| 实现支付创建/回调云函数 | 3天 | 可完成真实支付 |
| 会员状态服务端校验 | 2天 | 防篡改 |
| 订单/退款管理后台 | 2天 | 可查看订单、处理退款 |
| 客户端接入真实支付 | 2天 | 替换模拟支付 |

**里程碑：** 产品可正式上线收费。

### 第三阶段：运营与监控（1周）

| 任务 | 工作量 | 产出 |
|------|--------|------|
| 接入日志分析 | 2天 | 可查看转化漏斗、错误日志 |
| 数据看板（Dashboard） | 2天 | 日活/付费/留存看板 |
| 客服工单系统 | 1天 | 用户反馈可追踪 |
| 自动备份策略 | 1天 | 每日自动全量备份 |

**里程碑：** 可运营级商业化产品。

---

## 九、成本预估（月度）

| 项目 | 用量预估 | 月度费用 |
|------|----------|----------|
| 云开发数据库 | 5GB 存储 + 50万读/50万写 | 免费额度内 |
| 云函数调用 | 10万次/月 | 免费额度内 |
| CDN 流量 | 100GB/月 | 免费额度内 |
| 微信支付手续费 | 交易额 × 0.6% | 按实际交易额 |
| 云存储 COS | 10GB | ~5元 |
| **合计（起步期）** | 日活 < 1000 | **~0-20元/月** |
| **合计（成长期）** | 日活 1万 | **~200-500元/月** |

---

## 十、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 腾讯云云开发未来收费政策变化 | 成本上升 | 数据模型保持通用，可迁移至 LeanCloud/自建 |
| 微信支付审核不通过 | 无法上线 | 同时申请支付宝，确保至少一个通道可用 |
| 数据同步冲突 | 用户数据丢失 | 实现冲突检测 + 手动合并界面 |
| 服务端被攻击 | 数据泄露 | 接口限流 + JWT 鉴权 + 数据加密 |
| 苹果 IAP 要求 | 被下架 | 网页版走第三方支付，App 版走 IAP（价格同步） |

---

## 十一、下一步行动建议

1. **立即注册** [腾讯云云开发](https://console.cloud.tencent.com/tcb) 和 [微信支付商户平台](https://pay.weixin.qq.com/)（商户号申请需要营业执照，个人可用小程序或企业资质）
2. **个人开发者替代方案**：如果无营业执照，可用 **微信小商店** 或 **有赞** 作为支付代理，或先接入 **支付宝当面付**（个人可申请）
3. **先实现数据同步**：即使不接入支付，先把数据同步做出来，解决用户换设备丢失数据的核心痛点

---

*方案生成时间：2026年1月*
*版本：v1.0*

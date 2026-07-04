# 腾讯云 COS 静态网站部署指南

## 方案概述

使用 **腾讯云对象存储 COS** 的静态网站托管功能部署《李家村 - 农耕模拟器》，国内访问速度快，成本低。

---

## 费用预估

| 项目 | 费用 | 说明 |
|------|------|------|
| 存储费用 | ~0.15元/月 | 1.1MB 文件，标准存储 |
| 请求费用 | ~0.01元/月 | 低频访问，几乎免费 |
| 流量费用 | ~1-5元/月 | 按实际访问流量计费 |
| **总计** | **~2-6元/月** | 比 GitHub Pages 稳定且快 |

---

## 部署步骤

### 第一步：注册腾讯云账号

1. 访问 https://cloud.tencent.com/
2. 点击右上角「免费注册」
3. 完成实名认证（个人认证即可）

### 第二步：创建 COS 存储桶

1. 登录腾讯云控制台
2. 进入「对象存储 COS」服务
3. 点击「创建存储桶」
4. 填写配置：
   - **地域**：选择离你最近的地域（如「上海」或「北京」）
   - **名称**：`farm-game`（全局唯一，如果已被占用加后缀如 `farm-game-2024`）
   - **访问权限**：**公有读私有写**
   - **服务端加密**：可选，不加密即可
5. 点击「创建」

### 第三步：开启静态网站托管

1. 进入刚创建的存储桶
2. 左侧菜单 →「基础配置」→「静态网站」
3. 点击「编辑」
4. 配置：
   - **静态网站状态**：开启
   - **索引文档**：`index.html`
   - **错误文档**：`index.html`（单页应用，所有路由都指向 index.html）
5. 点击「保存」

### 第四步：上传游戏文件

#### 方法 A：控制台上传（适合首次）

1. 进入存储桶 →「文件列表」
2. 点击「上传文件」
3. 选择本地的 `index.html`（即 `farm_game.html` 的副本）
4. 上传后，点击文件右侧的「详情」
5. 确认访问权限为「公有读」

#### 方法 B：COSBrowser 客户端（推荐后续更新）

1. 下载 COSBrowser：https://cloud.tencent.com/document/product/436/11366
2. 登录后找到你的存储桶
3. 直接拖拽 `index.html` 到客户端上传
4. 上传时勾选「覆盖已有文件」

#### 方法 C：命令行工具（适合自动化）

```bash
# 安装腾讯云 CLI
pip install coscmd

# 配置密钥（在腾讯云控制台「访问管理」→「API密钥管理」创建）
coscmd config -a <SecretId> -s <SecretKey> -b farm-game -r ap-shanghai

# 上传文件
coscmd upload -r index.html /
```

### 第五步：获取访问地址

1. 进入存储桶「概览」页
2. 找到「静态网站」区域的「访问节点」URL
3. 格式类似：`http://farm-game.cos-website.ap-shanghai.myqcloud.com`
4. **注意**：默认是 HTTP，如需 HTTPS 需配置自定义域名

### 第六步：配置自定义域名 + HTTPS（可选但推荐）

1. 在存储桶「自定义源站域名」中添加你的域名
2. 域名 DNS 添加 CNAME 记录指向 COS 提供的域名
3. 在「HTTPS 配置」中申请免费 SSL 证书（腾讯云提供免费证书）
4. 等待 DNS 生效（通常 5-30 分钟）

---

## 自动化部署脚本

创建 `deploy-cos.sh`（Linux/Mac）或 `deploy-cos.bat`（Windows）：

### Linux/Mac

```bash
#!/bin/bash
# 腾讯云 COS 部署脚本

BUCKET="farm-game"
REGION="ap-shanghai"
SECRET_ID="你的SecretId"
SECRET_KEY="你的SecretKey"

# 复制最新版本
cp farm_game.html index.html

# 使用 coscmd 上传
coscmd config -a $SECRET_ID -s $SECRET_KEY -b $BUCKET -r $REGION
coscmd upload -r index.html /

echo "部署完成！访问地址：http://$BUCKET.cos-website.$REGION.myqcloud.com"
```

### Windows PowerShell

```powershell
# 腾讯云 COS 部署脚本
$BUCKET = "farm-game"
$REGION = "ap-shanghai"
$SECRET_ID = "你的SecretId"
$SECRET_KEY = "你的SecretKey"

# 复制最新版本
Copy-Item farm_game.html index.html -Force

# 使用 coscmd 上传
coscmd config -a $SECRET_ID -s $SECRET_KEY -b $BUCKET -r $REGION
coscmd upload -r index.html /

Write-Host "部署完成！访问地址：http://$BUCKET.cos-website.$REGION.myqcloud.com"
```

---

## 常见问题

### Q1: 访问时出现 403 错误？
- 检查存储桶访问权限是否为「公有读私有写」
- 检查 index.html 文件的权限是否为「公有读」

### Q2: 游戏存档丢失？
- COS 静态托管是无状态的，localStorage 仍然保存在用户浏览器中
- 只要用户不清除浏览器数据，存档就不会丢失
- 建议在游戏内引导用户使用「导出存档」功能备份

### Q3: 如何更新游戏？
- 直接重新上传 `index.html` 覆盖旧文件
- 缓存问题：在 URL 后加 `?v=1.4.2` 强制刷新，或在腾讯云控制台开启「CDN 刷新」

### Q4: 访问速度慢？
- 确认选择了距离用户最近的地域
- 考虑开启腾讯云 CDN 加速（额外费用，但国内访问极快）

---

## 与 GitHub Pages 对比

| 对比项 | GitHub Pages | 腾讯云 COS |
|--------|-------------|-----------|
| 国内访问 | 慢/不稳定 | **快** |
| 费用 | 免费 | ~2-6元/月 |
| 配置难度 | 简单 | 中等 |
| 自定义域名 | 支持 | **支持** |
| HTTPS | 支持 | **支持** |
| 自动化部署 | Git Actions | COSCMD |

---

## 推荐方案

**短期**：继续使用 GitHub Pages + 腾讯云 CDN 回源（免费加速）
**长期**：迁移到腾讯云 COS + 自定义域名，体验最佳

---

*文档版本：v1.0 | 适用游戏版本：v1.4.2*

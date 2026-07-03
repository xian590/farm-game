# farm_game.html 国内部署方案指南

> 本文档为 **李家村 - 农耕模拟器** 游戏提供多种国内可用部署方案，覆盖免费与付费方案，适合不同场景需求。
>
> **文件特性**：单 HTML 文件（1.1MB）、纯前端、无后端依赖、localStorage 存档、Web Audio API 音效。

---

## 目录

1. [Cloudflare Pages（推荐）](#1-cloudflare-pages推荐)
2. [Vercel](#2-vercel)
3. [Gitee Pages](#3-gitee-pages)
4. [腾讯云 COS + CDN](#4-腾讯云-cos--cdn)
5. [GitHub Pages 加速](#5-github-pages-加速)
6. [方案对比总览](#6-方案对比总览)
7. [部署文件清单](#7-部署文件清单)

---

## 1. Cloudflare Pages（推荐）

### 方案概述

Cloudflare Pages 是 Cloudflare 推出的静态网站托管服务，与 Cloudflare 全球 CDN 网络深度集成，国内访问速度在免费方案中表现最佳。提供免费的 HTTPS、自定义域名和 CI/CD 功能。

| 项目 | 详情 |
|------|------|
| **费用** | 完全免费（每月构建 500 次 + 无限带宽） |
| **国内访问速度** | ⭐⭐⭐ 良好（依托 Cloudflare 全球节点，国内有香港、新加坡等近源节点） |
| **HTTPS** | 自动提供，无需额外配置 |
| **自定义域名** | 支持 |
| **单文件支持** | ✅ 完美支持，直接上传单个 HTML 即可 |
| **适用场景** | 个人项目、小游戏、无需备案的轻量部署 |

### 1.1 注册 Cloudflare 账号

1. 打开 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 填写邮箱地址和密码
3. 验证邮箱（收取验证码邮件）
4. 完成注册流程

> 已有 Cloudflare 账号的用户可直接登录 [https://dash.cloudflare.com](https://dash.cloudflare.com)

### 1.2 创建 Pages 项目

**方式 A：直接上传文件（推荐，无需 GitHub）**

1. 登录 Cloudflare Dashboard
2. 点击左侧导航栏 → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. 项目名填写 `farm-game`（或自定义）
4. 在文件上传页面，点击 **Upload**，选择 `farm_game.html` 文件
5. 点击 **Deploy site**

**方式 B：从 GitHub 导入（适合持续更新）**

1. 在 GitHub 创建新仓库（如 `farm-game`），上传 `farm_game.html` 到根目录
2. 在 Cloudflare Pages 点击 **Create a project** → **Connect to Git**
3. 授权 Cloudflare 访问你的 GitHub 账号
4. 选择 `farm-game` 仓库
5. 构建配置保持默认（空，因为是纯 HTML）
6. 点击 **Save and Deploy**

### 1.3 自定义域名配置（可选）

1. 在 Cloudflare Pages 项目页面，点击 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `farm.yourdomain.com`）
4. 在域名注册商处添加 CNAME 记录，指向 Cloudflare Pages 提供的域名（如 `farm-game.pages.dev`）
5. 等待 DNS 生效（通常 5-30 分钟）
6. 在 Cloudflare Dashboard 中自动获取 SSL 证书

> 使用 Cloudflare Pages 的默认域名（`.pages.dev`）无需备案，即可在国内访问。如果使用自己的域名，需要在 Cloudflare 开启中国网络优化，或配合 Cloudflare 中国 CDN 合作伙伴。

### 1.4 部署后验证

1. 访问分配的域名（如 `https://farm-game.pages.dev`）
2. 检查游戏是否正常加载：
   - 页面标题显示为 **李家村 - 农耕模拟器**
   - 开场故事动画正常播放
   - 点击/触摸交互正常
   - 音效正常（需要用户交互后触发 Web Audio API）
3. 按 `F12` 打开开发者工具 → Network 面板，确认 200 状态码
4. 检查 localStorage 存储功能是否正常（进入游戏后，刷新页面，进度是否保留）

### 1.5 重新部署（更新文件）

- **直接上传**：在项目页面点击 **Upload**，重新上传文件，自动覆盖并重新部署
- **GitHub 导入**：提交代码到 GitHub，Cloudflare 自动触发构建（约 1-2 分钟）

### 1.6 配置文件（可选）

在项目根目录创建 `_headers` 文件以优化缓存：

```
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*
  Cache-Control: public, max-age=3600
```

---

## 2. Vercel

### 方案概述

Vercel 是前端开发者的首选部署平台，支持 Next.js、React 等框架，也支持纯静态文件部署。与 GitHub 深度集成，CI/CD 体验极佳。但国内访问速度不如 Cloudflare Pages。

| 项目 | 详情 |
|------|------|
| **费用** | Hobby（免费）：个人项目完全免费，无限带宽 |
| **国内访问速度** | ⭐⭐ 一般（国内访问可能较慢，部分地区受 DNS 解析影响） |
| **HTTPS** | 自动提供，自带 `.vercel.app` SSL 证书 |
| **自定义域名** | 支持 |
| **单文件支持** | ✅ 支持，直接上传即可 |
| **适用场景** | 开发者友好、与 GitHub 工作流集成、持续部署 |

### 2.1 注册 Vercel 账号

1. 打开 [https://vercel.com/signup](https://vercel.com/signup)
2. 选择 **Continue with GitHub**（推荐，直接关联 GitHub 仓库）
3. 授权 Vercel 访问你的 GitHub 账号
4. 完成注册流程

### 2.2 从 GitHub 导入项目

1. 在 GitHub 创建新仓库 `farm-game`，上传 `farm_game.html`
2. 登录 Vercel Dashboard → 点击 **Add New Project**
3. 在 **Import Git Repository** 列表中选择 `farm-game`
4. 点击 **Import**
5. 配置页面：
   - **Project Name**: `farm-game`（默认与仓库名一致）
   - **Framework Preset**: 选择 **Other**（纯静态 HTML）
   - **Root Directory**: `./`（根目录）
   - 构建命令和输出目录保持为空
6. 点击 **Deploy**
7. 等待约 10-30 秒，部署完成后自动跳转到项目页面

### 2.3 手动上传文件（无 GitHub）

1. 安装 Vercel CLI：`npm i -g vercel`
2. 在项目目录中运行：
   ```bash
   cd C:\Users\Administrator\Documents\kimi\workspace
   vercel --prod
   ```
3. 首次运行会提示登录（浏览器验证）
4. 按提示配置：
   - **Set up "~\workspace"?** → `Y`
   - **Which scope?** → 选择你的账号
   - **Link to existing project?** → `N`（创建新项目）
   - **Project name** → `farm-game`
5. 部署完成后，终端会输出访问 URL（如 `https://farm-game.vercel.app`）

### 2.4 自定义域名配置

1. 在 Vercel 项目页面，点击 **Settings** → **Domains**
2. 点击 **Add**
3. 输入你的域名（如 `farm.yourdomain.com`）
4. 在域名注册商处添加记录：
   - **CNAME** 记录：`farm.yourdomain.com` → `cname.vercel-dns.com`
   - 或 **A** 记录：`76.76.21.21`
5. 等待 DNS 生效，Vercel 自动配置 SSL 证书

> ⚠️ 使用自定义域名在国内可能需要备案，否则有被阻断风险。建议使用 `.vercel.app` 默认域名。

### 2.5 部署后验证

与 Cloudflare Pages 验证步骤相同（见 1.4 节）。

### 2.6 Vercel 配置文件（可选）

在项目根目录创建 `vercel.json` 以自定义配置：

```json
{
  "version": 2,
  "public": true,
  "github": {
    "enabled": false
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, must-revalidate"
        }
      ]
    }
  ]
}
```

---

## 3. Gitee Pages

### 方案概述

Gitee Pages 是码云提供的免费静态页面托管服务，服务器位于国内，访问速度极快，无需翻墙即可稳定访问。是国内部署静态网站的最佳免费选择之一。但需注意：Gitee Pages 有时对非开源项目有限制，建议将仓库设为公开。

| 项目 | 详情 |
|------|------|
| **费用** | 完全免费（Gitee Pages 服务免费） |
| **国内访问速度** | ⭐⭐⭐⭐⭐ 极佳（国内服务器，延迟极低） |
| **HTTPS** | ✅ 支持，默认提供 |
| **自定义域名** | ✅ 支持，且支持绑定自定义域名（需实名认证） |
| **单文件支持** | ✅ 完美支持 |
| **适用场景** | 国内用户为主的网站、追求最佳访问速度、GitHub Pages 的替代方案 |

> ⚠️ **注意**：Gitee 会屏蔽 GitHub Pages 的链接跳转，但 GitHub 仓库本身不受影响。将项目部署在 Gitee Pages 上即可避免国内用户无法访问的问题。

### 3.1 注册 Gitee 账号

1. 打开 [https://gitee.com/signup](https://gitee.com/signup)
2. 填写手机号、用户名、密码
3. 验证手机号（短信验证码）
4. 完成注册

> 建议绑定邮箱，方便后续操作通知。

### 3.2 创建 Gitee 仓库

1. 登录 Gitee → 点击右上角 **+** → **新建仓库**
2. 填写仓库信息：
   - **仓库名称**：`farm-game`（必填）
   - **仓库介绍**：`李家村 - 农耕模拟器`（可选）
   - **可见性**：选择 **公开**（Gitee Pages 要求公开仓库）
   - **初始化仓库**：勾选 **添加 .gitignore** → 选择 `HTML`（可选）
   - **添加开源许可证**：选择 `MIT`（推荐）
3. 点击 **创建**

### 3.3 上传文件到仓库

**方式 A：网页端上传（适合少量文件）**

1. 进入仓库页面 → 点击 **文件** → **上传文件**
2. 选择 `farm_game.html` 文件上传
3. 填写提交信息：`init: 上传游戏文件`
4. 点击 **提交**

**方式 B：Git 命令行上传（推荐）**

```bash
# 1. 克隆仓库到本地
git clone https://gitee.com/你的用户名/farm-game.git
cd farm-game

# 2. 复制游戏文件到仓库目录
cp C:/Users/Administrator/Documents/kimi/workspace/farm_game.html ./index.html

# 3. 提交并推送
git add index.html
git commit -m "init: 上传游戏文件"
git push origin master
```

> 注意：将文件名改为 `index.html`，Gitee Pages 会自动将其作为首页。

### 3.4 开启 Gitee Pages 服务

1. 进入仓库页面 → 点击 **服务** → **Gitee Pages**
2. 在 Gitee Pages 设置页面：
   - **部署来源**：选择 **master 分支**（或你上传的分支）
   - **部署目录**：`/`（根目录）
3. 点击 **部署** 或 **更新**
4. 等待约 1-5 分钟，页面会显示访问地址（如 `https://你的用户名.gitee.io/farm-game`）

### 3.5 自定义域名配置（可选）

1. 在 Gitee Pages 设置页面，找到 **自定义域名** 区域
2. 输入你的域名（如 `farm.yourdomain.com`）
3. 在域名服务商处添加 CNAME 记录：
   - 记录类型：`CNAME`
   - 主机记录：`farm`（子域名）
   - 记录值：`你的用户名.gitee.io`
4. 在 Gitee 完成 **实名认证**（绑定域名需要）
5. 等待 DNS 生效（通常几分钟到几小时）

### 3.6 部署后验证

1. 访问 Gitee Pages 提供的地址
2. 验证游戏加载和交互正常
3. 检查 localStorage 存档功能

### 3.7 更新部署（重新部署）

1. 更新 `index.html` 文件后推送到 Gitee 仓库
2. 进入仓库 → **服务** → **Gitee Pages** → 点击 **更新**
3. 等待重新部署（通常 1-5 分钟）

> ⚠️ Gitee Pages 的自动部署功能偶尔不稳定，建议手动点击 **更新** 按钮确保重新部署。

---

## 4. 腾讯云 COS + CDN

### 方案概述

腾讯云对象存储（COS）配合 CDN 加速，是国内最专业、最稳定的静态资源托管方案。适合对稳定性、访问速度有较高要求的场景。COS 按量计费，费用极低（每月几毛钱到几块钱），CDN 流量包也非常便宜。

| 项目 | 详情 |
|------|------|
| **费用** | 低费用（COS 存储约 0.1-0.5 元/月 + CDN 流量费约 0.1-0.5 元/GB） |
| **国内访问速度** | ⭐⭐⭐⭐⭐ 极佳（全国节点覆盖，延迟极低） |
| **HTTPS** | ✅ 支持，需配置 SSL 证书 |
| **自定义域名** | ✅ 支持，但需 ICP 备案 |
| **单文件支持** | ✅ 完美支持 |
| **适用场景** | 企业级应用、追求极致稳定性、有预算保障的项目 |

### 4.1 注册并实名认证腾讯云

1. 打开 [https://cloud.tencent.com](https://cloud.tencent.com)
2. 点击右上角 **免费注册**
3. 选择注册方式（邮箱/手机/QQ/微信）
4. 完成实名认证（个人认证需要身份证信息，企业认证需要营业执照）
> 实名认证是使用 COS 和 CDN 的前提。

### 4.2 创建 COS 存储桶

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 在顶部搜索栏搜索 **对象存储 COS**，点击进入
3. 点击 **创建存储桶**：
   - **存储桶名称**：`farm-game-你的域名`（全局唯一，如 `farm-game-demo`）
   - **所属地域**：选择离你用户最近的地域（如 **广州** / **北京** / **上海**）
   - **访问权限**：选择 **公有读私有写**（允许用户访问游戏文件）
   - **版本控制**：关闭（可选）
   - **服务器加密**：关闭（静态文件无需加密）
4. 点击 **创建**

### 4.3 上传文件到存储桶

**方式 A：网页端上传（适合少量文件）**

1. 进入存储桶 → 点击 **文件列表** → **上传文件**
2. 点击 **选择文件** → 选择 `farm_game.html`
3. 将文件名改为 `index.html`（这样可以直接访问存储桶域名打开）
4. 点击 **上传**

**方式 B：COS 命令行工具（适合批量操作）**

1. 安装 COS CLI 工具（在 Windows PowerShell 中）：
   ```powershell
   # 安装 Python 后运行
   pip install coscmd
   ```
2. 配置 COS 密钥：
   ```powershell
   coscmd config -a <SecretId> -s <SecretKey> -b farm-game-demo -r ap-guangzhou
   ```
   > SecretId 和 SecretKey 在腾讯云控制台 → API 密钥管理 中获取
3. 上传文件：
   ```powershell
   coscmd upload "C:\Users\Administrator\Documents\kimi\workspace\farm_game.html" /index.html
   ```

**方式 C：使用提供的 Python 脚本（推荐）**

见本指南第 7 节的 `upload_to_cos.py` 脚本，可直接运行上传文件。

### 4.4 配置静态网站托管

1. 进入存储桶 → 点击 **基础配置** → **静态网站**
2. 点击 **编辑** → 开启静态网站
3. 配置：
   - **索引文档**：`index.html`
   - **错误文档**：`index.html`（可选，单文件应用可都指向 index.html）
4. 点击 **保存**

此时可以通过存储桶提供的静态网站域名访问（如 `http://farm-game-demo.cos-website.ap-guangzhou.myqcloud.com`）。

### 4.5 配置 CDN 加速

1. 进入 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 点击 **域名管理** → **添加域名**
3. 配置：
   - **域名类型**：**静态加速**
   - **加速域名**：填写你的域名（如 `farm.yourdomain.com`），或临时使用 COS 默认域名
   - **源站类型**：**COS 源**
   - **源站选择**：选择你创建的 `farm-game-demo` 存储桶
   - **回源协议**：HTTP（如需要 HTTPS 则选择 HTTPS）
4. 点击 **提交**
5. 等待 CDN 部署（约 5-10 分钟）
6. 在 CDN 域名管理页面，获取 CNAME 地址
7. 在域名服务商处添加 CNAME 记录：
   - 记录类型：`CNAME`
   - 主机记录：`farm`（子域名前缀）
   - 记录值：CDN 提供的 CNAME 地址（如 `farm-game-demo.cos-website.ap-guangzhou.myqcloud.com`）
8. 等待 DNS 生效（通常 10-30 分钟）

### 4.6 自定义域名配置（需备案）

1. 在 CDN 控制台 → **域名管理** → 选择你的加速域名 → **HTTPS 配置**
2. 开启 **HTTPS 配置** → 选择 **腾讯云托管证书**（免费）或上传自有证书
3. 申请免费 SSL 证书：
   - 点击 **申请免费证书** → 选择 **亚洲诚信** 或 **Let's Encrypt**
   - 验证域名所有权（DNS 验证或文件验证）
   - 等待证书签发（通常 5-30 分钟）
4. 配置强制 HTTPS 跳转（可选但推荐）

> ⚠️ **重要**：使用自定义域名（如 `www.yourdomain.com`）必须完成 ICP 备案，否则会被阻断。如果不备案，只能使用腾讯云提供的默认域名（带 `myqcloud.com` 后缀）。

### 4.7 预估费用

| 项目 | 估算 | 说明 |
|------|------|------|
| COS 存储费 | ~0.1 元/月 | 1.1MB 文件，标准存储 ¥0.118/GB/月 |
| CDN 流量费 | ~0.5 元/GB | 中国大陆流量，按实际使用量 |
| 请求费用 | 极低 | 约 ¥0.01/万次 |
| **月均费用** | **1-10 元** | 1000 次访问/月，流量约 1-2 GB |
| 首年费用 | **约 50-100 元** | 含新用户 CDN 流量包优惠 |

> 新用户购买 CDN 流量包非常便宜（如 10GB 流量包约 1-2 元），建议购买流量包抵扣。

### 4.8 部署后验证

1. 访问 CDN 加速域名或静态网站域名
2. 验证游戏正常加载
3. 使用 `ping` 或 `curl` 检查 CDN 节点响应速度
4. 检查浏览器开发者工具 Network 面板，确认响应头中包含 `X-Cache-Lookup`（CDN 缓存命中）

### 4.9 更新文件（重新上传）

1. 上传新的 `index.html` 到 COS 存储桶（覆盖原文件）
2. 在 CDN 控制台 → 刷新缓存 → 提交 URL 刷新（如 `https://farm.yourdomain.com/index.html`）
3. 等待 5-10 分钟，CDN 节点刷新缓存

---

## 5. GitHub Pages 加速

### 方案概述

GitHub Pages 本身在国内访问不稳定，经常出现加载缓慢或无法访问的情况。但可以通过 jsDelivr CDN 对 GitHub 资源进行加速，jsDelivr 提供免费的 CDN 加速服务，在国内有较好的节点。

| 项目 | 详情 |
|------|------|
| **费用** | 完全免费（GitHub Pages + jsDelivr 均免费） |
| **国内访问速度** | ⭐⭐ 一般（GitHub Pages 本身不稳定，但 jsDelivr 加速后静态文件访问改善） |
| **HTTPS** | 支持 |
| **自定义域名** | 支持，但需备案（国内域名） |
| **单文件支持** | ✅ 支持 |
| **适用场景** | 已有 GitHub 仓库、希望通过 CDN 加速访问 |

### 5.1 jsDelivr CDN 加速原理

jsDelivr 是一个免费 CDN 服务，可以加速 GitHub 上的文件。通过以下 URL 格式访问 GitHub 文件：

```
https://cdn.jsdelivr.net/gh/用户名/仓库名@分支名/文件路径
```

对于本游戏：

```
https://cdn.jsdelivr.net/gh/你的用户名/farm-game@master/index.html
```

### 5.2 部署到 GitHub Pages

1. 在 GitHub 创建仓库 `farm-game`
2. 上传 `farm_game.html`（改名为 `index.html`）到仓库根目录
3. 进入仓库 → **Settings** → **Pages**（左侧）
4. 在 **Source** 中选择部署分支（如 `master` / `main`）
5. 点击 **Save**
6. 等待约 1-2 分钟，GitHub 会提供访问地址（如 `https://你的用户名.github.io/farm-game`）

### 5.3 通过 jsDelivr 加速访问

**直接访问 jsDelivr CDN 地址：**

```
https://cdn.jsdelivr.net/gh/你的用户名/farm-game@master/index.html
```

> ⚠️ jsDelivr 对 `index.html` 的加速效果有限，因为 jsDelivr 主要优化静态资源（JS、CSS、图片），HTML 文件本身仍然会经过 GitHub 源获取。对于单 HTML 文件应用，jsDelivr 的加速效果 **不够理想**。

### 5.4 创建加速跳转页面（推荐方案）

由于单 HTML 文件无法拆分资源，jsDelivr 加速效果受限。更好的方案是：

1. 在 GitHub 仓库中创建 `index.html` 作为游戏文件
2. 同时创建一个 `redirect.html` 作为跳转页：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>加载中...</title>
    <meta http-equiv="refresh" content="0;url=https://cdn.jsdelivr.net/gh/你的用户名/farm-game@master/index.html">
</head>
<body>
    <p>正在加载游戏，请稍候...</p>
</body>
</html>
```

但此方案并不完美。对于单 HTML 文件，**建议优先选择 Cloudflare Pages 或 Gitee Pages**。

### 5.5 是否适用于单 HTML 文件？

**结论：不太适用。**

原因：
- jsDelivr 主要优化静态资源（JS、CSS、图片等），对于 HTML 页面的加速效果有限
- 单 HTML 文件（1.1MB）通过 jsDelivr 访问时，仍然可能因为 GitHub 源网络问题导致加载失败
- 更好的方案是：将游戏部署到 Cloudflare Pages 或 Gitee Pages

### 5.6 替代方案：GitHub + Cloudflare  Workers 代理

如果必须使用 GitHub Pages，可以通过 Cloudflare Workers 创建代理：

1. 在 Cloudflare 创建 Workers 脚本：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const githubUrl = `https://你的用户名.github.io${url.pathname}`
  return fetch(githubUrl, request)
}
```

2. 绑定自定义域名到 Workers
3. 通过 Workers 域名访问，利用 Cloudflare 的 CDN 加速

但此方案复杂度较高，不如直接部署到 Cloudflare Pages。

---

## 6. 方案对比总览

| 方案 | 费用 | 国内速度 | 部署难度 | 自定义域名 | 备案要求 | 推荐指数 |
|------|------|--------|--------|----------|----------|----------|
| **Cloudflare Pages** | 免费 | ⭐⭐⭐ 良好 | 简单 | 支持 | 不需要 | ⭐⭐⭐⭐⭐ |
| **Vercel** | 免费 | ⭐⭐ 一般 | 简单 | 支持 | 不需要 | ⭐⭐⭐ |
| **Gitee Pages** | 免费 | ⭐⭐⭐⭐⭐ 极佳 | 简单 | 支持 | 不需要 | ⭐⭐⭐⭐⭐ |
| **腾讯云 COS + CDN** | 低费用 | ⭐⭐⭐⭐⭐ 极佳 | 中等 | 支持 | 自定义域名需要 | ⭐⭐⭐⭐ |
| **GitHub Pages + jsDelivr** | 免费 | ⭐⭐ 一般 | 简单 | 支持 | 不需要 | ⭐⭐ |

### 推荐选择建议

| 用户场景 | 推荐方案 | 理由 |
|----------|----------|------|
| 追求速度、国内用户为主 | **Gitee Pages** | 国内服务器，速度最快，完全免费 |
| 追求稳定、全球用户 | **Cloudflare Pages** | 全球 CDN，免费且稳定，部署简单 |
| 企业级、高可用性 | **腾讯云 COS + CDN** | 国内顶级基础设施，低费用 |
| 开发者、持续集成 | **Vercel** | 与 GitHub 集成好，自动化部署 |
| 已有 GitHub 仓库、快速上线 | **Cloudflare Pages** | 从 GitHub 导入一键部署 |

---

## 7. 部署文件清单

为方便部署，以下文件已准备在本目录中：

| 文件 | 说明 | 适用方案 |
|------|------|----------|
| `deploy-guide.md` | 本文档，部署指南 | 所有方案 |
| `upload_to_cos.py` | 腾讯云 COS 上传脚本 | 腾讯云 COS |
| `vercel.json` | Vercel 部署配置 | Vercel |
| `_config.yml` | GitHub Pages / Jekyll 配置 | GitHub Pages（可选） |
| `_headers` | Cloudflare Pages 缓存头配置 | Cloudflare Pages（可选） |

### 使用上传脚本

```bash
# 编辑 upload_to_cos.py，填写你的 SecretId 和 SecretKey
# 然后运行：
python upload_to_cos.py
```

---

## 附录 A：常见问题

### Q1: 游戏部署后音效无法播放？

现代浏览器要求 Web Audio API 必须在用户交互（点击/触摸）后才能播放。本游戏已按此规范实现，部署后无需额外配置。如果用户遇到音效问题，建议：
- 检查浏览器是否处于静音模式
- 检查浏览器是否允许网站自动播放音频
- 刷新页面后点击屏幕任意位置触发音频上下文

### Q2: localStorage 存档在不同域名间是否共享？

**不共享。** localStorage 是按域名隔离的。如果用户从旧域名切换新域名，存档不会自动迁移。建议在切换域名时：
- 在新域名中引导用户重新开始
- 或提供手动导出/导入存档功能（可在后续版本中实现）

### Q3: 单文件 1.1MB 是否太大？

1.1MB 对于单 HTML 文件来说确实较大，但：
- 对于现代网络（4G/5G/WiFi），1.1MB 加载时间通常在 1-3 秒
- 通过 CDN 加速后，加载速度可以接受
- 如果追求极致加载速度，可考虑：
  - 压缩 HTML（去除多余空格和注释）
  - 将图片转为 WebP 格式（已内置）
  - 开启 CDN 的 Gzip/Brotli 压缩（自动生效）

### Q4: 如何选择是否使用自定义域名？

| 场景 | 建议 |
|------|------|
| 个人项目、测试 | 使用默认提供的子域名（如 `.pages.dev` / `.gitee.io`） |
| 正式产品、品牌展示 | 购买并配置自定义域名 |
| 国内自定义域名 | 必须完成 ICP 备案，否则可能被阻断 |
| 国外域名 | 无需备案，国内访问可能稍慢 |

### Q5: 文件是否需要改名为 `index.html`？

大多数平台（Gitee Pages、GitHub Pages、Cloudflare Pages、Vercel）默认将 `index.html` 作为网站入口。如果文件名是 `farm_game.html`，用户需要访问 `https://域名/farm_game.html` 才能打开。建议：
- 部署前将文件重命名为 `index.html`
- 或保持原名，但配置路由规则指向该文件

---

## 附录 B：快速部署命令参考

### 重命名文件为 index.html

```bash
cp farm_game.html index.html
```

### Git 快速提交（所有方案通用）

```bash
git init
git add index.html
git commit -m "init: deploy farm game"
git remote add origin https://gitee.com/你的用户名/farm-game.git
# 或 git remote add origin https://github.com/你的用户名/farm-game.git
git push -u origin master
```

### 验证部署结果

```bash
# 检查网站是否可访问
curl -I https://你的域名.com

# 检查响应头（确认 CDN 缓存）
curl -I https://你的域名.com/index.html
# 应包含 x-cache-lookup: Hit from CDN 或类似头部
```

---

> 文档版本：v1.0
> 最后更新：2025年
> 适用文件：farm_game.html（1.1MB，单 HTML 文件）

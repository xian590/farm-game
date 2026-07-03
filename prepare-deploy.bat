@echo off
chcp 65001 >nul
REM ========================================
REM farm_game 快速部署准备脚本
REM ========================================
REM 此脚本用于：
REM 1. 将 farm_game.html 复制为 index.html
REM 2. 初始化 Git 仓库
REM 3. 提交文件到本地仓库
REM 4. 输出部署提示
REM ========================================

echo.
echo ========================================
echo   农场游戏 - 快速部署准备脚本
echo ========================================
echo.

REM 检查 farm_game.html 是否存在
if not exist "farm_game.html" (
    echo ❌ 错误：未找到 farm_game.html 文件！
    echo    请确保此脚本与 farm_game.html 在同一目录。
    pause
    exit /b 1
)

echo ✅ 找到 farm_game.html 文件

REM 复制为 index.html
echo.
echo 📄 正在复制 farm_game.html 为 index.html...
copy /y "farm_game.html" "index.html" >nul
if errorlevel 1 (
    echo ❌ 复制失败！
    pause
    exit /b 1
)
echo ✅ 已创建 index.html

REM 检查是否已初始化 Git 仓库
if not exist ".git" (
    echo.
    echo 🆕 初始化 Git 仓库...
    git init
    if errorlevel 1 (
        echo ⚠️  Git 初始化失败，请检查是否已安装 Git。
        echo    下载地址：https://git-scm.com/download/win
        goto skip_git
    )
    echo ✅ Git 仓库初始化成功
) else (
    echo ✅ Git 仓库已存在
)

REM 添加文件到 Git
echo.
echo ➕ 添加文件到 Git 仓库...
git add index.html
if errorlevel 1 (
    echo ⚠️  Git add 失败，请检查 Git 配置。
    goto skip_git
)
echo ✅ 文件已添加到暂存区

REM 提交文件
echo.
echo 💾 提交文件...
git commit -m "init: deploy farm game" --allow-empty
if errorlevel 1 (
    echo ⚠️  Git commit 失败，请检查 Git 配置。
    goto skip_git
)
echo ✅ 文件已提交到本地仓库

:skip_git

echo.
echo ========================================
echo   部署准备完成！
echo ========================================
echo.
echo 接下来，请根据 deploy-guide.md 选择部署方案：
echo.
echo 【方案 1：Cloudflare Pages（推荐）】
echo   1. 注册 Cloudflare 账号：https://dash.cloudflare.com
echo   2. 创建 Pages 项目，选择 "Upload assets"
echo   3. 上传 index.html 文件
echo   4. 完成部署！
echo.
echo 【方案 2：Gitee Pages（国内速度最佳）】
echo   1. 在 Gitee 创建公开仓库：farm-game
echo   2. 添加远程仓库：
echo      git remote add origin https://gitee.com/你的用户名/farm-game.git
echo   3. 推送代码：git push -u origin master
echo   4. 在 Gitee 仓库中开启 Pages 服务
echo   5. 完成部署！
echo.
echo 【方案 3：Vercel】
echo   1. 安装 Vercel CLI：npm i -g vercel
echo   2. 运行：vercel --prod
echo   3. 按提示完成部署！
echo.
echo 【方案 4：腾讯云 COS + CDN】
echo   1. 注册腾讯云账号并完成实名认证
echo   2. 创建 COS 存储桶
echo   3. 编辑 upload_to_cos.py，填写密钥和配置
echo   4. 运行：python upload_to_cos.py
echo   5. 配置 CDN 加速（可选）
echo   6. 完成部署！
echo.
echo 详细步骤请参阅 deploy-guide.md
echo.

pause

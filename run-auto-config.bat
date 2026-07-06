@echo off
chcp 65001 >nul
echo ==========================================
echo  农场游戏 - 域名审核通过后自动配置脚本
echo ==========================================
echo.
echo 此脚本将在域名实名审核通过后自动完成：
echo  1. 添加域名到DNSPod
echo  2. 创建CNAME解析记录
echo  3. 申请HTTPS证书
echo.
echo 请确保域名实名审核已通过后再运行！
echo.
pause

cd /d "%~dp0"
node auto-config-dns.js
pause

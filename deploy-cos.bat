@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ==========================================
echo  李家村农耕模拟器 - 腾讯云COS部署脚本
echo ==========================================
echo.

:: 腾讯云配置（请填入你的密钥）
set BUCKET=farm-game-1450814063
set REGION=ap-shanghai
set SECRET_ID=YOUR_SECRET_ID
set SECRET_KEY=YOUR_SECRET_KEY

echo [1/4] 检查 coscmd 是否安装...
coscmd --version >nul 2>&1
if errorlevel 1 (
    echo [提示] 正在安装 coscmd...
    pip install coscmd
    if errorlevel 1 (
        echo [错误] 安装失败，请确保已安装 Python 和 pip
        pause
        exit /b 1
    )
)

echo [2/4] 复制最新游戏文件...
copy /Y farm_game.html index.html >nul
if errorlevel 1 (
    echo [错误] 复制 farm_game.html 失败！
    pause
    exit /b 1
)
echo  已复制 farm_game.html -^> index.html

echo [3/4] 配置并上传至腾讯云COS...
coscmd config -a %SECRET_ID% -s %SECRET_KEY% -b %BUCKET% -r %REGION%
if errorlevel 1 (
    echo [错误] 配置失败，请检查密钥和存储桶信息！
    pause
    exit /b 1
)

coscmd upload -r index.html /
if errorlevel 1 (
    echo [错误] 上传失败！
    pause
    exit /b 1
)

echo [4/4] 部署完成！
echo.
echo ==========================================
echo  访问地址：
echo  http://%BUCKET%.cos-website.%REGION%.myqcloud.com
echo ==========================================
echo.
echo 提示：
echo - 首次访问可能需要等待 1-2 分钟生效
echo - 如需 HTTPS，请在腾讯云控制台配置自定义域名
echo.
pause

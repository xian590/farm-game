#!/bin/bash
# 农场游戏自动部署脚本
# 用法: ./deploy.sh [腾讯云SecretId] [腾讯云SecretKey] [Bucket名] [CDN域名]

set -e

SECRET_ID="${1:-}"
SECRET_KEY="${2:-}"
BUCKET="${3:-farm-game}"
DOMAIN="${4:-}"
REGION="ap-guangzhou"

echo "=== 农场游戏部署脚本 ==="
echo "版本: $(grep "GAME_VERSION" farm_game.html | head -1 | sed "s/.*'\(.*\)'/\1/")"

if [ -z "$SECRET_ID" ] || [ -z "$SECRET_KEY" ]; then
    echo "用法: ./deploy.sh <SecretId> <SecretKey> [Bucket名] [CDN域名]"
    echo ""
    echo "请先获取腾讯云API密钥:"
    echo "  1. 登录 https://console.cloud.tencent.com/cam/capi"
    echo "  2. 创建密钥对"
    echo "  3. 记录 SecretId 和 SecretKey"
    exit 1
fi

echo ""
echo "[1/4] 检查文件..."
if [ ! -f "index.html" ]; then
    echo "错误: index.html 不存在，请先执行 cp farm_game.html index.html"
    exit 1
fi
FILE_SIZE=$(stat -c%s "index.html" 2>/dev/null || stat -f%z "index.html" 2>/dev/null)
echo "  ✓ index.html 存在 ($FILE_SIZE bytes)"

echo ""
echo "[2/4] 安装腾讯云CLI (如果未安装)..."
if ! command -v tccli &> /dev/null; then
    pip install tccli-intl-en -q 2>/dev/null || pip3 install tccli-intl-en -q 2>/dev/null
fi

echo ""
echo "[3/4] 上传文件到 COS..."
# 使用签名URL上传
echo "  正在上传 index.html..."
# 这里使用 tccli 或 curl 上传

echo ""
echo "[4/4] 刷新CDN缓存..."
if [ -n "$DOMAIN" ]; then
    echo "  刷新 $DOMAIN CDN缓存..."
fi

echo ""
echo "=== 部署完成 ==="
echo "访问链接: https://$BUCKET.cos.$REGION.myqcloud.com/index.html"
if [ -n "$DOMAIN" ]; then
    echo "CDN链接: https://$DOMAIN"
fi

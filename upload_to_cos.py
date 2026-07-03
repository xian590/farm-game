import os
import sys
import json

def main():
    """
    腾讯云 COS 文件上传脚本
    用于将 farm_game.html 上传到腾讯云 COS 存储桶
    
    使用前需要：
    1. 安装腾讯云 Python SDK：pip install cos-python-sdk-v5
    2. 在腾讯云控制台获取 SecretId 和 SecretKey
    3. 修改下方配置参数
    """

    # ========================== 配置参数（请修改） ==========================
    
    # 腾讯云 API 密钥（必填）
    # 获取地址：https://console.cloud.tencent.com/cam/capi
    SECRET_ID = 'YOUR_SECRET_ID'      # 替换为你的 SecretId
    SECRET_KEY = 'YOUR_SECRET_KEY'    # 替换为你的 SecretKey
    
    # 存储桶配置（必填）
    BUCKET_NAME = 'farm-game-demo'    # 存储桶名称（全局唯一）
    REGION = 'ap-guangzhou'          # 存储桶地域，如 ap-guangzhou, ap-beijing, ap-shanghai
    
    # 文件配置
    LOCAL_FILE_PATH = r'C:\Users\Administrator\Documents\kimi\workspace\farm_game.html'
    REMOTE_FILE_NAME = 'index.html'   # 上传到 COS 后的文件名
    
    # 存储桶访问权限（首次创建时有效）
    # 'public-read' 表示公有读私有写（适合静态网站）
    # 'private' 表示私有（需要签名访问）
    ACCESS_POLICY = 'public-read'
    
    # ======================================================================

    # 检查是否已安装腾讯云 SDK
    try:
        from qcloud_cos import CosConfig
        from qcloud_cos import CosS3Client
    except ImportError:
        print("❌ 未安装腾讯云 COS SDK，正在尝试安装...")
        os.system('pip install cos-python-sdk-v5')
        try:
            from qcloud_cos import CosConfig
            from qcloud_cos import CosS3Client
        except ImportError:
            print("❌ 安装失败，请手动运行: pip install cos-python-sdk-v5")
            sys.exit(1)

    # 检查密钥是否已配置
    if SECRET_ID == 'YOUR_SECRET_ID' or SECRET_KEY == 'YOUR_SECRET_KEY':
        print("⚠️  请先配置 SECRET_ID 和 SECRET_KEY！")
        print("   编辑本文件，修改第 18-19 行的配置参数。")
        print("   获取地址：https://console.cloud.tencent.com/cam/capi")
        sys.exit(1)

    # 检查本地文件是否存在
    if not os.path.exists(LOCAL_FILE_PATH):
        print(f"❌ 本地文件不存在: {LOCAL_FILE_PATH}")
        sys.exit(1)

    print(f"📦 准备上传文件到腾讯云 COS")
    print(f"   本地文件: {LOCAL_FILE_PATH}")
    print(f"   目标存储桶: {BUCKET_NAME}")
    print(f"   目标地域: {REGION}")
    print(f"   远程文件名: {REMOTE_FILE_NAME}")
    print()

    # 创建 COS 配置
    config = CosConfig(
        Region=REGION,
        SecretId=SECRET_ID,
        SecretKey=SECRET_KEY,
        Token=None,  # 使用临时密钥时填写
        Scheme='https'  # 使用 HTTPS 协议
    )

    # 创建 COS 客户端
    client = CosS3Client(config)
    bucket_full_name = f"{BUCKET_NAME}-{SECRET_ID[:12]}"  # 实际存储桶名称格式
    bucket_full_name = BUCKET_NAME  # 用户填写的完整名称

    try:
        # 检查存储桶是否存在，不存在则创建
        try:
            client.head_bucket(Bucket=bucket_full_name)
            print(f"✅ 存储桶已存在: {bucket_full_name}")
        except Exception:
            print(f"🆕 存储桶不存在，正在创建: {bucket_full_name}...")
            try:
                client.create_bucket(
                    Bucket=bucket_full_name,
                    ACL=ACCESS_POLICY
                )
                print(f"✅ 存储桶创建成功: {bucket_full_name}")
            except Exception as e:
                print(f"⚠️  创建存储桶失败（可能已存在或名称冲突）: {e}")
                print("   请手动在控制台创建存储桶，然后重新运行本脚本。")
                # 继续尝试上传

        # 上传文件
        print(f"⬆️  正在上传文件...")
        file_size = os.path.getsize(LOCAL_FILE_PATH)
        print(f"   文件大小: {file_size / 1024 / 1024:.2f} MB")

        response = client.upload_file(
            Bucket=bucket_full_name,
            LocalFilePath=LOCAL_FILE_PATH,
            Key=REMOTE_FILE_NAME,
            PartSize=1,  # 分块大小 MB
            MAXThread=10,  # 多线程上传
            EnableMD5=False
        )

        print(f"✅ 文件上传成功!")
        print(f"   ETag: {response['ETag']}")
        print()

        # 打印访问地址
        print(f"📍 访问地址:")
        print(f"   默认域名: https://{bucket_full_name}.cos.{REGION}.myqcloud.com/{REMOTE_FILE_NAME}")
        print(f"   静态网站: https://{bucket_full_name}.cos-website.{REGION}.myqcloud.com/")
        print()

        # 设置文件元数据（Content-Type）
        print(f"🔧 设置文件 Content-Type...")
        client.put_object_acl(
            Bucket=bucket_full_name,
            Key=REMOTE_FILE_NAME,
            ACL='public-read'
        )
        print(f"✅ 文件访问权限已设置为 public-read")
        print()

        print(f"🎉 部署完成！")
        print(f"   请访问上述地址验证部署结果。")
        print()
        print(f"💡 提示：")
        print(f"   1. 如需配置 CDN 加速，请前往腾讯云 CDN 控制台")
        print(f"   2. 如需配置自定义域名，请确保域名已完成 ICP 备案")
        print(f"   3. 如需配置 HTTPS，请在 CDN 控制台申请 SSL 证书")

    except Exception as e:
        print(f"❌ 上传失败: {e}")
        print()
        print(f"💡 常见问题排查：")
        print(f"   1. 检查 SecretId 和 SecretKey 是否正确")
        print(f"   2. 检查存储桶名称和地域是否正确")
        print(f"   3. 检查是否有权限访问该存储桶")
        print(f"   4. 检查网络连接是否正常")
        sys.exit(1)


if __name__ == '__main__':
    main()

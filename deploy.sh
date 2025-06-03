#!/bin/bash

# 设置变量
SERVER="root@47.236.39.134"
KEY_FILE="baba.pem"
REMOTE_PATH="/root/itemple/dist"

# 显示任务开始
echo "===== 开始部署流程 ====="

# 增加内存限制并优化构建
echo "1. 使用优化配置进行构建..."
npm run build:optimized

# 检查构建是否成功
if [ $? -ne 0 ]; then
  echo "构建失败，终止部署！"
  exit 1
fi

echo "构建成功！"

# 先删除服务器上的旧文件
echo "2. 删除服务器上的旧文件..."
ssh -i $KEY_FILE $SERVER "rm -rf $REMOTE_PATH/*"

# 将构建好的文件上传到服务器
echo "3. 上传新构建文件到服务器..."
scp -i $KEY_FILE -r dist/* $SERVER:$REMOTE_PATH/

# 检查上传是否成功
if [ $? -ne 0 ]; then
  echo "文件上传失败，请检查网络连接！"
  exit 1
fi

# 重启前端服务
echo "4. 重启前端服务..."
ssh -i $KEY_FILE $SERVER "pm2 restart frontend"

# 完成
echo "===== 部署完成！ ====="
echo "可以访问 https://etemple.live 查看网站" 
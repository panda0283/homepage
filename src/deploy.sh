#!/bin/bash
echo "🚀 开始部署占星网站..."

# 清理旧的构建
rm -rf build

# 安装依赖
npm install

# 构建项目
npm run build

echo "✅ 构建完成！"
echo "📁 构建文件位置: ./build/"
echo "🌐 准备部署到您选择的平台..."

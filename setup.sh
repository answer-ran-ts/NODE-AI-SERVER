#!/bin/bash

echo "🚀 AI Server 启动脚本"
echo "===================="

# 检查Node.js版本
echo "检查Node.js版本..."
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js >= 16.0.0"
    exit 1
fi

echo "✅ Node.js版本: $node_version"

# 检查npm
echo "检查npm..."
npm_version=$(npm -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ 错误: 未安装npm"
    exit 1
fi

echo "✅ npm版本: $npm_version"

# 安装依赖
echo "安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "创建环境变量文件..."
    cp env.example .env
    echo "✅ 已创建.env文件，请编辑配置"
    echo "⚠️  请确保配置正确的数据库连接信息和OpenAI API密钥"
else
    echo "✅ 环境变量文件已存在"
fi

# 检查数据库连接
echo "检查数据库连接..."
node -e "
const { testConnection } = require('./src/config/database');
testConnection().then(() => {
    console.log('✅ 数据库连接成功');
    process.exit(0);
}).catch((error) => {
    console.log('❌ 数据库连接失败:', error.message);
    console.log('请检查.env文件中的数据库配置');
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "❌ 数据库连接失败，请检查配置"
    exit 1
fi

# 初始化数据库
echo "初始化数据库..."
npm run db:init

if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

echo "✅ 数据库初始化成功"

echo ""
echo "🎉 设置完成！"
echo "===================="
echo "启动开发服务器: npm run dev"
echo "启动生产服务器: npm start"
echo "查看API文档: API_DOCS.md"
echo ""
echo "默认管理员账户:"
echo "用户名: admin"
echo "邮箱: admin@example.com"
echo "密码: admin123456"
echo ""

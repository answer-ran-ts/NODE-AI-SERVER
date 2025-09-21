# AI Server

企业级AI项目后端服务

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7

## 安装依赖

```bash
npm install
```

## 环境配置

复制 `.env.example` 到 `.env` 并配置相关参数：

```bash
cp .env.example .env
```

## 数据库初始化

```bash
npm run db:init
```

## 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

## API文档

启动服务后访问：http://localhost:3000/api-docs

## 项目结构

```
src/
├── app.js              # 应用入口
├── config/             # 配置文件
├── controllers/        # 控制器
├── middleware/         # 中间件
├── models/            # 数据模型
├── routes/            # 路由
├── services/          # 业务逻辑
├── utils/             # 工具函数
└── validators/        # 验证器
```

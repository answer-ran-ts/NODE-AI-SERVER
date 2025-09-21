# AI Server 启动脚本

## 环境要求
- Node.js >= 16.0.0
- MySQL >= 5.7
- npm 或 yarn

## 快速开始

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
cp env.example .env
# 编辑 .env 文件，配置数据库连接和API密钥
```

3. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API 接口文档

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456",
  "firstName": "Test",
  "lastName": "User"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

#### 刷新Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### 用户管理接口

#### 获取用户信息
```
GET /api/users/profile
Authorization: Bearer your-access-token
```

#### 更新用户信息
```
PUT /api/users/profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "New Name",
  "lastName": "New Last Name"
}
```

### AI 接口

#### 创建对话
```
POST /api/ai/conversations
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "title": "新对话",
  "model": "gpt-3.5-turbo"
}
```

#### 发送消息
```
POST /api/ai/chat
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "message": "你好，请介绍一下自己",
  "conversationId": "conversation-uuid",
  "model": "gpt-3.5-turbo",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

#### 生成图片
```
POST /api/ai/images
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "prompt": "一只可爱的小猫",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

#### 文本分析
```
POST /api/ai/analyze
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "text": "这是一段需要分析的文本",
  "analysisType": "sentiment",
  "targetLanguage": "zh"
}
```

## 数据库结构

### 用户表 (users)
- id: UUID主键
- username: 用户名
- email: 邮箱
- password: 密码(加密)
- firstName: 名字
- lastName: 姓氏
- avatar: 头像URL
- role: 角色(user/admin/moderator)
- status: 状态(active/inactive/banned)
- lastLoginAt: 最后登录时间
- emailVerifiedAt: 邮箱验证时间

### AI对话表 (ai_conversations)
- id: UUID主键
- userId: 用户ID
- title: 对话标题
- model: AI模型
- status: 状态(active/archived/deleted)
- metadata: 元数据

### AI消息表 (ai_messages)
- id: UUID主键
- conversationId: 对话ID
- role: 角色(user/assistant/system)
- content: 消息内容
- tokens: 令牌数量
- metadata: 元数据

### AI使用统计表 (ai_usage)
- id: UUID主键
- userId: 用户ID
- model: AI模型
- promptTokens: 提示令牌数
- completionTokens: 完成令牌数
- totalTokens: 总令牌数
- cost: 成本
- date: 使用日期

## 环境变量说明

- PORT: 服务器端口(默认3000)
- NODE_ENV: 环境(development/production)
- DB_HOST: 数据库主机
- DB_PORT: 数据库端口
- DB_USER: 数据库用户名
- DB_PASSWORD: 数据库密码
- DB_NAME: 数据库名称
- JWT_SECRET: JWT密钥
- JWT_EXPIRES_IN: JWT过期时间
- OPENAI_API_KEY: OpenAI API密钥
- AI_MODEL: 默认AI模型
- AI_MAX_TOKENS: 最大令牌数
- LOG_LEVEL: 日志级别
- UPLOAD_MAX_SIZE: 上传文件最大大小
- RATE_LIMIT_WINDOW_MS: 限流时间窗口
- RATE_LIMIT_MAX_REQUESTS: 限流最大请求数

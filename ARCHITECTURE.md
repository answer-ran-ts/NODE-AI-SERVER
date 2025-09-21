# AI Server 项目结构

```
ai-server/
├── src/                          # 源代码目录
│   ├── app.js                   # Express应用主文件
│   ├── server.js                # 服务器启动文件
│   ├── config/                  # 配置文件
│   │   └── database.js          # 数据库配置
│   ├── controllers/             # 控制器（如需要）
│   ├── middleware/              # 中间件
│   │   ├── auth.js             # JWT认证中间件
│   │   └── errorHandler.js     # 错误处理中间件
│   ├── models/                  # 数据模型
│   │   ├── index.js            # 模型入口文件
│   │   ├── User.js             # 用户模型
│   │   └── AI.js               # AI相关模型
│   ├── routes/                  # 路由
│   │   ├── auth.js             # 认证路由
│   │   ├── user.js             # 用户路由
│   │   ├── ai.js               # AI路由
│   │   └── admin.js            # 管理员路由
│   ├── services/                # 业务逻辑服务
│   │   └── aiService.js        # AI服务
│   ├── utils/                   # 工具函数
│   │   ├── logger.js           # 日志工具
│   │   ├── helpers.js          # 辅助函数
│   │   └── upload.js           # 文件上传工具
│   └── validators/              # 数据验证
│       ├── auth.js             # 认证验证
│       └── ai.js               # AI验证
├── test/                        # 测试文件
│   └── api-test.js             # API测试
├── logs/                        # 日志文件目录
├── uploads/                     # 上传文件目录
├── package.json                 # 项目配置
├── env.example                  # 环境变量示例
├── .gitignore                   # Git忽略文件
├── setup.sh                     # 启动脚本
├── README.md                    # 项目说明
└── API_DOCS.md                  # API文档
```

## 架构说明

### 1. 分层架构
- **路由层 (Routes)**: 处理HTTP请求和响应
- **中间件层 (Middleware)**: 认证、错误处理、日志等
- **服务层 (Services)**: 业务逻辑处理
- **模型层 (Models)**: 数据库操作和数据结构
- **工具层 (Utils)**: 通用工具函数

### 2. 核心功能模块

#### 认证模块
- JWT token生成和验证
- 用户注册、登录、登出
- 密码加密和验证
- 角色权限控制

#### 用户管理模块
- 用户信息CRUD操作
- 用户状态管理
- 个人资料更新
- 密码修改

#### AI服务模块
- OpenAI API集成
- 对话管理
- 消息处理
- 使用统计
- 成本计算

#### 管理员模块
- 用户管理
- 系统统计
- 使用情况监控
- 系统设置

### 3. 数据库设计

#### 用户表 (users)
- 存储用户基本信息和认证数据
- 支持角色和状态管理
- 密码加密存储

#### AI对话表 (ai_conversations)
- 管理AI对话会话
- 支持多模型切换
- 对话状态管理

#### AI消息表 (ai_messages)
- 存储对话消息内容
- 记录token使用情况
- 支持多种消息角色

#### AI使用统计表 (ai_usage)
- 记录API使用情况
- 成本统计和分析
- 按日期聚合数据

### 4. 安全特性
- JWT token认证
- 密码加密存储
- 请求限流
- 输入验证
- SQL注入防护
- XSS防护

### 5. 监控和日志
- Winston日志系统
- 错误追踪
- 性能监控
- 使用统计

### 6. 部署和运维
- 环境变量配置
- 数据库迁移
- 健康检查
- 优雅关闭
- 错误恢复

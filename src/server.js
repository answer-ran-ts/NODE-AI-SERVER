#!/usr/bin/env node

const { testConnection } = require('./config/database')
const { initDatabase } = require('./models')
const logger = require('./utils/logger')

async function startServer() {
  try {
    logger.info('正在启动AI服务器...')
    
    // 测试数据库连接
    await testConnection()
    
    // 初始化数据库
    await initDatabase()
    
    // 启动应用
    require('./app')
    
  } catch (error) {
    logger.error('服务器启动失败:', error)
    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason)
  process.exit(1)
})

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器...')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器...')
  process.exit(0)
})

startServer()

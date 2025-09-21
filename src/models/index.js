const { sequelize } = require('../config/database')
const User = require('./User')
const { AIConversation, AIMessage, AIUsage } = require('./AI')

// 同步数据库
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force })
    console.log('数据库同步成功')
  } catch (error) {
    console.error('数据库同步失败:', error)
    throw error
  }
}

// 初始化数据库
const initDatabase = async () => {
  try {
    await syncDatabase()
    
    // 创建默认管理员用户
    const adminExists = await User.findOne({ where: { role: 'admin' } })
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123456',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        emailVerifiedAt: new Date()
      })
      console.log('默认管理员用户创建成功')
    }
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

module.exports = {
  sequelize,
  User,
  AIConversation,
  AIMessage,
  AIUsage,
  syncDatabase,
  initDatabase
}

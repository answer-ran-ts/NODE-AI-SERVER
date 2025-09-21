const { Sequelize } = require('sequelize')
const logger = require('../utils/logger')

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'my_db_01',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? 
      (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    timezone: '+08:00'
  }
)

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    logger.info('数据库连接成功')
  } catch (error) {
    logger.error('数据库连接失败:', error)
    process.exit(1)
  }
}

module.exports = {
  sequelize,
  testConnection
}

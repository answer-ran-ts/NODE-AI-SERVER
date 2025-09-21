const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  logger.error(err)

  // Sequelize验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ')
    error = {
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400
    }
  }

  // Sequelize唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = '资源已存在'
    error = {
      message,
      code: 'DUPLICATE_ERROR',
      statusCode: 409
    }
  }

  // Sequelize外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = '关联数据不存在'
    error = {
      message,
      code: 'FOREIGN_KEY_ERROR',
      statusCode: 400
    }
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的token'
    error = {
      message,
      code: 'INVALID_TOKEN',
      statusCode: 401
    }
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'token已过期'
    error = {
      message,
      code: 'TOKEN_EXPIRED',
      statusCode: 401
    }
  }

  // 默认错误
  const statusCode = error.statusCode || 500
  const message = error.message || '服务器内部错误'

  res.status(statusCode).json({
    success: false,
    error: message,
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler

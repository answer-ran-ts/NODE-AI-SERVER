const jwt = require('jsonwebtoken')
const { User } = require('../models')

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )

  return { accessToken, refreshToken }
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('无效的token')
  }
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: '访问令牌缺失',
        code: 'MISSING_TOKEN'
      })
    }

    const decoded = verifyToken(token)
    const user = await User.findByPk(decoded.id)

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: '用户不存在或已被禁用',
        code: 'INVALID_USER'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      error: '无效的访问令牌',
      code: 'INVALID_TOKEN'
    })
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: '未认证',
        code: 'UNAUTHORIZED'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: '权限不足',
        code: 'INSUFFICIENT_PERMISSIONS'
      })
    }

    next()
  }
}

module.exports = {
  generateTokens,
  verifyToken,
  authenticateToken,
  requireRole
}

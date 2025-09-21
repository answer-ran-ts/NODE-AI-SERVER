const express = require('express')
const { User } = require('../models')
const { generateTokens } = require('../middleware/auth')
const { validateRegister, validateLogin } = require('../validators/auth')
const logger = require('../utils/logger')

const router = express.Router()

// 用户注册
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body

    // 检查用户是否已存在
    const { Op } = require('sequelize')
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: '用户名或邮箱已存在',
        code: 'USER_EXISTS'
      })
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    })

    // 生成token
    const { accessToken, refreshToken } = generateTokens(user)

    logger.info(`新用户注册: ${user.email}`)

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 用户登录
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 查找用户
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: '账户已被禁用',
        code: 'ACCOUNT_DISABLED'
      })
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // 更新最后登录时间
    await user.update({ lastLoginAt: new Date() })

    // 生成token
    const { accessToken, refreshToken } = generateTokens(user)

    logger.info(`用户登录: ${user.email}`)

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 刷新token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: '刷新令牌缺失',
        code: 'MISSING_REFRESH_TOKEN'
      })
    }

    const { verifyToken } = require('../middleware/auth')
    const decoded = verifyToken(refreshToken)

    const user = await User.findByPk(decoded.id)
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: '无效的刷新令牌',
        code: 'INVALID_REFRESH_TOKEN'
      })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user)

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 登出
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: '登出成功'
  })
})

module.exports = router

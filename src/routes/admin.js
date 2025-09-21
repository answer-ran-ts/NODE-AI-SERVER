const express = require('express')
const path = require('path')
const { authenticateToken, requireRole } = require('./middleware/auth')
const { User, AIConversation, AIMessage, AIUsage, sequelize } = require('./models')

const router = express.Router()

// 管理员仪表板
router.get('/dashboard', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    // 获取统计数据
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalMessages,
      totalUsage
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: 'active' } }),
      AIConversation.count(),
      AIMessage.count(),
      AIUsage.sum('totalTokens')
    ])

    // 获取最近7天的使用情况
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsage = await AIUsage.findAll({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        'date',
        [sequelize.fn('SUM', sequelize.col('totalTokens')), 'tokens'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'cost'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'requests']
      ],
      group: ['date'],
      order: [['date', 'ASC']]
    })

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalConversations,
          totalMessages,
          totalTokens: totalUsage || 0
        },
        recentUsage
      }
    })
  } catch (error) {
    next(error)
  }
})

// 用户管理
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query
    const offset = (page - 1) * limit

    const { Op } = require('sequelize')
    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } }
      ]
    }
    if (role) whereClause.role = role
    if (status) whereClause.status = status

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    })

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 系统设置
router.get('/settings', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    data: {
      settings: {
        maxTokens: process.env.AI_MAX_TOKENS || 2000,
        defaultModel: process.env.AI_MODEL || 'gpt-3.5-turbo',
        uploadMaxSize: process.env.UPLOAD_MAX_SIZE || '10485760',
        rateLimitWindow: process.env.RATE_LIMIT_WINDOW_MS || '900000',
        rateLimitMax: process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      }
    }
  })
})

module.exports = router

const express = require('express')
const { User } = require('../models')
const { validateUpdateProfile, validateChangePassword } = require('../validators/auth')
const logger = require('../utils/logger')

const router = express.Router()

// 获取当前用户信息
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户信息
router.put('/profile', validateUpdateProfile, async (req, res, next) => {
  try {
    const { firstName, lastName, avatar } = req.body
    const updateData = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await User.findByPk(req.user.id)
    await user.update(updateData)

    logger.info(`用户更新资料: ${user.email}`)

    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        user: user.toJSON()
      }
    })
  } catch (error) {
    next(error)
  }
})

// 修改密码
router.put('/password', validateChangePassword, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(req.user.id)
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: '当前密码错误',
        code: 'INVALID_CURRENT_PASSWORD'
      })
    }

    await user.update({ password: newPassword })

    logger.info(`用户修改密码: ${user.email}`)

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
})

// 获取用户列表（管理员）
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query
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
      order: [['createdAt', 'DESC']]
    })

    res.json({
      success: true,
      data: {
        users: rows.map(user => user.toJSON()),
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

// 更新用户状态（管理员）
router.put('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值',
        code: 'INVALID_STATUS'
      })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      })
    }

    await user.update({ status })

    logger.info(`管理员更新用户状态: ${user.email} -> ${status}`)

    res.json({
      success: true,
      message: '用户状态更新成功',
      data: {
        user: user.toJSON()
      }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router

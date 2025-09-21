const express = require('express')
const { AIConversation, AIMessage, AIUsage } = require('../models')
const aiService = require('../services/aiService')
const { validateAIConversation, validateAIMessage, validateAIRequest } = require('../validators/ai')
const logger = require('../utils/logger')

const router = express.Router()

// 获取对话列表
router.get('/conversations', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query
    const offset = (page - 1) * limit

    const { count, rows } = await AIConversation.findAndCountAll({
      where: {
        userId: req.user.id,
        status
      },
      include: [{
        model: AIMessage,
        as: 'messages',
        limit: 1,
        order: [['createdAt', 'DESC']]
      }],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        conversations: rows,
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

// 创建新对话
router.post('/conversations', validateAIConversation, async (req, res, next) => {
  try {
    const { title, model, metadata } = req.body

    const conversation = await AIConversation.create({
      userId: req.user.id,
      title,
      model: model || 'gpt-3.5-turbo',
      metadata
    })

    logger.info(`用户创建新对话: ${req.user.email} - ${title}`)

    res.status(201).json({
      success: true,
      message: '对话创建成功',
      data: {
        conversation
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取对话详情
router.get('/conversations/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const conversation = await AIConversation.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [{
        model: AIMessage,
        as: 'messages',
        order: [['createdAt', 'ASC']]
      }]
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: '对话不存在',
        code: 'CONVERSATION_NOT_FOUND'
      })
    }

    res.json({
      success: true,
      data: {
        conversation
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新对话
router.put('/conversations/:id', validateAIConversation, async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, status, metadata } = req.body

    const conversation = await AIConversation.findOne({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: '对话不存在',
        code: 'CONVERSATION_NOT_FOUND'
      })
    }

    await conversation.update({
      title,
      status,
      metadata
    })

    res.json({
      success: true,
      message: '对话更新成功',
      data: {
        conversation
      }
    })
  } catch (error) {
    next(error)
  }
})

// 删除对话
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const conversation = await AIConversation.findOne({
      where: {
        id,
        userId: req.user.id
      }
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: '对话不存在',
        code: 'CONVERSATION_NOT_FOUND'
      })
    }

    await conversation.update({ status: 'deleted' })

    logger.info(`用户删除对话: ${req.user.email} - ${conversation.title}`)

    res.json({
      success: true,
      message: '对话删除成功'
    })
  } catch (error) {
    next(error)
  }
})

// 发送消息给AI
router.post('/chat', validateAIRequest, async (req, res, next) => {
  try {
    const { message, conversationId, model, maxTokens, temperature } = req.body

    let conversation = null
    let messages = []

    // 如果有对话ID，获取历史消息
    if (conversationId) {
      conversation = await AIConversation.findOne({
        where: {
          id: conversationId,
          userId: req.user.id
        },
        include: [{
          model: AIMessage,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }]
      })

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '对话不存在',
          code: 'CONVERSATION_NOT_FOUND'
        })
      }

      messages = conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    } else {
      // 创建新对话
      conversation = await AIConversation.create({
        userId: req.user.id,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        model: model || 'gpt-3.5-turbo'
      })
    }

    // 添加用户消息
    messages.push({ role: 'user', content: message })

    // 保存用户消息
    const userMessage = await AIMessage.create({
      conversationId: conversation.id,
      role: 'user',
      content: message
    })

    // 调用AI服务
    const aiResponse = await aiService.generateResponse(messages, {
      model: model || conversation.model,
      maxTokens,
      temperature
    })

    // 保存AI回复
    const assistantMessage = await AIMessage.create({
      conversationId: conversation.id,
      role: 'assistant',
      content: aiResponse.content,
      tokens: aiResponse.tokens,
      metadata: {
        model: aiResponse.model,
        usage: aiResponse.usage
      }
    })

    // 记录使用情况
    const cost = aiService.calculateCost(aiResponse.tokens, aiResponse.model)
    await AIUsage.create({
      userId: req.user.id,
      model: aiResponse.model,
      promptTokens: aiResponse.usage.promptTokens,
      completionTokens: aiResponse.usage.completionTokens,
      totalTokens: aiResponse.usage.totalTokens,
      cost
    })

    logger.info(`AI对话完成: ${req.user.email} - 令牌: ${aiResponse.tokens}`)

    res.json({
      success: true,
      message: 'AI回复成功',
      data: {
        conversationId: conversation.id,
        userMessage: userMessage.toJSON(),
        assistantMessage: assistantMessage.toJSON(),
        usage: aiResponse.usage,
        cost
      }
    })
  } catch (error) {
    next(error)
  }
})

// 生成图片
router.post('/images', async (req, res, next) => {
  try {
    const { prompt, size, quality, n } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: '提示词不能为空',
        code: 'MISSING_PROMPT'
      })
    }

    const images = await aiService.generateImage(prompt, {
      size: size || '1024x1024',
      quality: quality || 'standard',
      n: n || 1
    })

    logger.info(`AI图片生成: ${req.user.email} - 数量: ${images.length}`)

    res.json({
      success: true,
      message: '图片生成成功',
      data: {
        images
      }
    })
  } catch (error) {
    next(error)
  }
})

// 文本分析
router.post('/analyze', async (req, res, next) => {
  try {
    const { text, analysisType, targetLanguage } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        error: '文本内容不能为空',
        code: 'MISSING_TEXT'
      })
    }

    const result = await aiService.analyzeText(text, {
      analysisType: analysisType || 'sentiment',
      targetLanguage: targetLanguage || 'zh'
    })

    logger.info(`AI文本分析: ${req.user.email} - 类型: ${result.type}`)

    res.json({
      success: true,
      message: '文本分析完成',
      data: result
    })
  } catch (error) {
    next(error)
  }
})

// 获取使用统计
router.get('/usage', async (req, res, next) => {
  try {
    const { startDate, endDate, model } = req.query

    const { Op } = require('sequelize')
    const whereClause = { userId: req.user.id }
    if (startDate) whereClause.date = { [Op.gte]: startDate }
    if (endDate) whereClause.date = { ...whereClause.date, [Op.lte]: endDate }
    if (model) whereClause.model = model

    const usage = await AIUsage.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    })

    const totalTokens = usage.reduce((sum, item) => sum + item.totalTokens, 0)
    const totalCost = usage.reduce((sum, item) => sum + parseFloat(item.cost), 0)

    res.json({
      success: true,
      data: {
        usage,
        summary: {
          totalTokens,
          totalCost,
          totalRequests: usage.length
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router

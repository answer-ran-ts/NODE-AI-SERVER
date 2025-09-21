const { body, validationResult } = require('express-validator')

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: '请求参数验证失败',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    })
  }
  next()
}

const validateAIConversation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('对话标题长度必须在1-200个字符之间'),
  body('model')
    .optional()
    .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'])
    .withMessage('不支持的AI模型'),
  handleValidationErrors
]

const validateAIMessage = [
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('消息内容长度必须在1-10000个字符之间'),
  body('role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('无效的消息角色'),
  handleValidationErrors
]

const validateAIRequest = [
  body('message')
    .isLength({ min: 1, max: 10000 })
    .withMessage('消息长度必须在1-10000个字符之间'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('无效的对话ID'),
  body('model')
    .optional()
    .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'])
    .withMessage('不支持的AI模型'),
  body('maxTokens')
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage('最大令牌数必须在1-4000之间'),
  body('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('温度参数必须在0-2之间'),
  handleValidationErrors
]

module.exports = {
  validateAIConversation,
  validateAIMessage,
  validateAIRequest,
  handleValidationErrors
}

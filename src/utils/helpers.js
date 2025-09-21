const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// 生成随机字符串
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

// 生成UUID v4
const generateUUID = () => {
  return crypto.randomUUID()
}

// 加密字符串
const encrypt = (text, secretKey = process.env.JWT_SECRET) => {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(secretKey, 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

// 解密字符串
const decrypt = (encryptedText, secretKey = process.env.JWT_SECRET) => {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(secretKey, 'salt', 32)
  const textParts = encryptedText.split(':')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encrypted = textParts.join(':')
  
  const decipher = crypto.createDecipher(algorithm, key)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// 生成文件哈希
const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)
  return hashSum.digest('hex')
}

// 验证邮箱格式
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证密码强度
const validatePasswordStrength = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const errors = []
  
  if (password.length < minLength) {
    errors.push(`密码长度至少${minLength}个字符`)
  }
  if (!hasUpperCase) {
    errors.push('密码必须包含至少一个大写字母')
  }
  if (!hasLowerCase) {
    errors.push('密码必须包含至少一个小写字母')
  }
  if (!hasNumbers) {
    errors.push('密码必须包含至少一个数字')
  }
  if (!hasSpecialChar) {
    errors.push('密码必须包含至少一个特殊字符')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成分页信息
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  }
}

// 清理文件名
const sanitizeFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// 延迟函数
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 重试函数
const retry = async (fn, maxAttempts = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      await delay(delayMs * attempt)
    }
  }
}

module.exports = {
  generateRandomString,
  generateUUID,
  encrypt,
  decrypt,
  generateFileHash,
  isValidEmail,
  validatePasswordStrength,
  formatFileSize,
  generatePagination,
  sanitizeFileName,
  delay,
  retry
}

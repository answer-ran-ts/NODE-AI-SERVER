const axios = require('axios')
const logger = require('../utils/logger')

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    this.baseURL = 'https://api.openai.com/v1'
    this.defaultModel = process.env.AI_MODEL || 'gpt-3.5-turbo'
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 2000
  }

  async generateResponse(messages, options = {}) {
    try {
      const {
        model = this.defaultModel,
        maxTokens = this.maxTokens,
        temperature = 0.7,
        conversationId = null
      } = options

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      const { choices, usage } = response.data
      const content = choices[0].message.content
      const tokens = usage.total_tokens

      logger.info(`AI响应生成成功 - 模型: ${model}, 令牌: ${tokens}`)

      return {
        content,
        tokens,
        model,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        }
      }
    } catch (error) {
      logger.error('AI服务调用失败:', error.response?.data || error.message)
      throw new Error('AI服务暂时不可用')
    }
  }

  async generateImage(prompt, options = {}) {
    try {
      const {
        size = '1024x1024',
        quality = 'standard',
        n = 1
      } = options

      const response = await axios.post(
        `${this.baseURL}/images/generations`,
        {
          prompt,
          n,
          size,
          quality
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      )

      const images = response.data.data.map(item => ({
        url: item.url,
        revisedPrompt: item.revised_prompt
      }))

      logger.info(`AI图片生成成功 - 数量: ${images.length}`)

      return images
    } catch (error) {
      logger.error('AI图片生成失败:', error.response?.data || error.message)
      throw new Error('AI图片生成服务暂时不可用')
    }
  }

  async analyzeText(text, options = {}) {
    try {
      const {
        analysisType = 'sentiment', // sentiment, summary, keywords, translation
        targetLanguage = 'zh'
      } = options

      let systemPrompt = ''
      let userPrompt = ''

      switch (analysisType) {
        case 'sentiment':
          systemPrompt = '你是一个情感分析专家，请分析以下文本的情感倾向，返回positive、negative或neutral'
          userPrompt = text
          break
        case 'summary':
          systemPrompt = '你是一个文本摘要专家，请为以下文本生成简洁的摘要'
          userPrompt = text
          break
        case 'keywords':
          systemPrompt = '你是一个关键词提取专家，请从以下文本中提取5-10个关键词'
          userPrompt = text
          break
        case 'translation':
          systemPrompt = `你是一个翻译专家，请将以下文本翻译成${targetLanguage}`
          userPrompt = text
          break
        default:
          throw new Error('不支持的分析类型')
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]

      const result = await this.generateResponse(messages, {
        maxTokens: 500,
        temperature: 0.3
      })

      return {
        type: analysisType,
        result: result.content,
        tokens: result.tokens
      }
    } catch (error) {
      logger.error('AI文本分析失败:', error.message)
      throw error
    }
  }

  calculateCost(tokens, model) {
    // OpenAI定价（每1000个token）
    const pricing = {
      'gpt-3.5-turbo': 0.002,
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01
    }

    const pricePerThousand = pricing[model] || pricing['gpt-3.5-turbo']
    return (tokens / 1000) * pricePerThousand
  }
}

module.exports = new AIService()

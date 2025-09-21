const axios = require('axios')

// 测试配置
const BASE_URL = 'http://localhost:3000/api'
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456',
  firstName: 'Test',
  lastName: 'User'
}

class APITester {
  constructor() {
    this.token = null
    this.user = null
  }

  async testAuth() {
    console.log('🔐 测试认证接口...')
    
    try {
      // 测试注册
      console.log('  测试用户注册...')
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, TEST_USER)
      console.log('  ✅ 注册成功')
      
      // 测试登录
      console.log('  测试用户登录...')
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      })
      
      this.token = loginResponse.data.data.tokens.accessToken
      this.user = loginResponse.data.data.user
      console.log('  ✅ 登录成功')
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('  ⚠️  用户已存在，尝试登录...')
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        })
        this.token = loginResponse.data.data.tokens.accessToken
        this.user = loginResponse.data.data.user
        console.log('  ✅ 登录成功')
      } else {
        throw error
      }
    }
  }

  async testUserProfile() {
    console.log('👤 测试用户接口...')
    
    const headers = { Authorization: `Bearer ${this.token}` }
    
    // 获取用户信息
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers })
    console.log('  ✅ 获取用户信息成功')
    
    // 更新用户信息
    const updateResponse = await axios.put(`${BASE_URL}/users/profile`, {
      firstName: 'Updated',
      lastName: 'Name'
    }, { headers })
    console.log('  ✅ 更新用户信息成功')
  }

  async testAI() {
    console.log('🤖 测试AI接口...')
    
    const headers = { Authorization: `Bearer ${this.token}` }
    
    // 创建对话
    const conversationResponse = await axios.post(`${BASE_URL}/ai/conversations`, {
      title: '测试对话',
      model: 'gpt-3.5-turbo'
    }, { headers })
    
    const conversationId = conversationResponse.data.data.conversation.id
    console.log('  ✅ 创建对话成功')
    
    // 发送消息（需要OpenAI API密钥）
    try {
      const chatResponse = await axios.post(`${BASE_URL}/ai/chat`, {
        message: '你好，请简单介绍一下自己',
        conversationId: conversationId,
        model: 'gpt-3.5-turbo'
      }, { headers })
      console.log('  ✅ AI对话成功')
    } catch (error) {
      console.log('  ⚠️  AI对话失败（可能需要配置OpenAI API密钥）')
    }
    
    // 获取对话列表
    const conversationsResponse = await axios.get(`${BASE_URL}/ai/conversations`, { headers })
    console.log('  ✅ 获取对话列表成功')
    
    // 获取使用统计
    const usageResponse = await axios.get(`${BASE_URL}/ai/usage`, { headers })
    console.log('  ✅ 获取使用统计成功')
  }

  async testHealth() {
    console.log('🏥 测试健康检查...')
    
    const healthResponse = await axios.get('http://localhost:3000/health')
    console.log('  ✅ 健康检查通过')
    console.log(`  服务器状态: ${healthResponse.data.status}`)
    console.log(`  运行时间: ${Math.floor(healthResponse.data.uptime)}秒`)
  }

  async runAllTests() {
    try {
      console.log('🚀 开始API测试...\n')
      
      await this.testHealth()
      console.log('')
      
      await this.testAuth()
      console.log('')
      
      await this.testUserProfile()
      console.log('')
      
      await this.testAI()
      console.log('')
      
      console.log('🎉 所有测试完成！')
      
    } catch (error) {
      console.error('❌ 测试失败:', error.response?.data || error.message)
      process.exit(1)
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new APITester()
  tester.runAllTests()
}

module.exports = APITester

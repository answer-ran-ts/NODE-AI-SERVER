const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const AIConversation = sequelize.define('AIConversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'gpt-3.5-turbo'
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'deleted'),
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'ai_conversations'
})

const AIMessage = sequelize.define('AIMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ai_conversations',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'ai_messages'
})

const AIUsage = sequelize.define('AIUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  promptTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  completionTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  cost: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_usage'
})

// 定义关联关系
const User = require('./User')
AIConversation.belongsTo(User, { foreignKey: 'userId' })
AIConversation.hasMany(AIMessage, { foreignKey: 'conversationId', as: 'messages' })
AIMessage.belongsTo(AIConversation, { foreignKey: 'conversationId' })
AIUsage.belongsTo(User, { foreignKey: 'userId' })

module.exports = {
  AIConversation,
  AIMessage,
  AIUsage
}

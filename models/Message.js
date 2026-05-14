const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Thread = require('./Thread')
const User = require('./User')

const Message = sequelize.define('Message', {
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

Message.belongsTo(Thread, { foreignKey: 'threadId' })
Message.belongsTo(User, { foreignKey: 'userId' })
Thread.hasMany(Message, { foreignKey: 'threadId' })

module.exports = Message
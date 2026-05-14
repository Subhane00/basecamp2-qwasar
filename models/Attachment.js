const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Project = require('./Project')
const User = require('./User')

const Attachment = sequelize.define('Attachment', {
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  format: {
    type: DataTypes.STRING,
    allowNull: false
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: false
  }
})

Attachment.belongsTo(Project, { foreignKey: 'projectId' })
Attachment.belongsTo(User, { foreignKey: 'userId' })
Project.hasMany(Attachment, { foreignKey: 'projectId' })

module.exports = Attachment
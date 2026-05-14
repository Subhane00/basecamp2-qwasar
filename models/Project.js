const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const Project = sequelize.define('Project', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
})

Project.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Project, { foreignKey: 'userId' })

module.exports = Project
const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Project = require('./Project')
const User = require('./User')

const Thread = sequelize.define('Thread', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
})

Thread.belongsTo(Project, { foreignKey: 'projectId' })
Thread.belongsTo(User, { foreignKey: 'userId' })
Project.hasMany(Thread, { foreignKey: 'projectId' })

module.exports = Thread
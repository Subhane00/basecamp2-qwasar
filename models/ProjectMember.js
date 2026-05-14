const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Project = require('./Project')
const User = require('./User')

const ProjectMember = sequelize.define('ProjectMember', {
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member'
  }
})

ProjectMember.belongsTo(Project, { foreignKey: 'projectId' })
ProjectMember.belongsTo(User, { foreignKey: 'userId' })
Project.hasMany(ProjectMember, { foreignKey: 'projectId' })
User.hasMany(ProjectMember, { foreignKey: 'userId' })

module.exports = ProjectMember
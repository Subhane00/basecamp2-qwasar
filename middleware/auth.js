const User = require('../models/User')
const ProjectMember = require('../models/ProjectMember')
const Project = require('../models/Project')

async function authCheck(req, res, next) {
  if (!req.session.userId)
    return res.status(401).json({ xeta: 'Giriş tələb olunur' })
  next()
}

async function adminCheck(req, res, next) {
  const user = await User.findByPk(req.session.userId)
  if (!user || !user.isAdmin)
    return res.status(403).json({ xeta: 'Admin icazəsi lazımdır' })
  next()
}

async function isMember(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId
  const userId = req.session.userId

  const user = await User.findByPk(userId)
  if (user && user.isAdmin) return next()

  const project = await Project.findByPk(projectId)
  if (!project) return res.status(404).json({ xeta: 'Proyekt tapılmadı' })
  if (project.userId === userId) return next()

  const member = await ProjectMember.findOne({ where: { projectId, userId } })
  if (!member) return res.status(403).json({ xeta: 'Proyektə giriş icazəniz yoxdur' })

  next()
}

async function isProjectAdmin(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId
  const userId = req.session.userId

  const user = await User.findByPk(userId)
  if (user && user.isAdmin) return next()

  const project = await Project.findByPk(projectId)
  if (!project) return res.status(404).json({ xeta: 'Proyekt tapılmadı' })
  if (project.userId !== userId)
    return res.status(403).json({ xeta: 'Yalnız proyekt sahibi edə bilər' })

  next()
}

module.exports = { authCheck, adminCheck, isMember, isProjectAdmin }
const Project = require('../models/Project')
const User = require('../models/User')

exports.create = async (req, res) => {
  const { title, description } = req.body
  const project = await Project.create({ title, description, userId: req.session.userId })
  res.status(201).json(project)
}

exports.index = async (req, res) => {
  const user = await require('../models/User').findByPk(req.session.userId)
  
  if (user && user.isAdmin) {
    const projects = await Project.findAll({
      include: { model: User, attributes: ['name'] }
    })
    return res.json(projects)
  }

//oz proyektleri ile uzv olduqlari proyekti gorsunler
  const ProjectMember = require('../models/ProjectMember')
  const { Op } = require('sequelize')

  const memberOf = await ProjectMember.findAll({ where: { userId: req.session.userId } })
  const memberProjectIds = memberOf.map(m => m.projectId)

  const projects = await Project.findAll({
    where: {
      [Op.or]: [
        { userId: req.session.userId },
        { id: memberProjectIds }
      ]
    },
    include: { model: User, attributes: ['name'] }
  })
  res.json(projects)
}

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: { model: User, attributes: ['name'] }
  })
  if (!project) return res.status(404).json({ xeta: 'Tapılmadı' })
  res.json(project)
}

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  if (!project) return res.status(404).json({ xeta: 'Tapılmadı' })

  if (project.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await project.update({ title: req.body.title, description: req.body.description })
  res.json(project)
}

exports.destroy = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  if (!project) return res.status(404).json({ xeta: 'Tapılmadı' })

  if (project.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await project.destroy()
  res.json({ mesaj: 'Silindi' })
}
const Message = require('../models/Message')
const Thread = require('../models/Thread')
const ProjectMember = require('../models/ProjectMember')
const Project = require('../models/Project')

async function checkProjectMember(threadId, userId) {
  const thread = await Thread.findByPk(threadId)
  if (!thread) return null

  const project = await Project.findByPk(thread.projectId)
  if (!project) return null

  if (project.userId === userId) return project

  const member = await ProjectMember.findOne({
    where: { projectId: thread.projectId, userId }
  })
  return member ? project : null
}

exports.create = async (req, res) => {
  const thread = await Thread.findByPk(req.params.threadId)
  if (!thread) return res.status(404).json({ xeta: 'Thread tapılmadı' })

  const allowed = await checkProjectMember(req.params.threadId, req.session.userId)
  if (!allowed) return res.status(403).json({ xeta: 'İcazə yoxdur' })

  const message = await Message.create({
    body: req.body.body,
    threadId: req.params.threadId,
    userId: req.session.userId
  })
  res.status(201).json(message)
}

exports.update = async (req, res) => {
  const message = await Message.findByPk(req.params.id)
  if (!message) return res.status(404).json({ xeta: 'Tapılmadı' })
  if (message.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await message.update({ body: req.body.body })
  res.json(message)
}

exports.destroy = async (req, res) => {
  const message = await Message.findByPk(req.params.id)
  if (!message) return res.status(404).json({ xeta: 'Tapılmadı' })
  if (message.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await message.destroy()
  res.json({ mesaj: 'Silindi' })
}
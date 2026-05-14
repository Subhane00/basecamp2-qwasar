const Thread = require('../models/Thread')
const Message = require('../models/Message')
const User = require('../models/User')

exports.create = async (req, res) => {
  const thread = await Thread.create({
    title: req.body.title,
    projectId: req.params.projectId,
    userId: req.session.userId
  })
  res.status(201).json(thread)
}

exports.update = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id)
  if (!thread) return res.status(404).json({ xeta: 'Tapılmadı' })
  if (thread.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await thread.update({ title: req.body.title })
  res.json(thread)
}

exports.destroy = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id)
  if (!thread) return res.status(404).json({ xeta: 'Tapılmadı' })
  if (thread.userId !== req.session.userId)
    return res.status(403).json({ xeta: 'İcazə yoxdur' })

  await thread.destroy()
  res.json({ mesaj: 'Silindi' })
}

exports.show = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id, {
    include: [
      { model: Message, include: [{ model: User, attributes: ['name'] }] }
    ]
  })
  if (!thread) return res.status(404).json({ xeta: 'Tapılmadı' })
  res.json(thread)
}
const Attachment = require('../models/Attachment')
const ProjectMember = require('../models/ProjectMember')
const Project = require('../models/Project')

exports.create = async (req, res) => {
  const { filename, data } = req.body
  const projectId = req.params.projectId

  if (!filename || !data) return res.status(400).json({ xeta: 'Fayl məlumatları lazımdır' })

  const format = filename.split('.').pop().toLowerCase()
  const allowed = ['png', 'jpg', 'pdf', 'txt']
  if (!allowed.includes(format))
    return res.status(400).json({ xeta: 'Yalnız png, jpg, pdf, txt' })

  const attachment = await Attachment.create({
    filename, format, data,
    projectId,
    userId: req.session.userId
  })
  res.status(201).json(attachment)
}

exports.destroy = async (req, res) => {
  const attachment = await Attachment.findByPk(req.params.id)
  if (!attachment) return res.status(404).json({ xeta: 'Tapılmadı' })

  await attachment.destroy()
  res.json({ mesaj: 'Silindi' })
}
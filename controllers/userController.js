const bcrypt = require('bcryptjs')
const User = require('../models/User')

exports.create = async (req, res) => {
  const { name, email, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  try {
    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({ id: user.id, name: user.name, email: user.email })
  } catch (e) {
    res.status(400).json({ xeta: 'Bu email artıq mövcuddur' })
  }
}

exports.index = async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'name', 'email', 'isAdmin'] })
  res.json(users)
}

exports.show = async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'isAdmin']
  })
  if (!user) return res.status(404).json({ xeta: 'Tapılmadı' })
  res.json(user)
}

exports.destroy = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ xeta: 'Tapılmadı' })

  if (user.id === req.session.userId)
    return res.status(403).json({ xeta: 'Özünü silə bilməzsən' })

  await user.destroy()
  res.json({ mesaj: 'İstifadəçi silindi' })
}

exports.toggleAdmin = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ xeta: 'Tapılmadı' })

  if (user.id === req.session.userId)
    return res.status(403).json({ xeta: 'Öz adminliyini dəyişə bilməzsən' })

  user.isAdmin = !user.isAdmin
  await user.save()
  res.json({ mesaj: `Admin: ${user.isAdmin}`, isAdmin: user.isAdmin })
}
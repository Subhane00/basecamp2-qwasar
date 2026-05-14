const bcrypt = require('bcryptjs')
const User = require('../models/User')

exports.login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ where: { email } })
  if (!user) return res.status(401).json({ xeta: 'İstifadəçi tapılmadı' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ xeta: 'Şifrə yanlışdır' })

  req.session.userId = user.id
  res.json({ mesaj: 'Giriş uğurlu', name: user.name, isAdmin: user.isAdmin })
}

exports.logout = (req, res) => {
  req.session.destroy()
  res.json({ mesaj: 'Çıxış edildi' })
}

exports.me = async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ xeta: 'Giriş yoxdur' })

  const user = await User.findByPk(req.session.userId, {
    attributes: ['id', 'name', 'email', 'isAdmin']
  })
  if (!user) return res.status(404).json({ xeta: 'Tapılmadı' })
  res.json(user)
}
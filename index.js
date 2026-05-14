const express = require('express')
const session = require('express-session')
const sequelize = require('./config/database')
const bcrypt = require('bcryptjs')

const app = express()

app.use(express.json())
app.use(express.static('public'))
app.use(session({
  secret: 'gizli-açar',
  resave: false,
  saveUninitialized: false
}))

app.use('/sessions', require('./routes/sessions'))
app.use('/users',    require('./routes/users'))
app.use('/projects/:projectId/attachment', require('./routes/attachment'))
app.use('/projects/:projectId/threads',     require('./routes/threads'))
app.use('/projects/:projectId/members',     require('./routes/members'))
app.use('/threads/:threadId/messages',      require('./routes/messages'))
app.use('/projects',                        require('./routes/projects'))

sequelize.sync().then(async () => {
  const User = require('./models/User')
  const admin = await User.findOne({ where: { email: 'admin@mail.com' } })
  if (!admin) {
    await User.create({
      name: 'Admin',
      email: 'admin@mail.com',
      password: await bcrypt.hash('admin123', 10),
      isAdmin: true
    })
    console.log('Admin yaradıldı: admin@mail.com / admin123')
  }
  app.listen(3000, () => console.log('http://localhost:3000'))
})
const router = require('express').Router({ mergeParams: true })
const { authCheck, isProjectAdmin } = require('../middleware/auth')
const ProjectMember = require('../models/ProjectMember')
const User = require('../models/User')

router.get('/', authCheck, async (req, res) => {
  const members = await ProjectMember.findAll({
    where: { projectId: req.params.projectId },
    include: [{ model: User, attributes: ['id', 'name', 'email'] }]
  })
  res.json(members)
})

router.post('/', authCheck, isProjectAdmin, async (req, res) => {
  const member = await ProjectMember.create({
    projectId: req.params.projectId,
    userId: req.body.userId
  })
  res.status(201).json(member)
})

router.delete('/:userId', authCheck, isProjectAdmin, async (req, res) => {
  await ProjectMember.destroy({
    where: { projectId: req.params.projectId, userId: req.params.userId }
  })
  res.json({ mesaj: 'Üzv silindi' })
})

module.exports = router
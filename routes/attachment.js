const router = require('express').Router({ mergeParams: true })
const c = require('../controllers/attachmentController')
const { authCheck, isMember } = require('../middleware/auth')

router.get('/', authCheck, isMember, async (req, res) => {
  const Attachment = require('../models/Attachment')
  const attachments = await Attachment.findAll({ where: { projectId: req.params.projectId } })
  res.json(attachments)
})

router.post('/', authCheck, isMember, c.create)
router.delete('/:id', authCheck, isMember, c.destroy)

module.exports = router
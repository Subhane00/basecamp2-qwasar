const router = require('express').Router({ mergeParams: true })
const c = require('../controllers/threadController')
const { authCheck, isProjectAdmin } = require('../middleware/auth')
const Thread = require('../models/Thread')

router.get('/', authCheck, async (req, res) => {
  const threads = await Thread.findAll({ where: { projectId: req.params.projectId } })
  res.json(threads)
})

router.post('/', authCheck, isProjectAdmin, c.create)
router.get('/:id', authCheck, c.show)
router.put('/:id', authCheck, isProjectAdmin, c.update)
router.delete('/:id', authCheck, isProjectAdmin, c.destroy)

module.exports = router
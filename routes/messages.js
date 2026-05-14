const router = require('express').Router({ mergeParams: true })
const c = require('../controllers/messageController')
const { authCheck } = require('../middleware/auth')

router.post('/', authCheck, c.create)
router.put('/:id', authCheck, c.update)
router.delete('/:id', authCheck, c.destroy)

module.exports = router
const router = require('express').Router()
const c = require('../controllers/userController')
const { authCheck, adminCheck } = require('../middleware/auth')

router.post('/', c.create)
router.get('/', authCheck, adminCheck, c.index)
router.get('/:id', authCheck, c.show)
router.delete('/:id', authCheck, adminCheck, c.destroy)
router.patch('/:id/admin', authCheck, adminCheck, c.toggleAdmin)

module.exports = router
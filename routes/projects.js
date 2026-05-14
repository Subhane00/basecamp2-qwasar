const router = require('express').Router()
const c = require('../controllers/projectController')
const { authCheck } = require('../middleware/auth')

router.post('/', authCheck, c.create)
router.get('/', authCheck, c.index)
router.get('/:id', authCheck, c.show)
router.put('/:id', authCheck, c.update)
router.delete('/:id', authCheck, c.destroy)

module.exports = router
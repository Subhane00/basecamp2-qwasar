const router = require('express').Router()
const c = require('../controllers/sessionController')

router.post('/login', c.login)
router.delete('/logout', c.logout)
router.get('/me', c.me)

module.exports = router
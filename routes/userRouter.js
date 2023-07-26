const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')

router.post('/registration', userController.registration)
router.post('/authCheck', userController.authCheck)
router.post('/checkCode', userController.checkCode)
// router.post('/login', userController.login)
router.get('/self', userController.getUser)

module.exports = router
const Router = require('express')
const router = new Router()
const bookingController = require('../controllers/bookingController')

router.post('/', bookingController.book)

module.exports = router

const Router = require('express')
const router = new Router()
const bookingController = require('../controllers/BookingController')

router.post('/', bookingController.book)

module.exports = router

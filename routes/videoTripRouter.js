const Router = require('express')
const router = new Router()
const videoTripController = require('../controllers/videoTripController')
const multerMiddleware = require('../middleware/multerMiddleware')

router.get('/', videoTripController.getAll)
router.get('/:id', videoTripController.getOne)
router.post('/create', videoTripController.create)


module.exports = router
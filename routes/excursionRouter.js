const Router = require('express')
const router = new Router()
const excursionController = require('../controllers/excursionController')

router.post('/', excursionController.create)
router.get('/', excursionController.getAll)

module.exports = router
const Router = require('express')
const router = new Router()
const excursionController = require('../controllers/excursionController')
const cityController = require("../controllers/cityController");

router.post('/', excursionController.create)
router.get('/', excursionController.getAll)
router.get('/:id', excursionController.getOne)

module.exports = router

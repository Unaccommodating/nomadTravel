const Router = require('express')
const router = new Router()
const excursionController = require('../controllers/excursionController')
const userController = require("../controllers/userController");

router.post('/', excursionController.create)
router.get('/', excursionController.getAll)
router.get('/:id', excursionController.getOne)
router.post('/myAddedExcursions', excursionController.myAddedExcursions)
router.post('/myBookedExcursions', excursionController.myBookedExcursions)
router.post('/bookExcursion', excursionController.bookExcursion)

module.exports = router

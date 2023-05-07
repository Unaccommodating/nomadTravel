const Router = require('express')
const router = new Router()
const hashtagController = require('../controllers/hashtagController')

router.post('/', hashtagController.create)
router.post('/user', hashtagController.connectToUser)
router.get('/', hashtagController.getAll)

module.exports = router
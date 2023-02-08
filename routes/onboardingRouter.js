const Router = require('express')
const router = new Router()
const onboardingController = require('../controllers/onboardingController')

router.post('/', onboardingController.create)
router.get('/', onboardingController.getAll)

module.exports = router
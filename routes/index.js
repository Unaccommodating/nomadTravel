const Router = require('express')
const router = new Router()
const cityRouter = require('./cityRouter')
const onboardingRouter = require('./onboardingRouter')

router.use('/city', cityRouter)
router.use('/onboarding', onboardingRouter)

module.exports = router
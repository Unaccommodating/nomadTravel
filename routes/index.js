const Router = require('express')
const router = new Router()
const cityRouter = require('./cityRouter')
const onboardingRouter = require('./onboardingRouter')
const videoTripRouter = require('./videoTripRouter')
const userRouter = require('./userRouter')

router.use('/city', cityRouter)
router.use('/onboarding', onboardingRouter)
router.use('/videotrip', videoTripRouter)
router.use('/user', userRouter)

module.exports = router
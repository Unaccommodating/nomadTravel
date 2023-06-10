const Router = require('express')
const router = new Router()
const cityRouter = require('./cityRouter')
const onboardingRouter = require('./onboardingRouter')
const videoTripRouter = require('./videoTripRouter')
const userRouter = require('./userRouter')
const excursionRouter = require('./excursionRouter')
const hashtagRouter = require('./hashtagRouter')
const bookingRouter = require('./bookingRouter')

router.use('/city', cityRouter)
router.use('/onboarding', onboardingRouter)
router.use('/videotrip', videoTripRouter)
router.use('/user', userRouter)
router.use('/excursion', excursionRouter)
router.use('/hashtag', hashtagRouter)
router.use('/book', bookingRouter)

module.exports = router
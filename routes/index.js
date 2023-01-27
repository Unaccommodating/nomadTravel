const Router = require('express')
const router = new Router()
const cityRouter = require('./cityRouter')

router.use('/city', cityRouter)

module.exports = router
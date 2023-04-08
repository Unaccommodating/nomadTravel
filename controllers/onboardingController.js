const {Onboarding} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')

class OnboardingController {
    async getAll(req, res) {
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 5
        let offset = page * limit - limit
        const onboarding = await Onboarding.findAndCountAll({limit, offset})
        return res.json(onboarding)
    }

    async create(req, res, next) {
        try {
            const {title} = req.body
            const {description} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const onboarding = await Onboarding.create({
                title, description, img: fileName
                })
            return res.json(onboarding)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new OnboardingController()
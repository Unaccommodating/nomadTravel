const {Excursion} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')

class ExcursionController {
    async getAll(req, res) {
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const cities = await Excursion.findAndCountAll({limit, offset})
        return res.json(cities)
    }

    async create(req, res, next) {
        try{
            const {nameRu} = req.body
            const {nameEn} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

            const city = await Excursion.create({nameRu, nameEn, img: fileName})
            return res.json(city)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new ExcursionController()
const {City} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')

class CityController {
    async getAll(req, res) {
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const cities = await City.findAndCountAll({limit, offset})
        return res.json(cities)
    }

    async create(req, res, next) {
        try{
            const {name} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

            const city = await City.create({name, img: fileName})
            return res.json(city)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new CityController()
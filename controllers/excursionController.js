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
        const excursion = await Excursion.findAndCountAll({limit, offset})
        return res.json(excursion)
    }

    async create(req, res) {
        let {title, description, repeat_type,
            start_date, time, day_week,
            end_date, place_address, places_number,
            price, excursion_type, hashtag,
            included, additional_services, organizational_details,
            duration} = req.body
    }

}

module.exports = new ExcursionController()
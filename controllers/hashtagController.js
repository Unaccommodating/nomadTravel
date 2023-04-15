const {Hashtag} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')

class HashtagController {
    async getAll(req, res) {
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const hashtags = await Hashtag.findAndCountAll({limit, offset})
        return res.json(hashtags)
    }

    async create(req, res, next) {
        try{
            const {title} = req.body
            const hashtag = await Hashtag.create({title})
            return res.json(hashtag)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new HashtagController()
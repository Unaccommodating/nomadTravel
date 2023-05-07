const {Hashtag, UserHashtag} = require("../models/models");
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

    async connectToUser(req, res, next) {
        try{
            let {user_id, hashtags} = req.body
            if (hashtags){
                hashtags = hashtags.split(',');
                hashtags.forEach(tag =>
                    UserHashtag.create({
                        user_id: user_id,
                        hashtag_id: tag
                })
                )
            }
            return res.status(200).json({message: "успешно добавлены"})
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
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
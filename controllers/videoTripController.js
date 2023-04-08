const {VideoTrip} = require("../models/models");
const ApiError = require('../error/ApiError');
const path = require("path");
const uuid = require("uuid");

class VideoTripController {
    async getAll(req, res) {
        let {limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const videos = await VideoTrip.findAndCountAll({limit, offset})
        return res.json(videos)
    }

    async getOne(req, res){
        const {id} = req.params
        const videoTrip = await VideoTrip.findOne({
            where: {id}
        })
        return res.json(videoTrip)
    }

    async create(req, res, next) {
        try {
            let {title, description, price, hashtag, userId} = req.body
            const {video} = req.files
            let fileName = uuid.v4() + ".mp4"
            video.mv(path.resolve(__dirname, '../static', 'video', fileName))
            const videoTrip = await VideoTrip.create({title, description, price, hashtag, video: fileName, userId})

            return res.json(videoTrip)
        }
        catch (e){
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new VideoTripController()
const {Excursion, City} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')
const fs = require('fs');

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
            duration, city_id, user_id} = req.body
        const {images} = req.files
        let imagesJSON = {};
        let backgroundImg;
        if (Array.isArray(images)){
            for (let i = 0; i < images.length; i++){
                const fileName = uuid.v4() + ".jpg"
                images[i].mv(path.resolve(__dirname, '../static', 'storage', fileName))
                imagesJSON[i+1] = fileName;
                if (i === 0) {
                    backgroundImg = fileName
                }
            }
        } else {
            const fileName = uuid.v4() + ".jpg"
            images.mv(path.resolve(__dirname, '../static', 'storage', fileName))
            imagesJSON = {1: fileName}
            backgroundImg = fileName
        }
        const excursion = await Excursion.create(
    {
            title, description, repeat_type,
            start_date, time, day_week,
            end_date, place_address, places_number,
            price, excursion_type, hashtag,
            included, additional_services, organizational_details,
            duration, city_id, user_id,
            background_img: backgroundImg, images: imagesJSON
          })
        return res.json(excursion)
    }

}

module.exports = new ExcursionController()
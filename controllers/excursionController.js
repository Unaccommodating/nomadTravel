const {Excursion, User} = require("../models/models");
const uuid = require('uuid')
const path = require('path')

class ExcursionController {
    async getAll(req, res) {
        let {cityId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        const excursion = await Excursion.findAndCountAll({
            where: {cityId},
            limit,
            offset,
            attributes: {
                exclude: [
                    'description', 'images', 'place_address',
                    'dates', 'included', 'additional_services',
                    'organizational_details'
                ],
            },
            include: [{
                required: true,
                model: User,
                attributes: ['name', 'img', 'rating']
            }]
        })
        return res.json(excursion)
    }

    async getOne(req, res){
        const {id} = req.params
        const excursion = await Excursion.findOne({
            where: {id},
            include:
                [{
                    model: User, attributes: {
                    exclude: [
                        'password', 'ref_key', 'total_count', 'createdAt', 'updateAt'
                        ],
                    },
                }]
        })
        // status booked true, false
        return res.json(excursion)
    }

    async create(req, res) {
        let {title, description, place_address,
            places_number, price, excursion_type,
            hashtag, included, additional_services,
            organizational_details, duration_minutes,
            cityId, userId} = req.body
        const {images} = req.files
        let imagesData = [];
        let backgroundImg;
        if (Array.isArray(images)){
            for (let i = 0; i < images.length; i++){
                const fileName = uuid.v4() + ".jpg"
                images[i].mv(path.resolve(__dirname, '../static', 'storage', fileName))
                imagesData[i] = fileName;
                if (i === 0) {
                    backgroundImg = fileName
                }
            }
        } else {
            const fileName = uuid.v4() + ".jpg"
            images.mv(path.resolve(__dirname, '../static', 'storage', fileName))
            imagesData = fileName
            backgroundImg = fileName
        }
        const excursion = await Excursion.create(
    {
            title, description, place_address,
            places_number, price, excursion_type,
            hashtag, included, additional_services,
            organizational_details, duration_minutes, cityId,
            userId, background_img: backgroundImg, images: imagesData
          })
        return res.json(excursion)
    }

}

module.exports = new ExcursionController()
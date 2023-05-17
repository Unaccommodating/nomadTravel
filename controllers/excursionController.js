const {Excursion, User, ExcursionHashtag, Hashtag} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const jwt = require("jsonwebtoken");

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

    async getOne(req, res) {
        const {id} = req.params
        const excursion = await Excursion.findOne({
            where: {id},
            include:
                [
                    {
                        model: User, attributes: {
                            exclude: [
                                'password', 'ref_key', 'total_count', 'createdAt', 'updateAt'
                            ],
                        },
                    },
                    {
                        model: Hashtag, as: 'hashtagExcursion', attributes: ['title']
                    }
                ]
        })
        // status booked true, false
        return res.json(excursion)
    }

    async create(req, res) {
        let {
            title, description, place_address,
            places_number, price, excursion_type,
            included, additional_services, organizational_details,
            duration_minutes, cityId, hashtag
        } = req.body
        const token = req.headers.authorization
        const userInfo = jwt.decode(token);
        const userId = userInfo.id
        const {images} = req.files
        let imagesData = [];
        let backgroundImg;
        if (Array.isArray(images)) {
            for (let i = 0; i < images.length; i++) {
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
                included, additional_services, organizational_details,
                duration_minutes, cityId, userId: userId,
                background_img: backgroundImg, images: imagesData
            })
        if (Array.isArray(hashtag)) {
            hashtag.forEach(i =>
                ExcursionHashtag.create({
                    excursion_id: excursion.id,
                    hashtag_id: i
                })
            )
        } else {
            ExcursionHashtag.create({
                excursion_id: excursion.id,
                hashtag_id: hashtag
            })
        }
        return res.json(excursion)
    }

}

module.exports = new ExcursionController()
const {Excursion, User, ExcursionHashtag, Hashtag} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const jwt = require("jsonwebtoken");
const {Op, literal} = require("sequelize");

class ExcursionController {
    async getAll(req, res) {
        let { cityId, limit, page,
            query, excursion_type, background_img,
            places_number, minPrice, maxPrice,
            rating, startDate, endDate } = req.query;
        page = page || 1;
        limit = limit || 9;
        const offset = (page - 1) * limit;

        const filter = {
            limit,
            offset,
            attributes: {
                exclude: [
                    'description', 'images', 'place_address',
                    'dates', 'included', 'additional_services',
                    'organizational_details'
                ],
            },
            include: [],
            where: {},
        };

        if (cityId) {
            filter.where.cityId = cityId;
        }

        if (query) {
            filter.where.title = {
                [Op.iLike]: `%${query}%`,
            };
        }

        if (excursion_type) {
            filter.where.excursion_type = excursion_type;
        }

        if (background_img === 'null') {
            filter.where.background_img = null;
        } else if (background_img === 'exist') {
            filter.where.background_img = {
                [Op.not]: null,
            };
        }

        if (places_number) {
            filter.where.places_number = {
                [Op.lte]: places_number,
            };
        }

        if (minPrice && maxPrice) {
            filter.where.price = {
                [Op.between]: [minPrice, maxPrice],
            };
        }

        if (startDate && endDate) {
            filter.where.dates = {
                
            };
        }

        if (rating) {
            filter.include.push({
                model: User,
                attributes: ['name', 'img', 'rating'],
                where: {
                    rating: {
                        [Op.gt]: 4,
                    },
                },
            });
        } else {
            filter.include.push({
                model: User,
                attributes: ['name', 'img', 'rating'],
            });
        }

        try {
            const excursions = await Excursion.findAndCountAll(filter);
            return res.json(excursions);
        } catch (error) {
            // Handle the error
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
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
        return res.json(excursion)
    }

    async create(req, res) {
        let {
            title, description, place_address,
            places_number, price, excursion_type,
            included, additional_services, organizational_details,
            duration_minutes, cityId, hashtag, dates
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
            imagesData.push(fileName)
            backgroundImg = fileName
        }
        const excursion = await Excursion.create(
            {
                title, description, place_address,
                places_number, price, excursion_type,
                included, additional_services, organizational_details,
                duration_minutes, cityId, userId: userId,
                background_img: backgroundImg, images: imagesData, dates: dates

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
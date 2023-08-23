const {Excursion, User, ExcursionHashtag, Hashtag, DataBook, UserHashtag} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const jwt = require("jsonwebtoken");
const {Op, Sequelize} = require("sequelize");
const nodemailer = require("nodemailer");

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
                    'included', 'additional_services', 'organizational_details'
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
            filter.where[Op.and] = Sequelize.literal(`
            EXISTS (
              SELECT 1
              FROM JSONB_ARRAY_ELEMENTS(dates) AS d
              WHERE (d->>'date')::date BETWEEN '${startDate}' AND '${endDate}'
            )
          `);
        }

        if (rating) {
            filter.include.push({
                model: User,
                attributes: ['id', 'name', 'img', 'rating', 'phone'],
                where: {
                    rating: {
                        [Op.gt]: 4,
                    },
                },
            });
        } else {
            filter.include.push({
                model: User,
                attributes: ['id', 'name', 'img', 'rating', 'phone'],
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

    async myAddedExcursions(req, res){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token)
            const excursions = await Excursion.findAndCountAll({
                where: {
                    userId: userInfo.id
                }
            });
            return res.json(excursions);
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async myBookedExcursions(req, res){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token)
            const dataBook = await DataBook.findAll({
                where: {
                    tourist_id: userInfo.id
                }
            })
            let dataBookArray = []
            dataBook.forEach(book =>
                dataBookArray.push(book.excursion_id)
            )
            const bookedExcursions = await Excursion.findAndCountAll({
                where: {
                    id: dataBookArray
                } , attributes: {exclude: ['createdAt', 'updatedAt']},
            })
            // const userWithHashtags = {user, hashtags}
            return res.json(bookedExcursions)
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async bookExcursion(req, res){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token)
            let {
                excursion_id, count_tickets, date
            } = req.body
            DataBook.create({
                count_tickets,
                date,
                tourist_id: userInfo.id,
                excursion_id: excursion_id,
            })
            const excursionController = new ExcursionController()
            await excursionController.sendCode("zininkrut@gmail.com")
            return res.json('done');
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async sendCode(email) {
        const transporter = nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                secure: true,
                auth: {
                    user: 'nomad_trave1@mail.ru',
                    pass: 'dGPaRzUstddU0kjgAcrj'
                }
            },
            {
                from: "Nomad Travel <nomad_trave1@mail.ru>"
            }
        )
        const mailObject = {
            to: email,
            subject: "ВАШ ЗАКАЗ",
            html: `<!DOCTYPE html>
                    <html lang="ru">
                    <head>
                        <title>Excursion Ticket</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 20px;
                                background-color: #f2f2f2;
                            }
                            
                            .ticket {
                                max-width: 400px;
                                margin: 0 auto;
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 5px;
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                border: 5px solid #3498db;
                            }
                            
                            h1 {
                                font-size: 24px;
                                color: #333;
                                margin: 0;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            
                            .info {
                                margin-bottom: 20px;
                            }
                            
                            .info p {
                                margin: 0;
                                color: #666;
                            }
                            
                            .info strong {
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <h1>БИЛЕТ</h1>
                            <div class="info">
                                <p><strong>Название:</strong> Excursion Title</p>
                                <p><strong>Кол-во билетов:</strong> 2</p>
                                <p><strong>Цена:</strong> $50.00</p>
                                <p><strong>Дата:</strong> January 1, 2022</p>
                                <p><strong>Адрес:</strong> Excursion Address</p>
                            </div>
                        </div>
                    </body>
                    </html>`}
        await transporter.sendMail(mailObject)
    }
}

module.exports = new ExcursionController()
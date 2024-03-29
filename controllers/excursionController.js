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
        const token = req.headers.authorization
        const userInfo = jwt.decode(token);
        const userId = userInfo ? userInfo.id : null;
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
                    id: {
                        [Op.not]: userId
                    }
                },
            });
        } else {
            filter.include.push({
                model: User,
                attributes: ['id', 'name', 'img', 'rating', 'phone'],
                where: {
                    id: {
                        [Op.not]: userId
                    }
                }
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

    async getTouristsByDateAndTime(req, res) {
        const { excursion_id, date, time } = req.query;
        const dateTime = new Date(date + " " + time);
        dateTime.setUTCHours(dateTime.getUTCHours() + 5);
        try {
            const dataBooks = await DataBook.findAll({
                where: {
                    excursion_id: excursion_id,
                    date: {
                        [Op.eq]: dateTime,
                    },
                },
            });
            const userIds = dataBooks.map(dataBook => dataBook.tourist_id);
            const users = await User.findAll({
                where: {
                    id: userIds,
                },
                attributes: ['id', 'name', 'email', 'phone', 'img', 'rating']
            });

            const usersWithTickets = users.map(user => {
                const dataBook = dataBooks.find(dataBook => dataBook.tourist_id === user.id);
                return {
                    ...user.toJSON(),
                    count_tickets: dataBook ? dataBook.count_tickets : 0,
                };
            });

            const count = usersWithTickets.length;

            return res.json({
                count,
                usersWithTickets,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
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
                images[i].mv(path.resolve(__dirname, '../static', 'excursions', fileName))
                imagesData[i] = fileName;
                if (i === 0) {
                    backgroundImg = fileName
                }
            }
        } else {
            const fileName = uuid.v4() + ".jpg"
            images.mv(path.resolve(__dirname, '../static', 'excursions', fileName))
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
                },
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
                },
                attributes: {exclude: ['createdAt', 'updatedAt']},
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
            return res.json(bookedExcursions)
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async bookExcursion(req, res){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token)
            const id = userInfo.id
            const excursionController = new ExcursionController()
            let {
                excursion_id, count_tickets, date, time
            } = req.body
            const dateTime = new Date(date + " " + time);
            const excursion = await Excursion.findOne({
                where: {id: excursion_id},
                attributes: ['price', 'place_address', 'title']
            })
            // const usersWithTickets = await excursionController.getTouristsByDateAndTime({
            //     query: { excursion_id, date: date, time: time }
            // });
            // if ((usersWithTickets.count + count_tickets) > excursion.places_number) {
            //     return res.json({ success: false, message: 'Нет свободных мест' });
            // }
            const user = await User.findOne({
                where: {id}, attributes: {exclude: ['password']},
            })
            const email = user.email
            const price = excursion.price
            const address = excursion.place_address
            const title = excursion.title
            DataBook.create({
                count_tickets,
                date: dateTime,
                tourist_id: userInfo.id,
                excursion_id: excursion_id,
            })
            await excursionController.sendCode(email, title, count_tickets, price, address, dateTime)
            return res.json('done');
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async sendCode(email, title, count_tickets, price, address, date) {
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
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #f2f2f2;
                            }
                            
                            .ticket {
                                max-width: 400px;
                                margin: 0 auto;
                                background-color: #fff;
                                border-radius: 5px;
                                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                border: 5px solid #3498db;
                            }
                            
                            h1 {
                                background-color: #3498db;
                                font-size: 20px;
                                color: #ffffff;
                                text-align: center;
                            }
                            
                            .info {
                                margin-left: 15px;
                                margin-bottom: 20px;
                            }
                            
                            .info p {
                                margin: 0 auto;
                                color: #666;
                            }
                            
                            .info strong {
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                    Спасибо за покупку билета на экскурсию! Мы очень рады, что вы выбрали именно нас и доверили нам Ваше время.
                    Ваше присутствие на нашей экскурсии вдохновляет нас развиваться дальше.
                    Желаем вам незабываемого и приятного отдыха!
                    Пусть каждый момент наполняется впечатлениями, позитивными эмоциями и новыми знаниями.
                    Мы надеемся, что экскурсия станет для вас незабываемым приключением и оставит самые яркие воспоминания.
                    Спасибо, что выбрали нас!
                    С наилучшими пожеланиями, NomadTravel
                    <hr>
                        <div class="ticket">
                            <h1>БИЛЕТ</h1>
                            <div class="info">
                                <p><strong>Название:</strong> ${title}</p>
                                <p><strong>Кол-во билетов:</strong> ${count_tickets}</p>
                                <p><strong>Цена:</strong> ${price}</p>
                                <p><strong>Дата:</strong> ${date}</p>
                                <p><strong>Адрес:</strong> ${address}</p>
                            </div>
                        </div>
                    </body>
                    </html>`}
        await transporter.sendMail(mailObject)
    }
}

module.exports = new ExcursionController()
const {City} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')
const {Op} = require("sequelize");

class CityController {
    async getAll(req, res) {
        let { limit, page, query } = req.query;
        page = page || 1;
        limit = limit || 9;
        const offset = (page - 1) * limit;

        const filter = {
            limit,
            offset,
            where: {},
        };

        if (query) {
            filter.where.name = {
                [Op.iLike]: `%${query}%`,
            };
        }

        try {
            const cities = await City.findAndCountAll(filter);
            return res.json(cities);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getOne(req, res){
        const {name} = req.params
        const cities = await City.findOne({
            where: {name},
        })
        return res.json(cities)
    }

    async create(req, res, next) {
        try{
            // const {name} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '../static', fileName))

            // const city = await City.create({name, img: fileName})
            return res.json(true)
        }
        catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    // async create(req, res, next) {
    //     try{
    //         const {name} = req.body
    //         const {img} = req.files
    //         let fileName = uuid.v4() + ".jpg"
    //         img.mv(path.resolve(__dirname, '../static', 'cities', fileName))
    //
    //         const city = await City.create({name, img: fileName})
    //         return res.json(city)
    //     }
    //     catch (e) {
    //         next(ApiError.badRequest(e.message))
    //     }
    // }
}

module.exports = new CityController()
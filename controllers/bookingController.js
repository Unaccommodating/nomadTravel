const ApiError = require('../error/ApiError')
const {Excursion, User, DataBook} = require("../models/models");
const jwt = require("jsonwebtoken");


class BookingController {
    async book(req, res){
        const token = req.headers.authorization
        const userInfo = jwt.decode(token);
        const id = userInfo.id
        let {excursion_id} = req.body
    }
}

module.exports = new BookingController()
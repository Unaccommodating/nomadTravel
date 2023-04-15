const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')
const uuid = require("uuid");
const path = require("path");


const generateJWT = (id, email) => {
    return jwt.sign(
        {id, email},
        process.env.SECRET_KEY,
        {expiresIn: '30d'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {name, email, phone, password, hashtag, ref_key} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const {img} = req.files
        let fileName = uuid.v4() + ".jpg"
        img.mv(path.resolve(__dirname, '../static', 'users', fileName))
        const user = await User.create({name, email, phone, password: hashPassword, hashtag, ref_key})
        const token = generateJWT(user.id, user.email)
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user){
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword){
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJWT(user.id, user.email, user.role)
        return res.json({token})
    }

    async getUser(req, res, next){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token);
            const id = userInfo.id
            const user = await User.findOne({
                where: {id}, attributes: {exclude: ['password']},
            })
            return res.json(user)
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async check(req, res, next) {
        const token = generateJWT(req.user.id, req.user.email)
        return res.json({token})
    }
}

module.exports = new UserController()
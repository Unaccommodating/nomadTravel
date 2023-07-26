const ApiError = require('../error/ApiError')
const jwt = require('jsonwebtoken')
const {User, UserHashtag, Hashtag, Candidate} = require('../models/models')
const uuid = require("uuid");
const path = require("path");
const nodemailer = require("nodemailer");


const generateJWT = (id, email) => {
    return jwt.sign(
        {id, email},
        process.env.SECRET_KEY,
        {expiresIn: '30d'}
    )
}

function generateVerificationCode() {
    const length = 4
    let result = ''

    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10) // Generate a random digit (0-9)
    }

    return Number(result)
}

class UserController {
    async authCheck(req, res){
        const {email} = req.body
        const candidate = await Candidate.findOne({where: {email}})
        if (!candidate){
            return res.json({answer: false})
        } else {
            if (candidate.active){
                const verificationCode = generateVerificationCode();
                candidate.code = verificationCode;
                await candidate.save();
                const userController = new UserController();
                await userController.sendCode(email, verificationCode);
                return res.json({answer: true});
            } else {
                return res.json({answer: false});
            }
        }
    }

    async registration(req, res, next) {
        const {name, email, phone, hashtag, ref_key} = req.body;
        const rating = 4.5;
        if (!email) {
            return next(ApiError.badRequest('Некорректный email'));
        }
        const candidate = await Candidate.findOne({where: {email}});
        if (candidate) {
            if (candidate.active) {
                return next(ApiError.badRequest('Аккаунт зарегестрирован. Авторизируйтесь в приложении'));
            }
        }

        const img = req.files ? req.files.img : null
        let fileName
        if (img) {
            fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '../static', 'users', fileName))
        } else {
            fileName = null
        }
        const user = await User.create({name, email, phone, hashtag, ref_key, rating, img: fileName || null})
        if (ref_key) {
            user.free_book_count += 1;
            await user.save();
        }
        const code = generateVerificationCode()
        const userController = new UserController()
        await userController.sendCode(email, code)
        await Candidate.create({email, code})
        return res.json({answer: true})
    }

    async checkCode(req, res, next) {
        const {email, code} = req.body
        const candidate = await Candidate.findOne({where: {email}})
        if (candidate){
            const user = await User.findOne({where: {email}})
            if (Number(candidate.code) === Number(code)) {
                candidate.active = true
                await candidate.save()
                const token = generateJWT(user.id, user.email)
                return res.json({token})
            } else {
                return res.json({answer: false})
            }
        } else {
            return next(ApiError.internal('Ошибка'))
        }
    }

    // async login(req, res, next) {
    //     const {email, password} = req.body
    //     const user = await User.findOne({where: {email}})
    //     if (!user){
    //         return next(ApiError.internal('Пользователь не найден'))
    //     }
    //     let comparePassword = bcrypt.compareSync(password, user.password)
    //     if (!comparePassword){
    //         return next(ApiError.internal('Указан неверный пароль'))
    //     }
    //     const token = generateJWT(user.id, user.email)
    //     return res.json({token})
    // }

    async getUser(req, res, next){
        try {
            const token = req.headers.authorization
            const userInfo = jwt.decode(token)
            const id = userInfo.id
            const user = await User.findOne({
                where: {id}, attributes: {exclude: ['password']},
            })
            const userHashtags = await UserHashtag.findAll({
                where: {
                    user_id: id
                }
            })
            let hashtagIdArray = []
            userHashtags.forEach(tag =>
                hashtagIdArray.push(tag.hashtag_id)
            )
            const hashtags = await Hashtag.findAll({
                where: {
                    id: hashtagIdArray
                } , attributes: {exclude: ['createdAt', 'updatedAt']},
            })
            const userWithHashtags = {user, hashtags}
            return res.json(userWithHashtags)
        } catch (e) {
            return res.status(401).json({message:"Не удается получить пользователя"})
        }
    }

    async sendCode(email, verificationCode) {
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
            subject: "Давай верифицируемся 🔥",
            html: `<h1>ВАШ КОД ${verificationCode}</h1></br>
                   <p>Не показывайте его другим людям</p></hr>
                   <p>Данное сообщение было сгененировано автоматически. Не отвечайте на данное сообщение</p></br>
                   <p>Команда NomadTravel</p>`}
        await transporter.sendMail(mailObject)
    }

    async check(req, res, next) {
        const token = generateJWT(req.user.id, req.user.email)
        return res.json({token})
    }

}

module.exports = new UserController()
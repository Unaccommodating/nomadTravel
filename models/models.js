const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const City = sequelize.define('city', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
})

const Onboarding = sequelize.define('onboarding', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    description: {type: DataTypes.STRING},
    img: {type: DataTypes.STRING},
})

const Notification = sequelize.define('notification', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
    description: {type: DataTypes.STRING},
    content: {type: DataTypes.STRING},
    is_read: {type: DataTypes.BOOLEAN},
    img: {type: DataTypes.STRING},
})

const Excursion = sequelize.define('excursion', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    background_img: {type: DataTypes.STRING},
    images: {type: DataTypes.JSON},
    repeat_type: {type: DataTypes.ENUM('everyday', 'never', 'certainDays'), allowNull: false},
    start_date: {type: DataTypes.DATE, allowNull: false},
    time: {type: DataTypes.STRING, allowNull: false},
    day_week: {type: DataTypes.JSON},
    end_date: {type: DataTypes.DATE},
    place_address: {type: DataTypes.STRING, allowNull: false},
    places_number: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    excursion_type: {type: DataTypes.ENUM('group', 'individual'), allowNull: false},
    hashtag: {type: DataTypes.JSON},
    included: {type: DataTypes.STRING},
    additional_services: {type: DataTypes.STRING},
    organizational_details: {type: DataTypes.STRING},
    duration: {type: DataTypes.STRING},
})

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    phone: {type: DataTypes.STRING, allowNull: false},
    confirmed: {type: DataTypes.BOOLEAN, defaultValue: false},
    img: {type: DataTypes.STRING},
    password: {type: DataTypes.STRING},
    creator: {type: DataTypes.BOOLEAN, defaultValue: false},
    hashtag: {type: DataTypes.JSON},
    ref_key: {type: DataTypes.STRING},
    rating: {type: DataTypes.FLOAT},
    total_count: {type: DataTypes.INTEGER},
})

const Hashtag = sequelize.define('hashtag', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
})

const DataBook = sequelize.define('dataBook', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    count_tickets: {type: DataTypes.INTEGER},
    date: {type: DataTypes.DATE, allowNull: false},
})

const VideoTrip = sequelize.define('videoTrip', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    video: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER},
    hashtag: {type: DataTypes.JSON},
})

const VideoSales = sequelize.define('videoSales', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})


City.hasMany(Excursion)
Excursion.belongsTo(City)

User.hasMany(Excursion)
Excursion.belongsTo(User)

User.hasMany(VideoTrip)
VideoTrip.belongsTo(User)

User.belongsToMany(VideoTrip, {through: VideoSales})
VideoTrip.belongsToMany(User, {through: VideoSales})

User.belongsToMany(Excursion, {through: DataBook})
Excursion.belongsToMany(User, {through: DataBook})


module.exports = {
    City,
    Onboarding,
    Notification,
    Excursion,
    User,
    Hashtag,
    DataBook,
    VideoTrip,
    VideoSales
}
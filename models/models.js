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
    images: {type: DataTypes.ARRAY(DataTypes.STRING)},
    place_address: {type: DataTypes.STRING, allowNull: false},
    dates: {type: DataTypes.JSON},
    places_number: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    excursion_type: {type: DataTypes.ENUM('group', 'individual'), allowNull: false},
    included: {type: DataTypes.STRING},
    additional_services: {type: DataTypes.STRING},
    organizational_details: {type: DataTypes.STRING},
    duration_minutes: {type: DataTypes.INTEGER},
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
    ref_key: {type: DataTypes.STRING},
    rating: {type: DataTypes.FLOAT},
    total_count: {type: DataTypes.INTEGER},
})

const Hashtag = sequelize.define('hashtag', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING},
})

const UserHashtag = sequelize.define('user_hashtag', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const ExcursionHashtag = sequelize.define('excursion_hashtag', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const DataBook = sequelize.define('data_book', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    count_tickets: {type: DataTypes.INTEGER},
    date: {type: DataTypes.DATE, allowNull: false},
})

const VideoTrip = sequelize.define('video_trip', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING},
    video: {type: DataTypes.STRING},
    price: {type: DataTypes.INTEGER},
    hashtag: {type: DataTypes.ARRAY(DataTypes.INTEGER)},
})

const VideoSales = sequelize.define('video_sales', {
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

User.belongsToMany(Hashtag, {through: UserHashtag, as: 'hashtag',  foreignKey: "user_id"})
Hashtag.belongsToMany(User, {through: UserHashtag, as: 'user',  foreignKey: "hashtag_id"})

Excursion.belongsToMany(Hashtag, {through: ExcursionHashtag, as: 'hashtag',  foreignKey: "excursion_id"})
Hashtag.belongsToMany(Excursion, {through: ExcursionHashtag, as: 'excursion',  foreignKey: "hashtag_id"})

module.exports = {
    City,
    Onboarding,
    Notification,
    Excursion,
    User,
    Hashtag,
    DataBook,
    VideoTrip,
    VideoSales,
    UserHashtag
}
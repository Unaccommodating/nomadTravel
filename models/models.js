const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const City = sequelize.define('city', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nameRu: {type: DataTypes.STRING, unique: true, allowNull: false},
    nameEn: {type: DataTypes.STRING, unique: true, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
})

const Onboarding = sequelize.define('onboarding', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    titleRu: {type: DataTypes.STRING},
    titleEn: {type: DataTypes.STRING},
    descriptionRu: {type: DataTypes.STRING},
    descriptionEn: {type: DataTypes.STRING},
    img: {type: DataTypes.STRING},
})

module.exports = {
    City,
    Onboarding
}
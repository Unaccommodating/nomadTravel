const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const City = sequelize.define('city', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
})

module.exports = {
    City
}
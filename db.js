const {Sequelize}=require('sequelize')
require('dotenv').config()


const sequelize=new Sequelize('expenseTrackerpractice','root',process.env.DB_PASS,{
    host:'localhost',
    dialect:'mysql'
})

module.exports=sequelize;


const {DataTypes}=require('sequelize')
const sequelize=require('../db')

const ForgetPassword=sequelize.define("ForgetPassword",{
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, 
    allowNull: false,
    primaryKey: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
})

module.exports=ForgetPassword;
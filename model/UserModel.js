const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // name is required
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // prevent duplicate emails
    validate: {
      isEmail: true, // ensure valid email format
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // password is required
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Default: user is NOT premium
  },
});
module.exports = User

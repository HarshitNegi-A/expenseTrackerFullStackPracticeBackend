const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER, // ✅ Must be numeric for autoIncrement
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING, // ✅ Store Cashfree order IDs here
    allowNull: false,
    unique: true
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "PENDING"
  },
});

module.exports = Order

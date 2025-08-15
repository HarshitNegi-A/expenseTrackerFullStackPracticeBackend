const { Sequelize } = require('sequelize');
const sequelize=require('../db')
const Order = require("../model/OrderModel");
const User = require("../model/UserModel");
const Expense=require('../model/ExpenseModel')
const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX, // or CFEnvironment.PRODUCTION
  "TEST430329ae80e0f32e41a393d78b923034",
  "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

exports.premium = async (req, res) => {
  let t;
  try {
    const user = req.user; // from JWT middleware
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const orderId = `order_${Date.now()}_${user.id}`;

    const request = {
      order_id: orderId,
      order_amount: 499, // ₹499
      order_currency: "INR",
      customer_details: {
        customer_id: `user_${user.id}`,
        customer_email: user.email || "test@example.com",
        customer_phone: user.phone || "9999999999",
      },
      order_meta: {
        return_url: `http://localhost:5173/?order_id={order_id}&status={order_status}`,
      },
    };

    const response = await cashfree.PGCreateOrder(request);

    if (!response.data || !response.data.payment_session_id) {
      return res
        .status(500)
        .json({ message: "Cashfree did not return a session ID" })
    }

    // ✅ Save order in DB for verification after payment
    t=await sequelize.transaction()
    await Order.create({
      orderId,
      userId: user.id,
      paymentStatus: "PENDING",
      
    },{transaction:t});
    await t.commit()
    res
      .status(200)
      .json({ payment_session_id: response.data.payment_session_id });
  } catch (err) {
    if (t) await t.rollback()
    console.error("Cashfree error:", err?.response?.data || err.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// ✅ Payment verification route
exports.verifyPayment = async (req, res) => {
  let t;
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ message: "order_id is required" });
    }

    // 1️⃣ Fetch payment details from Cashfree
    const verifyRes = await cashfree.PGOrderFetchPayments(order_id);

    if (verifyRes.data && verifyRes.data.length > 0) {
      const payment = verifyRes.data[0]; // Latest payment record

      if (payment.payment_status === "SUCCESS") {
        // 2️⃣ Update Order in MySQL
        t=await sequelize.transaction()
        const order = await Order.findOne({ where: { orderId: order_id },transaction:t });
        await Order.update(
          { paymentStatus: "SUCCESS" },
          { where: { orderId: order_id },transaction:t }
        );

        const user = await User.findByPk(order.userId,{transaction:t});
        if (user) {
          await user.update({ isPremium: true },{transaction:t});
        }
        await t.commit()
        return res.status(200).json({
          status: "PAID",
          user: user,
          message: "Payment verified and user upgraded to premium",
        });
      }
    }

    // 5️⃣ If not paid
    await Order.update(
      { paymentStatus: "FAILED" },
      { where: { orderId: order_id }, }
    );

    res.status(200).json({ status: "NOT_PAID" });
  } catch (err) {
    if (t) await t.rollback()
    console.error(
      "Payment verification error:",
      err?.response?.data || err.message
    );
    res.status(500).json({ message: "Failed to verify payment" });
  }
};

exports.leaderboard = async (req, res) => {
  let t;
  try {
    t=await sequelize.transaction()
    const leaderboard = await Expense.findAll({transaction:t,
      attributes: [
        'userId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalExpenses']
      ],
      include: [
        {
          model: User,
          attributes: ['name', 'email'] // fetch only necessary fields
        }
      ],
      group: ['userId', 'User.id'], // include User.id for proper grouping
      order: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'DESC']]
    });
    await t.commit()
    res.status(200).json(leaderboard);
  } catch (err) {
    if (t) await t.rollback()
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch leaderboard' });
  }
};

const Expense = require("../model/ExpenseModel");
const sequelize=require('../db')
exports.addExpense = async (req, res) => {
  let t;
  const { amount, description, category } = req.body;
  try {
    t=await sequelize.transaction()
    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id,
      note:"Migrations are working"
    },{transaction:t});
    if (!expense) {
      return res.status(400).json({ message: "unable to add expense" });
    }
    await t.commit()
    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (err) {
    if(t) await t.rollback()
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ message: "Expense fetched", expenses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" })
  }
};

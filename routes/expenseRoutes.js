const express=require('express')
const router=express.Router()
const expenseController=require('../controller/expenseController')
const authMiddleware=require('../middlewares/authMiddleware')

router.post('/add-expense',authMiddleware,expenseController.addExpense)
router.get('/',authMiddleware,expenseController.getExpense);


module.exports=router;
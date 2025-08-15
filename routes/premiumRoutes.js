const express=require('express')
const router=express.Router()
const premiumController=require('../controller/premiumController')
const authMiddleware=require('../middlewares/authMiddleware')

router.post('/',authMiddleware,premiumController.premium)
router.get("/verify", authMiddleware, premiumController.verifyPayment);
router.get("/leaderboard",authMiddleware,premiumController.leaderboard)


module.exports=router;
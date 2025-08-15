const express=require('express')
const router=express.Router()
const signupController=require('../controller/signupController')

router.post('/signup',signupController.signup)
router.post('/login',signupController.login)
router.post('/forgetpassword',signupController.forgetPassword)
router.post('/updatepassword/:id',signupController.updatePassword)
router.get('/resetpassword/:id',signupController.resetPassword)

module.exports=router;
const express = require('express');
const { User } = require('../models/user');
const router = express.Router();

router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email })
        if(!user){
            return res.status(404).json({ success: false, message: "User not found"})
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save();
            return res.status(201).json({ success: true, message: "User verified successfully" }) 
        }else if(!isCodeNotExpired){
            return res.status(401).json({ success: false, message: "Verify code is expired, please signup again"})
        }else if(!isCodeValid){
            return res.status(401).json({ success: false, message: "Verify code is invalid, please signup again"})
        }
    } catch (error) {
        console.log(`Error while verify user ${error}`)
    }
})

module.exports = router
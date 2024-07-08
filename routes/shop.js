// // routes/shop.js
const express = require('express');
const router = express.Router();
const {Shop} = require('../models/shop');
// const User = require('../models/user');
// const authMiddleware = require('../middleware/auth');

// // Create a new shop
// router.post('/create', authMiddleware, async (req, res) => {
//     const { name } = req.body;
//     const userId = req.user.id;

//     try {
//         // Check if the user already has a shop
//         const existingShop = await Shop.findOne({ owner: userId });
//         if (existingShop) {
//             return res.status(400).json({ message: 'User already has a shop' });
//         }

//         // Create a new shop
//         const newShop = new Shop({ name, owner: userId });
//         const savedShop = await newShop.save();

//         // Update the user with the new shop ID
//         await User.findByIdAndUpdate(userId, { shopId: savedShop._id });

//         res.status(201).json(savedShop);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });


// Get shop data by shopId
router.get('/', async (req, res) => {
    try {
        const shop = await Shop.find();
        if(!shop){
            res.status(404).json({ success: false })
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error)
    }
});
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if(!shop){
            res.status(404).json({ success: false })
        }
        res.status(200).json(shop);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error)
    }
});

module.exports = router;

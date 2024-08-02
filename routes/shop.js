// // routes/shop.js
const express = require('express');
const router = express.Router();
const {Shop} = require('../models/shop');



// Get shop data by shopId
router.get('/', async (req, res) => {
    try {
        const shop = await Shop.find();
        if(!shop){
            return res.status(404).json({ success: false })
        }
        return res.status(200).json(shop);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        if(!shop){
            return res.status(404).json({ success: false })
        }
        return res.status(200).json(shop);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

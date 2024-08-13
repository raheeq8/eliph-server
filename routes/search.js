const { Product } = require('../models/product.model');
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

router.get('/', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ msg: 'Query is required' });
        }

        const items = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { productFor: { $regex: query, $options: 'i' } },
                { catName: { $regex: query, $options: 'i' } },
                { subCatName: { $regex: query, $options: 'i' } }
            ]
        });

        return res.json(items);
    } catch (err) {
        return res.status(500).json({ msg: 'Server error' });
    }
});



module.exports = router;
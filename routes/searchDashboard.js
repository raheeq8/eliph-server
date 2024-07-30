const express = require('express');
const {Product} = require('../models/product.model');
const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  const shopId = req.query.shop;
  try {
    const products = await Product.find({ 
      name: { $regex: query, $options: 'i' },
      shop: shopId
    });
    res.json(products);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

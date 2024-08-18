const express = require('express');
const router = express.Router();
const { Offer } = require('../models/offer');
const { Product } = require('../models/product.model')


router.get(`/`, async (req, res) => {
    try {
        const cartList = await Offer.find(req.query);
        if (!cartList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json(cartList);
    } catch (error) {
        console.log('offer_get', error)
        return res.status(500).json({ success: false })
    }
});

router.post('/add-offer', async (req, res) => {

    try {
        const cartItem = await Offer.find({ staticId: req.body.staticId, productId: req.body.productId, userId: req.body.userId });

        // if (cartItem?.length === 0) {
            let cartList = new Offer({
                staticId: req.body.staticId,
                productTitle: req.body.productTitle,
                shop: req.body.shop,
                productSize: req.body.productSize,
                productWeight: req.body.productWeight,
                productColor: req.body.productColor,
                productRam: req.body.productRam,
                image: req.body.image,
                rating: req.body.rating,
                price: req.body.price,
                quantity: req.body.quantity,
                subTotal: req.body.subTotal,
                productId: req.body.productId,
                countInStock: req.body.countInStock,
                userId: req.body.userId
            });
            if (cartList.length >= 3) {
                return res.status(400).json({ message: 'You can only add up to three products.' });
            }


            // if (cartList.some(item => item.productId === productId)) {
            //     return res.status(400).json({ message: 'Product already in cart.' });
            // }
            // cartList.products.push({ productId });
            await cartList.save();

            return res.status(201).json(cartList);
        // } 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


router.post('/special-offer', async (req, res) => {
    const { userId, productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length !== 3) {
        return res.status(400).json({ message: 'You must add exactly three products.' });
    }
    try {
        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== 3) {
            return res.status(400).json({ message: 'One or more products are not found.' });
        }
        const totalPrice = products.reduce((total, product) => total + product.price, 0);
        if (totalPrice !== 1800) {
            return res.status(400).json({ message: 'The total price of the selected products is not 1800.' });
        }
        const cartItems = await Cart.find({ userId, productId: { $in: productIds } });
        if (cartItems.length > 0) {
            return res.status(400).json({ message: 'One or more products are already in your cart.' });
        }
        for (const productId of productIds) {
            const cartList = new Cart({
                staticId: req.body.staticId,
                productTitle: req.body.productTitle,
                shop: req.body.shop,
                productSize: req.body.productSize,
                productWeight: req.body.productWeight,
                productColor: req.body.productColor,
                productRam: req.body.productRam,
                image: req.body.image,
                rating: req.body.rating,
                price: req.body.price,
                quantity: req.body.quantity,
                subTotal: req.body.subTotal,
                productId,
                userId: req.body.userId
            });
            await cartList.save();
        }
        return res.status(201).json({ message: 'Special offer applied successfully.', totalPrice: 1800 });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
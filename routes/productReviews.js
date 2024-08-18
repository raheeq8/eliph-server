const { ProductReviews } = require('../models/productReviews');
const express = require('express');
const {Orders} = require('../models/orders.js')
const router = express.Router();
const {Product} = require('../models/product.model.js')


router.get(`/`, async (req, res) => {

    let  reviews=[];

    try {

        if(req.query.productId!==undefined && req.query.productId!==null && req.query.productId!=="" ){
            reviews = await ProductReviews.find({ productId: req.query.productId });
        }else {
            reviews = await ProductReviews.find(req.query);
        }


        if (!reviews) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json(reviews);

    } catch (error) {
        return res.status(500).json({ success: false })
    }


});

router.get(`/get/count`, async (req, res) =>{
    try {
        const productsReviews = await ProductReviews.countDocuments()
    
        if(!productsReviews) {
            return res.status(500).json({success: false})
        } 
        return res.send({
            productsReviews: productsReviews
        });
    } catch (error) {
        console.log(`reviews_get/count`, error)
    }
})

router.get('/:id', async (req, res) => {

    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
        return res.status(500).json({ message: 'The review with the given ID was not found.' })
    }
    return res.status(200).send(review);
})

// router.post('/add', async (req, res) => {
    
//     let review = new ProductReviews({
//         customerId: req.body.customerId,
//         customerName: req.body.customerName,
//         review:req.body.review,
//         customerRating: req.body.customerRating,
//         productId: req.body.productId,
//         staticId: req.body.staticId,
//         shop: req.body.shop
//     });



//     if (!review) {
//         return res.status(500).json({
//             error: err,
//             success: false
//         })
//     }


//     review = await review.save();


//     return res.status(201).json(review);

// });

router.post('/create', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const order = await Orders.findOne({
            userId,
            'products.staticId': productId,
            status: 'Delivered'
        });

        if (!order) {
            return res.status(400).json({
                success: false,
                message: 'You can only review products you have purchased and delivered.'
            });
        }

        let review = new ProductReviews({
            customerId: req.body.customerId,
            customerName: req.body.customerName,
            review: req.body.review,
            customerRating: req.body.customerRating,
            productId: req.body.productId,
            staticId: req.body.staticId,
            shop: req.body.shop
        });

        review = await review.save();

        return res.status(201).json(review);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Error occurred while creating review.'
        });
    }
});

router.get('/eligible-for-review/:customerId', async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Orders.find({
            userId,
            status: 'Delivered'
        }).select('products.productId');

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: 'No products available for review.'
            });
        }

        const productIds = orders.flatMap(order => order.products.map(p => p.productId));

        const products = await Product.find({ _id: { $in: productIds } });

        return res.status(200).json(products);

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Error occurred while fetching products.'
        });
    }
});

module.exports = router;


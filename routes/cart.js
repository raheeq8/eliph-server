const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {
    try {
        const cartList = await Cart.find(req.query);
        if (!cartList) {
            res.status(500).json({ success: false })
        }
        return res.status(200).json(cartList);
    } catch (error) {
        console.log('cart_get', error)
        return res.status(500).json({ success: false })
    }
});
router.post('/add', async (req, res) => {

    try {
        const cartItem = await Cart.find({ staticId: req.body.staticId, productId: req.body.productId, userId: req.body.userId });

        if (cartItem.length === 0) {
            let cartList = new Cart({
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
            if (!cartList) {
                return res.status(500).json({
                    error: err,
                    success: false
                })
            }


            cartList = await cartList.save();

            return res.status(201).json(cartList);
        } else {
            return res.status(401).json({ status: false, msg: "Product already added in the cart" })
        }
    } catch (error) {
        console.log(error)
    }



});

// router.post('/add-to-cart', async (req, res) => {
//     try {
//         const cartItem = await Cart.find({ staticId: req.body.staticId, productId: req.body.productId, userId: req.body.userId });
//         if (cartItem.products.includes(staticId)) {
//             return res.status(400).json({ message: 'Product already in cart.' });
//         }
//         if (cartItem.length === 0) {
//             let cartList = new Cart({
//                 staticId: req.body.staticId,
//                 productTitle: req.body.productTitle,
//                 shop: req.body.shop,
//                 productSize: req.body.productSize,
//                 productWeight: req.body.productWeight,
//                 productColor: req.body.productColor,
//                 productRam: req.body.productRam,
//                 image: req.body.image,
//                 rating: req.body.rating,
//                 price: req.body.price,
//                 quantity: req.body.quantity,
//                 subTotal: req.body.subTotal,
//                 productId: req.body.productId,
//                 userId: req.body.userId
//             });



//             if (!cartList) {
//                 return res.status(500).json({
//                     error: err,
//                     success: false
//                 })
//             }


//             cartList = await cartList.save();

//             return res.status(201).json(cartList);
//         } else {
//             return res.status(401).json({ status: false, msg: "Product already added in the cart" })
//         }
//     } catch (error) {
//         console.log(error)
//     }
// });


router.delete('/:id', async (req, res) => {

    try {
        const cartItem = await Cart.findById(req.params.id);

        if (!cartItem) {
            return res.status(404).json({ msg: "The cart item given id is not found!" })
        }

        const deletedItem = await Cart.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: 'Cart item not found!',
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Cart Item Deleted!'
        })
    } catch (error) {
        console.log('cart_delete', error)
        return res.status(500).json({ message: "Internal server error" })
    }
});



router.get('/:id', async (req, res) => {

    try {
        const catrItem = await Cart.findById(req.params.id);
    
        if (!catrItem) {
            return res.status(500).json({ message: 'The cart item with the given ID was not found.' })
        }
        return res.status(200).send(catrItem);
    } catch (error) {
        console.log('cart_getbyid', error)
    }
})


router.put('/:id', async (req, res) => {
    try {
        const cartList = await Cart.findByIdAndUpdate(
            req.params.id,
            {
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
                userId: req.body.userId
            },
            { new: true }
        )
    
        if (!cartList) {
            return res.status(500).json({
                message: 'Cart item cannot be updated!',
                success: false
            })
        }
    
        return res.send(cartList);
    } catch (error) {
        console.log('cart_put', error);
        return res.status(500).json({ message: "Internal server error "})
    }

})


module.exports = router;


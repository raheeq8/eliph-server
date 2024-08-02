const {ProductRams}  = require("../models/productRAMS.js") ;
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {
        const productREAMSList = await ProductRams.find(req.query);

        if (!productREAMSList) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json(productREAMSList);

    } catch (error) {
       return res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const item = await ProductRams.findById(req.params.id);

    if (!item) {
        return res.status(500).json({ message: 'The item with the given ID was not found.' })
    }
    return res.status(200).send(item);
})


router.post('/create', async (req, res) => {
    
    try {
        let productRAMS = new ProductRams({
            productRam: req.body.productRam,
            shop: req.body.shop
        });
    
    
    
        if (!productRAMS) {
            return res.status(500).json({
                error: err,
                success: false
            })
        }
    
    
        productRAMS = await productRAMS.save();
    
        return res.status(201).json(productRAMS);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error"})
    }

});


router.delete('/:id', async (req, res) => {
    const deletedItem = await ProductRams.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        res.status(404).json({
            message: 'Item not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Item Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    try {
        const item = await ProductRams.findByIdAndUpdate(
            req.params.id,
            {
                productRam: req.body.productRam,
            },
            { new: true }
        )
    
        if (!item) {
            return res.status(500).json({
                message: 'item cannot be updated!',
                success: false
            })
        }
    
    
        return res.send(item);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error"})
    }

})


module.exports = router;
const {ProductColor}  = require("../models/productColor") ;
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {
        const productColorList = await ProductColor.find();

        if (!productColorList) {
           return res.status(500).json({ success: false })
        }

        return res.status(200).json(productColorList);

    } catch (error) {
       return res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const item = await ProductColor.findById(req.params.id);

    if (!item) {
       return res.status(500).json({ message: 'The item with the given ID was not found.' })
    }
    return res.status(200).send(item);
})


router.post('/create', async (req, res) => {
    
    let productColor = new ProductColor({
        color: req.body.color
    });



    if (!productColor) {
        return res.status(500).json({
            error: err,
            success: false
        })
    }


    productColor = await productColor.save();

    return res.status(201).json(productColor);

});


router.delete('/:id', async (req, res) => {
    const deletedItem = await ProductColor.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        return res.status(404).json({
            message: 'Item not found!',
            success: false
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Item Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    const item = await ProductColor.findByIdAndUpdate(
        req.params.id,
        {
            color: req.body.color,
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

})


module.exports = router;
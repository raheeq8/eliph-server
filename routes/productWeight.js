const {ProductWeight}  = require("../models/productWeight") ;
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {
        const productWeightList = await ProductWeight.find(req.query);

        if (!productWeightList) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(productWeightList);

    } catch (error) {
        return res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const item = await ProductWeight.findById(req.params.id);

    if (!item) {
       return res.status(500).json({ message: 'The item with the given ID was not found.' })
    }
    return res.status(200).send(item);
})


router.post('/create', async (req, res) => {
    
    try {
        let productWeight = new ProductWeight({
            productWeight: req.body.productWeight,
            shop: req.body.shop
        });
    
    
    
        if (!productWeight) {
            return res.status(500).json({
                error: err,
                success: false
            })
        }
    
    
        productWeight = await productWeight.save();
    
       return res.status(201).json(productWeight);
    } catch (error) {
        console.log('p_weight_create', error)
        return res.status(500).json({ message: "Internal server error"})
    }

});


router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await ProductWeight.findByIdAndDelete(req.params.id);
    
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
    } catch (error) {
        console.log('p_weight_delete', error)
        return res.status(500).json({ message: "Internal server error"})
    }
});


router.put('/:id', async (req, res) => {

try {
        const item = await ProductWeight.findByIdAndUpdate(
            req.params.id,
            {
                productWeight: req.body.productWeight,
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
    console.log('p_weight_put', error)
    return res.status(500).json({ message: "Internal server error"})
}

})


module.exports = router;
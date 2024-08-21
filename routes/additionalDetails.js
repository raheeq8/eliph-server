const {AdditionalDetails}  = require("../models/additionalDetails.js") ;
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {
        const additionalDetailsList = await AdditionalDetails.find(req.query);

        if (!additionalDetailsList) {
           return res.status(404).json({ success: false })
        }

        return res.status(200).json(additionalDetailsList);

    } catch (error) {
       return res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const item = await AdditionalDetails.findById(req.params.id);

    if (!item) {
       return res.status(500).json({ message: 'The item with the given ID was not found.' })
    }
    return res.status(200).send(item);
})


router.post('/create', async (req, res) => {
    let additionalDetails = new AdditionalDetails({
        detail: req.body.detail,
        shop: req.body.shop
    });
    if (!additionalDetails) {
        return res.status(401).json({
            error: err,
            success: false
        })
    }
    additionalDetails = await additionalDetails.save();
    return res.status(201).json(additionalDetails);
});


router.delete('/:id', async (req, res) => {
    const deletedItem = await AdditionalDetails.findByIdAndDelete(req.params.id);
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

    const item = await AdditionalDetails.findByIdAndUpdate(
        req.params.id,
        {
            detail: req.body.detail,
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
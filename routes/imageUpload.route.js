const { ImageUpload } = require('../models/imageUpload');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const imagesList = await ImageUpload.find();

    if (!imagesList) {
        res.status(500).json({ success: false })
    }
    res.status(200).json(imagesList)
})

router.delete('/:id', async (req, res) => {
    const deletedImages = await ImageUpload.findByIdAndDelete(req.params.id);
    if (!deletedImages) {
        res.status(404).json({ message: "The images with the given id not found", success: false })
    }
    return res.status(200).json({
        message: "Images deleted",
        success: true
    })
})

module.exports = router;
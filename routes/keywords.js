const express = require("express");
const router = express.Router();
const { Keywords } = require('../models/keywords.js');

router.get('/', async(req, res) => {
    try {
        const keywordsList = await Keywords.find(req.query);
        if(!keywordsList){
            return res.status(404).json({
                message: "keywords list not found"
            })
        }
        return res.status(201).json(keywordsList)
    } catch (error) {
        console.log('keywords_get', error)
        return res.status(500).json({
            message:"internal server error",
            success: false
        })
    }
})

router.post('/create', async (req, res) => {
    let keywordDetail = new Keywords({
        keyword: req.body.keyword,
        shop: req.body.shop
    });
    if (!keywordDetail) {
        return res.status(401).json({
            error: err,
            success: false
        })
    }
    keywordDetail = await keywordDetail.save();
    return res.status(201).json(keywordDetail);
});

router.delete('/:id', async (req, res) => {
    const keywords = await Keywords.findByIdAndDelete(req.params.id)
    if(!keywords){
        return res.status(404).json({
            message:"keyword not found",
            success: false
        })
    }

    return res.status(201).json({
        message:"keyword deleted successfully",
        success: true
    })
})

router.put('/:id', async(req, res) => {
    try {
        const keyword = await Keywords.findByIdAndUpdate(
            req.params.id, {
                keyword: req.body.keyword
            },
            {
                new: true
            }
        )
        if(!keyword){
            return res.status(404).json({
                message: "keyword not found",
                success: false
            })
        }
        return res.status(201).json(keyword)
    } catch (error) {
        console.log('keywords_put', error);
        return res.status(500).json({
            message:"internal server error",
            success: false
        })
    }
})

module.exports = router
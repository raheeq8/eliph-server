const express = require('express');
const router = express.Router();
const { SubCat } = require('../models/subCat.model');


router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalPosts = await SubCat.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    let subCtegoryList=[];
    if (page > totalPages) {
        return res.status(404).json({ message: "Page Not Found" })
    }
    if (req.query.page !== undefined && req.query.perPage !== undefined) {
        subCtegoryList = await SubCat.find(req.query).populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }else{
        subCtegoryList = await SubCat.find(req.query).populate("category");
    }
        // const subCatList = await SubCat.find().populate("category").skip((page - 1) * perPage).limit(perPage).exec();
        if (!subCtegoryList) {
            res.status(404).json({ message: "The sub category with the given id not found", success: false })
        }
        res.status(200).json({
            "subCatList": subCtegoryList,
            "totalPages": totalPages,
            "page": page
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error"})
        console.log(error)
    }
})

router.get(`/get/count`, async (req, res) =>{
    const subCatCount = await SubCat.countDocuments()

    if(!subCatCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        subCatCount: subCatCount
    });
})

router.get('/:id', async (req, res) => {
    

    const subCat = await SubCat.findById(req.params.id).populate("category");

    if (!subCat) {
        res.status(404).json({ message: "The sub category with the given id not found", success: false })
    }
    return res.status(200).send(subCat)
});

router.post('/create', async (req, res) => {
    let subCat = new SubCat({
        category: req.body.category,
        subCat: req.body.subCat,
        shop: req.body.shop
    })

    if (!subCat) {
        return res.status(500).json({
            error: "Cannot create sub category",
            success: false
        })
    };

    subCat = await subCat.save();
    res.status(201).json(subCat)
});

router.delete('/:id', async (req, res) => {
    const deletedSubCat = await SubCat.findByIdAndDelete(req.params.id);
    if (!deletedSubCat) {
        res.status(404).json({ message: "The sub category with the given id not found", success: false })
    }
    return res.status(200).json({
        message: "Sub Category deleted",
        success: true
    })
});

router.put('/:id', async (req, res) => {
    const subCat = await SubCat.findByIdAndUpdate(req.params.id, {
        category: req.body.category,
        subCat: req.body.subCat,
    }, { new: true });
    if (!subCat) {
        res.status(404).json({ message: "The sub category with the given cannot be updated", success: false })
    }
    res.send(subCat)
});


module.exports = router;
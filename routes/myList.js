const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {

        const myList = await MyList.find(req.query);

        if (!myList) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json(myList);

    } catch (error) {
       return res.status(500).json({ success: false })
    }
});



router.post('/add', async (req, res) => {

    try {
        const item = await MyList.find({productId:req.body.productId, staticId: req.body.staticId, userId: req.body.userId});
    
        if(item.length===0){
            let list = new MyList({
                productTitle: req.body.productTitle,
                countInStock: req.body.countInStock,
                shop: req.body.shop,
                productSize: req.body.productSize,
                productWeight: req.body.productWeight,
                productColor: req.body.productColor,
                productRam: req.body.productRam,
                image: req.body.image,
                rating: req.body.rating,
                price: req.body.price,
                productId: req.body.productId,
                staticId: req.body.staticId,
                userId: req.body.userId
            });
        
        
        
            if (!list) {
                return res.status(500).json({
                    error: err,
                    success: false
                })
            }
        
        
            list = await list.save();
        
            return res.status(201).json(list);
        }else{
            return res.status(401).json({status:false,msg:"Product already added in the My List"})
        }
    } catch (error) {
        console.log('myList_add', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});


router.delete('/:id', async (req, res) => {

    try {
        const item = await MyList.findById(req.params.id);
    
        if (!item) {
            return res.status(404).json({ msg: "The item given id is not found!" })
        }
    
        const deletedItem = await MyList.findByIdAndDelete(req.params.id);
    
        if (!deletedItem) {
            return res.status(404).json({
                message: 'item not found!',
                success: false
            })
        }
    
        return res.status(200).json({
            success: true,
            message: 'Item Deleted!'
        })
    } catch (error) {
        console.log('myList_delete', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});

router.get('/:id', async (req, res) => {

    try {
        const item = await MyList.findById(req.params.id);
    
        if (!item) {
            return res.status(500).json({ message: 'The item with the given ID was not found.' })
        }
        return res.status(200).send(item);
    } catch (error) {
        console.log('myList_getbyid', error);
        return res.status(500).json({ message: "Internal server error "})
    }
})


module.exports = router;


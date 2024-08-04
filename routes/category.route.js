const { Category } = require('../models/caregory.model');
const { ImageUpload } = require('../models/imageUpload');
const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
    secure: true
})

var imagesArr = [];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
  
const upload = multer({ storage: storage })

router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr=[];

    try{
    
        for (let i = 0; i < req?.files?.length; i++) {

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };
    
            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                });
        }


        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });

        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);

       

    }catch(error){
        console.log(error);
    }


});

router.get('/', async (req, res) => {

try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalPosts = await Category.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
    
        if (page > totalPages) {
            return res.status(404).json({ message: "Page Not Found" })
        }
    
        const categoryList = await Category.find(req.query).skip((page - 1) * perPage).limit(perPage).exec();
    
        if (!categoryList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "categoryList": categoryList,
            "totalPages": totalPages,
            "page": page
        })
} catch (error) {
    console.log('category_get', error);
    return res.status(500).json({ message: "Internal server error "})
}
});

router.get('/:id', async (req, res) => {
    try {
        categoryEditId = req.params.id
        const category = await Category.findById(req.params.id);
    
        if (!category) {
            return res.status(404).json({ message: "The category with the given id not found", success: false })
        }
        return res.status(200).send(category)
    } catch (error) {
        console.log('category_getbyid', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});
router.get(`/get/count`, async (req, res) =>{
    try {
        const categoryCount = await Category.countDocuments()
    
        if(!categoryCount) {
           return res.status(500).json({success: false})
        } 
        return res.send({
            categoryCount: categoryCount
        });
    } catch (error) {
        
        console.log('category_/get/count', error);
        return res.status(500).json({ message: "Internal server error "})
    }
})

router.post('/create', async (req, res) => {

    try {
        let category = new Category({
            name: req.body.name,
            images: imagesArr,
            color: req.body.color,
        })
    
        if (!category) {
            return res.status(500).json({
                error: "Cannot create category",
                success: false
            })
        };
    
        category = await category.save();
        imagesArr = [];
        return res.status(201).json(category)
    } catch (error) {
        console.log('category_create', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});

router.delete('/deleteImage', async (req, res) => {
    try {
        const imgUrl = req.query.img;
    
        const urlArr = imgUrl.split('/');
        const image =  urlArr[urlArr.length-1];
      
        const imageName = image.split('.')[0];
    
        const response = await cloudinary.uploader.destroy(imageName, { invalidate: true })
        if(response){
           return res.status(200).send(response);
        }
    } catch (error) {
        
        console.log('category_deleteImage', error);
        return res.status(500).json({ message: "Internal server error "})
    }
      
});

  

router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        const images = category.images;
    
        for(img of images){
            const imgUrl = img;
            const urlArr = imgUrl.split('/');
            const image =  urlArr[urlArr.length-1];
          
            const imageName = image.split('.')[0];
    
            cloudinary.uploader.destroy(imageName, (error,result)=>{
               // console.log(error, result);
            })
        }
    
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "The category with the given id not found", success: false })
        }
        return res.status(200).json({
            message: "Category deleted",
            success: true
        })
    } catch (error) {
        
        console.log('category_delete', error);
        return res.status(500).json({ message: "Internal server error "})
    }
})

// router.put('/:id', async (req, res) => {
//     const categoryImages = await Category.findById(req.params.id);
//     const images = categoryImages.images;

//     if(images.length !== 0){
//         for(image of images){
//             fs.unlinkSync(`uploads/${image}`)
//         }
//     }
//     const category = await Category.findByIdAndUpdate(req.params.id, {
//         name: req.body.name,
//         images: imagesArr,
//         color: req.body.color
//     }, { new: true });
//     if (!category) {
//         res.status(404).json({ message: "The category with the given cannot be updated", success: false })
//     }
//     res.send(category)
// });
router.put('/:id', async (req, res) => {

    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                images: req.body.images,
                color: req.body.color
            },
            { new: true }
        )
    
        if (!category) {
            return res.status(500).json({
                message: 'Category cannot be updated!',
                success: false
            })
        }
    
        imagesArr = [];
    
        return res.status(200).send(category);
    } catch (error) {
        console.log('category_put', error);
        return res.status(500).json({ message: "Internal server error "})
    }

})

module.exports = router;
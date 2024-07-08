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


// var imagesArr = [];
// var productEditId;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads')
//     },
//     filename: function (req, file, cb) {
//       cb(null, `${Date.now()}_${file.originalname}`)
//     }
//   })
  
// const upload = multer({ storage: storage })

// router.post('/upload', upload.array("images"), async (req, res) => {
//     let images;
//     if(productEditId!==undefined){
//         const category = await Category.findById(productEditId)
//         if(category){
//             images = category.images
//         }
//         if(images.length !== 0){
//             for(image of images){
//                 fs.unlinkSync(`uploads/${image}`);

//             }
//             productEditId="";
//         }
//     }
//     imagesArr = [];
//     const files = req.files;
//     for(let i=0; i<files.length; i++){
//         imagesArr.push(files[i].filename)
//     }
//     res.send(imagesArr)
// })

router.get('/', async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const totalPosts = await Category.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
        return res.status(404).json({ message: "Page Not Found" })
    }

    const categoryList = await Category.find(req.query).skip((page - 1) * perPage).limit(perPage).exec();

    if (!categoryList) {
        res.status(500).json({ success: false })
    }
    res.status(200).json({
        "categoryList": categoryList,
        "totalPages": totalPages,
        "page": page
    })
});

router.get('/:id', async (req, res) => {
    categoryEditId = req.params.id
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404).json({ message: "The category with the given id not found", success: false })
    }
    return res.status(200).send(category)
});
router.get(`/get/count`, async (req, res) =>{
    const categoryCount = await Category.countDocuments()

    if(!categoryCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        categoryCount: categoryCount
    });
})

router.post('/create', async (req, res) => {

    let category = new Category({
        name: req.body.name,
        images: imagesArr,
        color: req.body.color,
        shop: req.body.shop
    })

    if (!category) {
        return res.status(500).json({
            error: "Cannot create category",
            success: false
        })
    };

    category = await category.save();
    imagesArr = [];
    res.status(201).json(category)
});

router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

   // console.log(imgUrl)

    const urlArr = imgUrl.split('/');
    const image =  urlArr[urlArr.length-1];
  
    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error,result)=>{
       // console.log(error, res)
    })

    if(response){
        res.status(200).send(response);
    }
      
});

router.delete('/:id', async (req, res) => {
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
      //  console.log(imageName)
    }

    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
        res.status(404).json({ message: "The category with the given id not found", success: false })
    }
    return res.status(200).json({
        message: "Category deleted",
        success: true
    })
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

    res.send(category);

})

module.exports = router;
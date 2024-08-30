const { Category } = require('../models/caregory.model');
const { Product } = require('../models/product.model')
const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs');
const { ImageUpload } = require('../models/imageUpload');
const { RecentlyViewd } = require('../models/recentlyViewd.js');

const cloudinary = require('cloudinary').v2;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
    secure: true
});
var imagesArr = [];


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', async (req, res) => {
    try {
        // Use multer to handle file uploads
        await upload.array("images")(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // Multer error occurred
                console.error('Multer error:', err);
                return res.status(400).json({ error: 'Multer error' });
            } else if (err) {
                // Other unknown error
                console.error('Unknown error:', err);
                return res.status(500).json({ error: 'Unknown error' });
            }

            const imagesArr = [];

            // Upload each file to Cloudinary
            for (let i = 0; i < req.files.length; i++) {
                const options = {
                    use_filename: true,
                    unique_filename: true,
                    overwrite: false,
                };

                try {
                    const result = await cloudinary.uploader.upload(req.files[i].path, options);
                    imagesArr.push(result.secure_url);

                    // Remove uploaded file from local storage
                    fs.unlinkSync(req.files[i].path);
                } catch (uploadError) {
                    console.error('Error uploading image to Cloudinary:', uploadError);
                    return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
                }
            }

            // Save uploaded image URLs to your database
            const imagesUploaded = new ImageUpload({
                images: imagesArr,
            });

            try {
                await imagesUploaded.save();
                return res.status(200).json(imagesArr);
            } catch (saveError) {
                console.error('Error saving image URLs to database:', saveError);
                return res.status(500).json({ error: 'Error saving image URLs to database' });
            }
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage);
    const totalPosts = await Product.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
    if (page > totalPages) {
        return res.status(404).json({ message: "Page Not Found" })
    }
    let productList = [];
    if (req.query.minPrice !== undefined && req.query.maxPrice !== undefined) {
        productList = await Product.find({ subCatId: req.query.subCatId }).populate("category subCat shop Keyword");
        const filteredProducts = productList.filter(product => {
            if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
                return false;
            }
            if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
                return false;
            }
            return true;
        });
        if (!productList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "products": filteredProducts,
            "totalPages": totalPages,
            "page": page
        });
    }
    else if (req.query.page !== undefined && req.query.perPage !== undefined) {
        productList = await Product.find().populate("category subCat shop").skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!productList) {
            return res.status(500).json({ success: false })
        }
        return res.status(200).json({
            "products": productList,
            "totalPages": totalPages,
            "page": page
        });


    }

    else {
        productList = await Product.find(req.query).populate("category subCat shop");

        if (!productList) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json({
            "products": productList,
            "totalPages": totalPages,
            "page": page
        });

    }

});
router.get('/filtered',async (req, res) => {
    try {
        const { category, minPrice, maxPrice, rating, size } = req.query;

        let query = { category };

        if (minPrice || maxPrice) {
            query.price = {
                $gte: parseInt(minPrice) || 0,
                $lte: parseInt(maxPrice) || 10000,
            };
        }

        if (rating) {
            query.rating = { $gte: parseInt(rating) };
        }

        if (size) {
            query.size = size;
        }

        const products = await Product.find(query).sort('price');
        res.json({ products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})


router.get('/600-or-less', async (req, res) => {
    try {
        const products = await Product.find({ price: { $lte: 600 } });
        return res.json(products);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Route to get products with 50% or more discount
router.get('/50-or-more-discount', async (req, res) => {
    try {
        const products = await Product.find({ discount: { $gte: 50 } });  // 50% or more
        
        return res.json(products);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});


router.get(`/featured`, async (req, res) => {
    try {
        const productList = await Product.find({ isFeatured: true });
        if (!productList) {
            return res.status(500).json({ success: false })
        }
    
        return res.status(200).json(productList);
    } catch (error) {      
        console.log('product_featured', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});

router.get(`/recentlyViewd`, async (req, res) => {
    try {
        let productList = [];
        productList = await RecentlyViewd.find(req.query).populate("category subCat shop");
    
        if (!productList) {
            return res.status(500).json({ success: false })
        }
    
        return res.status(200).json(productList);
    } catch (error) {       
        console.log('product_recentlyViewd', error);
        return res.status(500).json({ message: "Internal server error "})
    }
});

router.post(`/recentlyViewd`, async (req, res) => {


    let findProduct = await RecentlyViewd.find({ prodId: req.body.id });

    var product;

    if (findProduct.length === 0) {
        product = new RecentlyViewd({
            staticId: req.body.staticId,
            prodId: req.body.id,
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            subCatId: req.body.subCatId,
            catName: req.body.catName,
            subCatName: req.body.subCatName,
            subCat: req.body.subCat,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            color: req.body.color,
            productWeight: req.body.productWeight,
            shop: req.body.shop
        });

        product = await product.save();

        if (!product) {
            return res.status(500).json({
                error: err,
                success: false
            })
        }

        return res.status(201).json(product);
    }





});

router.get('/:id', async (req, res) => {

    productEditId = req.params.id

    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({ message: "The product with the given id not found", success: false })
    }
    return res.status(200).send(product)
});
router.get('/staticId/:staticId', async (req, res) => {
    try {
        const product = await Product.findOne({ staticId: req.params.staticId });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json(product);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.get('/shop/:shopId', async (req, res) => {
    try {
        const products = await Product.find({ shop: req.params.shop });
        return res.json(products);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get(`/get/count`, async (req, res) => {
    try {
        const productsCount = await Product.countDocuments()

        if (!productsCount) {
            return res.status(404).json({ success: false })
        }
        return res.send({
            productsCount: productsCount
        });
    } catch (error) {
        console.log(error)
    }
})
router.post('/create', async (req, res) => {

    try {
        const category = await Category.findById(req.body.category);
        const images_Array = [];
        const uploadedImages = await ImageUpload.find();

        const images_Arr = uploadedImages?.map((item) => {
            item.images?.map((image) => {
                images_Array.push(image);
                console.log(image);
            })


        })
        if (!category) {
            return res.status(400).send("Invalid Category!")
        }


        let product = new Product({
            staticId: req.body.staticId,
            name: req.body.name,
            productFor: req.body.productFor,
            itemFor: req.body.itemFor,
            description: req.body.description,
            images: images_Array,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            expense: req.body.expense,
            category: req.body.category,
            subCat: req.body.subCat,
            subCatId: req.body.subCatId,
            catName: req.body.catName,
            subCatName: req.body.subCatName,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            color: req.body.color,
            detail: req.body.detail,
            keyword: req.body.keyword,
            productWeight: req.body.productWeight,
            shop: req.body.shop
        });
        product = await product.save();

        if (!product) {
            return res.status(500).json({
                error: "Cannot create product",
                success: false
            })
        };
        imagesArr = [];
        return res.status(201).json(product)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: true, msg: "Something went wrong" });
    }
});

router.delete('/deleteImage', async (req, res) => {
    try {
        const imgUrl = req.query.img;
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split('.')[0];

        const response = await cloudinary.uploader.destroy(imageName, (error, result) => {
        })

        if (response) {
            return res.status(200).send(response);
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const images = product.images;
    
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split('/');
            const image = urlArr[urlArr.length - 1];
    
            const imageName = image.split('.')[0];
    
            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {
                    // console.log(error, result);
                })
            }
        }
    
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return res.status(404).json({ message: "The product with the given id not found", success: false })
        }
        return res.status(200).json({
            message: "product deleted",
            success: true
        })
    } catch (error) {
        console.log('product_delete', error);
        return res.status(500).json({ message: "Internal server error "})     
    }
});

router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            productFor: req.body.productFor,
            itemFor: req.body.itemFor,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            expense: req.body.expense,
            category: req.body.category,
            subCat: req.body.subCat,
            subCatId: req.body.subCatId,
            catName: req.body.catName,
            subCatName: req.body.subCatName,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            color: req.body.color,
            detail: req.body.detail,
            keyword: req.body.keyword,
            productWeight: req.body.productWeight,
        }, { new: true });
        if (!product) {
            return res.status(404).json({ message: "The product with the given cannot be updated", success: false })
        }
        imagesArr = [];
        return res.status(200).json({
            message: "product updated",
            success: true
        })
    } catch (error) {
        console.log('product_put', error);
        return res.status(500).json({ message: "Internal server error "})
    }
})



module.exports = router;
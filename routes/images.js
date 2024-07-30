// routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, getImages, deleteImage, updateImage } = require('../helper/images.js');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/upload', upload.array('images', 10), uploadImage);
router.get('/', getImages);
router.delete('/delete/:id', deleteImage);
router.put('/update/:id', upload.single('image'), updateImage);

module.exports = router;

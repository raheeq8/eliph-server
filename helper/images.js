// controllers/imageController.js
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/image.js');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
    secure: true
})

const uploadImage = async (req, res) => {
  try {
    let imageUrls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push({ url: result.secure_url, cloudinary_id: result.public_id });
      fs.unlinkSync(file.path); // Remove the file from the server
    }
    const images = await Image.insertMany(imageUrls);
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinary_id);
    
    // Delete from MongoDB
    await image.remove();
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete old image from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinary_id);

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Update image details in MongoDB
    image.url = result.secure_url;
    image.cloudinary_id = result.public_id;
    await image.save();

    fs.unlinkSync(req.file.path); // Remove the new file from the server
    res.status(200).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadImage, getImages, deleteImage, updateImage };

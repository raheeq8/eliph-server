// models/Shop.js
const mongoose = require('mongoose');

const shopSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

exports.Shop = mongoose.model('Shop', shopSchema);
exports.shopSchema = shopSchema;

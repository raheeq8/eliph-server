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
    followersCount: {
        type: Number,
        default: 0
    }
});

exports.Shop = mongoose.model('Shop', shopSchema);
exports.shopSchema = shopSchema;

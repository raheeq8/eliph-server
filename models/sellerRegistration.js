const mongoose = require('mongoose');

const sellerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            "Please provide a valid email address",
        ],
    },
    password: {
        type: String,
        required: true
    },
})

sellerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sellerSchema.set('toJSON', {
    virtuals: true,
});

exports.Seller = mongoose.model('Seller', sellerSchema);
exports.sellerSchema = sellerSchema;
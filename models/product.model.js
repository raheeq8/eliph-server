const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    staticId: {
        type: String,
        // required: true,
        unique: true,
        default: function() {
      return 'rgstore-' + Math.random().toString(36).substr(2, 9);
    }
      },
     
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    expense: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCat",
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    catName: {
        type: String,
        default: ''
    },
    subCatName: {
        type: String,
        default: ''
    },
    subCatId: {
        type: String,
        default: ''
    },
    discount: {
        type: Number,
        required: true,
    },
    productRam: [
        {
            type: String,
            default: null,
        }
    ],
    size: [
        {
            type: String,
            default: null,
        }
    ],
    color: [
        {
            type: String,
            default: null,
        }
    ],
    productWeight: [
        {
            type: String,
            default: null,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
});

productSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
productSchema.set('toJSON', {
    virtuals: true
})

exports.Product = mongoose.model("Product", productSchema);
exports.productSchema = productSchema
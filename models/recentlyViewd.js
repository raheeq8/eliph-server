const mongoose = require("mongoose");

const recentlyViewdSchema = mongoose.Schema({
    staticId: {
        type: String,
        // required: true,
        unique: true,
        default: function() {
      return 'rgstore-' + Math.random().toString(36).substr(2, 9);
    }
      },
    prodId:{
        type:String,
        default:''
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String,
            required: true
        }
    ],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    oldPrice: {
        type: Number,
        default: 0
    },
    catName:{
        type:String,
        default:''
    },
    subCatName: {
        type: String,
        default: ''
    },
    subCatId:{
        type:String,
        default:''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCat',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
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
    shop:{
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})


recentlyViewdSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

recentlyViewdSchema.set('toJSON', {
    virtuals: true,
});

exports.RecentlyViewd = mongoose.model('RecentlyViewd', recentlyViewdSchema);

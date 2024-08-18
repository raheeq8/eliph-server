const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    staticId: {
        type: String,
        required: true,
      },
    productTitle:{
        type:String,
        required:true
    },
    shop:{
        type: String
    },
    productSize:{
        type:String,
    },
    productWeight:{
        type:String,
    },
    productColor:{
        type:String,
    },
    productRam:{
        type:String,
    },
    image:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    productId:{
        type:String,
        required:true
    },
    countInStock: {
        type: Number,
        required: true
    },
    userId:{
        type:String,
        required:true
    }
})

offerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

offerSchema.set('toJSON', {
    virtuals: true,
});

exports.Offer = mongoose.model('Offer', offerSchema);
exports.offerSchema = offerSchema;

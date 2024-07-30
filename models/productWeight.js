const mongoose = require('mongoose');

const productWeightSchema = mongoose.Schema({
    productWeight:{
        type:String,
        default:null
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
})

productWeightSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productWeightSchema.set('toJSON', {
    virtuals: true,
});

exports.ProductWeight = mongoose.model('ProductWeight', productWeightSchema);
exports.productWeightSchema = productWeightSchema;

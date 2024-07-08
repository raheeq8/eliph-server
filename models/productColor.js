const mongoose = require('mongoose');

const productColorSchema = mongoose.Schema({
    color:{
        type:String,
        default:null
    }
})

productColorSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productColorSchema.set('toJSON', {
    virtuals: true,
});

exports.ProductColor = mongoose.model('ProductColor', productColorSchema);
exports.productColorSchema = productColorSchema;

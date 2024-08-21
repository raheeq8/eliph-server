const mongoose = require('mongoose');

const keywordsSchema = mongoose.Schema({
    keyword:{
        type:String,
        default:null
    },
    shop: { type: String, required: true },
})

keywordsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

keywordsSchema.set('toJSON', {
    virtuals: true,
});

exports.Keywords = mongoose.model('Keywords', keywordsSchema)
exports.keywordsSchema = keywordsSchema;

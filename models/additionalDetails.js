const mongoose = require('mongoose');

const additionalDetailsSchema = mongoose.Schema({
    detail:{
        type:String,
        default:null
    },
    shop: { type: String, required: true },
})

additionalDetailsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

additionalDetailsSchema.set('toJSON', {
    virtuals: true,
});

exports.AdditionalDetails = mongoose.model('AdditionalDetails', additionalDetailsSchema)
exports.additionalDetailsSchema = additionalDetailsSchema;

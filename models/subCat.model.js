const mongoose = require('mongoose');
const SubCatSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    subCat: {
        type: String,
        required:  true
    },
    
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
});

SubCatSchema.virtual('id').get(function (){
    return this._id.toHexString();
});
SubCatSchema.set('toJSON', {
    virtuals: true
})

exports.SubCat = mongoose.model("SubCat", SubCatSchema);
exports.SubCatSchema = SubCatSchema
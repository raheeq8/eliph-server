const mongoose = require('mongoose');

const myListSchema = mongoose.Schema({
    productTitle:{
        type:String,
        required:true
    },
    shop:{
        type: String
    },
    productSize:{
        type:Array,
        required:true
    },
    productWeight:{
        type:Array,
        required:true
    },
    productColor:{
        type:Array,
        required:true
    },
    productRam:{
        type:Array,
        required:true
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
    productId:{
        type:String,
        required:true
    },
    staticId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    }
})

myListSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

myListSchema.set('toJSON', {
    virtuals: true,
});

exports.MyList = mongoose.model('MyList', myListSchema);
exports.myListSchema = myListSchema;

const mongoose = require('mongoose');

const ordersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    },
    products: [
        {
            productId:{
                type:String
            },
            staticId:{
                type:String
            },
            productTitle: {
                type: String
            },
            productSize: {
                type: String
            },
            productWeight: {
                type: String
            },
            productColor: {
                type: String
            },
            productRam: {
                type: String
            },
            shop:{
                type: String
            },
            quantity:{
                type:Number
            },
            price:{
                type:Number
            },
            image:{
                type:String
            },
            subTotal:{
                type:Number
            }
        }
    ],
    shop:{
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"pending"
    },
    
    // shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    date: {
        type: Date,
        default: Date.now,
    },

})

ordersSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

ordersSchema.set('toJSON', {
    virtuals: true,
});

exports.Orders = mongoose.model('Orders', ordersSchema);
exports.ordersSchema = ordersSchema;

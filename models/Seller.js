// models/Seller.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  cnicNumber: {
    type: String,
    required: [true, 'CNIC number is required'],
    unique: true,
    match: [/^\d{5}-\d{7}-\d{1}$/, 'Please enter a valid CNIC number'],
    validate: {
      validator: function(v) {
        return v.length === 15;
      },
      message: props => `${props.value} is not a valid CNIC number. It must be 15 characters long, including dashes.`,
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{4}-\d{7}$/, 'Please enter a valid phone number'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
  },
  description: {
    type: String,
    required: [true, 'Company description is required'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Prefer not to say'],
    required: [true, 'Gender is required'],
  },
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;

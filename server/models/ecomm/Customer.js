const mongoose = require('mongoose');
const { ecommDb } = require('../../config/db');

const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    default: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Customer = ecommDb.model('Customer', CustomerSchema, 'customers');
module.exports = Customer;

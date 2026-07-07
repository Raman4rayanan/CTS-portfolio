const mongoose = require('mongoose');
const { ecommDb } = require('../../config/db');

const CustomerSessionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CustomerSession = ecommDb.model('CustomerSession', CustomerSessionSchema, 'customersessions');
module.exports = CustomerSession;

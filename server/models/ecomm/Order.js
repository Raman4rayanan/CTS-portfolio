const mongoose = require('mongoose');
const { ecommDb } = require('../../config/db');

const OrderSchema = new mongoose.Schema({
  referenceId: {
    type: String,
    required: true,
    unique: true
  },
  customerDetails: {
    name: { type: String, required: true },
    company: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    message: { type: String, default: '' }
  },
  items: [{
    product_id: { type: String, required: true },
    sku: { type: String, required: true },
    product_name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Bind specifically to ecommDb
const Order = ecommDb.model('Order', OrderSchema, 'orders');

module.exports = Order;

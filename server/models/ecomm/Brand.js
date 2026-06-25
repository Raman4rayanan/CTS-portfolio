const mongoose = require('mongoose');
const { ecommDb } = require('../../config/db');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bind specifically to ecommDb
const Brand = ecommDb.model('Brand', BrandSchema, 'brands');

module.exports = Brand;

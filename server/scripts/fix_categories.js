require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { ecommDb } = require('../config/db');
const Product = require('../models/ecomm/Product');

const fixCategories = async () => {
  try {
    const result = await Product.updateMany(
      { category: 'power tools' },
      { $set: { category: 'Power Tools' } }
    );
    console.log(`Updated ${result.modifiedCount} products from 'power tools' to 'Power Tools'`);

    // Let's also just check if there are any other weird lowercase ones
    const products = await Product.find({}, 'category');
    const categories = new Set(products.map(p => p.category));
    console.log('Current categories:', Array.from(categories));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

ecommDb.on('connected', () => {
  fixCategories();
});

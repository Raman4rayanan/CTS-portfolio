require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { ecommDb } = require('../config/db');
const Product = require('../models/ecomm/Product');

const fixGloves = async () => {
  try {
    const result = await Product.updateMany(
      { product_name: { $regex: /glove/i } },
      { $set: { category: 'Hand Protection' } }
    );
    console.log(`Updated ${result.modifiedCount} products containing 'glove' to 'Hand Protection'`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

ecommDb.on('connected', () => {
  fixGloves();
});

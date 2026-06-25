require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { ecommDb } = require('../config/db');
const Product = require('../models/ecomm/Product');

// Dynamic loader for ES6 sampleProducts file
const loadSampleProducts = () => {
  const filePath = path.resolve(__dirname, '../../src/data/sampleProducts.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const jsCode = fileContent.replace('export const sampleProducts =', 'module.exports =');
  const tempPath = path.resolve(__dirname, './temp_products.js');
  fs.writeFileSync(tempPath, jsCode, 'utf8');
  const products = require('./temp_products');
  fs.unlinkSync(tempPath);
  return products;
};

const seedEcomm = async () => {
  try {
    const products = loadSampleProducts();
    console.log(`Loaded ${products.length} MRO sample products from client resources.`);

    // Clear existing products in cts_ecomm database
    await Product.deleteMany({});
    console.log('MongoDB: Cleared products collection in [cts_ecomm]');

    // Insert all
    await Product.insertMany(products);
    console.log(`MongoDB: Successfully seeded ${products.length} products to [cts_ecomm]`);

    // Disconnect
    mongoose.disconnect();
    console.log('MongoDB: Seeding completed and connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB Seeding failed:', err.message);
    process.exit(1);
  }
};

// Wait for database connection to be established
ecommDb.on('connected', () => {
  seedEcomm();
});

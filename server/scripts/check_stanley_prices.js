require('dotenv').config();
const mongoose = require('mongoose');
const { ecommDb } = require('../config/db');
const Product = require('../models/ecomm/Product');

async function run() {
  // Give DB time to connect
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    const products = await Product.find({ 
      brand: { $regex: /stanley/i }
    });
    
    console.log(`Found ${products.length} Stanley products.`);
    
    let productsWithPrice = 0;
    for (const p of products) {
      if (p.specifications && (p.specifications.toLowerCase().includes('rs') || p.specifications.toLowerCase().includes('price') || p.specifications.includes('₹'))) {
        console.log(`\n--- Product: ${p.product_name} (ID: ${p.product_id}) ---`);
        console.log(`Specs:\n${p.specifications}`);
        productsWithPrice++;
      }
    }
    
    console.log(`\nTotal Stanley products with price in specs: ${productsWithPrice}`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();

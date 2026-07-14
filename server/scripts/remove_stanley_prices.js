require('dotenv').config();
const mongoose = require('mongoose');
const { ecommDb } = require('../config/db');
const Product = require('../models/ecomm/Product');

async function run() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    const products = await Product.find({ 
      brand: { $regex: /stanley/i }
    });
    
    let updatedCount = 0;
    
    for (const p of products) {
      if (p.specifications) {
        const parts = p.specifications.split('|');
        const newParts = parts.filter(part => !part.toLowerCase().includes('price') && !part.toLowerCase().includes('rs.') && !part.includes('₹'));
        
        if (parts.length !== newParts.length) {
          p.specifications = newParts.map(part => part.trim()).join(' | ');
          await p.save();
          updatedCount++;
        }
      }
    }
    
    console.log(`Successfully removed prices from ${updatedCount} Stanley products.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { portfolioDb } = require('../config/db');
const ProductService = require('../models/portfolio/ProductService');

async function run() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const services = await ProductService.find().sort({ createdAt: -1 });
    console.log('Database Services:');
    services.forEach((s, idx) => {
      console.log(`\nPosition ${idx + 1}:`);
      console.log(`- ID: ${s._id}`);
      console.log(`- Title: "${s.title}"`);
      console.log(`- Image: "${s.image}"`);
      console.log(`- Description: "${s.desc}"`);
      console.log(`- CreatedAt: ${s.createdAt.toISOString()}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}
run();

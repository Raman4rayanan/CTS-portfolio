require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { portfolioDb } = require('../config/db');
const ProductService = require('../models/portfolio/ProductService');

async function run() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const services = await ProductService.find().sort({ createdAt: -1 });
    console.log('Current Services sorted by createdAt DESC:');
    services.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.title}] (ID: ${s._id}) - CreatedAt: ${s.createdAt.toISOString()}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}
run();

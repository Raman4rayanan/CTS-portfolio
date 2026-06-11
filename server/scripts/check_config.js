require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { portfolioDb } = require('../config/db');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');

async function run() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const config = await PortfolioConfig.findOne();
    if (config) {
      console.log('Database Portfolio Configuration:');
      console.log('Partners:', config.partners.map(p => ({ name: p.name, scale: p.scale })));
      console.log('Customers:', config.customers.map(c => ({ name: c.name, scale: c.scale })));
    } else {
      console.log('No config found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}
run();

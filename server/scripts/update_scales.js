require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { portfolioDb } = require('../config/db');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');

async function run() {
  console.log('Connecting to database...');
  // Wait 1.5 seconds for mongoose connections
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    let config = await PortfolioConfig.findOne();
    if (config && config.partners) {
      console.log('Current partners configuration in database:');
      console.log(config.partners.map(p => ({ name: p.name, scale: p.scale })));
      
      // Update the scales
      config.partners = config.partners.map(p => {
        if (p.name.includes('Eibenstock')) {
          p.scale = 2.5;
        } else if (p.name.includes('Cromwell')) {
          p.scale = 1.8;
        } else if (p.name.includes('Atlas')) {
          p.scale = 3.5;
        }
        return p;
      });
      
      await config.save();
      console.log('✓ Successfully updated partners scales in MongoDB portfolio config!');
      console.log(config.partners.map(p => ({ name: p.name, scale: p.scale })));
    } else {
      console.log('No portfolio configuration document found to update.');
    }
  } catch (err) {
    console.error('✗ Error updating config:', err);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}

run();

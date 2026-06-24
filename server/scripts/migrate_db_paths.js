require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { portfolioDb } = require('../config/db');

// Import Models
const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');

function updateLocalPath(pathStr) {
  if (!pathStr) return pathStr;
  // If it's already a full URL (like Cloudinary) or already starts with nested public folders, don't modify it
  if (pathStr.startsWith('http') || pathStr.startsWith('/port/') || pathStr.startsWith('/admin/') || pathStr.startsWith('/ecomm/')) {
    return pathStr;
  }
  // Otherwise prepend /port/
  if (pathStr.startsWith('/')) {
    return `/port${pathStr}`;
  }
  return `/port/${pathStr}`;
}

async function migrate() {
  console.log('Connecting and waiting for database to open...');
  // Wait 1.5 seconds for mongoose connections to establish
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // 1. Migrate Activities
    console.log('\nMigrating activities image paths...');
    const activities = await Activity.find();
    let updatedActivitiesCount = 0;
    for (const act of activities) {
      const originalPath = act.image;
      const newPath = updateLocalPath(originalPath);
      if (originalPath !== newPath) {
        act.image = newPath;
        await act.save();
        updatedActivitiesCount++;
        console.log(`Updated Activity "${act.title}": ${originalPath} -> ${newPath}`);
      }
    }
    console.log(`✓ Migrated ${updatedActivitiesCount} activities.`);

    // 2. Migrate ProductServices
    console.log('\nMigrating services image paths...');
    const services = await ProductService.find();
    let updatedServicesCount = 0;
    for (const srv of services) {
      const originalPath = srv.image;
      const newPath = updateLocalPath(originalPath);
      if (originalPath !== newPath) {
        srv.image = newPath;
        await srv.save();
        updatedServicesCount++;
        console.log(`Updated Service "${srv.title}": ${originalPath} -> ${newPath}`);
      }
    }
    console.log(`✓ Migrated ${updatedServicesCount} services.`);

    // 3. Migrate Portfolio Config (Partners & Customers brand logos)
    console.log('\nMigrating portfolio config partner & customer logos...');
    const configs = await PortfolioConfig.find();
    let updatedConfigsCount = 0;
    for (const cfg of configs) {
      let isModified = false;
      if (cfg.partners && cfg.partners.length > 0) {
        cfg.partners = cfg.partners.map(p => {
          const newSrc = updateLocalPath(p.src);
          if (p.src !== newSrc) {
            isModified = true;
            console.log(`Updated Partner "${p.name}" logo: ${p.src} -> ${newSrc}`);
            return { ...p.toObject(), src: newSrc };
          }
          return p;
        });
      }
      if (cfg.customers && cfg.customers.length > 0) {
        cfg.customers = cfg.customers.map(c => {
          const newSrc = updateLocalPath(c.src);
          if (c.src !== newSrc) {
            isModified = true;
            console.log(`Updated Customer "${c.name}" logo: ${c.src} -> ${newSrc}`);
            return { ...c.toObject(), src: newSrc };
          }
          return c;
        });
      }
      if (isModified) {
        // Use markModified because we are modifying nested subdocument arrays
        cfg.markModified('partners');
        cfg.markModified('customers');
        await cfg.save();
        updatedConfigsCount++;
      }
    }
    console.log(`✓ Migrated ${updatedConfigsCount} portfolio config records.`);

    console.log('\n========================================');
    console.log(' DATABASE PATH MIGRATION COMPLETED!');
    console.log('========================================');
  } catch (error) {
    console.error('✗ Migration error:', error);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}

migrate();

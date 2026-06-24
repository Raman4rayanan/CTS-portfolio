require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { portfolioDb } = require('../config/db');

// Import Models
const Activity = require('../models/portfolio/Activity');
const ProductService = require('../models/portfolio/ProductService');
const PortfolioConfig = require('../models/portfolio/PortfolioConfig');

const publicPortDir = path.resolve(__dirname, '../../PUBLIC/port');

const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

async function uploadFile(filePath, cloudName, preset) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  const fileName = path.basename(filePath);
  
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: mimeType });
  
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('upload_preset', preset);
  formData.append('folder', 'port');

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      console.error(`✗ Cloudinary error for ${fileName}:`, data.error?.message || data);
      return null;
    }
  } catch (err) {
    console.error(`✗ Fetch error for ${fileName}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('Connecting and waiting for database to open...');
  // Wait 1.5 seconds for mongoose connections
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const config = await PortfolioConfig.findOne();
    if (!config) {
      console.error('✗ Error: No portfolio configuration found in MongoDB. Please load the site or run seed first.');
      process.exit(1);
    }

    const cloudName = config.cloudinaryCloudName;
    const preset = config.cloudinaryUploadPreset;

    if (!cloudName || !preset) {
      console.error('================================================================');
      console.error('✗ ERROR: CLOUDINARY CREDENTIALS NOT FOUND IN DATABASE CONFIG!');
      console.error('Please go to the Admin Panel, configure your Cloudinary settings,');
      console.error('and click "Save All Changes" before running this script.');
      console.error('================================================================');
      process.exit(1);
    }

    console.log(`\nUsing Cloudinary Cloud: "${cloudName}" and Preset: "${preset}"`);

    if (!fs.existsSync(publicPortDir)) {
      console.error(`✗ Error: PUBLIC/port directory not found at ${publicPortDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(publicPortDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return fs.statSync(path.join(publicPortDir, file)).isFile() && ['.png', '.jpg', '.jpeg', '.svg'].includes(ext);
    });

    if (files.length === 0) {
      console.log('✓ No local files found in PUBLIC/port to upload.');
      process.exit(0);
    }

    console.log(`\nFound ${files.length} local images to migrate to Cloudinary...`);

    const urlMap = {};
    for (const file of files) {
      const filePath = path.join(publicPortDir, file);
      console.log(`Uploading ${file}...`);
      const cloudUrl = await uploadFile(filePath, cloudName, preset);
      if (cloudUrl) {
        urlMap[file] = cloudUrl;
        console.log(`  ✓ Uploaded: ${file} -> ${cloudUrl}`);
      } else {
        console.error(`  ✗ Failed to upload ${file}`);
      }
    }

    const successfulUploads = Object.keys(urlMap).length;
    console.log(`\nUpload complete. Successfully uploaded ${successfulUploads} / ${files.length} files.`);

    if (successfulUploads === 0) {
      console.error('✗ No files were uploaded successfully. Aborting database migration.');
      process.exit(1);
    }

    // Function to replace path with Cloudinary URL
    function getCloudinaryUrl(originalPath) {
      if (!originalPath) return originalPath;
      const baseName = path.basename(originalPath);
      return urlMap[baseName] || originalPath;
    }

    // 1. Update Activities in DB
    console.log('\nUpdating Activity image URLs in database...');
    const activities = await Activity.find();
    for (const act of activities) {
      const cloudUrl = getCloudinaryUrl(act.image);
      if (act.image !== cloudUrl) {
        act.image = cloudUrl;
        await act.save();
        console.log(`  Updated Activity "${act.title}" image -> ${cloudUrl}`);
      }
    }

    // 2. Update ProductServices in DB
    console.log('\nUpdating Product Services image URLs in database...');
    const services = await ProductService.find();
    for (const srv of services) {
      const cloudUrl = getCloudinaryUrl(srv.image);
      if (srv.image !== cloudUrl) {
        srv.image = cloudUrl;
        await srv.save();
        console.log(`  Updated Service "${srv.title}" image -> ${cloudUrl}`);
      }
    }

    // 3. Update Portfolio Config in DB
    console.log('\nUpdating Portfolio Configuration brand logos in database...');
    let configModified = false;
    if (config.partners && config.partners.length > 0) {
      config.partners = config.partners.map(p => {
        const cloudUrl = getCloudinaryUrl(p.src);
        if (p.src !== cloudUrl) {
          configModified = true;
          console.log(`  Updated Partner logo "${p.name}" -> ${cloudUrl}`);
          return { ...p.toObject(), src: cloudUrl };
        }
        return p;
      });
    }
    if (config.customers && config.customers.length > 0) {
      config.customers = config.customers.map(c => {
        const cloudUrl = getCloudinaryUrl(c.src);
        if (c.src !== cloudUrl) {
          configModified = true;
          console.log(`  Updated Customer logo "${c.name}" -> ${cloudUrl}`);
          return { ...c.toObject(), src: cloudUrl };
        }
        return c;
      });
    }

    if (configModified) {
      config.markModified('partners');
      config.markModified('customers');
      await config.save();
      console.log('  ✓ Portfolio Config brand logos updated.');
    }

    console.log('\n======================================================');
    console.log(' DATABASE RECORD INTEGRATION COMPLETE!');
    console.log('======================================================');

    // Print mapping to aid in updating frontend static arrays
    console.log('\nCopy-paste this URL mapping to update frontend file arrays:');
    console.log(JSON.stringify(urlMap, null, 2));

    // 4. Delete local files
    console.log('\nCleaning up local storage files from PUBLIC/port...');
    for (const file of Object.keys(urlMap)) {
      const filePath = path.join(publicPortDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`  Deleted local file: ${file}`);
      } catch (err) {
        console.error(`  ✗ Error deleting local file ${file}:`, err.message);
      }
    }
    console.log('\n✓ Cleanup complete! All local PUBLIC/port files migrated and deleted.');

  } catch (error) {
    console.error('✗ Migration process failed:', error);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}

run();

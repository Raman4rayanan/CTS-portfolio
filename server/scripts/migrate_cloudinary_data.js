require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'coo50qxq',
  api_key: '624219237837967',
  api_secret: 'm_sTF118dCeuB6daNzbt0TjD_tw'
});

const uploadPreset = 'CTS_preset';
const oldCloudName = 'coo50qxq';

const MONGODB_PORTFOLIO_URI = process.env.MONGODB_PORTFOLIO_URI;
const MONGODB_ECOMM_URI = process.env.MONGODB_ECOMM_URI;

// Cache of uploaded URLs to avoid re-uploading the exact same image multiple times
const urlCache = {};

async function uploadToCloudinary(oldUrl) {
  if (urlCache[oldUrl]) {
    return urlCache[oldUrl];
  }

  try {
    console.log(`    Uploading: ${oldUrl}`);
    const result = await cloudinary.uploader.upload(oldUrl, {
      upload_preset: uploadPreset
    });
    urlCache[oldUrl] = result.secure_url;
    return result.secure_url;
  } catch (error) {
    console.error(`    Failed to upload ${oldUrl}:`, error.message);
    return oldUrl; // Keep old URL if upload fails
  }
}

async function processDocument(doc) {
  let modified = false;

  async function walk(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      if (typeof obj[key] === 'string' && obj[key].includes(`res.cloudinary.com/${oldCloudName}/`)) {
        const newUrl = await uploadToCloudinary(obj[key]);
        if (newUrl !== obj[key]) {
          obj[key] = newUrl;
          modified = true;
        }
      } else if (Array.isArray(obj[key])) {
        for (let i = 0; i < obj[key].length; i++) {
          if (typeof obj[key][i] === 'string' && obj[key][i].includes(`res.cloudinary.com/${oldCloudName}/`)) {
            const newUrl = await uploadToCloudinary(obj[key][i]);
            if (newUrl !== obj[key][i]) {
              obj[key][i] = newUrl;
              modified = true;
            }
          } else if (typeof obj[key][i] === 'object') {
            await walk(obj[key][i]);
          }
        }
      } else if (typeof obj[key] === 'object') {
        await walk(obj[key]);
      }
    }
  }

  await walk(doc);
  return modified;
}

async function migrateDatabase(uri, dbName) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    console.log(`\n========================================`);
    console.log(` Scanning Database: ${dbName}`);
    console.log(`========================================`);

    const collections = await db.listCollections().toArray();

    for (const colInfo of collections) {
      const collectionName = colInfo.name;
      if (collectionName.startsWith('system.')) continue;

      const collection = db.collection(collectionName);
      const docs = await collection.find({}).toArray();

      let updatedCount = 0;

      for (const doc of docs) {
        // Special case for Portfolio Config
        let configModified = false;
        if (collectionName === 'portfolio_configs') {
           if (doc.cloudinaryCloudName !== 'coo50qxq') {
               doc.cloudinaryCloudName = 'coo50qxq';
               configModified = true;
           }
           if (doc.cloudinaryUploadPreset !== uploadPreset) {
               doc.cloudinaryUploadPreset = uploadPreset;
               configModified = true;
           }
        }

        const isModified = await processDocument(doc);
        
        if (isModified || configModified) {
          await collection.updateOne({ _id: doc._id }, { $set: doc });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`  ✅ Updated ${updatedCount} documents in collection: ${collectionName}`);
      }
    }

  } catch (err) {
    console.error(`Error in ${dbName}:`, err);
  } finally {
    await client.close();
  }
}

async function run() {
  console.log("Starting Cloudinary Migration...");
  await migrateDatabase(MONGODB_PORTFOLIO_URI, 'cts_portfolio');
  await migrateDatabase(MONGODB_ECOMM_URI, 'cts_ecomm');
  console.log("\nMigration completed! 🎉");
}

run();

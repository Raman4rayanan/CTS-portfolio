require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { portfolioDb } = require('../config/db');
const ProductService = require('../models/portfolio/ProductService');

async function run() {
  console.log('Connecting to database...');
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const powerDoc = await ProductService.findOne({ title: 'Power Tools' });
    const storageDoc = await ProductService.findOne({ title: 'Storage Cabinets' });

    if (!powerDoc || !storageDoc) {
      console.log('Error: Could not find both Power Tools and Storage Cabinets in database.');
      if (!powerDoc) console.log('Missing: Power Tools');
      if (!storageDoc) console.log('Missing: Storage Cabinets');
      return;
    }

    console.log('Before Swap:');
    console.log(`- Power Tools: ${powerDoc.createdAt.toISOString()}`);
    console.log(`- Storage Cabinets: ${storageDoc.createdAt.toISOString()}`);

    // Swap the createdAt timestamps
    const tempDate = powerDoc.createdAt;
    powerDoc.createdAt = storageDoc.createdAt;
    storageDoc.createdAt = tempDate;

    await powerDoc.save();
    await storageDoc.save();

    console.log('\n✓ Swap completed successfully!');
    console.log('After Swap:');
    console.log(`- Power Tools: ${powerDoc.createdAt.toISOString()}`);
    console.log(`- Storage Cabinets: ${storageDoc.createdAt.toISOString()}`);

    // Fetch again to verify sorting order
    const services = await ProductService.find().sort({ createdAt: -1 });
    console.log('\nNew Services sorted by createdAt DESC:');
    services.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.title}] (ID: ${s._id}) - CreatedAt: ${s.createdAt.toISOString()}`);
    });

  } catch (err) {
    console.error('✗ Error swapping timestamps:', err);
  } finally {
    await portfolioDb.close();
    process.exit(0);
  }
}

run();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

const sourceUri = 'mongodb+srv://chandru:chandru06@cts.irb6wby.mongodb.net';
const targetUri = 'mongodb+srv://adminconcepttoolsandservice_db_user:Mjpjne6MYZnJPjzm@cts.denwmh5.mongodb.net';

const databases = ['cts_portfolio', 'cts_ecomm', 'cts_admin'];

async function runMigration() {
  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  try {
    console.log('Connecting to Source Cluster...');
    await sourceClient.connect();
    console.log('Connected to Source Cluster successfully.');

    console.log('Connecting to Target Cluster...');
    await targetClient.connect();
    console.log('Connected to Target Cluster successfully.');

    for (const dbName of databases) {
      console.log(`\n========================================`);
      console.log(` Migrating Database: ${dbName}`);
      console.log(`========================================`);

      const sourceDb = sourceClient.db(dbName);
      const targetDb = targetClient.db(dbName);

      const collections = await sourceDb.listCollections().toArray();
      
      if (collections.length === 0) {
        console.log(`No collections found in ${dbName}. Skipping.`);
        continue;
      }

      for (const colInfo of collections) {
        const collectionName = colInfo.name;
        // Skip system collections
        if (collectionName.startsWith('system.')) continue;

        console.log(`\n  Processing collection: ${collectionName}...`);
        
        const sourceCol = sourceDb.collection(collectionName);
        const targetCol = targetDb.collection(collectionName);

        // Fetch all documents
        const docs = await sourceCol.find({}).toArray();
        console.log(`    Found ${docs.length} documents.`);

        if (docs.length > 0) {
          // Check if target collection already has documents to prevent duplication
          const targetCount = await targetCol.countDocuments();
          if (targetCount > 0) {
             console.log(`    Warning: Target collection already has ${targetCount} documents. Dropping it first...`);
             await targetCol.drop();
          }
          
          await targetCol.insertMany(docs);
          console.log(`    ✅ Inserted ${docs.length} documents into target cluster.`);
        } else {
          console.log(`    ⚠️ Collection is empty. Created empty collection in target.`);
          await targetDb.createCollection(collectionName);
        }
      }
    }

    console.log('\n========================================');
    console.log(' Migration Completed Successfully! 🎉');
    console.log('========================================');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

runMigration();

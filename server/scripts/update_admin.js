const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const uri = 'mongodb+srv://adminconcepttoolsandservice_db_user:Mjpjne6MYZnJPjzm@cts.denwmh5.mongodb.net/cts_admin?retryWrites=true&w=majority&appName=CTS';

mongoose.connect(uri).then(async () => {
  const collection = mongoose.connection.db.collection('users');
  const result = await collection.updateOne(
    { email: 'admin@gmail.com' },
    { $set: { email: 'adminconcepttoolsandservice@gmail.com' } }
  );
  console.log('Update result:', result);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

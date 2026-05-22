const mongoose = require('mongoose');

const uri = 'mongodb://5060someone_db_user:pkqTaWz1vDOlbBM2@ac-fz1egju-shard-00-00.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-01.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-02.lv71ceh.mongodb.net:27017/nextcard?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function checkProducts() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products`);
  if (products.length > 0) {
    console.log(products[0]);
  }
  process.exit(0);
}

checkProducts().catch(console.error);

const mongoose = require('mongoose');

const uri = 'mongodb://5060someone_db_user:pkqTaWz1vDOlbBM2@ac-fz1egju-shard-00-00.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-01.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-02.lv71ceh.mongodb.net:27017/nextcard?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(uri);
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const master = await User.findOne({ email: 'vikitour.boss@gmail.com' });
    
    console.log('=== MASTER ACCOUNT IN CLOUD ===');
    console.log(master);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();

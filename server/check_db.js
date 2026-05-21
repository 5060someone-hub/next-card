const mongoose = require('mongoose');

const uri = 'mongodb://5060someone_db_user:pkqTaWz1vDOlbBM2@ac-fz1egju-shard-00-00.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-01.lv71ceh.mongodb.net:27017,ac-fz1egju-shard-00-02.lv71ceh.mongodb.net:27017/nextcard?ssl=true&authSource=admin&retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas!');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Card = mongoose.model('Card', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({});
    const cards = await Card.find({});
    
    console.log('=== USERS IN CLOUD ===');
    console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })), null, 2));
    
    console.log('=== CARDS IN CLOUD ===');
    console.log(JSON.stringify(cards.map(c => ({ id: c._id, userId: c.userId, grade: c.grade, updatedAt: c.updatedAt })), null, 2));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();

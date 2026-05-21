const mongoose = require('mongoose');

const uri = 'mongodb+srv://someone5060:someone5060@cluster0.lv71ceh.mongodb.net/nextcard?retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to Cluster0!');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Card = mongoose.model('Card', new mongoose.Schema({}, { strict: false }));
    
    const users = await User.find({});
    const cards = await Card.find({});
    
    console.log('=== CLUSTER0 USERS ===');
    console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })), null, 2));
    
    console.log('=== CLUSTER0 CARDS ===');
    console.log(JSON.stringify(cards.map(c => ({ id: c._id, userId: c.userId, grade: c.grade, updatedAt: c.updatedAt })), null, 2));
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error connecting to Cluster0:', err.message);
  }
}

check();

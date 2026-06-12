const mongoose = require('mongoose');

async function cleanSettings() {
  try {
    const uri = 'mongodb+srv://admin:admin123@cluster0.mongodb.net/test?retryWrites=true&w=majority';
    await mongoose.connect(uri);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    const settings = await db.collection('settings').find({}).toArray();
    console.log('Found', settings.length, 'settings');
    
    for (const setting of settings) {
      const size = JSON.stringify(setting.value).length;
      console.log(`Setting ${setting.key} size: ${(size/1024/1024).toFixed(2)} MB`);
      
      if (size > 1024 * 1024) { // Larger than 1MB
        // For now, let's just delete the setting so it falls back to DEFAULT_CONTENT
        await db.collection('settings').deleteOne({ _id: setting._id });
        console.log(`Deleted massive setting: ${setting.key}`);
      }
    }
    
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanSettings();

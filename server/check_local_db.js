const mongoose = require('mongoose');

const connectionUri = 'mongodb://127.0.0.1:27017/nextcard';

async function check() {
  try {
    await mongoose.connect(connectionUri);
    const Setting = mongoose.model('Setting', new mongoose.Schema({
      key: String,
      value: mongoose.Schema.Types.Mixed
    }));
    
    const landing = await Setting.findOne({ key: 'landing_content' });
    if (landing) {
      console.log('LOCAL DB - Pricing count:', landing.value.pricing ? landing.value.pricing.length : 0);
      console.log('LOCAL DB - FAQ items count:', landing.value.faq?.items ? landing.value.faq.items.length : 0);
      console.log('LOCAL DB - Partners logos count:', landing.value.partnersLogos ? landing.value.partnersLogos.length : 0);
      console.log('LOCAL DB - Reviews count:', landing.value.reviews?.items ? landing.value.reviews.items.length : 0);
    } else {
      console.log('LOCAL DB - No landing content');
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}
check();

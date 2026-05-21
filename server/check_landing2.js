const mongoose = require('mongoose');
require('dotenv').config();

const connectionUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextcard';

async function check() {
  try {
    await mongoose.connect(connectionUri);
    const Setting = mongoose.model('Setting', new mongoose.Schema({
      key: String,
      value: mongoose.Schema.Types.Mixed
    }));
    
    const landing = await Setting.findOne({ key: 'landing_content' });
    if (landing) {
      console.log('Pricing data structure:', JSON.stringify(landing.value.pricing, null, 2));
      console.log('Partners logos count:', landing.value.partnersLogos ? landing.value.partnersLogos.length : 'none');
      console.log('FAQ items count:', landing.value.faq?.items ? landing.value.faq.items.length : 'none');
      console.log('Reviews count:', landing.value.reviews?.items ? landing.value.reviews.items.length : 'none');
    } else {
      console.log('No landing content');
    }
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}
check();

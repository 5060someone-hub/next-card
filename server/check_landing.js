const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const connectionUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextcard';

async function checkLanding() {
  try {
    await mongoose.connect(connectionUri);
    console.log('Connected to MongoDB:', connectionUri.includes('mongodb+srv') ? 'Cloud' : 'Local');
    
    const settingSchema = new mongoose.Schema({
      key: { type: String, required: true, unique: true },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    });
    const Setting = mongoose.model('Setting', settingSchema);
    
    const landing = await Setting.findOne({ key: 'landing_content' });
    if (!landing) {
      console.log('❌ landing_content NOT found in DB!');
    } else {
      console.log('✅ landing_content found!');
      const val = landing.value;
      console.log('--- Colors ---');
      console.log(val.colors);
      console.log('--- Pricing ---');
      console.log(JSON.stringify(val.pricing, null, 2));
      console.log('--- FAQ ---');
      console.log('FAQ Badge:', val.faq?.badge);
      console.log('FAQ Title:', val.faq?.title);
      console.log('FAQ Items Count:', val.faq?.items ? val.faq.items.length : 'none');
      if (val.faq?.items && val.faq.items.length > 0) {
        console.log('First 2 FAQ items:', JSON.stringify(val.faq.items.slice(0, 2), null, 2));
      }
      console.log('--- Partners Logos ---');
      console.log('Logos Count:', val.partnersLogos ? val.partnersLogos.length : 'none');
      console.log('Logos:', JSON.stringify(val.partnersLogos, null, 2));
      console.log('--- Reviews ---');
      console.log('Reviews Count:', val.reviews?.items ? val.reviews.items.length : 'none');
      if (val.reviews?.items && val.reviews.items.length > 0) {
        console.log('First 2 Reviews:', JSON.stringify(val.reviews.items.slice(0, 2), null, 2));
      }
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkLanding();

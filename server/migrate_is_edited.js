const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextcard';

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: String, default: 'general' },
  paymentStatus: { type: String, default: 'none' },
  isEdited: { type: Boolean, default: false },
  cardData: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const Card = mongoose.model('Card', cardSchema);

function evaluateLegacyIsActive(card) {
  if (!card) return false;
  if (card.grade && card.grade !== 'general') return true;
  if (card.paymentStatus && card.paymentStatus !== 'none') return true;
  
  const d = card.cardData;
  if (!d) return false;
  
  // name을 제외한 나머지 의미 있는 필드 체크
  const textFields = [
    d.nameEng, d.jobTitle, d.company, d.department,
    d.phone, d.phoneWork, d.phonePersonal, d.email, d.website,
    d.address, d.intro, d.logoUrl, d.profileUrl, d.paperCardUrl, d.customCardUrl
  ];
  
  const hasText = textFields.some(val => val && String(val).trim() !== '');
  if (hasText) return true;
  
  if (d.sns) {
    const hasSns = Object.values(d.sns).some(val => val && String(val).trim() !== '');
    if (hasSns) return true;
  }
  
  return false;
}

async function runMigration() {
  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');
  
  const cards = await Card.find({});
  console.log(`Total card documents found: ${cards.length}`);
  
  let editedCount = 0;
  let uneditedCount = 0;
  
  for (const card of cards) {
    const active = evaluateLegacyIsActive(card);
    card.isEdited = active;
    await card.save();
    
    if (active) {
      editedCount++;
    } else {
      uneditedCount++;
    }
  }
  
  console.log(`Migration Complete:`);
  console.log(`- Updated ${editedCount} cards to isEdited: true`);
  console.log(`- Updated ${uneditedCount} cards to isEdited: false`);
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

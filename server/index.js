const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// 誘몃뱾?⑥뼱 ?ㅼ젙
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ==========================================
// ?ㅼ젙: 臾댄넻???낃툑 ?뺣낫 諛?寃곗젣 ?섎떒 愿由?
// ==========================================
app.get('/api/settings/bank-info', async (req, res) => {
  try {
    const info = await Setting.findOne({ key: 'bank_transfer_info' });
    if (!info) return res.status(404).json({ message: '?ㅼ젙???놁뒿?덈떎.' });
    res.json(info.value);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

app.put('/api/settings/bank-info', async (req, res) => {
  try {
    const { description, accounts } = req.body;
    await Setting.findOneAndUpdate(
      { key: 'bank_transfer_info' },
      { value: { description, accounts } },
      { upsert: true }
    );
    res.json({ message: '臾댄넻???낃툑 ?뺣낫媛 ?낅뜲?댄듃?섏뿀?듬땲??' });
  } catch (err) {
    res.status(500).json({ message: '?낅뜲?댄듃 ?ㅽ뙣', error: err.message });
  }
});

app.get('/api/settings/payment-methods', async (req, res) => {
  try {
    let info = await Setting.findOne({ key: 'payment_methods' });
    if (!info) {
      // 珥덇린 湲곕낯媛?
      const defaultMethods = [
        {
          id: 'bank',
          name: '臾댄넻???낃툑',
          enabled: true,
          description: '?꾨옒 怨듭떇 怨꾩쥖濡??낃툑 ?좎껌 ???댁껜?댁＜?쒕㈃ ?뱀씤 泥섎━?⑸땲??',
          fields: [
            { id: '1', label: '?좏븳???, value: '110-123-456789 二쇱떇?뚯궗 ?μ뒪?몄뭅?? }
          ]
        }
      ];
      info = await Setting.create({ key: 'payment_methods', value: defaultMethods });
    }
    res.json(info.value);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

app.put('/api/settings/payment-methods', async (req, res) => {
  try {
    const methods = req.body;
    await Setting.findOneAndUpdate(
      { key: 'payment_methods' },
      { value: methods },
      { upsert: true }
    );
    res.json({ message: '寃곗젣 ?섎떒 ?뺣낫媛 ?낅뜲?댄듃?섏뿀?듬땲??' });
  } catch (err) {
    res.status(500).json({ message: '?낅뜲?댄듃 ?ㅽ뙣', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

// [DB ?곌껐 ?ㅼ젙]
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('?좑툘 WARNING: MONGODB_URI is not set. Using temporary local database.');
}

const connectionUri = MONGODB_URI || 'mongodb://127.0.0.1:27017/nextcard';

mongoose.connect(connectionUri)
  .then(() => {
    const isCloud = connectionUri.includes('mongodb+srv');
    console.log(`??MongoDB Connected: ${isCloud ? 'Cloud Atlas' : 'Local Host'}`);
  })
  .catch(err => {
    console.error('??MongoDB Connection Error:', err.message);
  });

// [?ㅽ궎留??뺤쓽]
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: String, default: 'general' },
  paymentStatus: { type: String, default: 'none' }, // 'none', 'pending', 'confirmed'
  depositorName: { type: String, default: '' },
  paymentAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '臾댄넻???낃툑' },
  requestedGrade: { type: String, default: '' },
  requestedDuration: { type: Number, default: 0 },
  paymentRequestDate: { type: Date, default: null },
  paymentDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  isEdited: { type: Boolean, default: false },
  cardData: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: {
    annual: { type: Number, default: 0 },
    threeMonths: { type: Number, default: 0 },
    twoMonths: { type: Number, default: 0 }
  },
  order: { type: Number, default: 0 },
  features: {
    allowLogo: { type: Boolean, default: false },
    allowProfile: { type: Boolean, default: true },
    allowPaperCard: { type: Boolean, default: false },
    allowCustomUrl: { type: Boolean, default: false },
    allowSinglePage: { type: Boolean, default: false },
    showAds: { type: Boolean, default: true },
    maxSnsCount: { type: Number, default: 1 },
    maxGallery: { type: Number, default: 1 },
    maxVideo: { type: Number, default: 1 },
    allowedThemes: { type: [String], default: ['modern'] }
  }
});

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, enum: ['general', 'group', 'partnership', 'other'], default: 'general' },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const networkLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  tags: { type: [String], default: [] },
  memo: { type: String, default: '' },
  metAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const cardAnalyticsSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  userId: { type: String, required: true },
  actionType: { type: String, enum: ['view', 'save_contact', 'click_link'], required: true },
  linkUrl: { type: String, default: '' },
  source: { type: String, default: 'direct' },
  createdAt: { type: Date, default: Date.now }
});

const planChangeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  prevGrade: { type: String, required: true },
  newGrade: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  changedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Card = mongoose.model('Card', cardSchema);
const Product = mongoose.model('Product', productSchema);
const Setting = mongoose.model('Setting', settingSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const NetworkLog = mongoose.model('NetworkLog', networkLogSchema);
const CardAnalytics = mongoose.model('CardAnalytics', cardAnalyticsSchema);
const PlanChange = mongoose.model('PlanChange', planChangeSchema);

// [珥덇린 ?곗씠???쒕뵫]
async function seedData() {
  try {
    // ?? ?ㅼ쨷 紐낇븿 留덉씠洹몃젅?댁뀡 諛??몃뜳???댁젣 ??
    try {
      await Card.collection.dropIndex('userId_1');
      console.log('??Dropped userId_1 unique index successfully.');
    } catch (err) {
      console.log('?뱄툘 unique index not found or already dropped.');
    }

    // 留덉뒪??愿由ъ옄 ?앹꽦
    const masterEmail = 'vikitour.boss@gmail.com';
    const masterExists = await User.findOne({ email: masterEmail });
    if (!masterExists) {
      await User.create({
        name: '留덉뒪?곗슫?곸옄',
        email: masterEmail,
        password: '99nice99!!Q', // ?ㅼ젣 ?댁쁺 ??蹂寃?沅뚯옣
        role: 'admin',
        phone: '010-0000-0000'
      });
      console.log('Master Admin seeded.');
    }

    // 湲곕낯 ?곹뭹 ?앹꽦
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      await Product.insertMany([
        { 
          id: 'general', 
          name: '?쇰컲??(Digital Only)', 
          description: '湲곕낯 ?붿???紐낇븿 湲곕뒫',
          price: { annual: 55000, threeMonths: 15000, twoMonths: 10000 },
          features: { 
            allowLogo: false, 
            allowProfile: true,
            allowPaperCard: false, 
            allowCustomUrl: false, 
            allowSinglePage: false,
            showAds: true,
            maxSnsCount: 1, 
            allowedThemes: ['modern'] 
          }
        },
        { 
          id: 'premium_nfc', 
          name: '?꾨━誘몄뾼 (NFC Card ?ы븿)', 
          description: 'NFC 移대뱶 諛곗넚 ?ы븿',
          price: { annual: 22000, threeMonths: 6000, twoMonths: 4000 },
          features: { 
            allowLogo: true, 
            allowProfile: true,
            allowPaperCard: true, 
            allowCustomUrl: true, 
            allowSinglePage: true,
            showAds: false,
            maxSnsCount: 10, 
            allowedThemes: ['modern', 'classic', 'luxury'] 
          }
        },
        { 
          id: 'corporate', 
          name: '湲곗뾽??(而ㅼ뒪? ?붿옄??', 
          description: '湲곗뾽 留욎땄??????꾩엯',
          price: { annual: 99000, threeMonths: 28000, twoMonths: 18000 },
          features: { 
            allowLogo: true, 
            allowProfile: true,
            allowPaperCard: true, 
            allowCustomUrl: true, 
            allowSinglePage: true,
            showAds: false,
            maxSnsCount: 20, 
            allowedThemes: ['modern', 'classic', 'luxury', 'corporate'] 
          }
        }
      ]);
      console.log('Default products seeded.');
    }

    // 湲곗〈 ?곹뭹??price ?꾨뱶媛 Number??寃쎌슦 媛앹껜濡??먮룞 留덉씠洹몃젅?댁뀡
    const existingProds = await Product.find({});
    for (const p of existingProds) {
      if (typeof p.price === 'number') {
        const oldPrice = p.price;
        p.price = {
          annual: oldPrice,
          threeMonths: Math.round(oldPrice * 0.3),
          twoMonths: Math.round(oldPrice * 0.2)
        };
        await p.save();
        console.log(`[MIGRATION] Migrated price object for product=${p.id}`);
      } else if (!p.price || typeof p.price !== 'object') {
        p.price = { annual: 55000, threeMonths: 15000, twoMonths: 10000 };
        await p.save();
        console.log(`[MIGRATION] Seeded default price object for product=${p.id}`);
      }
    }

    // 湲곕낯 ?ㅼ젙 ?쒕뵫
    const adSetting = await Setting.findOne({ key: 'global_ad' });
    if (!adSetting) {
      await Setting.create({
        key: 'global_ad',
        value: {
          text: '?붿???紐낇븿???덈줈??湲곗?, NextCard.kr?먯꽌 臾대즺濡??쒖옉?섏꽭??',
          link: 'https://nextcard.kr',
          bgColor: '#eff6ff',
          textColor: '#2563eb'
        }
      });
      console.log('Default ad settings seeded.');
    }

    // 臾댄넻???낃툑 ?ㅼ젙 ?쒕뵫
    const existingBankInfo = await Setting.findOne({ key: 'bank_transfer_info' });
    if (!existingBankInfo) {
      await Setting.create({
        key: 'bank_transfer_info',
        value: {
          description: '?꾨옒 ?μ뒪?몄뭅??怨듭떇 怨꾩쥖濡??낃툑 ?좎껌 ???댁껜?댁＜?쒕㈃ ?ㅼ떆媛꾩쑝濡??뱀씤 泥섎━?⑸땲??',
          accounts: [
            { id: Date.now().toString(), bank: '?좏븳???, account: '110-388-757045', owner: '理쒖쁺?? }
          ]
        }
      });
      console.log('Default bank transfer info seeded.');
    }

    // ?쒕뵫 ?섏씠吏 湲곕낯 肄섑뀗痢??쒕뵫
    const existing = await Setting.findOne({ key: 'landing_content' });
    if (!existing) {
      await Setting.create({
        key: 'landing_content',
        value: {
          nav: { logo: 'NextCard', logoSub: '.me', links: ['湲곕뒫?뚭컻', '?붽툑??] },
          hero: {
            badge: '吏??媛?ν븳 ?곌껐???쒖옉',
            title: '醫낆씠 紐낇븿 ???\n?ㅻ쭏?명븳 ?붿????꾨줈??,
            desc: '紐⑤컮???섍꼍??理쒖쟻?붾맂 ?꾨줈?꾨줈 ?섎쭔??釉뚮옖?⑹쓣 ?꾩꽦?섏꽭??\nSNS ?곕룞遺???ы듃?대━??怨듭쑀源뚯? ??踰덉뿉 媛?ν빀?덈떎.',
            primaryBtn: '吏湲??쒖옉?섍린',
            primaryBtnUrl: '/signup',
            secondaryBtn: '?쒕퉬???섎윭蹂닿린',
            secondaryBtnUrl: '#contact',
            mockupImg: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop'
          },
          features: [
            { icon: '?벑', title: '紐⑤컮??理쒖쟻??, desc: '紐⑤뱺 ?ㅻ쭏?명룿 湲곌린?먯꽌 ?꾨꼍?섍쾶 ?쒗쁽?섎뒗 諛섏쓳???붿옄?몄쓣 ?쒓났?⑸땲??' },
            { icon: '?뵕', title: '鍮좊Ⅸ 怨듭쑀', desc: 'QR 肄붾뱶, 留곹겕 ?섎굹濡??μ냼???곴??놁씠 紐낇븿???꾨떖?????덉뒿?덈떎.' },
            { icon: '?륅툘', title: '?먯쑀濡쒖슫 ?몄쭛', desc: '?몄젣 ?대뵒?쒕뱺 ?ㅼ떆媛꾩쑝濡?紐낇븿 ?댁슜???섏젙?섍퀬 愿由ы븷 ???덉뒿?덈떎.' },
            { icon: '?뱤', title: '?ㅼ떆媛??듦퀎', desc: '??紐낇븿???쇰쭏??議고쉶?섏뿀?붿?, ?대뼡 留곹겕媛 ?대┃?섏뿀?붿? ?뺤씤?섏꽭??' }
          ],
          samplesSection: {
            title: '?ㅼ뼇??紐낇븿 ?섑뵆',
            desc: '?섎쭔??媛쒖꽦???댁? ?ㅼ뼇???ㅽ??쇱쓽 紐낇븿???뺤씤??蹂댁꽭??'
          },
          samples: [
            { title: '鍮꾩쫰?덉뒪 ?ㅽ???, imgUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', linkUrl: '' },
            { title: '?꾨━?쒖꽌 ?ㅽ???, imgUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop', linkUrl: '' },
            { title: '?쇱뒪??釉뚮옖??, imgUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop', linkUrl: '' }
          ],
          partnersSection: {
            title: '二쇱슂 湲곗뾽 嫄곕옒泥?
          },
          partnersLogos: [
            { name: 'Careis', imgUrl: 'https://placehold.co/200x60/transparent/9d4edd?text=Careis' },
            { name: '?곕━泥숇퀝??, imgUrl: 'https://placehold.co/200x60/transparent/38bdf8?text=WOORI+SPINE' },
            { name: 'novita', imgUrl: 'https://placehold.co/200x60/transparent/c1121f?text=novita' },
            { name: 'EUGENE', imgUrl: 'https://placehold.co/200x60/transparent/1d3557?text=EUGENE' },
            { name: 'BAUSCH + LOMB', imgUrl: 'https://placehold.co/200x60/transparent/00b4d8?text=BAUSCH+%2B+LOMB' },
            { name: 'KSPO', imgUrl: 'https://placehold.co/200x60/transparent/f77f00?text=KSPO' }
          ],
          pricing: [
            { name: '?쇰컲??(Free)', price: '0', period: '??, features: ['湲곕낯 ?꾨줈???섏씠吏', 'QR 肄붾뱶 ?앹꽦', '留곹겕 怨듭쑀', '湲곕낯 ?뚮쭏 ?곸슜'], btn: '臾대즺濡??쒖옉', linkUrl: '/signup', popular: false },
            { name: '?꾨━誘몄뾼 (Pro)', price: '9,900', period: '??, features: ['紐⑤뱺 湲곕낯 湲곕뒫', '而ㅼ뒪? URL ?ㅼ젙', '濡쒓퀬 諛?諛곌꼍 而ㅼ뒪?', '諛⑸Ц ?듦퀎 遺꾩꽍'], btn: '吏湲?媛??, linkUrl: '/signup', popular: true },
            { name: '湲곗뾽??(Corp)', price: '臾몄쓽', period: '', features: ['?꾩궗 ?듯빀 愿由?, '湲곗뾽 ?꾩슜 ?쒗뵆由?, 'API ?곕룞 吏??, '?꾨떞 湲곗닠 吏??], btn: '?곷떞 ?좎껌', linkUrl: '#contact', popular: false }
          ],
          cta: {
            title: '吏湲?諛붾줈 ?섎쭔???붿???紐낇븿??留뚮뱾?대낫?몄슂',
            desc: '30珥덈㈃ 異⑸텇?⑸땲?? ?욎꽌媛??鍮꾩쫰?덉뒪 ?뚰듃?덇? ?섏뼱蹂댁꽭??',
            btn: '臾대즺濡??쒖옉?섍린',
            btnUrl: '/signup'
          },
          faq: {
            badge: 'FAQ',
            title: '?먯＜ 臾삳뒗 吏덈Ц',
            desc: '?붿??몃챸?⑥쓣 留뚮뱾湲??꾩뿉 ?뚯븘????紐⑤뱺 寃?',
            items: [
              { q: '?붿???紐낇븿?대? 臾댁뾿?멸???', a: '湲곗〈 醫낆씠 紐낇븿???쒓퀎瑜??섏뼱 ?ㅻ쭏?명룿?대굹 ??釉뚮씪?곗??먯꽌 諛붾줈 ?뺤씤?????덈뒗 紐⑤컮??理쒖쟻??紐낇븿?낅땲?? ?곕씫泥???? SNS ?곕룞, ?숈쁺???쎌엯 ???ㅼ뼇??湲곕뒫???쒓났?⑸땲??' },
              { q: '?붿???紐낇븿? ?대뼸寃?怨듭쑀?섎굹??', a: 'QR 肄붾뱶瑜??ㅼ틪?섍굅??怨좎쑀??留곹겕(URL)瑜?移댄넚, 臾몄옄 ?깆쑝濡??꾨떖?섏뿬 利됱떆 怨듭쑀?????덉뒿?덈떎.' },
              { q: '?뚯궗 釉뚮옖?⑹쑝濡?留욎땄 ?ㅼ젙?????덈굹??', a: '?? 濡쒓퀬 ?낅줈?? ?뚮쭏 ?됱긽 蹂寃? 諛곌꼍 ?대?吏 ?ㅼ젙 ?깆쓣 ?듯빐 湲곗뾽???뺤껜?깆쓣 ?꾨꼍?섍쾶 ?쒗쁽?????덉뒿?덈떎.' },
              { q: 'NFC 紐낇븿怨?臾댁뾿???ㅻⅨ媛??', a: '?붿???紐낇븿? ?⑤씪??湲곕컲?대ŉ, NFC 紐낇븿? 臾쇰━?곸씤 移대뱶瑜??ㅻ쭏?명룿???쒓렇?섏뿬 ?뺣낫瑜??꾨떖?섎뒗 諛⑹떇?낅땲?? ????쒕퉬?ㅻ뒗 ??諛⑹떇??紐⑤몢 吏?먰빀?덈떎.' }
            ]
          },
          reviews: {
            title: '怨좉컼?ㅼ씠 ?꾪븯??吏꾩쭨 ?댁빞湲?,
            items: [
              { rating: 5, content: '湲곗뾽??釉뚮옖??而щ윭瑜?洹몃?濡??뱀뿬?????덈뒗 而ㅼ뒪? ?먯쑀?꾧? 留뚯”?ㅻ읇?듬땲?? ?꾨줈???ъ쭊, SNS 留곹겕, ?뚯궗 ?뚭컻 ?깆쓣 源붾걫???덉씠?꾩썐?쇰줈 諛곗튂?????덉뼱 鍮꾩쫰?덉뒪 ?좊ː?꾨? ?믪씠?????꾩????⑸땲??', author: '?뺤씪??, role: '?붿??몃챸???뚯궗?? },
              { rating: 5, content: '理쒓렐 誘명똿????븘吏硫댁꽌 醫낆씠紐낇븿怨?蹂묓뻾?섏뿬 ?ъ슜?섍퀬??援щℓ?덉뒿?덈떎. QR 肄붾뱶 ?몄떇瑜좎씠 留ㅼ슦 ?곗뼱?섍퀬, ?곷?諛⑹씠 蹂꾨룄???깆쓣 ?ㅼ튂?섏? ?딆븘?????곕씫泥섏? ?ы듃?대━??留곹겕瑜?吏곴??곸쑝濡??뺤씤?????덈떎???먯씠 ??媛뺤젏?낅땲??', author: '諛뺤듅??, role: '?붿??몃챸???뚯궗?? },
              { rating: 5, content: 'ESG 寃쎌쁺怨?移쒗솚寃?鍮꾩쫰?덉뒪 ?ㅼ쿇???쇳솚?쇰줈 ?붿???紐낇븿???꾩엯?덉뒿?덈떎. 留ㅻ쾲 ?몄뇙 鍮꾩슜??吏異쒗븯吏 ?딆븘???섍퀬, 留곹겕 ?섎굹濡??섎쭖? ?좎옱 怨좉컼?먭쾶 紐낇븿???꾨떖?????덉뼱 ?κ린?곸씤 鍮꾩슜 ?덇컧 ?④낵媛 湲곕??⑸땲??', author: '?댁???, role: '醫낆씠紐낇븿/?뚯궗?? },
              { rating: 5, content: '留곹겕 ?댁뿉 ?띿뒪?몃퓧留??꾨땲??鍮꾩쫰?덉뒪 ?곸긽源뚯? ?꾨쿋?⑺븷 ???덉뼱 ?ㅺ컖?꾨줈 ????뚯궗瑜??댄븘?섍린???좎슜?⑸땲?? ?뺤쨷?섍퀬 源붾걫??鍮꾩쫰?덉뒪 ?뚰듃?덈? 留뚮궃 寃?媛숈븘 湲곗겑?덈떎.', author: '理쒖?泥?, role: '以묎퀎/?댁감?꾩??곸뾽/?뚯궗?? }
            ]
          },
          footer: {
            logo: 'NextCard',
            copyright: '짤 2026 NextCard. All rights reserved.',
            companyName: '(二??덊떚洹몃옒?쇳떚',
            ceoName: '?띻만??,
            businessNumber: '123-45-67890',
            mailOrderNumber: '2026-?쒖슱媛뺣궓-1234',
            address: '?쒖슱?밸퀎??媛뺣궓援??뚰뿤?濡?123, 4痢?,
            contact: 'support@nextcard.kr | 02-1234-5678',
            footerLinks: [
              { label: '?댁슜?쎄?', url: '/terms' },
              { label: '媛쒖씤?뺣낫泥섎━諛⑹묠', url: '/privacy' },
              { label: '?대찓?쇰Т?⑥닔吏묎굅遺', url: '/no-email' },
              { label: '怨좉컼?쇳꽣', url: '/custom-center' },
              { label: '?쒗쑕臾몄쓽', url: '/coalition' },
              { label: '?쒗쑕留덉???, url: '/marketing' },
              { label: '愿묎퀬臾몄쓽', url: '/ad-contact' }
            ],
            termsContent: `??1 議?(紐⑹쟻)\n蹂??쎄?? NextCard(?댄븯 "?뚯궗")媛 ?쒓났?섎뒗 ?붿???紐낇븿 諛?愿???쒕퉬???댄븯 "?쒕퉬??)???댁슜議곌굔 諛??덉감, ?뚯궗? ?뚯썝 媛꾩쓽 沅뚮━, ?섎Т 諛?梨낆엫?ы빆 ?깆쓣 洹쒖젙?⑥쓣 紐⑹쟻?쇰줈 ?⑸땲??\n\n??2 議?(?⑹뼱???뺤쓽)\n1. "?쒕퉬?????⑥? ?뚯궗媛 ?쒓났?섎뒗 紐⑤컮??理쒖쟻???붿???紐낇븿 ?앹꽦, 愿由?諛?怨듭쑀 ?뚮옯?쇱쓣 ?섎??⑸땲??\n2. "?뚯썝"?대씪 ?⑥? ?쒕퉬?ㅼ뿉 ?묒냽?섏뿬 蹂??쎄????숈쓽?섍퀬 怨꾩젙???앹꽦?섏뿬 ?쒕퉬?ㅻ? ?댁슜?섎뒗 怨좉컼???섎??⑸땲??\n3. "?꾨━誘몄뾼 ?쒕퉬?????⑥? ?뚯썝???좊즺濡?寃곗젣?섏뿬 ?댁슜?섎뒗 異붽??곸씤 湲곕뒫(而ㅼ뒪? URL, ?뚮쭏, 濡쒓퀬 ?쎌엯 ?????섎??⑸땲??\n\n??3 議?(?쎄????⑤젰 諛?蹂寃?\n1. 蹂??쎄?? ?쒕퉬???붾㈃??寃뚯떆?섍굅??湲고???諛⑸쾿?쇰줈 ?뚯썝?먭쾶 怨듭??⑥쑝濡쒖뜥 ?⑤젰??諛쒖깮?⑸땲??\n2. ?뚯궗??愿怨?踰뺣졊???꾨같?섏? ?딅뒗 踰붿쐞?먯꽌 蹂??쎄???媛쒖젙?????덉뒿?덈떎.\n\n??4 議?(?쒕퉬?ㅼ쓽 ?쒓났 諛?蹂寃?\n1. ?뚯궗???뚯썝?먭쾶 ?붿???紐낇븿 ?쒖옉 諛??몄뒪???쒕퉬?ㅻ? ?쒓났?⑸땲??\n2. ?쒕퉬?ㅻ뒗 ?곗쨷臾댄쑕, 1??24?쒓컙 ?쒓났?⑥쓣 ?먯튃?쇰줈 ?섎굹, ?ㅻ퉬 ?먭??대굹 ?쒖뒪???μ븷 ???쇱떆 以묐떒?????덉뒿?덈떎.`,
            privacyContent: `NextCard(?댄븯 "?뚯궗")???뺣낫?듭떊留??댁슜珥됱쭊 諛??뺣낫蹂댄샇 ?깆뿉 愿??踰뺣쪧 諛?媛쒖씤?뺣낫蹂댄샇踰???愿??踰뺣졊???곕씪 ?뚯썝??媛쒖씤?뺣낫瑜?蹂댄샇?섍퀬 ?댁? 愿?⑦븳 怨좎땐???좎냽?섍퀬 ?먰솢?섍쾶 泥섎━?????덈룄濡??ㅼ쓬怨?媛숈? 泥섎━諛⑹묠???먭퀬 ?덉뒿?덈떎.\n\n1. ?섏쭛?섎뒗 媛쒖씤?뺣낫 ??ぉ\n- ?꾩닔 ??ぉ: ?대쫫, ?대찓??二쇱냼, 鍮꾨?踰덊샇, ?대??꾪솕 踰덊샇\n- ?좏깮 ??ぉ: ?뚯궗紐? 吏곸콉, 遺?? ?뱀궗?댄듃 URL, ?꾨줈???대?吏, SNS 怨꾩젙 ?뺣낫\n- ?쒕퉬???댁슜 怨쇱젙?먯꽌 ?먮룞?쇰줈 ?앹꽦?섏뼱 ?섏쭛?섎뒗 ?뺣낫: IP 二쇱냼, 荑좏궎, 諛⑸Ц ?쇱떆, ?쒕퉬???댁슜 湲곕줉, 湲곌린 ?뺣낫\n\n2. 媛쒖씤?뺣낫???섏쭛 諛??댁슜 紐⑹쟻\n- ?뚯썝 媛??諛?愿由? ?뚯썝 ?앸퀎, 媛???섏궗 ?뺤씤, 蹂몄씤 ?뺤씤, ?쒕퉬??遺?뺤씠??諛⑹?\n- ?쒕퉬???쒓났 諛?怨꾩빟 ?댄뻾: ?붿???紐낇븿 ?앹꽦 諛??몄뒪?? ?좊즺 寃곗젣 ?뱀씤 諛??쒕퉬??愿由?n- 留덉???諛?愿묎퀬?먯쓽 ?쒖슜: ?좉퇋 ?쒕퉬??媛쒕컻 諛?留욎땄???쒕퉬???쒓났, ?대깽??諛?愿묎퀬???뺣낫 ?쒓났\n\n3. 媛쒖씤?뺣낫??蹂댁쑀 諛??댁슜 湲곌컙\n- ?뚯썝??媛쒖씤?뺣낫???먯튃?곸쑝濡?媛쒖씤?뺣낫???섏쭛 諛??댁슜 紐⑹쟻???ъ꽦?섎㈃ 吏泥??놁씠 ?뚭린?⑸땲??\n- ?? 愿怨?踰뺣졊??洹쒖젙???섑븯??蹂댁〈???꾩슂媛 ?덈뒗 寃쎌슦 ?대떦 踰뺣졊?먯꽌 ?뺥븳 湲곌컙 ?숈븞 蹂닿??⑸땲??`,
            noEmailContent: `NextCard??蹂??뱀궗?댄듃??寃뚯떆???대찓??二쇱냼媛 ?꾩옄?고렪 ?섏쭛 ?꾨줈洹몃옩?대굹 洹?諛뽰쓽 湲곗닠???μ튂瑜??댁슜?섏뿬 臾대떒?쇰줈 ?섏쭛?섎뒗 寃껋쓣 嫄곕??⑸땲??\n\n1. 蹂??쒕퉬???댁뿉??紐낇븿 ?뚯쑀?먯쓽 ?숈쓽 ?놁씠 ?대찓??二쇱냼瑜??섏쭛?섎뒗 ?됱쐞???뺣낫?듭떊留앸쾿???섑빐 泥섎쾶諛쏆쓣 ???덉뒿?덈떎.\n2. ?대? ?꾨컲??寃쎌슦 ?뺣낫?듭떊留??댁슜珥됱쭊 諛??뺣낫蹂댄샇 ?깆뿉 愿??踰뺣쪧 ??0議곗쓽2???섑븯??1泥쒕쭔 ???댄븯??踰뚭툑?뺤뿉 泥섑빐吏????덉쓬???좊뀗?섏떆湲?諛붾엻?덈떎.\n\n寃뚯떆?? 2026??5??17??,
            customerCenterContent: `NextCard 怨좉컼?쇳꽣 ?덈궡\n\n1. ?댁쁺 ?쒓컙\n- ?됱씪: ?ㅼ쟾 9??~ ?ㅽ썑 6??(?먯떖?쒓컙: 12:00 ~ 13:00)\n- 二쇰쭚 諛?怨듯쑕?? ?대Т (1:1 臾몄쓽 ?묒닔 媛??\n\n2. 臾몄쓽 諛⑸쾿\n- ?대찓?? support@nextcard.kr\n- ?꾪솕踰덊샇: 02-1234-5678\n- 移댁뭅?ㅽ넚 ?뚮윭?ㅼ튇援? @NextCard\n\n??긽 怨좉컼???낆옣?먯꽌 癒쇱? ?앷컖?섎뒗 NextCard媛 ?섍쿋?듬땲??`,
            partnershipContent: `NextCard ?쒗쑕 諛??묐젰 臾몄쓽\n\nNextCard? ?④퍡 ?덈줈??鍮꾩쫰?덉뒪 媛移섎? 留뚮뱾?닿컝 ?곸떊?곸씤 鍮꾩쫰?덉뒪 ?뚰듃?덈? 李얠뒿?덈떎.\n\n1. ?쒗쑕 遺꾩빞\n- 湲곗뾽 ?꾩쭅???⑥껜 ?꾩엯 諛??꾩궗 ?붿???紐낇븿 ?곕룞\n- ?ㅻ쭏??NFC 移대뱶 ?섎뱶?⑥뼱 ?쒖“ 諛?湲곗닠 ?쒗쑕\n- API ?곕룞 諛??몃? ?곌퀎 ?꾨줈???쒕퉬???묒뾽\n- 怨듬룞 釉뚮옖??留덉???諛??꾨줈紐⑥뀡 ?쒗쑕\n\n2. 臾몄쓽 諛??묒닔\n- ?대찓?? biz@nextcard.kr\n- ?꾪솕踰덊샇: 02-1234-5678\n\n臾몄쓽?ы빆???묒닔??二쇱떆硫??대떦 遺?쒖뿉??寃?????좎냽???곕씫?쒕━寃좎뒿?덈떎.`,
            affiliateMarketingContent: `NextCard ?쒗쑕 留덉???諛??명뵆猷⑥뼵???뚰듃??紐⑥쭛\n\nNextCard??媛移섎? ?먮━ ?뚮━怨??④퍡 ?깆옣???쒗쑕 留덉???諛??щ━?먯씠??遺꾨뱾??留롮? 愿??諛붾엻?덈떎.\n\n1. 李몄뿬 ???n- 釉붾줈洹? ?몄뒪?洹몃옩, ?좏뒠釉??깆쓣 ?댁쁺 以묒씤 ?щ━?먯씠??n- 鍮꾩쫰?덉뒪/?뚰겕/?앹궛??愿??肄섑뀗痢좊? 諛쒗뻾?섏떆??遺?n- ?먯껜 ?뚯썝?대굹 ?좎옱 怨좉컼痢듭쓣 蹂댁쑀??鍮꾩쫰?덉뒪 而ㅻ??덊떚\n\n2. ?쒕룞 ?쒗깮\n- 異붿쿇 留곹겕瑜??듯븳 ?좉퇋 媛??諛??좊즺 ?꾪솚 ??怨좎쑉??由ъ썙???쒓났\n- ?좎젣??NFC 移대뱶 ?곗꽑 泥댄뿕沅?諛?釉뚮옖??援우쫰 利앹젙\n- ?곗닔 ?뚰듃??????밸퀎 ?꾨줈紐⑥뀡 吏??n\n3. 吏??諛⑸쾿\n- ?대찓?? affiliate@nextcard.kr`,
            adInquiryContent: `NextCard 愿묎퀬 諛?諛곕꼫 寃뚯옱 臾몄쓽\n\nNextCard???몃젋?뷀븯怨??꾨Ц???덈뒗 ?ъ슜?먯링???寃잛쑝濡??섎뒗 ?ㅼ뼇??愿묎퀬 留ㅼ껜 ?붾（?섏쓣 ?쒓났?⑸땲??\n\n1. 愿묎퀬 留ㅼ껜 援ъ꽦\n- NextCard 臾대즺??紐낇븿 ?섎떒 諛곕꼫 愿묎퀬\n- ?쒕퉬?????ㅽ룿?쒖떗 ?곸뿭 諛??대깽???섏씠吏 ?곌퀎\n- ?寃잜똿 ?몄떆 ?뚮┝ 諛??대찓??留덉???吏??n\n2. ?寃??ㅻ뵒?몄뒪\n- 鍮꾩쫰?덉뒪 ?ㅽ듃?뚰궧??愿?ъ씠 留롮? 吏곸옣?? ?꾨━?쒖꽌, 1??李쎌뾽媛, ?꾨Ц吏?醫낆궗??n\n3. 愿묎퀬 ?좎껌 諛??쒖븞???붿껌\n- ?대찓?? ad@nextcard.kr\n- ?쒖븞???붿껌 ???뚯궗紐? ?대떦?먮챸, ?곕씫泥? ?щ쭩 愿묎퀬 湲곌컙 諛??덉궛??湲곗옱??二쇱떆湲?諛붾엻?덈떎.`
          }
        }
      });
      console.log('Landing content seeded.');
    } else {
      // 湲곗〈 ?곗씠?곗뿉 ?꾨뱶媛 ?놁쑝硫?異붽?
      let updated = false;
      const val = existing.value;
      if (!val.colors) {
        val.colors = {
          pageBg: '#0f172a',
          partnersBg: '#0f172a',
          primary: '#db2777',
          secondary: '#7c3aed',
          heroTitle: '#f8fafc',
          heroDesc: '#94a3b8',
          cardBg: '#1e293b',
          navBg: '#0f172a',
          ctaBg1: '#db2777',
          ctaBg2: '#7c3aed',
          footerBg: '#0f172a'
        };
        updated = true;
      } else if (!val.colors.partnersBg) {
        val.colors.partnersBg = '#0f172a';
        updated = true;
      }
      if (!val.samplesSection) {
        val.samplesSection = {
          title: '?ㅼ뼇??紐낇븿 ?섑뵆',
          desc: '?섎쭔??媛쒖꽦???댁? ?ㅼ뼇???ㅽ??쇱쓽 紐낇븿???뺤씤??蹂댁꽭??'
        };
        updated = true;
      }
      if (val.samples) {
        val.samples.forEach(s => {
          if (s.linkUrl === undefined) {
            s.linkUrl = '';
            updated = true;
          }
        });
      }
      if (val.pricing) {
        val.pricing.forEach((p, idx) => {
          if (p.linkUrl === undefined) {
            if (idx === 2) {
              p.linkUrl = '#contact';
            } else {
              p.linkUrl = '/signup';
            }
            updated = true;
          }
        });
      }
      if (val.hero) {
        if (val.hero.primaryBtnUrl === undefined) {
          val.hero.primaryBtnUrl = '/signup';
          updated = true;
        }
        if (val.hero.secondaryBtnUrl === undefined) {
          val.hero.secondaryBtnUrl = '#contact';
          updated = true;
        }
      }
      if (val.cta) {
        if (val.cta.btnUrl === undefined) {
          val.cta.btnUrl = '/signup';
          updated = true;
        }
      }
      if (!val.partnersSection) {
        val.partnersSection = {
          title: '二쇱슂 湲곗뾽 嫄곕옒泥?
        };
        updated = true;
      }
      if (!val.partnersLogos) {
        val.partnersLogos = [
          { name: 'Careis', imgUrl: 'https://placehold.co/200x60/transparent/9d4edd?text=Careis' },
          { name: '?곕━泥숇퀝??, imgUrl: 'https://placehold.co/200x60/transparent/38bdf8?text=WOORI+SPINE' },
          { name: 'novita', imgUrl: 'https://placehold.co/200x60/transparent/c1121f?text=novita' },
          { name: 'EUGENE', imgUrl: 'https://placehold.co/200x60/transparent/1d3557?text=EUGENE' },
          { name: 'BAUSCH + LOMB', imgUrl: 'https://placehold.co/200x60/transparent/00b4d8?text=BAUSCH+%2B+LOMB' },
          { name: 'KSPO', imgUrl: 'https://placehold.co/200x60/transparent/f77f00?text=KSPO' }
        ];
        updated = true;
      }
      if (!val.faq) {
        val.faq = { badge: 'FAQ', title: '?먯＜ 臾삳뒗 吏덈Ц', desc: '紐⑤뱺 寃?', items: [] };
        updated = true;
      }
      if (!val.reviews) {
        val.reviews = { title: '?꾧린', items: [] };
        updated = true;
      }
      if (!val.footer.companyName) {
        val.footer = {
          ...val.footer,
          companyName: '(二??덊떚洹몃옒?쇳떚',
          ceoName: '??쒖옄紐?,
          businessNumber: '?ъ뾽?먮쾲??,
          address: '?뚯궗 二쇱냼',
          contact: '?곕씫泥??뺣낫'
        };
        updated = true;
      }
      if (!val.footer.mailOrderNumber) {
        val.footer.mailOrderNumber = '?듭떊?먮ℓ?낆떊怨좊쾲??;
        updated = true;
      }
      if (!val.footer.footerLinks) {
        val.footer.footerLinks = [
          { label: '?댁슜?쎄?', url: '#' },
          { label: '媛쒖씤?뺣낫泥섎━諛⑹묠', url: '#' },
          { label: '?대찓?쇰Т?⑥닔吏묎굅遺', url: '#' },
          { label: '怨좉컼?쇳꽣', url: '#' },
          { label: '?쒗쑕臾몄쓽', url: '#' }
        ];
        updated = true;
      }
      if (updated) {
        await Setting.findOneAndUpdate({ key: 'landing_content' }, { value: val });
        console.log('Landing content updated with new fields.');
      }
    }
    // 紐낇븿 ?쒕뵫 ?섏씠吏 湲곕낯 肄섑뀗痢??쒕뵫
    const existingNamecard = await Setting.findOne({ key: 'namecard_landing_content' });
    if (!existingNamecard) {
      await Setting.create({
        key: 'namecard_landing_content',
        value: {
          purchaseLink: 'https://adq.kr/products/high-end-namecard?page=1',
          mainImage: 'https://images.unsplash.com/photo-1589041127529-fcece6f31899?q=80&w=800&auto=format&fit=crop',
          thumbnails: [
            'https://images.unsplash.com/photo-1616628188540-3532f8149eb4?q=80&w=200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1616628188550-808682f32255?q=80&w=200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1544391696-1c4943717540?q=80&w=200&auto=format&fit=crop'
          ],
          title: '?섏엯吏 ?섏씠?붾뱶 紐낇븿',
          subtitle: '泥レ씤?곸쓣 寃곗젙吏볥뒗 ?꾨꼍???뷀뀒?? 理쒓퀬湲??섏엯吏濡??쒖옉?섎뒗 ?꾨━誘몄뾼 紐낇븿?낅땲??',
          price: '22,000',
          specs: [
            { icon: 'Check', label: '吏吏?, desc: '?묒뒪?몃씪 ?꾨툕, ?ㅻ삉?덈삉, ?묐뜲酉???理쒓퀬湲??섏엯吏 ?좏깮 媛?? },
            { icon: 'Check', label: '?먭퍡', desc: '350g ?댁긽??臾듭쭅?섍퀬 怨좉툒?ㅻ윭???먭퍡媛? },
            { icon: 'Check', label: '?꾧?怨?, desc: '諛?湲덈컯/?諛?癒밸컯), ?뺤븬, ?먰룺????而ㅼ뒪? 媛怨?吏?? },
            { icon: 'Check', label: '?쒖옉湲곌컙', desc: '?쒖븞 ?뺤젙 ???곸뾽??湲곗? 2~3???뚯슂' }
          ]
        }
      });
      console.log('Default namecard landing content seeded.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}
seedData();

// [API ?쇱슦??

// ?뚯썝媛??
app.post('/api/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: '?대? 媛?낅맂 ?대찓?쇱엯?덈떎.' });
    
    const user = await User.create({ name, email, password, phone });
    res.json({ message: '?뚯썝媛???깃났', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: '?뚯썝媛??以??ㅻ쪟 諛쒖깮' });
  }
});

// 濡쒓렇??
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: '?대찓???먮뒗 鍮꾨?踰덊샇媛 ??몄뒿?덈떎.' });
    
    res.json({
      message: '濡쒓렇???깃났',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
    });
  } catch (err) {
    res.status(500).json({ message: '濡쒓렇??以??ㅻ쪟 諛쒖깮' });
  }
});

// 鍮꾨?踰덊샇 李얘린 (?꾩떆)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: '?대떦 ?대찓?쇰줈 媛?낅맂 ?뚯썝???놁뒿?덈떎.' });
    res.json({ message: '鍮꾨?踰덊샇 李얘린 硫붿씪??諛쒖넚?섏뿀?듬땲?? (?쒕??덉씠??', password: user.password });
  } catch (err) {
    res.status(500).json({ message: '?ㅻ쪟 諛쒖깮' });
  }
});

// ?ъ슜???꾨줈??議고쉶
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: '?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎.' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// ?ъ슜???꾨줈???섏젙 (?대쫫, ?곕씫泥?
app.put('/api/user/:userId', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, phone },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: '?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎.' });
    
    // ?ъ슜?먯쓽 紐낇븿 ?곗씠????媛쒖씤 ?뺣낫???먮룞 ?숆린??
    await Card.updateMany(
      { userId: req.params.userId },
      { 
        $set: { 
          "cardData.name": name, 
          "cardData.phonePersonal": phone 
        } 
      }
    );

    res.json({
      message: '?섏젙 ?꾨즺',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: '?섏젙 ?ㅽ뙣', error: err.message });
  }
});

// ?ъ슜??鍮꾨?踰덊샇 蹂寃?
app.put('/api/user/:userId/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: '?ъ슜?먮? 李얠쓣 ???놁뒿?덈떎.' });
    
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: '?꾩옱 鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎.' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: '鍮꾨?踰덊샇 蹂寃??꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '鍮꾨?踰덊샇 蹂寃??ㅽ뙣', error: err.message });
  }
});

// ?쒖꽦 紐낇븿 ?먮퀎 ?ы띁 ?⑥닔 (?댁슜??議댁옱?섍굅???붽툑??寃곗젣?대젰???덉쑝硫??쒖꽦)
function isCardActive(card) {
  if (!card) return false;
  
  // 1. ?깃툒???쇰컲???꾨땲嫄곕굹, 寃곗젣/?낃툑 ?湲???寃곗젣 愿???≪뀡???덈뒗 寃쎌슦 ?쒖꽦 ?곹깭濡?媛꾩＜
  if (card.grade && card.grade !== 'general') return true;
  if (card.paymentStatus && card.paymentStatus !== 'none') return true;
  
  // 2. isEdited ?꾨뱶媛 紐낆떆?곸쑝濡?議댁옱?섎뒗 寃쎌슦 理쒖슦?좎쑝濡??쒖꽦 ?곹깭 ?щ? 寃곗젙
  if (card.isEdited === true) return true;
  if (card.isEdited === false) return false;
  
  // 3. isEdited媛 undefined???덇굅??移대뱶??寃쎌슦 fallback 寃??(?대쫫 蹂寃??숆린?붾줈 ?명븳 以묐났 ?먮떒 諛⑹?瑜??꾪빐 d.name? ?쒖쇅)
  const d = card.cardData;
  if (!d) return false;
  
  const textFields = [
    d.nameEng, d.jobTitle, d.company, d.department,
    d.phone, d.phoneWork, d.phonePersonal, d.email, d.website,
    d.address, d.intro, d.logoUrl, d.profileUrl, d.paperCardUrl, d.customCardUrl
  ];
  
  const hasText = textFields.some(val => val && String(val).trim() !== '');
  if (hasText) return true;
  
  // SNS 梨꾨꼸???섎굹?쇰룄 ?낅젰?섏뼱 ?덈뒗吏 寃??
  if (d.sns) {
    const hasSns = Object.values(d.sns).some(val => val && String(val).trim() !== '');
    if (hasSns) return true;
  }
  
  return false;
}

// 以묐났 ?앹꽦 諛⑹?瑜??꾪븳 ?숈떆???쒖뼱 ??媛앹껜
const creationLocks = new Map();

// 紐낇븿 ?곗씠??議고쉶 (Legacy - ?⑥씪 移대뱶 ?곗씠??諛섑솚)
app.get('/api/card/:userId', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.params.userId });
    const activeCard = cards.find(isCardActive);
    if (activeCard) res.json(activeCard.cardData);
    else res.status(404).json({ message: '紐낇븿 ?뺣낫媛 ?놁뒿?덈떎.' });
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣' });
  }
});

// ?꾩껜 紐낇븿 紐⑸줉 議고쉶 (諛곗뿴 諛섑솚)
app.get('/api/cards/:userId', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.params.userId });
    const activeCards = cards.filter(isCardActive);
    res.json(activeCards);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// OG ?몃꽕?쇱슜 Base64 ?대?吏 ?뚮뜑留??붾뱶?ъ씤??
app.get('/api/card/image/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { type } = req.query; // 'paper', 'profile', 'logo'

    const cleanIdentifier = identifier.replace(/\.(png|jpg|jpeg)$/i, '');
    let card = await Card.findOne({ 'cardData.customCardUrl': cleanIdentifier });
    if (!card && mongoose.Types.ObjectId.isValid(cleanIdentifier)) {
      card = await Card.findOne({
        $or: [
          { _id: new mongoose.Types.ObjectId(cleanIdentifier) },
          { userId: new mongoose.Types.ObjectId(cleanIdentifier) }
        ]
      });
    }

    if (!card) return res.status(404).send('Not found');

    let base64String = '';
    if (type === 'paper') base64String = card.cardData?.paperCardUrl;
    else if (type === 'profile') base64String = card.cardData?.profileUrl;
    else if (type === 'logo') base64String = card.cardData?.logoUrl;

    if (!base64String || !String(base64String).startsWith('data:image/')) {
      return res.redirect('https://nextcard.kr/og_preview.png');
    }

    const matches = String(base64String).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).send('Invalid image format');
    }

    const contentType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(imageBuffer);
  } catch (err) {
    console.error('Image Render Error:', err);
    res.status(500).send('Server Error');
  }
});

// 紐낇븿 VCF ?뚯씪 吏곸젒 ?ㅼ슫濡쒕뱶 (?덈뱶濡쒖씠??釉뚮씪?곗? 踰꾧렇 ?고쉶??
app.get('/api/card/vcf/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanIdentifier = identifier.replace(/\.vcf$/i, '');
    let card = null;

    // card view? ?숈씪?섍쾶: 而ㅼ뒪? URL 癒쇱?, 洹??ㅼ쓬 ObjectId濡?寃??
    card = await Card.findOne({ 'cardData.customCardUrl': cleanIdentifier });
    if (!card && mongoose.Types.ObjectId.isValid(cleanIdentifier)) {
      card = await Card.findOne({
        $or: [
          { _id: new mongoose.Types.ObjectId(cleanIdentifier) },
          { userId: new mongoose.Types.ObjectId(cleanIdentifier) }
        ]
      });
    }

    if (!card) {
      return res.status(404).send('紐낇븿??李얠쓣 ???놁뒿?덈떎.');
    }

    const d = card.cardData || {};
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${d.name || ''};;;;`,
      `FN:${d.name || ''}`
    ];
    
    if (d.company || d.department) {
      const orgStr = [d.company || '', d.department || ''].filter(Boolean).join(';');
      lines.push(`ORG:${orgStr}`);
    }
    if (d.jobTitle)      lines.push(`TITLE:${d.jobTitle}`);
    if (d.phoneWork)     lines.push(`TEL;TYPE=WORK:${d.phoneWork}`);
    if (d.phonePersonal) lines.push(`TEL;TYPE=CELL:${d.phonePersonal}`);
    if (d.email)         lines.push(`EMAIL:${d.email}`);
    if (d.website)       lines.push(`URL:${d.website}`);
    if (d.address)       lines.push(`ADR;TYPE=WORK:;;${String(d.address).replace(/;/g, ' ').replace(/\r?\n/g, ' ')};;;;`);
    if (d.intro)         lines.push(`NOTE:${String(d.intro).replace(/\r?\n/g, '\\n')}`);
    
    // SNS 異붽?
    if (d.sns) {
      Object.entries(d.sns).forEach(([platform, value]) => {
        if (value) {
          const url = String(value).startsWith('http') ? value : (platform === 'kakaotalk' ? `https://pf.kakao.com/${value}` : `https://${platform}.com/${value}`);
          lines.push(`URL;type=${platform}:${url}`);
        }
      });
    }
    
    lines.push('END:VCARD');

    const vcf = lines.join('\r\n') + '\r\n';

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    const safeName = encodeURIComponent(d.name || 'contact');
    res.setHeader('Content-Disposition', `attachment; filename="contact.vcf"; filename*=UTF-8''${safeName}.vcf`);
    res.send(Buffer.from(vcf, 'utf-8'));
  } catch (err) {
    console.error('VCF ?앹꽦 ?ㅻ쪟:', err);
    res.status(500).send('?쒕쾭 ?ㅻ쪟: ' + err.message);
  }
});

// ?좉퇋 紐낇븿 媛쒖꽕
app.post('/api/card/create', async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ message: '?ъ슜??ID媛 ?꾩슂?⑸땲??' });
    }

    // ?숈떆 ?붿껌 ???띾뱷 ?湲?(理쒕? 10珥??湲?
    const lockKey = String(userId);
    let attempts = 0;
    while (creationLocks.has(lockKey) && attempts < 200) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    creationLocks.set(lockKey, true);

    try {
      // 1. 湲곗〈 鍮꾪솢???몄쭛?섏? ?딆? 鍮? 紐낇븿 紐⑸줉 議고쉶
      const existingCards = await Card.find({ userId: new mongoose.Types.ObjectId(userId) });
      const inactiveCards = existingCards.filter(c => !isCardActive(c));

      // 2. 鍮꾪솢??紐낇븿???섎굹?쇰룄 議댁옱?쒕떎硫?洹멸쾬???ъ궗??
      if (inactiveCards.length > 0) {
        const keepCard = inactiveCards[0];
        
        // 3. 留뚯빟 鍮꾪솢??鍮? 紐낇븿??2媛??댁긽?대씪硫? 以묐났 ?앹꽦??寃껋씠誘濡?泥?踰덉㎏留??④린怨??섎㉧吏???붾퉬?먯꽌 ?곴뎄 ??젣
        if (inactiveCards.length > 1) {
          const idsToDelete = inactiveCards.slice(1).map(c => c._id);
          await Card.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`[CLEANUP] Deleted ${idsToDelete.length} duplicate blank cards for user ${userId}`);
        }
        
        return res.json(keepCard);
      }

      // 4. 鍮꾪솢??紐낇븿???꾪? ?녿떎硫??좉퇋 ?앹꽦
      const newCard = await Card.create({
        userId: new mongoose.Types.ObjectId(userId),
        grade: 'general',
        paymentStatus: 'none',
        cardData: {
          name: '',
          nameEng: '',
          jobTitle: '',
          company: '',
          department: '',
          phone: '',
          phoneWork: '',
          phonePersonal: '',
          email: '',
          website: '',
          address: '',
          intro: '',
          status: 'draft',
          themeColor: '#db2777',
          theme: 'modern'
        }
      });
      res.json(newCard);
    } finally {
      // ???댁젣
      creationLocks.delete(lockKey);
    }
  } catch (err) {
    res.status(500).json({ message: '紐낇븿 ?앹꽦 ?ㅽ뙣', error: err.message });
  }
});

// 紐낇븿 ??젣
app.delete('/api/card/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    // 愿?⑤맂 ?듦퀎 湲곕줉???④퍡 ??젣
    if (mongoose.models.CardAnalytics) {
      await mongoose.models.CardAnalytics.deleteMany({ cardId: req.params.cardId });
    }
    res.json({ message: '紐낇븿????젣?섏뿀?듬땲??' });
  } catch (err) {
    res.status(500).json({ message: '紐낇븿 ??젣 ?ㅽ뙣', error: err.message });
  }
});

// 紐낇븿 ?곸꽭 ?뺣낫 議고쉶
app.get('/api/card-detail/:cardId', async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// 紐낇븿 ?곸꽭 ?뺣낫 ????섏젙
app.post('/api/card/save/:cardId', async (req, res) => {
  const { cardData } = req.body;
  try {
    const existingCard = await Card.findById(req.params.cardId);
    if (!existingCard) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });

    let newGrade = existingCard.grade;
    let gradeChanged = false;
    
    // 利됱떆 ?곕룞: ?ъ슜?먭? ?몄쭛湲곗뿉???붽툑?쒕? 諛붽엥?ㅻ㈃ DB grade??利됱떆 蹂寃?
    if (cardData && cardData.productType && cardData.productType !== existingCard.grade) {
      newGrade = cardData.productType;
      gradeChanged = true;
    }

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { cardData, grade: newGrade, isEdited: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (gradeChanged) {
      await PlanChange.create({
        userId: existingCard.userId,
        cardId: existingCard._id,
        prevGrade: existingCard.grade,
        newGrade: newGrade
      });
    }

    res.json({ message: '紐낇븿 ?뺣낫媛 ?덉쟾?섍쾶 ??λ릺?덉뒿?덈떎.', cardData: card.cardData });
  } catch (err) {
    res.status(500).json({ message: '????ㅽ뙣', error: err.message });
  }
});

// 紐낇븿 諛쒗뻾 (URL ?좊떦) - 紐낇븿 媛쒕퀎 諛쒗뻾
app.put('/api/admin/cards/:cardId/publish', async (req, res) => {
  const { customCardUrl, status } = req.body;
  try {
    if (customCardUrl) {
      const existingCard = await Card.findOne({ 
        "cardData.customCardUrl": customCardUrl, 
        _id: { $ne: req.params.cardId } 
      });
      if (existingCard) {
        return res.status(400).json({ message: '?대? ?ъ슜 以묒씤 URL?낅땲?? ?ㅻⅨ URL???낅젰?댁＜?몄슂.' });
      }
    }

    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    
    card.cardData = card.cardData || {};
    card.cardData.customCardUrl = customCardUrl;
    card.cardData.status = status || 'published';
    await card.save();
    res.json({ message: '紐낇븿??諛쒗뻾?섏뿀?듬땲??', card });
  } catch (err) {
    res.status(500).json({ message: '諛쒗뻾 ?ㅽ뙣', error: err.message });
  }
});

// 紐낇븿 ?곗씠??????섏젙 (Legacy)
app.post('/api/card', async (req, res) => {
  const { userId, cardData } = req.body;
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] Card Save Request - UserID: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ message: '?ъ슜??ID媛 ?놁뒿?덈떎.' });
    }

    const updatedCard = await Card.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { 
        cardData, 
        isEdited: true,
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );
    
    console.log(`[${timestamp}] Card Save Success - UserID: ${userId}`);
    res.json({ message: '紐낇븿 ?뺣낫媛 ?덉쟾?섍쾶 ??λ릺?덉뒿?덈떎.', cardData: updatedCard.cardData });
  } catch (err) {
    console.error(`[${timestamp}] Card Save Error:`, err.message);
    res.status(500).json({ message: '????ㅽ뙣', error: err.message });
  }
});

// 而ㅼ뒪? URL ?먮뒗 ?ъ슜??ID濡?紐낇븿 議고쉶 (怨듦컻??
app.get('/api/card/view/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    let card = null;
    
    // 1. 而ㅼ뒪? URL濡?癒쇱? 寃??
    card = await Card.findOne({ "cardData.customCardUrl": identifier });
    
    // 2. 寃??寃곌낵媛 ?녾퀬 identifier媛 ?좏슚??ObjectId ?뺤떇?대㈃ ID濡?寃??(誘몃━蹂닿린??
    if (!card && mongoose.Types.ObjectId.isValid(identifier)) {
      card = await Card.findOne({
        $or: [
          { _id: new mongoose.Types.ObjectId(identifier) },
          { userId: new mongoose.Types.ObjectId(identifier) }
        ]
      });
    }

    if (card) {
      // PublicCard ?먯꽌 ?깃툒(grade)蹂?愿묎퀬 ?몄텧 ?щ? ?깆쓣 ?먮떒?????덈룄濡?productType 二쇱엯
      const responseData = Object.assign({}, card.cardData, { productType: card.grade || 'general' });
      res.json(responseData);
    } else {
      res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    }
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// 臾댄넻???낃툑// ==========================================
// [?몃㎘濡쒓렇 (Network Log) API]
// ==========================================

// ?몃㎘ 議고쉶
app.get('/api/logs/:userId', async (req, res) => {
  try {
    const logs = await NetworkLog.find({ userId: req.params.userId }).sort({ metAt: -1, createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: '?몃㎘ 議고쉶 ?ㅽ뙣' });
  }
});

// ?몃㎘ 異붽?
app.post('/api/logs', async (req, res) => {
  try {
    const { userId, name, company, position, phone, email, tags, memo, metAt } = req.body;
    const log = await NetworkLog.create({
      userId, name, company, position, phone, email, tags, memo, metAt
    });
    res.json({ message: '?몃㎘??異붽??섏뿀?듬땲??', log });
  } catch (err) {
    res.status(500).json({ message: '?몃㎘ 異붽? ?ㅽ뙣', error: err.message });
  }
});

// ?몃㎘ ?섏젙
app.put('/api/logs/:id', async (req, res) => {
  try {
    const log = await NetworkLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: '?섏젙 ?꾨즺', log });
  } catch (err) {
    res.status(500).json({ message: '?섏젙 ?ㅽ뙣' });
  }
});

// ?몃㎘ ??젣
app.delete('/api/logs/:id', async (req, res) => {
  try {
    await NetworkLog.findByIdAndDelete(req.params.id);
    res.json({ message: '??젣 ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '??젣 ?ㅽ뙣' });
  }
});

// 臾댄넻?μ엯湲?諛섎젮
app.put('/api/admin/payment/reject/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      {
        paymentStatus: 'none',
        depositorName: '',
        paymentAmount: 0,
        paymentMethod: '臾댄넻???낃툑',
        requestedGrade: '',
        requestedDuration: 0,
        paymentRequestDate: null
      },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    res.json({ message: '諛섎젮 泥섎━ ?꾨즺', card });
  } catch (err) {
    res.status(500).json({ message: '諛섎젮 ?ㅽ뙣', error: err.message });
  }
});

// ==========================================
// [?듦퀎遺꾩꽍 (Analytics) API]
// ==========================================

// ?대깽??異붿쟻 湲곕줉 (PublicCard?먯꽌 ?몄텧)
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { cardId, userId, actionType, linkUrl, source } = req.body;
    await CardAnalytics.create({
      cardId,
      userId,
      actionType,
      linkUrl: linkUrl || '',
      source: source || 'direct'
    });
    res.json({ success: true });
  } catch (err) {
    // ?몃옒???먮윭???대씪?댁뼵?몄뿉 500??二쇱? ?딄퀬 議곗슜???섏뼱媛??寃껋씠 醫뗭쓬
    console.error('Analytics tracking error:', err);
    res.status(200).json({ success: false });
  }
});

// ?듦퀎 ?곗씠??吏묎퀎 議고쉶 (Analytics ??쒕낫?쒖슜)
app.get('/api/analytics/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // 1. ?꾩껜 ?붿빟 吏??
    const totalViews = await CardAnalytics.countDocuments({ userId, actionType: 'view' });
    const totalSaves = await CardAnalytics.countDocuments({ userId, actionType: 'save_contact' });
    
    // 2. ?좎쭨蹂?議고쉶??(理쒓렐 30??
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const viewsByDate = await CardAnalytics.aggregate([
      { $match: { userId: String(userId), actionType: 'view', createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. ?좎엯 寃쎈줈 (Source) 鍮꾩쑉
    const sourceStats = await CardAnalytics.aggregate([
      { $match: { userId: String(userId), actionType: 'view' } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 4. 留곹겕 ?대┃ ?쒖쐞
    const linkStats = await CardAnalytics.aggregate([
      { $match: { userId: String(userId), actionType: 'click_link' } },
      { $group: { _id: "$linkUrl", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: { totalViews, totalSaves },
      viewsByDate,
      sourceStats,
      linkStats
    });
  } catch (err) {
    res.status(500).json({ message: '?듦퀎 議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// [寃곗젣 API]
app.post('/api/payment/request', async (req, res) => {
  const { cardId, depositorName, paymentAmount, paymentMethod, requestedGrade, requestedDuration } = req.body;
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      {
        paymentStatus: 'pending',
        depositorName,
        paymentAmount,
        paymentMethod: paymentMethod || '臾댄넻???낃툑',
        requestedGrade,
        requestedDuration,
        paymentRequestDate: new Date()
      },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    res.json({ message: '臾댄넻???낃툑 ?좎껌 ?꾨즺', card });
  } catch (err) {
    res.status(500).json({ message: '?좎껌 ?ㅽ뙣', error: err.message });
  }
});

// [?곹뭹 API]
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// [Admin API]

// ?꾩껜 紐낇븿 紐⑸줉 (?ъ슜???뺣낫 ?ы븿)
app.get('/api/admin/cards', async (req, res) => {
  try {
    const cards = await Card.find().populate('userId', 'name email');
    const activeCards = cards.filter(isCardActive);
    const result = activeCards.map(c => ({
      _id: c._id,
      userId: c.userId?._id,
      userName: c.userId?.name || (c.cardData?.name || '?뚯닔?놁쓬'),
      userEmail: c.userId?.email || (c.cardData?.email || '?대찓???놁쓬'),
      cardData: c.cardData,
      updatedAt: c.updatedAt
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);
    const allCards = await Card.find({ userId: { $in: userIds } });

    const safeUsers = users.map(u => {
      const userCards = allCards.filter(c => String(c.userId) === String(u._id) && isCardActive(c));
      const primaryCard = userCards[0];
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        userCards: userCards,
        grade: primaryCard ? primaryCard.grade : 'general',
        expiryDate: primaryCard ? primaryCard.expiryDate : null,
        paymentStatus: primaryCard ? primaryCard.paymentStatus : 'none',
        paymentDate: primaryCard ? primaryCard.paymentDate : null
      };
    });
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// ?뚯썝 沅뚰븳 ?섏젙
app.put('/api/admin/user/:userId/role', async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (user.email === 'vikitour.boss@gmail.com') return res.status(403).json({ message: '留덉뒪??怨꾩젙 ?섏젙 遺덇?' });
    
    user.role = role;
    await user.save();
    res.json({ message: '沅뚰븳 ?섏젙 ?꾨즺', role });
  } catch (err) {
    res.status(500).json({ message: '?섏젙 ?ㅽ뙣' });
  }
});

// ?뚯썝 ?뺣낫 ?섏젙
app.put('/api/admin/user/:userId', async (req, res) => {
  const { name, email, phone, role, grade, expiryDate, paymentStatus, paymentDate, paymentMethod } = req.body;
  try {
    // 1. ?좎? ?뺣낫 ?낅뜲?댄듃
    await User.findByIdAndUpdate(req.params.userId, { name, email, phone, role });
    
    // 2. 移대뱶 ?뺣낫 ?낅뜲?댄듃
    const cardUpdate = {};
    if (grade !== undefined) cardUpdate.grade = grade;
    if (expiryDate !== undefined) cardUpdate.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (paymentStatus !== undefined) cardUpdate.paymentStatus = paymentStatus;
    if (paymentDate !== undefined) cardUpdate.paymentDate = paymentDate ? new Date(paymentDate) : null;
    if (paymentMethod !== undefined) cardUpdate.paymentMethod = paymentMethod;
    
    if (Object.keys(cardUpdate).length > 0) {
      const cards = await Card.find({ userId: new mongoose.Types.ObjectId(req.params.userId) });
      const activeCard = cards.find(isCardActive) || cards[0];
      if (activeCard) {
        await Card.findByIdAndUpdate(activeCard._id, { $set: cardUpdate });
        
        // Admin grade change log
        if (grade !== undefined && grade !== activeCard.grade) {
          await PlanChange.create({
            userId: activeCard.userId,
            cardId: activeCard._id,
            prevGrade: activeCard.grade,
            newGrade: grade
          });
        }
      } else {
        await Card.create({
          userId: new mongoose.Types.ObjectId(req.params.userId),
          ...cardUpdate
        });
      }
    }
    
    res.json({ message: '?섏젙 ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '?섏젙 ?ㅽ뙣', error: err.message });
  }
});

// 臾댄넻???낃툑 ?뱀씤
app.put('/api/admin/payment/approve/:cardId', async (req, res) => {
  const { duration } = req.body;
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    
    const months = duration || card.requestedDuration || 12;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    
    card.grade = card.requestedGrade || 'premium_nfc';
    card.paymentStatus = 'confirmed';
    card.paymentDate = new Date();
    card.expiryDate = expiryDate;
    
    await card.save();
    res.json({ message: '?뱀씤 ?꾨즺', card });
  } catch (err) {
    res.status(500).json({ message: '?뱀씤 ?ㅽ뙣', error: err.message });
  }
});

// 臾댄넻???낃툑 諛섎젮
app.put('/api/admin/payment/reject/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      {
        paymentStatus: 'none',
        depositorName: '',
        paymentAmount: 0,
        requestedGrade: '',
        requestedDuration: 0,
        paymentRequestDate: null
      },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: '紐낇븿??李얠쓣 ???놁뒿?덈떎.' });
    res.json({ message: '諛섎젮 ?꾨즺', card });
  } catch (err) {
    res.status(500).json({ message: '諛섎젮 ?ㅽ뙣', error: err.message });
  }
});

// ?대뱶誘??뚮┝ ??議고쉶 (?湲?紐낇븿, ?좉퇋 臾몄쓽)
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const pendingCardsCount = await Card.countDocuments({ paymentStatus: 'pending' });
    const newInquiriesCount = await Inquiry.countDocuments({ isRead: false });
    const newPlanChangesCount = await PlanChange.countDocuments({ isRead: false });
    res.json({
      pendingCards: pendingCardsCount,
      newInquiries: newInquiriesCount,
      newPlanChanges: newPlanChangesCount
    });
  } catch (err) {
    res.status(500).json({ message: '?뚮┝ 議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// ?쒗쑕 諛??꾩엯 臾몄쓽 紐⑸줉 議고쉶
app.get('/api/admin/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: '議고쉶 ?ㅽ뙣', error: err.message });
  }
});

// 臾몄쓽?ы빆 ?쎌쓬 泥섎━
app.put('/api/admin/inquiry/:id/read', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!inquiry) return res.status(404).json({ message: '臾몄쓽瑜?李얠쓣 ???놁뒿?덈떎.' });
    res.json({ message: '?쎌쓬 泥섎━ ?꾨즺', inquiry });
  } catch (err) {
    res.status(500).json({ message: '泥섎━ ?ㅽ뙣', error: err.message });
  }
});

// ==========================================
// 愿由ъ옄 ?붽툑 蹂寃??댁뿭
// ==========================================
app.get('/api/admin/plan-changes', async (req, res) => {
  try {
    const changes = await PlanChange.find({})
      .populate('userId', 'name email phone')
      .populate('cardId', 'cardData')
      .sort({ changedAt: -1 })
      .limit(100);
    res.json(changes);
  } catch (err) {
    res.status(500).json({ message: '?붽툑 蹂寃??댁뿭 議고쉶 ?ㅽ뙣', error: err.message });
  }
});

app.put('/api/admin/plan-changes/read', async (req, res) => {
  try {
    await PlanChange.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ message: '紐⑤뱺 ?뚮┝ ?쎌쓬 泥섎━ ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '?뚮┝ ?곹깭 ?낅뜲?댄듃 ?ㅽ뙣', error: err.message });
  }
});

// ==========================================
// 愿由ъ옄 ?붽툑 蹂寃??댁뿭
// ==========================================
app.get('/api/admin/plan-changes', async (req, res) => {
  try {
    const changes = await PlanChange.find({})
      .populate('userId', 'name email phone')
      .populate('cardId', 'cardData')
      .sort({ changedAt: -1 })
      .limit(100);
    res.json(changes);
  } catch (err) {
    res.status(500).json({ message: '?붽툑 蹂寃??댁뿭 議고쉶 ?ㅽ뙣', error: err.message });
  }
});

app.put('/api/admin/plan-changes/read', async (req, res) => {
  try {
    await PlanChange.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ message: '紐⑤몢 ?쎌쓬 泥섎━ ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '?곹깭 ?낅뜲?댄듃 ?ㅽ뙣', error: err.message });
  }
});

// ?붽툑 蹂寃??댁뿭 ??젣
app.delete('/api/admin/plan-changes/:id', async (req, res) => {
  try {
    await PlanChange.findByIdAndDelete(req.params.id);
    res.json({ message: '??젣 ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '??젣 ?ㅽ뙣', error: err.message });
  }
});

// 臾몄쓽?ы빆 ??젣
app.delete('/api/admin/inquiry/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: '臾몄쓽瑜?李얠쓣 ???놁뒿?덈떎.' });
    res.json({ message: '??젣 ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '??젣 ?ㅽ뙣', error: err.message });
  }
});

// ?뚯썝 ??젣
app.delete('/api/admin/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user.email === 'vikitour.boss@gmail.com') return res.status(403).json({ message: '留덉뒪????젣 遺덇?' });
    
    await User.findByIdAndDelete(req.params.userId);
    await Card.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: '??젣 ?꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '??젣 ?ㅽ뙣' });
  }
});

// ?곹뭹 愿由?
app.get('/api/admin/products', async (req, res) => {
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// ?곹뭹 ?쒖꽌 蹂寃?
app.put('/api/admin/products/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    const promises = orderedIds.map((id, index) => 
      Product.findOneAndUpdate({ id }, { order: index })
    );
    await Promise.all(promises);
    res.json({ message: '?쒖꽌 蹂寃??꾨즺' });
  } catch (err) {
    res.status(500).json({ message: '?쒖꽌 蹂寃??ㅽ뙣' });
  }
});

app.post('/api/admin/products', async (req, res) => {
  const { name, description, price, features } = req.body;
  const product = await Product.create({ 
    id: 'prod_' + Date.now(), 
    name, 
    description,
    price: price || { annual: 0, threeMonths: 0, twoMonths: 0 },
    order: await Product.countDocuments(),
    features: features || { 
      allowLogo: false, 
      allowProfile: true,
      allowPaperCard: false, 
      allowCustomUrl: false, 
      allowSinglePage: false,
      maxSnsCount: 1,
      allowedThemes: ['modern']
    }
  });
  res.json(product);
});

app.put('/api/admin/products/:id', async (req, res) => {
  const { name, description, price, features } = req.body;
  await Product.findOneAndUpdate({ id: req.params.id }, { 
    name, 
    description, 
    price: price || { annual: 0, threeMonths: 0, twoMonths: 0 }, 
    features 
  });
  res.json({ message: '?섏젙 ?꾨즺' });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  await Product.findOneAndDelete({ id: req.params.id });
  res.json({ message: '??젣 ?꾨즺' });
});

// [?ㅼ젙 API]
app.get('/api/settings/ad', async (req, res) => {
  const setting = await Setting.findOne({ key: 'global_ad' });
  res.json(setting ? setting.value : {});
});

app.put('/api/admin/settings/ad', async (req, res) => {
  const { text, link, bgColor, textColor } = req.body;
  await Setting.findOneAndUpdate(
    { key: 'global_ad' },
    { value: { text, link, bgColor, textColor } },
    { upsert: true }
  );
  res.json({ message: '愿묎퀬 ?ㅼ젙 ????꾨즺' });
});

// [?쒕뵫?섏씠吏 API]
app.get('/api/landing-content', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'landing_content' });
    if (setting) res.json(setting.value);
    else res.status(404).json({ message: '?놁쓬' });
  } catch (err) { res.status(500).json({ message: '?ㅽ뙣' }); }
});

app.put('/api/landing-content', async (req, res) => {
  try {
    await Setting.findOneAndUpdate(
      { key: 'landing_content' },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ message: '??μ셿猷? });
  } catch (err) { 
    console.error('[LANDING_SAVE_ERROR]', err);
    res.status(500).json({ message: '?ㅽ뙣' }); 
  }
});

// [紐낇븿 ?쒕뵫?섏씠吏 API]
app.get('/api/namecard-landing-content', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'namecard_landing_content' });
    if (setting) res.json(setting.value);
    else res.status(404).json({ message: '?놁쓬' });
  } catch (err) { res.status(500).json({ message: '?ㅽ뙣' }); }
});

app.put('/api/namecard-landing-content', async (req, res) => {
  try {
    await Setting.findOneAndUpdate(
      { key: 'namecard_landing_content' },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ message: '??μ셿猷? });
  } catch (err) {
    console.error('[NAMECARD_LANDING_SAVE_ERROR]', err);
    res.status(500).json({ message: '?ㅽ뙣' });
  }
});

// [臾몄쓽?ы빆 API]
app.post('/api/inquiry', async (req, res) => {
  try {
    const { name, phone, email, type, content } = req.body;
    if (!name || !phone || !email || !content) {
      return res.status(400).json({ message: '紐⑤뱺 ?꾩닔 ??ぉ???낅젰??二쇱꽭??' });
    }
    const newInquiry = await Inquiry.create({ name, phone, email, type: type || 'general', content });
    console.log('[INQUIRY_RECEIVED]', newInquiry);
    res.status(201).json({ message: '?깃났' });
  } catch (err) {
    console.error('[INQUIRY_ERROR]', err);
    res.status(500).json({ message: '?ㅽ뙣' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});


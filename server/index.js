const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// [DB 연결 설정]
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ WARNING: MONGODB_URI is not set. Using temporary local database.');
}

const connectionUri = MONGODB_URI || 'mongodb://127.0.0.1:27017/nextcard';

mongoose.connect(connectionUri)
  .then(() => {
    const isCloud = connectionUri.includes('mongodb+srv');
    console.log(`✅ MongoDB Connected: ${isCloud ? 'Cloud Atlas' : 'Local Host'}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// [스키마 정의]
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
  cardData: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  features: {
    allowLogo: { type: Boolean, default: false },
    allowProfile: { type: Boolean, default: true },
    allowPaperCard: { type: Boolean, default: false },
    allowCustomUrl: { type: Boolean, default: false },
    allowSinglePage: { type: Boolean, default: false },
    maxSnsCount: { type: Number, default: 1 },
    allowedThemes: { type: [String], default: ['modern'] }
  }
});

const User = mongoose.model('User', userSchema);
const Card = mongoose.model('Card', cardSchema);
const Product = mongoose.model('Product', productSchema);

// [초기 데이터 시딩]
async function seedData() {
  try {
    // 마스터 관리자 생성
    const masterEmail = 'vikitour.boss@gmail.com';
    const masterExists = await User.findOne({ email: masterEmail });
    if (!masterExists) {
      await User.create({
        name: '마스터운영자',
        email: masterEmail,
        password: '99nice99!!Q', // 실제 운영 시 변경 권장
        role: 'admin',
        phone: '010-0000-0000'
      });
      console.log('Master Admin seeded.');
    }

    // 기본 상품 생성
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      await Product.insertMany([
        { 
          id: 'general', 
          name: '일반형 (Digital Only)', 
          description: '기본 디지털 명함 기능',
          features: { 
            allowLogo: false, 
            allowProfile: true,
            allowPaperCard: false, 
            allowCustomUrl: false, 
            allowSinglePage: false,
            maxSnsCount: 1, 
            allowedThemes: ['modern'] 
          }
        },
        { 
          id: 'premium_nfc', 
          name: '프리미엄 (NFC Card 포함)', 
          description: 'NFC 카드 배송 포함',
          features: { 
            allowLogo: true, 
            allowProfile: true,
            allowPaperCard: true, 
            allowCustomUrl: true, 
            allowSinglePage: true,
            maxSnsCount: 10, 
            allowedThemes: ['modern', 'classic', 'luxury'] 
          }
        },
        { 
          id: 'corporate', 
          name: '기업용 (커스텀 디자인)', 
          description: '기업 맞춤형 대량 도입',
          features: { 
            allowLogo: true, 
            allowProfile: true,
            allowPaperCard: true, 
            allowCustomUrl: true, 
            allowSinglePage: true,
            maxSnsCount: 20, 
            allowedThemes: ['modern', 'classic', 'luxury', 'corporate'] 
          }
        }
      ]);
      console.log('Default products seeded.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}
seedData();

// [API 라우트]

// 회원가입
app.post('/api/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
    
    const user = await User.create({ name, email, password, phone });
    res.json({ message: '회원가입 성공', user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: '회원가입 중 오류 발생' });
  }
});

// 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });
    
    res.json({
      message: '로그인 성공',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: '로그인 중 오류 발생' });
  }
});

// 비밀번호 찾기 (임시)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: '해당 이메일로 가입된 회원이 없습니다.' });
    res.json({ message: '비밀번호 찾기 메일이 발송되었습니다. (시뮬레이션)', password: user.password });
  } catch (err) {
    res.status(500).json({ message: '오류 발생' });
  }
});

// 명함 데이터 조회
app.get('/api/card/:userId', async (req, res) => {
  try {
    const card = await Card.findOne({ userId: req.params.userId });
    if (card) res.json(card.cardData);
    else res.status(404).json({ message: '명함 정보가 없습니다.' });
  } catch (err) {
    res.status(500).json({ message: '조회 실패' });
  }
});

// 명함 데이터 저장/수정
app.post('/api/card', async (req, res) => {
  const { userId, cardData } = req.body;
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] Card Save Request - UserID: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 없습니다.' });
    }

    // findOneAndUpdate를 사용하여 기존 명함이 있으면 수정, 없으면 생성(upsert)
    const updatedCard = await Card.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) }, // 명시적 ObjectId 변환
      { 
        cardData, 
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );
    
    console.log(`[${timestamp}] Card Save Success - UserID: ${userId}`);
    res.json({ message: '명함 정보가 안전하게 저장되었습니다.', cardData: updatedCard.cardData });
  } catch (err) {
    console.error(`[${timestamp}] Card Save Error:`, err.message);
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
});

// 커스텀 URL 또는 사용자 ID로 명함 조회 (공개용)
app.get('/api/card/view/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    let card = null;
    
    // 1. 커스텀 URL로 먼저 검색
    card = await Card.findOne({ "cardData.customCardUrl": identifier });
    
    // 2. 검색 결과가 없고 identifier가 유효한 ObjectId 형식이면 ID로 검색 (미리보기용)
    if (!card && mongoose.Types.ObjectId.isValid(identifier)) {
      card = await Card.findOne({ userId: new mongoose.Types.ObjectId(identifier) });
    }

    if (card) res.json(card.cardData);
    else res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// [상품 API]
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// [Admin API]

// 전체 명함 목록 (사용자 정보 포함)
app.get('/api/admin/cards', async (req, res) => {
  try {
    const cards = await Card.find().populate('userId', 'name email');
    const result = cards.map(c => ({
      _id: c._id,
      userId: c.userId?._id,
      userName: c.userId?.name || (c.cardData?.name || '알수없음'),
      userEmail: c.userId?.email || (c.cardData?.email || '이메일 없음'),
      cardData: c.cardData,
      updatedAt: c.updatedAt
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '조회 실패' });
  }
});

// 명함 발행 (URL 할당)
app.put('/api/admin/card/:userId/publish', async (req, res) => {
  const { customCardUrl, status } = req.body;
  try {
    const card = await Card.findOne({ userId: req.params.userId });
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    
    card.cardData.customCardUrl = customCardUrl;
    card.cardData.status = status || 'published';
    card.updatedAt = new Date();
    await card.save();
    
    res.json({ message: '발행 완료', customCardUrl });
  } catch (err) {
    res.status(500).json({ message: '발행 실패' });
  }
});

// 전체 회원 목록
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const safeUsers = users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json(safeUsers);
});

// 회원 권한 수정
app.put('/api/admin/user/:userId/role', async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (user.email === 'vikitour.boss@gmail.com') return res.status(403).json({ message: '마스터 계정 수정 불가' });
    
    user.role = role;
    await user.save();
    res.json({ message: '권한 수정 완료', role });
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
});

// 회원 정보 수정
app.put('/api/admin/user/:userId', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    await User.findByIdAndUpdate(req.params.userId, { name, email, phone });
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
});

// 회원 삭제
app.delete('/api/admin/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user.email === 'vikitour.boss@gmail.com') return res.status(403).json({ message: '마스터 삭제 불가' });
    
    await User.findByIdAndDelete(req.params.userId);
    await Card.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패' });
  }
});

// 상품 관리
app.get('/api/admin/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/admin/products', async (req, res) => {
  const { name, description, features } = req.body;
  const product = await Product.create({ 
    id: 'prod_' + Date.now(), 
    name, 
    description,
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
  const { name, description, features } = req.body;
  await Product.findOneAndUpdate({ id: req.params.id }, { name, description, features });
  res.json({ message: '수정 완료' });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  await Product.findOneAndDelete({ id: req.params.id });
  res.json({ message: '삭제 완료' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

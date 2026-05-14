require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

// 기본 데이터 구조 설정
db.defaults({ users: [], cards: [], products: [] }).write(); // products 추가

// 상품 기본 데이터 (Seeding)
const productsCount = db.get('products').size().value();
if (productsCount === 0) {
  db.get('products').push(
    { id: 'general', name: '일반형 (Digital Only)', description: '기본 디지털 명함 기능' },
    { id: 'premium_nfc', name: '프리미엄 (NFC Card 포함)', description: 'NFC 카드 배송 포함' },
    { id: 'corporate', name: '기업용 (커스텀 디자인)', description: '기업 맞춤형 대량 도입' }
  ).write();
  console.log('Default products seeded.');
}

// 마스터 운영자 자동 생성 (Seeding)
const masterEmail = 'vikitour.boss@gmail.com';
const masterExists = db.get('users').find({ email: masterEmail }).value();
if (!masterExists) {
  db.get('users').push({
    id: 1,
    name: '마스터운영자',
    email: masterEmail,
    phone: '010-0000-0000', // 마스터 계정 기본 번호
    password: '99nice99!!Q', // 초기 임시 비밀번호
    role: 'admin',
    createdAt: new Date().toISOString()
  }).write();
  console.log('Master Admin account seeded successfully.');
}

// CORS 설정 강화
app.use(cors({
  origin: '*', // 모든 도메인 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 요청 로깅 추가
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

const PORT = process.env.PORT || 5000;

// [Auth] 회원가입
app.post('/api/signup', (req, res) => {
  const { name, email, phone, password } = req.body;
  const userExists = db.get('users').find({ email }).value();
  
  if (userExists) {
    return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
  }

  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    phone, // 휴대전화 추가
    password,
    role: email === 'vikitour.boss@gmail.com' ? 'admin' : 'user', // 마스터 운영자 자동 지정
    createdAt: new Date().toISOString() // 가입 일시 추가
  };
  db.get('users').push(newUser).write();
  res.json({ message: '회원가입 성공', user: { name, email, role: newUser.role, createdAt: newUser.createdAt } });
});

// [Auth] 로그인
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    res.json({ 
      message: '로그인 성공', 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        phone: user.phone || '', // 로그인 시 전화번호 포함
        role: user.role || (user.email === 'vikitour.boss@gmail.com' ? 'admin' : 'user') 
      } 
    });
  } else {
    res.status(401).json({ message: '이메일 또는 비밀번호가 틀립니다.' });
  }
});

// [Card] 명함 데이터 저장
app.post('/api/save-card', (req, res) => {
  const timestamp = new Date().toISOString();
  try {
    const { userId, cardData } = req.body;
    if (!userId) {
      console.error(`[${timestamp}] Save Error: Missing userId`);
      return res.status(400).json({ message: 'userId가 없습니다.' });
    }

    const targetId = String(userId);
    console.log(`[${timestamp}] Save Request - User: ${targetId}, Name: ${cardData?.name}`);

    const cardCollection = db.get('cards');
    const existingCardWrapper = cardCollection.find(c => String(c.userId) === targetId);
    
    if (existingCardWrapper.value()) {
      existingCardWrapper.assign({ cardData, userId: targetId, updatedAt: timestamp }).write();
      console.log(`[${timestamp}] Update Success - User: ${targetId}`);
    } else {
      cardCollection.push({ userId: targetId, cardData, updatedAt: timestamp }).write();
      console.log(`[${timestamp}] Create Success - User: ${targetId}`);
    }
    
    res.json({ message: '성공적으로 저장되었습니다.', updatedAt: timestamp });
  } catch (error) {
    console.error(`[${timestamp}] Save Exception:`, error.message);
    res.status(500).json({ message: '서버 내부 저장 오류', error: error.message });
  }
});

// [Card] 명함 데이터 불러오기
app.get('/api/card/:userId', (req, res) => {
  const timestamp = new Date().toISOString();
  const { userId } = req.params;
  const targetId = String(userId).trim();
  console.log(`[${timestamp}] Lookup Request - ID/Slug: ${targetId}`);
  
  const card = db.get('cards').find(c => {
    if (String(c.userId) === targetId) return true;
    if (c.cardData && c.cardData.customCardUrl) {
      const customUrl = String(c.cardData.customCardUrl).trim();
      if (customUrl === targetId) return true;
      
      const parts = customUrl.split('/').filter(Boolean);
      const slug = parts[parts.length - 1];
      if (slug === targetId) return true;
    }
    return false;
  }).value();
  
  if (card) {
    console.log(`[${timestamp}] Lookup Success - Found for: ${targetId}`);
    res.json(card.cardData);
  } else {
    console.warn(`[${timestamp}] Lookup Failed - Not found: ${targetId}`);
    res.status(404).json({ message: '명함 정보가 없습니다.' });
  }
});

// [Admin] 전체 명함 데이터 조회
app.get('/api/admin/cards', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Admin Fetch - Requesting all cards`);
  try {
    const cards = db.get('cards').value();
    const users = db.get('users').value();
    
    console.log(`[${timestamp}] Admin Fetch - Found ${cards.length} cards`);
    
    const cardsWithUserInfo = cards.map(card => {
      const user = users.find(u => String(u.id) === String(card.userId));
      return {
        ...card,
        userName: user ? user.name : (card.cardData?.name || '알수없음'), // 회원 없으면 명함 데이터에서 이름 가져오기
        userEmail: user ? user.email : (card.cardData?.email || '이메일 정보 없음') // 회원 없으면 명함 데이터에서 이메일 가져오기
      };
    });
    
    res.json(cardsWithUserInfo);
  } catch (error) {
    console.error(`[${timestamp}] Admin Fetch Error:`, error.message);
    res.status(500).json({ message: '서버 내부 오류', error: error.message });
  }
});

// [Admin] 명함 발행 및 커스텀 URL 할당
app.put('/api/admin/card/:userId/publish', (req, res) => {
  const timestamp = new Date().toISOString();
  try {
    const { userId } = req.params;
    const { customCardUrl, status } = req.body;
    
    console.log(`[${timestamp}] Publish Request - User: ${userId}, URL: ${customCardUrl}`);
    
    const cardWrapper = db.get('cards').find(c => String(c.userId) === String(userId));
    const card = cardWrapper.value();
    
    if (!card) {
      console.warn(`[${timestamp}] Publish Failed - Card not found for user: ${userId}`);
      return res.status(404).json({ message: '해당 명함을 찾을 수 없습니다.' });
    }
    
    // cardData 업데이트 및 최상위 updatedAt 갱신
    const updatedCardData = {
      ...card.cardData,
      customCardUrl: customCardUrl,
      status: status || 'published'
    };
    
    cardWrapper.assign({ 
      cardData: updatedCardData, 
      updatedAt: timestamp // 발행 시점 기록
    }).write();
    
    console.log(`[${timestamp}] Publish Success - User: ${userId}`);
    res.json({ message: '발행 완료', customCardUrl, updatedAt: timestamp });
  } catch (error) {
    console.error(`[${timestamp}] Publish Exception:`, error.message);
    res.status(500).json({ message: '발행 중 오류 발생', error: error.message });
  }
});

// [Admin] 전체 회원 목록 조회
app.get('/api/admin/users', (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Admin User Fetch - Requesting all users`);
  try {
    const users = db.get('users').value();
    // 비밀번호는 제외하고 전송
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '', // 전화번호 포함
      role: u.role || 'user',
      createdAt: u.createdAt || new Date(u.id).toISOString() // 기존 유저는 ID(timestamp) 기반으로 생성
    }));
    // 최신 가입일 순으로 정렬
    safeUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(safeUsers);
  } catch (error) {
    console.error(`[${timestamp}] Admin User Fetch Error:`, error.message);
    res.status(500).json({ message: '회원 목록을 불러오는 중 오류 발생' });
  }
});

// [Admin] 회원 권한(role) 수정
app.put('/api/admin/user/:userId/role', (req, res) => {
  const timestamp = new Date().toISOString();
  const { userId } = req.params;
  const { role } = req.body;
  
  try {
    const userWrapper = db.get('users').find(u => String(u.id) === String(userId));
    if (!userWrapper.value()) {
      return res.status(404).json({ message: '해당 회원을 찾을 수 없습니다.' });
    }
    
    // 마스터 운영자 보호 (선택 사항: boss 계정은 권한 변경 불가하게 할 수 있음)
    if (userWrapper.value().email === 'vikitour.boss@gmail.com' && role !== 'admin') {
      return res.status(403).json({ message: '마스터 운영자의 권한은 변경할 수 없습니다.' });
    }

    userWrapper.assign({ role }).write();
    console.log(`[${timestamp}] Role Update Success - User: ${userId}, New Role: ${role}`);
    res.json({ message: '권한이 변경되었습니다.', userId, role });
  } catch (error) {
    console.error(`[${timestamp}] Role Update Error:`, error.message);
    res.status(500).json({ message: '권한 변경 중 오류 발생' });
  }
});

// [Admin] 회원 정보 전체 수정 (이름, 이메일, 전화번호 등)
app.put('/api/admin/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, email, phone } = req.body;
  try {
    const userWrapper = db.get('users').find(u => String(u.id) === String(userId));
    if (!userWrapper.value()) return res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
    
    userWrapper.assign({ name, email, phone }).write();
    res.json({ message: '회원 정보 수정 완료' });
  } catch (error) {
    res.status(500).json({ message: '수정 실패' });
  }
});

// [Products] 상품 목록 조회 (공개)
app.get('/api/products', (req, res) => {
  res.json(db.get('products').value());
});

// [Admin] 상품 관리 API
app.get('/api/admin/products', (req, res) => {
  res.json(db.get('products').value());
});

app.post('/api/admin/products', (req, res) => {
  const { name, description } = req.body;
  const newProduct = {
    id: 'prod_' + Date.now(),
    name,
    description
  };
  db.get('products').push(newProduct).write();
  res.json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  db.get('products').find({ id }).assign({ name, description }).write();
  res.json({ message: '상품 수정 완료' });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('products').remove({ id }).write();
  res.json({ message: '상품 삭제 완료' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

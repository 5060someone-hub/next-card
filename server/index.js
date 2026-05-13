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
db.defaults({ users: [], cards: [] }).write();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 5000;

// [Auth] 회원가입
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  const userExists = db.get('users').find({ email }).value();
  
  if (userExists) {
    return res.status(400).json({ message: '이미 가입된 이메일입니다.' });
  }

  const newUser = { id: Date.now(), name, email, password };
  db.get('users').push(newUser).write();
  res.json({ message: '회원가입 성공', user: { name, email } });
});

// [Auth] 로그인
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    res.json({ message: '로그인 성공', user: { id: user.id, name: user.name, email: user.email } });
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
        userName: user ? user.name : '알수없음',
        userEmail: user ? user.email : '알수없음'
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
  try {
    const { userId } = req.params;
    const { customCardUrl, status } = req.body;
    
    const cardWrapper = db.get('cards').find(c => String(c.userId) === String(userId));
    const card = cardWrapper.value();
    
    if (!card) {
      return res.status(404).json({ message: '해당 명함을 찾을 수 없습니다.' });
    }
    
    // cardData 업데이트
    const updatedCardData = {
      ...card.cardData,
      customCardUrl: customCardUrl,
      status: status || 'published'
    };
    
    cardWrapper.assign({ cardData: updatedCardData }).write();
    
    res.json({ message: '발행 완료', customCardUrl });
  } catch (error) {
    res.status(500).json({ message: '발행 중 오류 발생', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

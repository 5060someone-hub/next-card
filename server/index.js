const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY || 'd44f8bc3d35895c619e719b7eb7a67dc';

async function getAddressFromCoords(lat, lng) {
  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` }
    });
    const data = await response.json();
    if (data.documents && data.documents.length > 0) {
      if (data.documents[0].road_address) {
        return data.documents[0].road_address.address_name;
      }
      return data.documents[0].address.address_name;
    }
  } catch(e) {
    console.error('Kakao coord2address error:', e);
  }
  return '';
}

const app = express();

// ─── CORS 보안 강화: 프로덕션은 허용 도메인만, 개발은 전체 허용 ───────────────
const ALLOWED_ORIGINS = [
  'https://nextcard.kr',
  'https://www.nextcard.kr',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // 서버간 요청(origin 없음) 또는 허용 목록에 있으면 통과
    if (!origin || ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── 인메모리 캐시 (명함 조회, 상품 목록용) ──────────────────────────────────
const cache = {
  cards: new Map(),   // key: identifier, value: { data, ts }
  products: null,
  productTs: 0,
  CARD_TTL: 5 * 60 * 1000,      // 5분
  PRODUCT_TTL: 10 * 60 * 1000,  // 10분
  getCard(id) {
    const entry = this.cards.get(id);
    if (entry && Date.now() - entry.ts < this.CARD_TTL) return entry.data;
    return null;
  },
  setCard(id, data) { this.cards.set(id, { data, ts: Date.now() }); },
  clearCard(id) { this.cards.delete(id); },
  getProducts() {
    if (this.products && Date.now() - this.productTs < this.PRODUCT_TTL) return this.products;
    return null;
  },
  setProducts(data) { this.products = data; this.productTs = Date.now(); },
  clearProducts() { this.products = null; },
};


// ==========================================
// 설정: 무통장 입금 정보 및 결제 수단 관리
// ==========================================
app.get('/api/settings/bank-info', async (req, res) => {
  try {
    const info = await Setting.findOne({ key: 'bank_transfer_info' });
    if (!info) return res.status(404).json({ message: '설정이 없습니다.' });
    res.json(info.value);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
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
    res.json({ message: '무통장 입금 정보가 업데이트되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '업데이트 실패', error: err.message });
  }
});

app.get('/api/settings/payment-methods', async (req, res) => {
  try {
    let info = await Setting.findOne({ key: 'payment_methods' });
    if (!info) {
      // 초기 기본값
      const defaultMethods = [
        {
          id: 'bank',
          name: '무통장 입금',
          enabled: true,
          description: '아래 공식 계좌로 입금 신청 후 이체해주시면 승인 처리됩니다.',
          fields: [
            { id: '1', label: '신한은행', value: '110-123-456789 주식회사 넥스트카드' }
          ]
        }
      ];
      info = await Setting.create({ key: 'payment_methods', value: defaultMethods });
    }
    res.json(info.value);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
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
    res.json({ message: '결제 수단 정보가 업데이트되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '업데이트 실패', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

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
const companySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  themeColor: { type: String, default: '#3b82f6' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tags: { type: [String], default: [] },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, default: 'user' }, // 'user', 'admin', 'company_admin', 'employee'
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  createdAt: { type: Date, default: Date.now }
});

const cardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  isRevoked: { type: Boolean, default: false },
  grade: { type: String, default: 'general' },
  paymentStatus: { type: String, default: 'none' }, // 'none', 'pending', 'confirmed'
  depositorName: { type: String, default: '' },
  paymentAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '무통장 입금' },
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
  tags: { type: [String], default: [] },
  sampleUrl: { type: String, default: '' },
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

const nfcCardSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true }, // 001, 002 등 일련번호
  pinCode: { type: String, required: true }, // 뒷면 핀번호
  mappedCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', default: null }, // 연결된 명함
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null }, // 할당된 B2B 회사
  status: { type: String, enum: ['blank', 'assigned', 'mapped'], default: 'blank' },
  createdAt: { type: Date, default: Date.now }
});

const connectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 명함을 수집한 사용자
  savedCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true }, // 수집된 명함 (타인의 명함)
  memo: { type: String, default: '' }, // 개인 메모
  lat: { type: Number, default: null }, // 만난 위치(위도)
  lng: { type: Number, default: null }, // 만난 위치(경도)
  meetingAddress: { type: String, default: '' }, // 역지오코딩된 만난 주소
  savedAt: { type: Date, default: Date.now }
});
// 한 사용자가 동일한 명함을 중복 저장하지 않도록 복합 인덱스 설정
connectionSchema.index({ userId: 1, savedCardId: 1 }, { unique: true });

const Company = mongoose.model('Company', companySchema);
const User = mongoose.model('User', userSchema);
const Card = mongoose.model('Card', cardSchema);
const Product = mongoose.model('Product', productSchema);
const Setting = mongoose.model('Setting', settingSchema);
const Inquiry = mongoose.model('Inquiry', inquirySchema);
const NetworkLog = mongoose.model('NetworkLog', networkLogSchema);
const CardAnalytics = mongoose.model('CardAnalytics', cardAnalyticsSchema);
const PlanChange = mongoose.model('PlanChange', planChangeSchema);
const NfcCard = mongoose.model('NfcCard', nfcCardSchema);
const Connection = mongoose.model('Connection', connectionSchema);

// [초기 데이터 시딩]
async function seedData() {
  try {
    // ── 다중 명함 마이그레이션 및 인덱스 해제 ──
    try {
      await Card.collection.dropIndex('userId_1');
      console.log('✅ Dropped userId_1 unique index successfully.');
    } catch (err) {
      console.log('ℹ️ unique index not found or already dropped.');
    }

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
          name: '프리미엄 (NFC Card 포함)', 
          description: 'NFC 카드 배송 포함',
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
          name: '기업용 (커스텀 디자인)', 
          description: '기업 맞춤형 대량 도입',
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

    // 기존 상품에 price 필드가 Number일 경우 객체로 자동 마이그레이션
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

    // 기본 설정 시딩
    const adSetting = await Setting.findOne({ key: 'global_ad' });
    if (!adSetting) {
      await Setting.create({
        key: 'global_ad',
        value: {
          text: '디지털 명함의 새로운 기준, NextCard.kr에서 무료로 시작하세요!',
          link: 'https://nextcard.kr',
          bgColor: '#eff6ff',
          textColor: '#2563eb'
        }
      });
      console.log('Default ad settings seeded.');
    }

    // 무통장 입금 설정 시딩
    const existingBankInfo = await Setting.findOne({ key: 'bank_transfer_info' });
    if (!existingBankInfo) {
      await Setting.create({
        key: 'bank_transfer_info',
        value: {
          description: '아래 넥스트카드 공식 계좌로 입금 신청 후 이체해주시면 실시간으로 승인 처리됩니다.',
          accounts: [
            { id: Date.now().toString(), bank: '신한은행', account: '110-388-757045', owner: '최영열' }
          ]
        }
      });
      console.log('Default bank transfer info seeded.');
    }

    // 랜딩 페이지 기본 콘텐츠 시딩
    const existing = await Setting.findOne({ key: 'landing_content' });
    if (!existing) {
      await Setting.create({
        key: 'landing_content',
        value: {
          nav: { logo: 'NextCard', logoSub: '.me', links: ['기능소개', '요금제'] },
          hero: {
            badge: '지속 가능한 연결의 시작',
            title: '종이 명함 대신,\n스마트한 디지털 프로필',
            desc: '모바일 환경에 최적화된 프로필로 나만의 브랜딩을 완성하세요.\nSNS 연동부터 포트폴리오 공유까지 한 번에 가능합니다.',
            primaryBtn: '지금 시작하기',
            primaryBtnUrl: '/signup',
            secondaryBtn: '서비스 둘러보기',
            secondaryBtnUrl: '#contact',
            mockupImg: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=2070&auto=format&fit=crop'
          },
          features: [
            { icon: '📱', title: '모바일 최적화', desc: '모든 스마트폰 기기에서 완벽하게 표현되는 반응형 디자인을 제공합니다.' },
            { icon: '🔗', title: '빠른 공유', desc: 'QR 코드, 링크 하나로 장소에 상관없이 명함을 전달할 수 있습니다.' },
            { icon: '✏️', title: '자유로운 편집', desc: '언제 어디서든 실시간으로 명함 내용을 수정하고 관리할 수 있습니다.' },
            { icon: '📊', title: '실시간 통계', desc: '내 명함이 얼마나 조회되었는지, 어떤 링크가 클릭되었는지 확인하세요.' }
          ],
          samplesSection: {
            title: '다양한 명함 샘플',
            desc: '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.'
          },
          samples: [
            { title: '비즈니스 스타일', imgUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop', linkUrl: '' },
            { title: '프리랜서 스타일', imgUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop', linkUrl: '' },
            { title: '퍼스널 브랜딩', imgUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop', linkUrl: '' }
          ],
          partnersSection: {
            title: '주요 기업 거래처'
          },
          partnersLogos: [
            { name: 'Careis', imgUrl: 'https://placehold.co/200x60/transparent/9d4edd?text=Careis' },
            { name: '우리척병원', imgUrl: 'https://placehold.co/200x60/transparent/38bdf8?text=WOORI+SPINE' },
            { name: 'novita', imgUrl: 'https://placehold.co/200x60/transparent/c1121f?text=novita' },
            { name: 'EUGENE', imgUrl: 'https://placehold.co/200x60/transparent/1d3557?text=EUGENE' },
            { name: 'BAUSCH + LOMB', imgUrl: 'https://placehold.co/200x60/transparent/00b4d8?text=BAUSCH+%2B+LOMB' },
            { name: 'KSPO', imgUrl: 'https://placehold.co/200x60/transparent/f77f00?text=KSPO' }
          ],
          pricing: [
            { name: '일반형 (Free)', price: '0', period: '월', features: ['기본 프로필 페이지', 'QR 코드 생성', '링크 공유', '기본 테마 적용'], btn: '무료로 시작', linkUrl: '/signup', popular: false },
            { name: '프리미엄 (Pro)', price: '9,900', period: '월', features: ['모든 기본 기능', '커스텀 URL 설정', '로고 및 배경 커스텀', '방문 통계 분석'], btn: '지금 가입', linkUrl: '/signup', popular: true },
            { name: '기업용 (Corp)', price: '문의', period: '', features: ['전사 통합 관리', '기업 전용 템플릿', 'API 연동 지원', '전담 기술 지원'], btn: '상담 신청', linkUrl: '#contact', popular: false }
          ],
          cta: {
            title: '지금 바로 나만의 디지털 명함을 만들어보세요',
            desc: '30초면 충분합니다. 앞서가는 비즈니스 파트너가 되어보세요.',
            btn: '무료로 시작하기',
            btnUrl: '/signup'
          },
          faq: {
            badge: 'FAQ',
            title: '자주 묻는 질문',
            desc: '디지털명함을 만들기 전에 알아야 할 모든 것.',
            items: [
              { q: '디지털 명함이란 무엇인가요?', a: '기존 종이 명함의 한계를 넘어 스마트폰이나 웹 브라우저에서 바로 확인할 수 있는 모바일 최적화 명함입니다. 연락처 저장, SNS 연동, 동영상 삽입 등 다양한 기능을 제공합니다.' },
              { q: '디지털 명함은 어떻게 공유하나요?', a: 'QR 코드를 스캔하거나 고유한 링크(URL)를 카톡, 문자 등으로 전달하여 즉시 공유할 수 있습니다.' },
              { q: '회사 브랜딩으로 맞춤 설정할 수 있나요?', a: '네, 로고 업로드, 테마 색상 변경, 배경 이미지 설정 등을 통해 기업의 정체성을 완벽하게 표현할 수 있습니다.' },
              { q: 'NFC 명함과 무엇이 다른가요?', a: '디지털 명함은 온라인 기반이며, NFC 명함은 물리적인 카드를 스마트폰에 태그하여 정보를 전달하는 방식입니다. 저희 서비스는 두 방식을 모두 지원합니다.' }
            ]
          },
          reviews: {
            title: '고객들이 전하는 진짜 이야기',
            items: [
              { rating: 5, content: '기업의 브랜드 컬러를 그대로 녹여낼 수 있는 커스텀 자유도가 만족스럽습니다. 프로필 사진, SNS 링크, 회사 소개 등을 깔끔한 레이아웃으로 배치할 수 있어 비즈니스 신뢰도를 높이는 데 도움이 됩니다.', author: '정일영', role: '디지털명함/회사원' },
              { rating: 5, content: '최근 미팅이 잦아지면서 종이명함과 병행하여 사용하고자 구매했습니다. QR 코드 인식률이 매우 뛰어나고, 상대방이 별도의 앱을 설치하지 않아도 제 연락처와 포트폴리오 링크를 직관적으로 확인할 수 있다는 점이 큰 강점입니다.', author: '박승호', role: '디지털명함/회사원' },
              { rating: 5, content: 'ESG 경영과 친환경 비즈니스 실천의 일환으로 디지털 명함을 도입했습니다. 매번 인쇄 비용을 지출하지 않아도 되고, 링크 하나로 수많은 잠재 고객에게 명함을 전달할 수 있어 장기적인 비용 절감 효과가 기대됩니다.', author: '이지선', role: '종이명함/회사원' },
              { rating: 5, content: '링크 내에 텍스트뿐만 아니라 비즈니스 영상까지 임베딩할 수 있어 다각도로 저희 회사를 어필하기에 유용합니다. 정중하고 깔끔한 비즈니스 파트너를 만난 것 같아 기쁩니다.', author: '최은철', role: '중계/이차전지영업/회사원' }
            ]
          },
          footer: {
            logo: 'NextCard',
            copyright: '© 2026 NextCard. All rights reserved.',
            companyName: '(주)안티그래피티',
            ceoName: '홍길동',
            businessNumber: '123-45-67890',
            mailOrderNumber: '2026-서울강남-1234',
            address: '서울특별시 강남구 테헤란로 123, 4층',
            contact: 'support@nextcard.kr | 02-1234-5678',
            footerLinks: [
              { label: '이용약관', url: '/terms' },
              { label: '개인정보처리방침', url: '/privacy' },
              { label: '이메일무단수집거부', url: '/no-email' },
              { label: '고객센터', url: '/custom-center' },
              { label: '제휴문의', url: '/coalition' },
              { label: '제휴마케팅', url: '/marketing' },
              { label: '광고문의', url: '/ad-contact' }
            ],
            termsContent: `제 1 조 (목적)\n본 약관은 NextCard(이하 "회사")가 제공하는 디지털 명함 및 관련 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.\n\n제 2 조 (용어의 정의)\n1. "서비스"라 함은 회사가 제공하는 모바일 최적화 디지털 명함 생성, 관리 및 공유 플랫폼을 의미합니다.\n2. "회원"이라 함은 서비스에 접속하여 본 약관에 동의하고 계정을 생성하여 서비스를 이용하는 고객을 의미합니다.\n3. "프리미엄 서비스"라 함은 회원이 유료로 결제하여 이용하는 추가적인 기능(커스텀 URL, 테마, 로고 삽입 등)을 의미합니다.\n\n제 3 조 (약관의 효력 및 변경)\n1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n2. 회사는 관계 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.\n\n제 4 조 (서비스의 제공 및 변경)\n1. 회사는 회원에게 디지털 명함 제작 및 호스팅 서비스를 제공합니다.\n2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 하나, 설비 점검이나 시스템 장애 시 일시 중단될 수 있습니다.`,
            privacyContent: `NextCard(이하 "회사")는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 개인정보보호법 등 관련 법령에 따라 회원의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.\n\n1. 수집하는 개인정보 항목\n- 필수 항목: 이름, 이메일 주소, 비밀번호, 휴대전화 번호\n- 선택 항목: 회사명, 직책, 부서, 웹사이트 URL, 프로필 이미지, SNS 계정 정보\n- 서비스 이용 과정에서 자동으로 생성되어 수집되는 정보: IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보\n\n2. 개인정보의 수집 및 이용 목적\n- 회원 가입 및 관리: 회원 식별, 가입 의사 확인, 본인 확인, 서비스 부정이용 방지\n- 서비스 제공 및 계약 이행: 디지털 명함 생성 및 호스팅, 유료 결제 승인 및 서비스 관리\n- 마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤형 서비스 제공, 이벤트 및 광고성 정보 제공\n\n3. 개인정보의 보유 및 이용 기간\n- 회원의 개인정보는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 파기합니다.\n- 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.`,
            noEmailContent: `NextCard는 본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부합니다.\n\n1. 본 서비스 내에서 명함 소유자의 동의 없이 이메일 주소를 수집하는 행위는 정보통신망법에 의해 처벌받을 수 있습니다.\n2. 이를 위반할 경우 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2에 의하여 1천만 원 이하의 벌금형에 처해질 수 있음을 유념하시기 바랍니다.\n\n게시일: 2026년 5월 17일`,
            customerCenterContent: `NextCard 고객센터 안내\n\n1. 운영 시간\n- 평일: 오전 9시 ~ 오후 6시 (점심시간: 12:00 ~ 13:00)\n- 주말 및 공휴일: 휴무 (1:1 문의 접수 가능)\n\n2. 문의 방법\n- 이메일: support@nextcard.kr\n- 전화번호: 02-1234-5678\n- 카카오톡 플러스친구: @NextCard\n\n항상 고객의 입장에서 먼저 생각하는 NextCard가 되겠습니다.`,
            partnershipContent: `NextCard 제휴 및 협력 문의\n\nNextCard와 함께 새로운 비즈니스 가치를 만들어갈 혁신적인 비즈니스 파트너를 찾습니다.\n\n1. 제휴 분야\n- 기업 임직원 단체 도입 및 전사 디지털 명함 연동\n- 스마트 NFC 카드 하드웨어 제조 및 기술 제휴\n- API 연동 및 외부 연계 프로필 서비스 협업\n- 공동 브랜드 마케팅 및 프로모션 제휴\n\n2. 문의 및 접수\n- 이메일: biz@nextcard.kr\n- 전화번호: 02-1234-5678\n\n문의사항을 접수해 주시면 담당 부서에서 검토 후 신속히 연락드리겠습니다.`,
            affiliateMarketingContent: `NextCard 제휴 마케팅 및 인플루언서 파트너 모집\n\nNextCard의 가치를 널리 알리고 함께 성장할 제휴 마케터 및 크리에이터 분들의 많은 관심 바랍니다.\n\n1. 참여 대상\n- 블로그, 인스타그램, 유튜브 등을 운영 중인 크리에이터\n- 비즈니스/테크/생산성 관련 콘텐츠를 발행하시는 분\n- 자체 회원이나 잠재 고객층을 보유한 비즈니스 커뮤니티\n\n2. 활동 혜택\n- 추천 링크를 통한 신규 가입 및 유료 전환 시 고율의 리워드 제공\n- 신제품/NFC 카드 우선 체험권 및 브랜드 굿즈 증정\n- 우수 파트너 대상 특별 프로모션 지원\n\n3. 지원 방법\n- 이메일: affiliate@nextcard.kr`,
            adInquiryContent: `NextCard 광고 및 배너 게재 문의\n\nNextCard의 트렌디하고 전문성 있는 사용자층을 타겟으로 하는 다양한 광고 매체 솔루션을 제공합니다.\n\n1. 광고 매체 구성\n- NextCard 무료형 명함 하단 배너 광고\n- 서비스 내 스폰서십 영역 및 이벤트 페이지 연계\n- 타겟팅 푸시 알림 및 이메일 마케팅 지원\n\n2. 타겟 오디언스\n- 비즈니스 네트워킹에 관심이 많은 직장인, 프리랜서, 1인 창업가, 전문직 종사자\n\n3. 광고 신청 및 제안서 요청\n- 이메일: ad@nextcard.kr\n- 제안서 요청 시 회사명, 담당자명, 연락처, 희망 광고 기간 및 예산을 기재해 주시기 바랍니다.`
          }
        }
      });
      console.log('Landing content seeded.');
    } else {
      // 기존 데이터에 필드가 없으면 추가
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
          title: '다양한 명함 샘플',
          desc: '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.'
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
          title: '주요 기업 거래처'
        };
        updated = true;
      }
      if (!val.partnersLogos) {
        val.partnersLogos = [
          { name: 'Careis', imgUrl: 'https://placehold.co/200x60/transparent/9d4edd?text=Careis' },
          { name: '우리척병원', imgUrl: 'https://placehold.co/200x60/transparent/38bdf8?text=WOORI+SPINE' },
          { name: 'novita', imgUrl: 'https://placehold.co/200x60/transparent/c1121f?text=novita' },
          { name: 'EUGENE', imgUrl: 'https://placehold.co/200x60/transparent/1d3557?text=EUGENE' },
          { name: 'BAUSCH + LOMB', imgUrl: 'https://placehold.co/200x60/transparent/00b4d8?text=BAUSCH+%2B+LOMB' },
          { name: 'KSPO', imgUrl: 'https://placehold.co/200x60/transparent/f77f00?text=KSPO' }
        ];
        updated = true;
      }
      if (!val.faq) {
        val.faq = { badge: 'FAQ', title: '자주 묻는 질문', desc: '모든 것.', items: [] };
        updated = true;
      }
      if (!val.reviews) {
        val.reviews = { title: '후기', items: [] };
        updated = true;
      }
      if (!val.footer.companyName) {
        val.footer = {
          ...val.footer,
          companyName: '(주)안티그래피티',
          ceoName: '대표자명',
          businessNumber: '사업자번호',
          address: '회사 주소',
          contact: '연락처 정보'
        };
        updated = true;
      }
      if (!val.footer.mailOrderNumber) {
        val.footer.mailOrderNumber = '통신판매업신고번호';
        updated = true;
      }
      if (!val.footer.footerLinks) {
        val.footer.footerLinks = [
          { label: '이용약관', url: '#' },
          { label: '개인정보처리방침', url: '#' },
          { label: '이메일무단수집거부', url: '#' },
          { label: '고객센터', url: '#' },
          { label: '제휴문의', url: '#' }
        ];
        updated = true;
      }
      if (updated) {
        await Setting.findOneAndUpdate({ key: 'landing_content' }, { value: val });
        console.log('Landing content updated with new fields.');
      }
    }
    // 명함 랜딩 페이지 기본 콘텐츠 시딩
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
          title: '수입지 하이엔드 명함',
          subtitle: '첫인상을 결정짓는 완벽한 디테일, 최고급 수입지로 제작되는 프리미엄 명함입니다.',
          price: '22,000',
          specs: [
            { icon: 'Check', label: '지질', desc: '엑스트라 누브, 띤또레또, 랑데뷰 등 최고급 수입지 선택 가능' },
            { icon: 'Check', label: '두께', desc: '350g 이상의 묵직하고 고급스러운 두께감' },
            { icon: 'Check', label: '후가공', desc: '박(금박/은박/먹박), 형압, 에폭시 등 커스텀 가공 지원' },
            { icon: 'Check', label: '제작기간', desc: '시안 확정 후 영업일 기준 2~3일 소요' }
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
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone || '' }
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

// 사용자 프로필 조회
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// 사용자 프로필 수정 (이름, 연락처)
app.put('/api/user/:userId', async (req, res) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, phone },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    
    // 사용자의 명함 데이터 내 개인 정보도 자동 동기화
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
      message: '수정 완료',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err.message });
  }
});

// 사용자 비밀번호 변경
app.put('/api/user/:userId/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }
    
    user.password = newPassword;
    await user.save();
    res.json({ message: '비밀번호 변경 완료' });
  } catch (err) {
    res.status(500).json({ message: '비밀번호 변경 실패', error: err.message });
  }
});

// 활성 명함 판별 헬퍼 함수 (내용이 존재하거나 요금제/결제이력이 있으면 활성)
function isCardActive(card) {
  if (!card) return false;
  
  // 1. 등급이 일반이 아니거나, 결제/입금 대기 등 결제 관련 액션이 있는 경우 활성 상태로 간주
  if (card.grade && card.grade !== 'general') return true;
  if (card.paymentStatus && card.paymentStatus !== 'none') return true;
  
  // 2. isEdited 필드가 명시적으로 존재하는 경우 최우선으로 활성 상태 여부 결정
  if (card.isEdited === true) return true;
  if (card.isEdited === false) return false;
  
  // 3. isEdited가 undefined인 레거시 카드의 경우 fallback 검사 (이름 변경 동기화로 인한 중복 판단 방지를 위해 d.name은 제외)
  const d = card.cardData;
  if (!d) return false;
  
  const textFields = [
    d.nameEng, d.jobTitle, d.company, d.department,
    d.phone, d.phoneWork, d.phonePersonal, d.email, d.website,
    d.address, d.intro, d.logoUrl, d.profileUrl, d.paperCardUrl, d.customCardUrl
  ];
  
  const hasText = textFields.some(val => val && String(val).trim() !== '');
  if (hasText) return true;
  
  // SNS 채널이 하나라도 입력되어 있는지 검사
  if (d.sns) {
    const hasSns = Object.values(d.sns).some(val => val && String(val).trim() !== '');
    if (hasSns) return true;
  }
  
  return false;
}

// 중복 생성 방지를 위한 동시성 제어 락 객체
const creationLocks = new Map();

// 명함 데이터 조회 (Legacy - 단일 카드 데이터 반환)
app.get('/api/card/:userId', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.params.userId });
    const activeCard = cards.find(isCardActive);
    if (activeCard) res.json(activeCard.cardData);
    else res.status(404).json({ message: '명함 정보가 없습니다.' });
  } catch (err) {
    res.status(500).json({ message: '조회 실패' });
  }
});

// 전체 명함 목록 조회 (배열 반환)
app.get('/api/cards/:userId', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.params.userId });
    const activeCards = cards.filter(isCardActive);
    res.json(activeCards);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// OG 썸네일용 Base64 이미지 렌더링 엔드포인트
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

// 명함 VCF 파일 직접 다운로드 (안드로이드 브라우저 버그 우회용)
app.get('/api/card/vcf/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { lat, lng, date } = req.query;
    const cleanIdentifier = identifier.replace(/\.vcf$/i, '');
    let card = null;

    // card view와 동일하게: 커스텀 URL 먼저, 그 다음 ObjectId로 검색
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
      return res.status(404).send('명함을 찾을 수 없습니다.');
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
    
    // 맥락(위치, 시간) 자동 저장 로직
    let contextNote = '';
    if (date) {
      try {
        const formattedDate = new Date(date).toLocaleString('ko-KR');
        contextNote += `교환 일시: ${formattedDate}\\n`;
      } catch(e) {}
    }
    if (lat && lng && lat !== 'null' && lng !== 'null') {
      const addressName = await getAddressFromCoords(lat, lng);
      if (addressName) {
        contextNote += `만난 장소: ${addressName}\\n`;
      }
      contextNote += `지도 보기: https://map.kakao.com/link/map/${lat},${lng}\\n`;
    }
    
    let baseIntro = d.intro ? String(d.intro).replace(/\r?\n/g, '\\n') : '';
    if (contextNote) {
      baseIntro = contextNote + (baseIntro ? '\\n---\\n' + baseIntro : '');
    }
    if (baseIntro) lines.push(`NOTE:${baseIntro}`);
    
    // SNS 추가
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
    console.error('VCF 생성 오류:', err);
    res.status(500).send('서버 오류: ' + err.message);
  }
});

const { PKPass } = require('passkit-generator');

// Apple Wallet .pkpass 더미 다운로드
app.get('/api/card/pkpass/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanIdentifier = identifier.replace(/\.pkpass$/i, '');
    let card = null;

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
      return res.status(404).send('명함을 찾을 수 없습니다.');
    }

    const d = card.cardData || {};

    // 임시 더미 패스 생성 구조 (실제로는 인증서 파일 3종이 필요함)
    // 인증서가 없으므로 코드는 뼈대만 잡아두고 가짜 버퍼를 반환합니다.
    const dummyBuffer = Buffer.from('dummy pkpass content (requires real certificates)', 'utf-8');
    
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    const safeName = encodeURIComponent(d.name || 'card');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pkpass"`);
    res.send(dummyBuffer);

  } catch (err) {
    console.error('PKPass 처리 오류:', err);
    res.status(500).send('서버 오류: ' + err.message);
  }
});

// 신규 명함 개설
app.post('/api/card/create', async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
    }

    // 동시 요청 락 획득 대기 (최대 10초 대기)
    const lockKey = String(userId);
    let attempts = 0;
    while (creationLocks.has(lockKey) && attempts < 200) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    creationLocks.set(lockKey, true);

    try {
      // 1. 기존 비활성(편집되지 않은 빈) 명함 목록 조회
      const existingCards = await Card.find({ userId: new mongoose.Types.ObjectId(userId) });
      const inactiveCards = existingCards.filter(c => !isCardActive(c));

      // 2. 비활성 명함이 하나라도 존재한다면 그것을 재사용
      if (inactiveCards.length > 0) {
        const keepCard = inactiveCards[0];
        
        // 3. 만약 비활성(빈) 명함이 2개 이상이라면, 중복 생성된 것이므로 첫 번째만 남기고 나머지는 디비에서 영구 삭제
        if (inactiveCards.length > 1) {
          const idsToDelete = inactiveCards.slice(1).map(c => c._id);
          await Card.deleteMany({ _id: { $in: idsToDelete } });
          console.log(`[CLEANUP] Deleted ${idsToDelete.length} duplicate blank cards for user ${userId}`);
        }
        
        return res.json(keepCard);
      }

      // 4. 비활성 명함이 전혀 없다면 신규 생성
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
      // 락 해제
      creationLocks.delete(lockKey);
    }
  } catch (err) {
    res.status(500).json({ message: '명함 생성 실패', error: err.message });
  }
});

// 명함 삭제
app.delete('/api/card/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    // 관련된 통계 기록도 함께 삭제
    if (mongoose.models.CardAnalytics) {
      await mongoose.models.CardAnalytics.deleteMany({ cardId: req.params.cardId });
    }
    res.json({ message: '명함이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '명함 삭제 실패', error: err.message });
  }
});

// 명함 상세 정보 조회
app.get('/api/card-detail/:cardId', async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// 명함 상세 정보 저장/수정
app.post('/api/card/save/:cardId', async (req, res) => {
  const { cardData } = req.body;
  try {
    const existingCard = await Card.findById(req.params.cardId);
    if (!existingCard) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });

    let newGrade = existingCard.grade;
    let gradeChanged = false;
    
    // 즉시 연동: 사용자가 편집기에서 요금제를 바꿨다면 DB grade도 즉시 변경
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

    // ─── 캐시 무효화: 관리자 저장 후 방문자에게 최신 명함 즉시 노출 ──────────
    const userId = String(existingCard.userId);
    cache.clearCard(userId);
    cache.clearCard(req.params.cardId);
    if (cardData?.customCardUrl) cache.clearCard(cardData.customCardUrl);
    // 기존 customCardUrl도 제거 (URL 변경 시 이전 캐시도 삭제)
    if (existingCard.cardData?.customCardUrl) cache.clearCard(existingCard.cardData.customCardUrl);

    res.json({ message: '명함 정보가 안전하게 저장되었습니다.', cardData: card.cardData });
  } catch (err) {
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
});


// 명함 데이터 저장/수정 (Legacy)
app.post('/api/card', async (req, res) => {
  const { userId, cardData } = req.body;
  const timestamp = new Date().toISOString();
  
  try {
    // 저장 요청 시작
    
    if (!userId) {
      return res.status(400).json({ message: '사용자 ID가 없습니다.' });
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
    
    // ─── 명함 저장 후 캐시 무효화 (사용자 ID 기반 캐시 삭제) ──────────
    cache.clearCard(userId);
    if (cardData?.customCardUrl) cache.clearCard(cardData.customCardUrl);
    res.json({ message: '명함 정보가 안전하게 저장되었습니다.', cardData: updatedCard.cardData });
  } catch (err) {
    // 저장 실패
    res.status(500).json({ message: '저장 실패', error: err.message });
  }
});

// 커스텀 URL 또는 사용자 ID로 명함 조회 (공개용)
app.get('/api/card/view/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    // ─── 캐시 히트 ─────────────────────────────────────────────
    const cached = cache.getCard(identifier);
    if (cached) return res.json(cached);

    let card = null;
    
    // 1. 커스텀 URL로 먼저 검색
    card = await Card.findOne({ "cardData.customCardUrl": identifier });
    
    // 2. 검색 결과가 없고 identifier가 유효한 ObjectId 형식이면 ID로 검색 (미리보기용)
    if (!card && mongoose.Types.ObjectId.isValid(identifier)) {
      card = await Card.findOne({
        $or: [
          { _id: new mongoose.Types.ObjectId(identifier) },
          { userId: new mongoose.Types.ObjectId(identifier) }
        ]
      });
    }

    if (card) {
      if (card.isRevoked) {
        return res.status(403).json({ isRevoked: true, message: '이 명함은 회사 관리자에 의해 무효화(정지)되었습니다.' });
      }
      
      // PublicCard 에서 등급(grade)별 광고 노출 여부 등을 판단할 수 있도록 productType 주입
      const responseData = Object.assign({}, card.cardData, { productType: card.grade || 'general' });
      // ─── 캐시 저장 ───────────────────────────────────────────
      cache.setCard(identifier, responseData);
      res.json(responseData);
    } else {
      res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});


// 무통장 입금// ==========================================
// [인맥로그 (Network Log) API]
// ==========================================

// 인맥 조회
app.get('/api/logs/:userId', async (req, res) => {
  try {
    const logs = await NetworkLog.find({ userId: req.params.userId }).sort({ metAt: -1, createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: '인맥 조회 실패' });
  }
});

// 인맥 추가
app.post('/api/logs', async (req, res) => {
  try {
    const { userId, name, company, position, phone, email, tags, memo, metAt } = req.body;
    const log = await NetworkLog.create({
      userId, name, company, position, phone, email, tags, memo, metAt
    });
    res.json({ message: '인맥이 추가되었습니다.', log });
  } catch (err) {
    res.status(500).json({ message: '인맥 추가 실패', error: err.message });
  }
});

// 인맥 수정
app.put('/api/logs/:id', async (req, res) => {
  try {
    const log = await NetworkLog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: '수정 완료', log });
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
});

// 인맥 삭제
app.delete('/api/logs/:id', async (req, res) => {
  try {
    await NetworkLog.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패' });
  }
});

// 무통장입금 반려
app.put('/api/admin/payment/reject/:cardId', async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      {
        paymentStatus: 'none',
        depositorName: '',
        paymentAmount: 0,
        paymentMethod: '무통장 입금',
        requestedGrade: '',
        requestedDuration: 0,
        paymentRequestDate: null
      },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    res.json({ message: '반려 처리 완료', card });
  } catch (err) {
    res.status(500).json({ message: '반려 실패', error: err.message });
  }
});

// ==========================================
// [통계분석 (Analytics) API]
// ==========================================

// 이벤트 추적 기록 (PublicCard에서 호출)
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
    // 트래킹 에러는 클라이언트에 500을 주지 않고 조용히 넘어가는 것이 좋음
    console.error('Analytics tracking error:', err);
    res.status(200).json({ success: false });
  }
});

// 통계 데이터 집계 조회 (Analytics 대시보드용)
app.get('/api/analytics/stats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // 1. 전체 요약 지표
    const totalViews = await CardAnalytics.countDocuments({ userId, actionType: 'view' });
    const totalSaves = await CardAnalytics.countDocuments({ userId, actionType: 'save_contact' });
    
    // 2. 날짜별 조회수 (최근 30일)
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

    // 3. 유입 경로 (Source) 비율
    const sourceStats = await CardAnalytics.aggregate([
      { $match: { userId: String(userId), actionType: 'view' } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 4. 링크 클릭 순위
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
    res.status(500).json({ message: '통계 조회 실패', error: err.message });
  }
});

// [결제 API]
app.post('/api/payment/request', async (req, res) => {
  const { cardId, depositorName, paymentAmount, paymentMethod, requestedGrade, requestedDuration } = req.body;
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      {
        paymentStatus: 'pending',
        depositorName,
        paymentAmount,
        paymentMethod: paymentMethod || '무통장 입금',
        requestedGrade,
        requestedDuration,
        paymentRequestDate: new Date()
      },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    res.json({ message: '무통장 입금 신청 완료', card });
  } catch (err) {
    res.status(500).json({ message: '신청 실패', error: err.message });
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
    const activeCards = cards.filter(isCardActive);
    const result = activeCards.map(c => ({
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
    const cards = await Card.find({ userId: req.params.userId });
    const card = cards.find(isCardActive) || cards[0];
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    
    card.cardData.customCardUrl = customCardUrl;
    card.cardData.status = status || 'published';
    card.isEdited = true;
    card.updatedAt = new Date();
    card.markModified('cardData');
    await card.save();
    
    res.json({ message: '발행 완료', customCardUrl });
  } catch (err) {
    res.status(500).json({ message: '발행 실패' });
  }
});

// 전체 회원 목록
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
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
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

// ==========================================
// [B2B API] 기업 관리자 대시보드 연동
// ==========================================

// 1. 회사 정보 조회
app.get('/api/b2b/company', async (req, res) => {
  const { userId } = req.query;
  try {
    let company = await Company.findOne({ adminId: userId });
    if (!company) {
      // 없으면 임시 빈값 반환
      return res.json({ companyName: '', logoUrl: '', themeColor: '#db2777', address: '' });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: '회사 조회 실패' });
  }
});

// 2. 회사 템플릿 마스터 설정 저장
app.post('/api/b2b/company/setup', async (req, res) => {
  const { userId, companyName, logoUrl, themeColor, address } = req.body;
  try {
    let company = await Company.findOne({ adminId: userId });
    if (!company) {
      company = await Company.create({ adminId: userId, companyName, logoUrl, themeColor, address });
    } else {
      company.companyName = companyName;
      company.logoUrl = logoUrl;
      company.themeColor = themeColor;
      company.address = address;
      await company.save();
    }
    // 마스터의 권한을 company_admin으로 승격, 소속 회사 연결
    await User.findByIdAndUpdate(userId, { role: 'company_admin', companyId: company._id });
    res.json({ message: '설정 완료', company });
  } catch (err) {
    res.status(500).json({ message: '설정 실패', error: err.message });
  }
});

// 3. 직원 목록 조회
app.get('/api/b2b/employees', async (req, res) => {
  const { userId } = req.query;
  try {
    const company = await Company.findOne({ adminId: userId });
    if (!company) return res.json([]);
    
    const employees = await User.find({ companyId: company._id, role: 'employee' });
    const empIds = employees.map(e => e._id);
    const cards = await Card.find({ userId: { $in: empIds } });

    const result = employees.map(emp => {
      const card = cards.find(c => String(c.userId) === String(emp._id));
      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        createdAt: emp.createdAt,
        cardId: card ? card._id : null,
        customCardUrl: card ? card.cardData?.customCardUrl : null,
        isRevoked: card ? card.isRevoked : false
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '직원 조회 실패' });
  }
});

// 4. 새 직원 및 명함 즉시 발급
app.post('/api/b2b/employee/create', async (req, res) => {
  const { userId, employees } = req.body; // employees 배열 (단건 or 일괄)
  try {
    const company = await Company.findOne({ adminId: userId });
    if (!company) return res.status(404).json({ message: '회사 설정을 먼저 완료해주세요.' });

    for (let emp of employees) {
      // 1) 유저 생성 (비밀번호 기본값 1234)
      const newUser = await User.create({
        name: emp.name,
        email: emp.email,
        password: '1234', // 실무에선 해싱 필요
        phone: emp.phone || '',
        role: 'employee',
        companyId: company._id
      });
      // 2) 기업전용 프리미엄 명함 생성
      const initialCardData = {
        name: emp.name,
        nameEng: '',
        email: emp.email,
        phoneWork: emp.phone || '',
        company: company.companyName,
        department: emp.department || '',
        jobTitle: emp.position || '',
        address: company.address,
        logoUrl: company.logoUrl,
        themeColor: company.themeColor,
        theme: 'corporate', // 기업 템플릿
        status: 'published',
        customCardUrl: `b2b-${newUser._id.toString().slice(-6)}` // 임시 URL
      };
      await Card.create({
        userId: newUser._id,
        companyId: company._id,
        grade: 'corporate',
        cardData: initialCardData
      });
    }
    res.json({ message: '임직원 명함 발급 완료' });
  } catch (err) {
    res.status(500).json({ message: '발급 실패', error: err.message });
  }
});

// 5. 퇴사자 명함 무효화 (접근 차단) / 복구
app.post('/api/b2b/employee/revoke/:cardId', async (req, res) => {
  // 인증 로직 생략 (B2B 대시보드 권한)
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    
    card.isRevoked = !card.isRevoked; // 토글
    await card.save();
    
    // 캐시 삭제 (index.js 상단의 cache 모듈 사용)
    const identifier = card.cardData?.customCardUrl || card._id;
    cache.deleteCard(identifier);

    res.json({ message: card.isRevoked ? '정지 완료' : '활성화 완료' });
  } catch (err) {
    res.status(500).json({ message: '상태 변경 실패' });
  }
});

// 회원 정보 수정
app.put('/api/admin/user/:userId', async (req, res) => {
  const { name, email, phone, role, grade, expiryDate, paymentStatus, paymentDate, paymentMethod } = req.body;
  try {
    // 1. 유저 정보 업데이트
    await User.findByIdAndUpdate(req.params.userId, { name, email, phone, role });
    
    // 2. 카드 정보 업데이트
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
    
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '수정 실패', error: err.message });
  }
});

// 무통장 입금 승인
app.put('/api/admin/payment/approve/:cardId', async (req, res) => {
  const { duration } = req.body;
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    
    const months = duration || card.requestedDuration || 12;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    
    card.grade = card.requestedGrade || 'premium_nfc';
    card.paymentStatus = 'confirmed';
    card.paymentDate = new Date();
    card.expiryDate = expiryDate;
    
    await card.save();
    res.json({ message: '승인 완료', card });
  } catch (err) {
    res.status(500).json({ message: '승인 실패', error: err.message });
  }
});

// 무통장 입금 반려
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
    if (!card) return res.status(404).json({ message: '명함을 찾을 수 없습니다.' });
    res.json({ message: '반려 완료', card });
  } catch (err) {
    res.status(500).json({ message: '반려 실패', error: err.message });
  }
});

// 어드민 알림 수 조회 (대기 명함, 신규 문의)
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
    res.status(500).json({ message: '알림 조회 실패', error: err.message });
  }
});

// 제휴 및 도입 문의 목록 조회
app.get('/api/admin/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
});

// 문의사항 읽음 처리
app.put('/api/admin/inquiry/:id/read', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!inquiry) return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    res.json({ message: '읽음 처리 완료', inquiry });
  } catch (err) {
    res.status(500).json({ message: '처리 실패', error: err.message });
  }
});

// ==========================================
// 관리자 요금 변경 내역
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
    res.status(500).json({ message: '요금 변경 내역 조회 실패', error: err.message });
  }
});

app.put('/api/admin/plan-changes/read', async (req, res) => {
  try {
    await PlanChange.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ message: '모든 알림 읽음 처리 완료' });
  } catch (err) {
    res.status(500).json({ message: '알림 상태 업데이트 실패', error: err.message });
  }
});

// ==========================================
// 관리자 요금 변경 내역
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
    res.status(500).json({ message: '요금 변경 내역 조회 실패', error: err.message });
  }
});

app.put('/api/admin/plan-changes/read', async (req, res) => {
  try {
    await PlanChange.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.json({ message: '모두 읽음 처리 완료' });
  } catch (err) {
    res.status(500).json({ message: '상태 업데이트 실패', error: err.message });
  }
});

// 요금 변경 내역 삭제
app.delete('/api/admin/plan-changes/:id', async (req, res) => {
  try {
    await PlanChange.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
  }
});

// 문의사항 삭제
app.delete('/api/admin/inquiry/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: '문의를 찾을 수 없습니다.' });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패', error: err.message });
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
  const products = await Product.find().sort({ order: 1 });
  res.json(products);
});

// 상품 순서 변경
app.put('/api/admin/products/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  try {
    const promises = orderedIds.map((id, index) => 
      Product.findOneAndUpdate({ id }, { order: index })
    );
    await Promise.all(promises);
    res.json({ message: '순서 변경 완료' });
  } catch (err) {
    res.status(500).json({ message: '순서 변경 실패' });
  }
});

app.post('/api/admin/products', async (req, res) => {
  const { name, description, price, features, sampleUrl, tags } = req.body;
  const product = await Product.create({ 
    id: 'prod_' + Date.now(), 
    name, 
    description,
    tags: Array.isArray(tags) ? tags : [],
    sampleUrl: sampleUrl || '',
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
  const { name, description, price, features, sampleUrl, tags } = req.body;
  await Product.findOneAndUpdate({ id: req.params.id }, { 
    name, 
    description, 
    tags: Array.isArray(tags) ? tags : [],
    sampleUrl: sampleUrl || '',
    price: price || { annual: 0, threeMonths: 0, twoMonths: 0 }, 
    features 
  });
  res.json({ message: '수정 완료' });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  await Product.findOneAndDelete({ id: req.params.id });
  res.json({ message: '삭제 완료' });
});

// [설정 API]
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
  res.json({ message: '광고 설정 저장 완료' });
});

// [랜딩페이지 API]
app.get('/api/landing-content', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'landing_content' });
    if (setting) res.json(setting.value);
    else res.status(404).json({ message: '없음' });
  } catch (err) { res.status(500).json({ message: '실패' }); }
});

app.put('/api/landing-content', async (req, res) => {
  try {
    await Setting.findOneAndUpdate(
      { key: 'landing_content' },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ message: '저장완료' });
  } catch (err) { 
    console.error('[LANDING_SAVE_ERROR]', err);
    res.status(500).json({ message: '실패' }); 
  }
});

// [명함 랜딩페이지 API]
app.get('/api/namecard-landing-content', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'namecard_landing_content' });
    if (setting) res.json(setting.value);
    else res.status(404).json({ message: '없음' });
  } catch (err) { res.status(500).json({ message: '실패' }); }
});

app.put('/api/namecard-landing-content', async (req, res) => {
  try {
    await Setting.findOneAndUpdate(
      { key: 'namecard_landing_content' },
      { $set: { value: req.body } },
      { upsert: true, new: true }
    );
    res.json({ message: '저장완료' });
  } catch (err) {
    console.error('[NAMECARD_LANDING_SAVE_ERROR]', err);
    res.status(500).json({ message: '실패' });
  }
});

// [문의사항 API]
app.post('/api/inquiry', async (req, res) => {
  try {
    const { name, phone, email, type, content } = req.body;
    if (!name || !phone || !email || !content) {
      return res.status(400).json({ message: '모든 필수 항목을 입력해 주세요.' });
    }
    const newInquiry = await Inquiry.create({ name, phone, email, type: type || 'general', content });
    console.log('[INQUIRY_RECEIVED]', newInquiry);
    res.status(201).json({ message: '성공' });
  } catch (err) {
    console.error('[INQUIRY_ERROR]', err);
    res.status(500).json({ message: '실패' });
  }
});

// ==========================================
// [NFC API] NFC 카드 동적 맵핑 시스템
// ==========================================
app.get('/api/nfc/check/:serialNumber', async (req, res) => {
  try {
    const nfc = await NfcCard.findOne({ serialNumber: req.params.serialNumber }).populate('mappedCardId');
    if (!nfc) return res.status(404).json({ message: '등록되지 않은 일련번호입니다.' });
    if (nfc.status === 'mapped' && nfc.mappedCardId) {
      const cardUrl = nfc.mappedCardId.customCardUrl || nfc.mappedCardId._id;
      return res.json({ status: 'mapped', cardUrl });
    }
    return res.json({ status: nfc.status });
  } catch (err) {
    res.status(500).json({ message: 'NFC 조회 실패' });
  }
});

app.post('/api/b2b/nfc/assign', async (req, res) => {
  const { companyUserId, employeeCardId, serialNumber } = req.body;
  try {
    const company = await Company.findOne({ adminId: companyUserId });
    if (!company) return res.status(403).json({ message: '권한 없음' });

    let nfc = await NfcCard.findOne({ serialNumber });
    if (!nfc) {
      // 데모를 위해 등록되지 않은 번호면 자동으로 빈 카드 데이터 생성
      nfc = await NfcCard.create({ serialNumber, pinCode: '1234', status: 'blank' });
    }

    nfc.mappedCardId = employeeCardId;
    nfc.companyId = company._id;
    nfc.status = 'mapped';
    await nfc.save();

    res.json({ message: 'NFC 카드 할당 완료', nfc });
  } catch (err) {
    res.status(500).json({ message: '할당 실패: ' + err.message });
  }
});

// ==========================================
// [Connection API] 자체 명함첩 연동
// ==========================================
app.post('/api/connections/save', async (req, res) => {
  const { userId, savedCardId, lat, lng } = req.body;
  try {
    const existing = await Connection.findOne({ userId, savedCardId });
    if (existing) {
      return res.status(400).json({ message: '이미 명함첩에 저장되어 있습니다.' });
    }
    
    let meetingAddress = '';
    if (lat && lng) {
      meetingAddress = await getAddressFromCoords(lat, lng);
    }
    
    const newConnection = await Connection.create({ 
      userId, 
      savedCardId, 
      lat: lat || null, 
      lng: lng || null, 
      meetingAddress 
    });
    res.json({ message: '명함이 성공적으로 저장되었습니다.', connection: newConnection });
  } catch (err) {
    res.status(500).json({ message: '저장 실패: ' + err.message });
  }
});

app.get('/api/connections/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({ userId: req.params.userId })
      .populate('savedCardId')
      .sort({ savedAt: -1 });
    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: '조회 실패' });
  }
});

app.put('/api/connections/:id', async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(
      req.params.id, 
      { memo: req.body.memo }, 
      { new: true }
    );
    res.json(conn);
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
});

app.delete('/api/connections/:id', async (req, res) => {
  try {
    await Connection.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 실패' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

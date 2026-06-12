import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Save, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, RefreshCw, CheckCircle2, Loader2, Globe,
  Type, Image, List, DollarSign, Megaphone, LayoutTemplate, Palette, HelpCircle, MessageSquare,
  FileText
} from 'lucide-react';
import './AdminLandingEditor.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

// ── 기본 콘텐츠 (API 실패 시 폴백) ──
const DEFAULT_CONTENT = {
  nav: { logo: 'NextCard', logoSub: '.kr', links: ['기능소개', '요금제'] },
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
  featuresSection: {
    title: '스마트한 명함의 기준',
    desc: '종이 명함이 담지 못하는 무한한 가능성을 경험하세요.'
  },
  features: [
    { icon: '📱', title: '모바일 최적화', desc: '모든 스마트폰 기기에서 완벽하게 표현되는 반응형 디자인을 제공합니다.' },
    { icon: '🔗', title: '빠른 공유', desc: 'QR 코드, 링크 하나로 장소에 상관없이 명함을 전달할 수 있습니다.' },
    { icon: '✏️', title: '자유로운 편집', desc: '언제 어디서든 실시간으로 명함 내용을 수정하고 관리할 수 있습니다.' },
    { icon: '📊', title: '실시간 통계', desc: '내 명함이 얼마나 조회되었는지, 어떤 링크가 클릭되었는지 확인하세요.' }
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
  },
  faq: {
    badge: 'FAQ',
    title: '자주 묻는 질문',
    desc: '디지털명함을 만들기 전에 알아야 할 모든 것.',
    items: []
  },
  reviews: {
    title: '고객들이 전하는 진짜 이야기',
    items: []
  },
  samplesSection: {
    title: '다양한 명함 샘플',
    desc: '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.'
  },
  samples: [
    { title: '비즈니스 스타일', imgUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop' },
    { title: '프리랜서 스타일', imgUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop' },
    { title: '퍼스널 브랜딩', imgUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop' }
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
  colors: {
    pageBg: '#0f172a',
    partnersBg: '#0f172a',
    primary: '#db2777',
    secondary: '#7c3aed',
    heroTitle: '#f8fafc',
    heroDesc: '#94a3b8',
    cardBg: '#1e293b',
    navBg: '#0f172a',
    footerBg: '#0f172a',
    ctaBg1: '#db2777',
    ctaBg2: '#7c3aed'
  }
};

// ── 헬퍼: 깊은 복사 ──
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ── 섹션 헤더 컴포넌트 ──
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="ale-section-header">
    <div className="ale-section-icon">{icon}</div>
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  </div>
);

// ── 입력 컴포넌트 ──
const Field = ({ label, value, onChange, type = 'text', placeholder, multiline }) => (
  <div className="ale-field">
    <label>{label}</label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

const ImageField = ({ label, value, onChange }) => {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('이미지 용량이 너무 큽니다 (최대 15MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (file.size < 100 * 1024) { // Under 100KB
        onChange(ev.target.result);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outType === 'image/jpeg' ? 0.8 : undefined;
        onChange(canvas.toDataURL(outType, quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="ale-field">
      <label>{label}</label>
      <div className="ale-image-input-group">
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="이미지 URL을 입력하거나 파일을 선택하세요" />
        <label className="btn-upload">
          <Image size={14} /> 파일 선택
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 1: 네비게이션 편집기
// ════════════════════════════════════
const NavEditor = ({ data, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="ale-block">
      <SectionHeader icon={<Globe size={20}/>} title="네비게이션 바 및 파비콘" subtitle="로고 텍스트와 메뉴 링크, 사이트 파비콘(아이콘)을 수정합니다." />
      <div className="ale-fields-row">
        <Field label="로고 텍스트" value={data.logo} onChange={v => update('logo', v)} placeholder="NextCard" />
        <Field label="로고 서브텍스트" value={data.logoSub} onChange={v => update('logoSub', v)} placeholder=".me" />
      </div>
      <div className="ale-field-group" style={{ marginTop: '16px' }}>
        <h3 className="field-group-title">파비콘 설정</h3>
        <ImageField label="파비콘 이미지 (1:1 비율 권장, 투명 배경 PNG/ICO)" value={data.faviconUrl} onChange={v => update('faviconUrl', v)} />
        {data.faviconUrl && (
          <div className="ale-img-preview" style={{ width: '64px', height: '64px', marginTop: '10px', background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <img src={data.faviconUrl} alt="파비콘 미리보기" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 2: 히어로 편집기
// ════════════════════════════════════
const HeroEditor = ({ data, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="ale-block">
      <SectionHeader icon={<Type size={20}/>} title="히어로 섹션 (첫 화면)" subtitle="방문자가 가장 먼저 보는 강렬한 문구와 이미지를 설정합니다." />
      
      <div className="ale-field-group">
        <h3 className="field-group-title">🏷️ 메인 문구 설정</h3>
        <Field label="배지 텍스트" value={data.badge} onChange={v => update('badge', v)} placeholder="예: 2026년형 스마트 명함 출시" />
        <Field label="메인 타이틀 (강조하고 싶은 곳에서 \n 입력)" value={data.title} onChange={v => update('title', v)} multiline placeholder="종이 명함 대신,\n스마트한 디지털 프로필" />
        <Field label="보조 설명 문구" value={data.desc} onChange={v => update('desc', v)} multiline placeholder="서비스의 핵심 가치를 한 문장으로 설명하세요." />
      </div>

      <div className="ale-field-group">
        <h3 className="field-group-title">🖱️ 버튼 액션</h3>
        <div className="ale-fields-row">
          <Field label="메인 버튼 이름" value={data.primaryBtn} onChange={v => update('primaryBtn', v)} />
          <Field label="메인 버튼 링크 URL" value={data.primaryBtnUrl || ''} onChange={v => update('primaryBtnUrl', v)} placeholder="예: /signup 또는 https://외부링크" />
        </div>
        <div className="ale-fields-row" style={{ marginTop: '12px' }}>
          <Field label="서브 버튼 이름" value={data.secondaryBtn} onChange={v => update('secondaryBtn', v)} />
          <Field label="서브 버튼 링크 URL" value={data.secondaryBtnUrl || ''} onChange={v => update('secondaryBtnUrl', v)} placeholder="예: #contact 또는 /about" />
        </div>
      </div>

      <div className="ale-field-group">
        <h3 className="field-group-title">📸 비주얼 요소</h3>
        <ImageField label="대표 목업 이미지" value={data.mockupImg} onChange={v => update('mockupImg', v)} />
        <p className="field-help">이미지 URL을 입력하거나 파일을 업로드하세요. 권장 비율은 16:9입니다.</p>
        {data.mockupImg && (
          <div className="ale-img-preview">
            <img src={data.mockupImg} alt="미리보기" />
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 3: 기능 카드 편집기
// ════════════════════════════════════
const FeaturesEditor = ({ 
  sectionData = { title: '스마트한 명함의 기준', desc: '종이 명함이 담지 못하는 무한한 가능성을 경험하세요.' }, 
  featuresData = [], 
  onChangeSection, 
  onChangeFeatures 
}) => {
  const updateSection = (key, val) => onChangeSection({ ...sectionData, [key]: val });
  
  const addItem = () => onChangeFeatures([...featuresData, { title: '새 기능', desc: '기능 설명을 입력하세요.' }]);
  const removeItem = (i) => onChangeFeatures(featuresData.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => {
    const next = deepClone(featuresData);
    next[i][key] = val;
    onChangeFeatures(next);
  };
  const moveItem = (i, dir) => {
    const next = deepClone(featuresData);
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChangeFeatures(next);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<List size={20}/>} title="기능 소개 관리" subtitle="랜딩 페이지의 기능 소개 문구와 카드를 편집합니다." />
      
      {/* 문구 편집 영역 */}
      <div className="ale-field-group" style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 className="field-group-title">✍️ 섹션 타이틀 및 설명 설정</h4>
        <div className="ale-fields-row">
          <Field label="섹션 대제목" value={sectionData.title || ''} onChange={v => updateSection('title', v)} placeholder="스마트한 명함의 기준" />
        </div>
        <Field label="섹션 소설명" value={sectionData.desc || ''} onChange={v => updateSection('desc', v)} placeholder="종이 명함이 담지 못하는 무한한 가능성을 경험하세요." />
      </div>

      {/* 카드 리스트 편집 영역 */}
      <div className="ale-field-group">
        <h4 className="field-group-title">🎴 기능 카드 리스트 ({featuresData.length}개)</h4>
        {featuresData.map((feat, i) => (
          <div key={i} className="ale-list-item">
            <div className="ale-list-item-controls">
              <span className="ale-item-num">{i + 1}</span>
              <button onClick={() => moveItem(i, -1)} className="btn-move" disabled={i === 0}><ChevronUp size={14}/></button>
              <button onClick={() => moveItem(i, 1)} className="btn-move" disabled={i === featuresData.length - 1}><ChevronDown size={14}/></button>
              <button onClick={() => removeItem(i)} className="btn-delete"><Trash2 size={14}/></button>
            </div>
            <div className="ale-list-item-fields">
              <Field label="제목" value={feat.title} onChange={v => updateItem(i, 'title', v)} placeholder="기능명" />
              <Field label="설명" value={feat.desc} onChange={v => updateItem(i, 'desc', v)} multiline placeholder="기능 설명을 입력하세요..." style={{ marginTop: '10px' }} />
            </div>
          </div>
        ))}
        <button className="btn-add-item" onClick={addItem} style={{ marginTop: '20px', width: '100%' }}>
          <Plus size={16}/> 새 기능 카드 추가
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 4: 요금제 편집기
// ════════════════════════════════════
const PricingEditor = ({ data, onChange }) => {
  const addPlan = () => onChange([...data, { name: '새 플랜', price: '0', period: '월', features: ['기능 1'], btn: '시작하기', linkUrl: '/signup', popular: false }]);
  const removePlan = (i) => onChange(data.filter((_, idx) => idx !== i));
  const updatePlan = (i, key, val) => {
    const next = deepClone(data);
    next[i][key] = val;
    onChange(next);
  };
  const addFeature = (i) => {
    const next = deepClone(data);
    next[i].features.push('새 항목');
    onChange(next);
  };
  const updateFeature = (i, j, val) => {
    const next = deepClone(data);
    next[i].features[j] = val;
    onChange(next);
  };
  const removeFeature = (i, j) => {
    const next = deepClone(data);
    next[i].features.splice(j, 1);
    onChange(next);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<DollarSign size={20}/>} title="요금제 플랜" subtitle="각 요금제의 이름, 가격, 포함 기능 목록을 설정합니다." />
      {data.map((plan, i) => (
        <div key={i} className={`ale-pricing-item ${plan.popular ? 'popular' : ''}`}>
          <div className="ale-pricing-head">
            <span className="ale-item-num">{plan.popular ? '⭐ 추천' : `플랜 ${i+1}`}</span>
            <div className="ale-pricing-head-actions">
              <label className="ale-toggle">
                <input type="checkbox" checked={plan.popular} onChange={e => updatePlan(i, 'popular', e.target.checked)} />
                <span>추천 표시</span>
              </label>
              <button onClick={() => removePlan(i)} className="btn-delete"><Trash2 size={14}/></button>
            </div>
          </div>

          <div className="ale-field-group">
            <h4 className="field-group-title">💳 플랜 기본 정보</h4>
            <div className="ale-fields-row">
              <Field label="플랜 이름" value={plan.name} onChange={v => updatePlan(i, 'name', v)} />
              <Field label="가격" value={plan.price} onChange={v => updatePlan(i, 'price', v)} placeholder="9,900 또는 문의" />
              <Field label="기간" value={plan.period} onChange={v => updatePlan(i, 'period', v)} placeholder="월" />
            </div>
            <div className="ale-fields-row">
              <Field label="버튼 텍스트" value={plan.btn} onChange={v => updatePlan(i, 'btn', v)} />
              <Field label="버튼 링크 URL" value={plan.linkUrl || ''} onChange={v => updatePlan(i, 'linkUrl', v)} placeholder="예: /signup 또는 https://외부링크 또는 #contact" />
            </div>
          </div>

          <div className="ale-field-group">
            <h4 className="field-group-title">✅ 포함 기능 리스트</h4>
            <p className="field-help">각 요금제에 포함될 혜택을 입력하세요.</p>
            <div className="ale-feature-list">
              {plan.features.map((feat, j) => (
                <div key={j} className="ale-feature-row">
                  <input value={feat} onChange={e => updateFeature(i, j, e.target.value)} />
                  <button onClick={() => removeFeature(i, j)} className="btn-delete-sm"><Trash2 size={12}/></button>
                </div>
              ))}
              <button className="btn-add-feature" onClick={() => addFeature(i)}><Plus size={12}/> 항목 추가</button>
            </div>
          </div>
        </div>
      ))}
      <button className="btn-add-item" onClick={addPlan}>
        <Plus size={16}/> 요금제 플랜 추가
      </button>
    </div>
  );
};

// ════════════════════════════════════
//  블록 5: CTA 편집기
// ════════════════════════════════════
const CtaEditor = ({ data, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="ale-block">
      <SectionHeader icon={<Megaphone size={20}/>} title="CTA (행동 유도) 섹션" subtitle="페이지 하단의 가입 유도 배너를 수정합니다." />
      <Field label="제목" value={data.title} onChange={v => update('title', v)} multiline />
      <Field label="설명 문구" value={data.desc} onChange={v => update('desc', v)} />
      <div className="ale-fields-row">
        <Field label="버튼 텍스트" value={data.btn} onChange={v => update('btn', v)} />
        <Field label="버튼 링크 URL" value={data.btnUrl || ''} onChange={v => update('btnUrl', v)} placeholder="예: /signup 또는 https://외부링크" />
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 6.5: 명함 샘플 편집기
// ════════════════════════════════════
const SamplesEditor = ({ 
  sectionData = { title: '다양한 명함 샘플', desc: '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.' }, 
  samplesData = [], 
  onChangeSection, 
  onChangeSamples 
}) => {
  const updateSection = (key, val) => onChangeSection({ ...sectionData, [key]: val });
  
  const addItem = () => onChangeSamples([...samplesData, { title: '새 샘플', imgUrl: '', linkUrl: '' }]);
  const removeItem = (i) => onChangeSamples(samplesData.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => {
    const next = deepClone(samplesData);
    next[i][key] = val;
    onChangeSamples(next);
  };
  const moveItem = (i, dir) => {
    const next = deepClone(samplesData);
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChangeSamples(next);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<Image size={20}/>} title="명함 샘플 관리" subtitle="랜딩 페이지의 명함 샘플 소개 문구와 이미지들을 관리합니다." />
      
      {/* 문구 편집 영역 */}
      <div className="ale-field-group" style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 className="field-group-title">✍️ 섹션 타이틀 및 설명 설정</h4>
        <div className="ale-fields-row">
          <Field label="섹션 대제목" value={sectionData.title || ''} onChange={v => updateSection('title', v)} placeholder="예: 다양한 명함 샘플" />
        </div>
        <Field label="섹션 소설명" value={sectionData.desc || ''} onChange={v => updateSection('desc', v)} placeholder="예: 나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요." />
      </div>

      {/* 샘플 리스트 편집 영역 */}
      <div className="ale-field-group">
        <h4 className="field-group-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🖼️ 명함 샘플 리스트 ({samplesData.length}개)</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>※ 가로형 레이아웃으로 표시됩니다.</span>
        </h4>
        
        <div className="ale-samples-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '16px'
        }}>
          {samplesData.map((sample, i) => (
            <div key={i} className="ale-list-item" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              position: 'relative'
            }}>
              <div className="ale-list-item-controls" style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '4px',
                zIndex: 10
              }}>
                <button onClick={() => moveItem(i, -1)} className="btn-move" disabled={i === 0} style={{ padding: '4px' }}><ChevronUp size={14}/></button>
                <button onClick={() => moveItem(i, 1)} className="btn-move" disabled={i === samplesData.length - 1} style={{ padding: '4px' }}><ChevronDown size={14}/></button>
                <button onClick={() => removeItem(i)} className="btn-delete" style={{ padding: '4px', color: '#ef4444' }}><Trash2 size={14}/></button>
              </div>

              <div className="ale-list-item-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '16px' }}>
                <span className="ale-item-num" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#db2777' }}>샘플 #{i + 1}</span>
                <Field label="샘플 제목" value={sample.title} onChange={v => updateItem(i, 'title', v)} placeholder="예: 비즈니스 스타일" />
                <Field label="클릭 시 이동할 링크 URL" value={sample.linkUrl || ''} onChange={v => updateItem(i, 'linkUrl', v)} placeholder="예: /signup or https://naver.com" />
                <ImageField label="샘플 이미지 URL" value={sample.imgUrl} onChange={v => updateItem(i, 'imgUrl', v)} />
                {sample.imgUrl ? (
                  <div className="ale-img-preview" style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    aspectRatio: '16/10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a'
                  }}>
                    <img src={sample.imgUrl} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    aspectRatio: '16/10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.8rem'
                  }}>
                    이미지 주소를 입력하세요
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-add-item" onClick={addItem} style={{ marginTop: '20px', width: '100%' }}>
          <Plus size={16}/> 새 샘플 카드 추가
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 6.55: 주요 기업 거래처 편집기
// ════════════════════════════════════
const PartnersEditor = ({ 
  sectionData = { title: '주요 기업 거래처' }, 
  logosData = [], 
  onChangeSection, 
  onChangeLogos 
}) => {
  const updateSection = (key, val) => onChangeSection({ ...sectionData, [key]: val });
  
  const addItem = () => onChangeLogos([...logosData, { name: '새 거래처', imgUrl: '' }]);
  const removeItem = (i) => onChangeLogos(logosData.filter((_, idx) => idx !== i));
  const updateItem = (i, key, val) => {
    const next = deepClone(logosData);
    next[i][key] = val;
    onChangeLogos(next);
  };
  const moveItem = (i, dir) => {
    const next = deepClone(logosData);
    const swap = i + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    onChangeLogos(next);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<Globe size={20}/>} title="주요 기업 거래처 관리" subtitle="인기 디지털 명함 샘플 블록 아래에 표시될 주요 거래처 로고들을 관리합니다." />
      
      {/* 문구 편집 영역 */}
      <div className="ale-field-group" style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 className="field-group-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span>✍️ 섹션 타이틀 설정</span>
          <span style={{ fontSize: '0.75rem', color: '#db2777', fontWeight: 'normal' }}>※ 텍스트를 모두 지우면 랜딩페이지에서 제목 영역이 사라집니다.</span>
        </h4>
        <Field label="섹션 제목" value={sectionData.title ?? ''} onChange={v => updateSection('title', v)} placeholder="예: 주요 기업 거래처" />
      </div>

      {/* 로고 리스트 편집 영역 */}
      <div className="ale-field-group">
        <h4 className="field-group-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🏢 거래처 로고 리스트 ({logosData.length}개)</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'normal' }}>※ 가로로 나란히 나열하여 편리하게 편집할 수 있습니다.</span>
        </h4>
        
        <div className="ale-partners-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '16px'
        }}>
          {logosData.map((logo, i) => (
            <div key={i} className="ale-list-item" style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              position: 'relative'
            }}>
              <div className="ale-list-item-controls" style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '4px',
                zIndex: 10
              }}>
                <button onClick={() => moveItem(i, -1)} className="btn-move" disabled={i === 0} style={{ padding: '4px' }}><ChevronUp size={14}/></button>
                <button onClick={() => moveItem(i, 1)} className="btn-move" disabled={i === logosData.length - 1} style={{ padding: '4px' }}><ChevronDown size={14}/></button>
                <button onClick={() => removeItem(i)} className="btn-delete" style={{ padding: '4px', color: '#ef4444' }}><Trash2 size={14}/></button>
              </div>

              <div className="ale-list-item-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '16px' }}>
                <span className="ale-item-num" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#db2777' }}>거래처 #{i + 1}</span>
                <Field label="기업 이름" value={logo.name} onChange={v => updateItem(i, 'name', v)} placeholder="예: Careis" />
                <ImageField label="로고 이미지 URL (PNG 권장)" value={logo.imgUrl} onChange={v => updateItem(i, 'imgUrl', v)} />
                {logo.imgUrl ? (
                  <div className="ale-img-preview" style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    padding: '10px'
                  }}>
                    <img src={logo.imgUrl} alt="로고 미리보기" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{
                    marginTop: '8px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 255, 255, 0.1)',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.8rem'
                  }}>
                    투명 PNG 로고 주소를 입력하세요
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-add-item" onClick={addItem} style={{ marginTop: '20px', width: '100%' }}>
          <Plus size={16}/> 새 거래처 로고 추가
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 6.6: FAQ 편집기
// ════════════════════════════════════
const FAQEditor = ({ data = { items: [] }, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });
  const addItem = () => {
    const nextItems = [...(data.items || []), { q: '새 질문', a: '답변을 입력하세요.' }];
    update('items', nextItems);
  };
  const removeItem = (i) => {
    const nextItems = (data.items || []).filter((_, idx) => idx !== i);
    update('items', nextItems);
  };
  const updateItem = (i, key, val) => {
    const nextItems = deepClone(data.items || []);
    nextItems[i][key] = val;
    update('items', nextItems);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<HelpCircle size={20}/>} title="FAQ (자주 묻는 질문)" subtitle="아코디언 형식으로 표시될 질문과 답변을 관리합니다." />
      <div className="ale-fields-row">
        <Field label="배지 텍스트" value={data.badge} onChange={v => update('badge', v)} />
        <Field label="메인 제목" value={data.title} onChange={v => update('title', v)} />
      </div>
      <Field label="설명 문구" value={data.desc} onChange={v => update('desc', v)} />
      
      <div className="ale-field-group">
        <h4 className="field-group-title">💬 질문 세트 관리</h4>
        <div className="ale-item-list">
          {(data.items || []).map((item, i) => (
            <div key={i} className="ale-list-item">
              <div className="ale-list-item-controls">
                <span className="ale-item-num">{i + 1}</span>
                <button onClick={() => removeItem(i)} className="btn-delete"><Trash2 size={14}/></button>
              </div>
              <div className="ale-list-item-fields">
                <Field label="질문(Question)" value={item.q} onChange={v => updateItem(i, 'q', v)} />
                <Field label="답변(Answer)" value={item.a} onChange={v => updateItem(i, 'a', v)} multiline />
              </div>
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addItem}>
          <Plus size={16}/> 질문 추가
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 6.7: 리뷰 편집기
// ════════════════════════════════════
const ReviewsEditor = ({ data = { items: [] }, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });
  const addItem = () => {
    const nextItems = [...(data.items || []), { rating: 5, content: '리뷰 내용을 입력하세요.', author: '홍길동', role: '회사원' }];
    update('items', nextItems);
  };
  const removeItem = (i) => {
    const nextItems = (data.items || []).filter((_, idx) => idx !== i);
    update('items', nextItems);
  };
  const updateItem = (i, key, val) => {
    const nextItems = deepClone(data.items || []);
    nextItems[i][key] = val;
    update('items', nextItems);
  };

  return (
    <div className="ale-block">
      <SectionHeader icon={<MessageSquare size={20}/>} title="고객 리뷰" subtitle="랜딩 페이지 하단에 표시될 고객 후기를 관리합니다." />
      <Field label="메인 제목" value={data.title} onChange={v => update('title', v)} />
      
      <div className="ale-field-group">
        <h4 className="field-group-title">⭐ 리뷰 세트 관리</h4>
        <div className="ale-item-list">
          {(data.items || []).map((rev, i) => (
            <div key={i} className="ale-list-item">
              <div className="ale-list-item-controls">
                <span className="ale-item-num">{i + 1}</span>
                <button onClick={() => removeItem(i)} className="btn-delete"><Trash2 size={14}/></button>
              </div>
              <div className="ale-list-item-fields">
                <div className="ale-fields-row">
                  <Field label="별점 (1-5)" type="number" value={rev.rating} onChange={v => updateItem(i, 'rating', parseInt(v))} />
                  <Field label="작성자 성함" value={rev.author} onChange={v => updateItem(i, 'author', v)} />
                </div>
                <Field label="작성자 소속/역할" value={rev.role} onChange={v => updateItem(i, 'role', v)} />
                <Field label="상세 리뷰 내용" value={rev.content} onChange={v => updateItem(i, 'content', v)} multiline />
              </div>
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addItem}>
          <Plus size={16}/> 리뷰 추가
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════
//  블록 6: 푸터 편집기
// ════════════════════════════════════
const FooterEditor = ({ data = { footerLinks: [] }, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });
  
  const addLink = () => {
    const nextLinks = deepClone(data.footerLinks || []);
    nextLinks.push({ label: '새 메뉴', url: '/new-link', content: '' });
    update('footerLinks', nextLinks);
  };

  const removeLink = (index) => {
    const nextLinks = deepClone(data.footerLinks || []);
    nextLinks.splice(index, 1);
    update('footerLinks', nextLinks);
  };

  const updateLinkAt = (index, key, val) => {
    const nextLinks = deepClone(data.footerLinks || []);
    if (!nextLinks[index]) return;
    nextLinks[index][key] = val;
    update('footerLinks', nextLinks);
  };

  const moveLink = (index, dir) => {
    const nextLinks = deepClone(data.footerLinks || []);
    const swap = index + dir;
    if (swap < 0 || swap >= nextLinks.length) return;
    [nextLinks[index], nextLinks[swap]] = [nextLinks[swap], nextLinks[index]];
    update('footerLinks', nextLinks);
  };

  // 모달 입력창 생성 조건 판단 (/로 시작하고, 메인 라우트 제외)
  const isModalUrl = (url) => {
    return url && url.startsWith('/') && !['/', '/login', '/signup', '/dashboard'].includes(url);
  };

  // 각 링크에 바인딩할 본문 텍스트 가져오기
  const getContentForLink = (link) => {
    const legacyKeyMap = {
      '/terms': 'termsContent',
      '/privacy': 'privacyContent',
      '/no-email': 'noEmailContent',
      '/custom-center': 'customerCenterContent',
      '/customer-center': 'customerCenterContent',
      '/partnership': 'partnershipContent',
      '/coalition': 'partnershipContent',
      '/affiliate': 'affiliateMarketingContent',
      '/marketing': 'affiliateMarketingContent',
      '/advertising': 'adInquiryContent',
      '/ad-contact': 'adInquiryContent'
    };
    const legacyKey = legacyKeyMap[link.url];
    if (legacyKey) {
      return data[legacyKey] || link.content || '';
    }
    return link.content || '';
  };

  // 본문 텍스트 업데이트
  const updateLinkContent = (index, newContent) => {
    const nextLinks = deepClone(data.footerLinks || []);
    if (!nextLinks[index]) return;
    nextLinks[index].content = newContent;
    
    const legacyKeyMap = {
      '/terms': 'termsContent',
      '/privacy': 'privacyContent',
      '/no-email': 'noEmailContent',
      '/custom-center': 'customerCenterContent',
      '/customer-center': 'customerCenterContent',
      '/partnership': 'partnershipContent',
      '/coalition': 'partnershipContent',
      '/affiliate': 'affiliateMarketingContent',
      '/marketing': 'affiliateMarketingContent',
      '/advertising': 'adInquiryContent',
      '/ad-contact': 'adInquiryContent'
    };
    const legacyKey = legacyKeyMap[nextLinks[index].url];
    if (legacyKey) {
      onChange({
        ...data,
        footerLinks: nextLinks,
        [legacyKey]: newContent
      });
    } else {
      onChange({
        ...data,
        footerLinks: nextLinks
      });
    }
  };

  const footerLinksList = data.footerLinks || [];
  const modalLinks = footerLinksList.map((link, idx) => ({ link, idx })).filter(({ link }) => isModalUrl(link.url));

  return (
    <div className="ale-block">
      <SectionHeader icon={<LayoutTemplate size={20}/>} title="푸터 (하단)" subtitle="회사 정보, 저작권 및 하단 링크를 관리합니다." />
      
      <div className="ale-field-group">
        <h4 className="field-group-title">🔗 기본 정보 및 로고 설정</h4>
        <div className="ale-fields-row">
          <Field label="로고 텍스트" value={data.logo} onChange={v => update('logo', v)} />
          <Field label="저작권 문구" value={data.copyright} onChange={v => update('copyright', v)} />
        </div>
      </div>

      <div className="ale-field-group">
        <h4 className="field-group-title">🔗 하단 링크(메뉴) 설정</h4>
        <p className="field-help" style={{ marginBottom: '16px' }}>
          푸터 메뉴의 노출 이름(라벨)과 이동할 링크 URL을 입력할 수 있습니다.<br />
          URL에 모달 식별값(예: <code>/terms</code>, <code>/custom-center</code> 등 <code>/</code>로 시작하는 상대 경로)을 입력하면 
          아래 <strong>약관 및 정책 본문 설정</strong>에 자동으로 입력창이 추가됩니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {footerLinksList.map((link, i) => (
            <div key={i} className="ale-list-item" style={{
              display: 'flex',
              padding: '16px',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div className="ale-list-item-controls" style={{ minWidth: '80px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="ale-item-num" style={{ fontSize: '0.8rem', fontWeight: 'bold', width: '20px' }}>{i + 1}</span>
                <button onClick={() => moveLink(i, -1)} className="btn-move" disabled={i === 0} style={{ padding: '4px' }}><ChevronUp size={14}/></button>
                <button onClick={() => moveLink(i, 1)} className="btn-move" disabled={i === footerLinksList.length - 1} style={{ padding: '4px' }}><ChevronDown size={14}/></button>
                <button onClick={() => removeLink(i)} className="btn-delete" style={{ padding: '4px', color: '#ef4444' }}><Trash2 size={14}/></button>
              </div>
              <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <Field label="메뉴명 (라벨)" value={link.label || ''} onChange={v => updateLinkAt(i, 'label', v)} placeholder="예: 고객센터" />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="연결 URL" value={link.url || ''} onChange={v => updateLinkAt(i, 'url', v)} placeholder="예: /custom-center" />
                </div>
              </div>
            </div>
          ))}
          <button className="btn-add-item" onClick={addLink} style={{ width: '100%', marginTop: '8px' }}>
            <Plus size={16}/> 새 하단 링크 추가
          </button>
        </div>
      </div>

      <div className="ale-field-group">
        <h4 className="field-group-title">📜 약관 및 정책 본문 설정</h4>
        <p className="field-help" style={{ marginBottom: '16px' }}>
          위 하단 링크 설정에서 URL이 <code>/</code>로 시작하는 메뉴들의 본문(팝업 모달창 내용)을 입력할 수 있습니다. 
          메뉴가 추가/수정되거나 URL이 변경되면 입력란이 실시간으로 자동 갱신됩니다.
        </p>

        {/* 💡 무한 입력창 동적 생성 안내 배지 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px dashed rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#cbd5e1',
          fontSize: '0.85rem',
          lineHeight: '1.5'
        }}>
          <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.5))' }}>💡</span>
          <div>
            <strong>무한 입력창 동적 생성 안내:</strong> 위 <strong>하단 링크(메뉴) 설정</strong>에서 <code>[새 하단 링크 추가]</code>를 누른 뒤 URL을 <code>/</code>로 시작하는 상대 경로(예: <code>/custom-center</code>)로 등록하시면 아래에 해당하는 전용 글 입력창이 <strong>실시간으로 자동 생성</strong>됩니다.
          </div>
        </div>
        
        {modalLinks.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#64748b',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            fontSize: '0.9rem'
          }}>
            모달 창으로 동작할 하단 링크(URL이 /로 시작하는 메뉴)가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {modalLinks.map(({ link, idx }) => (
              <div key={idx} style={{
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color="#db2777" style={{ filter: 'drop-shadow(0 0 8px rgba(219, 39, 119, 0.4))' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f8fafc' }}>
                      {link.label || '새 메뉴'} 본문 설정
                    </span>
                    <code style={{
                      background: 'rgba(219, 39, 119, 0.1)',
                      border: '1px solid rgba(219, 39, 119, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      color: '#f472b6',
                      fontWeight: '600'
                    }}>
                      {link.url}
                    </code>
                  </div>
                  <div style={{
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    ✍️ <span style={{ color: '#db2777', fontWeight: 'bold' }}>{getContentForLink(link).length.toLocaleString()}</span>자 입력됨
                  </div>
                </div>
                
                <textarea
                  value={getContentForLink(link)}
                  onChange={e => updateLinkContent(idx, e.target.value)}
                  placeholder={`${link.label || '새 메뉴'} 본문 규정이나 정책 내용을 입력해 주세요. (줄바꿈이 자동 지원됩니다)`}
                  style={{
                    width: '100%',
                    height: '240px',
                    padding: '16px',
                    background: '#090d16',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: '#f1f5f9',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.6)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#db2777';
                    e.target.style.boxShadow = '0 0 12px rgba(219, 39, 119, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.6)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.6)';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ale-field-group">
        <h4 className="field-group-title">🏢 회사 법적 정보</h4>
        <div className="ale-fields-row">
          <Field label="상호명" value={data.companyName} onChange={v => update('companyName', v)} />
          <Field label="대표자명" value={data.ceoName} onChange={v => update('ceoName', v)} />
        </div>
        <div className="ale-fields-row">
          <Field label="사업자등록번호" value={data.businessNumber} onChange={v => update('businessNumber', v)} />
          <Field label="통신판매업신고번호" value={data.mailOrderNumber} onChange={v => update('mailOrderNumber', v)} />
        </div>
        <Field label="연락처/이메일" value={data.contact} onChange={v => update('contact', v)} />
        <Field label="사업장 주소" value={data.address} onChange={v => update('address', v)} />
      </div>
    </div>
  );
}

// ════════════════════════════════════
//  블록 7: 색상 편집기
// ════════════════════════════════════
const ColorField = ({ label, value, onChange }) => (
  <div className="ale-color-field">
    <label>{label}</label>
    <div className="ale-color-row">
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#000000" />
    </div>
  </div>
);

const ColorsEditor = ({ data, onChange }) => {
  const update = (key, val) => onChange({ ...data, [key]: val });
  const groups = [
    { label: '전체 배경', key: 'pageBg' },
    { label: '🤝 제휴사 블록 배경', key: 'partnersBg' },
    { label: '포인트 색상 (기본)', key: 'primary' },
    { label: '포인트 색상 (보조)', key: 'secondary' },
    { label: '히어로 제목 색상', key: 'heroTitle' },
    { label: '히어로 설명 색상', key: 'heroDesc' },
    { label: '카드 배경', key: 'cardBg' },
    { label: '네비게이션 배경', key: 'navBg' },
    { label: 'CTA 배경 (왼쪽)', key: 'ctaBg1' },
    { label: 'CTA 배경 (오른쪽)', key: 'ctaBg2' },
    { label: '푸터 배경', key: 'footerBg' },
  ];
  const presets = [
    { name: '🌙 다크 핑크 (기본)', colors: { pageBg:'#0f172a', partnersBg:'#0f172a', primary:'#db2777', secondary:'#7c3aed', heroTitle:'#f8fafc', heroDesc:'#94a3b8', cardBg:'#1e293b', navBg:'#0f172a', ctaBg1:'#db2777', ctaBg2:'#7c3aed', footerBg:'#0f172a' } },
    { name: '☀️ 화이트 블루', colors: { pageBg:'#f8fafc', partnersBg:'#f1f5f9', primary:'#2563eb', secondary:'#7c3aed', heroTitle:'#0f172a', heroDesc:'#475569', cardBg:'#ffffff', navBg:'#ffffff', ctaBg1:'#2563eb', ctaBg2:'#7c3aed', footerBg:'#1e293b' } },
    { name: '🌿 그린 다크', colors: { pageBg:'#052e16', partnersBg:'#022c22', primary:'#16a34a', secondary:'#0d9488', heroTitle:'#f0fdf4', heroDesc:'#86efac', cardBg:'#14532d', navBg:'#052e16', ctaBg1:'#16a34a', ctaBg2:'#0d9488', footerBg:'#052e16' } },
    { name: '🔥 오렌지 다크', colors: { pageBg:'#1c1917', partnersBg:'#1c1917', primary:'#ea580c', secondary:'#dc2626', heroTitle:'#fafaf9', heroDesc:'#a8a29e', cardBg:'#292524', navBg:'#1c1917', ctaBg1:'#ea580c', ctaBg2:'#dc2626', footerBg:'#1c1917' } },
  ];

  return (
    <div className="ale-block">
      <SectionHeader icon={<Palette size={20}/>} title="색상 관리" subtitle="랜딩 페이지의 배경색, 포인트색, 버튼색 등을 자유롭게 조절합니다." />
      <div className="ale-preset-row">
        <label className="ale-preset-label">빠른 테마 선택</label>
        <div className="ale-presets">
          {presets.map((p, i) => (
            <button key={i} className="btn-preset" onClick={() => onChange({ ...data, ...p.colors })}>{p.name}</button>
          ))}
        </div>
      </div>
      <div className="ale-color-grid">
        {groups.map(g => (
          <ColorField key={g.key} label={g.label} value={data?.[g.key]} onChange={v => update(g.key, v)} />
        ))}
      </div>
    </div>
  );
};


// ── 왜 넥스카드인가 에디터 ──
const WhyEditor = ({ data, onChange }) => {
  const d = data || {};
  const update = (k, v) => onChange({ ...d, [k]: v });
  const blocks = d.blocks || [];
  const detailImages = d.detailImages || (d.detailImage ? [d.detailImage] : []);

  const addBlock = () => onChange({ ...d, blocks: [...blocks, { title: '새 장점', desc: '설명', icon: '✨' }] });
  const updateBlock = (idx, k, v) => {
    const copy = [...blocks];
    copy[idx][k] = v;
    onChange({ ...d, blocks: copy });
  };
  const removeBlock = (idx) => onChange({ ...d, blocks: blocks.filter((_, i) => i !== idx) });

  const handleMultiFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const target = e.target;
    if (files.length === 0) return;
    Promise.all(files.map(file => new Promise((resolve) => {
      if (file.size > 15 * 1024 * 1024) {
        alert('이미지 용량이 너무 큽니다 (최대 15MB).');
        resolve(null);
        return;
      }
      if (file.size < 100 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          };
          img.onerror = () => {
            alert(`이미지를 읽을 수 없습니다. (지원되지 않는 포맷이거나 파일이 손상됨: ${file.name})`);
            resolve(null);
          };
          img.src = ev.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      }
    }))).then(results => {
      const validResults = results.filter(r => r !== null);
      if (validResults.length > 0) {
        update('detailImages', [...detailImages, ...validResults]);
      }
      if (target) target.value = '';
    });
  };

  const moveImage = (index, dir) => {
    if (index + dir < 0 || index + dir >= detailImages.length) return;
    const newImages = [...detailImages];
    const temp = newImages[index];
    newImages[index] = newImages[index + dir];
    newImages[index + dir] = temp;
    update('detailImages', newImages);
  };

  const removeImage = (index) => {
    update('detailImages', detailImages.filter((_, i) => i !== index));
  };

  return (
    <div className="ale-editor-panel">
      <SectionHeader icon="💡" title="왜 넥스카드인가" subtitle="'왜 넥스카드인가?' 페이지 내용을 수정합니다." />
      <div className="ale-form-group">
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold'}}>
          <input type="checkbox" checked={d.showButton !== false} onChange={e => update('showButton', e.target.checked)} />
          랜딩페이지 메인 배너에 '왜 넥스카드인가?' 버튼 표시
        </label>
        <Field label="버튼 텍스트" value={d.buttonText || '왜 넥스카드인가?'} onChange={v => update('buttonText', v)} />
        <Field label="페이지 제목" value={d.pageTitle || '왜 넥스카드인가?'} onChange={v => update('pageTitle', v)} />
        <Field label="페이지 서브타이틀" value={d.pageSubtitle || ''} onChange={v => update('pageSubtitle', v)} multiline />
        
        <Field label="유튜브 동영상 링크 (선택)" value={d.videoUrl || ''} onChange={v => update('videoUrl', v)} placeholder="https://www.youtube.com/watch?v=..." />
        <p className="field-help" style={{marginBottom:'1.5rem'}}>* 일반 유튜브 시청 주소(예: https://www.youtube.com/watch?v=...)를 그대로 입력하셔도 자동으로 연결됩니다.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>상세페이지 그림 (여러 장 업로드 가능)</h3>
        <p className="field-help" style={{marginBottom:'1rem'}}>PC에서 여러 장의 이미지를 한 번에 선택하여 올릴 수 있습니다. (최대 15장 권장)</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input type="file" multiple accept="image/*" onChange={handleMultiFileUpload} id="detail-images-upload" style={{ display: 'none' }} />
          <label htmlFor="detail-images-upload" className="ale-btn primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> PC에서 이미지 선택 (여러 장 가능)
          </label>
        </div>

        {detailImages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {detailImages.map((imgUrl, i) => (
              <div key={i} style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', background: '#f8fafc' }}>
                <img src={imgUrl} alt="상세 컷" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="ale-btn-icon" onClick={() => moveImage(i, -1)} disabled={i === 0}><ChevronUp size={14}/></button>
                    <button className="ale-btn-icon" onClick={() => moveImage(i, 1)} disabled={i === detailImages.length - 1}><ChevronDown size={14}/></button>
                  </div>
                  <button className="ale-btn-icon danger" onClick={() => removeImage(i)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>하단 장점 블록</h3>
        {blocks.map((b, i) => (
          <div key={i} className="ale-list-item" style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
            <div className="ale-list-content" style={{flex:1}}>
              <Field label="아이콘" value={b.icon || ''} onChange={v => updateBlock(i, 'icon', v)} />
              <Field label="제목" value={b.title || ''} onChange={v => updateBlock(i, 'title', v)} />
              <Field label="설명" value={b.desc || ''} onChange={v => updateBlock(i, 'desc', v)} multiline />
            </div>
            <div className="ale-list-actions" style={{paddingTop:'2rem'}}>
              <button className="ale-btn-icon danger" onClick={() => removeBlock(i)}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        <button className="ale-btn secondary" style={{marginTop: '1rem'}} onClick={addBlock}>
          <Plus size={16} /> 하단 장점 블록 추가
        </button>
      </div>
    </div>
  );
};
// ════════════════════════════════════
//  메인 에디터 페이지
// ════════════════════════════════════
const AdminLandingEditor = () => {
  const location = useLocation();

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['nav', 'hero', 'samples', 'partners', 'features', 'pricing', 'faq', 'reviews', 'cta', 'footer', 'colors'].includes(tabParam)) {
      return tabParam;
    }
    return 'hero';
  };

  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeBlock, setActiveBlock] = useState(getInitialTab());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveBlock(tabParam);
    }
  }, [location.search]);

  const blocks = [
    { id: 'nav',      label: '🌐 네비게이션' },
    { id: 'hero',     label: '🎯 히어로'     },
    { id: 'samples',  label: '🖼️ 명함샘플'   },
    { id: 'partners', label: '🏢 주요거래처' },
    { id: 'features', label: '✨ 기능소개'   },
    { id: 'why',      label: '💡 왜 넥스카드' },
    { id: 'pricing',  label: '💰 요금제'     },
    { id: 'faq',      label: '❓ FAQ'        },
    { id: 'reviews',  label: '💬 리뷰'       },
    { id: 'cta',      label: '📣 CTA'        },
    { id: 'footer',   label: '🔻 푸터'       },
    { id: 'colors',   label: '🎨 색상 관리'  },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/landing-content`);
      if (res.ok) {
        const data = await res.json();
        setContent({ ...DEFAULT_CONTENT, ...data });
      } else {
        setContent(deepClone(DEFAULT_CONTENT));
      }
    } catch {
      setContent(deepClone(DEFAULT_CONTENT));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/landing-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setSaveMsg('✅ 저장 완료!');
      } else {
        setSaveMsg('❌ 저장 실패');
      }
    } catch {
      setSaveMsg('❌ 서버 오류');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const update = (block, val) => setContent(prev => ({ ...prev, [block]: val }));

  if (loading) return (
    <div className="ale-loading">
      <Sidebar />
      <div className="ale-loading-content">
        <Loader2 size={40} className="spin" />
        <p>랜딩 콘텐츠 불러오는 중...</p>
      </div>
    </div>
  );

  return (
    <div className="ale-layout">
      <Sidebar />
      <div className="ale-main">

        {/* 상단 툴바 */}
        <div className="ale-toolbar">
          <div className="ale-toolbar-left">
            <h1>🖊️ 랜딩 페이지 편집기</h1>
            <p>블록별로 내용을 수정한 후 저장하세요. 저장 즉시 실제 사이트에 반영됩니다.</p>
          </div>
          <div className="ale-toolbar-right">
            {saveMsg && <span className="ale-save-msg">{saveMsg}</span>}
            <button className="btn-preview" onClick={() => window.open('/', '_blank')}>
              <Eye size={16}/> 미리보기
            </button>
            <button className="btn-reset" onClick={fetchContent}>
              <RefreshCw size={16}/> 새로고침
            </button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={16} className="spin"/> 저장 중...</> : <><Save size={16}/> 저장하기</>}
            </button>
          </div>
        </div>

        <div className="ale-body">
          {/* 왼쪽: 블록 탭 */}
          <div className="ale-block-tabs">
            {blocks.map(b => (
              <button
                key={b.id}
                className={`ale-tab ${activeBlock === b.id ? 'active' : ''}`}
                onClick={() => setActiveBlock(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* 오른쪽: 편집 영역 */}
          <div className="ale-editor-area">
            {activeBlock === 'nav'      && <NavEditor      data={content.nav}      onChange={v => update('nav', v)} />}
            {activeBlock === 'hero'     && <HeroEditor     data={content.hero}     onChange={v => update('hero', v)} />}
            {activeBlock === 'samples'  && (
              <SamplesEditor  
                sectionData={content.samplesSection || { title: '다양한 명함 샘플', desc: '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.' }}
                samplesData={content.samples || []}  
                onChangeSection={v => update('samplesSection', v)}
                onChangeSamples={v => update('samples', v)} 
              />
            )}
            {activeBlock === 'partners'  && (
              <PartnersEditor  
                sectionData={content.partnersSection || { title: '주요 기업 거래처' }}
                logosData={content.partnersLogos || []}  
                onChangeSection={v => update('partnersSection', v)}
                onChangeLogos={v => update('partnersLogos', v)} 
              />
            )}
            {activeBlock === 'why'      && <WhyEditor      data={content.whySection} onChange={v => update('whySection', v)} />}
            {activeBlock === 'features' && (
              <FeaturesEditor  
                sectionData={content.featuresSection || { title: '스마트한 명함의 기준', desc: '종이 명함이 담지 못하는 무한한 가능성을 경험하세요.' }}
                featuresData={content.features || []}  
                onChangeSection={v => update('featuresSection', v)}
                onChangeFeatures={v => update('features', v)} 
              />
            )}
            {activeBlock === 'pricing'  && <PricingEditor  data={content.pricing}  onChange={v => update('pricing', v)} />}
            {activeBlock === 'faq'      && <FAQEditor      data={content.faq}      onChange={v => update('faq', v)} />}
            {activeBlock === 'reviews'  && <ReviewsEditor  data={content.reviews}  onChange={v => update('reviews', v)} />}
            {activeBlock === 'cta'      && <CtaEditor      data={content.cta}      onChange={v => update('cta', v)} />}
            {activeBlock === 'footer'   && <FooterEditor   data={content.footer}   onChange={v => update('footer', v)} />}
            {activeBlock === 'colors'   && <ColorsEditor   data={content.colors || {}} onChange={v => update('colors', v)} />}

            <div className="ale-save-footer">
              <button className="btn-save-big" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 size={18} className="spin"/> 저장 중...</> : <><CheckCircle2 size={18}/> 변경사항 저장하기</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingEditor;

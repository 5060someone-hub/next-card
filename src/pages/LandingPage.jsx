import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, ChevronRight, MessageCircle, Mail, Globe, Loader2, X } from 'lucide-react';
import './LandingPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// ── 기본 콘텐츠 (서버 응답 전 폴백) ──
const DEFAULT_CONTENT = {
  nav: { logo: 'NextCard', logoSub: '.kr' },
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
    { icon: '🔗', title: '빠른 공유',    desc: 'QR 코드, 링크 하나로 장소에 상관없이 명함을 전달할 수 있습니다.' },
    { icon: '✏️', title: '자유로운 편집', desc: '언제 어디서든 실시간으로 명함 내용을 수정하고 관리할 수 있습니다.' },
    { icon: '📊', title: '실시간 통계', desc: '내 명함이 얼마나 조회되었는지, 어떤 링크가 클릭되었는지 확인하세요.' }
  ],
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
  pricing: [
    { name: '일반형 (Free)', price: '0',     period: '월', popular: false, btn: '무료로 시작', linkUrl: '/signup', features: ['기본 프로필 페이지', 'QR 코드 생성', '링크 공유', '기본 테마 적용'] },
    { name: '프리미엄 (Pro)', price: '9,900', period: '월', popular: true,  btn: '지금 가입',  linkUrl: '/signup', features: ['모든 기본 기능', '커스텀 URL 설정', '로고 및 배경 커스텀', '방문 통계 분석'] },
    { name: '기업용 (Corp)', price: '문의',   period: '',   popular: false, btn: '상담 신청', linkUrl: '#contact', features: ['전사 통합 관리', '기업 전용 템플릿', 'API 연동 지원', '전담 기술 지원'] }
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
  colors: {
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
  }
};

// ── 텍스트 줄바꿈 렌더러 ──
const Multiline = ({ text }) => (
  <>
    {String(text || '').split('\n').map((line, i) => (
      <React.Fragment key={i}>{line}{i < text.split('\n').length - 1 && <br />}</React.Fragment>
    ))}
  </>
);

const getLinkProps = (url, defaultUrl = '/signup') => {
  const targetUrl = url || defaultUrl;
  if (!targetUrl) return {};
  const isExternal = targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('//');
  if (isExternal) {
    return { href: targetUrl, target: '_blank', rel: 'noopener noreferrer' };
  }
  return { href: targetUrl };
};

const LandingPage = () => {
  const [c, setC] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [policyModal, setPolicyModal] = useState({ open: false, title: '', content: '' });

  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'general',
    content: '',
    agree: false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.content) {
      alert('모든 필수 항목을 입력해 주세요.');
      return;
    }
    if (!contactForm.agree) {
      alert('개인정보 수집 및 이용에 동의해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (response.ok) {
        alert('✉️ 문의가 성공적으로 접수되었습니다!\n빠른 시일 내에 답변해 드리겠습니다.');
        setContactForm({
          name: '',
          phone: '',
          email: '',
          type: 'general',
          content: '',
          agree: false
        });
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`접수 실패: ${errData.message || response.status}`);
      }
    } catch (err) {
      console.error(err);
      alert('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleFooterLinkClick = (e, link) => {
    const url = link.url || '';
    
    // 메인 페이지 라우트가 아니면서 /로 시작하거나 modal:로 시작하는 경우 모달로 처리
    const isModalRoute = (url.startsWith('/') && !['/', '/login', '/signup', '/dashboard'].includes(url)) || url.startsWith('modal:');
    
    if (isModalRoute) {
      e.preventDefault();
      
      const normalizedUrl = url.startsWith('modal:') ? url.replace('modal:', '/') : url;
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
      
      const legacyKey = legacyKeyMap[normalizedUrl];
      let content = '';
      if (legacyKey && c.footer?.[legacyKey]) {
        content = c.footer[legacyKey];
      } else {
        content = link.content || '';
      }
      
      if (!content) {
        content = `${link.label} 본문이 설정되지 않았습니다. 관리자 페이지에서 본문을 작성해 주세요.`;
      }
      
      setPolicyModal({
        open: true,
        title: link.label || '안내',
        content: content
      });
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/landing-content`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { 
        if (data) {
          setC({ ...DEFAULT_CONTENT, ...data });
          // SEO Optimization
          document.title = `${data.nav?.logo || 'NextCard'} | 프리미엄 디지털 명함`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', data.hero?.desc || '나만의 디지털 명함 서비스');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    // Scroll Reveal Observer
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]);

  // 색상 스타일 변수 생성
  const themeStyles = {
    '--dark-bg': c.colors?.pageBg,
    '--partners-bg': c.colors?.partnersBg || '#0f172a',
    '--primary-color': c.colors?.primary,
    '--secondary-color': c.colors?.secondary,
    '--hero-title-color': c.colors?.heroTitle,
    '--hero-desc-color': c.colors?.heroDesc,
    '--dark-card': c.colors?.cardBg,
    '--nav-bg': c.colors?.navBg,
    '--cta-grad-1': c.colors?.ctaBg1,
    '--cta-grad-2': c.colors?.ctaBg2,
    '--footer-bg': c.colors?.footerBg,
    '--primary-gradient': `linear-gradient(135deg, ${c.colors?.primary || '#db2777'} 0%, ${c.colors?.secondary || '#7c3aed'} 100%)`,
    '--cta-gradient': `linear-gradient(135deg, ${c.colors?.ctaBg1 || '#db2777'} 0%, ${c.colors?.ctaBg2 || '#7c3aed'} 100%)`
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 size={40} className="spin-sm" color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="landing-wrapper" style={themeStyles}>

      {/* ── 네비게이션 ── */}
      <nav className="landing-nav">
        <div className="container nav-content">
          <div className="logo">
            {c.nav?.logo || 'NextCard'}<span>{c.nav?.logoSub || '.me'}</span>
          </div>
          <div className="nav-links">
            <a href="#pricing" className="hide-mobile">요금제</a>
            <a href="/login"  className="btn-login">로그인</a>
            <a href="/signup" className="btn-signup hide-mobile">시작하기</a>
          </div>
        </div>
      </nav>

      <main>
        {/* ── 히어로 ── */}
        <section className="landing-hero" id="hero">
          <div className="container">
            <div className="hero-content">
              <span className="hero-badge">{c.hero.badge}</span>
              <h1 className="hero-title"><Multiline text={c.hero.title} /></h1>
              <p className="hero-desc"><Multiline text={c.hero.desc} /></p>
              <div className="hero-btns">
                <a {...getLinkProps(c.hero.primaryBtnUrl, '/signup')} className="btn-primary">
                  {c.hero.primaryBtn} <ArrowRight size={18} />
                </a>
                <a {...getLinkProps(c.hero.secondaryBtnUrl, '#contact')} className="btn-secondary">
                  {c.hero.secondaryBtn || '문의하기'}
                </a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="mockup-container">
                <img src={c.hero.mockupImg} alt="NextCard 목업" className="hero-img" />
                <div className="floating-card card-1">NextCard Premium</div>
                <div className="floating-card card-2">Digital Identity</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* ── 명함 샘플 ── */}
        <section className="landing-samples reveal" id="samples">
          <div className="container">
            <div className="section-header">
              <h2>{c.samplesSection?.title || '다양한 명함 샘플'}</h2>
              <p>{c.samplesSection?.desc || '나만의 개성을 담은 다양한 스타일의 명함을 확인해 보세요.'}</p>
            </div>
            <div className="sample-grid">
              {(c.samples || []).map((sample, i) => {
                const CardContent = (
                  <div className="sample-card">
                    <div className="sample-img-wrapper">
                      <img src={sample.imgUrl} alt={sample.title} />
                    </div>
                    <h3>{sample.title}</h3>
                  </div>
                );
                return sample.linkUrl ? (
                  <a key={i} href={sample.linkUrl} className="sample-card-link" target="_blank" rel="noopener noreferrer">
                    {CardContent}
                  </a>
                ) : (
                  <React.Fragment key={i}>
                    {CardContent}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 주요 기업 거래처 ── */}
        <section className="landing-partners reveal" id="partners">
          <div className="container">
            <div className="partners-content">
              {!!c.partnersSection?.title?.trim() && (
                <h3 className="partners-title">{c.partnersSection.title}</h3>
              )}
              <div className="partners-list">
                {(c.partnersLogos || []).map((logo, i) => (
                  <div key={i} className="partner-logo-item" title={logo.name}>
                    {logo.imgUrl ? (
                      <img src={logo.imgUrl} alt={logo.name} />
                    ) : (
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{logo.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 기능 소개 ── */}
        <section className="landing-features reveal" id="features">
          <div className="container">
            <div className="section-header">
              <h2>{c.featuresSection?.title || '스마트한 명함의 기준'}</h2>
              <p>{c.featuresSection?.desc || '종이 명함이 담지 못하는 무한한 가능성을 경험하세요.'}</p>
            </div>
            <div className="feature-grid">
              {c.features.map((feat, i) => (
                <div key={i} className="feature-card">
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 요금제 ── */}
        <section className="landing-pricing reveal" id="pricing">
          <div className="container">
            <div className="section-header">
              <h2>합리적인 선택</h2>
              <p>당신의 비즈니스 성장에 맞는 플랜을 선택하세요.</p>
            </div>
            <div className="pricing-grid">
              {c.pricing.map((plan, i) => (
                <div key={i} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <span className="popular-badge">가장 추천</span>}
                  <h3>{plan.name}</h3>
                  <div className="price-area">
                    <span className="currency">₩</span>
                    <span className="amount">{plan.price}</span>
                    {plan.period && <span className="period">/{plan.period}</span>}
                  </div>
                  <ul className="price-features">
                    {plan.features.map((f, j) => (
                      <li key={j}><Check size={16} color="#db2777" /> {f}</li>
                    ))}
                  </ul>
                  <a {...getLinkProps(plan.linkUrl, (plan.name && (plan.name.includes('기업') || plan.name.includes('Corp') || plan.name.includes('문의'))) ? '#contact' : '/signup')}>
                    <button className={`btn-price ${plan.popular ? 'primary' : ''}`}>{plan.btn}</button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="landing-faq reveal" id="faq">
          <div className="container">
            <div className="section-header-centered">
              <span className="faq-badge">{c.faq?.badge || 'FAQ'}</span>
              <h2>{c.faq?.title || '자주 묻는 질문'}</h2>
              <p>{c.faq?.desc || '디지털명함을 만들기 전에 알아야 할 모든 것.'}</p>
            </div>
            <div className="faq-list">
              {(c.faq?.items || []).slice(0, 7).map((item, i) => (
                <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <div className="faq-question">
                    <span>{item.q}</span>
                    <ChevronRight size={20} className="faq-icon" />
                  </div>
                  <div className="faq-answer">
                    <div className="answer-content">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {(c.faq?.items || []).length > 7 && (
              <div className="faq-more-container">
                <a href="/faq" className="btn-faq-more">
                  자주 묻는 질문 전체보기 <ArrowRight size={18} />
                </a>
              </div>
            )}
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="landing-reviews reveal" id="reviews">
          <div className="container">
            <div className="reviews-header">
              <h2>{c.reviews?.title || '고객들이 전하는 진짜 이야기'}</h2>
              <a href="#hero" className="btn-view-all">보러 가기 <ChevronRight size={16} /></a>
            </div>
            <div className="reviews-grid">
              {(c.reviews?.items || []).map((rev, i) => (
                <div key={i} className="review-card">
                  <div className="review-rating">
                    {[...Array(rev.rating)].map((_, j) => <span key={j}>★</span>)}
                  </div>
                  <p className="review-content">{rev.content}</p>
                  <div className="review-author">
                    <div className="author-info">
                      <strong>- {rev.author}</strong>
                      <span>{rev.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="landing-cta">
          <div className="container">
            <div className="cta-card">
              <h2><Multiline text={c.cta.title} /></h2>
              <p>{c.cta.desc}</p>
              <a {...getLinkProps(c.cta.btnUrl, '/signup')}>
                <button className="btn-cta">{c.cta.btn} <ChevronRight size={20} /></button>
              </a>
            </div>
          </div>
        </section>

        {/* ── 문의하기 양식 ── */}
        <section className="landing-contact reveal" id="contact">
          <div className="container">
            <div className="contact-card-wrapper">
              <div className="section-header-centered" style={{ marginBottom: '24px' }}>
                <span className="faq-badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--secondary-color)' }}>CONTACT US</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>제휴 및 도입 문의</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>디지털 명함 단체 도입, 제휴 제안 등 문의사항을 남겨주시면 확인 후 연락드리겠습니다.</p>
              </div>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="contact-row-2">
                  <div className="contact-group">
                    <label>성함 / 회사명 <span style={{ color: 'var(--primary-color)' }}>*</span></label>
                    <input 
                      type="text" 
                      name="name" 
                      value={contactForm.name} 
                      onChange={handleContactChange} 
                      placeholder="예시: 홍길동 (안티그래피티)" 
                      required 
                    />
                  </div>
                  <div className="contact-group">
                    <label>연락처 <span style={{ color: 'var(--primary-color)' }}>*</span></label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={contactForm.phone} 
                      onChange={handleContactChange} 
                      placeholder="예시: 010-1234-5678" 
                      required 
                    />
                  </div>
                </div>

                <div className="contact-row-2">
                  <div className="contact-group">
                    <label>이메일 주소 <span style={{ color: 'var(--primary-color)' }}>*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      value={contactForm.email} 
                      onChange={handleContactChange} 
                      placeholder="예시: support@nextcard.kr" 
                      required 
                    />
                  </div>
                  <div className="contact-group">
                    <label>문의 유형</label>
                    <select 
                      name="type" 
                      value={contactForm.type} 
                      onChange={handleContactChange}
                    >
                      <option value="general">일반 서비스 문의</option>
                      <option value="group">기업 단체 도입 문의</option>
                      <option value="partnership">제휴 및 제안</option>
                      <option value="other">기타 문의</option>
                    </select>
                  </div>
                </div>

                <div className="contact-group">
                  <label>문의 내용 <span style={{ color: 'var(--primary-color)' }}>*</span></label>
                  <textarea 
                    name="content" 
                    value={contactForm.content} 
                    onChange={handleContactChange} 
                    rows="6" 
                    placeholder="문의하실 상세 내용을 입력해 주세요." 
                    required
                  />
                </div>

                <div className="contact-checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="agree" 
                    name="agree" 
                    checked={contactForm.agree} 
                    onChange={handleContactChange} 
                    required 
                  />
                  <label htmlFor="agree" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    개인정보 수집 및 이용에 동의합니다. (필수){' '}
                    <a 
                      href="#privacy" 
                      onClick={(e) => {
                        e.preventDefault();
                        setPolicyModal({
                          open: true,
                          title: '개인정보 수집 및 이용 동의',
                          content: c.footer.privacyContent || '개인정보처리방침 본문이 설정되지 않았습니다.'
                        });
                      }}
                      style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
                    >
                      [자세히 보기]
                    </a>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="btn-contact-submit"
                  style={{ width: '100%', marginTop: '12px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="spinning" size={18} />
                      문의사항 전송 중...
                    </>
                  ) : (
                    '문의사항 보내기'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ── 푸터 ── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-logo">{c.footer.logo}</div>
            {c.footer.companyName && (
              <div className="footer-info">
                <div className="info-row">
                  <span>상호: {c.footer.companyName}</span>
                  <span>대표: {c.footer.ceoName}</span>
                  <span>사업자등록번호: {c.footer.businessNumber}</span>
                  {c.footer.mailOrderNumber && <span>통신판매업신고번호: {c.footer.mailOrderNumber}</span>}
                </div>
                <div className="info-row">
                  <span>주소: {c.footer.address}</span>
                  <span>고객센터: {c.footer.contact}</span>
                </div>
              </div>
            )}
            <div className="footer-sns">
              <MessageCircle size={20} />
              <Mail size={20} />
              <Globe size={20} />
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright-links">
              <span className="copyright">{c.footer.copyright}</span>
              <div className="footer-links">
                {(c.footer.footerLinks || []).map((link, i) => (
                  <a key={i} href={link.url} onClick={(e) => handleFooterLinkClick(e, link)}>{link.label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 정책 모달 ── */}
      {policyModal.open && (
        <div 
          className="landing-policy-modal-overlay" 
          onClick={() => setPolicyModal(prev => ({ ...prev, open: false }))}
        >
          <div 
            className="landing-policy-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="landing-policy-modal-close"
              onClick={() => setPolicyModal(prev => ({ ...prev, open: false }))}
            >
              <X size={18} />
            </button>
            <h3 className="landing-policy-modal-title">
              {policyModal.title}
            </h3>
            <div className="landing-policy-modal-body">
              {policyModal.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

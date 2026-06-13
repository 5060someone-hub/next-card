import { DEFAULT_CONTENT } from './landingDefaultContent';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, ChevronRight, MessageCircle, Mail, Globe, Loader2, X, Building2, Smartphone, MapPin, Link as LinkIcon, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import LiveCardPreview from '../components/LiveCardPreview';
import './LandingPage.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

// ── 기본 콘텐츠 (서버 응답 전 폴백) ──


// ── 텍스트 줄바꿈 렌더러 ──
const Multiline = ({ text }) => {
  const safeText = text || '';
  const lines = safeText.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [policyModal, setPolicyModal] = useState({ open: false, title: '', content: '' });

  const [isFreeCardModalOpen, setIsFreeCardModalOpen] = useState(false);
  const [creatingCard, setCreatingCard] = useState(false);
  const [heroForm, setHeroForm] = useState({ name: '', company: '', jobTitle: '', phonePersonal: '', department: '', address: '', link: '', logoUrl: '', profileUrl: '' });

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setHeroForm(prev => ({ ...prev, [field]: canvas.toDataURL('image/jpeg', 0.8) }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTempCard = async () => {
    if (!heroForm.name) {
      alert('이름을 입력해주세요.');
      return;
    }
    setCreatingCard(true);
    try {
      const newCardRef = await addDoc(collection(db, 'business_cards'), {
        userId: 'anonymous',
        status: 'temporary',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1주일 후 만료
        productType: 'free',
        cardData: {
          name: heroForm.name,
          company: heroForm.company,
          jobTitle: heroForm.jobTitle,
          department: heroForm.department,
          address: heroForm.address,
          phonePersonal: heroForm.phonePersonal,
          emailPersonal: '', 
          website: heroForm.link,
          logoUrl: heroForm.logoUrl,
          profileUrl: heroForm.profileUrl,
          template: 'modern', 
          themeColor: '#db2777', 
          useGradient: true,
          bgColor: '#ffffff',
          textColor: '#1e293b',
          btnBgColor: '#f8fafc',
          blockBgColor: '#f8fafc',
          btnIconColor: '#db2777'
        }
      });
      navigate(`/v/${newCardRef.id}`);
    } catch (error) {
      console.error('Error creating temporary card:', error);
      alert('명함 생성 중 오류가 발생했습니다.');
    } finally {
      setCreatingCard(false);
    }
  };

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
          // 중첩 객체(Nested Objects)까지 안전하게 병합하기 위한 2단계 깊은 복사(Deep Merge) 적용
          const mergedData = {
            ...DEFAULT_CONTENT,
            ...data,
            nav: { ...DEFAULT_CONTENT.nav, ...data.nav },
            hero: { ...DEFAULT_CONTENT.hero, ...data.hero },
            featuresSection: { ...DEFAULT_CONTENT.featuresSection, ...data.featuresSection },
            samplesSection: { ...DEFAULT_CONTENT.samplesSection, ...data.samplesSection },
            partnersSection: { ...DEFAULT_CONTENT.partnersSection, ...data.partnersSection },
            cta: { ...DEFAULT_CONTENT.cta, ...data.cta },
            faq: { ...DEFAULT_CONTENT.faq, ...data.faq },
            reviews: { ...DEFAULT_CONTENT.reviews, ...data.reviews },
            colors: { ...DEFAULT_CONTENT.colors, ...data.colors },
            footer: { ...DEFAULT_CONTENT.footer, ...data.footer }
          };
          setC(mergedData);
          
          // SEO Optimization
          document.title = `${mergedData.nav?.logo || 'NextCard'} | 프리미엄 디지털 명함`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', mergedData.hero?.desc || '나만의 디지털 명함 서비스');
          
          // 파비콘 동적 업데이트
          if (mergedData.nav?.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = mergedData.nav.faviconUrl;
          }
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
            <a href="/blog" className="hide-mobile">블로그</a>
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
                {c.hero.secondaryBtn && (
                  <a {...getLinkProps(c.hero.secondaryBtnUrl, '#')} className="btn-secondary">
                    {c.hero.secondaryBtn}
                  </a>
                )}
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
                      <img src={sample.imgUrl} alt={sample.title} loading="lazy" />
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
            <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/samples')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                👉 실제 동작하는 등급별 샘플 명함 체험하기
              
              </button>
              <button onClick={() => alert('동영상 튜토리얼이 준비 중입니다.')} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'white', color: '#1d4ed8', border: '1px solid #1d4ed8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                📺 동영상으로 디지털명함 편집 방법 배우기
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => navigate('/why')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)', color: 'white', border: 'none', boxShadow: '0 10px 15px -3px rgba(219, 39, 119, 0.3)', fontWeight: 'bold' }}>
                💡 왜 넥스트카드인가?
              </button>
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
                      <img src={logo.imgUrl} alt={logo.name} loading="lazy" />
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
              {(c.features || []).map((feat, i) => (
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
              {(c.pricing || []).map((plan, i) => (
                <div key={i} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <span className="popular-badge">가장 추천</span>}
                  <h3>{plan.name}</h3>
                  <div className="price-area">
                    <span className="currency">₩</span>
                    <span className="amount">{plan.price}</span>
                    {plan.period && <span className="period">/{plan.period}</span>}
                  </div>
                  <ul className="price-features">
                    {(plan.features || []).map((f, j) => (
                      <li key={j}><Check size={16} color="#db2777" /> {f}</li>
                    ))}
                  </ul>
                  <a {...getLinkProps(plan.linkUrl, (plan.name && (plan.name.includes('기업') || plan.name.includes('Corp') || plan.name.includes('문의'))) ? '#contact' : '/signup')}>
                    <button className={`btn-price ${plan.popular ? 'primary' : 'secondary'}`} style={plan.popular ? {} : { background: 'rgba(124,58,237,0.1)', color: 'var(--primary-color)', border: 'none', fontWeight: 'bold' }}>{plan.btn || (plan.name && plan.name.includes('문의') ? '문의하기' : '선택하기')}</button>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <span className="q-badge">Q</span>
                      <span className="q-text">{item.q}</span>
                    </div>
                    <ChevronRight size={20} className="faq-icon" />
                  </div>
                  <div className="faq-answer">
                    <div className="answer-wrapper">
                      <span className="a-badge">A</span>
                      <div className="answer-content">{item.a}</div>
                    </div>
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
            <div className="contact-card-wrapper" style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
              <div className="section-header-centered" style={{ marginBottom: '24px' }}>
                <span className="faq-badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--secondary-color)' }}>CONTACT US</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>제휴 및 도입 문의</h2>
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
                      placeholder="예시: 홍길동 (넥스트카드)" 
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
                  <label htmlFor="agree" style={{ fontSize: '0.85rem', color: '#64748b' }}>
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

      {/* ── 무료 명함 체험 플로팅 버튼 (좌측 하단) ── */}
      <div 
        onClick={() => setIsFreeCardModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 999,
          background: '#db2777',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '50px',
          boxShadow: '0 10px 25px rgba(219, 39, 119, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
      >
        <span style={{ fontSize: '1.5rem' }}>✨</span> 무료 명함 만들기
      </div>

      {/* ── 무료 명함 1분 완성 체험 모달 ── */}
      {isFreeCardModalOpen && (
        <div 
          className="landing-policy-modal-overlay" 
          onClick={() => setIsFreeCardModalOpen(false)}
        >
          <div 
            className="live-preview-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="landing-policy-modal-close"
              onClick={() => setIsFreeCardModalOpen(false)}
              style={{ zIndex: 100 }}
            >
              <X size={24} />
            </button>

            <div className="live-preview-card-side" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '420px', margin: '0 auto', height: '100%' }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <LiveCardPreview heroForm={heroForm} setHeroForm={setHeroForm} handleImageUpload={handleImageUpload} />
              </div>
              
              <div style={{ marginTop: '20px', padding: '0 10px', flexShrink: 0 }}>
                <button onClick={handleCreateTempCard} disabled={creatingCard} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', border: 'none', borderRadius: '12px', cursor: 'pointer', background: '#db2777', color: '#fff', boxShadow: '0 4px 14px 0 rgba(219, 39, 119, 0.39)' }}>
                  {creatingCard ? <Loader2 size={20} className="spin" /> : null}
                  내 명함 완성하고 링크 받기
                </button>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#db2777', marginBottom: '5px' }}>💡 정식 회원가입 혜택!</p>
                  <p style={{ margin: 0, lineHeight: '1.4' }}>SNS 다중링크, 색상변경, 자기소개 등<br/><strong>더 강력한 서비스로 이용하세요.</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

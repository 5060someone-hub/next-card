import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Camera,
  UserCircle,
  Send,
  Code,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Share2,
  Download,
  Link as LinkIcon,
  Image as ImageIcon,
  Building,
  Lock,
  ShoppingBag,
  Type,
  Palette,
  Eye,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import './CardEditor.css';
import CardPreview from '../components/CardPreview';

const CardEditor = () => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '', nameEng: '', jobTitle: '', company: '', department: '', 
    phone: '', phoneWork: '', phonePersonal: '', email: '', website: '', address: '', intro: '',
    introAlign: 'center',
    logoUrl: '', profileUrl: '', logoSize: 40, profileSize: 120,
    themeColor: '#db2777', theme: 'modern',
    bgColor: '#ffffff', textColor: '#1e293b',
    btnBgColor: '#c9d0d9', blockBgColor: '#f1f5f9', btnIconColor: '#ffffff',
    nameFontSizeKor: 24, nameFontSizeEng: 16, jobTitleFontSize: 16, companyFontSize: 14,
    paperCardUrl: '', customCardUrl: '', productType: 'general',
    sns: { kakaotalk: '', instagram: '', facebook: '', tiktok: '', linkedin: '', x: '', threads: '' }
  });

  // URL 쿼리 파라미터에서 cardId 추출
  const queryParams = new URLSearchParams(window.location.search);
  const cardId = queryParams.get('id');

  useEffect(() => {
    const initCardAndProducts = async () => {
      if (!auth.id) {
        navigate('/login');
        return;
      }
      
      // 1. 상품 로드
      try {
        const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (prodRes.ok) {
          setProducts(await prodRes.json());
        }
      } catch (err) {
        console.error('상품 목록 로드 실패', err);
      }

      // 2. 명함 데이터 로드
      if (cardId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/card-detail/${cardId}`);
          if (response.ok) {
            const fullCard = await response.json();
            const data = fullCard.cardData || {};
            setFormData(prev => ({
              ...prev,
              ...data,
              productType: fullCard.grade || data.productType || 'general', // 카드의 실제 등급으로 에디터의 등급을 매핑
              intro: data.intro || data.bio || '',
              introAlign: data.introAlign || 'center',
              nameFontSizeKor: data.nameFontSizeKor || data.nameFontSize || 24,
              nameFontSizeEng: data.nameFontSizeEng || 16,
              sns: { ...prev.sns, ...(data.sns || {}) }
            }));
          } else {
            alert('명함을 불러올 수 없습니다. 대시보드로 이동합니다.');
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('명함 데이터 불러오기 오류:', err);
        }
      } else {
        // cardId가 없는 경우, 유저의 첫 번째 명함을 찾아 리다이렉트
        try {
          const listRes = await fetch(`${import.meta.env.VITE_API_URL}/api/cards/${auth.id}`);
          if (listRes.ok) {
            const userCards = await listRes.json();
            if (userCards.length > 0) {
              navigate(`/cards?id=${userCards[0]._id}`);
            } else {
              // 명함이 전혀 없으면 새 명함을 즉시 자동 생성 후 리다이렉트
              const createRes = await fetch(`${import.meta.env.VITE_API_URL}/api/card/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: auth.id })
              });
              if (createRes.ok) {
                const newCard = await createRes.json();
                navigate(`/cards?id=${newCard._id}`);
              } else {
                alert('명함 자동 개설에 실패했습니다.');
                navigate('/dashboard');
              }
            }
          }
        } catch (err) {
          console.error('명함 리스트 자동 스캔 오류:', err);
        }
      }
    };

    initCardAndProducts();
  }, [auth.id, cardId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('sns.')) {
      const snsKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        sns: { ...prev.sns, [snsKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e, field) => {
    let featureKey = 'allowLogo';
    if (field === 'profileUrl') featureKey = 'allowProfile';
    if (field === 'paperCardUrl') featureKey = 'allowPaperCard';

    if (!canUseFeature(featureKey)) {
      alert('이 기능은 현재 상품에서 지원하지 않습니다. 업그레이드가 필요합니다.');
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const currentProduct = products.find(p => p.id === formData.productType);
  const canUseFeature = (featureKey) => {
    if (!currentProduct || !currentProduct.features) return true;
    return currentProduct.features[featureKey];
  };

  const isThemeAllowed = (themeId) => {
    if (!currentProduct || !currentProduct.features || !currentProduct.features.allowedThemes) return true;
    return currentProduct.features.allowedThemes.includes(themeId);
  };

  const getSnsCount = () => {
    return Object.values(formData.sns || {}).filter(val => val && val.trim() !== '').length;
  };

  const maxSnsCount = currentProduct?.features?.maxSnsCount || 10;

  const [lastSaved, setLastSaved] = useState(null);

  const handleRemoveImage = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSaveSettings = async () => {
    if (!cardId) return;
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/card/save/${cardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardData: formData }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        alert('명함 정보가 성공적으로 저장되었습니다!');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert('서버 연결 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleViewFinal = () => {
    if (!cardId) return;
    window.open(`/v/${cardId}`, '_blank');
  };

  const handleShareLink = () => {
    if (!cardId) return;
    const finalCardUrl = `${window.location.origin}/v/${cardId}`;
    navigator.clipboard.writeText(finalCardUrl).then(() => {
      alert(`공개용 명함 링크가 복사되었습니다!\n${finalCardUrl}`);
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="card-editor-content">
        <header className="admin-header">
          <div className="admin-header-left">
            <button onClick={() => navigate('/dashboard')} className="btn-icon" style={{ background: '#f8fafc', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', margin: 0 }}>실시간 명함 편집기</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>내용 작성 시 PC는 우측에, 모바일은 최하단에 실시간으로 매핑됩니다.</p>
            </div>
          </div>
          <div className="admin-header-actions">
            {/* Product Tier Selector */}
            <div className="admin-header-tier-selector">
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                👑 내 요금제 등급:
              </span>
              <select 
                name="productType" 
                value={formData.productType} 
                onChange={handleChange}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontWeight: 700, 
                  color: '#b45309', 
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {[...products].sort((a, b) => (a.order || 0) - (b.order || 0)).map(p => {
                  let displayName = p.name;
                  if (p.id === 'prod_1778899977850' || p.id === 'event') displayName = '체험용(2개월무료)';
                  if (p.id === 'general') displayName = '기본형 (Basic-A)';
                  if (p.id === 'prod_1779351721158') displayName = '기본형(Basic-B)';
                  if (p.id === 'prod_1778900193128' || p.id === 'advanced') displayName = '표준형(Standard-A)';
                  if (p.id === 'prod_1779363055944') displayName = '표준형(Standard-B)';
                  if (p.id === 'premium_nfc' || p.id === 'premium') displayName = '프리미엄 (Premium)';
                  if (p.id === 'corporate') displayName = '기업용 (커스텀 디자인)';
                  return (
                    <option key={p.id} value={p.id}>{displayName}</option>
                  );
                })}
              </select>
            </div>

            <button onClick={handleViewFinal} className="btn-secondary">
              <Eye size={18} />
              최종 결과물 보기
            </button>
            <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
              <Save size={18} />
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </header>

        {/* Content Body - Natural Scroll */}
        <div className="admin-editor-body">
          {/* Left Form */}
          <div className="editor-form-content" style={{ padding: '1.5rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              
              {/* Product Info Description Badge */}
              {currentProduct && currentProduct.description && (
                <div style={{ 
                  padding: '1rem 1.25rem', 
                  background: '#eff6ff', 
                  borderRadius: '20px', 
                  border: '1px solid #bfdbfe', 
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem', 
                  color: '#1e40af', 
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>💡</span>
                  <div>
                    <strong style={{ fontWeight: 800 }}>{currentProduct.name} 요금제 혜택:</strong> {currentProduct.description}
                    {currentProduct.price !== undefined && (
                      <span style={{ marginLeft: '1.2rem', background: '#dbeafe', padding: '0.25rem 0.75rem', borderRadius: '50px', fontWeight: 800, color: '#1e40af', display: 'inline-block', fontSize: '0.8rem' }}>
                        요금: 연간 {currentProduct.price?.annual !== undefined ? currentProduct.price.annual.toLocaleString() : (typeof currentProduct.price === 'number' ? currentProduct.price.toLocaleString() : 0)}원 / 3개월 {currentProduct.price?.threeMonths !== undefined ? currentProduct.price.threeMonths.toLocaleString() : 0}원 / 2개월 {currentProduct.price?.twoMonths !== undefined ? currentProduct.price.twoMonths.toLocaleString() : 0}원
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Palette size={20} /> 디자인 테마 및 커스터마이징</h3>
                <div className="editor-form-grid">
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>테마 선택</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {['modern', 'classic', 'luxury', 'corporate'].map(t => {
                        const allowed = isThemeAllowed(t);
                        return (
                          <div
                            key={t}
                            onClick={() => allowed && setFormData({ ...formData, theme: t })}
                            style={{
                              padding: '0.75rem 0.25rem',
                              borderRadius: '10px',
                              border: `2px solid ${formData.theme === t ? '#db2777' : '#e2e8f0'}`,
                              cursor: allowed ? 'pointer' : 'not-allowed',
                              textAlign: 'center',
                              position: 'relative',
                              background: formData.theme === t ? '#fff1f2' : '#fff',
                              opacity: allowed ? 1 : 0.6,
                              fontWeight: 700,
                              textTransform: 'capitalize',
                              fontSize: '0.75rem'
                            }}
                          >
                            {t}
                            {!allowed && <Lock size={12} style={{ position: 'absolute', top: '4px', right: '4px', color: '#ef4444' }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <div className="input-group">
                      <label>포인트 컬러</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="themeColor" value={formData.themeColor} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="themeColor" value={formData.themeColor} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {formData.theme === 'classic' && (
                      <>
                        <div className="input-group">
                          <label>배경 색상</label>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input type="color" name="bgColor" value={formData.bgColor || '#ffffff'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                            <input type="text" name="bgColor" value={formData.bgColor || '#ffffff'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>글씨 색상</label>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input type="color" name="textColor" value={formData.textColor || '#1e293b'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                            <input type="text" name="textColor" value={formData.textColor || '#1e293b'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="input-group">
                      <label>버튼 배경</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="btnBgColor" value={formData.btnBgColor || '#374151'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="btnBgColor" value={formData.btnBgColor || '#374151'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>정보 블록 배경</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="blockBgColor" value={formData.blockBgColor || '#f1f5f9'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="blockBgColor" value={formData.blockBgColor || '#f1f5f9'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>버튼 아이콘</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="btnIconColor" value={formData.btnIconColor || '#ffffff'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="btnIconColor" value={formData.btnIconColor || '#ffffff'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label><Type size={14} /> 국문 이름 크기 ({formData.nameFontSizeKor}px)</label>
                    <input type="range" name="nameFontSizeKor" min="18" max="45" value={formData.nameFontSizeKor} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label><Type size={14} /> 영문 이름 크기 ({formData.nameFontSizeEng}px)</label>
                    <input type="range" name="nameFontSizeEng" min="10" max="35" value={formData.nameFontSizeEng} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label><Type size={14} /> 회사명 폰트 크기 ({formData.companyFontSize}px)</label>
                    <input type="range" name="companyFontSize" min="12" max="30" value={formData.companyFontSize} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><ImageIcon size={20} /> 로고 및 프로필 이미지 교체</h3>
                <div className="editor-form-grid">
                  <div className={`input-group ${!canUseFeature('allowLogo') ? 'feature-locked' : ''}`} style={{ position: 'relative' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      회사 로고 이미지 {!canUseFeature('allowLogo') && <Lock size={12} style={{ color: '#ef4444' }} />}
                    </label>
                    {!canUseFeature('allowLogo') && <div className="lock-text">프리미엄 전용</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {formData.logoUrl ? <img src={formData.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon color="#cbd5e1" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="logo-upload" hidden onChange={(e) => handleImageChange(e, 'logoUrl')} accept="image/*" disabled={!canUseFeature('allowLogo')} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => canUseFeature('allowLogo') && document.getElementById('logo-upload').click()} style={{ padding: '0.5rem 1rem', background: canUseFeature('allowLogo') ? '#1e293b' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: canUseFeature('allowLogo') ? 'pointer' : 'not-allowed' }}>이미지 교체</button>
                          {formData.logoUrl && <button type="button" onClick={() => handleRemoveImage('logoUrl')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>삭제</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>로고 크기 조절 ({formData.logoSize || 40}%)</label>
                    <input type="range" name="logoSize" min="20" max="100" value={formData.logoSize || 40} onChange={handleChange} disabled={!canUseFeature('allowLogo')} style={{ marginTop: '1.5rem' }} />
                  </div>
                  
                  <div className={`input-group ${!canUseFeature('allowProfile') ? 'feature-locked' : ''}`} style={{ position: 'relative' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      프로필 사진 이미지 {!canUseFeature('allowProfile') && <Lock size={12} style={{ color: '#ef4444' }} />}
                    </label>
                    {!canUseFeature('allowProfile') && <div className="lock-text">프리미엄 전용</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {formData.profileUrl ? <img src={formData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle color="#cbd5e1" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="profile-upload" hidden onChange={(e) => handleImageChange(e, 'profileUrl')} accept="image/*" disabled={!canUseFeature('allowProfile')} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => canUseFeature('allowProfile') && document.getElementById('profile-upload').click()} style={{ padding: '0.5rem 1rem', background: canUseFeature('allowProfile') ? '#1e293b' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: canUseFeature('allowProfile') ? 'pointer' : 'not-allowed' }}>이미지 교체</button>
                          {formData.profileUrl && <button type="button" onClick={() => handleRemoveImage('profileUrl')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>삭제</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>프로필 크기 조절 ({formData.profileSize || 120}px)</label>
                    <input type="range" name="profileSize" min="60" max="250" value={formData.profileSize || 120} onChange={handleChange} disabled={!canUseFeature('allowProfile')} style={{ marginTop: '1.5rem' }} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><UserCircle size={20} /> 상세 인적 사항</h3>
                <div className="editor-form-grid">
                  <div className="input-group"><label>성함 (국문)</label><input name="name" value={formData.name} onChange={handleChange} /></div>
                  <div className="input-group"><label>성함 (영문)</label><input name="nameEng" value={formData.nameEng} onChange={handleChange} /></div>
                  <div className="input-group"><label>직함 (예: 대표이사)</label><input name="jobTitle" value={formData.jobTitle} onChange={handleChange} /></div>
                  <div className="input-group"><label>회사명</label><input name="company" value={formData.company} onChange={handleChange} /></div>
                  <div className="input-group"><label>부서명</label><input name="department" value={formData.department} onChange={handleChange} /></div>
                  <div className="input-group"><label>대표 번호</label><input name="phoneWork" value={formData.phoneWork} onChange={handleChange} /></div>
                  <div className="input-group"><label>개인 휴대폰</label><input name="phonePersonal" value={formData.phonePersonal} onChange={handleChange} /></div>
                  <div className="input-group"><label>이메일</label><input name="email" value={formData.email} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}><label>사무실 주소</label><input name="address" value={formData.address} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ margin: 0 }}>인사말 (ABOUT)</label>
                      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => setFormData({ ...formData, introAlign: align })}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: formData.introAlign === align ? '#fff' : 'transparent',
                              boxShadow: formData.introAlign === align ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: formData.introAlign === align ? '#db2777' : '#64748b'
                            }}
                          >
                            {align === 'left' ? '좌측' : align === 'center' ? '중앙' : '우측'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea name="intro" value={formData.intro || ''} onChange={handleChange} rows="4" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', textAlign: formData.introAlign || 'center' }} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Share2 size={20} /> SNS 및 웹사이트 연동</h3>
                  <span style={{ fontSize: '0.75rem', color: getSnsCount() >= maxSnsCount ? '#ef4444' : '#6b7280', fontWeight: 800 }}>
                    사용 중: {getSnsCount()} / {maxSnsCount} 개
                  </span>
                </div>
                <div className="editor-form-grid">
                  {[
                    { id: 'website', label: '공식 웹사이트', icon: 'googlechrome' },
                    { id: 'sns.kakaotalk', label: '카카오톡 ID/링크', icon: 'kakaotalk' },
                    { id: 'sns.instagram', label: '인스타그램', icon: 'instagram' },
                    { id: 'sns.facebook', label: '페이스북', icon: 'facebook' },
                    { id: 'sns.tiktok', label: '틱톡', icon: 'tiktok' },
                    { id: 'sns.x', label: 'X (트위터)', icon: 'x' },
                    { id: 'sns.threads', label: '쓰레드 (Threads)', icon: 'threads' },
                    { id: 'sns.linkedin', label: '링크드인 (LinkedIn)', icon: 'linkedin' }
                  ].map((sns) => {
                    const path = sns.id.includes('.') ? sns.id.split('.') : [sns.id];
                    const value = path.length === 2 ? formData[path[0]]?.[path[1]] : formData[path[0]];
                    const isFilled = value && value.trim() !== '';
                    const isLocked = !isFilled && getSnsCount() >= maxSnsCount;
                    
                    return (
                      <div key={sns.id} className={`input-group ${isLocked ? 'feature-locked' : ''}`} style={{ position: 'relative' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sns.icon === 'linkedin' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          ) : (
                            <img src={`https://cdn.simpleicons.org/${sns.icon}/64748b`} width="16" height="16" alt={sns.label} />
                          )}
                          {sns.label}
                          {isLocked && <Lock size={12} style={{ color: '#ef4444' }} />}
                        </label>
                        {isLocked && <div className="lock-text" style={{ top: '0.2rem' }}>한도 초과</div>}
                        <input
                          name={sns.id}
                          value={value || ''}
                          onChange={handleChange}
                          placeholder={isLocked ? "한도 초과 (상품 업그레이드 필요)" : "링크 또는 ID를 입력하세요"}
                          disabled={isLocked}
                        />
                      </div>
                    );
                  })}
                  <div className={`input-group ${!canUseFeature('allowPaperCard') ? 'feature-locked' : ''}`} style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', position: 'relative' }}>
                    <label style={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      종이명함 / NFC 스캔 이미지 교체 {!canUseFeature('allowPaperCard') && <Lock size={12} style={{ color: '#ef4444' }} />}
                    </label>
                    {!canUseFeature('allowPaperCard') && <div className="lock-text">프리미엄 전용</div>}
                    <div className="paper-card-upload-box">
                      <div style={{ width: '150px', height: '90px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {formData.paperCardUrl ? <img src={formData.paperCardUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>이미지 없음</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="paper-upload" hidden onChange={(e) => handleImageChange(e, 'paperCardUrl')} accept="image/*" disabled={!canUseFeature('allowPaperCard')} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={() => canUseFeature('allowPaperCard') && document.getElementById('paper-upload').click()} style={{ padding: '0.75rem 1.5rem', background: canUseFeature('allowPaperCard') ? '#1e293b' : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: canUseFeature('allowPaperCard') ? 'pointer' : 'not-allowed' }}>종이명함 이미지 교체</button>
                          {formData.paperCardUrl && <button type="button" onClick={() => handleRemoveImage('paperCardUrl')} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>이미지 삭제</button>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>※ 실물 명함이나 QR코드 이미지를 직접 업로드하여 교체할 수 있습니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="editor-preview-sticky-wrapper" style={{ position: 'relative', background: '#fff', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ position: 'sticky', top: '100px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#db2777', background: '#fff1f2', padding: '0.5rem 1.25rem', borderRadius: '50px', letterSpacing: '1px' }}>REAL-TIME PREVIEW</span>
                </div>
                
                <div className="phone-mockup">
                  <div className="phone-screen">
                    <CardPreview formData={formData} />
                  </div>
                </div>
                
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1e293b' }}>💡 편집 팁</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                    <li>슬라이더를 조절하여 이미지와 폰트 크기를 맞추세요.</li>
                    <li>색상 선택기를 통해 나만의 브랜드 컬러를 적용하세요.</li>
                    <li>모든 변경사항은 [저장] 버튼을 눌러야 반영됩니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CardEditor;

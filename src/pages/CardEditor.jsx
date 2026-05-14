import React, { useState, useRef, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import './CardEditor.css';

const CardEditor = () => {
  const cardRef = useRef(null);
  const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
  const [products, setProducts] = useState([]); // 상품 목록 상태
  
  const [formData, setFormData] = useState({
    name: '홍길동',
    nameEng: 'Gildong Hong',
    jobTitle: '대표이사 / CEO',
    company: 'NextCard.kr 주식회사',
    department: '경영전략팀',
    phoneWork: '02-123-4567',
    phonePersonal: '010-1234-5678',
    email: 'gildong@nextcard.kr',
    website: 'www.nextcard.kr',
    address: '서울특별시 강남구 테헤란로43길 14 청수빌딩 13층',
    bio: '디지털 명함의 새로운 기준, NextCard.kr\n모바일과 웹을 아우르는 최상의 하이브리드 네트워킹 경험을 선사합니다.',
    logoUrl: '',
    profileUrl: '',
    themeColor: '#db2777',
    sns: {
      facebook: '',
      tiktok: '',
      instagram: '',
      kakaotalk: '',
      x: '',
      threads: '',
      linkedin: ''
    },
    logoSize: 40,
    profileSize: 120,
    paperCardUrl: '',
    customCardUrl: '',
    productType: 'general', // 기본 상품 종류 추가
    theme: 'modern'
  });

  // 서버에서 명함 데이터 불러오기
  useEffect(() => {
    const fetchCardData = async () => {
      if (!auth.id) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/card/${auth.id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            ...data,
            sns: { ...prev.sns, ...(data.sns || {}) }
          }));
        }
      } catch (err) {
        console.error('명함 데이터 불러오기 오류:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('상품 목록 불러오기 오류:', err);
      }
    };

    fetchCardData();
    fetchProducts();
  }, [auth.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
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

  const handleSaveSettings = async () => {
    const targetUserId = auth.id || 'sample';
    console.log('[Editor] Saving card data for user:', targetUserId, formData);

    try {
      // MongoDB 이전 후 통합된 /api/card 엔드포인트 사용
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, cardData: formData }),
      });

      const result = await response.json();

      if (response.ok) {
        setLastSaved(new Date());
        alert('명함 정보가 서버에 성공적으로 저장되었습니다!');
        if (!auth.id) {
          localStorage.setItem('nextcard_auth', JSON.stringify({ id: 'sample', name: formData.name, isLoggedIn: true }));
        }
      } else {
        alert(`저장에 실패했습니다: ${result.message || '서버 오류'}`);
      }
    } catch (err) {
      console.error('저장 오류:', err);
      alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인하세요.');
    }
  };

  const resolveFinalCardUrl = () => {
    if (formData.customCardUrl && formData.customCardUrl.trim()) {
      const inputUrl = formData.customCardUrl.trim();
      return inputUrl.startsWith('http') ? inputUrl : `${window.location.origin}/v/${inputUrl}`;
    }
    return `${window.location.origin}/v/${auth.id || 'sample'}`;
  };
  const finalCardUrl = resolveFinalCardUrl();

  const handleShareLink = () => {
    navigator.clipboard.writeText(finalCardUrl).then(() => {
      alert(`공개용 명함 링크가 복사되었습니다!\n연결 주소: ${finalCardUrl}`);
    });
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) {
      alert('이미지 대상을 찾을 수 없습니다.');
      return;
    }
    
    try {
      console.log('[Image Gen] Starting PNG generation...');
      // 폰트 및 이미지가 완전히 로드될 때까지 약간의 지연시간을 둠
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        pixelRatio: 2, // 고화질 출력
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `${formData.name || 'nextcard'}_card.png`;
      link.href = dataUrl;
      link.click();
      console.log('[Image Gen] Successfully downloaded');
    } catch (err) {
      console.error('[Image Gen Error]', err);
      alert(`이미지 저장 중 오류가 발생했습니다: ${err.message}\n브라우저 호환성 또는 리소스 로딩 문제를 확인해 주세요.`);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="editor-content">
        <header className="editor-header">
          <div>
            <h1>명함 편집기</h1>
            <p>최종 결과물 양식에 맞추어 정보를 입력하세요.</p>
          </div>
          <div className="editor-actions">
            {lastSaved && (
              <span className="last-saved-info" style={{ marginRight: '10px', fontSize: '0.85rem', color: '#666' }}>
                최근 저장: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button className="btn-secondary" onClick={handleShareLink}>
              <Share2 size={18} />
              미리보기 링크
            </button>
            <button className="btn-save" onClick={handleSaveSettings}>
              <Save size={18} />
              저장하기
            </button>
          </div>
        </header>

        <div className="editor-grid">
          {/* Left Form */}
          <section className="form-section">
            <div className="form-card">
              <h3>이미지 업로드</h3>
              <div className="image-inputs">
                <div className={`image-input-item ${!canUseFeature('allowLogo') ? 'feature-locked' : ''}`}>
                  <label><Building size={14} /> 회사 로고 {!canUseFeature('allowLogo') && <Lock size={12} />}</label>
                  <input 
                    id="logo-upload-input" 
                    type="file" 
                    onChange={(e) => handleImageChange(e, 'logoUrl')} 
                    accept="image/*" 
                    disabled={!canUseFeature('allowLogo')}
                  />
                  {!canUseFeature('allowLogo') && (
                    <div className="lock-text">프리미엄 전용</div>
                  )}
                  <div style={{ marginTop: '0.5rem', opacity: canUseFeature('allowLogo') ? 1 : 0.5 }}>
                    <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      로고 크기 조절
                      <span>{formData.logoSize || 40}%</span>
                    </label>
                    <input 
                      type="range" 
                      name="logoSize" 
                      min="20" 
                      max="100" 
                      value={formData.logoSize || 40} 
                      onChange={handleChange} 
                      style={{ width: '100%', cursor: 'pointer' }}
                      disabled={!canUseFeature('allowLogo')}
                    />
                  </div>
                </div>
                <div className={`image-input-item ${!canUseFeature('allowProfile') ? 'feature-locked' : ''}`}>
                  <label><UserCircle size={14} /> 프로필 사진 {!canUseFeature('allowProfile') && <Lock size={12} />}</label>
                  <input 
                    id="profile-upload-input" 
                    type="file" 
                    onChange={(e) => handleImageChange(e, 'profileUrl')} 
                    accept="image/*" 
                    disabled={!canUseFeature('allowProfile')}
                  />
                  {!canUseFeature('allowProfile') && (
                    <div className="lock-text">프리미엄 전용</div>
                  )}
                  <div style={{ marginTop: '0.5rem', opacity: canUseFeature('allowProfile') ? 1 : 0.5 }}>
                    <label style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      사진 크기 조절
                      <span>{formData.profileSize || 120}px</span>
                    </label>
                    <input 
                      type="range" 
                      name="profileSize" 
                      min="60" 
                      max="200" 
                      value={formData.profileSize || 120} 
                      onChange={handleChange} 
                      style={{ width: '100%', cursor: 'pointer' }}
                      disabled={!canUseFeature('allowProfile')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>기본 정보</h3>
              <div className="input-group">
                <label>이름 (국문)</label>
                <input name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>이름 (영문)</label>
                <input name="nameEng" value={formData.nameEng} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>직함 (예: 상무이사 / CTO)</label>
                <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>회사명</label>
                <input name="company" value={formData.company} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>부서명</label>
                <input name="department" value={formData.department} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>상품 종류 (운영진 확인용)</label>
                <select name="productType" value={formData.productType} onChange={handleChange} className="form-select">
                  <option value="">상품 선택</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-card">
              <h3>연락처 및 주소</h3>
              <div className="input-group">
                <label>회사 전화</label>
                <input name="phoneWork" value={formData.phoneWork} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>개인 휴대폰</label>
                <input name="phonePersonal" value={formData.phonePersonal} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>이메일</label>
                <input name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>주소</label>
                <input name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>

            <div className="form-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>SNS 및 웹사이트</h3>
                <span style={{ fontSize: '0.75rem', color: getSnsCount() >= maxSnsCount ? '#ef4444' : '#6b7280', fontWeight: 600 }}>
                  사용 중: {getSnsCount()} / {maxSnsCount} 개
                </span>
              </div>

              <div className="sns-input-grid">
                {[
                  { id: 'website', label: '웹사이트', icon: 'googlechrome' },
                  { id: 'sns.kakaotalk', label: '카카오톡 ID/오픈채팅', icon: 'kakaotalk' },
                  { id: 'sns.instagram', label: '인스타그램', icon: 'instagram' },
                  { id: 'sns.facebook', label: '페이스북', icon: 'facebook' },
                  { id: 'sns.tiktok', label: '틱톡', icon: 'tiktok' },
                  { id: 'sns.x', label: 'X (트위터)', icon: 'x' },
                  { id: 'sns.threads', label: '쓰레드 (Threads)', icon: 'threads' },
                  { id: 'sns.linkedin', label: '링크드인', icon: 'linkedin' }
                ].map((sns) => {
                  const path = sns.id.includes('.') ? sns.id.split('.') : [sns.id];
                  const value = path.length === 2 ? formData[path[0]]?.[path[1]] : formData[path[0]];
                  const isFilled = value && value.trim() !== '';
                  const isLocked = !isFilled && getSnsCount() >= maxSnsCount;

                  return (
                    <div key={sns.id} className={`input-group ${isLocked ? 'feature-locked' : ''}`}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={`https://cdn.simpleicons.org/${sns.icon}/374151`} width="16" height="16" alt={sns.label} />
                        {sns.label}
                        {isLocked && <Lock size={12} />}
                      </label>
                      <input 
                        name={sns.id} 
                        value={value || ''} 
                        onChange={handleChange} 
                        placeholder={isLocked ? "한도 초과 (상품 업그레이드 필요)" : "입력하세요"}
                        disabled={isLocked}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-card">
              <h3>인사말 (ABOUT)</h3>
              <div className="input-group">
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="5"></textarea>
              </div>
            </div>

            <div className="form-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>디자인 테마 선택</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {['modern', 'classic', 'luxury', 'corporate'].map(t => {
                  const allowed = isThemeAllowed(t);
                  return (
                    <div 
                      key={t} 
                      onClick={() => allowed && setFormData({...formData, theme: t})}
                      className={`theme-option ${formData.theme === t ? 'active' : ''} ${!allowed ? 'feature-locked' : ''}`}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: `2px solid ${formData.theme === t ? '#db2777' : '#e2e8f0'}`,
                        cursor: allowed ? 'pointer' : 'not-allowed',
                        textAlign: 'center',
                        position: 'relative',
                        background: formData.theme === t ? '#fff1f2' : '#fff'
                      }}
                    >
                      <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{t}</div>
                      {!allowed && <Lock size={14} style={{ position: 'absolute', top: '8px', right: '8px', color: '#ef4444' }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`form-card ${!canUseFeature('allowPaperCard') ? 'feature-locked' : ''}`}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                종이명함 {!canUseFeature('allowPaperCard') && <Lock size={16} />}
              </h3>
              <div className="image-input-item">
                <label><ImageIcon size={14} /> 종이명함 스캔/업로드</label>
                <input 
                  id="paper-card-upload-input" 
                  type="file" 
                  onChange={(e) => handleImageChange(e, 'paperCardUrl')} 
                  accept="image/*" 
                  disabled={!canUseFeature('allowPaperCard')}
                />
                {!canUseFeature('allowPaperCard') ? (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>프리미엄 전용 기능입니다.</p>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>※ 실물 명함을 촬영하여 업로드해 주세요. (가로형 권장)</p>
                )}
              </div>
            </div>

            <div className={`form-card ${!canUseFeature('allowSinglePage') ? 'feature-locked' : ''}`}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                고급 기능 {!canUseFeature('allowSinglePage') && <Lock size={16} />}
              </h3>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isSpaMode} 
                    onChange={(e) => setFormData({...formData, isSpaMode: e.target.checked})} 
                    disabled={!canUseFeature('allowSinglePage')}
                  />
                  SPA(싱글페이지) 모드 활성화
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  ※ 스크롤 없이 한 화면에서 모든 정보를 보여주는 모드입니다.
                </p>
              </div>
            </div>
          </section>

          {/* Right Preview */}
          <section className="preview-section">
            <div className="preview-container">
              <div 
                ref={cardRef}
                className={`preview-card theme-${formData.theme}`}
                style={{ borderTop: `10px solid ${formData.themeColor}` }}
              >
                <div className="preview-mini-logo image-editable" onClick={() => document.getElementById('logo-upload-input').click()}>
                  {formData.logoUrl ? (
                    <>
                      <img src={formData.logoUrl} alt="Logo" crossOrigin="anonymous" style={{ maxWidth: `${formData.logoSize || 40}%` }} />
                      <div className="edit-overlay">클릭하여 변경</div>
                      <button className="image-delete-btn" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, logoUrl: ''})); }}>✕</button>
                    </>
                  ) : (
                    <div className="placeholder-upload">+ 로고 업로드</div>
                  )}
                </div>
                
                <div className="card-header-v2">
                  <div className="image-editable" style={{ display: 'inline-block', borderRadius: '50%' }} onClick={() => document.getElementById('profile-upload-input').click()}>
                    {formData.profileUrl ? (
                      <>
                        <img src={formData.profileUrl} className="preview-profile-img" alt="Profile" crossOrigin="anonymous" style={{ width: `${formData.profileSize || 120}px`, height: `${formData.profileSize || 120}px` }} />
                        <div className="edit-overlay" style={{ borderRadius: '50%' }}>변경</div>
                        <button className="image-delete-btn" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, profileUrl: ''})); }}>✕</button>
                      </>
                    ) : (
                      <div className="placeholder-upload profile">+ 사진</div>
                    )}
                  </div>
                  <div className="card-titles">
                    <h2>{formData.name} <small>{formData.nameEng}</small></h2>
                    {formData.jobTitle && <span>{formData.jobTitle}</span>}
                  </div>
                </div>
                
                <div className="card-body">
                  {(formData.company || formData.department) && (
                    <div className="card-info-summary">
                      {formData.company && <p><strong>Company:</strong> {formData.company}</p>}
                      {formData.department && <p><strong>Dept:</strong> {formData.department}</p>}
                    </div>
                  )}
                  {formData.bio && <p className="card-bio-mini">{formData.bio}</p>}

                  {/* SNS / Website Live Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '1rem' }}>
                    {formData.website && <span style={{ background: '#f3f4f6', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/googlechrome/374151" width="14" height="14" alt="web" crossOrigin="anonymous" /> 웹사이트</span>}
                    {formData.sns?.kakaotalk && <span style={{ background: '#FFD400', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/kakaotalk/374151" width="14" height="14" alt="kakao" crossOrigin="anonymous" /> 카톡</span>}
                    {formData.sns?.instagram && <span style={{ background: '#E4405F', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/instagram/ffffff" width="14" height="14" alt="insta" crossOrigin="anonymous" /> 인스타</span>}
                    {formData.sns?.facebook && <span style={{ background: '#1877F2', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/facebook/ffffff" width="14" height="14" alt="fb" crossOrigin="anonymous" /> 페북</span>}
                    {formData.sns?.tiktok && <span style={{ background: '#000000', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/tiktok/ffffff" width="14" height="14" alt="tiktok" crossOrigin="anonymous" /> 틱톡</span>}
                    {formData.sns?.x && <span style={{ background: '#000000', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/x/ffffff" width="14" height="14" alt="x" crossOrigin="anonymous" /> X</span>}
                    {formData.sns?.threads && <span style={{ background: '#000000', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><img src="https://cdn.simpleicons.org/threads/ffffff" width="14" height="14" alt="threads" crossOrigin="anonymous" /> 쓰레드</span>}
                    {formData.sns?.linkedin && <span style={{ background: '#0077B5', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      링크드인
                    </span>}
                  </div>
                </div>

                <div className="image-editable" style={{ marginTop: '1rem' }} onClick={() => document.getElementById('paper-card-upload-input').click()}>
                  {formData.paperCardUrl ? (
                    <div className="paper-card-preview-container" style={{ marginTop: 0 }}>
                      <label className="paper-card-label">PAPER BUSINESS CARD</label>
                      <div className="paper-card-ratio-box">
                        <img src={formData.paperCardUrl} alt="Paper Business Card" crossOrigin="anonymous" />
                        <div className="edit-overlay">클릭하여 변경</div>
                        <button className="image-delete-btn" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({...prev, paperCardUrl: ''})); }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div className="placeholder-upload" style={{ height: '100px' }}>+ 종이명함 스캔본 업로드</div>
                  )}
                </div>

                <div className="card-footer">
                  <div className="qr-code-wrapper" style={{ position: 'relative' }}>
                    <QRCodeSVG value={finalCardUrl} size={70} />
                    {(!formData.customCardUrl || !formData.customCardUrl.trim()) && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', padding: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', textAlign: 'center' }}>[미발행]</span>
                        <span style={{ fontSize: '0.55rem', color: '#6b7280', textAlign: 'center' }}>운영자 승인대기</span>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {formData.customCardUrl && formData.customCardUrl.trim() ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>✓ 공식 웹주소 연동완료</span>
                    ) : (
                      <span>※ 관리자 승인 후 공식 QR 연동</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-action" onClick={handleSaveImage}>
                  <Download size={18} />
                  명함 이미지 저장
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CardEditor;

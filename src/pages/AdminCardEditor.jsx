import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  UserCircle,
  Image as ImageIcon,
  Palette,
  Share2,
  Type,
  RefreshCw,
  ExternalLink,
  Eye
} from 'lucide-react';
import CardPreview from '../components/CardPreview';
import Sidebar from '../components/Sidebar';
import './CardEditor.css'; // Reuse user editor styles

const AdminCardEditor = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentCardId, setCurrentCardId] = useState(null);
  const [userId, setUserId] = useState('');
  const [cardEditForm, setCardEditForm] = useState({
    name: '', nameEng: '', jobTitle: '', company: '', department: '',
    phone: '', phoneWork: '', phonePersonal: '', email: '', website: '', address: '', intro: '',
    introAlign: 'center',
    logoUrl: '', profileUrl: '', logoSize: 40, profileSize: 120,
    themeColor: '#db2777', theme: 'modern',
    bgColor: '#ffffff', textColor: '#1e293b',
    btnBgColor: '#374151', blockBgColor: '#f1f5f9', btnIconColor: '#ffffff',
    nameFontSizeKor: 24, nameFontSizeEng: 16, jobTitleFontSize: 16, companyFontSize: 14,
    paperCardUrl: '', customCardUrl: '', productType: 'general',
    sns: { kakaotalk: '', instagram: '', facebook: '', tiktok: '', linkedin: '', x: '', threads: '' }
  });

  useEffect(() => {
    fetchCardData();
    fetchProducts();
  }, [cardId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/products`);
      if (response.ok) {
        setProducts(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleViewFinal = () => {
    const targetUrlId = cardEditForm.customCardUrl || currentCardId || cardId;
    window.open(`/v/${targetUrlId}`, '_blank');
  };

  const fetchCardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/card-detail/${cardId}`);
      if (response.ok) {
        const card = await response.json();
        if (card && card.cardData) {
          setCurrentCardId(card._id);
          setCardEditForm({
            ...cardEditForm,
            ...card.cardData,
            intro: card.cardData.intro || card.cardData.bio || '',
            introAlign: card.cardData.introAlign || 'center',
            nameFontSizeKor: card.cardData.nameFontSizeKor || card.cardData.nameFontSize || 24,
            nameFontSizeEng: card.cardData.nameFontSizeEng || 16,
            productType: card.grade || card.cardData?.productType || 'general',
            sns: { ...cardEditForm.sns, ...(card.cardData.sns || {}) }
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch card:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardEditForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (field) => {
    setCardEditForm(prev => ({ ...prev, [field]: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('sns.')) {
      const snsKey = name.split('.')[1];
      setCardEditForm(prev => ({
        ...prev,
        sns: { ...prev.sns, [snsKey]: value }
      }));
    } else {
      setCardEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/card/save/${currentCardId || cardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardData: cardEditForm })
      });
      if (response.ok) {
        if (window.confirm('✅ 명함 데이터가 성공적으로 저장되었습니다!\n\n최종 결과물(명함 페이지)을 새 창에서 즉시 확인하시겠습니까?')) {
          const targetUrlId = cardEditForm.customCardUrl || currentCardId || cardId;
          window.open(`/v/${targetUrlId}`, '_blank');
        }
        await fetchCardData();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`저장 실패: ${errData.message || response.status}`);
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="loading-screen" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="spinning" size={48} color="#db2777" />
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content" style={{ padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
        {/* Header - Fixed or Sticky */}
        <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button onClick={() => navigate('/admin')} className="btn-icon" style={{ background: '#f8fafc', padding: '0.75rem' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', margin: 0 }}>마스터 명함 편집기</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>사용자 ID: {userId} | 마스터 편집 권한</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Product Tier Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fffbeb', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid #fef08a' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                👑 상품 등급:
              </span>
              <select
                name="productType"
                value={cardEditForm.productType}
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
                {[...products].sort((a, b) => {
                  const getProductKey = (id) => {
                    if (id === 'prod_1778899977850' || id === 'event') return 'event';
                    if (id === 'general') return 'general';
                    if (id === 'prod_1778900193128' || id === 'advanced') return 'advanced';
                    if (id === 'premium_nfc' || id === 'premium') return 'premium';
                    if (id === 'corporate') return 'corporate';
                    return id;
                  };
                  const order = ['event', 'general', 'advanced', 'premium', 'corporate'];
                  const keyA = getProductKey(a.id);
                  const keyB = getProductKey(b.id);
                  const idxA = order.indexOf(keyA);
                  const idxB = order.indexOf(keyB);
                  const sortA = idxA === -1 ? 999 : idxA;
                  const sortB = idxB === -1 ? 999 : idxB;
                  return sortA - sortB;
                }).map(p => {
                  const getProductKey = (id) => {
                    if (id === 'prod_1778899977850' || id === 'event') return 'event';
                    if (id === 'general') return 'general';
                    if (id === 'prod_1778900193128' || id === 'advanced') return 'advanced';
                    if (id === 'premium_nfc' || id === 'premium') return 'premium';
                    if (id === 'corporate') return 'corporate';
                    return id;
                  };
                  const key = getProductKey(p.id);
                  let displayName = p.name;
                  if (key === 'event') displayName = '이벤트형(6개월무료)';
                  if (key === 'general') displayName = '일반형';
                  if (key === 'advanced') displayName = '응용형';
                  if (key === 'premium') displayName = '프리미엄';
                  if (key === 'corporate') displayName = '기업용';
                  return (
                    <option key={p.id} value={p.id}>{displayName}</option>
                  );
                })}
              </select>
            </div>

            <button onClick={handleViewFinal} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', borderRadius: '50px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              <Eye size={18} />
              최종 결과물 보기
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2.5rem', borderRadius: '50px' }}>
              <Save size={18} />
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </header>

        {/* Content Body - Natural Scroll */}
        <div className="admin-editor-body" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '0' }}>
          {/* Left Form */}
          <div className="editor-form-content" style={{ padding: '1.5rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Sections match the previous modal but more spacious */}
              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Palette size={20} /> 디자인 테마 및 커스터마이징</h3>
                <div className="editor-form-grid">
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label>테마 선택</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {['modern', 'classic', 'luxury', 'corporate'].map(t => (
                        <div
                          key={t}
                          onClick={() => setCardEditForm({ ...cardEditForm, theme: t })}
                          style={{
                            padding: '0.75rem 0.25rem',
                            borderRadius: '10px',
                            border: `2px solid ${cardEditForm.theme === t ? '#db2777' : '#e2e8f0'}`,
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: cardEditForm.theme === t ? '#fff1f2' : '#fff',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            fontSize: '0.75rem'
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', gridColumn: 'span 2' }}>
                    <div className="input-group">
                      <label>포인트 컬러</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="themeColor" value={cardEditForm.themeColor} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="themeColor" value={cardEditForm.themeColor} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>

                    {/* Classic Theme Specific Options */}
                    {cardEditForm.theme === 'classic' && (
                      <>
                        <div className="input-group">
                          <label>배경 색상</label>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input type="color" name="bgColor" value={cardEditForm.bgColor || '#ffffff'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                            <input type="text" name="bgColor" value={cardEditForm.bgColor || '#ffffff'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>글씨 색상</label>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <input type="color" name="textColor" value={cardEditForm.textColor || '#1e293b'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                            <input type="text" name="textColor" value={cardEditForm.textColor || '#1e293b'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="input-group">
                      <label>버튼 배경</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="btnBgColor" value={cardEditForm.btnBgColor || '#374151'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="btnBgColor" value={cardEditForm.btnBgColor || '#374151'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>정보 블록 배경</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="blockBgColor" value={cardEditForm.blockBgColor || '#f1f5f9'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="blockBgColor" value={cardEditForm.blockBgColor || '#f1f5f9'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>버튼 아이콘</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input type="color" name="btnIconColor" value={cardEditForm.btnIconColor || '#ffffff'} onChange={handleChange} style={{ width: '40px', height: '40px', padding: '2px', border: 'none', background: 'transparent' }} />
                        <input type="text" name="btnIconColor" value={cardEditForm.btnIconColor || '#ffffff'} onChange={handleChange} style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem' }} />
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label><Type size={14} /> 국문 이름 크기 ({cardEditForm.nameFontSizeKor}px)</label>
                    <input type="range" name="nameFontSizeKor" min="18" max="45" value={cardEditForm.nameFontSizeKor} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label><Type size={14} /> 영문 이름 크기 ({cardEditForm.nameFontSizeEng}px)</label>
                    <input type="range" name="nameFontSizeEng" min="10" max="35" value={cardEditForm.nameFontSizeEng} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label><Type size={14} /> 회사명 폰트 크기 ({cardEditForm.companyFontSize}px)</label>
                    <input type="range" name="companyFontSize" min="12" max="30" value={cardEditForm.companyFontSize} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><ImageIcon size={20} /> 로고 및 프로필 이미지 교체</h3>
                <div className="editor-form-grid">
                  <div className="input-group">
                    <label>회사 로고 이미지</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {cardEditForm.logoUrl ? <img src={cardEditForm.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon color="#cbd5e1" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="logo-upload" hidden onChange={(e) => handleImageChange(e, 'logoUrl')} accept="image/*" />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => document.getElementById('logo-upload').click()} style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>이미지 교체</button>
                          {cardEditForm.logoUrl && <button type="button" onClick={() => handleRemoveImage('logoUrl')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>삭제</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>로고 크기 조절 ({cardEditForm.logoSize}%)</label>
                    <input type="range" name="logoSize" min="20" max="100" value={cardEditForm.logoSize} onChange={handleChange} style={{ marginTop: '1.5rem' }} />
                  </div>

                  <div className="input-group">
                    <label>프로필 사진 이미지</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {cardEditForm.profileUrl ? <img src={cardEditForm.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle color="#cbd5e1" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="profile-upload" hidden onChange={(e) => handleImageChange(e, 'profileUrl')} accept="image/*" />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => document.getElementById('profile-upload').click()} style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>이미지 교체</button>
                          {cardEditForm.profileUrl && <button type="button" onClick={() => handleRemoveImage('profileUrl')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>삭제</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>프로필 크기 조절 ({cardEditForm.profileSize}px)</label>
                    <input type="range" name="profileSize" min="60" max="250" value={cardEditForm.profileSize} onChange={handleChange} style={{ marginTop: '1.5rem' }} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><UserCircle size={20} /> 상세 인적 사항</h3>
                <div className="editor-form-grid">
                  <div className="input-group"><label>성함 (국문)</label><input name="name" value={cardEditForm.name} onChange={handleChange} /></div>
                  <div className="input-group"><label>성함 (영문)</label><input name="nameEng" value={cardEditForm.nameEng} onChange={handleChange} /></div>
                  <div className="input-group"><label>직함 (예: 대표이사)</label><input name="jobTitle" value={cardEditForm.jobTitle} onChange={handleChange} /></div>
                  <div className="input-group"><label>회사명</label><input name="company" value={cardEditForm.company} onChange={handleChange} /></div>
                  <div className="input-group"><label>부서명</label><input name="department" value={cardEditForm.department} onChange={handleChange} /></div>
                  <div className="input-group"><label>대표 번호</label><input name="phoneWork" value={cardEditForm.phoneWork} onChange={handleChange} /></div>
                  <div className="input-group"><label>개인 휴대폰</label><input name="phonePersonal" value={cardEditForm.phonePersonal} onChange={handleChange} /></div>
                  <div className="input-group"><label>이메일</label><input name="email" value={cardEditForm.email} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}><label>사무실 주소</label><input name="address" value={cardEditForm.address} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ margin: 0 }}>인사말 (ABOUT)</label>
                      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {['left', 'center', 'right'].map(align => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => setCardEditForm({ ...cardEditForm, introAlign: align })}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: cardEditForm.introAlign === align ? '#fff' : 'transparent',
                              boxShadow: cardEditForm.introAlign === align ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              color: cardEditForm.introAlign === align ? '#db2777' : '#64748b'
                            }}
                          >
                            {align === 'left' ? '좌측' : align === 'center' ? '중앙' : '우측'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea name="intro" value={cardEditForm.intro} onChange={handleChange} rows="4" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', textAlign: cardEditForm.introAlign || 'center' }} />
                  </div>
                </div>
              </div>

              <div className="form-card" style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Share2 size={20} /> SNS 및 웹사이트 연동</h3>
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
                    const value = path.length === 2 ? cardEditForm[path[0]]?.[path[1]] : cardEditForm[path[0]];

                    return (
                      <div key={sns.id} className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sns.icon === 'linkedin' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          ) : (
                            <img src={`https://cdn.simpleicons.org/${sns.icon}/64748b`} width="16" height="16" alt={sns.label} />
                          )}
                          {sns.label}
                        </label>
                        <input
                          name={sns.id}
                          value={value || ''}
                          onChange={handleChange}
                          placeholder="링크 또는 ID를 입력하세요"
                        />
                      </div>
                    );
                  })}
                  <div className="input-group" style={{ gridColumn: 'span 2', marginTop: '1rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <label style={{ fontWeight: 800, color: '#1e293b' }}>종이명함 / NFC 스캔 이미지 교체</label>
                    <div className="paper-card-upload-box">
                      <div style={{ width: '150px', height: '90px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {cardEditForm.paperCardUrl ? <img src={cardEditForm.paperCardUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>이미지 없음</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="file" id="paper-upload" hidden onChange={(e) => handleImageChange(e, 'paperCardUrl')} accept="image/*" />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={() => document.getElementById('paper-upload').click()} style={{ padding: '0.75rem 1.5rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>종이명함 이미지 교체</button>
                          {cardEditForm.paperCardUrl && <button type="button" onClick={() => handleRemoveImage('paperCardUrl')} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>이미지 삭제</button>}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>※ 실물 명함이나 QR코드 이미지를 직접 업로드하여 교체할 수 있습니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview - Sticky */}
          <div className="editor-preview-sticky-wrapper" style={{ position: 'relative', background: '#fff', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ position: 'sticky', top: '100px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#db2777', background: '#fff1f2', padding: '0.5rem 1.25rem', borderRadius: '50px', letterSpacing: '1px' }}>ADMIN MASTER PREVIEW</span>
                </div>
                <CardPreview formData={cardEditForm} />

                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#1e293b' }}>💡 편집 팁</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6' }}>
                    <li>슬라이더를 조절하여 이미지와 폰트 크기를 맞추세요.</li>
                    <li>색상 선택기를 통해 기업 브랜드 컬러를 적용하세요.</li>
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

export default AdminCardEditor;

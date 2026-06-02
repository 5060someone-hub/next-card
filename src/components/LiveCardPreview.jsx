import React, { useRef } from 'react';
import { 
  Building2, Briefcase, MapPin, 
  Phone, Smartphone, Mail, MessageSquare, 
  Share2, Download, Home, Link as LinkIcon, Edit2, ImagePlus
} from 'lucide-react';

const LiveCardPreview = ({ heroForm, setHeroForm, handleImageUpload }) => {
  const profileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Map heroForm to cardData format for styling colors
  const themeColor = '#db2777';
  const iconColor = '#db2777';
  const bgColor = '#ffffff';
  const textColor = '#1e293b';
  const glassBorder = 'rgba(0,0,0,0.1)';
  const finalBlockBg = 'rgba(0,0,0,0.02)';
  const finalBtnBg = '#f8fafc';

  const handleChange = (e, field) => {
    setHeroForm({ ...heroForm, [field]: e.target.value });
  };

  const inputStyle = {
    background: 'transparent',
    border: '1px dashed rgba(219, 39, 119, 0.3)',
    borderRadius: '4px',
    color: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    fontFamily: 'inherit',
    width: '100%',
    outline: 'none',
    padding: '2px 4px',
    transition: 'all 0.2s ease'
  };

  const inputFocusStyle = `
    input:focus {
      border: 1px solid rgba(219, 39, 119, 0.8) !important;
      background: rgba(219, 39, 119, 0.05) !important;
    }
    input::placeholder {
      color: rgba(0,0,0,0.3);
    }
  `;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{inputFocusStyle}</style>
      {/* 폰 목업 테두리 */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        maxHeight: '850px',
        background: bgColor,
        borderRadius: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        overflowY: 'auto',
        overflowX: 'hidden',
        border: '12px solid #0f172a',
        position: 'relative',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* 스마트폰 노치 (Notch) */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#0f172a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>

        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        
        <div style={{ 
          color: textColor,
          padding: '3rem 1.5rem',
          minHeight: '100%',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Top Logo Section */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%', position: 'relative' }}>
            <input 
              type="file" 
              accept="image/*" 
              ref={logoInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => handleImageUpload(e, 'logoUrl')} 
            />
            <div 
              onClick={() => logoInputRef.current.click()}
              style={{ 
                cursor: 'pointer',
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: heroForm.logoUrl ? 'none' : '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: heroForm.logoUrl ? '0' : '1rem',
                width: '100%',
                maxWidth: '180px',
                minHeight: '60px',
                background: heroForm.logoUrl ? 'transparent' : '#f8fafc',
                position: 'relative'
              }}
            >
              {heroForm.logoUrl ? (
                <>
                  <img src={heroForm.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#fff', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}><Edit2 size={12} color="#64748b" /></div>
                </>
              ) : (
                <>
                  <ImagePlus size={20} color="#94a3b8" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>회사 로고 추가</span>
                </>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
            <input 
              type="file" 
              accept="image/*" 
              ref={profileInputRef} 
              style={{ display: 'none' }} 
              onChange={(e) => handleImageUpload(e, 'profileUrl')} 
            />
            <div 
              onClick={() => profileInputRef.current.click()}
              style={{ 
                width: '120px', height: '120px', borderRadius: '50%', padding: '4px',
                background: `linear-gradient(45deg, ${themeColor}, #0ea5e9)`,
                cursor: 'pointer', position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#fff', borderRadius: '50%', padding: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 2 }}>
                <ImagePlus size={16} color={themeColor} />
              </div>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {heroForm.profileUrl ? (
                  <img src={heroForm.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>프로필 사진</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ height: '3px', width: '50px', background: `linear-gradient(90deg, ${themeColor}, #0ea5e9)`, marginBottom: '1rem' }}></div>
            
            <div style={{ width: '100%', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
              <input 
                value={heroForm.name || ''} 
                onChange={(e) => handleChange(e, 'name')} 
                placeholder="이름 입력 (예: 홍길동)"
                style={{ ...inputStyle, fontSize: '26px', fontWeight: 800, textAlign: 'center', maxWidth: '80%' }}
              />
            </div>
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <input 
                value={heroForm.jobTitle || ''} 
                onChange={(e) => handleChange(e, 'jobTitle')} 
                placeholder="직책 입력 (예: 대표이사)"
                style={{ ...inputStyle, fontSize: '16px', opacity: 0.8, textAlign: 'center', maxWidth: '70%', fontWeight: 500 }}
              />
            </div>
          </div>

          {/* Business Info Block */}
          <div style={{ 
            background: finalBlockBg, borderRadius: '20px', padding: '1.25rem 1rem', 
            marginBottom: '1.5rem', border: `1px solid ${glassBorder}`, boxShadow: '0 8px 12px -3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(219, 39, 119, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={18} color={themeColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '2px' }}>Company</div>
                <input 
                  value={heroForm.company || ''} 
                  onChange={(e) => handleChange(e, 'company')} 
                  placeholder="회사명 (예: 넥스트카드)"
                  style={{ ...inputStyle, fontSize: '15px', fontWeight: 700, textAlign: 'left' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(219, 39, 119, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={18} color={themeColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '2px' }}>Department</div>
                <input 
                  value={heroForm.department || ''} 
                  onChange={(e) => handleChange(e, 'department')} 
                  placeholder="부서명 (예: 디자인팀)"
                  style={{ ...inputStyle, fontSize: '14px', fontWeight: 600, textAlign: 'left' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(219, 39, 119, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color={themeColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '2px' }}>Address</div>
                <input 
                  value={heroForm.address || ''} 
                  onChange={(e) => handleChange(e, 'address')} 
                  placeholder="주소 (예: 서울시 강남구)"
                  style={{ ...inputStyle, fontSize: '13px', fontWeight: 500, textAlign: 'left' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(219, 39, 119, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Smartphone size={18} color={themeColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '2px' }}>Phone</div>
                <input 
                  value={heroForm.phonePersonal || ''} 
                  onChange={(e) => handleChange(e, 'phonePersonal')} 
                  placeholder="연락처 (예: 010-1234-5678)"
                  type="tel"
                  style={{ ...inputStyle, fontSize: '14px', fontWeight: 600, textAlign: 'left' }}
                />
              </div>
            </div>
          </div>

          <div style={{ background: '#db2777', borderRadius: '12px', padding: '12px', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px dashed rgba(255,255,255,0.5)' }}>
            <LinkIcon size={16} /> 
            <input 
              value={heroForm.link || ''} 
              onChange={(e) => handleChange(e, 'link')} 
              placeholder="링크 입력 (예: https://nextcard.kr)"
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '220px', fontSize: '0.9rem' }}
            />
            <Edit2 size={14} style={{ opacity: 0.8 }} />
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginTop: '1rem', marginBottom: '2rem', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            점선 영역을 터치하여 내 명함을 직접 작성해보세요.
          </div>
          
          <div id="live-card-bottom-anchor"></div>
        </div>
      </div>
    </div>
  );
};

export default LiveCardPreview;

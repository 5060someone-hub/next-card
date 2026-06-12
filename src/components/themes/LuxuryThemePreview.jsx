import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageSquare, 
  MapPin, 
  Building2, 
  Briefcase,
  Smartphone,
  Share2
} from 'lucide-react';

const LuxuryThemePreview = ({ formData }) => {
  const finalCardUrl = `https://nextcard.kr/v/${formData.customCardUrl || 'preview'}`;
  const themeColor = formData.themeColor || '#d4af37'; // Gold
  const iconColor = formData.btnIconColor || '#d4af37';
  const iconHex = iconColor.replace('#', '');

  const getSnsIcon = (platform, color) => {
    const hex = (color || '#ffffff').replace('#', '');
    const imgStyle = { width: '20px', height: '20px', display: 'block', objectFit: 'contain' };
    switch(platform) {
      case 'instagram': return <img src={`https://cdn.simpleicons.org/instagram/${hex}`} width="20" height="20" style={imgStyle} alt="insta" />;
      case 'kakao': return <img src={`https://cdn.simpleicons.org/kakaotalk/${hex}`} width="20" height="20" style={imgStyle} alt="kakao" />;
      case 'facebook': return <img src={`https://cdn.simpleicons.org/facebook/${hex}`} width="20" height="20" style={imgStyle} alt="fb" />;
      case 'tiktok': return <img src={`https://cdn.simpleicons.org/tiktok/${hex}`} width="20" height="20" style={imgStyle} alt="tiktok" />;
      case 'x': return <img src={`https://cdn.simpleicons.org/x/${hex}`} width="20" height="20" style={imgStyle} alt="x" />;
      case 'threads': return <img src={`https://cdn.simpleicons.org/threads/${hex}`} width="20" height="20" style={imgStyle} alt="threads" />;
      case 'linkedin': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={imgStyle}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
        </svg>
      );
      default: return <Share2 size={20} color={color || '#ffffff'} />;
    }
  };

  const actions = [
    { icon: <Phone size={20} color={iconColor} />, label: '회사전화', value: formData.phoneWork },
    { icon: <Smartphone size={20} color={iconColor} />, label: '개인전화', value: formData.phonePersonal },
    { icon: <Mail size={20} color={iconColor} />, label: '이메일', value: formData.email },
    { icon: <MessageSquare size={20} color={iconColor} />, label: '문자', value: formData.phonePersonal },
    { icon: <Globe size={20} color={iconColor} />, label: '웹사이트', value: formData.website },
    ...Object.entries(formData.sns || {}).map(([platform, value]) => ({
      icon: getSnsIcon(platform, iconColor),
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      value
    }))
  ].filter(a => a.value);

  const finalBtnBg = 'rgba(255,255,255,0.05)';
  const finalBlockBg = 'rgba(255,255,255,0.03)';
  const glassBorder = 'rgba(212, 175, 55, 0.15)'; // Subtle gold border

  return (
    <div className="preview-card-luxury" style={{ 
      background: '#0a0a0a', 
      color: '#ffffff', 
      padding: '3rem 1.5rem', 
      borderRadius: '24px',
      fontFamily: "'Playfair Display', 'Pretendard', serif", // Added serif font fallback
      minHeight: '600px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${glassBorder}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      {/* Top Logo Section */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
        {formData.logoUrl ? (
          <img 
            src={formData.logoUrl} 
            alt="Logo" 
            style={{ maxWidth: `${formData.logoSize || 40}%`, height: 'auto', objectFit: 'contain' }} 
            crossOrigin="anonymous" 
          />
        ) : null}
      </div>

      {/* Top Profile Section */}
      {formData.profileUrl && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', width: '100%' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Gold Glowing Border Effect */}
            <div style={{ 
              width: `${formData.profileSize || 120}px`, 
              height: `${formData.profileSize || 120}px`, 
              borderRadius: '50%', 
              padding: '3px',
              background: `linear-gradient(135deg, ${themeColor}, #fef08a, ${themeColor})`,
              boxShadow: `0 0 25px ${themeColor}66`,
              display: 'inline-block'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
                <img src={formData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name and Job Title */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '1px' }}>
          <span style={{ fontSize: `${formData.nameFontSizeKor || 28}px`, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{formData.name || '성함'}</span>
          {formData.nameEng && (
            <span style={{ fontSize: `${formData.nameFontSizeEng || 18}px`, fontWeight: 300, opacity: 0.8, marginLeft: '0.75rem', letterSpacing: '2px' }}>{formData.nameEng}</span>
          )}
        </h1>
        <p style={{ margin: 0, opacity: 0.7, fontSize: `${formData.jobTitleFontSize || 16}px`, textAlign: 'center', letterSpacing: '0.5px' }}>{formData.jobTitle}</p>
        <div style={{ height: '1px', width: '40px', background: themeColor, marginTop: '1.25rem', opacity: 0.5 }}></div>
      </div>

      {/* Info Card Section */}
      <div style={{ 
        background: finalBlockBg, 
        borderRadius: '16px', 
        padding: '1.25rem 1rem', 
        marginBottom: '1.5rem', 
        border: `1px solid ${glassBorder}`,
        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={16} color={themeColor} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Company</div>
            <div style={{ fontSize: `${formData.companyFontSize || 15}px`, fontWeight: 500, letterSpacing: '0.5px' }}>{formData.company || '회사명'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={16} color={themeColor} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Department</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.5px' }}>{formData.department || '부서명'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={16} color={themeColor} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Address</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.4', fontWeight: 300 }}>{formData.address || '사무실 주소'}</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div style={{ background: finalBlockBg, borderRadius: '16px', padding: '1.5rem 1.25rem', marginBottom: '1.5rem', border: `1px solid ${glassBorder}`, textAlign: 'center' }}>
        <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase' }}>About</div>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.7', opacity: 0.85, whiteSpace: 'pre-wrap', fontWeight: 300 }}>
          {formData.intro || '인사말이 등록되지 않았습니다.'}
        </p>
      </div>

      {/* Action Grid - 3 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {actions.map((action, idx) => (
          <div key={idx} style={{ 
            background: finalBtnBg, 
            borderRadius: '12px', 
            padding: '0.75rem 0.35rem', 
            textAlign: 'center',
            border: `1px solid ${glassBorder}`,
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 500, letterSpacing: '0.5px' }}>{action.label}</div>
          </div>
        ))}
      </div>

      {/* Paper Card Button */}
      {formData.paperCardUrl && (
        <div style={{ textAlign: 'center' }}>
          <button style={{ 
            width: '100%', 
            padding: '1rem', 
            background: `linear-gradient(90deg, #b8860b, ${themeColor})`, 
            color: '#fff', 
            border: 'none', 
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            letterSpacing: '1px',
            boxShadow: `0 4px 15px ${themeColor}40`
          }}>
            종이명함 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default LuxuryThemePreview;

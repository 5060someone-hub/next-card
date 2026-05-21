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

const CardPreview = ({ formData }) => {
  const finalCardUrl = `https://nextcard.kr/v/${formData.customCardUrl || 'preview'}`;
  const themeColor = formData.themeColor || '#db2777';
  const iconColor = formData.btnIconColor || '#ffffff';
  const iconHex = iconColor.replace('#', '');

  // Brightness check for background color to adjust contrast elements
  const isLightBg = (color) => {
    if (!color || color === 'transparent') return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const glassBg = isLightBg(formData.bgColor) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const glassBorder = isLightBg(formData.bgColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  // Comprehensive Action Mapping (Unlimited SNS)
  const getSnsIcon = (platform, color) => {
    const hex = (color || '#ffffff').replace('#', '');
    switch(platform) {
      case 'instagram': return <img src={`https://cdn.simpleicons.org/instagram/${hex}`} width="20" height="20" alt="insta" />;
      case 'kakaotalk': return <img src={`https://cdn.simpleicons.org/kakaotalk/${hex}`} width="20" height="20" alt="kakao" />;
      case 'facebook': return <img src={`https://cdn.simpleicons.org/facebook/${hex}`} width="20" height="20" alt="fb" />;
      case 'tiktok': return <img src={`https://cdn.simpleicons.org/tiktok/${hex}`} width="20" height="20" alt="tiktok" />;
      case 'x': return <img src={`https://cdn.simpleicons.org/x/${hex}`} width="20" height="20" alt="x" />;
      case 'threads': return <img src={`https://cdn.simpleicons.org/threads/${hex}`} width="20" height="20" alt="threads" />;
      case 'linkedin': return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const finalBtnBg = formData.btnBgColor || glassBg;
  const finalBlockBg = formData.blockBgColor || glassBg;

  return (
    <div className="preview-card-v3" style={{ 
      background: formData.bgColor || '#111827', 
      color: formData.textColor || '#fff', 
      padding: '2.5rem 1.5rem', 
      borderRadius: '24px',
      fontFamily: "'Pretendard', sans-serif",
      minHeight: '600px',
      position: 'relative',
      overflow: 'hidden'
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{ 
              width: `${formData.profileSize || 120}px`, 
              height: `${formData.profileSize || 120}px`, 
              borderRadius: '50%', 
              padding: '4px',
              background: `linear-gradient(45deg, ${themeColor}, #0ea5e9)`,
              display: 'inline-block'
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#374151' }}>
                <img src={formData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', width: '100%' }}>
        <div style={{ height: '3px', width: '60px', background: `linear-gradient(90deg, ${themeColor}, #0ea5e9)`, marginBottom: '0.75rem' }}></div>
        <h1 style={{ margin: '0 0 0.35rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: `${formData.nameFontSizeKor || 26}px` }}>{formData.name || '성함'}</span>
          {formData.nameEng && (
            <span style={{ fontSize: `${formData.nameFontSizeEng || 18}px`, fontWeight: 400, opacity: 0.8, marginLeft: '0.5rem' }}>{formData.nameEng}</span>
          )}
        </h1>
        <p style={{ margin: 0, opacity: 0.6, fontSize: `${formData.jobTitleFontSize || 17}px`, textAlign: 'center' }}>{formData.jobTitle}</p>
      </div>

      {/* Info Card Section */}
      <div style={{ 
        background: finalBlockBg, 
        borderRadius: '16px', 
        padding: '1.15rem 0.85rem', 
        marginBottom: '1rem', 
        border: `1px solid ${glassBorder}`,
        boxShadow: '0 8px 12px -3px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={18} color={themeColor} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Company</div>
            <div style={{ fontSize: `${formData.companyFontSize || 14}px`, fontWeight: 700 }}>{formData.company || '회사명'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={18} color={themeColor} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Department</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formData.department || '부서명'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color={themeColor} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Address</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>{formData.address || '사무실 주소'}</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div style={{ background: finalBlockBg, borderRadius: '16px', padding: '1.15rem 1.25rem', marginBottom: '1rem', border: `1px solid ${glassBorder}` }}>
        <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '3px' }}>ABOUT</div>
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', opacity: 0.9, whiteSpace: 'pre-wrap', textAlign: formData.introAlign || 'center' }}>
          {formData.intro || '인사말이 등록되지 않았습니다.'}
        </p>
      </div>

      {/* Action Grid - 3 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {actions.map((action, idx) => (
          <div key={idx} className="action-button-v3" style={{ 
            background: finalBtnBg, 
            borderRadius: '12px', 
            padding: '0.65rem 0.35rem', 
            textAlign: 'center',
            border: `1px solid ${glassBorder}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, color: formData.textColor || '#fff' }}>{action.label}</div>
          </div>
        ))}
      </div>

      {/* Paper Card Button */}
      {formData.paperCardUrl && (
        <div style={{ textAlign: 'center' }}>
          <button style={{ 
            width: '100%', 
            padding: '1rem', 
            background: '#000', 
            color: '#fff', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.9rem',
            fontWeight: 700
          }}>
            종이명함 보기
          </button>
        </div>
      )}

      {/* QR Code Section */}
      <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          background: '#fff', 
          padding: '12px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'inline-block'
        }}>
          <QRCodeSVG value={finalCardUrl} size={80} bgColor="#ffffff" fgColor="#000000" />
        </div>
        <p style={{ fontSize: '0.65rem', marginTop: '1rem', letterSpacing: '1px', opacity: 0.4 }}>SCAN TO CONNECT</p>
      </div>
    </div>
  );
};

export default CardPreview;

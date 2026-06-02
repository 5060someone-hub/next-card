import React from 'react';
import { 
  Building2, Briefcase, MapPin, 
  Phone, Smartphone, Mail, MessageSquare, 
  Share2, Download, Home, Link as LinkIcon
} from 'lucide-react';

const LiveCardPreview = ({ heroForm }) => {
  // Map heroForm to cardData format
  const cardData = {
    name: heroForm.name || '홍길동',
    company: heroForm.company || '넥스트카드',
    jobTitle: heroForm.jobTitle || '대표이사',
    department: heroForm.department || '디자인팀',
    address: heroForm.address || '서울시 강남구 테헤란로 123',
    phonePersonal: heroForm.phonePersonal || '010-1234-5678',
    email: heroForm.email || 'hello@nextcard.kr',
    website: heroForm.link || 'https://nextcard.kr',
    logoUrl: heroForm.logoUrl || '',
    profileUrl: heroForm.profileUrl || '',
    bgColor: '#ffffff',
    textColor: '#1e293b',
    btnBgColor: '#f8fafc',
    blockBgColor: '#f8fafc',
    template: 'modern',
    themeColor: '#db2777',
    btnIconColor: '#db2777'
  };

  const themeColor = cardData.themeColor;
  const iconColor = cardData.btnIconColor;

  const isLightBg = (color) => {
    if (!color || color === 'transparent') return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const glassBg = isLightBg(cardData.bgColor) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const glassBorder = isLightBg(cardData.bgColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const finalBlockBg = cardData.blockBgColor || glassBg;
  const finalBtnBg = cardData.btnBgColor || glassBg;

  const actions = [
    { icon: <Phone size={22} color={iconColor} />, label: '회사전화', value: '02-123-4567', href: '#' },
    { icon: <Smartphone size={22} color={iconColor} />, label: '개인전화', value: cardData.phonePersonal, href: '#' },
    { icon: <Mail size={22} color={iconColor} />, label: '이메일', value: cardData.email, href: '#' },
    { icon: <MessageSquare size={22} color={iconColor} />, label: '문자보내기', value: cardData.phonePersonal, href: '#' },
    { icon: <MapPin size={22} color={iconColor} />, label: '지도보기', value: cardData.address, href: '#' },
    { icon: <LinkIcon size={22} color={iconColor} />, label: '웹사이트', value: cardData.website, href: '#' }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#f1f5f9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 폰 목업 테두리 */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        height: '90%',
        maxHeight: '800px',
        background: cardData.bgColor,
        borderRadius: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        overflowY: 'auto',
        overflowX: 'hidden',
        border: '8px solid #334155',
        position: 'relative',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE
      }}>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        
        <div style={{ 
          color: cardData.textColor,
          padding: '2.5rem 1.25rem',
          minHeight: '100%',
          position: 'relative',
          boxSizing: 'border-box'
        }}>
          {/* Top Logo Section */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
            {cardData.logoUrl ? (
              <img src={cardData.logoUrl} alt="Logo" style={{ maxWidth: '40%', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <div style={{ height: '30px' }}></div>
            )}
          </div>

          {/* Profile Section */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', width: '100%' }}>
            {cardData.profileUrl ? (
              <div style={{ 
                width: '110px', height: '110px', borderRadius: '50%', padding: '3px',
                background: `linear-gradient(45deg, ${themeColor}, #0ea5e9)`
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#374151' }}>
                  <img src={cardData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                </div>
              </div>
            ) : (
              <div style={{ 
                width: '110px', height: '110px', borderRadius: '50%', padding: '3px',
                background: `linear-gradient(45deg, ${themeColor}, #0ea5e9)`
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  사진 등록
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', width: '100%' }}>
            <div style={{ height: '3px', width: '50px', background: `linear-gradient(90deg, ${themeColor}, #0ea5e9)`, marginBottom: '0.75rem' }}></div>
            <h1 style={{ margin: '0 0 0.35rem 0', fontWeight: 800, fontSize: '24px', textAlign: 'center' }}>
              {cardData.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.6, fontSize: '15px', textAlign: 'center' }}>
              {cardData.jobTitle}
            </p>
          </div>

          {/* Business Info Block */}
          <div style={{ 
            background: finalBlockBg, borderRadius: '16px', padding: '1rem 0.75rem', 
            marginBottom: '1rem', border: `1px solid ${glassBorder}`, boxShadow: '0 8px 12px -3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={16} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Company</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{cardData.company}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={16} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Department</div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{cardData.department}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={16} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Address</div>
                <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>{cardData.address}</div>
              </div>
            </div>
          </div>

          {/* Action Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {actions.map((action, idx) => (
              <div key={idx} style={{ 
                background: finalBtnBg, borderRadius: '12px', padding: '0.6rem 0.3rem', 
                textAlign: 'center', border: `1px solid ${glassBorder}`
              }}>
                <div style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 600, color: cardData.textColor }}>{action.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LiveCardPreview;

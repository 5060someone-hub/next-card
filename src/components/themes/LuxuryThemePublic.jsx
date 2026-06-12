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

const LuxuryThemePublic = ({ cardData, actions, onShare, onSaveContact, isNfcSaved, onSaveNfc }) => {
  const themeColor = cardData.themeColor || '#d4af37'; 
  const iconColor = cardData.btnIconColor || '#d4af37';
  
  const getSnsIcon = (platform, color) => {
    const hex = (color || '#ffffff').replace('#', '');
    const imgStyle = { width: '22px', height: '22px', display: 'block', objectFit: 'contain' };
    switch(platform) {
      case 'instagram': return <img src={`https://cdn.simpleicons.org/instagram/${hex}`} width="22" height="22" style={imgStyle} alt="insta" />;
      case 'kakao': return <img src={`https://cdn.simpleicons.org/kakaotalk/${hex}`} width="22" height="22" style={imgStyle} alt="kakao" />;
      case 'facebook': return <img src={`https://cdn.simpleicons.org/facebook/${hex}`} width="22" height="22" style={imgStyle} alt="fb" />;
      case 'tiktok': return <img src={`https://cdn.simpleicons.org/tiktok/${hex}`} width="22" height="22" style={imgStyle} alt="tiktok" />;
      case 'x': return <img src={`https://cdn.simpleicons.org/x/${hex}`} width="22" height="22" style={imgStyle} alt="x" />;
      case 'threads': return <img src={`https://cdn.simpleicons.org/threads/${hex}`} width="22" height="22" style={imgStyle} alt="threads" />;
      case 'linkedin': return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color || '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={imgStyle}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
        </svg>
      );
      default: return <Share2 size={22} color={color || '#ffffff'} />;
    }
  };

  const finalBtnBg = 'rgba(255,255,255,0.05)';
  const finalBlockBg = 'rgba(255,255,255,0.03)';
  const glassBorder = 'rgba(212, 175, 55, 0.15)'; 

  return (
    <div className="public-card-luxury-root" style={{ 
      background: '#000', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center',
      paddingBottom: '40px',
      paddingTop: cardData.isTemporary ? '40px' : '0'
    }}>
      {cardData.isTemporary && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#ef4444', color: '#fff', padding: '0.75rem', textAlign: 'center', zIndex: 1000, fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          ⏳ 체험용 명함 (D-{cardData.daysLeft} 삭제예정)
          <div role="button" onClick={() => window.location.href = `/signup?claimId=${cardData.id}`} style={{ background: '#fff', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px' }}>
            가입하고 영구 보존하기
          </div>
        </div>
      )}

      {/* Container */}
      <div style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: '#0a0a0a', 
        color: '#ffffff',
        padding: '3rem 1.5rem',
        minHeight: '100vh',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: "'Playfair Display', 'Pretendard', serif",
        borderLeft: `1px solid ${glassBorder}`,
        borderRight: `1px solid ${glassBorder}`,
        boxShadow: '0 0 50px rgba(0,0,0,0.8)'
      }}>
        {/* Top Logo Section */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', width: '100%' }}>
          {cardData.logoUrl ? (
            <img 
              src={cardData.logoUrl} 
              alt="Logo" 
              style={{ maxWidth: `${cardData.logoSize || 40}%`, height: 'auto', objectFit: 'contain' }} 
              crossOrigin="anonymous" 
            />
          ) : null}
        </div>

        {/* Profile Section */}
        {cardData.profileUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', width: '100%' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ 
                width: `${cardData.profileSize || 130}px`, 
                height: `${cardData.profileSize || 130}px`, 
                borderRadius: '50%', 
                padding: '4px',
                background: `linear-gradient(135deg, ${themeColor}, #fef08a, ${themeColor})`,
                boxShadow: `0 0 30px ${themeColor}66`,
                display: 'inline-block'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
                  <img src={cardData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" alt="Profile" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '1px' }}>
            <span style={{ fontSize: `${cardData.nameFontSizeKor || 30}px`, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cardData.name}</span>
            {cardData.nameEng && (
              <span style={{ fontSize: `${cardData.nameFontSizeEng || 20}px`, fontWeight: 300, opacity: 0.8, marginLeft: '0.75rem', letterSpacing: '2px' }}>{cardData.nameEng}</span>
            )}
          </h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: `${cardData.jobTitleFontSize || 17}px`, textAlign: 'center', letterSpacing: '0.5px' }}>
            {cardData.jobTitle}
          </p>
          <div style={{ height: '1px', width: '40px', background: themeColor, marginTop: '1.25rem', opacity: 0.5 }}></div>
        </div>

        {/* Business Info Block */}
        <div style={{ 
          background: finalBlockBg, 
          borderRadius: '16px', 
          padding: '1.25rem 1rem', 
          marginBottom: '1.5rem', 
          border: `1px solid ${glassBorder}`,
          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={18} color={themeColor} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Company</div>
              <div style={{ fontSize: `${cardData.companyFontSize || 15}px`, fontWeight: 500, letterSpacing: '0.5px' }}>{cardData.company || '회사명'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={18} color={themeColor} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Department</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.5px' }}>{cardData.department || '부서명'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1px solid ${glassBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={18} color={themeColor} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '2px', letterSpacing: '1px', textTransform: 'uppercase' }}>Address</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.4', fontWeight: 300 }}>{cardData.address || '사무실 주소'}</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {cardData.intro && (
          <div style={{ background: finalBlockBg, borderRadius: '16px', padding: '1.5rem 1.25rem', marginBottom: '1.5rem', border: `1px solid ${glassBorder}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: themeColor, fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '4px', textTransform: 'uppercase' }}>About</div>
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.7', opacity: 0.85, whiteSpace: 'pre-wrap', fontWeight: 300 }}>
              {cardData.intro}
            </p>
          </div>
        )}

        {/* Action Grid - 3 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {actions.map((action, idx) => (
            <a 
              key={idx} 
              href={action.href} 
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                if(action.label === '웹사이트' && action.href?.includes('#Intent')) {
                  // intent links are handled naturally
                }
              }}
            >
              <div style={{ 
                background: finalBtnBg, 
                borderRadius: '12px', 
                padding: '0.85rem 0.35rem', 
                textAlign: 'center',
                border: `1px solid ${glassBorder}`,
                transition: 'all 0.2s ease',
                height: '100%'
              }}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 500, color: '#ffffff', letterSpacing: '0.5px' }}>{action.label}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Additional Custom Links */}
        {cardData.customLinks && cardData.customLinks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {cardData.customLinks.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: finalBtnBg, 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  textAlign: 'center', 
                  color: '#ffffff',
                  fontWeight: '500',
                  border: `1px solid ${glassBorder}`,
                  letterSpacing: '1px'
                }}>
                  {link.title}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Paper Card Button */}
        {cardData.paperCardUrl && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <a href={cardData.paperCardUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
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
            </a>
          </div>
        )}

        {/* Save/Share Area */}
        <div style={{ 
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: `1px solid ${glassBorder}`,
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '0.5rem' 
        }}>
          <div onClick={onShare} style={{ 
            background: finalBtnBg, border: `1px solid ${glassBorder}`, borderRadius: '12px', padding: '1rem 0', textAlign: 'center', cursor: 'pointer', color: '#fff' 
          }}>
            <Share2 size={20} style={{ marginBottom: '6px', color: themeColor }} />
            <div style={{ fontSize: '0.7rem', fontWeight: '500', letterSpacing: '0.5px' }}>공유하기</div>
          </div>
          <div onClick={onSaveContact} style={{ 
            background: finalBtnBg, border: `1px solid ${glassBorder}`, borderRadius: '12px', padding: '1rem 0', textAlign: 'center', cursor: 'pointer', color: '#fff' 
          }}>
            <MapPin size={20} style={{ marginBottom: '6px', color: themeColor }} />
            <div style={{ fontSize: '0.7rem', fontWeight: '500', letterSpacing: '0.5px' }}>연락처 저장</div>
          </div>
          {isNfcSaved ? (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', border: `1px solid rgba(16, 185, 129, 0.3)`, borderRadius: '12px', padding: '1rem 0', textAlign: 'center', color: '#10b981' 
            }}>
              <Smartphone size={20} style={{ marginBottom: '6px' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: '500', letterSpacing: '0.5px' }}>NFC 저장완료</div>
            </div>
          ) : (
            <div onClick={onSaveNfc} style={{ 
              background: finalBtnBg, border: `1px solid ${glassBorder}`, borderRadius: '12px', padding: '1rem 0', textAlign: 'center', cursor: 'pointer', color: '#fff' 
            }}>
              <Smartphone size={20} style={{ marginBottom: '6px', color: themeColor }} />
              <div style={{ fontSize: '0.7rem', fontWeight: '500', letterSpacing: '0.5px' }}>NFC 저장</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuxuryThemePublic;

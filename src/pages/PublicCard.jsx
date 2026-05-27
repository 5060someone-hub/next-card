import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Phone,
  Mail,
  Globe,
  MessageSquare,
  MapPin,
  Building2,
  Briefcase,
  Smartphone,
  Share2,
  UserCircle,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './PublicCard.css';
import SpaSectionRenderer from '../components/SpaSectionRenderer';

const PublicCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaperCard, setShowPaperCard] = useState(false);
  const [adConfig, setAdConfig] = useState(null);
  const [productFeatures, setProductFeatures] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/card/view/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCardData(data);
          
          // --- 통계 트래킹 (조회수 증가) ---
          const urlParams = new URLSearchParams(window.location.search);
          const source = urlParams.get('ref') || 'direct';
          fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardId: id,
              userId: data.userId, // 백엔드에서 userId를 포함하여 반환한다고 가정
              actionType: 'view',
              source
            })
          }).catch(e => console.error('Tracking Error:', e));
          
          // 상품 정보 및 광고 설정 가져오기
          const [prodRes, adRes] = await Promise.all([
            fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/products`),
            fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/settings/ad`)
          ]);
          
          if (prodRes.ok) {
            const products = await prodRes.json();
            const product = products.find(p => p.id === data.productType);
            setProductFeatures(product?.features);
          }
          if (adRes.ok) {
            setAdConfig(await adRes.json());
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    const splashIcon = localStorage.getItem('globalFavicon');
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#ffffff', 
        color: '#000000' 
      }}>
        {splashIcon ? (
          <img 
            src={splashIcon} 
            alt="Loading..." 
            style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'contain',
              animation: 'pulse 1.5s infinite ease-in-out'
            }} 
          />
        ) : (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite ease-in-out' }}>
            NextCard
          </div>
        )}
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }
  if (!cardData) return <div className="error-screen">명함을 찾을 수 없습니다.</div>;

  const trackEvent = (actionType, linkUrl = '') => {
    if (!cardData) return;
    const urlParams = new URLSearchParams(window.location.search);
    fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: id,
        userId: cardData.userId,
        actionType,
        linkUrl,
        source: urlParams.get('ref') || 'direct'
      })
    }).catch(e => console.error(e));
  };

  const handleSaveContact = () => {
    trackEvent('save_contact');
    
    // URL의 id 파라미터를 백엔드 VCF 엔드포인트로 바로 전달
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
    window.location.href = `${apiUrl}/api/card/vcf/${id}`;
  };

  const themeColor = cardData.themeColor || '#db2777';
  const iconColor = cardData.btnIconColor || '#ffffff';

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

  const glassBg = isLightBg(cardData.bgColor) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const glassBorder = isLightBg(cardData.bgColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

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
    { icon: <Phone size={22} color={iconColor} />, label: '회사전화', value: cardData.phoneWork, href: `tel:${cardData.phoneWork}` },
    { icon: <Smartphone size={22} color={iconColor} />, label: '개인전화', value: cardData.phonePersonal, href: `tel:${cardData.phonePersonal}` },
    { icon: <Mail size={22} color={iconColor} />, label: '메일보내기', value: cardData.email, href: `mailto:${cardData.email}` },
    { icon: <MessageSquare size={22} color={iconColor} />, label: '문자보내기', value: cardData.phonePersonal, href: `sms:${cardData.phonePersonal}` },
    { icon: <MapPin size={22} color={iconColor} />, label: '지도보기', value: cardData.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cardData.address || '')}` },
    { icon: <Globe size={22} color={iconColor} />, label: '웹사이트', value: cardData.website, href: cardData.website?.startsWith('http') ? cardData.website : `https://${cardData.website}` },
    ...Object.entries(cardData.sns || {}).map(([platform, value]) => ({
      icon: getSnsIcon(platform, iconColor),
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      value,
      href: value?.startsWith('http') ? value : (platform === 'kakaotalk' ? `https://pf.kakao.com/${value}` : `https://${platform}.com/${value}`)
    }))
  ].filter(a => a.value);

  const finalBtnBg = cardData.btnBgColor || glassBg;
  const finalBlockBg = cardData.blockBgColor || glassBg;

  return (
    <div className="public-card-v3-root" style={{ 
      background: '#000', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center',
      paddingBottom: '40px'
    }}>
      <div className="card-container" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: cardData.bgColor || '#111827', 
        color: cardData.textColor || '#fff',
        padding: '3rem 1.5rem',
        minHeight: '100vh',
        position: 'relative',
        boxSizing: 'border-box',
        overflowX: 'hidden'
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
                background: `linear-gradient(45deg, ${themeColor}, #0ea5e9)`,
                display: 'inline-block'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#374151' }}>
                  <img src={cardData.profileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" alt="Profile" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem', width: '100%' }}>
            <div style={{ height: '3px', width: '60px', background: `linear-gradient(90deg, ${themeColor}, #0ea5e9)`, marginBottom: '0.75rem' }}></div>
            <h1 style={{ margin: '0 0 0.35rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: `${cardData.nameFontSizeKor || 26}px` }}>{cardData.name}</span>
              {cardData.nameEng && (
                <span style={{ fontSize: `${cardData.nameFontSizeEng || 18}px`, fontWeight: 400, opacity: 0.8, marginLeft: '0.5rem' }}>{cardData.nameEng}</span>
              )}
            </h1>
            <p style={{ margin: 0, opacity: 0.6, fontSize: `${cardData.jobTitleFontSize || 17}px`, textAlign: 'center' }}>
              {cardData.jobTitle}
            </p>
          </div>

        {/* Business Info Block */}
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
              <div style={{ fontSize: `${cardData.companyFontSize || 14}px`, fontWeight: 700 }}>{cardData.company}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={18} color={themeColor} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Department</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cardData.department}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={18} color={themeColor} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Address</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>{cardData.address}</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div style={{ 
          background: finalBlockBg, 
          borderRadius: '16px', 
          padding: '1.15rem 0.85rem', 
          marginBottom: '1rem', 
          border: `1px solid ${glassBorder}`
        }}>
          <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '3px' }}>ABOUT</div>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.6', opacity: 0.9, whiteSpace: 'pre-wrap', textAlign: cardData.introAlign || 'center' }}>
            {cardData.intro}
          </p>
        </div>

        {/* Action Grid - 3 Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {actions.map((action, idx) => (
            <a 
              key={idx} 
              href={action.href} 
              style={{ textDecoration: 'none' }}
              onClick={() => trackEvent('click_link', action.href)}
            >
              <div className="action-button-v3" style={{ 
                background: finalBtnBg, 
                borderRadius: '12px', 
                padding: '0.65rem 0.35rem', 
                textAlign: 'center',
                border: `1px solid ${glassBorder}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ marginBottom: '0.35rem', display: 'flex', justifyContent: 'center' }}>{action.icon}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, color: cardData.textColor || '#fff' }}>{action.label}</div>
              </div>
            </a>
          ))}
        </div>

        {/* SPA Sections Rendering */}
        {cardData.isSpaEnabled && productFeatures?.allowSinglePage !== false && (
          <SpaSectionRenderer 
            sections={cardData.sections} 
            themeColor={themeColor} 
            textColor={cardData.textColor} 
            blockBgColor={finalBlockBg}
          />
        )}

        {/* Save Contact Button */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <button 
            onClick={handleSaveContact}
            style={{ 
              width: '100%', 
              padding: '1.15rem', 
              background: themeColor, 
              color: '#fff', 
              borderRadius: '15px', 
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 4px 12px ${themeColor}66`
            }}
          >
            <Download size={20} /> 연락처 폰에 저장하기
          </button>
        </div>

        {/* Paper Card Trigger */}
        {cardData.paperCardUrl && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <button 
              onClick={() => setShowPaperCard(true)}
              style={{ 
                width: '100%', 
                padding: '1.15rem', 
                background: '#000', 
                color: '#fff', 
                borderRadius: '15px', 
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
            >
              종이명함 보기
            </button>
          </div>
        )}

        {/* Footer QR */}
        <div style={{ textAlign: 'center', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            background: '#fff', 
            padding: '12px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'inline-block'
          }}>
            <QRCodeSVG value={window.location.href} size={100} bgColor="#ffffff" fgColor="#000000" />
          </div>
          <p style={{ fontSize: '0.65rem', marginTop: '1rem', letterSpacing: '1px', opacity: 0.4 }}>SCAN TO CONNECT</p>
        </div>

        {/* Paper Card Modal */}
        {showPaperCard && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowPaperCard(false)}
          >
            <div style={{ width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={cardData.paperCardUrl} style={{ width: '100%', display: 'block' }} alt="Paper Card" />
            </div>
          </div>
        )}

        {/* Ad Section */}
        {((cardData.showAds !== false && productFeatures?.showAds) || (cardData.showAds === true)) && adConfig && (
          <div style={{ marginTop: '2rem' }}>
            <a href={adConfig.link} target="_blank" rel="noopener noreferrer" style={{
              display: 'block', width: '100%', padding: '1rem', borderRadius: '15px',
              background: adConfig.bgColor, color: adConfig.textColor,
              textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
              overflow: 'hidden'
            }}>
              <div className="ad-marquee-container">
                <span className="ad-marquee-text">
                  {adConfig.text} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {adConfig.text}
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCard;

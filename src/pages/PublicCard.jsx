import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
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
  Download,
  Home,
  X,
  Wallet,
  Bookmark,
  MessageCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './PublicCard.css';
import SpaSectionRenderer from '../components/SpaSectionRenderer';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const PublicCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaperCard, setShowPaperCard] = useState(false);
  const [adConfig, setAdConfig] = useState(null);
  const [productFeatures, setProductFeatures] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/kakao/.test(ua)) {
      const currentUrl = window.location.href;
      if (/iphone|ipad|ipod/.test(ua)) {
        window.location.href = 'kakao://web/openExternal?url=' + encodeURIComponent(currentUrl);
      } else {
        window.location.href = 'intent://' + currentUrl.replace(/https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Auto-open modal if redirected from KakaoTalk
    if (typeof window !== 'undefined' && window.location.search.includes('openModal=true')) {
      setShowPaperCard(true);
      const url = new URL(window.location);
      url.searchParams.delete('openModal');
      window.history.replaceState({}, '', url);
    }

    const fetchData = async () => {
      try {
        // 1. 먼저 백엔드 API에서 명함 조회를 시도합니다. (기존 정식 명함 및 샘플들)
        const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/card/view/${id}`);
        
        let data = null;

        if (response.ok) {
          data = await response.json();
        } else {
          // 2. 백엔드에 없으면 파이어베이스(체험용 임시명함)에서 조회합니다.
          const docRef = doc(db, 'business_cards', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const docData = docSnap.data();
            data = {
              id: docSnap.id,
              userId: docData.userId,
              productType: docData.productType || docData.grade || 'general',
              status: docData.status || 'active',
              createdAt: docData.createdAt,
              ...docData.cardData
            };
          }
        }

        if (data) {
          if (data.status === 'temporary' && data.createdAt) {
            const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now - createdDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 7) {
              setCardData({ isExpired: true, id: id });
              setLoading(false);
              return;
            } else {
              data.isTemporary = true;
              data.daysLeft = 7 - diffDays;
            }
          }
          
          // 과거에 생성되었거나 캐시 문제로 색상 값이 누락된 임시 명함을 위한 기본 화이트 테마 강제 적용
          if (data.status === 'temporary' && !data.bgColor) {
            data.bgColor = '#ffffff';
            data.textColor = '#1e293b';
            data.btnBgColor = '#f8fafc';
            data.blockBgColor = '#f8fafc';
            data.template = 'modern';
            data.themeColor = '#db2777';
            data.btnIconColor = '#db2777';
          }
          
          setCardData(data);
          
          // --- 통계 트래킹 (조회수 증가) ---
          const urlParams = new URLSearchParams(window.location.search);
          const source = urlParams.get('ref') || 'direct';

          fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardId: id,
              userId: data.userId,
              actionType: 'view',
              source: source
            })
          }).catch(e => console.error('Tracking Error:', e));
          
          // 상품 정보 가져오기
          try {
            const prodRes = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/products`);
            if (prodRes.ok) {
              const products = await prodRes.json();
              const product = products.find(p => p.id === data.productType);
              setProductFeatures(product?.features);
            }
          } catch (e) {
            console.error('Products fetch error', e);
          }
          
          // 광고 설정 가져오기
          try {
            const adRes = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/settings/ad`);
            if (adRes.ok) {
              const adData = await adRes.json();
              if (adData && adData.text) {
                setAdConfig(adData);
              }
            }
          } catch (e) {
            console.error('Ad config fetch error', e);
          }
        } else {
          setCardData(null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    const isKakao = navigator.userAgent.toLowerCase().includes('kakao');
    if (isKakao && typeof handleKakaoShare === 'function') {
      handleKakaoShare();
      return;
    }
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: cardData?.name ? `${cardData.name}님의 명함` : '모바일 명함',
          url: url
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('명함 주소가 복사되었습니다.');
    }
  };

  const handleAddToHome = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      setShowIosGuide(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
      });
    } else {
      alert('브라우저 설정 메뉴에서 "앱 설치" 또는 "홈 화면에 추가"를 선택해주세요.');
    }
  };

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

  if (cardData.isExpired) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', color: '#1e293b', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>만료된 명함입니다.</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
          이 명함은 1주일 무료 체험 기간이 종료되어 비공개 처리되었습니다.<br />
          본인의 명함이신가요? 지금 가입하시면 만들어둔 명함을 영구적으로 사용하실 수 있습니다!
        </p>
        <div role="button" onClick={() => window.location.href = `/signup?claimId=${cardData.id}`} className="btn-primary" style={{ padding: '1rem 2rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: '#db2777', color: '#fff' }}>
          무료 회원가입하고 명함 살리기
        </div>
      </div>
    );
  }

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
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
    const now = new Date().toISOString();

    let locationResolved = false;
    if (navigator.geolocation) {
      const fallbackTimer = setTimeout(() => {
        if (!locationResolved) {
          locationResolved = true;
          const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
          window.location.href = `${apiUrl}/api/card/vcf/${id}?date=${now}`;
        }
      }, 2000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(fallbackTimer);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          window.location.href = `${apiUrl}/api/card/vcf/${id}?lat=${lat}&lng=${lng}&date=${now}`;
        },
        (error) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(fallbackTimer);
          console.log("Geolocation error:", error);
          window.location.href = `${apiUrl}/api/card/vcf/${id}?date=${now}`;
        },
        { timeout: 2000 }
      );
    } else {
      window.location.href = `${apiUrl}/api/card/vcf/${id}?date=${now}`;
    }
  };

  const handleKakaoShare = () => {
    trackEvent('share_kakao');
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        try {
          window.Kakao.init('21003efec377258810eea15b29525fa0'); // 정식 앱 키
        } catch(err) {
          console.error('Kakao init error:', err);
        }
      }
      
      if (window.Kakao.isInitialized()) {
        const shareKakaoMessage = async () => {
          let finalImageUrl = 'https://nextcard.kr/og_preview.png';
          const targetImage = cardData.profileUrl || cardData.logoUrl;

          if (targetImage) {
            if (targetImage.startsWith('http')) {
              finalImageUrl = targetImage;
            } else if (targetImage.startsWith('data:image')) {
              try {
                // Base64를 File 객체로 변환
                const arr = targetImage.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const file = new File([u8arr], 'thumbnail.jpg', { type: mime });

                // 카카오 서버에 임시 업로드 (최대 100일 보관됨)
                const response = await window.Kakao.Share.uploadImage({
                  file: [file]
                });
                
                if (response && response.infos && response.infos.original) {
                  finalImageUrl = response.infos.original.url;
                }
              } catch (err) {
                console.error('Kakao image upload failed:', err);
              }
            }
          }

          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: cardData.name ? `${cardData.name}님의 모바일 명함` : 'NextCard 디지털 명함',
              description: cardData.company ? `${cardData.company} ${cardData.jobTitle || ''}` : '지금 바로 확인해보세요.',
              imageUrl: finalImageUrl,
              link: {
                mobileWebUrl: window.location.href,
                webUrl: window.location.href,
              },
            },
            buttons: [
              {
                title: '명함 확인하기',
                link: {
                  mobileWebUrl: window.location.href,
                  webUrl: window.location.href,
                },
              },
            ],
          });
        };

        shareKakaoMessage();
      } else {
        alert('카카오톡 API 키가 등록되지 않아 공유할 수 없습니다. 관리자에게 문의해주세요.');
      }
    } else {
      alert('카카오톡 라이브러리를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSaveToAddressBook = async () => {
    trackEvent('save_addressbook');
    const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
    if (!auth.id) {
      if (window.confirm('명함을 명함첩에 보관하려면 로그인이 필요합니다.\\n로그인(회원가입) 페이지로 이동하시겠습니까?')) {
        window.location.href = `/login?redirect=/v/${id}`;
      }
      return;
    }
    
    const saveConnection = async (lat = null, lng = null) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${apiUrl}/api/connections/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: auth.id, savedCardId: cardData._id || id, lat, lng })
        });
        const data = await res.json();
        if (res.ok) {
          if (window.confirm('명함첩에 성공적으로 보관되었습니다.\\n내 명함첩으로 이동하시겠습니까?')) {
            window.location.href = '/address-book';
          }
        } else {
          alert(data.message || '저장에 실패했습니다.');
        }
      } catch (err) {
        alert('서버와 통신 중 오류가 발생했습니다.');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          saveConnection(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Geolocation error:", error);
          saveConnection(null, null);
        },
        { timeout: 5000 }
      );
    } else {
      saveConnection(null, null);
    }
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
      case 'kakao': return <img src={`https://cdn.simpleicons.org/kakao/${hex}`} width="20" height="20" alt="kakao" />;
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
    { icon: <Phone size={22} color={iconColor} />, label: '회사전화', value: cardData.phoneWork || (cardData.grade === 'paper' ? cardData.phone : null), href: `tel:${cardData.phoneWork || cardData.phone}` },
    { icon: <Smartphone size={22} color={iconColor} />, label: '개인전화', value: cardData.phonePersonal || (cardData.grade !== 'paper' ? cardData.phone : null), href: `tel:${cardData.phonePersonal || cardData.phone}` },
    { icon: <Mail size={22} color={iconColor} />, label: '메일보내기', value: cardData.email, href: `mailto:${cardData.email}` },
    { icon: <MessageSquare size={22} color={iconColor} />, label: '문자보내기', value: cardData.phonePersonal || cardData.phone, href: `sms:${cardData.phonePersonal || cardData.phone}` },
    { icon: <MapPin size={22} color={iconColor} />, label: '지도보기', value: cardData.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cardData.address || '')}` },
    { icon: <Globe size={22} color={iconColor} />, label: '웹사이트', value: cardData.website, href: cardData.website?.startsWith('http') ? cardData.website : `https://${cardData.website}` },
    ...Object.entries(cardData.sns || {}).map(([platform, value]) => ({
      icon: getSnsIcon(platform, iconColor),
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      value,
      href: value?.startsWith('http') ? value : (platform === 'kakao' ? `https://pf.kakao.com/${value}` : `https://${platform}.com/${value}`)
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
      <div className="card-v3-container" style={{ 
        width: '100%', 
        maxWidth: '480px', 
        background: cardData.bgColor || '#111827', 
        color: cardData.textColor || '#fff',
        padding: '3rem 1.5rem',
        minHeight: '100vh',
        position: 'relative',
        boxSizing: 'border-box'
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
        {cardData.intro && String(cardData.intro).trim() !== '' && (
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
        )}

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

        {/* BIG BUTTON 1: Paper Card Trigger */}
        {cardData.paperCardUrl && (
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <button 
              type="button"
              onClick={() => {
                const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
                const isKakao = ua.indexOf('kakaotalk') > -1;
                
                if (isKakao) {
                  window.open(cardData.paperCardUrl, '_blank');
                } else {
                  setShowPaperCard(true);
                }
              }}
              style={{ 
                width: '100%', 
                padding: '1.15rem', 
                background: '#027C7E', 
                color: '#fff', 
                borderRadius: '15px', 
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 124, 126, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              종이명함 보기
            </button>
          </div>
        )}

        {/* Kakao / WebView Escape Buttons */}
        {(() => {
          const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
          const isMobile = /android|iphone|ipad|ipod|macintosh/i.test(ua) && ('ontouchend' in document || /android|iphone|ipad|ipod/i.test(ua));
          const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
          const urlWithoutScheme = currentUrl.replace(/https?:\/\//i, '');

          if (!isMobile) {
            return (
              <div 
                role="button"
                onClick={() => alert('PC 환경에서는 이미 정상적으로 기능이 작동합니다.')}
                style={{ 
                  background: '#f3f4f6', color: '#6b7280', padding: '1rem', 
                  borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', 
                  cursor: 'pointer', textAlign: 'center', marginBottom: '0.75rem',
                  border: '1px solid #d1d5db'
                }}
              >
                💻 PC 브라우저 환경입니다
              </div>
            );
          }

          return (
            <div style={{ marginBottom: '1.25rem', marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                아래 버튼을 이용하시려면 안전한 브라우저로 앱을 여세요!!
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <a href={'intent://' + urlWithoutScheme + '#Intent;scheme=https;package=com.sec.android.app.sbrowser;end'} style={{textDecoration: 'none'}}>
                  <div style={{ 
                    background: '#5c6bc0', color: '#fff', padding: '0.75rem 0.25rem', 
                    borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900', 
                    cursor: 'pointer', textAlign: 'center', height: '100%',
                    boxShadow: '0 4px 6px rgba(92, 107, 192, 0.2)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                  }}>
                    <img src="https://cdn.simpleicons.org/samsung/ffffff" width="20" height="20" alt="samsung" style={{marginBottom: '4px'}} />
                    삼성인터넷
                  </div>
                </a>
                <a href={'intent://' + urlWithoutScheme + '#Intent;scheme=https;package=com.android.chrome;end'} style={{textDecoration: 'none'}}>
                  <div style={{ 
                    background: '#ef4444', color: '#fff', padding: '0.75rem 0.25rem', 
                    borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900', 
                    cursor: 'pointer', textAlign: 'center', height: '100%',
                    boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                  }}>
                    <img src="https://cdn.simpleicons.org/googlechrome/ffffff" width="20" height="20" alt="chrome" style={{marginBottom: '4px'}} />
                    크롬
                  </div>
                </a>
                <a href={'kakaotalk://web/openExternal?url=' + encodeURIComponent(currentUrl)} style={{textDecoration: 'none'}}>
                  <div style={{ 
                    background: '#0ea5e9', color: '#fff', padding: '0.75rem 0.25rem', 
                    borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900', 
                    cursor: 'pointer', textAlign: 'center', height: '100%',
                    boxShadow: '0 4px 6px rgba(14, 165, 233, 0.2)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                  }}>
                    <img src="https://cdn.simpleicons.org/safari/ffffff" width="20" height="20" alt="safari" style={{marginBottom: '4px'}} />
                    사파리
                  </div>
                </a>
              </div>
            </div>
          );
        })()}

        {/* BIG BUTTON 2: Save Contact */}
        {cardData.grade !== 'paper' && cardData.productType !== 'paper' && (
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <div role="button" 
              onClick={handleSaveContact}
              style={{ 
                width: '100%', 
                padding: '1.15rem', 
                background: '#027C7E', 
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
                boxShadow: `0 4px 12px rgba(2, 124, 126, 0.4)`
              }}
            >
              <Download size={20} /> 연락처 폰에 저장하기
            </div>
          </div>
        )}

        {/* BIG BUTTON 3: Save to Address Book */}
        {cardData.grade !== 'paper' && cardData.productType !== 'paper' && (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div role="button" 
              onClick={handleSaveToAddressBook}
              style={{ 
                width: '100%', 
                padding: '1.15rem', 
                background: '#027C7E', 
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
                boxShadow: `0 4px 12px rgba(2, 124, 126, 0.4)`
              }}
            >
              <Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)
            </div>
          </div>
        )}

        {/* Share and Add to Home Screen Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2.5rem' }}>
          {cardData.grade !== 'paper' && cardData.productType !== 'paper' && (
            <div role="button" 
              onClick={handleAddToHome}
              className="action-btn"
              style={{ 
                flex: 1,
                padding: '1rem', 
                background: isLightBg(cardData.bgColor || '#111827') ? '#f1f5f9' : '#111827', 
                color: isLightBg(cardData.bgColor || '#111827') ? '#1e293b' : '#ffffff', 
                borderRadius: '15px', 
                border: isLightBg(cardData.bgColor || '#111827') ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Home size={18} /> 홈화면에 추가
            </div>
          )}
          <div role="button" 
            onClick={handleShare}
            className="action-btn"
            style={{ 
              flex: 1,
              padding: '1rem', 
              background: isLightBg(cardData.bgColor || '#111827') ? '#f1f5f9' : '#111827', 
              color: isLightBg(cardData.bgColor || '#111827') ? '#1e293b' : '#ffffff', 
              borderRadius: '15px', 
              border: isLightBg(cardData.bgColor || '#111827') ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Share2 size={18} /> 공유하기
          </div>
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

        {/* Footer QR (Exclude for Paper Cards) */}
        {cardData.grade !== 'paper' && cardData.productType !== 'paper' && (
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
        )}

        {/* Advertisement for Paper Cards */}
        {(cardData.grade === 'paper' || cardData.productType === 'paper') && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem 1rem', 
            background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
            borderRadius: '16px', 
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>나만의 모바일 명함을 만들어보세요!</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>
              종이명함의 한계를 넘어, 사진/영상/SNS가 모두 담긴<br/>스마트한 모바일 명함을 무료로 제작할 수 있습니다.
            </p>
            <div role="button" 
              onClick={() => window.location.href = '/'}
              style={{
                background: 'linear-gradient(90deg, #db2777, #f43f5e)',
                color: '#fff',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)'
              }}
            >
              무료로 명함 만들기
            </div>
          </div>
        )}

        {/* Paper Card Modal (createPortal to escape all CSS containers) */}
        {showPaperCard && cardData.paperCardUrl && typeof document !== 'undefined' && createPortal(
          <div 
            onClick={() => setShowPaperCard(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 99999999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'none'
            }}
          >
            <div 
              role="button"
              onClick={(e) => { e.stopPropagation(); setShowPaperCard(false); }}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
                fontSize: '2rem', width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 100000000, paddingBottom: '4px'
              }}
            >
              &times;
            </div>
            <div 
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', height: '100%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0'
              }}
            >
              <img 
                src={cardData.paperCardUrl} 
                alt="Paper Card" 
                style={{ 
                  maxWidth: '100%', maxHeight: '100%', 
                  objectFit: 'contain', display: 'block' 
                }} 
              />
            </div>
          </div>,
          document.body
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

        {/* iOS Install Guide Modal */}
        {showIosGuide && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }} onClick={() => setShowIosGuide(false)}>
            <div style={{
              background: '#fff', color: '#000', padding: '2rem 1.5rem',
              borderRadius: '20px', textAlign: 'center', maxWidth: '320px', position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              <div role="button" 
                onClick={() => setShowIosGuide(false)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
              >
                <X size={20} />
              </div>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>홈 화면에 추가</h3>
              <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', lineHeight: '1.5', color: '#444' }}>
                Safari 하단의 <strong>공유(<Share2 size={14} style={{display:'inline', verticalAlign:'middle'}}/>)</strong> 버튼을 누르고<br/>
                <strong>'홈 화면에 추가'</strong>를 선택해 주세요.
              </p>
              <div role="button" 
                onClick={() => setShowIosGuide(false)}
                style={{ background: '#000', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', width: '100%' }}
              >
                확인
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCard;

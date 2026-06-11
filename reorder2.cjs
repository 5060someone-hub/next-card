const fs = require('fs');
const content = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

const startIndex = content.indexOf('{/* BIG BUTTON 1: Paper Card Trigger */}');
const endIndex = content.indexOf('{/* SPA Sections Rendering */}');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* Kakao / WebView Escape Buttons */}
        {(() => {
          const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
          const isMobile = /android|iphone|ipad|ipod|macintosh/i.test(ua) && ('ontouchend' in document || /android|iphone|ipad|ipod/i.test(ua));
          const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
          const urlWithoutScheme = currentUrl.replace(/https?:\\/\\//i, '');

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
                boxShadow: \`0 4px 12px rgba(2, 124, 126, 0.4)\`
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
                boxShadow: \`0 4px 12px rgba(2, 124, 126, 0.4)\`
              }}
            >
              <Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)
            </div>
          </div>
        )}

        `;
  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/pages/PublicCard.jsx', newContent, 'utf8');
  console.log('Successfully updated PublicCard.jsx');
} else {
  console.log('Could not find indices');
}

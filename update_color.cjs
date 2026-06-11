const fs = require('fs');
const content = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

const startIndex = content.indexOf('{/* Share and Add to Home Screen Buttons */}');
const endIndex = content.indexOf('{/* BIG BUTTON 1: Paper Card Trigger */}');

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* Share and Add to Home Screen Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '0.75rem' }}>
          {cardData.grade !== 'paper' && cardData.productType !== 'paper' && (
            <div role="button" 
              onClick={handleAddToHome}
              className="action-btn"
              style={{ 
                flex: 1,
                padding: '1rem', 
                background: '#02cc99', 
                color: '#ffffff', 
                borderRadius: '15px', 
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 204, 153, 0.3)'
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
              background: '#02cc99', 
              color: '#ffffff', 
              borderRadius: '15px', 
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 204, 153, 0.3)'
            }}
          >
            <Share2 size={18} /> 공유하기
          </div>
        </div>

        `;
  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/pages/PublicCard.jsx', newContent, 'utf8');
  console.log('Successfully updated PublicCard.jsx');
} else {
  console.log('Could not find indices');
}

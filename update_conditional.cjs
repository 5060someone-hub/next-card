const fs = require('fs');
let content = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

// Normalize line endings for replacement
content = content.replace(/\r\n/g, '\n');

const target = `<div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
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
          </div>`;

const replacement = `{cardData.department && String(cardData.department).trim() !== '' && (
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Briefcase size={18} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Department</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cardData.department}</div>
              </div>
            </div>
          )}
          {cardData.address && String(cardData.address).trim() !== '' && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} color={themeColor} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: themeColor, fontWeight: 700, marginBottom: '1px', opacity: 0.9 }}>Address</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>{cardData.address}</div>
              </div>
            </div>
          )}`;

if (content.indexOf(target) !== -1) {
  const newContent = content.replace(target, replacement);
  fs.writeFileSync('src/pages/PublicCard.jsx', newContent, 'utf8');
  console.log('Successfully updated PublicCard.jsx');
} else {
  console.log('Target string not found');
}

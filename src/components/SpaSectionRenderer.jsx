import React from 'react';

const SpaSectionRenderer = ({ sections, themeColor, textColor, blockBgColor }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Sticky Navigation */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        padding: '10px 0',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        marginBottom: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {sections.map(sec => sec.isVisible && (
          <a key={'nav_'+sec.id} href={'#'+sec.id} style={{
            color: '#fff',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px'
          }}>
            {sec.title}
          </a>
        ))}
      </div>

      {/* Render Sections */}
      {sections.map(sec => {
        if (!sec.isVisible) return null;

        return (
          <div key={sec.id} id={sec.id} style={{
            background: blockBgColor || 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            scrollMarginTop: '80px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: themeColor, fontSize: '1.1rem' }}>{sec.title}</h3>

            {sec.type === 'text' && (
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6', color: textColor || '#fff' }}>
                {sec.content}
              </div>
            )}

            {sec.type === 'gallery' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                {(sec.images || []).map((img, i) => (
                  <img key={i} src={img} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} alt="gallery" />
                ))}
              </div>
            )}

            {sec.type === 'video' && sec.videoUrl && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                <iframe 
                  src={sec.videoUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              </div>
            )}

            {sec.type === 'qa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(sec.qaList || []).map((qa, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: themeColor, marginBottom: '8px', fontSize: '0.9rem' }}>Q. {qa.q}</div>
                    <div style={{ fontSize: '0.85rem', color: textColor || '#fff', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{qa.a}</div>
                  </div>
                ))}
              </div>
            )}

            {sec.type === 'map' && sec.address && (
              <div style={{ fontSize: '0.85rem', color: textColor || '#fff' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{sec.address}</div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sec.address)}`} target="_blank" rel="noreferrer" style={{ color: themeColor, textDecoration: 'none' }}>
                  구글 지도에서 보기
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SpaSectionRenderer;

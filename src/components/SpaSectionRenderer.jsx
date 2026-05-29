import React, { useState, useEffect, useCallback } from 'react';

// ─── YouTube URL 변환 ─────────────────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
};

// ─── 라이트박스 컴포넌트 ──────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose, themeColor }) => {
  const [idx, setIdx] = useState(startIndex);

  // 키보드 이벤트 (← → ESC)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx(i => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    // 배경 스크롤 잠금
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [images.length, onClose]);

  const goPrev = (e) => { e.stopPropagation(); setIdx(i => Math.max(0, i - 1)); };
  const goNext = (e) => { e.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)); };

  const hasPrev = idx > 0;
  const hasNext = idx < images.length - 1;

  return (
    /* 배경 클릭 시 닫기 */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '1rem',
      }}
    >
      {/* 상단: 닫기 버튼 + 카운터 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
        }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600 }}>
          {idx + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: '#fff',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 이미지 영역 (클릭 전파 방지) */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '3.5rem',
          marginBottom: '3.5rem',
        }}
      >
        {/* 이전 버튼 */}
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          style={{
            background: hasPrev ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            color: hasPrev ? '#fff' : 'rgba(255,255,255,0.25)',
            fontSize: '1.2rem',
            cursor: hasPrev ? 'pointer' : 'default',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="이전 사진"
        >
          ‹
        </button>

        {/* 확대 이미지 */}
        <img
          src={images[idx]}
          alt={`gallery-${idx + 1}`}
          style={{
            maxWidth: 'calc(100% - 120px)',
            maxHeight: 'calc(100vh - 160px)',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          draggable={false}
        />

        {/* 다음 버튼 */}
        <button
          onClick={goNext}
          disabled={!hasNext}
          style={{
            background: hasNext ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            color: hasNext ? '#fff' : 'rgba(255,255,255,0.25)',
            fontSize: '1.2rem',
            cursor: hasNext ? 'pointer' : 'default',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          aria-label="다음 사진"
        >
          ›
        </button>
      </div>

      {/* 하단 썸네일 도트 */}
      {images.length > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', gap: '6px', position: 'absolute', bottom: '1.25rem' }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? '20px' : '8px',
                height: '8px',
                borderRadius: '99px',
                background: i === idx ? (themeColor || '#db2777') : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.25s',
              }}
              aria-label={`${i + 1}번째 사진`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── 메인 렌더러 ──────────────────────────────────────────────────────────────
const SpaSectionRenderer = ({ sections, themeColor, textColor, blockBgColor }) => {
  // 라이트박스 상태: { images: [], index: 0 } 또는 null
  const [lightbox, setLightbox] = useState(null);

  const openLightbox = useCallback((images, index) => {
    setLightbox({ images, index });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  if (!sections || sections.length === 0) return null;

  return (
    <>
      <div style={{ marginTop: '2rem' }}>
        {/* Sticky Navigation (Removed by user request) */}
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
              <h3 style={{ margin: '0 0 1rem 0', color: themeColor, fontSize: '1.1rem' }}>
                {sec.title === '텍스트 블록' ? '소개글' : sec.title}
              </h3>

              {/* ── 텍스트 블록 ── */}
              {sec.type === 'text' && (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6', color: textColor || '#fff' }}>
                  {sec.content}
                </div>
              )}

              {/* ── 갤러리 블록 (클릭 시 라이트박스 오픈) ── */}
              {sec.type === 'gallery' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  {(sec.images || []).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => openLightbox(sec.images, i)}
                      style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
                      title="클릭하여 크게 보기"
                    >
                      <img
                        src={img}
                        style={{
                          width: '100%',
                          aspectRatio: '9 / 5',
                          height: 'auto',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          display: 'block',
                          transition: 'transform 0.25s',
                        }}
                        alt={`gallery-${i + 1}`}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {/* 돋보기 힌트 아이콘 */}
                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#fff',
                        pointerEvents: 'none',
                      }}>
                        🔍
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── 유튜브 영상 블록 ── */}
              {sec.type === 'video' && sec.videoUrl && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(sec.videoUrl)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </div>
              )}

              {/* ── Q&A 블록 ── */}
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

              {/* ── 지도 블록 ── */}
              {sec.type === 'map' && sec.address && (
                <div style={{ fontSize: '0.85rem', color: textColor || '#fff' }}>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{sec.address}</div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sec.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: themeColor, textDecoration: 'none' }}
                  >
                    구글 지도에서 보기
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 라이트박스 오버레이 (열린 경우에만 렌더) ── */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={closeLightbox}
          themeColor={themeColor}
        />
      )}
    </>
  );
};

export default SpaSectionRenderer;

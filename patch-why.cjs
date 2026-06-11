const fs = require('fs');
let c = fs.readFileSync('src/pages/WhyNextCard.jsx', 'utf8');

const helperCode = `
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = '';
    try {
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      }
    } catch(e) { }
    return videoId ? \`https://www.youtube.com/embed/\${videoId}\` : url;
  };

  const detailImages = content.detailImages || (content.detailImage ? [content.detailImage] : []);
`;

if (!c.includes('getYoutubeEmbedUrl')) {
  c = c.replace('const content = contentData?.whySection || {};', 'const content = contentData?.whySection || {};\n' + helperCode);
}

const renderOld = `        {content.videoUrl && content.videoUrl.trim() !== '' && (
          <div className="why-video-wrapper">
            <iframe 
              src={content.videoUrl} 
              title="Video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* 상세페이지 이미지 추가 */}
        {content.detailImage && (
          <div className="why-detail-image-container" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <img src={content.detailImage} alt="상세 설명" style={{ maxWidth: '100%', borderRadius: '12px' }} />
          </div>
        )}`;

const renderNew = `        {content.videoUrl && content.videoUrl.trim() !== '' && (
          <div className="why-video-wrapper">
            <iframe 
              src={getYoutubeEmbedUrl(content.videoUrl)} 
              title="Video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* 상세페이지 이미지 리스트 추가 */}
        {detailImages.length > 0 && (
          <div className="why-detail-image-container" style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            {detailImages.map((imgUrl, i) => (
              <img key={i} src={imgUrl} alt={\`상세 설명 \${i+1}\`} style={{ maxWidth: '100%', width: '100%', display: 'block', borderRadius: '12px' }} />
            ))}
          </div>
        )}`;

c = c.replace(renderOld, renderNew);
fs.writeFileSync('src/pages/WhyNextCard.jsx', c);
console.log('WhyNextCard updated');

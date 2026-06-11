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
  c = c.replace('useEffect(() => {', helperCode + '\n  useEffect(() => {');
  fs.writeFileSync('src/pages/WhyNextCard.jsx', c);
  console.log('Fixed WhyNextCard.jsx missing functions');
} else {
  console.log('Already has getYoutubeEmbedUrl');
}

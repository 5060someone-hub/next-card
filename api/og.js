export default async function handler(req, res) {
  const { id } = req.query;
  const backendUrl = process.env.VITE_API_URL || 'https://next-card-backend.onrender.com';
  
  try {
    // 1. Fetch the static index.html from the current deployment
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const htmlUrl = `${protocol}://${host}/index.html`;
    
    let html = '';
    try {
      const htmlRes = await fetch(htmlUrl);
      if (htmlRes.ok) html = await htmlRes.text();
    } catch (e) {
      console.error('Failed to fetch index.html', e);
    }

    if (!html) {
      return res.redirect('/');
    }

    // 2. Fetch Card Data
    const cardRes = await fetch(`${backendUrl}/api/card/view/${id}`);
    if (cardRes.ok) {
      const cardData = await cardRes.json();
      
      const title = cardData.name ? `${cardData.name} | ${cardData.company || '디지털 명함'}` : 'NextCard.kr | 프리미엄 디지털 명함';
      const desc = cardData.intro || '모바일 환경에 최적화된 나만의 스마트한 디지털 프로필';
      // Use paperCardUrl (if uploaded) or profileUrl or logoUrl or default
      const img = cardData.paperCardUrl || cardData.profileUrl || cardData.logoUrl || 'https://nextcard.kr/og_preview.png';

      // Replace OG tags
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}"/>`);
      html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}"/>`);
      html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${img}"/>`);
      html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${title}"/>`);
      html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${desc}"/>`);
      html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${img}"/>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect('/');
  }

  try {
    // 1. 현재 배포된 정적 index.html을 가져옵니다.
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

    // 2. Firebase REST API를 통해 블로그 데이터 가져오기
    const projectId = 'nextcard-blog';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blog_posts/${id}`;
    
    const blogRes = await fetch(url);
    if (blogRes.ok) {
      const data = await blogRes.json();
      
      const title = data.fields?.title?.stringValue || 'NextCard 블로그';
      const summary = data.fields?.summary?.stringValue || 'NextCard 스마트 명함 블로그입니다.';
      const thumbnail = data.fields?.thumbnail?.stringValue || 'https://nextcard.kr/og_preview.png';
      const ogUrl = `https://nextcard.kr/blog/${id}`;

      // 3. 메타 태그 교체
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}"/>`);
      html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${summary}"/>`);
      html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${thumbnail}"/>`);
      html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/, `<meta property="og:url" content="${ogUrl}"/>`);
      
      html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/, `<meta name="twitter:title" content="${title}"/>`);
      html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/, `<meta name="twitter:description" content="${summary}"/>`);
      html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${thumbnail}"/>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.send(html);
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
}

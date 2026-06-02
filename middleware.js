/**
 * Vercel Edge Middleware — SPA 프리렌더링 봇 처리
 * 
 * 검색엔진 봇(Google, Naver 등)이 접근하면
 * Prerender.io 서비스를 통해 완성된 HTML을 반환합니다.
 * 
 * 환경변수 PRERENDER_TOKEN 설정 방법:
 * Vercel 대시보드 → Settings → Environment Variables → PRERENDER_TOKEN 추가
 */

export const config = {
  // 정적 파일(.js .css .png 등)은 미들웨어 제외
  matcher: ['/((?!assets|favicon|logo|og_preview|icons|profile|sitemap|robots).*)'],
}

// 검색엔진 봇 목록 (구글, 네이버, 카카오, SNS 크롤러 등)
const BOT_USER_AGENTS = [
  // 구글
  'googlebot', 'google-inspectiontool', 'google page speed',
  'developers.google.com/+/web/snippet', 'chrome-lighthouse',
  'adsbot-google',
  // 네이버
  'yeti', 'naverbot', 'daumoa',
  // 빙/야후
  'bingbot', 'yahoo! slurp', 'slurp',
  // SNS 크롤러
  'facebookexternalhit', 'twitterbot', 'linkedinbot',
  'kakao', 'kakaotalk-scrap',
  'whatsapp', 'telegrambot', 'discordbot',
  'slackbot', 'line-poker',
  // 기타
  'baiduspider', 'yandexbot', 'rogerbot',
  'outbrain', 'pinterest', 'applebot',
  'redditbot', 'quora', 'flipboard',
]

function isBot(userAgent) {
  const ua = (userAgent || '').toLowerCase()
  return BOT_USER_AGENTS.some(bot => ua.includes(bot))
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''

  // 봇이 아니면 그냥 통과 (일반 사용자 영향 없음)
  if (!isBot(userAgent)) {
    return
  }

  const token = process.env.PRERENDER_TOKEN

  // 토큰이 없으면 그냥 통과
  if (!token) {
    return
  }

  const url = request.url

  // 이미 프리렌더된 요청이면 무한루프 방지
  if (request.headers.get('x-prerender-host')) {
    return
  }

  try {
    const prerenderUrl = `https://service.prerender.io/${url}`

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': token,
        'User-Agent': userAgent,
        'X-Prerender-Host': request.headers.get('host') || '',
      },
    })

    if (!prerenderResponse.ok) {
      return // 프리렌더 실패 시 그냥 SPA 제공
    }

    const html = await prerenderResponse.text()

    return new Response(html, {
      status: prerenderResponse.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // 1시간 캐시
        'X-Prerendered': 'true',
      },
    })
  } catch {
    // 오류 시 그냥 SPA 제공 (서비스 무중단)
    return
  }
}

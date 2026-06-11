const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

// 1. Fix handleShare to use Kakao Share automatically if in KakaoTalk
const oldHandleShare = "  const handleShare = async () => {\n    const url = window.location.href;";
const newHandleShare = `  const handleShare = async () => {
    const isKakao = navigator.userAgent.toLowerCase().includes('kakaotalk');
    if (isKakao && typeof handleKakaoShare === 'function') {
      handleKakaoShare();
      return;
    }
    const url = window.location.href;`;

code = code.replace(oldHandleShare, newHandleShare);

// 2. Fix Geolocation hanging in handleSaveContact
const oldGeolocation = `    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          window.location.href = \`\${apiUrl}/api/card/vcf/\${id}?lat=\${lat}&lng=\${lng}&date=\${now}\`;
        },
        (error) => {
          console.log("Geolocation error:", error);
          window.location.href = \`\${apiUrl}/api/card/vcf/\${id}?date=\${now}\`;
        },
        { timeout: 5000 }
      );
    } else {`;

const newGeolocation = `    let locationResolved = false;
    if (navigator.geolocation) {
      const fallbackTimer = setTimeout(() => {
        if (!locationResolved) {
          locationResolved = true;
          window.location.href = \`\${apiUrl}/api/card/vcf/\${id}?date=\${now}\`;
        }
      }, 2000); // 2초 초과시 강제 다운로드 (카카오톡 무한 대기 방지)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!locationResolved) {
            locationResolved = true;
            clearTimeout(fallbackTimer);
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            window.location.href = \`\${apiUrl}/api/card/vcf/\${id}?lat=\${lat}&lng=\${lng}&date=\${now}\`;
          }
        },
        (error) => {
          if (!locationResolved) {
            locationResolved = true;
            clearTimeout(fallbackTimer);
            window.location.href = \`\${apiUrl}/api/card/vcf/\${id}?date=\${now}\`;
          }
        },
        { timeout: 2000 }
      );
    } else {`;

code = code.replace(oldGeolocation, newGeolocation);

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Replaced handleShare and Geolocation logics!");

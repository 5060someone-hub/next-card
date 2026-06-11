const fs = require('fs');
let c = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

const searchRegex = /(<button[^>]*onClick={\(\) => alert\('.*?튜토리얼.*?'\)}[^>]*>[\s\S]*?<\/button>\s*<\/div>)/;

if (searchRegex.test(c)) {
  const replacement = `$1
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => navigate('/why')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)', color: 'white', border: 'none', boxShadow: '0 10px 15px -3px rgba(219, 39, 119, 0.3)', fontWeight: 'bold' }}>
                💡 왜 넥스트카드인가? 자세히 보기
              </button>
            </div>`;
  c = c.replace(searchRegex, replacement);
  fs.writeFileSync('src/pages/LandingPage.jsx', c);
  console.log('Successfully inserted button.');
} else {
  console.log('Regex not matched');
}

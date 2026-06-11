const fs = require('fs');
let c = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

const targetStr = `              <button onClick={() => alert('동영상 튜토리얼은 준비 중입니다.')} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'white', color: '#1d4ed8', border: '1px solid #1d4ed8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                🎥 동영상으로 디지털명함 편집 방법 배우기
              </button>
            </div>`;

const newStr = `              <button onClick={() => alert('동영상 튜토리얼은 준비 중입니다.')} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'white', color: '#1d4ed8', border: '1px solid #1d4ed8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                🎥 동영상으로 디지털명함 편집 방법 배우기
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => navigate('/why')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)', color: 'white', border: 'none', boxShadow: '0 10px 15px -3px rgba(219, 39, 119, 0.3)', fontWeight: 'bold' }}>
                💡 왜 넥스트카드인가? 자세히 보기
              </button>
            </div>`;

if(c.includes(targetStr)) {
    c = c.replace(targetStr, newStr);
    fs.writeFileSync('src/pages/LandingPage.jsx', c);
    console.log("Success");
} else {
    console.log("Target string not found. Please check spacing or characters.");
}

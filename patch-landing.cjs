const fs = require('fs');
let c = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

// 1. Contact Card Wrapper
c = c.replace(
  `<div className="contact-card-wrapper">`,
  `<div className="contact-card-wrapper" style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>`
);

// 1-1. Fix header color in contact form to show on white bg
c = c.replace(
  `<h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>`,
  `<h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>`
);

// 2. Pricing Buttons
// Need to find: <button className={`btn-price ${plan.popular ? 'primary' : ''}`}>{plan.btn}</button>
// Replace with styled button
c = c.replace(
  /\<button className=\{\`btn-price \$\{plan\.popular \? 'primary' : ''\}\`\}\>\{plan\.btn\}\<\/button\>/g,
  `<button className={\`btn-price \${plan.popular ? 'primary' : 'secondary'}\`} style={plan.popular ? {} : { background: 'rgba(124,58,237,0.1)', color: 'var(--primary-color)', border: 'none', fontWeight: 'bold' }}>{plan.btn || (plan.name && plan.name.includes('문의') ? '문의하기' : '선택하기')}</button>`
);

// 3. Add Video button
const samplesDivOld = `<div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => navigate('/samples')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>`;

const samplesDivNew = `<div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/samples')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>`;

const btnTextOld = `체험?기\n                </button>\n              </div>`;
// In regex it's hard, let's replace manually. We know it ends with `체험하기` or similar (in the prompt it's `체험하기\n                </button>\n              </div>`).
// Let's use regex that matches the navigate('/samples') section.

c = c.replace(
  /<div style={{ textAlign: 'center', marginTop: '3rem' }}>\s*<button onClick=\{\(\) => navigate\('\/samples'\)\} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1\.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba\(59, 130, 246, 0\.3\)' }}>\s*([^<]+)\s*<\/button>\s*<\/div>/,
  `<div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/samples')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                $1
              </button>
              <button onClick={() => alert('동영상 튜토리얼이 준비 중입니다.')} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', cursor: 'pointer', background: 'white', color: '#1d4ed8', border: '1px solid #1d4ed8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                📺 동영상으로 디지털명함 편집 방법 배우기
              </button>
            </div>`
);

fs.writeFileSync('src/pages/LandingPage.jsx', c, 'utf8');
console.log('patched LandingPage');

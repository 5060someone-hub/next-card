const fs = require('fs');
let content = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

// 1. Add CSS classes
content = content.replace(
  `.sticky-right-side {`,
  `.desktop-only-btn { display: none; }\n            .mobile-only-btn { display: block; width: 100%; margin-top: 2rem; }\n            .sticky-right-side {`
);
content = content.replace(
  `.sample-mockup-wrapper {`,
  `.desktop-only-btn { display: block; }\n          .mobile-only-btn { display: none; }\n          .sample-mockup-wrapper {`
);

// 2. Wrap left button
content = content.replace(
  `<div style={{ marginTop: 'auto', paddingTop: '2rem' }}>\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\n               내 명함 만들기 시작\n             </button>\n          </div>`,
  `<div className="desktop-only-btn" style={{ marginTop: 'auto', paddingTop: '2rem' }}>\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\n               내 명함 만들기 시작\n             </button>\n          </div>`
);
content = content.replace(
  `<div style={{ marginTop: 'auto', paddingTop: '2rem' }}>\r\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\r\n               내 명함 만들기 시작\r\n             </button>\r\n          </div>`,
  `<div className="desktop-only-btn" style={{ marginTop: 'auto', paddingTop: '2rem' }}>\r\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\r\n               내 명함 만들기 시작\r\n             </button>\r\n          </div>`
);

// 3. Add right button under phone
const mobileBtnHTML = `
          <div className="mobile-only-btn">
             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
               내 명함 만들기 시작
             </button>
          </div>
        </div>
        
      </div>
    </div>`;

content = content.replace(
  `</div>\n        </div>\n        \n      </div>\n    </div>`,
  mobileBtnHTML
);
content = content.replace(
  `</div>\r\n        </div>\r\n        \r\n      </div>\r\n    </div>`,
  mobileBtnHTML
);

fs.writeFileSync('src/pages/SamplePreview.jsx', content, 'utf8');
console.log('patched mobile button');

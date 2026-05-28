const fs = require('fs');
let content = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

// 1. Add CSS class for mobile button
content = content.replace(
  `.sticky-right-side {`,
  `.desktop-only-btn { display: none; }\n            .mobile-only-btn { display: block; width: 100%; margin-top: 2rem; }\n            .sticky-right-side {`
);
content = content.replace(
  `.sample-mockup-wrapper {`,
  `.desktop-only-btn { display: block; }\n          .mobile-only-btn { display: none; }\n          .sample-mockup-wrapper {`
);

// 2. Wrap Left Side Button with desktop-only-btn class
content = content.replace(
  `<div style={{ marginTop: 'auto', paddingTop: '2rem' }}>\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\n               내 명함 만들기 시작\n             </button>\n          </div>`,
  `<div className="desktop-only-btn" style={{ marginTop: 'auto', paddingTop: '2rem' }}>\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\n               내 명함 만들기 시작\n             </button>\n          </div>`
);
content = content.replace(
  `<div style={{ marginTop: 'auto', paddingTop: '2rem' }}>\r\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\r\n               내 명함 만들기 시작\r\n             </button>\r\n          </div>`,
  `<div className="desktop-only-btn" style={{ marginTop: 'auto', paddingTop: '2rem' }}>\r\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\r\n               내 명함 만들기 시작\r\n             </button>\r\n          </div>`
);

// 3. Add Mobile Button right after the mockup wrapper closes.
const closingDivs = `          </div>\n        </div>\n        \n      </div>\n    </div>\n  );\n}`;
const newClosingDivs = `          </div>\n          \n          <div className="mobile-only-btn">\n             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>\n               내 명함 만들기 시작\n             </button>\n          </div>\n        </div>\n        \n      </div>\n    </div>\n  );\n}`;

content = content.replace(closingDivs, newClosingDivs);
content = content.replace(closingDivs.replace(/\n/g, '\r\n'), newClosingDivs.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/pages/SamplePreview.jsx', content, 'utf8');
console.log('patched successfully');

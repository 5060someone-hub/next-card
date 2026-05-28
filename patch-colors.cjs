const fs = require('fs');

// 1. Fix LandingPage.jsx inline colors for the contact form
let jsx = fs.readFileSync('src/pages/LandingPage.jsx', 'utf8');

jsx = jsx.replace(
  `<p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '8px' }}>제휴 및 도입 제안 등 문의사항을 남겨주시면 확인 후 연락드리겠습니다.</p>`,
  `<p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px' }}>제휴 및 도입 제안 등 문의사항을 남겨주시면 확인 후 연락드리겠습니다.</p>`
);

jsx = jsx.replace(
  `<label htmlFor="agree" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>`,
  `<label htmlFor="agree" style={{ fontSize: '0.85rem', color: '#64748b' }}>`
);

fs.writeFileSync('src/pages/LandingPage.jsx', jsx, 'utf8');

// 2. Fix LandingPage.css label color and input text color
let css = fs.readFileSync('src/pages/LandingPage.css', 'utf8');

// Labels should be dark
css = css.replace(
  `.contact-group label {\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: var(--text-main);\n  opacity: 0.9;\n}`,
  `.contact-group label {\n  font-size: 0.9rem;\n  font-weight: 600;\n  color: #334155;\n  opacity: 0.9;\n}`
);

// Input text should be white
css = css.replace(
  `.contact-group input,\n.contact-group select,\n.contact-group textarea {\n  background: rgba(15, 23, 42, 0.5);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 14px 18px;\n  color: var(--text-main);`,
  `.contact-group input,\n.contact-group select,\n.contact-group textarea {\n  background: #0f172a;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  padding: 14px 18px;\n  color: white;`
);

// Placeholder should be visible against dark input background
css = css.replace(
  `.contact-group input::placeholder,\n.contact-group textarea::placeholder {\n  color: rgba(148, 163, 184, 0.5);\n}`,
  `.contact-group input::placeholder,\n.contact-group textarea::placeholder {\n  color: rgba(255, 255, 255, 0.5);\n}`
);

fs.writeFileSync('src/pages/LandingPage.css', css, 'utf8');
console.log('patched contact form colors');

const fs = require('fs');
let content = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

// 1. Add style block right after the outermost div
content = content.replace(
  `<div className="sample-preview-page" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>`,
  `<div className="sample-preview-page" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>
      <style>
        {\`
          .sample-header {
            display: flex;
            align-items: center;
            padding: 1rem 2rem;
          }
          .sample-header h1 {
            margin: 0 auto;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            padding-right: 100px;
          }
          .sample-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 3rem;
          }
          .sample-mockup-wrapper {
            position: relative;
            width: 340px;
            height: 680px;
            background: #ffffff;
            border-radius: 44px;
            border: 12px solid #0f172a;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            margin: 0 auto;
          }
          @media (max-width: 768px) {
            .sample-header {
              padding: 1rem;
              justify-content: space-between;
            }
            .sample-header h1 {
              font-size: 1.1rem !important;
              padding-right: 0 !important;
              margin: 0;
            }
            .sample-header button {
              font-size: 0.9rem !important;
              padding: 0;
            }
            .sample-container {
              padding: 1rem;
              gap: 2rem;
            }
            .sample-mockup-wrapper {
              width: 100%;
              max-width: 340px;
            }
            .sticky-right-side {
              position: static !important;
            }
          }
        \`}
      </style>`
);

// 2. Modify Header
content = content.replace(
  `<header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>`,
  `<header className="sample-header" style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>`
);

content = content.replace(
  `<h1 style={{ margin: '0 auto', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', paddingRight: '100px' }}>`,
  `<h1>`
);

// 3. Modify Container
content = content.replace(
  `<div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>`,
  `<div className="sample-container">`
);

// 4. Modify Right Side container for sticky
content = content.replace(
  `{/* Right Side: Smartphone Live Preview */}\r\n        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem' }}>`,
  `{/* Right Side: Smartphone Live Preview */}\r\n        <div className="sticky-right-side" style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem', position: 'sticky', top: '100px', height: 'fit-content' }}>`
);
content = content.replace(
  `{/* Right Side: Smartphone Live Preview */}\n        <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem' }}>`,
  `{/* Right Side: Smartphone Live Preview */}\n        <div className="sticky-right-side" style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem', position: 'sticky', top: '100px', height: 'fit-content' }}>`
);

// 5. Modify Smartphone Mockup Wrapper
content = content.replace(
  `<div style={{ \r\n            position: 'relative',\r\n            width: '340px', \r\n            height: '680px', \r\n            background: '#ffffff',\r\n            borderRadius: '44px',\r\n            border: '12px solid #0f172a',\r\n            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',\r\n            overflow: 'hidden'\r\n          }}>`,
  `<div className="sample-mockup-wrapper">`
);
content = content.replace(
  `<div style={{ \n            position: 'relative',\n            width: '340px', \n            height: '680px', \n            background: '#ffffff',\n            borderRadius: '44px',\n            border: '12px solid #0f172a',\n            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',\n            overflow: 'hidden'\n          }}>`,
  `<div className="sample-mockup-wrapper">`
);

fs.writeFileSync('src/pages/SamplePreview.jsx', content, 'utf8');
console.log('patched SamplePreview');

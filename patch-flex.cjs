const fs = require('fs');
let c = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

c = c.replace(
  `<div className="sticky-right-side" style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '1rem', position: 'sticky', top: '100px', height: 'fit-content' }}>`,
  `<div className="sticky-right-side" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', position: 'sticky', top: '100px', height: 'fit-content' }}>`
);

fs.writeFileSync('src/pages/SamplePreview.jsx', c, 'utf8');
console.log('patched flex-direction');

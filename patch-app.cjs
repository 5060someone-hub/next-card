const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
  `import NamecardLanding from './pages/NamecardLanding';`,
  `import NamecardLanding from './pages/NamecardLanding';\nimport SamplePreview from './pages/SamplePreview';`
);

c = c.replace(
  `<Route path="/login" element={<Login />} />`,
  `<Route path="/samples" element={<SamplePreview />} />\n          <Route path="/login" element={<Login />} />`
);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('patched app');

const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes('<Route path="/samples"')) {
  c = c.replace(
    `<Route path="/login"`,
    `<Route path="/samples" element={<SamplePreview />} />\n        <Route path="/login"`
  );
  fs.writeFileSync('src/App.jsx', c, 'utf8');
  console.log('patched app with route');
} else {
  console.log('already has route');
}

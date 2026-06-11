const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminLandingEditor.jsx', 'utf8');
code = code.replace(/import\.meta\.env\.VITE_API_URL/g, '""');
fs.writeFileSync('src/pages/AdminLandingEditorMocked.jsx', code);

let test2 = fs.readFileSync('test2.jsx', 'utf8');
test2 = test2.replace('AdminLandingEditor.jsx', 'AdminLandingEditorMocked.jsx');
fs.writeFileSync('test2.jsx', test2);

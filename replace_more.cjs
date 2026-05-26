
const fs = require('fs');
let css = fs.readFileSync('./src/pages/AdminLandingEditor.css', 'utf-8');

css = css.replace(/color: #f472b6;/g, 'color: #db2777;');
css = css.replace(/rgba\(255,255,255,0.3\)/g, 'rgba(0,0,0,0.3)');

fs.writeFileSync('./src/pages/AdminLandingEditor.css', css);


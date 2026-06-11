const fs = require('fs');
let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

code = code.replace(/<button /g, '<div role="button" ');
code = code.replace(/<\/button>/g, '</div>');

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log('Done');

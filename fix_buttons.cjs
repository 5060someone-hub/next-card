const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

code = code.replace(/<button\s+onClick=\{handleAddToHome\}\s+className="action-btn"/g, '<button id="btn-home" className="action-btn"');
code = code.replace(/<button\s+onClick=\{handleShare\}\s+className="action-btn"/g, '<button id="btn-share" className="action-btn"');
code = code.replace(/<button\s+onClick=\{handleSaveContact\}/g, '<button id="btn-save"');
code = code.replace(/<button\s+onClick=\{handleSaveToAddressBook\}/g, '<button id="btn-addressbook"');
code = code.replace(/<button\s+onClick=\{\(\) => setShowPaperCard\(true\)\}/g, '<button id="btn-paper"');

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Successfully replaced button attributes!");

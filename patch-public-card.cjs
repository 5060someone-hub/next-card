const fs = require('fs');

try {
  let content = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

  // We split the file manually to be safe.
  const spaToken = "{/* SPA Sections Rendering */}";
  const buttonsToken = "{/* Share and Add to Home Screen Buttons */}";
  const footerToken = "{/* Footer QR */}";

  if (!content.includes(spaToken) || !content.includes(buttonsToken) || !content.includes(footerToken)) {
    throw new Error("Missing tokens");
  }

  const spaIndex = content.indexOf(spaToken);
  const buttonsIndex = content.indexOf(buttonsToken);
  const footerIndex = content.indexOf(footerToken);

  // We want to move everything between buttonsIndex and footerIndex to be right before spaIndex
  
  const beforeSpa = content.substring(0, spaIndex);
  const spaToButtons = content.substring(spaIndex, buttonsIndex);
  const buttonsToFooter = content.substring(buttonsIndex, footerIndex);
  const fromFooter = content.substring(footerIndex);

  // Reorder:
  // 1. beforeSpa
  // 2. buttonsToFooter
  // 3. spaToButtons
  // 4. fromFooter

  const newContent = beforeSpa + buttonsToFooter + spaToButtons + fromFooter;

  fs.writeFileSync('src/pages/PublicCard.jsx', newContent, 'utf8');
  console.log('Successfully rearranged PublicCard.jsx');
} catch (error) {
  console.error('Error modifying file:', error);
}

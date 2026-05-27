const fs = require('fs');
const path = './src/pages/CardEditor.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = const productTierId = currentProduct?.id || '';
  let maxGalleryCount = 1;
  let maxVideoCount = 1;
  
  if (productTierId === 'premium_nfc' || productTierId === 'premium' || productTierId === 'corporate') {
    maxGalleryCount = 999;
    maxVideoCount = 999;
  } else if (productTierId === 'prod_1778900193128' || productTierId === 'advanced' || productTierId === 'prod_1779363055944') {
    maxGalleryCount = 3;
    maxVideoCount = 3;
  } else if (productTierId === 'general' || productTierId === 'prod_1779351721158' || productTierId === 'event' || productTierId === 'prod_1778899977850') {
    maxGalleryCount = 1;
    maxVideoCount = 1;
  };

const replacement = const productTierId = currentProduct?.id || '';
  let maxGalleryCount = currentProduct?.features?.maxGallery;
  let maxVideoCount = currentProduct?.features?.maxVideo;
  
  if (maxGalleryCount === undefined || maxVideoCount === undefined) {
    if (productTierId === 'premium_nfc' || productTierId === 'premium' || productTierId === 'corporate') {
      maxGalleryCount = 999;
      maxVideoCount = 999;
    } else if (productTierId === 'prod_1778900193128' || productTierId === 'advanced' || productTierId === 'prod_1779363055944') {
      maxGalleryCount = 3;
      maxVideoCount = 3;
    } else {
      maxGalleryCount = 1;
      maxVideoCount = 1;
    }
  };

// Use regex to catch slight spacing differences
const pattern = /const productTierId = currentProduct\?\.id \|\| '';\s*let maxGalleryCount = 1;\s*let maxVideoCount = 1;\s*if \(productTierId === 'premium_nfc'.*?maxVideoCount = 1;\s*}/s;

if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced");
} else {
    console.log("Pattern not found");
}

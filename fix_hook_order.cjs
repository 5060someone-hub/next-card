const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

// 1. Remove the wrongly placed useEffect
const wrongEffectStart = code.indexOf('  useEffect(() => {\n    if (!cardData) return;');
const wrongEffectEnd = code.indexOf("  const themeColor = cardData.themeColor || '#db2777';");

if (wrongEffectStart !== -1 && wrongEffectEnd !== -1) {
    // Remove the bad chunk
    code = code.substring(0, wrongEffectStart) + code.substring(wrongEffectEnd);
}

// 2. Insert the useEffect correctly right after the second useEffect (fetchData)
// The fetchData useEffect ends around line 153: `  }, [id]);\n`
const insertTarget = '  }, [id]);\n';
const query_effect = `
  useEffect(() => {
    if (!cardData) return;
    
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      setTimeout(() => {
        if (action === 'share' && typeof handleShare === 'function') handleShare();
        else if (action === 'home' && typeof handleAddToHome === 'function') handleAddToHome();
        else if (action === 'save' && typeof handleSaveContact === 'function') handleSaveContact();
        else if (action === 'addressbook' && typeof handleSaveToAddressBook === 'function') handleSaveToAddressBook();
        else if (action === 'paper' && typeof setShowPaperCard === 'function') setShowPaperCard(true);
      }, 300);
    }
  }, [cardData]);
`;

code = code.replace(insertTarget, insertTarget + query_effect);

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Successfully moved useEffect above early returns!");

const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

const debugEffect = `
  useEffect(() => {
    if (!cardData) return;
    
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action) {
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      setTimeout(() => {
        if (action === 'share') {
           if (typeof handleShare === 'function') handleShare();
           else alert("handleShare is not a function!");
        }
        else if (action === 'home') {
           if (typeof handleAddToHome === 'function') handleAddToHome();
           else alert("handleAddToHome is not a function!");
        }
        else if (action === 'save') {
           if (typeof handleSaveContact === 'function') handleSaveContact();
           else alert("handleSaveContact is not a function!");
        }
        else if (action === 'addressbook') {
           if (typeof handleSaveToAddressBook === 'function') handleSaveToAddressBook();
           else alert("handleSaveToAddressBook is not a function!");
        }
        else if (action === 'paper') {
           if (typeof setShowPaperCard === 'function') setShowPaperCard(true);
           else alert("setShowPaperCard is not a function!");
        }
      }, 300);
    }
  }, [cardData]);
`;

code = code.replace(/useEffect\(\(\) => \{\s+if \(\!cardData\) return;[\s\S]*?\}, \[cardData\]\);/, debugEffect.trim());

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Replaced with debug effect");

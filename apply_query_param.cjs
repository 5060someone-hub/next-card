const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

const query_effect = `
  useEffect(() => {
    if (!cardData) return;
    
    // Check for action in query string
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action) {
      // Remove the query param to prevent re-triggering on reload
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      
      // Execute the action with a slight delay to ensure UI is ready
      setTimeout(() => {
        if (action === 'share') handleShare();
        else if (action === 'home') handleAddToHome();
        else if (action === 'save') handleSaveContact();
        else if (action === 'addressbook') handleSaveToAddressBook();
        else if (action === 'paper') setShowPaperCard(true);
      }, 300);
    }
  }, [cardData]);

  const themeColor = cardData.themeColor || '#db2777';
`;

code = code.replace("  const themeColor = cardData.themeColor || '#db2777';", query_effect);

// Home button
code = code.replace(
  /<button\s*\n\s*onClick=\{handleAddToHome\}\s*\n\s*className="action-btn"/g,
  '<a href="?action=home"\n              className="action-btn"'
);
code = code.replace('<Home size={18} /> 홈화면에 추가\n            </button>', '<Home size={18} /> 홈화면에 추가\n            </a>');

// Share button
code = code.replace(
  /<button\s*\n\s*onClick=\{handleShare\}\s*\n\s*className="action-btn"/g,
  '<a href="?action=share"\n            className="action-btn"'
);
code = code.replace('<Share2 size={18} /> 공유하기\n          </button>', '<Share2 size={18} /> 공유하기\n          </a>');

// Save Contact
code = code.replace(
  /<button\s*\n\s*onClick=\{handleSaveContact\}/g,
  '<a href="?action=save"'
);
code = code.replace('<Download size={20} /> 연락처 폰에 저장하기\n            </button>', '<Download size={20} /> 연락처 폰에 저장하기\n            </a>');

// Address Book
code = code.replace(
  /<button\s*\n\s*onClick=\{handleSaveToAddressBook\}/g,
  '<a href="?action=addressbook"'
);
code = code.replace('<Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)\n            </button>', '<Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)\n            </a>');

// Paper Card
code = code.replace(
  /<button\s*\n\s*onClick=\{\(\) => setShowPaperCard\(true\)\}/g,
  '<a href="?action=paper"'
);
code = code.replace('종이명함 보기\n            </button>', '종이명함 보기\n            </a>');

// Add textDecoration: none
code = code.replace(/boxShadow: '0 4px 12px rgba\(0,0,0,0.15\)'/g, "boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textDecoration: 'none'");
code = code.replace(/boxShadow: `0 4px 12px \$\{themeColor\}66`/g, "boxShadow: `0 4px 12px ${themeColor}66`, textDecoration: 'none'");
code = code.replace(/boxShadow: `0 4px 12px rgba\(59, 130, 246, 0.4\)`/g, "boxShadow: `0 4px 12px rgba(59, 130, 246, 0.4)`, textDecoration: 'none'");
code = code.replace(/boxShadow: '0 4px 12px rgba\(0,0,0,0.5\)'/g, "boxShadow: '0 4px 12px rgba(0,0,0,0.5)', textDecoration: 'none'");

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Successfully replaced buttons with anchor tags using query parameters in JS!");

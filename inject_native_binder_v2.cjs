const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

if (!code.includes('useRef')) {
  code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
}

const binderLogic = `
  const handlersRef = useRef({});

  useEffect(() => {
    handlersRef.current = {
      share: () => { if (typeof handleShare === 'function') handleShare(); },
      home: () => { if (typeof handleAddToHome === 'function') handleAddToHome(); },
      save: () => { if (typeof handleSaveContact === 'function') handleSaveContact(); },
      addressbook: () => { if (typeof handleSaveToAddressBook === 'function') handleSaveToAddressBook(); },
      paper: () => { if (typeof setShowPaperCard === 'function') setShowPaperCard(true); }
    };
  });

  useEffect(() => {
    if (!cardData) return;
    
    const bindNativeEvent = (id, actionName) => {
      const el = document.getElementById(id);
      if (el && !el.__bound) {
        el.__bound = true; // prevent multiple bindings
        
        const execute = (e) => {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
          if (handlersRef.current[actionName]) {
            handlersRef.current[actionName]();
          }
        };
        
        // Use capture phase to intercept before React or Kakao can swallow it
        el.addEventListener('click', execute, true);
        el.addEventListener('touchend', (e) => {
          if (e.cancelable) e.preventDefault();
          execute(e);
        }, { passive: false, capture: true });
      }
    };

    const timer = setTimeout(() => {
      bindNativeEvent('btn-home', 'home');
      bindNativeEvent('btn-share', 'share');
      bindNativeEvent('btn-save', 'save');
      bindNativeEvent('btn-addressbook', 'addressbook');
      bindNativeEvent('btn-paper', 'paper');
    }, 500);

    return () => clearTimeout(timer);
  }, [cardData]);
`;

const targetLine = "const [showIosGuide, setShowIosGuide] = useState(false);";
if (code.includes(targetLine) && !code.includes('handlersRef.current')) {
  code = code.replace(targetLine, targetLine + "\n" + binderLogic);
}

code = code.replace(/<button \n              onClick=\{handleAddToHome\}\n              className="action-btn"/g, '<button id="btn-home"\n              className="action-btn"');
code = code.replace(/<button \n            onClick=\{handleShare\}\n            className="action-btn"/g, '<button id="btn-share"\n            className="action-btn"');
code = code.replace(/<button \n              onClick=\{handleSaveContact\}/g, '<button id="btn-save"');
code = code.replace(/<button \n              onClick=\{handleSaveToAddressBook\}/g, '<button id="btn-addressbook"');
code = code.replace(/<button \n              onClick=\{\(\) => setShowPaperCard\(true\)\}/g, '<button id="btn-paper"');

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Binder successfully injected!");

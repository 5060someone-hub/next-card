const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

// 1. Add useRef to imports
code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");

// 2. Add Native Binder Logic
// Insert it right after `const [showIosGuide, setShowIosGuide] = useState(false);`
const binderLogic = `
  const handlersRef = useRef({});

  useEffect(() => {
    // Keep handlers fresh
    handlersRef.current = {
      share: () => {
        const isKakao = navigator.userAgent.toLowerCase().includes('kakaotalk');
        if (isKakao) handleKakaoShare();
        else handleShare();
      },
      home: () => { if (typeof handleAddToHome === 'function') handleAddToHome(); },
      save: () => { if (typeof handleSaveContact === 'function') handleSaveContact(); },
      addressbook: () => { if (typeof handleSaveToAddressBook === 'function') handleSaveToAddressBook(); },
      paper: () => { if (typeof setShowPaperCard === 'function') setShowPaperCard(true); }
    };
  });

  useEffect(() => {
    if (!cardData) return;
    
    // Bind native events to bypass KakaoTalk React onClick swallowing
    const bindNativeEvent = (id, actionName) => {
      const el = document.getElementById(id);
      if (el) {
        // Clone to remove old listeners
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        
        const execute = (e) => {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
          if (handlersRef.current[actionName]) {
            handlersRef.current[actionName]();
          }
        };
        
        newEl.addEventListener('click', execute);
        newEl.addEventListener('touchend', (e) => {
          if (e.cancelable) e.preventDefault(); // Prevent ghost click
          execute(e);
        }, { passive: false });
      }
    };

    const timer = setTimeout(() => {
      bindNativeEvent('btn-home', 'home');
      bindNativeEvent('btn-share', 'share');
      bindNativeEvent('btn-save', 'save');
      bindNativeEvent('btn-addressbook', 'addressbook');
      bindNativeEvent('btn-paper', 'paper');
    }, 300);

    return () => clearTimeout(timer);
  }, [cardData]);
`;

code = code.replace("  const [showIosGuide, setShowIosGuide] = useState(false);\n", "  const [showIosGuide, setShowIosGuide] = useState(false);\n" + binderLogic);

// 3. Add IDs to the buttons and remove onClick
code = code.replace(
  /<button \n              onClick=\{handleAddToHome\}\n              className="action-btn"/g,
  '<button id="btn-home"\n              className="action-btn"'
);

code = code.replace(
  /<button \n            onClick=\{handleShare\}\n            className="action-btn"/g,
  '<button id="btn-share"\n            className="action-btn"'
);

code = code.replace(
  /<button \n              onClick=\{handleSaveContact\}/g,
  '<button id="btn-save"'
);

code = code.replace(
  /<button \n              onClick=\{handleSaveToAddressBook\}/g,
  '<button id="btn-addressbook"'
);

code = code.replace(
  /<button \n              onClick=\{\(\) => setShowPaperCard\(true\)\}/g,
  '<button id="btn-paper"'
);

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Successfully applied Native Event Binder!");

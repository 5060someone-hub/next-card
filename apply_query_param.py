import re
import sys

try:
    with open('src/pages/PublicCard.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Inject the query parameter listener inside the useEffect that handles cardData
    # Find the end of `setCardData(data);` or somewhere safe after data is loaded.
    # Actually, we can just put a separate useEffect right before return.
    
    query_effect = """
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
"""

    code = code.replace("  const themeColor = cardData.themeColor || '#db2777';", query_effect)

    # 2. Replace Home button
    code = re.sub(
        r'<button\s+onClick=\{handleAddToHome\}\s+className="action-btn"',
        r'<a href="?action=home"\n              className="action-btn"',
        code
    )
    # The closing tag for Home button
    code = code.replace('<Home size={18} /> 홈화면에 추가\n            </button>', '<Home size={18} /> 홈화면에 추가\n            </a>')

    # 3. Replace Share button
    code = re.sub(
        r'<button\s+onClick=\{handleShare\}\s+className="action-btn"',
        r'<a href="?action=share"\n            className="action-btn"',
        code
    )
    code = code.replace('<Share2 size={18} /> 공유하기\n          </button>', '<Share2 size={18} /> 공유하기\n          </a>')

    # 4. Replace Save Contact
    code = re.sub(
        r'<button\s+onClick=\{handleSaveContact\}',
        r'<a href="?action=save"',
        code
    )
    code = code.replace('<Download size={20} /> 연락처 폰에 저장하기\n            </button>', '<Download size={20} /> 연락처 폰에 저장하기\n            </a>')

    # 5. Replace Address Book
    code = re.sub(
        r'<button\s+onClick=\{handleSaveToAddressBook\}',
        r'<a href="?action=addressbook"',
        code
    )
    code = code.replace('<Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)\n            </button>', '<Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)\n            </a>')

    # 6. Replace Paper Card
    code = re.sub(
        r'<button\s+onClick=\{\(\) => setShowPaperCard\(true\)\}',
        r'<a href="?action=paper"',
        code
    )
    code = code.replace('종이명함 보기\n            </button>', '종이명함 보기\n            </a>')

    # Add textDecoration: none to all action-btn anchors to prevent underlines
    code = code.replace("boxShadow: '0 4px 12px rgba(0,0,0,0.15)'", "boxShadow: '0 4px 12px rgba(0,0,0,0.15)', textDecoration: 'none'")
    code = code.replace("boxShadow: `0 4px 12px ${themeColor}66`", "boxShadow: `0 4px 12px ${themeColor}66`, textDecoration: 'none'")
    code = code.replace("boxShadow: `0 4px 12px rgba(59, 130, 246, 0.4)`", "boxShadow: `0 4px 12px rgba(59, 130, 246, 0.4)`, textDecoration: 'none'")
    code = code.replace("boxShadow: '0 4px 12px rgba(0,0,0,0.5)'", "boxShadow: '0 4px 12px rgba(0,0,0,0.5)', textDecoration: 'none'")

    with open('src/pages/PublicCard.jsx', 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("Successfully replaced buttons with anchor tags using query parameters!")
except Exception as e:
    print(f"Error: {e}")

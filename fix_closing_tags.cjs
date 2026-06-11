const fs = require('fs');

let code = fs.readFileSync('src/pages/PublicCard.jsx', 'utf8');

code = code.replace(/<Home size=\{18\} \/> 홈화면에 추가\s*<\/button>/g, '<Home size={18} /> 홈화면에 추가</a>');
code = code.replace(/<Share2 size=\{18\} \/> 공유하기\s*<\/button>/g, '<Share2 size={18} /> 공유하기</a>');
code = code.replace(/<Download size=\{20\} \/> 연락처 폰에 저장하기\s*<\/button>/g, '<Download size={20} /> 연락처 폰에 저장하기</a>');
code = code.replace(/<Bookmark size=\{20\} color="#fff" \/> 내 명함첩에 담기 \(NextCard\)\s*<\/button>/g, '<Bookmark size={20} color="#fff" /> 내 명함첩에 담기 (NextCard)</a>');
code = code.replace(/종이명함 보기\s*<\/button>/g, '종이명함 보기</a>');

fs.writeFileSync('src/pages/PublicCard.jsx', code);
console.log("Successfully fixed closing tags");

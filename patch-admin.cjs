const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminProductManagement.jsx', 'utf8');

// 1. Add state
admin = admin.replace(
  `const [newSampleUrl, setNewSampleUrl] = useState('');`,
  `const [newSampleUrl, setNewSampleUrl] = useState('');\n  const [newTags, setNewTags] = useState('');`
);

// 2. Add to API body
admin = admin.replace(
  `sampleUrl: newSampleUrl,`,
  `sampleUrl: newSampleUrl,\n            tags: newTags.split(',').map(t => t.trim()).filter(Boolean),`
);
admin = admin.replace(
  `sampleUrl: newSampleUrl,\r\n`,
  `sampleUrl: newSampleUrl,\r\n            tags: newTags.split(',').map(t => t.trim()).filter(Boolean),\r\n`
);

// 3. Clear state on success
admin = admin.replace(
  `setNewSampleUrl('');`,
  `setNewSampleUrl('');\n          setNewTags('');`
);
// Make sure it applies to both occurrences (if multiple)
admin = admin.replaceAll(
  `setNewSampleUrl('');`,
  `setNewSampleUrl('');\n      setNewTags('');`
);

// 4. Set state on edit
admin = admin.replace(
  `setNewSampleUrl(prod.sampleUrl || '');`,
  `setNewSampleUrl(prod.sampleUrl || '');\n      setNewTags(prod.tags ? prod.tags.join(', ') : '');`
);

// 5. Add UI Input
const sampleUrlDiv = `<div className="input-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>샘플 명함 URL (선택)</label>
                  <input 
                    type="text" 
                    value={newSampleUrl} 
                    onChange={(e) => setNewSampleUrl(e.target.value)} 
                    placeholder="예: /v/sample-vip 또는 https://nextcard.kr/v/sample"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                  />
                </div>`;
const newTagsDiv = `<div className="input-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>강조 태그 (콤마로 구분하여 입력)</label>
                  <input 
                    type="text" 
                    value={newTags} 
                    onChange={(e) => setNewTags(e.target.value)} 
                    placeholder="예: 로고 적용, 프리미엄, 통합 랜딩페이지"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                  />
                </div>`;

admin = admin.replace(
  /<div className="input-group" style=\{\{ marginBottom: '0\.75rem' \}\}>\s*<label[^>]*>샘플 명함 URL \(선택\)<\/label>\s*<input[^>]*value=\{newSampleUrl\}[^>]*\/>\s*<\/div>/,
  `$&
                ${newTagsDiv}`
);

fs.writeFileSync('src/pages/AdminProductManagement.jsx', admin, 'utf8');
console.log('patched admin');

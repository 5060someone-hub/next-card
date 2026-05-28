const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminProductManagement.jsx', 'utf8');

c = c.replace(
  `const [newProductDesc, setNewProductDesc] = useState('');`,
  `const [newProductDesc, setNewProductDesc] = useState('');\n  const [newSampleUrl, setNewSampleUrl] = useState('');`
);

c = c.replace(
  `const bodyData = { \n        name: newProductName, \n        description: newProductDesc, `,
  `const bodyData = { \n        name: newProductName, \n        description: newProductDesc, \n        sampleUrl: newSampleUrl, `
);

// We need to also patch the reset lines
c = c.replace(/setNewProductDesc\(''\);/g, `setNewProductDesc('');\n      setNewSampleUrl('');`);

// We need to patch the edit start lines
c = c.replace(/setNewProductDesc\(prod.description \|\| ''\);/, `setNewProductDesc(prod.description || '');\n    setNewSampleUrl(prod.sampleUrl || '');`);

// We need to inject the UI element right below the description field
const descUI = `<textarea \n                    value={newProductDesc} \n                    onChange={(e) => setNewProductDesc(e.target.value)} \n                    placeholder="상품에 대한 간단한 설명"\n                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px', fontSize: '0.75rem' }}\n                  />\n                </div>`;

const sampleUI = `${descUI}\n                <div style={{ marginBottom: '1rem' }}>\n                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>샘플 명함 URL</label>\n                  <input \n                    type="text" \n                    value={newSampleUrl} \n                    onChange={(e) => setNewSampleUrl(e.target.value)} \n                    placeholder="예: /v/sample-premium 또는 https://nextcard.kr/v/sample-premium"\n                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}\n                  />\n                </div>`;

c = c.replace(descUI, sampleUI);

fs.writeFileSync('src/pages/AdminProductManagement.jsx', c, 'utf8');
console.log('patched admin UI');

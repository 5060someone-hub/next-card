const fs = require('fs');

let preview = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

preview = preview.replace(
  /\{prod\.features\?\.allowLogo && <span style=\{\{.*?\}\}>.*?<\/span>\}\s*\{prod\.features\?\.allowCustomUrl && <span style=\{\{.*?\}\}>.*?<\/span>\}\s*\{prod\.features\?\.allowSinglePage && <span style=\{\{.*?\}\}>.*?<\/span>\}\s*\{prod\.features\?\.maxSnsCount > 1 && <span style=\{\{.*?\}\}>.*?<\/span>\}/s,
  `{(prod.tags && prod.tags.length > 0) ? (
                      prod.tags.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <>
                        {/* Fallback to legacy features if tags are empty (optional, but good for UX until they update them) */}
                        {prod.features?.allowLogo && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>로고 적용</span>}
                        {prod.features?.allowCustomUrl && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>커스텀 주소</span>}
                        {prod.features?.allowSinglePage && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>통합 랜딩페이지</span>}
                        {prod.features?.maxSnsCount > 1 && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>SNS {prod.features.maxSnsCount}개</span>}
                      </>
                    )}`
);

fs.writeFileSync('src/pages/SamplePreview.jsx', preview, 'utf8');
console.log('patched preview');

const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminLandingEditor.jsx', 'utf8');

const whyEditorCode = `
// ── 왜 넥스카드인가 에디터 ──
const WhyEditor = ({ data, onChange }) => {
  const d = data || {};
  const update = (k, v) => onChange({ ...d, [k]: v });
  const blocks = d.blocks || [];
  const addBlock = () => onChange({ ...d, blocks: [...blocks, { title: '새 장점', desc: '설명', icon: '✨' }] });
  const updateBlock = (idx, k, v) => {
    const copy = [...blocks];
    copy[idx][k] = v;
    onChange({ ...d, blocks: copy });
  };
  const removeBlock = (idx) => onChange({ ...d, blocks: blocks.filter((_, i) => i !== idx) });

  return (
    <div className="ale-editor-panel">
      <SectionHeader icon="💡" title="왜 넥스카드인가" subtitle="'왜 넥스카드인가?' 페이지 내용을 수정합니다." />
      <div className="ale-form-group">
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold'}}>
          <input type="checkbox" checked={d.showButton !== false} onChange={e => update('showButton', e.target.checked)} />
          랜딩페이지 메인 배너에 '왜 넥스카드인가?' 버튼 표시
        </label>
        <Field label="버튼 텍스트" value={d.buttonText || '왜 넥스카드인가?'} onChange={v => update('buttonText', v)} />
        <Field label="페이지 제목" value={d.pageTitle || '왜 넥스카드인가?'} onChange={v => update('pageTitle', v)} />
        <Field label="페이지 서브타이틀" value={d.pageSubtitle || ''} onChange={v => update('pageSubtitle', v)} multiline />
        
        <Field label="유튜브 동영상 링크 (선택)" value={d.videoUrl || ''} onChange={v => update('videoUrl', v)} placeholder="https://www.youtube.com/embed/..." />
        <p className="field-help" style={{marginBottom:'1.5rem'}}>* 유튜브 영상의 '공유 > 퍼가기 > src' 안의 주소를 입력하세요.</p>
        
        <ImageField label="상세페이지 그림 (선택)" value={d.detailImage || ''} onChange={v => update('detailImage', v)} />
        {d.detailImage && (
          <div className="ale-img-preview" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <img src={d.detailImage} alt="상세페이지 미리보기" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
          </div>
        )}
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>하단 장점 블록</h3>
        {blocks.map((b, i) => (
          <div key={i} className="ale-list-item" style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
            <div className="ale-list-content" style={{flex:1}}>
              <Field label="아이콘" value={b.icon || ''} onChange={v => updateBlock(i, 'icon', v)} />
              <Field label="제목" value={b.title || ''} onChange={v => updateBlock(i, 'title', v)} />
              <Field label="설명" value={b.desc || ''} onChange={v => updateBlock(i, 'desc', v)} multiline />
            </div>
            <div className="ale-list-actions" style={{paddingTop:'2rem'}}>
              <button className="ale-btn-icon danger" onClick={() => removeBlock(i)}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        <button className="ale-btn secondary" style={{marginTop: '1rem'}} onClick={addBlock}>
          <Plus size={16} /> 하단 장점 블록 추가
        </button>
      </div>
    </div>
  );
};
`;

if (!c.includes('const WhyEditor')) {
  c = c.replace('// ════════════════════════════════════\n//  메인 에디터 페이지', whyEditorCode + '\n// ════════════════════════════════════\n//  메인 에디터 페이지');
}

if (!c.includes("{ id: 'why',")) {
  c = c.replace(
    "{ id: 'features', label: '✨ 기능소개'   },",
    "{ id: 'features', label: '✨ 기능소개'   },\n    { id: 'why',      label: '💡 왜 넥스카드' },"
  );
}

if (!c.includes("activeBlock === 'why'")) {
  c = c.replace(
    "{activeBlock === 'features' && (",
    "{activeBlock === 'why'      && <WhyEditor      data={content.whySection} onChange={v => update('whySection', v)} />}\n            {activeBlock === 'features' && ("
  );
}

fs.writeFileSync('src/pages/AdminLandingEditor.jsx', c);
console.log('AdminLandingEditor updated with WhyEditor');

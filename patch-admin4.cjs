const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminLandingEditor.jsx', 'utf8');

const whyEditorCode = `// ── 왜 넥스카드인가 에디터 ──
const WhyEditor = ({ data, onChange }) => {
  const d = data || {};
  const update = (k, v) => onChange({ ...d, [k]: v });
  const blocks = d.blocks || [];
  const detailImages = d.detailImages || (d.detailImage ? [d.detailImage] : []);

  const addBlock = () => onChange({ ...d, blocks: [...blocks, { title: '새 장점', desc: '설명', icon: '✨' }] });
  const updateBlock = (idx, k, v) => {
    const copy = [...blocks];
    copy[idx][k] = v;
    onChange({ ...d, blocks: copy });
  };
  const removeBlock = (idx) => onChange({ ...d, blocks: blocks.filter((_, i) => i !== idx) });

  const handleMultiFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    }))).then(results => {
      update('detailImages', [...detailImages, ...results]);
    });
  };

  const moveImage = (index, dir) => {
    if (index + dir < 0 || index + dir >= detailImages.length) return;
    const newImages = [...detailImages];
    const temp = newImages[index];
    newImages[index] = newImages[index + dir];
    newImages[index + dir] = temp;
    update('detailImages', newImages);
  };

  const removeImage = (index) => {
    update('detailImages', detailImages.filter((_, i) => i !== index));
  };

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
        
        <Field label="유튜브 동영상 링크 (선택)" value={d.videoUrl || ''} onChange={v => update('videoUrl', v)} placeholder="https://www.youtube.com/watch?v=..." />
        <p className="field-help" style={{marginBottom:'1.5rem'}}>* 일반 유튜브 시청 주소(예: https://www.youtube.com/watch?v=...)를 그대로 입력하셔도 자동으로 연결됩니다.</p>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>상세페이지 그림 (여러 장 업로드 가능)</h3>
        <p className="field-help" style={{marginBottom:'1rem'}}>PC에서 여러 장의 이미지를 한 번에 선택하여 올릴 수 있습니다. (최대 15장 권장)</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input type="file" multiple accept="image/*" onChange={handleMultiFileUpload} id="detail-images-upload" style={{ display: 'none' }} />
          <label htmlFor="detail-images-upload" className="ale-btn primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> PC에서 이미지 선택 (여러 장 가능)
          </label>
        </div>

        {detailImages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {detailImages.map((imgUrl, i) => (
              <div key={i} style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', background: '#f8fafc' }}>
                <img src={imgUrl} alt="상세 컷" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="ale-btn-icon" onClick={() => moveImage(i, -1)} disabled={i === 0}><ArrowUp size={14}/></button>
                    <button className="ale-btn-icon" onClick={() => moveImage(i, 1)} disabled={i === detailImages.length - 1}><ArrowDown size={14}/></button>
                  </div>
                  <button className="ale-btn-icon danger" onClick={() => removeImage(i)}><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
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

const whyEditorRegex = /\/\/ ── 왜 넥스카드인가 에디터 ──[\s\S]*?(?=\/\/ ════════════════════════════════════)/;
c = c.replace(whyEditorRegex, whyEditorCode);
fs.writeFileSync('src/pages/AdminLandingEditor.jsx', c);
console.log('AdminLandingEditor updated with multi-image WhyEditor');

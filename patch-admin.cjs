const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminLandingEditor.jsx', 'utf8');

const whyEditorCode = `
// ── 왜 넥스카드인가 에디터 ──
const WhyEditor = ({ data, onChange }) => {
  const d = data || {
    showButton: true,
    buttonText: '왜 넥스카드인가?',
    pageTitle: '왜 넥스카드인가?',
    pageSubtitle: '종이 명함의 한계를 넘어서는 새로운 연결의 시작. 스마트하고 세련된 방식의 네트워킹을 경험하세요.',
    videoUrl: '',
    blocks: [
      { title: '모바일 최적화', desc: '모든 스마트폰 화면에 완벽하게 맞춰지는 반응형 디자인으로 언제 어디서나 깔끔하게 내 정보를 전달합니다.', icon: '📱' },
      { title: '무제한 링크 추가', desc: '하나의 명함에 개인 SNS, 기업 홈페이지, 포트폴리오 링크 등 원하는 모든 정보를 무제한으로 담을 수 있습니다.', icon: '🔗' },
      { title: '빠르고 직관적인 공유', desc: 'QR 코드 스캔이나 링크 복사만으로 앱 설치 없이 누구에게나 쉽고 빠르게 명함을 전달할 수 있습니다.', icon: '⚡' },
      { title: '실시간 정보 수정', desc: '부서 이동, 승진, 연락처 변경 시 다시 인쇄할 필요 없이 클릭 몇 번으로 즉시 수정되어 배포됩니다.', icon: '🔄' },
    ]
  };
  const update = (k, v) => onChange({ ...d, [k]: v });
  const blocks = d.blocks || [];
  const addBlock = () => onChange({ ...d, blocks: [...blocks, { title: '새 장점', desc: '설명을 입력하세요', icon: '✨' }] });
  const updateBlock = (idx, k, v) => {
    const copy = [...blocks];
    copy[idx][k] = v;
    onChange({ ...d, blocks: copy });
  };
  const removeBlock = (idx) => onChange({ ...d, blocks: blocks.filter((_, i) => i !== idx) });

  return (
    <div className="ale-editor-panel">
      <SectionHeader icon="💡" title="왜 넥스카드인가" subtitle="'왜 넥스카드인가?' 전용 페이지의 내용과 상단 동영상을 설정합니다." />
      <div className="ale-form-group">
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem', fontWeight: 'bold'}}>
          <input type="checkbox" checked={d.showButton !== false} onChange={e => update('showButton', e.target.checked)} />
          랜딩페이지 메인 배너에 '왜 넥스카드인가?' 버튼 표시
        </label>
        <Field label="버튼 텍스트" value={d.buttonText || '왜 넥스카드인가?'} onChange={v => update('buttonText', v)} />
        <Field label="페이지 제목" value={d.pageTitle || '왜 넥스카드인가?'} onChange={v => update('pageTitle', v)} />
        <Field label="페이지 서브타이틀" value={d.pageSubtitle || ''} onChange={v => update('pageSubtitle', v)} multiline />
        <Field label="유튜브 동영상 링크 (선택)" value={d.videoUrl || ''} onChange={v => update('videoUrl', v)} placeholder="https://www.youtube.com/embed/..." />
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>장점 블록 목록</h3>
        {blocks.map((b, i) => (
          <div key={i} className="ale-list-item" style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}>
            <div className="ale-list-content" style={{flex:1}}>
              <Field label="아이콘 (이모지)" value={b.icon || ''} onChange={v => updateBlock(i, 'icon', v)} />
              <Field label="제목" value={b.title || ''} onChange={v => updateBlock(i, 'title', v)} />
              <Field label="설명" value={b.desc || ''} onChange={v => updateBlock(i, 'desc', v)} multiline />
            </div>
            <div className="ale-list-actions" style={{paddingTop:'2rem'}}>
              <button className="ale-btn-icon danger" onClick={() => removeBlock(i)}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        <button className="ale-btn secondary" style={{marginTop: '1rem'}} onClick={addBlock}>
          <Plus size={16} /> 장점 블록 추가
        </button>
      </div>
    </div>
  );
};
`;

if (!content.includes('WhyEditor =')) {
  // Inject WhyEditor before Main Admin component
  content = content.replace('// ── 메인 컴포넌트 ──', whyEditorCode + '\n// ── 메인 컴포넌트 ──');
}

if (!content.includes("{ id: 'why',      label: '💡 왜 넥스카드' }")) {
  // Inject tab definition
  content = content.replace(
    "{ id: 'features', label: '✨ 기능소개'   },",
    "{ id: 'features', label: '✨ 기능소개'   },\n    { id: 'why',      label: '💡 왜 넥스카드' },"
  );
}

if (!content.includes("activeBlock === 'why'")) {
  // Inject editor render
  content = content.replace(
    "{activeBlock === 'features' && (",
    "{activeBlock === 'why'      && <WhyEditor      data={content.whySection} onChange={v => update('whySection', v)} />}\n            {activeBlock === 'features' && ("
  );
}

fs.writeFileSync('src/pages/AdminLandingEditor.jsx', content, 'utf8');
console.log('Admin patched successfully');

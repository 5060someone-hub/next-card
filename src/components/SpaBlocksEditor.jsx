
import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, GripVertical, Image as ImageIcon, Video, MapPin, MessageSquare, AlignLeft } from 'lucide-react';

const SpaBlocksEditor = ({ sections = [], onChange }) => {
  const handleAdd = (type) => {
    const newBlock = {
      id: 'sec_' + Date.now(),
      type: type,
      title: type === 'text' ? '내 소개' : type === 'gallery' ? '포트폴리오' : type === 'video' ? '영상 소개' : type === 'qa' ? 'Q&A' : '오시는 길',
      content: '',
      images: [],
      videoUrl: '',
      qaList: [{ q: '', a: '' }],
      address: '',
      isVisible: true
    };
    onChange([...sections, newBlock]);
  };

  const handleUpdate = (id, field, value) => {
    onChange(sections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec));
  };

  const handleMove = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === sections.length - 1)) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    onChange(newSections);
  };

  const handleDelete = (id) => {
    if (window.confirm('이 블록을 삭제하시겠습니까?')) {
      onChange(sections.filter(sec => sec.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button type='button' onClick={() => handleAdd('text')} style={btnStyle}><AlignLeft size={16}/> 텍스트 블록</button>
        <button type='button' onClick={() => handleAdd('gallery')} style={btnStyle}><ImageIcon size={16}/> 갤러리</button>
        <button type='button' onClick={() => handleAdd('video')} style={btnStyle}><Video size={16}/> 영상</button>
        <button type='button' onClick={() => handleAdd('qa')} style={btnStyle}><MessageSquare size={16}/> Q&A</button>
        <button type='button' onClick={() => handleAdd('map')} style={btnStyle}><MapPin size={16}/> 지도/주소</button>
      </div>

      {sections.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          상단 버튼을 눌러 SPA 섹션을 추가해 보세요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((sec, index) => (
            <div key={sec.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GripVertical size={16} color='#94a3b8' />
                  <input 
                    value={sec.title} 
                    onChange={e => handleUpdate(sec.id, 'title', e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button type='button' onClick={() => handleMove(index, -1)} disabled={index === 0} style={iconBtnStyle}><ArrowUp size={14}/></button>
                  <button type='button' onClick={() => handleMove(index, 1)} disabled={index === sections.length - 1} style={iconBtnStyle}><ArrowDown size={14}/></button>
                  <button type='button' onClick={() => handleDelete(sec.id)} style={{...iconBtnStyle, color: '#ef4444'}}><Trash2 size={14}/></button>
                </div>
              </div>

              <div style={{ padding: '16px' }}>
                {sec.type === 'text' && (
                  <textarea 
                    value={sec.content} 
                    onChange={e => handleUpdate(sec.id, 'content', e.target.value)}
                    placeholder='내용을 입력하세요'
                    rows={4}
                    style={inputStyle}
                  />
                )}
                
                {sec.type === 'gallery' && (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>이미지 URL을 쉼표(,)로 구분하여 여러 개 입력하세요. (추후 이미지 업로드 UI로 고도화 가능)</p>
                    <textarea 
                      value={(sec.images || []).join(', ')} 
                      onChange={e => handleUpdate(sec.id, 'images', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
                      placeholder='https://image1.jpg, https://image2.jpg'
                      rows={3}
                      style={inputStyle}
                    />
                  </div>
                )}

                {sec.type === 'video' && (
                  <div>
                    <input 
                      value={sec.videoUrl} 
                      onChange={e => handleUpdate(sec.id, 'videoUrl', e.target.value)}
                      placeholder='유튜브 영상 URL (예: https://www.youtube.com/watch?v=...)'
                      style={inputStyle}
                    />
                  </div>
                )}

                {sec.type === 'qa' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(sec.qaList || []).map((qa, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f1f5f9', borderRadius: '8px' }}>
                        <input value={qa.q} onChange={e => {
                          const newList = [...sec.qaList]; newList[i].q = e.target.value; handleUpdate(sec.id, 'qaList', newList);
                        }} placeholder='질문 (Q)' style={inputStyle} />
                        <textarea value={qa.a} onChange={e => {
                          const newList = [...sec.qaList]; newList[i].a = e.target.value; handleUpdate(sec.id, 'qaList', newList);
                        }} placeholder='답변 (A)' rows={2} style={inputStyle} />
                        <div style={{ textAlign: 'right' }}>
                          <button type='button' onClick={() => {
                            const newList = sec.qaList.filter((_, idx) => idx !== i);
                            handleUpdate(sec.id, 'qaList', newList);
                          }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>항목 삭제</button>
                        </div>
                      </div>
                    ))}
                    <button type='button' onClick={() => handleUpdate(sec.id, 'qaList', [...(sec.qaList || []), {q:'', a:''}])} style={{ padding: '8px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      + Q&A 추가
                    </button>
                  </div>
                )}

                {sec.type === 'map' && (
                  <div>
                    <input 
                      value={sec.address} 
                      onChange={e => handleUpdate(sec.id, 'address', e.target.value)}
                      placeholder='상세 주소 입력'
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const btnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' };
const iconBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#64748b' };
const inputStyle = { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' };

export default SpaBlocksEditor;


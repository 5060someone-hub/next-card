
import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, GripVertical, Image as ImageIcon, Video, MapPin, MessageSquare, AlignLeft } from 'lucide-react';

const SpaBlocksEditor = ({ sections = [], onChange }) => {
  const handleAdd = (type) => {
    const newBlock = {
      id: 'sec_' + Date.now(),
      type: type,
      title: type === 'text' ? '텍스트 블록' : type === 'gallery' ? '갤러리' : type === 'video' ? '영상 소개' : type === 'qa' ? 'Q&A' : '오시는 길',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>PC/모바일에서 사진을 직접 선택하여 업로드하세요.</p>
                      <input 
                        type="file" 
                        id={`gallery-upload-${sec.id}`} 
                        multiple 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          if (!files.length) return;
                          
                          const readAsDataURL = (file) => new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(file);
                          });
                          
                          const base64Images = await Promise.all(files.map(file => readAsDataURL(file)));
                          handleUpdate(sec.id, 'images', [...(sec.images || []), ...base64Images]);
                          e.target.value = ''; // 🔄 초기화 (같은 파일 다시 선택 가능하도록)
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => document.getElementById(`gallery-upload-${sec.id}`).click()}
                        style={{ padding: '6px 12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> 사진 추가
                      </button>
                    </div>
                    
                    {(!sec.images || sec.images.length === 0) ? (
                      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '0.85rem' }}>
                        등록된 사진이 없습니다.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                        {sec.images.map((img, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <img src={img} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={`gallery-${idx}`} />
                            <button 
                              type="button"
                              onClick={() => {
                                const newImages = [...sec.images];
                                newImages.splice(idx, 1);
                                handleUpdate(sec.id, 'images', newImages);
                              }}
                              style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', padding: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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


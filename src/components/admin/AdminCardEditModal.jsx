import React from 'react';
import { X, UserCircle, Image as ImageIcon, Layout, Palette, Share2, Type } from 'lucide-react';
import CardPreview from '../CardPreview';

const AdminCardEditModal = ({ 
  isCardEditModalOpen, 
  setIsCardEditModalOpen, 
  cardEditForm, 
  setCardEditForm, 
  saveCardEdit 
}) => {
  if (!isCardEditModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('sns.')) {
      const snsKey = name.split('.')[1];
      setCardEditForm(prev => ({
        ...prev,
        sns: { ...prev.sns, [snsKey]: value }
      }));
    } else {
      setCardEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCardEditModalOpen(false)}>
      <div className="modal-content master-editor-modal" style={{ maxWidth: '1100px', width: '95vw', maxHeight: '95vh', borderRadius: '32px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>명함 마스터 편집기 (WYSIWYG)</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>좌측에서 수정하면 우측 미리보기에 실시간으로 반영됩니다.</p>
          </div>
          <button onClick={() => setIsCardEditModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        <div className="master-editor-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', height: 'calc(95vh - 100px)', overflow: 'hidden' }}>
          {/* Left: Scrollable Form */}
          <div className="master-form-container" style={{ overflowY: 'auto', padding: '2.5rem', background: '#f8fafc' }}>
            <form onSubmit={saveCardEdit}>
              {/* 1. 이미지 및 레이아웃 */}
              <div className="form-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><ImageIcon size={20} /> 로고 및 프로필 이미지</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>로고 이미지 URL</label>
                    <input name="logoUrl" value={cardEditForm.logoUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                  <div className="input-group">
                    <label>로고 크기 ({cardEditForm.logoSize}%)</label>
                    <input type="range" name="logoSize" min="20" max="100" value={cardEditForm.logoSize} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label>프로필 이미지 URL</label>
                    <input name="profileUrl" value={cardEditForm.profileUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                  <div className="input-group">
                    <label>프로필 크기 ({cardEditForm.profileSize}px)</label>
                    <input type="range" name="profileSize" min="60" max="250" value={cardEditForm.profileSize} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* 2. 기본 인적 사항 */}
              <div className="form-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><UserCircle size={20} /> 인적 사항</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group"><label>성함 (한글)</label><input name="name" value={cardEditForm.name} onChange={handleChange} /></div>
                  <div className="input-group"><label>성함 (영문)</label><input name="nameEng" value={cardEditForm.nameEng} onChange={handleChange} /></div>
                  <div className="input-group"><label>직함</label><input name="jobTitle" value={cardEditForm.jobTitle} onChange={handleChange} /></div>
                  <div className="input-group"><label>회사명</label><input name="company" value={cardEditForm.company} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}><label>사무실 주소</label><input name="address" value={cardEditForm.address} onChange={handleChange} /></div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}><label>자기소개 (ABOUT)</label><textarea name="intro" value={cardEditForm.intro} onChange={handleChange} rows="4" style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }} /></div>
                </div>
              </div>

              {/* 3. 디자인 테마 및 폰트 */}
              <div className="form-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Palette size={20} /> 테마 및 스타일 설정</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label>디자인 테마</label>
                    <select name="theme" value={cardEditForm.theme} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <option value="modern">Modern (화이트)</option>
                      <option value="classic">Classic (다크)</option>
                      <option value="luxury">Luxury (골드 포인트)</option>
                      <option value="corporate">Corporate (블루 전문형)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>포인트 컬러</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="color" name="themeColor" value={cardEditForm.themeColor} onChange={handleChange} style={{ width: '45px', height: '45px', padding: '2px', cursor: 'pointer' }} />
                      <input type="text" name="themeColor" value={cardEditForm.themeColor} onChange={handleChange} style={{ flex: 1 }} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label><Type size={14} /> 이름 폰트 크기 ({cardEditForm.nameFontSize}px)</label>
                    <input type="range" name="nameFontSize" min="18" max="40" value={cardEditForm.nameFontSize} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* 4. SNS 연동 */}
              <div className="form-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Share2 size={20} /> SNS 및 연락처 연동</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group"><label>카카오톡</label><input name="sns.kakaotalk" value={cardEditForm.sns.kakaotalk} onChange={handleChange} /></div>
                  <div className="input-group"><label>인스타그램</label><input name="sns.instagram" value={cardEditForm.sns.instagram} onChange={handleChange} /></div>
                  <div className="input-group"><label>페이스북</label><input name="sns.facebook" value={cardEditForm.sns.facebook} onChange={handleChange} /></div>
                  <div className="input-group"><label>X (트위터)</label><input name="sns.x" value={cardEditForm.sns.x} onChange={handleChange} /></div>
                </div>
              </div>

              <div className="modal-footer-actions" style={{ position: 'sticky', bottom: '-2.5rem', background: '#f8fafc', padding: '1.5rem 0', marginTop: '2rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCardEditModalOpen(false)} style={{ padding: '0.75rem 2rem', borderRadius: '50px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>취소</button>
                <button type="submit" style={{ padding: '0.75rem 3rem', borderRadius: '50px', border: 'none', background: '#db2777', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(219, 39, 119, 0.3)' }}>최종 저장하여 발행하기</button>
              </div>
            </form>
          </div>

          {/* Right: Sticky Preview */}
          <div className="master-preview-container" style={{ padding: '2.5rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #f1f5f9' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#db2777', background: '#fff1f2', padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid #fecdd3' }}>LIVE PREVIEW</span>
              </div>
              <CardPreview formData={cardEditForm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCardEditModal;

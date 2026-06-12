import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Save, CheckCircle2, Loader2, Image, Type, DollarSign, List, Link, Plus, Trash2, Upload } from 'lucide-react';
import './AdminLandingEditor.css'; // Reusing standard admin editor styles

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

const DEFAULT_CONTENT = {
  purchaseLink: 'https://adq.kr/products/high-end-namecard?page=1',
  mainImage: 'https://images.unsplash.com/photo-1589041127529-fcece6f31899?q=80&w=800&auto=format&fit=crop',
  thumbnails: [
    'https://images.unsplash.com/photo-1616628188540-3532f8149eb4?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616628188550-808682f32255?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544391696-1c4943717540?q=80&w=200&auto=format&fit=crop'
  ],
  title: '수입지 하이엔드 명함',
  subtitle: '첫인상을 결정짓는 완벽한 디테일, 최고급 수입지로 제작되는 프리미엄 명함입니다.',
  price: '22,000',
  specs: [
    { icon: 'Check', label: '지질', desc: '엑스트라 누브, 띤또레또, 랑데뷰 등 최고급 수입지 선택 가능' },
    { icon: 'Check', label: '두께', desc: '350g 이상의 묵직하고 고급스러운 두께감' },
    { icon: 'Check', label: '후가공', desc: '박(금박/은박/먹박), 형압, 에폭시 등 커스텀 가공 지원' },
    { icon: 'Check', label: '제작기간', desc: '시안 확정 후 영업일 기준 2~3일 소요' }
  ]
};

const AdminNamecardEditor = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/namecard-landing-content`);
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        }
      } catch (err) {
        console.error('Failed to load namecard landing content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/api/namecard-landing-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...content.specs];
    newSpecs[index][field] = value;
    setContent({ ...content, specs: newSpecs });
  };

  const handleThumbnailChange = (index, value) => {
    const newThumbs = [...content.thumbnails];
    newThumbs[index] = value;
    setContent({ ...content, thumbnails: newThumbs });
  };

  const addSpec = () => {
    setContent({
      ...content,
      specs: [...content.specs, { icon: 'Check', label: '', desc: '' }]
    });
  };

  const removeSpec = (index) => {
    const newSpecs = content.specs.filter((_, i) => i !== index);
    setContent({ ...content, specs: newSpecs });
  };

  const handleImageUpload = (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('이미지 용량이 너무 큽니다 (최대 15MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const applyResult = (result) => {
        if (field === 'mainImage') {
          setContent(prev => ({ ...prev, mainImage: result }));
        } else if (field === 'thumbnails') {
          setContent(prev => {
            const newThumbs = [...prev.thumbnails];
            newThumbs[index] = result;
            return { ...prev, thumbnails: newThumbs };
          });
        }
      };

      if (file.size < 100 * 1024) { // Under 100KB
        applyResult(ev.target.result);
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outType === 'image/jpeg' ? 0.8 : undefined;
        applyResult(canvas.toDataURL(outType, quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="spinning" size={48} color="#94a3b8" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="admin-content landing-editor">
        <div className="editor-header">
          <div>
            <h2>명함 상품 페이지 편집</h2>
            <p>/namecard 페이지의 내용을 관리합니다.</p>
          </div>
          <button className={`btn-save ${saveSuccess ? 'success' : ''}`} onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} className="spinning" /> : (saveSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />)}
            {saving ? '저장 중...' : (saveSuccess ? '저장 완료' : '변경사항 저장')}
          </button>
        </div>

        <div className="editor-body">
          {/* 외부 링크 설정 */}
          <div className="editor-section">
            <div className="section-title">
              <Link size={20} /> 구매하기 연결 링크
            </div>
            <div className="input-group">
              <label>외부 구매 URL (애드큐 쇼핑몰 등)</label>
              <input 
                type="text" 
                value={content.purchaseLink} 
                onChange={(e) => setContent({...content, purchaseLink: e.target.value})} 
                placeholder="https://adq.kr/products/..."
              />
            </div>
          </div>

          {/* 텍스트 내용 */}
          <div className="editor-section">
            <div className="section-title">
              <Type size={20} /> 기본 정보
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>상품명 (타이틀)</label>
                <input 
                  type="text" 
                  value={content.title} 
                  onChange={(e) => setContent({...content, title: e.target.value})} 
                />
              </div>
              <div className="input-group">
                <label>기준 가격 (숫자 또는 텍스트)</label>
                <div className="price-input-wrapper" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>₩</span>
                  <input 
                    type="text" 
                    value={content.price} 
                    onChange={(e) => setContent({...content, price: e.target.value})} 
                    style={{ flex: 1 }}
                  />
                  <span>~</span>
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>서브 타이틀 (설명)</label>
              <textarea 
                value={content.subtitle} 
                onChange={(e) => setContent({...content, subtitle: e.target.value})} 
                rows={2}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            {/* 스펙 (Specs) */}
            <div className="editor-section" style={{ margin: 0 }}>
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List size={20} /> 상세 스펙 항목
              </div>
              <button className="btn-secondary" onClick={addSpec} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <Plus size={16} /> 항목 추가
              </button>
            </div>
            {content.specs.map((spec, i) => (
              <div key={i} className="feature-card" style={{ marginBottom: '12px', position: 'relative', paddingRight: '40px' }}>
                <div className="input-row">
                  <div className="input-group">
                    <label>스펙 항목명</label>
                    <input 
                      type="text" 
                      value={spec.label} 
                      onChange={(e) => handleSpecChange(i, 'label', e.target.value)} 
                    />
                  </div>
                  <div className="input-group" style={{ flex: 2 }}>
                    <label>설명 내용</label>
                    <input 
                      type="text" 
                      value={spec.desc} 
                      onChange={(e) => handleSpecChange(i, 'desc', e.target.value)} 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeSpec(i)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  title="삭제"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

            {/* 이미지 (Images) */}
            <div className="editor-section" style={{ margin: 0 }}>
            <div className="section-title">
              <Image size={20} /> 이미지 설정
            </div>
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label>메인 상품 이미지</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={content.mainImage} 
                  onChange={(e) => setContent({...content, mainImage: e.target.value})} 
                  placeholder="이미지 URL 입력 또는 파일 업로드"
                  style={{ flex: 1 }}
                />
                <input 
                  type="file" 
                  id="main-img-upload" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, 'mainImage')} 
                />
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => document.getElementById('main-img-upload').click()}
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Upload size={16} /> 파일 첨부
                </button>
              </div>
              {content.mainImage && (
                <div className="image-preview">
                  <img src={content.mainImage} alt="Main" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', border: '1px solid #e2e8f0' }} />
                </div>
              )}
            </div>

            <label style={{display: 'block', marginBottom: '12px', fontWeight: 600, color: '#334155'}}>썸네일 이미지 모음 (최대 3개 권장)</label>
            {content.thumbnails.map((thumb, i) => (
              <div key={i} className="input-group" style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={thumb} 
                    onChange={(e) => handleThumbnailChange(i, e.target.value)} 
                    placeholder={`썸네일 이미지 ${i+1} URL`}
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="file" 
                    id={`thumb-img-upload-${i}`} 
                    hidden 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'thumbnails', i)} 
                  />
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById(`thumb-img-upload-${i}`).click()}
                    style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Upload size={16} /> 첨부
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleThumbnailChange(i, '')}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                    title="삭제"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {thumb && (
                  <div className="image-preview">
                    <img src={thumb} alt={`Thumb ${i+1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '12px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
              </div>
            ))}
            
            {content.thumbnails.length < 5 && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setContent({...content, thumbnails: [...content.thumbnails, '']})}
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={16} /> 썸네일 추가
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNamecardEditor;

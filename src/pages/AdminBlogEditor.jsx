import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ArrowLeft, Save, Loader2, Sparkles, Clock, Eye, Edit3 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './AdminDashboard.css';

const AdminBlogEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('id');

  const [form, setForm] = useState({ 
    title: '', 
    summary: '', 
    content: '', 
    thumbnail: '',
    status: 'published', // published, scheduled, draft
    scheduledDate: '' // YYYY-MM-DDTHH:mm
  });
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      getDoc(doc(db, 'blog_posts', editId)).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // 포맷 변경
          let scheduledDate = '';
          if (data.publishDate) {
            const dateObj = data.publishDate.toDate ? data.publishDate.toDate() : new Date(data.publishDate);
            // YYYY-MM-DDTHH:mm 포맷으로 변환 (로컬 타임 기준)
            const offset = dateObj.getTimezoneOffset() * 60000;
            scheduledDate = (new Date(dateObj - offset)).toISOString().slice(0, 16);
          }
          setForm({ ...data, scheduledDate, status: data.status || 'published' });
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      alert("제목과 본문을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      let finalPublishDate = serverTimestamp();
      
      if (form.status === 'scheduled') {
        if (!form.scheduledDate) {
          alert("예약 발행할 날짜와 시간을 지정해주세요.");
          setSaving(false);
          return;
        }
        finalPublishDate = Timestamp.fromDate(new Date(form.scheduledDate));
      } else if (form.status === 'draft') {
        // 임시저장의 경우에도 일단 현재 시간으로 세팅해둠 (조회시 노출되지 않도록 status로 필터링)
        finalPublishDate = serverTimestamp();
      }

      const postData = {
        title: form.title,
        summary: form.summary,
        content: form.content,
        thumbnail: form.thumbnail,
        status: form.status,
        publishDate: finalPublishDate,
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await setDoc(doc(db, 'blog_posts', editId), postData, { merge: true });
        alert("수정되었습니다.");
      } else {
        postData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'blog_posts'), postData);
        alert("저장되었습니다.");
      }
      navigate('/admin/blog');
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다. Firebase 권한(규칙)을 확인해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={() => navigate('/admin/blog')} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px' }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1>{editId ? '블로그 글 수정' : '새 블로그 글 쓰기'}</h1>
              <p>마크다운(Markdown) 형식으로 작성할 수 있습니다.</p>
            </div>
          </div>
          <div className="header-info" style={{ gap: '12px' }}>
            <button className="btn-refresh" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: 'white', border: 'none', padding: '10px 16px' }} onClick={() => alert('AI 에이전트에게 "~~주제로 블로그 글 써줘" 라고 채팅창에 입력하시면 완벽한 마크다운 본문을 작성해 줍니다! 복사해서 아래 본문에 붙여넣기 하세요.')}>
              <Sparkles size={18} /> AI 에이전트 호출
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              {saving ? <Loader2 className="spinning" size={18} /> : <Save size={18} />} 저장하기
            </button>
          </div>
        </header>

        <div className="admin-table-container" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="spinning" size={40} color="#3b82f6" /></div>
          ) : (
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{ fontWeight: 600, color: '#334155' }}>글 상태</label>
                  <select 
                    name="status" value={form.status} onChange={handleChange} 
                    style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', background: 'white' }}
                  >
                    <option value="published">🟢 즉시 발행</option>
                    <option value="scheduled">🟡 예약 발행</option>
                    <option value="draft">⚪ 임시 저장 (비공개)</option>
                  </select>
                </div>

                {form.status === 'scheduled' && (
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} /> 발행 예약 시간
                    </label>
                    <input 
                      type="datetime-local" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} 
                      style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>제목</label>
                <input 
                  type="text" name="title" value={form.title} onChange={handleChange} 
                  placeholder="예: 영업사원을 위한 스마트한 디지털 명함 활용법" 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1.1rem', outline: 'none' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>요약 (리스트에 보일 짧은 설명)</label>
                <input 
                  type="text" name="summary" value={form.summary} onChange={handleChange} 
                  placeholder="예: 종이 명함 대신 링크 하나로 나를 어필하는 방법을 소개합니다." 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, color: '#334155' }}>썸네일 이미지 URL (선택)</label>
                <input 
                  type="text" name="thumbnail" value={form.thumbnail} onChange={handleChange} 
                  placeholder="예: https://images.unsplash.com/... (인터넷 이미지 링크)" 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <label style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    본문 (Markdown 지원) 
                    {activeTab === 'write' && (
                      <span style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: 500, background: '#fdf2f8', padding: '2px 8px', borderRadius: '12px' }}>
                        AI 에이전트가 써준 글을 복사해서 붙여넣으세요!
                      </span>
                    )}
                  </label>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button 
                      onClick={() => setActiveTab('write')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: activeTab === 'write' ? 'white' : 'transparent', color: activeTab === 'write' ? '#3b82f6' : '#64748b', boxShadow: activeTab === 'write' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                      <Edit3 size={16} /> 작성
                    </button>
                    <button 
                      onClick={() => setActiveTab('preview')}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', background: activeTab === 'preview' ? 'white' : 'transparent', color: activeTab === 'preview' ? '#10b981' : '#64748b', boxShadow: activeTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                    >
                      <Eye size={16} /> 미리보기
                    </button>
                  </div>
                </div>
                
                {activeTab === 'write' ? (
                  <textarea 
                    name="content" value={form.content} onChange={handleChange} 
                    placeholder="# 큰 제목&#10;## 중간 제목&#10;&#10;여기에 글을 작성하세요. **굵은 글씨**도 지원합니다." 
                    style={{ width: '100%', minHeight: '600px', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', fontFamily: 'monospace', lineHeight: 1.6, outline: 'none', resize: 'vertical' }}
                  />
                ) : (
                  <div style={{ width: '100%', minHeight: '600px', padding: '40px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', overflowY: 'auto' }}>
                    <article className="blog-wrapper">
                      <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '16px', lineHeight: 1.3 }}>{form.title || '제목 없음'}</h1>
                      </header>
                      {form.thumbnail && (
                        <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden' }}>
                          <img src={form.thumbnail} alt="thumbnail" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      )}
                      <div className="markdown-content" style={{ lineHeight: 1.8, color: '#334155', fontSize: '1.1rem' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {form.content || '*내용이 없습니다.*'}
                        </ReactMarkdown>
                      </div>
                    </article>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBlogEditor;

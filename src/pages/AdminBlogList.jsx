import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Edit2, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './AdminDashboard.css'; 

const AdminBlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(fetched);
    } catch (err) {
      console.error(err);
      alert("글 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 블로그 글을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'blog_posts', id));
        alert("삭제되었습니다.");
        fetchPosts();
      } catch (err) {
        console.error(err);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>블로그 글 관리</h1>
            <p>공식 블로그에 발행된 글을 관리하고 AI로 작성하세요.</p>
          </div>
          <div className="header-info">
            <button className="btn-primary" onClick={() => navigate('/admin/blog/write')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> 새 글 쓰기
            </button>
          </div>
        </header>

        <div className="admin-table-container">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spinning" color="#3b82f6" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>상태</th>
                    <th>제목</th>
                    <th>등록일/발행일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>작성된 글이 없습니다.</td></tr>
                  ) : (
                    posts.map(post => {
                      const isDraft = post.status === 'draft';
                      const isScheduled = post.status === 'scheduled';
                      const isPublished = post.status === 'published' || !post.status; // 이전 글 하위호환

                      let badgeText = '발행됨';
                      let badgeColor = '#10b981'; // green
                      let badgeBg = '#d1fae5';

                      if (isDraft) {
                        badgeText = '임시저장';
                        badgeColor = '#64748b';
                        badgeBg = '#f1f5f9';
                      } else if (isScheduled) {
                        const now = new Date().getTime();
                        const pubTime = post.publishDate?.toDate ? post.publishDate.toDate().getTime() : new Date(post.publishDate || Date.now()).getTime();
                        
                        if (pubTime <= now) {
                          badgeText = '발행됨'; // 이미 시간이 지난 예약발행은 발행됨으로 표시
                        } else {
                          badgeText = '예약됨';
                          badgeColor = '#d97706';
                          badgeBg = '#fef3c7';
                        }
                      }

                      return (
                        <tr key={post.id}>
                          <td>
                            <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, color: badgeColor, backgroundColor: badgeBg }}>
                              {badgeText}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>{post.title}</td>
                          <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            <div>등록: {post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleDateString() : ''}</div>
                            {post.publishDate && (
                              <div style={{ color: badgeText === '예약됨' ? '#d97706' : '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                                발행: {new Date(post.publishDate.toMillis()).toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <button className="btn-table-primary" onClick={() => navigate(`/admin/blog/write?id=${post.id}`)} title="수정" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#e0e7ff', color: '#4f46e5' }}>
                                <Edit2 size={14}/> 수정
                              </button>
                              <button className="btn-table-danger" onClick={() => handleDelete(post.id)} title="삭제" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={14}/> 삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBlogList;

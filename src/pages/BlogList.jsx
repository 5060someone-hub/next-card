import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import './BlogList.css';
import { Loader2 } from 'lucide-react';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const selectedTag = searchParams.get('tag');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const now = new Date().getTime();

        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(post => {
          // 임시저장 글은 노출 안 함
          if (post.status === 'draft') return false;
          
          // 예약 발행 글은 현재 시간과 비교
          if (post.status === 'scheduled') {
            if (!post.publishDate) return false;
            const pubTime = post.publishDate.toDate ? post.publishDate.toDate().getTime() : new Date(post.publishDate).getTime();
            // 아직 발행 시간이 되지 않았다면 노출 안 함
            if (pubTime > now) return false; 
          }
          
          // status가 'published'이거나, 과거에 작성되어 status가 없는 글은 노출
          return true;
        });
        const tagsSet = new Set();
        fetchedPosts.forEach(post => {
          if (post.tags) {
            post.tags.forEach(tag => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet));
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="spinning" color="#3b82f6" />
      </div>
    );
  }

  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags && post.tags.includes(selectedTag))
    : posts;

  return (
    <div className="blog-wrapper">
      <header style={{ padding: '20px 40px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', textDecoration: 'none' }}>
          NextCard<span style={{ color: '#3b82f6' }}>.kr</span>
        </Link>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' }}>
          홈으로 가기
        </Link>
      </header>
      <div className="blog-content">
        <div className="blog-header">
          <h1>NextCard 스토리</h1>
          <p>디지털 명함 100% 활용법과 비즈니스 인사이트</p>
          
          {allTags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button 
                onClick={() => navigate('/blog')}
                style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', background: !selectedTag ? '#3b82f6' : '#e2e8f0', color: !selectedTag ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s' }}
              >
                전체
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag}
                  onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: 'none', background: selectedTag === tag ? '#3b82f6' : 'white', color: selectedTag === tag ? 'white' : '#3b82f6', border: selectedTag === tag ? '1px solid #3b82f6' : '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: selectedTag === tag ? '0 4px 6px rgba(59,130,246,0.2)' : 'none' }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="blog-grid">
          {filteredPosts.length === 0 ? (
            <div className="blog-empty">
              <p>등록된 게시글이 없습니다.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} className="blog-card">
                {post.thumbnail && (
                  <div className="blog-card-img" style={{ backgroundImage: `url(${post.thumbnail})` }} />
                )}
                <div className="blog-card-body">
                  {post.tags && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>#{tag}</span>
                      ))}
                    </div>
                  )}
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-summary">{post.summary}</p>
                  <span className="blog-card-date">
                    {post.publishDate ? new Date(post.publishDate.toMillis()).toLocaleDateString() : (post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleDateString() : '')}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;

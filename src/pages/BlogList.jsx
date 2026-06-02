import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import './BlogList.css';
import { Loader2 } from 'lucide-react';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        </div>
        
        <div className="blog-grid">
          {posts.length === 0 ? (
            <div className="blog-empty">
              <p>등록된 게시글이 없습니다.</p>
            </div>
          ) : (
            posts.map(post => (
              <Link to={`/blog/${post.id}`} key={post.id} className="blog-card">
                {post.thumbnail && (
                  <div className="blog-card-img" style={{ backgroundImage: `url(${post.thumbnail})` }} />
                )}
                <div className="blog-card-body">
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Sidebar from '../components/Sidebar';
import { Loader2, ArrowLeft } from 'lucide-react';
import './BlogList.css'; // 재사용

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'blog_posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const now = new Date().getTime();
          if (data.status === 'draft') {
             alert("비공개(임시저장) 처리된 게시물입니다.");
             navigate('/blog');
             return;
          }
          if (data.status === 'scheduled' && data.publishDate) {
             const pubTime = data.publishDate.toDate ? data.publishDate.toDate().getTime() : new Date(data.publishDate).getTime();
             if (pubTime > now) {
                alert("아직 공개 시간이 되지 않은 예약 게시물입니다.");
                navigate('/blog');
                return;
             }
          }

          setPost(data);
          document.title = `${data.title} | NextCard 블로그`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && data.summary) {
            metaDesc.setAttribute('content', data.summary);
          }
        } else {
          alert("존재하지 않는 게시물입니다.");
          navigate('/blog');
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} className="spinning" color="#3b82f6" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="blog-wrapper">
      <Sidebar />
      <div className="blog-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <button onClick={() => navigate('/blog')} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
          <ArrowLeft size={18} /> 목록으로 돌아가기
        </button>

        <article style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <header style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '16px', lineHeight: 1.3 }}>{post.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              <span>{post.publishDate ? new Date(post.publishDate.toMillis()).toLocaleDateString() : (post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleDateString() : '')}</span>
            </div>
          </header>

          {post.thumbnail && (
            <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src={post.thumbnail} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          <div className="markdown-content" style={{ lineHeight: 1.8, color: '#334155', fontSize: '1.1rem' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;

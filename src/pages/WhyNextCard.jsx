import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import './WhyNextCard.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

const DEFAULT_WHY = {
  pageTitle: '왜 넥스카드인가?',
  pageSubtitle: '종이 명함의 한계를 넘어서는 새로운 연결의 시작. 스마트하고 세련된 방식의 네트워킹을 경험하세요.',
  videoUrl: '', // YouTube embed URL
  blocks: [
    { title: '모바일 최적화', desc: '모든 스마트폰 화면에 완벽하게 맞춰지는 반응형 디자인으로 언제 어디서나 깔끔하게 내 정보를 전달합니다.', icon: '📱' },
    { title: '무제한 링크 추가', desc: '하나의 명함에 개인 SNS, 기업 홈페이지, 포트폴리오 링크 등 원하는 모든 정보를 무제한으로 담을 수 있습니다.', icon: '🔗' },
    { title: '빠르고 직관적인 공유', desc: 'QR 코드 스캔이나 링크 복사만으로 앱 설치 없이 누구에게나 쉽고 빠르게 명함을 전달할 수 있습니다.', icon: '⚡' },
    { title: '실시간 정보 수정', desc: '부서 이동, 승진, 연락처 변경 시 다시 인쇄할 필요 없이 클릭 몇 번으로 즉시 수정되어 배포됩니다.', icon: '🔄' },
  ]
};

const WhyNextCard = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState(DEFAULT_WHY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/landing-content`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.whySection) {
            setContent({ ...DEFAULT_WHY, ...data.whySection });
          }
        }
      } catch (err) {
        console.error('Failed to fetch why page content', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin" size={40} color="#02cc99" />
      </div>
    );
  }

  return (
    <div className="why-container">
      {/* Header */}
      <header className="why-header">
        <div className="why-logo" onClick={() => navigate('/')}>
          NextCard<span style={{ color: '#02cc99' }}>.kr</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}
        >
          <ArrowLeft size={18} /> 돌아가기
        </button>
      </header>

      {/* Hero Section */}
      <section className="why-hero">
        <h1 className="why-title">{content.pageTitle}</h1>
        <p className="why-subtitle">{content.pageSubtitle}</p>
        
        {content.videoUrl && content.videoUrl.trim() !== '' && (
          <div className="why-video-wrapper">
            <iframe 
              src={content.videoUrl} 
              title="Video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        )}
      </section>

      {/* Feature Blocks */}
      <section className="why-blocks">
        {content.blocks && content.blocks.map((block, index) => (
          <div key={index} className="why-block-card">
            <div className="why-block-icon">{block.icon || '✨'}</div>
            <h3 className="why-block-title">{block.title}</h3>
            <p className="why-block-desc">{block.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default WhyNextCard;

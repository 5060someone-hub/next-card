import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Check, Loader2 } from 'lucide-react';
import './NamecardLanding.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

const NamecardLanding = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/namecard-landing-content`);
        if (res.ok) {
          const data = await res.json();
          setContent(data);
        } else {
          console.error('Failed to load content');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handlePurchase = () => {
    if (content?.purchaseLink) {
      window.open(content.purchaseLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="nc-landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 className="spinning" size={48} color="#0f172a" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="nc-landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>콘텐츠를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="nc-landing-container">
      {/* Header */}
      <header className="nc-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h2>ADQ PREMIUM</h2>
        <div style={{ width: 24 }} />
      </header>

      {/* Main Content */}
      <main className="nc-main">
        {/* Product Images */}
        <div className="nc-gallery">
          <div className="nc-main-image">
            <img 
              src={content.mainImage} 
              alt={content.title} 
              onClick={() => setSelectedImage(content.mainImage)} 
            />
          </div>
          <div className="nc-thumbnails">
            {content.thumbnails.map((thumb, idx) => thumb ? (
              <img 
                key={idx} 
                src={thumb} 
                alt={`Thumb ${idx+1}`} 
                onClick={() => setSelectedImage(thumb)}
              />
            ) : null)}
          </div>
        </div>

        {/* Product Info */}
        <div className="nc-info">
          <div className="nc-badges">
            <span className="badge-premium">PREMIUM</span>
            <span className="badge-best">BEST</span>
          </div>
          <h1 className="nc-title">{content.title}</h1>
          <p className="nc-subtitle">{content.subtitle}</p>
          
          <div className="nc-price-row">
            <span className="nc-price-label">제작 비용</span>
            <div className="nc-price">
              <span className="nc-currency">₩</span>
              <span className="nc-amount">{content.price}</span>
              <span className="nc-suffix">~</span>
            </div>
          </div>

          <div className="nc-divider" />

          {/* Options & Specs */}
          <div className="nc-specs">
            <h3 className="nc-spec-title">상세 스펙</h3>
            <ul className="nc-spec-list">
              {content.specs.map((spec, idx) => (
                <li key={idx}>
                  <Check size={18} className="spec-icon" />
                  <span><strong>{spec.label}:</strong> {spec.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="nc-divider" />

          {/* Details Section */}
          <div className="nc-details">
            <p>
              비즈니스의 격을 높이는 프리미엄 명함.<br />
              종이의 질감부터 섬세한 후가공까지, 당신만의 특별한 브랜드 가치를 명함 한 장에 담아냅니다.
            </p>
            <img 
              src={content.mainImage} 
              alt="Detail" 
              className="nc-detail-img" 
              onClick={() => setSelectedImage(content.mainImage)} 
            />
            <p>
              애드큐 전문 디자이너의 손길을 거쳐 가장 트렌디하고 세련된 레이아웃을 제공합니다.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="nc-cta-bar">
        <div className="nc-cta-content">
          <div className="nc-cta-text">
            <span>나만의 명함 제작하기</span>
            <strong>최고급 수입지 명함</strong>
          </div>
          <button className="btn-purchase" onClick={handlePurchase}>
            구매하기 <ExternalLink size={18} />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="nc-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="nc-image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage} alt="Enlarged view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default NamecardLanding;

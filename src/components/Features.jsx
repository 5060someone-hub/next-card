import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '📱',
      title: '스마트 QR & NFC 공유',
      description: '상대방이 앱을 설치할 필요 없이 QR 코드 스캔이나 태그만으로 명함을 즉시 공유하세요.'
    },
    {
      icon: '🤖',
      title: 'AI 명함 관리',
      description: 'Gemini AI가 수신한 명함 정보를 자동으로 분석하고 정리하여 인맥 관리를 도와줍니다.'
    },
    {
      icon: '📈',
      title: '실시간 분석 대시보드',
      description: '내 명함이 언제, 어디서, 얼마나 조회되었는지 상세한 통계 데이터를 제공합니다.'
    },
    {
      icon: '🌿',
      title: '지속 가능한 ESG 경영',
      description: '종이 명함 사용을 줄여 탄소 배출을 절감하고 환경 보호에 동참하세요.'
    }
  ];

  return (
    <section id="features" className="features section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">비즈니스를 위한 스마트한 기능</h2>
          <p className="section-subtitle">단순한 명함을 넘어 비즈니스 네트워킹의 모든 것을 담았습니다.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

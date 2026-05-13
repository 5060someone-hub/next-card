import React from 'react';
import './Hero.css';
import heroImage from '../assets/hero-visual.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in-up">
          <span className="badge">New Era of Networking</span>
          <h1 className="hero-title">
            명함을 넘어선<br />
            비즈니스 연결, <span className="text-gradient">Next Card</span>
          </h1>
          <p className="hero-description">
            종이 명함의 한계를 뛰어넘으세요. NFC, QR, 그리고 AI 기술이 결합된 
            가장 스마트한 디지털 명함 플랫폼으로 당신의 비즈니스 가치를 높이세요.
          </p>
          <div className="hero-btns">
            <button className="btn-primary btn-lg">무료로 시작하기</button>
            <button className="btn-outline btn-lg">서비스 가이드</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <strong>10k+</strong>
              <span>Active Users</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <strong>99%</strong>
              <span>Satisfaction</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-wrapper">
            <img src={heroImage} alt="Next Card Interface" className="hero-img" />
            <div className="floating-card card-1">
              <span className="icon">🚀</span>
              <span>Fast Sharing</span>
            </div>
            <div className="floating-card card-2">
              <span className="icon">💎</span>
              <span>Premium Design</span>
            </div>
          </div>
          <div className="hero-gradient-bg"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

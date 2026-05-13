import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-info">
          <div className="logo">
            <span className="logo-icon">🪪</span>
            <span className="logo-text">Next<span className="text-gradient">Card</span></span>
          </div>
          <p className="footer-desc">
            가장 스마트한 비즈니스 연결의 시작.<br />
            당신의 가치를 디지털로 전달하세요.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon">Instagram</a>
            <a href="#" className="social-icon">LinkedIn</a>
            <a href="#" className="social-icon">Facebook</a>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Service</h4>
            <ul>
              <li><a href="#">기능 소개</a></li>
              <li><a href="#">요금제</a></li>
              <li><a href="#">NFC 카드 구매</a></li>
            </ul>
          </div>
          <div className="link-group">
            <h4>Support</h4>
            <ul>
              <li><a href="#">자주 묻는 질문</a></li>
              <li><a href="#">문의하기</a></li>
              <li><a href="#">공지사항</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 Next Card Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

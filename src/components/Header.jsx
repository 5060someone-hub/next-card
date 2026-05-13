import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🪪</span>
            <span className="logo-text">Next<span className="text-gradient">Card.kr</span></span>
          </Link>
        </div>
        
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="#features">서비스 소개</a></li>
            <li><a href="#pricing">요금제</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <Link to="/login" className="btn-login">로그인</Link>
          <Link to="/signup" className="btn-primary">무료로 시작하기</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

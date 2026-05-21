import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Search, MessageCircle, Mail, Globe, Loader2 } from 'lucide-react';
import './FaqBoard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const FaqBoard = () => {
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/landing-content`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setC(data);
          document.title = `자주 묻는 질문 전체보기 | ${data.nav?.logo || 'NextCard'}`;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="faq-board-loading">
        <Loader2 className="spinner" size={40} />
        <p>자주 묻는 질문을 불러오는 중입니다...</p>
      </div>
    );
  }

  const logo = c?.nav?.logo || 'NextCard';
  const logoSub = c?.nav?.logoSub || '.kr';
  const faqBadge = c?.faq?.badge || 'FAQ';
  const faqTitle = c?.faq?.title || '자주 묻는 질문';
  const faqDesc = c?.faq?.desc || '디지털명함을 만들기 전에 알아야 할 모든 것.';
  const allFaqItems = c?.faq?.items || [];

  // 검색 필터링
  const filteredFaqItems = allFaqItems.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 테마 색상 설정
  const themeStyles = {
    '--dark-bg': c?.colors?.pageBg || '#0f172a',
    '--primary-color': c?.colors?.primary || '#db2777',
    '--secondary-color': c?.colors?.secondary || '#7c3aed',
    '--dark-card': c?.colors?.cardBg || '#1e293b',
    '--footer-bg': c?.colors?.footerBg || '#0f172a',
    '--primary-gradient': `linear-gradient(135deg, ${c?.colors?.primary || '#db2777'} 0%, ${c?.colors?.secondary || '#7c3aed'} 100%)`,
  };

  return (
    <div className="faq-board-wrapper" style={themeStyles}>
      {/* ── 네비게이션 ── */}
      <nav className="faq-board-nav">
        <div className="container nav-content">
          <div className="logo" onClick={() => window.location.href = '/'}>
            {logo}<span>{logoSub}</span>
          </div>
          <div className="nav-links">
            <a href="/" className="btn-back-home">
              <ArrowLeft size={16} /> 홈으로 돌아가기
            </a>
          </div>
        </div>
      </nav>

      {/* ── 메인 콘텐츠 ── */}
      <main className="faq-board-main">
        <div className="container">
          <div className="faq-board-header">
            <span className="faq-badge">{faqBadge}</span>
            <h2>{faqTitle} <span className="title-highlight">전체보기</span></h2>
            <p>{faqDesc}</p>
          </div>

          {/* 🔍 검색 바 */}
          <div className="faq-search-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="궁금한 질문이나 키워드를 검색해 보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn-search-clear" onClick={() => setSearchQuery('')}>
                &times;
              </button>
            )}
          </div>

          {/* 📂 아코디언 게시판 */}
          <div className="faq-board-list">
            {filteredFaqItems.length > 0 ? (
              filteredFaqItems.map((item, i) => (
                <div
                  key={i}
                  className={`faq-board-item ${activeFaq === i ? 'active' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <div className="faq-board-question">
                    <span className="q-badge">Q</span>
                    <span className="q-text">{item.q}</span>
                    <ChevronRight size={20} className="faq-board-icon" />
                  </div>
                  <div className="faq-board-answer">
                    <div className="answer-wrapper">
                      <span className="a-badge">A</span>
                      <div className="a-text">{item.a}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="faq-no-results">
                <p>"{searchQuery}"에 매칭되는 질문이 없습니다.</p>
                <span>다른 검색어를 입력하거나 올바른 철자인지 확인해 주세요.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── 푸터 ── */}
      {c?.footer && (
        <footer className="landing-footer">
          <div className="container">
            <div className="footer-top">
              <div className="footer-logo">{c.footer.logo}</div>
              {c.footer.companyName && (
                <div className="footer-info">
                  <div className="info-row">
                    <span>상호: {c.footer.companyName}</span>
                    <span>대표: {c.footer.ceoName}</span>
                    <span>사업자등록번호: {c.footer.businessNumber}</span>
                    {c.footer.mailOrderNumber && <span>통신판매업신고번호: {c.footer.mailOrderNumber}</span>}
                  </div>
                  <div className="info-row">
                    <span>주소: {c.footer.address}</span>
                    <span>고객센터: {c.footer.contact}</span>
                  </div>
                </div>
              )}
              <div className="footer-sns">
                <MessageCircle size={20} />
                <Mail size={20} />
                <Globe size={20} />
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copyright-links">
                <span className="copyright">{c.footer.copyright}</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default FaqBoard;

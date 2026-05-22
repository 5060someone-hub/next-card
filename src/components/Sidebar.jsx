import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({ pendingCards: 0, newInquiries: 0, newPlanChanges: 0 });

  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  // 마스터 계정 또는 admin 권한 체크 강화 (대표님 계정 포함)
  const isAdmin = auth.role === 'admin' || 
                  auth.email === 'vikitour.boss@gmail.com' || 
                  auth.email === 'adqkorea@gmail.com' || 
                  auth.email === 'cyy3172@naver.com';

  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '내 명함 관리', path: '/cards', icon: '🪪' },
    { name: '인맥 로그', path: '/logs', icon: '📝' },
    { name: '통계 분석', path: '/analytics', icon: '📈' },
    { name: '설정', path: '/settings', icon: '⚙️' },
  ];

  const adminItems = [
    { name: '회원 및 발행관리', path: '/admin', icon: '👥' },
    { name: '요금 변경 내역', path: '/admin/plan-changes', icon: '📈' },
    { name: '상품 관리', path: '/admin/products', icon: '🛍️' },
    { name: '사이트 광고 관리', path: '/admin/ads', icon: '📢' },
    { name: '메인 페이지 편집', path: '/admin/landing', icon: '🖊️' },
    { name: '명함 페이지 편집', path: '/admin/namecard', icon: '💳' },
    { name: '자주묻는질문 (FAQ)', path: '/admin/landing?tab=faq', icon: '❓' },
    { name: '제휴 및 도입 문의', path: '/admin/inquiries', icon: '✉️' },
  ];

  // 페이지 이동 및 탭 이동 시 모바일 드로어를 자동으로 닫습니다.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  // 알림 뱃지 데이터 폴링
  useEffect(() => {
    if (isAdmin) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/notifications`);
          if (res.ok) {
            const data = await res.json();
            setNotifications(data);
          }
        } catch (e) {
          console.error('Failed to fetch notifications', e);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, location.pathname]); // 경로 변경시 즉시 업데이트

  return (
    <>
      {/* 모바일 상단 고정 헤더 바 */}
      <div className="mobile-header">
        <Link to="/dashboard" className="mobile-logo">
          <span className="logo-icon">🪪</span>
          <span className="logo-text">NextCard.kr</span>
        </Link>
        <button 
          className={`hamburger-btn ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="메뉴 토글"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* 모바일용 반투명 배경 레이어 (클릭 시 닫힘) */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/dashboard">
            <span className="logo-icon">🪪</span>
            <span className="logo-text">NextCard.kr</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-name">{item.name}</span>
                </Link>
              </li>
            ))}

            {isAdmin && (
              <>
                <li className="sidebar-section-title" style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  margin: '1.5rem 0 0.5rem 0.5rem'
                }}>관리자 전용</li>
                {adminItems.map((item) => {
                  const isActive = (location.pathname + location.search) === item.path ||
                                   (item.path === '/admin/landing' && location.pathname === '/admin/landing' && !location.search.includes('tab=faq'));
                  
                  let badgeCount = 0;
                  if (item.path === '/admin') badgeCount = notifications.pendingCards;
                  if (item.path === '/admin/inquiries') badgeCount = notifications.newInquiries;
                  if (item.path === '/admin/plan-changes') badgeCount = notifications.newPlanChanges;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.name}
                          {badgeCount > 0 && (
                            <span style={{
                              background: '#ef4444',
                              color: 'white',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              minWidth: '18px',
                              height: '18px',
                              borderRadius: '9px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0 4px',
                              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
                            }}>
                              {badgeCount > 99 ? '99+' : badgeCount}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('nextcard_auth');
            window.location.href = '/login';
          }}>
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

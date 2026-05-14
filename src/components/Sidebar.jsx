import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};
  const isAdmin = auth.role === 'admin';

  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '내 명함 관리', path: '/cards', icon: '🪪' },
    { name: '인맥 로그', path: '/logs', icon: '📝' },
    { name: '통계 분석', path: '/analytics', icon: '📈' },
    { name: '설정', path: '/settings', icon: '⚙️' },
  ];

  const adminItems = [
    { name: '명함 발행 관리', path: '/admin', icon: '🛡️' },
    { name: '운영자 관리', path: '/admin/users', icon: '👥' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link to="/">
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
              <li className="sidebar-section-title">관리자 전용</li>
              {adminItems.map((item) => (
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
            </>
          )}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout">로그아웃</button>
      </div>
    </aside>
  );
};

export default Sidebar;

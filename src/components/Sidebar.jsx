import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: '대시보드', path: '/dashboard', icon: '📊' },
    { name: '내 명함 관리', path: '/cards', icon: '🪪' },
    { name: '인맥 로그', path: '/logs', icon: '📝' },
    { name: '통계 분석', path: '/analytics', icon: '📈' },
    { name: '설정', path: '/settings', icon: '⚙️' },
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
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout">로그아웃</button>
      </div>
    </aside>
  );
};

export default Sidebar;

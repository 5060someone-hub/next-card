import React from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: '총 명함 조회수', value: '1,284', change: '+12%', icon: '👁️' },
    { title: '오늘 교환 건수', value: '12', change: '+2', icon: '🤝' },
    { title: '평균 체류 시간', value: '45s', change: '+5s', icon: '⏱️' },
    { title: '활성 카드 수', value: '3', change: '0', icon: '🪪' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>대시보드</h1>
            <p>환영합니다, 대표님! 오늘 비즈니스 현황입니다.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">K</div>
            <span>대표님</span>
          </div>
        </header>

        <section className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <div className="stat-value">
                  <span>{stat.value}</span>
                  <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : ''}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-main-grid">
          <div className="dashboard-card card-large">
            <h3>최근 조회 트렌드</h3>
            <div className="chart-placeholder">
              {/* 차트 라이브러리 대신 간단한 시각화 */}
              <div className="bar-chart">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="chart-labels">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>내 디지털 명함</h3>
            <div className="mini-card-list">
              <div className="mini-card active">
                <div className="mini-card-preview"></div>
                <div className="mini-card-info">
                  <h4>Next Card CEO</h4>
                  <p>기본 명함</p>
                </div>
                <span className="status-badge">Active</span>
              </div>
              <button className="btn-add-card">+ 새 명함 만들기</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

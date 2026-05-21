import React from 'react';
import { User, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

const AdminStats = ({ counts }) => {
  return (
    <section className="stats-grid stats-grid-4">
      <div className="stat-card">
        <span className="stat-label">전체 회원</span>
        <span className="stat-value">{counts.all}</span>
        <User size={16} className="stat-icon-blue" />
      </div>
      <div className="stat-card pending">
        <span className="stat-label">발행 대기</span>
        <span className="stat-value">{counts.pending}</span>
        {counts.pending > 0 && <span className="stat-badge">🚨 {counts.pending}</span>}
      </div>
      <div className="stat-card published">
        <span className="stat-label">발행 완료</span>
        <span className="stat-value">{counts.published}</span>
        <CheckCircle2 size={16} className="stat-icon" />
      </div>
      <div className="stat-card">
        <span className="stat-label">미생성</span>
        <span className="stat-value">{counts.uncreated}</span>
        <Clock size={16} style={{ color: '#94a3b8' }} />
      </div>
    </section>
  );
};

export default AdminStats;

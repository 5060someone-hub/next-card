import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, Users, Download, Link as LinkIcon, Share2, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './Analytics.css';

const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const auth = JSON.parse(localStorage.getItem('nextcard_auth'));

  useEffect(() => {
    if (!auth) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/analytics/stats/${auth.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="analytics-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner">데이터를 불러오는 중입니다...</div>
        </main>
      </div>
    );
  }

  const { summary, viewsByDate, sourceStats, linkStats } = stats || { summary: {}, viewsByDate: [], sourceStats: [], linkStats: [] };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="analytics-content">
        <header className="analytics-header">
          <div className="header-title">
            <h1><TrendingUp size={28} color="#10b981" /> 통계 분석</h1>
            <p>내 디지털 명함의 성과와 방문자 통계를 한눈에 확인하세요.</p>
          </div>
        </header>

        {/* 요약 카드 */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon views"><Users size={24} /></div>
            <div className="summary-info">
              <span className="summary-label">총 누적 조회수</span>
              <span className="summary-value">{summary.totalViews || 0}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon saves"><Download size={24} /></div>
            <div className="summary-info">
              <span className="summary-label">연락처 저장 횟수</span>
              <span className="summary-value">{summary.totalSaves || 0}</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon links"><LinkIcon size={24} /></div>
            <div className="summary-info">
              <span className="summary-label">링크 클릭 전환율</span>
              <span className="summary-value">
                {summary.totalViews > 0 
                  ? Math.round(((linkStats.reduce((acc, curr) => acc + curr.count, 0)) / summary.totalViews) * 100) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          {/* 방문자 추이 (Line Chart) */}
          <div className="chart-card full-width">
            <h3><Activity size={18} /> 최근 30일 방문자 추이</h3>
            <div className="chart-container" style={{ height: '300px' }}>
              {viewsByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Line type="monotone" dataKey="count" name="방문수" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">아직 방문 데이터가 없습니다.</div>
              )}
            </div>
          </div>

          {/* 유입 경로 (Pie Chart) */}
          <div className="chart-card">
            <h3><Share2 size={18} /> 유입 경로 분석</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              {sourceStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {sourceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">데이터가 없습니다.</div>
              )}
            </div>
          </div>

          {/* 링크 클릭 순위 (Bar Chart) */}
          <div className="chart-card">
            <h3><LinkIcon size={18} /> 많이 클릭된 링크 TOP 5</h3>
            <div className="chart-container" style={{ height: '250px' }}>
              {linkStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={linkStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="_id" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} 
                      tickFormatter={(val) => {
                        if (val.includes('kakaotalk')) return '카카오톡';
                        if (val.includes('instagram')) return '인스타그램';
                        if (val.includes('youtube')) return '유튜브';
                        return '웹사이트';
                      }}
                    />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="count" name="클릭 수" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                      {linkStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">클릭된 링크 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

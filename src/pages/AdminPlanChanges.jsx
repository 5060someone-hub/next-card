import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Clock, CheckCircle, Search, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminPlanChanges() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    const isMaster = auth.role === 'admin' || 
                     auth.email === 'vikitour.boss@gmail.com' || 
                     auth.email === 'adqkorea@gmail.com' || 
                     auth.email === 'cyy3172@naver.com';

    if (!auth.isLoggedIn || !isMaster) {
      navigate('/dashboard');
      return;
    }
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/plan-changes`);
      if (response.ok) {
        const data = await response.json();
        setChanges(data);
        // 읽음 처리
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/plan-changes/read`, { method: 'PUT' }).catch(e => console.error(e));
      }
    } catch (err) {
      setError('내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getGradeName = (grade) => {
    if (grade === 'corporate') return '기업용';
    if (grade === 'premium_nfc' || grade === 'premium') return '프리미엄';
    if (grade === 'prod_1778899977850' || grade === 'event') return '체험용(2개월)';
    if (grade === 'prod_1778900193128' || grade === 'advanced') return '표준형(Standard-A)';
    if (grade === 'prod_1779363055944') return '표준형(Standard-B)';
    if (grade === 'prod_1779351721158') return '기본형(Basic-B)';
    return '기본형(Basic-A)';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1>📊 요금 변경 내역</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>회원들이 명함 편집기에서 직접 요금제를 변경한 내역을 실시간으로 확인합니다.</p>
          </div>
          <button className="btn-secondary" onClick={fetchChanges} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> 
            새로고침
          </button>
        </header>

        <div className="admin-table-container animate-in">
          <table className="admin-table">
            <thead>
              <tr>
                <th>변경 일시</th>
                <th>회원 정보</th>
                <th>명함 정보</th>
                <th>이전 등급</th>
                <th>변경된 등급</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="empty-row">로딩 중...</td></tr>
              ) : changes.length === 0 ? (
                <tr><td colSpan="5" className="empty-row">요금 변경 내역이 없습니다.</td></tr>
              ) : (
                changes.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {formatDate(log.changedAt)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.userId?.name || '알 수 없음'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.cardId?.cardData?.name || log.cardId?.cardData?.nameEng || '이름 없음'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.cardId?.cardData?.company || ''}</div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>
                        {getGradeName(log.prevGrade)}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '4px 8px', background: '#ecfdf5', borderRadius: '4px', fontSize: '0.8rem', color: '#059669', fontWeight: 'bold' }}>
                        {getGradeName(log.newGrade)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

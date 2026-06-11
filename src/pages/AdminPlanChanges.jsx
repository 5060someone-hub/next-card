import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Clock, CheckCircle, Search, RefreshCw, Trash2 } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminPlanChanges() {
  const [changes, setChanges] = useState([]);
  const [products, setProducts] = useState([]);
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
      const [resChanges, resProducts] = await Promise.all([
        fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/plan-changes`),
        fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/products`)
      ]);
      
      if (resChanges.ok && resProducts.ok) {
        const changesData = await resChanges.json();
        const productsData = await resProducts.json();
        setChanges(changesData);
        setProducts(productsData);
        // 읽음 처리
        fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/plan-changes/read`, { method: 'PUT' }).catch(e => console.error(e));
      }
    } catch (err) {
      setError('내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 요금 변경 내역을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/plan-changes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setChanges(changes.filter(c => c._id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getGradeName = (grade) => {
    const prod = products.find(p => p.id === grade);
    if (prod) return prod.name;
    
    if (grade === 'corporate') return '기업용';
    if (grade === 'premium_nfc' || grade === 'premium') return '프리미엄';
    if (grade === 'prod_1778899977850' || grade === 'event') return '체험용(2개월)';
    if (grade === 'prod_1778900193128' || grade === 'advanced') return '표준형(Standard-A)';
    if (grade === 'prod_1779363055944') return '표준형(Standard-B)';
    if (grade === 'prod_1779351721158') return '기본형(Basic-B)';
    if (grade === 'general') return '기본형(Basic-A)';
    if (grade === 'paper') return '종이명함(스캔)';
    return grade || '알 수 없음';
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
                <th>관리</th>
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
                    <td>
                      <button 
                        onClick={() => handleDelete(log._id)} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
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

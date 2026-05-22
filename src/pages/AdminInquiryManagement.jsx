import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  RefreshCw, 
  Clock, 
  Search, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  X, 
  AlertCircle,
  FileText,
  Building,
  Handshake,
  MessageSquare
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminInquiryManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    const isMaster = auth.role === 'admin' || 
                     auth.email === 'vikitour.boss@gmail.com' || 
                     auth.email === 'adqkorea@gmail.com' || 
                     auth.email === 'cyy3172@naver.com';

    if (!auth.isLoggedIn || !isMaster) {
      navigate('/login');
      return;
    }
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/inquiries`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data);
        setLastSync(new Date());
      } else {
        setError('문의 내역을 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error('Fetch inquiries error:', err);
      setError('서버와 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInquiry = async (item) => {
    setSelectedInquiry(item);
    if (item.isRead === false) {
      try {
        await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/inquiry/${item._id}/read`, { method: 'PUT' });
        setInquiries(prev => prev.map(i => i._id === item._id ? { ...i, isRead: true } : i));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleDeleteInquiry = async (id, name) => {
    if (!window.confirm(`[${name}] 님의 문의 내역을 정말로 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/inquiry/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('삭제되었습니다.');
        if (selectedInquiry?._id === id) setSelectedInquiry(null);
        fetchInquiries();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // 문의 유형 한글 매핑
  const getTypeText = (type) => {
    switch (type) {
      case 'general': return '일반 서비스 문의';
      case 'group': return '기업 단체 도입 문의';
      case 'partnership': return '제휴 및 제안';
      case 'other': return '기타 문의';
      default: return '일반 문의';
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'group': return 'status-pill active'; // Green / Active
      case 'partnership': return 'status-pill premium'; // Violet / Premium
      case 'general': return 'status-pill published'; // Blue
      default: return 'status-pill pending'; // Gray / Pending
    }
  };

  // 검색 및 필터링 로직
  const filteredInquiries = inquiries.filter(item => {
    // 1. 유형 필터
    if (filterType !== 'all' && item.type !== filterType) return false;

    // 2. 검색어 필터
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (item.name || '').toLowerCase().includes(term);
    const emailMatch = (item.email || '').toLowerCase().includes(term);
    const phoneMatch = (item.phone || '').toLowerCase().includes(term);
    const contentMatch = (item.content || '').toLowerCase().includes(term);

    return nameMatch || emailMatch || phoneMatch || contentMatch;
  });

  // 통계 집계
  const counts = {
    all: inquiries.length,
    general: inquiries.filter(i => i.type === 'general' || !i.type).length,
    group: inquiries.filter(i => i.type === 'group').length,
    partnership: inquiries.filter(i => i.type === 'partnership').length,
    other: inquiries.filter(i => i.type === 'other').length
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>제휴 및 도입 문의 관리</h1>
            <p>랜딩페이지를 통해 들어온 가망고객들의 제휴 및 단체 도입 문의 내역을 모니터링합니다.</p>
          </div>
          <div className="header-info">
            {lastSync && (
              <span className="sync-time">
                <Clock size={14} /> 업데이트: {lastSync.toLocaleTimeString()}
              </span>
            )}
            <button className={`btn-refresh ${loading ? 'spinning' : ''}`} onClick={fetchInquiries} disabled={loading}>
              <RefreshCw size={18} />
              {loading ? '로딩중...' : '새로고침'}
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* 통계 카드 */}
        <section className="stats-grid stats-grid-4" style={{ marginBottom: '24px' }}>
          <div className={`stat-card ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
            <span className="stat-label">전체 문의</span>
            <span className="stat-value">{counts.all}</span>
            <FileText size={16} className="stat-icon-blue" style={{ opacity: 0.7 }} />
          </div>
          <div className={`stat-card ${filterType === 'group' ? 'active' : ''}`} onClick={() => setFilterType('group')}>
            <span className="stat-label">기업 단체 도입</span>
            <span className="stat-value">{counts.group}</span>
            <Building size={16} className="stat-icon" style={{ color: '#10b981', opacity: 0.7 }} />
          </div>
          <div className={`stat-card ${filterType === 'partnership' ? 'active' : ''}`} onClick={() => setFilterType('partnership')}>
            <span className="stat-label">제휴 및 제안</span>
            <span className="stat-value">{counts.partnership}</span>
            <Handshake size={16} style={{ color: '#8b5cf6', opacity: 0.7 }} />
          </div>
          <div className={`stat-card ${filterType === 'general' ? 'active' : ''}`} onClick={() => setFilterType('general')}>
            <span className="stat-label">일반 서비스 문의</span>
            <span className="stat-value">{counts.general}</span>
            <MessageSquare size={16} style={{ color: '#3b82f6', opacity: 0.7 }} />
          </div>
        </section>

        {/* 검색바 */}
        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="이름, 회사명, 이메일, 연락처, 내용으로 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 테이블 내역 */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>접수 일시</th>
                <th>성함 / 회사명</th>
                <th>연락처 / 이메일</th>
                <th>문의 유형</th>
                <th>문의 내용 요약</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">문의 내역을 불러오는 중입니다...</td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '접수된 문의 내역이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => (
                  <tr key={item._id} style={{ background: item.isRead !== false ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }}>
                    <td className="date-cell">
                      {item.isRead === false && <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block', marginRight: 6 }}></span>}
                      {formatDate(item.createdAt)}
                    </td>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="phone-text"><Phone size={12} /> {item.phone}</div>
                        <div className="email-text"><Mail size={12} /> {item.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={getTypeStyle(item.type)}>
                        {getTypeText(item.type)}
                      </span>
                    </td>
                    <td>
                      <span className="memo-text" style={{ 
                        maxWidth: '280px', 
                        display: 'inline-block', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        color: 'var(--text-secondary)'
                      }}>
                        {item.content}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-table-info" onClick={() => handleViewInquiry(item)}>
                          상세보기
                        </button>
                        <button 
                          className="btn-table-danger" 
                          style={{
                            background: 'rgba(ef, 68, 68, 0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(ef, 68, 68, 0.2)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => handleDeleteInquiry(item._id, item.name)}
                        >
                          <Trash2 size={12} /> 삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 상세 보기 모달 */}
        {selectedInquiry && (
          <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>✉️ 문의사항 상세 보기</h2>
                <button className="btn-close" onClick={() => setSelectedInquiry(null)}><X size={20} /></button>
              </div>

              <div className="preview-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>접수 일시:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{formatDate(selectedInquiry.createdAt)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>성함 / 회사명:</span>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{selectedInquiry.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>문의 유형:</span>
                    <span className={getTypeStyle(selectedInquiry.type)} style={{ margin: 0 }}>
                      {getTypeText(selectedInquiry.type)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>연락처 정보</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a 
                      href={`tel:${selectedInquiry.phone}`} 
                      className="btn-secondary" 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '12px', 
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      <Phone size={14} /> {selectedInquiry.phone}
                    </a>
                    <a 
                      href={`mailto:${selectedInquiry.email}`} 
                      className="btn-secondary" 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '12px', 
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.95rem'
                      }}
                    >
                      <Mail size={14} /> {selectedInquiry.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>문의 내용</h4>
                  <div style={{ 
                    background: 'rgba(15, 23, 42, 0.4)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    color: 'var(--text-main)', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    minHeight: '120px'
                  }}>
                    {selectedInquiry.content}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setSelectedInquiry(null)} style={{ padding: '10px 20px' }}>닫기</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

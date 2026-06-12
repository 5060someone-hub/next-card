import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  RefreshCw, 
  Clock, 
  ShieldAlert,
  X
} from 'lucide-react';
import './AdminDashboard.css';

// 모듈화된 컴포넌트 임포트
import AdminStats from '../components/admin/AdminStats';
import AdminUserTable from '../components/admin/AdminUserTable';
import AdminUserEditModal from '../components/admin/AdminUserEditModal';
import AdminPublishModal from '../components/admin/AdminPublishModal';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  
  // 서버사이드 페이지네이션 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({ all: 0, pending: 0, published: 0, uncreated: 0 });
  
  // 상태 관리용
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedUserForPublish, setSelectedUserForPublish] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', grade: '', expiryDate: '', paymentStatus: 'pending', paymentDate: '' });

  // 무통장 입금 수동 승인 관리 상태값
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingUser, setApprovingUser] = useState(null);
  const [approvalDuration, setApprovalDuration] = useState(12); // 6 or 12


  const [isCardEditModalOpen, setIsCardEditModalOpen] = useState(false);
  const [editingCardUserId, setEditingCardUserId] = useState(null);
  const [cardEditForm, setCardEditForm] = useState({
    name: '', nameEng: '', jobTitle: '', company: '', department: '', 
    phone: '', phoneWork: '', phonePersonal: '', email: '', website: '', address: '', intro: '',
    logoUrl: '', profileUrl: '', logoSize: 40, profileSize: 120,
    themeColor: '#db2777', theme: 'modern',
    nameFontSize: 24, jobTitleFontSize: 16, companyFontSize: 14,
    paperCardUrl: '', customCardUrl: '', productType: 'general',
    sns: { kakaotalk: '', instagram: '', facebook: '', tiktok: '', linkedin: '', x: '', threads: '' }
  });

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
    fetchData();
  }, []);

  const fetchData = async (pageToFetch = currentPage, search = searchTerm) => {
    setLoading(true);
    setError(null);

    // 25초 타임아웃 설정 - Render 서버가 느릴 때 무한 로딩 방지
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const [userRes, prodRes, statsRes] = await Promise.all([
        fetch(`${API}/api/admin/users?page=${pageToFetch}&limit=25&search=${encodeURIComponent(search)}`, { signal: controller.signal }),
        fetch(`${API}/api/products`, { signal: controller.signal }),
        fetch(`${API}/api/admin/stats`, { signal: controller.signal })
      ]);
      clearTimeout(timeoutId);
      
      if (userRes.ok && prodRes.ok && statsRes.ok) {
        const userData = await userRes.json();
        const prodData = await prodRes.json();
        const statsData = await statsRes.json();
        
        setUsers(userData.users || []);
        setCurrentPage(userData.currentPage || 1);
        setTotalPages(userData.totalPages || 1);
        setTotalUsers(userData.totalUsers || 0);

        // userCards는 /api/admin/users 응답에서 이미 포함되어 옴
        const allCards = (userData.users || []).flatMap(u => u.userCards || []);
        // paper 카드 제외
        setCards(allCards.filter(c => c.grade !== 'paper'));
        setProducts(prodData);
        setStats(statsData);
        setLastSync(new Date());
      } else {
        const errText = !userRes.ok ? `회원 API 오류 (${userRes.status})` : `상품 API 오류 (${prodRes.status})`;
        setError(`데이터를 불러오는 데 실패했습니다. ${errText} - 잠시 후 새로고침해 주세요.`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setError('서버 응답이 너무 늦습니다 (25초 초과). Render 서버가 절전 상태에서 깨어나는 중일 수 있습니다. 30초 후 새로고침 버튼을 눌러주세요.');
      } else {
        setError(`서버와 통신 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({ 
      name: user.name, 
      email: user.email, 
      phone: user.phone || '',
      grade: user.grade || 'general',
      expiryDate: user.expiryDate ? user.expiryDate.split('T')[0] : '',
      paymentStatus: user.paymentStatus || 'pending',
      paymentDate: user.paymentDate ? user.paymentDate.split('T')[0] : '',
      role: user.role || 'user'
    });
  };

  const handleEditCard = (userId) => {
    navigate(`/admin/card-editor/${userId}`);
  };

  const saveUserEdit = async (e) => {
    e.preventDefault();
    try {
      const saveBody = {
        ...editForm,
        paymentDate: editForm.paymentDate || null
      };
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/user/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveBody)
      });
      if (response.ok) {
        alert('수정 완료');
        setEditingUser(null);
        fetchData();
      }
    } catch (err) {
      alert('수정 실패');
    }
  };

  const deleteCard = async (cardId, label) => {
    // 보안 강화: 대표님 계정만 삭제 권한 부여 (다른 운영자는 불가)
    const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};
    if (auth.email !== 'vikitour.boss@gmail.com') {
      return alert('명함 삭제 권한이 없습니다. 마스터 대표 계정만 명함 삭제가 가능합니다.');
    }
    if (!window.confirm(`[${label}] 명함을 정말로 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/cards/${cardId}`, { method: 'DELETE' });
      if (response.ok) {
        alert('삭제 완료');
        fetchData();
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const handleApproveClick = (card) => {
    setApprovingUser(card);
    setApprovalDuration(card.requestedDuration || 12);
    setIsApprovalModalOpen(true);
  };

  const handleSaveApproval = async () => {
    if (!approvingUser) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/payment/approve/${approvingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: approvalDuration })
      });
      if (response.ok) {
        const targetUser = users.find(u => u.id === approvingUser.userId) || {};
        const cardName = approvingUser.cardData?.name || '명함';
        alert(`[${targetUser.name || '회원'} - ${cardName}] 명함의 무통장 입금이 성공적으로 승인되었습니다!`);
        setIsApprovalModalOpen(false);
        setApprovingUser(null);
        fetchData();
      } else {
        alert('승인 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('Approve failed:', err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handleRejectPayment = async (cardId, label) => {
    if (!window.confirm(`[${label}] 명함의 결제 신청을 정말로 반려하시겠습니까?\n신청 내역이 리셋되며 대기 목록에서 제외됩니다.`)) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/payment/reject/${cardId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert('반려 처리가 완료되었습니다.');
        fetchData();
      } else {
        alert('반려 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error('Reject failed:', err);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };


  const openPublishModal = (card) => {
    // Find the associated user to get full user details (like phone, which is not in card)
    const user = users.find(u => u.id === card.userId) || {};
    
    // Inject name, email, phone into the card object so AdminPublishModal can use them
    const publishData = {
      ...card,
      name: user.name || card.userName || card.cardData?.name || '알수없음',
      email: user.email || card.userEmail || card.cardData?.email || '이메일없음',
      phone: user.phone || card.cardData?.phone || ''
    };
    
    setSelectedUserForPublish(publishData);
    setCustomUrl(card?.cardData?.customCardUrl || '');
    setIsPublishModalOpen(true);
  };

  const handleSavePublish = async (url) => {
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/cards/${selectedUserForPublish._id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCardUrl: url, status: 'published' })
      });
      if (response.ok) {
        alert('발행 완료!');
        setIsPublishModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('발행 오류');
    }
  };

  const handleDownloadQR = (userName) => {
    const canvas = document.getElementById('qr-canvas-download');
    if (!canvas) return;
    
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = 1000;
    highResCanvas.height = 1000;
    const ctx = highResCanvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1000, 1000);
    ctx.drawImage(canvas, 50, 50, 900, 900);
    
    const url = highResCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_${userName}_NextCard.png`;
    link.href = url;
    link.click();
  };

  const handleExportExcel = () => {
    try {
      // 안전한 날짜 변환 헬퍼
      const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
      };

      const headers = ["이름", "이메일", "연락처", "가입일", "만료일", "등급", "발행상태", "명함URL"];
      const rows = sortedCards.map(card => {
        const user = users.find(u => u.id === card.userId) || {};
        const status = card.cardData?.status || 'pending';
        const fullUrl = `${window.location.origin}/v/${card?.cardData?.customCardUrl || card._id}`;
        const prodName = products.find(p => p.id === card.grade)?.name || card.grade || '일반';
        
        // 쉼표(,)가 포함되어 컬럼이 쪼개지거나 깨지는 결함을 막기 위한 더블 쿼트 이스케이프 매핑
        const escapeCsvValue = (val) => {
          const str = String(val === null || val === undefined ? '' : val);
          return `"${str.replace(/"/g, '""')}"`;
        };

        return [
          user.name || '',
          user.email || '',
          user.phone || '',
          formatDate(user.createdAt),
          card.expiryDate ? formatDate(card.expiryDate) : '평생',
          prodName,
          status === 'published' ? '발행완료' : status === 'pending' ? '발행대기' : '미작성',
          fullUrl
        ].map(escapeCsvValue);
      });

      const csvContent = "\uFEFF" + [headers.map(h => `"${h}"`), ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `nextcard_users_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('엑셀 내보내기 실패:', err);
      alert(`엑셀 저장 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const getCardStatus = (userId) => {
    const card = cards.find(c => String(c.userId) === String(userId));
    if (!card) return 'uncreated';
    return card.cardData?.status || 'pending';
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCards.map(c => c._id));
    }
  };

  const toggleSelectCard = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredCards = cards.filter(card => {
    if (!card) return false;
    const user = users.find(u => u.id === card.userId) || {};
    const term = searchTerm.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const cardName = (card.cardData?.name || '').toLowerCase();
    const company = (card.cardData?.company || '').toLowerCase();
    return name.includes(term) || email.includes(term) || cardName.includes(term) || company.includes(term);
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    let valA = a[key] || '';
    let valB = b[key] || '';
    if (key === 'name') {
      valA = users.find(u => u.id === a.userId)?.name || '';
      valB = users.find(u => u.id === b.userId)?.name || '';
    } else if (key === 'createdAt') {
      valA = a.createdAt || users.find(u => u.id === a.userId)?.createdAt || '';
      valB = b.createdAt || users.find(u => u.id === b.userId)?.createdAt || '';
    }
    if (valA < valB) return -1 * direction;
    if (valA > valB) return 1 * direction;
    return 0;
  });



  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>통합 회원 및 발행 관리</h1>
            <p>전체 회원 현황 파악 및 고화질 QR 명함 발행</p>
          </div>
          <div className="header-info">
            {lastSync && (
              <span className="sync-time">
                업데이트: {lastSync.toLocaleTimeString()}
              </span>
            )}
            <button className={`btn-refresh ${loading ? 'spinning' : ''}`} onClick={fetchData} disabled={loading}>
              <RefreshCw size={18} />
              {loading ? '로딩중...' : '새로고침'}
            </button>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <ShieldAlert size={20} />
            <span>{error}</span>
          </div>
        )}

        <AdminStats counts={stats} />

        <AdminUserTable 
          loading={loading}
          sortedCards={sortedCards}
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={() => fetchData(1, searchTerm)}
          handleExportExcel={handleExportExcel}
          toggleSelectAll={toggleSelectAll}
          selectedIds={selectedIds}
          filteredCards={filteredCards}
          handleSort={handleSort}
          toggleSelectCard={toggleSelectCard}
          getCardStatus={getCardStatus}
          products={products}
          openPublishModal={openPublishModal}
          handleEditCard={handleEditCard}
          handleEditUser={handleEditUser}
          deleteCard={deleteCard}
          handleApproveClick={handleApproveClick}
          handleRejectPayment={handleRejectPayment}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchData(page, searchTerm)}
        />

        <AdminUserEditModal
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          editForm={editForm}
          setEditForm={setEditForm}
          products={products}
          saveUserEdit={saveUserEdit}
        />

        <AdminPublishModal
          isPublishModalOpen={isPublishModalOpen}
          selectedUserForPublish={selectedUserForPublish}
          setIsPublishModalOpen={setIsPublishModalOpen}
          customUrl={customUrl}
          setCustomUrl={setCustomUrl}
          handleSavePublish={handleSavePublish}
          handleDownloadQR={handleDownloadQR}
        />

        {isApprovalModalOpen && approvingUser && (() => {
          const targetUser = users.find(u => u.id === approvingUser.userId) || {};
          const cardName = approvingUser.cardData?.name || '이름 없음';
          const gradeName = products.find(p => p.id === approvingUser.requestedGrade)?.name || approvingUser.requestedGrade || '프리미엄';

          return (
            <div className="modal-overlay" onClick={() => setIsApprovalModalOpen(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', padding: '2rem', borderRadius: '16px' }}>
                <div className="modal-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: 800 }}>💳 결제 수동 승인</h3>
                  <button className="btn-close" onClick={() => setIsApprovalModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body" style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                  <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>신청 회원</span>
                      <strong style={{ color: '#111827' }}>{targetUser.name || '회원'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>이메일</span>
                      <strong>{targetUser.email || '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>대상 명함</span>
                      <strong style={{ color: '#475569' }}>📇 {cardName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>결제 수단</span>
                      <strong style={{ color: '#d97706' }}>{approvingUser.paymentMethod || '무통장 입금'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>입금자명</span>
                      <strong style={{ color: '#d97706' }}>{approvingUser.depositorName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>결제(이체)예정금액</span>
                      <strong style={{ color: '#d97706' }}>{approvingUser.paymentAmount?.toLocaleString()}원</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>신청 등급</span>
                      <strong style={{ color: '#2563eb' }}>
                        {gradeName}
                      </strong>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.5rem', color: '#374151' }}>
                      승인할 구독 기간 선택
                    </label>
                    <select 
                      value={approvalDuration} 
                      onChange={e => setApprovalDuration(Number(e.target.value))}
                      disabled={approvingUser.requestedGrade === 'prod_1778899977850'}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.95rem',
                        fontWeight: 600
                      }}
                    >
                      {approvingUser.requestedGrade === 'prod_1778899977850' ? (
                        <option value={2}>2개월 이용권 (무료 체험용 고정)</option>
                      ) : (
                        <>
                          <option value={12}>1년(12개월) 이용권</option>
                          <option value={3}>3개월 이용권</option>
                          <option value={2}>2개월 무료 이용권</option>
                        </>
                      )}
                    </select>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
                      * 입금이 완벽히 확인된 경우에만 승인해 주십시오. 승인 즉시 해당 명함의 멤버십이 개별 활성화되고 만료일이 지정된 기간만큼 가산됩니다.
                    </p>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button 
                    className="btn-table-info" 
                    onClick={() => setIsApprovalModalOpen(false)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                  >
                    취소
                  </button>
                  <button 
                    className="btn-table-primary" 
                    onClick={handleSaveApproval}
                    style={{ 
                      padding: '0.6rem 1.2rem', 
                      borderRadius: '8px', 
                      background: '#10b981', 
                      color: 'white', 
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    승인 완료
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

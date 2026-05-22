import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, RefreshCw, AlertCircle, CheckCircle2, Clock, X, ExternalLink, User, Phone, Mail } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]); // 회원 목록 상태 추가
  const [products, setProducts] = useState([]); // 상품 목록 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCard, setSelectedCard] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // 미리보기 모달 추가
  const [lastSync, setLastSync] = useState(null);
  
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // 운영자 권한 체크 (마스터 계정 예외 처리 포함)
    if (auth.role !== 'admin' && auth.email !== 'vikitour.boss@gmail.com') {
      alert('관리자 권한이 없습니다.');
      navigate('/dashboard');
      return;
    }
    
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // 명함 목록 가져오기
      const cardRes = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/cards`);
      // 회원 목록 가져오기
      const userRes = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/users`);
      // 상품 목록 가져오기
      const productRes = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products`);
      
      if (cardRes.ok && userRes.ok && productRes.ok) {
        const cardData = await cardRes.json();
        const userData = await userRes.json();
        const productData = await productRes.json();
        setCards(cardData);
        setUsers(userData);
        setProducts(productData);
        setLastSync(new Date());
      } else {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('서버에 연결할 수 없습니다. 백엔드 서버 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const openPublishModal = (card) => {
    setSelectedCard(card);
    // 이미 발행된 경우 기존 URL 사용, 아니면 추천 슬러그 생성(이름 기반)
    if (card.cardData?.customCardUrl) {
      setCustomUrl(card.cardData.customCardUrl);
    } else {
      const suggestedSlug = card.cardData?.name?.toLowerCase().replace(/\s+/g, '-') || '';
      setCustomUrl(suggestedSlug);
    }
    setIsModalOpen(true);
  };

  const openPreviewModal = (card) => {
    setSelectedCard(card);
    setIsPreviewOpen(true);
  };

  const handlePublish = async () => {
    if (!customUrl) return alert('커스텀 URL을 입력해주세요.');
    
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/card/${selectedCard.userId}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCardUrl: customUrl, status: 'published' })
      });
      
      if (response.ok) {
        alert('발행이 완료되었습니다.');
        fetchCards();
        setIsModalOpen(false);
      } else {
        alert('발행 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('서버 통신 오류가 발생했습니다.');
    }
  };

  // 검색 필터링 로직
  const filteredCards = cards.filter(card => {
    // 상태 필터 적용
    const status = card.cardData?.status || 'pending';
    if (filterStatus === 'pending' && status !== 'pending') return false;
    if (filterStatus === 'published' && status !== 'published') return false;
    
    // 검색어 필터 적용
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    const nameMatch = card.cardData?.name?.toLowerCase().includes(term) || false;
    const emailMatch = card.userEmail?.toLowerCase().includes(term) || false;
    const companyMatch = card.cardData?.company?.toLowerCase().includes(term) || false;
    const userNameMatch = card.userName?.toLowerCase().includes(term) || false;
    
    return nameMatch || emailMatch || companyMatch || userNameMatch;
  });

  // 통계 계산
  const counts = {
    all: cards.length,
    users: users.length, // 전체 회원 수
    pending: cards.filter(c => (c.cardData?.status || 'pending') === 'pending').length,
    published: cards.filter(c => c.cardData?.status === 'published').length
  };

  // 정렬 로직 (발행 대기는 오래된 순, 나머지는 최신순)
  const sortedCardsList = [...filteredCards].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0);
    const dateB = new Date(b.updatedAt || 0);
    return filterStatus === 'pending' ? dateA - dateB : dateB - dateA;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '날짜 정보 없음';
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>운영자 대시보드</h1>
            <p>명함 발행 요청을 관리하고 QR 코드를 생성합니다.</p>
          </div>
          <div className="header-info">
            {lastSync && (
              <span className="sync-time">
                <Clock size={14} /> 업데이트: {lastSync.toLocaleTimeString()}
              </span>
            )}
            <button className={`btn-refresh ${loading ? 'spinning' : ''}`} onClick={fetchCards} disabled={loading}>
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

        <section className="stats-grid stats-grid-4">
          <div className="stat-card" onClick={() => navigate('/admin/users')}>
            <span className="stat-label">전체 회원</span>
            <span className="stat-value">{counts.users}</span>
            <User size={16} className="stat-icon-blue" />
          </div>
          <div className={`stat-card ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
            <span className="stat-label">전체 명함</span>
            <span className="stat-value">{counts.all}</span>
          </div>
          <div className={`stat-card pending ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
            <span className="stat-label">발행 대기</span>
            <span className="stat-value">{counts.pending}</span>
            {counts.pending > 0 && <span className="stat-badge">🚨 {counts.pending}</span>}
          </div>
          <div className={`stat-card published ${filterStatus === 'published' ? 'active' : ''}`} onClick={() => setFilterStatus('published')}>
            <span className="stat-label">발행 완료</span>
            <span className="stat-value">{counts.published}</span>
            <CheckCircle2 size={16} className="stat-icon" />
          </div>
        </section>

        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="이름, 이메일, 회사명으로 검색..." 
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

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>수정 일시</th>
                <th>사용자 정보</th>
                <th>연락처 / 이메일</th>
                <th>상품 종류</th>
                <th>회사 / 직함</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && cards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">데이터를 불러오는 중입니다...</td>
                </tr>
              ) : sortedCardsList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : '데이터가 없습니다.'}
                  </td>
                </tr>
              ) : (
                sortedCardsList.map((card) => (
                  <tr key={card.userId}>
                    <td className="date-cell">{formatDate(card.updatedAt)}</td>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{card.userName}</span>
                        <span className="user-name-sub">{card.cardData?.name || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="phone-text"><Phone size={12} /> {card.cardData?.phonePersonal || card.cardData?.phoneWork || '없음'}</div>
                        <div className="email-text"><Mail size={12} /> {card.cardData?.email || card.userEmail}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`product-tag ${card.cardData?.productType || 'general'}`}>
                        {products.find(p => p.id === card.cardData?.productType)?.name || (card.cardData?.productType === 'premium_nfc' ? '프리미엄(NFC)' : '일반형')}
                      </span>
                    </td>
                    <td>
                      <div className="work-info">
                        <span className="company">{card.cardData?.company || '-'}</span>
                        <span className="job">{card.cardData?.jobTitle || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${card.cardData?.status || 'pending'}`}>
                        {card.cardData?.status === 'published' ? '발행 완료' : '발행 대기'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-table-info" onClick={() => openPreviewModal(card)}>
                          상세보기
                        </button>
                        <button className="btn-table-primary" onClick={() => openPublishModal(card)}>
                          QR/발행
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 미리보기 모달 추가 */}
        {isPreviewOpen && selectedCard && (
          <div className="modal-overlay" onClick={() => setIsPreviewOpen(false)}>
            <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>명함 상세 정보</h2>
                <button className="btn-close" onClick={() => setIsPreviewOpen(false)}><X size={20} /></button>
              </div>
              <div className="preview-body">
                <div className="preview-section">
                  <h3>사용자 계정 정보</h3>
                  <p><strong>이름:</strong> {selectedCard.userName}</p>
                  <p><strong>이메일:</strong> {selectedCard.userEmail}</p>
                  <p><strong>신청일시:</strong> {formatDate(selectedCard.updatedAt)}</p>
                </div>
                <div className="preview-section card-data-preview">
                  <h3>입력된 명함 내용</h3>
                  <div className="data-grid">
                    <div className="data-item"><strong>이름:</strong> {selectedCard.cardData?.name}</div>
                    <div className="data-item"><strong>회사:</strong> {selectedCard.cardData?.company}</div>
                    <div className="data-item"><strong>직함:</strong> {selectedCard.cardData?.jobTitle}</div>
                    <div className="data-item"><strong>전화:</strong> {selectedCard.cardData?.phone}</div>
                    <div className="data-item"><strong>이메일:</strong> {selectedCard.cardData?.email}</div>
                    <div className="data-item"><strong>웹사이트:</strong> {selectedCard.cardData?.website}</div>
                    <div className="data-item"><strong>주소:</strong> {selectedCard.cardData?.address}</div>
                  </div>
                  {selectedCard.cardData?.memo && (
                    <div className="data-item full"><strong>소개/메모:</strong> <p>{selectedCard.cardData.memo}</p></div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={() => { setIsPreviewOpen(false); openPublishModal(selectedCard); }}>
                  이 내용으로 발행하기
                </button>
                <button className="btn-secondary" onClick={() => setIsPreviewOpen(false)}>닫기</button>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && selectedCard && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>명함 발행 및 QR 설정</h2>
              <p><strong>사용자:</strong> {selectedCard.userName} ({selectedCard.userEmail})</p>
              
              <div className="input-group">
                <label>커스텀 URL (슬러그)</label>
                <div className="url-input-wrapper">
                  <span className="url-prefix">nextcard.kr/v/</span>
                  <input 
                    type="text" 
                    value={customUrl} 
                    onChange={(e) => setCustomUrl(e.target.value)} 
                    placeholder="예: gildong-hong"
                  />
                </div>
                <p className="input-hint">공개용 명함의 고유 주소가 됩니다.</p>
              </div>

              {selectedCard.cardData?.status === 'published' && customUrl && (
                <div className="qr-section">
                  <h4>발급된 QR 코드</h4>
                  <div className="qr-img-wrapper">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${window.location.origin}/v/${customUrl}`} 
                      alt="QR Code" 
                    />
                  </div>
                  <p className="qr-hint">(우클릭하여 '이미지를 다른 이름으로 저장' 하세요)</p>
                </div>
              )}

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>취소</button>
                <button className="btn-primary" onClick={handlePublish}>확인 및 발행</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

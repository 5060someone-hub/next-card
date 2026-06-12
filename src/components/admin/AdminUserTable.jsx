import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, User, Shield, Mail, Phone, Download, CheckCircle2, Clock, X, Settings, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminUserTable = ({
  loading,
  sortedCards,
  users,
  searchTerm,
  setSearchTerm,
  handleExportExcel,
  toggleSelectAll,
  selectedIds,
  filteredCards,
  handleSort,
  toggleSelectCard,
  cards,
  products,
  openPublishModal,
  handleEditCard,
  handleEditUser,
  handleApproveClick,
  handleRejectPayment,
  deleteCard
}) => {
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};
  const isSuperAdmin = auth.email === 'vikitour.boss@gmail.com';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [sortedCards, searchTerm]);

  const totalPages = Math.ceil(sortedCards.length / itemsPerPage);
  const currentCards = sortedCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="table-header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '800px', height: '60px' }}>
          <div className="search-bar" style={{ flex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Search size={24} className="search-icon" style={{ marginLeft: '10px' }} />
            <input
              type="text"
              placeholder="회원 이름, 이메일, 명함명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', height: '100%', padding: '0 50px', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <button style={{ height: '100%', padding: '0 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>검색</button>
          <button className="btn-export" onClick={handleExportExcel} style={{ height: '100%', padding: '0 24px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', borderRadius: '8px' }}>
            <ExternalLink size={20} /> 엑셀 저장
          </button>
        </div>
      </div>

      <div className="admin-table-container animate-in" style={{ borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <table className="admin-table user-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredCards.length}
                />
              </th>
              <th onClick={() => handleSort('name')}>회원정보</th>
              <th>연락처</th>
              <th onClick={() => handleSort('createdAt')}>가입일</th>
              <th>결제(이체) / 명함명</th>
              <th>구독/만료</th>
              <th>등급/권한</th>
              <th>QR</th>
              <th>발행상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="empty-row">데이터 로딩 중...</td></tr>
            ) : currentCards.length === 0 ? (
              <tr><td colSpan="10" className="empty-row">검색 결과가 없습니다.</td></tr>
            ) : (
              currentCards.map(card => {
                const user = users.find(u => u.id === card.userId) || {};
                const cStatus = card.paymentStatus || 'none';
                const cardName = card.cardData?.name || card.cardData?.nameEng || '이름 없음';
                const expiryStr = card.expiryDate ? new Date(card.expiryDate).toISOString().split('T')[0] : '평생';
                const prod = products.find(p => p.id === card.grade);
                let gradeName = prod?.name || card.grade || '일반';
                if (card.grade === 'paper') gradeName = '종이명함(스캔)';
                const publishStatus = card.cardData?.status || 'draft';

                return (
                  <tr key={card._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(card._id)}
                        onChange={() => toggleSelectCard(card._id)}
                      />
                    </td>
                    <td>
                      <div className="user-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={`user-avatar-mini ${user.role || 'user'}`} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#e2e8f0' }}>
                          {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <span className="user-name-text" style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user.name || '알수없음'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell" style={{ lineHeight: '1.2' }}>
                        <div className="email-text" style={{ fontSize: '0.75rem', color: '#64748b' }}><Mail size={12} style={{ verticalAlign: 'middle' }}/> {user.email || '-'}</div>
                        <div className="phone-text" style={{ fontSize: '0.8rem', fontWeight: '500', marginTop: '2px' }}><Phone size={12} style={{ verticalAlign: 'middle' }}/> {user.phone || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell" style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '-'}
                      </div>
                    </td>
                    <td>
                      <div className="payment-cell-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="card-payment-status-row" style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', marginBottom: '2px' }}>
                            📇 {cardName}
                          </div>
                          {cStatus === 'confirmed' ? (
                            <span className="payment-confirmed" style={{ fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981' }} title={`승인일: ${card.paymentDate ? card.paymentDate.split('T')[0] : '-'}`}>
                              <CheckCircle2 size={12} color="#10b981" /> 완료
                              <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'normal' }}>({card.paymentDate ? card.paymentDate.split('T')[0] : ''})</span>
                            </span>
                          ) : cStatus === 'pending' ? (
                            <div className="payment-pending-container" style={{ padding: '6px', background: '#fffbeb', borderRadius: '6px', border: '1px solid #fef3c7', marginTop: '2px' }}>
                              <span className="payment-pending pulse-badge" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706' }} title={`요청일: ${card.paymentRequestDate ? card.paymentRequestDate.split('T')[0] : '-'}`}>
                                <Clock size={12} color="#d97706" /> 대기중
                              </span>
                              <div className="pending-sub-details" style={{ fontSize: '0.75rem', marginTop: '4px', lineHeight: '1.3', color: '#1e293b' }}>
                                <div>수단: <strong>{card.paymentMethod || '무통장입금'}</strong></div>
                                <div>입금자명: <strong>{card.depositorName}</strong></div>
                                <div>예정금액: <strong>{card.paymentAmount?.toLocaleString()}원</strong></div>
                                <div style={{ color: '#2563eb', fontWeight: '600', fontSize: '0.75rem', marginTop: '2px' }}>
                                  {products.find(p => p.id === card.requestedGrade)?.name || card.requestedGrade} ({card.requestedDuration}개월)
                                </div>
                              </div>
                              <div className="pending-action-quick-btns" style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                                <button
                                  className="btn-quick-approve"
                                  onClick={() => handleApproveClick(card)}
                                  title="결제 수동 승인"
                                  style={{
                                    padding: '4px 8px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  승인
                                </button>
                                <button
                                  className="btn-quick-reject"
                                  onClick={() => handleRejectPayment(card)}
                                  title="요청 반려"
                                  style={{
                                    padding: '4px 8px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  반려
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="payment-none" style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>
                              미신청
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                        {expiryStr}
                      </div>
                    </td>
                    <td>
                      <div className="grade-badge-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`grade-badge ${card.grade || 'general'}`} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {gradeName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-qr-direct" onClick={() => openPublishModal(card)} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>
                        <Download size={14} color="#475569" />
                      </button>
                    </td>
                    <td>
                      <div className={`status-pill ${publishStatus}`} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        {publishStatus === 'published' ? <CheckCircle2 size={12} /> : publishStatus === 'pending' ? <Clock size={12} /> : <X size={12} />}
                        {publishStatus === 'published' ? '발행완료' : publishStatus === 'pending' ? '발행대기' : '미작성'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleEditCard(card._id)} title="명함 내용 수정" style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}><Edit size={14} color="#475569" /></button>
                        <button className="btn-icon" onClick={() => handleEditUser(user)} title="계정 설정" style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}><Settings size={14} color="#475569" /></button>
                        {isSuperAdmin && (
                          <button className="btn-icon danger" onClick={() => deleteCard(card._id, `${user.name} - ${cardName}`)} title="명함 삭제" style={{ width: '28px', height: '28px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', background: '#fef2f2' }}><Trash2 size={14} color="#ef4444" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', 
              background: currentPage === 1 ? '#f1f5f9' : 'white', 
              color: currentPage === 1 ? '#94a3b8' : '#334155',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            <ChevronLeft size={18} /> 이전
          </button>
          <span style={{ fontSize: '1.05rem', fontWeight: '600', color: '#475569' }}>
            {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', 
              background: currentPage === totalPages ? '#f1f5f9' : 'white', 
              color: currentPage === totalPages ? '#94a3b8' : '#334155',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            다음 <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default AdminUserTable;

import React from 'react';
import { Search, ExternalLink, User, Shield, Mail, Phone, Download, CheckCircle2, Clock, X, Settings, Edit, Trash2 } from 'lucide-react';

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
  handleRejectClick,
  deleteCard
}) => {
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};
  const isSuperAdmin = auth.email === 'vikitour.boss@gmail.com';

  return (
    <>
      <div className="table-header-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="회원 이름, 이메일, 명함명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-export" onClick={handleExportExcel}>
          <ExternalLink size={16} /> 엑셀 저장
        </button>
      </div>

      <div className="table-responsive">
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
            ) : sortedCards.length === 0 ? (
              <tr><td colSpan="10" className="empty-row">검색 결과가 없습니다.</td></tr>
            ) : (
              sortedCards.map(card => {
                const user = users.find(u => u.id === card.userId) || {};
                const cStatus = card.paymentStatus || 'none';
                const cardName = card.cardData?.name || card.cardData?.nameEng || '이름 없음';
                const expiryStr = card.expiryDate ? new Date(card.expiryDate).toISOString().split('T')[0] : '평생';
                const prod = products.find(p => p.id === card.grade);
                const gradeName = prod?.name || card.grade || '일반';
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
                      <div className="user-info-cell">
                        <div className={`user-avatar-mini ${user.role || 'user'}`} style={{ width: '42px', height: '42px' }}>
                          {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                        </div>
                        <span className="user-name-text" style={{ fontSize: '1.15rem', fontWeight: '800' }}>{user.name || '알수없음'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="email-text" style={{ fontSize: '1.02rem' }}><Mail size={16} /> {user.email || '-'}</div>
                        <div className="phone-text" style={{ fontSize: '1.02rem', fontWeight: '700' }}><Phone size={16} /> {user.phone || '-'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell" style={{ fontSize: '1.02rem' }}>
                        {user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '-'}
                      </div>
                    </td>
                    <td>
                      <div className="payment-cell-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="card-payment-status-row" style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b', marginBottom: '6px' }}>
                            📇 {cardName}
                          </div>
                          {cStatus === 'confirmed' ? (
                            <span className="payment-confirmed" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title={`승인일: ${card.paymentDate ? card.paymentDate.split('T')[0] : '-'}`}>
                              <CheckCircle2 size={16} color="#10b981" /> 완료
                              <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>({card.paymentDate ? card.paymentDate.split('T')[0] : ''})</span>
                            </span>
                          ) : cStatus === 'pending' ? (
                            <div className="payment-pending-container" style={{ padding: '10px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7', marginTop: '6px' }}>
                              <span className="payment-pending pulse-badge" style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title={`요청일: ${card.paymentRequestDate ? card.paymentRequestDate.split('T')[0] : '-'}`}>
                                <Clock size={15} color="#d97706" /> 대기중
                              </span>
                              <div className="pending-sub-details" style={{ fontSize: '0.92rem', marginTop: '8px', lineHeight: '1.4', color: '#1e293b' }}>
                                <div>수단: <strong>{card.paymentMethod || '무통장입금'}</strong></div>
                                <div>입금자명: <strong>{card.depositorName}</strong></div>
                                <div>예정금액: <strong>{card.paymentAmount?.toLocaleString()}원</strong></div>
                                <div style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.88rem', marginTop: '6px' }}>
                                  {products.find(p => p.id === card.requestedGrade)?.name || card.requestedGrade} ({card.requestedDuration}개월)
                                </div>
                              </div>
                              <div className="pending-action-quick-btns" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-quick-approve"
                                  onClick={() => handleApproveClick(card)}
                                  title="결제 수동 승인"
                                  style={{
                                    padding: '6px 12px',
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  승인
                                </button>
                                <button
                                  className="btn-quick-reject"
                                  onClick={() => handleRejectClick(card)}
                                  title="요청 반려"
                                  style={{
                                    padding: '6px 12px',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                  }}
                                >
                                  반려
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="payment-none" style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>
                              미신청
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell" style={{ fontSize: '1.02rem', fontWeight: '600' }}>
                        {expiryStr}
                      </div>
                    </td>
                    <td>
                      <div className="grade-badge-container" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`grade-badge ${card.grade || 'general'}`} style={{ fontSize: '0.92rem', padding: '4px 12px', fontWeight: '800' }}>
                          {gradeName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button className="btn-qr-direct" onClick={() => openPublishModal(card)} style={{ padding: '8px 12px' }}>
                        <Download size={18} />
                      </button>
                    </td>
                    <td>
                      <div className={`status-pill ${publishStatus}`} style={{ fontSize: '0.92rem', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                        {publishStatus === 'published' ? <CheckCircle2 size={15} /> : publishStatus === 'pending' ? <Clock size={15} /> : <X size={15} />}
                        {publishStatus === 'published' ? '발행완료' : publishStatus === 'pending' ? '발행대기' : '미작성'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-icon" onClick={() => handleEditCard(card._id)} title="명함 내용 수정" style={{ width: '36px', height: '36px' }}><Edit size={18} /></button>
                        <button className="btn-icon" onClick={() => handleEditUser(user)} title="계정 설정" style={{ width: '36px', height: '36px' }}><Settings size={18} /></button>
                        {isSuperAdmin && (
                          <button className="btn-icon danger" onClick={() => deleteCard(card._id, `${user.name} - ${cardName}`)} title="명함 삭제" style={{ width: '36px', height: '36px' }}><Trash2 size={18} /></button>
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
    </>
  );
};

export default AdminUserTable;

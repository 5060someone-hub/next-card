import React from 'react';
import { Search, ExternalLink, User, Shield, Mail, Phone, Download, CheckCircle2, Clock, X, Settings, Edit, Trash2 } from 'lucide-react';

const AdminUserTable = ({
  loading,
  sortedUsers,
  searchTerm,
  setSearchTerm,
  handleExportExcel,
  toggleSelectAll,
  selectedIds,
  filteredUsers,
  handleSort,
  toggleSelectUser,
  getCardStatus,
  cards,
  products,
  openPublishModal,
  handleEditCard,
  handleEditUser,
  deleteUser,
  handleApproveClick,
  handleRejectPayment
}) => {
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};
  const isSuperAdmin = auth.email === 'vikitour.boss@gmail.com';

  return (
    <>
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="회원 이름, 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-table-info" onClick={handleExportExcel}>
          <ExternalLink size={16} /> 엑셀 저장
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === filteredUsers.length}
                />
              </th>
              <th onClick={() => handleSort('name')}>회원정보</th>
              <th>연락처</th>
              <th onClick={() => handleSort('createdAt')}>가입일</th>
              <th>결제(이체)</th>
              <th>구독/만료</th>
              <th>등급/권한</th>
              <th>QR</th>
              <th>발행상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="empty-row">데이터 로딩 중...</td></tr>
            ) : sortedUsers.length === 0 ? (
              <tr><td colSpan="9" className="empty-row">검색 결과가 없습니다.</td></tr>
            ) : (
              sortedUsers.map(user => {
                const status = getCardStatus(user.id);
                const userCard = cards.find(c => String(c.userId) === String(user.id));
                return (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <div className={`user-avatar-mini ${user.role}`} style={{ width: '42px', height: '42px' }}>
                          {user.role === 'admin' ? <Shield size={20} /> : <User size={20} />}
                        </div>
                        <span className="user-name-text" style={{ fontSize: '1.15rem', fontWeight: '800' }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="email-text" style={{ fontSize: '1.02rem' }}><Mail size={16} /> {user.email}</div>
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
                        {user.userCards && user.userCards.length > 0 ? (
                          user.userCards.map((c, idx) => {
                            const cardName = c.cardData?.name || '이름 없음';
                            const cStatus = c.paymentStatus || 'none';
                            return (
                              <div key={c._id || idx} className="card-payment-status-row" style={{ paddingBottom: '6px', textAlign: 'left', borderBottom: idx < user.userCards.length - 1 ? '1px solid #e2e8f0' : 'none', marginBottom: idx < user.userCards.length - 1 ? '6px' : '0' }}>
                                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#1e293b', marginBottom: '6px' }}>
                                  📇 {cardName}
                                </div>
                                {cStatus === 'confirmed' ? (
                                  <span className="payment-confirmed" style={{ fontSize: '0.9rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title={`확인일: ${c.paymentDate ? c.paymentDate.split('T')[0] : '-'}`}>
                                    <CheckCircle2 size={16} color="#10b981" /> 완료
                                    <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>({c.paymentDate ? c.paymentDate.split('T')[0] : ''})</span>
                                  </span>
                                ) : cStatus === 'pending' ? (
                                  <div className="payment-pending-container" style={{ padding: '10px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7', marginTop: '6px' }}>
                                    <span className="payment-pending pulse-badge" style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} title={`신청일: ${c.paymentRequestDate ? c.paymentRequestDate.split('T')[0] : '-'}`}>
                                      <Clock size={15} color="#d97706" /> 대기중
                                    </span>
                                    <div className="pending-sub-details" style={{ fontSize: '0.92rem', marginTop: '8px', lineHeight: '1.4', color: '#1e293b' }}>
                                      <div>수단: <strong>{c.paymentMethod || '무통장 입금'}</strong></div>
                                      <div>입금자명: <strong>{c.depositorName}</strong></div>
                                      <div>예정금액: <strong>{c.paymentAmount?.toLocaleString()}원</strong></div>
                                      <div style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.88rem', marginTop: '6px' }}>
                                        {products.find(p => p.id === c.requestedGrade)?.name || c.requestedGrade} ({c.requestedDuration}개월)
                                      </div>
                                    </div>
                                    <div className="pending-action-quick-btns" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                      <button
                                        className="btn-quick-approve"
                                        onClick={() => handleApproveClick(c)}
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
                                        onClick={() => handleRejectPayment(c._id, `${user.name} - ${cardName}`)}
                                        title="신청 반려"
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
                            );
                          })
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>명함 없음</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {user.userCards && user.userCards.length > 0 ? (
                          user.userCards.map((c, idx) => {
                            const expiryStr = c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '평생';
                            return (
                              <div key={c._id || idx} className="date-cell" style={{ fontSize: '1.02rem', paddingBottom: '6px', minHeight: '18px', fontWeight: '600', borderBottom: idx < user.userCards.length - 1 ? '1px solid #e2e8f0' : 'none', marginBottom: idx < user.userCards.length - 1 ? '6px' : '0' }}>
                                {expiryStr}
                              </div>
                            );
                          })
                        ) : (
                          <div className="date-cell" style={{ fontSize: '1.02rem' }}>—</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {user.userCards && user.userCards.length > 0 ? (
                          user.userCards.map((c, idx) => {
                            const prod = products.find(p => p.id === c.grade);
                            const gradeName = prod?.name || c.grade || '일반형';
                            const priceStr = prod?.price !== undefined ? ` (${prod.price.toLocaleString()}원)` : '';
                            return (
                              <div key={c._id || idx} className="grade-badge-container" style={{ paddingBottom: '6px', display: 'flex', alignItems: 'center', borderBottom: idx < user.userCards.length - 1 ? '1px solid #e2e8f0' : 'none', marginBottom: idx < user.userCards.length - 1 ? '6px' : '0' }}>
                                <span className={`grade-badge ${c.grade || 'general'}`} style={{ fontSize: '0.92rem', padding: '4px 12px', fontWeight: '800' }}>
                                  {gradeName}{priceStr}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="grade-badge-container">
                            <span className="grade-badge general" style={{ fontSize: '0.92rem', padding: '4px 12px', fontWeight: '800' }}>일반형</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="btn-qr-direct" onClick={() => openPublishModal(user)} style={{ padding: '8px 12px' }}>
                        <Download size={18} />
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {user.userCards && user.userCards.length > 0 ? (
                          user.userCards.map((c, idx) => {
                            const cstatus = c.cardData?.status || 'draft';
                            return (
                              <div key={c._id || idx} className={`status-pill ${cstatus}`} style={{ fontSize: '0.92rem', padding: '4px 12px', paddingBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800', borderBottom: idx < user.userCards.length - 1 ? '1px solid #e2e8f0' : 'none', marginBottom: idx < user.userCards.length - 1 ? '6px' : '0' }}>
                                {cstatus === 'published' ? <CheckCircle2 size={15} /> : cstatus === 'pending' ? <Clock size={15} /> : <X size={15} />}
                                {cstatus === 'published' ? '발행완료' : cstatus === 'pending' ? '발행대기' : '미작성'}
                              </div>
                            );
                          })
                        ) : (
                          <div className="status-pill draft" style={{ fontSize: '0.92rem', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                            <X size={15} /> 미작성
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {user.userCards && user.userCards.length > 0 ? (
                          user.userCards.map((c, idx) => (
                            <div key={c._id || idx} style={{ display: 'flex', gap: '8px', paddingBottom: '6px', borderBottom: idx < user.userCards.length - 1 ? '1px solid #e2e8f0' : 'none', marginBottom: idx < user.userCards.length - 1 ? '6px' : '0' }}>
                              <button className="btn-icon" onClick={() => handleEditCard(c._id)} title="명함 내용 수정" style={{ width: '36px', height: '36px' }}><Edit size={18} /></button>
                              <button className="btn-icon" onClick={() => handleEditUser(user)} title="계정 설정" style={{ width: '36px', height: '36px' }}><Settings size={18} /></button>
                              {isSuperAdmin && (
                                <button className="btn-icon danger" onClick={() => deleteUser(user.id, user.name)} title="회원 삭제" style={{ width: '36px', height: '36px' }}><Trash2 size={18} /></button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn-icon" onClick={() => handleEditUser(user)} title="계정 설정" style={{ width: '36px', height: '36px' }}><Settings size={18} /></button>
                            {isSuperAdmin && (
                              <button className="btn-icon danger" onClick={() => deleteUser(user.id, user.name)} title="회원 삭제" style={{ width: '36px', height: '36px' }}><Trash2 size={18} /></button>
                            )}
                          </div>
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

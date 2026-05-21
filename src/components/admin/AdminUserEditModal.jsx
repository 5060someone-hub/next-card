import React from 'react';
import { X } from 'lucide-react';

const AdminUserEditModal = ({ editingUser, setEditingUser, editForm, setEditForm, products, saveUserEdit }) => {
  if (!editingUser) return null;

  return (
    <div className="modal-overlay" onClick={() => setEditingUser(null)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>회원 정보 수정</h2>
          <button onClick={() => setEditingUser(null)}><X size={20} /></button>
        </div>
        <form onSubmit={saveUserEdit}>
          <div className="input-group">
            <label>이름</label>
            <input 
              type="text" 
              value={editForm.name} 
              onChange={e => setEditForm({...editForm, name: e.target.value})} 
            />
          </div>
          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>이메일</label>
              <input 
                type="email" 
                value={editForm.email} 
                onChange={e => setEditForm({...editForm, email: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>계정 권한 (역할)</label>
              <select 
                value={editForm.role || 'user'} 
                onChange={e => setEditForm({...editForm, role: e.target.value})} 
              >
                <option value="user">일반 회원</option>
                <option value="admin">서브 운영자</option>
              </select>
            </div>
          </div>
          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>휴대전화</label>
              <input 
                type="tel" 
                value={editForm.phone} 
                onChange={e => setEditForm({...editForm, phone: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>등급</label>
              <select 
                value={editForm.grade} 
                onChange={e => setEditForm({...editForm, grade: e.target.value})}
              >
                {products && products.length > 0 ? (
                  products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                ) : (
                  <>
                    <option value="general">일반형</option>
                    <option value="premium_nfc">프리미엄</option>
                    <option value="corporate">기업전용</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>가입일</label>
              <input 
                type="text" 
                value={editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString() : '-'}
                disabled 
                style={{ background: '#f8fafc', color: '#64748b' }}
              />
            </div>
            <div className="input-group">
              <label>구독 만료일</label>
              <input 
                type="date" 
                value={editForm.expiryDate || ''} 
                onChange={e => setEditForm({...editForm, expiryDate: e.target.value})} 
              />
            </div>
          </div>
          <div className="input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>입금 상태</label>
              <select 
                value={editForm.paymentStatus} 
                onChange={e => setEditForm({...editForm, paymentStatus: e.target.value})} 
              >
                <option value="pending">입금 대기</option>
                <option value="confirmed">입금 확인완료</option>
              </select>
            </div>
            <div className="input-group">
              <label>입금 확인일</label>
              <input 
                type="date" 
                value={editForm.paymentDate || ''} 
                onChange={e => setEditForm({...editForm, paymentDate: e.target.value})} 
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setEditingUser(null)}>취소</button>
            <button type="submit" className="btn-primary">수정완료</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUserEditModal;

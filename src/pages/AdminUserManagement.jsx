import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Search, Shield, ShieldAlert, User, Mail, RefreshCw, X, Phone } from 'lucide-react';
import './AdminDashboard.css'; // 기본 대시보드 스타일 재사용

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSync, setLastSync] = useState(null);
  
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // 마스터 계정은 역할이 없어도 통과 가능하게 보완
    if (auth.role !== 'admin' && auth.email !== 'vikitour.boss@gmail.com') {
      alert('관리자 권한이 없습니다.');
      navigate('/dashboard');
      return;
    }
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = currentRole === 'admin' 
      ? '이 사용자의 운영자 권한을 회수하시겠습니까?' 
      : '이 사용자에게 운영자 권한을 부여하시겠습니까?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/user/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert('권한이 성공적으로 변경되었습니다.');
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message || '권한 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Toggle role error:', error);
      alert('서버 통신 오류가 발생했습니다.');
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term);
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>운영자 및 회원 관리</h1>
            <p>전체 회원 목록을 관리하고 운영자 권한을 부여합니다.</p>
          </div>
          <div className="header-info">
            <button className={`btn-refresh ${loading ? 'spinning' : ''}`} onClick={fetchUsers} disabled={loading}>
              <RefreshCw size={18} />
              {loading ? '로딩중...' : '새로고침'}
            </button>
          </div>
        </header>

        <div className="filter-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="이름 또는 이메일로 검색..." 
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
                <th>사용자 정보</th>
                <th>이메일 / 휴대전화</th>
                <th>가입일</th>
                <th>현재 등급</th>
                <th>관리 액션</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr><td colSpan="5" className="empty-row">회원 정보를 불러오는 중...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="empty-row">검색 결과가 없습니다.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar-mini">
                          {user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                        </div>
                        <span className="user-name-text">{user.name}</span>
                      </div>
                    </td>
                    <td><div className="email-cell"><Mail size={14} /> {user.email}</div></td>
                    <td>
                      <div className="contact-cell">
                        <div className="email-text"><Mail size={12} /> {user.email}</div>
                        <div className="phone-text"><Phone size={12} /> {user.phone || '번호 없음'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '운영자' : '일반 회원'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn-role-toggle ${user.role}`}
                        onClick={() => toggleRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? '권한 회수' : '운영자 임명'}
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

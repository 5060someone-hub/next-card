import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Lock, Unlock, Plus, Save, Smartphone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './AdminDashboard.css';

const B2BDashboard = () => {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Company Form State
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [address, setAddress] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert('파일 크기는 200KB 이하여야 합니다.');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('JPG, PNG 파일만 업로드 가능합니다.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');
  const [newEmpPos, setNewEmpPos] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
      if (!auth.isLoggedIn) {
        navigate('/login');
        return;
      }
      const userId = auth.id;

      // 1. Get Company Info
      const compRes = await fetch(`${API_URL}/api/b2b/company?userId=${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (compRes.ok) {
        const compData = await compRes.json();
        setCompany(compData);
        setCompanyName(compData.companyName);
        setLogoUrl(compData.logoUrl);
        setThemeColor(compData.themeColor);
        setAddress(compData.address);
      }

      // 2. Get Employees List
      const empRes = await fetch(`${API_URL}/api/b2b/employees?userId=${userId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
      const userId = auth.id;
      const res = await fetch(`${API_URL}/api/b2b/company/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, companyName, logoUrl, themeColor, address })
      });
      const data = await res.json();
      if (res.ok) {
        alert('회사 설정이 저장되었습니다.');
        fetchData();
      } else {
        alert(data.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      alert('오류: ' + err.message);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmpName || !newEmpEmail) {
      return alert('이름과 이메일을 입력해주세요.');
    }
    try {
      const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
      const userId = auth.id;
      const res = await fetch(`${API_URL}/api/b2b/employee/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          employees: [{
            name: newEmpName,
            email: newEmpEmail,
            phone: newEmpPhone,
            department: newEmpDept,
            position: newEmpPos
          }]
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('직원이 생성되었습니다. 기본 비밀번호는 1234 입니다.');
        setNewEmpName(''); setNewEmpEmail(''); setNewEmpPhone(''); setNewEmpDept(''); setNewEmpPos('');
        fetchData();
      } else {
        alert(data.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      alert('오류: ' + err.message);
    }
  };

  const handleRevoke = async (cardId, currentStatus) => {
    if (!confirm(`해당 명함을 ${currentStatus ? '활성화' : '정지(무효화)'} 하시겠습니까?`)) return;
    try {
      const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
      const userId = auth.id;
      const res = await fetch(`${API_URL}/api/b2b/employee/revoke/${cardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      alert('오류 발생: ' + err.message);
    }
  };

  const handleAssignNfc = async (empCardId, empName) => {
    const serial = window.prompt(`${empName}님의 명함에 할당할 NFC 카드 뒷면의 일련번호를 입력하세요 (예: 001):`);
    if (!serial) return;

    try {
      const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
      const res = await fetch(`${API_URL}/api/b2b/nfc/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyUserId: auth.id,
          employeeCardId: empCardId,
          serialNumber: serial
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${empName}님에게 NFC 실물 카드(No. ${serial})가 성공적으로 매핑되었습니다!\n이제 카드를 태그하면 이 명함으로 연결됩니다.`);
      } else {
        alert('할당 실패: ' + data.message);
      }
    } catch (err) {
      alert('오류 발생: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="admin-title">B2B 기업 관리 대시보드</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
          {/* Company Setup Section */}
          <div className="admin-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={20} /> 회사 템플릿 마스터 설정
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              여기서 설정한 정보(로고, 색상 등)는 모든 임직원 명함에 강제로 적용되며, 직원이 임의로 수정할 수 없습니다.
            </p>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.2rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>회사명</label>
              <input type="text" className="admin-input" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.2rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>회사 로고 업로드</label>
              <input type="file" id="b2b-logo-upload" hidden onChange={handleImageChange} accept="image/jpeg, image/png" />
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {logoUrl && (
                  <div style={{ width: '40px', height: '40px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                )}
                <button type="button" onClick={() => document.getElementById('b2b-logo-upload').click()} style={{ padding: '0.5rem 1rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                  이미지 찾기 (PC)
                </button>
                {logoUrl && (
                  <button type="button" onClick={() => setLogoUrl('')} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#ef4444', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>삭제</button>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>200KB 이하의 JPG, PNG 파일만 가능합니다.</p>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.2rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>대표 주소</label>
              <input type="text" className="admin-input" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.2rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>브랜드 색상 (테마)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="color" style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }} value={themeColor} onChange={e => setThemeColor(e.target.value)} />
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{themeColor}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handleSaveCompany} style={{ width: '100%', marginTop: '1rem' }}>
              <Save size={16} /> 설정 저장
            </button>
          </div>

          {/* Employees Section */}
          <div className="admin-card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} /> 임직원 명함 발급 및 관리
            </h2>

            {/* Add Employee Form */}
            {company ? (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>새 임직원 발급</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" className="admin-input" placeholder="이름 (필수)" value={newEmpName} onChange={e => setNewEmpName(e.target.value)} />
                  <input type="email" className="admin-input" placeholder="이메일 (필수/로그인용)" value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} />
                  <input type="text" className="admin-input" placeholder="연락처" value={newEmpPhone} onChange={e => setNewEmpPhone(e.target.value)} />
                  <input type="text" className="admin-input" placeholder="부서명" value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)} />
                  <input type="text" className="admin-input" placeholder="직급/직책" value={newEmpPos} onChange={e => setNewEmpPos(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={handleAddEmployee} style={{ width: '100%' }}>
                  <Plus size={16} /> 명함 즉시 발급하기
                </button>
              </div>
            ) : (
              <div style={{ color: '#ef4444', marginBottom: '2rem' }}>먼저 왼쪽에서 회사 템플릿을 저장해 주세요.</div>
            )}

            {/* Employee List */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>가입일</th>
                    <th>상태</th>
                    <th>NFC 태그</th>
                    <th>명함 링크</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>등록된 임직원이 없습니다.</td></tr>
                  ) : employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                      <td>
                        {emp.isRevoked ? (
                          <span className="badge badge-error">정지됨</span>
                        ) : (
                          <span className="badge badge-success">활성</span>
                        )}
                      </td>
                      <td>
                        {emp.cardId && !emp.isRevoked && (
                          <button 
                            type="button" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleAssignNfc(emp.cardId, emp.name)}
                          >
                            <Smartphone size={12} /> 카드 매핑
                          </button>
                        )}
                      </td>
                      <td>
                        {emp.customCardUrl ? (
                          <a href={`/v/${emp.customCardUrl}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>링크 열기</a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>미설정</span>
                        )}
                      </td>
                      <td>
                        {emp.cardId && (
                          <button 
                            className={`btn-icon ${emp.isRevoked ? 'success' : 'danger'}`}
                            onClick={() => handleRevoke(emp.cardId, emp.isRevoked)}
                            title={emp.isRevoked ? '명함 복구' : '명함 정지 (퇴사자)'}
                          >
                            {emp.isRevoked ? <Unlock size={16} color="#10b981" /> : <Lock size={16} color="#ef4444" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default B2BDashboard;

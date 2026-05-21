import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Users, Search, Download, Plus, Edit2, Trash2, 
  Tag, Calendar, Phone, Mail, Building, Briefcase, ChevronRight, AlertCircle 
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import './NetworkLog.css';

const NetworkLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userGrade, setUserGrade] = useState('general'); // 기본값 일반형
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', company: '', position: '', phone: '', email: '', tags: '', memo: ''
  });

  const auth = JSON.parse(localStorage.getItem('nextcard_auth'));

  useEffect(() => {
    if (!auth) {
      navigate('/login');
      return;
    }
    fetchUserGrade();
    fetchLogs();
  }, []);

  const fetchUserGrade = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cards/${auth.id}`);
      if (res.ok) {
        const cards = await res.json();
        if (cards && cards.length > 0) {
          setUserGrade(cards[0].grade || 'general');
        }
      }
    } catch (e) {
      console.error('Failed to fetch user grade:', e);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs/${auth.id}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setLoading(false);
    }
  };

  // 응용형 이상 여부 확인 (event, advanced, premium, corporate 등)
  const canUseAdvancedFeatures = userGrade !== 'general';

  const handleExportExcel = () => {
    if (!canUseAdvancedFeatures) {
      alert('엑셀 다운로드 기능은 응용형(Advanced) 등급 이상부터 사용 가능합니다.');
      return;
    }

    if (logs.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    const exportData = logs.map(log => ({
      '이름': log.name,
      '회사/소속': log.company,
      '직급/직책': log.position,
      '연락처': log.phone,
      '이메일': log.email,
      '태그': log.tags.join(', '),
      '메모': log.memo,
      '만난 날짜': new Date(log.metAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '인맥로그');
    XLSX.writeFile(wb, `NextCard_NetworkLog_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleOpenModal = (log = null) => {
    if (log) {
      setEditingId(log._id);
      setFormData({
        name: log.name,
        company: log.company,
        position: log.position,
        phone: log.phone,
        email: log.email,
        tags: log.tags.join(', '), // 태그는 쉼표로 구분된 문자열로 보여줌
        memo: log.memo
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', company: '', position: '', phone: '', email: '', tags: '', memo: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 인맥 기록을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 일반형일 경우 태그 무시
    const submitTags = canUseAdvancedFeatures 
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t) 
      : [];

    const payload = {
      ...formData,
      tags: submitTags,
      userId: auth.id,
      metAt: new Date() // 신규 생성 시 현재 날짜 사용
    };

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/logs/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/logs`;
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const filteredLogs = logs.filter(l => 
    l.name.includes(searchTerm) || 
    l.company.includes(searchTerm) ||
    l.tags.some(t => t.includes(searchTerm))
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="network-content">
        <header className="network-header">
          <div className="header-title">
            <h1><Users size={28} color="#2563eb" /> 인맥 로그</h1>
            <p>내 명함을 통해 연결된 소중한 인연들을 체계적으로 관리하세요.</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="이름, 회사, 태그 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className={`btn-export ${!canUseAdvancedFeatures ? 'locked' : ''}`} 
              onClick={handleExportExcel}
              title={!canUseAdvancedFeatures ? "응용형 등급 이상부터 사용 가능합니다." : "엑셀 다운로드"}
            >
              <Download size={18} /> 
              {canUseAdvancedFeatures ? '엑셀 저장' : '엑셀 저장 (PRO)'}
            </button>
            <button className="btn-add-log" onClick={() => handleOpenModal()}>
              <Plus size={18} /> 인맥 추가
            </button>
          </div>
        </header>

        <div className="network-stats-banner">
          <div className="stat-item">
            <span className="stat-label">총 연락처</span>
            <span className="stat-value">{logs.length}명</span>
          </div>
          {!canUseAdvancedFeatures && (
            <div className="upgrade-notice">
              <AlertCircle size={16} />
              <span>현재 <strong>일반형</strong> 등급입니다. 응용형 이상으로 업그레이드하고 태그 기능과 엑셀 다운로드를 활용해보세요!</span>
            </div>
          )}
        </div>

        <div className="logs-container">
          {loading ? (
            <div className="loading-state">데이터를 불러오는 중입니다...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📇</div>
              <h3>등록된 인맥이 없습니다</h3>
              <p>아직 추가된 연락처가 없습니다. 수동으로 추가하거나 상대방이 연락처를 남기면 이곳에 표시됩니다.</p>
            </div>
          ) : (
            <div className="logs-grid">
              {filteredLogs.map(log => (
                <div key={log._id} className="log-card">
                  <div className="log-card-header">
                    <div className="log-user-info">
                      <div className="log-avatar">{log.name.charAt(0)}</div>
                      <div>
                        <h4>{log.name}</h4>
                        {log.position && <span className="log-position">{log.position}</span>}
                      </div>
                    </div>
                    <div className="log-actions">
                      <button onClick={() => handleOpenModal(log)}><Edit2 size={16} /></button>
                      <button className="delete" onClick={() => handleDelete(log._id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="log-details">
                    {log.company && (
                      <div className="detail-row">
                        <Building size={14} /> <span>{log.company}</span>
                      </div>
                    )}
                    {log.phone && (
                      <div className="detail-row">
                        <Phone size={14} /> <span>{log.phone}</span>
                      </div>
                    )}
                    {log.email && (
                      <div className="detail-row">
                        <Mail size={14} /> <span>{log.email}</span>
                      </div>
                    )}
                  </div>

                  {log.tags && log.tags.length > 0 && (
                    <div className="log-tags">
                      {log.tags.map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="log-footer">
                    <Calendar size={12} />
                    <span>만난 날: {new Date(log.metAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content log-modal">
              <div className="modal-header">
                <h2>{editingId ? '인맥 정보 수정' : '새 인맥 추가'}</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="log-form">
                <div className="form-group">
                  <label>이름 *</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>회사/소속</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>직급/직책</label>
                    <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>연락처</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>이메일</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    태그 (콤마로 구분) 
                    {!canUseAdvancedFeatures && <span className="pro-badge">PRO</span>}
                  </label>
                  <div className="tag-input-wrapper">
                    <Tag size={16} color={canUseAdvancedFeatures ? "#64748b" : "#cbd5e1"} />
                    <input 
                      type="text" 
                      placeholder={canUseAdvancedFeatures ? "잠재고객, 파트너, A프로젝트..." : "응용형 이상 등급에서 사용 가능합니다."}
                      value={formData.tags} 
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      disabled={!canUseAdvancedFeatures}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>메모</label>
                  <textarea 
                    rows="3" 
                    placeholder="미팅 후기나 기억할 만한 점을 적어보세요."
                    value={formData.memo} 
                    onChange={e => setFormData({...formData, memo: e.target.value})} 
                  ></textarea>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
                  <button type="submit" className="btn-save">저장하기</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NetworkLog;

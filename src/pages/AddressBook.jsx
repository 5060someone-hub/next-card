import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Trash2, Edit3, Save, Map as MapIcon, List, Loader2 } from 'lucide-react';
import { Map, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import Sidebar from '../components/Sidebar';
import './AdminDashboard.css'; // 사이드바 레이아웃 공유용

const AddressBook = () => {
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editMemo, setEditMemo] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  const [mapLoading, mapError] = useKakaoLoader({
    appkey: '21003efec377258810eea15b29525fa0',
    libraries: ['services', 'clusterer']
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
    if (!auth.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/connections/${auth.id}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('명함첩에서 이 명함을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`${API_URL}/api/connections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConnections(connections.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMemo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: editMemo })
      });
      if (res.ok) {
        setConnections(connections.map(c => c._id === id ? { ...c, memo: editMemo } : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = connections.filter(c => {
    const card = c.savedCardId;
    if (!card || !card.cardData) return false;
    const nameMatch = card.cardData.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const companyMatch = card.cardData.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const memoMatch = c.memo?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || companyMatch || memoMatch;
  });

  if (loading) return <div style={{ padding: '2rem' }}>로딩 중...</div>;

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="#3b82f6" /> 내 명함첩
          </h1>

          {/* 검색 바 */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="이름, 회사, 또는 메모로 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: viewMode === 'list' ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: viewMode === 'list' ? '#eff6ff' : '#fff', color: viewMode === 'list' ? '#1d4ed8' : '#64748b', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <List size={18} /> 목록 보기
            </button>
            <button 
              onClick={() => setViewMode('map')}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: viewMode === 'map' ? '2px solid #3b82f6' : '1px solid #e2e8f0', background: viewMode === 'map' ? '#eff6ff' : '#fff', color: viewMode === 'map' ? '#1d4ed8' : '#64748b', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <MapIcon size={18} /> 히스토리 맵
            </button>
          </div>

          {connections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '0.5rem' }}>저장된 명함이 없습니다</h3>
              <p style={{ color: '#94a3b8' }}>다른 사람의 명함에서 '내 명함첩에 담기'를 눌러 명함을 수집해 보세요.</p>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(conn => {
                const card = conn.savedCardId;
                if (!card || !card.cardData) return null;
                const profileUrl = card.cardData.profileUrl;
                const name = card.cardData.name || '이름 없음';
                const company = card.cardData.company || '';
                const jobTitle = card.cardData.jobTitle || '';
                
                return (
                  <div key={conn._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative' }}>
                    <button 
                      onClick={() => handleDelete(conn._id)}
                      style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      {profileUrl ? (
                        <img src={profileUrl} alt="profile" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 'bold' }}>
                          {name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{name}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>{company} {jobTitle && `· ${jobTitle}`}</p>
                      </div>
                    </div>

                    <a href={card.customCardUrl ? `/v/${card.customCardUrl}` : `/v/${card._id}`} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '0.5rem', background: '#f1f5f9', color: '#3b82f6', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                      명함 자세히 보기
                    </a>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                      {editingId === conn._id ? (
                        <div>
                          <textarea 
                            value={editMemo} 
                            onChange={(e) => setEditMemo(e.target.value)}
                            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', minHeight: '60px', marginBottom: '8px' }}
                            placeholder="명함에 대한 개인 메모를 남겨보세요..."
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button onClick={() => setEditingId(null)} style={{ background: '#f1f5f9', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>취소</button>
                            <button onClick={() => handleSaveMemo(conn._id)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Save size={12} /> 저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: conn.memo ? '#475569' : '#94a3b8', whiteSpace: 'pre-wrap', flex: 1 }}>
                            {conn.memo || '저장된 메모가 없습니다.'}
                          </p>
                          <button onClick={() => { setEditingId(conn._id); setEditMemo(conn.memo || ''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                            <Edit3 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {mapLoading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={32} className="spin-icon" style={{ margin: '0 auto 1rem auto' }} />
                  <p>지도를 불러오는 중...</p>
                </div>
              ) : mapError ? (
                <div style={{ textAlign: 'center', color: '#ef4444' }}>
                  <MapIcon size={48} style={{ margin: '0 auto 1rem auto' }} />
                  <p>지도를 불러오지 못했습니다. 도메인 등록을 확인해주세요.</p>
                </div>
              ) : filtered.filter(c => c.lat && c.lng).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <MapIcon size={48} style={{ margin: '0 auto 1rem auto' }} />
                  <p>위치 정보가 저장된 명함이 없습니다.</p>
                </div>
              ) : (
                <Map
                  center={{
                    lat: filtered.find(c => c.lat && c.lng)?.lat || 37.5665,
                    lng: filtered.find(c => c.lat && c.lng)?.lng || 126.9780
                  }}
                  style={{ width: '100%', height: '100%' }}
                  level={8}
                >
                  {filtered.filter(c => c.lat && c.lng).map(conn => {
                    const card = conn.savedCardId;
                    const name = card?.cardData?.name || '이름 없음';
                    const company = card?.cardData?.company || '';
                    const date = new Date(conn.savedAt).toLocaleDateString('ko-KR');
                    return (
                      <MapMarker
                        key={conn._id}
                        position={{ lat: conn.lat, lng: conn.lng }}
                        onClick={() => setSelectedMarkerId(conn._id)}
                      >
                        {selectedMarkerId === conn._id && (
                          <div style={{ padding: '10px', minWidth: '150px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '4px' }}>{name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{company}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>만난 날: {date}</div>
                            <a href={card.customCardUrl ? `/v/${card.customCardUrl}` : `/v/${card._id}`} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '8px', fontSize: '0.8rem', color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>명함 보기 &rarr;</a>
                          </div>
                        )}
                      </MapMarker>
                    );
                  })}
                </Map>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBook;

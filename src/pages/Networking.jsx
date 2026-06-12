import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Briefcase, Search, MapPin, Building, ChevronRight, UserCircle, AlertCircle } from 'lucide-react';
import { regionData, industryData } from '../utils/categories';
import './AdminDashboard.css'; // Reusing dashboard styles for layout

export default function Networking() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    industryCategory: '',
    industrySubCategory: '',
    industryDetailCategory: '',
    regionCity: '',
    regionDistrict: '',
    search: ''
  });

  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchNetworkingCards();
  }, [filters.industryCategory, filters.industrySubCategory, filters.industryDetailCategory, filters.regionCity, filters.regionDistrict]);

  async function fetchNetworkingCards() {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters.industryCategory) queryParams.append('industryCategory', filters.industryCategory);
      if (filters.industrySubCategory) queryParams.append('industrySubCategory', filters.industrySubCategory);
      if (filters.industryDetailCategory) queryParams.append('industryDetailCategory', filters.industryDetailCategory);
      if (filters.regionCity) queryParams.append('regionCity', filters.regionCity);
      if (filters.regionDistrict) queryParams.append('regionDistrict', filters.regionDistrict);
      // Removed search from backend query to allow client-side filtering including tags

      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/networking/cards?${queryParams.toString()}`);
      if (res.ok) {
        setCards(await res.json());
      } else {
        const data = await res.json();
        setError(data.message || '네트워킹 데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNetworkingCards();
  };

  const filteredCards = cards.filter(card => {
    if (!filters.search) return true;
    const data = card.cardData || {};
    const st = filters.search.toLowerCase();
    const hasTag = data.networkingTags?.some(tag => tag.toLowerCase().includes(st));
    const hasName = data.name?.toLowerCase().includes(st);
    const hasCompany = data.company?.toLowerCase().includes(st);
    const hasJobTitle = data.jobTitle?.toLowerCase().includes(st);
    return hasTag || hasName || hasCompany || hasJobTitle;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="admin-content" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Briefcase size={28} color="#2563eb" />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>비즈니스 파트너 네트워킹</h1>
        </div>

        {/* Filter Section */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#334155' }}>파트너 찾기 조건</h3>
          <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>업종 대분류</label>
              <select 
                value={filters.industryCategory} 
                onChange={(e) => setFilters({ ...filters, industryCategory: e.target.value, industrySubCategory: '' })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">전체 업종</option>
                {Object.keys(industryData).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>업종 중분류</label>
              <select 
                value={filters.industrySubCategory} 
                onChange={(e) => setFilters({ ...filters, industrySubCategory: e.target.value, industryDetailCategory: '' })}
                disabled={!filters.industryCategory}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: !filters.industryCategory ? '#f1f5f9' : '#fff' }}
              >
                <option value="">전체 중분류</option>
                {filters.industryCategory && industryData[filters.industryCategory] && Object.keys(industryData[filters.industryCategory]).map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>업종 소분류</label>
              <select 
                value={filters.industryDetailCategory} 
                onChange={(e) => setFilters({ ...filters, industryDetailCategory: e.target.value })}
                disabled={!filters.industrySubCategory}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: !filters.industrySubCategory ? '#f1f5f9' : '#fff' }}
              >
                <option value="">전체 소분류</option>
                {filters.industrySubCategory && industryData[filters.industryCategory]?.[filters.industrySubCategory]?.map(det => <option key={det} value={det}>{det}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>지역 대분류</label>
              <select 
                value={filters.regionCity} 
                onChange={(e) => setFilters({ ...filters, regionCity: e.target.value, regionDistrict: '' })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">전국</option>
                {Object.keys(regionData).map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem', display: 'block' }}>지역 중분류</label>
              <select 
                value={filters.regionDistrict} 
                onChange={(e) => setFilters({ ...filters, regionDistrict: e.target.value })}
                disabled={!filters.regionCity}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: !filters.regionCity ? '#f1f5f9' : '#fff' }}
              >
                <option value="">전체 지역</option>
                {filters.regionCity && regionData[filters.regionCity]?.map(dist => <option key={dist} value={dist}>{dist}</option>)}
              </select>
            </div>

            <div className="input-group" style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="검색어 (이름, 직함, 회사명 등)" 
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <button type="submit" style={{ padding: '0 1.5rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} />
                검색
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>데이터를 불러오는 중입니다...</div>
        ) : error ? (
          <div style={{ padding: '1rem', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <Briefcase size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>조건에 맞는 파트너가 없습니다.</h3>
            <p style={{ margin: 0, color: '#94a3b8' }}>다른 검색 조건으로 다시 찾아보세요.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredCards.map(card => {
              const data = card.cardData || {};
              const identifier = data.customUrl || card._id;
              
              return (
                <div 
                  key={card._id} 
                  className="networking-card"
                  onClick={() => window.open(`/v/${identifier}`, '_blank')}
                  style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {data.profileUrl ? (
                        <img src={data.profileUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UserCircle size={32} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#1e293b' }}>{data.name || '이름 없음'}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{data.jobTitle || '직함 미입력'}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                      <Building size={16} color="#94a3b8" />
                      <span style={{ fontWeight: 600 }}>{data.company || '회사 미입력'}</span>
                    </div>
                    {(data.industryCategory || data.industrySubCategory || data.industryDetailCategory) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                        <Briefcase size={16} color="#94a3b8" />
                        <span>{data.industryCategory} {data.industrySubCategory ? `> ${data.industrySubCategory}` : ''} {data.industryDetailCategory ? `> ${data.industryDetailCategory}` : ''}</span>
                      </div>
                    )}
                    {(data.regionCity || data.regionDistrict) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                        <MapPin size={16} color="#94a3b8" />
                        <span>{data.regionCity} {data.regionDistrict}</span>
                      </div>
                    )}
                    {data.networkingTags && data.networkingTags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                        {data.networkingTags.map((tag, idx) => (
                          <span key={idx} style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid #e2e8f0' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600 }}>
                    명함 보기
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

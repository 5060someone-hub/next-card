import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Megaphone, Save, Link as LinkIcon, Palette, Type, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminAdManagement() {
  const [adConfig, setAdConfig] = useState({
    text: '',
    link: '',
    bgColor: '#eff6ff',
    textColor: '#2563eb'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    const isMaster = auth.role === 'admin' || 
                     auth.email === 'vikitour.boss@gmail.com' || 
                     auth.email === 'adqkorea@gmail.com' || 
                     auth.email === 'cyy3172@naver.com';

    if (!auth.isLoggedIn || !isMaster) {
      navigate('/dashboard');
      return;
    }
    fetchAdConfig();
  }, []);

  const fetchAdConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/settings/ad`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setAdConfig(data);
        }
      }
    } catch (err) {
      setError('광고 설정을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/settings/ad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adConfig)
      });
      
      if (response.ok) {
        alert('광고 설정이 성공적으로 저장되었습니다.');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 연결 오류로 저장에 실패했습니다.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>사이트 광고 관리</h1>
            <p>디지털 명함 하단에 표시될 사이트 홍보 문구와 링크를 관리합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchAdConfig}>
            <RefreshCw size={18} /> 새로고침
          </button>
        </header>

        <div className="admin-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Editor Form */}
          <section className="form-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} color="#2563eb" /> 광고 콘텐츠 편집
            </h3>
            <form onSubmit={handleSave}>
              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <Type size={14} /> 광고 문구
                </label>
                <textarea
                  value={adConfig.text}
                  onChange={(e) => setAdConfig({ ...adConfig, text: e.target.value })}
                  placeholder="예: 디지털 명함의 새로운 기준, NextCard.kr에서 무료로 시작하세요!"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <LinkIcon size={14} /> 연결 링크 (URL)
                </label>
                <input
                  type="url"
                  value={adConfig.link}
                  onChange={(e) => setAdConfig({ ...adConfig, link: e.target.value })}
                  placeholder="https://nextcard.kr"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Palette size={14} /> 배경 색상
                  </label>
                  <input
                    type="color"
                    value={adConfig.bgColor}
                    onChange={(e) => setAdConfig({ ...adConfig, bgColor: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Palette size={14} /> 텍스트 색상
                  </label>
                  <input
                    type="color"
                    value={adConfig.textColor}
                    onChange={(e) => setAdConfig({ ...adConfig, textColor: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={saving}>
                <Save size={18} /> {saving ? '저장 중...' : '광고 설정 저장하기'}
              </button>
            </form>
          </section>

          {/* Preview Section */}
          <section className="preview-section">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>미리보기</h3>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>명함 하단에 다음과 같이 표시됩니다.</p>

              <a
                href={adConfig.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: adConfig.bgColor,
                  color: adConfig.textColor,
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s'
                }}
              >
                {adConfig.text || '광고 문구를 입력해 주세요.'}
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

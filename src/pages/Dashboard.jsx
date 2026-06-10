import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Eye, RefreshCw, CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

const Dashboard = () => {
  const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 안전 장치: 최대 5초 후에는 무조건 로딩 화면을 해제합니다.
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    try {
      const [profileRes, cardsRes] = await Promise.all([
        fetch(`${API_BASE}/api/user/profile/${auth.id}`),
        fetch(`${API_BASE}/api/cards/${auth.id}`)
      ]);

      let backendCards = [];
      if (cardsRes.ok) {
        backendCards = await cardsRes.json();
      }

      // Firestore에서 claim한 명함(또는 새로 생성한 명함) 가져오기
      let firestoreCards = [];
      try {
        const q = query(collection(db, 'business_cards'), where('userId', '==', auth.id));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const d = doc.data();
          firestoreCards.push({
            _id: doc.id,
            userId: d.userId,
            grade: d.productType || d.grade || 'general',
            cardData: {
              ...d.cardData,
              status: d.status || 'published'
            },
            createdAt: d.createdAt,
            isFirestore: true
          });
        });
      } catch (e) {
        console.error('Firestore fetch error:', e);
      }

      if (profileRes.ok) {
        const p = await profileRes.json();
        setProfile(p);
      }

      // 두 소스의 명함을 합침
      setCards([...backendCards, ...firestoreCards]);
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 실제 이름 (프로필 > localStorage > 기본값)
  const displayName = profile?.name || auth.name || '회원';
  // 이름 첫 글자 아바타
  const avatarChar = displayName.charAt(0);

  // 가입일
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // 활성 카드 수
  const hasCards = cards.length > 0;

  // 신규 명함 개설 핸들러
  const handleCreateNewCard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/card/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.id })
      });
      if (res.ok) {
        const newCard = await res.json();
        navigate(`/cards?id=${newCard._id}`);
      } else {
        alert('새 명함 생성 실패');
      }
    } catch (err) {
      alert('오류가 발생했습니다.');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('이 명함을 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/card/${cardId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('명함이 삭제되었습니다.');
        fetchDashboardData();
      } else {
        alert('명함 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">

        {/* ── 헤더 ── */}
        <header className="dashboard-header">
          <div>
            <h1>대시보드</h1>
          </div>
          <div className="user-profile">
            <div className="avatar">{avatarChar}</div>
            <span>{displayName}</span>
          </div>
        </header>

        {loading ? (
          <div className="dashboard-loading">
            <Loader2 size={32} className="spin-icon" />
            <p>데이터 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* ── 실제 데이터 카드 ── */}
            <section className="stats-grid">

              {/* 활성 카드 수 */}
              <div className="stat-card">
                <div className="stat-info">
                  <h3>활성 명함 수</h3>
                  <div className="stat-value">
                    <span>{cards.length}</span>
                    <span className={`stat-change ${hasCards ? 'positive' : ''}`}>
                      {hasCards ? `${cards.filter(c => c.cardData?.status === 'published').length}개 활성화` : '미작성'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 총 조회수 — 서버에 아직 집계 기능 없음 */}
              <div className="stat-card stat-card--muted">
                <div className="stat-info">
                  <h3>총 명함 조회수</h3>
                  <div className="stat-value">
                    <span className="stat-preparing">준비 중</span>
                  </div>
                  <p className="stat-note">조회수 집계 기능 업데이트 예정</p>
                </div>
              </div>

              {/* 가입일 */}
              <div className="stat-card">
                <div className="stat-info">
                  <h3>가입일</h3>
                  <div className="stat-value">
                    <span className="stat-date">{joinedDate || '—'}</span>
                  </div>
                </div>
              </div>

              {/* 구독 명함 수 */}
              <div className="stat-card">
                <div className="stat-info">
                  <h3>멤버십 명함 수</h3>
                  <div className="stat-value">
                    <span className="stat-date">
                      {cards.filter(c => c.grade && c.grade !== 'general').length} / {cards.length}
                    </span>
                  </div>
                  <p className="stat-note">프리미엄 이상 등급 적용 개수</p>
                </div>
              </div>

            </section>

            {/* ── 내 디지털 명함 섹션 ── */}
            <section className="dashboard-main-grid">
              <div className="dashboard-card">
                <h3>내 디지털 명함 목록</h3>

                {hasCards ? (
                  <div className="cards-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                    {cards.map(c => {
                      const cardName = c.cardData?.name || c.cardData?.nameEng || displayName;
                      const cardTitle = c.cardData?.jobTitle || c.cardData?.company || '명함 정보 없음';
                      const cardStatus = c.cardData?.status || 'draft';
                      const themeColor = c.cardData?.themeColor || '#db2777';
                      const cardGrade = c.grade || 'general';
                      const expiryDateStr = c.expiryDate
                        ? new Date(c.expiryDate).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        : null;

                      return (
                        <div key={c._id} className="mini-card-item animate-in" style={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                          <div className="mini-card active" onClick={() => navigate(`/cards?id=${c._id}`)} style={{ cursor: 'pointer', borderBottom: '1px dashed #e2e8f0', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                            <div className="mini-card-preview"
                              style={{ background: `linear-gradient(135deg, ${themeColor}, #1e293b)` }}
                            />
                            <div className="mini-card-info">
                              <h4>{cardName}</h4>
                              <p>{cardTitle}</p>
                              <div className="mini-card-meta" style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span className={`grade-pill grade-${cardGrade}`} style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px' }}>
                                  {cardGrade === 'corporate' ? '기업전용' : cardGrade === 'premium_nfc' ? '프리미엄' : cardGrade === 'prod_1778899977850' ? '이벤트형' : cardGrade === 'prod_1778900193128' ? '응용형' : '일반'}
                                </span>
                                {expiryDateStr && (
                                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    만료: {expiryDateStr}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`status-badge ${cardStatus === 'published' ? 'badge-active' : 'badge-pending'}`}>
                              {cardStatus === 'published' ? '발행완료' : '발행대기'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <button onClick={() => navigate(`/cards?id=${c._id}`)} style={{ flex: 1, padding: '6px 0', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                              명함 편집
                            </button>
                            <button onClick={() => navigate(`/settings?tab=subscription&cardId=${c._id}`)} style={{ flex: 1, padding: '6px 0', border: '1px solid #2563eb', background: '#2563eb', color: '#ffffff', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                              구독/요금제
                            </button>
                            <button onClick={() => handleDeleteCard(c._id)} style={{ padding: '6px 10px', border: '1px solid #f87171', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }} title="명함 삭제">
                              삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-card-notice">
                    <AlertCircle size={32} color="#94a3b8" />
                    <p>아직 명함이 없습니다</p>
                    <span>새 명함 만들기 버튼을 눌러 명함을 시작해보세요.</span>
                  </div>
                )}

                <button className="btn-add-card" onClick={handleCreateNewCard} style={{ marginTop: '16px' }}>
                  + 새 명함 만들기
                </button>
              </div>

              {/* 계정 요약 */}
              <div className="dashboard-card">
                <h3>계정 요약</h3>
                <div className="account-summary">
                  <div className="summary-row">
                    <span>이름</span>
                    <strong>{displayName}</strong>
                  </div>
                  <div className="summary-row">
                    <span>이메일</span>
                    <strong>{profile?.email || auth.email || '—'}</strong>
                  </div>
                  <div className="summary-row">
                    <span>총 생성 명함 수</span>
                    <strong>{cards.length}개</strong>
                  </div>
                </div>
                <button className="btn-settings" onClick={() => navigate('/settings')}>
                  설정 바로가기 →
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

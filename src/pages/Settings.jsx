import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  CheckCircle2, 
  Save,
  ChevronRight,
  Calendar,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Clock
} from 'lucide-react';
import './Settings.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') || 'http://127.0.0.1:5000';

// 등급 한국어 변환
const GRADE_LABELS = {
  general:   { label: '기본형 (Basic-A)',   desc: '기본 명함 기능을 사용 중입니다.',            color: 'general' },
  premium_nfc:   { label: '프리미엄 (Premium)', desc: '로고·디자인 테마 등 고급 기능을 사용 중입니다.', color: 'premium' },
  premium:   { label: '프리미엄 (Premium)', desc: '로고·디자인 테마 등 고급 기능을 사용 중입니다.', color: 'premium' },
  corporate: { label: '기업용 (커스텀 디자인)', desc: '모든 프리미엄 기능을 제한 없이 사용 중입니다.', color: 'corporate' },
  prod_1778899977850: { label: '체험용(2개월무료)', desc: '체험용 2개월 무료 요금제를 적용 중입니다.', color: 'event' },
  prod_1778900193128: { label: '표준형(Standard-A)', desc: '표준형 혜택을 이용 중입니다.', color: 'md' },
  prod_1779351721158: { label: '기본형(Basic-B)', desc: '기본형 혜택을 이용 중입니다.', color: 'general' },
  prod_1779363055944: { label: '표준형(Standard-B)', desc: '표준형 혜택을 이용 중입니다.', color: 'md' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const toInputDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const Settings = () => {
  const auth = JSON.parse(localStorage.getItem('nextcard_auth') || '{}');
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('account');

  // 계정 정보
  const [settings, setSettings] = useState({
    name: auth.name || '',
    email: auth.email || '',
    phone: auth.phone || '',
    notifications: { cardView: true, marketing: false },
    privacy: { publicCard: true, showViews: true },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 구독 & 다중 명함 정보
  const [userCards, setUserCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [products, setProducts] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // 결제 수단 및 신청 상태 관리
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [requestedGrade, setRequestedGrade] = useState('premium_nfc');
  const [requestedDuration, setRequestedDuration] = useState(12); // 6 or 12

  // 요금제 락 처리 (체험용일 경우 2개월 고정)
  useEffect(() => {
    if (requestedGrade === 'prod_1778899977850' || requestedGrade === 'event') {
      setRequestedDuration(2);
    }
  }, [requestedGrade]);

  // 구독 탭 클릭 시 DB에서 카드 및 요금제 상품 로드
  useEffect(() => {
    if (activeTab === 'subscription' && auth.id) {
      loadSubscriptionData();
    }
  }, [activeTab]);

  // 컴포넌트 마운트 시 최신 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.id) return;
      try {
        const res = await fetch(`${API_BASE}/api/user/profile/${auth.id}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || ''
          }));
          
          // 로컬스토리지 정보 동기화
          const updatedAuth = {
            ...auth,
            name: data.name,
            phone: data.phone
          };
          localStorage.setItem('nextcard_auth', JSON.stringify(updatedAuth));
        }
      } catch (err) {
        console.error('사용자 프로필 로드 실패:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const loadSubscriptionData = async () => {
    setSubLoading(true);
    try {
      const [cardsRes, productsRes, payRes] = await Promise.all([
        fetch(`${API_BASE}/api/cards/${auth.id}`),
        fetch(`${API_BASE}/api/products`),
        fetch(`${API_BASE}/api/settings/payment-methods`)
      ]);

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setUserCards(cardsData);
        if (cardsData.length > 0) {
          const queryParams = new URLSearchParams(window.location.search);
          const urlCardId = queryParams.get('cardId');
          const exists = cardsData.some(c => c._id === urlCardId);
          setSelectedCardId(exists ? urlCardId : cardsData[0]._id);
        }
      }
      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }
      if (payRes.ok) {
        const pays = await payRes.json();
        setPaymentMethods(pays);
        if (pays.length > 0) {
          setSelectedPaymentMethodId(pays[0].id);
        }
      }
    } catch (err) {
      console.error('구독 관련 로딩 실패:', err);
    } finally {
      setSubLoading(false);
    }
  };

  // 입금 금액 구하는 함수 (Live DB 기준 맵핑)
  const getAmount = (grade, duration) => {
    if (grade === 'prod_1778899977850' || grade === 'event') return 0; // 체험용 등급은 무조건 0원
    
    const prod = products.find(p => p.id === grade);
    if (!prod) return 0;
    
    if (prod.price && typeof prod.price === 'object') {
      if (duration === 12) return prod.price.annual || 0;
      if (duration === 3) return prod.price.threeMonths || 0;
      if (duration === 2) return prod.price.twoMonths || 0;
    } else if (typeof prod.price === 'number') {
      // 마이그레이션 전 레거시 데이터 대비 (안전장치)
      if (duration === 12) return prod.price;
      if (duration === 3) return Math.round(prod.price * 0.3);
      if (duration === 2) return Math.round(prod.price * 0.2);
    }
    
    return 0;
  };

  // 결제 신청 등록 (명함 ID 기준으로 신청)
  const handleRequestPayment = async () => {
    if (!selectedCardId) {
      alert('구독을 신청할 명함을 선택해 주세요.');
      return;
    }
    if (!depositorName.trim()) {
      alert('실제 입금자(결제자)명을 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const amount = getAmount(requestedGrade, requestedDuration);
      const paymentMethodObj = paymentMethods.find(m => m.id === selectedPaymentMethodId);
      
      const res = await fetch(`${API_BASE}/api/payment/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: selectedCardId,
          depositorName,
          paymentAmount: amount,
          requestedGrade,
          requestedDuration,
          paymentMethod: paymentMethodObj ? paymentMethodObj.name : '무통장 입금'
        }),
      });
      if (!res.ok) throw new Error('신청 실패');
      setSaveMsg('✅ 지정 명함에 대한 결제 신청이 완료되었습니다!');
      setDepositorName('');
      await loadSubscriptionData();
    } catch (err) {
      setSaveMsg('❌ 신청 실패. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleSave = async () => {
    if (!auth.id) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    setLoading(true);
    setSaveMsg('');

    try {
      if (activeTab === 'account') {
        const res = await fetch(`${API_BASE}/api/user/${auth.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: settings.name,
            phone: settings.phone
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || '저장 실패');
        }

        const data = await res.json();

        // 로컬스토리지 정보 동기화
        const updatedAuth = {
          ...auth,
          name: data.user.name,
          phone: data.user.phone
        };
        localStorage.setItem('nextcard_auth', JSON.stringify(updatedAuth));

        // 커스텀 이벤트 전송
        window.dispatchEvent(new Event('auth_change'));

        setSaveMsg('✅ 설정이 안전하게 저장되었습니다!');
      } else if (activeTab === 'security') {
        if (!settings.currentPassword || !settings.newPassword || !settings.confirmPassword) {
          throw new Error('모든 비밀번호 필드를 입력해 주세요.');
        }
        if (settings.newPassword !== settings.confirmPassword) {
          throw new Error('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        }

        const res = await fetch(`${API_BASE}/api/user/${auth.id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: settings.currentPassword,
            newPassword: settings.newPassword
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || '비밀번호 변경 실패');
        }

        setSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setSaveMsg('✅ 비밀번호가 성공적으로 업데이트되었습니다!');
      } else if (activeTab === 'privacy') {
        // 프라이버시 탭은 데모용 시뮬레이션으로 로컬 UI 메시지만 표시
        setSaveMsg('✅ 프라이버시 설정이 성공적으로 저장되었습니다!');
      }
    } catch (err) {
      setSaveMsg(`❌ 실패: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const gradeInfo = GRADE_LABELS['general'];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="settings-content">
        <header className="settings-header">
          <div>
            <h1>환경 설정</h1>
            <p>회원님의 계정 보안 및 명함 운영 환경을 관리하세요.</p>
          </div>
        </header>

        <div className="settings-grid">
          {/* Sidebar Tabs */}
          <aside className="settings-tabs">
            <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <User size={18} /> 계정 정보
            </button>
            <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Lock size={18} /> 보안 및 비밀번호
            </button>
            <button className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>
              <Shield size={18} /> 프라이버시 설정
            </button>
            <button className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`} onClick={() => setActiveTab('subscription')}>
              <CreditCard size={18} /> 구독 및 플랜
            </button>
          </aside>

          {/* Main Content Area */}
          <section className="settings-main-form">

            {/* ─── 계정 정보 ─── */}
            {activeTab === 'account' && (
              <div className="settings-card animate-in">
                <h3>개인 정보</h3>
                <div className="input-group">
                  <label>이름</label>
                  <input type="text" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>이메일</label>
                  <input type="email" value={settings.email} disabled className="disabled-input" />
                  <p className="input-hint">이메일 주소는 보안상 직접 변경이 불가능합니다.</p>
                </div>
                <div className="input-group">
                  <label>연락처</label>
                  <input type="tel" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                </div>
                {saveMsg && <p className="save-msg">{saveMsg}</p>}
                <button className="btn-save" onClick={handleSave} disabled={loading}>
                  <Save size={18} /> {loading ? '저장 중...' : '변경사항 저장'}
                </button>
              </div>
            )}

            {/* ─── 보안 ─── */}
            {activeTab === 'security' && (
              <div className="settings-card animate-in">
                <h3>비밀번호 변경</h3>
                <div className="input-group">
                  <label>현재 비밀번호</label>
                  <input type="password" value={settings.currentPassword} onChange={e => setSettings({...settings, currentPassword: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>새 비밀번호</label>
                  <input type="password" value={settings.newPassword} onChange={e => setSettings({...settings, newPassword: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>비밀번호 확인</label>
                  <input type="password" value={settings.confirmPassword} onChange={e => setSettings({...settings, confirmPassword: e.target.value})} />
                </div>
                {saveMsg && <p className="save-msg">{saveMsg}</p>}
                <button className="btn-save" onClick={handleSave}>비밀번호 업데이트</button>
              </div>
            )}

            {/* ─── 프라이버시 ─── */}
            {activeTab === 'privacy' && (
              <div className="settings-card animate-in">
                <h3>명함 노출 및 보안</h3>
                <div className="toggle-item">
                  <div>
                    <h4>명함 공개 모드</h4>
                    <p>내 명함 링크를 외부에 공개합니다.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings.privacy.publicCard} onChange={e => setSettings({...settings, privacy: {...settings.privacy, publicCard: e.target.checked}})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <div>
                    <h4>조회수 대시보드 노출</h4>
                    <p>내 명함 하단에 총 조회수를 표시합니다.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={settings.privacy.showViews} onChange={e => setSettings({...settings, privacy: {...settings.privacy, showViews: e.target.checked}})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="info-box">
                  <Bell size={18} />
                  <span>누군가 명함을 조회하면 즉시 알림을 보내드립니다.</span>
                </div>
                {saveMsg && <p className="save-msg">{saveMsg}</p>}
                <button className="btn-save" onClick={handleSave}>프라이버시 저장</button>
              </div>
            )}

            {/* ─── 구독 플랜 (DB 연동 및 다중명함 개별 관리) ─── */}
            {activeTab === 'subscription' && (
              <div className="settings-card animate-in">
                <h3>구독 및 멤버십 플랜</h3>

                {subLoading ? (
                  <div className="sub-loading">
                    <Loader2 size={28} className="spin" />
                    <p>구독 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <>
                    {/* 명함 선택 영역 */}
                    <div className="input-group" style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#1e293b' }}>
                        💳 멤버십 및 구독을 적용할 명함 선택
                      </label>
                      {userCards.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>생성된 명함이 없습니다. 대시보드에서 명함을 먼저 개설해 주세요.</p>
                      ) : (
                        <select 
                          value={selectedCardId} 
                          onChange={e => setSelectedCardId(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b' }}
                        >
                          {userCards.map(c => {
                            const cardGrade = c.grade || 'general';
                            const cardName = c.cardData?.name || c.cardData?.nameEng || '이름 없음';
                            const cardCompany = c.cardData?.company ? `(${c.cardData.company})` : '';
                            const gradeText = cardGrade === 'corporate' ? '기업용' : cardGrade === 'premium_nfc' ? '프리미엄' : cardGrade === 'prod_1778899977850' ? '체험용' : cardGrade === 'prod_1778900193128' ? '표준형(Standard-A)' : cardGrade === 'prod_1779363055944' ? '표준형(Standard-B)' : cardGrade === 'prod_1779351721158' ? '기본형(Basic-B)' : '기본형(Basic-A)';
                            return (
                              <option key={c._id} value={c._id}>
                                {cardName} {cardCompany} - 현재 등급: {gradeText}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>

                    {(() => {
                      const selectedCard = userCards.find(c => c._id === selectedCardId);
                      if (!selectedCard) {
                        return (
                          <div className="sub-error" style={{ textAlign: 'center', padding: '24px' }}>
                            <AlertCircle size={28} />
                            <p>선택된 명함이 없거나 명함 정보를 찾을 수 없습니다.</p>
                          </div>
                        );
                      }

                      const dbProd = products.find(p => p.id === selectedCard.grade);
                      const currentGradeInfo = GRADE_LABELS[selectedCard.grade] || {
                        label: dbProd ? dbProd.name : '기본형 (Basic-A)',
                        desc: dbProd ? dbProd.description : '기본 명함 기능을 사용 중입니다.',
                        color: 'general'
                      };

                      return (
                        <>
                          {/* 플랜 배지 */}
                          <div className={`plan-badge ${currentGradeInfo.color}`}>
                            <CheckCircle2 size={24} />
                            <div>
                              <h4>{currentGradeInfo.label}</h4>
                              <p>{currentGradeInfo.desc}</p>
                            </div>
                          </div>

                          {selectedCard.paymentStatus === 'confirmed' && (
                            <>
                              <div className="plan-details">
                                <div className="detail-item">
                                  <span>
                                    <Calendar size={15} style={{marginRight:'4px', verticalAlign:'middle'}} />
                                    최종 결제/승인일
                                  </span>
                                  <span className="detail-value">
                                    {formatDate(selectedCard.paymentDate) || formatDate(selectedCard.updatedAt) || '—'}
                                  </span>
                                </div>

                                <div className="detail-item">
                                  <span>
                                    <Clock size={15} style={{marginRight:'4px', verticalAlign:'middle'}} />
                                    이용 만료일
                                  </span>
                                  <span className="detail-value">
                                    {formatDate(selectedCard.expiryDate) || '무제한'}
                                  </span>
                                </div>

                                <div className="detail-item">
                                  <span>결제 상태</span>
                                  <span className="payment-status-badge confirmed">
                                    <BadgeCheck size={14} /> 멤버십 활성화 완료
                                  </span>
                                </div>
                              </div>

                              <div className="payment-confirmed-banner">
                                <BadgeCheck size={28} className="success-icon" />
                                <div>
                                  <h4>프리미엄 서비스 적용 중</h4>
                                  <p>선택하신 명함에 대한 모든 권한 및 연계 서비스가 완벽하게 가동 중입니다.</p>
                                </div>
                              </div>
                            </>
                          )}

                          {selectedCard.paymentStatus === 'pending' && (() => {
                            const pendingMethod = paymentMethods.find(m => m.name === selectedCard.paymentMethod) || paymentMethods[0];
                            return (
                            <>
                              <div className="payment-pending-card">
                                <div className="pending-header">
                                  <Clock size={20} className="pending-icon" />
                                  <h4>⏳ {selectedCard.paymentMethod || '결제'} 승인 대기 중</h4>
                                </div>
                                <p className="pending-desc">
                                  아래 안내된 결제 정보로 이체/결제하시면, 관리자가 확인 즉시 해당 명함의 등급을 개별 승인해 드립니다.
                                </p>
                                
                                <div className="bank-info-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {pendingMethod && pendingMethod.fields && pendingMethod.fields.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                      {pendingMethod.fields.map(f => (
                                        <div key={f.id} className="bank-row">
                                          <span>{f.label}</span>
                                          <strong>{f.value}</strong>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div>등록된 결제 정보가 없습니다.</div>
                                  )}
                                </div>

                                <div className="request-details-box">
                                  <h5>신청 내역</h5>
                                  <div className="request-row">
                                    <span>신청 등급</span>
                                    <strong>{
                                      selectedCard.requestedGrade === 'corporate' ? '기업 전용' :
                                      selectedCard.requestedGrade === 'premium_nfc' ? '프리미엄' :
                                      selectedCard.requestedGrade === 'prod_1778899977850' ? '체험용(2개월무료)' :
                                      selectedCard.requestedGrade === 'prod_1778900193128' ? '표준형(Standard-A)' : 
                                      selectedCard.requestedGrade === 'prod_1779351721158' ? '기본형(Basic-B)' :
                                      selectedCard.requestedGrade === 'prod_1779363055944' ? '표준형(Standard-B)' : '기본형(Basic-A)'
                                    }</strong>
                                  </div>
                                  <div className="request-row">
                                    <span>구독 기간</span>
                                    <strong>{selectedCard.requestedDuration}개월 이용권</strong>
                                  </div>
                                  <div className="request-row">
                                    <span>결제 수단</span>
                                    <strong>{selectedCard.paymentMethod || '무통장 입금'}</strong>
                                  </div>
                                  <div className="request-row">
                                    <span>입금자(결제자)명</span>
                                    <strong className="text-highlight">{selectedCard.depositorName}</strong>
                                  </div>
                                  <div className="request-row">
                                    <span>결제(이체)예정금액</span>
                                    <strong className="text-highlight">{selectedCard.paymentAmount?.toLocaleString()}원</strong>
                                  </div>
                                  <div className="request-row">
                                    <span>신청 일시</span>
                                    <span>{formatDate(selectedCard.paymentRequestDate) || '—'}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                            );
                          })}

                          {(selectedCard.paymentStatus === 'none' || !selectedCard.paymentStatus) && (() => {
                            const selectedMethodInfo = paymentMethods.find(m => m.id === selectedPaymentMethodId);
                            
                            return (
                            <>
                              <div className="bank-transfer-form">
                                <div className="bank-header-banner">
                                  <CreditCard size={18} />
                                  <div>
                                    <h4>결제 구독 신청</h4>
                                    <p>{selectedMethodInfo ? selectedMethodInfo.description : '결제 신청 후 관리자가 승인 처리합니다.'}</p>
                                  </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '16px' }}>
                                  <label style={{ fontWeight: 'bold' }}>결제 수단 선택</label>
                                  <select 
                                    value={selectedPaymentMethodId} 
                                    onChange={e => setSelectedPaymentMethodId(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                  >
                                    {paymentMethods.map(m => (
                                      <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {selectedMethodInfo && selectedMethodInfo.fields && selectedMethodInfo.fields.length > 0 && (
                                  <div className="bank-info-box mini" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                                    {selectedMethodInfo.fields.map(f => (
                                      <div key={f.id}>
                                        <strong>{f.label}:</strong> {f.value}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="payment-form-grid">
                                  <div className="input-group">
                                    <label>1. 요금제 등급 선택</label>
                                    <select 
                                      value={requestedGrade} 
                                      onChange={e => setRequestedGrade(e.target.value)}
                                    >
                                      {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="input-group">
                                    <label>2. 구독 기간 선택</label>
                                    <select 
                                      value={requestedDuration} 
                                      onChange={e => setRequestedDuration(Number(e.target.value))}
                                      disabled={requestedGrade === 'prod_1778899977850' || requestedGrade === 'event'}
                                    >
                                      {requestedGrade === 'prod_1778899977850' || requestedGrade === 'event' ? (
                                        <option value={2}>2개월 이용권 (무료 체험 고정)</option>
                                      ) : (
                                        <>
                                          <option value={12}>12개월(연간) 이용권</option>
                                          <option value={3}>3개월 이용권</option>
                                          <option value={2}>2개월 이용권</option>
                                        </>
                                      )}
                                    </select>
                                  </div>

                                  <div className="input-group">
                                    <label>3. 이체 입금자명 입력</label>
                                    <input 
                                      type="text" 
                                      placeholder="실제 이체하시는 통장 입금자명..."
                                      value={depositorName}
                                      onChange={e => setDepositorName(e.target.value)}
                                    />
                                  </div>

                                  <div className="amount-display-box">
                                    <span>이체 예정 금액</span>
                                    <strong>{getAmount(requestedGrade, requestedDuration).toLocaleString()}원</strong>
                                  </div>
                                </div>

                                {saveMsg && <p className="save-msg">{saveMsg}</p>}

                                <button 
                                  className="btn-save"
                                  onClick={handleRequestPayment}
                                  disabled={loading || !depositorName.trim()}
                                >
                                  {loading ? (
                                    <><Loader2 size={16} className="spin" /> 처리 중...</>
                                  ) : (
                                    <><CheckCircle2 size={16} /> 무통장 입금 신청 완료</>
                                  )}
                                </button>
                              </div>
                            </>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;

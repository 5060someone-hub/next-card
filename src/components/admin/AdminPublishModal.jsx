import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Globe, Download, MessageCircle, QrCode, 
  CheckCircle2, Copy, Eye, Send, Loader2,
  ExternalLink, Phone, Mail, AlertCircle
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const AdminPublishModal = ({ 
  isPublishModalOpen, 
  selectedUserForPublish, 
  setIsPublishModalOpen, 
  customUrl, 
  setCustomUrl, 
  handleSavePublish, 
  handleDownloadQR 
}) => {
  const [activeTab, setActiveTab] = useState('publish');
  const [cardData, setCardData] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishDone, setPublishDone] = useState(false);
  // 로컬 URL state — 입력을 모달 내부에서만 관리
  const [localUrl, setLocalUrl] = useState('');
  const qrRef = useRef(null);

  const user = selectedUserForPublish;
  // localUrl 우선, 없으면 userId fallback
  const cardUrl = localUrl || (user?.id ?? '');
  const fullUrl = `https://nextcard.kr/v/${cardUrl}`;
  const localPreviewUrl = `http://localhost:5173/v/${cardUrl}`;

  useEffect(() => {
    if (isPublishModalOpen && user?.id) {
      // 모달 열림시 기존 customUrl로 초기화
      setLocalUrl(customUrl || '');
      fetchCardData();
      setPublishDone(false);
      setActiveTab('publish');
    }
  }, [isPublishModalOpen, user?.id]);

  const fetchCardData = async () => {
    setCardLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/card/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setCardData(data);
        // 기존 customCardUrl이 있고 입력이 비어있을 때만 한 번 초기화 (입력 중 덮어쓰기 방지)
        if (data.customCardUrl) {
          setLocalUrl(prev => prev === '' ? data.customCardUrl : prev);
        }
      }
    } catch (e) {
      console.error('카드 데이터 로드 실패', e);
    } finally {
      setCardLoading(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setPublishing(true);
    // Remove any invalid characters just before publishing
    const sanitizedUrl = localUrl.replace(/[^a-zA-Z0-9_-]/g, '');
    const urlToSave = sanitizedUrl.trim();
    
    // 발행 전 부모 state 동기화 (UI 표시용)
    setCustomUrl(urlToSave);
    
    // 실제 발행 함수에 현재 입력값 전달
    await handleSavePublish(urlToSave);
    
    setPublishing(false);
    setPublishDone(true);
  };

  // 고화질 QR 다운로드
  const handleQRDownload = () => {
    const canvas = document.getElementById('qr-canvas-download');
    if (!canvas) return;
    const highRes = document.createElement('canvas');
    highRes.width = 1200;
    highRes.height = 1200;
    const ctx = highRes.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1200);
    ctx.drawImage(canvas, 100, 100, 1000, 1000);
    // 하단 URL 텍스트
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(fullUrl, 600, 1150);
    const link = document.createElement('a');
    link.download = `QR_${user?.name}_NextCard.png`;
    link.href = highRes.toDataURL('image/png');
    link.click();
  };

  // 카카오톡 알림
  const handleKakaoNotify = () => {
    const msg = notifyMsg || 
      `안녕하세요 ${user?.name}님,\nNextCard 디지털 명함이 발행되었습니다.\n\n📱 명함 보기: ${fullUrl}\n\n(NextCard.kr)`;
    const phone = user?.phone?.replace(/-/g, '').replace(/^0/, '82');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // SMS 알림
  const handleSmsNotify = () => {
    const msg = notifyMsg || 
      `[NextCard] ${user?.name}님의 디지털 명함이 발행되었습니다. 확인: ${fullUrl}`;
    window.open(`sms:${user?.phone}?body=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isPublishModalOpen || !user) return null;

  const themeColor = cardData?.themeColor || '#db2777';

  return (
    <div className="modal-overlay" onClick={() => setIsPublishModalOpen(false)}>
      <div className="publish-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* ── 헤더 ── */}
        <div className="publish-modal-header">
          <div className="publish-user-info">
            <div className="publish-avatar" style={{ background: themeColor }}>
              {user.name?.charAt(0)}
            </div>
            <div>
              <h2>{user.name} 회원 발행 센터</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={() => setIsPublishModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* ── 탭 ── */}
        <div className="publish-tabs">
          <button 
            className={`publish-tab ${activeTab === 'publish' ? 'active' : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            <QrCode size={16} /> QR 발행
          </button>
          <button 
            className={`publish-tab ${activeTab === 'card' ? 'active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            <Eye size={16} /> 명함 확인
          </button>
          <button 
            className={`publish-tab ${activeTab === 'notify' ? 'active' : ''}`}
            onClick={() => setActiveTab('notify')}
          >
            <Send size={16} /> 알림 전송
          </button>
        </div>

        {/* ══ 탭 1: QR 발행 ══ */}
        {activeTab === 'publish' && (
          <div className="publish-tab-body">
            {/* URL 설정 */}
            <div className="publish-section">
              <label className="publish-label">명함 전용 URL 설정</label>
              <div className="url-input-wrapper">
                <span className="url-prefix">nextcard.kr/v/</span>
                <input 
                  type="text" 
                  placeholder="영문·숫자만 (예: gildong)" 
                  value={localUrl}
                  onChange={e => setLocalUrl(e.target.value)}
                  onBlur={e => setLocalUrl(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                />
                <button className="btn-copy-url" onClick={handleCopyUrl} title="URL 복사">
                  {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>
              {cardUrl && (
                <p className="url-preview-text">
                  🔗 {fullUrl}
                </p>
              )}
            </div>

            {/* QR 코드 */}
            <div className="qr-display-area">
              <div className="qr-frame">
                <QRCodeCanvas
                  id="qr-canvas-download"
                  value={fullUrl}
                  size={220}
                  level="H"
                  includeMargin={true}
                  fgColor="#0f172a"
                />
              </div>
              <p className="qr-url-label">{fullUrl}</p>
            </div>

            {/* 액션 버튼 */}
            <div className="publish-actions">
              <button className="btn-action-secondary" onClick={handleQRDownload}>
                <Download size={16} /> QR 고화질 저장 (1200px)
              </button>
              <button 
                className="btn-action-secondary"
                onClick={() => window.open(localPreviewUrl, '_blank')}
              >
                <ExternalLink size={16} /> 미리보기
              </button>
            </div>

            {/* 발행 확정 */}
            <div className="publish-confirm-area">
              {publishDone ? (
                <div className="publish-success-msg">
                  <CheckCircle2 size={20} color="#10b981" />
                  발행 완료! URL이 저장되었습니다.
                </div>
              ) : (
                <button 
                  className="btn-publish-confirm"
                  onClick={handlePublish}
                  disabled={publishing || !cardUrl}
                >
                  {publishing 
                    ? <><Loader2 size={16} className="spin-sm" /> 발행 중...</>
                    : <><CheckCircle2 size={16} /> 명함 발행 확정</>
                  }
                </button>
              )}
              {!cardUrl && (
                <p className="publish-warn">
                  <AlertCircle size={14} /> URL을 먼저 입력해 주세요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ══ 탭 2: 명함 확인 ══ */}
        {activeTab === 'card' && (
          <div className="publish-tab-body">
            {cardLoading ? (
              <div className="card-loading">
                <Loader2 size={28} className="spin-sm" />
                <p>명함 데이터 불러오는 중...</p>
              </div>
            ) : cardData ? (
              <>
                {/* 명함 미니 프리뷰 */}
                <div className="card-mini-preview" style={{
                  background: cardData.bgColor || '#111827',
                  color: cardData.textColor || '#fff'
                }}>
                  <div className="card-preview-top" style={{ borderBottom: `2px solid ${themeColor}` }}>
                    {cardData.logoUrl && (
                      <img src={cardData.logoUrl} alt="logo" className="card-preview-logo" />
                    )}
                    {cardData.profileUrl && (
                      <img src={cardData.profileUrl} alt="profile" className="card-preview-profile" />
                    )}
                    <div>
                      <h3 className="card-preview-name">{cardData.name || user.name}</h3>
                      {cardData.nameEng && <p className="card-preview-name-eng">{cardData.nameEng}</p>}
                      {cardData.jobTitle && <p className="card-preview-job" style={{ color: themeColor }}>{cardData.jobTitle}</p>}
                      {cardData.company && <p className="card-preview-company">{cardData.company}</p>}
                    </div>
                  </div>
                  <div className="card-preview-contacts">
                    {cardData.phone && <span><Phone size={12} /> {cardData.phone}</span>}
                    {cardData.email && <span><Mail size={12} /> {cardData.email}</span>}
                    {cardData.website && <span><Globe size={12} /> {cardData.website}</span>}
                  </div>
                </div>

                {/* 명함 데이터 요약 */}
                <div className="card-data-summary">
                  <div className="summary-item">
                    <span>상품 등급</span>
                    <strong className={`grade-tag ${cardData.productType || 'general'}`}>
                      {cardData.productType || 'general'}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>발행 상태</span>
                    <strong className={cardData.status === 'published' ? 'text-green' : 'text-orange'}>
                      {cardData.status === 'published' ? '✅ 발행완료' : '⏳ 발행대기'}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>커스텀 URL</span>
                    <strong>{cardData.customCardUrl || '미설정'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>SNS 연결</span>
                    <strong>
                      {Object.values(cardData.sns || {}).filter(v => v).length}개
                    </strong>
                  </div>
                </div>

                <button 
                  className="btn-action-full"
                  onClick={() => window.open(localPreviewUrl, '_blank')}
                >
                  <ExternalLink size={16} /> 실제 명함 페이지 열기
                </button>
              </>
            ) : (
              <div className="no-card-msg">
                <AlertCircle size={32} color="#94a3b8" />
                <p>명함 데이터가 없습니다.</p>
                <span>회원이 아직 명함을 작성하지 않았습니다.</span>
              </div>
            )}
          </div>
        )}

        {/* ══ 탭 3: 알림 전송 ══ */}
        {activeTab === 'notify' && (
          <div className="publish-tab-body">
            <div className="publish-section">
              <label className="publish-label">발송 메시지 (선택 — 비우면 기본 메시지 사용)</label>
              <textarea
                className="notify-textarea"
                rows={5}
                placeholder={`안녕하세요 ${user.name}님,\nNextCard 디지털 명함이 발행되었습니다.\n\n📱 명함 보기: ${fullUrl}`}
                value={notifyMsg}
                onChange={e => setNotifyMsg(e.target.value)}
              />
            </div>

            <div className="notify-info-box">
              <p>📞 연락처: {user.phone || '—'}</p>
              <p>📧 이메일: {user.email}</p>
              <p>🔗 발행 URL: {fullUrl}</p>
            </div>

            <div className="notify-buttons">
              <button className="btn-notify btn-kakao" onClick={handleKakaoNotify}>
                <MessageCircle size={18} />
                카카오/WhatsApp 전송
              </button>
              <button className="btn-notify btn-sms" onClick={handleSmsNotify}>
                <Phone size={18} />
                문자(SMS) 전송
              </button>
              <button 
                className="btn-notify btn-email"
                onClick={() => window.open(
                  `mailto:${user.email}?subject=[NextCard] 명함 발행 완료&body=${encodeURIComponent(`안녕하세요 ${user.name}님,\n명함이 발행되었습니다.\n\n명함 보기: ${fullUrl}`)}`,
                  '_blank'
                )}
              >
                <Mail size={18} />
                이메일 전송
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPublishModal;

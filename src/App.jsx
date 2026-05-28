import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── 즉시 로드 (가장 많이 방문하는 페이지) ─────────────────────────────────
import LandingPage from './pages/LandingPage';
import PublicCard from './pages/PublicCard';
import Login from './pages/Login';
import Signup from './pages/Signup';

// ─── 지연 로드 (필요할 때만 다운로드) ────────────────────────────────────────
const Dashboard          = React.lazy(() => import('./pages/Dashboard'));
const CardEditor         = React.lazy(() => import('./pages/CardEditor'));
const ForgotPassword     = React.lazy(() => import('./pages/ForgotPassword'));
const Settings           = React.lazy(() => import('./pages/Settings'));
const FaqBoard           = React.lazy(() => import('./pages/FaqBoard'));
const NetworkLog         = React.lazy(() => import('./pages/NetworkLog'));
const Analytics          = React.lazy(() => import('./pages/Analytics'));
const NamecardLanding    = React.lazy(() => import('./pages/NamecardLanding'));
const SamplePreview      = React.lazy(() => import('./pages/SamplePreview'));

// 관리자 전용 (일반 사용자에게는 불필요)
const AdminUserManagement    = React.lazy(() => import('./pages/AdminUserManagement'));
const AdminProductManagement = React.lazy(() => import('./pages/AdminProductManagement'));
const AdminAdManagement      = React.lazy(() => import('./pages/AdminAdManagement'));
const AdminCardEditor        = React.lazy(() => import('./pages/AdminCardEditor'));
const AdminLandingEditor     = React.lazy(() => import('./pages/AdminLandingEditor'));
const AdminNamecardEditor    = React.lazy(() => import('./pages/AdminNamecardEditor'));
const AdminInquiryManagement = React.lazy(() => import('./pages/AdminInquiryManagement'));
const AdminPlanChanges       = React.lazy(() => import('./pages/AdminPlanChanges'));

// ─── Suspense 로딩 화면 ────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: '#ffffff'
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '50%',
      border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
      animation: 'spin 0.7s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const MobileAppWrapper = ({ children }) => (
  <div className="mobile-mockup-wrapper">
    <div className="app-container">
      {children}
    </div>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

function App() {
  // 전역 파비콘 설정
  useEffect(() => {
    fetch(`${API_URL}/api/landing-content`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.nav?.faviconUrl) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.nav.faviconUrl;
          localStorage.setItem('globalFavicon', data.nav.faviconUrl);
        }
      })
      .catch(() => {}); // 조용히 실패 (콘솔 노출 없음)
  }, []);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PC 데스크탑 풀사이즈 라우트 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/faq" element={<FaqBoard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cards" element={<CardEditor />} />
          <Route path="/logs" element={<NetworkLog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/namecard" element={<NamecardLanding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminUserManagement />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/card-editor/:cardId" element={<AdminCardEditor />} />
          <Route path="/admin/products" element={<AdminProductManagement />} />
          <Route path="/admin/ads" element={<AdminAdManagement />} />
          <Route path="/admin/landing" element={<AdminLandingEditor />} />
          <Route path="/admin/namecard" element={<AdminNamecardEditor />} />
          <Route path="/admin/inquiries" element={<AdminInquiryManagement />} />
          <Route path="/admin/plan-changes" element={<AdminPlanChanges />} />

          {/* 모바일 목업 전용 라우트 (최종결과물 및 인증) */}
          <Route path="/samples" element={<SamplePreview />} />
          <Route path="/login" element={<MobileAppWrapper><Login /></MobileAppWrapper>} />
          <Route path="/signup" element={<MobileAppWrapper><Signup /></MobileAppWrapper>} />
          <Route path="/forgot-password" element={<MobileAppWrapper><ForgotPassword /></MobileAppWrapper>} />
          <Route path="/v/:id" element={<MobileAppWrapper><PublicCard /></MobileAppWrapper>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

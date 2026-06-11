import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── 즉시 로드 (가장 많이 방문하는 페이지) ─────────────────────────────────
import LandingPage from './pages/LandingPage';
import WhyNextCard from './pages/WhyNextCard';
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
const BlogList           = React.lazy(() => import('./pages/BlogList'));
const BlogPost           = React.lazy(() => import('./pages/BlogPost'));
const Networking         = React.lazy(() => import('./pages/Networking'));

// 관리자 전용 (일반 사용자에게는 불필요)
const AdminUserManagement    = React.lazy(() => import('./pages/AdminUserManagement'));
const AdminScannedCards      = React.lazy(() => import('./pages/AdminScannedCards'));
const AdminProductManagement = React.lazy(() => import('./pages/AdminProductManagement'));
const AdminAdManagement      = React.lazy(() => import('./pages/AdminAdManagement'));
const AdminCardEditor        = React.lazy(() => import('./pages/AdminCardEditor'));
const AdminLandingEditor     = React.lazy(() => import('./pages/AdminLandingEditor'));
const AdminNamecardEditor    = React.lazy(() => import('./pages/AdminNamecardEditor'));
const AdminInquiryManagement = React.lazy(() => import('./pages/AdminInquiryManagement'));
const AdminPlanChanges       = React.lazy(() => import('./pages/AdminPlanChanges'));
const AdminBlogList          = React.lazy(() => import('./pages/AdminBlogList'));
const AdminBlogEditor        = React.lazy(() => import('./pages/AdminBlogEditor'));

const B2BDashboard           = React.lazy(() => import('./pages/B2BDashboard'));
const NfcRedirect            = React.lazy(() => import('./pages/NfcRedirect'));
const AddressBook            = React.lazy(() => import('./pages/AddressBook'));

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

import KakaoChatWidget from './components/KakaoChatWidget';

function App() {
  // 전역 파비콘 설정 및 카카오 SDK 초기화
  useEffect(() => {
    // 1. 파비콘 설정
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

    // 2. 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('21003efec377258810eea15b29525fa0'); // 정식 앱 키
      console.log('Kakao SDK Initialized');
    }
  }, []);

  return (
    <Router>
      <KakaoChatWidget />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PC 데스크탑 풀사이즈 라우트 */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/why" element={<WhyNextCard />} />
          <Route path="/faq" element={<FaqBoard />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cards" element={<CardEditor />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/logs" element={<NetworkLog />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/namecard" element={<NamecardLanding />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/nfc/:serial" element={<NfcRedirect />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/admin" element={<AdminUserManagement />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/scanned-cards" element={<AdminScannedCards />} />
          <Route path="/admin/card-editor/:cardId" element={<AdminCardEditor />} />
          <Route path="/admin/products" element={<AdminProductManagement />} />
          <Route path="/admin/ads" element={<AdminAdManagement />} />
          <Route path="/admin/landing" element={<AdminLandingEditor />} />
          <Route path="/admin/namecard" element={<AdminNamecardEditor />} />
          <Route path="/admin/inquiries" element={<AdminInquiryManagement />} />
          <Route path="/admin/plan-changes" element={<AdminPlanChanges />} />
          <Route path="/admin/blog" element={<AdminBlogList />} />
          <Route path="/admin/blog/write" element={<AdminBlogEditor />} />
          
          <Route path="/b2b" element={<B2BDashboard />} />

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

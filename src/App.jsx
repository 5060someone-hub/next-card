import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CardEditor from './pages/CardEditor';
import PublicCard from './pages/PublicCard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminProductManagement from './pages/AdminProductManagement';
import AdminAdManagement from './pages/AdminAdManagement';
import AdminCardEditor from './pages/AdminCardEditor';
import AdminLandingEditor from './pages/AdminLandingEditor';
import AdminNamecardEditor from './pages/AdminNamecardEditor';
import AdminInquiryManagement from './pages/AdminInquiryManagement';
import AdminPlanChanges from './pages/AdminPlanChanges';
import FaqBoard from './pages/FaqBoard';
import NetworkLog from './pages/NetworkLog';
import Analytics from './pages/Analytics';
import NamecardLanding from './pages/NamecardLanding';

const MobileAppWrapper = ({ children }) => (
  <div className="mobile-mockup-wrapper">
    <div className="app-container">
      {children}
    </div>
  </div>
);

function App() {
  console.log('📡 VITE_API_URL:', import.meta.env.VITE_API_URL);
  return (
    <Router>
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
        <Route path="/login" element={<MobileAppWrapper><Login /></MobileAppWrapper>} />
        <Route path="/signup" element={<MobileAppWrapper><Signup /></MobileAppWrapper>} />
        <Route path="/forgot-password" element={<MobileAppWrapper><ForgotPassword /></MobileAppWrapper>} />
        <Route path="/v/:id" element={<MobileAppWrapper><PublicCard /></MobileAppWrapper>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

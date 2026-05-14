import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import CardEditor from './pages/CardEditor';
import PublicCard from './pages/PublicCard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';

const MobileAppWrapper = ({ children }) => (
  <div className="mobile-mockup-wrapper">
    <div className="app-container">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* PC 데스크탑 풀사이즈 라우트 */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cards" element={<CardEditor />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        
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

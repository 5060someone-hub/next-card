import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공 시 사용자 정보 저장
        localStorage.setItem('nextcard_auth', JSON.stringify({ 
          id: data.user.id,
          name: data.user.name,
          email: data.user.email, 
          isLoggedIn: true 
        }));
        alert(`반갑습니다, ${data.user.name}님! 관리자 페이지로 이동합니다.`);
        navigate('/admin');
      } else {
        alert(data.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🪪 NextCard.kr</Link>
          <h1>반갑습니다!</h1>
          <p>디지털 명함의 새로운 기준, NextCard.kr</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label><Mail size={16} /> 이메일</label>
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> 비밀번호</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" /> 로그인 유지
            </label>
            <Link to="/forgot-password" size={16} className="forgot-password">비밀번호 찾기</Link>
          </div>

          <button type="submit" className="btn-auth-primary">
            로그인 <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>

        <div className="auth-brand-footer">
          www.nextcard.kr
        </div>
      </div>
    </div>
  );
};

export default Login;

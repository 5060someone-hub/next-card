import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // 휴대전화 상태 추가
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
      return;
    }

    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('회원가입이 완료되었습니다! 잠시 후 로그인 페이지로 이동합니다.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(data.message || '회원가입에 실패했습니다. 입력한 정보를 확인해 주세요.');
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      setErrorMsg('서버와 연결할 수 없습니다. 인터넷 상태 또는 백엔드 서버 상태를 확인해 주세요.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🪪 NextCard.kr</Link>
          <h1>회원가입</h1>
          <p>NextCard.kr와 함께 스마트한 네트워킹을 시작하세요.</p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-banner">
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label><User size={16} /> 이름</label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label><Phone size={16} /> 휴대전화 번호</label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> 비밀번호</label>
            <input
              type="password"
              placeholder="8자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label><ShieldCheck size={16} /> 비밀번호 재확인</label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="input-error-msg">비밀번호가 일치하지 않습니다.</p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="input-success-msg">비밀번호가 일치합니다.</p>
            )}
          </div>

          <button type="submit" className="btn-auth-primary">
            가입하기 <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>

        <div className="auth-brand-footer">
          www.nextcard.kr
        </div>
      </div>
    </div>
  );
};

export default Signup;

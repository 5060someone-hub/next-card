import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    // 실제 이메일 발송 로직 시뮬레이션
    console.log(`${email}로 임시 비밀번호를 발송합니다.`);
    setIsSent(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🪪 NextCard.kr</Link>
          <h1>비밀번호 찾기</h1>
          <p>가입하신 이메일 주소를 입력하시면<br />임시 비밀번호를 보내드립니다.</p>
        </div>

        {!isSent ? (
          <form className="auth-form" onSubmit={handleResetPassword}>
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

            <button type="submit" className="btn-auth-primary">
              임시 비밀번호 발송 <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="auth-success-view">
            <div className="success-icon">✅</div>
            <h3>이메일이 발송되었습니다!</h3>
            <p><strong>{email}</strong> 주소로 임시 비밀번호를 보내드렸습니다. 이메일을 확인해 주세요.</p>
            <Link to="/login" className="btn-auth-primary">로그인하러 가기</Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="back-to-login">
            <ArrowLeft size={16} /> 로그인으로 돌아가기
          </Link>
        </div>

        <div className="auth-brand-footer">
          www.nextcard.kr
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

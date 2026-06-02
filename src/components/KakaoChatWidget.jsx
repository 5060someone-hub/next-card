import React from 'react';
import { useLocation } from 'react-router-dom';

const KakaoChatWidget = () => {
  const location = useLocation();

  // 최종 명함 결과물 페이지 및 샘플 페이지에서는 카카오톡 위젯 숨김
  if (location.pathname.startsWith('/v/') || location.pathname.startsWith('/samples')) {
    return null;
  }

  return (
    <a
      href="http://pf.kakao.com/_xjxnXbX/chat"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        backgroundColor: '#FEE500', // 카카오톡 공식 옐로우
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      title="카카오톡 채팅 상담"
    >
      <svg width="32" height="30" viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.715 0 0 5.258 0 11.745C0 15.938 2.68 19.625 6.786 21.67L5.345 27.241C5.234 27.676 5.72 28.01 6.096 27.765L12.87 23.366C13.565 23.451 14.275 23.49 15 23.49C23.285 23.49 30 18.232 30 11.745C30 5.258 23.285 0 15 0Z" fill="#3A1D1D"/>
      </svg>
    </a>
  );
};

export default KakaoChatWidget;

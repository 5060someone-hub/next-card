import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const NfcRedirect = () => {
  const { serial } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${API_URL}/api/nfc/check/${serial}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'mapped' && data.cardUrl) {
            window.location.href = `/v/${data.cardUrl}`;
          } else {
            // 미할당 혹은 미등록된 경우 (현재는 HR 관리자용이므로 대시보드로 안내하거나 메시지 출력)
            alert(`NFC 카드(일련번호: ${serial})가 아직 명함에 연결되지 않았습니다.\nHR 관리자에게 문의해 주세요.`);
            navigate('/');
          }
        } else {
          alert('등록되지 않은 잘못된 NFC 일련번호입니다.');
          navigate('/');
        }
      } catch (err) {
        console.error('NFC Error:', err);
        alert('네트워크 오류가 발생했습니다.');
        navigate('/');
      }
    };
    fetchMapping();
  }, [serial, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '50px', height: '50px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 'bold' }}>NFC 카드를 확인 중입니다...</p>
      <style>
        {`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
};

export default NfcRedirect;

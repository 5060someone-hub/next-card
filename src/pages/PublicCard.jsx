import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Phone, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Globe, 
  MapPin, 
  Camera,
  UserCircle,
  Code,
  Briefcase,
  Users
} from 'lucide-react';
import './PublicCard.css';

const PublicCard = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(false);
  const [showPaperCard, setShowPaperCard] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/card/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCardData(data);
        } else {
          // 샘플 데이터 fallback
          if (id === 'sample') {
            setCardData({
              name: '홍길동',
              nameEng: 'Gildong Hong',
              jobTitle: '대표이사 / CEO',
              company: 'NextCard.kr 주식회사',
              department: '경영전략팀',
              address: '서울특별시 강남구 테헤란로43길 14 청수빌딩 13층',
              bio: '디지털 명함의 새로운 기준, NextCard.kr\n모바일과 웹을 아우르는 최상의 하이브리드 네트워킹 경험을 선사합니다.',
              phoneWork: '02-123-4567',
              phonePersonal: '010-1234-5678',
              email: 'gildong@nextcard.kr',
              website: 'https://www.nextcard.kr',
              logoUrl: '/logo.png',
              profileUrl: '/profile.jpg',
              sns: { 
                kakaotalk: 'nextcard',
                instagram: 'nextcard',
                facebook: 'nextcard',
                tiktok: 'nextcard',
                x: 'nextcard',
                threads: 'nextcard',
                linkedin: 'nextcard'
              }
            });
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError(true);
      }
    };
    fetchCardData();
  }, [id]);

  if (error) return <div className="error-view">명함을 찾을 수 없습니다.</div>;
  if (!cardData) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="public-card-wrapper">
      <div className="public-card-container">


        {cardData.logoUrl && (
          <div className="card-logo">
            <img src={cardData.logoUrl} alt="Company Logo" style={{ maxWidth: `${cardData.logoSize || 40}%` }} />
          </div>
        )}

        <div className="header-divider"></div>

        {/* Profile Image */}
        {cardData.profileUrl && (
          <div className="card-profile-image">
            <img src={cardData.profileUrl} alt="Profile" style={{ width: `${cardData.profileSize || 120}px`, height: `${cardData.profileSize || 120}px` }} />
          </div>
        )}

        {/* Name & Title */}
        <header className="card-header-info">
          <h1>{cardData.name} <span className="eng-name">{cardData.nameEng}</span></h1>
          {cardData.jobTitle && <p className="job-title">{cardData.jobTitle}</p>}
        </header>

        {/* Info Box */}
        {(cardData.company || cardData.department || cardData.address) && (
          <section className="info-box">
            {cardData.company && (
              <div className="info-item">
                <div className="info-icon pink"><Briefcase size={20} /></div>
                <div className="info-text">
                  <label>Company</label>
                  <p>{cardData.company}</p>
                </div>
              </div>
            )}
            {cardData.department && (
              <div className="info-item">
                <div className="info-icon pink"><Users size={20} /></div>
                <div className="info-text">
                  <label>Department</label>
                  <p>{cardData.department}</p>
                </div>
              </div>
            )}
            {cardData.address && (
              <div className="info-item">
                <div className="info-icon pink"><MapPin size={20} /></div>
                <div className="info-text">
                  <label>Address</label>
                  <p>{cardData.address}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* About Section */}
        {cardData.bio && (
          <section className="about-box">
            <label>ABOUT</label>
            <p>{cardData.bio}</p>
          </section>
        )}

        {/* Action Grid */}
        <section className="action-grid">
          {cardData.phoneWork && (
            <a href={`tel:${cardData.phoneWork}`} className="action-item">
              <Phone size={24} />
              <span>회사전화</span>
            </a>
          )}
          {cardData.phonePersonal && (
            <a href={`tel:${cardData.phonePersonal}`} className="action-item">
              <Smartphone size={24} />
              <span>개인전화</span>
            </a>
          )}
          {cardData.email && (
            <a href={`mailto:${cardData.email}`} className="action-item">
              <Mail size={24} />
              <span>이메일</span>
            </a>
          )}
          {cardData.phonePersonal && (
            <a href={`sms:${cardData.phonePersonal}`} className="action-item">
              <MessageSquare size={24} />
              <span>문자</span>
            </a>
          )}
          {cardData.website && (
            <a href={cardData.website.startsWith('http') ? cardData.website : `https://${cardData.website}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <Globe size={24} />
              <span>웹사이트</span>
            </a>
          )}
          <a href={`https://map.kakao.com/?q=${encodeURIComponent(cardData.address)}`} target="_blank" rel="noopener noreferrer" className="action-item">
            <MapPin size={24} />
            <span>회사위치</span>
          </a>

          {/* SNS Links */}
          {cardData.sns?.kakaotalk && (
            <a href={cardData.sns.kakaotalk.startsWith('http') ? cardData.sns.kakaotalk : `https://open.kakao.com/o/${cardData.sns.kakaotalk}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/kakaotalk/374151" width="24" height="24" alt="KakaoTalk" />
              <span>카카오톡</span>
            </a>
          )}
          {cardData.sns?.instagram && (
            <a href={cardData.sns.instagram.startsWith('http') ? cardData.sns.instagram : `https://instagram.com/${cardData.sns.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/instagram/111827" width="24" height="24" alt="Instagram" />
              <span>인스타그램</span>
            </a>
          )}
          {cardData.sns?.facebook && (
            <a href={cardData.sns.facebook.startsWith('http') ? cardData.sns.facebook : `https://facebook.com/${cardData.sns.facebook}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/facebook/111827" width="24" height="24" alt="Facebook" />
              <span>페이스북</span>
            </a>
          )}
          {cardData.sns?.tiktok && (
            <a href={cardData.sns.tiktok.startsWith('http') ? cardData.sns.tiktok : `https://tiktok.com/@${cardData.sns.tiktok.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/tiktok/111827" width="24" height="24" alt="TikTok" />
              <span>틱톡</span>
            </a>
          )}
          {cardData.sns?.x && (
            <a href={cardData.sns.x.startsWith('http') ? cardData.sns.x : `https://x.com/${cardData.sns.x.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/x/111827" width="24" height="24" alt="X" />
              <span>X (트위터)</span>
            </a>
          )}
          {cardData.sns?.threads && (
            <a href={cardData.sns.threads.startsWith('http') ? cardData.sns.threads : `https://threads.net/@${cardData.sns.threads.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <img src="https://cdn.simpleicons.org/threads/111827" width="24" height="24" alt="Threads" />
              <span>쓰레드</span>
            </a>
          )}
          {cardData.sns?.linkedin && (
            <a href={cardData.sns.linkedin.startsWith('http') ? cardData.sns.linkedin : `https://linkedin.com/in/${cardData.sns.linkedin}`} target="_blank" rel="noopener noreferrer" className="action-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#111827">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>링크드인</span>
            </a>
          )}
        </section>

        {/* Paper Business Card Modal */}
        {showPaperCard && cardData.paperCardUrl && (
          <div className="paper-card-modal" onClick={() => setShowPaperCard(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaperCard(false)}>&times;</button>
              <label>PAPER BUSINESS CARD</label>
              <div className="paper-card-container">
                <img src={cardData.paperCardUrl} alt="Paper Card" />
              </div>
            </div>
          </div>
        )}

        {/* Footer Button */}
        <footer className="card-footer-action">
          <button className="btn-footer" onClick={() => setShowPaperCard(true)}>종이명함</button>
        </footer>
      </div>
    </div>
  );
};

export default PublicCard;

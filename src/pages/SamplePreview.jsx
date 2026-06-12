import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone, Check } from 'lucide-react';
import './NamecardLanding.css'; // Reuse landing CSS for theme consistency

export default function SamplePreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '')}/api/products`);
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a, b) => a.order - b.order);
        setProducts(sorted);
        if (sorted.length > 0) {
          setSelectedProduct(sorted[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="sample-preview-page" style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '4rem' }}>
      <style>
        {`
          .sample-header {
            display: flex;
            align-items: center;
            padding: 1rem 2rem;
          }
          .sample-header h1 {
            margin: 0 auto;
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            padding-right: 100px;
          }
          .sample-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            display: flex;
            flex-wrap: wrap;
            gap: 3rem;
            align-items: flex-start;
          }
          .desktop-only-btn { display: block; }
          .mobile-only-btn { display: none; }
          .sample-mockup-wrapper {
            position: relative;
            width: 340px;
            height: 680px;
            background: #ffffff;
            border-radius: 44px;
            border: 12px solid #0f172a;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            margin: 0 auto;
          }
          @media (max-width: 768px) {
            .sample-header {
              padding: 1rem;
              justify-content: space-between;
            }
            .sample-header h1 {
              font-size: 1.1rem !important;
              padding-right: 0 !important;
              margin: 0;
            }
            .sample-header button {
              font-size: 0.9rem !important;
              padding: 0;
            }
            .sample-container {
              padding: 1rem;
              gap: 2rem;
            }
            .sample-mockup-wrapper {
              width: 100%;
              max-width: 340px;
            }
            .desktop-only-btn { display: none; }
            .mobile-only-btn { display: block; width: 100%; margin-top: 2rem; }
            .sticky-right-side {
              position: static !important;
            }
          }
        `}
      </style>
      {/* Header */}
      <header className="sample-header" style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
          <ArrowLeft size={20} /> 돌아가기
        </button>
        <h1>
          등급별 샘플 명함
        </h1>
      </header>

      <div className="sample-container">
        
        {/* Left Side: Product Selection & Details */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.3 }}>
              스마트한 디지털 명함,<br/>
              직접 체험해 보세요.
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6 }}>
              관심있는 상품을 체크하고 우측의 스마트폰 화면 안에서 스크롤을 내리거나 버튼을 눌러보세요. 실제 명함과 똑같이 동작합니다. 모바일은 가장 하단에 미리보기 스마트폰 화면이 있습니다.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : products.length === 0 ? (
              <p style={{ color: '#64748b' }}>등록된 상품이 없습니다.</p>
            ) : products.map(prod => (
              <div 
                key={prod.id} 
                onClick={() => setSelectedProduct(prod)}
                style={{ 
                  padding: '1.5rem', 
                  background: selectedProduct?.id === prod.id ? '#eff6ff' : 'white', 
                  border: selectedProduct?.id === prod.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedProduct?.id === prod.id ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: selectedProduct?.id === prod.id ? '#1d4ed8' : '#334155', margin: 0 }}>
                    {prod.name}
                  </h3>
                  {selectedProduct?.id === prod.id && <div style={{ background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '50%' }}><Check size={16} /></div>}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 1rem 0' }}>{prod.description}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(prod.tags && prod.tags.length > 0) ? (
                      prod.tags.map((tag, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <>
                        {/* Fallback to legacy features if tags are empty (optional, but good for UX until they update them) */}
                        {prod.features?.allowLogo && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>로고 적용</span>}
                        {prod.features?.allowCustomUrl && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>커스텀 주소</span>}
                        {prod.features?.allowSinglePage && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>통합 랜딩페이지</span>}
                        {prod.features?.maxSnsCount > 1 && <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#475569' }}>SNS {prod.features.maxSnsCount}개</span>}
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="desktop-only-btn" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
               내 명함 만들기 시작
             </button>
          </div>
        </div>

        {/* Right Side: Smartphone Live Preview */}
        <div className="sticky-right-side" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1rem', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div className="sample-mockup-wrapper">
            {/* iPhone Notch */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '24px',
              background: '#0f172a',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              zIndex: 10
            }}></div>
            
            {selectedProduct ? (
              selectedProduct.sampleUrl ? (
                <iframe 
                  src={selectedProduct.sampleUrl} 
                  style={{ width: '100%', height: '100%', border: 'none', background: '#f8fafc' }}
                  title="Sample Preview"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <Smartphone size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>이 등급의 샘플 명함이<br/>아직 등록되지 않았습니다.</p>
                </div>
              )
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            )}
          </div>
          
          <div className="mobile-only-btn">
             <button onClick={() => navigate('/signup')} style={{ width: '100%', padding: '1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
               내 명함 만들기 시작
             </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

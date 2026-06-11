import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShoppingBag, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newSampleUrl, setNewSampleUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newProductPriceAnnual, setNewProductPriceAnnual] = useState('');
  const [newProductPriceThreeMonths, setNewProductPriceThreeMonths] = useState('');
  const [newProductPriceTwoMonths, setNewProductPriceTwoMonths] = useState('');
  const [features, setFeatures] = useState({
    allowLogo: false,
    allowProfile: true,
    allowPaperCard: false,
    allowCustomUrl: false,
    allowSinglePage: false,
    showAds: true,
    allowNetworking: false,
    maxSnsCount: 1,
    scanLimit: 10,
    allowedThemes: ['modern']
  });
  const [editingId, setEditingId] = useState(null); // 수정 중인 상품 ID
  
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    const isMaster = auth.role === 'admin' || 
                     auth.email === 'vikitour.boss@gmail.com' || 
                     auth.email === 'adqkorea@gmail.com' || 
                     auth.email === 'cyy3172@naver.com';

    if (!auth.isLoggedIn || !isMaster) {
      navigate('/dashboard');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, payRes] = await Promise.all([
        fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products`),
        fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/settings/payment-methods`)
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (payRes.ok) setPaymentMethods(await payRes.json());
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentMethods = async () => {
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/settings/payment-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentMethods)
      });
      if (res.ok) alert('결제 수단 정보가 저장되었습니다.');
      else alert('저장 실패');
    } catch (e) {
      alert('오류 발생');
    }
  };

  const handleAddPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, {
      id: Date.now().toString(),
      name: '새 결제수단',
      enabled: false,
      description: '',
      fields: []
    }]);
  };

  const handleRemovePaymentMethod = (index) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const handleMethodChange = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index][field] = value;
    setPaymentMethods(newMethods);
  };

  const handleAddField = (methodIndex) => {
    const newMethods = [...paymentMethods];
    newMethods[methodIndex].fields.push({ id: Date.now().toString(), label: '', value: '' });
    setPaymentMethods(newMethods);
  };

  const handleRemoveField = (methodIndex, fieldIndex) => {
    const newMethods = [...paymentMethods];
    newMethods[methodIndex].fields = newMethods[methodIndex].fields.filter((_, i) => i !== fieldIndex);
    setPaymentMethods(newMethods);
  };

  const handleFieldChange = (methodIndex, fieldIndex, key, val) => {
    const newMethods = [...paymentMethods];
    newMethods[methodIndex].fields[fieldIndex][key] = val;
    setPaymentMethods(newMethods);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    try {
      const url = editingId 
        ? `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products/${editingId}`
        : `${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProductName, 
          description: newProductDesc,
          sampleUrl: newSampleUrl,
          tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
          price: {
            annual: Number(newProductPriceAnnual) || 0,
            threeMonths: Number(newProductPriceThreeMonths) || 0,
            twoMonths: Number(newProductPriceTwoMonths) || 0
          },
          features: features 
        })
      });
      if (response.ok) {
        resetForm();
        fetchProducts();
      } else {
        const data = await response.json();
        alert(`실패: ${data.message || '데이터베이스 저장 오류'}`);
      }
    } catch (err) {
      console.error('Product save error:', err);
      alert('서버와 통신할 수 없습니다. DB 설정을 확인해주세요.');
    }
  };

  const resetForm = () => {
    setNewProductName('');
    setNewProductDesc('');
    setNewSampleUrl('');
    setNewTags('');
    setNewProductPriceAnnual('');
    setNewProductPriceThreeMonths('');
    setNewProductPriceTwoMonths('');
    setFeatures({ 
      allowLogo: false, 
      allowProfile: true,
      allowPaperCard: false, 
      allowCustomUrl: false, 
      allowSinglePage: false,
      showAds: true,
      allowNetworking: false,
      maxSnsCount: 1,
      maxGallery: 1,
      maxVideo: 1,
      scanLimit: 10,
      allowedThemes: ['modern']
    });
    setEditingId(null);
  };

  const startEdit = (prod) => {
    setEditingId(prod.id || prod._id);
    setNewProductName(prod.name);
    setNewProductDesc(prod.description || '');
    setNewSampleUrl(prod.sampleUrl || '');
    setNewTags(prod.tags ? prod.tags.join(', ') : '');
    setNewProductPriceAnnual(prod.price?.annual !== undefined ? prod.price.annual : (typeof prod.price === 'number' ? prod.price : ''));
    setNewProductPriceThreeMonths(prod.price?.threeMonths !== undefined ? prod.price.threeMonths : '');
    setNewProductPriceTwoMonths(prod.price?.twoMonths !== undefined ? prod.price.twoMonths : '');
    setFeatures({
      allowLogo: prod.features?.allowLogo || false,
      allowProfile: prod.features?.allowProfile ?? true,
      allowPaperCard: prod.features?.allowPaperCard || false,
      allowCustomUrl: prod.features?.allowCustomUrl || false,
      allowSinglePage: prod.features?.allowSinglePage || false,
      showAds: prod.features?.showAds ?? true,
      allowNetworking: prod.features?.allowNetworking || false,
      maxSnsCount: prod.features?.maxSnsCount ?? 1,
      maxGallery: prod.features?.maxGallery ?? 1,
      maxVideo: prod.features?.maxVideo ?? 1,
      scanLimit: prod.features?.scanLimit !== undefined ? prod.features.scanLimit : 10,
      allowedThemes: prod.features?.allowedThemes || ['modern']
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchProducts();
      }
    } catch (err) {
      alert('상품 삭제 실패');
    }
  };

  const handleReorder = async (index, direction) => {
    const newProducts = [...products];
    if (direction === 'up' && index > 0) {
      [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
    } else if (direction === 'down' && index < newProducts.length - 1) {
      [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    } else {
      return;
    }
    setProducts(newProducts);
    
    try {
      const orderedIds = newProducts.map(p => p.id);
      await fetch(`${(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000')}/api/admin/products/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {
      console.error('Reorder error', err);
      alert('순서 변경 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <h1>상품 관리</h1>
            <p>사용자가 선택할 수 있는 명함 상품 종류를 관리합니다.</p>
          </div>
          <button className="btn-refresh" onClick={fetchProducts}>
            <RefreshCw size={18} /> 새로고침
          </button>
        </header>

        <div className="admin-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1rem', marginTop: '1rem' }}>
          {/* Add Form */}
          <section className="form-card" style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
              <Plus size={18} color="#2563eb" /> {editingId ? '상품 정보 수정' : '새 상품 추가'}
            </h3>
            <form onSubmit={handleAddProduct}>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>상품명</label>
                <input 
                  type="text" 
                  value={newProductName} 
                  onChange={(e) => setNewProductName(e.target.value)} 
                  placeholder="예: 프리미엄 NFC 명함"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>설명</label>
                <textarea 
                  value={newProductDesc} 
                  onChange={(e) => setNewProductDesc(e.target.value)} 
                  placeholder="상품에 대한 간단한 설명"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '60px', fontSize: '0.75rem' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>샘플 명함 URL (선택)</label>
                <input 
                  type="text" 
                  value={newSampleUrl} 
                  onChange={(e) => setNewSampleUrl(e.target.value)} 
                  placeholder="예: /v/sample-vip 또는 https://nextcard.kr/v/sample"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>강조 태그 (콤마로 구분하여 입력)</label>
                <input 
                  type="text" 
                  value={newTags} 
                  onChange={(e) => setNewTags(e.target.value)} 
                  placeholder="예: 로고 적용, 프리미엄, 통합 랜딩페이지"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>연간 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceAnnual} 
                    onChange={(e) => {
                      setNewProductPriceAnnual(e.target.value);
                      if (e.target.value) {
                        setNewProductPriceThreeMonths('');
                        setNewProductPriceTwoMonths('');
                      }
                    }} 
                    placeholder="예: 55000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>3개월 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceThreeMonths} 
                    onChange={(e) => {
                      setNewProductPriceThreeMonths(e.target.value);
                      if (e.target.value) {
                        setNewProductPriceAnnual('');
                        setNewProductPriceTwoMonths('');
                      }
                    }} 
                    placeholder="예: 15000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>2개월 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceTwoMonths} 
                    onChange={(e) => {
                      setNewProductPriceTwoMonths(e.target.value);
                      if (e.target.value) {
                        setNewProductPriceAnnual('');
                        setNewProductPriceThreeMonths('');
                      }
                    }} 
                    placeholder="예: 10000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                  />
                </div>
              </div>

              <div className="features-section" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.719rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1e293b' }}>세부 기능 제한 설정</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowLogo} 
                      onChange={(e) => setFeatures({...features, allowLogo: e.target.checked})} 
                    />
                    회사 로고 업로드 허용
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowProfile} 
                      onChange={(e) => setFeatures({...features, allowProfile: e.target.checked})} 
                    />
                    프로필 사진 업로드 허용
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowPaperCard} 
                      onChange={(e) => setFeatures({...features, allowPaperCard: e.target.checked})} 
                    />
                    종이명함 스캔본 허용
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowCustomUrl} 
                      onChange={(e) => setFeatures({...features, allowCustomUrl: e.target.checked})} 
                    />
                    커스텀 URL 설정 허용
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.showAds} 
                      onChange={(e) => setFeatures({...features, showAds: e.target.checked})} 
                    />
                    하단 사이트 광고 표시
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowSinglePage} 
                      onChange={(e) => setFeatures({...features, allowSinglePage: e.target.checked})} 
                    />
                    SPA(싱글) 허용
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={features.allowNetworking} 
                      onChange={(e) => setFeatures({...features, allowNetworking: e.target.checked})} 
                    />
                    네트워킹/검색 허용
                  </label>
                  
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>AI 명함 스캔 횟수</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={features.scanLimit === -1}
                          onChange={(e) => setFeatures({...features, scanLimit: e.target.checked ? -1 : 10})}
                        />
                        무제한
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="9999" 
                        value={features.scanLimit === -1 ? '' : (features.scanLimit || 0)} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setFeatures({...features, scanLimit: isNaN(val) ? 0 : val});
                        }}
                        disabled={features.scanLimit === -1}
                        style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: features.scanLimit === -1 ? '#f1f5f9' : '#fff' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>최대 SNS 링크 개수</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      value={features.maxSnsCount} 
                      onChange={(e) => setFeatures({...features, maxSnsCount: parseInt(e.target.value) || 0})}
                      style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>최대 갤러리 섹션 개수</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="999" 
                      value={features.maxGallery ?? 1} 
                      onChange={(e) => setFeatures({...features, maxGallery: parseInt(e.target.value) || 0})}
                      style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    />
                  </div>
                  
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>최대 영상 섹션 개수</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="999" 
                      value={features.maxVideo ?? 1} 
                      onChange={(e) => setFeatures({...features, maxVideo: parseInt(e.target.value) || 0})}
                      style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                    />
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>허용 디자인 테마</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {['modern', 'classic', 'luxury', 'corporate'].map(t => (
                        <label key={t} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <input 
                            type="checkbox" 
                            checked={features.allowedThemes?.includes(t)} 
                            onChange={(e) => {
                              const newThemes = e.target.checked 
                                ? [...(features.allowedThemes || []), t]
                                : (features.allowedThemes || []).filter(item => item !== t);
                              setFeatures({...features, allowedThemes: newThemes});
                            }}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editingId ? '수정 완료' : '상품 등록하기'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="btn-secondary" style={{ flex: 1 }}>
                    취소
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* List */}
          <section className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>상품 정보</th>
                  <th>금액</th>
                  <th>설명</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="empty-row">로딩 중...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="3" className="empty-row">등록된 상품이 없습니다.</td></tr>
                ) : (
                  products.map((prod, index) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <ShoppingBag size={18} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{prod.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.813rem' }}>
                        {(prod.price?.annual > 0 || typeof prod.price === 'number') && <div>연간: {prod.price?.annual !== undefined ? prod.price.annual.toLocaleString() : prod.price.toLocaleString()}원</div>}
                        {prod.price?.threeMonths > 0 && <div>3개월: {prod.price.threeMonths.toLocaleString()}원</div>}
                        {prod.price?.twoMonths > 0 && <div>2개월: {prod.price.twoMonths.toLocaleString()}원</div>}
                        {!prod.price?.annual && !prod.price?.threeMonths && !prod.price?.twoMonths && typeof prod.price !== 'number' && <div style={{color:'#94a3b8'}}>무료</div>}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{prod.description || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-table-info" 
                            onClick={() => handleReorder(index, 'up')}
                            disabled={index === 0}
                            title="위로 이동"
                            style={{ padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#cbd5e1' : '#475569' }}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button 
                            className="btn-table-info" 
                            onClick={() => handleReorder(index, 'down')}
                            disabled={index === products.length - 1}
                            title="아래로 이동"
                            style={{ padding: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: index === products.length - 1 ? 'not-allowed' : 'pointer', color: index === products.length - 1 ? '#cbd5e1' : '#475569' }}
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button 
                            className="btn-table-info" 
                            onClick={() => startEdit(prod)}
                            style={{ padding: '0.4rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            수정
                          </button>
                          <button 
                            className="btn-table-danger" 
                            onClick={() => handleDeleteProduct(prod.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {/* 결제 수단 관리 */}
          <section className="form-section animate-in" style={{ marginTop: '2rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                <span className="icon-wrap"><AlertCircle size={20} /></span>
                결제 수단 설정
              </h2>
              <button type="button" onClick={handleAddPaymentMethod} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <Plus size={16} style={{ marginRight: '4px' }} /> 결제 수단 추가
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {paymentMethods.map((method, mIndex) => (
                <div key={method.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', position: 'relative' }}>
                  <button 
                    onClick={() => handleRemovePaymentMethod(mIndex)}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={20} />
                  </button>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>결제 수단명</label>
                      <input 
                        type="text" 
                        value={method.name} 
                        onChange={e => handleMethodChange(mIndex, 'name', e.target.value)}
                        placeholder="예: 무통장 입금, 암호화폐, 네이버페이"
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={method.enabled} 
                          onChange={e => handleMethodChange(mIndex, 'enabled', e.target.checked)} 
                        />
                        <span className="slider"></span>
                      </label>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>활성화</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>결제 안내 문구</label>
                    <textarea 
                      value={method.description}
                      onChange={e => handleMethodChange(mIndex, 'description', e.target.value)}
                      placeholder="결제 시 안내할 사항을 입력하세요."
                      rows={2}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>세부 정보 입력 필드 (예: 은행명-계좌번호, 코인-지갑주소 등)</label>
                      <button type="button" onClick={() => handleAddField(mIndex)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        <Plus size={14} style={{ marginRight: '4px' }} /> 정보 추가
                      </button>
                    </div>

                    {method.fields && method.fields.map((field, fIndex) => (
                      <div key={field.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="항목명 (예: 신한은행)" 
                          value={field.label} 
                          onChange={e => handleFieldChange(mIndex, fIndex, 'label', e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <input 
                          type="text" 
                          placeholder="세부정보 (예: 110-123-1234 주식회사)" 
                          value={field.value} 
                          onChange={e => handleFieldChange(mIndex, fIndex, 'value', e.target.value)}
                          style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button type="button" onClick={() => handleRemoveField(mIndex, fIndex)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {(!method.fields || method.fields.length === 0) && (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>추가된 정보가 없습니다.</p>
                    )}
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <div className="empty-row" style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
                  등록된 결제 수단이 없습니다.
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={handleSavePaymentMethods} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <CheckCircle2 size={18} style={{ marginRight: '6px' }} /> 결제 수단 정보 저장
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

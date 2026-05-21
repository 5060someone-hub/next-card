import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShoppingBag, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [bankInfo, setBankInfo] = useState({ description: '', accounts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
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
    maxSnsCount: 1,
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
      const [prodRes, bankRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`),
        fetch(`${import.meta.env.VITE_API_URL}/api/settings/bank-info`)
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (bankRes.ok) setBankInfo(await bankRes.json());
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankInfo = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/bank-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankInfo)
      });
      if (res.ok) alert('무통장 입금 정보가 저장되었습니다.');
      else alert('저장 실패');
    } catch (e) {
      alert('오류 발생');
    }
  };

  const handleAddBankAccount = () => {
    setBankInfo(prev => ({
      ...prev,
      accounts: [...prev.accounts, { id: Date.now().toString(), bank: '', account: '', owner: '' }]
    }));
  };

  const handleRemoveBankAccount = (index) => {
    setBankInfo(prev => ({
      ...prev,
      accounts: prev.accounts.filter((_, i) => i !== index)
    }));
  };

  const handleBankAccountChange = (index, field, value) => {
    const newAccounts = [...bankInfo.accounts];
    newAccounts[index][field] = value;
    setBankInfo({ ...bankInfo, accounts: newAccounts });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    try {
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/admin/products/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/products`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newProductName, 
          description: newProductDesc,
          price: {
            annual: Number(newProductPriceAnnual) || 0,
            threeMonths: Number(newProductPriceThreeMonths) || 0,
            twoMonths: Number(newProductPriceTwoMonths) || 0
          },
          features: features 
        })
      });
      if (response.ok) {
        setNewProductName('');
        setNewProductDesc('');
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
          maxSnsCount: 1,
          allowedThemes: ['modern']
        });
        setEditingId(null);
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

  const startEdit = (prod) => {
    setNewProductName(prod.name);
    setNewProductDesc(prod.description || '');
    setNewProductPriceAnnual(prod.price?.annual !== undefined ? prod.price.annual : (typeof prod.price === 'number' ? prod.price : ''));
    setNewProductPriceThreeMonths(prod.price?.threeMonths !== undefined ? prod.price.threeMonths : '');
    setNewProductPriceTwoMonths(prod.price?.twoMonths !== undefined ? prod.price.twoMonths : '');
    setFeatures(prod.features || { 
      allowLogo: false, 
      allowProfile: true,
      allowPaperCard: false, 
      allowCustomUrl: false, 
      allowSinglePage: false,
      showAds: true,
      maxSnsCount: 1,
      allowedThemes: ['modern']
    });
    setEditingId(prod.id);
  };

  const cancelEdit = () => {
    setNewProductName('');
    setNewProductDesc('');
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
      maxSnsCount: 1,
      allowedThemes: ['modern']
    });
    setEditingId(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`, {
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
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/reorder`, {
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>연간 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceAnnual} 
                    onChange={(e) => setNewProductPriceAnnual(e.target.value)} 
                    placeholder="예: 55000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                    required
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>3개월 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceThreeMonths} 
                    onChange={(e) => setNewProductPriceThreeMonths(e.target.value)} 
                    placeholder="예: 15000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                    required
                  />
                </div>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '0.719rem', fontWeight: 600, marginBottom: '0.35rem' }}>2개월 요금 (원)</label>
                  <input 
                    type="number" 
                    value={newProductPriceTwoMonths} 
                    onChange={(e) => setNewProductPriceTwoMonths(e.target.value)} 
                    placeholder="예: 10000"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}
                    min="0"
                    required
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
                    SPA(싱글페이지) 기능 허용
                  </label>
                  
                  <div style={{ marginTop: '0.5rem' }}>
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
                        <div>연간: {prod.price?.annual !== undefined ? prod.price.annual.toLocaleString() : (typeof prod.price === 'number' ? prod.price.toLocaleString() : '0')}원</div>
                        <div>3개월: {prod.price?.threeMonths !== undefined ? prod.price.threeMonths.toLocaleString() : '0'}원</div>
                        <div>2개월: {prod.price?.twoMonths !== undefined ? prod.price.twoMonths.toLocaleString() : '0'}원</div>
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

          {/* 무통장 입금 정보 관리 */}
          <section className="form-section animate-in" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">
              <span className="icon-wrap"><AlertCircle size={20} /></span>
              무통장 입금 정보 관리
            </h2>
            <div className="input-group">
              <label>안내 문구</label>
              <textarea 
                value={bankInfo.description}
                onChange={e => setBankInfo({...bankInfo, description: e.target.value})}
                placeholder="입금 시 유의사항 등을 입력하세요"
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>등록된 입금 계좌</label>
                <button type="button" onClick={handleAddBankAccount} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <Plus size={16} style={{ marginRight: '4px' }} /> 계좌 추가
                </button>
              </div>
              
              {bankInfo.accounts.map((acc, index) => (
                <div key={acc.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="은행명" 
                    value={acc.bank} 
                    onChange={e => handleBankAccountChange(index, 'bank', e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input 
                    type="text" 
                    placeholder="계좌번호" 
                    value={acc.account} 
                    onChange={e => handleBankAccountChange(index, 'account', e.target.value)}
                    style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <input 
                    type="text" 
                    placeholder="예금주" 
                    value={acc.owner} 
                    onChange={e => handleBankAccountChange(index, 'owner', e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <button type="button" onClick={() => handleRemoveBankAccount(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={handleSaveBankInfo} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <CheckCircle2 size={18} style={{ marginRight: '6px' }} /> 무통장 입금 정보 저장
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

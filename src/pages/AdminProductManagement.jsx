import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShoppingBag, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem('nextcard_auth')) || {};

  useEffect(() => {
    if (!auth.isLoggedIn || (auth.role !== 'admin' && auth.email !== 'vikitour.boss@gmail.com')) {
      navigate('/dashboard');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      setError('상품 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProductName, description: newProductDesc })
      });
      if (response.ok) {
        setNewProductName('');
        setNewProductDesc('');
        fetchProducts();
      }
    } catch (err) {
      alert('상품 추가 실패');
    }
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

        <div className="admin-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Add Form */}
          <section className="form-card" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="#2563eb" /> 새 상품 추가
            </h3>
            <form onSubmit={handleAddProduct}>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>상품명</label>
                <input 
                  type="text" 
                  value={newProductName} 
                  onChange={(e) => setNewProductName(e.target.value)} 
                  placeholder="예: 프리미엄 NFC 명함"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>설명</label>
                <textarea 
                  value={newProductDesc} 
                  onChange={(e) => setNewProductDesc(e.target.value)} 
                  placeholder="상품에 대한 간단한 설명"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                상품 등록하기
              </button>
            </form>
          </section>

          {/* List */}
          <section className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>상품 정보</th>
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
                  products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <ShoppingBag size={18} />
                          </div>
                          <span style={{ fontWeight: 600 }}>{prod.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.875rem' }}>{prod.description || '-'}</td>
                      <td>
                        <button 
                          className="btn-table-danger" 
                          onClick={() => handleDeleteProduct(prod.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}

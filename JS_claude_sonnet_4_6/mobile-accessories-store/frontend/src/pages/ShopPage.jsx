import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✅' : '❌'}</span> {t.message}
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const activeCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    api.get('/products/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const showToast = (toast) => {
    const id = Date.now();
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && (key !== 'category' || value !== 'All')) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div>
      <Toast toasts={toasts} />
      <div className="container">
        <div className="page-header">
          <h1>Our <span className="text-gradient">Collection</span></h1>
          <p>Browse {products.length} premium mobile accessories</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setParam('search', e.target.value)}
              id="shop-search"
            />
          </div>
          <select
            className="form-input"
            style={{ width: 'auto', borderRadius: 'var(--radius-full)', paddingLeft: 16 }}
            value={sortBy}
            onChange={e => setParam('sort', e.target.value)}
            id="shop-sort"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setParam('category', cat)}
              id={`cat-${cat.toLowerCase().replace(/\s+/g,'-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="loading-overlay"><div className="loading-spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term</p>
            <button className="btn btn-ghost" onClick={() => setSearchParams({})}>Clear Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onToast={showToast} />
            ))}
          </div>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}

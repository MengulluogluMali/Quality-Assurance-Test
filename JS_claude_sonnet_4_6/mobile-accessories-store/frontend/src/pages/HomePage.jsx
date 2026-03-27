import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?sort=newest').then(res => {
      setFeatured(res.data.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const showToast = (toast) => {
    const id = Date.now();
    setToasts(t => [...t, { ...toast, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const categories = [
    { icon: '📱', name: 'Cases', desc: 'Protection & Style' },
    { icon: '⚡', name: 'Chargers', desc: 'Fast Charging' },
    { icon: '🔌', name: 'Cables', desc: 'Durable Cables' },
    { icon: '🛡️', name: 'Screen Protectors', desc: '9H Hardness' },
  ];

  return (
    <div>
      <Toast toasts={toasts} />

      {/* ── Hero ─────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>✨</span> Premium Accessories Store
            </div>
            <h1>
              Protect &amp;{' '}
              <span className="text-gradient">Upgrade</span>{' '}
              Your Phone
            </h1>
            <p className="hero-desc">
              Discover premium mobile accessories built for performance, style, and durability. Free shipping on orders over $50.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Shop Now →
              </Link>
              <Link to="/shop" className="btn btn-ghost btn-lg">
                View Deals
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Products</div>
              </div>
              <div>
                <div className="hero-stat-value">10K+</div>
                <div className="hero-stat-label">Customers</div>
              </div>
              <div>
                <div className="hero-stat-value">4.9★</div>
                <div className="hero-stat-label">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────── */}
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Browse By Category</p>
            <h2 className="section-title">What are you looking for?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate(`/shop?category=${cat.name}`)}
                style={{
                  padding: '32px 20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                }}
                className="card"
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{cat.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">New Arrivals</p>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-desc">Handpicked premium accessories for your device</p>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="loading-spinner" /></div>
          ) : (
            <div className="product-grid">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onToast={showToast} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" className="btn btn-ghost btn-lg">View All Products →</Link>
          </div>
        </div>
      </section>

      {/* ── Features Banner ───────────────── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Stripe' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: '⭐', title: 'Top Rated', desc: '4.9/5 from 10K+ reviews' },
            ].map(f => (
              <div key={f.title}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(() => { navigate('/shop'); });
  }, [id, navigate]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      setAdding(true);
      await addToCart(product.id, qty);
      showToast('success', `${qty}x ${product.name} added to cart!`);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>;
  if (!product) return null;

  return (
    <div className="container">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.message}
          </div>
        </div>
      )}

      <div style={{ paddingTop: 24 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
          ← Back
        </button>
      </div>

      <div className="product-detail-layout">
        {/* Image */}
        <div className="product-detail-image">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(e) => { e.target.src = `https://placehold.co/600x600/12122a/7c3aed?text=${encodeURIComponent(product.category)}`; }}
          />
        </div>

        {/* Details */}
        <div>
          <span className="badge badge-violet" style={{ marginBottom: 16, display: 'inline-block' }}>{product.category}</span>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: 8 }}>{product.name}</h1>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>

          <div className={`stock-badge ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
            {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32, fontSize: 16 }}>
            {product.description}
          </p>

          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Quantity:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              id="product-add-cart-btn"
              className="btn btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              style={{ flex: 1, minWidth: 200 }}
            >
              {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => { handleAddToCart().then(() => navigate('/cart')); }}
              disabled={adding || product.stock === 0}
            >
              Buy Now
            </button>
          </div>

          <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['🚚', 'Free Shipping', 'Orders over $50'], ['🔒', 'Secure Checkout', 'Stripe protected'], ['↩️', '30-day Returns', 'No questions asked']].map(([icon, title, desc]) => (
                <div key={title} style={{ flex: 1, minWidth: 100, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, total, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleUpdateQty = async (itemId, qty) => {
    try {
      await updateQuantity(itemId, qty);
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to update');
    }
  };

  const handleRemove = async (itemId, name) => {
    try {
      await removeItem(itemId);
      showToast('info', `Removed from cart`);
    } catch (err) {
      showToast('error', 'Failed to remove item');
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Sign in to view your cart</h3>
          <p>Create an account or log in to start shopping</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>;

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some awesome accessories to get started!</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  const shipping = total >= 50 ? 0 : 5.99;

  return (
    <div className="container">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
          </div>
        </div>
      )}

      <div className="page-header" style={{ textAlign: 'left', paddingBottom: 24 }}>
        <h1>Your <span className="text-gradient">Cart</span></h1>
        <p>{count} item{count !== 1 ? 's' : ''}</p>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img
                className="cart-item-image"
                src={item.image_url}
                alt={item.name}
                onError={(e) => { e.target.src = `https://placehold.co/90x90/12122a/7c3aed?text=IMG`; }}
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-category">{item.category}</div>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >+</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>${item.price.toFixed(2)} each</div>
                <button className="cart-remove-btn" onClick={() => handleRemove(item.id, item.name)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="summary-line">
              <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--emerald)' : undefined }}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          {total < 50 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Add ${(50 - total).toFixed(2)} more for free shipping!
            </p>
          )}
          <div className="summary-total">
            <span>Total</span>
            <span style={{ color: 'var(--emerald)' }}>${(total + shipping).toFixed(2)}</span>
          </div>
          <button
            id="checkout-btn"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 20 }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>
          <Link to="/shop" className="btn btn-ghost" style={{ width: '100%', marginTop: 10, textAlign: 'center' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <div style={{ height: 60 }} />
    </div>
  );
}

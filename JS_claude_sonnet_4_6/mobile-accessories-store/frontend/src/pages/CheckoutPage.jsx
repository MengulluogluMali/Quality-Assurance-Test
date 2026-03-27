import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import StripeCheckout from '../components/StripeCheckout';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
const stripePromise = stripePublicKey !== 'pk_test_placeholder'
  ? loadStripe(stripePublicKey)
  : null;

const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#7c3aed',
    colorBackground: '#1a1a30',
    colorText: '#f1f5f9',
    colorDanger: '#f43f5e',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px',
  },
};

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [orderTotal, setOrderTotal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (items.length === 0) { navigate('/cart'); return; }

    api.post('/orders/create-payment-intent')
      .then(res => {
        setClientSecret(res.data.clientSecret);
        setOrderTotal(res.data.total);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to initialize checkout');
        setLoading(false);
      });
  }, [user, items, navigate]);

  const shipping = parseFloat(orderTotal) >= 50 ? 0 : 5.99;

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>;

  if (error) return (
    <div className="container">
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <h3>Checkout Error</h3>
        <p>{error}</p>
        <Link to="/cart" className="btn btn-primary">Back to Cart</Link>
      </div>
    </div>
  );

  if (!stripePromise) return (
    <div className="container">
      <div className="empty-state">
        <div className="empty-icon">⚙️</div>
        <h3>Stripe Not Configured</h3>
        <p>Add your <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to the frontend <code>.env</code> file to enable payments.</p>
        <Link to="/cart" className="btn btn-ghost">Back to Cart</Link>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header" style={{ textAlign: 'left', paddingBottom: 24 }}>
        <h1>Secure <span className="text-gradient">Checkout</span></h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14 }}>
          🔒 Your payment is secured by Stripe
        </p>
      </div>

      <div className="checkout-layout">
        {/* Left: Payment Form */}
        <div>
          {/* Shipping */}
          <div className="checkout-section">
            <h2>📍 Shipping Address</h2>
            <textarea
              className="form-input"
              placeholder="Street address, city, state, ZIP, country..."
              rows={3}
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              id="shipping-address"
            />
          </div>

          {/* Payment */}
          <div className="checkout-section">
            <h2>💳 Payment Details</h2>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                <StripeCheckout
                  clientSecret={clientSecret}
                  total={(parseFloat(orderTotal) + shipping).toFixed(2)}
                  shippingAddress={shippingAddress}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.id} className="summary-line">
              <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-line"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="summary-line">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--emerald)' : undefined }}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span style={{ color: 'var(--emerald)' }}>${(parseFloat(orderTotal) + shipping).toFixed(2)}</span>
          </div>

          <div style={{ marginTop: 20, padding: '12px', background: 'rgba(124,58,237,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(124,58,237,0.2)', fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--violet-light)' }}>Test Card Numbers:</div>
            <div>✅ Success: <strong>4242 4242 4242 4242</strong></div>
            <div>❌ Decline: <strong>4000 0000 0000 0002</strong></div>
            <div style={{ marginTop: 4 }}>Any future date & any 3-digit CVC</div>
          </div>
        </div>
      </div>
      <div style={{ height: 60 }} />
    </div>
  );
}

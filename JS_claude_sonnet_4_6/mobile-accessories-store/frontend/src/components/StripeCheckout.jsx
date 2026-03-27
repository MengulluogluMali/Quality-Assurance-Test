import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function StripeCheckout({ clientSecret, total, shippingAddress }) {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError('');
    setPaying(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setPaying(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await api.post('/orders/confirm', {
          paymentIntentId: paymentIntent.id,
          shippingAddress,
        });
        await clearCart();
        navigate('/order-success', { state: { orderId: paymentIntent.id } });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay}>
      {error && <div className="message-error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="stripe-element-container" style={{ marginBottom: '24px' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Total to pay</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--emerald)' }}>${total}</span>
      </div>

      <button type="submit" id="pay-now-btn" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={paying || !stripe || !elements}>
        {paying ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            Processing...
          </span>
        ) : (
          <span>🔒 Pay ${total}</span>
        )}
      </button>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px' }}>
        Your payment is secured and encrypted by Stripe
      </p>
    </form>
  );
}

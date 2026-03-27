import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderId = state?.orderId?.slice(0, 8).toUpperCase() ?? '--------';

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>Order Confirmed!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 8 }}>
          Thank you for your purchase 🎉
        </p>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '12px 20px', margin: '20px 0', display: 'inline-block' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order ID</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--violet-light)' }}>
            #{orderId}
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32, lineHeight: 1.7 }}>
          Your order has been placed successfully. You'll receive a confirmation email
          and an SMS notification with tracking information.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" id="view-orders-btn" className="btn btn-primary">View My Orders</Link>
          <Link to="/shop" className="btn btn-ghost">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

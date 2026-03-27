import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my')
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="loading-overlay"><div className="loading-spinner" /></div>;

  return (
    <div className="container">
      <div className="page-header" style={{ textAlign: 'left' }}>
        <h1>My <span className="text-gradient">Orders</span></h1>
        <p>{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Browse Products</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* Order Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className={`badge badge-${order.status === 'paid' ? 'emerald' : 'amber'}`}>
                    {order.status === 'paid' ? '✅ Paid' : order.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--emerald)' }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* Order Items */}
              <div style={{ padding: '16px 20px' }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.product_name} <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                    <span style={{ fontWeight: 600 }}>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {order.shipping_address && (
                  <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                    📍 {order.shipping_address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

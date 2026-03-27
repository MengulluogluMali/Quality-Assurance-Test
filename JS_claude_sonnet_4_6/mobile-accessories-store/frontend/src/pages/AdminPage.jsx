import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ProductForm from '../components/ProductForm';

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✅' : '❌'} {t.message}
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/'); return; }
  }, [user, isAdmin, navigate]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(t => [...t, { type, message, id }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/products');
    setProducts(res.data);
    setLoading(false);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/orders');
    setOrders(res.data);
    setLoading(false);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await api.get('/orders/stats');
    setStats(res.data);
  }, []);

  useEffect(() => {
    fetchStats();
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
  }, [tab, fetchProducts, fetchOrders, fetchStats]);

  const handleAddProduct = async (formData) => {
    setFormLoading(true);
    await api.post('/products', formData);
    setFormLoading(false);
    setModalMode(null);
    fetchProducts();
    showToast('success', 'Product added successfully!');
  };

  const handleEditProduct = async (formData) => {
    setFormLoading(true);
    await api.put(`/products/${selectedProduct.id}`, formData);
    setFormLoading(false);
    setModalMode(null);
    setSelectedProduct(null);
    fetchProducts();
    showToast('success', 'Product updated!');
  };

  const handleDeleteProduct = async () => {
    setFormLoading(true);
    await api.delete(`/products/${selectedProduct.id}`);
    setFormLoading(false);
    setModalMode(null);
    setSelectedProduct(null);
    fetchProducts();
    showToast('success', 'Product deleted');
  };

  if (!isAdmin) return null;

  const statCards = stats ? [
    { icon: '📦', label: 'Total Orders', value: stats.totalOrders, color: 'var(--violet-light)' },
    { icon: '💰', label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'var(--emerald)' },
    { icon: '🛍️', label: 'Products', value: stats.totalProducts, color: 'var(--blue-light)' },
    { icon: '👤', label: 'Customers', value: stats.totalUsers, color: 'var(--amber)' },
  ] : [];

  return (
    <div>
      <Toast toasts={toasts} />

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <h2>Admin Menu</h2>
            {[
              { id: 'dashboard', icon: '📊', label: 'Dashboard' },
              { id: 'products', icon: '🛍️', label: 'Products' },
              { id: 'orders', icon: '📦', label: 'Orders' },
            ].map(item => (
              <button
                key={item.id}
                className={`sidebar-item${tab === item.id ? ' active' : ''}`}
                onClick={() => setTab(item.id)}
                id={`admin-tab-${item.id}`}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </aside>

          {/* Main */}
          <main>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)' }}>
                {tab === 'dashboard' ? '📊 Dashboard' : tab === 'products' ? '🛍️ Products' : '📦 Orders'}
              </h1>
            </div>

            {/* Stats always visible */}
            <div className="stat-cards">
              {statCards.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon">{s.icon}</div>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-value" style={{ color: s.color }}>{s.value ?? '…'}</div>
                </div>
              ))}
            </div>

            {/* Tab Content */}
            {tab === 'dashboard' && (
              <div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
                  <h2 style={{ marginBottom: 8 }}>Welcome, {user?.name}!</h2>
                  <p style={{ color: 'var(--text-muted)' }}>
                    Use the sidebar to manage your products and view incoming orders.<br />
                    Remember to configure your <strong>.env</strong> file with Stripe and notification settings.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => setTab('products')}>Manage Products</button>
                    <button className="btn btn-ghost" onClick={() => setTab('orders')}>View Orders</button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <p style={{ color: 'var(--text-muted)' }}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
                  <button id="add-product-btn" className="btn btn-primary" onClick={() => setModalMode('add')}>
                    + Add Product
                  </button>
                </div>

                {loading ? (
                  <div className="loading-overlay"><div className="loading-spinner" /></div>
                ) : (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id}>
                            <td>
                              <img
                                className="admin-table-image"
                                src={p.image_url}
                                alt={p.name}
                                onError={e => { e.target.src = 'https://placehold.co/50x50/12122a/7c3aed?text=IMG'; }}
                              />
                            </td>
                            <td style={{ maxWidth: 200 }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{p.name}</div>
                            </td>
                            <td><span className="badge badge-violet">{p.category}</span></td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${p.price.toFixed(2)}</td>
                            <td>
                              <span className={`badge ${p.stock > 0 ? 'badge-emerald' : 'badge-rose'}`}>{p.stock}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  id={`edit-product-${p.id}`}
                                  onClick={() => { setSelectedProduct(p); setModalMode('edit'); }}
                                >✏️</button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  id={`delete-product-${p.id}`}
                                  onClick={() => { setSelectedProduct(p); setModalMode('delete'); }}
                                >🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === 'orders' && (
              <div>
                {loading ? (
                  <div className="loading-overlay"><div className="loading-spinner" /></div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>Orders will appear here once customers make purchases</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14 }}>#{order.id.slice(0,8).toUpperCase()}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleString()}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customer</div>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer_name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer_email}</div>
                            </div>
                            <span className={`badge ${order.status === 'paid' ? 'badge-emerald' : 'badge-amber'}`}>
                              {order.status === 'paid' ? '✅ Paid' : order.status}
                            </span>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--emerald)' }}>
                              ${order.total.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '12px 20px' }}>
                          {order.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                              <span>{item.product_name} × {item.quantity}</span>
                              <span>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {modalMode === 'add' && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="modal-close" onClick={() => setModalMode(null)}>✕</button>
            </div>
            <ProductForm onSubmit={handleAddProduct} onCancel={() => setModalMode(null)} loading={formLoading} />
          </div>
        </div>
      )}

      {modalMode === 'edit' && selectedProduct && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="modal-close" onClick={() => { setModalMode(null); setSelectedProduct(null); }}>✕</button>
            </div>
            <ProductForm initial={selectedProduct} onSubmit={handleEditProduct} onCancel={() => { setModalMode(null); setSelectedProduct(null); }} loading={formLoading} />
          </div>
        </div>
      )}

      {modalMode === 'delete' && selectedProduct && (
        <div className="modal-overlay" onClick={() => setModalMode(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h2 style={{ marginBottom: 8 }}>Delete Product?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                Are you sure you want to delete <strong>"{selectedProduct.name}"</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => { setModalMode(null); setSelectedProduct(null); }}>Cancel</button>
                <button className="btn btn-danger" id="confirm-delete-btn" onClick={handleDeleteProduct} disabled={formLoading}>
                  {formLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setIsAuthOpen(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first");
      setIsAuthOpen(true);
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    try {
      const res = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total, email: user.email })
      });
      const data = await res.json();
      if (data.success) {
        window.open(data.emailPreviewUrl, '_blank');
        alert("Purchase successful! Notification sent.");
        setCart([]);
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand text-gradient">Luminus Accessories</div>
        <div className="nav-links">
          {user ? (
            <span className="nav-link">Hi, {user.email.split('@')[0]}</span>
          ) : (
            <span className="nav-link" onClick={() => setIsAuthOpen(true)}>Login</span>
          )}
          <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cart.length > 0 && <div className="cart-badge">{cart.length}</div>}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <h1 className="heading-1 animate-fade-in">Elevate Your Device</h1>
          <p className="heading-2" style={{ color: 'var(--text-secondary)', fontWeight: 400, marginTop: '20px' }}>
            Premium accessories for the modern aesthetic.
          </p>
        </div>
      </section>

      <main className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card glass-panel animate-fade-in">
            <img src={product.image} alt={product.name} className="product-image" />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
            </div>
            <div className="product-footer">
              <span className="product-price">${product.price.toFixed(2)}</span>
              <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </main>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="heading-2" style={{margin: 0}}>Your Cart</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <span className="cart-item-title">{item.name}</span>
                    <button onClick={() => removeFromCart(index)} style={{color: 'var(--error)'}}>✕</button>
                  </div>
                  <span className="cart-item-price">${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" style={{width: '100%', padding: '15px'}} onClick={handleCheckout}>
              Checkout Securely
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="auth-overlay" onClick={() => setIsAuthOpen(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <h2 className="heading-2">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <form className="auth-form" onSubmit={handleAuth}>
              <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="btn btn-primary">{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
            </form>
            <p style={{marginTop: '20px', cursor: 'pointer', color: 'var(--text-secondary)'}} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

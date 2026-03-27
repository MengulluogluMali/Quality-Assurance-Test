import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div className="navbar-logo-icon">📱</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px' }} className="text-gradient">PhoneVault</span>
            </div>
            <p>Premium mobile phone accessories for every lifestyle. Quality products, fast shipping, and unbeatable prices.</p>
          </div>
          <div className="footer-col">
            <h3>Shop</h3>
            <ul>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Cases">Cases</Link></li>
              <li><Link to="/shop?category=Chargers">Chargers</Link></li>
              <li><Link to="/shop?category=Cables">Cables</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Account</h3>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h3>Info</h3>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PhoneVault. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔒</span> Secured by Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}

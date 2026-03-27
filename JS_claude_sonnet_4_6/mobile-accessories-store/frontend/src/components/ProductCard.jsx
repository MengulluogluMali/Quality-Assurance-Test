import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, onToast }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    if (product.stock === 0) return;
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      onToast?.({ type: 'success', message: 'Added to cart!' });
    } catch (err) {
      onToast?.({ type: 'error', message: err.response?.data?.error || 'Failed to add to cart' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-image">
        <img
          src={product.image_url}
          alt={product.name}
          onError={(e) => { e.target.src = `https://placehold.co/600x450/12122a/7c3aed?text=${encodeURIComponent(product.category)}`; }}
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
        <div className="product-card-category">
          <span className="badge badge-violet">{product.category}</span>
        </div>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <div className="product-price">
            ${product.price.toFixed(2)}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            id={`add-cart-${product.id}`}
          >
            {adding ? '...' : product.stock === 0 ? 'Sold Out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

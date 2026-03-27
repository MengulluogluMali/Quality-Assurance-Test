import { useState } from 'react';

const CATEGORIES = ['Cases', 'Chargers', 'Cables', 'Screen Protectors', 'Accessories', 'Audio', 'Other'];

export default function ProductForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price || '',
    stock: initial?.stock || '',
    category: initial?.category || 'Cases',
    image_url: initial?.image_url || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.description || !form.price || !form.stock || !form.image_url) {
      setError('All fields are required');
      return;
    }
    if (parseFloat(form.price) <= 0) { setError('Price must be positive'); return; }
    if (parseInt(form.stock) < 0) { setError('Stock cannot be negative'); return; }
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <div className="message-error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Product Name *</label>
        <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. MagSafe Wireless Charger" />
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Product description..." rows="3" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Price ($) *</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} className="form-input" placeholder="29.99" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label className="form-label">Stock *</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} className="form-input" placeholder="50" min="0" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Category *</label>
        <select name="category" value={form.category} onChange={handleChange} className="form-input">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Image URL *</label>
        <input name="image_url" value={form.image_url} onChange={handleChange} className="form-input" placeholder="https://..." />
        {form.image_url && (
          <img
            src={form.image_url}
            alt="Preview"
            onError={(e) => e.target.style.display = 'none'}
            style={{ height: 100, objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}

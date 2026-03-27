const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// ── GET /api/cart ─────────────────────────────────────
router.get('/', (req, res) => {
  const db = getDb();
  const items = db.prepare(`
    SELECT
      ci.id,
      ci.quantity,
      p.id as product_id,
      p.name,
      p.price,
      p.image_url,
      p.stock,
      p.category,
      (ci.quantity * p.price) as subtotal
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).all(req.user.id);

  res.json(items);
});

// ── POST /api/cart ────────────────────────────────────
router.post('/', (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: 'product_id is required' });

  const db = getDb();

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, product_id);

  if (existing) {
    const newQty = existing.quantity + parseInt(quantity);
    if (newQty > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    if (parseInt(quantity) > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} units available` });
    }
    db.prepare(`
      INSERT INTO cart_items (id, user_id, product_id, quantity)
      VALUES (?, ?, ?, ?)
    `).run(uuidv4(), req.user.id, product_id, parseInt(quantity));
  }

  res.json({ message: 'Cart updated' });
});

// ── PATCH /api/cart/:id ───────────────────────────────
router.patch('/:id', (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const db = getDb();
  const item = db.prepare(
    'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!item) return res.status(404).json({ error: 'Cart item not found' });
  if (quantity > item.stock) {
    return res.status(400).json({ error: `Only ${item.stock} units available` });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(parseInt(quantity), req.params.id);
  res.json({ message: 'Quantity updated' });
});

// ── DELETE /api/cart/:id ──────────────────────────────
router.delete('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare(
    'SELECT id FROM cart_items WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id);

  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
  res.json({ message: 'Item removed' });
});

// ── DELETE /api/cart (clear all) ─────────────────────
router.delete('/', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;

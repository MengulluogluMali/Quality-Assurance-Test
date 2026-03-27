const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

// ── GET /api/products ────────────────────────────────
router.get('/', (req, res) => {
  const db = getDb();
  const { category, search, sort } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sort === 'price_asc') query += ' ORDER BY price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price DESC';
  else if (sort === 'newest') query += ' ORDER BY created_at DESC';
  else query += ' ORDER BY created_at DESC';

  const products = db.prepare(query).all(...params);
  res.json(products);
});

// ── GET /api/products/categories ─────────────────────
router.get('/categories', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  res.json(['All', ...rows.map(r => r.category)]);
});

// ── GET /api/products/:id ────────────────────────────
router.get('/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// ── POST /api/products (admin) ───────────────────────
router.post('/', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;

  if (!name || !description || price == null || stock == null || !category || !image_url) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const db = getDb();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO products (id, name, description, price, stock, category, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, description, parseFloat(price), parseInt(stock), category, image_url);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(product);
});

// ── PUT /api/products/:id (admin) ────────────────────
router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare(`
    UPDATE products SET name=?, description=?, price=?, stock=?, category=?, image_url=?
    WHERE id=?
  `).run(name, description, parseFloat(price), parseInt(stock), category, image_url, req.params.id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

// ── DELETE /api/products/:id (admin) ─────────────────
router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

module.exports = router;

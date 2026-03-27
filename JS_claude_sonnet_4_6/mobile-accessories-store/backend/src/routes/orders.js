const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { sendOrderNotification } = require('../services/notificationService');

const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// ── POST /api/orders/create-payment-intent ────────────
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const cartItems = db.prepare(`
      SELECT ci.quantity, p.price, p.stock, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({ error: `"${item.name}" has insufficient stock` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { user_id: req.user.id },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      total: total.toFixed(2),
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ── POST /api/orders/confirm ──────────────────────────
router.post('/confirm', authMiddleware, async (req, res) => {
  const { paymentIntentId, shippingAddress } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ error: 'paymentIntentId is required' });
  }

  try {
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    const db = getDb();
    const cartItems = db.prepare(`
      SELECT ci.quantity, ci.product_id, p.price, p.name, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderId = uuidv4();

    // Create order in transaction
    const createOrder = db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (id, user_id, total, status, stripe_payment_id, shipping_address)
        VALUES (?, ?, ?, 'paid', ?, ?)
      `).run(orderId, req.user.id, total, paymentIntentId, shippingAddress || null);

      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const item of cartItems) {
        insertItem.run(uuidv4(), orderId, item.product_id, item.name, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      // Clear cart
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    });

    createOrder();

    // Get user info for notification
    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.user.id);

    // Send notifications (non-blocking)
    sendOrderNotification({
      orderId,
      user,
      items: cartItems,
      total,
      shippingAddress,
    }).catch(err => console.error('Notification error:', err));

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    res.status(201).json({ order, orderId });

  } catch (err) {
    console.error('Order confirm error:', err);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// ── GET /api/orders/my ────────────────────────────────
router.get('/my', authMiddleware, (req, res) => {
  const db = getDb();
  const orders = db.prepare(`
    SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
  `).all(req.user.id);

  const ordersWithItems = orders.map(order => {
    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// ── GET /api/orders (admin) ───────────────────────────
router.get('/', authMiddleware, adminOnly, (req, res) => {
  const db = getDb();
  const orders = db.prepare(`
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();

  const ordersWithItems = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
});

// ── GET /api/orders/stats (admin) ─────────────────────
router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  const db = getDb();
  const stats = {
    totalOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'").get().count,
    totalRevenue: db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'paid'").get().total,
    totalProducts: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
    totalUsers: db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count,
  };
  res.json(stats);
});

module.exports = router;

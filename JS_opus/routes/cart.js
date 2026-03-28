const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const cartService = require('../services/cartService');

// Cart page
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const items = await cartService.getCartItems(req.session.user.id);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('cart/index', {
      title: 'Your Cart — MobileGear',
      items,
      total,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// API: Add to cart
router.post('/api/cart/add', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await cartService.addToCart(req.session.user.id, parseInt(productId), parseInt(quantity) || 1);
    const count = await cartService.getCartCount(req.session.user.id);
    res.json({ success: true, count });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// API: Update cart item
router.post('/api/cart/update', requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    await cartService.updateCartItem(req.session.user.id, parseInt(productId), parseInt(quantity));
    const items = await cartService.getCartItems(req.session.user.id);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = await cartService.getCartCount(req.session.user.id);
    res.json({ success: true, total, count, items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// API: Remove from cart
router.post('/api/cart/remove', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    await cartService.removeFromCart(req.session.user.id, parseInt(productId));
    const items = await cartService.getCartItems(req.session.user.id);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = await cartService.getCartCount(req.session.user.id);
    res.json({ success: true, total, count, items });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// API: Get cart count
router.get('/api/cart/count', async (req, res) => {
  if (!req.session.user) return res.json({ count: 0 });
  try {
    const count = await cartService.getCartCount(req.session.user.id);
    res.json({ count });
  } catch (err) {
    res.json({ count: 0 });
  }
});

module.exports = router;

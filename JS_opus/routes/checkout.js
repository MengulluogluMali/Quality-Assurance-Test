const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const cartService = require('../services/cartService');
const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');

// Checkout page
router.get('/', requireAuth, async (req, res) => {
  try {
    const items = await cartService.getCartItems(req.session.user.id);
    if (items.length === 0) return res.redirect('/cart');

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('checkout/index', {
      title: 'Checkout — MobileGear',
      items,
      total,
      errors: [],
      shipping: {},
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', layout: 'layouts/main' });
  }
});

// Process checkout
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, address, city, phone } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) errors.push('Name is required');
    if (!address || address.trim().length < 5) errors.push('Address is required');
    if (!city || city.trim().length < 2) errors.push('City is required');
    if (!phone || phone.trim().length < 7) errors.push('Valid phone number is required');

    if (errors.length > 0) {
      const items = await cartService.getCartItems(req.session.user.id);
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return res.status(400).render('checkout/index', {
        title: 'Checkout — MobileGear',
        items,
        total,
        errors,
        shipping: { name, address, city, phone },
        layout: 'layouts/main'
      });
    }

    const order = await orderService.createOrder(req.session.user.id, {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim()
    });

    // Send notifications to admin (non-blocking)
    notificationService.notifyAdmin(order, req.session.user.name).catch(err => {
      console.error('Notification error:', err);
    });

    res.render('checkout/success', {
      title: 'Order Confirmed! — MobileGear',
      order,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error(err);
    const items = await cartService.getCartItems(req.session.user.id);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.status(500).render('checkout/index', {
      title: 'Checkout — MobileGear',
      items,
      total,
      errors: [err.message],
      shipping: req.body,
      layout: 'layouts/main'
    });
  }
});

module.exports = router;

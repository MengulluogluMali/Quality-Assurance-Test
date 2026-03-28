const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Subscribe to push
router.post('/api/push/subscribe', requireAuth, requireAdmin, async (req, res) => {
  try {
    await notificationService.savePushSubscription(req.session.user.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Unsubscribe from push
router.post('/api/push/unsubscribe', requireAuth, requireAdmin, async (req, res) => {
  try {
    await notificationService.removePushSubscription(req.session.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

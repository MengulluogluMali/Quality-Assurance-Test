require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const { getDatabase } = require('./config/database');
const { attachUser } = require('./middleware/auth');
const { initializeEmail, initializePush } = require('./services/notificationService');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Security - with CSP relaxed for inline styles/scripts
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Attach user to all views
app.use(attachUser);

// VAPID public key endpoint (for push notifications)
app.get('/api/vapid-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || '' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/', shopRoutes);
app.use('/', cartRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/admin', adminRoutes);
app.use('/', notificationRoutes);

// Error page
app.get('/error', (req, res) => {
  res.render('error', {
    title: 'Error',
    message: req.query.message || 'Something went wrong',
    layout: 'layouts/main'
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    layout: 'layouts/main'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'An unexpected error occurred.',
    layout: 'layouts/main'
  });
});

// Start server
async function start() {
  try {
    await getDatabase();
    console.log('✅ Database initialized');

    await initializeEmail();
    initializePush();

    app.listen(PORT, () => {
      console.log(`\n🚀 MobileGear Store running at http://localhost:${PORT}`);
      console.log(`   Admin: admin@store.com / admin123`);
      console.log(`   Customer: customer@test.com / customer123\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

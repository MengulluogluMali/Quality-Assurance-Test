const express = require('express');
const router = express.Router();
const { validateRegistration } = require('../middleware/validation');
const userService = require('../services/userService');

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', {
    title: 'Create Account',
    errors: [],
    name: '',
    email: '',
    layout: 'layouts/main'
  });
});

// Register handler
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = await userService.createUser(name, email, password);
    const user = await userService.getUserById(userId);
    req.session.user = user;
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    res.status(400).render('auth/register', {
      title: 'Create Account',
      errors: [err.message],
      name: req.body.name,
      email: req.body.email,
      layout: 'layouts/main'
    });
  }
});

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', {
    title: 'Sign In',
    errors: [],
    email: '',
    layout: 'layouts/main'
  });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Sign In',
        errors: ['Invalid email or password'],
        email: req.body.email,
        layout: 'layouts/main'
      });
    }
    req.session.user = user;
    const returnTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    res.status(500).render('auth/login', {
      title: 'Sign In',
      errors: ['An error occurred. Please try again.'],
      email: req.body.email,
      layout: 'layouts/main'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
